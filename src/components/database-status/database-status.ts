// import { NgZone            } from '@angular/core'        ;
// import { oo                } from 'domain/onsitexdomain' ;
import { sprintf              } from 'sprintf-js'                 ;
import { Subscription         } from 'rxjs'                       ;
import { Component            } from '@angular/core'              ;
import { OnInit               } from '@angular/core'              ;
import { OnDestroy            } from '@angular/core'              ;
import { EventEmitter         } from '@angular/core'              ;
import { Input                } from '@angular/core'              ;
import { Output               } from '@angular/core'              ;
import { ViewChild            } from '@angular/core'              ;
import { ElementRef           } from '@angular/core'              ;
import { Log                  } from 'domain/onsitexdomain'       ;
import { Moment               } from 'domain/onsitexdomain'       ;
import { Duration             } from 'domain/onsitexdomain'       ;
import { moment               } from 'domain/onsitexdomain'       ;
import { sizeOf               } from 'domain/onsitexdomain'       ;
import { DatabaseStatus,      } from 'domain/onsitexdomain'       ;
import { DatabaseStatusState, } from 'domain/onsitexdomain'       ;
import { OSData               } from 'providers/data-service'     ;
import { Preferences, DatabaseKey, DatabaseKeys          } from 'providers/preferences'      ;
import { NotifyService        } from 'providers/notify-service'   ;
import { DispatchService      } from 'providers/dispatch-service' ;
import { AppEvents            } from 'providers/dispatch-service' ;
import { AlertService         } from 'providers/alert-service'    ;
import { DomainService        } from 'providers/domain-service'   ;
import { PouchDBService       } from 'providers/pouchdb-service'  ;
import { Database             } from 'providers/pouchdb-service'  ;
import { Dialog               } from 'primeng/dialog'             ;
import { ProgressBar          } from 'primeng/progressbar'        ;

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
  public titleString  :string = "Database Replication Status";
  public title        :string = this.titleString;
  public reinitDelay  :number = 500;
  public lastUpdated  :Moment = moment();
  public lastFormat   :string = "DD MMM HH:mm";
  public lastUpdatedString:string = this.lastUpdated.format(this.lastFormat);
  public scrollCheckDelay : number = 100;
  public DatabaseStatusState = DatabaseStatusState;

  public startTime    :Moment;
  public endTime      :Moment;
  public elapsedTime  :Duration;
  public elapsedTimeString:string = "";
  public progressArray:DatabaseStatus[] = [];
  public getKeys:(o:Object) => string[] = Object.keys;
  public sprintf:(...params) => string = sprintf;

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
    this.repTimeSub = this.dispatch.appEventFired().subscribe(async (data:{channel:AppEvents, event?:any}) => {
      Log.l(`DatabaseStatus: received AppEvent! Data is:`, data);
      if(data) {
        let channel:AppEvents = data.channel;
        Log.l(`DatabaseStatus: received AppEvent '${channel}'.`);
        if(channel === 'dbupdated') {
          let update = data.event;
          let dbprog:any = this.dbProgress;
          let dbname:string = update.db;
          let count:number = update.change.docs && update.change.docs.length ? update.change.docs.length : 0;
          let keys = Object.keys(dbprog);
          let value:DatabaseStatus;
          for(let key of keys) {
            let item:DatabaseStatus = dbprog[key];
            if(item.dbname === dbname) {
              value = item;
              break;
            }
          }
          if(value) {
            value.localDocs += count;

          }
        } else if(channel === 'replicationcomplete') {
          let update = data.event;
          let dbprog:any = this.dbProgress;
          let dbname:string = update.db;
          let keys = Object.keys(dbprog);
          let value:DatabaseStatus;
          let mykey:string;
          for(let key of keys) {
            let item:DatabaseStatus = dbprog[key];
            if(item.dbname === dbname) {
              value = item;
              mykey = key;
              break;
            }
          }
          if(value) {
            await this.updateSingleDatabase(mykey, value);
          }
        }
      }
    });
  }

  public cancelSubscriptions() {
    if(this.repTimeSub && !this.repTimeSub.closed) {
      this.repTimeSub.unsubscribe();
    }
  }

  public async isBodyScrolling():Promise<boolean> {
    try {
      let status:boolean = false;
      if(this.databaseStatusBody) {
        let el1:HTMLElement = this.databaseStatusBody.nativeElement;
        let scrollHeight:number = typeof el1.scrollHeight === 'number' ? el1.scrollHeight : 0;
        let clientHeight:number = typeof el1.clientHeight === 'number' ? el1.clientHeight : 0;
        if(scrollHeight - clientHeight > 0) {
          status = true;
        }
      }
      let delay:number = typeof this.scrollCheckDelay === 'number' ? this.scrollCheckDelay : 100;
      let out:any = await this.data.delay(delay);
      return status;
    } catch(err) {
      throw err;
    }
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
      let title:string = "RESTART DATABASES";
      let text:string = "This will erase the existing databases on your computer and re-download them from the server. This is like running the app for the firs ttime, and should not be done unless there is a good reason, like a sync problem that lasts for a long time. Continue?";
      let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
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

  public async getMomentString(date:Moment|Date, format?:string):Promise<string> {
    let res:string = "UNKNOWN_TIME";
    try {
      let format24:boolean = typeof this.prefs.is24Hour === 'function' ? this.prefs.is24Hour() : false;
      let timeFmt:string = this.prefs.getTimeFormat('short') || "hh:mm A";
      let fmt:string = typeof format === 'string' ? format : "ddd MMM DD" + timeFmt;
      let mo:Moment = moment(date);
      res = mo.format(fmt);
      let delay:number = typeof this.scrollCheckDelay === 'number' ? this.scrollCheckDelay : 100;
      let out:any = await this.data.delay(delay);
      return res;
    } catch(err) {
      Log.l(`getMomentString(): Error getting string from:`, date, format);
      Log.e(err);
      // throw err;
      return res;
    }
  }

  public async createList(dbNameList?:string[]) {
    let dbkeys = this.prefs.getSyncableDBKeys() || [];
    // let dbnames = Array.isArray(dbNameList) ? dbNameList : this.prefs.getSyncableDBList();
    let dbnames:string[] = dbkeys.map(key => {
      return this.prefs.getDB(key);
    });
    let now:Moment;
    this.title = this.titleString + " (updating …)";
    dbnames = dbnames.filter(a => typeof a === 'string');
    let progressArray:DatabaseStatus[] = [];
    let progressDoc:any = {};
    // this.dbProgress = {};
    for(let key of dbkeys) {
      let dbname:string = this.prefs.getDB(key);
      let db1 :Database = this.pouchdb.getDB(dbname);
      if(!db1) {
        continue;
      }
      let dbstatus:DatabaseStatus = new DatabaseStatus({
        dbname     : dbname      ,
        dbkey      : key         ,
        localDocs  : 0           ,
        remoteDocs : 0           ,
        error      : false       ,
        waiting    : true        ,
        state      : DatabaseStatusState.WAITING ,
      });
      progressDoc[key] = dbstatus;
    }
    this.dbProgress = progressDoc;
    let keys = (Object.keys(progressDoc) as DatabaseKeys);
    for(let key of keys) {
      let dbname:string = this.prefs.getDB(key);
      let dberror:boolean = false;
      Log.gc(`DatabaseStatus.createList(): Getting status for '${key}' ('${dbname}') …`);
      let dbstatus:DatabaseStatus = progressDoc[key];
      if(!dbstatus) {
        continue;
      }
      let db1 :Database = this.pouchdb.getDB(dbname);
      let rdb1:Database = this.pouchdb.getRDB(dbname);
      if(db1 && rdb1) {
        let dbInfo, rdbInfo;
        try {
          dbInfo  = await db1.info();
          rdbInfo = await rdb1.info();
        } catch (error) {
          Log.l(`DatabaseStatus.createList(): Error getting status for '${key}':`);
          Log.e(error);
          rdbInfo = {doc_count: 0};
          if(!(dbInfo && typeof dbInfo.doc_count === 'number')) {
            dbInfo = {doc_count: 0};
          }
          dberror = true;
        }
        let localCount :number = dbInfo.doc_count ? dbInfo.doc_count : 0;
        let remoteCount:number = rdbInfo.doc_count ? rdbInfo.doc_count : 0;
        // let dbprog:DatabaseStatus = new DatabaseStatus({
        //   dbnam
        //   done    : 0,
        //   total   : 0,
        //   percent : 0,
        // });

        dbstatus.localDocs  = localCount;
        dbstatus.remoteDocs = remoteCount;
        dbstatus.waiting = false;
        dbstatus.state = DatabaseStatusState.DONE;
        if(localCount !== remoteCount) {
          dbstatus.state = DatabaseStatusState.UNSYNCED;
        }
        if(dberror) {
          dbstatus.state = DatabaseStatusState.ERROR;
        }
        Log.l(`DatabaseStatus.createList(): Final status for '${key}' ('${dbname}') is:`, dbstatus);
        
        // progressDoc[key] = dbstatus;
        progressArray.push(dbstatus);
        // this.dbProgress = progressDoc;
        Log.ge();
      } else {
        Log.ge();
        continue;
      }
    }
    this.progressArray = progressArray;
    this.dbProgress = progressDoc;
    now = moment();
    this.lastUpdated = moment(now);
    this.lastUpdatedString = now.format(this.lastFormat);
    this.title = this.titleString + " (last updated " + this.lastUpdatedString + ")";
    return progressDoc;
  }

  public async refreshDatabaseInfo(keys?:DatabaseKeys, evt?:Event):Promise<any> {
    try {
      this.title = this.titleString + " (updating …)";
      let pkeys = (Object.keys(this.dbProgress) as DatabaseKeys);
      let dbkeys = Array.isArray(keys) ? keys : pkeys.length ? pkeys : [];
      // let dbkeys:string[] = Array.isArray(keys) ? keys : this.prefs.getSyncableDBKeys() || [];
      // let dbnames = Array.isArray(dbNameList) ? dbNameList : this.prefs.getSyncableDBList();
      let dbnames:string[] = dbkeys.map(key => {
        return this.prefs.getDB(key);
      });
      dbnames = dbnames.filter(a => typeof a === 'string');
      let progressArray:DatabaseStatus[] = [];
      let progressDoc:any = this.dbProgress;
      // this.dbProgress = {};
      for(let key of dbkeys) {
        let dberror:boolean = false;
        let dbname:string = this.prefs.getDB(key);
        let status:DatabaseStatus = progressDoc[key];
        if(!status) {
          continue;
        }
        let success:boolean = await this.updateSingleDatabase(key, status);
        // let db1 :Database = this.pouchdb.getDB(dbname);
        // let rdb1:Database = this.pouchdb.getRDB(dbname);
        // if(!(db1 && rdb1)) {
        //   continue;
        // }
        // status.error = false;
        // status.waiting = true;
        // status.state = DatabaseStatusState.WAITING;
        // // status.localDocs = 0;
        // // status.remoteDocs = 0;
        // Log.gc(`DatabaseStatus.refreshDatabaseInfo(): Getting status for '${key}' ('${dbname}') …`);
        // if(db1 && rdb1) {
        //   let dbInfo, rdbInfo;
        //   try {
        //     dbInfo  = await db1.info();
        //     rdbInfo = await rdb1.info();
        //   } catch (error) {
        //     Log.l(`DatabaseStatus.refreshDatabaseInfo(): Error getting status for '${key}':`);
        //     Log.e(error);
        //     rdbInfo = {doc_count: 0};
        //     if(!(dbInfo && typeof dbInfo.doc_count === 'number')) {
        //       dbInfo = {doc_count: 0};
        //     }
        //     dberror = true;
        //   }
        //   let localCount :number = dbInfo.doc_count  ? dbInfo.doc_count  : 0;
        //   let remoteCount:number = rdbInfo.doc_count ? rdbInfo.doc_count : 0;
        //   // let dbprog:DatabaseStatus = new DatabaseStatus({
        //   //   dbnam
        //   //   done    : 0,
        //   //   total   : 0,
        //   //   percent : 0,
        //   // });
        //   let dbstatus:DatabaseStatus = new DatabaseStatus({
        //     dbname     : dbname      ,
        //     dbkey      : key         ,
        //     localDocs  : localCount  ,
        //     remoteDocs : remoteCount ,
        //     error      : dberror     ,
        //     waiting    : false       ,
        //     state      : DatabaseStatusState.DONE ,
        //   });
        //   if(localCount !== remoteCount) {
        //     dbstatus.state = DatabaseStatusState.UNSYNCED;
        //   }
        //   if(dberror) {
        //     dbstatus.state = DatabaseStatusState.ERROR;
        //   }
          
        //   progressDoc[key] = dbstatus;
        //   progressArray.push(dbstatus);
          // this.dbProgress = progressDoc;
          // Log.l(`DatabaseStatus.refreshDatabaseInfo(): Final status for '${key}' ('${dbname}') is:`, status);
          // Log.ge();
        // } else {
        //   Log.ge();
        //   continue;
        // }
      }
      // this.progressArray = progressArray;
      // this.dbProgress = progressDoc;
      let now:Moment = moment();
      this.lastUpdated = moment(now);
      this.lastUpdatedString = now.format(this.lastFormat);
      this.title = this.titleString + " (last updated " + this.lastUpdatedString + ")";
      return progressDoc;
    } catch(err) {
      Log.l(`DatabaseStatus.refreshDatabaseInfo(): Error of some kind`);
      Log.e(err);
      let now:Moment = moment();
      this.lastUpdated = moment(now);
      this.lastUpdatedString = now.format(this.lastFormat);
      this.title = this.titleString + " (error refreshing, please retry)";
      throw err;
    }
  }

  public async updateSingleDatabase(key:string, status:DatabaseStatus):Promise<boolean> {
    try {
      let dbname:string = status.dbname;
      let dberror:boolean = false;
      let db1:Database  = this.pouchdb.getDB(dbname);
      let rdb1:Database = this.pouchdb.getRDB(dbname);
      if(!(db1 && rdb1)) {
        return;
      }
      status.state = DatabaseStatusState.WAITING;
      // status.localDocs = 0;
      // status.remoteDocs = 0;
      Log.gc(`DatabaseStatus.updateSingleDatabase(): Getting status for '${key}' ('${dbname}') …`);
      if(db1 && rdb1) {
        let dbInfo, rdbInfo;
        try {
          dbInfo  = await db1.info();
          rdbInfo = await rdb1.info();
        } catch (error) {
          Log.l(`DatabaseStatus.updateSingleDatabase(): Error getting status for '${key}':`);
          Log.e(error);
          rdbInfo = {doc_count: 0};
          if(!(dbInfo && typeof dbInfo.doc_count === 'number')) {
            dbInfo = {doc_count: 0};
          }
          dberror = true;
        }
        let localCount :number = dbInfo.doc_count  ? dbInfo.doc_count  : 0;
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
          error      : dberror     ,
          waiting    : false       ,
          state      : DatabaseStatusState.DONE ,
        });
        if(localCount !== remoteCount) {
          dbstatus.state = DatabaseStatusState.UNSYNCED;
        }
        if(dberror) {
          dbstatus.state = DatabaseStatusState.ERROR;
        }
        
        Log.l(`DatabaseStatus.updateSingleDatabase(): Final status for '${key}' ('${dbname}') is:`, dbstatus);
        Log.ge();
        this.dbProgress[key] = dbstatus;
        this.updateTitleTime();
        return true;
      } else {
        Log.ge();
        return false;
      }
    } catch(err) {
      Log.l(`DatabaseStatus.updateSingleDatabase(): Error updating '${key}' database status:`, status);
      Log.e(err);
      throw err;
    }
  }

  public updateTitleTime():string {
    let now:Moment = moment();
    this.lastUpdated = moment(now);
    this.lastUpdatedString = now.format(this.lastFormat);
    this.title = this.titleString + " (last updated " + this.lastUpdatedString + ")";
    return this.title;
  }


}
