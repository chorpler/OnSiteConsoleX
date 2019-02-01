/**
 * Name: SESACLL domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { Log } from '../config/config.log';
import { CLL } from './interfaces';

const emptyCLL:CLL = {
  name: "",
  fullName: "",
  id: -1,
  scheduleName: "",
  techClass: "",
  value: "",
  code: "",
  hours: -1
  // capsName: "",
};

export class SESACLL implements CLL {
  public static keys:string[] = [
    "id",
    "name",
    "fullName",
    "scheduleName",
  ];
  public static emptyCLL:CLL = {
    name: "",
    fullName: "",
    id: -1,
    scheduleName: "",
    techClass: "",
    value: "",
    code: "",
    hours: -1,
    // capsName: "",
  };

  public cll           : CLL = {
    name         : "",
    fullName     : "",
    // scheduleName : "",
    id           : -1,
  };
  // public name ?: string;
  public get name():string { return this.cll.name; };
  public get fullName():string { return this.cll.fullName; };
  public get code():string { return this.cll.name; };
  public get value():string { return this.cll.fullName; };
  public get capsName():string { return this.cll.fullName.toUpperCase(); };
  public get scheduleName():string { return this.cll.scheduleName != undefined ? this.cll.scheduleName : undefined; };
  public get techClass():string { return this.cll.techClass != undefined ? this.cll.techClass : undefined; };
  public get id():number { return this.cll.id; };
  public get hours():number { return this.cll.hours != undefined ? this.cll.hours : undefined; };
  public set name(val:string) { this.cll.name = val; };
  public set fullName(val:string)    { this.cll.fullName = val; };
  public set code(val:string) { this.cll.name = val; };
  public set value(val:string) { this.cll.fullName = val; };
  // public set scheduleName(val:string) { Object.defineProperty(this, 'scheduleName', {enumerable:true}); this.cll.scheduleName = val; };
  // public set scheduleName(val:string) { this.cll.scheduleName = val; Object.defineProperty(this, 'scheduleName', {enumerable:true}); };
  public set scheduleName(val:string) { this.cll.scheduleName = val; };
  public set techClass(val:string) { this.cll.techClass = val; };
  public set id(val:number) { this.cll.id = val; };
  // public set hours(val:number) { Object.defineProperty(SESACLL, 'hours', {enumerable:true}); this.cll.hours = val; };
  public set hours(val:number) { this.cll.hours = val; };
  // constructor(name?:string, fullName?:string, value?:string, code?:string, capsName?:string, scheduleName?:string) {
  constructor(doc?:CLL) {
    // Object.defineProperty(this, 'name', {
    //   enumerable: true,
    //   get() { return this.cll.name; },
    //   set(val:string) { this.cll.name = val; },
    // });
    if(doc) {
      this.deserialize(doc);
    }
    // let myClass = Object.getPrototypeOf(this);
    // Object.defineProperty(SESACLL.prototype, 'name', {enumerable:true});
  }

  public deserialize(doc:any):SESACLL {
    let parentClass = SESACLL;
    // let keys = Object.keys(parentClass.emptyCLL);
    // let myClass = this.getClass();
    let keys = this.getKeys();
    // let thisKeys = Object.keys(this);
    let docKeys   = Object.keys(doc);
    for(let key of keys) {
      if(docKeys.indexOf(key) > -1 && doc[key] != undefined) {
        this[key] = doc[key];
      }
    }
    for(let key in this) {
      if(docKeys.indexOf(key) > -1) {
        this[key] = doc[key];
      }
    }
    return this;
  }

  public serialize():any {
    let keys = Object.keys(this.cll);
    let myKeys = this.getKeys();
    let doc:any = {};
    // for(let key of myKeys) {
    //   if(keys.indexOf(key) > -1 && this.cll[key] != undefined) {
    //     doc[key] = this.cll[key];
    //   }
    // }
    for(let key of myKeys) {
      if(this[key] != undefined) {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public static deserialize(doc:any):SESACLL {
    let item = new SESACLL(doc);
    return item;
  }

  public getScheduleName():string {
    if(this.scheduleName) {
      return this.scheduleName;
    } else {
      return this.fullName;
    }
  }

  public toUpperCase():string {
    if(typeof this.value === 'string') {
      return this.value.toUpperCase();
    } else if(typeof this.fullName === 'string') {
      return this.fullName.toUpperCase();
    } else if(typeof this.capsName === 'string') {
      return this.capsName.toUpperCase();
    } else {
      Log.w(`SESACLL.toUpperCase(): Could not find Employee field value, fullName, or capsName for object:\n`, this);
      return "";
    }
  }

  public toLowerCase():string {
    if(typeof this.value === 'string') {
      return this.value.toLowerCase();
    } else if(typeof this.fullName === 'string') {
      return this.fullName.toLowerCase();
    } else if(typeof this.capsName === 'string') {
      return this.capsName.toLowerCase();
    } else {
      Log.w(`SESACLL.toLowerCase(): Could not find Employee field value, fullName, or capsName for object:\n`, this);
      return "";
    }
  }

  public toJSON() {
    return this.serialize();
  }

  public getKeys():string[] {
    // let keys:string[] = [];
    // for(let key in this) {
    //   keys.push(key);
    // }
    // return keys;
    let myClass = this.getClass();
    return myClass.keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESACLL;
  }
  public getClassName():string {
    return 'SESACLL';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
