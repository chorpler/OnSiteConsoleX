/**
 * Name: DatabaseProgress domain class
 * Vers: 2.0.1
 * Date: 2019-01-29
 * Auth: David Sargeant
 * Logs: 2.0.1 2019-01-29: Moved to its own file
 * Logs: 1.0.1 2018-01-13: Initial creation (added to config.types.ts)
 */

import { sprintf           } from 'sprintf-js'                 ;
import { IDatabaseProgress } from '../config/config.types'     ;
import { roundMaxDecimals  } from '../config/config.functions' ;

export class DatabaseProgress implements IDatabaseProgress {
  public dbname  ?: string = "";
  public dbkey   ?: string = "";
  public done     : number = 0 ;
  public total    : number = 0 ;
  public percent  : number = 0 ;
  public touched  : boolean = false;
  constructor({dbname = "", dbkey = "", done = 0, total = 0, percent = 0}:IDatabaseProgress) {
    this.dbname  = dbname  ;
    this.dbkey   = dbkey   ;
    this.done    = done    ;
    this.total   = total   ;
    this.percent = percent ;
    this.touched = false   ;
    // this.dbname  = dbname  !== undefined ? dbname  : this.dbname  !== undefined ? this.dbname  : "";
    // this.dbkey   = dbkey   !== undefined ? dbkey   : this.dbkey   !== undefined ? this.dbkey   : "";
    // this.done    = done    !== undefined ? done    : this.done    !== undefined ? this.done    : 0 ;
    // this.total   = total   !== undefined ? total   : this.total   !== undefined ? this.total   : -1;
    // this.percent = percent !== undefined ? percent : this.percent !== undefined ? this.percent : 0 ;
  }

  public getFraction():number {
    if(this.total === 0) {
      if(this.touched) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return this.done / this.total;
    }
  }

  public roundMaxDecimals(value:number, decimals?:number):number {
    return roundMaxDecimals(value, decimals);
  }

  public getPercent(maxDecimals?:number):number {
    let out:number = 100*this.getFraction();
    if(maxDecimals !== undefined) {
      out = this.roundMaxDecimals(out, maxDecimals);
    }
    this.percent = out;
    return out;
  }
  public getPercentString(decimalPlaces?:number):string {
    let places:number = decimalPlaces !== undefined ? decimalPlaces : 2;
    let percent:number = this.getPercent();
    percent = this.roundMaxDecimals(percent, places);
    let printString = `%.${places}f`;
    let out:string = sprintf(printString, percent);
    return out;
  }

  public getKeys():string[] {
    // let keys:string[] = Object.keys(this);
    let keys:string[] = [
      "dbname"  ,
      "dbkey"   ,
      "done"    ,
      "total"   ,
      "percent" ,
      "touched" ,
    ];
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public static getClassName():string {
    return 'DatabaseProgress';
  }
  public getClass():any {
    return DatabaseProgress;
  }
  public getClassName():string {
    return this.getClass().getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
