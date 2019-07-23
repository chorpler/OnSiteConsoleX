/**
 * Name: Comment domain class
 * Vers: 2.1.1
 * Date: 2019-01-23
 * Auth: David Sargeant
 * Logs: 2.1.1 2019-01-23: Adjusted getCommentDateAsString() method to allow format parameter; also added
 * Logs: 2.0.1 2018-12-06: Refactored to add better serializing/deserializing/cloning; changed Moment properties to string
 * Logs: 1.1.2 2017-12-12: Initial model
 */

import { Log, moment, Moment, isMoment, oo } from '../config';

export interface CordovaPhoneInfo {
  cordova     : string;
  model       : string;
  platform    : string;
  uuid        : string;
  version     : string;
  manufacturer: string;
  virtual     : string;
  serial      : string;
  uniqueID    : string;
  appName     : string;
  appVersion  : string;
}

export class Comment {
  public _id       :string = ""  ;
  public _rev      :string = ""  ;
  public technician:string = ""  ;
  public username  :string = ""  ;
  public subject   :string = ""  ;
  public message   :string = ""  ;
  // public timestamp :Moment = null;
  public timestamp :string = ""  ;
  public phone     :CordovaPhoneInfo    = {
    cordova     : "",
    model       : "",
    platform    : "",
    uuid        : "",
    version     : "",
    manufacturer: "",
    virtual     : "",
    serial      : "",
    uniqueID    : "",
    appName     : "",
    appVersion  : "",
  };

  constructor(doc?:any) {
    if(doc != undefined) {
      return this.deserialize(doc);
    } else {
      let now:Moment = moment();
      this.timestamp = now.format();
    }
  }

  public serialize():any {
    let doc:any = {};
    let keys:string[] = this.getKeys();
    this.generateID();
    for(let key of keys) {
      let value:any = this[key];
      if(key === 'phone') {
        let newValue:CordovaPhoneInfo = oo.clone(value);
        doc[key] = newValue;
      } else {
        doc[key] = value;
      }
    }
    // doc['timestamp'] = this.timestamp.format();
    // doc = this.generateID();
    // if(this['_rev'] !== '') {
    //   doc['_rev'] = this['_rev'];
    // }
    return doc;
  }

  public deserialize(doc:any):Comment {
    let docKeys:string[] = Object.keys(doc);
    let myKeys:string[] = this.getKeys();
    for(let key of docKeys) {
      if(myKeys.indexOf(key) > -1) {
        this[key] = doc[key];
      }
      // if(key === 'timestamp') {
      //   this[key] = moment(doc[key]);
      // } else {
      //   this[key] = doc[key];
      // }
    }
    return this;
  }

  public static deserialize(doc:any):Comment {
    return new Comment(doc);
  }

  public readFromDoc(doc:any):Comment {
    return this.deserialize(doc);
  }

  public clone():Comment {
    let doc:any = this.serialize();
    let newDoc:any = oo.clone(doc);
    return Comment.deserialize(newDoc);
  }

  public generateID():string {
    if(this._id) {
      return this._id;
    } else {
      let now:Moment = moment();
      this.timestamp = now.format();
      let id:string = this.timestamp + "_" + this.username;
      this._id = id;
      return id;
    }
  }

  public getCommentDate():Moment {
    let timestamp:string = this.timestamp || this.setTimestamp();
    let ts:Moment = moment(timestamp);
    if(isMoment(ts)) {
      // let date:string = ts.format("YYYY-MM-DD");
      return moment(ts).startOf('day');
    } else {
      let text:string = `Comment.getCommentDate(): Could not determine comment date`;
      let err:Error = new Error(text);
      throw err;
    }
  }

  public getCommentDateAsString(format?:string):string {
    let date:Moment = this.getCommentDate();
    let fmt:string = typeof format === 'string' ? format : "YYYY-MM-DD";
    let dateString:string = date.format(fmt);
    return dateString;
  }

  public setSubject(subject:string):string {
    this.subject = subject;
    return this.subject;
  }

  public setTechnician(techName:string):string {
    this.technician = techName;
    return this.technician;
  }

  public setUsername(name:string):string {
    this.username = name;
    return this.username;
  }

  public setMessage(message:string):string {
    this.message = message;
    return this.message;
  }

  public setPhone(phone:CordovaPhoneInfo):CordovaPhoneInfo {
    this.phone = phone;
    return this.phone;
  }

  public setTimestamp(timestamp?:Moment|Date|string):string {
    // this.timestamp = timestamp || moment();
    let ts:Moment;
    if(timestamp == undefined) {
      ts = moment();
    } else if(isMoment(timestamp) || timestamp instanceof Date) {
      ts = moment(timestamp);
    } else if(typeof timestamp === 'string') {
      ts = moment(timestamp);
    }
    if(isMoment(ts)) {
      this.timestamp = ts.format();
      return this.timestamp;
    } else {
      let text:string = `Comment.setTimestamp(): Error, parameter must be empty or Moment-able value`;
      Log.l(`${text}, was:\n`, timestamp);
      let err:Error = new Error(text);
      Log.e(err);
      throw err;
    }
  }


  // public checkPhoneInfo() {
  //   this.readPhoneInfo().then(res => {
  //     Log.l("checkPhoneInfo(): Phone info is fine.");
  //   }).catch(err => {
  //     Log.l("checkPhoneInfo(): Nope.");
  //     Log.e(err);
  //   });
  // }

  // public readPhoneInfo() {
  //   return new Promise((resolve,reject) => {
  //     let cordova      = this.device.cordova      ;
  //     let model        = this.device.model        ;
  //     let platform     = this.device.platform     ;
  //     let uuid         = this.device.uuid         ;
  //     let version      = this.device.version      ;
  //     let manufacturer = this.device.manufacturer ;
  //     let virtual      = this.device.isVirtual    ;
  //     let serial       = this.device.serial       ;
  //     let uniqueID     = ""                       ;
  //     this.unique.get().then(res => {
  //       uniqueID = res;
  //       this.phone = {
  //         cordova     : cordova      ,
  //         model       : model        ,
  //         platform    : platform     ,
  //         uuid        : uuid         ,
  //         version     : version      ,
  //         manufacturer: manufacturer ,
  //         virtual     : virtual      ,
  //         serial      : serial       ,
  //         uniqueID    : uniqueID     ,
  //       };
  //       resolve(this.phone);
  //     }).catch(err => {
  //       Log.l("readPhoneInfo(): Error reading phone info!");
  //       Log.e(err);
  //     });
  //   });
  // }

  public toJSON():any {
    return this.serialize();
  }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }

  public getClass():any {
    return Comment;
  }
  public static getClassName():string {
    return 'Comment';
  }
  public getClassName():string {
    return Comment.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}
