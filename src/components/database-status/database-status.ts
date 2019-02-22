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
import { ProgressBar     } from 'primeng/progressbar'        ;

@Component({
  selector: 'database-status',
  templateUrl: 'database-status.html'
})
export class DatabaseStatusComponent implements OnInit,OnDestroy {
  // @Input('databaseArray') databaseArray:Array<string> = [];
  @Input('dbProgress') dbProgress:any;
  @Input('headerVisible') headerVisible:boolean = true;
  // @Input('header') header:string = "Database Replication Progress";
  @Input('header') header:string = "";
  @Input('percentage') percentage:number = 0;
  @Input('status') status:string = "";
  @Output('onClose') onClose = new EventEmitter<any>();
  @Output('onAbort') onAbort = new EventEmitter<any>();
  @Output('onPause') onPause = new EventEmitter<boolean>();
  @ViewChild('databaseStatusBody') databaseStatusBody:ElementRef;

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
    Log.l("DatabaseStatusComponent: ngOnInit() called...");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("DatabaseStatusComponent: ngOnDestroy() called...");
    this.cancelSubscriptions();
    window['p'] = this.parent;
  }

  public async runWhenReady() {
    Log.l(`DatabaseStatusComponent: runWhenReady() called`);
    try {
      this.initializeSubscriptions();
      // this.startTime = moment();
      if(sizeOf(this.dbProgress) === 0) {
        this.createList();
      }
    } catch(err) {
      Log.l(`DatabaseStatusComponent.runWhenReady(): Error during initialization!`);
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

  public async createList(dbNameList?:string[]) {
    let dbkeys:string[] = this.prefs.getSyncableDBKeys() || [];
    // let dbnames = Array.isArray(dbNameList) ? dbNameList : this.prefs.getSyncableDBList();
    let dbnames:string[] = dbkeys.map((key:string) => {
      return this.prefs.getDB(key);
    });
    dbnames = dbnames.filter(a => typeof a === 'string');
    let progressArray:DatabaseStatus[] = [];
    let progressDoc:any = {};
    // this.dbProgress = {};
    for(let key of dbkeys) {
      let dbname:string = this.prefs.getDB(key);
      Log.l(`DatabaseStatus.createList(): Getting status for '${key}' ('${dbname}') …`);
      let db1 :Database = this.pouchdb.getDB(dbname);
      let rdb1:Database = this.pouchdb.getRDB(dbname);
      if(db1 && rdb1) {
        let dbInfo, rdbInfo;
        try {
          dbInfo  = await db1.info();
          rdbInfo = await rdb1.info();
        } catch (error) {
          Log.l(`Error getting status:`);
          Log.l(error);
          rdbInfo = {doc_count: 0};
          if(!(dbInfo && typeof dbInfo.doc_count === 'number')) {
            dbInfo = {doc_count: 0};
          }
        }
        let localCount :number = dbInfo.doc_count ? dbInfo.doc_count : 0;
        let remoteCount:number = rdbInfo.doc_count ? rdbInfo.doc_count : 0;
        // let dbprog:DatabaseStatus = new DatabaseStatus({
        //   dbnam
        //   done    : 0,
        //   total   : 0,
        //   percent : 0,
        // });
        let dbstatus:DatabaseStatus = new DatabaseStatus({
          dbname     : dbname      ,
          dbkey      : key         ,
          localDocs  : localCount  ,
          remoteDocs : remoteCount ,
        });
        progressDoc[key] = dbstatus;
        progressArray.push(dbstatus);
        this.dbProgress = progressDoc;
      } else {
        continue;
      }
    }
    this.progressArray = progressArray;
    this.dbProgress = progressDoc;
    return progressDoc;
  }

  public isBodyScrolling():boolean {
    let status:boolean = false;
    if(this.databaseStatusBody) {
      let el1:HTMLElement = this.databaseStatusBody.nativeElement;
      let scrollHeight:number = typeof el1.scrollHeight === 'number' ? el1.scrollHeight : 0;
      let clientHeight:number = typeof el1.clientHeight === 'number' ? el1.clientHeight : 0;
      if(scrollHeight - clientHeight > 0) {
        status = true;
      }
    }
    return status;
  }

  public async abort(evt?:Event) {
    try {
      Log.l("DatabaseStatus: abort() called");
      let confirm:boolean = await this.alert.showConfirm(`ABORT SYNC`, `Do you want to abort the initial synchronization? The app may be inaccurate or extremely slow to respond until the sync is complete.`);
      if(confirm) {
        this.onAbort.emit(this.prefs);
      }
    } catch(err) {
      Log.l(`abort(): Error aborting initial database sync!`);
      Log.e(err);
      throw err;
    }
  }

  public async pause(evt?:Event) {
    try {
      Log.l(`DatabaseStatus: pause() called`);
      let confirm:boolean = await this.alert.showConfirm(`PAUSE SYNC`, `Do you want to pause the sync? The app may be inaccurate if the sync is not completed.`);
      if(confirm) {
        this.onPause.emit(true);
      }
    } catch(err) {
      Log.l(`pause(): Error pausing initial database sync!`);
      Log.e(err);
      throw err;
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
