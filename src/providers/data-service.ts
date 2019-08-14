import { sprintf                                                            } from 'sprintf-js'           ;
import { Subscription                                                       } from 'rxjs'                 ;
import { Injectable                                                         } from '@angular/core'        ;
import { Loading                                                            } from 'ionic-angular'        ;
import { Log, moment, Moment, isMoment, dec, Decimal, _matchCLL, _matchSite, SiteScheduleType } from 'domain/onsitexdomain' ;
import { PouchDBService, PDBChangeEvent,                                    } from './pouchdb-service'    ;
import { AlertService                                                       } from './alert-service'      ;
import { StorageService                                                     } from './storage-service'    ;
import { ServerService                                                      } from './server-service'     ;
import { DBService                                                          } from './db-service'         ;
import { AuthService                                                        } from './auth-service'       ;
import { Preferences                                                        } from './preferences'        ;
import { DispatchService, AppEvents,                                        } from './dispatch-service'   ;
import { NotifyService                                                      } from './notify-service'     ;
import { DomainService, OnSiteDomainClass, OnSiteDomainClasses              } from './domain-service'     ;
import { Employee, Jobsite, Shift,                                          } from 'domain/onsitexdomain' ;
import { Report,                                                            } from 'domain/onsitexdomain' ;
import { ReportOther,                                                       } from 'domain/onsitexdomain' ;
import { ReportLogistics,                                                   } from 'domain/onsitexdomain' ;
import { ReportTimeCard,                                                    } from 'domain/onsitexdomain' ;
import { PayrollPeriod, Schedule, Schedules, DPS, ScheduleBeta,             } from 'domain/onsitexdomain' ;
import { SESACLL                                                            } from 'domain/newdomain'     ;
import { SESAClient                                                         } from 'domain/newdomain'     ;
import { SESALocation                                                       } from 'domain/newdomain'     ;
import { SESALocID                                                          } from 'domain/newdomain'     ;
import { SESAShift                                                          } from 'domain/newdomain'     ;
import { SESAShiftLength,                                                   } from 'domain/newdomain'     ;
import { SESAShiftStartTime,                                                } from 'domain/newdomain'     ;
import { SESAShiftSymbols,                                                  } from 'domain/newdomain'     ;
import { SESAShiftRotation,                                                 } from 'domain/newdomain'     ;
import { SESAReportType,                                                    } from 'domain/newdomain'     ;
import { SESATrainingType,                                                  } from 'domain/newdomain'     ;
// import { WebWorkerService                                                   } from 'angular2-web-worker'  ;

export type DBDATA = {
  sites       ?: Jobsite[]         ,
  employees   ?: Employee[]        ,
  reports     ?: Report[]          ,
  others      ?: ReportOther[]     ,
  logistics   ?: ReportLogistics[] ,
  timecards   ?: ReportTimeCard[]  ,
  periods     ?: PayrollPeriod[]   ,
  shifts      ?: Shift[]           ,
  schedules   ?: Schedules         ,
  // comments    ?: Comment[]         ,
  oldreports  ?: Report[]          ,
}
export type DATAQUEUE = {
  sites       ?: any[] ,
  employees   ?: any[] ,
  reports     ?: any[] ,
  others      ?: any[] ,
  logistics   ?: any[] ,
  timecards   ?: any[] ,
  periods     ?: any[] ,
  shifts      ?: any[] ,
  schedules   ?: any[] ,
  // comments    ?: any[] ,
  oldreports  ?: any[] ,
}

export type CONFIGDATA = {
  clients        : SESAClient[],
  locations      : SESALocation[],
  locIDs         : SESALocID[],
  rotations      : SESAShiftRotation[],
  shifts         : SESAShift[],
  shiftLengths   : SESAShiftLength[],
  // shiftTypes     : any[],
  shiftStartTimes: SESAShiftStartTime[],
  report_types   : SESAReportType[],
  training_types : SESATrainingType[],
};

export type CONFIGKEY = "clients" | "locations" | "locIDs" | "rotations" | "shifts" | "shiftLengths" | "shiftTypes" | "shiftStartTimes" | "report_types" | "training_types" | "employee_types";

@Injectable()
export class OSData {
  // public static PREFS    : any                  = new Preferences();
  public currentlyOpeningPage:boolean    = false            ;
  public sbs      : ScheduleBeta[]  = []               ;
  public report_types: any[]        = []               ;
  public training_types: any[]      = []               ;
  public ePeriod:Map<Employee,PayrollPeriod> = new Map()    ;
  public config   : CONFIGDATA                  = {
    clients        : [],
    locations      : [],
    locIDs         : [],
    rotations      : [],
    shifts         : [],
    shiftLengths   : [],
    // shiftTypes     : [],
    shiftStartTimes: [],
    report_types   : [],
    training_types : [],
  };
  public dbdata:DBDATA = {
    sites     : []   ,
    employees : []   ,
    reports   : []   ,
    others    : []   ,
    logistics : []   ,
    timecards : []   ,
    periods   : []   ,
    shifts    : []   ,
    schedules : null ,
    oldreports: []   ,
  };
  public loaded = {
    sites       : false ,
    employees   : false ,
    reports     : false ,
    others      : false ,
    logistics   : false ,
    timecards   : false ,
    oldreports  : false ,
    schedules   : false ,
    config      : false ,
    dps         : false ,
    messages    : false ,
    comments    : false ,
    techphones  : false ,
  };
  public dataqueue:DATAQUEUE = {
    sites      : [],
    employees  : [],
    reports    : [],
    others     : [],
    logistics  : [],
    timecards  : [],
    periods    : [],
    shifts     : [],
    schedules  : [],
    oldreports : [],
  };
  // public get dbdata():DBDATA { return this.dbdata; };
  public get sites():Jobsite[] { return this.dbdata.sites; };
  public get employees():Employee[] { return this.dbdata.employees; };
  public get reports():Report[] { return this.dbdata.reports; };
  public get others():ReportOther[] { return this.dbdata.others; };
  public get logistics():ReportLogistics[] { return this.dbdata.logistics; };
  public get timecards():ReportTimeCard[] { return this.dbdata.timecards; };
  public get periods():PayrollPeriod[] { return this.dbdata.periods; };
  public get shifts():Shift[] { return this.dbdata.shifts; };
  public get schedules():Schedules { return this.dbdata.schedules; };
  public get oldreports():Report[] { return this.dbdata.oldreports;};
  public set sites(value:Jobsite[]) { this.dbdata.sites = value; };
  public set employees(value:Employee[]) { this.dbdata.employees = value; };
  public set reports(value:Report[]) { this.dbdata.reports = value; };
  public set others(value:ReportOther[]) { this.dbdata.others = value; };
  public set logistics(val:ReportLogistics[]) { this.dbdata.logistics = val; };
  public set timecards(val:ReportTimeCard[])  { this.dbdata.timecards = val; };
  public set periods(value:PayrollPeriod[]) { this.dbdata.periods = value; };
  public set shifts(value:Shift[]) { this.dbdata.shifts = value; };
  public set schedules(value:Schedules) { this.dbdata.schedules = value; };
  public set oldreports(value:Report[]) { this.dbdata.oldreports = value; };

  public status   : any                  = { role: "usr", ready: false, loading: false, fetchWorkReports: false, loggedIn: false, persistTechChanges: false, showAllSites: true, showOffice: false, allDatesAvailable: false, ready2: false, showColors:true, showShiftLength:true, showLastUpdated: true } ;
  public dps:DPS = new DPS();
  public  user         : Employee                                ;
  private userInfo     : any                                     ;
  public readySub             : Subscription                            ;
  public dbSub                : Subscription                            ;
  public pouchChanges         : any                  = {}               ;
  public count           : number = 0                ;
  public isDeveloper     : boolean = false           ;
  public calendarFormats12   : any = {
    lastDay : '[Yesterday at] LT',
    sameDay : '[Today at] LT',
    nextDay : '[Tomorrow at] LT',
    lastWeek : '[last] dddd [at] LT',
    nextWeek : 'dddd [at] LT',
    sameElse : 'L'
  };
  public calendarFormats24   : any = {
    lastDay : '[Yesterday at] HH:mm',
    sameDay : '[Today at] HH:mm',
    nextDay : '[Tomorrow at] HH:mm',
    lastWeek : '[last] dddd [at] HH:mm',
    nextWeek : 'dddd [at] HH:mm',
    sameElse : 'L [at] HH:mm'
  };
  public calendarFormats   : any = this.calendarFormats12;
  constructor(
    public prefs    : Preferences      ,
    public storage  : StorageService   ,
    public pouchdb  : PouchDBService   ,
    public db       : DBService        ,
    public server   : ServerService    ,
    public alert    : AlertService     ,
    public auth     : AuthService      ,
    // public worker   : WebWorkerService ,
    public dispatch : DispatchService  ,
    public notify   : NotifyService    ,
    public domain   : DomainService    ,
  ) {
    Log.l('Hello OSData Provider');
    window['onsitedata']        = this         ;
    window['onsiteDataService'] = OSData       ;
    window['_matchCLL']         = _matchCLL    ;
    window['_matchSite']        = _matchSite   ;
    // window['_filterTechs']      = _filterTechs ;
    this.initializeSubscriptions();
  }

  public random(min?:number, max?:number, roundToNearest?:number):number {
    let umin    = min || 0;
    let umax    = max || 10;
    let randInt = Math.trunc(Math.random()*(umax - umin)) + umin;
    let RTN = Number(roundToNearest);
    if (RTN !== undefined && RTN > 0 && RTN <= (max - min)) {
      randInt = Math.ceil(randInt / RTN) * RTN;
      if(randInt > max) {
        randInt = max;
      } else if(randInt < min) {
        randInt = min;
      }
    }
    return randInt;
  }

  public initializeSubscriptions() {
    this.readySub = this.dispatch.appReadyStatus().subscribe((status) => {
      Log.l("OSData: appReadyStatus() subscription got an observable value of: ", status);
      this.status.ready = status;
      if(this.readySub && !this.readySub.closed) {
        this.readySub.unsubscribe();
      }
    });
    this.dbSub = this.dispatch.appEventFired().subscribe((data:{channel:AppEvents,event?:any}) => {
      let channel:AppEvents = data && data.channel ? data.channel : null;
      let event:any = data && data.event ? data.event : null;
      Log.l(`OSData: received event 'AppEvent', channel '${channel}'`);
      if(event != undefined && channel !== 'replicationcomplete') {
        Log.l(`OSData: AppEvent payload:`, event);
      }
      if(channel === 'replicationcomplete') {
        let dbname:string = event && event.db ? event.db : null;
        if(dbname) {
          // this.replicationCompletedUpdateData(dbname);
          let storeKey:string = this.domain.getStoreKeyForDB(dbname);
          if(storeKey) {
            // Log.l(`REPLICATIONCOMPLETE: Now processing queued changes for database '${dbname}' ...`);
            this.processQueuedChangesForKey(storeKey);
            // Log.l(`REPLICATIONCOMPLETE: Done processing queued changes for database '${dbname}'`);
          }
        }
      } else if(channel === 'dbupdated') {
        let dbname:string = event && event.db ? event.db : null;
        let change:PDBChangeEvent = event && event.change ? event.change : null;
        if(dbname && change) {
          Log.l(`OSData: adding change events to queue for database '${dbname}'`);
          this.addChangeToQueue(dbname, change);
          /* TODO 2018-09-19: Add changes to this.dataqueue for whatever the database is, to be processed when replication is complete */
          if(dbname === this.prefs.getDB('reports')) {
          }
        }
      }
    });
  }

  public cancelSubscriptions() {
    if(this.readySub && !this.readySub.closed) {
      this.readySub.unsubscribe();
    }
    if(this.dbSub && !this.dbSub.closed) {
      this.dbSub.unsubscribe();
    }
  }

  public addChangeToQueue(dbname:string, change:PDBChangeEvent):any[] {
    let storeKey:string = this.domain.getStoreKeyForDB(dbname);
    if(storeKey) {
      this.dataqueue[storeKey].push(change);
      return this.dataqueue[storeKey];
    } else {
      Log.w(`addChangeToQueue(): Could not get key to store change events for database '${dbname}'`);
      return null;
    }
  }

  public processAllQueuedChanges() {
    let keys = Object.keys(this.dataqueue);
    for(let key of keys) {
      let queue:PDBChangeEvent[] = this.dataqueue[key];
      let storeKey:string = key;
      if(queue.length) {
        for(let item of queue) {
          this.processChangeEvent(storeKey, item);
        }
      }
    }
  }

  public processQueuedChangesForKey(storeKey:string) {
    try {
      let load = this.loaded;
      let keys = ['reports', 'others', 'logistics', 'timecards'];
      if(keys.indexOf(storeKey) > -1 && !load[storeKey]) {
        Log.l(`processQueuedChangesForKey(): '${storeKey}' not loaded, just emptying queue ...`);
        this.dataqueue[storeKey] = [];
      } else {
        Log.l(`processQueuedChangesForKey(): Trying to process queued changes for '${storeKey}' ...`);
        let thisClass:OnSiteDomainClass =  this.domain.getClassForStoreKey(storeKey);
        if(thisClass) {
          let changes:PDBChangeEvent[] = this.dataqueue[storeKey];
          Log.l(`processQueuedChangesForKey(): Queued changes for '${storeKey}':`, changes);
          if(changes && changes.length) {
            for(let change of changes) {
              this.processChangeEvent(storeKey, change);
            }
            this.dataqueue[storeKey] = [];
          } else {
            Log.l(`processQueuedChangesForKey('${storeKey}'): No changes waiting for this key.`);
          }
        } else {
          Log.l(`processQueuedChangesForKey('${storeKey}'): Could not find class for this key!`);
        }
      }
    } catch(err) {
      Log.l(`processQueuedChangesForKey(): Error processing changes for '${storeKey}'`);
      Log.e(err);
      throw err;
    }
  }

  public processChangeEvent(storeKey:string, change:PDBChangeEvent) {
    let keyname:string = storeKey && typeof storeKey === 'string' ? storeKey : "";
    if(!keyname) {
      Log.w(`processChangeEvent(): No storeKey provided, ignoring.`);
      return;
    }
    let store = this.dbdata[storeKey];
    if(store == undefined) {
      store = [];
      this.dbdata[storeKey] = store;
    }
    let storeClass:OnSiteDomainClass = this.domain.getClassForStoreKey(storeKey);
    if(storeKey === 'schedules') {
      if(this.dbdata && this.dbdata.schedules && this.dbdata.schedules instanceof Schedules) {
        store = this.dbdata.schedules.schedules;
      } else {
        this.dbdata.schedules = new Schedules();
        store = this.dbdata.schedules.schedules;
      }
     }
    // if(storeKey !== 'schedules') {
    if(storeKey && storeClass) {
      // store = this.dbdata.reports;
      // storeClass = Report;
      // let store = this.dbdata.reports;
      let docs:any[] = change && change.docs ? change.docs : [];
      let count:number = docs.length;
      Log.l(`processChangeEvent(): Processing ${count} changes for '${keyname}':`, docs);
      for(let doc of docs) {
        let id:string = doc._id;
        let deleted:boolean = doc._deleted ? true : false;
        let idx:number = store.findIndex((a:any) => {
          return a._id === id;
        });
        if(deleted) {
          /* This is a deletion */
          if(idx > -1) {
            // let report = store[idx];
            store.splice(idx, 1);
            // this.notify.addInfo("DELETED REPORT", `Deleted Report '${report._id}'.`, 3000);
          }
        } else {
          /* This is a new document or a changed document, found in change.doc */
          if(id[0] === '_') {
            /* This is a design document. Ignore it. */
            return;
          }
          let storeObject = new storeClass();
          storeObject.deserialize(doc);
          if(storeObject instanceof Schedule) {
            let employees:Employee[] = this.dbdata.employees;
            let schedule:Schedule = storeObject;
            schedule.loadTechs(employees);
          }
          if(idx > -1) {
            /* This document exists! Change the existing object to match the udpated version */
            // report = reports[idx];
            store[idx] = storeObject;
            // this.notify.addInfo("EDITED REPORT", `Edited Report '${report._id}'.`, 3000);
          } else {
            /* This document does not exist. Just jam its new object in at the end of the current array. */
            store.push(storeObject);
            // this.notify.addInfo("NEW REPORT", `New Report '${report._id}' added.`, 3000);
          }
        }
      }
    } else {
      Log.w(`processChangeEvent(): Unable to process change event for '${storeKey}':`, change);
    }
  }

  public delay(msDelay?:number):Promise<boolean> {
    return new Promise(resolve => {
      let delay:number = typeof msDelay === 'number' ? msDelay : 500;
      setTimeout(() => {
        resolve(true);
      }, delay);
    });
  }

  public isDevMode():boolean {
    return this.status.role === 'dev';
  }

  public checkDeveloperStatus():boolean {
    let realUsername:string = (this.getUser() && this.getUser().getUsername()) ? this.getUser().getUsername() : "nobody";
    let username:string = realUsername.toLowerCase();
    if(username === 'mike' || username === 'hachero' || username === 'chorpler' || username === 'admin' || username.indexOf('sargeant') > -1) {
      this.isDeveloper = true;
      this.status.role = "dev";
      return true;
    } else {
      this.isDeveloper = false;
      this.status.role = "usr"
      return false;
    }
  }

  public toggleDeveloperMode():string {
    let username = (this.getUser() && this.getUser().getUsername()) ? this.getUser().getUsername() : "nobody";
    if (username === 'mike' || username === 'Hachero' || username === 'Chorpler') {
      if(this.status.role==="dev") {
        // this.isDeveloper = false;
        this.status.role = "usr";

      } else {
        // this.isDeveloper = true;
        this.status.role = "dev";
      }
      Log.l("toggleDeveloperMode(): role is now '%s'", this.status.role);
      return this.status.role;
    } else {
      Log.l("toggleDeveloperMode(): can't toggle developer mode, user is not developer.");
      this.notify.addWarning("UNAUTHORIZED", "You are not logged in as a developer.", 3000);
    }
  }

  public getDPS():DPS {
    return this.dps;
  }

  public setDPS(value:DPS):DPS {
    this.dps = value;
    return this.dps;
  }

  public async fetchAllData():Promise<any> {
    try {
      if(this.status.ready || this.status.loading) {
        return true;
      } else {
        this.status.loading = true;
        Log.l("DataService: About to begin fetching data...");
        let res:any = await this.fetchData();
        Log.l("DataService: done fetching data.");
        this.status.ready   = true;
        this.status.loading = false;
        return true;
      }
    } catch(err) {
      Log.l(`DataService.fetchAllData(): error fetching data.`);
      Log.e(err);
      this.status.ready   = false;
      this.status.loading = false;
      throw err;
    }
  }

  public async fetchData():Promise<any> {
    let spinnerID:string;
    try {
      if(this.status.ready) {
        return true;
      }
      this.status.loading = true;
      this.status.ready   = false;
      // this.alert.clearSpinners();
      spinnerID = await this.alert.showSpinnerPromise("Retrieving data from databases …");
      // let loading:Loading|{setContent:Function} = this.alert.getSpinner(spinnerID);
      // loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      // let loading:Loading|{setContent:Function} = this.alert.getSpinner(spinnerID);
      // loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      let loading:Loading = this.alert.getSpinner(spinnerID);
      function updateLoaderStatus(text:string) {
        let loadText:string = "Retrieving data from:<br>\n";
        if(loading && typeof loading.setContent === 'function') {
          loading.setContent(loadText + text + "…");
        } else {
          Log.l("Fake loading controller text:\n", text);
        }
      }
      let tech:Employee = await this.server.getEmployee(this.auth.getUser());
      this.user = tech;
      // let res:any = await this.server.getUserData(this.auth.getUser());
      // this.user = new Employee();
      // this.user.readFromDoc(res);

      // });
      let res:any = await this.db.getAllNonScheduleData(false, spinnerID);
        // this.schedules = new Schedules();
      for(let key in res) {
        if(key !== 'schedules') {
          this.dbdata[key] = res[key];
        }
        // else {
          // this.schedules.setSchedules(res[key]);
        // }
      }
      this.loaded.sites = true;
      this.loaded.employees = true;
      this.loaded.logistics = true;
      this.loaded.timecards = true;
      // loading.setContent("Retrieving data from:<br>\nsesa-scheduling …");
      updateLoaderStatus("sesa-scheduling");
      // res = await this.db.getSchedules(false, this.dbdata.employees);
      // this.schedules = new Schedules();
      // this.schedules.setSchedules(res);
      // this.loaded.schedules = true;
      await this.getSchedulesFromDatabase();
      // loading.setContent("Retrieving data from:<br>\nsesa-config …");
      updateLoaderStatus("sesa-config");
      res = await this.db.getAllConfigData();
      this.config.clients         = res['clients']         ;
      this.config.locations       = res['locations']       ;
      this.config.locIDs          = res['locids']          ;
      this.config.rotations       = res['rotations']       ;
      this.config.shifts          = res['shifts']          ;
      this.config.shiftLengths    = res['shiftlengths']    ;
      // this.config.shiftTypes      = res['shifttypes']      ;
      this.config.shiftStartTimes = res['shiftstarttimes'] ;
      this.config.report_types    = res['report_types']    ;
      this.config.training_types  = res['training_types']  ;
      this.report_types           = res['report_types']    ;
      this.training_types         = res['training_types']  ;
      // return this.db.getDPSSettings();
      this.loaded.config = true;
      updateLoaderStatus("sesa-dps-config");
      res = await this.server.getDPSSettings();
      // OSData.dps = res;
      this.dps = res;
      this.loaded.dps = true;
      await this.alert.hideSpinnerPromise(spinnerID);
      Log.l("fetchData(): All data fetched.");
      this.status.ready   = true;
      this.status.loading = false;
      // let data = { sites: [], employees: [], reports: [], others: [], periods: [], shifts: [], schedules: [] };
      return true;
    } catch(err) {
      Log.l("fetchData(): Error fetching all data.");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      // let errText:string = err && err.message ? err.message : typeof err === 'string' ? err : "UNKNOWN ERROR";
      // this.alert.showAlert("ERROR", "Error retrieving data:<br>\n<br\n" + errText);
      await this.alert.showErrorMessage("ERROR", "Error retrieving data", err);
      this.status.ready   = false;
      this.status.loading = false;
      throw err;
    }
  }

  public async getSchedulesFromDatabase(server?:boolean, evt?:Event):Promise<Schedule[]> {
    try {
      Log.l(`getSchedulesFromServer(): Called with server '${server}' and event:`, evt);
      let res;
      if(server === true) {
        res = await this.server.getSchedules(false, this.dbdata.employees);
      } else {
        res = await this.db.getSchedules(false, this.dbdata.employees);
      }
      this.schedules = new Schedules();
      this.schedules.setSchedules(res);
      this.loaded.schedules = true;
      return res;
    } catch(err) {
      Log.l(`getSchedulesFromServer(): Error getting schedules from server`);
      Log.e(err);
      throw err;
    }
  }
  
  

  public async getReports(fetchCount:number, existingSpinnerID?:string):Promise<Report[]> {
    // let spinnerID:string = existingSpinnerID && typeof existingSpinnerID === 'string' ? existingSpinnerID : null;
    try {
      // let reportsDB = this.prefs.getDB('reports');
      // spinnerID = await this.alert.showSpinnerPromise("Retrieving work reports …");
      // let res:Report[] = await this.db.getReportsData(fetchCount, reportsDB);
      let res:Report[] = await this.db.getWorkReports(fetchCount, existingSpinnerID);
      this.dbdata.reports = res;
      this.loaded.reports = true;
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.dispatch.updateDatastore('reports', this.dbdata.reports);
      // let change = this.syncChanges(reportsDB);
      // this.pouchChanges[reportsDB] = change;
      return res;
    } catch(err) {
      Log.l("getReports(): Error getting reports!");
      Log.e(err);
      // await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getOldReports(hideSpinner?:boolean):Promise<Report[]> {
    let spinnerID:string;
    try {
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise("Retrieving old work reports...");
      }
      let reports_old:string = "reports_old01";
      // let db = this.prefs.getDB();
      // let rdb1 = this.db.addDB(db.reports_old01);
      // Log.l(`Server.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
      // let res:any = await rdb1.allDocs({ include_docs: true });
      let reports:Report[] = await this.db.getOldReports(spinnerID);
      this.dbdata.oldreports = reports;
      this.loaded.oldreports = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('oldreports', this.dbdata.oldreports)
      // let change = this.syncChanges(reports_old);
      // this.pouchChanges[reports_old] = change;
      Log.l("getOldReports(): Final array of old reports is:\n", reports);
      return reports;
    } catch(err) {
      Log.l(`getOldReports(): Error retrieving reports.`);
      Log.e(err);
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      throw err;
    }
  }

  public async getReportOthers(hideSpinner?:boolean):Promise<ReportOther[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('reports_other');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      // let othersDB = this.prefs.DB.reports_other;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinner(`Retrieving ${count} non-work reports...`);
      }
      let others:ReportOther[] = await this.db.getReportOthers(spinnerID);
      this.dbdata.others = others;
      this.loaded.others = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('others', this.dbdata.others);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("getReportOthers(): Final ReportOther array is:\n", others);
      return others;
    } catch(err) {
      Log.l("getReportOthers(): Error getting reports!");
      Log.e(err);
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      throw err;
    }
  }

  public async getReportLogistics(hideSpinner?:boolean):Promise<ReportLogistics[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('logistics');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise(`Retrieving ${count} logistics reports...`);
      }
      let logistics:ReportLogistics[] = await this.server.getReportLogistics(spinnerID);
      // let logistics:ReportLogistics[] = await this.db.getReportLogistics(spinnerID);
      this.dbdata.logistics = logistics;
      this.loaded.logistics = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('logistics', this.dbdata.logistics);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("getReportLogistics(): Final ReportLogistics array is:", dbname);
      return dbname;
    } catch(err) {
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      Log.l("getReportLogistics(): Error getting logistics reports!");
      Log.e(err);
      throw err;
    }
  }

  public async getTimeCards(hideSpinner?:boolean):Promise<ReportTimeCard[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('timecards');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise(`Retrieving ${count} time card reports...`);
      }
      let timecards:ReportTimeCard[] = await this.server.getReportTimeCards(spinnerID);
      this.dbdata.timecards = timecards;
      this.loaded.timecards = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('logistics', this.dbdata.logistics);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("getTimeCards(): Final ReportTimeCard array is:\n", dbname);
      return dbname;
    } catch(err) {
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      Log.l("getTimeCards(): Error getting reports!");
      Log.e(err);
      throw err;
    }
  }

  // public async replicationCompletedUpdateData(dbname:string):Promise<any> {
  //   try {
  //     Log.l(`replicationCompletedUpdateData(): Called for '${dbname}'...`)
  //     if(this.isAppReady() && this.status.fetchWorkReports) {
  //       if(dbname === this.prefs.getDB('reports')) {
  //         let res:any = await this.getReports(0);
  //         return res;
  //       }
  //     } else {
  //       if(dbname === this.prefs.getDB('reports') && this.prefs.CONSOLE.global.loadReports) {
  //         let res:any = await this.getReports(0);
  //         return res;
  //       }
  //     }
  //   } catch(err) {
  //     Log.l(`replicationCompletedUpdateData(): Error somehow`);
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  // public async liveReplicationCompleted(dbname:string):Promise<any> {
  //   try {
  //     Log.l(`liveReplicationCompleted(): Called for '${dbname}'...`)
  //     let slotName:string = this.prefs.getKeyFromDB(dbname);
  //     if(slotName === 'reports_other') {
  //       slotName = 'others';
  //     }
  //     // sites
  //     // employees
  //     // reports
  //     // others
  //     // logistics
  //     // timecards
  //     // periods
  //     // shifts
  //     // schedules
  //     // oldreports
  //     let newDataClass:any;
  //     let queue:any[], dataSlot, newDataObject:Jobsite|Employee|Report|ReportOther|ReportLogistics|ReportTimeCard|Schedule, oldDataObject:Jobsite|Employee|Report|ReportOther|ReportLogistics|ReportTimeCard|Schedule;
  //     if(slotName === 'sites') {
  //       newDataClass = Jobsite;
  //     } else if(slotName === 'employees') {
  //       newDataClass = Employee;
  //     } else if(slotName === 'reports') {
  //       newDataClass = Report;
  //     } else if(slotName === 'others') {
  //       newDataClass = ReportOther;
  //     } else if(slotName === 'logistics') {
  //       newDataClass = ReportLogistics;
  //     } else if(slotName === 'timecards') {
  //       newDataClass = ReportTimeCard;
  //     } else if(slotName === 'schedules') {
  //       newDataClass = Schedule;
  //     }
  //     if(slotName === 'schedules') {
  //       queue = this.dataqueue.schedules;
  //       dataSlot = this.dbdata.schedules;
  //     } else {
  //       queue = this.dataqueue[slotName];
  //       dataSlot = this.dbdata[slotName]
  //       if(queue.length) {
  //         let doc:any = queue.pop();
  //         let id:string = doc._id;
  //         newDataObject = newDataClass.deserialize(doc);
  //         let existing = dataSlot.find(a => a._id === id);
  //         if(existing) {
  //           oldDataObject = existing;
  //         } else {

  //         }
  //       }
  //     }
  //     if(this.isAppReady() && this.status.fetchWorkReports) {
  //       if(dbname === this.prefs.getDB('reports')) {
  //         let res:any = await this.getReports(0);
  //         return res;
  //       }
  //     } else {
  //       if(dbname === this.prefs.getDB('reports') && this.prefs.CONSOLE.global.loadReports) {
  //         let res:any = await this.getReports(0);
  //         return res;
  //       }
  //     }
  //   } catch(err) {
  //     Log.l(`liveReplicationCompleted(): Error somehow`);
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  public syncChanges(dbname:string) {
    // return new Promise((resolve,reject) => {
    Log.l(`syncChanges(): Called for '${dbname}'`)
    let a:boolean = false;
    if(!a) {
      return this.server.liveSyncWithServer(dbname);
    }
    let reportsDB:string = this.prefs.getDB('reports');
    let othersDB:string = this.prefs.getDB('reports_other');
    let logisticsDB:string = this.prefs.getDB('logistics');
    let jobsitesDB:string = this.prefs.getDB('jobsites');
    let employeesDB:string = this.prefs.getDB('employees');
    if(dbname === reportsDB) {
      let reports:Report[] = this.dbdata.reports;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true})
      .on('change', (change) => {

        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let reports = this.dbdata.reports;
        if(change.deleted) {
          // change.id holds the deleted id
          let idx = reports.findIndex((a:Report) => {
            return a._id === change.id;
          });
          if(idx > -1) {
            let report = reports[idx];
            reports.splice(idx, 1);
            this.notify.addInfo("DELETED REPORT", `Deleted Report '${report._id}'.`, 3000);
          }
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          if(doc._id[0] === '_') {
            return;
          }
          let idx = reports.findIndex((a:Report) => {
            return a._id === change.id;
          });
          let report = new Report();
          report.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            reports[idx] = report;
            this.notify.addInfo("EDITED REPORT", `Edited Report '${report._id}'.`, 3000);
          } else {
            reports.push(report);
            this.notify.addInfo("NEW REPORT", `New Report '${report._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('reports', this.dbdata.reports);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
      return changes;
    } else if(dbname === othersDB) {
      let others:ReportOther[] = this.dbdata.others;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let reports = this.dbdata.reports;
        if(change.deleted) {
          // change.id holds the deleted id
          let idx = others.findIndex((a:ReportOther) => {
            return a._id === change.id;
          });
          others.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = others.findIndex((a:ReportOther) => {
            return a._id === change.id;
          });
          let other = new ReportOther();
          other.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            others[idx] = other;
            this.notify.addInfo("EDITED REPORTOTHER", `Edited ReportOther '${other._id}' added.`, 3000);
          } else {
            others.push(other);
            this.notify.addInfo("NEW REPORTOTHER", `New ReportOther '${other._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('others', this.dbdata.others);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else if(dbname === jobsitesDB) {
      let sites:Jobsite[] = this.dbdata.sites;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let reports = this.dbdata.sites;
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = sites.findIndex((a:Jobsite) => {
            return a._id === change.id;
          });
          sites.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = sites.findIndex((a:Jobsite) => {
            return a._id === change.id;
          });
          let site = new Jobsite();
          site.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            sites[idx] = site;
            this.notify.addInfo("EDITED JOBSITE", `Edited Jobsite '${site._id}' added.`, 3000);
          } else {
            sites.push(site);
            this.notify.addInfo("NEW JOBSITE", `New JOBSITE '${site._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('sites', this.dbdata.sites);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else if(dbname === employeesDB) {
      let employees:Employee[] = this.dbdata.employees;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = employees.findIndex((a:Employee) => {
            return a._id === change.id;
          });
          employees.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = employees.findIndex((a:Employee) => {
            return a._id === change.id;
          });
          let tech = new Employee();
          tech.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            employees[idx] = tech;
            this.notify.addInfo("EDITED JOBSITE", `Edited Jobsite '${tech._id}' added.`, 3000);
          } else {
            employees.push(tech);
            this.notify.addInfo("NEW JOBSITE", `New JOBSITE '${tech._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('employees', this.dbdata.employees);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else {
      Log.l(`syncChanges('${dbname}'): Can't sync to non-reports databases at the moment!`);
      return undefined;
    }
  }

  public ready():boolean {
    return this.status.ready;
  }

  public setReady(value:boolean):boolean {
    this.status.ready = value;
    return this.status.ready;
  }

  public async waitAndTest() {
    return new Promise((resolve) => {
      setTimeout(() => {
        Log.l("waitAndTest(): Count is at %d.", this.count);
        resolve(true);
      }, 1000);
    });
  }

  // public async readyStatus() {
  //   try {
  //     if(this.status.ready) {
  //       this.count = 0;
  //       return true;
  //     } else if(this.status.loading || !this.getUser()) {
  //       Log.l("appReady(): Called while app already loading data.");
  //       // reject(false);
  //       while(this.count++ < 30 && !this.status.ready) {
  //         let res = await this.waitAndTest();
  //       }
  //       return this.status.ready;
  //     } else if(this.getUser()) {
  //       Log.l("appReady(): Fetching data and resolving...");
  //       this.status.loading = true;
  //       this.fetchData().then(res => {
  //         return true;
  //       }).catch(err => {
  //         Log.l("appReady(): Error fetching data.");
  //         Log.e(err);
  //         // throw new Error("Error fetching data");
  //         return false;
  //       });
  //     } else {
  //       Log.l("appReady(): App is not ready. We need to wait. But fuck it.");
  //       return false;
  //     }
  //   } catch(err) {
  //     Log.l("readyStatus(): Error fetching data.");
  //     Log.e(err);
  //     return false;
  //   }
  // }

  public async appReady():Promise<boolean> {
    try {
      // let res:any = await this.readyStatus();
      // yield this.status.ready;
      // if(this.status.ready) {
      //   return true;
      // } else {
      //   return false;
      // }
      // return res;
      return this.status.ready;
    } catch(err) {
      Log.l(`appReady(): Error, app not ready`);
      Log.e(err);
      throw err;
    }
    // return new Promise((resolve,reject) => {
    //   this.readyStatus().then(res => {
    //     resolve(res);
    //   }).catch(err => {
    //     reject(err);
    //   });
    // });
  }

  public isAppReady() {
    return this.ready();
  }

  public getAllData(type?:string) {
    this.db.getAllData(true).then(res => {
      this.dbdata.employees = [];
      this.dbdata.sites     = [];
      this.dbdata.reports   = [];
      this.dbdata.others    = [];
      for(let employee of res.employees) {
        this.dbdata.employees.push(employee);
      }
      for(let site of res.sites) {
        this.dbdata.sites.push(site);
      }
      for(let report of res.reports) {
        this.dbdata.reports.push(report);
      }
      // for(let other of res.otherReports) {
      for(let other of res.others) {
        this.dbdata.others.push(other);
      }
    }).catch(err => {
      Log.l("getData(): Error retrieving all data.");
      Log.e(err);
    });
  }

  public getData(type:string) {
    return this.dbdata[type];
  }

  public setData(type:string, value:any) {
    this.dbdata[type] = value;
    return this.dbdata[type];
  }

  public getConfigData(type?:CONFIGKEY) {
    if(type) {
      return this.config[type];
    } else {
      return this.config;
    }
  }

  public async savePreferences(updatedPrefs?:any) {
    try {
      let prefs = updatedPrefs ? updatedPrefs : this.prefs.getPrefs();
      let res:any = await this.storage.persistentSet('PREFS', updatedPrefs);
      Log.l("savePreferences: Preferences stored:", this.prefs.getPrefs());
      return res;
    } catch(err) {
      Log.l(`savePreferences(): Error saving preferences!`);
      Log.e(err);
      return err;
    }
  }
  // public savePreferences() {
  //   return new Promise((resolve,reject) => {
  //     this.storage.persistentSet('PREFS', this.prefs.getPrefs()).then(res => {
  //       Log.l("savePreferences(): Preferences saved successfully.\n", res);
  //       resolve(res);
  //     }).catch(err => {
  //       Log.l("savePreferences(): Error saving preferences!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public getUser():Employee {
    return this.user;
  }

  public setUser(user:Employee):Employee {
    this.user = user;
    return this.user;
  }

  public getUsername():string {
    try {
      let user = this.getUser();
      if(user && user instanceof Employee) {
        let name = user.getUsername();
        return name;
      } else {
        return "UNKNOWN USERNAME";
      }
    } catch(err) {
      Log.l(`DataService.getUsername(): Error getting username! Probably not logged in!`);
      Log.e(err);
      // throw err;
      return "USERNAME UNKNOWN";
    }
  }

  public getUserByUsername(username:string):Employee {
    try {
      let techs:Employee[] = this.getData('employees');
      let tech:Employee = techs.find((a:Employee) => a.username === username);
      if(tech) {
        return tech;
      } else {
        Log.w(`getUserByUsername(): Could not find employee named '${username}' in employees list.`);
        return null;
      }
    } catch(err) {
      Log.l(`getUserByUsername(): Error fetching username!`);
      Log.e(err);
      throw err;
    }
  }

  public getTechLocationForDate(tech:Employee, dateInQuestion:Moment|Date):Jobsite {
    let name           = tech.getUsername();
    let date           = moment(dateInQuestion);
    let sites          = this.getData('sites');
    let schedules      = this.getSchedules();
    // let scheduleStart  = this.getScheduleStartDate(date);
    // let scheduleStart  = this.getPayrollPeriodStartDate(date);
    let scheduleStart  = Schedule.getScheduleStartDateFor(date);
    let dateString     = scheduleStart.format("YYYY-MM-DD");
    // let strScheduleStart = scheduleStart.format("YYYY-MM-DD");
    let sched:Schedule = schedules.find((a:Schedule) => {
      // return ((a._id === strScheduleStart) && a.creator === 'grumpy');
      return a._id === dateString;
    });
    let unassigned_site = sites.find((a:Jobsite) => a.site_number === 1);
    if(sched) {
      // let schedule;
      // if(sched.schedule) {
      //   schedule = sched.schedule;
      // } else {
      //   let errText = `getTechLocationForDate(): Could not find schedule for date '${dateString}'.`;
      //   Log.w(errText);
      //   this.notify.addWarning("SCHEDULE MISSING", errText, 10000);
      //   return unassigned_site;
      // }
      // let scheduleName;
      // outerloop:
      // for(let siteName in schedule) {
      //   let siteRotations = schedule[siteName];
      //   for(let rotation in siteRotations) {
      //     let techs = siteRotations[rotation];
      //     if(techs.indexOf(name) > -1) {
      //       scheduleName = siteName;
      //       break outerloop;
      //     }
      //   }
      // }
      // if(scheduleName) {
      //   let site = sites.find((a:Jobsite) => { return a.getScheduleName().toUpperCase() === scheduleName.toUpperCase()});
      //   // if(site === undefined) {
      //   //   let tryAgain = this.getSiteForTech(tech);
      //   //   if(tryAgain.site_number !== 1) {
      //   //     site = tryAgain;
      //   //   } else {
      //   //     Log.w(`getTechLocationForDate(): Could not find location for tech '${name}' on date '${date.format("YYYY-MM-DD")}', even with user location data!`);
      //   //     site = unassigned_site;
      //   //   }
      //   // }
      let site = sched.getTechLocation(tech, sites);
      if(site) {
        return site;
      } else {
        return unassigned_site;
      }
    } else {
      return unassigned_site;
      // let site;
      // let tryAgain = this.getSiteForTech(tech);
      // if(tryAgain.site_number !== 1) {
      //   site = tryAgain;
      // } else {
      //   Log.w(`getTechLocationForDate(): Could not find location for tech '${name}' on date '${date.format("YYYY-MM-DD")}'.`);
      //   site = unassigned_site;
      // }
      // return site;
    }
  }

  // public getTechRotationForDate(tech:Employee, dateInQuestion:Moment|Date):string {
  public getTechRotationForDate(tech:Employee, dateInQuestion:Moment|Date):string {
    let name           = tech.getUsername();
    let date           = moment(dateInQuestion);
    let schedules      = this.getSchedules();
    // let scheduleStart  = this.getScheduleStartDate(date);
    let scheduleStart  = Schedule.getScheduleStartDateFor(date);
    let dateString     = scheduleStart.format("YYYY-MM-DD");
    let sched:Schedule = schedules.find(a => {
      return a._id === dateString;
    });
    if(sched) {
      return sched.getTechRotation(tech);
      // let schedule = sched.schedule;
      // let techRotation:string = "";
      // if(!(sched.getTechs().indexOf(name) > -1 ))
      // outerloop:
      // for(let siteName in schedule) {
      //   let siteRotations = schedule[siteName];
      //   for(let rotation in siteRotations) {
      //     let techs = siteRotations[rotation];
      //     if(techs.indexOf(name) > -1) {
      //       techRotation = rotation;
      //       break outerloop;
      //     }
      //     // let i = techs.findIndex((a:Employee) => {
      //     //   return a.username === tech.username;
      //     // });
      //     // if(i > -1) {
      //     //   techRotation = rotation;
      //     //   break outerloop;
      //     // }
      //   }
      // }
      // if(techRotation) {
      //   return techRotation;
      // } else {
      //   Log.w(`getTechRotationForDate(): Unable to find tech rotation for '${tech.getUsername()}', date '${date.format("YYYY-MM-DD")}'`);
      //   return "UNASSIGNED";
      // }
    } else {
      Log.w(`getTechRotationForDate(): Unable to find a schedule for '${tech.getUsername()}', date '${date.format("YYYY-MM-DD")}'`);
      return "UNASSIGNED";
    }
  }

  public getTechShiftTypeForDate(tech:Employee, dateInQuestion:Moment|Date|string):SiteScheduleType {
    // let date           = moment(dateInQuestion);
    // let schedule = this.getUserScheduleFor(date);
    // if(schedule) {
    //   return schedule.shift;
    // } else {
    //   Log.w(`UserData.getTechShiftTypeForDate(): Unable to find a shift type for date '${date.format("YYYY-MM-DD")}'`);
    //   return "AM";
    // }
    if(tech.shift) {
      return tech.shift;
    } else {
      return "AM";
    }
  }

  public getRotationSequence(rotation:any) {
    let a = "";
    if(typeof rotation === 'string') {
      a = rotation;
    } else if(typeof rotation === 'object' && rotation.name !== undefined) {
      a = rotation.name;
    } else {
      a = JSON.stringify(rotation);
    }
    let out = a === 'FIRST WEEK' ? "A" : a === 'CONTN WEEK' ? "B" : a === 'FINAL WEEK' ? "C" : a === 'DAYS OFF' ? "D" : a === 'VACATION' ? "V" : a === "UNASSIGNED" ? "X" : "K";
    return out;
  }

  public getPayrollPeriodStartDate(date?:Moment|Date):Moment {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day                 = date ? moment(date).startOf('day') : moment().startOf('day');
    if(day.isoWeekday() < scheduleStartsOnDay) {
      return moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    } else {
      return moment(day).isoWeekday(scheduleStartsOnDay);
    }
  }

  public getScheduleStartDate(date?:Moment|Date):Moment {
    return this.getPayrollPeriodStartDate(date);
  }

  public getNextScheduleStartDate(date?:Moment|Date):Moment {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day                 = date ? moment(date).startOf('day') : moment().startOf('day');
    if(day.isoWeekday() < scheduleStartsOnDay) {
      return day.isoWeekday(scheduleStartsOnDay);
    } else {
      return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    }
  }

  public getPayrollPeriodStartDateString(date?:Moment|Date):string {
    return this.getPayrollPeriodStartDate(date).format("YYYY-MM-DD");
  }

  public getScheduleStartDateString(date?:Moment|Date):string {
    return this.getScheduleStartDate(date).format("YYYY-MM-DD");
  }

  public getNextScheduleStartDateString(date?:Moment|Date):string {
    return this.getNextScheduleStartDate(date).format("YYYY-MM-DD");
  }

  public getStartDateForPayrollPeriodCount(count:number):Moment {
    let PPToShow:number = count || 4;
    let now = moment();
    let ppStartDate:Moment = this.getPayrollPeriodStartDate(now).startOf('day');
    let payPeriodDate = moment(ppStartDate).subtract(PPToShow, 'weeks');
    return payPeriodDate;
  }

  public createPayrollPeriods(count?:number):PayrollPeriod[] {
    let periods:PayrollPeriod[] = [];
    let defaultWeeks:number = this.prefs.CONSOLE.global.payroll_periods || 4;
    let weeksBack:number = count ? count : defaultWeeks;
    let now:Moment   = moment();
    let nextWeek:Moment = moment(now).add(1, 'weeks');
    // let latestDate:Moment   = this.getPayrollPeriodStartDate(now);
    let latestDate:Moment = PayrollPeriod.getPayrollPeriodDate(nextWeek);
    let earliestDate:Moment = moment(latestDate).subtract(weeksBack, 'weeks');
    let startDate:Moment = this.getScheduleStartDate(moment(latestDate));
    let endDate:Moment   = moment(startDate).add(6, 'days');
    let latest:Moment = this.getScheduleStartDate(latestDate);
    Log.l(`createPayrollPeriods(): Starting with ${latest.format("YYYY-MM-DD")}, counting back to ${earliestDate.format("YYYY-MM-DD")}`);
    while(latest.subtract(7, 'days').isSameOrAfter(earliestDate, 'day')) {
      let period:PayrollPeriod = new PayrollPeriod(moment(latest), moment(latest).add(6, 'days'), moment(latest).toExcel(true), []);
      period.getPayrollShifts();
      periods.push(period);
    }
    Log.l(`createPayrollPeriods(): Counting back '${weeksBack}' weeks, result is:\n`, periods);
    this.dbdata.periods = periods;
    return periods;
  }

  public createPeriodForTech(tech: Employee, start_date?:Moment): PayrollPeriod {
    let name = tech.getUsername();
    let date = start_date ? moment(start_date).startOf('day') : moment().startOf('day');
    // Log.l(`createPeriodForTech(): Creating payroll period for tech '${name}' and date '${date.format("YYYY-MM-DD")}'...`);
    let now = moment(date);
    // OSData.periods = [];
    // let payp = OSData.periods;
    // let payp:PayrollPeriods[] = [];
    // let len = payp.length;
    // let tmp1 = payp;
    // OSData.periods = payp.splice(0, len);
    let sites = this.getData('sites');
    let site:Jobsite = this.getTechLocationForDate(tech, moment(date));
    let shift_type = this.getTechShiftTypeForDate(tech, moment(date));
    let rotation = this.getTechRotationForDate(tech, moment(date));

    if (site instanceof Jobsite) {
      // let periodCount = count || 2;
      // for (let i = 0; i < periodCount; i++) {
      // Log.l(`createPeriodForTech(): Now creating period for tech '${tech}' at site '${site.getScheduleName()}'...`);
      // let date  = start_date ? moment(start_date) : moment();
      let start = PayrollPeriod.getPayrollPeriodDateForShiftDate(moment(date));
      let pp    = new PayrollPeriod();
      pp.setStartDate(start);
      pp.createConsolePayrollPeriodShiftsForTech(tech, site, shift_type, rotation);
      return pp;
      // }
      // return OSData.periods;
    } else {
      Log.e("createPayrollPeriods(): Could not find tech at any jobsites!");
      Log.l(tech);
      Log.l(sites);
      return null;
    }
  }

  public getSiteForTech(tech:Employee):Jobsite {
    let cli = this.getFull('client', tech.client);
    let loc = this.getFull('location', tech.location);
    let lid = this.getFull('locID', tech.locID);
    let sites = this.getData('sites');
    let unassigned:Jobsite = sites.find((a:Jobsite) => {
      return a.site_number === 1;
    });
    let site:Jobsite = sites.find((a:Jobsite) => {
      return a.client.name.toUpperCase() === cli.name.toUpperCase() && a.location.name.toUpperCase() === loc.name.toUpperCase() && a.locID.name.toUpperCase() === lid.name.toUpperCase();
    });
    if(site) {
      return site;
    } else {
      return unassigned;
    }
  }

  public getFullName(type:string, value:any) {
    let out = this.getFull(type, value);
    if(out && typeof out === 'object' && out['fullName'] !== undefined) {
      return out['fullName'];
    } else {
      return out;
    }
  }

  public getFull(type:string, value:any):any {
    let result = null;
    let sites = this.getData('sites');
    if(type === 'client' || type === 'location' || type === 'locID') {
      let val;
      if(value && typeof value === 'object' && typeof value.fullName === 'string') {
        val = value.fullName.toUpperCase();
      } else if(value && typeof value === 'string') {
        val = value.toUpperCase();
      } else {
        return {name: "", fullName: ""};
      }
      // result = this.sites.find(obj => {
      //   let n  = obj[type]['fullName'].toUpperCase();
      //   let fn = obj[type]['name'].toUpperCase();
      //   return n === val || fn === val;
      // });
      result = sites.filter(obj => {
        let n  = obj[type]['fullName'].toUpperCase();
        let fn = obj[type]['name'].toUpperCase();
        return n === val || fn === val;
      }).map(a => a[type])[0];
      // result = result[type];
    } else {
      result = "";
      Log.w(`getFull(): Type '${type}' not valid for value:\n`, value);
    }
    return result;
  }

  public getFullClient(value:any):any {
    let out = {name: "", fullName: ""};
    if(value) {
      let val    = value.toUpperCase();
      let result = this.getFull('client', value);
      if(result) {
        out = result;
      }
    }
    return out;
  }

  public getFullLocation(value:any):any {
    let out = {name: "", fullName: ""};
    if(value) {
      let val    = value.toUpperCase();
      let result = this.getFull('location', value);
      if(result) {
        out = result;
      }
    }
    return out;
  }

  public getFullLocID(value:any):any {
    let out = {name: "", fullName: ""};
    if(value) {
      let val    = value.toUpperCase();
      let result = this.getFull('locID', value);
      if(result) {
        out = result;
      }
    }
    return out;
  }

  public getCurrentSchedule():Schedule {
    return this.schedules.getCurrentSchedule();

  }

  public getSchedules():Schedule[] {
    return this.schedules.getSchedules();
  }

  public getSchedulesAsBetas():ScheduleBeta[] {
    return this.sbs;
  }

  public generatePayrollData() {
    let eReports:Map<Employee, Report[]>        = new Map();
    let ePeriods:Map<Employee, PayrollPeriod[]> = new Map();
  }

  public createEmployeePeriodMap(pd:PayrollPeriod):Map<Employee,PayrollPeriod> {
    // let periods = this.periods ||  this.createPayrollPeriods();
    let period = pd;

    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.getFullClient(a.client);
      let cliB = this.getFullClient(b.client);
      let locA = this.getFullLocation(a.location);
      let locB = this.getFullLocation(b.location);
      let lidA = this.getFullLocID(a.locID);
      let lidB = this.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    }
    let _sortReports = (a:Report, b:Report) => {
      return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
    };

    window['_sortTechs']   = _sortTechs;
    window['_sortReports'] = _sortReports;
    let allData = {employees: [], reports: [], others: [], periods: [], sites: [], schedules: []};
    allData.employees = this.dbdata.employees.slice(0) ;
    allData.reports   = this.dbdata.reports.slice(0)   ;
    allData.others    = this.dbdata.others.slice(0)    ;
    allData.periods   = this.dbdata.periods.slice(0)   ;
    allData.sites     = this.dbdata.sites.slice(0)     ;
    // this.allData.schedules = this.data.schedules.clone()  ;
    allData.schedules = this.getSchedules().slice(0) ;

    let employees = allData.employees.filter((a:Employee) => {
      // let userclass = Array.isArray(a.userClass) ? a.userClass[0].toUpperCase() : typeof a.userClass === 'string' ? a.userClass.toUpperCase() : "M-TECH";
      let uc:any = a.userClass;
      let userclass     = Array.isArray(uc) ? uc[0].toUpperCase() : typeof uc === 'string' ? uc.toUpperCase() : 'M-TECH';
      return a.active === true && a.client && a.location && a.locID && userclass !== 'MANAGER';
    });

    // let period;

    // if(pd) {
    //   period = periods.find((a:PayrollPeriod) => {
    //     return a.start_date.format("YYYY-MM-DD") === pd.start_date.format("YYYY-MM-DD");
    //   });
    // } else {
    //   period = periods[0];
    // }

    employees     = employees.sort(_sortTechs);
    let reports   = allData.reports.sort(_sortReports);
    let others    = allData.others.sort(_sortReports);
    let sites     = allData.sites.slice(0);
    let sortedSchedules = allData.schedules.sort((a: Schedule, b: Schedule) => {
      return a.startXL < b.startXL ? 1 : a.startXL > b.startXL ? -1 : 0;
    });
    this.schedules.setSchedules(sortedSchedules);
    let pDate = moment(period.start_date).format("YYYY-MM-DD");

    let schedules = this.getSchedules();
    let schedule = schedules.find((obj: Schedule) => {
      return obj._id === pDate;
    });
    this.ePeriod = this.updatePeriod(period);
    return this.ePeriod;
    // this.dataReady = true;

  }



  public updatePeriod(period: PayrollPeriod) {
    // let text = sprintf("Setting period to '%s' — '%s'...", period.start_date.format("DD MMM, YYYY"), period.end_date.format("DD MMM, YYYY"));
    let ePeriod = new Map();

    // let eSummary = new Map();
    let date  = moment(period.start_date);
    let start = moment(date).format("YYYY-MM-DD");
    let end   = moment(start).add(6, 'days').format("YYYY-MM-DD");
    let sites = this.sites;

    let reports = this.getData('reports');
    let others  = this.getData('others');

    reports = reports.filter((obj, pos, arr) => {
      let    report_date   = obj['report_date'];
      return report_date  >= start && report_date <= end;
    });
    others = others.filter((obj, pos, arr) => {
      let    report_date   = obj['report_date'].format("YYYY-MM-DD");
      return report_date  >= start && report_date <= end;
    });

    // this.schedules.setSchedules(this.getData('schedules'));

    let schedules = this.getSchedules();

    let pDate = moment(period.start_date).format("YYYY-MM-DD");
    let schedule = schedules.find(a => {
      return a.start.format("YYYY-MM-DD") === pDate;
    });
    // this.schedule = schedule;
    // let a = schedule.schedule;
    // let techSite;
    // let siteNames = Object.keys(a);
    // for (let name of siteNames) {
    //   let rotations = Object.keys(a[name]);
    //   for (let rotation of rotations) {
    //     let techs = a[name][rotation];
    //     let techSite = techs.find(b => { return b.username === 'Aj'; });
    //   }
    // }
    // this.loading.setContent(text + "<br>\nReading employee reports...");
    let techs = this.employees.slice(0);
    techs = techs.filter((a:Employee) => {
      // let userclass = Array.isArray(a.userClass) ? a.userClass[0].toUpperCase() : typeof a.userClass === 'string' ? a.userClass.toUpperCase() : "M-TECH";
      let uc:any = a.userClass;
      let userclass     = Array.isArray(uc) ? uc[0].toUpperCase() : typeof uc === 'string' ? uc.toUpperCase() : 'M-TECH';
      return a.active === true && a.client && a.location && a.locID && userclass !== 'MANAGER';
    });

    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.getFullClient(a.client);
      let cliB = this.getFullClient(b.client);
      let locA = this.getFullLocation(a.location);
      let locB = this.getFullLocation(b.location);
      let lidA = this.getFullLocID(a.locID);
      let lidB = this.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    }
    techs = techs.sort(_sortTechs)
    for (let tech of techs) {
      // if(tech.client && tech.client.full)
      let date       = moment(period.start_date);
      let techPeriod = this.createPeriodForTech(tech, date);
      let shifts     = techPeriod.getPayrollShifts();
      for (let shift of shifts) {
        let shiftDate = shift.getShiftDate().format("YYYY-MM-DD");
        reports   = this.dbdata.reports.filter((a:Report) => {
          return a.report_date === shiftDate && a.username === tech.username;
        });
        let others:ReportOther[] = this.dbdata.others.filter((a:ReportOther) => {
          let date:string = a.getReportDateAsString();
          return date === shiftDate && a.username === tech.username;
        });
        shift.setShiftReports([]);
        shift.setOtherReports([]);
        for (let report of reports) {
          shift.addShiftReport(report);
        }
        for (let other of others) {
          shift.addOtherReport(other);
        }
      }
      ePeriod.set(tech, techPeriod);
      // let techPeriodSummary = new Map();
      // let standby           = 0;
      // let training          = 0;
      // let travel            = 0;
      // let holiday           = 0;
      // let vacation          = 0;
      // let sick              = 0;
      // for (let shift of shifts) {
      //   standby  += shift.getSpecialHours('Standby').hours;
      //   training += shift.getSpecialHours('Training').hours;
      //   travel   += shift.getSpecialHours('Travel').hours;
      //   holiday  += shift.getSpecialHours('Holiday').hours;
      //   vacation += shift.getSpecialHours('Vacation').hours;
      //   sick     += shift.getSpecialHours('Sick').hours;
      // }
      // techPeriodSummary.set('standby', standby);
      // techPeriodSummary.set('training', training);
      // techPeriodSummary.set('travel', travel);
      // techPeriodSummary.set('holiday', holiday);
      // techPeriodSummary.set('vacation', vacation);
      // techPeriodSummary.set('sick', sick);
      // eSummary.set(tech, techPeriodSummary);
    }
    return ePeriod;
  }

  public getEmployeeFromUsername(username:string) {
    let employees = this.employees;
    let employee  = employees.find(a => {
      return a['username'] === username;
    });
    return employee;
  }

  public convertTimeStringToHours(timestring:string|number):number {
    if(typeof timestring === 'number') {
      return timestring;
    } else {
      let timearray = timestring.split(":");
      let hs = timestring[0];
      let ms = timestring[1];
      let hours = Number(hs) + (Number(ms)/60);
      return hours;
    }
  }

  public decimalize(value:number):Decimal {
    return new dec(value);
  }

  public splitReportID(id:string) {
    let splits = id.split("_");
    let len = splits.length;
    let num = 0, strNum = "", newID = "";
    if(splits[len - 2] === "split") {
      num = Number(splits[len - 1]);
      if(!isNaN(num)) {
        num++;
        strNum = sprintf("%02d", num);
        splits.pop();
        // splits.pop();
        for(let chunk of splits) {
          newID += chunk + "_";
        }
        newID += strNum;
      }
    } else {
      newID = id + "_split_01";
    }
    return newID;
    // let match = /(.*)(?:_split_)?()/g;
  }

  public splitReport(rpt:Report):Report {
    let report = rpt;
    let newReport = new Report();
    newReport.readFromDoc(rpt.serialize());
    let id = report._id;
    let splits = id.split("_");
    let len = splits.length;
    let num = 0, strNum = "", newID = "";
    if(splits[len - 2] === "split") {
      num = Number(splits[len - 1]);
      if(!isNaN(num)) {
        num++;
        strNum = sprintf("%02d", num);
        splits.pop();
        // splits.pop();
        for(let chunk of splits) {
          newID += chunk + "_";
        }
        newID += strNum;
      }
    } else {
      newID = id + "_split_01";
    }
    newReport._id = newID;
    report.split_count++;
    newReport.split_count++;
    newReport.split_from = report._id;
    report.split_from = "";
    return newReport;
    // let match = /(.*)(?:_split_)?()/g;
  }

  public removeAccents(input:string):string {
    let accents:string   = 'ÀÁÂÃÄÅĄàáâãäåąßÒÓÔÕÕÖØŐòóôőõöøĎďDŽdžÈÉÊËĘèéêëęðÇçČčĆćÐÌÍÎÏìíîïÙÚÛÜŰùűúûüĽĹŁľĺłÑŇŃňñńŔŕŠŚšśŤťŸÝÿýŽŻŹžżź';
    let accentsOut:string = "AAAAAAAaaaaaaasOOOOOOOOoooooooDdDZdzEEEEEeeeeeeCcCcCcDIIIIiiiiUUUUUuuuuuLLLlllNNNnnnRrSSssTtYYyyZZZzzz";
    let inString:string = input ? input : "";
    let output:string = inString.split("").map((letter, index) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join("");
    return output;
// str.forEach((letter, index) => {
    //   let i = accents.indexOf(letter);
    //   if (i !== -1) {
    //     str[index] = accentsOut[i];
    //   }
    // })
    // return str.join('');
  }

}
