/**
 * Name: OnSiteShiftSymbols domain class
 * Vers: 2.1.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 2.1.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { ISESAShiftSymbols } from './interfaces';
// import { SESAShift } from 'domain/newdomain/OnSiteShift';


 export class SESAShiftSymbols implements ISESAShiftSymbols {
  public static keys:string[] = [
    "name",
    "fullName",
    "symbol",
  ];
  public static sunChars    : string = "☀☼🌞🌣";
  public static moonChars   : string = "☽🌛🌜" ;
  public symbol      : string;
  // public symbol      : string = SESAShiftSymbols.sunChars[0];
  public name        : string = "AM";
  public fullName    : string = "AM";
  public get sun        ():string { return SESAShiftSymbols.sunChars[0]; };
  public get moon       ():string { return SESAShiftSymbols.moonChars[0]; };
  // public get name       ():string { return this.symbol; };
  // public get fullName   ():string { return this.name; };
  public get value      ():string { return this.fullName; };
  public get code       ():string { return this.name; };
  public get capsName   ():string { return this.fullName.toUpperCase(); };
  public set sun        (val:string) { let newSunChars:string = val + SESAShiftSymbols.sunChars.slice(1); SESAShiftSymbols.sunChars = newSunChars; };
  // public set name       (val:string) { this.symbol = val; };
  // public set fullName   (val:string) { this.name = val; };
  public set value      (val:string) { this.fullName = val; };
  public set code       (val:string) { this.name = val; };
  public get chars():string {
    if(typeof this.name === 'string') {
      let n:string = this.name.toUpperCase();
      if(n === 'AM') {
        return SESAShiftSymbols.sunChars;
      } else if(n === 'PM') {
        return SESAShiftSymbols.moonChars;
      }
    }
    return "";
  };
  public set chars(val:string) {
    if(typeof this.name === 'string') {
      let n:string = this.name.toUpperCase();
      if(n === 'AM') {
        SESAShiftSymbols.sunChars = val;
      } else if(n === 'PM') {
        SESAShiftSymbols.moonChars = val;
      }
    }
  }

  constructor(doc?:any) {
    Object.defineProperty(SESAShiftSymbols.prototype, 'symbol', {
      enumerable: true,
      get() {
        return this.chars && this.chars.length ? this.chars[0] : "";
      },
      set(val:string) {
        let tmp:string[] = Array.from(this.chars);
        if(tmp && tmp.length) {
          tmp[0] = val;
          let out:string = tmp.join("");
          this.chars = out;
        }
      },
    });
    if(doc) {
      return this.deserialize(doc);
    }

    // Object.defineProperty(this, 'fullName', {
    //   enumerable: true,
    //   get() { return this.name; },
    //   set(val:string) { this.name = val; },
    // });
  }

  public serialize():any {
    let doc:any = {};
    let keys = this.getKeys();
    for(let key of keys) {
      doc[key] = this[key];
    }
    return doc;
  }

  public deserialize(doc:any):SESAShiftSymbols {
    let docKeys = Object.keys(doc);
    let keys = this.getKeys();
    for(let key of keys) {
      if(docKeys.indexOf(key) > -1 && doc[key] != undefined) {
        this[key] = doc[key];
      }
    }
    return this;
  }

  public static deserialize(doc:any):SESAShiftSymbols {
    let item:SESAShiftSymbols = new SESAShiftSymbols(doc);
    return item;
  }

  public getKeys():string[] {
    let myClass = this.getClass();
    return myClass.keys;
  }

  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):SESAShiftSymbols {
    return SESAShiftSymbols.deserialize(doc);
  }

  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAShiftSymbols;
  }
  public getClassName():string {
    return 'SESAShiftSymbols';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}

