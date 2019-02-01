/**
 * Name: Employee domain class
 * Vers: 8.1.4
 * Date: 2019-02-01
 * Auth: David Sargeant
 * Logs: 8.1.4 2019-02-01: Changed how isLevel1Manager() works to make it case-insensitive
 * Logs: 8.1.3 2019-01-24: Changed employeeMoved to default to false, and not to save during serialization
 * Logs: 8.1.2 2018-09-25: Fixed case-sensitivity bug for isLogistics() and isOffice() methods
 * Logs: 8.1.1 2018-09-24: Fixed isOffice() method to return false instead of undefined
 * Logs: 8.1.0 2018-09-11: Changed how readFromDoc() handles userClass
 * Logs: 7.1.0 2018-09-10: Changed constructor to single parameter
 * Logs: 6.6.1 2018-08-09: Added EmployeeType enum and isLogistics(), isOffice() methods
 * Logs: 6.5.0 2018-06-11: Added birthdate property and notes property
 * Logs: 6.4.0 2018-05-31: Added employeeType property
 * Logs: 6.3.0 2018-05-01: Added setStatus() method and isTestUser property, plus StatusUpdateType and EmployeeStatusLogEntry types, plus addStatusUpdate() method
 * Logs: 6.2.0 2018-04-30: Added employeeMoved and changed type of street address to Street class
 * Logs: 6.1.0 2018-04-09: Added logistics boolean field
 * Logs: 6.0.1 2018-03-26: Changed to use SESAShift and whatnot
 * Logs: 5.4.0 2018-03-19: Added salaried property (boolean)
 * Logs: 5.3.0 2018-03-07: Added matchesSite() method
 * Logs: 5.2.0 2018-03-01: Added methods getLastName(), getFirstName(), getMiddleName(), getPrefix(), getSuffix(), and modified getQuickbooksName()
 * Logs: 5.1.0 2018-02-21: Added getQuickbooksName() method
 * Logs: 5.0.1 2017-12-15: Merged app and console domain class
 * Logs: 4.2.1 2017-12-15: Added some serialization/deserialization methods
 * Logs: 4.1.1 2017-11-20: added technician property output to serialize method
 * Logs: 4.1.0: added isOfficeEmployee method
 * Logs: 4.0.1: changed type of userClass, client, location, locID (all were any)
 * Logs: 3.5.1: Changed "created" and "lastUpdated" to timestamp strings instead of Moment
 */

import { moment           } from '../config'               ;
import { isMoment         } from '../config'               ;
import { Moment           } from '../config/moment-onsite' ;
import { oo               } from '../config'               ;
import { Street           } from './street'                ;
import { Address          } from './address'               ;
import { Jobsite          } from './jobsite'               ;
import { Log              } from '../config/config.log'    ;
import { SESACLL          } from '../config/config.types'  ;
import { SESAShiftSymbols } from '../config/config.types'  ;
import { SESAClient       } from '../config/config.types'  ;
import { SESALocation     } from '../config/config.types'  ;
import { SESALocID        } from '../config/config.types'  ;

// export type CLL = {name:string, fullName:string};

// export type EmployeeType = "FIELD" | "OFFICE" | "LOGISTICS";
export enum EmployeeType {
  FIELD     = 'FIELD'     ,
  OFFICE    = 'OFFICE'    ,
  LOGISTICS = 'LOGISTICS' ,
};

export type StatusUpdateType = "created" | "updated" | "activated" | "deactivated";
export type EmployeeStatusLogEntry = {
  type      : StatusUpdateType ,
  user      : string           ,
  timestamp : string           ,
};

export class Employee {
  public _id                 : string        = ""            ;
  public _rev                : string        = ""            ;
  public name                : string        = ""            ;
  public username            : string        = ""            ;
  public avatarName          : string        = ""            ;
  public prefix              : string        = ""            ;
  public firstName           : string        = ""            ;
  public lastName            : string        = ""            ;
  public middleName          : string        = ""            ;
  public suffix              : string        = ""            ;
  public technician          : string        = ""            ;
  public type                : any           = ""            ;
  public avtrNameAsUser      : boolean       = true          ;
  public userClass           : string[]      = ["TECHNICIAN"];
  // public client              : SESAClient    = new SESAClient();
  // public location            : SESALocation  = new SESALocation();
  // public locID               : SESALocID     = new SESALocID();
  public client              : string        = ""            ;
  public location            : string        = ""            ;
  public locID               : string        = ""            ;
  public workSite            : string        = ""            ;
  public site_number         : number        = -1            ;
  // public shift               : any           = {name: "AM", fullName: "AM", value: "AM", code: "AM", };
  public shift               : string        = "AM"          ;
  public shiftLength         : string|number = ""            ;
  public shiftStartTime      : number        = 8             ;
  public shiftStartTimeMoment: Moment        = null          ;
  public shiftStartTimeHour  : string        = "08:00"       ;
  public rotation            : string        = ""            ;
  public email               : Array<string> = []            ;
  public phone               : string        = ""            ;
  public cell                : string        = ""            ;
  public address             : Address       = new Address() ;
  public payRate             : number        = 0             ;
  public salaried            : boolean       = false         ;
  public active              : boolean       = true          ;
  public updated             : boolean       = false         ;
  public created             : string        = moment().format();
  public lastUpdated         : string        = moment().format();
  public statusUpdates       : Array<EmployeeStatusLogEntry>    = []            ;
  public logistics           : boolean       = false         ;
  public employeeMoved       : boolean       = false         ;
  public isTestUser          : boolean       = false         ;
  public employeeType        : EmployeeType  = EmployeeType.FIELD       ;
  public birthdate           : string        = ""            ;
  public notes               : string        = ""            ;

  // constructor(prefix?, firstName?, lastName?, middleName?, suffix?, username?, name?, type?, avatarName?, avtrNameAsUser?, userClass?, client?, location?, locID?, shift?, shiftLength?, shiftStartTime?, email?, phone?, cell?) {
  //   this.prefix               = prefix         || "" ;
  //   this._id                  = "";
  //   this._rev                 = "";
  //   this.firstName            = firstName      || "" ;
  //   this.lastName             = lastName       || "" ;
  //   this.middleName           = middleName     || "" ;
  //   this.suffix               = suffix         || "" ;
  //   this.technician           = ""             ;
  //   this.username             = username       || "" ;
  //   this.name                 = name           || "" ;
  //   this.type                 = type           || "user" ;
  //   this.avatarName           = avatarName     || "" ;
  //   this.avtrNameAsUser       = avtrNameAsUser || true ;
  //   this.userClass            = userClass      || ["TECHNICIAN"] ;
  //   this.client               = client         || new SESAClient() ;
  //   this.location             = location       || new SESALocation() ;
  //   this.locID                = locID          || new SESALocID() ;
  //   this.workSite             = ""                     ;
  //   this.site_number          = -1                     ;
  //   this.shift                = shift          || {name: "AM", fullName: "AM", value: "AM", code: "AM", } ;
  //   this.shiftLength          = shiftLength    || null ;
  //   this.shiftStartTime       = shiftStartTime || null ;
  //   this.shiftStartTimeMoment = shiftStartTime || null ;
  //   this.shiftStartTimeHour   = shiftStartTime || null ;
  //   this.rotation             = ""                     ;
  //   this.email                = [email]        || null ;
  //   this.phone                = phone          || null ;
  //   this.cell                 = cell           || null ;
  //   this.address              = new Address()  ;
  //   this.payRate              = 0              ;
  //   this.active               = true           ;
  //   this.updated              = false          ;
  //   this.created              = moment().format();
  //   this.lastUpdated          = moment().format();
  // }

  constructor(doc?:any) {
    if(doc) {
      return this.deserialize(doc);
    } else {

    }
  }

  public readFromForm(doc:any) {
    for (let prop in doc) {
      let docprop = doc[prop];
      if (docprop && typeof docprop === 'object') {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop].name);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = startHour;
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if(prop === 'jobsite') {
          let site = doc[prop];
          Log.l("Employee.readFromDoc(): site is:\n", site);
          let cli = site.client;
          let loc = site.location;
          let lid = site.locID;
          let sno = site.site_number;
          if(typeof cli === 'string') {
            cli = JSON.parse(cli);
          }
          if(typeof loc === 'string') {
            loc = JSON.parse(loc);
          }
          if(typeof lid === 'string') {
            lid = JSON.parse(lid);
          }
          if(typeof sno === 'string') {
            sno = JSON.parse(sno);
          }
          this.client = cli.fullName.toUpperCase();
          this.location = loc.fullName.toUpperCase();
          this.locID = lid.name.toUpperCase();
          this.workSite = site._id || `${cli.name.toUpperCase()} ${loc.fullName.toUpperCase()} ${lid.name.toUpperCase()}`;
          this.site_number = sno || -1;
        } else if (prop === 'client' || prop === 'location') {
          this[prop] = doc[prop].fullName.toUpperCase();
        } else if (prop === 'locID' || prop === 'aux' || prop === 'shift') {
          this[prop] = doc[prop].name.toUpperCase();
        } else if (prop === 'shiftLength' || prop === 'shiftStartTime') {
          this[prop] = Number(doc[prop].name);
        } else if (prop === 'address') {
          let a:Address = doc[prop];
          if (a && a.street && a.street instanceof Street || typeof a.street === 'object') {
            // this.address = a;
            this.address.street.street1 = a.street.street1;
            this.address.street.street2 = a.street.street2;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode || a.zip || '';
          } else if (a.street) {
            this.address.street.street1 = a.street;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode ? a.zipcode : a.zip ? a.zip : '';
          } else {
            Log.w("Address.readFromDoc(): Doc invalid:\n", doc);
            return null;
          }
        } else {
          this[prop] = doc[prop];
        }
      } else {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop]);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = doc[prop];
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if (prop === 'street') {
          this.address.street.street1 = doc[prop];
        } else if (prop === 'zipcode' || prop === 'zip') {
          this.address.zip = doc[prop];
        } else {
          this[prop] = doc[prop];
        }
      }
    }
    if (doc && doc.name === undefined) { this.name = doc.avatarName; }
    this.avatarName = this.name;
    this.username = this.name;
  }

  public readFromDoc(doc:any):Employee {
    let localKeys:string[] = Object.keys(this);
    for(let prop in doc) {
      let docprop = doc[prop];
      if(docprop && typeof docprop === 'object') {
        if(Array.isArray(docprop)) {
          let temp = docprop.slice(0);
          if(localKeys.indexOf(prop) > -1) {
            this[prop] = temp;
          }
        }
        if(prop === 'shiftStartTime') {
          let startHour = Number(doc[prop].name);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = startHour;
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if(prop === 'userClass') {
          if(typeof docprop === 'string') {
            this[prop] = [ docprop ];
          } else if(Array.isArray(docprop)) {
            this[prop] = oo.clone(docprop);
          }
        } else if(prop === 'client' || prop === 'location') {
          this[prop] = doc[prop].fullName.toUpperCase();
        } else if(prop === 'locID' || prop === 'aux' || prop === 'shift') {
          this[prop] = doc[prop].name.toUpperCase();
        } else if(prop === 'shiftLength' || prop === 'shiftStartTime') {
          this[prop] = Number(doc[prop].name);
        } else if (prop === 'address') {
          let a:any = doc[prop];
          if (typeof a.street === 'object') {
            // this.address = a;
            this.address.street.street1 = a.street.street1;
            this.address.street.street2 = a.street.street2;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode || a.zip || '';
          } else if (a.street) {
            this.address.street.street1 = a.street;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode ? a.zipcode : a.zip ? a.zip : '';
          } else {
            Log.w("Address.readFromDoc(): Doc invalid:\n", doc);
            return null;
          }
        } else if(prop !== 'jobsite') {
          this[prop] = doc[prop];
        }
      } else {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop]);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = doc[prop];
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if (prop === 'street') {
          this.address.street.street1 = doc[prop];
        } else if (prop === 'zipcode' || prop === 'zip') {
          this.address.zip = doc[prop];
        } else if(prop !== 'jobsite') {
          this[prop] = doc[prop];
        }
      }
    }
    if (doc && doc.name === undefined) { this.name = doc.avatarName; }
    this.avatarName = this.name;
    this.username   = this.name;
    this.employeeMoved = false;
    return this;
  }

  public serialize():any {
    let keys = Object.keys(this);
    let doc:any = {};
    for(let key of keys) {
      if(key === 'employeeMoved') {
        // ignore it
      } else if(key === 'shiftStartTimeMoment') {
        // doc[key] = this[key].format();
      } else if(key === 'technician') {
        doc[key] = this.technician || this.getTechName();
      } else {
        doc[key] = this[key];
      }
    }
    doc['avtrNameAsUser'] = true;
    return doc;
  }

  public static deserialize(doc:any):Employee {
    let employee = new Employee();
    employee.readFromDoc(doc);
    return employee;
  }

  public deserialize(doc:any):Employee {
    this.readFromDoc(doc);
    return this;
  }

  public getTechID():string {
    return this.username;
  }

  public getFullName():string {
    let fullName = "";
    fullName += this.lastName ? this.lastName : '';
    fullName += ",";
    fullName += this.prefix ? ` ${this.prefix}` : '';
    fullName += this.firstName ? ` ${this.firstName}` : '';
    fullName += this.middleName ? ` ${this.middleName}` : '';
    fullName += this.suffix ? ` ${this.suffix}` : '';
    return fullName;
  }

  public getTechName():string {
    let fullName = `${this.lastName}, ${this.firstName}`;
    return fullName;
  }

  public getFullNameNormal():string {
    let fullName = `${this.firstName} ${this.lastName}`;
    return fullName;
  }

  public getClient():string {
    let out:string = "";
    if(this.client) {
      if(typeof this.client === 'string') {
        let cli:string = this.client;
        return cli.toUpperCase();
      } else if(typeof this.client === 'object') {
        let out:any;
        if(this.client && typeof this.client['fullName'] === 'string') {
          let client = this.client && typeof this.client['fullName'] === 'string' && (this.client['fullName'] as string).toUpperCase() ? (this.client['fullName'] as string).toUpperCase() : "UNKNOWN";
          out = client;
          return out;
        } else {
          if(this.client && typeof this.client['[fullName]'] === 'string' && (this.client['fullName'] as string).toUpperCase()) {

          } else {
            return "UNKNOWN";
          }
          return "UNKNOWN";
        }
      } else {
        let cli:string = this.client || "";
        let client:string = cli.toUpperCase();
        return client;
      }
    }
    // return this.client && typeof this.client === 'object' && this.client['fullName'] ? this.client['fullName'].toUpperCase() : typeof this.client === 'string' ? this.client.toUpperCase() : this.client;
  }

  public getUsername():string {
    return this.username ? this.username : this.avatarName ? this.avatarName : "UNKNOWNUSERNAME";
  }

  public getShiftType():string {
    return this.shift || "AM";
  }

  public setShiftType(AMorPM:string):string {
    this.shift = AMorPM || "AM";
    return this.shift;
  }

  public getShiftRotation():string {
    if(this.rotation) {
      return this.rotation;
    } else {
      return "CONTN WEEK";
    }
  }

  public getShift():string {
    let shift:string = this.shift;
    if(shift) {
      return shift;
    } else {
      return "AM";
    }
  }

  public setShift(AMorPM:string):string {
    this.shift = AMorPM;
    return this.shift;
  }

  public getShiftLength():string {
    let out:number = Number(this.shiftLength);
    let strOut:string = String(out);
    if(!isNaN(out)) {
      return strOut;
    } else {
      return "0";
    }
  }

  public setShiftLength(value:string|number):string|number {
    this.shiftLength = value;
    return this.shiftLength;
  }

  public getShiftPossibleSymbols():SESAShiftSymbols {
    let out:SESAShiftSymbols = new SESAShiftSymbols();
    return out;
  }

  public getShiftSymbol():string {
    let sunChars = "☀☼🌞🌣";
    let moonChars = "☽🌛🌜";
    let sun = sunChars[0];
    let moon = moonChars[0];
    if(!this.shift || this.shift.toUpperCase() === 'AM') {
      return sun;
    } else {
      return moon;
    }
  }

  public setJobsite(site:Jobsite):string {
    let site_number = site.site_number;
    let site_id     = site.getSiteSelectName();
    this.site_number = site_number;
    this.workSite = site_id;
    let client:SESAClient = site.client;
    let location:SESALocation = site.location;
    let locID:SESALocID = site.locID;
    let cli:string = client.code;
    let loc:string = location.code;
    let lid:string = locID.code;
    this.client = cli;
    this.location = loc;
    this.locID = lid;
    return this.workSite;
  }

  public isOfficeEmployee():boolean {
    let role = "";
    let uclass:any = this.userClass;
    if (Array.isArray(uclass)) {
      for(let userclass of this.userClass) {
        let userRole = userclass.toUpperCase();
        if(userRole === 'MANAGER' || userRole === 'OFFICE') {
          return true;
        }
      }
      // role = this.userClass[0].toUpperCase();
    } else if (typeof uclass === 'string') {
      role = uclass.toUpperCase();
      if(role === 'MANAGER' || role === 'OFFICE') {
        return true;
      }
    }
    // if(role === 'MANAGER') {
    //   return true;
    // } else if(role === 'OFFICE') {
    //   return false;
    // } else {
    return false;
    // }
  }

  public isManager():boolean {
    let role = "";
    let uclass:any = this.userClass;
    if (Array.isArray(uclass)) {
      for(let userclass of this.userClass) {
        let userRole = userclass.toUpperCase();
        if(userRole === 'MANAGER') {
          return true;
        }
      }
      // role = this.userClass[0].toUpperCase();
    } else if (typeof uclass === 'string') {
      role = uclass.toUpperCase();
      if(role === 'MANAGER') {
        return true;
      }
    }
    // if(role === 'MANAGER') {
    //   return true;
    // } else if(role === 'OFFICE') {
    //   return false;
    // } else {
    return false;
    // }
  }

  public isLevel1Manager():boolean {
    let result = false;
    let l1ms:string[] = [
      "patron",
      "cvela",
      "chorpler",
      "hachero",
      "grumpy",
    ];
    if(this.isManager()) {
      let name:string = this.getUsername() ? this.getUsername() : "";
      name = name.toLowerCase();
      if(l1ms.indexOf(name) > -1) {
        result = true;
      } else {
        result = false;
      }
    } else {
      result = false;
    }
    return result;
  }

  public isActive():boolean {
    return this.active;
  }

  public activate():boolean {
    this.active = true;
    return this.active;
  }

  public deactivate():boolean {
    this.active = false;
    return this.active;
  }

  public getLastName():string {
    return this.lastName ? this.lastName : "";
  }

  public getFirstName():string {
    return this.firstName ? this.firstName : "";
  }

  public getMiddleName():string {
    return this.middleName ? this.middleName : "";
  }

  public getPrefix():string {
    return this.prefix ? this.prefix : "";
  }

  public getSuffix():string {
    return this.suffix ? this.suffix : "";
  }

  public getQuickbooksName():string {
    let out:string = `${this.getLastName()}`;
    if(this.getSuffix()) {
      out += ` ${this.getSuffix()}`;
    }
    out += `, ${this.getFirstName()}`;
    if(this.getMiddleName()) {
      out += ` ${this.getMiddleName()}`;
    }
    return out;
 }

  public matchesSite(site:Jobsite):boolean {
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

  public findSite(sites:Jobsite[]):Jobsite {
    let unassigned_site = sites.find((a:Jobsite) => {
      return a.site_number === 1;
    })
    for(let site of sites) {
      if(this.site_number && this.site_number === site.site_number) {
        // Log.l("Report: matched report to site:\n", this);
        // Log.l(site);
        return site;
      } else {
        let siteCLI  = site.client.name.toUpperCase();
        let siteLOC  = site.location.name.toUpperCase();
        let siteLID  = site.locID.name.toUpperCase();
        let siteCLI2 = site.client.fullName.toUpperCase();
        let siteLOC2 = site.location.fullName.toUpperCase();
        let siteLID2 = site.locID.fullName.toUpperCase();
        let cli:any  = this.client;
        let loc:any  = this.location;
        let lid:any  = this.locID;
        cli = cli instanceof SESACLL ? cli.toUpperCase() : cli ? cli.toUpperCase() : "ZZ"    ;
        loc = loc instanceof SESACLL ? loc.toUpperCase() : loc ? loc.toUpperCase() : "Z"     ;
        lid = lid instanceof SESACLL ? lid.toUpperCase() : lid ? lid.toUpperCase() : "ZZZZZZ";
        if((cli === siteCLI || cli === siteCLI2) && (loc === siteLOC || loc === siteLOC2) && (lid === siteLID || lid === siteLID2)) {
          // Log.l("Report: matched report to site:\n", this);
          // Log.l(site);
          return site;
        }
      }
    }
    let out = this.getSiteInfo();
    Log.w(`Employee.findSite(): Could not find employee site '${out}' for employee '${this.getUsername()}'!`)
    return unassigned_site;
  }

  public getSiteInfo():string {
    let out = `'${this.client}' '${this.location}' '${this.locID}'`;
    return out;
  }

  public setStatus(status:"active" | "inactive", username:string) {
    if(status === 'active') {
      this.activate();
      this.addStatusUpdate("activated", username);
    } else if(status === 'inactive') {
      this.deactivate();
      this.addStatusUpdate("deactivated", username);
    } else {
      Log.w(`Employee.setStatus(): Status must be 'active' or 'inactive', invalid value provided: `, status);
    }
  }

  public addStatusUpdate(type:StatusUpdateType, username:string):EmployeeStatusLogEntry[] {
    let now:Moment = moment();
    let timestamp:string = now.format();
    let logEntry:EmployeeStatusLogEntry = {
      type     : type     ,
      user     : username ,
      timestamp: timestamp,
    };
    this.statusUpdates.push(logEntry);
    Log.l(`Employee.addStatusUpdate(): added '${type}' entry, statusUpdates is now:\n`, this.statusUpdates);
    return this.statusUpdates;
  }

  public setBirthdate(bday:string):string {
    this.birthdate = bday;
    return this.birthdate;
  }

  public getBirthdate():string {
    return this.birthdate;
  }

  public getBirthdateMoment():Moment {
    let bday:Moment = moment(this.birthdate, "YYYY-MM-DD");
    if(isMoment(bday)) {
      return bday;
    } else {
      Log.w(`Employee.getBirthdateMoment(): Error getting Moment-ized birthdate for this employee:\n`, this);
      throw new Error("Employee birthdate is not valid date!");
    }
  }

  public isLogistics():boolean {
    let type:string = this.employeeType.toUpperCase();
    if(type === EmployeeType.LOGISTICS) {
      return true;
    } else {
      return false;
    }
  }

  public isOffice():boolean {
    let type:string = this.employeeType.toUpperCase();
    if(type === EmployeeType.OFFICE) {
      return true;
    } else if(this.isOfficeEmployee()) {
      return true;
    } else {
      return false;
    }
  }

  public toString():string {
    return this.getFullName();
  }

  public getKeys():string[] {
    return Object.keys(this);
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):Employee {
    return Employee.deserialize(doc);
  }
  public getClass():any {
    return Employee;
  }
  public static getClassName():string {
    return 'Employee';
  }
  public getClassName():string {
    return Employee.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}

