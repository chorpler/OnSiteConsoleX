/**
 * Name: Schedule Beta domain class
 * Vers: 5.2.1
 * Date: 2019-07-18
 * Auth: David Sargeant
 * Logs: 5.2.1 2019-07-18: Changed some for..in statements to Object.keys() and for..of, and wondered why I'm bothering instead of just deleting this stupid class completely
 * Logs: 5.1.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 5.0.1 2018-02-26: Updated getScheduleStartDateFor() and getNextScheduleStartDateFor() methods, plus static and string methods
 * Logs: 4.0.0 2018-02-20: Added getTechUsernames(), isTechInSchedule(), isUsernameInSchedule(), getTechRotation(), getTechRotationSeq(), getRotationSeq() methods
 * Logs: 2.0.1 2017-12-03: Added functionality and added _id and _rev to serialize output
 * Logs: 1.1.2 2017-09-07: Initial
 */

// import { sprintf          } from 'sprintf-js' ;
// import { MomentInput      } from '../config'  ;
// import { isMoment         } from '../config'  ;
// import { ScheduleDocItem  } from '../config'  ;
// import { Shift            } from './shift'    ;
import { Log              } from '../config'  ;
import { Moment           } from '../config'  ;
import { moment           } from '../config'  ;
import { oo               } from '../config'  ;
import { ScheduleListItem } from '../config'  ;
import { Employee         } from './employee' ;
import { Jobsite          } from './jobsite'  ;

export class ScheduleBeta {
  public sites         : Jobsite[]       = []    ;
  // public techs         : Employee[]      = []    ;
  // public shifts        : Shift[]         = []    ;
  public type          : string               = 'week';
  public creator       : string               = ""    ;
  public start         : Moment               = null  ;
  public end           : Moment               = null  ;
  public startXL       : number                       ;
  public endXL         : number                       ;
  public timestamp     : Moment                       ;
  public timestampXL   : number                       ;
  // public payroll_period: number                       ;
  // public stats         : any = null                   ;
  public schedule      : any = null                   ;
  public scheduleDoc   : any = null                   ;
  public scheduleList  : any[]                = []    ;
  public techs         : Employee[]      = []    ;
  public unassigned    : Employee[]      = []    ;
  public backup        : boolean              = false ;
  public _id           : string               = ""    ;
  public _rev          : string               = ""    ;

  constructor(type?:string,creator?:string,start?:Moment|Date,end?:Moment|Date) {
    // window['onsitedebug'] = window['onsitedebug'] || {};
    // window['onsitedebug']['Schedule'] = Schedule;
    let today     = moment().startOf('day') ;
    this.type     = type                    || "week"                       ;
    this.creator  = creator                 || "grumpy"                     ;
    this.start    = moment(start)           || moment(today)                ;
    this.end      = moment(end)             || moment(today).add(6, 'days') ;
    this.schedule = {};
    this.techs    = [];
    this.unassigned = [];
    this.timestamp = moment();
    this.timestampXL = this.timestamp.toExcel();
  }

  public readFromDoc(doc:any):ScheduleBeta {
    let keys = Object.keys(doc);
    for(let key of keys) {
      if(key === 'start' || key === 'end') {
        this[key] = moment(doc[key], "YYYY-MM-DD");
      } else if(key === 'timestamp') {
        this[key] = moment(doc[key]);
      } else if(key === 'schedule') {
        this[key] = doc[key];
        this.scheduleDoc = oo.clone(doc[key]);
      } else {
        this[key] = doc[key];
      }
    }
    if(keys.indexOf('creator') === -1) {
      this.creator = 'grumpy';
    }
    if(!this.startXL) {
      this.startXL = moment(this.start).toExcel(true);
    }
    if(!this.endXL) {
      this.endXL = moment(this.end).toExcel(true);
    }
    return this;
  }

  public saveToDoc():any {
    let doc:any = {};
    let keys = Object.keys(this);
    if(!this._id) {
      this.generateID();
    }
    this.startXL = this.start.toExcel(true);
    this.endXL  = this.end.toExcel(true);
    for(let key of keys) {
      if(key === 'techs' || key === 'unassigned') {
        let tmp = this[key].map((a:Employee) => a.username);
        doc[key] = tmp;
      } else if(key === 'start' || key ==='end') {
        doc[key] = this[key].format("YYYY-MM-DD");
      } else if(key === 'schedule') {
        let schDoc:any = {};
        for(let sitename in this.schedule) {
          schDoc[sitename] = {};
          for(let rotation in this.schedule[sitename]) {
            let shiftTechs = this.schedule[sitename][rotation];
            schDoc[sitename][rotation] = shiftTechs.map((a:Employee) => a.username);
          }
        }
        doc[key] = schDoc;
      } else if(key === 'timestamp') {
        doc[key] = this[key].format();
      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public deserialize(doc:any):ScheduleBeta {
    return this.readFromDoc(doc);
  }

  public static deserialize(doc:any):ScheduleBeta {
    let schedule = new ScheduleBeta();
    schedule.deserialize(doc);
    return schedule;
  }

  public serialize():ScheduleBeta {
    return this.saveToDoc();
  }

  public generateID():string {
    let start = this.start;
    let week = start.format("YYYY-MM-DD");
    this._id = week;
    return this._id;
  }

  public generateScheduleArray() {
    let schedule = this.schedule;
    let sch = [];

  }

  public loadSites(sites:Jobsite[]):Jobsite[] {
    let out:Jobsite[] = [];
    this.sites = sites;
    return this.sites;
  }

  public getType():string {
    return this.type;
  }

  public setType(value:string):string {
    if(value === 'week' || value === 'day') {
      this.type = value;
    } else {
      Log.e(`SCHEDULE.setType(): Error setting type '${value}', must be 'week' (default) or 'day'.`);
      return null;
    }
    return this.type;
  }

  public getCreator():string {
    return this.creator;
  }

  public setCreator(value:string):string {
    this.creator = value;
    return this.creator;
  }

  public getScheduleID():string {
    let date = moment(this.start).format("YYYY-MM-DD");
    // let type = this.type;
    let creator = this.getCreator();
    let out = this._id ? this._id : `${date}_${creator}`;
    this._id = out;
    return out;
  }

  public getScheduleTitle():string {
    return moment(this.start).format("DD MMM YYYY");
  }

  public getStartDate(str?:boolean):Moment {
    return moment(this.start);
  }

  public setStartDate(day:Date|Moment):Moment {
    // let date;
    // if(isMoment(day) || day instanceof Date) {
    //   date = moment(day);
    // } else {
    //   date = moment(day, "YYYY-MM-DD");
    // }
    let date = moment(day);
    this.start = date.startOf('day');
    this.startXL = date.toExcel(true);
    return moment(this.start);
  }

  public getEndDate():Moment {
    return moment(this.end);
  }

  public setEndDate(day:Date|Moment):Moment {
    // let date;
    // if (isMoment(day) || day instanceof Date) {
    //   date = moment(day);
    // } else {
    //   date = moment(day, "YYYY-MM-DD");
    // }
    let date = moment(day);
    this.end = date.startOf('day');
    this.endXL = date.toExcel(true);
    return moment(this.end);
  }

  public getStartXL():number {
    return this.startXL;
  }

  public getEndXL():number {
    return this.endXL;
  }

  public getSchedule():any {
    return this.schedule;
  }

  public setSchedule(schedule:any):any {
    let keys1 = Object.keys(schedule);
    // for(let i1 in schedule) {
      // let el1 = schedule[i1];
    for(let key1 of keys1) {
      let el1 = schedule[key1];
      let keys2 = Object.keys(el1);
      // for(let i2 in el1) {
      for(let key2 of keys2) {
        // let el2 = el1[i2];
        let el2 = el1[key2];
        let employees = [];
        let replace = false;
        for(let entry of el2) {
          if(entry instanceof Employee) {
            continue;
          } else {
            // Log.l("setSchedule(): Entry is")
            let employee = new Employee();
            employee.readFromDoc(entry);
            let i = el2.indexOf(entry);
            el2[i] = employee;
          }
        }
        // if(replace) {
        //   el2 = employees;
        // }
      }
    }
    this.schedule = schedule;
    return this.schedule;
  }

  public createScheduleDoc():Object {
    let schedule:any = this.getSchedule();
    let keys = Object.keys(schedule);
    if(keys.length > 0) {
      return schedule;
    } else {
      Log.w(`Schedule.getScheduleDoc(): For schedule '${this.getScheduleID()}', unable to find proper scheduleDoc to return. Returning empty object.`);
      return {};
    }
  }

  public createScheduleList():ScheduleListItem[] {
    let list:any[] = this.scheduleList;
    if(list && Array.isArray(list) && list.length) {
      return list;
    } else {
      Log.w(`Schedule.getScheduleList(): For schedule '${this.getScheduleID()}', unable to get proper schedule list. Returning empty array.`);
      return [];
    }
  }

  public getScheduleDoc():any {
    return this.scheduleDoc;
  }

  public setScheduleDoc(value:any):any {
    this.scheduleDoc = value;
    return this.scheduleDoc;
  }

  public getScheduleList():ScheduleListItem[] {
    let list:ScheduleListItem[] = this.scheduleList;
    if(Array.isArray(list)) {

    } else {

    }
    return this.scheduleList;
  }

  public getTechs():Employee[] {
    return this.techs;
  }

  public setTechs(value:Employee[]) {
    // let techNames:Employee[] = [];
    // for(let tech of value) {
    //   if(tech instanceof Employee) {
    //     let name = tech.getUsername();
    //     techNames.push(name);
    //   } else if(typeof tech === 'string') {
    //     techNames.push(tech);
    //   }
    // }

    // this.techs = techNames;
    this.techs = value;
    return this.techs;
  }

  public getUnassigned():Employee[] {
    return this.unassigned;
  }

  public setUnassigned(value:Employee[]) {
    this.unassigned = value;
    return this.unassigned;
  }

  public addTech(tech:Employee):Employee[] {
    let ts = this.techs;
    let i = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ts.splice(i,1);
    }
    ts.push(tech);
    return this.techs;
  }

  public removeTech(tech:Employee):Employee[] {
    let ts = this.techs;
    let ua = this.unassigned;
    let i = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ts.splice(i,1);
    }
    let j = ua.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(j > -1) {
      ua.splice(i,1);
    }
    return this.techs;
  }

  public addUnassignedTech(tech:Employee):Employee[] {
    let ua = this.unassigned;
    let ts = this.techs;
    let name = tech.username;
    let i = ua.findIndex((a:Employee) => {
      return a.username === name;
    });
    let j = ts.findIndex((a:Employee) => {
      return a.username === name;
    });
    // if(i > -1) {
    //   ua.splice(i,1);
    // }
    if(i === -1) {
      ua.push(tech);
    }
    if(j === -1) {
      ts.push(tech);
    }
    let doc = this.scheduleDoc;
    let record = doc[name] || {};
    record.site = 1;
    record.rotation = "UNASSIGNED";
    record.shift = "AM";
    doc[name] = record;
    let list = this.scheduleList;
    let entry = list.find((a:any) => {
      return a.tech === name;
    });
    if(entry) {
      entry.site = 1;
      entry.rotation = "UNASSIGNED";
      entry.shift = "AM";
    } else {
      let newEntry = {tech: name, site: 1, rotation: "UNASSIGNED", shift: "AM" };
      list.push(newEntry);
    }
    return this.unassigned;
  }

  public removeUnassignedTech(tech:Employee):Employee[] {
    let ua = this.unassigned;
    let ts = this.techs;
    let i = ua.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    let j = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ua.splice(i,1);
    }
    return this.unassigned;
  }

  public createSchedulingObject(sites:Jobsite[], techs:Employee[]):any {
    let scheduleObject = {};
    this.unassigned = techs.slice(0);
    this.techs = techs.slice(0);
    let sch = this.schedule;
    let siteNames = Object.keys(sch);
    for(let site of sites) {
      let siteName = site.getScheduleName();
      scheduleObject[siteName] = {};
      for(let siteRotation of site.shiftRotations) {
        let rotation = siteRotation.name;
        scheduleObject[siteName][rotation] = [];
      }
    }
    for(let siteName of siteNames) {
      let siteObject = sch[siteName];
      scheduleObject[siteName] = scheduleObject[siteName] || {};
      let siteRotations = Object.keys(siteObject);
      for(let siteRotation of siteRotations) {
        let techList = siteObject[siteRotation];
        scheduleObject[siteName][siteRotation] = scheduleObject[siteName][siteRotation] || [];
        for(let techName of techList) {
          if(techName instanceof Employee) {
            let i = this.techs.findIndex((a:Employee) => {
              return a.username === techName.username;
            });
            if(i > -1) {
              let tech = this.techs[i];
              scheduleObject[siteName][siteRotation].push(tech);
              let j = this.unassigned.findIndex((a:Employee) => {
                return a.username === techName.username;
              });
              if(j > -1) {
                let tech = this.unassigned.splice(j, 1)[0];
              }
            } else {
              Log.w(`createSchedulingObject(): Can't find tech (even though it's an Employee object) '${techName.username}' in tech array:\n`, techs);
            }
          } else {
            let i = this.techs.findIndex((a:Employee) => {
              return a.username === techName || a.toString() === techName;
            });
            if(i > -1) {
              let tech = this.techs[i];
              scheduleObject[siteName][siteRotation].push(tech);
              let j = this.unassigned.findIndex((a: Employee) => {
                return a.username === techName || a.toString() === techName;
              });
              if (j > -1) {
                let tech = this.unassigned.splice(j, 1)[0];
              }
            } else {
              Log.w(`createSchedulingObject(): Can't find tech '${techName}' in tech array:\n`, techs);
            }
          }
        }
      }
    }
    this.schedule = scheduleObject;
    return scheduleObject;
  }

  public createEmptySchedule(sites:Jobsite[]) {
    let schedule = {};
    for(let site of sites) {
      let siteName = site.getScheduleName();
      schedule[siteName] = {};
      for (let rot of site.shiftRotations) {
        let rotation = rot.name;
        schedule[siteName][rotation] = [];
      }
    }
    this.schedule = schedule;
    return this.schedule;
  }

  public add(tech:Employee, entry:any) {
    let user;
    let doc = this.scheduleDoc || {};
    let list = this.scheduleList || [];
    if(tech) {
      // if(tech && tech instanceof Employee) {
        user = tech.getUsername();
      // } else if(tech && typeof tech === 'string') {
      //   user = tech;
      // }
      let i = this.techs.findIndex((a:Employee) => {
        return a.username === user;
      });
      if(i === -1) {
        this.techs.push(tech);
      }
      doc[user] = entry;
      let listItemIndex = list.findIndex((a:any) => {
        return a.tech === user;
      });
      let listEntry;
      if (listItemIndex > -1) {
        listEntry = list[listItemIndex];
      } else {
        listEntry = {tech: user, site: 1, rotation: "CONTN WEEK", shift: "AM" };
        list.push(listEntry);
      }

      let entryKeys = Object.keys(entry);
      for(let key of entryKeys) {
        listEntry[key] = entry[key];
      }
      this.scheduleList = list;
      this.scheduleDoc = doc;
      return listEntry;
    } else {
      Log.w("ScheduleBeta.add(): Must include tech and entry! Tech and entry are: ", tech);
      Log.w(entry);
      return null;
    }
  }

  public getTechUsernames():string[] {
    let out:string[] = this.techs.map((a:Employee) => a.username);
    return out;
  }

  public isTechInSchedule(tech:Employee):boolean {
    let username = tech.getUsername();
    return this.isUsernameInSchedule(username);
  }

  public isUsernameInSchedule(name:string):boolean {
    let techInList = this.techs.find((a:Employee) => a.username === name);
    if(techInList) {
      return true;
    } else {
      let techUnassigned = this.unassigned.find((a:Employee) => a.username === name);
      if(techUnassigned) {
        return true;
      } else {
        return false;
      }
    }
  }

  // public findTech(tech:Employee):Employee {

  // }
  // public findTechUsername():string {

  // }
  // public findActiveTech() {

  // }
  public getTechRotation(tech:Employee):string {
    if(!this.isTechInSchedule(tech)) {
      return "MISSING";
    } else {
      let techRotation;
      let name = tech.getUsername();
      let schedule = this.getSchedule();
      outerloop:
      for(let siteName in schedule) {
        let siteRotations = schedule[siteName];
        for(let rotation in siteRotations) {
          let techs = siteRotations[rotation];
          if(techs.indexOf(name) > -1) {
            techRotation = rotation;
            break outerloop;
          }
          // let i = techs.findIndex((a:Employee) => {
          //   return a.username === tech.username;
          // });
          // if(i > -1) {
          //   techRotation = rotation;
          //   break outerloop;
          // }
        }
      }
      if(techRotation) {
        return techRotation;
      } else {
        let date = this.getStartDate().format("YYYY-MM-DD");
        Log.w(`Schedule.getTechRotation(): Unable to find tech rotation for '${tech.getUsername()}', date '${date}'`);
        return "UNASSIGNED";
      }
    }
  }

  public getTechRotationSeq(tech:Employee):string {
    let rotation = this.getTechRotation(tech);
    return this.getRotationSeq(rotation);
  }

  public static getRotationSeq(rotation:string|{name:string,fullName:string,code?:string,value?:string,id?:string}):string {
    let a = "";
    if(typeof rotation === 'string') {
      a = rotation;
    } else if(typeof rotation === 'object' && rotation.name !== undefined) {
      a = rotation.name;
    } else {
      a = JSON.stringify(rotation);
    }
    let out = a === 'FIRST WEEK' ? "A" : a === 'CONTN WEEK' ? "B" : a === 'FINAL WEEK' ? "C" : a === 'DAYS OFF' ? "D" : a === 'VACATION' ? "V" : a === "UNASSIGNED" ? "X" : a === "MISSING" ? "Y" : "Z";
    return out;
  }

  public getRotationSeq(rotation:string|{name:string,fullName:string,code?:string,value?:string,id?:string}):string {
    return ScheduleBeta.getRotationSeq(rotation);
  }

  // public static getNextScheduleStartDateFor(forDate?:Moment|Date) {
  //   // let date = moment(forDate);
  //   // Schedule starts on day 3 (Wednesday)
  //   let scheduleStartsOnDay = 3;
  //   let day = forDate ? moment(forDate) : moment();

  //   if (day.isoWeekday() <= scheduleStartsOnDay) { return day.isoWeekday(scheduleStartsOnDay); }
  //   else { return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  // }

  // public static getScheduleStartDateFor(forDate?:Moment|Date) {
  //   // let date = moment(forDate);
  //   // Schedule starts on day 3 (Wednesday)
  //   let scheduleStartsOnDay = 3;
  //   let day = forDate ? moment(forDate) : moment();
  //   if (day.isoWeekday() < scheduleStartsOnDay) { return moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  //   else { return moment(day).isoWeekday(scheduleStartsOnDay); }
  // }

  public static getScheduleStartDateFor(date?:Moment|Date):Moment {
    let day                 = date ? moment(date).startOf('day') : moment().startOf('day');
    let scheduleStartsOnDay = 3;
    if(day.isoWeekday() < scheduleStartsOnDay) {
      return moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    } else {
      return moment(day).isoWeekday(scheduleStartsOnDay);
    }
  }
  public static getNextScheduleStartDateFor(date?:Moment|Date):Moment {
    let day                 = date ? moment(date).startOf('day') : moment().startOf('day');
    let scheduleStartsOnDay = 3;
    if(day.isoWeekday() < scheduleStartsOnDay) {
      return day.isoWeekday(scheduleStartsOnDay);
    } else {
      return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay);
    }
  }
  public static getScheduleStartDateString(date?:Moment|Date):string {
    return ScheduleBeta.getScheduleStartDateFor(date).format("YYYY-MM-DD");
  }
  public static getNextScheduleStartDateString(date?:Moment|Date):string {
    return ScheduleBeta.getNextScheduleStartDateFor(date).format("YYYY-MM-DD");
  }

  public getScheduleStartDateFor(date?:Moment|Date):Moment {
    return ScheduleBeta.getScheduleStartDateFor(date);
  }
  public getNextScheduleStartDateFor(date?:Moment|Date):Moment {
    return ScheduleBeta.getNextScheduleStartDateFor(date);
  }
  public getScheduleStartDateString(date?:Moment|Date):string {
    return this.getScheduleStartDateFor(date).format("YYYY-MM-DD");
  }
  public getNextScheduleStartDateString(date?:Moment|Date):string {
    return this.getNextScheduleStartDateFor(date).format("YYYY-MM-DD");
  }

  public toString():string {
    return this.getScheduleID();
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
  public static fromJSON(doc:any):ScheduleBeta {
    return ScheduleBeta.deserialize(doc);
  }
  public getClass():any {
    return ScheduleBeta;
  }
  public static getClassName():string {
    return 'ScheduleBeta';
  }
  public getClassName():string {
    return ScheduleBeta.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
