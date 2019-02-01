/**
 * Name: PayrollPeriod domain class
 * Vers: 5.7.0
 * Date: 2019-01-24
 * Auth: David Sargeant
 * Logs: 5.7.0 2019-01-24: Added deserialize() method (also static version)
 * Logs: 5.6.0 2018-12-13: Refactored imports; added standard OnSite methods
 * Logs: 5.5.0 2018-12-10: Added hasShiftForDate(), getShiftForDate(), addShift() methods
 * Logs: 5.4.0 2018-12-07: Added updateMoments() method
 * Logs: 5.3.0 2018-12-06: Added getStartDate(), getEndDate(), getStartDateString(), getEndDateString() methods
 * Logs: 5.2.0 2018-07-05: Added getPayrollShiftsReversed() method
 * Logs: 5.1.0 2018-02-20: Updated createConsolePayrollPeriodShiftsForTech() to account for missing shift info
 * Logs: 5.0.2 2018-01-31: Added createConsolePayrollPeriodShiftsForTech() method back in
 * Logs: 5.0.1 2017-12-15: Merged app and console PayrollPeriod classes
 * Logs: 4.2.2 2017-12-04: Added getBillableHours method
 * Logs: 4.2.1 2017-12-04: Changed types of start_date and end_date to Moment
 * Logs: 4.0.1 2017-10-16, added site_number data field
 */

// import { oo           } from '../config'     ;
// import { reportType   } from '../config'     ;
import { Moment       } from '../config'     ;
import { moment       } from '../config'     ;
import { Log          } from '../config'     ;
import { isMoment     } from '../config'     ;
import { _matchCLL    } from '../config'     ;
import { _matchSite   } from '../config'     ;
import { _sortReports } from '../config'     ;
import { Shift        } from './shift'       ;
import { Employee     } from './employee'    ;
import { Jobsite      } from './jobsite'     ;
import { Report       } from './report'      ;
import { ReportOther  } from './reportother' ;


export class PayrollPeriod {
  public start_date              : Moment             ;
  public end_date                : Moment             ;
  public serial_number           : number        = 0  ;
  public shifts                  : Shift[]       = [] ;
  public shift_hours_list        : number[]      = [] ;
  public shift_payroll_hours_list: number[]      = [] ;
  public total_hours             : number        = 0  ;
  public bonus_hours             : number        = 0  ;
  public payroll_hours           : number        = 0  ;
  public site_number             : number        = 0  ;

  constructor(start_date?: Moment | string | number, end_date?: Moment | string | number, serial_number?: number, shifts?: Array<Shift>, total_hours?: number, payroll_hours?: number) {
    if(start_date && typeof start_date === 'number') {
      this.start_date = moment.fromExcel(start_date);
    } else {
      this.start_date               = moment(start_date)    || null ;
    }
    if(end_date && typeof end_date === 'number') {
      this.end_date = moment.fromExcel(end_date);
    } else {
      this.end_date               = moment(end_date)      || null ;
    }
    this.serial_number            = serial_number || null ;
    this.shifts                   = shifts        || []   ;
    this.total_hours              = total_hours   || 0    ;
    this.payroll_hours            = payroll_hours || 0    ;
    this.shift_hours_list         = []                    ;
    this.shift_payroll_hours_list = []                    ;
  }

  public readFromDoc(doc:any):PayrollPeriod {
    for(let key in doc) {
      let value:any = doc[key];
      if(key === 'start_date' || key === 'end_date') {
        this[key] = moment(value);
      } else {
        this[key] = value;
      }
    }
    return this;
  }

  public static deserialize(doc:any):PayrollPeriod {
    let period:PayrollPeriod = new PayrollPeriod();
    return period.readFromDoc(doc);
  }

  public deserialize(doc:any):PayrollPeriod {
    return this.readFromDoc(doc);
  }

  public setStartDate(start:Moment | Date | string | number) {
    if(isMoment(start) || start instanceof Date) {
      this.start_date = moment(start).startOf('day');
      this.end_date = moment(start).add(6, 'days');
      this.getPayrollSerial();
    } else if(typeof start === 'string') {
      this.start_date = moment(start, 'YYYY-MM-DD').startOf('day');
      this.end_date = moment(start).add(6, 'days');
      this.getPayrollSerial();
    } else if(typeof start === 'number') {
      this.start_date = moment(start).startOf('day');
      this.end_date = moment(start).add(6, 'days');
      this.getPayrollSerial();
    } else {
      Log.e(`PayrollPeriod.setStartDate(): Error, need moment or Date or number or string as argument, got:\n`, start);
    }
  }

  public hasShiftForDate(date:Moment|Date|string):boolean {
    // let queryDate:Moment = typeof date === 'string' ? moment(date, "YYYY-MM-DD") : moment(date);
    // let strDate:string = queryDate.format("YYYY-MM-DD");
    // let shifts:Shift[] = this.getPayrollShifts();
    // let shiftDates:string[] = shifts.map((a:Shift) => {
    //   let date:Moment = a.getShiftDate();
    //   return date.format("YYYY-MM-DD");
    // });
    // if(shiftDates.indexOf(strDate) > -1) {
    //   return true;
    // }
    // return false;
    let shift:Shift = this.getShiftForDate(date);
    if(shift) {
      return true;
    }
    return false;
  }

  public getShiftForDate(date:Moment|Date|string):Shift {
    let queryDate:Moment = typeof date === 'string' ? moment(date, "YYYY-MM-DD") : moment(date);
    let strDate:string = queryDate.format("YYYY-MM-DD");
    let shifts:Shift[] = this.getPayrollShifts();
    let shift:Shift = shifts.find((a:Shift) => {
      let date:Moment = a.getShiftDate();
      return date.format("YYYY-MM-DD") === strDate;
    });
    if(shift) {
      return shift;
    }
  }

  public addShift():Shift[] {
    let now:Moment = moment().startOf('day');
    let shifts:Shift[] = this.getPayrollShifts();
    let shift_length:number = 12;
    let shift_time:string = "AM";
    let shift_start_time:number = 7;
    if(shifts.length && shifts.length < 7) {
      let shift:Shift = shifts[0];
      shift_length = shift.getShiftLength();
      shift_time = shift.shift_time;
      let startTime:Moment = shift.getStartTime();
      shift_start_time = startTime.hours();
    }
    let shift:Shift = new Shift();
    shift.initializeShift('UNKNOWN', moment(now), shift_time, moment(now).hours(shift_start_time), shift_length);
    shifts.unshift(shift);
    return shifts;
  }

  public getPayrollSerial() {
    if(this.serial_number) {
      return this.serial_number;
    } else {
      let start  = moment(this.start_date).startOf('day');
      let serial = start.toExcel(true);
      this.serial_number = serial;
      return this.serial_number;
    }
  }

  public static getPayrollSerial(shiftDate:Moment|Date) {
    let date = PayrollPeriod.getPayrollPeriodDate(moment(shiftDate));
    let start  = moment(date).startOf('day');
    let serial = start.toExcel(true);
    let serial_number = serial;
    return serial_number;
  }

  public getPayrollShifts():Shift[] {
    if(this.shifts && this.shifts.length > 0) {
      return this.shifts;
    } else {
      let start:Moment = moment(this.start_date).startOf('day');
      this.shifts = [];
      for(let i = 0; i < 7; i++) {
        let day:Moment = moment(start).add(i, 'days');
        let shift:Shift = new Shift();
        shift.initializeShift('UNKNOWN', moment(start), 'AM', day, 12);
        this.shifts.push(shift);
      }
      return this.shifts;
    }
  }

  public getPayrollShiftsReversed():Shift[] {
    let shifts1:Shift[] = this.getPayrollShifts();
    let shifts:Shift[] = shifts1.reverse();
    return shifts;
  }

  public getNormalHours() {
    let total = 0;
    for(let shift of this.shifts) {
      total += shift.getNormalHours();
    }
    this.total_hours = total;
    return this.total_hours;
  }

  public setNormalHours(hours:number) {
    this.total_hours = hours;
    return this.total_hours;
  }

  public getBillableHours() {
    let total = 0;
    for (let shift of this.shifts) {
      total += shift.getBillableHours();
    }
    this.total_hours = total;
    return this.total_hours;
  }

  /**
   * Need to add work report specific calculations in here for bonus hours
   *
   * @returns total_hours: a number ostensibly representing total normal hours plus bonus hours, where hours are eligible
   * @memberof PayrollPeriod
   */
  public getPayrollHours() {
    let total = 0;
    for(let shift of this.shifts) {
      total += shift.getPayrollHours();
    }
    this.payroll_hours = total;
    return this.payroll_hours;
  }

  public getBonusHours() {
    let total = 0;
    for(let shift of this.shifts) {
      total += shift.getTotalBonusHoursForShift();
    }
    this.bonus_hours = total;
    return total;
  }

  public getTrainingHours() {
    let total = 0;
    for(let shift of this.shifts) {
      total += shift.getTrainingHours();
    }
    return total;
  }

  public getTravelHours() {
    let total = 0;
    for(let shift of this.shifts) {
      total += shift.getTravelHours();
    }
    return total;
  }

  public getTotalHours() {
    let total = 0;
    // total += this.getNormalHours() + this.getBonusHours() + this.getTrainingHours() + this.getTravelHours() + this.getSpecialHours().hours;
    total += this.getNormalHours() + this.getBonusHours() + this.getSpecialHours().hours;
    return total;
  }

  static getPayrollPeriodDateForShiftDate(date:Moment | Date | string) {
    let scheduleStartsOnDay = 3;
    let day = null, periodStart = null;
    // return this.shift_week;
    if(isMoment(date) || date instanceof Date) {
      day = moment(date).startOf('day');
    } else if(typeof date === 'string') {
      day = moment(date, 'YYYY-MM-DD').startOf('day');
    } else {
      Log.e("PayrollPeriod.getPayrollPeriodForDate(): Error, need moment or Date or string, got:\n", date);
      return periodStart;
    }
    if (day.isoWeekday() >= scheduleStartsOnDay) {
      periodStart = day.isoWeekday(scheduleStartsOnDay).startOf('day');
    } else {
      periodStart = moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay).startOf('day');
    }
    return periodStart;
  }

  public getPayrollPeriodDescription() {
    let start = moment(this.start_date).format("MMM D");
    let end   = moment(this.end_date).format("MMM D");
    let output = `${start} - ${end}`;
    return output;
  }

  public static getPayrollPeriodDate(date: Moment | Date):Moment {
    let scheduleStartsOnDay = 3;
    let day = null, periodStart = null;
    // return this.shift_week;
    day = moment(date).startOf('day');
    if (day.isoWeekday() >= scheduleStartsOnDay) {
      periodStart = day.isoWeekday(scheduleStartsOnDay).startOf('day');
    } else {
      periodStart = moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay).startOf('day');
    }
    return periodStart;
  }

  public getPayrollPeriodDate(date: Moment | Date):Moment {
    return PayrollPeriod.getPayrollPeriodDate(date);
  }

  public getStartDate():Moment {
    return moment(this.start_date).startOf('day');
  }

  public getEndDate():Moment {
    return moment(this.end_date).startOf('day');
  }

  public getStartDateString(format?:string):string {
    let fmt:string = typeof format === 'string' ? format : "MMM D";
    let date:Moment = this.getStartDate();
    return date.format(fmt);
  }

  public getEndDateString(format?:string):string {
    let fmt:string = typeof format === 'string' ? format : "MMM D";
    let date:Moment = this.getEndDate();
    return date.format(fmt);
  }

  public updateLocale(language:string) {
    this.start_date.locale(language);
    this.end_date.locale(language);
    let shifts:Shift[] = this.getPayrollShifts();
    for(let shift of shifts) {
      shift.updateLocale(language);
    }
  }

  public createConsolePayrollPeriodShiftsForTech(tech:Employee, site:Jobsite, rotation:string) {
    // let day = moment(this.end_date).startOf('day');
    let day = moment(this.start_date).startOf('day');
    let today = moment().startOf('day');
    let tp = tech;
    if (tp != undefined) {
      // let rotation = tp.rotation;
      let shifts = new Array<Shift>();
      for(let i = 0; i < 7; i++) {
        let tmpDay = moment(day).add(i, 'days');
        let techShift = tech.shift && typeof tech.shift === 'string' ? tech.shift.toUpperCase() : "AM";
        let ampm = techShift ? techShift.trim() : "AM";
        let shift_day = moment(tmpDay).startOf('day');
        let tmpStart = site.getShiftStartTime(ampm);
        let h   :number = Number(tmpStart.split(':')[0]);
        let m   :number = Number(tmpStart.split(':')[1]);
        let hrs :number = h + (m/60);
        let shift_start_time:Moment = moment(shift_day).add(hrs, 'hours');
        let length:number = site.getShiftLengthForDate(rotation, ampm, shift_day);
        let client:string = site.client.fullName.toUpperCase();
        let thisShift:Shift = new Shift();
        thisShift.initializeShift(client, null, ampm, shift_start_time, length);
        thisShift.updateShiftWeek();
        thisShift.updateShiftNumber();
        thisShift.getExcelDates();
        thisShift.setStartTime(shift_start_time);
        shifts.push(thisShift);
        // Log.l(`createPayrollPeriodShiftsForTech(): Now adding day ${i}: ${moment(shift_day).format()} `);
        // }
      }
      this.shifts = shifts;
      // Log.l(`createConsolePayrollPeriodShiftsForTech(): Successfully created shifts:\n`, {tech: tech, site: site, shifts: shifts});
      return this.shifts;
    } else {
      Log.e("createConsolePayrollPeriodShiftsForTech(): Failed, needs Employee and Jobsite as argument and got:\n", tech, site);
    }
  }

  public createPayrollPeriodShiftsForTech(tech:Employee, site:Jobsite) {
    let day = moment(this.end_date).startOf('day');
    let today = moment().startOf('day');
    let tp = tech;
    if (tp !== undefined && tp !== null) {
      let rotation = tp.rotation;
      let shifts = new Array<Shift>();
      for (let i = 0; i < 7; i++) {
        let tmpDay = moment(day).subtract(i, 'days');
        if(tmpDay.isAfter(today)) {
          continue;
        } else {
          let ampm             = tech.shift.toUpperCase().trim()                         ;
          let rotation         = tech.rotation.toUpperCase().trim()                      ;
          let shift_day        = tmpDay.startOf('day')                                   ;
          let tmpStart         = tp.shiftStartTime                                       ;
          let shift_start_time = moment(shift_day).add(tmpStart, 'hours')                ;
          let client           = tp.client                                               || "SITENAME" ;
          let type             = tp.shift                                                ;
          let length           = tp.shiftLength                                          ;
          let thisShift:Shift  = new Shift() ;
          thisShift.initializeShift(client, null, type, shift_start_time, length);

          thisShift.updateShiftWeek();
          thisShift.updateShiftNumber();
          thisShift.getExcelDates();
          shifts.push(thisShift);
          // Log.l(`createPayrollPeriodShiftsForTech(): Now adding day ${i}: ${moment(shift_day).format()} `);
        }
      }
      this.shifts = shifts;
    } else {
      Log.e("createPayrollPeriodShiftsForTech(): Failed, needs Employee as argument and got:\n", tech);
    }
  }

  public getHoursList() {
    this.shift_hours_list = [];
    for(let shift of this.shifts) {
      let hours = shift.getNormalHours();
      this.shift_hours_list.push(hours);
    }
    return this.shift_hours_list;
  }

  public getPayrollHoursList() {
    this.shift_payroll_hours_list = [];
    for(let shift of this.shifts) {
      let hours = shift.getPayrollHours();
      this.shift_payroll_hours_list.push(hours);
    }
    return this.shift_payroll_hours_list;
  }

  public getSpecialHours(type?:string) {
    let total = 0;
    let codes = "";
    let shiftTotal = null;
    for(let shift of this.shifts) {
      shiftTotal = type ? shift.getSpecialHours(type) : shift.getSpecialHours();
      total += shiftTotal.hours;
      codes += shiftTotal.codes;
    }
    return {codes: codes, hours: total};
  }

  public getPeriodName(format?:string) {
    let start = moment(this.start_date);
    let end   = moment(start).add(6, 'days');
    let display = format ? format : "ddd DD MM YYYY";
    return start.format(display) + " — " + end.format(display);
  }

  public getPayrollPeriodReportCode() {
    let shifts = this.getPayrollShifts();
    for(let shift of shifts) {
      let res = shift.getShiftStats(true);
      if(res.code) {
        if(res.workHours) {

        }
      }
    }
  }

  public getPayrollPeriodBonusHours() {
  }

  public getPayrollPeriodTotal() {
    let shifts = this.getPayrollShifts();
    let periodStats = {
      'Standby'    : 0,
      'Training'   : 0,
      'Travel'     : 0,
      'Holiday'    : 0,
      'Vacation'   : 0,
      'Sick'       : 0,
      'Work Report': 0,
    };
    for(let shift of shifts) {
      for(let key of Object.keys(periodStats)) {
        periodStats[key] += shift.getSpecialHours(key).hours;
      }
    }
    return periodStats;
  }

  public addReport(report:Report) {
    let date = moment(report.report_date, "YYYY-MM-DD");
    let shifts = this.getPayrollShifts();
    let shift = shifts.find((a:Shift) => {
      return a.getShiftDate().isSame(date, 'day');
    });
    shift.addShiftReport(report);
    Log.l(`PAYROLLPERIOD.addReport(): Added ReportOther with id ${report._id} to shift ${shift.getShiftDate().format("YYYY-MM-DD")}.`);
  }

  public addReportOther(other:ReportOther) {
    let date = moment(other.report_date);
    let shifts = this.getPayrollShifts();
    let shift = shifts.find((a:Shift) => {
      return a.getShiftDate().isSame(date, 'day');
    });
    shift.addOtherReport(other);
    Log.l(`PAYROLLPERIOD.addReportOther(): Added ReportOther with id ${other._id} to shift ${shift.getShiftDate().format("YYYY-MM-DD")}.`);
  }

  public setSite(site:Jobsite) {
    let num = site.site_number;
    this.site_number = num;
    return this.site_number;
  }

  public getSiteNumber():number {
    return this.site_number;
  }

  public getDateRange(fmt?:string):string {
    // let out = "";
    let format = fmt ? fmt : "DD MMM YYYY";
    let strStart = this.start_date.format(format);
    let strEnd   = this.end_date.format(format);
    let output = `${strStart} — ${strEnd}`;
    let out = output ? output : "UNKNOWN DATE RANGE";
    return out;
  }

  public getKeys():string[] {
    return Object.keys(this);
  }
  public isOnSite():boolean {
    return true;
  }
  // public toJSON():any {
  //   return this.serialize();
  // }
  // public static fromJSON(doc:any):PayrollPeriod {
  //   return PayrollPeriod.deserialize(doc);
  // }
  public getClass():any {
    return PayrollPeriod;
  }
  public static getClassName():string {
    return 'PayrollPeriod';
  }
  public getClassName():string {
    return PayrollPeriod.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
