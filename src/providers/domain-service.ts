/**
 * Name: Domain Associations provider (Console)
 * Vers: 1.0.1
 * Date: 2018-09-05
 * Auth: David Sargeant
 * Logs: 1.0.1 2018-09-05: Created
 */

import { Injectable                  } from '@angular/core'                 ;
import { Preferences, DatabaseKey                 } from './preferences'                 ;
import { Log, oo, ooPatch, ooPointer } from 'domain/onsitexdomain'          ;
import { Address                     } from 'domain/domain/address'         ;
import { Employee                    } from 'domain/domain/employee'        ;
import { Jobsite                     } from 'domain/domain/jobsite'         ;
import { Jobsites                    } from 'domain/domain/jobsites'        ;
import { Street                      } from 'domain/domain/street'          ;
import { Shift                       } from 'domain/domain/shift'           ;
import { Report                      } from 'domain/domain/report'          ;
import { ReportOther                 } from 'domain/domain/reportother'     ;
import { ReportLogistics             } from 'domain/domain/reportlogistics' ;
import { ReportTimeCard              } from 'domain/onsitexdomain'          ;
import { Message                     } from 'domain/domain/message'         ;
import { Comment                     } from 'domain/domain/comment'         ;
import { PayrollPeriod               } from 'domain/domain/payroll-period'  ;
import { Schedule                    } from 'domain/domain/schedule'        ;
import { Schedules                   } from 'domain/domain/schedules'       ;
import { Invoice                     } from 'domain/domain/invoice'         ;
import { DPS                         } from 'domain/domain/dps'             ;
import { ScheduleBeta                } from 'domain/domain/schedulebeta'    ;
import { PreAuth                     } from 'domain/domain/preauth'         ;
import { Notice                      } from 'domain/domain/notice'          ;
import { Timesheet                   } from 'domain/domain/timesheet'       ;
import { SESAShiftSymbols, SESAShift, SESAShiftLength, SESAShiftRotation, SESAShiftStartTime, SESACLL, SESAClient, SESALocation, SESALocID, SESAAux, DatabaseProgress } from 'domain/onsitexdomain';
import { DOMTimeStamp, LatLonLiteral, LatLng, ICoordinates, IPosition, OnSiteCoordinates, OnSiteGeoposition, OnSiteGeolocation, OnSiteLocation } from 'domain/domain/geolocation';

type Abstract<T> = Function & {prototype: T};
type Constructor<T> = new (...args: any[]) => T;
// type Class<T> = Abstract<T> | Constructor<T>;
type Class<T> = Constructor<T>;

// export type OnSiteDomainClass = Address | Employee | Jobsite | Jobsites | Street | Shift | Report | ReportOther | ReportLogistics | Message | Comment | PayrollPeriod | Schedule | Schedules | Invoice | DPS | ScheduleBeta | PreAuth | Notice | Timesheet;
export type OnSiteConfigClass = Class<SESAShiftSymbols> | Class<SESAShift> | Class<SESAShiftLength> | Class<SESAShiftRotation> | Class<SESAShiftStartTime> | Class<SESACLL> | Class<SESAClient> | Class<SESALocation> | Class<SESALocID> | Class<SESAAux>;
export type OnSiteAllClass = Class<Address> | Class<Employee> | Class<Jobsite> | Class<Jobsites> | Class<Street> | Class<Shift> | Class<Report> | Class<ReportOther> | Class<ReportLogistics> | Class<Message> | Class<Comment> | Class<PayrollPeriod> | Class<Schedule> | Class<Schedules> | Class<Invoice> | Class<DPS> | Class<ScheduleBeta> | Class<PreAuth> | Class<Notice> | Class<Timesheet> | Class<SESAShiftSymbols> | Class<SESAShift> | Class<SESAShiftLength> | Class<SESAShiftRotation> | Class<SESAShiftStartTime> | Class<SESACLL> | Class<SESAClient> | Class<SESALocation> | Class<SESALocID> | Class<SESAAux> | Class<DatabaseProgress>;
export type OnSiteDomainClass = Class<Employee> | Class<Jobsite> | Class<Shift> | Class<Report> | Class<ReportOther> | Class<ReportLogistics> | Class<ReportTimeCard> | Class<Message> | Class<Comment> | Class<PayrollPeriod> | Class<Schedule> | Class<ScheduleBeta> | Class<Invoice> | Class<DPS> | Class<PreAuth> | Class<Timesheet>;
export type OnSiteDomainClasses = OnSiteDomainClass | OnSiteDomainClass[];

var configClasses:Array<any> = [
  SESAShiftSymbols   ,
  SESAShift          ,
  SESAShiftLength    ,
  SESAShiftRotation  ,
  SESAShiftStartTime ,
  SESACLL            ,
  SESAClient         ,
  SESALocation       ,
  SESALocID          ,
  SESAAux            ,
  DatabaseProgress   ,
];

// var dbMap:Array<Array<any>> = [
//   // [ 'phoneInfo'      , null             ] ,
//   // [ 'sounds'         , null             ] ,
//   // [ 'geolocation'    , null             ] ,
//   // [ 'worksites'      , null             ] ,
//   [ 'reports'        , Report           ] ,
//   [ 'reportsOther'   , ReportOther      ] ,
//   [ 'employees'      , Employee         ] ,
//   [ 'config'         , configClasses    ] ,
//   [ 'jobsites'       , Jobsite          ] ,
//   [ 'scheduling'     , Schedule         ] ,
//   [ 'schedulingbeta' , ScheduleBeta     ] ,
//   [ 'invoices'       , Invoice          ] ,
//   [ 'invoices_be'    , Invoice          ] ,
//   [ 'invoices_hb'    , Invoice          ] ,
//   [ 'invoices_kn'    , Invoice          ] ,
//   [ 'technicians'    , Employee         ] ,
//   [ 'messages'       , Message          ] ,
//   [ 'comments'       , Comment          ] ,
//   [ 'preauths'       , PreAuth          ] ,
//   [ 'timesheets'     , Timesheet        ] ,
//   [ 'reports_old01'  , Report           ] ,
//   [ 'reports_old02'  , Report           ] ,
//   [ 'logistics'      , ReportLogistics  ] ,
//   [ 'reports_old'    , Report           ] ,
// ];
var dbTypes:string[] = [
  'reports'       ,
  'reports_other' ,
  'employees'     ,
  'config'        ,
  'jobsites'      ,
  'scheduling'    ,
  'schedulingbeta',
  'invoices'      ,
  'invoices_be'   ,
  'invoices_hb'   ,
  'invoices_kn'   ,
  'technicians'   ,
  'messages'      ,
  'comments'      ,
  'phoneInfo'     ,
  'sounds'        ,
  'geolocation'   ,
  'preauths'      ,
  'worksites'     ,
  'timesheets'    ,
  'logistics'     ,
  'timecards'     ,
  'reports_old'   ,
  'reports_old02' ,
  'reports_old01' ,
];
type DomainStoreItem = {
  type      : string ,
  dbname    : string ,
  storeKey  : string ,
  thisClass : OnSiteDomainClass    ,
};
@Injectable()
export class DomainService {
  public classes:OnSiteDomainClass[] = [];
  public dblist:string[] = [];
  public dbtypes:string[] = [];
  public dbnames:string[] = [];
  public dbmap:Map<string,string> = new Map();
  // public dbTypeToClass:Array<Array<string|OnSiteDomainClass>> = dbMap;

  public someClass:OnSiteDomainClass = Report;
  public storesAndClasses:DomainStoreItem[] = [
    { type: 'reports'        , dbname: this.prefs.getDB('reports'       ), thisClass: Report          , storeKey: 'reports'   , } ,
    { type: 'reports_other'  , dbname: this.prefs.getDB('reports_other' ), thisClass: ReportOther     , storeKey: 'others'    , } ,
    { type: 'logistics'      , dbname: this.prefs.getDB('logistics'     ), thisClass: ReportLogistics , storeKey: 'logistics' , } ,
    { type: 'timecards'      , dbname: this.prefs.getDB('timecards'     ), thisClass: ReportTimeCard  , storeKey: 'timecards' , } ,
    { type: 'employees'      , dbname: this.prefs.getDB('employees'     ), thisClass: Employee        , storeKey: 'employees' , } ,
    { type: 'jobsites'       , dbname: this.prefs.getDB('jobsites'      ), thisClass: Jobsite         , storeKey: 'sites'     , } ,
    { type: 'scheduling'     , dbname: this.prefs.getDB('scheduling'    ), thisClass: Schedule        , storeKey: 'schedules' , } ,
    { type: 'reports_old01'  , dbname: this.prefs.getDB('reports_old01' ), thisClass: Report          , storeKey: 'oldreports', } ,
    { type: 'reports_old02'  , dbname: this.prefs.getDB('reports_old02' ), thisClass: Report          , storeKey: 'oldreports', } ,
    { type: 'reports_old'    , dbname: this.prefs.getDB('reports_old'   ), thisClass: Report          , storeKey: 'oldreports', } ,
    { type: 'messages'       , dbname: this.prefs.getDB('messages'      ), thisClass: Message         , storeKey: '', } ,
    { type: 'comments'       , dbname: this.prefs.getDB('comments'      ), thisClass: Comment         , storeKey: '', } ,
    // { type: 'config'         , dbname: this.prefs.getDB('config'        ), thisClass: configClasses   , storeKey: '', } ,
    // { type: 'schedulingbeta' , dbname: this.prefs.getDB('schedulingbeta'), thisClass: ScheduleBeta    , storeKey: '', } ,
    { type: 'invoices'       , dbname: this.prefs.getDB('invoices'      ), thisClass: Invoice         , storeKey: '', } ,
    { type: 'invoices_be'    , dbname: this.prefs.getDB('invoices_be'   ), thisClass: Invoice         , storeKey: '', } ,
    { type: 'invoices_hb'    , dbname: this.prefs.getDB('invoices_hb'   ), thisClass: Invoice         , storeKey: '', } ,
    { type: 'invoices_kn'    , dbname: this.prefs.getDB('invoices_kn'   ), thisClass: Invoice         , storeKey: '', } ,
    { type: 'technicians'    , dbname: this.prefs.getDB('technicians'   ), thisClass: Employee        , storeKey: '', } ,
    { type: 'preauths'       , dbname: this.prefs.getDB('preauths'      ), thisClass: PreAuth         , storeKey: '', } ,
    { type: 'timesheets'     , dbname: this.prefs.getDB('timesheets'    ), thisClass: Timesheet       , storeKey: '', } ,
  ];

  constructor(
    public prefs: Preferences,
  ) {
    Log.l(`Hello DomainService provider`);
    window["onsitedomainservice"] = this;
    window["onsitedebug"] = window["onsitedebug"] || new Object();
    window["onsitedebug"]["DomainService"] = Preferences;
    this.initializeDomainService();
  }

  public initializeDomainService() {
    // let dbtypes:Array<string> = this.dbTypeToClass.map((a:Array<any>) => {
    //   // let dbtype:string = a[0];
    //   // let dbClass:any = a[1];
    //   return a[0];
    // });
    // this.dbtypes = dbtypes;
    // let dbnames:string[] = this.dbtypes.map((a:string) => {
    //   return this.prefs.getDB(a);
    // });
    // this.dbnames = dbnames;
    // for(let item of this.dbTypeToClass) {
    //   let dbtype:string = item[0];
    //   let dbClass:any   = item[1];
    //   this.dbmap.set(dbtype, dbClass);
    // }
    // this.dblist = dbnames;
  }

  public getClassForDB(dbname:string):OnSiteDomainClass {
    let dbClass:DomainStoreItem = this.storesAndClasses.find((a:DomainStoreItem) => {
      return a.dbname === dbname;
    });
    if(dbClass) {
      return dbClass.thisClass;
    } else {
      Log.w(`getClassForDB(): Could not find class for database '${dbname}'`);
    }
  }

  public getClassForDBType(dbtype:DatabaseKey):OnSiteDomainClass {
    let dbname = this.prefs.getDB(dbtype);
    return this.getClassForDB(dbname);
  }

  public doesDBHaveClass(dbname:string):boolean {
    if(this.dbmap.has(dbname)) {
      return true;
    }
    return false;
  }

  public doesDBTypeHaveClass(dbtype:DatabaseKey):boolean {
    let dbname:string = this.prefs.getDB(dbtype);
    return this.doesDBHaveClass(dbname);
  }

  public getStoreKeyForDBType(dbtype:DatabaseKey):string {
    let dbname:string = this.prefs.getDB(dbtype);
    return this.getStoreKeyForDB(dbtype);
  }

  public getStoreKeyForDB(dbname:string):string {
    let item:DomainStoreItem = this.storesAndClasses.find((a:DomainStoreItem) => {
      return a.dbname === dbname;
    });
    if(item) {
      return item.storeKey;
    }
  }

  public getClassForStoreKey(storeKey:string):OnSiteDomainClass {
    let item:DomainStoreItem = this.storesAndClasses.find((a:DomainStoreItem) => {
      return a.storeKey === storeKey;
    });
    if(item) {
      return item.thisClass;
    }
  }

  public getDBTypeForDB(dbname:string):string {
    let item:DomainStoreItem = this.storesAndClasses.find((a:DomainStoreItem) => {
      return a.dbname === dbname;
    });
    if(item) {
      return item.type;
    }
  }

}
