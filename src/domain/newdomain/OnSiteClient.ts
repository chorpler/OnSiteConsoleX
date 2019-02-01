/**
 * Name: SESAClient domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { Log } from '../config/config.log';
import { SESACLL } from './OnSiteCLL';

export class SESAClient extends SESACLL {
  public static keys:string[] = [
    "id",
    "name",
    "fullName",
    "scheduleName",
  ];
  constructor(doc?:SESACLL) {
    super(doc);
  }
  public static deserialize(doc:any) {
    let item:SESAClient = new SESAClient(doc);
    return item;
  }

  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAClient;
  }
  public getClassName():string {
    return 'SESAClient';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
