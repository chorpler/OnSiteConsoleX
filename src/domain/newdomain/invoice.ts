/**
 * Name: Invoice domain class
 * Vers: 3.0.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 3.0.1 2018-12-13: Refactored to eliminate circular dependencies, got rid of NumberService, added default initializers
 * Logs: 2.4.1 2018-07-09: Added PO# property, and methods for getting totals
 * Logs: 2.3.1 2017-12-04: Added crew field
 * Logs: 2.3.0 2017-11-12: Added _id and _rev
 * Logs: 2.2.0: Added customer_name and unitData properties
 * Logs: 2.1.0: Added unitCounts object
 * Logs: 2.0.0: First serious attempt, but a modification with huge breaking changes even though they were never used before, so …
 */

// import { Decimal       } from '../config'                ;
// import { sprintf       } from 'sprintf-js'               ;
// import { isMoment      } from '../config'                ;
// import { dec           } from '../config'                ;
// import { NumberService } from 'providers/number-service' ;
import { Log           } from '../config'                ;
import { moment        } from '../config'                ;
import { Moment        } from '../config'                ;
import { Jobsite       } from './jobsite'                ;
import { Address       } from './address'                ;

export class Invoice {
  public _id               : string            = "";
  public _rev              : string            = "";
  public type              : string            = "KN";
  public date              : Moment            = moment()                   ;
  public period_start      : string            = ""                         ;
  public invoice_number    : string            = ""                         ;
  public get number()      : string            { return this.invoice_number ;       }
  public set number(val    : string)           { this.invoice_number        = val ; }
  public customer          : Jobsite           ;
  public customer_name     : string            = ""                         ;
  public customer_number   : string            = ""                         ;
  public address           : Address           = new Address()              ;
  public grid              : any[][]           = []                         ;
  public summary_grid      : any[][]           = []                         ;
  public site              : Jobsite           ;
  public site_number       : number            = 0;
  public site_name         : string            = "";
  public po_number         : string            = "";
  public account_number    : string            = "";
  public total_hours_billed: number            = 0 ;
  public total_unit_hours  : number            = 0 ;
  public total_unit_billed : number            = 0 ;
  public total_astext      : string            = "";
  public total_billed      : number            = 0;
  public tech_count        : number            = 0;
  public unit_counts       : any                  ;
  public unitData          : any                  ;
  public crew              : string = ""       ;
  public billing_rate      : number            = 65;
  // public numServ           : any               = new NumberService();

  // public total:BigNumber = BigNumber(0);

  constructor(doc?:any) {
    if(doc != undefined) {
      return this.deserialize(doc);
    }
  }

  public serialize():any {
    let doc:any = {};
    if(!doc._id) {
      this._id = this.generateInvoiceID();
      doc._id = this._id;
    }
    let keys = this.getKeys();
    for(let key of keys) {
      if(key === 'site') {
      } else if(key === 'site_number') {
        if(this.site_number !== undefined && this.site_number !== null) {
          doc.site_number = this.site_number;
        } else if(this.site && this.site instanceof Jobsite) {
          doc.site_number = this.site.site_number;
        } else {
          doc.site_number = 1;
        }
      } else if(key === 'date') {
        doc[key] = this.date.format("YYYY-MM-DD");
      } else {
        doc[key] = this[key];
      }
    }
    Log.l("Invoice.serialize(): Returning doc:\n", doc);
    return doc;
  }

  public static deserialize(doc:any, invc?:Invoice) {
    let keys = Object.keys(doc);
    let invoice = invc ? invc : new Invoice();
    for(let key of keys) {
      if(key === 'date') {
        invoice.date = moment(doc.date, "YYYY-MM-DD");
      } else {
        invoice[key] = doc[key];
      }
    }
    Log.l("Invoice.deserialize(): Returning invoice:\n", invoice);
    return invoice;
  }

  public deserialize(doc:any) {
    return Invoice.deserialize(doc, this);
  }

  public readFromDoc(doc:any) {
    return Invoice.deserialize(doc, this);
  }

  public getGridRow(value:number) {
    let grid = this.grid;
    if(value >= grid.length) {
      return null;
    } else {
      return grid[value];
    }
  }

  public getInvoiceNumber():string {
    return this.invoice_number;
  }

  public setInvoiceNumber(val:number|string) {
    let invoice_number = String(val);
    this.invoice_number = invoice_number;
    return this.invoice_number;
  }

  public getInvoiceID():string {
    if(this._id) {
      return this._id;
    } else {
      let id = this.generateInvoiceID();
      this._id = id;
      return this._id;
    }
  }

  public generateInvoiceID():string {
    let ts = moment().format("YYYYMMDD.HHmmss");
    // let id = `${this.site_name}_${this.period_start}}_${ts}`;
    // let id = `${this.site_name}_${this.invoice_number}`;
    let siteID = this.site.getSiteID();
    let siteNumber = this.site.getSiteNumber();
    let id = `${siteID}_${this.invoice_number}`;
    return id;
  }

  public getTotalHours():number {
    let hours:number = 0;
    for(let row of this.grid) {
      let hour:number = Number(row[4]);
      if(!isNaN(hour)) {
        hours += hour;
      }
    }
    this.total_hours_billed = hours;
    return hours;
  }

  public getTechCount():number {
    let count:number = 0;
    let techCounts:any = {};
    for(let row of this.grid) {
      let tech = row[1];
      techCounts[tech] = 1;
    }
    let keys = Object.keys(techCounts);
    count = keys.length;
    this.tech_count = count;
    return count;
  }

  public getUnitCount():number {
    let count:number = 0;
    let unitCounts:any = {};
    for(let row of this.grid) {
      let unit = row[2];
      unitCounts[unit] = 1;
    }
    let keys = Object.keys(unitCounts);
    count = keys.length;
    this.total_unit_billed = count;
    return count;
  }

  public getTotalBilled():number {
    let hours:number = 0;
    for(let row of this.grid) {
      let hour:number = Number(row[4]);
      if(!isNaN(hour)) {
        hours += hour;
      }
    }
    let billing:number = Number(this.billing_rate);
    let total:number = billing * hours;
    this.total_billed = total;
    return total;
  }

  public getTotalBilledAsText(numServ:any):string {
    let total:number = this.getTotalBilled();
    let text:string = String(total);
    if(numServ && numServ.toCurrency) {
      text = numServ.toCurrency(total);
    }
    this.total_astext = text;
    return text;
  }

  public getKeys():string[] {
    return Object.keys(this);
  }
  public toJSON() {
    return this.serialize();
  }
  public isOnSite():boolean {
    return true;
  }
  public getClass():any {
    return Invoice;
  }
  public static getClassName():string {
    return 'Invoice';
  }
  public getClassName():string {
    return Invoice.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
