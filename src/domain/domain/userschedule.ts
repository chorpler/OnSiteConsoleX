/**
 * Name: UserSchedule domain class
 * Vers: 1.0.0
 * Date: 2019-08-12
 * Auth: David Sargeant
 * Logs: 1.0.0 2019-08-12: Created for app schedule info for individual user
 */

import { Log              } from '../config'  ;
import { Moment           } from '../config'  ;
import { moment           } from '../config'  ;
import { isMoment         } from '../config'  ;
import { oo               } from '../config'  ;
import { ScheduleListItem } from '../config'  ;
import { SiteScheduleType } from './jobsite'  ;

export interface UserScheduleInfo {
  tech: string;
  site: number;
  rotation: string;
  shift: SiteScheduleType;
}
export interface UserScheduleInfoForDate extends UserScheduleInfo {
  date: string;
}
export class UserSchedule implements UserScheduleInfoForDate {
  public date:string = "";
  public tech:string = "";
  public site:number = 0 ;
  public rotation:string = "CONTN WEEK";
  public shift:SiteScheduleType = "AM";
  constructor(doc?:UserScheduleInfoForDate) {
    if(doc) {
      this.date = doc.date;
      this.tech = doc.tech;
      this.site = doc.site;
      this.rotation = doc.rotation;
      this.shift = doc.shift;
    }
  }

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  // public toJSON():any {
  //   return this.serialize();
  // }
  // public static fromJSON(doc:any):Street {
  //   return Street.deserialize(doc);
  // }
  public getClass():any {
    return UserSchedule;
  }
  public static getClassName():string {
    return 'UserSchedule';
  }
  public getClassName():string {
    return UserSchedule.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}

