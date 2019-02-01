/**
 * Name: Street domain class
 * Vers: 2.0.1
 * Date: 2018-09-17
 * Auth: David Sargeant
 * Logs: 2.0.1 2018-09-17: Revamped to now use StreetDoc
 * Logs: 1.2.1 2017-12-07: Changed toString method to check for empty street addresses
 */

export interface StreetDoc {
  street1  : string ;
  street2 ?: string ;
}

export class Street {
  public street:StreetDoc = {
    street1: "",
    street2: "",
  };
  public get street1():string { return this.street.street1; };
  public get street2():string { return this.street.street2; };
  public set street1(val:string) { this.street.street1 = val; };
  public set street2(val:string) { this.street.street2 = val; };

  constructor(inStreet1?:string, inStreet2?:string) {
    this.street1 = inStreet1 || '';
    this.street2 = inStreet2 || '';
  }

  public toString():string {
    let outString = '';
    if(this.street2 && this.street1) {
      outString = `${this.street1}\n${this.street2}`;
    } else if(this.street1) {
      outString = `${this.street1}`;
    }
    return outString;
  }

  public toJSON() {
    return this.street;
  }

  public isOnSite():boolean {
    return true;
  }

  public getClass():any {
    return Street;
  }
  public static getClassName():string {
    return 'Street';
  }
  public getClassName():string {
    return Street.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };
}
