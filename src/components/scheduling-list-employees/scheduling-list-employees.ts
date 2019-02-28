// import { NgZone       } from '@angular/core'        ;
// import { oo           } from 'domain/onsitexdomain' ;
import { sprintf         } from 'sprintf-js'                 ;
import { Subscription    } from 'rxjs'                       ;
import { Component       } from '@angular/core'              ;
import { OnInit          } from '@angular/core'              ;
import { OnDestroy       } from '@angular/core'              ;
import { EventEmitter    } from '@angular/core'              ;
import { Input           } from '@angular/core'              ;
import { Output          } from '@angular/core'              ;
import { ViewChild       } from '@angular/core'              ;
import { ElementRef      } from '@angular/core'              ;
import { Log             } from 'domain/onsitexdomain'       ;
import { Moment          } from 'domain/onsitexdomain'       ;
import { Duration        } from 'domain/onsitexdomain'       ;
import { moment          } from 'domain/onsitexdomain'       ;
import { sizeOf          } from 'domain/onsitexdomain'       ;
import { DatabaseStatus, } from 'domain/onsitexdomain'       ;
import { OSData          } from 'providers/data-service'     ;
import { Preferences     } from 'providers/preferences'      ;
import { NotifyService   } from 'providers/notify-service'   ;
import { DispatchService } from 'providers/dispatch-service' ;
import { AppEvents       } from 'providers/dispatch-service' ;
import { AlertService    } from 'providers/alert-service'    ;
import { DomainService   } from 'providers/domain-service'   ;
import { PouchDBService  } from 'providers/pouchdb-service'  ;
import { Database        } from 'providers/pouchdb-service'  ;
import { Dialog          } from 'primeng/dialog'             ;
import { Jobsite         } from 'domain/onsitexdomain'       ;
import { Employee        } from 'domain/onsitexdomain'       ;

type InSchedule = {
  site?: Jobsite,
  tech?: Employee,
  scheduled: boolean,
};
type EmployeeSorts = "none" | "checked-asc" | "checked-desc" | "active-asc" | "active-desc" | "name-asc" | "name-desc";

type TechItem = {
  title : string ,
  note  : string ,
  icon  : string ,
};

@Component({
  selector: 'scheduling-list-employees',
  templateUrl: 'scheduling-list-employees.html'
})
export class SchedulingListEmployeesComponent implements OnInit,OnDestroy {
  @Output('onClose') onClose = new EventEmitter<any>();
  public sitesListHeader      : string      = "Work Site List"                  ;
  public showSitesList        : boolean     = false                             ;
  public siteList             : InSchedule[]= []                                ;
  public siteSorts            : number[]    = [ -1, -1, -1 ]                    ;
  public showAllSites         : boolean     = true                              ;
  public sitesListClosable    : boolean     = true                              ;
  public sitesListESCable     : boolean     = true                              ;
  public employeeListHeader   : string      = "Employee List"                   ;
  public showEmployeeList     : boolean     = false                             ;
  public employeeList         : InSchedule[]= []                                ;
  public fullEmployeeList     : InSchedule[]= []                                ;
  public fullSitesList        : InSchedule[]= []                                ;
  public sorts                : number[]    = [ -1, -1, -1 ]                    ;
  public showAllEmployees     : boolean     = true                              ;
  public showUnassignedOnly   : boolean     = true                              ;
  public employeeListClosable : boolean     = true                              ;
  public employeeListESCable  : boolean     = true                              ;
  public sitesModal           : boolean     = false                             ;
  public employeesModal       : boolean     = false                             ;
  public dialogTarget         : string      = null                              ;
  // public dialogTarget         : string      = "body"                            ;
  public employeeSearch       : string      = ""                                ;
  public sitesSearch          : string      = ""                                ;
  public switchDelay          : number      = 500                               ;
  public repTimeSub   :Subscription;
  public reinitDelay  :number = 500;
  public startTime    :Moment;
  public endTime      :Moment;
  public elapsedTime  :Duration;
  public elapsedTimeString:string = "";
  public progressArray:DatabaseStatus[] = [];
  public getKeys:any;
  public sprintf:any = sprintf;

  public isVisible   : boolean = true              ;
  public isDraggable : boolean = true              ;
  public isResizable : boolean = true              ;
  // public isClosable  : boolean = true              ;
  public isClosable  : boolean = false             ;
  public isModal     : boolean = false             ;
  public parent      : any                         ;

  constructor(
    public prefs    : Preferences     ,
    public data     : OSData          ,
    public domain   : DomainService   ,
    public alert    : AlertService    ,
    public notify   : NotifyService   ,
    public dispatch : DispatchService ,
    public pouchdb  : PouchDBService  ,
  ) {
    window['onsiteDatabaseStatus'] = this;
    window['onsitedbstatus' ] = this;
    window['onsitedbstatus2'] = this;
    this.parent = window['p'];
    window['p'] = this;
    this.getKeys = Object.keys;
  }

  ngOnInit() {
    Log.l("SchedulingListEmployeesComponent: ngOnInit() called...");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("SchedulingListEmployeesComponent: ngOnDestroy() called...");
    this.cancelSubscriptions();
    window['p'] = this.parent;
  }

  public async runWhenReady() {
    Log.l(`SchedulingListEmployeesComponent: runWhenReady() called`);
    try {
      this.initializeSubscriptions();
      // this.startTime = moment();
    } catch(err) {
      Log.l(`SchedulingListEmployeesComponent.runWhenReady(): Error during initialization!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error showing options: ${err.message}`, 5000);
      throw err;
    }
  }

  public initializeSubscriptions() {
    this.repTimeSub = this.dispatch.appEventFired().subscribe((data:{channel:AppEvents, event?:any}) => {
      Log.l(`DatabaseStatus: received AppEvent! Data is:\n`, data);
      if(data) {
        let channel:AppEvents = data.channel;
        Log.l(`DatabaseStatus: received AppEvent '${channel}'.`);
        if(channel === 'elapsedtime') {
          this.updateElapsedTime();
        } else if(channel === 'starttime') {
          this.startTime = moment();
          this.updateElapsedTime();
        } else if(channel === 'endtime') {
          this.endTime = moment();
          this.updateElapsedTime();
        }
      }
    });
  }

  public cancelSubscriptions() {
    if(this.repTimeSub && !this.repTimeSub.closed) {
      this.repTimeSub.unsubscribe();
    }
  }

  public close(evt?:Event) {
    Log.l("DatabaseStatus: close() called");
    this.onClose.emit(true);
  }

  public cancel(evt?:Event) {
    Log.l("DatabaseStatus: cancel() called");
    this.onClose.emit(true);
  }

  public updateElapsedTime():string {
    let start:Moment = moment(this.startTime);
    let time:Moment = moment();
    Log.l(`updateElapsedTime(): Called at '${time.format("HH:mm:ss")}', now updating elapsed time...`);
    let elapsed:Duration = moment.duration(time.diff(start));
    let timeString = sprintf("%02d:%02d:%02d", elapsed.get('hours'), elapsed.get('minutes'), elapsed.get('seconds'));
    this.elapsedTimeString = timeString;
    return timeString;
  }

  public async reinitializeDatabases(evt?:Event):Promise<any> {
    try {
      let confirm:boolean = await this.alert.showConfirmYesNo("RESTART DATABASES", "This will erase the existing databases on your computer and re-download them from the server. Continue?");
      if(confirm) {
        setTimeout(() => {
          this.dispatch.triggerAppEvent('reinitializedb');
        }, this.reinitDelay);
        this.cancel(evt);
      }
    } catch(err) {
      Log.l(`DatabaseStatus.reinitializeDatabases(): Error of some kind`);
      Log.e(err);
      throw err;
    }
  }
}
