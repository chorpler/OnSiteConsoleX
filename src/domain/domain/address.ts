/**
 * Name: Address domain class
 * Vers: 1.7.2
 * Date: 2019-07-18
 * Auth: David Sargeant
 * Logs: 1.7.2 2019-07-18: Minor corrections to fix TSLint errors
 * Logs: 1.7.1 2018-08-27: Changed street1,street2 properties to get/set directly from/to street property
 * Logs: 1.6.1 2018-08-08: Added defaults to properties like street, city, state, country, zipcode
 * Logs: 1.5.1 2018-07-09: Added clone() method
 * Logs: 1.4.1 2017-12-07: Changed toString method to check for empty street addresses
 * Logs: 1.3.1 2017-11-14: Added country property
 * Logs: 1.2.2 2017-10-04: Fixed a zipcode initializing issue
 */

import { Street } from './street';

export class Address {
  public street:Street = new Street();
  public get street1():string { if(this.street) { return this.street.street1; } else { this.street = new Street(); return this.street.street1; } }
  public get street2():string { if(this.street) { return this.street.street2; } else { this.street = new Street(); return this.street.street2; } }
  public set street1(val:string) { if(this.street) { this.street.street1 = val; } else { this.street = new Street(); this.street.street1 = val; }  }
  public set street2(val:string) { if(this.street) { this.street.street2 = val; } else { this.street = new Street(); this.street.street2 = val; }  }
  public city:string = "";
  public state:string = "";
  public country:string = "USA";
  public get zip():string {return this.zipcode;}
  public set zip(value:string) { this.zipcode = value;}
  public zipcode:string = "";

  constructor(inStreet?:Street, inCity?:string, inState?:string, inZip?:string) {
    this.street  = inStreet || new Street();
    this.city    = inCity   || '';
    this.state   = inState  || '';
    this.country = "USA"         ;
    this.zipcode = inZip    || '';
  }

  public clone():Address {
    let address:Address = new Address();
    address.street.street1 = this.street.street1 + "";
    address.street.street2 = this.street.street2 + "";
    address.city           = this.city           + "";
    address.state          = this.state          + "";
    address.zipcode        = this.zipcode        + "";
    return address;
    // let myKeys:Array<string> = Object.keys(this);
    // for(let key of myKeys) {
    //   address[key] = this[key] + "";
    // }
  }

  public toString():string {
    let outStreet = this.street.toString();
    let outString = '';
    if(outStreet) {
      outString = `${outStreet}`;
      // \n${this.city} ${this.state} ${this.zipcode}`;
    }
    if(this.city || this.state || this.zipcode) {
      outString += '\n';
    }
    if(this.city && this.state && this.zipcode) {
      outString += `${this.city} ${this.state} ${this.zipcode}`;
    } else if(this.city && this.state) {
      outString += `${this.city} ${this.state}`;
    } else if(this.city) {
      outString += this.city;
    } else if(this.state) {
      outString += this.state;
    } else if(this.zipcode) {
      outString += this.zipcode;
    }
    return outString;
  }

  public getClass():any {
    return Address;
  }
  public static getClassName():string {
    return 'Address';
  }
  public getClassName():string {
    return Address.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}
