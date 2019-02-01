/**
 * Name: Comment domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Revamped to include PhoneData and CommentDoc
 * Logs: 1.1.2 2017-12-12: Initial model
 */

import { Log, moment, Moment, isMoment } from '../config'  ;
import { PhoneData                     } from './phonedata';

export interface CommentDoc {
  _id        : string   ;
  _rev       : string   ;
  technician : string   ;
  username   : string   ;
  subject    : string   ;
  message    : string   ;
  timestamp  : string   ;
  phone      : PhoneData;
}

export class Comment {
  public comment:CommentDoc = {
    _id       : "",
    _rev      : "",
    technician: "",
    username  : "",
    subject   : "",
    message   : "",
    timestamp : "",
    phone     : new PhoneData(),
  }
  public get _id        ():string { return this.comment._id; };
  public get _rev       ():string { return this.comment._rev; };
  public get technician ():string { return this.comment.technician; };
  public get username   ():string { return this.comment.username; };
  public get subject    ():string { return this.comment.subject; };
  public get message    ():string { return this.comment.message; };
  public get timestamp  ():string { return this.comment.timestamp; };
  public get phone      ():PhoneData { return this.comment.phone; };
  public set _id        (val:string)    { this.comment._id = val; };
  public set _rev       (val:string)    { this.comment._rev = val; };
  public set technician (val:string)    { this.comment.technician = val; };
  public set username   (val:string)    { this.comment.username = val; };
  public set subject    (val:string)    { this.comment.subject = val; };
  public set message    (val:string)    { this.comment.message = val; };
  public set timestamp  (val:string)    { this.comment.timestamp = val; };
  public set phone      (val:PhoneData) { this.comment.phone = val; };

  constructor(doc?:CommentDoc) {
    if(doc) {
      return this.deserialize(doc);
    }
  }

  public setSubject(subject:string) {
    this.subject = subject;
    return subject;
  }

  public setTechnician(techName:string) {
    this.technician = techName;
    return this.technician;
  }

  public setUsername(name:string) {
    this.username = name;
    return name;
  }

  public setMessage(message:string) {
    this.message = message;
    return message;
  }

  public setPhone(phone:any) {
    this.phone = phone;
    return phone;
  }

  public setTimestamp(timestamp?:Moment):string {
    if(isMoment(timestamp)) {
      this.timestamp = timestamp.format();
    } else {
      let now = moment();
      this.timestamp = now.format();
    }
    return this.timestamp;
  }

  public getTimestampMoment():Moment {
    let ts:Moment = moment(this.timestamp);
    return ts;
  }

  public generateID():string {
    let id = this.getTimestampMoment().format() + "_" + this.username;
    this._id = id;
    return id;
  }

  public serialize():CommentDoc {
    return this.comment;
    // let doc = new Object();
    // let keys = Object.keys(this);
    // for(let key of keys) {
    //   doc[key] = this[key];
    // }
    // doc['timestamp'] = this.getTimestampMoment().format();
    // doc['_id'] = this.generateID();
    // if(this['_rev'] !== '') {
    //   doc['_rev'] = this['_rev'];
    // }
    // return doc;
  }

  public deserialize(doc:CommentDoc):Comment {
    // let docKeys = Object.keys(doc);
    // let keys = Object.keys(this.comment);
    // for(let key of keys) {
    //   this.comment[key] = doc[key];
    // }
    this.comment = doc;
    return this;
    // let keys = Object.keys(doc);
    // for(let key of keys) {
    //   if(key === 'timestamp') {
    //     this[key] = moment(doc[key]);
    //   } else {
    //     this[key] = doc[key];
    //   }
    // }
  }

  public static deserialize(doc:CommentDoc):Comment {
    let comment:Comment = new Comment(doc);
    return comment;
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

  public isOnSite():boolean {
    return true;
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
  };

}
