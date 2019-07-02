/**
 * Name: Schedules domain class
 * Vers: 3.0.1
 * Date: 2018-03-01
 * Auth: David Sargeant
 * Logs: 3.0.1 2018-03-01: Added getScheduleForDate() and made class iterable, hopefully
 * Logs: 2.0.1 2018-02-26: Added date fields, plus
 * Logs: 1.0.1 2017-08-14: Initial creation of class
 */

import { Log      } from '../config'  ;
import { Moment   } from '../config'  ;
import { Jobsite  } from './jobsite'  ;
import { Employee } from './employee' ;
import { Schedule } from './schedule' ;
import { moment   } from '../config'  ;
import { isMoment } from '../config'  ;

export class Schedules implements Iterator<Schedule> {
  public get length():number { return Array.isArray(this.schedules) ? this.schedules.length : 0; }
  public get lastIndex():number { let len = this.length; return len > 0 ? len - 1 : null; }
  public get lastSchedule():Schedule { return this.length > 0 ? this.schedules[this.lastIndex] : null; }
  public schedules:Schedule[] = [];
  public iteratorSchedule:Schedule;
  public sites:Jobsite[] = [];
  constructor() {
    window['Schedules'] = Schedules;
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

  public setSchedules(schedules:Schedule[]):Schedule[] {
    if(schedules && schedules.length) {
      this.schedules = schedules;
      this.iteratorSchedule = this.schedules[0];
    } else {
      this.schedules = this.schedules.length ? this.schedules : [];
      this.iteratorSchedule = null;
    }
    return this.schedules;
  }

  public getSites():Jobsite[] {
    return this.sites;
  }

  public setSites(value:Jobsite[]):Jobsite[] {
    this.sites = value;
    return this.sites;
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
    let siteList = schedule.schedule;
    let siteNames = Object.keys(siteList);
    outerloop:
    for(let siteName of siteNames) {
      let siteRotations = siteList[siteName];
      let rotationNames = Object.keys(siteRotations);
      // for(let rotation in schedule.schedule[siteName]) {
      for(let rotationName of rotationNames) {
        // let techs = schedule.schedule[siteName][rotation];
        let techList = siteRotations[rotationName];
        let techs = techList[rotationName];
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
    Log.l(`Schedules.getScheduleForDate(): Now getting schedule for date '${inDateString}' …`);
    let scheduleDate:Moment = this.getScheduleStartDateFor(datem);
    // let schDateString = isMoment(scheduleDate) ? scheduleDate.format("YYYY-MM-DD") : "INVALID DATE RESULT";
    let dateString:string = isMoment(scheduleDate) ? scheduleDate.format("YYYY-MM-DD") : "INVALID DATE RESULT";
    Log.l(`Schedules.getScheduleForDate(): Schedule for date '${inDateString}' should apparently have id '${dateString}'.`);
    let schedule:Schedule = schedules.find((a:Schedule) => {
      return a._id === dateString;
    });
    Log.l(`Schedules.getScheduleForDate(): got schedule:\n`, schedule);
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
  }
}
