/**
 * Name: Jobsites domain class
 * Vers: 1.0.1
 * Date: 2017-08-14
 * Auth: David Sargeant
 */

import { Jobsite } from './jobsite' ;

export class Jobsites {
  public sites:Jobsite[] = [];
  constructor() {
    /* Nothing so far */
  }
  public getClass():any {
    return Jobsites;
  }
  public static getClassName():string {
    return 'Jobsites';
  }
  public getClassName():string {
    return Jobsites.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
