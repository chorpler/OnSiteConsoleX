/**
 * Name: Report domain class
 * Vers: 8.1.0
 * Date: 2019-08-20
 * Auth: David Sargeant
 * Logs: 8.1.0 2019-08-20: Added getLastTimeBlocked() method
 * Logs: 8.0.4 2019-08-13: Fixed unreachable code in getReportDate() method
 * Logs: 8.0.3 2019-08-11: Added setUser() method; Added some JSDoc comments
 * Logs: 8.0.2 2019-08-08: Added type property and getType() method
 * Logs: 8.0.1 2019-08-07: Added some JSDoc comments
 * Logs: 8.0.0 2019-07-24: Changed genReportID() method to use English locale for current Moment string
 * Logs: 7.8.3 2019-07-17: Modified setPremiumStatus() method to throw error if not given Jobsite object; added billable property and isBillable(),setBillableStatus() methods
 * Logs: 7.8.2 2019-07-17: Added matchesCLL(),matchesOneCLL(),matchesClient(),matchesLocation(),matchesLocID() methods
 * Logs: 7.8.1 2019-06-27: Changed StatusUpdateType to ReportStatusUpdateType; minor TSLint errors fixed
 * Logs: 7.7.2 2019-06-19: Added a type property, for office/work_report types
 * Logs: 7.7.1 2019-06-11: Added times_error,date_error properties, areTimesValid() method, and new methods to force date/time updates without checking instantly for errors
 * Logs: 7.6.1 2019-03-06: Modified getReportDate() and getReportDateAsString()
 * Logs: 7.5.1 2019-01-29: Removed Shift and PayrollPeriod imports; added static methods getPayrollPeriodDate(), getPayrollSerial(), getShiftNumber(), getShiftWeek(), getShiftSerial()
 * Logs: 7.4.1 2018-12-13: refactored imports; added standard OnSite methods
 * Logs: 7.3.3 2018-12-04: Added isTest property
 * Logs: 7.3.2 2018-08-08: Added premium_eligible property, isPremiumEligible() and setPremiumStatus() methods
 * Logs: 7.3.1 2018-08-01: Trying some new stuff for clone, and adding Symbol.toStringTag for typeof checking
 * Logs: 7.2.2 2018-08-01: Added check for matchesSite() being called with Jobsite object
 * Logs: 7.2.1 2018-07-09: Added addStatusUpdate() and setInvoiced() methods, plus StatusUpdateType and ReportStatusLogEntry types
 * Logs: 7.1.1 2018-03-01: Imported Duration type, added methods getStartTimeAsExcel(), getEndTimeAsExcel(), and getReportDateAsExcel()
 * Logs: 7.0.1 2018-02-26: Adjusted report date functions and added getReportDateAsString() method
 * Logs: 6.6.3 2018-02-08: Fixed moment format() bug in serialize() method
 * Logs: 6.6.1 2018-02-08: Added moment encoding for timestampM field, and crew_number to serialize/deserialize
 * Logs: 6.5.4 2018-01-21: Changed flagging to flagged and flagged_fields fields, plus flags(), getFlagNumber(), isFlagged(), isFieldFlagged(), setFlag(), unsetFlag(), clearFlags() methods
 * Logs: 6.5.3 2018-01-20: Added flagged_field and flagged_reason fields, and setFlag method
 * Logs: 6.5.2 2018-01-18: Added crew_number field
 * Logs: 6.5.1 2017-12-15: Added flagged field, invoiced field, and invoices array
 * Logs: 6.4.2 2017-11-14: Fixed it so Excel dates in string format will also read in
 * Logs: 6.4.1 2017-11-12: Added ability to read report_date from rprtDate as an Excel date integer
 * Logs: 6.3.1: Added split_count and split_from
 */
import { sprintf    } from 'sprintf-js'              ;
import { Log        } from '../config/config.log'    ;
import { Moment     } from '../config/moment-onsite' ;
import { moment     } from '../config/moment-onsite' ;
import { isMoment   } from '../config/moment-onsite' ;
import { Duration   } from '../config/moment-onsite' ;
import { isDuration } from '../config/moment-onsite' ;
import { ReportFlag } from '../config/config.types'  ;
import { Employee   } from './employee'              ;
import { Jobsite    } from './jobsite'               ;

export type FieldRecord = [string, string, number];
export type ReportStatusUpdateType = "created" | "updated" | "invoiced" | "paid";
export interface ReportStatusLogEntry {
  type       : ReportStatusUpdateType ;
  user       : string                 ;
  timestamp  : string                 ;
  invoice   ?: number                 ;
}
export type WorkReportType = "work_report" | "office";
export interface SESAReportCLL {
  name:string;
  fullName:string;
  code?:string;
  value?:string;
}
export type ReportCLL = SESAReportCLL|string;

export class Report {
  public _id              : string = "";
  public _rev             : string = "";
  public type             : WorkReportType = "work_report";
  public time_start       : Moment ;
  public time_end         : Moment ;
  public repair_hours     : number = 0;
  public unit_number      : string = "";
  public work_order_number: string = "";
  public crew_number      : string = "";
  public notes            : string = "";
  public report_date      : string = "";
  public last_name        : string = "";
  public first_name       : string = "";
  public shift            : string = "";
  public client           : string = "";
  public location         : string = "";
  public location_id      : string = "";
  public site_number      : number = -1001;
  public shift_time       : Moment ;
  public shift_length     : number = 0;
  public shift_start_time : Moment ;
  public technician       : string = "";
  public timestamp        : number = 0;
  public timestampM       : Moment ;
  public username         : string = "";
  public shift_serial     : string = "";
  public workSite         : string = "";
  public payroll_period   : number = 0;
  public change_log       : ReportStatusLogEntry[] = [];
  public split_count      : number = 0;
  public split_from       : string = "";
  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];
  public preauthed        : boolean = false;
  public preauth_dates    : any[] = [];
  public invoiced         : boolean = false;
  public invoiced_date    : string  = "";
  public invoiced_dates   : string[] = [];
  public invoice_numbers  : any[] = [];
  public paid             : boolean = false;
  public paid_date        : string  = "";
  public premium_eligible : boolean = true;
  public billable         : boolean = true;
  public isTest           : boolean = false;
  public times_error      : boolean = false;
  public date_error       : boolean = false;

  public static fields:FieldRecord[] = [
    ["_id"             , "_id"               , 0 ] ,
    ["_rev"            , "_rev"              , 0 ] ,
    ["repairHrs"       , "repair_hours"      , 1 ] ,
    ["uNum"            , "unit_number"       , 0 ] ,
    ["wONum"           , "work_order_number" , 0 ] ,
    ["notes"           , "notes"             , 1 ] ,
    ["rprtDate"        , "report_date"       , 0 ] ,
    ["timeStarts"      , "time_start"        , 0 ] ,
    ["timeEnds"        , "time_end"          , 0 ] ,
    ["lastName"        , "last_name"         , 0 ] ,
    ["firstName"       , "first_name"        , 0 ] ,
    ["client"          , "client"            , 1 ] ,
    ["location"        , "location"          , 1 ] ,
    ["locID"           , "location_id"       , 0 ] ,
    ["shift"           , "shift_time"        , 0 ] ,
    ["shiftLength"     , "shift_length"      , 0 ] ,
    ["shiftStartTime"  , "shift_start_time"  , 0 ] ,
    ["shiftSerial"     , "shift_serial"      , 0 ] ,
    ["workSite"        , "workSite"          , 1 ] ,
    ["payrollPeriod"   , "payroll_period"    , 0 ] ,
    ["technician"      , "technician"        , 1 ] ,
    ["timeStamp"       , "timestamp"         , 0 ] ,
    ["timeStampM"      , "timestampM"        , 0 ] ,
    ["username"        , "username"          , 1 ] ,
    ["site_number"     , "site_number"       , 1 ] ,
    ["invoiced"        , "invoiced"          , 1 ] ,
    ["invoiced_dates"  , "invoiced_dates"    , 1 ] ,
    ["change_log"      , "change_log"        , 1 ] ,
    ["flagged"         , "flagged"           , 1 ] ,
    ["flagged_fields"  , "flagged_fields"    , 1 ] ,
    ["preauthed"       , "preauthed"         , 1 ] ,
    ["preauth_dates"   , "preauth_dates"     , 1 ] ,
    ["invoiced"        , "invoiced"          , 1 ] ,
    ["invoiced_date"   , "invoiced_date"     , 1 ] ,
    ["invoiced_dates"  , "invoiced_dates"    , 1 ] ,
    ["invoice_numbers" , "invoice_numbers"   , 1 ] ,
    ["crew_number"     , "crew_number"       , 1 ] ,
    ["paid"            , "paid"              , 1 ] ,
    ["paid_date"       , "paid_date"         , 1 ] ,
    ["isTest"          , "isTest"            , 1 ] ,
    ["premium_eligible", "premium_eligible"  , 1 ] ,
    ["billable"        , "billable"          , 1 ] ,
  ];

  /**
   * Create a Report object. All parameters are optional, and can be populated later from a serialized object document from database.
   * @param {*} [start] Start time for report. Should be a moment.js object. (Optional)
   * @param {*} [end] End time for report. Should be a moment.js object; will be calculated automatically most times. (Optional)
   * @param {*} [hours] Repair hours for report. Should be a number or a moment.js duration object. (Optional)
   * @param {*} [unit] Unit number for report. String. (Optional)
   * @param {*} [wo] Work Order number for report. String. (Optional)
   * @param {*} [nts] Notes for report. String. (optional)
   * @param {*} [date] Date work was performed. Should be a moment.js object or an ISO8601 string. (Optional)
   * @param {*} [last] Technician's last name. String. (Optional)
   * @param {*} [first] Technician's first name. String. (Optional)
   * @param {*} [shift] Shift type for this report (AM/PM). String. (Optional)
   * @param {*} [client] Client work was performed for. String or client name object. (Optional)
   * @param {*} [loc] Location of work site. Usually a city name. String. (Optional)
   * @param {*} [locid] Location ID of work site. MNSHOP, PMPSHP, E-TECH, etc. String. (Optional)
   * @param {*} [loc2] Auxiliary Location of work site. North, South, or NA. String. (Optional)
   * @param {*} [shiftTime] Shift type for this report (AM/PM). String. (Optional)
   * @param {*} [shiftLength] Shift length (in hours) for shift this work was peformed during. Number. (Optional)
   * @param {*} [shiftStartTime] Start time for shift this work was performed during. Number. (Optional)
   * @param {*} [tech] Full name of technician (lastname, firstname). String. (Optional)
   * @param {*} [timestamp] Time stamp representing when report was created. Unix epoch time or Excel datetime format. Number. (Optional)
   * @param {*} [user] Username of technician. String. (Optional)
   * @param {*} [serial] Serial number for shift. Excel date, plus underscore, plus shift sequence number. String. (Optional)
   * @param {*} [payroll] Payroll period number for shift. Excel date of day payroll period started (Wednesday). Number. (Optional)
   *
   * @memberof Report
   */
  constructor(start?:any, end?: any, hours?: any, unit?: any, wo?: any, nts?: any, date?: any, last?: any, first?: any, shift?: any, client?: any, loc?: any, locid?: any, loc2?: any, shiftTime?: any, shiftLength?: any, shiftStartTime?: any, tech?: any, timestamp?: any, user?: any, serial?:any, payroll?:any) {
    if(arguments.length === 1) {
      let doc = arguments[0];
      this.site_number = 0;
      this.invoiced = false;
      this.invoiced_dates = [] ;
      this.readFromDoc(doc);
    } else {
      this._id               = ""                                      ;
      this._rev              = ""                                      ;
      this.time_start        = start || this.time_start                ;
      this.time_end          = end   || this.time_end                  ;
      this.repair_hours      = hours || this.repair_hours              ;
      this.unit_number       = unit  || this.unit_number               ;
      this.work_order_number = wo    || this.work_order_number         ;
      this.crew_number       = ""                                      ;
      this.notes             = nts   || this.notes                     ;
      this.report_date       = date  || this.report_date               ;
      this.last_name         = last  || this.last_name                 ;
      this.first_name        = first || this.first_name                ;
      this.shift             = shift || this.shift                     ;
      this.client            = client|| this.client                    ;
      this.location          = loc   || this.location                  ;
      this.location_id       = locid || "MNSHOP"                       ;
      this.shift_serial      = ""                                      ;
      this.shift_time        = shiftTime      || this.shift_time       ;
      this.shift_length      = shiftLength    || this.shift_length     ;
      this.shift_start_time  = shiftStartTime || this.shift_start_time ;
      this.technician        = tech           || this.technician       ;
      this.timestamp         = timestamp      || this.timestamp        ;
      this.username          = user           || this.username         ;
      this.shift_serial      = ""                                      ;
      this.workSite          = ""                                      ;
      this.payroll_period    = 0                                       ;
      this.site_number       = -1001                                   ;
      this.invoiced          = false                                   ;
      this.invoiced_dates    = []                                      ;
      this.change_log        = []                                      ;
      this.split_count       = 0                                       ;
      this.split_from        = ""                                      ;
      this.flagged           = false                                   ;
      this.flagged_fields    = []                                      ;
      this.preauthed         = false                                   ;
      this.preauth_dates     = []                                      ;
      this.invoiced          = false                                   ;
      this.invoiced_dates    = []                                      ;
      this.invoice_numbers   = []                                      ;
    }
  }

  public readFromDoc(doc:any):Report {
    let fields = Report.fields;
      // try {
      let len = fields.length;
      for(let i = 0; i < len; i++) {
        let docKey = fields[i][0];
        let thisKey = fields[i][1];
        // this[thisKey] = doc[docKey];
        if(thisKey === 'report_date') {
          // this[thisKey] = moment(doc[docKey], "YYYY-MM-DD");
          if(typeof doc[docKey] === 'number') {
            this[thisKey] = moment().fromExcel(doc[docKey]).format("YYYY-MM-DD");
          } else if(typeof doc[docKey] === 'string') {
            let xl = Number(doc[docKey]);
            if(!isNaN(xl)) {
              this[thisKey] = moment().fromExcel(xl).format("YYYY-MM-DD");
            } else {
              this[thisKey] = doc[docKey] ? doc[docKey] : this[thisKey];
            }
          }
        } else {
          this[thisKey] = doc[docKey] ? doc[docKey] : this[thisKey];
        }
      }
      if(!this.technician) {
        this.technician = this.last_name + ", " + this.first_name;
      }

      let report_date = moment(this.report_date, "YYYY-MM-DD");

      let timestart = doc['timeStarts'];
      let timeend   = doc['timeEnds'];

      if(typeof timestart === 'string' && timestart) {
        if(timestart.length === 5) {
          let startTime = timestart.slice(0, 5).split(":");
          let hour : number  = Number(startTime[0]);
          let min  : number  = Number(startTime[1]);
          let ts:Moment = moment(report_date).startOf('day').hour(hour).minute(min);
          this.time_start = ts;
        } else {
          this.time_start = moment(timestart);
        }
      }
      // else {
      //   let start = moment(timestart);
      //   this.time_start = start;
      // }

      if(typeof timeend === 'string' && timeend) {
        if(timeend.length === 5) {
          let endTime = doc['timeEnds'].slice(0, 5).split(":");
          let hour = Number(endTime[0]);
          let min = Number(endTime[1]);
          let te = moment(report_date).startOf('day').hour(hour).minute(min);
          // this.time_end = te.format("HH:mm");
          this.time_end = te;
        } else {
          this.time_end = moment(timeend);
        }
      }
      // else {
      //   let end = moment(timeend);
      //   this.time_end = end;
      // }

      let repair_hours = doc['repairHrs'] != undefined ? doc['repairHrs'] : doc['repair_hours'] != undefined ? doc['repair_hours'] : 0;
      let hr1 = Number(repair_hours);
      if(!isNaN(hr1)) {
        this.repair_hours = hr1;
      } else {
        let repairHours = doc['repairHrs'].slice(0, 5).split(":");
        let hrs = Number(repairHours[0]);
        let min = Number(repairHours[1]);
        let hours = hrs + min/60;
        this.repair_hours = hours;
      }
      // let date = moment(this.report_date, "YYYY-MM-DD");
      if(doc['shiftSerial'] == undefined) {
        this.shift_serial = Report.getShiftSerial(report_date);
      }
      if(doc['payrollPeriod'] == undefined) {
        this.payroll_period = Report.getPayrollSerial(report_date);
      }
    // } catch(err) {
      // Log.l("REPORT.readFromDoc(): Error reading document:\n", doc);
      // Log.e(err);
      // throw new Error(err);
    // }
    return this;
  }

  public getSerializeKey(key:string):string {
    let record = Report.fields.find(a => {
      return key === a[1];
    });
    if(record) {
      return record[0];
    } else {
      let text:string = `Report.getSerializeKey(): Key '${key}' not found`;
      let err:Error = new Error(text);
      Log.e(err);
      throw err;
    }
  }

  public getDeserializeKey(key:string):string {
    let record = Report.fields.find(a => {
      return key === a[0];
    });
    if(record) {
      return record[1];
    } else {
      let text:string = `Report.getDeserializeKey(): Key '${key}' not found`;
      let err:Error = new Error(text);
      Log.e(err);
      throw err;
    }
  }

  public serialize(tech?:Employee):any {
    let fields = Report.fields;
    let doc:any = {};
    // try {
    let len = fields.length;
    for(let keypair of fields) {
      let docKey = keypair[0];
      let thisKey = keypair[1];
      if(this[thisKey] != undefined) {
        if(thisKey === 'report_date') {
        // this[thisKey] = moment(doc[docKey], "YYYY-MM-DD");
          doc[docKey] = this[thisKey];
        } else if(thisKey === 'time_start' || thisKey === 'time_end' || thisKey === 'timestampM') {
          /* All Moment objects should be included here */
          doc[docKey] = moment(this[thisKey]).format();
        } else if(Array.isArray(this[thisKey])) {
          doc[docKey] = this[thisKey].slice(0);
        } else {
          doc[docKey] = this[thisKey];
        }
      } else {
        doc[docKey] = "";
      }
    }
    return doc;
  }

  public static deserialize(doc:any):Report {
    let report = new Report();
    report.readFromDoc(doc);
    return report;
  }

  public deserialize(doc:any):Report {
    this.readFromDoc(doc);
    return this;
  }

  public clone():Report {
    // let doc:any = this.serialize();
    let doc:any = this.serialize();
    let newWO:Report = Report.deserialize(doc);

    // let keys:string[] = Object.keys(this);
    // for(let key of keys) {
    //   let value = this[key];
    //   if(moment.isMoment(value)) {
    //     newWO[key] = moment(this[key]);
    //   } else if(typeof value === 'object') {
    //     newWO[key] = oo.clone(value);
    //   } else {
    //     newWO[key] = value;
    //   }
    // }
    return newWO;
  }

  public getReportID():string {
    if(this._id) {
      return this._id;
    } else {
      return "";
    }
  }

  public static getPayrollPeriodDate(date:Moment|Date):Moment {
    let scheduleStartsOnDay:number = 3;
    let day:Moment, periodStart:Moment;
    // return this.shift_week;
    day = moment(date).startOf('day');
    if(day.isoWeekday() >= scheduleStartsOnDay) {
      periodStart = day.isoWeekday(scheduleStartsOnDay).startOf('day');
    } else {
      periodStart = moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay).startOf('day');
    }
    return periodStart;
  }

  public static getPayrollSerial(shiftDate:Moment|Date):number {
    let date:Moment          = Report.getPayrollPeriodDate(moment(shiftDate));
    let start:Moment         = moment(date).startOf('day');
    let serial:number        = start.toExcel(true);
    let serial_number:number = serial;
    return serial_number;
  }

  public static getShiftNumber(shiftDate:Moment|Date):number {
    let startDay:number = 3;
    let date:Moment = moment(shiftDate);
    let i:number = date.isoWeekday();
    return ((i + 4) % 7) + 1;
  }

  public static getShiftWeek(shiftDate:Moment|Date) {
    let scheduleStartsOnDay:number = 3;
    let day:Moment = moment(shiftDate);
    let shift_week:Moment;
    if(day.isoWeekday() >= scheduleStartsOnDay) {
      shift_week = moment(day).isoWeekday(scheduleStartsOnDay);
    } else {
      shift_week = moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    }
    return shift_week;
  }

  public static getShiftSerial(shiftDate:Moment|Date):string {
    let date:Moment = moment(shiftDate);
    let week:number = Report.getShiftWeek(date).toExcel(true);
    let num:string = sprintf("%02d", Report.getShiftNumber(date));
    let shift_serial:string = `${week}_${num}`;
    return shift_serial;
    // let num = sprintf("%02d", this.shift_number);
    // let strShiftID = `${week}_${num}`;
    // this.shift_serial = strShiftID;
    // return strShiftID;
  }

  public getRepairHours():number {
    let val = Number(this.repair_hours) || 0;
    return val;
  }

  public getRepairHoursString():string {
    let hours = this.getRepairHours();
    let h = Math.trunc(hours);
    let m = (hours - h) * 60;
    let out = sprintf("%02d:%02d", h, m);
    return out;
  }

  /**
   * Return report date as a Moment.js object or a string
   *
   * @param {(string|boolean)} [format] Either a Moment.js format string to use, or a boolean indicating default format will be used
   * @returns {(Moment|string)} Report date as either a Moment.js object or string
   * @memberof Report
   */
  public getReportDate(format?:boolean|string):Moment|string {
    if(format != undefined) {
      if(typeof format === 'string') {
        return this.getReportDateAsString(format);
      } else {
        return this.getReportDateAsString();
      }
    } else {
      return this.getReportDateAsMoment();
      // let date = moment(this.report_date, "YYYY-MM-DD");
      // return date;
      // if(typeof this.report_date === 'string') {
      //   return moment(this.report_date, "YYYY-MM-DD");
      // } else {
      //   return moment(this.report_date);
      // }
    }
  }

  /**
   * Return report date as a string.
   * Default format is "YYYY-MM-DD".
   *
   * @param {string} [format] Optional Moment.js-style format string to use
   * @returns {string} Report date formatted as a string
   * @memberof Report
   */
  public getReportDateAsString(format?:string):string {
    let date:any = this.report_date;
    if(typeof format !== 'string') {
      return date;
    } else {
      if(isMoment(date) || date instanceof Date) {
        let mo:Moment = moment(date);
        return mo.format(format);
      } else if(typeof date === 'string') {
        // return date;
        let mo = moment(date, "YYYY-MM-DD");
        return mo.format(format);
      } else {
        return moment(date).format(format);
      }
    }
  }

  /**
   * Return report date as a Moment.js object
   *
   * @returns {Moment} The report date as a Moment.js object (time is midnight local)
   * @memberof Report
   */
  public getReportDateAsMoment():Moment {
    let reportDate:any = this.report_date;
    if(isMoment(reportDate) || reportDate instanceof Date) {
      let mo:Moment = moment(reportDate);
      return mo;
    } else if(typeof reportDate === 'string') {
      let mo:Moment = moment(reportDate, "YYYY-MM-DD");
      return mo;
    } else {
      return moment(reportDate);
    }
  }

  public getReportDateAsExcel():number {
    return this.getReportDateAsMoment().toExcel(true);
  }

  public setReportDate(date:Moment|Date):string {
    let report_date = moment(date).format("YYYY-MM-DD");
    this.report_date = report_date;
    this.areTimesValid();
    return report_date;
  }

  public getStartTime():Moment {
    return moment(this.time_start);
  }

  public setStartTime(time:Date|Moment):Moment {
    this.time_start = moment(time);
    this.checkTimeCalculations(0);
    return this.time_start;
  }

  public getEndTime():Moment {
    return moment(this.time_end);
  }

  public setEndTime(time:Date|Moment):Moment {
    this.time_end = moment(time);
    this.checkTimeCalculations(1);
    return this.time_end;
  }

  public getStartTimeAsExcel():number {
    return this.getStartTime().toExcel();
  }

  public getEndTimeAsExcel():number {
    return this.getEndTime().toExcel();
  }

  public setRepairHours(durationInHours:number|Duration):number {
    if(durationInHours != undefined) {
      if(isDuration(durationInHours) || typeof durationInHours === 'number') {
        let duration:Duration = isDuration(durationInHours) ? moment.duration(durationInHours) : typeof durationInHours === 'number' ? moment.duration(durationInHours, 'hour') : moment.duration(0, 'hour');
        let hours:number = duration.asHours();
        this.repair_hours = hours;
        this.checkTimeCalculations(2);
        return this.repair_hours;
      } else {
        Log.w("Report.setRepairHours(): Need a duration or number, was given this:\n", durationInHours);
      }
    } else {
      Log.w("Report.setRepairHours(): Need a duration or number, was given this undefined/null value:\n", durationInHours);
  }
    // if(moment.isDuration(duration)) {
    //   this.repair_hours = (duration.asHours();
    //   this.checkTimeCalculations(2);
    //   return this.repair_hours;
    // } else if(typeof duration === 'number') {
    //   this.repair_hours = duration;
    //   this.checkTimeCalculations(2);
    //   return this.repair_hours;
    // } else {
    //   Log.l("Report.setRepairHours(): Need a duration or number, was given this:\n", duration);
    // }
  }

  public adjustEndTime() {
    let start = this.time_start;
    let time:any = this.repair_hours;
    let end = this.time_end;
    // Log.l("adjustEndTime(): Now adjusting end time of work report. time_start, repair_hours, and time_end are:\n", start, time, end);
    if (typeof time !== 'number') {
      if (moment.isDuration(time)) {
        time = time.asHours();
      }
    }
    if(start !== null && isMoment(start) && typeof time === 'number') {
      let newEnd = moment(start).add(time, 'hours');
      if (end.isSame(newEnd)) {
        Log.l("adjustEndTime(): No need, end time is already correct.");
      } else {
        Log.l("adjustEndTime(): Adjusting end time to:\n", newEnd);
        this.time_end = newEnd;
      }
    } else {
      Log.l("adjustEndTime(): Can't adjust end time, time_start is not a valid moment or repair_hours is not a number:\n", start, time);
    }
  }

  public checkTimeCalculations(mode:number) {
    let start = this.time_start;
    let end = this.time_end;
    let time = this.repair_hours;
    // let flag = false;
    if(isMoment(start) && isMoment(end) && start !== null && end !== null && typeof time === 'number') {
      let check = moment(start).add(time, 'hours');
      if(!check.isSame(end)) {
        Log.w("WO.checkTimeCalculations(): Start time plus repair hours does not equal end time!");
        Log.w("Start: %s\nEnd: %s\nHours: %s", start.format(), end.format(), time);
        this.adjustEndTime();
      }
    } else if(isMoment(start) && typeof time === 'number') {
      let timeEnd = moment(start).add(time, 'hours');
      this.time_end = timeEnd;
    } else if(isMoment(end) && typeof time === 'number') {
      let timeStart = moment(end).subtract(time, 'hours');
      this.time_start = timeStart;
    } else if(isMoment(start) && isMoment(end)) {
      let hours = moment(end).diff(start, 'hours', true);
      this.repair_hours = hours;
    } else {
      Log.w("Report.checkTimeCalculations(): Start or end times are not moments, or repair hours is not a number/duration!\nStart: %s\nEnd: %s\nHours: %s", start, end, time);
    }
  }

  public forceRepairHours(hours:number) {
    this.repair_hours = hours;
    this.areTimesValid();
  }

  public forceStartTime(time:Date|Moment):Moment {
    this.time_start = moment(time);
    // this.checkTimeCalculations(0);
    this.areTimesValid();
    return this.time_start;
  }

  public forceEndTime(time:Date|Moment):Moment {
    this.time_end = moment(time);
    // this.checkTimeCalculations(1);
    this.areTimesValid();
    return this.time_end;
  }

  public areTimesValid():boolean {
    let date = this.getReportDateAsMoment();
    let start = this.time_start;
    let end = this.time_end;
    let time = this.repair_hours;
    if(!isMoment(date)) {
      this.date_error = true;
      return false;
    }
    if(isMoment(start) && isMoment(end) && start !== null && end !== null && typeof time === 'number') {
      let HH:number = moment(start).hour();
      let MM:number = moment(start).minute();
      let dateStart = moment(date).add(HH, 'hours').add(MM, 'minutes');
      let checkMatchTime = moment(start).add(time, 'hours');
      if(dateStart.isSame(start)) {
        this.date_error = false;
      } else {
        this.date_error = true;
      }
      if(checkMatchTime.isSame(end)) {
        this.times_error = false;
      } else {
        this.times_error = true;
      }
    } else {
      this.times_error = true;
    }
    return !(this.date_error || this.times_error);
  }

  public genReportID(tech:Employee, lang?:string):string {
    let now = moment();
    let i8nCode = typeof lang === 'string' ? lang : "en";
    let localNow = moment(now).locale(i8nCode);
    // let idDateTime = now.format("dddDDMMMYYYYHHmmss");
    // let idDateTime = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let idDateTime = localNow.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let docID = tech.avatarName + '_' + idDateTime;
    Log.l("REPORT.genReportID(): Generated ID:", docID);
    return docID;
  }

  public matchesClient(cll:ReportCLL):boolean {
    return this.matchesOneCLL('client', cll);
  }

  public matchesLocation(cll:ReportCLL):boolean {
    return this.matchesOneCLL('location', cll);
  }

  public matchesLocID(cll:ReportCLL):boolean {
    return this.matchesOneCLL('locID', cll);
  }

  public matchesOneCLL(type:"client"|"location"|"locID"|"location_id", cll:ReportCLL):boolean {
    let me:string;
    if(type === 'client') {
      me = this.client.toUpperCase();
    } else if(type === 'location') {
      me = this.location.toUpperCase();
    } else if(type === 'locID' || type === 'location_id') {
      me = this.location_id.toUpperCase();
    } else {
      let text:string = `Report.matchesCLL(): Parameter 1 must be type: client|location|locID. Supplied type incorrect`;
      Log.w(text + ":", type);
      let err = new Error(text);
      throw err;
    }
    if(typeof cll === 'object') {
      let cll1 = typeof cll.name === 'string' ? cll.name.toUpperCase() : "";
      let cll2 = typeof cll.fullName === 'string' ? cll.fullName.toUpperCase() : "";
      return me === cll1 || me === cll2;
    } else if(typeof cll === 'string') {
      let cll1 = cll.toUpperCase();
      return me === cll1;
    } else {
      let text:string = `Report.matchesCLL(): Parameter 2 must be object "{name:string,fullName:string}" or string. Supplied value invalid`;
      Log.w(text + ":", cll);
      let err = new Error(text);
      throw err;
    }
  }

  public matchesCLL(client:ReportCLL, location:ReportCLL, locID:ReportCLL):boolean {
    return this.matchesClient(client) && this.matchesLocation(location) && this.matchesLocID(locID);
  }

  public matchesSite(site:Jobsite):boolean {
    if(!(site instanceof Jobsite)) {
      Log.w(`Report.matchesSite(): Must be called with Jobsite object. Called with:`, site);
      return false;
    } else {
      if(this.site_number && this.site_number === site.site_number) {
        // Log.l("Report: matched report to site:\n", this);
        // Log.l(site);
        return true;
      } else {
        let siteCLI = site.client.name.toUpperCase();
        let siteLOC = site.location.name.toUpperCase();
        let siteLID = site.locID.name.toUpperCase();
        let siteCLI2 = site.client.fullName.toUpperCase();
        let siteLOC2 = site.location.fullName.toUpperCase();
        let siteLID2 = site.locID.fullName.toUpperCase();
        let cli = this.client      ? this.client.toUpperCase() :      "ZZ";
        let loc = this.location    ? this.location.toUpperCase() :    "Z";
        let lid = this.location_id ? this.location_id.toUpperCase() : "ZZZZZZ";
        if((cli === siteCLI || cli === siteCLI2) && (loc === siteLOC || loc === siteLOC2) && (lid === siteLID || lid === siteLID2)) {
          // Log.l("Report: matched report to site:\n", this);
          // Log.l(site);
          return true;
        } else {
          return false;
        }
      }
    }
  }

  /**
   * Sets Jobsite-related fields in the report
   *
   * @param {Jobsite} site A Jobsite object
   * @returns {Report} The entire report
   * @memberof Report
   */
  public setSite(site:Jobsite):Report {
    if(site instanceof Jobsite) {
      this.client      = site.client.name;
      this.location    = site.location.name;
      this.location_id = site.locID.name;
      this.workSite    = site.getSiteSelectName();
      this.site_number = site.site_number;
      this.setPremiumStatus(site);
      this.setBillableStatus(site);
      return this;
    } else {
      Log.w(`Report.setSite(): Parameter 1 must be Jobsite object. Invalid parameter:`, site);
    }
  }

  /**
   * Sets user-related fields in the report
   *
   * @param {Employee} tech The Employee object to use
   * @returns {Report} The entire report
   * @memberof Report
   */
  public setUser(tech:Employee):Report {
    if(tech instanceof Employee) {
      let username:string = tech.getUsername();
      let first:string = tech.getFirstName();
      let last:string = tech.getLastName();
      let fullName:string = tech.getTechName();
      this.username = username;
      this.first_name = first;
      this.last_name = last;
      this.technician = fullName;
      return this;
    } else {
      Log.w(`Report.setUser(): Parameter 1 must be Employee object. Invalid parameter:`, tech);
      return null;
    }
  }

  public get flags():number {
    return this.flagged_fields && this.flagged_fields.length ? this.flagged_fields.length : 0;
  }

  public getFlagNumber(value:number) {
    if(this.flagged_fields && this.flagged_fields.length > value) {
      return this.flagged_fields[value];
    } else {
      Log.w(`Report.getFlagNumber(): Attempted to access flag '${value}' but flagged_fields has only ${this.flagged_fields.length} elements!`);
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
      Log.w(`Report.isFieldFlagged(): no such field '${field}'!`);
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
      return flag;
    } else {
      return undefined;
    }
  }

  public clearFlags() {
    this.flagged_fields = [];
    this.flagged = false;
  }

  public addStatusUpdate(type:ReportStatusUpdateType, username:string):ReportStatusLogEntry[] {
    let now:Moment = moment();
    let timestamp:string = now.format();
    let logEntry:ReportStatusLogEntry = {
      type     : type     ,
      user     : username ,
      timestamp: timestamp,
    };
    this.change_log.push(logEntry);
    Log.l(`Report.addStatusUpdate(): added '${type}' entry, change_log is now:\n`, this.change_log);
    return this.change_log;
  }

  public setInvoiced(invoice:number, username:string) {
    let now:Moment = moment();
    let ts:string = now.format();
    let logEntry:ReportStatusLogEntry = {
      type      : 'invoiced' ,
      user      : username   ,
      timestamp : ts         ,
      invoice   : invoice    ,
    };
    this.change_log.push(logEntry);
    this.invoiced = true;
    let invoiceDate:string = now.format("YYYY-MM-DD");
    this.invoiced_dates.push(invoiceDate);
    this.invoice_numbers.push(invoice);
  }

  public setPaid(username:string) {
    let now:Moment = moment();
    let ts:string = now.format();
    let logEntry:ReportStatusLogEntry = {
      type      : 'paid'   ,
      user      : username ,
      timestamp : ts       ,
    };
    this.change_log.push(logEntry);
    let paidDate:string = now.format("YYYY-MM-DD");
    this.paid = true;
    this.paid_date = paidDate;
    return this.change_log;
  }

  public isPremiumEligible():boolean {
    return this.premium_eligible;
  }

  public setPremiumStatus(site:Jobsite):boolean {
    if(site instanceof Jobsite) {
      if(site.premium_hours) {
        this.premium_eligible = true;
      } else {
        this.premium_eligible = false;
      }
    } else {
      let text:string = `Report.setPremiumStatus(): must be provided with Jobsite object, provided parameter invalid`;
      Log.w(text + ":", site);
      let err = new Error(text);
      Log.e(err);
      throw err;
    }
    return this.premium_eligible;
  }

  public isBillable():boolean {
    return this.billable;
  }

  public setBillableStatus(site:Jobsite):boolean {
    if(site instanceof Jobsite) {
      if(site.isBillable()) {
        this.billable = true;
      } else {
        this.billable = false;
      }
    } else {
      let text:string = `Report.setBillableStatus(): must be provided with Jobsite object, provided parameter invalid`;
      Log.w(text + ":", site);
      let err = new Error(text);
      Log.e(err);
      throw err;
    }
    return this.billable;
  }

  public getType():WorkReportType {
    return this.type;
  }

  /**
   * Returns last time this report occupies, if any
   *
   * @returns {string} ISO8601 string representing the latest time this report has a record of
   * @memberof Report
   */
  public getLastTimeBlocked():string {
    let lastTime = this.getEndTime();
    if(isMoment(lastTime)) {
      return lastTime.format();
    } else {
      Log.w(`Report.getLastTimeBlocked(): Could not find last time, apparently this report does not have any time recorded`);
      return null;
    }
  }

  // public splitReportID(reportID?:string) {
  //   let id = reportID || this._id;
  //   let splits = id.split("_");
  //   let len = splits.length;
  //   let num = 0, strNum = "", newID = "";
  //   if(splits[len - 2] === "split") {
  //     // num = Number(splits[len - 1]);
  //     num = Number(this.split_count);
  //     if(!isNaN(num)) {
  //       num++;
  //       strNum = sprintf("%02d", num);
  //       splits.pop();
  //       // splits.pop();
  //       for(let chunk of splits) {
  //         newID += chunk + "_";
  //       }
  //       newID += strNum;
  //     }
  //   } else {
  //     num = Number(this.split_count);
  //     if(!isNaN(num)) {
  //       num++;
  //       strNum = sprintf("%02d", num);
  //     // newID = id + "_split_01";
  //   }
  //   return newID;
  //   // let match = /(.*)(?:_split_)?()/g;
  // }

  // public split() {
  //   let report = this;
  //   let reportDoc = report.serialize();
  //   let newReport = new Report();
  //   newReport.readFromDoc(reportDoc);
  //   report.split_count++;
  //   newReport.split_count++;
  //   newReport._rev = "";
  //   newReport._id = this.splitReportID(report._id);
  //   let start = moment(report.time_start);
  //   let hours = report.getRepairHours();
  //   let splitHours1 = hours / 2;
  //   let splitHours2 = hours / 2;
  //   let splitMinutes1 = hours * 30;
  //   let splitMinutes2 = hours * 30;
  //   let remainder = splitMinutes1 % 30;
  //   if(remainder !== 0) {
  //     splitMinutes1 += remainder;
  //     splitMinutes2 -= remainder;
  //   }
  //   splitHours1 = splitMinutes1 / 60;
  //   splitHours2 = splitMinutes2 / 60;
  //   // let newStart = moment(start).add(splitMinutes1, 'minutes');
  //   report.setRepairHours(splitHours1);
  //   let end = moment(report.time_end);
  //   newReport.setStartTime(end);
  //   newReport.setRepairHours(splitHours2);
  // }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):Report {
    return Report.deserialize(doc);
  }
  public getClass():any {
    return Report;
  }
  public static getClassName():string {
    return 'Report';
  }
  public getClassName():string {
    return Report.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
