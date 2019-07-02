/**
 * Name: SESAShiftStartTime domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Initial setup
*/

import { CLL } from './interfaces';

export class SESAShiftStartTime implements CLL {
  public name: string = "";
  public fullName: string = "";
  public get code():string { return this.name; };
  public get value():string { return this.fullName; };
  public set code(val:string) { this.name = val; };
  public set value(val:string) { this.fullName = val; };

  constructor(time?:number|string) {
    if(time != undefined) {
      this.name = String(time);
      // let numeric:number = Number(this.name);
      // let val:string = sprintf("%02d:%02d", numeric, 0);
      this.fullName = String(time);
    } else {
      this.name = this.name || "6";
      this.fullName = this.fullName || "6";
    }
  }

  public isOnSite():boolean {
    return;
  }
  public getClass():any {
    return SESAShiftStartTime;
  }
  public getClassName():string {
    return 'SESAShiftStartTime';
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };

}
