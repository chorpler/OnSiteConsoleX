/**
 * Name: Jobsite domain class
 * Vers: 8.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 8.0.1 2018-09-17: Changed to use JobsiteDoc
 * Logs: 7.0.1 2018-09-11: Added is_office property, changed constructor to single argument
 * Logs: 6.4.3 2018-07-12: Added premium_hours property
 * Logs: 6.4.2 2018-04-25: Added generateSiteID() method
 * Logs: 6.4.1 2018-04-23: Added clone() method
 * Logs: 6.4.0 2018-04-23: Changed types on constructor args 1-3 to SESAClient, etc.
 * Logs: 6.3.0 2018-03-29: Added test field for test sites, and inactive_users field for site for inactive users
 * Logs: 6.2.0 2018-03-23: Added check for unassigned site to getShiftLengthForDate()
 * Logs: 6.1.0 2018-03-06: Added initializers for shiftRotations, techShifts, and hoursList
 * Logs: 6.0.1 2018-03-06: Changed serialize() to NEVER use JSON.stringify()
 * Logs: 6.0.0 2018-03-06: Changed serialize() to only use JSON.stringify() on objects
 * Logs: 5.0.2 2018-01-26: Forgot to actually set the new CLL values to the corresponding Jobsite property. D'OH!
 * Logs: 5.0.1 2018-01-26: Changed client, location, locID, and aux to represent full classes, now defined in config.types
 * Logs: 4.0.1 2018-01-24: Re-enabled loc2nd as aux; added types for client, location, locID, aux; added deserialize methods; changed .name to .code
 * Logs: 3.0.3 2018-01-20: Added siteClientAndLocation
 * Logs: 3.0.2 2018-01-16: Added lunch_hour_time property
 * Logs: 3.0.1 2017-12-15: Merged app and console classes
 * Logs: 2.2.1 2017-08-30: Updated with site_number and new methods
 */

import { Street                             } from './street'             ;
import { Address                            } from './address'            ;
import { Log, moment, Moment, isMoment, oo, } from '../config'            ;
import { SESACLL                            } from './OnSiteCLL'          ;
// import { SESAShiftSymbols                   } from './OnSiteShiftSymbols' ;
// import { SESAShift                          } from './OnSiteShift'        ;
import { SESAClient                         } from './OnSiteClient'       ;
import { SESALocation                       } from './OnSiteLocation'     ;
import { SESALocID                          } from './OnSiteLocID'        ;
import { SESAAux                            } from './OnSiteAux'          ;

export class JobsiteDoc {
  public _id                       : string  = "";
  public _rev                      : string  = "";
  public client                    : SESAClient   = new SESAClient();
  public location                  : SESALocation = new SESALocation();
  public locID                     : SESALocID    = new SESALocID();
  public aux                       : SESAAux      = new SESAAux();
  public address                   : Address = new Address();
  public billing_address           : Address = this.address.clone();
  public latitude                  : number  = 26.17726  ;
  public longitude                 : number  = -97.964594;
  public within                    : number  = 500;
  public account_number            : string  = "";
  public po_number                 : string  = "";
  public travel_time               : number  = 0;
  public per_diem_rate             : number  = 40;
  public lodging_rate              : number  = 55;
  public requires_preauth          : boolean =false        ;
  public requires_preauth_pertech  : boolean =false        ;
  public requires_invoice_woreports: boolean =false        ;
  public account_or_contract       : string  ='Contract'   ;
  public billing_rate              : number  =65           ;
  public site_active               : boolean =true         ;
  // public divisions                 : any     ;
  public shiftRotations            : string[]     ;
  public hoursList                 : any     ;
  public techShifts                : any     ;
  public schedule_name             : string   = "" ;
  public has_standby               : boolean  = false;
  public sort_number               : number   = 0;
  public site_number               : number = -1001;
  public shift_start_times         : {AM:string, PM:string} = {"AM" :"06:00", "PM": "18:00"} ;
  public lunch_hour_time           : number = 1;
  public test_site                 : boolean = false;
  public inactive_users            : boolean = false;
  public premium_hours             : boolean = true ;
  public is_office                 : boolean = false;

}

export class Jobsite {
  public _id                       : string  = "";
  public _rev                      : string  = "";
  public client                    : SESAClient   = new SESAClient();
  public location                  : SESALocation = new SESALocation();
  public locID                     : SESALocID    = new SESALocID();
  public aux                       : SESAAux      = new SESAAux();
  public address                   : Address = new Address();
  public billing_address           : Address = this.address.clone();
  public latitude                  : number  = 26.17726  ;
  public longitude                 : number  = -97.964594;
  public within                    : number  = 500;
  public account_number            : string  = "";
  public po_number                 : string  = "";
  public travel_time               : number  = 0;
  public per_diem_rate             : number  = 40;
  public lodging_rate              : number  = 55;
  public requires_preauth          : boolean =false        ;
  public requires_preauth_pertech  : boolean =false        ;
  public requires_invoice_woreports: boolean =false        ;
  public account_or_contract       : string  ='Contract'   ;
  public billing_rate              : number  =65           ;
  public site_active               : boolean =true         ;
  public divisions                 : any     ;
  public shiftRotations            : any     ;
  public hoursList                 : any     ;
  public techShifts                : any     ;
  public schedule_name             : string   = "" ;
  public has_standby               : boolean  = false;
  public sort_number               : number   = 0;
  public site_number               : number = -1001;
  public shift_start_times         : {AM:string, PM:string} = {"AM" :"06:00", "PM": "18:00"} ;
  public lunch_hour_time           : number = 1;
  public test_site                 : boolean = false;
  public inactive_users            : boolean = false;
  public premium_hours             : boolean = true ;
  public is_office                 : boolean = false;

  constructor(doc?:any) {
    if(doc) {
      return this.deserialize(doc);
    } else {
      this.shiftRotations             = this.initializeShiftRotations();
      this.techShifts                 = this.initializeTechShifts() ;
      this.hoursList                  = this.initializeHoursList();
    }
  }
  // constructor(inClient?:SESAClient, inLoc?:SESALocation, inLocID?:SESALocID, inAddress?:Address, inLat?:number, inLon?:number, inWI?:number) {
  //   this._id                        = ""         ;
  //   this.client                     = inClient   || new SESAClient()       ;
  //   this.location                   = inLoc      || new SESALocation()       ;
  //   this.locID                      = inLocID    || new SESALocID()       ;
  //   this.aux                        = null       ;
  //   this.address                    = inAddress  || new Address() || null       ;
  //   this.billing_address            = inAddress  || new Address() || null       ;
  //   this.latitude                   = inLat      || 26.17726   ;
  //   this.longitude                  = inLon      || -97.964594 ;
  //   this.within                     = inWI       || 500        ;
  //   this.account_number             = ''         ;
  //   this.po_number                  = ''         ;
  //   this.travel_time                = 0          ;
  //   this.per_diem_rate              = 0          ;
  //   this.lodging_rate               = 0          ;
  //   this.requires_preauth           = false      ;
  //   this.requires_preauth_pertech   = false      ;
  //   this.requires_invoice_woreports = false      ;
  //   this.account_or_contract        = 'Contract' ;
  //   this.billing_rate               = 65         ;
  //   this.site_active                = true       ;
  //   this.divisions                  =            {           } ;
  //   this.shiftRotations             = this.initializeShiftRotations();
  //   this.techShifts                 = this.initializeTechShifts() ;
  //   this.hoursList                  = this.initializeHoursList();
  //   this.schedule_name              = ""         ;
  //   this.has_standby                = false      ;
  //   this.sort_number                = 0          ;
  //   this.site_number                = -1001      ;
  //   this.lunch_hour_time            = 1          ;
  //   this.inactive_users             = false      ;
  //   this.premium_hours              = true       ;

  //   window['onsite'] = window['onsite'] || {};
  //   window['onsite']['Jobsite'] = Jobsite;

  // }

  public setBilling(inAddr:Address):Address {
    this.billing_address = inAddr;
    return this.billing_address;
  }

  public setAddress(inAddr:Address):Address {
    this.address = inAddr;
    return this.address;
  }

  public readFromDoc(doc:any):Jobsite {
    if(typeof doc !== 'object') {
      Log.l("Can't read jobsite from:\n", doc);
      throw new Error("readFromDoc(): Jobsite cannot be read");
    }
    if (doc.address !== undefined) {
      this.address = new Address(new Street(doc.address.street.street1, doc.address.street.street2), doc.address.city, doc.address.state, doc.address.zipcode);
    } else {
      this.address = new Address(new Street('', ''), '', '', '');
    }
    if (doc.billing_address !== undefined) {
      this.billing_address = new Address(new Street(doc.billing_address.street.street1, doc.billing_address.street.street2), doc.billing_address.city, doc.billing_address.state, doc.billing_address.zipcode);
    } else {
      this.billing_address = new Address(new Street('', ''), '', '', '');
    }

    let docKeys = Object.keys(doc);
    let keys = Object.keys(this);
    for(let prop of keys) {
      if(docKeys.indexOf(prop) > -1) {
        let value:any = doc[prop];
        if(prop === 'lodging_rate' || prop === 'per_diem_rate' || prop === 'site_number') {
          this[prop] = Number(doc[prop]);
        } else if(prop === 'client') {
          let item = new SESAClient(value);
          this[prop] = item;
        } else if(prop === 'location') {
          let item = new SESALocation(value);
          this[prop] = item;
        } else if(prop === 'locID') {
          let item = new SESALocID(value);
          this[prop] = item;
        } else if(prop === 'aux') {
          // let item = new SESAAux();
          // item.readFromDoc(doc[prop]);
          // this[prop] = item;
        } else if (prop !== 'address' && prop !== 'billing_address' && keys.indexOf(prop) > -1) {
          this[prop] = value;
        }
      }
    }
    if(doc['schedule_name'] === undefined) {
      this.schedule_name = this.getSiteName();
    }
    if(!this._id) {
      this._id = this.getSiteID();
    } else {
      this._id = doc['_id'];
      if(doc['_rev']) {
        this._rev = doc['_rev'];
      }
    }
    return this;
  }

  public serialize():any {
    let keys = Object.keys(this);
    let doc:any = {};
    for(let key of keys) {
      let value = this[key];
      if(isMoment(value)) {
        doc[key] = value.format();
      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public static deserialize(doc:any):Jobsite {
    let site = new Jobsite();
    site.deserialize(doc);
    return site;
  }

  public deserialize(doc:any):Jobsite {
    let site = this;
    site.readFromDoc(doc);
    return site;
  }

  public clone():Jobsite {
    // let site:Jobsite = this;
    let siteDoc:any  = this.serialize();
    let newSite:Jobsite = Jobsite.deserialize(siteDoc);
    return newSite;
  }

  public initializeShiftRotations():Array<any> {
    this.shiftRotations = [
      { name: "FIRST WEEK", fullName: "First Week"      },
      { name: "CONTN WEEK", fullName: "Continuing Week" },
      { name: "FINAL WEEK", fullName: "Final Week"      },
      { name: "DAYS OFF"  , fullName: "Days Off"        },
      { name: "VACATION"  , fullName: "Vacation"        },
    ];
    return this.shiftRotations;
  }

  public initializeTechShifts():Array<string> {
    this.techShifts = [ "AM", "PM" ];
    return this.techShifts;
  }

  public initializeHoursList():any {
    let hoursList:any = {};
    for(let rotation of this.shiftRotations) {
      let shiftHours:any = {};
      for(let shift of this.techShifts) {
        let weekHours:Array<string> = [ "0", "0", "0", "0", "0", "0", "0" ];
        shiftHours[shift] = weekHours;
      }
      if(!rotation['name']) {
        Log.w(`Jobsite.initializeHoursList(): can't initialize hoursList with this rotation list!`, this);
        throw new Error("Hours")
      } else {
        hoursList[rotation.name] = shiftHours;
      }
    }
    this.hoursList = hoursList;
    return hoursList;
  }

  public getSiteName():string {
    let cli = this.client.fullName.toUpperCase();
    let loc = this.location.fullName.toUpperCase();
    let lid = this.locID.fullName.toUpperCase();
    // let l2d = '';
    // let laux = "NA";
    // if (this.aux && this.aux.code) { laux = this.aux.code; }
    // if (laux !== "NA" && laux !== "N/A") {
    //   l2d = this.aux.fullName.toUpperCase();
    // }

    let siteName = '';
    if(this.client.code === "HB") {
      siteName = '';
    } else {
      siteName = `${cli} `;
    }

    siteName += `${loc}`;

    // if (laux !== "NA" && laux !== "N/A") {
    //   siteName += ` ${l2d}`;
    // }

    if(this.locID.code !== "MNSHOP") {
      siteName += ` ${lid}`
    }

    return siteName;
  }

  public getSiteSelectName() {
    // let cli = this.client.fullName.toUpperCase();
    let cli = this.client.code.toUpperCase();
    let loc = this.location.fullName.toUpperCase();
    let lid = this.locID.code.toUpperCase();
    // let l2d = '';
    // let laux = "NA";
    // if (this.aux && this.aux.code) { laux = this.aux.code; }
    // if (laux !== "NA" && laux !== "N/A") {
      // l2d = this.aux.fullName.toUpperCase();
    // }

    let siteName = `${cli}`;
    siteName    += ` ${loc}`;

    // if (laux !== "NA" && laux !== "N/A") {
      // siteName += ` ${l2d}`;
    // }

    siteName += ` ${lid}`;
    return siteName;
  }

  public getScheduleName() {
    return this.schedule_name;
  }

  public setScheduleName(name:string) {
    this.schedule_name = name;
  }

  public getInvoiceName() {
    let cli = this.client.fullName;
    let loc = this.location.fullName;
    let lid = this.locID.fullName;
    let out = `${cli} ${loc} ${lid}`;
    return out;
  }

  public getShiftTypes() {
    return Object.keys(this.shift_start_times);
  }

  public getShiftStartTimes() {
    return this.shift_start_times;
  }

  public getShiftStartTime(key:string) {
    if(this.shift_start_times[key] !== undefined) {
      return this.shift_start_times[key];
    } else {
      if(this.site_number === 1) {
        return {name: "0", fullName: "0", value: "0", code: "0"};
      } else {
        Log.e("getShiftStartTime(): Error, key was not found in start times object: ", key);
        return null;
      }
    }
  }

  public getShiftRotations() {
    return this.shiftRotations;
  }

  public setShiftRotations(value:any) {
    this.shiftRotations = value;
    return this.shiftRotations;
  }

  public getSiteID() {
    if (this._id) {
      return this._id;
    } else {
    //   let siteid = '';
    //   let cli = this.client.code.toUpperCase();
    //   let loc = this.location.fullName.toUpperCase();
    //   let lid = this.locID.code.toUpperCase();
    //   // let laux = "NA";
    // // if (this.aux && this.aux.code) { laux = this.aux.code; }
    // // if (laux !== "NA" && laux !== "N/A") {
    // //   l2d = this.aux.code.toUpperCase();
    //   // siteid = `${cli} ${loc} ${l2d} ${lid}`;
    // // } else {
    //   siteid = `${cli} ${loc} ${lid}`;
    // // }
    //   return siteid;
      return this.generateSiteID();
    }
  }

  public generateSiteID():string {
    let siteID:string = '';
    let cli1 = this.client.code.toUpperCase();
    let loc1 = this.location.fullName.toUpperCase();
    let lid1 = this.locID.code.toUpperCase();
    siteID = `${cli1} ${loc1} ${lid1}`;
    this._id = siteID;
    return siteID;
  }

  public getShortID() {
    let siteid = '';
    let cli = this.client.code.toUpperCase();
    let loc = this.location.code.toUpperCase();
    let l2d = '';
    let lid = this.locID.code.toUpperCase();
    let laux = "NA";
    if (this.aux && this.aux.code) { laux = this.aux.code; }
    if (laux !== "NA" && laux !== "N/A") {
      l2d = this.aux.code.toUpperCase();
      siteid = `${cli} ${loc} ${l2d} ${lid}`;
    } else {
      siteid = `${cli} ${loc} ${lid}`;
    }
    return siteid;
  }

  // public updateSiteDivisions(rotations:any, hours:any) {
  //   let js = this;
  //   let cli = js.client.code;
  //   let loc = js.location.code;
  //   let sr = rotations;
  //   let sd = {};
  //   // let hasAux = js.aux.length;
  //   // sd[cli] = {};
  //   // sd[cli][loc] = {};
  //   // if (hasAux) {
  //   //   for (let loc2 of js.aux) {
  //   //     sd[cli][loc][loc2] = {};
  //   //     for (let locID of js.locID) {
  //   //       sd[cli][loc][loc2][locID] = {};
  //   //       for (let rotation of sr) {
  //   //         let rot = rotation.code;
  //   //         sd[cli][loc][loc2][locID][rot] = [];
  //   //       }
  //   //     }
  //   //   }
  //   // } else {
  //     for (let locID of js.locID) {
  //       sd[cli][loc][locID] = {};
  //       for (let rotation of sr) {
  //         let rot = rotation.code;
  //         sd[cli][loc][locID][rot] = [];
  //       }
  //     }
  //   // }
  //   this.divisions = sd;
  //   Log.l("JobSite.updateSiteDivisions(): Site divisions are now:\n", sd);
  // }

  public getFullHoursList() {
    return this.hoursList;
  }

  public getHoursList(shiftRotation:string|object, shiftTime?:string) {
    let match = "", oneHourList = null, singleShiftList = null;
    if(typeof shiftRotation === 'string') {
      match = shiftRotation;
    } else if(shiftRotation && typeof shiftRotation === 'object' && typeof shiftRotation['name'] === 'string') {
      match = shiftRotation['name'];
    }
    if(this.hoursList[match] !== undefined) {
      oneHourList = this.hoursList[match];
    } else {
      // if (shiftRotation === 'UNASSIGNED' || shiftRotation === 'DAYS OFF') {
      if(shiftRotation === 'UNASSIGNED') {
        oneHourList = { AM: ["0", "0", "0", "0", "0", "0", "0"], PM: ["0", "0", "0", "0", "0", "0", "0"] };
        return oneHourList;
      } else if(this.site_number === 1) {
        oneHourList = { AM: ["0", "0", "0", "0", "0", "0", "0"], PM: ["0", "0", "0", "0", "0", "0", "0"] };
        return oneHourList;
      } else {
        Log.e("Jobsite.getHoursList('%s', '%s'): Index not found!", match, shiftTime);
        Log.l(this);
        return null;
      }
    }
    if(shiftTime) {
      singleShiftList = oneHourList[shiftTime];
      return singleShiftList;
    } else {
      return oneHourList;
    }
  }

  public getShiftLengthForDate(shiftRotation:string|object, shiftTime:string, date:Moment|Date):number {
    // Log.l(`Jobsite.getShiftLengthForDate(): Called with shift '${shiftTime}' and shiftRotation:\n`, shiftRotation);
    let list;
    if(this.site_number === 1) {
      list = [ "0", "0", "0", "0", "0", "0", "0" ];
    } else {
      list = this.getHoursList(shiftRotation, shiftTime);
    }
    let day = moment(date);
    let dayIndex = day.isoWeekday();
    let hoursIndex = (dayIndex + 4) % 7;
    let shiftLength;
      shiftLength = list[hoursIndex];
    let output = shiftLength;
    if(shiftLength == 0) {
      output = "OFF";
    }
    return output;
  }

  public getSiteShiftLength(shiftType: string | object, shiftTime: string, date: Moment | Date) {
    return this.getShiftLengthForDate(shiftType, shiftTime, date);
  }

  public getSiteNumber() {
    return this.site_number;
  }

  public getLunchHour():number {
    return this.lunch_hour_time;
  }

  public setLunchHour(hours:number) {
    this.lunch_hour_time = hours;
  }

  public setSiteNumber(value:number) {
    this.site_number = value;
    return this.site_number;
  }

  public getSiteClientAndLocation():string {
    let out:string = "";
    let cli = this.client.code;
    let loc = this.location.fullName;
    out = cli + " " + loc;
    return out;
  }

  public toJSON() {
    return this.serialize();
  }

  public static fromJSON(doc:any) {
    return new Jobsite().readFromDoc(doc);
  }

  public getClass():any {
    return Jobsite;
  }
  public static getClassName():string {
    return 'Jobsite';
  }
  public getClassName():string {
    return Jobsite.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
