/**
 * Name: Jobsites domain class
 * Vers: 2.0.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-12-13: Refactored and added standard OnSite methods
 * Logs: 1.0.1 2017-08-14: Initial creation
 */

// import { sprintf       } from 'sprintf-js'       ;
// import { Log           } from '../config'        ;
// import { Moment        } from '../config'        ;
// import { moment        } from '../config'        ;
// import { isMoment      } from '../config'        ;
// import { oo            } from '../config'        ;
import { Jobsite       } from './jobsite'        ;
// import { Employee      } from './employee'       ;
// import { Shift         } from './shift'          ;
// import { Schedule      } from './schedule'       ;
// import { PayrollPeriod } from './payroll-period' ;

export class Jobsites {
  public sites:Jobsite[] = [];
  constructor() {
    /* Nothing so far */
  }

  public getKeys():string[] {
    return Object.keys(this);
  }
  // public toJSON():any {
  //   return this.serialize();
  // }
  // public static fromJSON(doc:any):Jobsites {
  //   return Jobsites.deserialize(doc);
  // }
  public isOnSite():boolean {
    return true;
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
