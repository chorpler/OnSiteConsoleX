import { Log, moment, Moment, oo                     } from 'domain/onsitexdomain'      ;
import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core'             ;
import { Input, Output, ViewChild, NgZone            } from '@angular/core'             ;
import { OSData                                      } from 'providers/data-service'    ;
import { Preferences                                 } from 'providers/preferences'     ;
import { StorageService                              } from 'providers/storage-service' ;
import { SelectItem                                  } from 'primeng/api'               ;

@Component({
  selector: 'options-generic',
  templateUrl: 'options-generic.html'
})
export class OptionsGenericComponent implements OnInit,OnDestroy {
  @Input('type') optionType:string = 'payroll';
  @Output('close') close = new EventEmitter<any>();
  @Output('onCancel') onCancel = new EventEmitter<any>();
  @Output('onSave') onSave = new EventEmitter<any>();
  public showAllSites:boolean = false;
  public firstPeriodDate:Moment;
  public tableResizeModes:SelectItem[] = [
    { label: 'fit'   , value: 'fit'    },
    { label: 'expand', value: 'expand' },
  ];
  public isVisible:boolean = true;
  public dataReady:boolean = false;
  // public static PREFS:any = new Preferences();
  // public get prefs():any { return OptionsGenericComponent.PREFS;};
  // public set prefs(opts:any) { OptionsGenericComponent.PREFS = opts; };

  constructor(
    public storage : StorageService ,
    public data    : OSData         ,
    public prefs   : Preferences    ,
  ) {
    window['consoleoptionsgeneric'] = this;
  }

  ngOnInit() {
    Log.l("OptionsGenericComponent: ngOnInit() called...");
    this.firstPeriodDate = this.updateStartDate();
    this.dataReady = true;
  }

  ngOnDestroy() {
    Log.l("OptionsGenericComponent: ngOnDestroy() called...");
  }

  public cancel(event:any) {
    Log.l("OptionsGeneric: cancel() called")
    this.onCancel.emit(this.prefs);
  }

  public save(event:any) {
    Log.l("OptionsGeneric: save() called");
    this.onSave.emit(this.prefs);
  }

  public updateStartDate(evt?:any):Moment {
    let count = 4;
    if(this.optionType === 'techshiftreports') {
      count = this.prefs.CONSOLE.techshiftreports.payroll_periods;
    } else if(this.optionType === 'hbpreauth') {
      count = this.prefs.CONSOLE.hbpreauth.payroll_periods;
    } else if(this.optionType === 'payroll') {
      count = this.prefs.CONSOLE.payroll.payroll_periods;
    }
    this.firstPeriodDate = this.data.getStartDateForPayrollPeriodCount(count);
    return this.firstPeriodDate;
  }
}
