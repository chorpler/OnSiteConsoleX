/**
 * Name: ReportDriving domain class
 * Vers: 1.1.1
 * Date: 2019-08-13
 * Auth: David Sargeant
 * Logs: 1.1.1 2019-08-13: Added getLatestTripPortion(),getLatestTrip(),getLatestEngineHours(),getLatestMiles() methods
 * Logs: 1.1.0 2019-08-13: Added getTripCount(),getTripCountExact() methods; fixed bug in deserialize() where JSON locations were not getting re-created as OnSiteGeolocation objects
 * Logs: 1.0.3 2019-08-08: Added getType() method, non-static createTripPoint() method
 * Logs: 1.0.2 2019-08-06: Added isTripActive() method
 * Logs: 1.0.1 2019-08-05: Added getTotalRunningTime(),getTotalRunningTimeString() methods
 * Logs: 1.0.0 2019-08-01: Initial creation, copied from ReportLogistics
 */

// import { roundToNearest    } from '../config'              ;
// import { isNumeric         } from '../config'              ;
// import { Shift             } from './shift'                ;
// import { PayrollPeriod     } from './payroll-period'       ;
import { sprintf           } from 'sprintf-js'             ;
import { Log               } from '../config'              ;
import { Moment            } from '../config'              ;
import { Duration          } from '../config'              ;
import { isMoment          } from '../config'              ;
import { moment            } from '../config'              ;
import { roundUpToNearest  } from '../config'              ;
import { isNumber          } from '../config'              ;
import { oo                } from '../config'              ;
import { Employee          } from './employee'             ;
import { Jobsite           } from './jobsite'              ;
import { ReportFlag        } from '../config/config.types' ;
import { OnSiteGeolocation } from './geolocation'          ;
import { isLocation        } from './geolocation'          ;

// export type LogisticsType = "start"|"end"|"destination"|"final";
// export type LogisticsMileageType = LogisticsType;
// export type LogisticsLocationType = "from"|"to"|"final";
// export type LogisticsAllType = LogisticsType | LogisticsLocationType;

export interface DrivingTripMiles {
  start : number;
  end  ?: number;
}
export type DrivingTripMilesList = DrivingTripMiles[];

export interface DrivingTimes {
  start : string ;
  end  ?: string ;
}
export type DrivingTimesList = DrivingTimes[];

export interface DrivingTripLocations {
  start : OnSiteGeolocation;
  end  ?: OnSiteGeolocation;
}
export type DrivingTripLocationsList = DrivingTripLocations[];

export interface DrivingTripPart {
  miles: DrivingTripMiles;
  times: DrivingTripMiles;
  locations: DrivingTripLocations;
}

export interface DrivingTripPoint {
  miles    ?: number;
  hours    ?: number;
  time     ?: string;
  location ?: OnSiteGeolocation;
}
export type DrivingTripPoints = DrivingTripPoint[];

export interface DrivingTripPortion {
  start : DrivingTripPoint;
  end  ?: DrivingTripPoint;
}
export type DrivingTripPortions = DrivingTripPortion[];

// const createTripPoint = ({miles = 0, time = "", location = new OnSiteGeolocation()}:DrivingTripPoint={}):DrivingTripPoint => {
// const createTripPoint = (miles?:number, hours?:number, time?:string|Moment|Date, location?:OnSiteGeolocation):DrivingTripPoint => {
//   let mil = typeof miles === 'number' ? miles : 0;
//   let hrs = typeof hours === 'number' ? hours : 0;
//   let tim = typeof time === 'string' ? time : time instanceof Date || isMoment(time) ? moment(time).format() : "";
//   let loc = isLocation(location) ? new OnSiteGeolocation(location) : new OnSiteGeolocation();
//   let trip:DrivingTripPoint = {
//     miles: mil,
//     hours: hrs,
//     time: tim,
//     location: loc,
//   };
//   return trip;
// }

export class ReportDriving {
  public _id              : string = "";
  public _rev             : string = "";
  public type             : string = "driving";
  public notes            : string = "";
  public report_date      : string = "";
  public username         : string = "";
  public last_name        : string = "";
  public first_name       : string = "";
  public timestamp        : number = 0;
  public timestampM       : string = "";
  public site_number      : number = 1 ;
  public client           : string = "";
  public location         : string = "";
  public locID            : string = "";
  public locAux           : string = "";

  public trips            : DrivingTripPortions = [];

  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];

  public vin              : string = "";
  public unit_number      : string = "";

  public isTest           : boolean = false;

  constructor(possibleDoc?:any) {
    if(possibleDoc) {
      return this.deserialize(possibleDoc);
    }
  }

  public static createTripPoint(miles?:number, hours?:number, time?:string|Moment|Date, location?:OnSiteGeolocation):DrivingTripPoint {
    let mil = typeof miles === 'number' ? miles : 0;
    let hrs = typeof hours === 'number' ? hours : 0;
    let tim = typeof time === 'string' ? time : time instanceof Date || isMoment(time) ? moment(time).format() : "";
    let loc = isLocation(location) ? new OnSiteGeolocation(location) : new OnSiteGeolocation();
    let point:DrivingTripPoint = {
      miles: mil,
      hours: hrs,
      time: tim,
      location: loc,
    };
    return point;
  }

  public createTripPoint(miles?:number, hours?:number, time?:string|Moment|Date, location?:OnSiteGeolocation):DrivingTripPoint {
    return ReportDriving.createTripPoint(miles, hours, time, location);
  }

  // public static roundToNearest(value:number, roundToNearest?:number):number {
  //   let RTN = !isNaN(Number(roundToNearest)) ? Number(roundToNearest) : 1;
  //   if(RTN <= 0) {
  //     RTN = 1;
  //   }
  //   let out = Math.round(value / RTN) * RTN;
  //   return out;
  // }

  public deserialize(doc:any):ReportDriving {
    // let len = fields.length;
    // for(let i = 0; i < len; i++) {
      // let key  = fields[i];
      // this[key] = doc[key] ? doc[key] : this[key];
    // }
    let docKeys = Object.keys(doc);
    let classKeys = Object.keys(this);
    for(let key of docKeys) {
      let lcKey:string = key.toLowerCase();
      let value:any = doc[key];
      if(classKeys.indexOf(key) > -1) {
        if(key === 'futureSpecialKey') {
        // } else if(key === 'report_dateM') {
        // } else if(key === 'timestampM') {
        } else if(lcKey === 'trips') {
          this[key] = doc[key];
        } else if(lcKey.includes('location')) {
          if(value && value.coords != undefined && value.timestamp != undefined) {
            let val:OnSiteGeolocation = new OnSiteGeolocation(value);
            this[key] = val;
          } else {
            this[key] = value;
          }
        } else {
          this[key] = doc[key];
        }
      }
    }
    // this.report_dateM = moment(this.report_date, "YYYY-MM-DD");
    // let tsM:Moment = moment.fromExcel(this.timestamp);
    // let strTS =
    // this.timestampM = moment(tsM);
    // this.report_date = moment(this.report_date, "YYYY-MM-DD");
    // this.timestampM  = moment(this.timestampM);
    if(Array.isArray(this.trips) && this.trips.length > 0) {
      for(let portion of this.trips) {
        let start = portion.start;
        let end = portion.end;
        if(start && start.location) {
          start.location = new OnSiteGeolocation(start.location);
        }
        if(end && end.location) {
          end.location = new OnSiteGeolocation(end.location);
        }
      }
    }
    return this;
  }

  public static deserialize(doc:any):ReportDriving {
    let report:ReportDriving = new ReportDriving(doc);
    return report;
  }

  public serialize():any {
    Log.l("ReportDriving.serialize(): Now serializing report …");
    // let ts = moment(this.timestamp);
    // Log.l("ReportDriving.serialize(): timestamp moment is now:\n", ts);
    // let XLDate = moment([1900, 0, 1]);
    // let xlStamp = ts.diff(XLDate, 'days', true) + 2;
    // this.timestamp = xlStamp;
    let doc:any = {};
    // this._id = this._id || this.genReportID(tech);
    let keys:string[] = this.getKeys();
    for(let key of keys) {
      if(key === '_rev') {
        if(this[key]) {
          doc[key] = this[key];
        }
      } else if(key === 'timestampM') {
        // doc[key] = this[key].format();
        doc[key] = this[key];
      } else if(key === 'report_dateM') {
        // doc[key] = this[key].format();
        doc[key] = this[key];
      } else {
        let value:any = this[key];
        if(value && typeof value.isOnSite === 'function' && value.isOnSite() && typeof value.toJSON === 'function' && value.toJSON()) {
          doc[key] = value.toJSON();
        } else if(value != undefined) {
          doc[key] = this[key];
        } else {
          Log.w(`ReportDriving.serialize(): property '${key}' does not exist`);
        }
      }
    }
    if(doc._rev === "") {
      delete doc._rev;
    }
    Log.l(`ReportDriving.serialize(): Serialized report is:`, doc);
    return doc;
  }

  public clone():ReportDriving {
    // let doc:any = this.serialize();
    // let doc:any = this.serialize();
    let newDoc:any = oo.clone(this);
    // return ReportDriving.deserialize(newDoc);
    return new ReportDriving(newDoc);
    // let newRL:ReportDriving = new ReportDriving();
    // let keys:string[] = Object.keys(this);
    // for(let key of keys) {
    //   if(isMoment(this[key])) {
    //     newRL[key] = moment(this[key]);
    //   } else if(typeof this[key] === 'object') {
    //     // newWO[key] = Object.assign({}, this[key]);

    //   } else {
    //     newRL[key] = this[key];
    //   }
    // }
    // return newRL;
  }

  public getReportID():string {
    return this._id ? this._id : "";
  }

  public genReportID(tech:Employee, lang?:string):string {
    let username:string = tech && tech instanceof Employee ? tech.getUsername() : this.username && typeof this.username === 'string' ? this.username : "";
    if(username) {
      let now:Moment = moment();
      let i8nCode = typeof lang === 'string' ? lang : "en";
      let localNow = moment(now).locale(i8nCode);
      let idDateTime = localNow.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
      let docID:string = `${username}_${idDateTime}`;
      Log.l("REPORTDRIVING.genReportID(): Generated ID:", docID);
      if(!this._id) {
        this._id = docID;
      }
      return docID;
    } else {
      let errText:string = `REPORTDRIVING.genReportID(): No username found and no Employee object provided as parameter 1, cannot generate ID!`;
      Log.e(errText + ":", this);
      throw new Error(errText);
    }
  }

  public setTimeStamp(datetime:string|Moment|Date):string {
    let ts:Moment, datetimeXL:number, strDateTime:string;
    if(typeof datetime === 'string') {
      ts = moment(datetime, "YYYY-MM-DDTHH:mm:ssZ", true);
    } else if(isMoment(datetime) || datetime instanceof Date) {
      ts = moment(datetime);
    }
    if(isMoment(ts)) {
      datetimeXL = ts.toExcel(true);
      strDateTime = ts.format();
    } else {
      Log.w(`ReportDriving.setTimeStamp(): Parameter 1 must be Moment, Date, or string in 'YYYY-MM-DDTHH:mm:ssZ' format. Invalid input:\n`, datetime);
      return null;
    }
    this.timestamp = datetimeXL;
    this.timestampM = strDateTime;
    return strDateTime;
  }

  public initializeReportDriving(tech:Employee, site:Jobsite, reportDate?:Date|Moment):ReportDriving {
    let report:ReportDriving = this;
    let date:Moment = reportDate != undefined ? moment(reportDate) : moment();
    if(!isMoment(date)) {
      Log.w(`ReportDriving.initializeReportDriving(): reportDate was provided but was not a valid Date or Moment:\n`, reportDate);
      return null;
    }
    if(tech instanceof Employee && site instanceof Jobsite) {
      this.setUser(tech);
      this.setSite(site);
      report.setReportDate(date);
      let now:Moment = moment();
      report.setTimeStamp(now);
      // report.setTimeStamp(now);
      this.genReportID(tech);
    } else {
      Log.w(`ReportDriving.initializeReportDriving(): Must be provided valid Employee and Jobsite objects. These were:`);
      Log.l(tech);
      Log.l(site);
      /* Panic at the disco */
    }
    return report;
  }

  public setSite(site:Jobsite):ReportDriving {
    if(!(site instanceof Jobsite)) {
      Log.w(`ReportDriving.setSite(): Parameter 1 must be Jobsite object. This is:\n`, site);
      return null;
    } else {
      let cli:string = site.client && typeof site.client.name === 'string' ? site.client.name.toUpperCase() : "";
      let loc:string = site.location && typeof site.location.name === 'string' ? site.location.name.toUpperCase() : "";
      let lid:string = site.locID && typeof site.locID.name === 'string' ? site.locID.name.toUpperCase() : "";
      let aux:string = site.aux && typeof site.aux.name === 'string' ? site.aux.name.toUpperCase() : "";
      let tmp:number = Number(site.site_number);
      let sno:number = !isNaN(tmp) ? tmp : -1001;
      this.site_number = sno;
      this.client      = cli;
      this.location    = loc;
      this.locID       = lid;
      if(aux != undefined) {
        this.locAux = aux;
      }
      return this;
    }
  }

  /**
   * Sets user-related fields in the report
   *
   * @param {Employee} tech The Employee object to use
   * @returns {ReportDriving} The entire report
   * @memberof ReportDriving
   */
  public setUser(tech:Employee):ReportDriving {
    if(!(tech instanceof Employee)) {
      Log.w(`ReportDriving.setUser(): Parameter 1 must be Employee object. Invalid parameter:`, tech);
      return null;
    } else {
      let username:string = tech.getUsername();
      let first:string = tech.getFirstName();
      let last:string = tech.getLastName();
      this.username = username;
      this.first_name = first;
      this.last_name = last;
      return this;
    }
  }

  public get flags():number {
    return this.flagged_fields && this.flagged_fields.length ? this.flagged_fields.length : 0;
  }

  public getFlagNumber(value:number) {
    if(this.flagged_fields && this.flagged_fields.length > value) {
      return this.flagged_fields[value];
    } else {
      Log.w(`ReportDriving.getFlagNumber(): Attempted to access flag '${value}' but flagged_fields has only ${this.flagged_fields.length} elements!`);
      return null;
    }
  }

  public isFlagged():boolean {
    return Boolean(this.flags);
  }

  public isFieldFlagged(field:string) {
    if(this.flagged_fields && this.flagged_fields.length) {
      let flag = this.flagged_fields.find((a:ReportFlag) => {
        return a.field === field;
      });
      if(flag) {
        return true;
      }
    }
    let keys = Object.keys(this);
    if(keys.indexOf(field) === -1 && field !== 'manual') {
      Log.w(`ReportDriving.isFieldFlagged(): no such field '${field}'!`);
    }
    return false;
  }

  public setFlag(field:string, reason:string) {
    let flag:ReportFlag = {
      field: field,
      reason: reason,
    };
    this.flagged_fields = this.flagged_fields || [];
    if(field === 'manual') {
      this.flagged_fields.push(flag);
    } else {
      let existingFlag = this.flagged_fields.find((a:ReportFlag) => {
        return a.field === field;
      });
      if(existingFlag) {
        existingFlag.field  = field;
        existingFlag.reason = reason;
      } else {
        this.flagged_fields.push(flag);
      }
    }
  }

  public unsetFlag(field:string) {
    this.flagged_fields = this.flagged_fields || [];
    let index = this.flagged_fields.findIndex((a:ReportFlag) => {
      return a.field === field;
    });
    if(index > -1) {
      let flag:ReportFlag = this.flagged_fields.splice(index, 1)[0];
    }
  }

  public clearFlags() {
    this.flagged_fields = [];
    this.flagged = false;
  }

  public setReportDate(date:string|Moment|Date):string {
    let reportDate:Moment, strDate:string = "", maybeDate:string;
    if(typeof date === 'string') {
      maybeDate = date;
      if(date.length > 10) {
        maybeDate = date.slice(0,10);
      }
      reportDate = moment(date, "YYYY-MM-DD", true);
    } else if(isMoment(date) || date instanceof Date) {
      reportDate = moment(date);
    }
    if(isMoment(reportDate)) {
      strDate = reportDate.format("YYYY-MM-DD");
      this.report_date = strDate;
      // this.report_dateM = reportDate;
      return strDate;
    } else {
      Log.w(`ReportDriving.setReportDate(): Parameter 1 must be a Moment, Date, or string with format 'YYYY-MM-DD'. Invalid input:\n`, date);
      return "";
    }
  }

  public getReportDate():string {
    return this.report_date;
  }

  /**
   * Returns report date as a YYYY-MM-DD string (or with optional formatting)
   *
   * @param {string} [format] Optional Moment.js formatting string to use
   * @returns {string} Report date as string
   * @memberof ReportDriving
   */
  public getReportDateString(format?:string):string {
    let fmt = format && typeof format === 'string' ? format : "YYYY-MM-DD";
    let date = this.getReportDateMoment();
    return date.format(fmt);
  }

  public getReportDateMoment():Moment {
    let date:string = this.getReportDate();
    let mo:Moment = moment(date, "YYYY-MM-DD", true);
    if(isMoment(mo)) {
      // this.report_dateM = moment(mo);
      return mo;
    } else {
      Log.l(`ReportDriving.getReportDateMoment(): Could not find valid report date to return as Moment! Report date is:`, this.report_date);
      return null;
    }
  }

  /**
   * Starts a trip
   *
   * @param {number} [miles=0]
   * @param {(string|Moment|Date)} [time=""]
   * @param {OnSiteGeolocation} [location=new OnSiteGeolocation()]
   * @returns {DrivingTripPortions}
   * @memberof ReportDriving
   */
  public startTrip(miles?:number, hours?:number, time?:string|Moment|Date, location?:OnSiteGeolocation):DrivingTripPortions {
    let time1:string = moment(time).format();
    Log.l(`ReportDriving.startTrip(): Trip started. Miles, hours, time, and location:`, miles, hours, time1, location);
    let portion:DrivingTripPortion;
    if(this.isTripActive()) {
      Log.w(`ReportDriving.startTrip(): Trip already started and not ended. Please end current trip first.`);
      return null;
    }
    portion = {
      start: null,
    };
    let point = this.createTripPoint(miles, hours, time, location);
    portion.start = point;
    this.trips.push(portion);
    Log.l(`ReportDriving.startTrip(): Trip started successfully, report is now:`, this.clone());
    return this.trips;
  }

  /**
   * Ends a trip
   *
   * @param {number} [miles=0]
   * @param {(string|Moment|Date)} [time=""]
   * @param {OnSiteGeolocation} [location=new OnSiteGeolocation()]
   * @returns {DrivingTripPortions}
   * @memberof ReportDriving
   */
  public endTrip(miles?:number, hours?:number, time?:string|Moment|Date, location?:OnSiteGeolocation):DrivingTripPortions {
    let time1:string = moment(time).format();
    Log.l(`ReportDriving.endTrip(): Trip ending. Miles, hours, time, and location:`, miles, hours, time1, location);
    let portion:DrivingTripPortion;
    let lastPortion = this.getLatestTrip();
    if(lastPortion) {
      portion = lastPortion;
      if(portion.end != undefined) {
        Log.w(`ReportDriving.endTrip(): Last trip has been ended already, please start a new trip first`);
        return null;
      } else {
        let point = this.createTripPoint(miles, hours, time, location);
        portion.end = point;
        Log.l(`ReportDriving.endTrip(): Trip ended successfully, report is now:`, this.clone());
        return this.trips;
      }
    } else {
      Log.w(`ReportDriving.endTrip(): No trip has been started, cannot end trip`);
      return null;
    }
  }

  /**
   * Get total miles for trips in this report
   *
   * @returns {number}
   * @memberof ReportDriving
   */
  public getTotalMiles():number {
    let total = 0;
    for(let portion of this.trips) {
      if(portion.start == undefined || portion.end == undefined) {
        continue;
      } else {
        let start = Number(portion.start.miles);
        let end = Number(portion.end.miles);
        let miles = end - start;
        total += miles;
      }
    }
    return total;
  }

  /**
   * Gets the total time for this report, in specified units ('hours' by default).
   * If a trip is currently started, includes current elapsed time.
   * @param unitOfTime A string that is part of the Moment.unitOfTime.Diff type ('hours', 'minutes', 'seconds', etc.)
   * @param [roundToNearest] Number of minutes to round to nearest; 15 will round to nearest quarter-hour
   * @memberof ReportDriving
   */
  public getTotalRunningTime(unitOfTime?:moment.unitOfTime.Diff|number, roundToNearest?:number):number {
    let now:Moment = moment();
    let hours:number = 0;
    let units:moment.unitOfTime.Diff = 'hours' as moment.unitOfTime.Diff;
    let round:number = 1;
    if(typeof unitOfTime === 'string') {
      units = unitOfTime;
    }
    if(typeof unitOfTime === 'number') {
      round = unitOfTime;
    }
    if(typeof roundToNearest === 'number') {
      round = roundToNearest;
    }
    for(let portion of this.trips) {
      let start:Moment, end:Moment;
      if(portion.end == undefined) {
        end = moment(now);
      } else {
        end = moment(portion.end.time);
      }
      start = moment(portion.start.time);
      if(isMoment(end) && isMoment(start)) {
        let hrs:number = end.diff(start, units, true);
        hours += hrs;
      } else {
        Log.w(`ReportDriving.getTotalRunningTime(): Invalid time found in portion:`, portion);
      }
    }
    return hours;
  }

  /**
   * Gets the total running time for this report (or for the provided number of seconds) as a string of format HH:mm:ss
   *
   * @param {number} [seconds] If provided, format this number of seconds instead of the total time
   * @returns {string} Time string of the format HH:mm:ss
   * @memberof ReportDriving
   */
  public getTotalRunningTimeString(seconds?:number):string {
    let total:number = seconds != undefined ? seconds : this.getTotalRunningTime('seconds');
    let hrs:number = Math.trunc(total / 3600);
    let min:number = Math.trunc((total/60) - (hrs*60));
    let sec:number = Math.round(total - (hrs * 3600) - (min * 60));
    let out:string = sprintf("%02d:%02d:%02d", hrs, min, sec);
    return out;
  }

  /**
   * Gets the total recorded time for this report, in specified units ('hours' by default).
   * Currently started trips not included.
   * @param unitOfTime A string that is part of the Moment.unitOfTime.Diff type ('hours', 'minutes', 'seconds', etc.)
   * @param [roundToNearest] Number of minutes to round to nearest; 15 will round to nearest quarter-hour
   * @memberof ReportDriving
   */
  public getTotalTime(unitOfTime?:moment.unitOfTime.Diff|number, roundToNearest?:number):number {
    // let now:Moment = moment();
    let hours:number = 0;
    let units:moment.unitOfTime.Diff = 'hours' as moment.unitOfTime.Diff;
    let round:number = 1;
    if(typeof unitOfTime === 'string') {
      units = unitOfTime;
    }
    if(typeof unitOfTime === 'number') {
      round = unitOfTime;
    }
    if(typeof roundToNearest === 'number') {
      round = roundToNearest;
    }
    for(let portion of this.trips) {
      let start:Moment, end:Moment;
      if(portion.end == undefined) {
        continue;
      } else {
        end = moment(portion.end.time);
      }
      start = moment(portion.start.time);
      if(isMoment(end) && isMoment(start)) {
        let hrs:number = end.diff(start, units, true);
        hours += hrs;
      } else {
        Log.w(`ReportDriving.getTotalTime(): Invalid time found in portion:`, portion);
      }
    }
    if(round) {
      let mins = hours * 60;
      // mins = ReportDriving.roundToNearest(hours, round);
      mins = roundUpToNearest(mins, round);
      let hrs = mins / 60;
      hours = hrs;
    }
    return hours;
  }

  /**
   * Gets the total time for this report (or for the provided number of seconds) as a string of format hh:mm:ss
   *
   * @param {number} [seconds] If provided, format this number of seconds instead of the total time
   * @returns {string} Time string of the format HH:mm:ss
   * @memberof ReportDriving
   */
  public getTotalTimeString(seconds?:number):string {
    let total:number = seconds != undefined ? seconds : this.getTotalTime('seconds');
    let hrs:number = Math.trunc(total / 3600);
    let min:number = Math.trunc((total/60) - (hrs*60));
    let sec:number = Math.round(total - (hrs * 3600) - (min * 60));
    let out:string = sprintf("%02d:%02d:%02d", hrs, min, sec);
    return out;
  }

  /**
   * Checks to see if this report has an active trip (started but not finished)
   *
   * @returns {boolean} True if report has an active trip, false otherwise
   * @memberof ReportDriving
   */
  public isTripActive():boolean {
    let portion = this.getLatestTrip();
    if(portion && portion.start && !portion.end) {
      return true;
    }
    return false;
  }

  /**
   * Returns number of trips started so far.
   *
   * @returns {number} The number of trip portions started (completion doesn't matter). Basically just the length of this object's trips property.
   * @memberof ReportDriving
   */
  public getTripCount():number {
    let count = Array.isArray(this.trips) ? this.trips.length : 0;
    return count;
  }

  /**
   * Returns number of trips started and completed so far. If a trip is started but not yet completed, add 0.5.
   *
   * @returns {number} 0 if no trips exist. 0.5 if one trip started but not completed. 1 for one trip completed. And so forth.
   * @memberof ReportDriving
   */
  public getTripCountExact():number {
    let count = 0;
    let len = Array.isArray(this.trips) ? this.trips.length : 0;
    if(len > 0) {
      for(let portion of this.trips) {
        if(portion.start) {
          count += 0.5;
        }
        if(portion.end) {
          count += 0.5;
        }
      }
    }
    return count;
  }

  /**
   * Get latest DrivingTripPortion, if one exists
   *
   * @returns {DrivingTripPortion} The last trip that was added to the trips array
   * @memberof ReportDriving
   */
  public getLatestTrip():DrivingTripPortion {
    let len = Array.isArray(this.trips) ? this.trips.length : 0;
    let idx = len - 1;
    let portion = this.trips[idx];
    if(portion) {
      return portion;
    } else {
      // Log.w(`ReportDriving.getLatestTrip(): Could not find a trip portion to return from:`, this.trips);
      return null;
    }
  }

  /**
   * Get the latest point added to this report (could be a start or end point for a trip)
   *
   * @returns {DrivingTripPoint} The last point added to report as either the start of a trip or end of a trip
   * @memberof ReportDriving
   */
  public getLatestTripPoint():DrivingTripPoint {
    let portion = this.getLatestTrip();
    if(portion) {
      if(portion.end) {
        return portion.end;
      } else if(portion.start) {
        return portion.start;
      }
    }
    Log.w(`ReportDriving.getLatestTripPoint(): Could not find a trip portion to return a point from:`, this.trips);
    return null;
  }

  /**
   * Get latest engine hours reading that was added to this report
   *
   * @returns {number} The last engine hours reading that was added to this report as part of a trip
   * @memberof ReportDriving
   */
  public getLatestEngineHours():number {
    let out = 0;
    let point = this.getLatestTripPoint();
    if(point) {
      out = point.hours;
    } else {
      Log.w(`ReportDriving.getLatestEngineHours(): Could not find a trip portion to return latest engine hours from:`, this.trips);
    }
    return out;
  }

  /**
   * Get latest mileage that was added to this report
   *
   * @returns {number} The last mileage record added to this report as part of a trip
   * @memberof ReportDriving
   */
  public getLatestMiles():number {
    let out = 0;
    let point = this.getLatestTripPoint();
    if(point) {
      out = point.miles;
    } else {
      Log.w(`ReportDriving.getLatestMiles(): Could not find a trip portion to return latest miles from:`, this.trips);
    }
    return out;
  }

  /**
   * Get latest OnSiteGeolocation that was added to this report
   *
   * @returns {OnSiteGeolocation} The last location added to the report as part of a trip
   * @memberof ReportDriving
   */
  public getLatestLocation():OnSiteGeolocation {
    let point = this.getLatestTripPoint();
    if(point && point.location) {
      return point.location;
    }
    Log.w(`ReportDriving.getLatestMiles(): Could not find a trip portion to return latest miles from:`, this.trips);
    return null;
  }

  public getType():string {
    return this.type;
  }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON() {
    return this.serialize();
  }
  public static fromJSON(doc:any):ReportDriving {
    return ReportDriving.deserialize(doc);
  }
  public getClass():any {
    return ReportDriving;
  }
  public static getClassName():string {
    return 'ReportDriving';
  }
  public getClassName():string {
    return ReportDriving.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}
