/**
 * Name: DPS domain class
 * Vers: 3.0.1
 * Date: 2018-01-23
 * Auth: David Sargeant
 * Logs: 3.0.1 2018-01-23: Added constructor function
 * Logs: 2.1.1 2017-09-28: Added some values
 */

// import { Jobsite, Employee, Shift, Schedule, PayrollPeriod } from './domain-classes' ;
// import { sprintf  } from 'sprintf-js' ;
import { Decimal } from '../config' ;
import { Log     } from '../config' ;
import { dec     } from '../config' ;
import { Jobsite } from './jobsite' ;

export class DPS {
  public sites            : Jobsite[] = []                       ;
  public days_in_month    : number         = 28                  ;
  public working_techs    : number         = 76                  ;
  public multiplier       : Decimal        = new dec("0.00075")  ;
  public fuel             : Decimal        = new dec("18899.16") ;
  public transportation   : Decimal        = new dec("15706.04") ;
  public travelers        : Decimal        = new dec("14149")    ;
  public imperial         : Decimal        = new dec("466.69")   ;
  public tx_mutual        : Decimal        = new dec("10729.15") ;
  public blue_cross       : Decimal        = new dec("19500")    ;
  public property         : Decimal        = new dec("325.85")   ;
  public internal_salaries: Decimal        = new dec("3270")     ;
  public internalPerTech  : Decimal        = new dec("0")        ;

  public get cost_modifier(): Decimal {return new dec("1").plus(new dec(this.working_techs).times(this.multiplier))};
  public set cost_modifier(value:Decimal) {Log.w("ERROR: cost_modifier is a read-only value.")};
  public get insurance():any {return {
    travelers  : this.travelers,
    imperial   : this.imperial,
    tx_mutual  : this.tx_mutual,
    blue_cross : this.blue_cross,
    property   : this.property,
  }};
  public get monthly():any {return {
    fuel: this.fuel,
    transportation:this.transportation,
    insurance: this.insurance,
  }};

  public get all():any { return {
    working_techs: this.working_techs,
    multiplier: this.multiplier,
    cost_modifier: this.cost_modifier,
    internal_salaries: this.internal_salaries,
    monthly: this.monthly,
  }};

  constructor(fuel?:Decimal, transportation?:Decimal, internal_salaries?:Decimal) {
    window['onsiteDPSClass'] = DPS;
    window['onsiteDPS'] = this;
    this.days_in_month = 28;
    this.working_techs = 76;
    this.sites = [];
    this.fuel = fuel ? fuel : new dec("18899.16");
    this.transportation = transportation ? transportation : new dec("15706.04");
    this.internal_salaries = internal_salaries ? internal_salaries : new dec("3270");
  }

  public getWorkingTechs():number {
    return this.working_techs;
  }

  public setWorkingTechs(value:number) {
    this.working_techs = value;
    return this.working_techs;
  }

  public getMultiplier():number {
    return this.multiplier.toNumber();
  }

  public getCostModifier():Decimal|number {
    return this.cost_modifier;
  }

  public getFuel():number {
    return this.fuel.toNumber();
  }

  public getTransporation():number {
    return this.all.transportation.toNumber();
  }

  public getInsurance():any {
    return {
      travelers : this.travelers.toNumber()  ,
      imperial  : this.imperial.toNumber()   ,
      tx_mutual : this.tx_mutual.toNumber()  ,
      blue_cross: this.blue_cross.toNumber() ,
      property  : this.property.toNumber()   ,
    }
  }

  public getInsuranceTotal():Decimal {
    let insurances = this.insurance;
    let total:Decimal = new dec(0);
    for(let co in insurances) {
      let insurance = insurances[co];
      total = total.plus(insurance);
    }
    return total;
  }

  public getInsuranceDaily():Decimal {
    let days = this.days_in_month;
    let total = this.getInsuranceTotal();
    let perDay = total.div(days);
    return perDay;
  }

  public getTransportationDaily():Decimal {
    let days = this.days_in_month;
    let perDay = this.fuel.div(days);
    return perDay;
  }

  public getFuelDaily():Decimal {
    let days = this.days_in_month;
    let perDay = this.transportation.div(days);
    return perDay;
  }

  public getInternalSalariesDaily():Decimal {
    let days = this.days_in_month;
    let mod = this.cost_modifier;
    let adjusted = this.internal_salaries.times(mod);
    // let perDay = adjusted.div(days);
    let perDay = adjusted;
    return perDay;
  }

  public static deserialize(doc:any) {
    Log.l("DPS.deserialize(): Deseerializing from:\n", doc);
    let dps = new DPS();
    dps.deserialize(doc);
    return dps;
  }

  public deserialize(doc:any) {
    Log.l("DPS.deserialize(): Deseerializing from:\n", doc);
    this.days_in_month     = Number(doc.days_in_month)      ;
    this.working_techs     = Number(doc.working_techs)      ;
    this.multiplier        = new dec(doc.multiplier)        ;
    this.fuel              = new dec(doc.fuel)              ;
    this.transportation    = new dec(doc.transportation)    ;
    this.travelers         = new dec(doc.travelers)         ;
    this.imperial          = new dec(doc.imperial)          ;
    this.tx_mutual         = new dec(doc.tx_mutual)         ;
    this.blue_cross        = new dec(doc.blue_cross)        ;
    this.property          = new dec(doc.property)          ;
    this.internal_salaries = new dec(doc.internal_salaries) ;
    Log.l("DPS.deserialize(): resulting DPS is:\n", this);
    return this;
  }

  public serialize() {
    let doc:any = {};
    doc.days_in_month     = this.days_in_month                ;
    doc.working_techs     = this.working_techs                ;
    doc.multiplier        = this.multiplier.toString()        ;
    doc.fuel              = this.fuel.toString()              ;
    doc.transportation    = this.transportation.toString()    ;
    doc.travelers         = this.travelers.toString()         ;
    doc.imperial          = this.imperial.toString()          ;
    doc.tx_mutual         = this.tx_mutual.toString()         ;
    doc.blue_cross        = this.blue_cross.toString()        ;
    doc.property          = this.property.toString()          ;
    doc.internal_salaries = this.internal_salaries.toString() ;
    return doc;
  }

  public getKeys():string[] {
    return Object.keys(this);
  }
  public isOnSite():boolean {
    return true;
  }
  public toJSON():any {
    return this.serialize();
  }
  public static fromJSON(doc:any):DPS {
    return new DPS().deserialize(doc);
  }
  public getClass():any {
    return DPS;
  }
  public static getClassName():string {
    return 'DPS';
  }
  public getClassName():string {
    return DPS.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  };

}
