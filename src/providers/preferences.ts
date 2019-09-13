/**
 * Name: Preferences provider (Console)
 * Vers: 78
 * Date: 2019-07-23
 * Auth: David Sargeant
 * Logs: 78 2019-07-23: Added CONSOLE.scheduling.pastSchedulesToLoad
 * Logs: 77 2018-09-07: Added CONSOLE.scripts entry for Google Maps and Charts scripts to be lazy loaded, plus getScripts(), getScriptURL() methods
 * Logs: 76 2018-08-27: Added SERVER.howlerPort and some methods, plus SERVER.replicationBatchSize
 * Logs: 75 2018-08-03: Added logistics and timesheets DB
 * Logs: 74 2018-08-03: Added getLocalAdapter() method
 * Logs: 73 2018-07-11: Added properties showLineNumbers, showExTechs,showUnassignedTechs to payroll; added showNonSESA to scheduling; added lastPage, goToLastPage to global
 * Logs: 72 2018-07-09: Added new option to CONSOLE: reportsToLoad
 * Logs: 71 2018-06-11: Added new scheduling options in CONSOLE: showUnassigned, showLegrave, showEmptyClients
 * Logs: 70 2018-05-16: added payroll_periods key to payroll screen options in CONSOLE
 * Logs: 69 2018-05-03: added employeeView keys in CONSOLE
 * Logs: 68 2018-04-18: Added showTestSites key in Scheduling
 * Logs: 67 2018-03-06: Added jobsites keys in CONSOLE
 * Logs: 66 2018-03-05: Added hbpreauth keys in CONSOLE
 * Logs: 65 2018-03-03: Changed to using JSON8 and JSON8Patch to merge instead of replacing new Preferences
 * Logs: 64 2018-03-01: Added techphones preferences
 * Logs: 63 2018-02-28: Changed oldreports name
 * Logs: 62 2018-02-26: Added CONSOLE global pref keys loadMiscReports and loadOldReports
 * Logs: 61 2018-02-23: Added techshiftreports config keys, and payroll_periods count for CONSOLE
 * Logs: 60 2018-02-21: Added exportUseQuickbooksName to Payroll
 * Logs: 59 2018-02-20: Changed default Payroll showAlerts setting to false
 * Logs: 58 2018-02-20: Added more options for Payroll page
 * Logs: 56 2017-12-11: Added kn, be, hb invoices databases
 * Logs: 55 2017-12-09: Added page size arrays
 * Logs: 54 2017-11-17: Added reports_old01 key
 * Logs: 53: Fixed preauths typo
 * Logs: 52: Added preauth database parameter
 * Logs: 51: Added customizable PouchDB adapter
 * Logs: 50: Added weekStartDay preference
 * Logs: 49: Added loadReports preference
 * Logs: 48: Updated PouchDB adapter back to idb
 * Logs: 47: Updated PouchDB adapter to worker
 * Logs: I forget
 */

import { Injectable                  } from '@angular/core'        ;
import { Log, oo, ooPatch, ooPointer } from 'domain/onsitexdomain' ;

const version:number = 77       ;

// const GMAPI1:string = "QUl6YVN5QnV0NFdaRGt1MzROYnpmd09PQlBIZk5KUm42MGRILTRr";
const GMAPI1:string = "QUl6YVN5Q243NjJEcXpTOWhvSGtDSV9xM3JRZHpaZlBXbmVkdkh3";
var gmkey:string = atob(GMAPI1);
var adapter:string   = 'idb'    ;
// var adapter   = 'worker' ;

// var server            = "db.cellar.sesa.us"        ;
// var server            = "mars.sesa.us"             ;
export let server         = "pico.sesa.us"             ;
export let port           = 443                        ;
export let howlerPort     = 3000                       ;
export let protocol       = "https"                    ;
export let reports        = 'reports_ver101100'        ;
export let reports_other  = 'sesa-reports-other'       ;
export let employees      = 'sesa-employees'           ;
export let config         = 'sesa-config'              ;
export let jobsites       = 'sesa-jobsites'            ;
export let scheduling     = 'sesa-scheduling'          ;
export let schedulingbeta = 'sesa-scheduling-beta'     ;
export let invoices       = 'sesa-invoices'            ;
export let invoices_be    = 'sesa-invoices-be'         ;
export let invoices_hb    = 'sesa-invoices-hb'         ;
export let invoices_kn    = 'sesa-invoices-kn'         ;
export let technicians    = 'sesa-technicians'         ;
export let messages       = 'sesa-messages'            ;
export let comments       = 'sesa-comments'            ;
export let phoneInfo      = 'sesa-tech-phones'         ;
export let sounds         = 'sesa-sounds'              ;
export let login          = '_session'                 ;
// export let geolocation    = 'sesa-geolocation'         ;
export let locations      = 'sesa-reports-geolocation' ;
export let preauths       = 'sesa-preauths'            ;
export let worksites      = 'sesa-worksites'           ;
export let timesheets     = 'sesa-timesheets'          ;
export let reports_old01  = 'sesa-reports-2017-09'     ;
export let reports_old02  = 'sesa-reports-2017-12'     ;
export let logistics      = 'sesa-reports-logistics'   ;
export let timecards      = 'sesa-timecards'           ;
export let translations   = 'sesa-translations'        ;
export let drivings       = 'sesa-reports-driving'     ;
export let maintenances   = 'sesa-reports-maintenance' ;
export let preferences    = 'sesa-preferences'         ;
export let reports_old    = [
  'reports_old01',
  // 'reports_old02',
 ];
// var reports_old    = ['reports_old01', 'reports_old02', ]

export type DatabaseKey = "reports" | "reports_other" | "logistics" | "drivings" | "maintenances" | "employees" | "config" | "jobsites" | "scheduling" | "invoices" | "invoices_be" | "invoices_hb" | "invoices_kn" | "technicians" | "messages" | "comments" | "phoneInfo" | "sounds" | "login" | "preauths" | "preferences" | "worksites" | "timesheets" | "timecards" | "translations" | "locations" | "reports_old01" | "reports_old02" | "reports_old";
export type DatabaseKeys = DatabaseKey[];
export type DatabaseTypeToName = {
  [propName in DatabaseKey]:string|string[];
};

export interface PreferencesDoc {
  DB        : DatabaseTypeToName;
  CONSOLE   : any;
  USER      : any;
  CAMERA    : any;
  DEVELOPER : any;
  SERVER    : any;
}

export type ProtocolType = "http"|"https";
export interface ServerParameters {
  protocol: ProtocolType;
  hostname: string;
  port: number;
  database: string;
  url?: string;
}

@Injectable()
export class Preferences {
  public static DB:DatabaseTypeToName;
  public static CONSOLE:any;
  public static USER:any;
  public static CAMERA:any;
  public static DEVELOPER:any;
  public static SERVER:any;
  public static defaultPrefs:any;
  public get DB():DatabaseTypeToName { return Preferences.DB; }
  public set DB(value:DatabaseTypeToName) { Preferences.DB = value;}
  public get SERVER() { return Preferences.SERVER;}
  public set SERVER(value:any) { Preferences.SERVER = value;}
  public get USER() { return Preferences.USER;}
  public set USER(value:any) { Preferences.USER = value;}
  public get DEVELOPER() { return Preferences.DEVELOPER;}
  public set DEVELOPER(value:any) { Preferences.DEVELOPER = value;}
  public get CONSOLE() { return Preferences.CONSOLE; }
  public set CONSOLE(value:any) { Preferences.CONSOLE = value; }
  public get defaultPrefs():PreferencesDoc { return Preferences.defaultPrefs; }
  public set defaultPrefs(value:PreferencesDoc) { Preferences.defaultPrefs = value; }
  // public static DB: any = {
  //   'reports'           : reports           ,
  //   'reports_other'     : reports_other     ,
  //   'logistics'         : logistics         ,
  //   'employees'         : employees         ,
  //   'config'            : config            ,
  //   'jobsites'          : jobsites          ,
  //   'scheduling'        : scheduling        ,
  //   'invoices'          : invoices          ,
  //   'invoices_be'       : invoices_be       ,
  //   'invoices_hb'       : invoices_hb       ,
  //   'invoices_kn'       : invoices_kn       ,
  //   'technicians'       : technicians       ,
  //   'messages'          : messages          ,
  //   'comments'          : comments          ,
  //   'phoneInfo'         : phoneInfo         ,
  //   'sounds'            : sounds            ,
  //   'login'             : login             ,
  //   'geolocation'       : geolocation       ,
  //   'preauths'          : preauths          ,
  //   'worksites'         : worksites         ,
  //   'timesheets'        : timesheets        ,
  //   'timecards'         : timecards         ,
  //   'translations'      : translations      ,
  //   'reports_old01'     : reports_old01     ,
  //   'reports_old02'     : reports_old02     ,
  //   'reports_old'       : reports_old       ,
  // };
  public static CONSOLE2: any = {
    scripts: {
      maps         : `https://maps.google.com/maps/api/js?key=${gmkey}` ,
      charts       : "https://www.gstatic.com/charts/loader.js"         ,
      quill        : "build/quill.js"                                   ,
      fullcalendar : "build/fullcalendar.min.js"                        ,
    },
    global: {
      payroll_periods: 4,
      loadEmployees: true,
      loadSites: true,
      loadReports: false,
      loadMiscReports: false,
      loadOldReports: false,
      weekStartDay: 3,
      reportsToLoad: 20000,
      goToLastPage: true,
      lastPage: '',
      timeFormat24: false,
      timeFormat: "hh:mm A",
      dateFormatShort: "MMM DD",
      dateFormatMed: "DD MMM YYYY",
      dateFormatLong: "ddd DD MMM YYYY",
      dateFormatSort: "YYYY-MM-DD",
      dateTimeFormat: "YYYY-MM-DD HH:mm",
    },
    employeeView: {
      showAllSites: false,
    },
    scheduling: {
      persistTechChanges: false,
      showAllSites: true,
      showOffice: false,
      showTestSites: false,
      allDatesAvailable: false,
      lastScheduleUsed: "",
      showUnassigned: true,
      showLegrave: true,
      showEmptyClients: true,
      showNonSESA: false,
      pastSchedulesToLoad: 12,
    },
    payroll: {
      payroll_periods: 4,
      showColors: true,
      showShiftLength: true,
      showAlerts: false,
      exportUseQuickbooksName: true,
      minHoursWhenOn: 20,
      maxHoursWhenOff: 15,
      showLineNumbers: false,
      showExTechs: false,
      showUnassignedTechs: true,
    },
    techshiftreports: {
      showAllSites: false,
      showAllTechs: false,
      payroll_periods: 4,
    },
    hbpreauth: {
      showAllSites: false,
      payroll_periods: 4,
    },
    jobsites: {
      autoLayoutTable: false,
      tableResizeMode: 'fit',
      showAllSites: true,
      colorSitesByStatus: true,
    },
    techphones: {
      autoLayoutTable: false,
      tableResizeMode: 'fit',
    },
    pages: {
      reports: 25,
      reports_other: 25,
      employees: 500,
      jobsites: 50,
      techphones: 25,
    },
    pageSizes: {
      reports: [10,20,25,30,40,50,75,100,200,500,1000,2000],
      reports_other: [10,20,25,30,40,50,75,100,200,500,1000,2000],
      employees: [5,10,20,25,30,40,50,75,100,150,200,250,300,400,500,1000],
      jobsites: [5,10,20,25,30,40,50,75,100],
      techphones: [5,10,20,25,30,40,50,75,100,200,500,1000],
    },
  };
  public static USER2: any = {
    preferencesVersion: version,
    language: 'en',
    shifts: 7,
    payroll_periods: 2,
    audio: false,
    stayInReports: false,
    spinnerSpeed: 10,
    messageCheckInterval: 15,
  };
  public static DEVELOPER2: any = {
    showDocID: false,
    showDocRev: false,
    showReportTimes: false,
    showReportSite: false,
  };
  public static SERVER2: any = {
    localAdapter: adapter,
    server: server,
    port: port,
    protocol: protocol,
    howerPort: howlerPort,
    replicationBatchSize: 200,
    opts: { auto_compaction: true, get adapter() { return Preferences.SERVER.protocol; }, set adapter(val:string) {Preferences.SERVER.protocol = val}, skip_setup: true },
    ropts: {
      get adapter() {return Preferences.SERVER.opts.adapter; },
      set adapter(value:string) {Preferences.SERVER.opts.adapter = value;},
      skip_setup: true,
      auth: {
        username: '',
        password: '',
      }
      // ,
      // ajax: {
      //   headers: {
      //     Authorization: '',
      //   },
      //   withCredentials: true,
      // },
    },
    cropts: {
      get adapter() { return Preferences.SERVER.opts.adapter; },
      set adapter(value: string) { Preferences.SERVER.opts.adapter = value; },
    },
    repopts: { live: false, retry: false, continuous: false },
    // ajaxOpts: { withCredentials: true, headers: { Authorization: '' } },
    ajaxOpts: {},
    remoteDBInfo: {},
    rdbServer: {
      get protocol() { return Preferences.SERVER.opts.adapter; },
      set protocol(value: string) { Preferences.SERVER.opts.adapter = value; },
      get server() { return Preferences.SERVER.server;},
      set server(value:string) { Preferences.SERVER.server = value;},
      // get opts() { return Preferences.SERVER.ropts;},
      // set opts(value:any) { Preferences.SERVER.ropts = value;},
    }
  };
  // public get DB() { return Preferences.DB; };
  // public set DB(value:any) { Preferences.DB = value;};
  // public get SERVER() { return Preferences.SERVER;};
  // // public set SERVER(value:any) { Preferences.SERVER = value;};
  // public get USER() { return Preferences.USER;};
  // public set USER(value:any) { Preferences.USER = value;};
  // public get DEVELOPER() { return Preferences.DEVELOPER;};
  // public set DEVELOPER(value:any) { Preferences.DEVELOPER = value;};
  // public get CONSOLE() { return Preferences.CONSOLE; };
  // public set CONSOLE(value:any) { Preferences.CONSOLE = value; };
  constructor() {
    window["onsiteprefs"] = this;
    window["onsitedebug"] = window["onsitedebug"] || [];
    window["onsitedebug"]["Preferences"] = Preferences;
    this.initializePrefs();
  }

  public getPreferencesVersion():number {
    let version:number = Preferences && Preferences.USER && typeof Preferences.USER.preferencesVersion === 'number' ? Preferences.USER.preferencesVersion : -1;
    return version;
  }

  public getRemotePort():number {
    let port:number = Preferences && Preferences.SERVER && Preferences.SERVER.port != undefined ? Preferences.SERVER.port : 443;
    return Number(port);
  }

  public getHowlerPort():number {
    let port:number = Preferences && Preferences.SERVER && Preferences.SERVER.howlerPort != undefined ? Preferences.SERVER.howlerPort : 3000;
    return Number(port);
  }


  /**
   * Returns remote host name, no protocol or port (e.g. 'my.server.com')
   *
   * @returns {string} Host name of CouchDB Server
   * @memberof Preferences
   */
  public getServerHost():string {
    // let protocol = this.SERVER.protocol ;
    let server:string = this.SERVER.server   ;
    return server;
  }

  /**
   * Returns base URL, no port included (e.g. 'https://my.server.com')
   *
   * @returns {string} Base URL of CouchDB Server
   * @memberof Preferences
   */
  public getServerBaseURL():string {
    let protocol:string = this.SERVER.protocol ;
    let server:string   = this.getServerHost() ;
      return `${protocol}://${server}`;
  }

  /**
   * Returns couchdb-howler URL (e.g. 'https://my-howler.server.com:3000')
   *
   * @returns {string} URL for couchdb-howler server
   * @memberof Preferences
   */
  public getHowlerURL():string {
    let baseURL:string = this.getServerBaseURL();
    let port:number = this.getHowlerPort();
    let url:string = `${baseURL}:${port}`;
    return url;
  }

  // public getRemoteDBURL(dbtype:string):string {
  //   let S = Preferences.SERVER;
  //   let D = Preferences.DB;
  //   let types = Object.keys(D);
  //   if(types.indexOf(dbtype) > -1) {
  //     let dbname = D[dbtype];
  //     let url = `${S.protocol}://${S.server}:${S.port}/${dbname}`;
  //     return url;
  //   } else {
  //     Log.w(`getRemoteDBURL(): Could not find database type '${dbtype}'!`);
  //     return null;
  //   }
  // }

  // public getDBURL(dbname:string):string {
  //   let S = Preferences.SERVER;
  //   let D = Preferences.DB;
  //   let url = `${S.protocol}://${S.server}:${S.port}/${dbname}`;
  //   return url;
  // }


  public static getKeys():string[] {
    let keys:string[] = [
      'DB',
      'CONSOLE',
      'USER',
      'CAMERA',
      'DEVELOPER',
      'SERVER',
    ];
    return keys;
  }

  public getKeys():string[] {
    return Preferences.getKeys();
  }

  public static initializePrefs():any {
    Preferences.DB = {
      'reports'       : reports       ,
      'reports_other' : reports_other ,
      'employees'     : employees     ,
      'config'        : config        ,
      'jobsites'      : jobsites      ,
      'scheduling'    : scheduling    ,
      'invoices'      : invoices      ,
      'invoices_be'   : invoices_be   ,
      'invoices_hb'   : invoices_hb   ,
      'invoices_kn'   : invoices_kn   ,
      'technicians'   : technicians   ,
      'messages'      : messages      ,
      'comments'      : comments      ,
      'phoneInfo'     : phoneInfo     ,
      'sounds'        : sounds        ,
      'login'         : login         ,
      // 'geolocation'   : geolocation   ,
      'preauths'      : preauths      ,
      'worksites'     : worksites     ,
      'timesheets'    : timesheets    ,
      'logistics'     : logistics     ,
      'timecards'     : timecards     ,
      'drivings'      : drivings      ,
      'maintenances'  : maintenances  ,
      'preferences'   : preferences   ,
      'translations'  : translations  ,
      'locations'     : locations     ,
      'reports_old01' : reports_old01 ,
      'reports_old02' : reports_old02 ,
      'reports_old'   : reports_old   ,
    };
    Preferences.SERVER = {
      localAdapter: adapter,
      server: server,
      port: port,
      protocol: protocol,
      database: login,
      opts: { auto_compaction: true, get adapter():string { return Preferences.SERVER.protocol; }, set adapter(val:string) {Preferences.SERVER.protocol = val;}, skip_setup: true },
      // ropts: {
      //   get adapter() {return Preferences.SERVER.opts.adapter; },
      //   set adapter(value:string) {Preferences.SERVER.opts.adapter = value;},
      //   skip_setup: true
      // },
      // ropts: {
      //   get adapter() {return Preferences.SERVER.opts.adapter; },
      //   set adapter(value:string) {Preferences.SERVER.opts.adapter = value;},
      //   skip_setup: true,
      //   auth: {
      //     username: '',
      //     password: '',
      //   },
      //   ajax: {
      //     headers: {
      //       Authorization: '',
      //     },
      //     withCredentials: true,
      //   },
      // },
      ropts: {
        skip_setup: true,
        auth: {
          username: '',
          password: '',
        },
      },
      cropts: {
        get adapter() { return Preferences.SERVER.opts.adapter; },
        set adapter(value: string) { Preferences.SERVER.opts.adapter = value; },
      },
      repopts: { live: false, retry: false, continuous: false, complete: false },
      ajaxOpts: { headers: { Authorization: '' } },
      remoteDBInfo: {},
      rdbServer: {
        get protocol() { return Preferences.SERVER.opts.adapter; },
        set protocol(value: string) { Preferences.SERVER.opts.adapter = value; },
        get server() { return Preferences.SERVER.server;},
        set server(value:string) { Preferences.SERVER.server = value;},
        get opts() { return Preferences.SERVER.ropts;},
        set opts(value:any) { Preferences.SERVER.ropts = value;},
      }
    };
    Preferences.USER = {
      preferencesVersion: version,
      language: 'en',
      shifts: 7,
      gpsTimeout: 5000,
      showTimeCardsInHistory: false,
      payroll_periods: 2,
      audio: false,
      stayInReports: false,
      spinnerSpeed: 10,
      messageCheckInterval: 15,
      time24Hour: false,
      dateTimeCustom: false,
      timeFormat: "HH:mm",
      timeFormat12: "h:mm A",
      timeFormat24: "HH:mm",
      dateFormatLong: "YYYY-MM-DD",
      dateFormatShort: "MMM D",
      timeFormatShort: "HH:mm",
      timeFormatShort12: "h:mm A",
      timeFormatShort24: "HH:mm",
      timeFormatLong: "HH:mm:ss",
      timeFormatLong12: "h:mm:ss A",
      timeFormatLong24: "HH:mm:ss",
      userDateFormatLong: "YYYY-MM-DD",
      userDateFormatShort: "MMM D",
      userTimeFormat: "",
      userTimeFormatLong: "HH:mm:ss",
      userTimeFormatShort: "HH:mm",
      lastReportType: "",
      showReportTypeIcons: true,
      showReportDates: false,
      showReportTimes: false,
      showOfficeReportTimes: true,
      debounceTime: 1500,
      vibration: true,
      readMessageList: [],
      minAutosizeRows: 1,
      maxAutosizeRows: 10,
    };
    Preferences.CAMERA = {
      quality            : 50   ,
      destinationType    : 2    ,
      encodingType       : 0    ,
      mediaType          : 0    ,
      correctOrientation : true ,
    };
    Preferences.CONSOLE = {
      global: {
        payroll_periods: 4,
        loadEmployees: true,
        loadSites: true,
        loadReports: false,
        loadMiscReports: false,
        loadOldReports: false,
        weekStartDay: 3,
      },
      employeeView: {
        showAllSites: false,
      },
      scheduling: {
        persistTechChanges: false,
        showAllSites: true,
        showOffice: false,
        showTestSites: false,
        allDatesAvailable: false,
        lastScheduleUsed: "",
      },
      payroll: {
        payroll_periods: 4,
        showColors: true,
        showShiftLength: true,
        showAlerts: false,
        exportUseQuickbooksName: true,
        minHoursWhenOn: 20,
        maxHoursWhenOff: 15,
      },
      techshiftreports: {
        showAllSites: false,
        showAllTechs: false,
        payroll_periods: 4,
      },
      hbpreauth: {
        showAllSites: false,
        payroll_periods: 4,
      },
      jobsites: {
        autoLayoutTable: false,
        tableResizeMode: 'fit',
      },
      techphones: {
        autoLayoutTable: false,
        tableResizeMode: 'fit',
      },
      pages: {
        reports: 100,
        reports_other: 100,
        employees: 200,
        jobsites: 50,
        techphones: 100,
      },
      pageSizes: {
        reports: [50,100,200,500,1000,2000],
        reports_other: [50,100,200,500,1000,2000],
        employees: [30,50,100,150,200,250,300,400,500],
        jobsites: [5,10,20,30,40,50,100],
        techphones: [50,100,200,500,1000],
      },
    };
    Preferences.DEVELOPER = {
      showDocID: false,
      showDocRev: false,
      showReportTimes: false,
      showReportSite: false,
    };
    let defaultPreferences:PreferencesDoc = {
      DB: oo.clone(Preferences.DB),
      CONSOLE: oo.clone(Preferences.CONSOLE),
      USER: oo.clone(Preferences.USER),
      CAMERA: oo.clone(Preferences.CAMERA),
      DEVELOPER: oo.clone(Preferences.DEVELOPER),
      SERVER: oo.clone(Preferences.SERVER),
    };
    this.defaultPrefs = defaultPreferences;
    return defaultPreferences;
  }

  public initializePrefs():PreferencesDoc {
    return Preferences.initializePrefs();
  }

  public static getDefaultPrefs():PreferencesDoc {
    return Preferences.defaultPrefs;
  }

  public getDefaultPrefs():PreferencesDoc {
    return Preferences.defaultPrefs;
  }

  public static getRemoteURL():string {
    let prot = Preferences.getProtocol();
    let host = Preferences.getHostname();
    let portnum = Preferences.getPort();
    let out:string = "";
    out += `${prot}://${host}`;
    // tslint:disable-next-line: triple-equals
    if(!((prot === 'http' && portnum == 80) || (prot === 'https' && portnum == 443))) {
      out += `:${portnum}`;
    }
    return out;
  }

  public getRemoteURL():string {
    return Preferences.getRemoteURL();
  }

  public static getRemoteDBURL(dbtype:string):string {
    // let S = Preferences.SERVER;
    let dbname:string = Preferences.getDB(dbtype);
    let url = Preferences.getRemoteURL();
    if(dbname) {
      url += `/${dbname}`;
      // let url:string = `${S.protocol}://${S.server}:${S.port}/${dbname}`;
      return url;
    } else {
      Log.w(`Preferences.getRemoteDBURL(): Could not find database type '${dbtype}'!`);
      return null;
    }
  }

  public getRemoteDBURL(dbtype:string):string {
    return Preferences.getRemoteDBURL(dbtype);
  }

  public static getRemoteDBNameURL(dbname:string):string {
    // let S = Preferences.SERVER;
    let url = Preferences.getRemoteURL();
    // let D = Preferences.DB;
    // let dbname:string = Preferences.getDB(dbtype);
    if(dbname) {
      // let url:string = `${S.protocol}://${S.server}:${S.port}/${dbname}`;
      url += `/${dbname}`;
      return url;
    } else {
      Log.w(`getRemoteDBNameURL(): Could not find database name '${dbname}'!`);
      return null;
    }
  }

  public getRemoteDBNameURL(dbname:string):string {
    return Preferences.getRemoteDBNameURL(dbname);
  }

  public static getDBURL(dbname:string):string {
    // let S = Preferences.SERVER;
    // let D = Preferences.DB;
    // let url = `${S.protocol}://${S.server}:${S.port}/${dbname}`;
    let url = "";
    url += Preferences.getRemoteURL();
    if(dbname) {
      url += `/${dbname}`;
    }
    return url;
  }

  public getDBURL(dbname:string):string {
    return Preferences.getDBURL(dbname);
  }

  public static getProtocol():ProtocolType {
    return Preferences.SERVER.protocol;
  }

  public getProtocol():ProtocolType {
    return Preferences.getProtocol();
  }

  public static getHostname():string {
    return Preferences.SERVER.server;
  }

  public getHostname():string {
    return Preferences.getHostname();
  }

  public static getPort():number {
    return Preferences.SERVER.port;
  }

  public getPort():number {
    return Preferences.getPort();
  }

  public static getLoginDatabase():string {
    return Preferences.SERVER.database;
  }

  public getLoginDatabase():string {
    return Preferences.getLoginDatabase();
  }

  public setProtocol(prot:string) {
    Preferences.SERVER.protocol = prot;
    return Preferences.SERVER.protocol;
  }

  public setHostname(host:string) {
    Preferences.SERVER.server = host;
    return Preferences.SERVER.server;
  }

  public setPort(portnumber:number) {
    Preferences.SERVER.port = portnumber;
    return Preferences.SERVER.port;
  }

  public setLoginDatabase(database:string) {
    Preferences.SERVER.database = database;
    return Preferences.SERVER.database;
  }



  public getLocalAdapter():string {
    return Preferences.SERVER.localAdapter;
  }

  public static getConsole():any {
    return Preferences.CONSOLE;
  }

  public getConsole():any {
    return Preferences.getConsole();
  }

  public getPrefs():PreferencesDoc {
    return Preferences.getPrefs();
  }

  public getScripts():any {
    return Preferences.CONSOLE.scripts;
  }

  public getScriptURL(key:string):string {
    if(Preferences.CONSOLE && Preferences.CONSOLE.scripts && Preferences.CONSOLE.scripts[key]) {
      return Preferences.CONSOLE.scripts[key];
    } else {
      Log.w(`getScriptURL(): Could not find script URL for key '${key}'`);
      return "";
    }
  }

  public static getAppURL():string {
    let fullURL:string = typeof window === 'object' && window.location && window.location.href ? window.location.href : "";
    if(fullURL) {
      let parsed:string[] = fullURL.split("#");
      let baseURL:string = parsed[0];
      return baseURL;
    } else {
      let text:string = `Preferences.getAppURL(): Could not find window.location.href to parse`;
      let err:Error = new Error(text);
      throw err;
    }
  }

  public getAppURL():string {
    return Preferences.getAppURL();
  }

  public getDBKeys(onlySyncableDatabases?:boolean):Array<string> {
    return Preferences.getDBKeys(onlySyncableDatabases);
  }

  public getDB(key?:string):string {
    return Preferences.getDB(key);
  }

  public getKeyFromDB(dbname:string):string {
    let DB:any = Preferences.getDBRecords();
    let keys:string[] = Object.keys(DB);
    let out:string;
    if(typeof dbname !== 'string') {
      throw new Error(`Preferences.getKeyFromDB(): parameter must be a string that is a PouchDB database name`);
    }
    let dbname1:string = dbname.toLowerCase();
    for(let key of keys) {
      let dbname2:string = DB[key];
      if(dbname1 === dbname2) {
        out = key;
      }
    }
    if(out) {
      return out;
    } else {
      Log.w(`Preferences.getKeyFromDB(): Key not found for database named '${dbname}'`);
      return null;
    }
  }

  public getServer():any {
    return Preferences.getServer();
  }

  public getUserPrefs():any {
    return Preferences.USER;
  }

  public setPrefs(value:any):any {
    return Preferences.setPrefs(value);
  }

  public setDB(key:string, value:any):any {
    return Preferences.setDB(key, value);
  }

  public setServer(key:string, value:any):any {
    return Preferences.setServer(key, value);
  }

  public setUserPref(key:string, value:any):any {
    return Preferences.setUserPref(key, value);
  }

  public setUserPrefs(value:any):any {
    return Preferences.setUserPrefs(value);
  }

  public static setUsername(username:string):string {
    let auth:{username:string,password:string};
    if(Preferences.SERVER && Preferences.SERVER.ropts && typeof Preferences.SERVER.ropts.auth === 'object') {
      auth = Preferences.SERVER.ropts.auth;
    } else {
      Preferences.SERVER.ropts = Preferences.SERVER.ropts || {};
      Preferences.SERVER.ropts.auth = Preferences.SERVER.ropts.auth || {username: '', password: ''};
      auth = Preferences.SERVER.ropts.auth;
    }
    auth.username = username;
    return Preferences.SERVER.ropts.auth.username;
  }

  public static setPassword(password:string):string {
    let auth:{username:string,password:string};
    if(Preferences.SERVER && Preferences.SERVER.ropts && typeof Preferences.SERVER.ropts.auth === 'object') {
      auth = Preferences.SERVER.ropts.auth;
    } else {
      Preferences.SERVER.ropts = Preferences.SERVER.ropts || {};
      Preferences.SERVER.ropts.auth = Preferences.SERVER.ropts.auth || {username: '', password: ''};
      auth = Preferences.SERVER.ropts.auth;
    }
    auth.password = password;
    return Preferences.SERVER.ropts.auth.password;
  }

  public setUsername(username:string):string {
    return Preferences.setUsername(username);
  }

  public setPassword(password:string):string {
    return Preferences.setPassword(password);
  }

  public static setAuth(username:string, password:string):any {
    Preferences.setUsername(username);
    Preferences.setPassword(password);
    // Preferences.SERVER.ropts.auth.username = username;
    // Preferences.SERVER.ropts.auth.password = password;
    // let authString:string = username + ":" + password;
    // let b64AuthString:string = window.btoa(authString);
    // Preferences.SERVER.ropts.ajax.headers.Authorization = `Basic ${b64AuthString}`
    // Preferences.SERVER.ropts.ajax.withCredentials = true;
    return Preferences.SERVER.ropts.auth;
  }

  public setAuth(username:string, password:string):any {
    return Preferences.setAuth(username, password);
  }

  public static getAuth():{username:string,password:string} {
    let auth:{username:string,password:string} = Preferences.SERVER && Preferences.SERVER.ropts && Preferences.SERVER.ropts.auth && typeof Preferences.SERVER.ropts.auth.username === 'string' ? Preferences.SERVER.ropts.auth : {username: '', password: ''};
    return auth;
  }

  public getAuth():{username:string,password:string} {
    return Preferences.getAuth();
  }

  public static getAuthString():string {
    let auth:any = Preferences.getAuth();
    if(auth.username && auth.password) {
      let authString:string = auth.username + ":" + auth.password;
      let b64AuthString:string = window.btoa(authString);
      let token:string = `Basic ${b64AuthString}`;
      return token;
    } else {
      return '';
    }
  }

  public getAuthString():string {
    return Preferences.getAuthString();
  }

  public static getRemoteOptions():any {
    return Preferences.SERVER.ropts;
  }

  public getRemoteOptions():any {
    return Preferences.getRemoteOptions();
  }

  public static getPrefs():PreferencesDoc {
    return { DB: Preferences.DB, CAMERA: Preferences.CAMERA, SERVER: Preferences.SERVER, USER: Preferences.USER, DEVELOPER: Preferences.DEVELOPER, CONSOLE: Preferences.CONSOLE };
  }

  public static getDBKeys(onlySyncableDatabases?:boolean):Array<string> {
    let out:string[] = [];
    let keys1 = Object.keys(Preferences.DB);
    for(let prefsKey of keys1) {
      if(!Array.isArray(prefsKey)) {
        /* This key is a string, so push it to the output array of strings */
        if(onlySyncableDatabases) {
          if(prefsKey !== 'login' && prefsKey !== 'reports_old' && prefsKey !== '_session') {
            out.push(prefsKey)
          }
        } else {
          out.push(prefsKey);
        }
      } else {
        /* This key is actually an array, so break its keys up and push them individually */
        for(let key of prefsKey) {
          out.push(key);
        }
      }
    }
    return out;
  }

  public static getDBRecords():any {
    return Preferences.DB;
  }

  public getDBRecords():any {
    return Preferences.getDBRecords();
  }

  public static getSyncableDBKeys():Array<string> {
    return Preferences.getDBKeys(true);
  }

  public getSyncableDBKeys():Array<string> {
    return Preferences.getSyncableDBKeys();
  }

  public static getSyncableDBList():Array<string> {
    let keys:string[] = Preferences.getDBKeys(true);
    let out:string[] = [];
    let DB = Preferences.getDBRecords();
    for(let key of keys) {
      let dbname:string = "";
      if(DB[key] !== undefined) {
        out.push(DB[key]);
      }
    }
    return out;
  }

  public getSyncableDBList():Array<string> {
    return Preferences.getSyncableDBList();
  }

  public static getDB(dbkeys?:string|string[], onlySyncableDatabases?:boolean):string {
    let keys = Preferences.getDBKeys();
    let out:string[] = [];
    let DB = Preferences.getDBRecords();
    if(Array.isArray(dbkeys)) {
      Log.w(`Preferences.getDB(): No longer allowed to specify an array of strings as parameter 1:`, dbkeys);
      return null;
    }
    if(typeof dbkeys === 'string') {
      if(DB[dbkeys] != undefined && dbkeys !== 'reports_old') {
        return DB[dbkeys];
      } else {
        return null;
      }
    }

    // public static getDB(dbkeys?:string|Array<string>, onlySyncableDatabases?:boolean):string|string[] {
  //   let keys:string[] = Preferences.getDBKeys();
  //   let out:string[] = [];
  //   let DB:any = Preferences.getDBRecords();
  //   if(typeof dbkeys === 'string') {
  //     if(DB[dbkeys] != undefined) {
  //       return DB[dbkeys];
  //     } else {
  //       return null;
  //     }
  //   } else if(Array.isArray(dbkeys) && dbkeys.length) {
  //     // for(let dbKey of keys) {
  //     //   for(let newKey of dbkeys) {
  //     //     out.push(newKey);
  //     //   }
  //     // }
  //     for(let key of dbkeys) {
  //       if(key && typeof key === 'string') {
  //         let dbname:string = DB[key];
  //         if(dbname) {
  //           out.push(dbname);
  //         }
  //       }
  //     }
  //     if(out.length) {
  //       return out;
  //     }
  //     return null;
  //   } else {
  //     return DB;
  //   }
  //   //     if(DB[key] !== undefined) {
  //   //       let dbname = Preferences.DB[key];
  //   //       out.push(dbname);
  //   //       return dbname;
  //   //     } else {
  //   //       Log.w(`Preferences.getDB('${key}'): No such key in Preferences.DB list:\n`, Preferences.DB);
  //   //       return null;
  //   //     }
  //   //   } else {
  //   //     Log.w(`Preferences.getDB('${key}'): Can't even figure out the type of key that is key:\n`, key);
  //   //     out.push(String(key));
  //   //   }
  //   //   return out;
  //   // } else {
  //   //   return this.;
  //   // }
  }

  public static getServer():any {
    return Preferences.SERVER;
  }

  public static getUserPrefs():any {
    return Preferences.USER;
  }

  public static getConsolePrefs():any {
    return Preferences.CONSOLE;
  }

  public getConsolePrefs():any {
    return Preferences.getConsolePrefs();
  }

  public static setPrefs(value: any):any {
    for (let key of Object.keys(value)) {
      for (let key2 of Object.keys(value[key])) {
        if (Preferences[key] !== undefined && Preferences[key][key2] !== undefined) {
          Preferences[key][key2] = value[key][key2];
        }
      }
    }
    // Preferences.DB = value.DB;
    // Preferences.SERVER = value.SERVER;
    // Preferences.USER = value.USER;
    return Preferences;
  }

  public static setDB(key:string, value:any):any {
    if (Preferences.DB[key] !== undefined) {
      Preferences.DB[key] = value;
    }
    return Preferences.DB;
  }

  public static setServer(key:string, value:any):any {
    if (Preferences.SERVER[key] !== undefined) {
      Preferences.SERVER[key] = value;
    }
    return Preferences.SERVER;
  }

  public static setUserPref(key:string, value:any):any {
    Preferences.USER[key] = value;
    return Preferences.USER;
  }

  public static setUserPrefs(value:any):any {
    Preferences.USER = value;
    return Preferences.USER;
  }

  public static getReportLoadCount():number {
    if(Preferences && Preferences.CONSOLE && Preferences.CONSOLE.global && typeof Preferences.CONSOLE.global.reportsToLoad === 'number') {
      return Preferences.CONSOLE.global.reportsToLoad;
    }
  }

  public getReportLoadCount():number {
    return Preferences.getReportLoadCount();
  }

  public static mergeNewPrefKeys(userPrefs:any) {
    let newPrefs = oo.clone(Preferences.getPrefs());
    let oldPrefs = oo.clone(userPrefs);
    Log.l("mergeNewPrefKeys(): Now attempting to merge new preferences with old preferences:\n", newPrefs);
    Log.l(oldPrefs);
    let patchDoc = ooPatch.diff(oldPrefs, newPrefs);
    let newPatchDoc = [];
    for(let patch of patchDoc) {
      if(patch['op'] === 'add') {
        newPatchDoc.push(patch);
      }
    }
    Log.l("mergeNewPrefKeys(): Differences are:\n");
    Log.t(newPatchDoc);
    if(ooPatch.valid(newPatchDoc)) {
      let applyResult = ooPatch.apply(oldPrefs, newPatchDoc, {reversible: true});
      let updatedPrefs = applyResult.doc;
      if(oo.valid(updatedPrefs)) {
        Preferences.setPrefs(updatedPrefs);
      } else {
        Log.w(`Preferences.mergeNewPrefKeys(): keys not merged, merge created invalid JSON:\n`, updatedPrefs);
      }
    } else {
      Log.w(`Preferences.mergeNewPrefKeys(): keys not merged, patch created was invalid:\n`, newPatchDoc);
    }
  }

  public mergeNewPrefKeys(userPrefs:any) {
    return Preferences.mergeNewPrefKeys(userPrefs);
  }

  public static comparePrefs(userPrefs:any):any {
    let prefs = Preferences.getPrefs();
    let version = prefs.USER.preferencesVersion;
    let newVersion = 0;
    if (userPrefs['USER'] !== undefined && userPrefs['USER']['preferencesVersion'] !== undefined) {
      newVersion = userPrefs.USER.preferencesVersion;
    }
    // if (newVersion >= version) {
      // Preferences.setPrefs(userPrefs);
      Preferences.mergeNewPrefKeys(userPrefs);
    // }
    let updatedPrefs = Preferences.getPrefs();
    return updatedPrefs;
  }

  public comparePrefs(userPrefs:any):any {
    return Preferences.comparePrefs(userPrefs);
  }

  public getLanguage():string {
    return this.USER.language;
  }

  public setLanguage(value:boolean):string {
    this.USER.language = value;
    return this.USER.language;
  }

  public getPayrollPeriodCount():number {
    return this.getConsolePayrollPeriodCount();
  }

  public setPayrollPeriodCount(value:number):number {
    return this.setConsolePayrollPeriodCount(value);
  }

  public getConsolePayrollPeriodCount():number {
    return this.CONSOLE.global.payroll_periods;
  }

  public setConsolePayrollPeriodCount(value:number):number {
    this.CONSOLE.global.payroll_periods = value;
    return this.CONSOLE.global.payroll_periods;
  }

  public getUserPayrollPeriodCount():number {
    return this.USER.payroll_periods;
  }

  public setUserPayrollPeriodCount(value:number):number {
    this.USER.payroll_periods = value;
    return this.USER.payroll_periods;
  }

  public getMessageCheckInterval():number {
    return this.USER.messageCheckInterval;
  }

  public setMessageCheckInterval(value:number):number {
    let val = Number(value);
    this.USER.messageCheckInterval = val;
    return this.USER.messageCheckInterval;
  }

  public getStayInReports():boolean {
    return this.DEVELOPER.stayInReports;
  }

  public setStayInReports(value:boolean):boolean {
    this.USER.stayInReports = value;
    return this.DEVELOPER.stayInReports;
  }

  public getShowID():boolean {
    return this.DEVELOPER.showDocID;
  }

  public getShowRev():boolean {
    return this.DEVELOPER.showDocRev;
  }

  public getShowTimes():boolean {
    return this.DEVELOPER.showReportTimes;
  }

  public setShowID(value:boolean):boolean {
    this.DEVELOPER.showDocID = value;
    return this.DEVELOPER.showDocID;
  }

  public setShowRev(value:boolean):boolean {
    this.DEVELOPER.showDocRev = value;
    return this.DEVELOPER.showDocRev;
  }

  public setShowTimes(value:boolean):boolean {
    this.DEVELOPER.showReportTimes = value;
    return this.DEVELOPER.showReportTimes;
  }

  public getShowSite():boolean {
    return this.DEVELOPER.showReportSite;
  }

  public setShowSite(value:boolean):boolean {
    this.DEVELOPER.showReportSite = value;
    return this.DEVELOPER.showReportSite;
  }

  public static getOldReportsKeys():string[] {
    if(Array.isArray(Preferences.DB.reports_old)) {
      return Preferences.DB.reports_old;
    } else {
      return [Preferences.DB.reports_old];
    }
  }

  public static getOldReportsDBList():string[] {
    let out:string[] = [];
    let keys = Preferences.getOldReportsKeys();
    for(let key of Preferences.DB.reports_old) {
      let oneKey = Preferences.DB[key];
      out.push(oneKey);
    }
    return out;
  }

  public getOldReportsKeys():string[] {
    return Preferences.getOldReportsKeys();
  }

  public getOldReportsDBList():string[] {
    return Preferences.getOldReportsDBList();
  }

  public getStartupPage():string {
    let out:string = '';
    if(this.CONSOLE.global.goToLastPage && this.CONSOLE.global.lastPage) {
      out = this.CONSOLE.global.lastPage;
    }
    return out;
  }

  public isAudioEnabled():boolean {
    if(Preferences && Preferences.USER && Preferences.USER.audio === true) {
      return true;
    } else {
      return false;
    }
  }

  public saveMovedTechs():boolean {
    if(Preferences && Preferences.CONSOLE && Preferences.CONSOLE.scheduling && Preferences.CONSOLE.scheduling.persistTechChanges) {
      return true;
    }
    return false;
  }
  
  public static is24Hour():boolean {
    if(Preferences && Preferences.CONSOLE && Preferences.CONSOLE.global && Preferences.CONSOLE.global.timeFormat24) {
      return true;
    }
    return false;
  }

  public is24Hour():boolean {
    return Preferences.is24Hour();
  }

  public getDateFormat(type?:string):string {
    let format:string = Preferences.CONSOLE.global.dateFormatShort || "MMM DD";
    if(Preferences && Preferences.CONSOLE && Preferences.CONSOLE.global && Preferences.CONSOLE.global) {
      if(type === 'sort') {
        format = "YYYY-MM-DD";
      } else if(type === 'med') {
        format = Preferences.CONSOLE.global.dateFormatMed || "DD MM YYYY";
      } else if(type === 'long' || type === 'verylong') {
        format = Preferences.CONSOLE.global.dateFormatLong || "ddd DD MM YYYY";
      }
    }
    return format;
  }

  public getDateFormatShort():string {
    return this.getDateFormat('short');
  }

  public getDateFormatMed():string {
    return this.getDateFormat('med');
  }

  public getDateFormatLong():string {
    return this.getDateFormat('long');
  }

  public getDateFormatSort():string {
    return this.getDateFormat('sort');
  }

  public getTimeFormat(type?:string):string {
    let format:string = Preferences.CONSOLE.global.timeFormat || "hh:mm A";
    if(type === 'long' || type === 'sort') {
      format = "hh:mm:ss A";
    } else if(type === 'verylong') {
      format = "hh:mm:ss.SSS A";
    }
    if(Preferences && Preferences.CONSOLE && Preferences.CONSOLE.global && Preferences.CONSOLE.global) {
      if(Preferences.is24Hour() || type === 'sort') {
        format = format.replace("hh", "HH").replace(" A", "");
      }
    }
    return format;
  }

  public getDateTimeFormat(type?:string):string {
    let dateFormat:string = this.getDateFormat(type);
    let timeFormat:string = this.getTimeFormat(type);
    let format:string = dateFormat + " " + timeFormat;
    return format;
  }

  public getPastScheduleWeeksCount():number {
    let count = 12;
    if(this.CONSOLE && this.CONSOLE.scheduling && typeof this.CONSOLE.scheduling.pastSchedulesToLoad === 'number') {
      count = this.CONSOLE.scheduling.pastSchedulesToLoad;
    }
    return count;
  }

  // public reinitializePrefs():any {
  //   Preferences.DB = {
  //     'reports'           : reports           ,
  //     'reports_other'     : reports_other     ,
  //     'logistics'         : logistics         ,
  //     'employees'         : employees         ,
  //     'config'            : config            ,
  //     'jobsites'          : jobsites          ,
  //     'scheduling'        : scheduling        ,
  //     'invoices'          : invoices          ,
  //     'invoices_be'       : invoices_be       ,
  //     'invoices_hb'       : invoices_hb       ,
  //     'invoices_kn'       : invoices_kn       ,
  //     'technicians'       : technicians       ,
  //     'messages'          : messages          ,
  //     'comments'          : comments          ,
  //     'phoneInfo'         : phoneInfo         ,
  //     'sounds'            : sounds            ,
  //     'login'             : login             ,
  //     'geolocation'       : geolocation       ,
  //     'preauths'          : preauths          ,
  //     'worksites'         : worksites         ,
  //     'timecards'         : timecards         ,
  //     'timesheets'        : timesheets        ,
  //     'reports_old01'     : reports_old01     ,
  //     'reports_old02'     : reports_old02     ,
  //     'reports_old'       : reports_old       ,
  //   };
  //   Preferences.SERVER = {
  //     localAdapter: adapter,
  //     server: server,
  //     port: port,
  //     protocol: protocol,
  //     howerPort: howlerPort,
  //     replicationBatchSize: 200,
  //     opts: { auto_compaction: true, get adapter() { return Preferences.SERVER.protocol; }, set adapter(val:string) {Preferences.SERVER.protocol = val}, skip_setup: true },
  //     ropts: {
  //       get adapter() {return Preferences.SERVER.opts.adapter; },
  //       set adapter(value:string) {Preferences.SERVER.opts.adapter = value;},
  //       skip_setup: true
  //     },
  //     cropts: {
  //       get adapter() { return Preferences.SERVER.opts.adapter; },
  //       set adapter(value: string) { Preferences.SERVER.opts.adapter = value; },
  //     },
  //     repopts: { live: false, retry: false, continuous: false },
  //     // ajaxOpts: { headers: { Authorization: '' } },
  //     ajaxOpts: {},
  //     remoteDBInfo: {},
  //     rdbServer: {
  //       get protocol() { return Preferences.SERVER.opts.adapter; },
  //       set protocol(value: string) { Preferences.SERVER.opts.adapter = value; },
  //       get server() { return Preferences.SERVER.server;},
  //       set server(value:string) { Preferences.SERVER.server = value;},
  //       // get opts() { return Preferences.SERVER.ropts;},
  //       // set opts(value:any) { Preferences.SERVER.ropts = value;},
  //     }
  //   };
  //   Preferences.USER = {
  //     preferencesVersion: version,
  //     language: 'en',
  //     shifts: 7,
  //     payroll_periods: 2,
  //     audio: false,
  //     stayInReports: false,
  //     spinnerSpeed: 10,
  //     messageCheckInterval: 15,
  //   };
  //   Preferences.CONSOLE = {
  //     scripts: {
  //       maps         : `https://maps.google.com/maps/api/js?key=${gmkey}` ,
  //       charts       : "https://www.gstatic.com/charts/loader.js"         ,
  //       quill        : "build/quill.js"                                   ,
  //       fullcalendar : "build/fullcalendar.min.js"                        ,
  //     },
  //     global: {
  //       payroll_periods: 4,
  //       loadEmployees: true,
  //       loadSites: true,
  //       loadReports: false,
  //       loadMiscReports: false,
  //       loadOldReports: false,
  //       weekStartDay: 3,
  //       reportsToLoad: 20000,
  //       goToLastPage: true,
  //       lastPage: '',
  //       timeFormat24: false,
  //       timeFormat: "hh:mm A",
  //       dateFormatShort: "MMM DD",
  //       dateFormatMed: "DD MMM YYYY",
  //       dateFormatLong: "ddd DD MMM YYYY",
  //       dateFormatSort: "YYYY-MM-DD",
  //       dateTimeFormat: "YYYY-MM-DD HH:mm",
  //     },
  //     employeeView: {
  //       showAllSites: false,
  //     },
  //     scheduling: {
  //       persistTechChanges: false,
  //       showAllSites: true,
  //       showOffice: false,
  //       showTestSites: false,
  //       allDatesAvailable: false,
  //       lastScheduleUsed: "",
  //       showUnassigned: true,
  //       showLegrave: true,
  //       showEmptyClients: true,
  //       showNonSESA: false,
  //       },
  //     payroll: {
  //       payroll_periods: 4,
  //       showColors: true,
  //       showShiftLength: true,
  //       showAlerts: false,
  //       exportUseQuickbooksName: true,
  //       minHoursWhenOn: 20,
  //       maxHoursWhenOff: 15,
  //       showLineNumbers: false,
  //       showExTechs: false,
  //       showUnassignedTechs: true,
  //     },
  //     techshiftreports: {
  //       showAllSites: false,
  //       showAllTechs: false,
  //       payroll_periods: 4,
  //     },
  //     hbpreauth: {
  //       showAllSites: false,
  //       payroll_periods: 4,
  //     },
  //     jobsites: {
  //       autoLayoutTable: false,
  //       tableResizeMode: 'fit',
  //       showAllSites: true,
  //       colorSitesByStatus: true,
  //     },
  //     techphones: {
  //       autoLayoutTable: false,
  //       tableResizeMode: 'fit',
  //     },
  //     pages: {
  //       reports: 100,
  //       reports_other: 100,
  //       employees: 200,
  //       jobsites: 50,
  //       techphones: 100,
  //     },
  //     pageSizes: {
  //       reports: [50,100,200,500,1000,2000],
  //       reports_other: [50,100,200,500,1000,2000],
  //       employees: [30,50,100,150,200,250,300,400,500],
  //       jobsites: [5,10,20,30,40,50,100],
  //       techphones: [50,100,200,500,1000],
  //     },
  //   };
  // }
}
