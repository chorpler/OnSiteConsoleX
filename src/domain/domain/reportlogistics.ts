/**
 * Name: ReportLogistics domain class
 * Vers: 2.0.0
 * Date: 2019-07-24
 * Auth: David Sargeant
 * Logs: 2.0.0 2019-07-24: Changed genReportID() method to use English locale for current Moment string
 * Logs: 1.8.2 2019-07-18: Minor corrections to fix TSLint errors
 * Logs: 1.8.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 1.7.2 2018-11-29: Added isTest property; added
 * Logs: 1.7.1 2018-11-14: Added getLocations(), getTimes(), getMiles() methods; updated readFromDoc() method to generate new OnSiteGeolocation objects for from, to, final Locations
 * Logs: 1.6.1 2018-10-11: Added initializeReportLogistics(), setSite(), setUser() methods; modified genReportID() to not always require Employee parameter
 * Logs: 1.5.1 2018-10-05: Changed default values for mileage from -1 to null
 * Logs: 1.4.1 2018-10-04: Added properties: rotation, truck, trailer, photoBlobFinal, photoURIFinal, locations, miles, photos
 * Logs: 1.3.1 2018-10-01: Added getTotalTravelMiles(), getTotalTravelHours() methods
 * Logs: 1.2.2 2018-09-26: Fixed genReportID() call to Employee class (used getUsername() instead of just avatarName)
 * Logs: 1.2.1 2018-09-26: Added ReportTime, ReportTimes properties; added timer_running, times properties; added isOnSite(), toJSON(), startTimer(), stopTimer(), getTotalTime(), getLocationAsString(), getLocationFromAsString(), getLocationToAsString() methods
 * Logs: 1.1.3 2018-08-14: Adjusted constructor, fixed some ReportOther remnants
 * Logs: 1.1.2 2018-07-24: Added properties photoBlobStart, photoBlobEnd, photoURIStart, photoURIEnd
 * Logs: 1.1.0 2018-07-24: Added methods getStartTime(), getStartTimeMoment(), getEndTime(), getEndTimeMoment(), setTime(), setStartTime(), setEndTime()
 * Logs: 1.0.0 2018-04-09: Initial creation
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

// const fields = [
//   "type",
//   "training_type",
//   "travel_location",
//   "time",
//   "notes",
//   "report_date",
//   "last_name",
//   "first_name",
//   "client",
//   "location",
//   "location_id",
//   "workSite",
//   "timestamp",
//   "timestampM",
//   "username",
//   "shift_serial",
//   "payroll_period",
//   "flagged",
//   "flagged_fields",
//   "site_number",
//   "_id",
//   "_rev",
// ];

// export type MileageType = "start" | "end" | "final";
export type LogisticsType = "start"|"end"|"destination"|"final";
export type LogisticsMileageType = LogisticsType;
export type LogisticsLocationType = "from"|"to"|"final";
export type LogisticsAllType = LogisticsType | LogisticsLocationType;


export interface OnSitePhoto {
  type : LogisticsMileageType ;
  uri  : string               ;
  blob : Blob                 ;
}

export interface ReportTime {
  start : string ;
  end  ?: string ;
}

export type ReportTimes = ReportTime[];

export type RotationType = "FIRST WEEK" | "CONTN WEEK" | "LAST WEEK" | "DAYS OFF";

export class ReportLogistics {
  public _id              : string = "";
  public _rev             : string = "";
  public type             : string = "logistics";
  public from             : string = "";
  public to               : string = "";
  public startTime        : string = "";
  public endTime          : string = "";
  public finalTime        : string = "";
  public fromLocation     : OnSiteGeolocation = new OnSiteGeolocation();
  public toLocation       : OnSiteGeolocation = new OnSiteGeolocation();
  public finalLocation    : OnSiteGeolocation = new OnSiteGeolocation();
  public startMiles       : number = 0;
  public endMiles         : number = 0;
  public finalMiles       : number = 0;
  public travel_location  : string = "";
  public rotation         : RotationType = "CONTN WEEK";
  public site_number      : number = 1 ;
  public time             : number = 0 ;
  public notes            : string = "";
  public report_date      : string = "";
  // public report_dateM     : Moment     ;
  public username         : string = "";
  public last_name        : string = "";
  public first_name       : string = "";
  public timestamp        : number = 0;
  public timestampM       : string = "";
  // public timestampM       : Moment;
  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];
  public photoBlobStart   : Blob;
  public photoURIStart    : string = "";
  public photoBlobEnd     : Blob;
  public photoURIEnd      : string = "";
  public photoBlobFinal   : Blob;
  public photoURIFinal    : string = "";
  public truck            : string = "";
  public trailer          : string = "";
  public timer_running    : boolean = false;
  public times            : ReportTimes = [];
  public locations        : OnSiteGeolocation[] = [];
  public miles            : any[] = [];
  public photos           : OnSitePhoto[] = [];
  public isTest           : boolean = false;

  constructor(possibleDoc?:any) {
    if(possibleDoc) {
      return this.readFromDoc(possibleDoc);
    }
  }

  public readFromDoc(doc:any):ReportLogistics {
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
        } else if(lcKey.indexOf('location') > -1) {
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
    return this;
  }

  public deserialize(doc:any):ReportLogistics {
    return this.readFromDoc(doc);
  }

  public static deserialize(doc:any):ReportLogistics {
    let logisticsReport:ReportLogistics = new ReportLogistics(doc);
    // logisticsReport.deserialize(doc);
    return logisticsReport;
  }

  public serialize():any {
    Log.l("ReportLogistics.serialize(): Now serializing report …");
    // let ts = moment(this.timestamp);
    // Log.l("ReportLogistics.serialize(): timestamp moment is now:\n", ts);
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
        let prop:any = this[key];
        if(prop && prop.isOnSite && typeof prop.isOnSite === 'function' && prop.isOnSite() && typeof prop.toJSON === 'function' && prop.toJSON()) {
          doc[key] = prop.toJSON();
        } else if(prop != undefined) {
          doc[key] = this[key];
        } else {
          Log.w(`ReportLogistics.serialize(): property '${key}' does not exist`);
        }
      }
    }
    if(doc._rev === "") {
      delete doc._rev;
    }
    Log.l(`ReportLogistics.serialize(): Serialized report is:\n`, doc);
    return doc;
  }

  public clone():ReportLogistics {
    let doc:any = this.serialize();
    let newDoc:any = oo.clone(doc);
    return ReportLogistics.deserialize(newDoc);
    // let newRL:ReportLogistics = new ReportLogistics();
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
      // let idDateTime = now.format("dddDDMMMYYYYHHmmss");
      // let idDateTime:string = now.format("YYYY-MM-DD");
      // let idDateTime:string = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
      let idDateTime = localNow.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
      let docID:string = `${username}_${idDateTime}`;
      Log.l("REPORTLOGISTICS.genReportID(): Generated ID:", docID);
      if(!this._id) {
        this._id = docID;
      }
      return docID;
    } else {
      let errText:string = `REPORTLOGISTICS.genReportID(): No username found and no Employee object provided as parameter 1, cannot generate ID!`;
      Log.e(errText);
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
      Log.w(`ReportLogistics.setTimeStamp(): Parameter 1 must be Moment, Date, or string in 'YYYY-MM-DDTHH:mm:ssZ' format. Invalid input:\n`, datetime);
      return null;
    }
    this.timestamp = datetimeXL;
    this.timestampM = strDateTime;
    return strDateTime;
  }

  public initializeReportLogistics(tech:Employee, site:Jobsite, reportDate?:Date|Moment):ReportLogistics {
    let report:ReportLogistics = this;
    let date:Moment = reportDate != undefined ? moment(reportDate) : moment();
    if(!isMoment(date)) {
      Log.w(`ReportLogistics.initializeReportLogistics(): reportDate was provided but was not a valid Date or Moment:\n`, reportDate);
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
      Log.w(`ReportLogistics.initializeReportLogistics(): Must be provided valid Employee and Jobsite objects. These were:`);
      Log.l(tech);
      Log.l(site);
      /* Panic at the disco */
    }
    return report;
  }

  public setSite(site:Jobsite):ReportLogistics {
    if(!(site instanceof Jobsite)) {
      Log.w(`ReportLogistics.setSite(): Parameter 1 must be Jobsite object. This is:\n`, site);
      return null;
    } else {
      let cli:string = site.client && typeof site.client.name === 'string' ? site.client.name.toUpperCase() : "";
      let loc:string = site.location && typeof site.location.name === 'string' ? site.location.name.toUpperCase() : "";
      let lid:string = site.locID && typeof site.locID.name === 'string' ? site.locID.name.toUpperCase() : "";
      let tmp:number = Number(site.site_number);
      let sno:number = !isNaN(tmp) ? tmp : -1001;
      // this.client      = cli;
      // this.location    = loc;
      // this.locID       = lid;
      this.site_number = sno;
      return this;
    }
  }

  public setUser(tech:Employee):ReportLogistics {
    if(!(tech instanceof Employee)) {
      Log.w(`ReportLogistics.setUser(): Parameter 1 must be Employee object. This is:\n`, tech);
      return null;
    } else {
      let username:string = tech.getUsername();
      let first:string = tech.getFirstName();
      let last:string = tech.getLastName();
      this.username = username;
      this.first_name = first;
      this.last_name = last;
    }
  }

  public get flags():number {
    return this.flagged_fields && this.flagged_fields.length ? this.flagged_fields.length : 0;
  }

  public getFlagNumber(value:number) {
    if(this.flagged_fields && this.flagged_fields.length > value) {
      return this.flagged_fields[value];
    } else {
      Log.w(`ReportLogistics.getFlagNumber(): Attempted to access flag '${value}' but flagged_fields has only ${this.flagged_fields.length} elements!`);
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
      Log.w(`ReportLogistics.isFieldFlagged(): no such field '${field}'!`);
    }
    return false;
  }

  public setFlag(field:string, reason:string) {
    let flag:ReportFlag = {
      field: field,
      reason: reason
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
      Log.w(`ReportLogistics.setReportDate(): Parameter 1 must be a Moment, Date, or string with format 'YYYY-MM-DD'. Invalid input:\n`, date);
      return "";
    }
  }

  public getReportDate():string {
    return this.report_date;
  }

  public getReportDateString():string {
    return this.getReportDate();
  }

  public getReportDateMoment():Moment {
    let date:string = this.getReportDateString();
    let mo:Moment = moment(date, "YYYY-MM-DD", true);
    if(isMoment(mo)) {
      // this.report_dateM = moment(mo);
      return mo;
    } else {
      Log.l(`ReportLogistics.getReportDateMoment(): Could not find valid report date to return as Moment! Report date is:\n`, this.report_date);
      return null;
    }
  }


  /**
   *getStartTime() returns a string representing a particular date and time, corresponding to the Logistics report's startTime property
   *
   * @returns {string} A string representing a date and time, corresponding to the Logistics report's startTime property
   * @memberof ReportLogistics
   */
  public getStartTime():string {
    return this.startTime;
  }

  /**
   *getStartTimeMoment() returns a Moment object corresponding to the Logistics report's startTime property
   *
   * @returns {Moment} A Moment object corresponding to the report's startTime property
   * @memberof ReportLogistics
   */
  public getStartTimeMoment():Moment {
    let time:string = this.getStartTime();
    if(!time) {
      return null;
    }
    let out:Moment = moment(time);
    if(isMoment(out)) {
      return out;
    } else {
      Log.w(`getStartTimeMoment(): Start time '${time}' is not a valid Moment string`);
      return null;
    }
  }

  /**
   *getEndTime() returns a string representing a particular date and time, corresponding to the Logistics report's endTime property
   *
   * @returns {string} A string representing a date and time, corresponding to the Logistics report's endTime property
   * @memberof ReportLogistics
   */
  public getEndTime():string {
    return this.endTime;
  }

  /**
   *getEndTimeMoment() returns a Moment object corresponding to the Logistics report's endTime property
   *
   * @returns {Moment} A Moment object corresponding to the report's endTime property
   * @memberof ReportLogistics
   */
  public getEndTimeMoment():Moment {
    let time:string = this.getEndTime();
    if(!time) {
      return null;
    }
    let out:Moment = moment(time);
    if(isMoment(out)) {
      return out;
    } else {
      Log.w(`getEndTimeMoment(): End time '${time}' is not a valid Moment string`);
      return null;
    }
  }

  /**
   *getFinalTime() returns a string representing a particular date and time, corresponding to the Logistics report's finalTime property
   *
   * @returns {string} A string representing a date and time, corresponding to the Logistics report's finalTime property
   * @memberof ReportLogistics
   */
  public getFinalTime():string {
    return this.finalTime;
  }

  /**
   *getFinalTimeMoment() returns a Moment object corresponding to the Logistics report's finalTime property
   *
   * @returns {Moment} A Moment object corresponding to the report's finalTime property
   * @memberof ReportLogistics
   */
  public getFinalTimeMoment():Moment {
    let time:string = this.getFinalTime();
    if(!time) {
      return null;
    }
    let out:Moment = moment(time);
    if(isMoment(out)) {
      return out;
    } else {
      Log.w(`getFinalTimeMoment(): Start time '${time}' is not a valid Moment string`);
      return null;
    }
  }

  /**
   *setTime() sets the Logistics report startTime or endTime properties to the provided Moment-appropriate input (string, Date, or Moment)
   *
   * @param {MileageType} type Must be 'start' or 'end' or 'final'
   * @param {(string|Date|Moment)} value A properly Moment-able string, or a Date or Moment object
   * @returns {string} The ISO8601-formatted value corresponding to the provided input value
   * @memberof ReportLogistics
   */
  public setTime(type:LogisticsMileageType, value:string|Date|Moment):string {
    let mo:Moment = moment(value);
    let out:string;
    if(isMoment(mo)) {
      out = mo.format();
      if(type === 'start') {
        this.startTime = out;
      } else if(type === 'end') {
        this.endTime = out;
      } else if(type === 'final') {
        this.finalTime = out;
      } else {
        Log.w(`setTime(): Invalid type '${type}', type must be 'start', 'end', 'final'`);
        return null;
      }
      return out;
    } else {
      Log.w(`setTime(): Cannot set time type '${type}', provided value is not valid Moment-able type:`, value);
      return null;
    }
  }


  /**
   *setStartTime() sets the Logistics report startTime property
   *
   * @param {(string|Date|Moment)} value A properly Moment-able string, or a Date/Moment object
   * @returns {string} The ISO8601-formatted value corresponding to the provided input value
   * @memberof ReportLogistics
   */
  public setStartTime(value:string|Date|Moment):string {
    return this.setTime('start', value);
  }

  /**
   * setEndTime() sets the Logistics report endTime property
   *
   * @param {(string|Date|Moment)} value A properly Moment-able string, or a Date/Moment object
   * @returns {string} The ISO8601-formatted value corresponding to the provided input value
   * @memberof ReportLogistics
   */
  public setEndTime(value:string|Date|Moment):string {
    return this.setTime('end', value);
  }

  /**
   * setFinalTime() sets the Logistics report finalTime property
   *
   * @param {(string|Date|Moment)} value A properly Moment-able string, or a Date/Moment object
   * @returns {string} The ISO8601-formatted value corresponding to the provided input value
   * @memberof ReportLogistics
   */
  public setFinalTime(value:string|Date|Moment):string {
    return this.setTime('final', value);
  }

  /**
   * startTimer() starts the timer running
   *
   * @returns {ReportTimes} The current ReportTimes array (an array of objects with start and optional end properties, both of which are ISO8601-formatted strings representing times)
   * @memberof ReportLogistics
   */
  public startTimer():ReportTimes {
    if(this.timer_running) {
      Log.w(`ReportLogistics.startTimer(): Timer already running`);
      return null;
    } else {
      let now:Moment = moment();
      let length:number = Array.isArray(this.times) && this.times.length != undefined ? this.times.length : 0;
      let time:ReportTime = {
        start: now.format(),
      };
      this.times.push(time);
      this.timer_running = true;
      return this.times;
    //   if(length > 0) {
    //     let time:ReportTime = this.times[length - 1];

    //   } else {
    //     let time:ReportTime = {
    //       start: now.format(),
    //     };
    //     this.times.push(time);
    //   }
    }
  }

  /**
   * stopTimer() starts the timer running
   *
   * @returns {ReportTimes} The current ReportTimes array (an array of objects with start and optional end properties, both of which are ISO8601-formatted strings representing times)
   * @memberof ReportLogistics
   */
  public stopTimer():ReportTimes {
    if(!this.timer_running) {
      Log.w(`ReportLogistics.stopTimer(): Timer not running`);
      return null;
    } else {
      // let now:Moment = moment();
      let length:number = Array.isArray(this.times) && this.times.length != undefined ? this.times.length : 0;
      if(length > 0) {
        let time:ReportTime = this.times[length - 1];
        if(time.end != undefined) {
          Log.w(`ReportLogistics.stopTimer(): Latest time has already stopped.`);
          this.timer_running = false;
          return null;
        } else {
          let now:Moment = moment();
          time.end = now.format();
          this.timer_running = false;
          return this.times;
        }
      } else {
        Log.w(`ReportLogistics.stopTimer(): No existing timer found!`);
        return null;
      }
    }
  }

  public getTotalTravelMiles():number {
    let start:number = Number(this.startMiles);
    let end:number   = Number(this.endMiles);
    let final:number = Number(this.finalMiles);
    let totalMiles:number = 0;
    if(!isNaN(start) && !isNaN(end) && start >= 0 && end >= 0) {
      let exactMilesLeg1:number = end - start;
      let roundedMilesLeg1:number = Math.round(exactMilesLeg1);
      if(roundedMilesLeg1 >= 0) {
        totalMiles += roundedMilesLeg1;
      }
    }
    if(!isNaN(end) && !isNaN(final) && final >= 0 && final >= end) {
      // let exactMilesLeg2   : number = Math.abs(final - end);
      let exactMilesLeg2   : number = final - end;
      let roundedMilesLeg2 : number = Math.round(exactMilesLeg2);
      if(roundedMilesLeg2 >= 0) {
        totalMiles += roundedMilesLeg2;
      }
    }
    return totalMiles;
    // Log.w(`ReportLogistics.getTotalTravelMiles(): startMiles or endMiles was not a number or was negative!`);
    //   return 0;
    // }
  }

  public getTotalTravelHours(roundToMinutes?:number):number {
    let time1:string = this.getStartTime();
    let time2:string = this.getEndTime();
    let time3:string = this.getFinalTime();
    let start:Moment, end:Moment, final:Moment;
    let hours:number = 0;
    if(!time1 && !time2 && !time3) {
      return hours;
    } else if(!time2 && !time3) {
      return hours;
    }
    start = this.getStartTimeMoment();
    end   = this.getEndTimeMoment();
    final = this.getFinalTimeMoment();
    let minutesToRoundTo:number = typeof roundToMinutes === 'number' ? roundToMinutes : 1;
    if(isMoment(start) && isMoment(end) && isMoment(final)) {
      // let units:moment.unitOfTime.Diff = unitOfTime || ('hours' as moment.unitOfTime.Diff);
      let units:moment.unitOfTime.Diff = ('hours' as moment.unitOfTime.Diff);
      let hours1:number = end.diff(start, units, true);
      let hours2:number = final.diff(end, units, true);
      // let hours:number = hours1 + hours2;
      hours = hours1 + hours2;
      if(hours1 >= 0 && hours2 >= 0) {
        let duration:Duration = moment.duration(hours, 'hours');
        let minutes:number = duration.asMinutes();
        let roundedMinutes:number = roundUpToNearest(minutes, minutesToRoundTo);
        let roundedDuration:Duration = moment.duration(roundedMinutes, 'minutes');
        let roundedHours:number = roundedDuration.asHours();
        return roundedHours;
      } else if(hours1 >= 0) {
        hours = hours1;
        let duration:Duration = moment.duration(hours, 'hours');
        let minutes:number = duration.asMinutes();
        let roundedMinutes:number = roundUpToNearest(minutes, minutesToRoundTo);
        let roundedDuration:Duration = moment.duration(roundedMinutes, 'minutes');
        let roundedHours:number = roundedDuration.asHours();
        return roundedHours;
      } else {
        return 0;
      }
    } else if(isMoment(start) && isMoment(end)) {
      let units:moment.unitOfTime.Diff = ('hours' as moment.unitOfTime.Diff);
      hours = end.diff(start, units, true);
      if(hours >= 0) {
        let duration:Duration = moment.duration(hours, 'hours');
        let minutes:number = duration.asMinutes();
        let roundedMinutes:number = roundUpToNearest(minutes, minutesToRoundTo);
        let roundedDuration:Duration = moment.duration(roundedMinutes, 'minutes');
        let roundedHours:number = roundedDuration.asHours();
        return roundedHours;
      } else {
        return 0;
      }
    } else {
      Log.w(`ReportLogistics.getTotalTravelHours(): startTime or endTime was not valid!`);
      return 0;
    }
  }

  /**
   * getTotalTime() Gets the total time for this report, in specified units ('hours' by default)
   * @param unitOfTime A string that is part of the Moment.unitOfTime.Diff type ('hours', 'minutes', 'seconds', etc.)
   * @memberof ReportLogistics
   */
  public getTotalTime(unitOfTime?:moment.unitOfTime.Diff):number {
    let now:Moment = moment();
    let hours:number = 0;
    let units:moment.unitOfTime.Diff = unitOfTime || ('hours' as moment.unitOfTime.Diff);
    for(let time of this.times) {
      let startTime:Moment = moment(time.start);
      let endTime:Moment = now;
      if(typeof time.end === 'string') {
        endTime = moment(time.end);
        if(isMoment(endTime)) {
          let hrs:number = endTime.diff(startTime, units, true);
          hours += hrs;
        } else {
          Log.w(`ReportLogistics.getTotalTime(): Invalid endTime found:\n`, time.end);
          return null;
        }
      } else {
        let hrs:number = endTime.diff(startTime, units, true);
        hours += hrs;
      }
    }
    return hours;
  }

  public getTotalTimeString(seconds?:number):string {
    let total:number = seconds != undefined ? seconds : this.getTotalTime('seconds');


    let hrs:number = Math.trunc(total / 3600);
    let min:number = Math.trunc((total/60) - (hrs*60));
    let sec:number = Math.round(total - (hrs * 3600) - (min * 60));
    let out:string = sprintf("%02d:%02d:%02d", hrs, min, sec);
    return out;
  }

  public static getLocationAsString(location:OnSiteGeolocation):string {
    if(location) {
      let lat:number = location.coords.latitude;
      let lng:number = location.coords.longitude;
      let out:string = sprintf("(%0.6f, %0.6f)", lat, lng);
      return out;
    }
    return "";
  }

  public getLocationAsString(location:OnSiteGeolocation):string {
    return ReportLogistics.getLocationAsString(location);
  }

  public getLocationFromAsString():string {
    let location:OnSiteGeolocation = this.fromLocation;
    return this.getLocationAsString(location);
  }

  public getLocationToAsString():string {
    let location:OnSiteGeolocation = this.toLocation;
    return this.getLocationAsString(location);
  }

  public getLocationFinalAsString():string {
    let location:OnSiteGeolocation = this.finalLocation;
    return this.getLocationAsString(location);
  }

  public setLocation(type:LogisticsLocationType, location:OnSiteGeolocation) {
    if(!(location instanceof OnSiteGeolocation)) {
      Log.w(`ReportLogistics.setLocation(): Must provide a valid OnSIteGeolocation object.`);
    } else {
      if(type === 'from') {
        this.fromLocation = location;
      } else if(type === 'to') {
        this.toLocation = location;
      } else if(type === 'final') {
        this.finalLocation = location;
      } else {
        Log.w(`ReportLogistics.setLocation(): Location is not a valid type:\n`, type);
      }
    }
    return null;
  }

  public getLocations():OnSiteGeolocation[] {
    let out:OnSiteGeolocation[] = [];
    let keys:string[] = [
      'fromLocation',
      'toLocation',
      'finalLocation',
    ];
    for(let key of keys) {
      let value:any = this[key];
      if(value instanceof OnSiteGeolocation) {
        out.push(value);
      } else if(value && value.coords != undefined && value.timestamp != undefined) {
        let newVal:OnSiteGeolocation = new OnSiteGeolocation(value);
        out.push(newVal);
      } else {
        Log.w(`ReportLogistics.getLocations(): Location '${key}' is not an OnSiteGeolocation or anything similar:\n`, value);
      }
    }
    return out;
  }

  public getTimes():string[] {
    let out:string[] = [];

    let keys:string[] = [
      'startTime',
      'endTime',
      'finalTime',
    ];
    for(let key of keys) {
      let value:any = this[key];
      if(typeof value === 'string') {
        out.push(value);
      } else {
        Log.w(`ReportLogistics.getTimes(): Time '${key}' is not a datetime string:\n`, value);
      }
    }
    return out;
  }

  public getMiles():number[] {
    let out:number[] = [];
    let keys:string[] = [
      'startMiles',
      'endMiles',
      'finalMiles',
    ];
    for(let key of keys) {
      let value:any = Number(this[key]);
      if(isNumber(value)) {
        out.push(value);
      } else {
        Log.w(`ReportLogistics.getMiles(): Mileage '${key}' is not a number or a numeric string:\n`, value);
      }
    }
    return out;
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
  public static fromJSON(doc:any):ReportLogistics {
    return ReportLogistics.deserialize(doc);
  }
  public getClass():any {
    return ReportLogistics;
  }
  public static getClassName():string {
    return 'ReportLogistics';
  }
  public getClassName():string {
    return ReportLogistics.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}
