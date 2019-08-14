/**
 * Name: ReportTimeCard domain class
 * Vers: 2.0.1
 * Date: 2017-08-08
 * Auth: David Sargeant
 * Logs: 2.0.1 2019-08-08: Added type property and getType() method
 * Logs: 2.0.0 2019-07-24: Changed genReportID() method to use English locale for current Moment string
 * Logs: 1.2.2 2019-07-18: Minor corrections to fix TSLint errors
 * Logs: 1.2.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 1.1.2 2018-12-04: Added isTest property
 * Logs: 1.1.1 2018-10-09: Added getKeys(), isValid() methods
 * Logs: 1.0.1 2018-10-08: Initial creation, copied from new Report paradigm
 */
// import { isDuration    } from '../config'              ;
// import { Duration      } from '../config'              ;
// import { rounded       } from '../config'              ;
// import { Shift         } from './shift'                ;
// import { PayrollPeriod } from './payroll-period'       ;
import { sprintf       } from 'sprintf-js'             ;
import { Log           } from '../config'              ;
import { Moment        } from '../config'              ;
import { moment        } from '../config'              ;
import { isMoment      } from '../config'              ;
import { oo            } from '../config'              ;
import { roundedUp     } from '../config'              ;
import { ReportFlag    } from '../config/config.types' ;
import { Employee      } from './employee'             ;
import { Jobsite       } from './jobsite'              ;


type StatusUpdateType = "created" | "updated";

interface ReportStatusLogEntry {
  type       : StatusUpdateType ;
  user       : string           ;
  timestamp  : string           ;
  invoice   ?: number           ;
}

interface TimeCardEntry  {
  start : string ;
  end  ?: string ;
}

export interface ReportTimeEntry {
  start : string ;
  end  ?: string ;
}

export type ReportTimeEntries = ReportTimeEntry[];

export class ReportTimeCardDoc {
  public _id              : string = "";
  public _rev             : string = "";
  public type             : string = "timecard";
  public report_date      : string = "";
  public notes            : string = "";
  public username         : string = "";
  public last_name        : string = "";
  public first_name       : string = "";
  public client           : string = "";
  public location         : string = "";
  public locID            : string = "";
  public site_number      : number = -1001;
  public shift            : string = "AM";
  public timestamp        : number = 0;
  public timestampM       : string = "" ;
  public times            : TimeCardEntry[] = [];
  public change_log       : ReportStatusLogEntry[] = [];
  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];
  public timer_running    : boolean = false;
  public isTest           : boolean = false;
  // public premium_eligible : boolean = true;
}

export class ReportTimeCard {
  public timecard:ReportTimeCardDoc = new ReportTimeCardDoc();
  public get _id               (): string                  { return this.timecard._id                      ; }
  public get _rev              (): string                  { return this.timecard._rev                     ; }
  public get type              (): string                  { return this.timecard.type                     ; }
  public get notes             (): string                  { return this.timecard.notes                    ; }
  public get report_date       (): string                  { return this.timecard.report_date              ; }
  public get last_name         (): string                  { return this.timecard.last_name                ; }
  public get first_name        (): string                  { return this.timecard.first_name               ; }
  public get shift             (): string                  { return this.timecard.shift                    ; }
  public get client            (): string                  { return this.timecard.client                   ; }
  public get location          (): string                  { return this.timecard.location                 ; }
  public get locID             (): string                  { return this.timecard.locID                    ; }
  public get site_number       (): number                  { return this.timecard.site_number              ; }
  public get timestamp         (): number                  { return this.timecard.timestamp                ; }
  public get timestampM        (): Moment                  { return moment(this.timecard.timestampM)       ; }
  public get username          (): string                  { return this.timecard.username                 ; }
  public get change_log        (): ReportStatusLogEntry[]  { return this.timecard.change_log               ; }
  public get flagged           (): boolean                 { return this.timecard.flagged                  ; }
  public get flagged_fields    (): ReportFlag[]            { return this.timecard.flagged_fields           ; }
  public get times             (): TimeCardEntry[]         { return this.timecard.times                    ; }
  public get timer_running     (): boolean                 { return this.timecard.timer_running            ; }
  public get isTest            (): boolean                 { return this.timecard.isTest                   ; }

  public set _id               (val: string                )  { this.timecard._id                     = val ; }
  public set _rev              (val: string                )  { this.timecard._rev                    = val ; }
  public set type              (val: string                )  { this.timecard.type                    = val ; }
  public set notes             (val: string                )  { this.timecard.notes                   = val ; }
  public set report_date       (val: string                )  { this.timecard.report_date             = val ; }
  public set last_name         (val: string                )  { this.timecard.last_name               = val ; }
  public set first_name        (val: string                )  { this.timecard.first_name              = val ; }
  public set shift             (val: string                )  { this.timecard.shift                   = val ; }
  public set client            (val: string                )  { this.timecard.client                  = val ; }
  public set location          (val: string                )  { this.timecard.location                = val ; }
  public set locID             (val: string                )  { this.timecard.locID                   = val ; }
  public set site_number       (val: number                )  { this.timecard.site_number             = val ; }
  public set timestamp         (val: number                )  { this.timecard.timestamp               = val ; }
  public set timestampM        (val: Moment                )  { this.timecard.timestampM     = val.format() ; }
  public set username          (val: string                )  { this.timecard.username                = val ; }
  public set change_log        (val: ReportStatusLogEntry[])  { this.timecard.change_log              = val ; }
  public set flagged           (val: boolean               )  { this.timecard.flagged                 = val ; }
  public set flagged_fields    (val: ReportFlag[]          )  { this.timecard.flagged_fields          = val ; }
  public set times             (val: TimeCardEntry[]       )  { this.timecard.times                   = val ; }
  public set timer_running     (val: boolean               )  { this.timecard.timer_running           = val ; }
  public set isTest            (val: boolean               )  { this.timecard.isTest                  = val ; }

  /**
   * Create a ReportTimeCard object. All parameters are optional, and can be populated later from a serialized object document from database.
   * @param {*} [ReportTimeCardDoc] ReportTimeCard object. Raw JSON document. (optional)
   *
   * @memberof ReportTimeCard
   */
  // constructor(doc?:ReportTimeCardDoc) {
  constructor(doc?:any) {
    if(doc) {
      // let doc = arguments[0];
      // this.site_number = 0;
      // this.invoiced = false;
      // this.invoiced_dates = [] ;
      return this.deserialize(doc);
    } else {
      let now:Moment = moment();
      this.setReportDate(now);
      this.setTimeStamp(now);
    }
  }

  public readFromDoc(doc:ReportTimeCardDoc):ReportTimeCard {
    // let keys = Object.keys(this.timecard);
    let keys = this.getKeys();
    let docKeys = Object.keys(doc);
    for(let key of keys) {
      if(docKeys.indexOf(key) > -1) {
        this.timecard[key] = doc[key];
      }
    }
    return this;
  }

  public serialize(tech?:Employee):ReportTimeCardDoc {
    if(!this._id) {
      this._id = this.genReportID(tech);
    }
    if(!this.report_date) {
      let now:Moment = moment();
      this.setReportDate(now);
    }
    if(!this.timestamp) {
      let now:Moment = moment();
      // let ts:string = now.format();
      this.setTimeStamp(now);
    }
    return oo.clone(this.timecard);
  }

  public static deserialize(doc:ReportTimeCardDoc):ReportTimeCard {
    let report = new ReportTimeCard();
    report.readFromDoc(doc);
    return report;
  }

  public deserialize(doc:any):ReportTimeCard {
    return this.readFromDoc(doc);
    // return this;
  }

  public clone():ReportTimeCard {
    // let doc:any = this.serialize();
    let doc:ReportTimeCardDoc = this.serialize();
    let newDoc:any = oo.clone(doc);
    let newReport:ReportTimeCard = ReportTimeCard.deserialize(newDoc);

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
    return newReport;
  }

  public getReportID():string {
    if(this._id) {
      return this._id;
    } else {
      return "";
    }
  }

  public genReportID(tech:Employee, lang?:string):string {
    let username:string = tech && tech instanceof Employee ? tech.getUsername() : this.username && typeof this.username === 'string' ? this.username : "";
    if(username) {
      let now:Moment = moment();
      let i8nCode = typeof lang === 'string' ? lang : "en";
      let localNow = moment(now).locale(i8nCode);
      // let idDateTime = now.format("dddDDMMMYYYYHHmmss");
      // let idDateTime:string = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
      // let idDateTime:string = now.format("YYYY-MM-DD");
      // let idDateTime = localNow.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
      let idDateTime = localNow.format("YYYY-MM-DD");
      let docID:string = `${username}_${idDateTime}`;
      Log.l("REPORTTIMECARD.genReportID(): Generated ID:", docID);
      if(!this._id) {
        this._id = docID;
      }
      return docID;
    } else {
      let errText:string = `ReportTimeCard.genReportID(): No username found to generate ID!`;
      let err = new Error(errText);
      Log.e(err);
      throw err;
    }
  }

  public matchesSite(site:Jobsite):boolean {
    if(!(site instanceof Jobsite)) {
      Log.w(`ReportTimeCard.matchesSite(): Must be called with Jobsite object. Called with:\n`, site);
      return false;
    } else {
      if(this.site_number != undefined  && this.site_number === site.site_number) {
        // Log.l("Report: matched report to site:\n", this);
        // Log.l(site);
        return true;
      } else {
        let siteCLI:string  = site.client.name.toUpperCase();
        let siteLOC:string  = site.location.name.toUpperCase();
        let siteLID:string  = site.locID.name.toUpperCase();
        let siteCLI2 = site.client.fullName.toUpperCase();
        let siteLOC2 = site.location.fullName.toUpperCase();
        let siteLID2 = site.locID.fullName.toUpperCase();
        let cli = this.client      ? this.client.toUpperCase() :      "ZZ";
        let loc = this.location    ? this.location.toUpperCase() :    "Z";
        let lid = this.locID ? this.locID.toUpperCase() : "ZZZZZZ";
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

  public initializeTimeCard(tech:Employee, site:Jobsite):ReportTimeCard {
    Log.l(`ReportTimeCard(): Called with tech and site:`, tech, site);
    let report:ReportTimeCard = this;
    if(tech && tech instanceof Employee && site && site instanceof Jobsite) {
      this.setUser(tech);
      this.setSite(site);
      let now:Moment = moment();
      report.setReportDate(now);
      report.setTimeStamp(now);
      this.genReportID(tech);
    } else {
      Log.w(`ReportTimeCard.initializeTimeCard(): Must be provided valid Employee and Jobsite objects. These were:`);
      Log.l(tech);
      Log.l(site);
      /* Panic at the disco */
    }
    return report;
  }

  public setSite(site:Jobsite):ReportTimeCard {
    if(!(site instanceof Jobsite)) {
      Log.w(`ReportTimeCard.setSite(): Parameter 1 must be Jobsite object. This is:\n`, site);
      return null;
    } else {
      let cli:string = site.client && typeof site.client.name === 'string' ? site.client.name.toUpperCase() : "";
      let loc:string = site.location && typeof site.location.name === 'string' ? site.location.name.toUpperCase() : "";
      let lid:string = site.locID && typeof site.locID.name === 'string' ? site.locID.name.toUpperCase() : "";
      let tmp:number = Number(site.site_number);
      let sno:number = !isNaN(tmp) ? tmp : -1001;
      this.client      = cli;
      this.location    = loc;
      this.locID       = lid;
      this.site_number = sno;
      return this;
    }
  }

  public setUser(tech:Employee):ReportTimeCard {
    if(!(tech instanceof Employee)) {
      Log.w(`ReportTimeCard.setUser(): Parameter 1 must be Employee object. This is:\n`, tech);
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
      Log.w(`ReportTimeCard.getFlagNumber(): Attempted to access flag '${value}' but flagged_fields has only ${this.flagged_fields.length} elements!`);
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
      Log.w(`ReportTimeCard.isFieldFlagged(): no such field '${field}'!`);
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

  public getReportDate():string {
    // if(asString) {
      return this.getReportDateAsString();
    // } else {
    //   // let date = moment(this.report_date, "YYYY-MM-DD");
    //   // return date;
    //   if(typeof this.report_date === 'string') {
    //     return moment(this.report_date, "YYYY-MM-DD");
    //   } else {
    //     return moment(this.report_date);
    //   }
    // }
  }

  public getReportDateAsString():string {
    let reportDate:any = this.report_date;
    if(isMoment(reportDate) || reportDate instanceof Date) {
      let mo = moment(reportDate);
      return mo.format("YYYY-MM-DD");
    } else if(typeof reportDate === 'string') {
      let mo = moment(reportDate, "YYYY-MM-DD");
      return mo.format("YYYY-MM-DD");
    } else {
      return moment(reportDate).format("YYYY-MM-DD");
    }
  }

  public getReportDateAsMoment():Moment {
    let reportDate:any = this.report_date;
    if(isMoment(reportDate) || reportDate instanceof Date) {
      let mo = moment(reportDate);
      return mo;
    } else if(typeof reportDate === 'string') {
      let mo = moment(reportDate, "YYYY-MM-DD");
      return mo;
    } else {
      return moment(reportDate);
    }
  }

  public getReportDateAsExcel():number {
    return this.getReportDateAsMoment().toExcel(true);
  }

  public setReportDate(date:string|Moment|Date):Moment {
    let reportDate:Moment;
    if(typeof date === 'string') {
      reportDate = moment(date, "YYYY-MM-DD");
      if(isMoment(reportDate)) {
        this.report_date = date;
      } else {
        Log.w(`setReportDate(): Report date string must be in YYYY-MM-DD format. Invalid input: '${date}'`);
        return null;
      }
    } else if(isMoment(date) || date instanceof Date) {
      reportDate = moment(date);
      this.report_date = reportDate.format("YYYY-MM-DD");
      return reportDate;
    }
  }

  public getReportDateString():string {
    return this.getReportDate();
  }

  public setTimeStamp(tsMoment?:Moment|Date):string {
    let now:Moment = tsMoment && (isMoment(tsMoment) || tsMoment instanceof Date) ? moment(tsMoment) : moment();
    let ts:Moment = moment(now);
    if(isMoment(ts)) {
      let tsString:string = ts.format();
      let tsExcel:number = ts.toExcel();
      this.timestamp = tsExcel;
      this.timestampM = ts;
      return tsString;
    } else {
      Log.w(`ReportTimeCard.setTimeStamp(): Must provide a valid Moment or Date object as parameter 1`);
      return "";
    }
  }

  public getTimeStamp():string {
    let ts:Moment = moment(this.timestampM);
    if(isMoment(ts)) {
      let tsString:string = ts.format();
      return tsString;
    } else {
      return this.setTimeStamp();
    }
  }

  public getTimeStampMoment():Moment {
    let ts:Moment = moment(this.getTimeStamp());
    if(isMoment(ts)) {
      return ts;
    } else {
      Log.w(`ReportTimeCard.getTimeStampMoment(): Timecard does not have a valid timestamp, which hopefully is impossible`);
      let now:Moment = moment();
      this.setTimeStamp(now);
      return now;
    }
  }

  public addStatusUpdate(type:StatusUpdateType, username:string):ReportStatusLogEntry[] {
    let now:Moment = moment();
    let timestamp:string = now.format();
    let logEntry:ReportStatusLogEntry = {
      type     : type     ,
      user     : username ,
      timestamp: timestamp,
    };
    this.change_log.push(logEntry);
    Log.l(`ReportTimeCard.addStatusUpdate(): added '${type}' entry, change_log is now:\n`, this.change_log);
    return this.change_log;
  }

  /**
   * startTimer() starts the timer running
   *
   * @returns {ReportTimes} The current ReportTimes array (an array of objects with start and optional end properties, both of which are ISO8601-formatted strings representing times)
   * @memberof ReportTimeCard
   */
  public startTimer():ReportTimeEntries {
    if(this.timer_running) {
      Log.w(`ReportLogistics.startTimer(): Timer already running`);
      return null;
    } else {
      let now:Moment = moment();
      let length:number = this.times.length;
      let time:ReportTimeEntry = {
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
  public stopTimer():ReportTimeEntries {
    if(!this.timer_running) {
      Log.w(`ReportLogistics.stopTimer(): Timer not running`);
      return null;
    } else {
      // let now:Moment = moment();
      let length:number = this.times.length;
      if(length > 0) {
        let time:ReportTimeEntry = this.times[length - 1];
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

  /**
   * getTotalTime() Gets the total time for this report, in specified units ('hours' by default)
   * @param unitOfTime A string that is part of the Moment.unitOfTime.Diff type ('hours', 'minutes', 'seconds', etc.)
   * @memberof ReportTimeCard
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
          Log.w(`ReportTimeCard.getTotalTime(): Invalid endTime found:\n`, time.end);
          return null;
        }
      } else {
        let hrs:number = endTime.diff(startTime, units, true);
        hours += hrs;
      }
    }
    return hours;
  }

  /**
   * getTotalTimeString() Gets the total time for this report as a string. HH:mm:ss format (i.e. 1 hour, 1 minute, 1 second is 01:01:01). Seconds can be specified as a static method for straight-up conversion
   * @param seconds Number of seconds, which will convert them to a time string (in HH:mm:ss format)
   * @memberof ReportTimeCard
   */
  public getTotalTimeString(seconds?:number):string {
    let total:number = seconds != undefined ? seconds : this.getTotalTime('seconds');
    let hrs:number = Math.trunc(total / 3600);
    let min:number = Math.trunc((total/60) - (hrs*60));
    let sec:number = Math.round(total - (hrs * 3600) - (min * 60));
    let out:string = sprintf("%02d:%02d:%02d", hrs, min, sec);
    return out;
  }

  public getTotalTimeRoundedMinutes(roundToNearest?:number):string {
    let out:string = "00:00:00";
    let round:number = roundToNearest != undefined ? roundToNearest : 15;
    let minutes:number = this.getTotalTime('minutes');
    let roundedMinutes:number = roundedUp(minutes, round);
    if(!isNaN(roundedMinutes)) {
      let seconds:number = roundedMinutes * 60;
      out = this.getTotalTimeString(seconds);
      // let out:string = sprintf("%02d:%02d", roundedMinutes);
    } else {
      Log.w(`getTotalTimeRoundedMinutes(): error with rounding total time to nearest ${round} minutes!`);
    }
    return out;
  }

  public getTotalHoursRoundedToMinutes(roundToNearest?:number):number {
    let out:number = 0;
    let round:number = typeof roundToNearest === 'number' ? roundToNearest : 15;
    let minutes:number= this.getTotalTime('minutes');
    let roundedMinutes:number = roundedUp(minutes, round);
    if(!isNaN(roundedMinutes)) {
      let seconds:number = roundedMinutes * 60;
      let hours:number = seconds / 3600;
      out = hours;
    } else {
      Log.w(`getTotalHoursRoundedToMinutes(): Somehow got a NaN result for roundedMinutes:\n`, roundedMinutes);
    }
    return out;
  }

  public getTotalHoursRoundedToMinutesAsString(roundToNearest?:number):string {
    let out:string = "";
    let hours:number = this.getTotalHoursRoundedToMinutes(roundToNearest);
    if(!isNaN(hours)) {
      out = sprintf("%0.2f", hours);
    }
    return out;
  }

  public getClockStatus():string {
    if(this.timer_running) {
      let times = this.times;
      let count:number = times.length;
      if(count > 0) {
        let time = times[count - 1];
        if(typeof time.end === 'string') {
          return 'out';
        } else {
          return 'in';
        }
      } else {
        return 'out';
      }
    } else {
      return 'out';
    }
  }

  public isClockedIn():boolean {
    let status:string = this.getClockStatus();
    let out:boolean = false;
    if(status === 'in') {
      out = true;
    }
    return out;
  }

  public isClockPaused():boolean {
    let status:string = this.getClockStatus();
    let out:boolean = false;
    if(status === 'paused') {
      out = true;
    }
    return out;
  }

  public isTimeStarted():boolean {
    let times:ReportTimeEntries = this.times;
    let length:number = times && Array.isArray(times) ? this.times.length : 0;
    if(length > 0) {
      return true;
    }
    return false;
  }

  public isValid():boolean {
    if(!this._id || !this.username || !this.report_date) {
      return false;
    }
    let ts:Moment = this.getTimeStampMoment();
    if(!isMoment(ts)) {
      return false;
    }
    // let keys:string[] = this.getKeys();
    // for(let key of keys) {
    //   let property:any = this[key];

    // }
    return true;

  }

  public getType():string {
    return this.type;
  }

  public getKeys():string[] {
    let fakeTimeCardDoc:ReportTimeCardDoc = new ReportTimeCardDoc();
    let keys:string[] = Object.keys(fakeTimeCardDoc);
    return keys;
  }

  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):ReportTimeCard {
    return ReportTimeCard.deserialize(doc);
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return ReportTimeCard;
  }
  public static getClassName():string {
    return 'ReportTimeCard';
  }
  public getClassName():string {
    return ReportTimeCard.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
