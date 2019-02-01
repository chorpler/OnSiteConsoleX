/**
 * Name: SESAShiftRotation domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { Log } from '../config/config.log';
import { SESACLL } from './OnSiteCLL';

export class SESAShiftRotation extends SESACLL {
  public static keys:string[] = [
    "name",
    "fullName",
  ];
  constructor(doc?:SESACLL) {
    super(arguments[0]);
  }
  public static deserialize(doc:any) {
    let item:SESAShiftRotation = new SESAShiftRotation(doc);
    return item;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAShiftRotation;
  }
  public getClassName():string {
    return 'SESAShiftRotation';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
