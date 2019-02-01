import { sprintf                                                                         } from 'sprintf-js'                 ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input, Output      } from '@angular/core'              ;
import { EventEmitter, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef        } from '@angular/core'              ;
import { Subscription                                                                    } from 'rxjs'          ;
import { ServerService                                                                   } from 'providers/server-service'   ;
import { DBService                                                                       } from 'providers/db-service'       ;
import { AuthService                                                                     } from 'providers/auth-service'     ;
import { AlertService                                                                    } from 'providers/alert-service'    ;
import { NumberService                                                                   } from 'providers/number-service'   ;
import { Log, Moment, moment, dec, Decimal, oo,          _matchCLL, _matchSite           } from 'domain/onsitexdomain'    ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'      ;
import { DPS                                                                             } from 'domain/onsitexdomain'      ;
import { OSData                                                                          } from 'providers/data-service'     ;
// import { PDFService                                                                      } from 'providers/pdf-service'      ;
import { OptionsComponent                                                                } from 'components/options/options' ;
import { DispatchService,                                                                } from 'providers/dispatch-service' ;
import { NotifyService                                                                   } from 'providers/notify-service'   ;

@Component({
  selector: 'dps-settings',
  templateUrl: 'dps-settings.html',
})
export class DPSSettingsComponent implements OnInit {
  @Input('target') target:ElementRef;
  @Output('updated') updated = new EventEmitter<boolean>();
  @Output('save') save = new EventEmitter<any>();
  @Output('cancel') cancel = new EventEmitter<any>();
  public inputElement    : ElementRef                  ;
  public title           : string     = "DPS Settings" ;
  public mode            : string     = 'modal'        ;
  public originalDPS     : any                         ;
  public internalSalaries: number     = 0              ;
  public cost_modifier_readonly:boolean = true         ;
  public cost_modifier_disabled:boolean = true         ;
  public cmSpinner: any = {
    "dps-settings-spinner": true,
    "dps-settings-spinner-readonly": this.cost_modifier_readonly,
    "dps-settings-spinner-disabled": this.cost_modifier_disabled,
  }

  public set dps(value:DPS)                       { this.data.dps = value;                                                                                              };
  public get dps():DPS                            { return this.data.dps;                                                                                               };
  public get days_in_month():number               { return this.data.dps.days_in_month;                                                                                 };
  public set days_in_month(value:number)          { this.data.dps.days_in_month=value;                                                                                  };
  public get working_techs():number               { return this.data.dps.working_techs;                                                                                 };
  public set working_techs(value:number)          { this.data.dps.working_techs = value;                                                                                };
  public get multiplier():number                  { return this.data.dps.multiplier.toNumber();                                                                         };
  public set multiplier(value:number)             { let val=value || 0 ;this.data.dps.multiplier = new dec(val);                                                        };
  public get cost_modifier():number               { return this.data.dps.cost_modifier.toNumber();                                                                      };
  public set cost_modifier(value:number)          { this.alert.showAlert("READ-ONLY", "This value is derived from the multiplier value. Please adjust it instead."); };
  public get internal_salaries():number           { return this.data.dps.internal_salaries.toNumber();                                                                  };
  public set internal_salaries(value:number)      { this.data.dps.internal_salaries =new dec(value);                                                                    };
  public get monthly_fuel():number                { return this.data.dps.fuel.toNumber();                                                                               };
  public set monthly_fuel(value:number)           { this.data.dps.fuel =new dec(value);                                                                                 };
  public get monthly_transportation():number      { return this.data.dps.transportation.toNumber();                                                                     };
  public set monthly_transportation(value:number) { this.data.dps.transportation =new dec(value);                                                                       };
  public get insurance_travelers():number         { return this.data.dps.travelers.toNumber();                                                                          };
  public set insurance_travelers(value:number)    { this.data.dps.travelers =new dec(value);                                                                            };
  public get insurance_imperial():number          { return this.data.dps.imperial.toNumber();                                                                           };
  public set insurance_imperial(value:number)     { this.data.dps.imperial =new dec(value);                                                                             };
  public get insurance_tx_mutual():number         { return this.data.dps.tx_mutual.toNumber();                                                                          };
  public set insurance_tx_mutual(value:number)    { this.data.dps.tx_mutual =new dec(value);                                                                            };
  public get insurance_blue_cross():number        { return this.data.dps.blue_cross.toNumber();                                                                         };
  public set insurance_blue_cross(value:number)   { this.data.dps.blue_cross =new dec(value);                                                                           };
  public get insurance_property():number          { return this.data.dps.property.toNumber();                                                                           };
  public set insurance_property(value:number)     { this.data.dps.property =new dec(value);                                                                             };
  public settings:any = {
    dps                   : this.dps,
    days_in_month         : this.days_in_month,
    working_techs         : this.working_techs,
    multiplier            : this.multiplier,
    cost_modifier         : this.cost_modifier,
    internal_salaries     : this.internal_salaries,
    monthly_fuel          : this.monthly_fuel,
    monthly_transportation: this.monthly_transportation,
    insurance_travelers   : this.insurance_travelers,
    insurance_imperial    : this.insurance_imperial,
    insurance_tx_mutual   : this.insurance_tx_mutual,
    insurance_blue_cross  : this.insurance_blue_cross,
    insurance_property    : this.insurance_property,
  }

  constructor(
    public application    : ApplicationRef    ,
    public changeDetector : ChangeDetectorRef ,
    public zone           : NgZone            ,
    public alert          : AlertService      ,
    public db             : DBService         ,
    public server         : ServerService     ,
    public data           : OSData            ,
    public dispatch       : DispatchService   ,
    public notify         : NotifyService     ,
  ) {
    window['onsitedpssettings'] = this;
  }

  ngOnInit() {
    Log.l("DPSSettingsComponent: ngOnInit() called");
    // if(this.navParams.get('mode') !== undefined) { this.mode = this.navParams.get('mode');}
    let dps = this.dps;
    this.originalDPS = dps.serialize();
    this.internalSalaries = this.internal_salaries;
  }

  ngOnDestroy() {
    Log.l("DPSSettingsComponent: ngOnDestroy() called");
    this.changeDetector.detach();
  }

  public refreshSettings() {
    let settings:any = {
      dps                   : this.dps,
      days_in_month         : this.days_in_month,
      working_techs         : this.working_techs,
      multiplier            : this.multiplier,
      cost_modifier         : this.cost_modifier,
      internal_salaries     : this.internal_salaries,
      monthly_fuel          : this.monthly_fuel,
      monthly_transportation: this.monthly_transportation,
      insurance_travelers   : this.insurance_travelers,
      insurance_imperial    : this.insurance_imperial,
      insurance_tx_mutual   : this.insurance_tx_mutual,
      insurance_blue_cross  : this.insurance_blue_cross,
      insurance_property    : this.insurance_property,
    };
    this.settings = settings;
    return this.settings;
  }

  public updateInternalSalaries() {
    let salaries = Number(this.internalSalaries);
    this.data.dps.internal_salaries = new dec(salaries);
    Log.l("updateInternalSalaries(): Updated to: ", salaries);
  }

  public dpsSettingsSave(event?:any) {
    let dpsDoc = this.dps.serialize();
    this.db.saveDPSSettings(dpsDoc).then(res => {
      Log.l("save(): DPS settings saved.");
      // this.viewCtrl.dismiss({data:this.dps});
      this.save.emit(event);
    }).catch(err => {
      Log.l("save(): DPS settings not saved!");
      Log.e(err);
      // this.notify.showAlert("ERROR", "DPS settings could not be saved.<br>\n<br>\n" + err.message);
      this.notify.addError("ERROR", `DPS Settings could not be saved: '${err.message}'`, 10000);
    });
  }

  public dpsSettingsCancel(event?:any) {
    // this.viewCtrl.dismiss();
    this.cancel.emit(event);
  }

  public whichElementHasFocus() {
    this.inputElement = new ElementRef(document.activeElement);
    Log.l("whichElementHasFocus(): Focused element is:\n", this.inputElement);
  }

  public moneyAdd(event:any, key:string) {
    Log.l("moneyAdd(): Event is:\n", event);
    let el = event.srcElement;
    let value = new dec(this[key]) || new dec(0);
    let newValue:Decimal = value.plus(0.05);
    // let newValue = Number(+value.toFixed(2)) + 0.05;
    value = newValue;
    this[key] = newValue;
    Log.l("moneyAdd(): value is now: ", value.toString());
    this.setDirty();
  }

  public moneySubtract(event:any, key:string) {
    Log.l("moneySubtract(): Event is:\n", event);
    let el = event.srcElement;
    let value = new dec(this[key]) || new dec(0);
    // .attributes['ng-reflect-model'].
    // let newValue = Number(+value.toFixed(2)) - 0.05;
    let newValue:Decimal = value.minus(0.05);
    value = newValue;
    this[key] = newValue;
    Log.l("moneySubtract(): value is now: ", value.toString());
    this.setDirty();
  }

  public setDirty(value?:boolean) {
    // let val = value ? value : true;
    // this.updated.emit(val);
    Log.l("setDirty(): Dirty set!");
    this.updated.emit(true);
  }

  public dpsSettingsRevert(event?:any) {
    Log.l("dpsSettingsRevert(): Reverting DPS settings to original....");
    let org:any = this.originalDPS;
    let dps:DPS = DPS.deserialize(org);
    this.data.dps = dps;
    // this.refreshSettings();
  }


}
