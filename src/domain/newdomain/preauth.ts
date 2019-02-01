/**
 * Name: PreAuth domain class
 * Vers: 1.0.1
 * Date: 2017-11-14
 * Auth: David Sargeant
 * Logs: 1.0.1 2017-11-14: Created and set up initial fields
 */

import { Log           } from '../config' ;
import { Jobsite       } from './jobsite' ;

export class PreAuth {
  public _id          :string = "";
  public _rev         :string = "";
  public site         :Jobsite    ;
  public site_number  :number;
  public site_id      :string = "";
  public preauth_date :string = "";
  public shift_date   :string = "";
  public period_date  :string = "";
  public period_number:number;
  public grid         :any[][] = [];

  constructor() {
    window['onsitePreAuth'] = PreAuth;
  }

  public static deserialize(doc:any, preauthToUse?:PreAuth) {
    let preauth = preauthToUse ? preauthToUse : new PreAuth();
    let keys = Object.keys(preauth);
    for(let key of keys) {
      preauth[key] = doc[key] || null;
    }
    return preauth;
  }

  public deserialize(doc:any) {
    return PreAuth.deserialize(doc, this);
  }

  public serialize() {
    let doc:any = {};
    let keys = Object.keys(this);
    for(let key of keys) {
      if(key === 'site') {

      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public getID() {
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

  public generateID() {
    let site = this.site;
    let period_number = this.period_number;
    // let date = this.preauth_date;
    let date = this.shift_date;
    let siteID = "";
    let id = "";
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
  };

}

