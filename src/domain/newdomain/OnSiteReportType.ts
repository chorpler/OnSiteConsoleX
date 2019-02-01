/**
 * Name: SESAReportType domain class
 * Vers: 2.0.1
 * Date: 2018-09-19
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-19: Initial setup
*/

import { Log     } from '../config/config.log';
import { CLL     } from './interfaces'        ;
import { SESACLL } from './OnSiteCLL'         ;

export class SESAReportType extends SESACLL {
  public static keys:string[] = [
    "name",
    "value",
  ];
  constructor(doc?:SESACLL) {
    super(doc);
    // Object.defineProperty(this, 'fullName', {enumerable:false});
    // Object.defineProperty(this, 'value', {enumerable:true});
  }
  public static deserialize(doc:any) {
    let item:SESAReportType = new SESAReportType(doc);
    return item;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAReportType;
  }
  public getClassName():string {
    return 'SESAReportType';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
