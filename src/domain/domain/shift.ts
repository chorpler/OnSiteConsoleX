/**
 * Name: Shift domain class
 * Vers: 8.0.1
 * Date: 2019-08-26
 * Auth: David Sargeant
 * Logs: 8.0.1 2019-08-21: Added ReportTimeCard capabilities
 * Logs: 8.0.0 2019-08-20: Changed how getNextReportStartTime() method works to account for all different ReportReals
 * Logs: 7.3.1 2019-08-16: Added ReportMaintenance capabilities
 * Logs: 7.2.3 2019-08-13: Changed SiteShiftType types to SiteScheduleType
 * Logs: 7.2.2 2019-08-07: Added getShiftDateString(),isDate() methods
 * Logs: 7.2.1 2019-08-05: Added ReportDriving capabilities
 * Logs: 7.1.2 2019-07-25: Changed how removeLogisticsReport() finds index, and added types
 * Logs: 7.1.1 2019-07-18: Changed how readFromDoc() method works, although this method is so far unused since Shift is not serialized to database at all
 * Logs: 7.0.1 2019-07-17: Changed all instances of "bonus" hours to "premium" hours; now using Report class's premium property
 * Logs: 6.7.2 2019-07-01: Added SiteScheduleType import; minor TSLint error fixes
 * Logs: 6.7.1 2019-01-02: Added logistics reports to getShiftStatus() output
 * Logs: 6.6.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 6.5.1 2018-12-07: Major refactor, added serialize(), deserialize(), updateLocale() methods
 * Logs: 6.4.1 2018-10-01: Added logistics hours to getNormalHours() method
 * Logs: 6.3.1 2018-09-26: Added ReportLogistics import, logistics_reports property, added methods getLogisticsReports(), setLogisticsReports(), addLogisticsReport(), removeLogisticsReport(), getShiftLogisticsHours()
 * Logs: 6.2.1 2018-08-08: Slightly changed premium hours calculation (but it still needs to be pulled from Jobsite, not report client)
 * Logs: 6.1.1 2018-06-05: Added timesheet property
 * Logs: 6.0.1 2018-05-31: Changed the way bonus hours are calculated (3 extended hours is only for > 8 hours, not >= 8 hours) and added error check to _sortReports() function
 * Logs: 5.4.2 2018-02-21: Changed getShiftStatus() to fix coloring for S shift lengths with work reports
 * Logs: 5.4.1 2018-02-21: Changed getShiftStatus() return value for T/Q/M/V shifts with work reports
 * Logs: 5.3.1 2018-02-12: Mike changed getShiftStatus() logic significantly without updating all versions of Shift. For shame.
 * Logs: 5.2.1 2018-02-09: Added getShiftTimeline() method
 * Logs: 5.1.1 2018-02-08: Added getFlaggedReports() method
 * Logs: 5.0.2 2018-01-29: Added getAllShiftHours() method
 * Logs: 5.0.1 2017-12-15: Merged app and console versions
 * Logs: 4.2.2 2017-12-04: Added getBillableHours method
 * Logs: 4.2.1 2017-11-13: Added getShiftName method
 * Logs: 4.1.1 2017-08-22: Unknown
 */

/**
 * TODO: 2018-08-08: Premium hours need to be changed to pull from Jobsite property, not just check report client
 */

import { oo                } from '../config'           ;
import { sprintf           } from 'sprintf-js'          ;
import { Log               } from '../config'           ;
import { Moment            } from '../config'           ;
import { isMoment          } from '../config'           ;
import { moment            } from '../config'           ;
import { Jobsite           } from './jobsite'           ;
import { Employee          } from './employee'          ;
import { Report            } from './report'            ;
import { ReportOther       } from './reportother'       ;
import { ReportLogistics   } from './reportlogistics'   ;
import { ReportDriving     } from './reportdriving'     ;
import { ReportMaintenance } from './reportmaintenance' ;
import { ReportTimeCard    } from './reporttimecard'    ;
import { ReportAny         } from './reportany'         ;
import { ReportReal        } from './reportany'         ;
import { Timesheet         } from './timesheet'         ;
import { SiteScheduleType  } from './jobsite'           ;

const _sortReports = (a:Report, b:Report): number => {
  if(a instanceof Report && b instanceof Report) {
    let dateA:any  = moment(a.report_date).startOf('day');
    let dateB:any  = moment(b.report_date).startOf('day');
    let startA = moment(a.time_start);
    let startB = moment(b.time_start);
    // dateA  = isMoment(dateA)  ? dateA  : moment(dateA).startOf('day');
    // dateB  = isMoment(dateB)  ? dateB  : moment(dateB).startOf('day');
    // startA = isMoment(startA) ? startA : moment(startA);
    // startB = isMoment(startB) ? startB : moment(startB);
    return dateA.isBefore(dateB) ? -1  : dateA.isAfter(dateB) ? 1 : startA.isBefore(startB) ? -1 : startA.isAfter(startB) ? 1 : 0;
  } else {
    return 0;
  }
};

const _sortRealReports = (a:ReportReal, b:ReportReal):number => {
  if(a && b && a.report_date != undefined && b.report_date != undefined && !(a instanceof ReportOther || b instanceof ReportOther)) {
    let dateA:any  = moment(a.report_date).startOf('day');
    let dateB:any  = moment(b.report_date).startOf('day');
    let startA = a.getLastTimeBlocked();
    let startB = b.getLastTimeBlocked();
    // dateA  = isMoment(dateA)  ? dateA  : moment(dateA).startOf('day');
    // dateB  = isMoment(dateB)  ? dateB  : moment(dateB).startOf('day');
    // startA = isMoment(startA) ? startA : moment(startA);
    // startB = isMoment(startB) ? startB : moment(startB);
    return startA > startB ? 1 : startA < startB ? -1 : 0;
  } else {
    return 0;
  }
};

export interface ShiftColors {
  red:boolean;
  green:boolean;
  blue:boolean;
}

export interface ShiftXLDates {
  shift_time:number;
  shift_week:number;
  current_payroll_week:number;
  today_XL?:number;
  shift_id?:number;
  next_week_XL?:number;
}
// const enum ReportType {
//   'standby'  = 0,
//   'training' = 1,
//   'travel'   = 2,
//   'holiday'  = 3,
//   'vacation' = 4,
//   'sick'     = 5,
// };

// const enum reportType {
//   'Standby'     = 0,
//   'Training'    = 1,
//   'Travel'      = 2,
//   'Holiday'     = 3,
//   'Vacation'    = 4,
//   'Sick'        = 5,
//   'Work Report' = 6,
// };

export class Shift {
  public static _sortReports = _sortReports;
  public static _sortRealReports = _sortRealReports;
  public site_name           :string  = ""              ;
  public shift_id            :number  = -1              ;
  public shift_week_id       :number  = -1              ;
  public payroll_period      :number  = -1              ;
  public shift_week          :Moment                    ;
  public shift_time          :SiteScheduleType = "AM"   ;
  public start_time          :Moment                    ;
  public shift_length        :string|number = -1        ;
  public shift_number        :number = -1               ;
  public current_payroll_week:Moment                    ;
  public shift_serial        :string = ""               ;
  public shift_hours         :number = 0                ;
  public shift_reports       :Report[]      = []        ;
  public other_reports       :ReportOther[] = []        ;
  public logistics_reports   :ReportLogistics[]  = []   ;
  public driving_reports     :ReportDriving[]  = []     ;
  public maintenance_reports :ReportMaintenance[]  = [] ;
  public timecard_reports    :ReportTimeCard[]  = []    ;
  public site                :Jobsite                   ;
  public tech                :Employee                  ;
  public timesheet           :Timesheet                 ;
  public colors              :ShiftColors = {
    red:false,
    blue:false,
    green:false,
  };
  public XL                  :ShiftXLDates = {
    shift_time: null,
    shift_week: null,
    current_payroll_week: null,
  };

  constructor(doc?:any) {
    // if(arguments.length == 1 && typeof arguments[0] == 'object') {
      // this.readFromDoc(arguments[0]);
    if(doc != undefined) {
      return this.deserialize(doc);
    } else {
      return this.initializeShift();
      // this.site_name      = site_name    || ''       ;
      // this.shift_week     = shift_week   || ''       ;
      // this.shift_time     = shift_time   || 'AM'     ;
      // this.start_time     = start_time   || ''       ;
      // this.shift_length   = shift_length || -1       ;
      // this.shift_id       = -1                       ;
      // this.shift_number   = -1                       ;
      // this.shift_week_id  = -1                       ;
      // this.payroll_period = null                     ;
      // this.shift_serial   = null                     ;
      // this.shift_hours    = 0                        ;
      // this.shift_reports  = this.shift_reports || [] ;
      // this.other_reports  = this.other_reports || [] ;
      // this.site           = null                     ;
      // this.tech           = null                     ;
    }
  }

  public initializeShift(site_name?:string, shift_week?:Moment, shift_time?:SiteScheduleType, start_time?:Moment, shift_length?:string|number):Shift {
    this.site_name    = site_name    != undefined ? site_name    : this.site_name    ;
    this.shift_week   = shift_week   != undefined ? shift_week   : this.shift_week   ;
    this.shift_time   = shift_time   != undefined ? shift_time   : this.shift_time   ;
    this.start_time   = start_time   != undefined ? start_time   : this.start_time   ;
    this.shift_length = shift_length != undefined ? shift_length : this.shift_length ;
    // this.timesheet    = new Timesheet();
    this.updateShiftNumber();
    this.getShiftWeek();
    this.getShiftColor();
    this.getCurrentPayrollWeek();
    this.getExcelDates();
    this.getShiftNumber();
    this.getShiftSerial();
    return this;
  }

  public readFromDoc(doc:any):Shift {
    // for(let prop in doc) {
    //   this[prop] = doc[prop];
    // }
    // this.getShiftColor();
    // return this;
    let docKeys = Object.keys(doc);
    let myKeys = Object.keys(this);
    for(let docKey of docKeys) {
      if(myKeys.includes(docKey)) {
        let value:any = doc[docKey];
        if(docKey === 'start_date' || docKey === 'end_date') {
          this[docKey] = moment(value);
        } else {
          this[docKey] = value;
        }
      }
    }
    this.getShiftColor();
    return this;
  }

  public serialize():any {
    let doc:any = {};
    let keys:string[] = this.getKeys();
    for(let key of keys) {
      let value:any = this[key];
      if(isMoment(value)) {
        let val:string = value.format();
        doc[key] = val;
      } else if(typeof value === 'object') {
        // let val:any = oo.clone(value);
        doc[key] = value;
      } else {
        doc[key] = value;
      }
    }
    return doc;
  }

  public deserialize(doc:any):Shift {
    let myKeys:string[] = this.getKeys();
    let docKeys:string[] = Object.keys(doc);
    let moments:string[] = [
      'shift_week',
      'start_time',
      'current_payroll_week',
    ];
    for(let key of docKeys) {
      if(myKeys.indexOf(key) > -1) {
        if(moments.indexOf(key) > -1) {
          let value:Moment = moment(doc[key]);
          this[key] = value;
        } else {
          this[key] = doc[key];
        }
      }
    }
    this.getShiftColor();
    return this;
  }

  public static deserialize(doc:any):Shift {
    let shift:Shift = new Shift(doc);
    return shift;
  }

  public updateLocale(language:string) {
    if(isMoment(this.shift_week)) {
      this.shift_week.locale(language);
    }
    if(isMoment(this.start_time)) {
      this.start_time.locale(language);
    }
    if(isMoment(this.current_payroll_week)) {
      this.current_payroll_week.locale(language);
    }
  }

  public getStartTime():Moment {
    if(isMoment(this.start_time)) {
      return moment(this.start_time);
    } else {
      Log.w("getStartTime(): Can't, start_time is not a moment:\n", this.start_time);
    }
  }

  public setStartTime(time:Date|Moment|string):Moment {
    let start;
    if(time && (isMoment(time) || time instanceof Date)) {
      start = moment(time);
      this.start_time = start;
    } else if(time && typeof time === 'string' && time.length > 5) {
      start = moment(time);
      this.start_time = start;
    } else if(time && typeof time === 'string') {
      let xl = this.shift_id;
      start = moment().fromExcel(xl);
      let times = time.split(":");
      let hrs = Number(times[0]);
      let min = Number(times[1]);
      if(!isNaN(hrs)) {
        start.hour(hrs);
      }
      if(!isNaN(min)) {
        start.minutes(min);
      }
      this.start_time = start;
    }
    return this.start_time;
  }

  public setTech(tech:Employee) {
    this.tech = tech;
    return this.tech;
  }

  public getTech() {
    return this.tech;
  }

  public setJobsite(site:Jobsite) {
    this.site = site;
    return this.site;
  }

  public getJobsite():Jobsite {
    return this.site;
  }

  public getShiftID() {
    return this.shift_id;
  }

  public setShiftID(value:any) {
    this.shift_id = value;
    return this.shift_id;
  }

  public getShiftDate():Moment {
    let date = moment().fromExcel(this.getShiftID());
    return date;
  }

  public getShiftDateString(format?:string):string {
    let date = this.getShiftDate();
    let fmt = typeof format === 'string' ? format : "YYYY-MM-DD";
    return date.format(fmt);
  }

  public getShiftWeek() {
    let scheduleStartsOnDay = 3;
    let day = moment(this.start_time);
    if(day.isoWeekday() >= scheduleStartsOnDay) {
      this.shift_week = day.isoWeekday(scheduleStartsOnDay);
    } else {
      this.shift_week = moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    }
    return this.shift_week;
  }

  public getShiftNumber() {
    this.getShiftWeek();
    this.getExcelDates();
    let shiftNumber = Math.trunc(this.XL.shift_time - this.XL.shift_week + 1);
    this.shift_number = shiftNumber;
    return shiftNumber;
  }

  public getCurrentPayrollWeek() {
    let scheduleStartsOnDay = 3;
    let now = moment();
    // let day = moment(this.start_time);
    if(now.isoWeekday() >= scheduleStartsOnDay) {
      this.current_payroll_week = now.isoWeekday(scheduleStartsOnDay);
    } else {
      this.current_payroll_week = moment(now).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay).startOf('day');
    }
    return this.current_payroll_week;
  }

  public updateShiftWeek() {
    // Schedule starts on day 3 (Wednesday)
    return this.getShiftWeek();
  }

  public updateShiftNumber() {
    let start = this.start_time;
    let week  = this.shift_week;
    if(isMoment(start) && isMoment(week)) {
      this.shift_number = start.diff(week, 'days') + 1;
    } else {
      this.shift_number = -1;
    }
    return this.shift_number;
  }

  public getShiftDescription() {
    // return this.site_name;
    let shiftWeek = this.shift_week.format("M/DD");
    // let shiftWeekDay = moment(this.shift_week).day() - 3;
    let end_shift_week = moment(this.shift_week).add(6, 'days');
    let shiftNum = Math.abs(this.start_time.diff(this.shift_week, 'days')) + 1;
    let endWeek = end_shift_week.format("MMM D");
    let dayStr = moment(this.start_time).format("MMM D");
    // let thisDay = this.start_time.day();
    // let thisDay = moment(this.start_time).day() - shiftWeekDay;

    // return `${dayStr} (Shift ${shiftNum} in ${shiftWeek}-${endWeek})`;
    return `${dayStr} (Shift week ${shiftWeek})`;
  }

  public getShiftWeekID() {
    let shift_week_number = -1;
    // let start_date = moment(XL);
    if(isMoment(this.shift_week)) {
      // shift_week_number = this.shift_week.diff(XL, 'days') + 2;
      shift_week_number = moment(this.shift_week).toExcel(true);
    }
    return shift_week_number;
  }

  public getPayrollPeriod() {
    return this.getShiftWeekID();
  }

  public isShiftInCurrentPayPeriod() {
    let now = moment();
    let day = moment(this.start_time);
    let week = moment(this.shift_week);
    let nowXL = moment(now).toExcel();
    let dayXL = moment(now).toExcel(true);
    let weekXL = moment(week).toExcel(true);
    let nextWeekXL = weekXL + 7;
    if(dayXL >= weekXL && dayXL < nextWeekXL) {
      return true;
    } else {
      return false;
    }
  }

  public static getShiftNumber(shiftDate:Moment|Date) {
    let startDay = 3;
    let date = moment(shiftDate);
    let i = date.isoWeekday();
    return ((i + 4) % 7) + 1;
    // let

  }

  public static getShiftWeek(shiftDate:Moment|Date) {
    let scheduleStartsOnDay = 3;
    let day = moment(shiftDate);
    let shift_week = null;
    if(day.isoWeekday() >= scheduleStartsOnDay) {
      shift_week = moment(day).isoWeekday(scheduleStartsOnDay);
    } else {
      shift_week = moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    }
    return shift_week;
  }

  public static getShiftSerial(shiftDate:Moment|Date) {
    let date = moment(shiftDate);
    let week = Shift.getShiftWeek(date).toExcel(true);
    let num = sprintf("%02d", Shift.getShiftNumber(date));
    let shift_serial = `${week}_${num}`;
    return shift_serial;
    // let num = sprintf("%02d", this.shift_number);
    // let strShiftID = `${week}_${num}`;
    // this.shift_serial = strShiftID;
    // return strShiftID;
  }

  public getShiftSerial(shiftDate?:Moment|Date) {
    this.getExcelDates();
    let week = this.shift_week_id;
    let num = sprintf("%02d", this.shift_number);
    let strShiftID = `${week}_${num}`;
    this.shift_serial = strShiftID;
    return strShiftID;
  }

  public getExcelDates() {
    let now                      = moment()                             ;
    let day                      = moment(this.start_time)              ;
    let week                     = moment(this.getShiftWeek())          ;
    let nowWeek                  = moment(this.getCurrentPayrollWeek()) ;
    let nowXL                    = now.toExcel()                        ;
    let dayXL                    = day.toExcel(true)                    ;
    let weekXL                   = week.toExcel(true)                   ;
    let currentWeekXL            = nowWeek.toExcel(true)                ;
    let nextWeekXL               = weekXL + 7                           ;
    this.shift_week_id           = weekXL                               ;
    this.payroll_period          = weekXL                               ;
    this.shift_id                = dayXL                                ;
    this.XL.today_XL             = nowXL                                ;
    this.XL.shift_time           = dayXL                                ;
    this.XL.shift_id             = dayXL                                ;
    this.XL.shift_week           = weekXL                               ;
    this.XL.current_payroll_week = currentWeekXL                        ;
    this.XL.next_week_XL         = nextWeekXL                           ;
    return this.XL;
  }

  public getScheduledShiftLength() {

  }

  public getNextReportStartTime():Moment {
    let start = this.getStartTime();
    let begin = moment(start);
    let all = this.getRealShiftReports();
    all.sort(_sortRealReports);
    let lastReport:ReportReal = all[all.length - 1];
    if(lastReport) {
      let end = lastReport.getLastTimeBlocked();
      let lastTime = moment(end);
      Log.l(`Shift.getNextReportStartTime(): next start time is '${lastTime.format()}'`);
      return lastTime;
    } else {
      Log.l(`Shift.getNextReportStartTime(): No reports found, next start time is '${begin.format()}'`);
      return begin;
    }
    // let reports = this.getShiftReports();
    // reports.sort(_sortReports);
    // let debugString = ` START: ${start.format("YYYY-MM-DDTHH:mm")}\n`;
    // for(let report of reports) {
    //   let hours = report.getRepairHours();
    //   let hrs = Math.trunc(hours);
    //   let min = (hours - hrs) * 60;
    //   let out = sprintf("%02d:%02d", hrs, min);
    //   // let duration = moment.duration(hours, 'hours');
    //   // debugString += `   ADD: ${duration.hours()}:${duration.minutes()}\n`
    //   debugString += `    ADD:             ${out}\n`;
    //   begin.add(hours, 'hours');
    //   debugString += ` RESULT: ${begin.format("YYYY-MM-DDTHH:mm")}\n`;
    // }
    // Log.l(`Shift.getNextReportStartTime(): next start time is '${begin.format("YYYY-MM-DDTHH:mm")}'. Debug chain:\n`, debugString);
    // return begin;
  }

  public getShiftLength(newHours?:number|string) {
    let hrs = newHours ? String(newHours) : "";
    let retVal:any = this.shift_length;
    let regHours = this.getNormalHours();
    let status = this.getShiftReportsStatus();
    /* 2019-07-02 TODO */
    /* This might have been updated for Payroll in console, not sure if isNaN() should be in there */
//    if(retVal == 0) {
    // tslint:disable-next-line: triple-equals
    if(retVal == 0 || isNaN(retVal)) {
      return 'off';
    } else {
      if(hrs) {
        if(String(retVal) === 'S' || status.status) {
          return hrs;
        } else {
          return regHours;
        }
      } else {
        return retVal;
      }
    }
  }

  public setShiftLength(hours:number):number {
    // this.shift_length = String(hours);
    this.shift_length = Number(hours);
    return this.shift_length;
  }

  public updateShiftSiteInfo(site:Jobsite, tech:Employee) {
    let shiftTime = (tech.getShiftType() as SiteScheduleType);
    let rotation  = tech.getShiftRotation();
    let date = moment(this.start_time).startOf('day');
    let shiftLength = site.getShiftLengthForDate(date, rotation, shiftTime);
    this.setShiftLength(shiftLength);
    let sst = site.getShiftStartTime(shiftTime);
    let startHours = sst.numeric();
    // let hours = moment.duration(startHours, 'hours');
    // let startTime = moment(date).add(hours.hours(), 'hours').add(hours.minutes(), 'minutes');
    let startTime:Moment = moment(date).add(startHours, 'hours');
    this.start_time = moment(startTime);
  }

  public getShiftColor() {
    let now = moment();
    this.getExcelDates();
    let colorClass = "";
    let dayXL = this.XL.shift_id;
    let nowXL = this.XL.today_XL;
    let weekXL = this.XL.shift_week;
    let prWeek = this.XL.current_payroll_week;
    // tslint:disable-next-line: triple-equals
    if(dayXL == nowXL) {
      colorClass = "green";
    } else if(dayXL < prWeek) {
      colorClass = "red";
    } else {
      colorClass = "blue";
    }
    // Log.l("getShiftColor(): Shift is now:\n", this);
    return colorClass;
  }

  public getShiftClasses() {
    this.getShiftColor();
    return this.colors;
  }

  public isRed() {
    // this.getShiftColor();
    return this.colors.red;
  }
  public isGreen() {
    // this.getShiftColor();
    return this.colors.green;
  }
  public isBlue() {
    // this.getShiftColor();
    return this.colors.blue;
  }

  public getTotalShiftHours() {
    return this.getNormalHours();
  }

  public getTotalPayrollHoursForShift() {
    let shiftTotal = this.getTotalShiftHours();
    let premiumHours = this.getTotalPremiumHoursForShift();
    shiftTotal += premiumHours;
    // Log.l("getTotalPayrollHoursForShift(): For shift %s, %d reports, %f hours, %f hours eligible, so premium hours = %f.\nShift total: %f hours.", this.getShiftSerial(), this.shift_reports.length, shiftTotal, countsForPremiumHours, premiumHours, shiftTotal);
    return shiftTotal;
  }

  public getTotalPremiumHoursForShift():number {
    let shiftTotal = 0, premiumHours = 0, countsForPremiumHours = 0;
    let reports = this.getShiftReports();
    for(let report of reports) {
      // if(!report['type'] || (report['type'] as string) === 'Work Report' || report['type'] === 'work_report') {
      if(report instanceof Report) {
        let subtotal = report.getRepairHours();
        shiftTotal += subtotal;
        // if(report.client !== "SESA" && report.client !== 'SE') {
        if(report.isPremiumEligible()) {
          countsForPremiumHours += subtotal;
        }
      }
    }
    if(countsForPremiumHours >= 8 && countsForPremiumHours <= 11) {
      premiumHours = 3;
    } else if(countsForPremiumHours > 11) {
      premiumHours = 3 + (countsForPremiumHours - 11);
    }
    // Log.l("getTotalPayrollHoursForShift(): For shift %s, %d reports, %f hours, %f hours eligible, so premium hours = %f.\nShift total: %f hours.", this.getShiftSerial(), this.shift_reports.length, shiftTotal, countsForPremiumHours, premiumHours, shiftTotal);
    return premiumHours;
  }

  public getNormalHours():number {
    let total:number = 0;
    let reports:Report[] = this.getShiftReports();
    for(let report of reports) {
      // if(report['type'] === undefined || report['type'] === 'Work Report') {
      //   total += report.getRepairHours();
      // }
      if(report instanceof Report) {
        total += report.getRepairHours();
      }
    }
    let logistics:ReportLogistics[] = this.getShiftLogisticsReports();
    for(let report of logistics) {
      if(report instanceof ReportLogistics) {
        total += report.getTotalTravelHours(15);
      }
    }
    let drivings:ReportDriving[] = this.getShiftDrivingReports();
    for(let report of drivings) {
      if(report instanceof ReportDriving) {
        total += report.getTotalTime(15);
      }
    }
    let maints:ReportMaintenance[] = this.getShiftMaintenanceReports();
    for(let report of maints) {
      if(report instanceof ReportMaintenance) {
        // total += report.getTotalWorkHours(15);
        total += report.getTotalTime(15);
      }
    }
    return total;
  }

  public getBillableHours() {
    let total = 0;
    let reports = this.getShiftReports();
    for(let report of reports) {
      // if(!report['type'] || (report['type'] as string) === 'Work Report' || report['type'] === 'work_report') {
      if(report instanceof Report) {
        // if(report.client !== 'SE' && report.client !== 'SESA') {
        if(report.isBillable()) {
          total += report.getRepairHours();
        }
      }
    }
    return total;
  }

  public getPayrollHours() {
    return this.getTotalPayrollHoursForShift();
  }

  public getPremiumHours() {
    return this.getTotalPremiumHoursForShift();
  }

  public getTrainingHours() {
    let total:number | string = 0;
    for(let other of this.other_reports) {
      if(other.type !== undefined && other.type === 'Training') {
        total += Number(other.getTotalHours());
      }
    }
    return total;
  }

  public getTravelHours() {
    let total:number | string = 0;
    for(let other of this.other_reports) {
      if(other.type !== undefined && other.type === 'Travel') {
        total += Number(other.getTotalHours());
      }
    }
    return total;
  }

  public getStandbyHours() {
    let total = 0;
    for(let other of this.other_reports) {
      if(other.type !== undefined && (other.type === 'Standby' || other.type === 'Standby: HB Duncan')) {
        total += Number(other.getTotalHours());
      }
    }
    return total;
  }

  public getVacationHours() {
    let total = 0;
    for(let other of this.other_reports) {
      if(other.type !== undefined && other.type === 'Vacation') {
        total += Number(other.getTotalHours());
      }
    }
    return total;
  }

  public getSickHours() {
    let total = 0;
    for(let other of this.other_reports) {
      if(other.type !== undefined && other.type === 'Sick') {
        total += Number(other.getTotalHours());
      }
    }
    return total;
  }

  public getHolidayHours() {
    let total = 0;
    for(let other of this.other_reports) {
      if(other.type !== undefined && other.type === 'Holiday') {
        total += Number(other.getTotalHours());
      }
    }
    return total;
  }

  public getShiftTimeline():any[] {
    return [];
  }

  public setShiftReports(reports:Report[]) {
    this.shift_reports = reports;
    return this.shift_reports;
  }

  public addShiftReport(report:Report) {
    let reports = this.getShiftReports();
    let j = 0, i = -1;
    for(let rep of reports) {
      if(rep === report || (rep['_id'] && report['_id'] && rep['_id'] === report['_id'])) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      // Log.l(`addShiftReport(): Report '${report._id}' already exists in shift ${this.getShiftSerial()}.`);
    } else {
      // Log.l(`removeShiftReport(): Report '${report._id}' not found in shift ${this.getShiftSerial()}:\n`, reports[i])
      reports.push(report);
    }
    this.shift_reports = reports;
    return this.shift_reports;
  }

  public removeShiftReport(report:Report) {
    let reports = this.getShiftReports();
    let j = 0, i = -1;
    for(let rep of reports) {
      if(rep === report || (rep['_id'] && report['_id'] && rep['_id'] === report['_id'])) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`removeShiftReport(): Removing report #${i} from shift ${this.getShiftSerial()}:\n`, reports[i]);
      window['onsitesplicedreport'] = this.shift_reports.splice(i, 1)[0];
    } else {
      Log.l(`removeShiftReport(): Report '${report._id}' not found in shift ${this.getShiftSerial()}.`);
    }
    return this.shift_reports;
  }

  public getShiftReports():Report[] {
    return this.shift_reports;
  }

  public getShiftOtherReports():ReportOther[] {
    return this.other_reports;
  }

  public getShiftLogisticsReports():ReportLogistics[] {
    return this.logistics_reports;
  }

  public getShiftDrivingReports():ReportDriving[] {
    return this.driving_reports;
  }

  public getShiftMaintenanceReports():ReportMaintenance[] {
    return this.maintenance_reports;
  }

  public getShiftTimeCardReports():ReportTimeCard[] {
    return this.timecard_reports;
  }

  public getAllShiftReports():ReportAny[] {
    let output:ReportAny[] = [];
    // for(let report of this.getShiftReports()) {
    //   output.push(report);
    // }
    // for(let other of this.getShiftOtherReports()) {
    //   output.push(other);
    // }
    // for(let report of this.getShiftLogisticsReports()) {
    //   output.push(report);
    // }
    // for(let report of this.getShiftDrivingReports()) {
    //   output.push(report);
    // }
    // for(let report of this.getShiftMaintenanceReports()) {
    //   output.push(report);
    // }
    output = this.getRealShiftReports();
    for(let other of this.getShiftOtherReports()) {
      output.push(other);
    }
    return output;
  }

  public getRealShiftReports():ReportReal[] {
    let output:ReportReal[] = [];
    for(let report of this.getShiftReports()) {
      output.push(report);
    }
    for(let report of this.getShiftLogisticsReports()) {
      output.push(report);
    }
    for(let report of this.getShiftDrivingReports()) {
      output.push(report);
    }
    for(let report of this.getShiftMaintenanceReports()) {
      output.push(report);
    }
    for(let report of this.getShiftTimeCardReports()) {
      output.push(report);
    }
    return output;
  }

  public getOtherReports():ReportOther[] {
    return this.other_reports;
  }

  public setOtherReports(others:ReportOther[]):ReportOther[] {
    this.other_reports = [];
    for(let other of others) {
      this.other_reports.push(other);
    }
    return this.other_reports;
  }

  public addOtherReport(other:ReportOther):ReportOther[] {
    let j = 0, i = -1;
    let others = this.getShiftOtherReports();
    for(let oth of others) {
      if(oth === other || (oth['_id'] && other['_id'] && oth['_id'] === other['_id'])) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`SHIFT.addOtherReport(): ReportOther '${other._id}' already exists in shift '${this.getShiftSerial()}'.`);
    } else {
      // Log.w(`SHIFT.addOtherReport(): Report '${other._id}' not found in shift '${this.shift_serial}'.`);
      others.push(other);
    }
    this.other_reports = others;
    return this.other_reports;
  }

  public removeOtherReport(other:ReportOther):ReportOther[] {
    let others = this.getShiftOtherReports();
    let j = 0, i = -1;
    for(let oth of others) {
      if(oth === other || (oth['_id'] && other['_id'] && oth['_id'] === other['_id'])) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`removeOtherReport(): Removing report #${i} from shift ${this.getShiftSerial()}:`, others[i]);
      window['onsitesplicedreport'] = others.splice(i, 1)[0];
    } else {
      Log.w(`SHIFT.removeOtherReport(): Report '${other._id}' not found in shift '${this.shift_serial}'.`);
    }
    this.other_reports = others;
    return this.other_reports;
  }

  public getLogisticsReports():ReportLogistics[] {
    return this.logistics_reports;
  }

  public setLogisticsReports(reports:ReportLogistics[]):ReportLogistics[] {
    this.logistics_reports = [];
    for(let report of reports) {
      this.logistics_reports.push(report);
    }
    return this.logistics_reports;
  }

  public addLogisticsReport(report:ReportLogistics):ReportLogistics[] {
    let j = 0, i = -1;
    let reports:ReportLogistics[] = this.getShiftLogisticsReports();
    for(let rpt of reports) {
      if(rpt === report || (rpt._id && report._id && rpt._id === report._id)) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`SHIFT.addLogisticsReport(): ReportLogistics '${report._id}' already exists in shift '${this.getShiftSerial()}'.`);
    } else {
      // Log.w(`SHIFT.addLogisticsReport(): ReportLogistics '${report._id}' not found in shift '${this.shift_serial}'.`);
      reports.push(report);
    }
    this.logistics_reports = reports;
    return this.logistics_reports;
  }

  public removeLogisticsReport(report:ReportLogistics):ReportLogistics[] {
    let reports:ReportLogistics[] = this.getShiftLogisticsReports();
    let i = reports.findIndex(rpt => {
      return report === rpt || (rpt._id && report._id && rpt._id === report._id);
    });
    // for(let rpt of reports) {
    //   if(rpt === report || (rpt._id && report._id && rpt._id === report._id)) {
    //     i = j;
    //     break;
    //   } else {
    //     j++;
    //   }
    // }
    if(i > -1) {
      Log.l(`Shift.removeLogisticsReport(): Removing report #${i} from shift ${this.getShiftSerial()}:`, reports[i]);
      window['onsitesplicedreportlogistics'] = reports.splice(i, 1)[0];
    } else {
      Log.w(`SHIFT.removeLogisticsReport(): Report '${report._id}' not found in shift '${this.shift_serial}'.`);
    }
    this.logistics_reports = reports;
    return this.logistics_reports;
  }

  public getShiftLogisticsHours():number {
    let reports:ReportLogistics[] = this.getShiftLogisticsReports();
    let total:number = 0;
    for(let report of reports) {
      let hours:number = report.getTotalTime();
      total += hours;
    }
    return total;
  }

  public getDrivingReports():ReportDriving[] {
    return this.driving_reports;
  }

  public setDrivingReports(reports:ReportDriving[]):ReportDriving[] {
    this.driving_reports = [];
    for(let report of reports) {
      this.driving_reports.push(report);
    }
    return this.driving_reports;
  }

  public addDrivingReport(report:ReportDriving):ReportDriving[] {
    let j = 0, i = -1;
    let reports:ReportDriving[] = this.getShiftDrivingReports();
    for(let rpt of reports) {
      if(rpt === report || (rpt._id && report._id && rpt._id === report._id)) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`SHIFT.addDrivingReport(): ReportDriving '${report._id}' already exists in shift '${this.getShiftSerial()}'.`);
    } else {
      // Log.w(`SHIFT.addLogisticsReport(): ReportLogistics '${report._id}' not found in shift '${this.shift_serial}'.`);
      reports.push(report);
    }
    this.driving_reports = reports;
    return this.driving_reports;
  }

  public removeDrivingReport(report:ReportDriving):ReportDriving[] {
    let reports:ReportDriving[] = this.getShiftDrivingReports();
    let i = reports.findIndex(rpt => {
      return report === rpt || (rpt._id && report._id && rpt._id === report._id);
    });
    if(i > -1) {
      Log.l(`Shift.removeDrivingReport(): Removing report #${i} from shift ${this.getShiftSerial()}:`, reports[i]);
      window['onsitesplicedreportdriving'] = reports.splice(i, 1)[0];
    } else {
      Log.w(`SHIFT.removeDrivingReport(): Report '${report._id}' not found in shift '${this.shift_serial}'.`);
    }
    this.driving_reports = reports;
    return this.driving_reports;
  }

  public getShiftDrivingHours():number {
    let reports:ReportDriving[] = this.getShiftDrivingReports();
    let total:number = 0;
    for(let report of reports) {
      let hours:number = report.getTotalTime();
      total += hours;
    }
    return total;
  }

  public getMaintenanceReports():ReportMaintenance[] {
    return this.maintenance_reports;
  }

  public setMaintenanceReports(reports:ReportMaintenance[]):ReportMaintenance[] {
    this.maintenance_reports = [];
    for(let report of reports) {
      this.maintenance_reports.push(report);
    }
    return this.maintenance_reports;
  }

  public addMaintenanceReport(report:ReportMaintenance):ReportMaintenance[] {
    let j = 0, i = -1;
    let reports:ReportMaintenance[] = this.getShiftMaintenanceReports();
    for(let rpt of reports) {
      if(rpt === report || (rpt._id && report._id && rpt._id === report._id)) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`SHIFT.addMaintenanceReport(): ReportMaintenance '${report._id}' already exists in shift '${this.getShiftSerial()}'.`);
    } else {
      // Log.w(`SHIFT.addMaintenanceReport(): ReportMaintenance '${report._id}' not found in shift '${this.shift_serial}'.`);
      reports.push(report);
    }
    this.maintenance_reports = reports;
    return this.maintenance_reports;
  }

  public removeMaintenanceReport(report:ReportMaintenance):ReportMaintenance[] {
    let reports:ReportMaintenance[] = this.getShiftMaintenanceReports();
    let i = reports.findIndex(rpt => {
      return report === rpt || (rpt._id && report._id && rpt._id === report._id);
    });
    if(i > -1) {
      Log.l(`Shift.removeMaintenanceReport(): Removing report #${i} from shift ${this.getShiftSerial()}:`, reports[i]);
      window['onsitesplicedreportmaintenance'] = reports.splice(i, 1)[0];
    } else {
      Log.w(`SHIFT.removeMaintenanceReport(): Report '${report._id}' not found in shift '${this.shift_serial}'.`);
    }
    this.maintenance_reports = reports;
    return this.maintenance_reports;
  }

  public getShiftMaintenanceHours():number {
    let reports:ReportMaintenance[] = this.getShiftMaintenanceReports();
    let total:number = 0;
    for(let report of reports) {
      let hours:number = report.getTotalWorkHours();
      total += hours;
    }
    return total;
  }

  public getTimeCardReports():ReportTimeCard[] {
    return this.timecard_reports;
  }

  public setTimeCardReports(reports:ReportTimeCard[]):ReportTimeCard[] {
    this.maintenance_reports = [];
    for(let report of reports) {
      this.timecard_reports.push(report);
    }
    return this.timecard_reports;
  }

  public addTimeCardReport(report:ReportTimeCard):ReportTimeCard[] {
    let j = 0, i = -1;
    let reports:ReportTimeCard[] = this.getShiftTimeCardReports();
    for(let rpt of reports) {
      if(rpt === report || (rpt._id && report._id && rpt._id === report._id)) {
        i = j;
        break;
      } else {
        j++;
      }
    }
    if(i > -1) {
      Log.l(`SHIFT.addTimeCardReport(): ReportTimeCard '${report._id}' already exists in shift '${this.getShiftSerial()}'.`);
    } else {
      // Log.w(`SHIFT.addTimeCardReport(): ReportTimeCard '${report._id}' not found in shift '${this.shift_serial}'.`);
      reports.push(report);
    }
    this.timecard_reports = reports;
    return this.timecard_reports;
  }

  public removeTimeCardReport(report:ReportTimeCard):ReportTimeCard[] {
    let reports:ReportTimeCard[] = this.getShiftTimeCardReports();
    let i = reports.findIndex(rpt => {
      return report === rpt || (rpt._id && report._id && rpt._id === report._id);
    });
    if(i > -1) {
      Log.l(`Shift.removeTimeCardReport(): Removing report #${i} from shift ${this.getShiftSerial()}:`, reports[i]);
      window['onsitesplicedreporttimecard'] = reports.splice(i, 1)[0];
    } else {
      Log.w(`SHIFT.removeTimeCardReport(): Report '${report._id}' not found in shift '${this.shift_serial}'.`);
    }
    this.timecard_reports = reports;
    return this.timecard_reports;
  }

  public getShiftTimeCardHours():number {
    let reports:ReportTimeCard[] = this.getShiftTimeCardReports();
    let total:number = 0;
    for(let report of reports) {
      let hours:number = report.getTotalWorkHours();
      total += hours;
    }
    return total;
  }

  public getShiftStats(complete?:boolean) {
    return this.getShiftReportsStatus(complete);
  }

  public getShiftReportsStatus(complete?:boolean) {
    let others  = this.getShiftOtherReports() ;
    let reports = this.getShiftReports();
    let logistics = this.getShiftLogisticsReports();
    let drivings = this.getShiftDrivingReports();
    let maints = this.getShiftMaintenanceReports();
    let output  = []                    ;
    let data    = { status: 0, hours: 0, workHours: 0, otherReportHours: 0, code: "" };
    // M Training and Travel
    // T Training
    // Q Travel
    // S Standby for Duncan
    // E Sick Day or Sick Hrs
    // V Vacation
    // H Holiday
    for(let other of others) {
      if(other.isType('training')) {
        output.push("T");
        data.otherReportHours += other.time;
     } else if(other.isType('travel')) {
        output.push("Q");
        data.otherReportHours += other.time;
      } else if(other.isType('standby')) {
        output.push("B");
        data.otherReportHours += other.time;
      } else if(other.isType('standby: hb duncan')) {
        output.push("S");
      } else if(other.isType('sick')) {
        output.push("E");
        data.otherReportHours += other.time;
      } else if(other.isType('vacation')) {
        output.push("V");
        data.otherReportHours += other.time;
      } else if(other.isType('holiday')) {
        output.push("H");
        data.otherReportHours += other.time;
      }
    }
    if(reports.length > 0 || logistics.length > 0 || drivings.length > 0 || maints.length > 0) {
      let hrs = this.getNormalHours();
      data.workHours = hrs;
    }
    // Log.l("Shift: intermediate ReportOther status is:\n", output);
    if(!complete) {
      if(output.indexOf("T") > -1 && output.indexOf("Q") > -1) {
        data.code = "M";
      } else if(output.indexOf("T") > -1) {
        data.code = "T";
      } else if(output.indexOf("Q") > -1) {
        data.code = "Q";
      } else if(output.indexOf("S") > -1) {
        data.code = "S";
      } else if(output.indexOf("E") > -1) {
        data.code = "E";
      } else if(output.indexOf("V") > -1) {
        data.code = "V";
      } else if(output.indexOf("H") > -1) {
        data.code = "H";
      } else if(output.indexOf("B") > -1) {
        data.code = "S";
      } else {
        data.code = "";
      }
    } else {
      data.code = "";
      if(output.indexOf("T") > -1 && output.indexOf("Q") > -1) {
        data.code += "M";
      }
      if(output.indexOf("T") > -1) {
        data.code += "T";
      }
      if(output.indexOf("Q") > -1) {
        data.code += "Q";
      }
      if(output.indexOf("S") > -1) {
        data.code += "S";
      }
      if(output.indexOf("E") > -1) {
        data.code += "E";
      }
      if(output.indexOf("V") > -1) {
        data.code += "V";
      }
      if(output.indexOf("H") > -1) {
        data.code += "H";
      }
      if(output.indexOf("B") > -1) {
        data.code += "S";
      }
    }
    if(data.code) {
      data.status = 1;
    }
    return data;
  }

  public getShiftCode() {
    let res = this.getShiftStats();
    let code = res.code;
    let hours = res.workHours;
    // let hours = this.get
    let otherHours = res.otherReportHours;
    if(code) {
      if(!hours) {
        return code;
      } else {
        return hours;
      }
    } else {
      return hours;
    }
  }

  public getSpecialHours(type?:string) {
    let others    = this.getShiftOtherReports();
    let total     = 0;
    let codeTotal = 0;
    let codes     = "";
    for(let other of others) {
      if(type) {
        if(other.type === type) {
          let hours = other.getTotalHours();
          if(typeof hours === 'number') {
            total += hours;
          } else {
            codes += hours;
            if(hours === "S") {
              total += 8;
            }
          }
        }
      } else {
        let hours = other.getTotalHours();
        if(typeof hours === 'number') {
          total += hours;
        } else {
          codes += hours;
          if(hours === "S") {
            total += 8;
          }
        }
      }
    }
    return { codes: codes, hours: total };
  }

  public getAllShiftHours():number {
    let work_hours = this.getNormalHours();
    let other_hours = this.getSpecialHours();
    return work_hours + other_hours.hours;
  }

  public getShiftHours() {
    return this.getNormalHours();
  }

  public setShiftHours(hours:number) {
    this.shift_hours = hours;
  }

  public getShiftStatus(colors?:boolean) {
    if(colors !== undefined && colors === false) {
      return "noColors";
    }
    let hours = this.getNormalHours(); // Total work report hours
    let total = this.getShiftLength(); // worksite shift hours
    let status = this.getShiftReportsStatus();
    let date = this.getShiftDate().format("YYYY-MM-DD");
    let now = moment().format("YYYY-MM-DD");
    let retVal;
    if(date > now) {
      retVal = "hoursFuture";
    } else if(status.code === 'S') {
      retVal = "standby";
    } else if(status.code === 'T') {
      retVal = "training";
    } else if(status.code === 'Q') {
      retVal = "travel";
    } else if(status.code === 'M') {
      retVal = "trng-trvl";
    } else if(status.code === 'H') {
      retVal = "holiday";
    } else if(status.code === 'E') {
      retVal = "sick";
    } else if(total === 'OFF' || total === 'off') {
      retVal ="off";
    // } else if(status.status && !status.workHours) {
    //   retVal = "hoursComplete";
    } else if(status.status && status.workHours) {
      retVal = "hoursComplete";
    // } else if(typeof total === 'string' && !status.workHours && !status.otherReportHours && isNaN(Number(total))) {
    //   retVal = "hoursUnder";
    // } else if(typeof total === 'string' && status.otherReportHours) {
    //   retVal = "hoursComplete";
    // } else if(typeof total === 'string' && status.workHours && isNaN(Number(total))) {
    //   retVal = "hoursComplete";
    } else if(!status.status) {
      let numericTotal = Number(total);
      if(isNaN(numericTotal)) {
        if(hours) {
          retVal = 'hoursComplete';
        } else {
          retVal = 'hoursUnder';
        }
      } else {
        if(hours > total) {
          retVal = "hoursOver";
        } else if(hours < total) {
          retVal = "hoursUnder";
        // tslint:disable-next-line: triple-equals
        } else if(hours == total) {
          retVal = "hoursComplete";
        } else {
          retVal = "hoursUnknown";
        }
      }
    }
    return retVal;
    // return (status && hours === status) ? "hoursComplete" : (status && hours !== status) ? "hoursUnder" : (hours > total) ? "hoursOver" : (hours < total) ? "hoursUnder" : (hours === total) ? "hoursComplete" : "hoursUnknown";
  }

  public getShiftName(fmt?:string) {
    let date = moment(this.getShiftDate());
    let format = fmt || "YYYY-MM-DD";
    let dateString = date.format(fmt);
    return dateString;
  }

  public getFlaggedReports():Array<Report|ReportOther> {
    let out:Array<Report|ReportOther> = [];
    let reports:Report[] = this.getShiftReports();
    let others:ReportOther[] = this.getShiftOtherReports();
    for(let report of reports) {
      if(report.isFlagged()) {
        out.push(report);
      }
    }
    for(let other of others) {
      if(other.isFlagged()) {
        out.push(other);
      }
    }
    return out;
  }

  public setTimesheet(sheet:Timesheet):Timesheet {
    this.timesheet = sheet;
    return this.timesheet;
  }

  public getTimesheet():Timesheet {
    return this.timesheet;
  }

  /**
   * Check if this shift matches the given date. If no date provided, uses current date.
   *
   * @param {(Moment|Date|string)} date A date to check, either as a Moment/Date object or a YYYY-MM-DD string
   * @returns {boolean} True if this shift matches the provided date
   * @memberof Shift
   */
  public isDate(date:Moment|Date|string):boolean {
    let shiftDate = this.getShiftDateString();
    let dateToCheck:string;
    if(!date) {
      dateToCheck = moment().format("YYYY-MM-DD");
    } else if(typeof date === 'string') {
      dateToCheck = date;
    } else {
      dateToCheck = moment(date).format("YYYY-MM-DD");
    }
    return dateToCheck === shiftDate;
  }

  public toString(translate?:any):string {
    let strOut:string = null;
    let start:string = moment(this.start_time).format("MMM DD");
    let weekID = this.getShiftWeekID();
    let weekStart = moment(this.shift_week).format("MMM DD");
    let payrollWeek = "Payroll week";
    if(translate && typeof translate.instant === 'function') {
      payrollWeek = translate.instant('payroll_week');
    }
    // strOut = `${start} (${payrollWeek} ${weekStart})`;
    strOut = `${start}`;
    return strOut;
  }

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
  public static fromJSON(doc:any):Shift {
    return Shift.deserialize(doc);
  }
  public getClass():any {
    return Shift;
  }
  public static getClassName():string {
    return 'Shift';
  }
  public getClassName():string {
    return Shift.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
