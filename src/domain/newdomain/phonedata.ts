/**
 * Name: PhoneData domain class
 * Vers: 1.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 1.0.1 2018-09-17: Created for Comment and whatnot
 */

import { Log, moment, Moment } from '../config';

export class PhoneDataDoc {
  public cordova     : string =  "";
  public model       : string =  "";
  public platform    : string =  "";
  public uuid        : string =  "";
  public version     : string =  "";
  public manufacturer: string =  "";
  public virtual     : string =  "";
  public serial      : string =  "";
  public uniqueID    : string =  "";
  public appName     : string =  "";
  public appVersion  : string =  "";
  constructor() {

  }
}

export class PhoneData {
  public phonedata   : PhoneDataDoc = new PhoneDataDoc();
  public cordova     : string =  "";
  public model       : string =  "";
  public platform    : string =  "";
  public uuid        : string =  "";
  public version     : string =  "";
  public manufacturer: string =  "";
  public virtual     : string =  "";
  public serial      : string =  "";
  public uniqueID    : string =  "";
  public appName     : string =  "";
  public appVersion  : string =  "";

  constructor(doc?:any) {
    if(doc) {
      return this.deserialize(doc);
    }
  }

  public deserialize(doc:PhoneDataDoc):PhoneData {
    // let docKeys = Object.keys(doc);
    // let keys = Object.keys(this.phonedata);
    // for(let key of keys) {
    //   if(docKeys.indexOf(key) > -1) {
    //     this.phonedata[key] = doc[key];
    //   }
    // }
    // return this;
    this.phonedata = doc;
    return this;
  }

  public static deserialize(doc:any):PhoneData {
    let pd:PhoneData = new PhoneData(doc);
    return pd;
  }

  public serialize():PhoneDataDoc {
    // let doc:any = {};
    // let keys = Object.keys(this.phonedata);
    // for(let key of keys) {
    //   doc[key] = this.phonedata[key];
    // }
    // return doc;
    return this.phonedata;
  }

  public toJSON() {
    return this.serialize();
  }

  public isOnSite():boolean {
    return true;
  }

  public getClass():any {
    return PhoneData;
  }
  public static getClassName():string {
    return 'PhoneData';
  }
  public getClassName():string {
    return PhoneData.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}

