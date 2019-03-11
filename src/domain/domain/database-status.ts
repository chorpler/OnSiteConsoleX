/**
 * Name: DatabaseStatus domain class
 * Vers: 1.1.1
 * Date: 2019-03-11
 * Auth: David Sargeant
 * Logs: 1.1.1 2019-03-11: Added error property
 * Logs: 1.0.2 2019-03-06: Fixed bug where getFraction() with 0-length remote led to 0 instead of 1
 * Logs: 1.0.1 2019-02-21: Initial creation (added IDatabaseStatus to config.types.ts)
 */

import { sprintf             } from 'sprintf-js'                 ;
import { IDatabaseStatus     } from '../config/config.types'     ;
import { DatabaseStatusState } from '../config/config.types'     ;
import { roundMaxDecimals    } from '../config/config.functions' ;

export class DatabaseStatus implements IDatabaseStatus {
  public dbname     ?: string  = ""    ;
  public dbkey      ?: string  = ""    ;
  public localDocs  ?: number  = 0     ;
  public remoteDocs ?: number  = 0     ;
  public error      ?: boolean = false ;
  public waiting    ?: boolean = false ;
  public state      ?: DatabaseStatusState = DatabaseStatusState.NORMAL ;
  // public done     : number = 0 ;
  // public total    : number = 0 ;
  // public percent  : number = 0 ;
  // public touched  : boolean = false;
  constructor(doc?:IDatabaseStatus) {
    if(doc) {
      this.dbname     = doc.dbname     != undefined ? doc.dbname     : this.dbname     ;
      this.dbkey      = doc.dbkey      != undefined ? doc.dbkey      : this.dbkey      ;
      this.localDocs  = doc.localDocs  != undefined ? doc.localDocs  : this.localDocs  ;
      this.remoteDocs = doc.remoteDocs != undefined ? doc.remoteDocs : this.remoteDocs ;
      this.error      = doc.error      != undefined ? doc.error      : this.error      ;
      this.waiting    = doc.waiting    != undefined ? doc.waiting    : this.waiting    ;
      this.state      = doc.state      != undefined ? doc.state      : this.state      ;
    }
  }

  public getRemaining():number {
    let local :number = Number(this.localDocs);
    let remote:number = Number(this.remoteDocs);
    if(isNaN(local) || isNaN(remote)) {
      return 0;
    }
    let count:number = Math.abs(remote - local);
    return count;
  }

  public getFraction():number {
    let local :number = Number(this.localDocs);
    let remote:number = Number(this.remoteDocs);
    if(isNaN(local) || isNaN(remote)) {
      return 0;
    }
    if(remote === 0) {
      if(local) {
        return 0;
      } else {
        return 1;
      }
    } else if(local > remote) {
      return remote / local;
    } else {
      return local / remote;
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
    // this.percent = out;
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
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public static getClassName():string {
    return 'DatabaseStatus';
  }
  public getClass():any {
    return DatabaseStatus;
  }
  public getClassName():string {
    return this.getClass().getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
