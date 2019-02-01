/**
 * Name: SESATrainingType domain class
 * Vers: 2.0.1
 * Date: 2018-09-19
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-19: Initial setup
*/

import { Log     } from '../config/config.log';
import { CLL     } from './interfaces'        ;
import { SESACLL } from './OnSiteCLL'         ;

export class SESATrainingType extends SESACLL {
  public static keys:string[] = [
    "name",
    "value",
    "hours",
  ];
  constructor(doc?:CLL) {
    super(doc);
    let prot = Object.getPrototypeOf(this.getClass());
    Object.defineProperty(prot, 'fullName', {enumerable:false});
    Object.defineProperty(prot, 'value', {enumerable:true});
    Object.defineProperty(prot, 'hours', {enumerable:true});
  }
  public static deserialize(doc:any) {
    let item:SESATrainingType = new SESATrainingType(doc);
    return item;
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return SESATrainingType;
  }
  public getClassName():string {
    return 'SESATrainingType';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
