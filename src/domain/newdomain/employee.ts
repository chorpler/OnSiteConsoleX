/**
 * Name: Employee domain class
 * Vers: 9.0.3
 * Date: 2018-09-25
 * Auth: David Sargeant
 * Logs: 9.0.3 2018-09-25: Fixed case-sensitivity bug for isLogistics() and isOffice() methods
 * Logs: 9.0.2 2018-09-24: Fixed isOffice() method to return false instead of undefined
 * Logs: 9.0.1 2018-09-17: Changed to use EmployeeDoc
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

import { Street                                   } from './street'            ;
import { Address                                  } from './address'           ;
import { Jobsite                                  } from './jobsite'           ;
import { Log, moment, Moment, isMoment, oo        } from '../config'           ;
import { SESACLL                                  } from './OnSiteCLL'         ;
import { SESAShiftSymbols                         } from './OnSiteShiftSymbols';
import { SESAShift                                } from './OnSiteShift'       ;
import { SESAClient                               } from './OnSiteClient'      ;
import { SESALocation                             } from './OnSiteLocation'    ;
import { SESALocID                                } from './OnSiteLocID'       ;

// import { SESACLL, SESAShiftSymbols, SESAShift, } from '../config'           ;
// import { SESAClient, SESALocation, SESALocID,  } from '../config' ;

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

export class EmployeeDoc {
  public _id                 : string        = ""            ;
  public _rev                : string        = ""            ;
  public name                : string        = ""            ;
  public username            : string        = ""            ;
  public prefix              : string        = ""            ;
  public firstName           : string        = ""            ;
  public lastName            : string        = ""            ;
  public middleName          : string        = ""            ;
  public suffix              : string        = ""            ;
  public technician          : string        = ""            ;
  public type                : string        = "user"        ;
  public userClass           : string[]      = ["TECHNICIAN"];
  public client              : string        = ""            ;
  public location            : string        = ""            ;
  public locID               : string        = ""            ;
  public workSite            : string        = ""            ;
  public site_number         : number        = -1            ;
  public shift               : string        = "AM"          ;
  public shiftLength         : number        = 11            ;
  public shiftStartTime      : number        = 8             ;
  public rotation            : string        = ""            ;
  public email               : string[]      = []            ;
  public phone               : string        = ""            ;
  public cell                : string        = ""            ;
  public address             : Address       = new Address() ;
  public payRate             : number        = 0             ;
  public salaried            : boolean       = false         ;
  public active              : boolean       = true          ;
  public updated             : boolean       = false         ;
  public created             : string        = ""            ;
  public lastUpdated         : string        = ""            ;
  public statusUpdates       : EmployeeStatusLogEntry[] = [] ;
  public logistics           : boolean       = false         ;
  public employeeMoved       : boolean       = false         ;
  public isTestUser          : boolean       = false         ;
  public employeeType        : EmployeeType  = EmployeeType.FIELD       ;
  public birthdate           : string        = ""            ;
  public notes               : string        = ""            ;
}

export class Employee {
  public employee:EmployeeDoc = new EmployeeDoc();
  public get _id                 (): string                           { return this.employee._id; };
  public get _rev                (): string                           { return this.employee._rev; };
  public get name                (): string                           { return this.employee.name; };
  public get username            (): string                           { return this.employee.username; };
  public get prefix              (): string                           { return this.employee.prefix; };
  public get firstName           (): string                           { return this.employee.firstName; };
  public get lastName            (): string                           { return this.employee.lastName; };
  public get middleName          (): string                           { return this.employee.middleName; };
  public get suffix              (): string                           { return this.employee.suffix; };
  public get technician          (): string                           { return this.employee.technician; };
  public get type                (): string                           { return this.employee.type; };
  public get userClass           (): string[]                         { return this.employee.userClass; };
  public get client              (): string                           { return this.employee.client; };
  public get location            (): string                           { return this.employee.location; };
  public get locID               (): string                           { return this.employee.locID; };
  public get workSite            (): string                           { return this.employee.workSite; };
  public get site_number         (): number                           { return this.employee.site_number; };
  public get shift               (): string                           { return this.employee.shift; };
  public get shiftLength         (): number                           { return this.employee.shiftLength; };
  public get shiftStartTime      (): number                           { return this.employee.shiftStartTime; };
  public get rotation            (): string                           { return this.employee.rotation; };
  public get email               (): string[]                    { return this.employee.email; };
  public get phone               (): string                           { return this.employee.phone; };
  public get cell                (): string                           { return this.employee.cell; };
  public get address             (): Address                          { return this.employee.address; };
  public get payRate             (): number                           { return this.employee.payRate; };
  public get salaried            (): boolean                          { return this.employee.salaried; };
  public get active              (): boolean                          { return this.employee.active; };
  public get updated             (): boolean                          { return this.employee.updated; };
  public get created             (): string                           { return this.employee.created; };
  public get lastUpdated         (): string                           { return this.employee.lastUpdated; };
  public get statusUpdates       (): EmployeeStatusLogEntry[]    { return this.employee.statusUpdates; };
  public get logistics           (): boolean                          { return this.employee.logistics; };
  public get employeeMoved       (): boolean                          { return this.employee.employeeMoved; };
  public get isTestUser          (): boolean                          { return this.employee.isTestUser; };
  public get employeeType        (): EmployeeType                     { return this.employee.employeeType; };
  public get birthdate           (): string                           { return this.employee.birthdate; };
  public get notes               (): string                           { return this.employee.notes; };
  public set _id                 (val: string                       ) { this.employee._id = val; };
  public set _rev                (val: string                       ) { this.employee._rev = val; };
  public set name                (val: string                       ) { this.employee.name = val; };
  public set username            (val: string                       ) { this.employee.username = val; };
  public set prefix              (val: string                       ) { this.employee.prefix = val; };
  public set firstName           (val: string                       ) { this.employee.firstName = val; };
  public set lastName            (val: string                       ) { this.employee.lastName = val; };
  public set middleName          (val: string                       ) { this.employee.middleName = val; };
  public set suffix              (val: string                       ) { this.employee.suffix = val; };
  public set technician          (val: string                       ) { this.employee.technician = val; };
  public set type                (val: string                       ) { this.employee.type = val; };
  public set userClass           (val: string[]                     ) { this.employee.userClass = val; };
  public set client              (val: string                       ) { this.employee.client = val; };
  public set location            (val: string                       ) { this.employee.location = val; };
  public set locID               (val: string                       ) { this.employee.locID = val; };
  public set workSite            (val: string                       ) { this.employee.workSite = val; };
  public set site_number         (val: number                       ) { this.employee.site_number = val; };
  public set shift               (val: string                       ) { this.employee.shift = val; };
  public set shiftLength         (val: number                       ) { this.employee.shiftLength = val; };
  public set shiftStartTime      (val: number                       ) { this.employee.shiftStartTime = val; };
  public set rotation            (val: string                       ) { this.employee.rotation = val; };
  public set email               (val: Array<string>                ) { this.employee.email = val; };
  public set phone               (val: string                       ) { this.employee.phone = val; };
  public set cell                (val: string                       ) { this.employee.cell = val; };
  public set address             (val: Address                      ) { this.employee.address = val; };
  public set payRate             (val: number                       ) { this.employee.payRate = val; };
  public set salaried            (val: boolean                      ) { this.employee.salaried = val; };
  public set active              (val: boolean                      ) { this.employee.active = val; };
  public set updated             (val: boolean                      ) { this.employee.updated = val; };
  public set created             (val: string                       ) { this.employee.created = val; };
  public set lastUpdated         (val: string                       ) { this.employee.lastUpdated = val; };
  public set statusUpdates       (val: Array<EmployeeStatusLogEntry>) { this.employee.statusUpdates = val; };
  public set logistics           (val: boolean                      ) { this.employee.logistics = val; };
  public set employeeMoved       (val: boolean                      ) { this.employee.employeeMoved = val; };
  public set isTestUser          (val: boolean                      ) { this.employee.isTestUser = val; };
  public set employeeType        (val: EmployeeType                 ) { this.employee.employeeType = val; };
  public set birthdate           (val: string                       ) { this.employee.birthdate = val; };
  public set notes               (val: string                       ) { this.employee.notes = val; };

  public get avatarName           (): string        { return this.employee.username; }            ;
  public get avtrNameAsUser       (): boolean       { return true; }          ;
  public get shiftStartTimeMoment (): Moment        { let hr:number = Number(this.employee.shiftStartTime); let start:Moment = moment().startOf('day').add(hr, 'hour'); return start; }          ;
  public get shiftStartTimeHour   (): string        { let start:Moment = this.shiftStartTimeMoment; let out:string = start.format("HH:mm"); return out; }       ;
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

  constructor(doc?:EmployeeDoc) {
    if(doc) {
      return this.deserialize(doc);
    } else {

    }
  }

  public readFromDoc(doc:EmployeeDoc):Employee {
    let keys:string[] = Object.keys(this.employee);
    let docKeys:string[] = Object.keys(doc);
    for(let key of keys) {
      if(docKeys.indexOf(key) > -1) {
        this.employee[key] = doc[key];
      }
    }
    // this.employee = doc;
    return this;
    // for(let key of keys) {
    //   if(docKeys.indexOf(key) > -1) {
    //     this.employee[key] =  doc[key];
    //   }
    //   let docprop = doc[prop];
    //   if(docprop && typeof docprop === 'object') {
    //     if(Array.isArray(docprop)) {
    //       let temp = docprop.slice(0);
    //       if(localKeys.indexOf(prop) > -1) {
    //         this[prop] = temp;
    //       }
    //     }
    //     if(prop === 'shiftStartTime') {
    //       let startHour = Number(doc[prop].name);
    //       this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
    //       this[prop] = startHour;
    //       this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
    //     } else if(prop === 'userClass') {
    //       if(typeof docprop === 'string') {
    //         this[prop] = [ docprop ];
    //       } else if(Array.isArray(docprop)) {
    //         this[prop] = oo.clone(docprop);
    //       }
    //     } else if(prop === 'client' || prop === 'location') {
    //       this[prop] = doc[prop].fullName.toUpperCase();
    //     } else if(prop === 'locID' || prop === 'aux' || prop === 'shift') {
    //       this[prop] = doc[prop].name.toUpperCase();
    //     } else if(prop === 'shiftLength' || prop === 'shiftStartTime') {
    //       this[prop] = Number(doc[prop].name);
    //     } else if (prop === 'address') {
    //       let a:any = doc[prop];
    //       if (typeof a.street === 'object') {
    //         // this.address = a;
    //         this.address.street.street1 = a.street.street1;
    //         this.address.street.street2 = a.street.street2;
    //         this.address.city           = a.city;
    //         this.address.state          = a.state;
    //         this.address.zip            = a.zipcode || a.zip || '';
    //       } else if (a.street) {
    //         this.address.street.street1 = a.street;
    //         this.address.city           = a.city;
    //         this.address.state          = a.state;
    //         this.address.zip            = a.zipcode ? a.zipcode : a.zip ? a.zip : '';
    //       } else {
    //         Log.w("Address.readFromDoc(): Doc invalid:\n", doc);
    //         return null;
    //       }
    //     } else if(prop !== 'jobsite') {
    //       this[prop] = doc[prop];
    //     }
    //   } else {
    //     if (prop === 'shiftStartTime') {
    //       let startHour = Number(doc[prop]);
    //       this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
    //       this[prop] = doc[prop];
    //       this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
    //     } else if (prop === 'street') {
    //       this.address.street.street1 = doc[prop];
    //     } else if (prop === 'zipcode' || prop === 'zip') {
    //       this.address.zip = doc[prop];
    //     } else if(prop !== 'jobsite') {
    //       this[prop] = doc[prop];
    //     }
    //   }
    // }
    // if (doc && doc.name === undefined) { this.name = doc.avatarName; }
    // this.avatarName = this.name;
    // this.username   = this.name;
    // return this;
  }

  public serialize():EmployeeDoc {
    return this.employee;
    // let keys = Object.keys(this);
    // let doc:any = {};
    // for(let key of keys) {
    //   if(key === 'shiftStartTimeMoment') {
    //     // doc[key] = this[key].format();
    //   } else if(key === 'technician') {
    //     doc[key] = this.technician || this.getTechName();
    //   } else {
    //     doc[key] = this[key];
    //   }
    // }
    // doc['avtrNameAsUser'] = true;
    // return doc;
  }

  public static deserialize(doc:EmployeeDoc):Employee {
    let employee = new Employee(doc);
    // employee.readFromDoc(doc);
    return employee;
  }

  public deserialize(doc:EmployeeDoc):Employee {
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

  public setShiftLength(value:string|number):number {
    let val:number;
    if(typeof value === 'string') {
      let tempVal:number = Number(value);
      if(!isNaN(tempVal)) {
        val = tempVal;
      }
    } else if(typeof value === 'number') {
      val = value;
    }
    if(val) {
      this.shiftLength = val;
      return this.shiftLength;
    } else {
      Log.w(`setShiftLength(): Unable to determine shift length from provided value:\n`, value);
    }
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
    if(this.isManager()) {
      let name = this.getUsername();
      if(this.username === 'patron' || this.username === 'cvela' || this.username === 'Chorpler' || this.username === 'Hachero') {
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

  public toJSON() {
    return this.serialize();
  }

  public isOnSite():boolean {
    return true;
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

