/**
 * Name: ReportLogistics domain class
 * Vers: 1.1.3
 * Date: 2018-08-14
 * Auth: David Sargeant
 * Logs: 1.1.3 2018-08-14: Adjusted constructor, fixed some ReportOther remnants
 * Logs: 1.1.2 2018-07-24: Added properties photoBlobStart, photoBlobEnd, photoURIStart, photoURIEnd
 * Logs: 1.1.0 2018-07-24: Added methods getStartTime(), getStartTimeMoment(), getEndTime(), getEndTimeMoment(), setTime(), setStartTime(), setEndTime()
 * Logs: 1.0.0 2018-04-09: Initial creation
 */

import { Log               } from '../config'              ;
import { Moment            } from '../config'              ;
import { ReportFlag        } from '../config/config.types' ;
import { Employee          } from './employee'             ;
import { OnSiteGeolocation } from './geolocation'          ;
import { isMoment          } from '../config'              ;
import { moment            } from '../config'              ;


export class ReportLogistics {
  public type             : string = "logistics";
  public from             : string = "";
  public to               : string = "";
  public startTime        : string = "";
  public endTime          : string = "";
  public fromLocation     : OnSiteGeolocation = new OnSiteGeolocation();
  public toLocation       : OnSiteGeolocation = new OnSiteGeolocation();
  public startMiles       : number = -1;
  public endMiles         : number = -1;
  public travel_location  : string = "";
  public time             : number = 0 ;
  public notes            : string = "";
  public report_date      : string = "";
  public report_dateM     : Moment     ;
  public last_name        : string = "";
  public first_name       : string = "";
  public timestamp        : number = 0;
  public timestampM       : Moment;
  public username         : string = "";
  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];
  public photoBlobStart   : Blob;
  public photoBlobEnd     : Blob;
  public photoURIStart    : string = "";
  public photoURIEnd      : string = "";
  public _id              : string = "";
  public _rev             : string = "";

  constructor(possibleDoc?:ReportLogistics) {
    if(possibleDoc) {
      this.readFromDoc(possibleDoc);
    } else {
      this.type              = ""                                     ;
      this.time              = 0                                      ;
      this.notes             = ""                                     ;
      this.report_dateM      = moment()                               ;
      this.report_date       = this.report_dateM.format("YYYY-MM-DD") ;
      this.last_name         = ""                                     ;
      this.first_name        = ""                                     ;
      this.username          = ""                                     ;
      this.flagged           = false                                  ;
      this.flagged_fields    = []                                     ;
      this._id               = ""                                     ;
      this._rev              = ""                                     ;
      this.timestampM        = moment()                               ;
      this.timestamp         = this.timestampM.toExcel()              ;
      this.fromLocation      = new OnSiteGeolocation()                ;
      this.toLocation        = new OnSiteGeolocation()                ;
      this.startMiles        = -1                                     ;
      this.endMiles          = -1                                     ;
      this.travel_location   = ""                                     ;
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
      if(classKeys.indexOf(key) > -1) {
        if(key === 'futureSpecialKey') {
        // } else if(key === 'report_dateM') {
        // } else if(key === 'timestampM') {
        } else {
          this[key] = doc[key];
        }
      }
    }
    this.report_dateM = moment(this.report_date, "YYYY-MM-DD");
    this.timestampM = moment(this.timestamp);
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

  public serialize():Object {
    Log.l("ReportLogistics.serialize(): Now serializing report...");
    // let ts = moment(this.timestamp);
    // Log.l("ReportLogistics.serialize(): timestamp moment is now:\n", ts);
    // let XLDate = moment([1900, 0, 1]);
    // let xlStamp = ts.diff(XLDate, 'days', true) + 2;
    // this.timestamp = xlStamp;
    let doc:any = {};
    // this._id = this._id || this.genReportID(tech);
    let keys:string[] = Object.keys(this);
    for(let key of keys) {
      if(key === 'timestampM') {
        doc[key] = this[key].format();
      } else if(key === 'report_dateM') {
        doc[key] = this[key].format();
      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public clone():ReportLogistics {
    let newRL:ReportLogistics = new ReportLogistics();
    let keys:string[] = Object.keys(this);
    for(let key of keys) {
      if(isMoment(this[key])) {
        newRL[key] = moment(this[key]);
      } else if(typeof this[key] === 'object') {
        // newWO[key] = Object.assign({}, this[key]);

      } else {
        newRL[key] = this[key];
      }
    }
    return newRL;
  }

  public getReportID():string {
    return this._id ? this._id : "";
  }

  public genReportID(tech:Employee):string {
    let now = moment();
    let idDateTime = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let docID = tech.avatarName + '_' + idDateTime;
    Log.l("genReportID(): Generated ID:\n", docID);
    return docID;
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

  public setReportDate(date:string|Moment|Date):Moment {
    let reportDate:Moment;
    if(typeof date === 'string') {
      reportDate = moment(date, "YYYY-MM-DD");
      if(isMoment(reportDate)) {
        this.report_date = date;
        this.report_dateM = reportDate;
      } else {
        Log.w(`setReportDate(): Report date string must be in YYYY-MM-DD format. Invalid input: '${date}'`);
        return null;
      }
    } else if(isMoment(date) || date instanceof Date) {
      reportDate = moment(date);
      this.report_date = reportDate.format("YYYY-MM-DD");
      this.report_dateM = reportDate;
      return reportDate;
    }
  }

  public getReportDate():string {
    return this.report_date;
  }

  public getReportDateString:() => string = this.getReportDate;

  public getReportDateMoment():Moment {
    let date:string = this.getReportDate();
    let mo:Moment = moment(date, "YYYY-MM-DD");
    if(isMoment(mo)) {
      this.report_dateM = moment(mo);
      return mo;
    } else if(isMoment(this.report_dateM)) {
      return moment(this.report_dateM);
    } else {
      Log.l(`getReportDateMoment(): Could not find valid Moment to return, report date was '${date}'`);
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
    let out:Moment = moment(time);
    if(isMoment(out)) {
      return out;
    } else {
      Log.w(`getEndTimeMoment(): End time '${time}' is not a valid Moment string`);
      return null;
    }
  }

  /**
   *setTime() sets the Logistics report startTime or endTime properties to the provided Moment-appropriate input (string, Date, or Moment)
   *
   * @param {string} type Must be 'start' or 'end'
   * @param {(string|Date|Moment)} value A properly Moment-able string, or a Date or Moment object
   * @returns {string} The ISO8601-formatted value corresponding to the provided input value
   * @memberof ReportLogistics
   */
  public setTime(type:string, value:string|Date|Moment):string {
    let mo:Moment = moment(value);
    let out:string;
    if(isMoment(mo)) {
      out = mo.format();
      if(type === 'start') {
        this.startTime = out;
      } else if(type === 'end') {
        this.endTime = out;
      } else {
        Log.w(`setTime(): Invalid type '${type}', type must be 'start' or 'end'`);
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


  public toJSON() {
    return this.serialize();
  }

  public isOnSite():boolean {
    return true;
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
  };

}
