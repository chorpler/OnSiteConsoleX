/**
 * Name: Message domain class
 * Vers: 4.3.1
 * Date: 2019-07-01
 * Auth: David Sargeant
 * Logs: 4.3.1 2019-07-01: Added isTest property, setDate(),setMessageDate() methods; minor TSLint error fixes
 * Logs: 4.2.1 2018-12-14: Refactored imports, added sentAt property
 * Logs: 4.1.1 2018-12-13: Added exclusion for empty texts and subjects properties when serializing
 * Logs: 4.0.1 2018-12-06: Lots of refactoring. Changed Moment properties to strings. Added oo (JSON8) dependency for cloning.
 * Logs: 3.2.1 2018-12-06: Added getKeys() method; added property initializers;
 * Logs: 3.1.1 2018-03-17: Added to field, for specifying message recipient(s)
 * Logs: 3.0.1 2017-12-13: Revamped duration methods and serial/deserialization methods, and added recipient field
 * Logs: 2.0.1 2017-08-04: Added Spanish language fields
 */

import { Log      } from '../config/config.log'    ;
import { Moment   } from '../config/config.moment' ;
import { moment   } from '../config/config.moment' ;
import { isMoment } from '../config/config.moment' ;
import { oo       } from '../config/config.types'  ;
import { Employee } from './employee'              ;

export interface OnSiteLanguageStrings {
  en:string;
  es:string;
}

export class Message {
  public _id        : string  = "";
  public _rev       : string  = "";
  public from       : string  = "";
  // public date       : Moment  = moment();
  public date       : string  = "";
  // public XLdate     : number  = this.date.toExcel();
  public XLdate     : number  = NaN;
  public sentAt     : string = "";
  public recipient  : string  = "";
  public duration   : number  = 7 ;
  public subject    : string  = "";
  public text       : string  = "";
  public subjectES  : string  = "";
  public textES     : string  = "";
  public texts      : OnSiteLanguageStrings     = { en: "", es: "" } ;
  public subjects   : OnSiteLanguageStrings     = { en: "", es: "" } ;
  public read       : boolean = false;
  // public readTS     : Moment  = null ;
  public readTS     : string  = "";
  public message    : string  = "";
  public technician : string  = "";
  public phone      : any     = null;
  public to         : string[] = [];
  public isTest     : boolean = false;

  // constructor(from?:string, date?:Moment | Date | string, duration?:number, subject?:string, text?:string) {
  constructor(messageDoc?:any) {
    if(messageDoc != undefined) {
      return this.deserialize(messageDoc);
    } else {
      let now:Moment = moment();
      this.date = now.format("YYYY-MM-DD");
      this.XLdate = now.toExcel(true);
    }
    // this.from       = from     || '' ;
    // this.duration   = duration || 7  ;
    // this.subject    = subject  || '' ;
    // this.text       = text     || '' ;
    // this.subjectES  = ''       ;
    // this.textES     = ''       ;
    // this.read       = false    ;
    // this.readTS     = null     ;
    // this.technician = "";
    // this.recipient  = "";
    // this.message    = this.text;
    // this.phone      = {};

    // let mDate      = isMoment(date) || date instanceof Date ? moment(date) : typeof date === 'string' ? moment(date, 'YYYY-MM-DD') : moment();
    // this.date      = moment(mDate)  || null;
    // this.XLdate    = mDate.toExcel(true);
    // this.read      = false;
    // this.readTS    = null;
    // this.recipient = "";
  }

  public readFromDoc(doc:any):Message {
    let keys:string[] = this.getKeys();
    for(let key of keys) {
      let value:any = doc[key];
      if(key === 'date') {
        this[key] = doc[key];
        // if(isMoment(value) || value instanceof Date) {
        //   this[key] = moment(value);
        // } else if(typeof value === 'string') {
        //   this[key] = moment(value, "YYYY-MM-DD");
        // }
      } else if(key === 'readTS') {
        // let ts:Moment = moment(doc[key]);
        // this.date = ts;
      } else if(key === 'readTS') {
        // this[key] = moment(doc[key]);
        this[key] = value;
      } else if(key === 'duration') {
        this[key] = value;
        // if(moment.isDuration(value)) {
        //   this[key] = moment.duration(value).hours();
        // } else {
        //   this[key] = value;
        // }
      } else {
        this[key] = value;
      }
    }
    // this.XLdate = this.date.toExcel(true);
    return this;
  }

  public static deserialize(doc:any):Message {
    let message:Message = new Message(doc);
    return message;
  }

  public deserialize(doc:any):Message {
    // return this.readFromDoc(doc);
    let docKeys:string[] = Object.keys(doc);
    let myKeys:string[] = this.getKeys();
    for(let key of docKeys) {
      if(myKeys.indexOf(key) > -1) {
        let value:any = doc[key];
        if(key === 'date') {
          this[key] = doc[key];
          // if(isMoment(value) || value instanceof Date) {
          //   this[key] = moment(value);
          // } else if(typeof value === 'string') {
          //   this[key] = moment(value, "YYYY-MM-DD");
          // }
        } else if(key === 'readTS') {
          // let ts:Moment = moment(doc[key]);
          // this.date = ts;
        } else if(key === 'readTS') {
          // this[key] = moment(doc[key]);
          this[key] = value;
        } else if(key === 'duration') {
          this[key] = value;
          // if(moment.isDuration(value)) {
          //   this[key] = moment.duration(value).hours();
          // } else {
          //   this[key] = value;
          // }
        } else {
          this[key] = value;
        }
      }
    }
    // this.XLdate = this.date.toExcel(true);
    return this;
  }

  public serialize():any {
    // let keys:string[] = ['_id', '_rev', 'from', 'date', 'XLdate', 'duration', 'subject', 'text', 'read', 'readTS'];
    let keys:string[] = this.getKeys();
    let doc:any = {};
    for(let key of keys) {
      let value:any = this[key];
      if(key === 'date' || key === 'readTS') {
        // doc[key] = this[key].format();
        doc[key] = this[key];
      } else if(key === 'duration') {
        doc[key] = Number(this[key]);
      } else if(key === 'texts' || key === 'subjects') {
        if(value['en'] || value['es']) {
          doc[key] = value;
        }
      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public clone():Message {
    let doc:any = this.serialize();
    let newDoc:any = oo.clone(doc);
    return Message.deserialize(newDoc);
    // let newMsg:Message = new Message();
    // let keys = Object.keys(this);
    // for(let key of keys) {
    //   let value = this[key];
    //   if(isMoment(value)) {
    //     newMsg[key] = moment(value);
    //   } else if(value && typeof value === 'object') {
    //     newMsg[key] = Object.assign({}, value);
    //   } else {
    //     newMsg[key] = this[key];
    //   }
    // }
    // return newMsg;
  }

  public getMessageDate():Moment {
    let date:Moment = moment(this.date, "YYYY-MM-DD");
    return date;
  }

  public getMessageDateAsString(format?:string):string {
    let output:string = String(this.date);
    if(format != undefined) {
      let fmt:string = String(format);
      let date:Moment = this.getMessageDate();
      output = date.format(fmt);
    }
    return output;
  }

  public getMessageDateString(format?:string):string {
    let fmt:string = typeof format === 'string' ? format : "ddd, MMM D, YYYY";
    return this.getMessageDateAsString(fmt);
  }

  public setMessageDate(val:string|Moment|Date):string {
    let date:Moment;
    if(isMoment(val) || val instanceof Date) {
      date = moment(val);
    } else if(typeof val === 'string') {
      date = moment(val, "YYYY-MM-DD");
    } else {
      let text:string = `Message.setMessageDate(): value must be Moment, Date, or string in YYYY-MM-DD format`;
      Log.e(text + ", provided:", val);
      let err = new Error(text);
      throw err;
    }
    if(isMoment(date)) {
      this.date = date.format("YYYY-MM-DD");
      this.XLdate = date.toExcel();
      return this.date;
    } else {
      let text:string = `Message.setMessageDate(): Invalid date provided`;
      Log.e(text + ":", val);
      let err = new Error(text);
      throw err;
    }
  }

  public setDate(val:string|Moment|Date):string {
    return this.setMessageDate(val);
  }

  public getMessageSender():string {
    return this.from;
  }

  public getMessageSubject():string {
    return this.subject;
  }

  public getMessageSubjectES():string {
    return this.subjectES;
  }

  public getMessageBody():string {
    return this.text;
  }

  public getMessageBodyES():string {
    return this.textES;
  }

  public getMessageDuration():number {
    let dur:number = Number(this.duration);
    if(!isNaN(dur)) {
      return dur;
    } else {
      // return NaN;
      return 7;
    }
  }

  public getMessageReadStatus():boolean {
    return this.read;
  }

  public setMessageRead():boolean {
    this.read = true;
    let now:Moment = moment();
    this.readTS = now.format();
    return this.read;
  }

  public generateMessageID(tech:Employee):string {
    // let date:Moment = this.getMessageDate();
    if(this._id) {
      return this._id;
    }
    let ts:string = this.sentAt;
    let timestamp:Moment;
    if(ts && typeof ts === 'string' && ts.length > 10) {
      timestamp = moment(ts);
    }
    if(!isMoment(timestamp)) {
      timestamp = moment();
    }
    // let tsFmt:string = timestamp.format("YYYY-MM-DDTHH:mm:ss");
    let strTS:string = timestamp.format();
    // let pattern:RegExp = new RegExp("/ '\", !?//g");
    // let usr:string = this.from.replace(pattern, '');
    let username:string = tech && tech instanceof Employee ? tech.getUsername() : "UNKNOWN";
    let id:string = `${strTS}_${username}`;
    this._id = id;
    return id;
  }

  public getRecipient():string {
    return this.recipient;
  }

  public setRecipient(username:string) {
    this.recipient = username;
    return this.recipient;
  }

  public isExpired():boolean {
    let now:Moment = moment();
    // let message:Message = this;
    let date:Moment = this.getMessageDate().startOf('day');
    let duration:number = this.getMessageDuration();
    let expires:Moment = moment(date).add(duration, 'days');
    return !now.isSameOrBefore(expires, 'day');
    // if(now.isSameOrBefore(expires, 'day')) {
      // return false;
    // } else {
      // return true;
    // }
  }

  public toJSON():any {
    return this.serialize();
  }

  public getKeys():string[] {
    return Object.keys(this);
  }
  public isOnSite():boolean {
    return true;
  }
  public static fromJSON(doc:any):Message {
    return Message.deserialize(doc);
  }
  public getClass():any {
    return Message;
  }
  public static getClassName():string {
    return 'Message';
  }
  public getClassName():string {
    return Message.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
