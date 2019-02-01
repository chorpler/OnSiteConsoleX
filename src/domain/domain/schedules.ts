/**
 * Name: Schedules domain class
 * Vers: 3.2.2
 * Date: 2019-01-31
 * Auth: David Sargeant
 * Logs: 3.2.2 2019-01-31: Fixed bug in getLatestSchedule() method that was returning OLDEST schedule if no current schedule existed
 * Logs: 3.2.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 3.1.1 2018-09-17: Added getLatestSchedule() and getCurrentSchedule() methods
 * Logs: 3.0.1 2018-03-01: Added getScheduleForDate() and made class iterable, hopefully
 * Logs: 2.0.1 2018-02-26: Added date fields, plus
 * Logs: 1.0.1 2017-08-14: Initial creation of class
 */

// import { sprintf       } from 'sprintf-js'       ;
// import { oo            } from '../config'        ;
// import { Shift         } from './shift'          ;
// import { PayrollPeriod } from './payroll-period' ;
import { Log           } from '../config'        ;
import { Moment        } from '../config'        ;
import { moment        } from '../config'        ;
import { isMoment      } from '../config'        ;
import { Jobsite       } from './jobsite'        ;
import { Employee      } from './employee'       ;
import { Schedule      } from './schedule'       ;

export class Schedules implements Iterator<Schedule> {
  public get length():number { return Array.isArray(this.schedules) ? this.schedules.length : 0 };
  public get lastIndex():number { let len = this.length; return len > 0 ? len - 1 : null; };
  public get lastSchedule():Schedule { return this.length > 0 ? this.schedules[this.lastIndex] : null };
  public schedules:Schedule[] = [];
  public iteratorSchedule:Schedule;
  public sites:Jobsite[] = [];
  constructor() {
    // window['Schedules'] = Schedules;
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
    let data:Schedule[] = this.schedules;
    return {
      next: () => ({
        value: data[++index],
        done: !(index in data),
      }),
    };
  }

  public next():{done:any,value:Schedule} {
    // return this.getNextSchedule();
    return {
      done: this.iteratorSchedule === this.lastSchedule,
      value: this.getNextSchedule(),
    };
  }

  public getNextSchedule():Schedule {
    let length = this.schedules.length;
    let lastIndex = length - 1;
    let index = this.schedules.indexOf(this.iteratorSchedule);
    if(index < lastIndex) {
      index++;
      this.iteratorSchedule = this.schedules[index];
      return this.iteratorSchedule;
    } else {
      return null;
    }
  }

  public addSchedule(schedule:Schedule):Schedule[] {
    this.schedules.push(schedule);
    this.iteratorSchedule = this.schedules[0];
    return this.schedules;
  }

  public getSchedules():Schedule[] {
    return this.schedules;
  }

  public setSchedules(schedules:Array<Schedule>):Schedule[] {
    if(schedules && schedules.length) {
      this.schedules = schedules;
      this.iteratorSchedule = this.schedules[0];
    } else {
      this.schedules = this.schedules.length ? this.schedules : [];
      this.iteratorSchedule = null;
    }
    return this.schedules;
  }

  public getCurrentSchedule():Schedule {
    let now:Moment = moment();
    let schedule:Schedule = this.getScheduleForDate(now);
    if(schedule) {
      return schedule;
    } else {
      schedule = this.getLatestSchedule();
      return schedule;
    }
  }

  public getSites():Jobsite[] {
    return this.sites;
  }

  public setSites(value:Jobsite[]):Jobsite[] {
    this.sites = value;
    return this.sites;
  }

  public getLatestSchedule():Schedule {
    let schedules:Schedule[] = this.getSchedules().slice(0);
    schedules.sort((a:Schedule, b:Schedule) => {
      let dA:number = a.getStartXL();
      let dB:number = b.getStartXL();
      return dA > dB ? -1 : dA < dB ? 1 : 0;
    });
    if(schedules.length) {
      return schedules[0];
    }
  }

  public getSiteForTechAndDate(tech:Employee, scheduleDate:Moment|Date):Jobsite {
    // let date = moment(scheduleDate);
    let date = Schedule.getScheduleStartDateFor(scheduleDate);
    let schedules = this.schedules;
    let username = tech.getUsername();
    let foundSiteName = "";
    let schedule = schedules.find(a => {
      return a['start'].isSame(date, 'day');
    });
    outerloop: for(let siteName in schedule.schedule) {
      for(let rotation in schedule.schedule[siteName]) {
        let techs = schedule.schedule[siteName][rotation];
        let i = techs.indexOf(username);
        if(i > -1) {
          foundSiteName = siteName;
          break outerloop;
        }
      }
    }
    let site = this.sites.find(a => {
      return a.getScheduleName() === foundSiteName;
    });
    return site;
  }

  public clone():Schedules {
    let output = [];
    for(let schedule of this.schedules) {
      output.push(schedule);
    }
    let newSchedules = new Schedules();
    newSchedules.setSchedules(output);
    return newSchedules;
  }

  public getScheduleForDate(date:Moment|Date):Schedule {
    let schedules:Schedule[] = this.getSchedules();
    let datem = moment(date);
    let inDateString = datem.format("YYYY-MM-DD");
    Log.l(`Schedules.getScheduleForDate(): Now getting schedule for date '${inDateString}' ...`);
    let scheduleDate:Moment = this.getScheduleStartDateFor(datem);
    // let schDateString = isMoment(scheduleDate) ? scheduleDate.format("YYYY-MM-DD") : "INVALID DATE RESULT";
    let dateString:string = isMoment(scheduleDate) ? scheduleDate.format("YYYY-MM-DD") : "INVALID DATE RESULT";
    // Log.l(`Schedules.getScheduleForDate(): Schedule for date '${inDateString}' should apparently have id '${dateString}'.`);
    let schedule:Schedule = schedules.find((a:Schedule) => {
      return a._id === dateString;
    });
    Log.l(`Schedules.getScheduleForDate(): got schedule:`, schedule);
    return schedule;
  }

  public static getScheduleStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getScheduleStartDateFor(date);
  }
  public static getNextScheduleStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getNextScheduleStartDateFor(date);
  }
  public static getScheduleStartDateString(date?:Moment|Date):string {
    return Schedule.getScheduleStartDateString(date);
  }
  public static getNextScheduleStartDateString(date?:Moment|Date):string {
    return Schedule.getNextScheduleStartDateString(date);
  }

  public getScheduleStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getScheduleStartDateFor(date);
  }
  public getNextScheduleStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getNextScheduleStartDateFor(date);
  }
  public getScheduleStartDateString(date?:Moment|Date):string {
    return Schedule.getScheduleStartDateString(date);
  }
  public getNextScheduleStartDateString(date?:Moment|Date):string {
    return Schedule.getNextScheduleStartDateString(date);
  }


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
  // public static fromJSON(doc:any):Schedules {
  //   return Schedules.deserialize(doc);
  // }
  public getClass():any {
    return Schedules;
  }
  public static getClassName():string {
    return 'Schedules';
  }
  public getClassName():string {
    return Schedules.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
