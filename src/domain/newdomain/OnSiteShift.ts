/**
 * Name: SESAShift domain class
 * Vers: 2.1.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 2.1.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { SESAShiftSymbols } from './OnSiteShiftSymbols';

export class SESAShift extends SESAShiftSymbols {
  // public symbol:string = this.sunChars && this.sunChars.length ? this.sunChars[0] : "";
  public static keys:string[] = [
    "name",
    "fullName",
    "symbol",
  ];

  constructor(doc?:any) {
    super();
    if(doc) {
      return this.deserialize(doc);
    } else {
      // if(this.sunChars && this.sunChars.length) {
      //   this.symbol = this.sunChars[0];
      // }
    }
  }

  public serialize():any {
    let doc:any = {};
    for(let key in this) {
      let value:any = this[key];
      doc[key] = value;
    }
    return doc;
  }

  public deserialize(doc:any):SESAShift {
    let docKeys = Object.keys(doc);
    for(let key in this) {
      if(docKeys.indexOf(key) > -1) {
        this[key] = doc[key];
      }
    }
    return this;
  }

  public static deserialize(doc:any):SESAShift {
    let shift:SESAShift = new SESAShift(doc);
    return shift;
  }

  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):SESAShift {
    return SESAShift.deserialize(doc);
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAShift;
  }
  public getClassName():string {
    return 'SESAShift';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}

