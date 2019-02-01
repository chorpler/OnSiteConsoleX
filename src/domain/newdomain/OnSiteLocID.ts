/**
 * Name: SESACLL domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { Log } from '../config/config.log';
import { SESACLL } from './OnSiteCLL';

export class SESALocID extends SESACLL {
  public static keys:string[] = [
    "id",
    "name",
    "fullName",
    "techClass",
  ];
  constructor(doc?:SESACLL) {
    super(arguments[0]);
    this.techClass = doc.techClass ? doc.techClass : "";
  }

  public static deserialize(doc:any) {
    let item:SESALocID = new SESALocID(doc);
    return item;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESALocID;
  }
  public getClassName():string {
    return 'SESALocID';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
