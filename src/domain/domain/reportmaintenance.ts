/**
 * Name: ReportMaintenance domain class
 * Vers: 1.1.2
 * Date: 2019-08-30
 * Auth: David Sargeant
 * Logs: 1.1.2 2019-08-30: Added check at end of deserialize() method to add a notes field if one does not exist
 * Logs: 1.1.1 2019-08-22: Added getTotalTimeStringHoursMinutes() method
 * Logs: 1.1.0 2019-08-20: Added getLastTimeBlocked() method
 * Logs: 1.0.2 2019-08-19: Added optional time parameter to endTask() method
 * Logs: 1.0.1 2019-08-19: Added startTask(),endTask() methods; Added more types; Added static properties for words
 * Logs: 1.0.0 2019-08-16: Initial creation, derived from ReportMaintenance
 */

// import { roundToNearest    } from '../config'              ;
// import { isNumeric         } from '../config'              ;
// import { Shift             } from './shift'                ;
// import { PayrollPeriod     } from './payroll-period'       ;
import { sprintf           } from 'sprintf-js'             ;
import { Log               } from '../config'              ;
import { Moment            } from '../config'              ;
import { isMoment          } from '../config'              ;
import { moment            } from '../config'              ;
import { roundUpToNearest  } from '../config'              ;
import { validateVIN       } from '../config'              ;
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

export type MaintenanceTaskType = "mechanical"|"electronic";
export type MechanicalWord = string;
export type ElectronicWord = string;
export type MaintenanceVerb = string;
export type NounAny = MechanicalWord|ElectronicWord;
export type WordAny = MechanicalWord|ElectronicWord|MaintenanceVerb;
export type MechanicalWords = MechanicalWord[];
export type ElectronicWords = ElectronicWord[];
export type MaintenanceNouns = Array<MechanicalWord|ElectronicWord>;
export type MaintenanceVerbs = MaintenanceVerb[];
export type TaskNouns = MechanicalWords|ElectronicWords;
export type TaskVerbs = MaintenanceVerbs;
export type WordsAny = Array<MechanicalWord|ElectronicWord|MaintenanceVerb>;

export interface MaintenanceTask {
  type   : MaintenanceTaskType;
  noun   : NounAny;
  verb   : MaintenanceVerb;
  start  : string;
  end    : string;
  techs  : string[];
  notes ?: string;
}

export type MaintenanceTasks = MaintenanceTask[];

export class ReportMaintenance {
  public static MWORDS : MechanicalWords;
  public static EWORDS : ElectronicWords;
  public static VERBS  : MaintenanceVerbs;
  public get MWORDS():MechanicalWords { return ReportMaintenance.MWORDS; }
  public get EWORDS():ElectronicWords { return ReportMaintenance.EWORDS; }
  public get VERBS():MaintenanceVerbs { return ReportMaintenance.VERBS; }
  public set MWORDS(val:MechanicalWords) { ReportMaintenance.MWORDS = val; }
  public set EWORDS(val:ElectronicWords) { ReportMaintenance.EWORDS = val; }
  public set VERBS(val:MaintenanceVerbs) { ReportMaintenance.VERBS = val; }
  // public get NOUNS():MechanicalWords|ElectronicWords { if(this.type ==)}
  public _id              : string = "";
  public _rev             : string = "";
  public type             : string = "maintenance";
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

  public vin              : string = "";
  public unit_number      : string = "";
  public mileage          : number = 0;
  public engine_hours     : number = 0;

  public tasks            : MaintenanceTasks = [];

  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];
  public isTest           : boolean = false;

  constructor(possibleDoc?:any) {
    if(!Array.isArray(ReportMaintenance.MWORDS)) {
      ReportMaintenance.MWORDS = [];
    }
    if(!Array.isArray(ReportMaintenance.EWORDS)) {
      ReportMaintenance.EWORDS = [];
    }
    if(!Array.isArray(ReportMaintenance.VERBS)) {
      ReportMaintenance.VERBS = [];
    }
    if(possibleDoc) {
      return this.deserialize(possibleDoc);
    }
  }

  public static createMaintenanceTask({type="mechanical",noun="",verb="",start="", end="",notes="",techs=[]}:MaintenanceTask|null|undefined):MaintenanceTask {
    let record:MaintenanceTask = {
      type  : type   ,
      noun  : noun   ,
      verb  : verb   ,
      start : start  ,
      end   : end    ,
      notes : notes  ,
      techs : techs  ,
    };
    return record;
  }

  public createMaintenanceTask = ReportMaintenance.createMaintenanceTask;

  // public static roundToNearest(value:number, roundToNearest?:number):number {
  //   let RTN = !isNaN(Number(roundToNearest)) ? Number(roundToNearest) : 1;
  //   if(RTN <= 0) {
  //     RTN = 1;
  //   }
  //   let out = Math.round(value / RTN) * RTN;
  //   return out;
  // }

  public deserialize(doc:any):ReportMaintenance {
    let docKeys = Object.keys(doc);
    let classKeys = Object.keys(this);
    for(let key of docKeys) {
      let lcKey:string = key.toLowerCase();
      let value:any = doc[key];
      if(classKeys.indexOf(key) > -1) {
        if(lcKey === 'tasks') {
          this[key] = doc[key];
        } else if(lcKey.includes('location')) {
          if(value && value.coords != undefined && value.timestamp != undefined) {
            let val:OnSiteGeolocation = new OnSiteGeolocation(value);
            this[key] = val;
          } else {
            this[key] = value;
          }
        } else if(key === 'futureSpecialKey') {
        } else {
          this[key] = doc[key];
        }
      }
    }
    if(Array.isArray(this.tasks)) {
      for(let task of this.tasks) {
        if(typeof task.notes === 'undefined') {
          task.notes = "";
        }
      }
    }
    return this;
  }

  public static deserialize(doc:any):ReportMaintenance {
    let report:ReportMaintenance = new ReportMaintenance(doc);
    return report;
  }

  public serialize():any {
    Log.l("ReportMaintenance.serialize(): Now serializing report …");
    // let ts = moment(this.timestamp);
    // Log.l("ReportMaintenance.serialize(): timestamp moment is now:\n", ts);
    // let XLDate = moment([1900, 0, 1]);
    // let xlStamp = ts.diff(XLDate, 'days', true) + 2;
    // this.timestamp = xlStamp;
    let doc:any = {};
    // this._id = this._id || this.genReportID(tech);
    let keys:string[] = this.getKeys();
    for(let key of keys) {
      let value = this[key];
      if(key === '_rev') {
        if(this[key]) {
          doc[key] = this[key];
        }
      } else if(typeof value === 'function') {
        continue;
      } else if(key === 'timestampM') {
        // doc[key] = this[key].format();
        doc[key] = this[key];
      } else if(key === 'report_dateM') {
        // doc[key] = this[key].format();
        doc[key] = this[key];
      } else {
        if(value && typeof value.isOnSite === 'function' && value.isOnSite() && typeof value.toJSON === 'function' && value.toJSON()) {
          doc[key] = value.toJSON();
        } else if(value != undefined) {
          doc[key] = this[key];
        } else {
          Log.w(`ReportMaintenance.serialize(): property '${key}' does not exist`);
        }
      }
    }
    if(doc._rev === "") {
      delete doc._rev;
    }
    Log.l(`ReportMaintenance.serialize(): Serialized report is:`, doc);
    return doc;
  }

  public clone():ReportMaintenance {
    // let doc:any = this.serialize();
    // let doc:any = this.serialize();
    let newDoc:any = oo.clone(this);
    // return ReportMaintenance.deserialize(newDoc);
    return new ReportMaintenance(newDoc);
    // let newRL:ReportMaintenance = new ReportMaintenance();
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
      Log.l("REPORTMAINTENANCE.genReportID(): Generated ID:", docID);
      if(!this._id) {
        this._id = docID;
      }
      return docID;
    } else {
      let errText:string = `REPORTMAINTENANCE.genReportID(): No username found and no Employee object provided as parameter 1, cannot generate ID!`;
      Log.e(errText + ":", this);
      throw new Error(errText);
    }
  }

  public setTimeStamp(datetime?:string|Moment|Date):string {
    let ts:Moment, datetimeXL:number, strDateTime:string;
    if(!datetime) {
      ts = moment();
    } else if(typeof datetime === 'string') {
      ts = moment(datetime, "YYYY-MM-DDTHH:mm:ssZ", true);
    } else if(isMoment(datetime) || datetime instanceof Date) {
      ts = moment(datetime);
    }
    if(isMoment(ts)) {
      datetimeXL = ts.toExcel(true);
      strDateTime = ts.format();
    } else {
      Log.w(`ReportMaintenance.setTimeStamp(): Parameter 1 must be Moment, Date, or string in 'YYYY-MM-DDTHH:mm:ssZ' format, or empty. Invalid input:`, datetime);
      return null;
    }
    this.timestamp = datetimeXL;
    this.timestampM = strDateTime;
    return strDateTime;
  }

  public initialize(tech:Employee, site:Jobsite, reportDate?:Date|Moment):ReportMaintenance {
    let report:ReportMaintenance = this;
    let date:Moment = reportDate != undefined ? moment(reportDate) : moment();
    if(!isMoment(date)) {
      Log.w(`ReportMaintenance.initialize(): reportDate was provided but was not a valid Date or Moment:\n`, reportDate);
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
      Log.w(`ReportMaintenance.initialize(): Must be provided valid Employee and Jobsite objects. These were:`);
      Log.l(tech);
      Log.l(site);
      /* Panic at the disco */
    }
    return report;
  }

  public setSite(site:Jobsite):ReportMaintenance {
    if(!(site instanceof Jobsite)) {
      Log.w(`ReportMaintenance.setSite(): Parameter 1 must be Jobsite object. Invalid parameter:`, site);
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
   * @returns {ReportMaintenance} The entire report
   * @memberof ReportMaintenance
   */
  public setUser(tech:Employee):ReportMaintenance {
    if(!(tech instanceof Employee)) {
      Log.w(`ReportMaintenance.setUser(): Parameter 1 must be Employee object. Invalid parameter:`, tech);
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

  public startTask(type:MaintenanceTaskType, noun:NounAny, verb:MaintenanceVerb, time?:Date|Moment|string):MaintenanceTasks {
    if(this.isTaskActive()) {
      Log.w(`ReportMaintenance.startTask(): Task already started and not ended. Please end current task first.`);
      return null;
    }
    let datetime = moment(time);
    if(!isMoment(time)) {
      datetime = moment();
    }
    let techs:string[] = [
      this.username,
    ];
    let task:MaintenanceTask = {
      type: type,
      noun: noun,
      verb: verb,
      start: datetime.format(),
      end: "",
      techs: techs,
      notes: "",
    };
    let newTask = this.createMaintenanceTask(task);
    this.tasks.push(newTask);
    return this.tasks;
  }

  public endTask(time?:Date|Moment|string):MaintenanceTasks {
    let datetime = moment(time);
    if(!isMoment(datetime)) {
      datetime = moment();
    }
    if(!this.isTaskActive()) {
      Log.w(`ReportMaintenance.endTask(): No task is active, please start a task first.`);
      return null;
    }
    let task = this.getLatestTask();
    task.end = datetime.format();
    return this.tasks;
  }

  public get flags():number {
    return this.flagged_fields && this.flagged_fields.length ? this.flagged_fields.length : 0;
  }

  public getFlagNumber(value:number) {
    if(this.flagged_fields && this.flagged_fields.length > value) {
      return this.flagged_fields[value];
    } else {
      Log.w(`ReportMaintenance.getFlagNumber(): Attempted to access flag '${value}' but flagged_fields has only ${this.flagged_fields.length} elements!`);
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
      Log.w(`ReportMaintenance.isFieldFlagged(): no such field '${field}'!`);
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
      Log.w(`ReportMaintenance.setReportDate(): Parameter 1 must be a Moment, Date, or string with format 'YYYY-MM-DD'. Invalid input:`, date);
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
   * @memberof ReportMaintenance
   */
  public getReportDateString(format?:string):string {
    let fmt = format && typeof format === 'string' ? format : "YYYY-MM-DD";
    let date = this.getReportDateMoment();
    return date.format(fmt);
  }

  /**
   * Returns report date as a Moment.js object
   *
   * @returns {Moment} Report date as a new Moment.js object
   * @memberof ReportMaintenance
   */
  public getReportDateMoment():Moment {
    let date:string = this.getReportDate();
    let mo:Moment = moment(date, "YYYY-MM-DD", true);
    if(isMoment(mo)) {
      // this.report_dateM = moment(mo);
      return mo;
    } else {
      Log.l(`ReportMaintenance.getReportDateMoment(): Could not find valid report date to return as Moment! Report date is:`, this.report_date);
      return null;
    }
  }

  /**
   * Get total hours for a task
   *
   * @returns {number}
   * @memberof ReportMaintenance
   */
  public getTaskHours(task:MaintenanceTask):number {
    let start = moment(task.start);
    let end = moment(task.end);
    if(isMoment(start) && isMoment(end)) {
      return end.diff(start, 'hours', true);
    } else {
      Log.w(`ReportMaintenance.getTaskHours(): Could not get hours for task:`, task);
      return 0;
    }
  }

  /**
   * Get total hours spent on this report
   *
   * @returns {number}
   * @memberof ReportMaintenance
   */
  public getTotalWorkHours():number {
    let total = 0;
    for(let task of this.tasks) {
      let duration = this.getTaskHours(task);
      total += duration;
    }
    return total;
  }

  /**
   * Gets the total time for this report, in specified units ('hours' by default).
   * If a trip is currently started, includes current elapsed time.
   * @param unitOfTime A string that is part of the Moment.unitOfTime.Diff type ('hours', 'minutes', 'seconds', etc.)
   * @param [roundToNearest] Number of minutes to round to nearest; 15 will round to nearest quarter-hour
   * @memberof ReportMaintenance
   */
  public getTotalRunningWorkHours(unitOfTime?:moment.unitOfTime.Diff|number, roundToNearest?:number):number {
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
    for(let task of this.tasks) {
      let start:Moment, end:Moment;
      if(task.end == undefined) {
        end = moment(now);
      } else {
        end = moment(task.end);
      }
      start = moment(task.start);
      if(isMoment(end) && isMoment(start)) {
        let hrs:number = end.diff(start, units, true);
        hours += hrs;
      } else {
        Log.w(`ReportMaintenance.getTotalRunningWorkHours(): Invalid time found in task:`, task);
      }
    }
    return hours;
  }

  /**
   * Gets the total running time for this report (or for the provided number of seconds) as a string of format HH:mm:ss
   *
   * @param {number} [seconds] If provided, format this number of seconds instead of the total time
   * @returns {string} Time string of the format HH:mm:ss
   * @memberof ReportMaintenance
   */
  public getTotalRunningWorkHoursString(seconds?:number):string {
    let total:number = seconds != undefined ? seconds : this.getTotalRunningWorkHours('seconds');
    let hrs:number = Math.trunc(total / 3600);
    let min:number = Math.trunc((total/60) - (hrs*60));
    let sec:number = Math.round(total - (hrs * 3600) - (min * 60));
    let out:string = sprintf("%02d:%02d:%02d", hrs, min, sec);
    return out;
  }

  /**
   * Gets the total recorded time for this report, in specified units ('hours' by default).
   * Currently started (but not ended) tasks not included.
   * @param unitOfTime A string that is part of the Moment.unitOfTime.Diff type ('hours', 'minutes', 'seconds', etc.)
   * @param [roundToNearest] Number of minutes to round to nearest; 15 will round to nearest quarter-hour
   * @memberof ReportMaintenance
   */
  public getTotalTime(unitOfTime?:moment.unitOfTime.Diff|number, roundToNearest?:number):number {
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
    for(let task of this.tasks) {
      let start:Moment, end:Moment;
      if(task.end == undefined) {
        continue;
      } else {
        end = moment(task.end);
      }
      start = moment(task.start);
      if(isMoment(end) && isMoment(start)) {
        let hrs:number = end.diff(start, units, true);
        hours += hrs;
      } else {
        Log.w(`ReportMaintenance.getTotalTime(): Invalid time found in portion:`, task);
      }
    }
    if(round) {
      let mins = hours * 60;
      // mins = ReportMaintenance.roundToNearest(hours, round);
      mins = roundUpToNearest(mins, round);
      let hrs = mins / 60;
      hours = hrs;
    }
    return hours;
  }

  /**
   * Gets the total time for this report (or for the provided number of seconds) as a string of format HH:mm:ss
   *
   * @param {number} [seconds] If provided, format this number of seconds instead of the total time
   * @returns {string} Time string of the format HH:mm:ss
   * @memberof ReportMaintenance
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
   * Gets the total time for this report (or for the provided number of seconds) as a string of format HH:mm
   *
   * @param {number} [seconds] If provided, format this number of seconds instead of the total time
   * @returns {string} Time string of the format HH:mm
   * @memberof ReportMaintenance
   */
  public getTotalTimeStringHoursMinutes(seconds?:number):string {
    let total:number = seconds != undefined ? seconds : this.getTotalTime('seconds');
    let hrs:number = Math.trunc(total / 3600);
    let min:number = Math.trunc((total/60) - (hrs*60));
    // let sec:number = Math.round(total - (hrs * 3600) - (min * 60));
    let out:string = sprintf("%02d:%02d", hrs, min);
    return out;
  }

  /**
   * Checks to see if this report has an active task (started but not finished)
   *
   * @returns {boolean} True if report has an active task, false otherwise
   * @memberof ReportMaintenance
   */
  public isTaskActive():boolean {
    let task = this.getLatestTask();
    if(task && task.start && !task.end) {
      return true;
    }
    return false;
  }

  /**
   * Returns number of tasks started so far.
   *
   * @returns {number} The number of tasks started (completion doesn't matter). Basically just the length of this object's tasks property.
   * @memberof ReportMaintenance
   */
  public getTaskCount():number {
    let count = Array.isArray(this.tasks) ? this.tasks.length : 0;
    return count;
  }

  /**
   * Returns number of tasks started and completed so far. If a tasks is started but not yet completed, add 0.5.
   *
   * @returns {number} 0 if no tasks exist. 0.5 if one tasks started but not completed. 1 for one tasks completed. And so forth.
   * @memberof ReportMaintenance
   */
  public getTaskCountExact():number {
    let count = 0;
    let len = Array.isArray(this.tasks) ? this.tasks.length : 0;
    if(len > 0) {
      for(let portion of this.tasks) {
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
   * Get latest MaintenanceTask, if one exists
   *
   * @returns {MaintenanceTask} The last task that was added to the tasks array
   * @memberof ReportMaintenance
   */
  public getLatestTask():MaintenanceTask {
    let len = Array.isArray(this.tasks) ? this.tasks.length : 0;
    let idx = len - 1;
    let task = this.tasks[idx];
    if(task) {
      return task;
    } else {
      // Log.w(`ReportMaintenance.getLatestTask(): Could not find a task to return for report:`, this.tasks);
      return null;
    }
  }

  /**
   * Returns last time this report occupies, if any
   *
   * @returns {string} ISO8601 string representing the latest time this report has a record of
   * @memberof ReportMaintenance
   */
  public getLastTimeBlocked():string {
    let tasks = this.tasks.slice(0);
    let lastTime:Moment;
    for(let task of tasks) {
      if(!task.end) {
        continue;
      } else {
        let currentTaskEndTime = moment(task.end);
        if(isMoment(currentTaskEndTime)) {
          if(!lastTime) {
            lastTime = moment(currentTaskEndTime);
          } else if(lastTime.isBefore(currentTaskEndTime)) {
            lastTime = moment(currentTaskEndTime);
          }
        }
      }
    }
    if(isMoment(lastTime)) {
      return lastTime.format();
    } else {
      Log.w(`ReportMaintenance.getLastTimeBlocked(): Could not find last time, apparently this report does not have any time recorded`);
      return null;
    }
  }

  public getTaskNouns(task:MaintenanceTask|MaintenanceTaskType):TaskNouns {
    let taskType:MaintenanceTaskType;
    if(task && typeof task === 'string') {
      taskType = task;
    } else if(task && typeof task === 'object' && typeof task.type === 'string') {
      taskType = task.type;
    } else {
      let text = `ReportMaintenance.getTaskNouns(): Parameter 1 must be task or task type. Invalid parameter`;
      Log.w(text + ":", task);
      return null;
    }
    if(taskType === 'mechanical') {
      return this.MWORDS;
    } else if(taskType === 'electronic') {
      return this.EWORDS;
    } else {
      let text = `ReportMaintenance.getTaskNouns(): Invalid task type, must be 'mechanical'|'electronic'`;
      Log.w(text + ":", task);
      return null;
    }
  }

  public getTaskVerbs(task:MaintenanceTask|MaintenanceTaskType):TaskVerbs {
    let taskType:MaintenanceTaskType;
    if(task && typeof task === 'string') {
      taskType = task;
    } else if(task && typeof task === 'object' && typeof task.type === 'string') {
      taskType = task.type;
    } else {
      let text = `ReportMaintenance.getTaskVerbs(): Parameter 1 must be task or task type. Invalid parameter`;
      Log.w(text + ":", task);
      return null;
    }
    if(taskType === 'mechanical') {
      return this.VERBS;
    } else if(taskType === 'electronic') {
      return this.VERBS;
    } else {
      let text = `ReportMaintenance.getTaskVerbs(): Invalid task type, must be 'mechanical'|'electronic'`;
      Log.w(text + ":", task);
      return null;
    }
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
  public static fromJSON(doc:any):ReportMaintenance {
    return ReportMaintenance.deserialize(doc);
  }
  public getClass():any {
    return ReportMaintenance;
  }
  public static getClassName():string {
    return 'ReportMaintenance';
  }
  public getClassName():string {
    return ReportMaintenance.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}
