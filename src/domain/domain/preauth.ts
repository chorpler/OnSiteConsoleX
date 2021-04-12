/**
 * Name: PreAuth domain class
 * Vers: 2.0.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-12-13: Refactored code; refactored imports; added standard OnSite methods
 * Logs: 1.0.1 2017-11-14: Created and set up initial fields
 */

import { Log           } from '../config'        ;
// import { Moment        } from '../config'        ;
// import { moment        } from '../config'        ;
// import { isMoment      } from '../config'        ;
// import { oo            } from '../config'        ;
import { Jobsite       } from './jobsite'        ;
// import { PayrollPeriod } from './payroll-period' ;

export class PreAuth {
  public _id          :string  = "";
  public _rev         :string  = "";
  public site         :Jobsite     ;
  public site_number  :number  = 0 ;
  public site_id      :string  = "";
  public preauth_date :string  = "";
  public shift_date   :string  = "";
  public period_date  :string  = "";
  public period_number:number  = 0 ;
  public grid         :any[][] = [];

  constructor(doc?:any) {
    // window['onsitePreAuth'] = PreAuth;
    if(doc != undefined) {
      return this.deserialize(doc);
    }
  }

  public static deserialize(doc:any, preauthToUse?:PreAuth):PreAuth {
    let preauth = preauthToUse ? preauthToUse : new PreAuth();
    let keys = Object.keys(preauth);
    for(let key of keys) {
      preauth[key] = doc[key] || null;
    }
    return preauth;
  }

  public deserialize(doc:any):PreAuth {
    return PreAuth.deserialize(doc, this);
  }

  public serialize():any {
    let doc:any = {};
    let keys:string[] = this.getKeys();
    for(let key of keys) {
      if(key === 'site') {

      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public getID():string {
    if(this._id) {
      return this._id;
    } else {
      let id = this.generateID();
      if(id) {
        this._id = id;
      }
      return id;
    }
  }

  public generateID():string {
    let site:Jobsite = this.site;
    let period_number:number = this.period_number;
    // let date = this.preauth_date;
    let date:string = this.shift_date;
    let siteID:string = "";
    let id:string = "";
    if(site instanceof Jobsite) {
      siteID = site.getSiteID();
    } else {
      Log.w("PreAuth.generateID(): Can't generate ID because 'site' is not a Jobsite object!");
      return null;
    }
    id = `${siteID}_${date}`;
    return id;
  }

  // public getTitle() {
  //   let site = this.site;
  //   let title = "";
  //   if(site instanceof Jobsite) {
  //     let siteName = site.getSiteSelectName();

  //   }
  //   // let start = moment(this.period_date, "YYYY-MM-DD");
  //   // let end   = moment(start).add(6, 'days');

  // }
  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):PreAuth {
    return PreAuth.deserialize(doc);
  }
  public getClass():any {
    return PreAuth;
  }
  public static getClassName():string {
    return 'PreAuth';
  }
  public getClassName():string {
    return PreAuth.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

}

