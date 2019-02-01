/**
 * Name: PayrollPeriods domain class
 * Vers: 1.2.1
 * Date: 2018-12-13
 * Auth: David Sar3geant
 * Logs: 1.2.1 2018-12-13: Refactored imports; added standard OnSite methods
 * Logs: 1.0.1 2018-12-07: Initial creation of class
 */

// import { sprintf       } from 'sprintf-js'       ;
// import { oo            } from '../config'        ;
import { Log           } from '../config'        ;
import { Moment        } from '../config'        ;
import { moment        } from '../config'        ;
import { isMoment      } from '../config'        ;
import { PayrollPeriod } from './payroll-period' ;
import { Schedule      } from './schedule'       ;

export class PayrollPeriods implements Iterator<PayrollPeriod> {
  public get length():number { return Array.isArray(this.periods) ? this.periods.length : 0 };
  public get lastIndex():number { let len = this.length; return len > 0 ? len - 1 : null; };
  public get lastPayrollPeriod():PayrollPeriod { return this.length > 0 ? this.periods[this.lastIndex] : null };
  public periods:PayrollPeriod[] = [];
  public iteratorPayrollPeriod:PayrollPeriod;
  // public sites:Jobsite[] = [];
  constructor() {
    // window['PayrollPeriods'] = PayrollPeriods;
  }

  // public [Symbol.iterator]() {
  //   return {
  //     next: function() {
  //       return {
  //         done: this.counter === this.length,
  //         value: this.counter++
  //       }
  //     }.bind(this)
  //   }
  // }

  public [Symbol.iterator]() {
    let index:number = -1;
    let data:PayrollPeriod[] = this.periods;
    return {
      next: () => ({
        value: data[++index],
        done: !(index in data),
      }),
    };
  }

  public next():{done:any,value:PayrollPeriod} {
    // return this.getNextSchedule();
    return {
      done: this.iteratorPayrollPeriod === this.lastPayrollPeriod,
      value: this.getNextPayrollPeriod(),
    };
  }

  public find(callback:(a:PayrollPeriod) => boolean):PayrollPeriod {
    let period:PayrollPeriod = this.periods.find(callback);
    return period;
  }

  public filter(callback:(a:PayrollPeriod) => boolean):PayrollPeriod[] {
    let periods:PayrollPeriod[] = this.periods.filter(callback);
    return periods;
  }

  public map(callback:(a:PayrollPeriod) => any):any[] {
    let mapped:any[] = this.periods.map(callback);
    return mapped;
  }

  public sort(callback:(a:PayrollPeriod, b:PayrollPeriod) => number):any[] {
    let sorted:any[] = this.periods.slice(0).sort(callback);
    return sorted;
  }

  public getNextPayrollPeriod():PayrollPeriod {
    let length   :number = this.periods.length;
    let lastIndex:number = length - 1;
    let index = this.periods.indexOf(this.iteratorPayrollPeriod);
    if(index < lastIndex) {
      index++;
      this.iteratorPayrollPeriod = this.periods[index];
      return this.iteratorPayrollPeriod;
    } else {
      return null;
    }
  }

  public addPayrollPeriod(schedule:PayrollPeriod):PayrollPeriod[] {
    this.periods.push(schedule);
    this.iteratorPayrollPeriod = this.periods[0];
    return this.periods;
  }

  public getPayrollPeriods():PayrollPeriod[] {
    return this.periods;
  }

  public setPayrollPeriods(periods:PayrollPeriod[]):PayrollPeriod[] {
    if(periods && periods.length) {
      this.periods = periods;
      this.iteratorPayrollPeriod = this.periods[0];
    } else {
      this.periods = this.periods.length ? this.periods : [];
      this.iteratorPayrollPeriod = null;
    }
    return this.periods;
  }

  public getCurrentPeriod():PayrollPeriod {
    let now:Moment = moment();
    let period:PayrollPeriod = this.getPayrollPeriodForDate(now);
    if(period) {
      return period;
    } else {
      period = this.getLatestPeriod();
      return period;
    }
  }

  // public getSites():Jobsite[] {
  //   return this.sites;
  // }

  // public setSites(value:Jobsite[]):Jobsite[] {
  //   this.sites = value;
  //   return this.sites;
  // }

  public getLatestPeriod():PayrollPeriod {
    let periods:PayrollPeriod[] = this.getPayrollPeriods().slice(0);
    periods.sort((a:PayrollPeriod, b:PayrollPeriod) => {
      let dA:Moment = a.start_date;
      let dB:Moment = b.start_date;
      return a > b ? -1 : a < b ? 1 : 0;
    });
    if(periods.length) {
      return periods[0];
    }
  }

  public clone():PayrollPeriods {
    let output:PayrollPeriod[] = [];
    for(let period of this.periods) {
      output.push(period);
    }
    let newPP:PayrollPeriods = new PayrollPeriods();
    newPP.setPayrollPeriods(output);
    return newPP;
  }

  public getPayrollPeriodForDate(date:Moment|Date):PayrollPeriod {
    let periods:PayrollPeriod[] = this.getPayrollPeriods();
    let datem:Moment = moment(date);
    let inDateString:string = datem.format("YYYY-MM-DD");
    Log.l(`PayrollPeriods.getPayrollPeriodForDate(): Now getting period for date '${inDateString}' ...`);
    let periodDate:Moment = this.getPayrollPeriodStartDateFor(datem);
    // let schDateString = isMoment(scheduleDate) ? scheduleDate.format("YYYY-MM-DD") : "INVALID DATE RESULT";
    let dateString:string = isMoment(periodDate) ? periodDate.format("YYYY-MM-DD") : "INVALID DATE RESULT";
    Log.l(`PayrollPeriods.getPayrollPeriodForDate(): Schedule for date '${inDateString}' should apparently have id '${dateString}'.`);
    let period:PayrollPeriod = periods.find((a:PayrollPeriod) => {
      let dA:string = a.start_date.format("YYYY-MM-DD");
      return dA === dateString;
    });
    Log.l(`PayrollPeriods.getPayrollPeriodForDate(): got period:\n`, period);
    return period;
  }

  public static getPayrollPeriodStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getScheduleStartDateFor(date);
  }
  public static getNextPayrollPeriodStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getNextScheduleStartDateFor(date);
  }
  public static getPayrollPeriodStartDateString(date?:Moment|Date):string {
    return Schedule.getScheduleStartDateString(date);
  }
  public static getNextPayrollPeriodStartDateString(date?:Moment|Date):string {
    return Schedule.getNextScheduleStartDateString(date);
  }

  public getPayrollPeriodStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getScheduleStartDateFor(date);
  }
  public getNextPayrollPeriodStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getNextScheduleStartDateFor(date);
  }
  public getPayrollPeriodStartDateString(date?:Moment|Date):string {
    return Schedule.getScheduleStartDateString(date);
  }
  public getNextPayrollPeriodStartDateString(date?:Moment|Date):string {
    return Schedule.getNextScheduleStartDateString(date);
  }

  // public toJSON():any {
  //   return ;
  // }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  // public toJSON():any {
  //   return this.serialize();
  // }
  // public static fromJSON(doc:any):PayrollPeriods {
  //   return PayrollPeriods.deserialize(doc);
  // }
  public getClass():any {
    return PayrollPeriods;
  }
  public static getClassName():string {
    return 'PayrollPeriods';
  }
  public getClassName():string {
    return PayrollPeriods.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
