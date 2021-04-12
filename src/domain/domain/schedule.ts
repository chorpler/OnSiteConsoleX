/**
 * Name: Schedule domain class
 * Vers: 6.11.0
 * Date: 2019-07-23
 * Auth: David Sargeant
 * Logs: 6.11.0 2019-07-23: Added getStartDateAsString() method
 * Logs: 6.10.2 2019-07-18: Minor TSLint indent error fixed, probably introduced in 6.10.1
 * Logs: 6.10.1 2019-07-01: Minor TSLint fixes with for..in and whatnot
 * Logs: 6.10.0 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 6.9.0 2018-11-15: Added approved field
 * Logs: 6.8.0 2018-09-17: Added optionality to sites parameter for getTechLocation() method, with checking
 * Logs: 6.7.0 2018-09-10: Added addSite() method
 * Logs: 6.6.0 2018-09-05: Added isSiteInSchedule(), isSiteNameInSchedule() methods, and modified loadSites() method to be case-insensitive
 * Logs: 6.5.2 2018-08-31: Added getContainerForUsername() method,
 * Logs: 6.5.1 2018-08-30: Added setUnassignedActive() method
 * Logs: 6.5.0 2018-08-14: Changed how constructor reads parameter; initialized properties immediately instead of in constructor; added some options for setStartDate(), setEndDate()
 * Logs: 6.4.0 2018-07-11: Added property unassigned_active, methods getUnassignedActive(), getUnassignedActiveCount(); revised getWorkingTechs() and whatnot
 * Logs: 6.3.2 2018-07-11: Added methods isTechUnassigned(), isUsernameUnassigned(), isTechWorking(), isUsernameWorking(), pruneTechsList()
 * Logs: 6.3.0 2018-06-13: Added methods getWorkingTechsCount(), getUnassignedCount(), getTechsCount()
 * Logs: 6.2.0 2018-05-03: Fixed bug in createScheduleList() method by adding UNASSIGNED and LEGRAVE detection, and added sort to techs/unassigned properties
 * Logs: 6.1.0 2018-05-01: Added getTechContainerArray() method
 * Logs: 6.0.2 2018-04-18: Added checks in createSchedulingObject() method for already existing this.techs and this.sites
 * Logs: 6.0.1 2018-04-03: Added getWorkingTechs() method
 * Logs: 5.1.1 2018-03-21: Added getWorkingTechs() method
 * Logs: 5.0.1 2018-02-26: Updated getScheduleStartDateFor() and getNextScheduleStartDateFor() methods
 * Logs: 4.3.1 2018-02-21: Added auto-creation of startXL/endXL fields if they don't exist in serialized doc
 * Logs: 4.2.1 2018-02-21: Added actual schedule document string->Employee conversion to loadTechs()
 * Logs: 4.1.1 2018-02-21: Fixed getTechRotation() to account for schedule being strings or Employee objects
 * Logs: 4.0.1 2018-02-21: Added a debugging output for loadTechs Log line
 * Logs: 4.0.0 2018-02-20: Added getTechUsernames(), isTechInSchedule(), isUsernameInSchedule(), getTechRotation(), getTechRotationSeq(), getRotationSeq() methods
 * Logs: 3.1.4 2017-09-19: Initial keeping of logs.
 */

// import { sprintf          } from 'sprintf-js' ;
// import { MomentInput      } from '../config'  ;
// import { ScheduleDocItem  } from '../config'  ;
// import { Shift            } from './shift'    ;
import { Log              } from '../config'  ;
import { Moment           } from '../config'  ;
import { moment           } from '../config'  ;
import { isMoment         } from '../config'  ;
import { oo               } from '../config'  ;
import { ScheduleListItem } from '../config'  ;
import { SESACLL          } from '../config'  ;
import { Jobsite          } from './jobsite'  ;
import { Employee         } from './employee' ;


export class Schedule {
  public sites         : Jobsite[]       = []    ;
  // public techs         : Employee[]      = []    ;
  // public shifts        : Shift[]         = []    ;
  // public payroll_period: number                       ;
  // public stats         : any = null                   ;
  // public techs         : Employee[]      = []    ;
  // public unassigned    : Employee[]      = []    ;
  public type                 : string               = 'week';
  public creator              : string               = "grumpy";
  public start                : Moment               = moment().startOf('day');
  public end                  : Moment               = moment(this.start).add(6, 'days')  ;
  public startXL              : number               = this.start.toExcel(true);
  public endXL                : number               = this.end.toExcel(true);
  public timestamp            : Moment               = moment()        ;
  public timestampXL          : number               = this.timestamp.toExcel();
  public schedule             : any    = {}          ;
  public scheduleDoc          : Object = {}          ;
  public scheduleList         : ScheduleListItem[] = [] ;
  public techs                : Employee[]      = []    ;
  public unassigned           : Employee[]      = []    ;
  public unassigned_active    : Employee[]      = []    ;
  public backup               : boolean              = false ;
  public approved             : boolean              = false ;
  public _id                  : string               = ""    ;
  public _rev                 : string               = ""    ;

  // constructor(type?:string,creator?:string,start?:Moment|Date,end?:Moment|Date) {
  constructor(doc?:any) {
    window['onsitedebug'] = window['onsitedebug'] || {};
    window['onsitedebug']['Schedule'] = Schedule;
    if(doc) {
      return this.deserialize(doc);
    } else {
      let today               = moment().startOf('day')  ;
      // this.type               = type                     || "week"                       ;
      // this.creator            = creator                  || "grumpy"                     ;
      // this.start              = moment(start)            || moment(today)                ;
      // this.end                = moment(end)              || moment(today).add(6, 'days') ;
      // this.startXL            = moment(start).toExcel(true);
      // this.endXL              = moment(end).toExcel(true);
      this.schedule           =                          {                               } ;
      this.scheduleDoc        =                          {                               } ;
      this.techs              = []                       ;
      this.unassigned         = []                       ;
      this.unassigned_active  = []                       ;
      // this.timestamp          = moment()                 ;
      // this.timestampXL        = this.timestamp.toExcel() ;
      // this.backup             = false                    ;
    }
  }

  public readFromDoc(doc:any):Schedule {
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
    this.pruneTechsList();
    for(let key of keys) {
      if(key === 'unassigned_active') {
        /* Skip this export */
      } else if(key === 'techs' || key === 'unassigned') {
        let value:any[] = this[key];
        if(value[0] instanceof Employee) {
          let tmp = value.map((a:Employee) => a.username).sort();
          doc[key] = tmp;
        } else if(typeof value[0] === 'string') {
          doc[key] = value.sort();
        } else {
          let arr1 = this[key];
          if(Array.isArray(arr1)) {
            arr1 = arr1.sort();
            doc[key] = arr1;
          } else {
            doc[key] = this[key];
          }
        }
      } else if(key === 'start' || key ==='end') {
        doc[key] = this[key].format("YYYY-MM-DD");
      } else if(key === 'startXL' || key === 'endXL') {
        doc[key] = this.start.toExcel(true);
      } else if(key === 'endXL') {
        doc[key] = this.end.toExcel(true);
      } else if(key === 'schedule') {
        let schDoc:any = {};
        let siteNames = Object.keys(this.schedule);
        for(let sitename of siteNames) {
          if(!sitename) {
            continue;
          }
          schDoc[sitename] = {};
          let rotations = Object.keys(this.schedule[sitename]);
          for(let rotation of rotations) {
            let shiftTechs = this.schedule[sitename][rotation];
            schDoc[sitename][rotation] = shiftTechs.map((a:Employee) => a.username);
          }
        }
        doc[key] = schDoc;
      } else if(key === 'timestamp') {
        doc[key] = this[key].format();
      } else if(key === 'sites') {
        doc[key] = this.sites.map((a:Jobsite) => a._id);
      } else {
        doc[key] = this[key];
      }
    }
    if(doc._id === undefined) {
      doc._id = this.getScheduleID();
    }
    doc.startXL = this.start.toExcel(true);
    doc.endXL = this.end.toExcel(true);
    return doc;
  }

  public deserialize(doc:any):Schedule {
    return this.readFromDoc(doc);
  }

  public static deserialize(doc:any):Schedule {
    let schedule:Schedule = new Schedule(doc);
    // schedule.deserialize(doc);
    return schedule;
  }

  public serialize():any {
    return this.saveToDoc();
  }

  public loadTechs(employees:Employee[]):Schedule {
    let techNames = this.techs.slice(0);
    let unassignedNames = this.unassigned.slice(0);
    let techCount = techNames.length;
    let unassignedCount = unassignedNames.length;
    let techsConverted = 0, unassignedConverted = 0;
    let allTechs:Employee[] = [];
    for(let i = 0; i < techCount; i++) {
      let name:any = techNames[i];
      if(typeof name === 'string') {
        let tech:Employee = employees.find((a:Employee) => a.username === name);
        if(tech) {
          // this.techs[i] = tech;
          allTechs.push(tech);
          techsConverted++;
        }
      }
    }
    this.setTechs(allTechs);
    let unassigned:Employee[] = [];
    for(let i = 0; i < unassignedCount; i++) {
      let name:any = unassignedNames[i];
      if(typeof name === 'string') {
        let tech:Employee = employees.find((a:Employee) => a.username === name);
        if(tech) {
          // this.unassigned[i] = tech;
          unassigned.push(tech);
          unassignedConverted++;
        }
      }
    }
    this.setUnassigned(unassigned);

    let schedule = this.getSchedule();
    let siteNames = Object.keys(schedule);
    for(let siteName of siteNames) {
      let siteRotations = schedule[siteName];
      let siteRotationNames = Object.keys(siteRotations);
      for(let rotation of siteRotationNames) {
        let techNamesIn = siteRotations[rotation];
        // let techs:Employee[] = [];
        let len = techNamesIn.length;
        for(let i = 0; i < len; i++) {
          let name:string = techNamesIn[i];
          let tech:Employee = employees.find((a:Employee) => a.username === name);
          if(tech) {
            techNamesIn[i] = tech;
            if(this.techs.indexOf(tech) === -1) {
              this.techs.push(tech);
            }
          }
        }
      }
    }
    // let workingTechs:Employee[] = this.getWorkingTechs();
    // let unassignedTechs:Employee[] = this.getUnassigned();
    // let scheduled:Employee[] = [ ...workingTechs, ...unassignedTechs ];
    let techs:Employee[] = this.techs.filter((a:Employee) => {
      if(a instanceof Employee) {
        let container:any[] = this.getContainerForTech(a);
        if(container) {
          return true;
        }
      } else {
        Log.l(`loadTechs(): Schedule.techs has a non-Employee value: `, a);
        return null;
      }
    });
    this.setTechs(techs);

    // let unassigned_active:Employee[] = this.unassigned.filter((a:Employee) => {
    //   if(a instanceof Employee) {
    //     return a.active;
    //   }
    // });
    // this.unassigned_active = unassigned_active;
    this.generateUnassignedActive();

    let id = this._id || 'unknown';
    // Log.l(`Schedule.loadTechs(${id}): Converted ${techsConverted} working techs and ${unassignedConverted} unassigned techs. Techs list:\n`, this.techs);
    return this;
  }

  public loadSites(sites:Jobsite[]):Jobsite[] {
    // let out:Jobsite[] = [];
    let realSites:Jobsite[] = sites.filter((a:Jobsite) => {
      return a.site_number > 9;
    });
    let doc:any = this.schedule;
    let rawSiteNames:string[] = Object.keys(doc);
    let siteNames:string[] = rawSiteNames.map((a:string) => a.toLowerCase());
    let usedSites:Jobsite[] = realSites.filter((a:Jobsite) => {
      let name:string = a.getScheduleName().toLowerCase();
      return siteNames.indexOf(name) > -1;
    });
    this.sites = usedSites;
    return this.sites;
  }

  public isSiteInSchedule(site:Jobsite):boolean {
    if(site instanceof Jobsite) {
      let siteName:string = site.getScheduleName();
      return this.isSiteNameInSchedule(siteName);
    } else {
      Log.w(`isSiteInSchedule(): Must provide a Jobsite object as parameter, not:\n`, site);
    }
    return false;
  }

  public isSiteNameInSchedule(siteName:string):boolean {
    let doc:any = this.getSchedule();
    let name:string = typeof siteName === 'string' ? siteName.toLowerCase() : "";
    let rawSiteNames:string[] = Object.keys(doc);
    let siteNames:string[] = rawSiteNames.map((a:string) => {
      if(typeof a === 'string') {
        return a.toLowerCase();
      }
    });
    let index:number = siteNames.indexOf(name);
    if(index > -1) {
      return true;
    }
    return false;
  }

  public getSites():Jobsite[] {
    return this.sites;
  }

  public addSite(site:Jobsite):Jobsite[] {
    if(site instanceof Jobsite) {
      let siteName = site.getScheduleName();
      let siteRotations = site.getShiftRotations();
      let schedule = this.getSchedule();
      let siteNameCI =  siteName.toLowerCase();
      let scheduledSiteNames = Object.keys(schedule);
      let scheduledSiteNamesCI = scheduledSiteNames.map((a:string) => a.toLowerCase());
      if(scheduledSiteNamesCI.indexOf(siteNameCI) > -1) {
        Log.w(`addSite(): Cannot add site '${siteName}' to schedule, it already exists`);
      } else {
        schedule[siteName] = {};
        for(let rotation of siteRotations) {
          let rotationName = rotation.name;
          schedule[siteName][rotationName] = [];
        }
      }
      let existingSite:Jobsite = this.sites.find((a:Jobsite) => {
        let nA = a.getScheduleName().toLowerCase();
        return nA === siteNameCI;
      });
      if(existingSite) {
        Log.w(`addSite(): Site '${siteName}' not found in schedule document but was found in schedule sites list.`);
      } else {
        this.sites.push(site);
      }
      return this.sites;
    } else {
      Log.w(`addSite(): Parameter must be a Jobsite object. This was:\n`, site);
    }
  }

  public removeSite(site:Jobsite):Jobsite[] {
    if(site instanceof Jobsite) {
      let siteName = site.getScheduleName();
      let techs:Employee[] = this.getAllTechsForSite(site);
      let schedule = this.getSchedule();
      let siteNameCI =  siteName.toLowerCase();
      let scheduledSiteNames = Object.keys(schedule);
      let scheduledSiteNamesCI = scheduledSiteNames.map((a:string) => a.toLowerCase());
      if(scheduledSiteNamesCI.indexOf(siteNameCI) > -1) {
        if(techs && techs.length) {
          for(let tech of techs) {
            this.addUnassignedTech(tech);
          }
        }
        delete schedule[siteName];
        let sites:Jobsite[] = this.sites.filter((a:Jobsite) => {
          let nA:string = a.getScheduleName().toLowerCase();
          return nA !== siteNameCI;
        });
        this.sites = sites;
        return this.sites;
      } else {
        Log.w(`removeSite(): Cannot find site '${siteName}' in schedule.`);
      }
    } else {
      Log.w(`removeSite(): Parameter must be a Jobsite object. This was:\n`, site);
    }
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
    if(this._id) {
      return this._id;
    } else {
      let date = moment(this.start).format("YYYY-MM-DD");
      // let type = this.type;
      let creator = this.getCreator();
      let out = this._id ? this._id : `${date}_${creator}`;
      if(creator === 'grumpy') {
        out = this._id ? this._id : `${date}`;
      }
      this._id = out;
      return out;
    }
  }

  public getScheduleTitle():string {
    return moment(this.start).format("DD MMM YYYY");
  }

  public getStartDate(str?:boolean):Moment {
    return moment(this.start);
  }

  public getStartDateAsString(format?:string):string {
    let start = moment(this.start);
    let fmt:string = typeof format === "string" ? format : "YYYY-MM-DD";
    return start.format(fmt);
  }

  public setStartDate(day:Date|Moment|string):Moment {
    // let date;
    // if(isMoment(day) || day instanceof Date) {
    //   date = moment(day);
    // } else {
    //   date = moment(day, "YYYY-MM-DD");
    // }
    let date:Moment;
    if(typeof day === 'string') {
      date = moment(day, 'YYYY-MM-DD');
    } else if(isMoment(day) || day instanceof Date) {
      date = moment(day);
    } else {
      Log.w(`Schedule.setStartDate(): Must be a Date, Moment, or string of type 'YYYY-MM-DD'. Cannot use supplied value:\n`, day);
      return null;
    }
    this.start = moment(date).startOf('day');
    this.startXL = date.toExcel(true);
    return moment(this.start);
  }

  public getEndDate():Moment {
    return moment(this.end);
  }

  public setEndDate(day:Moment|Date|string):Moment {
    // let date;
    // if (isMoment(day) || day instanceof Date) {
    //   date = moment(day);
    // } else {
    //   date = moment(day, "YYYY-MM-DD");
    // }
    let date:Moment;
    if(typeof day === 'string') {
      date = moment(day, 'YYYY-MM-DD');
    } else if(isMoment(day) || day instanceof Date) {
      date = moment(day);
    } else {
      Log.w(`Schedule.setEndDate(): Must be a Date, Moment, or string of type 'YYYY-MM-DD'. Cannot use supplied value:\n`, day);
      return null;
    }
    this.end = moment(date).startOf('day');
    this.endXL = date.toExcel(true);
    return moment(this.end);
  }

  public getStartXL():number {
    this.startXL = moment(this.start).toExcel(true);
    return this.startXL;
  }

  public getEndXL():number {
    this.endXL = moment(this.end).toExcel(true);
    return this.endXL;
  }

  public getSchedule():any {
    return this.schedule;
  }

  public setSchedule(schedule:any):any {
    let keys = Object.keys(schedule);
    for(let i1 of keys) {
      let el1 = schedule[i1];
      let keys2 = Object.keys(el1);
      for(let i2 of keys2) {
        let el2 = el1[i2];
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

  public getScheduleDoc():Object {
    let doc:any = this.scheduleDoc;
    let keys = Object.keys(doc);
    if (keys.length > 0) {
      return doc;
    } else {
      let schedule:any = this.getSchedule();
      let keys2 = Object.keys(schedule);
      if(keys2.length > 0) {
        return schedule;
      } else {
        Log.w(`Schedule.getScheduleDoc(): For schedule '${this.getScheduleID()}', unable to find proper scheduleDoc to return. Returning empty object.`);
        return {};
      }
    }
  }

  public getScheduleList():ScheduleListItem[] {
    let list:any[] = this.scheduleList;
    if(list && Array.isArray(list) && list.length) {
      return list;
    } else {
      Log.w(`Schedule.getScheduleList(): For schedule '${this.getScheduleID()}', unable to get proper schedule list. Returning empty array.`);
      return [];
    }
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

  public setUnassigned(value:Employee[]):Employee[] {
    this.unassigned = value;
    this.generateUnassignedActive();
    return this.unassigned;
  }

  public setUnassignedActive(value:Employee[]):Employee[] {
    this.unassigned_active = value;
    return this.unassigned_active;
  }

  public getUnassignedActive():Employee[] {
    return this.unassigned_active;
  }

  public getUnassignedActiveCount():number {
    return this.unassigned_active.length;
  }

  public getWorkingTechs():Employee[] {
    let techs:Employee[] = this.getTechs();
    let workingTechs:Employee[] = [];
    for(let tech of techs) {
      if(!(tech instanceof Employee)) {
        Log.w(`Schedule.getWorkingTechs(): techs array is not made up of Employee objects, can't scan it:\n`, techs);
        return [];
      }
    }
    let scheduleDoc = this.getSchedule();
    let sites = Object.keys(scheduleDoc);
    for(let siteName of sites) {
      let site = scheduleDoc[siteName];
      let rotations = Object.keys(site);
      for(let rotationName of rotations) {
        let siteRotation = site[rotationName];
        for(let siteTech of siteRotation) {
          let workingTech:Employee;
          let name:string = "";
          if(siteTech instanceof Employee) {
            name = siteTech.getUsername();
          } else if(typeof siteTech === 'string') {
            name = siteTech;
          }
          workingTech = techs.find((a:Employee) => {
            return a.getUsername() === name;
          });
          if(workingTech) {
            workingTechs.push(workingTech);
            if(techs.indexOf(workingTech) === -1) {
              techs.push(workingTech);
            }
          }
        }
      }
    }
    return workingTechs;

    // for(let tech of techs) {
    //   if(tech instanceof Employee) {
    //     let name = tech.getUsername();
    //     let scheduleDoc = this.getSchedule();
    //     let sites = Object.keys(scheduleDoc);
    //     for(let siteName of sites) {
    //       let site = scheduleDoc[siteName];
    //       let rotations = Object.keys(site);
    //       for(let rotationName of rotations) {
    //         let siteRotation = site[rotationName];
    //         for(let siteTech of siteRotation) {
    //           let workingTech:Employee;
    //           let name:string = "";
    //           if(siteTech instanceof Employee) {
    //             name = siteTech.getUsername();
    //           } else if(typeof siteTech === 'string') {
    //             name = siteTech;
    //           }
    //           workingTech = techs.find((a:Employee) => {
    //             return a.getUsername() === name;
    //           });
    //           if(workingTech) {
    //             workingTechs.push(workingTech);
    //           }
    //         }
    //       }
    //     }
    //   } else {
    //     Log.w(`Schedule.getWorkingTechs(): techs array is not made up of Employee objects, can't scan it.`);
    //     return [];
    //   }
    // }
    // return workingTechs;
  }

  public getWorkingTechsCount():number {
    let workingTechs:Employee[] = this.getWorkingTechs();
    return workingTechs.length;
  }

  public getUnassignedCount():number {
    return this.unassigned.length;
  }

  public getTechsCount():number {
    return this.techs.length;
  }

  public generateUnassignedActive():Employee[] {
    let unassigned_active:Employee[] = this.unassigned.filter((a:Employee) => {
      if(a instanceof Employee) {
        return a.active;
      }
    });
    this.unassigned_active = unassigned_active;
    return unassigned_active;
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
    let username:string = tech.getUsername();
    Log.l(`removeTech(): Looking to remove tech '${username}' …`);
    this.techs = ts.filter((a:Employee) => a.username !== username);
    let container:Employee[] = this.getContainerForUsername(username);
    if(container) {
      let i = container.indexOf(tech);
      Log.l(`removeTech(): Found tech '${username}' at index '${i}' in container:\n`, container);
      if(i > -1) {
        container.splice(i, 1);
      }
      Log.l(`removeTech(): Container after splice:\n`, container);
      // container = container.filter((a:Employee) => a.username !== username);
    }
    let newUA:Employee[] = ua.filter((a:Employee) => a.username !== username);
    this.setUnassigned(newUA);
    // this.generateUnassignedActive();
    // let i = ts.findIndex((a:Employee) => {
    //   return a.username === tech.username;
    // });
    // if(i > -1) {
    //   ts.splice(i,1);
    // }
    return this.techs;
  }

  public addUnassignedTech(tech:Employee):Employee[] {
    let ua = this.unassigned;
    let ts = this.techs;
    let i = ua.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    let j = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
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
    this.generateUnassignedActive();
    return this.unassigned;
  }

  public removeUnassignedTech(tech:Employee):Employee[] {
    let un = this.unassigned;
    let ts = this.techs;
    let ua = this.unassigned_active;
    let name:string = tech.getUsername();
    this.unassigned        = un.filter((a:Employee) => a.username !== name);
    this.techs             = ts.filter((a:Employee) => a.username !== name);
    this.generateUnassignedActive();
    // this.unassigned_active = ua.filter((a:Employee) => a.username !== name);
    // let u
    // let i = un.findIndex((a:Employee) => {
    //   return a.username === tech.username;
    // });
    // let j = ts.findIndex((a:Employee) => {
    //   return a.username === tech.username;
    // });
    // if(i > -1) {
    //   un.splice(i,1);
    // }
    return this.unassigned;
  }

  public createSchedulingObject(sites:Jobsite[], techs:Employee[]):any {
    let scheduleObject = {};
    if(!(this.unassigned && this.unassigned.length)) {
      this.unassigned = techs.slice(0);
    }
    if(!(this.techs && this.unassigned.length)) {
      this.techs = techs.slice(0);
    }
    // this.unassigned = techs.slice(0);
    // this.techs = techs.slice(0);
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
        for(let tech of techList) {
          let name;
          if(tech instanceof Employee) {
            name = tech.getUsername();
          } else {
            name = tech;
          }
          let i = techs.findIndex((a:Employee) => {
            return a.username === name;
          });
          if(i > -1) {
            let tech2 = techs.splice(i, 1)[0];
            scheduleObject[siteName][siteRotation].push(tech2);
          } else {
            Log.w(`createSchedulingObject(): Can't find tech '${name}' in tech array:`, techs);
          }
        }
      }
    }
    this.unassigned = techs.slice(0);
    this.schedule = scheduleObject;
    return scheduleObject;
  }

  public createEmptySchedule(sites:Jobsite[]):any {
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

  public createScheduleList():ScheduleListItem[] {
    let output:ScheduleListItem[] = [];
    let outDoc:any = {};
    let schedule = this.getSchedule();
    let sites:Jobsite[] = this.sites || [];
    let site:Jobsite;
    let siteNames = Object.keys(schedule);
    for(let siteName of siteNames) {
      try {
        // if(!siteName) {
        //   continue;
        // }
        let siteRotations = schedule[siteName];
        site = this.sites.find((a:Jobsite) => {
          if(a instanceof Jobsite) {
            return a.schedule_name.toUpperCase() === siteName.toUpperCase();
          } else {
            return false;
          }
        });
        if(!site) {
          continue;
        }
        let site_number:number = site.getSiteNumber();
        if(site_number === 1 || site_number === 2) {
          continue;
        }
        // let output:ScheduleListItem[] = [];
        let rotationNames = Object.keys(siteRotations);
        for(let rotationName of rotationNames) {
          let techList = siteRotations[rotationName];
          for(let tech of techList) {
            let docRecord:any = {};
            let name = tech.getUsername();
            let shift = typeof tech.shift === 'string' ? tech.shift : "AM";
            docRecord = {
              tech     : name         ,
              site     : site_number  ,
              rotation : rotationName ,
              shift    : shift        ,
            };
            outDoc[name] = docRecord;
            // let newRecord = docRecord;
            // docRecord['tech'] = name;
            output.push(docRecord);
            // if(tech instanceof Employee) {

            // } else if(typeof tech === 'string') {

            // }
          }
        }
      } catch(err) {
        Log.w(`createScheduleList(): Error during processing of site '${siteName}':\n`, site);
        Log.e(err);
        // throw new Error(err);
        return [];
      }
    }
    this.scheduleDoc = outDoc;
    this.scheduleList = output;
    Log.l(`createScheduleList(): Output doc is:\n`, outDoc);
    Log.l(`createScheduleList(): Output list is:\n`, output);
    return output;
  }

  public getScheduleDocument():any {
    let sites:Jobsite[] = this.sites || [];
    let out:Object[] = [];
    let outDoc:any = {};
    let schedule = this.getSchedule();
    let siteNames = Object.keys(schedule);
    for(let siteName of siteNames) {
      let siteRotations = schedule[siteName];
      let site:Jobsite = this.sites.find((a:Jobsite) => {
        return a.schedule_name.toUpperCase() === siteName.toUpperCase();
      });
      let site_number:number = site.getSiteNumber();
      let output:any[] = [];
      let rotationNames = Object.keys(siteRotations);
      for(let rotationName of rotationNames) {
        let techList = siteRotations[rotationName];
        for(let tech of techList) {
          let docRecord:any = {};
          let name = tech.getUsername();
          docRecord = {
            site: site_number,
            rotation: rotationName,
            shift: tech.getTech
          };
          outDoc[name] = docRecord;
          let newRecord = docRecord;
          docRecord['tech'] = name;
          output.push(docRecord);
          // if(tech instanceof Employee) {

          // } else if(typeof tech === 'string') {

          // }
        }
      }
      this.scheduleDoc = outDoc;
      this.scheduleList = output;
    }
  }

  public getTechUsernames():string[] {
    let out:string[] = this.getTechs().map((a:Employee) => a.username);
    return out;
  }

  public isTechInSchedule(tech:Employee):boolean {
    let username = tech.getUsername();
    return this.isUsernameInSchedule(username);
  }

  public isUsernameInSchedule(name:string):boolean {
    // let techInList = this.getTechs().find((a:Employee) => a.username === name);
    // if(techInList) {
    //   return true;
    // } else {
    //   return this.isUsernameUnassigned(name);
    //   // let techUnassigned = this.getUnassigned().find((a:Employee) => a.username === name);
    //   // if(techUnassigned) {
    //   //   return true;
    //   // } else {
    //   //   return false;
    //   // }
    // }
    let container = this.getContainerForUsername(name);
    if(container) {
      return true;
    } else {
      return false;
    }
  }

  public isTechUnassigned(tech:Employee):boolean {
    let name:string = tech.getUsername();
    return this.isUsernameUnassigned(name);
    // let techUnassigned = this.getUnassigned().find((a:Employee) => a.username === name);
    // if(techUnassigned) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  public isUsernameUnassigned(name:string):boolean {
    let techUnassigned = this.getUnassigned().find((a:Employee) => a.username === name);
    if(techUnassigned) {
      return true;
    } else {
      return false;
    }
  }

  public isTechWorking(tech:Employee):boolean {
    let name:string = tech.getUsername();
    return this.isUsernameWorking(name);
  }

  public isUsernameWorking(name:string):boolean {
    let techWorking = this.getWorkingTechs().find((a:Employee) => a.username === name);
    if(techWorking) {
      return true;
    } else {
      return false;
    }
  }

  public pruneTechsList():Employee[] {
    let working:Employee[] = this.getWorkingTechs();
    let unassigned:Employee[] = this.getUnassigned();
    let techs:Employee[] = [ ...working, ...unassigned ];
    techs = techs.sort((a:Employee,b:Employee) => {
      let uA = a.username;
      let uB = b.username;
      return uA > uB ? 1 : uA < uB ? -1 : 0;
    });
    this.techs  = techs;
    return techs;
  }

  public getTechRotation(tech:Employee):string {
    if(!this.isTechInSchedule(tech)) {
      // return "MISSING";
      return "UNASSIGNED";
    } else {
      let techRotation:string;
      let name = tech.getUsername();
      let schedule = this.getSchedule();
      let siteNames = Object.keys(schedule);
      outerloop:
      for(let siteName of siteNames) {
        let siteRotations = schedule[siteName];
        let rotationNames = Object.keys(siteRotations);
        for(let rotation of rotationNames) {
          let techs = siteRotations[rotation];
          let testCase = techs[0];
          let techNames:string[] = [];
          if(testCase) {
            if(testCase instanceof Employee) {
              techNames = techs.map((a:Employee) => a.username);
            } else if(typeof testCase === 'string') {
              techNames = techs;
            }
          }
          if(techNames.indexOf(name) > -1) {
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
        // Log.w(`Schedule.getTechRotation(): Unable to find tech rotation for '${tech.getUsername()}', date '${date}'`);
        return "UNASSIGNED";
      }
    }
  }

  public getTechRotationSeq(tech:Employee):string {
    let rotation = this.getTechRotation(tech);
    return this.getRotationSeq(rotation);
  }

  public static getRotationSeq(rotation:string|SESACLL):string {
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

  public getRotationSeq(rotation:string|SESACLL):string {
    return Schedule.getRotationSeq(rotation);
  }

  public getTechLocation(tech:Employee, jobsites?:Jobsite[]):Jobsite {
    let sites:Jobsite[];
    if(jobsites) {
      sites = jobsites;
    } else if(this.sites.length && this.sites[0] instanceof Jobsite) {
      sites = this.sites;
    }
    if(!sites) {
      throw new Error("getTechLocation(): Job sites not initialized or provided.");
    }
    let unassigned_site = sites.find((a:Jobsite) => a.site_number === 1);
    let name = tech.getUsername();
    let id = this.getScheduleID();
    if(!this.isTechInSchedule(tech)) {
      // Log.w(`Schedule.getTechLocation(): tech '${name}' not found in schedule '${id}'.`);
      return unassigned_site;
    } else {
      let schedule = this.getSchedule();
      let scheduleName;
      let siteNames = Object.keys(schedule);
      outerloop:
      for(let siteName of siteNames) {
        let siteRotations = schedule[siteName];
        let rotationNames = Object.keys(siteRotations);
        for(let rotation of rotationNames) {
          let techs = siteRotations[rotation];
          let testCase = techs[0];
          let techNames:string[] = [];
          if(testCase) {
            if(testCase instanceof Employee) {
              techNames = techs.map((a:Employee) => a.username);
            } else if(typeof testCase === 'string') {
              techNames = techs;
            }
          }
          if(techNames.indexOf(name) > -1) {
            scheduleName = siteName;
            break outerloop;
          }
        }
      }
      if(scheduleName) {
        let site = sites.find((a:Jobsite) => a.getScheduleName().toUpperCase() === scheduleName.toUpperCase());
        if(site) {
          return site;
        } else {
          return unassigned_site;
        }
      } else {
        // Log.w(`Schedule.getTechLocation(): tech '${name}' not found in any location of schedule '${id}'.`);
        return unassigned_site;
      }
    }
  }

  public getAllTechsForSite(site:Jobsite):Employee[] {
    let out:Employee[] = [];
    let outList:any[] = [];
    let scheduleName:string = site.getScheduleName() || "";
    let scheduleKey = scheduleName.toUpperCase();
    let schedule = this.getSchedule();
    let scheduleKeys = Object.keys(schedule);
    let keys:string[] = [];
    for(let key of scheduleKeys) {
      let oneScheduleName = key.toUpperCase();
      keys.push(oneScheduleName);
    }
    if(keys.indexOf(scheduleKey) === -1) {
      return out;
    } else {
      let siteRecord = schedule[scheduleName];
      if(siteRecord) {
        let rotationNames = Object.keys(siteRecord);
        for(let rotationName of rotationNames) {
          let siteRotationTechs = siteRecord[rotationName];
          for(let tech of siteRotationTechs) {
            out.push(tech);
          }
        }
      }
      return out;
    }
  }

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
    return Schedule.getScheduleStartDateFor(date).format("YYYY-MM-DD");
  }
  public static getNextScheduleStartDateString(date?:Moment|Date):string {
    return Schedule.getNextScheduleStartDateFor(date).format("YYYY-MM-DD");
  }

  public getScheduleStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getScheduleStartDateFor(date);
  }
  public getNextScheduleStartDateFor(date?:Moment|Date):Moment {
    return Schedule.getNextScheduleStartDateFor(date);
  }
  public getScheduleStartDateString(date?:Moment|Date):string {
    return this.getScheduleStartDateFor(date).format("YYYY-MM-DD");
  }
  public getNextScheduleStartDateString(date?:Moment|Date):string {
    return this.getNextScheduleStartDateFor(date).format("YYYY-MM-DD");
  }

  public getContainerForTech(tech:Employee):Array<Employee|string> {
    if(!(tech instanceof Employee)) {
      Log.l(`getArrayForTech(): Must provide Employee object as argument, not:\n`, tech);
      throw new Error("getArrayForTech(): Invalid object passed as parameter");
    }
    let username:string = tech.getUsername();
    return this.getContainerForUsername(username);
  }

  public getContainerForUsername(username:string):Employee[] {
    let doc = this.getSchedule();
    let siteNames:string[] = Object.keys(doc);
    let output:Employee[] = null;
    for(let siteName of siteNames) {
      let siteRotations = doc[siteName];
      let rotations:string[] = Object.keys(siteRotations);
      for(let rotation of rotations) {
        let siteRotation = siteRotations[rotation];
        let i = siteRotation.findIndex((a:Employee|string) => {
          if(a instanceof Employee) {
            return a.getUsername() === username;
          } else if(typeof a === 'string') {
            return a === username;
          } else {
            return false;
          }
        });
        if(i > -1) {
          return siteRotation;
        }
      }
    }
    if(this.isUsernameUnassigned(username)) {
      return this.unassigned;
    }
    // Log.w(`Schedule.getContainerForUsername(): Employee username '${username}' was not found in any site/rotation on schedule '${this._id}'`);
    return output;
  }

  // public getTechContainerArray(tech:Employee):Employee[] {
  //   let doc = this.getSchedule();
  //   let siteNames:string[] = Object.keys(doc);
  //   let output:Employee[] = [];
  //   for(let siteName of siteNames) {
  //     let siteRotations = doc[siteName];
  //     let rotations:string[] = Object.keys(siteRotations);
  //     for(let rotation of rotations) {
  //       let siteRotation = siteRotations[rotation];
  //       let username:string = tech instanceof Employee ? tech.getUsername() : "";
  //       let i = siteRotation.findIndex((a:Employee) => {
  //         if(a instanceof Employee) {
  //           return a.getUsername() === username;
  //         } else {
  //           return false;
  //         }
  //       });
  //       if(i > -1) {
  //         return siteRotation;
  //       }
  //     }
  //   }
  //   Log.w(`Schedule.getTechContainerArray(): Employee was not found in any site/rotation on schedule '${this._id}':\n`, tech);
  //   return output;
  // }

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
  public static fromJSON(doc:any):Schedule {
    return Schedule.deserialize(doc);
  }
  public getClass():any {
    return Schedule;
  }
  public static getClassName():string {
    return 'Schedule';
  }
  public getClassName():string {
    return Schedule.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}
