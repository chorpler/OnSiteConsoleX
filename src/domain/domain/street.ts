/**
 * Name: Street domain class
 * Vers: 1.3.1
 * Date: 2018-12-13
 * Auth: David Sargeant
 * Logs: 1.3.1 2018-12-13: Refactored imports to remove circular dependencies; added standard OnSite methods
 * Logs: 1.2.1 2017-12-07: Changed toString method to check for empty street addresses
 */

export class Street {
  public street1:string = "";
  public street2:string = "";

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
