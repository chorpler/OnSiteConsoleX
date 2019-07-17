/**
 * Name: SESAShiftLength domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

// import { SESAShift } from 'domain/config'     ;
import { Log     } from '../config/config.log';
import { CLL     } from './interfaces'        ;
import { SESACLL } from './OnSiteCLL'         ;

export class SESAShiftLength extends SESACLL {
  public static keys:string[] = [
    "name",
    "fullName",
  ];

  constructor(length?:number|string) {
    super();
    if(length !== undefined) {
      this.name = String(length);
      this.fullName = String(length);
    } else {
      this.name == this.name || 8;
      this.fullName = this.fullName || "8";
    }
  }
  public static deserialize(doc:any):SESAShiftLength {
    let item:SESAShiftLength = new SESAShiftLength();
    item.deserialize(doc);
    return item;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAShiftLength;
  }
  public getClassName():string {
    return 'SESAShiftLength';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
