/**
 * Name: Timesheet domain class
 * Vers: 1.2.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 1.2.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 1.0.1 2018-06-05: Initial creation.
 */

// import { sprintf       } from 'sprintf-js'       ;
// import { Moment        } from '../config'        ;
// import { isMoment      } from '../config'        ;
// import { Shift         } from './shift'          ;
// import { PayrollPeriod } from './payroll-period' ;
// import { Jobsite       } from './jobsite'        ;
import { Log           } from '../config'        ;
import { moment        } from '../config'        ;
import { oo            } from '../config'        ;
import { Employee      } from './employee'       ;

export class Timesheet {
  public _id              : string = "";
  public _rev             : string = "";
  public date             : string = "";
  public last_name        : string = "";
  public first_name       : string = "";
  public username         : string = "";
  public client           : string = "";
  public location         : string = "";
  public locID            : string = "";
  public site_number      : number = -1;
  public timestamp        : string = "";
  public timestampXL      : number =  0;
  public shift_serial     : string = "";
  public payroll_period   : number =  0;
  public photoURI         : string = "";
  public photoBlob        : Blob       ;
  public uploaded         : boolean = false;
  // public flagged          : boolean = false;
  // public flagged_fields   : Array<ReportFlag> = [];
  // public site_number      : number = -1001;

  constructor() {
    Log.l("Timesheet created:", this);
    console.trace();
    let now = moment();
    this._id               = ""                       ;
    this._rev              = ""                       ;
    this.last_name         = ""                       ;
    this.first_name        = ""                       ;
    this.client            = ""                       ;
    this.username          = ""                       ;
    this.location          = ""                       ;
    this.locID             = ""                       ;
    this.shift_serial      = ""                       ;
    this.shift_serial      = ""                       ;
    this.payroll_period    = 0                        ;
    this.site_number       = -1                       ;
    this.date              = now.format("YYYY-MM-DD") ;
    this.timestamp         = now.format()             ;
    this.timestampXL       = now.toExcel()            ;
    this.photoURI          = ""                       ;
    this.uploaded          = false                    ;
  }

  public readFromDoc(doc:any):Timesheet {
    let classKeys = Object.keys(this);
    let docKeys   = Object.keys(doc);
    for(let key of docKeys) {
      if(classKeys.indexOf(key) > -1) {
        this[key] = doc[key];
      }
    }
    return this;
  }

  public deserialize(doc:any):Timesheet {
    return this.readFromDoc(doc);
  }

  public static deserialize(doc:any) {
    let timesheet = new Timesheet();
    timesheet.deserialize(doc);
    return timesheet;
  }

  public serialize() {
    Log.l("Timesheet.serialize(): Now serializing timesheet:", this);
    console.trace("Timesheet serializing");
    let newSheet:any = {};
    // this._id = this._id || this.genReportID(tech);
    let keys = Object.keys(this);
    for(let key of keys) {
      newSheet[key] = this[key];
    }
    if(!newSheet['_id']) {
      Log.w(`Timesheet.serialize(): Cannot serialize Timesheet without setting ID first!`);
      throw new Error("Field '_id' does not have a value!");
    } else {
      return newSheet;
    }
  }

  public clone():Timesheet {
    let doc:any = oo.clone(this);
    let newTS:Timesheet = Timesheet.deserialize(doc);
    return newTS;
  }

  public getReportID():string {
    return this._id ? this._id : "";
  }

  public genReportID(tech:Employee):string {
    let now = moment();
    let idDateTime = now.format('YYYYMMDDHHmmss');
    let docID = tech.getUsername() + '_' + idDateTime;
    this.username = tech.getUsername();
    this.last_name = tech.getLastName();
    this.first_name = tech.getFirstName();
    Log.l("genReportID(): Generated ID:\n", docID);
    return docID;
  }

  public getPhotoName():string {
    let now = moment();
    let date:string = now.format("YYYY-MM-DD-HH-mm-ss");
    let user:string = this.username;
    let photoName:string = `${user}_${date}.jpg`;
    return photoName;
  }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON():any {
    Log.l(`TimeSheet.toJSON(): Called`);
    console.trace();
    return this.serialize();
  }
  public static fromJSON(doc:any):Timesheet {
    return Timesheet.deserialize(doc);
  }
  public getClass():any {
    return Timesheet;
  }
  public static getClassName():string {
    return 'Timesheet';
  }
  public getClassName():string {
    return Timesheet.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
