/**
 * Name: SESAAux domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { Log } from '../config/config.log';
import { SESACLL } from './OnSiteCLL';

export class SESAAux extends SESACLL {

  constructor(doc?:SESACLL) {
    super(doc);
  }
  public static deserialize(doc:any) {
    let item:SESAAux = new SESAAux(doc);
    // item.deserialize(doc);
    return item;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESAAux;
  }
  public getClassName():string {
    return 'SESAAux';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
