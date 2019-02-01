/**
 * Name: Address domain class
 * Vers: 2.1.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 2.1.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 2.0.1 2018-09-17: Changed to use AddressDoc
 * Logs: 1.7.1 2018-08-27: Changed street1,street2 properties to get/set directly from/to street property
 * Logs: 1.6.1 2018-08-08: Added defaults to properties like street, city, state, country, zipcode
 * Logs: 1.5.1 2018-07-09: Added clone() method
 * Logs: 1.4.1 2017-12-07: Changed toString method to check for empty street addresses
 * Logs: 1.3.1 2017-11-14: Added country property
 * Logs: 1.2.2 2017-10-04: Fixed a zipcode initializing issue
 */

import { oo     } from '../config' ;
import { Street } from './street'  ;

export interface AddressDoc {
  street:Street;
  city:string;
  state:string;
  country:string;
  zipcode:string;
}

export class Address {
  public address:AddressDoc = {
    street: new Street(),
    city: "",
    state: "",
    country: "USA",
    zipcode: "",
  };

  public get street():Street { return this.address.street; };
  public set street(val:Street) { this.address.street = val; };
  public get street1():string { return this.street.street1; };
  public get street2():string { return this.street.street2; };
  public set street1(val:string) { this.street.street1 = val; };
  public set street2(val:string) { this.street.street2 = val; };
  public get city():string { return this.address.city; };
  public get state():string { return this.address.state; };
  public get country():string { return this.address.country; };
  public set city(val:string) { this.address.city = val; };
  public set state(val:string) { this.address.state = val; };
  public set country(val:string) { this.address.country = val; };
  public get zip():string {return this.zipcode;};
  public set zip(value:string) { this.zipcode = value;};
  public get zipcode():string { return this.address.zipcode; };
  public set zipcode(val:string) { this.address.zipcode = val; };

  constructor(inStreet?:Street, inCity?:string, inState?:string, inZip?:string) {
    if(inStreet) {
      this.street  = inStreet;
    }
    if(inCity) {
      this.city    = inCity;
    }
    if(inState) {
      this.state   = inState;
    }
    if(inZip) {
      this.zipcode = inZip;
    }
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

  public getKeys():string[] {
    let keys:string[] = Object.keys(this);
    return keys;
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON():any {
    return this.address;
  }
  public static fromJSON(doc:any):Address {
    let address:Address = new Address();
    address.address = oo.clone(doc);
    return address;
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
  };
}
