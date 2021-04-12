import { sprintf                                     } from 'sprintf-js'                 ;
import { Subscription                                } from 'rxjs'                       ;
import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core'              ;
import { Input, Output, ViewChild, NgZone            } from '@angular/core'              ;
import { Log, moment, Moment, oo, sizeOf, Duration,  } from 'domain/onsitexdomain'       ;
import { DatabaseProgress,                           } from 'domain/onsitexdomain'       ;
import { OSData                                      } from 'providers/data-service'     ;
import { Preferences                                 } from 'providers/preferences'      ;
import { NotifyService                               } from 'providers/notify-service'   ;
import { DispatchService, AppEvents,                 } from 'providers/dispatch-service' ;
import { AlertService                                } from 'providers/alert-service'    ;
import { Dialog                                      } from 'primeng/dialog'             ;
import { ProgressBar                                 } from 'primeng/progressbar'        ;

@Component({
  selector: 'database-progress',
  templateUrl: 'database-progress.html'
})
export class DatabaseProgressComponent implements OnInit,OnDestroy {
  // @Input('databaseArray') databaseArray:Array<string> = [];
  @Input('dbProgress') dbProgress:any;
  @Input('headerVisible') headerVisible:boolean = true;
  @Input('header') header:string = "Database Replication Progress";
  @Input('percentage') percentage:number = 0;
  @Input('status') status:string = "";
  @Output('onClose') onClose = new EventEmitter<any>();
  @Output('onAbort') onAbort = new EventEmitter<any>();
  @Output('onPause') onPause = new EventEmitter<boolean>();

  public repTimeSub   :Subscription;
  public startTime    :Moment;
  public endTime      :Moment;
  public elapsedTime  :Duration;
  public elapsedTimeString:string = "";
  public progressArray:DatabaseProgress[] = [];
  public getKeys:any;
  public sprintf:any = sprintf;

  public isVisible      : boolean = true              ;
  public isDraggable    : boolean = true              ;
  public isResizable    : boolean = true              ;
  public isClosable     : boolean = false             ;
  public isModal        : boolean = false             ;
  public progressPaused : boolean = false             ;

  constructor(
    public zone     : NgZone          ,
    public data     : OSData          ,
    public alert    : AlertService    ,
    public notify   : NotifyService   ,
    public dispatch : DispatchService ,
    public prefs    : Preferences     ,
  ) {
    window['onsitedatabaseprogress'] = this;
    this.getKeys = Object.keys;
  }

  ngOnInit() {
    Log.l("DatabaseProgressComponent: ngOnInit() called...");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("DatabaseProgressComponent: ngOnDestroy() called...");
    this.cancelSubscriptions();
  }

  public async runWhenReady() {
    Log.l(`DatabaseProgressComponent: runWhenReady() called`);
    try {
      this.initializeSubscriptions();
      // this.startTime = moment();
      if(sizeOf(this.dbProgress) === 0) {
        this.createList();
      }
    } catch(err) {
      Log.l(`DatabaseProgressComponent.runWhenReady(): Error during initialization!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error showing options: ${err.message}`, 5000);
      throw err;
    }
  }

  public initializeSubscriptions() {
    this.repTimeSub = this.dispatch.appEventFired().subscribe((data:{channel:AppEvents, event?:any}) => {
      Log.l(`DatabaseProgress: received AppEvent! Data is:\n`, data);
      if(data) {
        let channel:AppEvents = data.channel;
        Log.l(`DatabaseProgress: received AppEvent '${channel}'.`);
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

  public createList(dbNameList?:Array<string>) {
    let dbnames = Array.isArray(dbNameList) ? dbNameList : this.prefs.getSyncableDBList();
    let progressArray:Array<DatabaseProgress> = [];
    let progressDoc:any = {};
    for(let dbname of dbnames) {
      let dbprog:DatabaseProgress = new DatabaseProgress({
        done    : 0,
        total   : 0,
        percent : 0,
      });
      let dbprogitem:DatabaseProgress = new DatabaseProgress({
        dbname  : dbname,
        done    : 0,
        total   : 0,
        percent : 0,
      });
      progressDoc[dbname] = dbprog;
      progressArray.push(dbprogitem);
    }
    this.progressArray = progressArray;
    this.dbProgress = progressDoc;
    return progressDoc;
  }

  public async abort(evt?:Event) {
    try {
      Log.l("DatabaseProgress: abort() called");
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
      Log.l(`DatabaseProgress: pause() called`);
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
    Log.l("DatabaseProgress: close() called");
    this.onClose.emit(this.prefs);
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
}
