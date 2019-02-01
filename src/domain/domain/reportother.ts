/**
 * Name: ReportOther domain class
 * Vers: 4.1.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 4.1.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 4.0.5 2018-12-04: Added isTest property
 * Logs: 4.0.4 2018-01-21: Changed flagging to flagged and flagged_fields fields, plus flags(), getFlagNumber(), isFlagged(), isFieldFlagged(), setFlag(), unsetFlag(), clearFlags() methods
 * Logs: 4.0.3 2018-01-20: Added flagged_field and flagged_reason fields, and setFlag() method
 * Logs: 4.0.2 2018-01-20: Added flagged property
 * Logs: 4.0.1 2017-12-15: Combined app and console class; added getHoursNumeric() and getHoursString() methods
 * Logs: 3.1.2 2017-11-04: Added site_number property and setSite() method
 */

// import { oo            } from '../config'              ;
// import { Shift         } from './shift'                ;
// import { PayrollPeriod } from './payroll-period'       ;
import { sprintf       } from 'sprintf-js'             ;
import { Log           } from '../config'              ;
import { Moment        } from '../config'              ;
import { isMoment      } from '../config'              ;
import { moment        } from '../config'              ;
import { ReportFlag    } from '../config/config.types' ;
import { Employee      } from './employee'             ;
import { Jobsite       } from './jobsite'              ;

const fields = [
  "type",
  "training_type",
  "travel_location",
  "time",
  "notes",
  "report_date",
  "last_name",
  "first_name",
  "client",
  "location",
  "location_id",
  "workSite",
  "timestamp",
  "timestampM",
  "username",
  "shift_serial",
  "payroll_period",
  "flagged",
  "flagged_fields",
  "site_number",
  "isTest",
  "_id",
  "_rev",
];

export class ReportOther {
  public type             : string = "";
  public training_type    : string = "";
  public travel_location  : string = "";
  public time             : number = 0 ;
  public notes            : string = "";
  public report_date      : Moment;
  public last_name        : string = "";
  public first_name       : string = "";
  public client           : string = "";
  public location         : string = "";
  public location_id      : string = "";
  public workSite         : string = "";
  public timestamp        : number = 0;
  public timestampM       : Moment;
  public username         : string = "";
  public shift_serial     : string = "";
  public payroll_period   : number = 0;
  public flagged          : boolean = false;
  public flagged_fields   : ReportFlag[] = [];
  public site_number      : number = -1001;
  public isTest           : boolean = false;
  public _id              : string = "";
  public _rev             : string = "";

  constructor() {
    this.type              = ""                       ;
    this.training_type     = ""                       ;
    this.time              = 0                        ;
    this.notes             = ""                       ;
    this.report_date       = null                     ;
    this.last_name         = ""                       ;
    this.first_name        = ""                       ;
    this.client            = ""                       ;
    this.location          = ""                       ;
    this.location_id       = ""                       ;
    this.workSite          = ""                       ;
    this.shift_serial      = ""                       ;
    this.username          = ""                       ;
    this.shift_serial      = ""                       ;
    this.payroll_period    = 0                        ;
    this.flagged           = false                    ;
    this.flagged_fields    = []                       ;
    this.site_number       = -1001                    ;
    this.isTest            = false                    ;
    this._id               = ""                       ;
    this._rev              = ""                       ;
    this.timestampM        = moment()                 ;
    this.timestamp         = this.timestampM.toExcel();
  }

  public readFromDoc(doc:any) {
    let len = fields.length;
    for(let i = 0; i < len; i++) {
      let key  = fields[i];
      this[key] = doc[key] ? doc[key] : this[key];
    }
    this.report_date = moment(this.report_date, "YYYY-MM-DD");
    this.timestampM  = moment(this.timestampM);
    return this;
  }

  public deserialize(doc:any) {
    return this.readFromDoc(doc);
  }

  public static deserialize(doc:any) {
    let other = new ReportOther();
    other.deserialize(doc);
    return other;
  }

  public serialize() {
    Log.l("ReportOther.serialize(): Now serializing report...");
    // let ts = moment(this.timestamp);
    // Log.l("Report.serialize(): timestamp moment is now:\n", ts);
    // let XLDate = moment([1900, 0, 1]);
    // let xlStamp = ts.diff(XLDate, 'days', true) + 2;
    // this.timestamp = xlStamp;
    let newReport:any = {};
    // this._id = this._id || this.genReportID(tech);
    let len = fields.length;
    for(let i = 0; i < len; i++) {
      let key = fields[i];
      if(key === 'report_date') {
        let date = this[key];
        if(isMoment(date)) {
          newReport[key] = this[key].format("YYYY-MM-DD");
        } else if(typeof date === 'string') {
          newReport[key] = this[key];
        } else {
          Log.w("ReportOther.serialize() called with 'report_date' that isn't a Moment or a string:\n", this);
          newReport[key] = this[key];
        }
      } else if(key === 'timestampM') {
        newReport[key] = this[key].format();
      // } else if(key === 'technician') {
      //   newReport[key] = tech.getTechName();
      } else {
        if(this[key] !== undefined && this[key] !== null) {
          newReport[key] = this[key];
        }
        //  else if(tech[key] !== undefined && tech[key] !== null) {
        //   newReport[key] = tech[key];
        // }
      }
    //   newReport['username'] = tech['avatarName'];
    }
    let hrs = Number(newReport['time']);
    if(!isNaN(hrs)) {
      newReport['time'] = hrs;
    }
    newReport['notes'] = newReport['type'] + "";
    return newReport;
  }

  public clone():ReportOther {
    let newWO = new ReportOther();
    for(let key of fields) {
      if(isMoment(this[key])) {
        newWO[key] = moment(this[key]);
      } else if(typeof this[key] === 'object') {
        newWO[key] = Object.assign({}, this[key]);
      } else {
        newWO[key] = this[key];
      }
    }
    return newWO;
  }

  public getReportID():string {
    return this._id ? this._id : "";
  }

  public genReportID(tech:Employee):string {
    let now = moment();
    let idDateTime = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let docID = tech.avatarName + '_' + idDateTime;
    Log.l("genReportID(): Generated ID:\n", docID);
    return docID;
  }

  public getTotalHours() {
    let hours:number|string = Number(this.time);
    if(!isNaN(hours)) {
      return hours;
    } else {
      let strHours = String(this.time);
      let loc = this.location.trim().toUpperCase();
      if(strHours === "V" || strHours === "H") {
        hours = 8;
      } else if(strHours === "S" && (loc === "DUNCAN" || loc === "DCN")) {
        hours = "S";
      } else {
        // Log.w("ReportOther.getTotalHours(): Total hours for this ReportOther was not a number or a recognized code: '%s'", this.time);
        hours = 0;
      }
      return hours;
    }
  }

  public getHoursNumeric():number {
    let hours:number = Number(this.time);
    if(!isNaN(hours)) {
      return hours;
    } else {
      return 0;
    }
  }

  public getHoursString():string {
    let time = Number(this.time);
    if(!isNaN(time)) {
      let hrs = Math.trunc(this.time);
      let min = 60*(time - hrs);
      let strTime = sprintf("%02d:%02d", hrs, min);
      return strTime;
    } else {
      return "00:00";
    }
  }

  // public setSite(site:Jobsite) {
  //   let cli = site.client;
  //   let loc = site.location;
  //   let lid = site.locID;
  //   let sno = site.site_number;
  //   this.site_number = sno;
  //   this.client = cli.fullName.toUpperCase();
  //   this.location = loc.fullName.toUpperCase();
  //   this.location_id = lid.name.toUpperCase();
  // }

  public setSite(site:Jobsite) {
    this.client      = site.client.name;
    this.location    = site.location.name;
    this.location_id = site.locID.name;
    this.workSite    = site.getSiteSelectName();
    this.site_number = site.site_number;
    return this;
  }

  public get flags():number {
    return this.flagged_fields && this.flagged_fields.length ? this.flagged_fields.length : 0;
  }

  public getFlagNumber(value:number) {
    if(this.flagged_fields && this.flagged_fields.length > value) {
      return this.flagged_fields[value];
    } else {
      Log.w(`ReportOther.getFlagNumber(): Attempted to access flag '${value}' but flagged_fields has only ${this.flagged_fields.length} elements!`);
      return null;
    }
  }

  public isFlagged():boolean {
    return Boolean(this.flags);
  }

  public isFieldFlagged(field:string) {
    if(this.flagged_fields && this.flagged_fields.length) {
      let flag = this.flagged_fields.find((a:ReportFlag) => {
        return a.field === field;
      });
      if(flag) {
        return true;
      }
    }
    let keys = Object.keys(this);
    if(keys.indexOf(field) === -1 && field !== 'manual') {
      Log.w(`ReportOther.isFieldFlagged(): no such field '${field}'!`);
    }
    return false;
  }

  public setFlag(field:string, reason:string) {
    let flag:ReportFlag = {
      field: field,
      reason: reason
    };
    this.flagged_fields = this.flagged_fields || [];
    if(field === 'manual') {
      this.flagged_fields.push(flag);
    } else {
      let existingFlag = this.flagged_fields.find((a:ReportFlag) => {
        return a.field === field;
      });
      if(existingFlag) {
        existingFlag.field  = field;
        existingFlag.reason = reason;
      } else {
        this.flagged_fields.push(flag);
      }
    }
  }

  public unsetFlag(field:string) {
    this.flagged_fields = this.flagged_fields || [];
    let index = this.flagged_fields.findIndex((a:ReportFlag) => {
      return a.field === field;
    });
    if(index > -1) {
      let flag:ReportFlag = this.flagged_fields.splice(index, 1)[0];
    }
  }

  public clearFlags() {
    this.flagged_fields = [];
    this.flagged = false;
  }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON() {
    return this.serialize();
  }
  public static fromJSON(doc:any):ReportOther {
    return ReportOther.deserialize(doc);
  }
  public getClass():any {
    return ReportOther;
  }
  public static getClassName():string {
    return 'ReportOther';
  }
  public getClassName():string {
    return ReportOther.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };

}
