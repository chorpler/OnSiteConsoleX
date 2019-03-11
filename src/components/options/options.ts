import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core'              ;
import { Input, Output, ViewChild, NgZone            } from '@angular/core'              ;
import { Log, moment, Moment, oo                     } from 'domain/onsitexdomain'       ;
import { OSData                                      } from 'providers/data-service'     ;
import { Preferences                                 } from 'providers/preferences'      ;
import { SmartAudio                                  } from 'providers/smart-audio'      ;
import { InvoiceService                              } from 'providers/invoice-service'  ;
import { NotifyService                               } from 'providers/notify-service'   ;
import { DispatchService                             } from 'providers/dispatch-service' ;
import { Dropdown                                    } from 'primeng/dropdown'           ;
import { SelectItem                                  } from 'primeng/api'                ;

@Component({
  selector: 'options',
  templateUrl: 'options.html'
})
export class OptionsComponent implements OnInit,OnDestroy {
  @Input('type') optionType:string = 'global';
  @Output('close') close = new EventEmitter<any>();
  @Output('onCancel') onCancel = new EventEmitter<any>();
  @Output('onSave') onSave = new EventEmitter<any>();
  public showAllSites: boolean = false;
  // public static PREFS:any = new Preferences();
  // public get prefs():any { return OptionsComponent.PREFS;};
  // public set prefs(opts:any) { OptionsComponent.PREFS = opts; };
  public keaneInvoiceNumber:number = -1;
  public halliburtonInvoiceNumber:number = -1;
  public weekdayMenu:SelectItem[] = [];
  public spinner1On:boolean = false;
  public spinner2On:boolean = false;
  public lastPeriod:string = "";
  public firstPeriodDate:Moment;
  public exampleDate:Moment = moment("2000-01-01T06:00:00.012-06:00");
  public payPeriodsOptions:number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
  ];
  public payPeriods:number = 8;
  public payPeriodsSelect:SelectItem[] = [];
  public payPeriodDate:string = "";
  public payPeriodString:string = "";
  public tabIndex:number = 0;
  public currentPage:string = "";
  public showCurrentPage:boolean = false;
  public isVisible:boolean = true;
  public prevComp:any;

  constructor(
    public zone           : NgZone          ,
    public data           : OSData          ,
    public audio          : SmartAudio      ,
    public invoiceService : InvoiceService  ,
    public notify         : NotifyService   ,
    public dispatch       : DispatchService ,
    public prefs          : Preferences     ,
  ) {
    window['consoleoptions']  = this;
    window['consoleoptions2'] = this;
    this.prevComp = window['p'];
    window['p'] = this;
  }

  ngOnInit() {
    Log.l("OptionsComponent: ngOnInit() called...");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    } else {
      this.runAppNotReady();
    }
  }

  ngOnDestroy() {
    Log.l("OptionsComponent: ngOnDestroy() called...");
    if(this.prevComp) {
      window['p'] = this.prevComp;
    }
  }

  public async runAppNotReady() {
    try {
      let res:any = await this.runWhenReady();
      return res;
    } catch(err) {
      Log.l(`runAppNotReady(): Error loading options!`);
      Log.e(err);
      throw err;
    }
  }

  public async runWhenReady() {
    try {
      this.spinner1On = true;
      this.spinner2On = true;
      this.createMenus();
      let now = moment();
      // let payPeriods =
      let currentPPStart:Moment = this.data.getPayrollPeriodStartDate(now);
      this.createDropdowns();
      let PPToShow:number = this.prefs.CONSOLE.global.payroll_periods;
      this.firstPeriodDate = this.data.getStartDateForPayrollPeriodCount(PPToShow);
      Log.l(`Options: pay period goes back to date '${this.firstPeriodDate.format("YYYY-MM-DD")}'`);
      if(this.optionType === 'global') {
        let res:any = await this.getKeaneInvoiceNumber();
        this.spinner2On = false;
        res = await this.getHalliburtonInvoiceNumber();
        this.spinner1On = false;
        return res;
      } else {
        this.spinner1On = false;
        this.spinner2On = false;
        return true;
      }
    } catch(err) {
      Log.l(`OptionsComponent.runWhenReady(): Error during initialization!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error showing options: ${err.message}`, 5000);
      // throw err;
    }
  }

  public createMenus() {
    let dayList:SelectItem[] = [];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let count = days.length;
    for(let i = 0; i < count; i++) {
      let item = { label: days[i], value: i };
      dayList.push(item);
    }
    this.weekdayMenu = dayList;
  }

  public createDropdowns() {
    let payPeriodDropdowns:SelectItem[] = [];
    for(let pd of this.payPeriodsOptions) {
      let item:SelectItem = {
        label: pd + "",
        value: pd,
      }
      payPeriodDropdowns.push(item);
    }
    this.payPeriodsSelect = payPeriodDropdowns;
  }

  public cancel(event:any) {
    Log.l("Options: cancel() called")
    this.onCancel.emit(this.prefs);
  }

  public save(event:any) {
    Log.l("Options: save() called");
    this.onSave.emit(this.prefs);
  }

  public async getKeaneInvoiceNumber() {
    try {
      if(!this.data.isAppReady()) {
        return -1;
      }
      let keaneDoc = await this.invoiceService.getCurrentInvoiceNumber('KN');
      if(keaneDoc && keaneDoc.invoice) {
        this.keaneInvoiceNumber = Number(keaneDoc.invoice);
        return this.keaneInvoiceNumber;
      }
    } catch(err) {
      throw err;
    }
  }

  public async saveKeaneInvoiceNumber(event?:any) {
    try {
      if(!this.data.isAppReady()) {
        this.notify.addError("ERROR", "Not logged in yet", 3000);
        return;
      }
      Log.l("saveKeaneInvoiceNumber(): Event is:\n", event);
      let num = this.keaneInvoiceNumber;
      let res:any = await this.invoiceService.saveKeaneInvoiceNumber(num);
      this.notify.addSuccess("SUCCESS", `Set Keane invoice number to '${num}'.`, 3000);
    } catch(err) {
      Log.l(`saveKeaneInvoiceNumber(): Error saving Keane invoice number!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error setting Keane invoice number: '${err.message}'`, 10000);
    }
  }

  public async refreshKeaneInvoiceNumber(event?:any) {
    try {
      if(!this.data.isAppReady()) {
        this.notify.addError("ERROR", "Not logged in yet", 3000);
        return;
      }
      Log.l("refreshKeaneInvoiceNumber(): Event is:\n", event);
      this.spinner2On = true;
      let res:any = await this.getKeaneInvoiceNumber();
      Log.l("refreshKeaneInvoiceNumber(): Successfully retrieved Keane invoice number!");
      this.spinner2On = false;
      this.notify.addSuccess("SUCCESS", `Got Keane invoice number: '${res}'.`, 3000);
      return res;
    } catch(err) {
      this.spinner2On = false;
      Log.l("refreshKeaneInvoiceNumber(): Error retrieving Keane invoice number!");
      Log.e(err);
      this.notify.addError("ERROR", `Error getting Keane invoice number: '${err.message}'`, 10000);
    }
  }

  public async getHalliburtonInvoiceNumber() {
    try {
      if(!this.data.isAppReady()) {
        return -1;
      }
      let hbDoc = await this.invoiceService.getCurrentInvoiceNumber('HB');
      if(hbDoc && hbDoc.invoice) {
        this.halliburtonInvoiceNumber = Number(hbDoc.invoice);
        return this.halliburtonInvoiceNumber;
      }
    } catch(err) {
      throw err;
    }
  }

  public async saveHalliburtonInvoiceNumber(event?:any) {
    try {
      if(!this.data.isAppReady()) {
        this.notify.addError("ERROR", "Not logged in yet", 3000);
        return;
      }
      Log.l("saveHalliburtonInvoiceNumber(): Event is:\n", event);
      let num = this.halliburtonInvoiceNumber;
      let res:any = await this.invoiceService.saveHalliburtonInvoiceNumber(num);
      this.notify.addSuccess("SUCCESS", `Set Halliburton invoice number to '${num}'.`, 3000);
    } catch(err) {
      Log.l(`saveHalliburtonInvoiceNumber(): Error saving Halliburton invoice number!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error setting Halliburton invoice number: '${err.message}'`, 10000);
    }
  }

  public async refreshHalliburtonInvoiceNumber(event?:any) {
    try {
      if(!this.data.isAppReady()) {
        this.notify.addError("ERROR", "Not logged in yet", 3000);
        return;
      }
      Log.l("refreshHalliburtonInvoiceNumber(): Event is:\n", event);
      this.spinner1On = true;
      let res:any = await this.getHalliburtonInvoiceNumber();
      Log.l("refreshHalliburtonInvoiceNumber(): Successfully retrieved Halliburton invoice number!");
      this.spinner1On = false;
      this.notify.addSuccess("SUCCESS", `Got Halliburton invoice number: '${res}'.`, 3000);
      return res;
    } catch(err) {
      this.spinner1On = false;
      Log.l("refreshHalliburtonInvoiceNumber(): Error retrieving Halliburton invoice number!");
      Log.e(err);
      this.notify.addError("ERROR", `Error getting Halliburton invoice number: '${err.message}'`, 10000);
    }
  }

  public changePayrollPeriods(evt?:any) {
    if(!this.data.isAppReady()) {
      this.notify.addError("ERROR", "Not logged in yet", 3000);
      return;
    }
    Log.l(`changePayrollPeriods(): Creating ${this.prefs.CONSOLE.global.payroll_periods} payroll periods...`);
    let weeksBack:number = this.prefs.CONSOLE.global.payroll_periods;
    this.firstPeriodDate = this.data.getStartDateForPayrollPeriodCount(weeksBack);
    this.data.createPayrollPeriods(weeksBack);
  }

  public soundToggled(evt?:Event) {
    let play:boolean = this.prefs.isAudioEnabled();
    if(play) {
      this.audio.playRandomSound('sweet');
    }
  }

  public resetDateFormat(type:string, evt?:MouseEvent) {
    if(type === 'long') {
      this.prefs.CONSOLE.global.dateFormatLong  = "ddd DD MMM YYYY";
    } else if(type === 'med') {
      this.prefs.CONSOLE.global.dateFormatMed   = "DD MMM YYYY";
    } else if(type === 'short') {
      this.prefs.CONSOLE.global.dateFormatShort = "MMM DD";
    } else {
    }
  }

  public resetTimeFormat(evt?:MouseEvent) {
    this.prefs.CONSOLE.global.timeFormat = "hh:mm A";
    if(this.prefs.is24Hour()) {
      this.prefs.CONSOLE.global.timeFormat = "HH:mm";
    }
  }

  public resetDateTimeFormat(evt?:MouseEvent) {
    this.prefs.CONSOLE.global.dateTimeFormat = "YYYY-MM-DD HH:mm";
  }

}
