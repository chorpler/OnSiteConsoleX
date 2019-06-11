import { DPSReportComponent, DPSCalculationsComponent,                        } from 'components'                    ;
import { DPSAncillaryCalculationsComponent, DPSDailySummaryComponent          } from 'components'                    ;
import { sprintf                                                              } from 'sprintf-js'                    ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef          } from '@angular/core'                 ;
import { ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular'                 ;
import { Subscription                                                         } from 'rxjs'             ;
import { ServerService                                                        } from 'providers/server-service'      ;
import { DBService                                                            } from 'providers/db-service'          ;
import { AuthService                                                          } from 'providers/auth-service'        ;
import { AlertService                                                         } from 'providers/alert-service'       ;
import { DispatchService                                                      } from 'providers/dispatch-service'    ;
import { NumberService                                                        } from 'providers/number-service'      ;
import { ScriptService                                                        } from 'providers/script-service'      ;
import { Log, Moment, moment, oo, dec, Decimal, _matchCLL, _matchSite,        } from 'domain/onsitexdomain'          ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift,        } from 'domain/onsitexdomain'          ;
import { Schedule, Invoice, DPS,                                              } from 'domain/onsitexdomain'          ;
import { OSData                                                               } from 'providers/data-service'        ;
import { OptionsComponent                                                     } from 'components/options/options'    ;
import { MenuItem, SelectItem,                                                } from 'primeng/primeng'               ;
import { OverlayPanel, Spinner,                                               } from 'primeng/primeng'               ;
import { Table                                                                } from 'primeng/table'                 ;
import { Command, KeyCommandService                                           } from 'providers/key-command-service' ;
import { NotifyService                                                        } from 'providers/notify-service'      ;

declare var self;

enum calcRows {
  payroll           = 14,
  lodging           = 15,
  perdiem           = 16,
  expenses          = 17,
  vacation          = 18,
  travel            = 19,
  training          = 20,
  standby           = 21,
  transportation    = 22,
  fuel              = 23,
  insurance         = 24,
  internal_salaries = 25,
  total_expenses    = 26,
}

enum rowval {
  tech           = 0,
  payroll        = 1,
  lodging        = 2,
  perDiem        = 3,
  miscExps       = 4,
  vacation       = 5,
  travel         = 6,
  training       = 7,
  standby        = 8,
  transportation = 9,
  fuel           = 10,
  insurance      = 11,
  office         = 12,
  billing        = 13,
  expenses       = 14,
  profit         = 15,
  status         = 16,
}

enum rotation2sequence {
  "FIRST WEEK" = 'A',
  "CONTN WEEK" = 'B',
  "FINAL WEEK" = 'C',
  "DAYS OFF"   = 'D',
  "UNASSIGNED" = 'X',
}

@IonicPage({ name: "DPS" })
@Component({
  selector: 'page-dps-main',
  templateUrl: 'dps-main.html',
})
export class DPSMainPage implements OnInit,OnDestroy {
  @ViewChild('dpsReportComponent'       ) dpsReportComponent       : DPSReportComponent        ;
  @ViewChild('dpsCalculationsComponent' ) dpsCalculationsComponent : DPSCalculationsComponent        ;
  @ViewChild('dpsAncillaryComponent'    ) dpsAncillaryComponent    : DPSAncillaryCalculationsComponent        ;
  @ViewChild('dpsDailySummaryComponent' ) dpsDailySummaryComponent : DPSDailySummaryComponent        ;
  // @ViewChild('dpsSettingsComponent'     ) dpsSettingsComponent     : DPSSettingsComponent        ;
  @ViewChild('settingsOverlay'          ) settingsOverlay          : OverlayPanel;
  @ViewChild('actualTargetElement'      ) actualTargetElement      : ElementRef ;
  @ViewChild('calcPrintArea'            ) calcPrintArea            : ElementRef ;
  @ViewChild('DPSCalcTable'             ) DPSCalcTable             : ElementRef ;
  @ViewChild('DPSDailySummaryTable'     ) DPSDailySummaryTable     : ElementRef ;
  @ViewChild('dpsCalculations'          ) dpsCalculations          : ElementRef ;
  @ViewChild('dpsSettings'              ) dpsSettings              : ElementRef ;
  @ViewChild('printArea'                ) printArea                : ElementRef ;
  @ViewChild('menu'                     ) menu                     : ElementRef ;
  @ViewChild('tieredMenu'               ) tieredMenu               : ElementRef ;
  @ViewChild('btn'                      ) btn                      : ElementRef ;
  @ViewChild('tieredMenuButton'         ) tieredMenuButton         : ElementRef ;
  @ViewChild('costModifierSpinner'      ) costModifierSpinner      : Spinner    ;
  public inputElement     : ElementRef                              ;

  /* DPS Main vars */
  public title            : string                      = "DPS"     ;
  public mode             : string                      = "page"    ;
  public tabs             : Array<any>                  = []        ;
  public modal            : any                                     ;
  public tabIndex         : number                      = 0         ;
  public activateSettings : boolean                     = false     ;
  public actualTarget     : ElementRef                                     ;
  public keySubscription  : Subscription                 ;
  // public hotkey1          : any                         ;
  // public hotkey2          : any                         ;
  // public hotkey1keys      : any                         ;
  // public hotkey1Fn        : any                         ;
  // public hotkey2keys      : any                         ;
  // public hotkey2Fn        : any                         ;
  public originalDPS      : any                         ;
  public spinnerID        : any                         ;
  public settingsVisible  : boolean                     = false     ;
  public dataReady        : boolean                     = false     ;

  /* DPS Report vars */
  public reportData       : any                        ;
  public chartType        : string = "PieChart"        ;
  public rowval           : any    = rowval            ;
  public calcRows         : any    = calcRows          ;
  public rotation2sequence: any    = rotation2sequence ;



  /* DPS Calculations vars */
  public DPSCalcTitle     : string                      = "DPS Calcs";
  public DPSCalcsDataGrid : Array<Array<any>>           = []        ;
  public techs            : Array<Employee>             = []        ;
  public sites            : Array<Jobsite>              = []        ;
  public schedules        : Array<Schedule>             = []        ;
  public schedule         : Schedule                                ;
  public periods          : Array<PayrollPeriod>        = []        ;
  public period           : PayrollPeriod                           ;
  public ePeriod          : Map<Employee,PayrollPeriod> = new Map() ;
  public allShifts        : Array<Shift>                = []        ;
  public periodSelectReady: boolean                     = false     ;
  // public dps              : DPS                         = OSData.dps;
  // public dps              : DPS                         = this.data.dps;
  public periodList       : SelectItem[]                = []        ;

  /* DPS Ancillary Calculations vars */
  public dpsAncillaryData:any                                       ;

  /* DPS Daily Summary vars */
  public DSTitle       : string                      = "DPS Daily Summary";
  public tableMode     : string                      = 'summary'          ;
  public calcMode      : string                      = "schedule"         ;
  public selectedPeriod: PayrollPeriod                                    ;
  public shift         : Shift                                            ;
  public siteSummary1  : Map<Jobsite,any>             = new Map()         ;
  public siteSummary2  : Map<Jobsite,any>            = new Map()          ;
  public DSsiteTotals  : any                                              ;
  public DSsiteTotals1 : any                                              ;
  public DSsiteTotals2 : any                                              ;
  public DSsiteGrid    : any                                              ;
  public DSsiteGrid1   : any                                              ;
  public DSsiteGrid2   : any                                              ;
  // public period        : PayrollPeriod                                    ;
  // public periods       : Array<PayrollPeriod>        = []                 ;
  public periodMenu    : Array<SelectItem>           = []                 ;
  public menuItems     : Array<MenuItem>             = []                 ;
  // public ePeriod       : Map<Employee,PayrollPeriod> = new Map()           ;
  public eShift        : Map<Employee,Shift>         = new Map()          ;
  // public sites         : Array<Jobsite>              = []                 ;
  // public techs         : Array<Employee>             = []                 ;
  public summaryDate   : Moment                                           ;
  public workingTechs  :number                      = 0                   ;
  public workingTechs1 :number                      = 0                   ;
  public workingTechs2 :number                      = 0                   ;
  // public get dps()     :DPS { return this.data.dps;}                         ;
  public eRot          : Map<Employee,string>        = new Map()          ;
  public DSGrid        : Array<Array<any>>           = []                 ;
  public grid1         : Array<Array<any>>           = []                 ;
  public grid2         : Array<Array<any>>           = []                 ;
  public popupMode     : boolean                     = true               ;
  public rowNumber     : Array<any>                  = []                 ;

  /* DPS Settings vars */
  public updatedSettings       :boolean              = false              ;
  public originalSettings      :any                                       ;
  public soDismissable         :boolean              = false              ;
  public soShowClose           :boolean              = false              ;
  public settingsOpenEvent     :any                                       ;
  public cost_modifier_readonly:boolean              = true               ;
  public cost_modifier_disabled:boolean              = true               ;
  // public cost_modifier_readonly:string               = "readonly"         ;
  // public cost_modifier_disabled:string               = "disabled"         ;
  /* Getters and Setters */
  public settings:any;
  public get dps():DPS                       { return this.data.getDPS();                                         };
  public set dps(value:DPS)                  { this.data.dps = value;                                        };
  public get days_in_month():number          { return this.data.dps.days_in_month;                           };
  public set days_in_month(value:number)     { this.data.dps.days_in_month = value;                          };
  public get multiplier():number             { return this.data.dps.multiplier.toNumber();                   };
  public set multiplier(value:number)        { let val = value || 0; this.data.dps.multiplier = new dec(val);};
  public get cost_modifier():number          { return this.data.dps.cost_modifier.toNumber();                };
  public set cost_modifier(value:number)     { this.data.dps.cost_modifier = new dec(value);                 };
  public get internal_salaries():number      { return this.data.dps.internal_salaries.toNumber();            };
  public set internal_salaries(value:number) { this.data.dps.internal_salaries = new dec(value);             };

  /* UI and SCSS vars */
  public cmSpinner        : any = {
    "dps-settings-spinner": true,
    "dps-settings-spinner-readonly": this.cost_modifier_readonly,
    "dps-settings-spinner-disabled": this.cost_modifier_disabled,
  }

  constructor(
    public application    : ApplicationRef    ,
    public changeDetector : ChangeDetectorRef ,
    public zone           : NgZone            ,
    public scripts        : ScriptService     ,
    public viewCtrl       : ViewController    ,
    public navCtrl        : NavController     ,
    public navParams      : NavParams         ,
    public modalCtrl      : ModalController   ,
    public db             : DBService         ,
    public server         : ServerService     ,
    public alert          : AlertService      ,
    public data           : OSData            ,
    public dispatch       : DispatchService   ,
    public keyService     : KeyCommandService ,
    public notify         : NotifyService     ,
  ) {
    self = this;
    window['onsitedpsmain']  = this;
    window['onsitedpsmain2'] = this;
    window['p'] = this;
    window['rotation2sequence'] = rotation2sequence;
    window['Decimal'] = dec;
    this.settings = {
      get dps():DPS { return this.data.getDPS(); },
      get days_in_month():number { return this.data.dps.days_in_month; },
      set days_in_month(value:number) { this.data.dps.days_in_month = value; },
      get working_techs():number { return this.data.dps.working_techs; },
      set working_techs(value:number) { this.data.dps.working_techs = value; },
      get multiplier():number { return this.data.dps.multiplier.toNumber(); },
      set multiplier(value:number) { let val = value || 0; this.data.dps.multiplier = new dec(val) },
      get cost_modifier():number { return this.data.dps.cost_modifier.toNumber(); },
      get internal_salaries():number { return this.data.dps.internal_salaries.toNumber(); },
      set internal_salaries(value:number) { this.data.dps.internal_salaries = new dec(value); },
      get monthly_fuel():number { return this.data.dps.fuel.toNumber(); },
      set monthly_fuel(value:number) { this.data.dps.fuel = new dec(value); },
      get monthly_transportation():number { return this.data.dps.transportation.toNumber(); },
      set monthly_transportation(value:number) { this.data.dps.transportation = new dec(value); },
      get insurance_travelers():number { return this.data.dps.travelers.toNumber(); },
      set insurance_travelers(value:number) { this.data.dps.travelers = new dec(value);},
      get insurance_imperial():number { return this.data.dps.imperial.toNumber(); },
      set insurance_imperial(value:number) { this.data.dps.imperial = new dec(value); },
      get insurance_tx_mutual():number { return this.data.dps.tx_mutual.toNumber(); },
      set insurance_tx_mutual(value:number) { this.data.dps.tx_mutual = new dec(value); },
      get insurance_blue_cross():number { return this.data.dps.blue_cross.toNumber(); },
      set insurance_blue_cross(value:number) { this.data.dps.blue_cross = new dec(value); },
      get insurance_property():number { return this.data.dps.property.toNumber(); },
      set insurance_property(value:number) { this.data.dps.property = new dec(value); },
      set cost_modifier(value:number) {
        // self.alert.showAlert("READ-ONLY", "This value is derived from the multiplier value. Please adjust it instead.");
      },
    };


  }

  ngOnInit() {
    Log.l('DPSMainPage: ngOnInit() called');
    // this.data.appReady().then(res => {
    //   this.runWhenReady();
    // });
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("DPSMainPage: ngOnDestroy() called");
    this.updateView('detach');
    this.cancelSubscriptions();
  }

  public updateView(param?:string) {
    let action: string = param || 'update';
    let cd: any = this.changeDetector;
    let viewDead: boolean = cd.destroyed;
    if (!viewDead) {
      if (param === 'update') {
        this.changeDetector.detectChanges();
      } else if (param === 'detach') {
        this.changeDetector.detach();
      } else {
        this.changeDetector.detectChanges();
      }
    }
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command: Command) => {
      Log.l("DPSMainPage: received a KeyService event with command:\n", command);
      switch (command.name) {
        case "DPSMainPage.whichElementHasFocus": this.whichElementHasFocus(); break;
        case "DPSMainPage.openDPSSettings": this.showDPSSettings(command.ev); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public async runWhenReady() {
    try {
      this.actualTarget = this.actualTargetElement;
      // this.generateEmployeePeriodMap();
      // DPS Calculations
      // this.runDPSCalculations();
      setTimeout(async () => {
        this.initializeSubscriptions();
        Log.l(`DPSMainPage.runWhenReady(): About to load 'charts' script ...`);
        let out:any = await this.scripts.loadScript("charts");
        Log.l(`DPSMainPage.runWhenReady(): Done loading 'charts' script. Now continuing.`);
        this.setupInterface();
        this.dataReady = true;
        this.setupData();
        this.setPageLoaded();
      }, 500);
    } catch(err) {
      Log.l(`DPSMainPage.runWhenReady(): Error initializing page`);
      Log.e(err);
      throw err;
    }
  }

  public setPageLoaded() {
    Log.l(`setPageLoaded(): Page loaded.`);
    this.data.currentlyOpeningPage = false;
  }

  public setupInterface() {
    this.initializeTabs();
    this.initializePayrollPeriodsMenu();
    this.createTieredMenu();
    this.backupDPSSettings();
  }

  public setupData() {
    this.generateDPSCalculations(this.period);
    this.generateDPSReportData();
    this.generateAncillaryData();
  }

  public initializeTabs() {
    this.tabs = [
      { item: 0, header: "DPS Report"                 , icon: "fa fa-table" , selected: true , content: "DPS Report"                 },
      { item: 1, header: "DPS Calculations"           , icon: "fa fa-table" , selected: false, content: "DPS Calculations"           },
      { item: 2, header: "DPS Ancillary Calculations" , icon: "fa fa-table" , selected: false, content: "DPS Ancillary Calculations" },
      { item: 3, header: "DPS Daily Summary"          , icon: "fa fa-table" , selected: false, content: "DPS Daily Summary"          },
      // { item: 4, header: "DPS Settings"               , icon: "fa-cog"   , selected: false, content: "DPS Settings"               },
    ];
  }

  public initializePayrollPeriodsMenu() {
    // let periods = this.data.createPayrollPeriods();
    let periods:PayrollPeriod[] = this.data.getData('periods');
    if(!(periods && periods.length)) {
      periods = this.data.createPayrollPeriods();
    }
    let selectitems:SelectItem[] = [];
    for(let period of periods) {
      let name = period.getPeriodName("DD MMM");
      let item:SelectItem = { label: name, value: period };
      selectitems.push(item);
    }
    this.periods = periods;
    this.period = periods[0];
    this.periodList = selectitems;
  }

  public createTieredMenu() {
    let menu:MenuItem[] = [];
    for(let period of this.periods) {
      let label = period.start_date.format("MMM DD YYYY") + " — " + period.end_date.format("MMM DD YYYY");
      let value = period;
      let shifts = period.getPayrollShifts();
      let menuItemArray:Array<any> = [];
      let item:MenuItem = {'label': label, 'items': menuItemArray, 'icon': ''};
      for(let shift of shifts) {
        let date = shift.getShiftDate();
        let strDate = date.format("MMM DD YYYY");
        let subitem:MenuItem = {label: strDate, icon: '', command: (event) => {
          this.chooseShift(shift, period);
          this.updateTieredMenu(strDate);
        }};
        // let subitem:MenuItem = {'label': strDate, 'command': (event) => { this.chooseShift(event)}};
        menuItemArray.push(subitem);
      }
      menuItemArray = menuItemArray.reverse();
      menu.push(item);
    }
    let toggler = {
      label: "Toggle Detail Mode",
      icon: '',
      command: (event) => {
        this.toggleDetailMode(event);
      }
    };
    menu.push(toggler);
    toggler = {
      label: 'Toggle Calculation Mode',
      icon: '',
      command: (event) => {
        this.toggleCalculationMode(event);
      }
    };
    menu.push(toggler);
    this.menuItems = menu;
  }

  public decimalize(value:number) {
    return new dec(value);
  }

  public updateTieredMenu(strDate:string) {
    for(let submenu of this.menuItems) {
      if(submenu && submenu.items && submenu.items.length) {
        submenu.icon = '';
        for(let item of submenu.items) {
          if(!Array.isArray(item)) {
            if(item.label === strDate) {
              item.icon = "fa-check";
              submenu.icon = "fa-check";
            } else {
              item.icon = '';
            }
          }
        }
      }
    }
    let tempMenu = this.menuItems.slice(0);
    this.menuItems = tempMenu;
  }

  // public openDPSPage(pageName:string) {
  //   this.navCtrl.setRoot(pageName);
  // }

  // public openDPSCalculations() {
  //   this.navCtrl.setRoot('DPS Calculations');
  // }

  public disabledSpinnerInput(event:any) {
    let cm = this.settings.cost_modifier;
    Log.l(`disabledSpinnerInput(): cost_modifier and event are ${cm}:\n`, event);
    this.notify.addWarn("READ-ONLY", "This value is calculated automatically and cannot be changed by hand.", 3000);
    // let j:Spinner = new Spinner();
    // let spinner:Spinner = event.source()
  }

  public showDPSSettings(event?:any, targetElement?:any) {
    let evt = event || {};
    Log.l("openDPSSetting(): Event received was:\n", evt);
    let target = targetElement ? targetElement : this.actualTarget.nativeElement;
    this.settingsVisible = true;
    // let modal = this.modalCtrl.create('DPS Settings', {mode: 'modal'}, {cssClass: 'modal-dps-settings'});
    // modal.onDidDismiss(data => {
    //   Log.l("DPS Settings modal: dismissed!");
    //   if(data) {
    //     Log.l("Data is:\n", data);
    //   }
    // });
    // this.modal = modal;
    // modal.present();
    // this.tabIndex = 4;
    // this.settingsOverlay.show(event, target);
  }

  public toggleDPSSettings(event?:any, targetElement?:ElementRef) {
    let target = targetElement || event.target || this.actualTarget.nativeElement;
    Log.l("toggleDPSSettings(): Event and target are:\n", event);
    Log.l(target);
    // if(!this.settingsOverlay.visible) {
    //   this.settingsOpenEvent = event;
    // }
    // this.settingsOverlay.toggle(event, target);
    // this.activateSettings = !this.activateSettings;
    this.settingsVisible = !this.settingsVisible;
  }

  public hideDPSSettings(event?:any) {
    // this.settingsOverlay.hide();
    this.settingsVisible = false;
  }

  public backupDPSSettings() {
    let org = this.dps.serialize();
    this.originalDPS = org;
  }

  public revertDPSSettings() {
    Log.l("revertDPSSettings(): Reverting DPS settings to original....");
    let org:any = this.originalDPS;
    let dps:DPS = DPS.deserialize(org);
    // this.data.dps = dps;
    this.dps = dps;
  }

  public async dpsSettingsRevert() {
    try {
      let confirm = await this.alert.showConfirmYesNo("UNDO CHANGES", "Do you want to undo any changes made to DPS Settings?");
      if(confirm) {
        this.revertDPSSettings();
      } else {
        Log.l("dpsSettingsRevert(): User canceled revert.");
      }
    } catch(err) {
      Log.l(`dpsSettingsRevert(): Error while reverting!`);
      Log.e(err);
      throw err;
    }
  }

  public dpsSettingsCancel(event?:any) {
    Log.l("dpsSettingsCancel(): User clicked cancel.");
    if(this.updatedSettings) {
      this.alert.showConfirmYesNo("CANCEL?", "Do you want to cancel? You will lose any unsaved changes.").then(res => {
        if(!res) {
          Log.l("dpsSettingsCancel(): User canceled cancel.");
        } else {
          this.revertDPSSettings();
          this.settingsOverlay.hide();
        }
      }).catch(err => {
        Log.l("dpsSettingsCancel(): Error confirming cancel!");
        Log.e(err);
      });
    } else {
      this.settingsOverlay.hide();
    }
    // this.revertDPSSettings();
    // this.settingsOverlay.hide();
  }

  public dpsSettingsSave(event?:any) {
    // let dpsDoc = this.settings.dps.serialize();
    // this.db.saveDPSSettings(dpsDoc).then(res => {
    //   Log.l("saveSettings(): DPS settings saved.");
    //   this.settingsOverlay.hide();
    // }).catch(err => {
    //   this.settingsOverlay.hide();
    //   Log.l("saveSettings(): DPS settings not saved!");
    //   Log.e(err);
    //   this.alert.showAlert("ERROR", "DPS settings could not be saved.<br>\n<br>\n" + err.message);
    // });
    Log.l("dpsSettingsSave(): User clicked save.");
    let dps = this.dps.serialize();
    let user = this.data.getUser();
    if(!user.isLevel1Manager()) {
      Log.l("dpsSettingsSave(): Attempt to save DPS settings made by a non-manager.");
      this.alert.showAlert("ERROR", "You must be a Level 1 Manager to save DPS settings.")
    } else {
      Log.l("dpsSettingsSave(): Attempting to save DPS settings...");
      this.server.saveDPSSettings(dps).then(res => {
        this.updatedSettings = false;
        Log.l("dpsSettingsSave(): DPS settings saved.");
        this.settingsOverlay.hide();
      }).catch(err => {
        Log.l("dpsSettingsSave(): Error saving DPS settings!");
        Log.e(err);
        this.alert.showAlert("ERROR", "DPS settings could not be saved.<br>\n<br>\n" + err.message);
      });
    }
  }

  public switchTab(event:any) {
    this.tabChange(event);
  }

  public tabChange(event:any) {
    let originalEvent = event.originalEvent;
    let idx = event.index;
    let tab = this.tabs[idx];
    let hdr = tab.header;
    for(let tabinfo of this.tabs) {
      tabinfo.selected = false;
    }
    this.tabs[idx].selected = true;

    Log.l(`tabChange(): Switched to tab ${idx}, aka '${hdr}'.`);
    this.tabIndex = idx;
    if(idx === 0) {
      /* DPS Report */

    } else if(idx === 1) {
      /* DPS Calculations */
      setTimeout(() => {
        this.dpsCalculationsComponent.changeDetector.detectChanges();
      }, 1000);
    } else if(idx === 2) {
      /* DPS Ancillary Calculations */
      setTimeout(() => {
        this.dpsAncillaryComponent.changeDetector.detectChanges();
      }, 1000);

    } else if(idx === 3) {
      /* DPS Daily Summary */

      this.runDPSDailySummaryCalculations();
    } else if(idx === 4) {
      /* DPS Settings */

    }
  }

  public saveSettings(event?:any) {
    let dpsDoc = this.dps.serialize();
    this.db.saveDPSSettings(dpsDoc).then(res => {
      Log.l("saveSettings(): DPS settings saved.");
      // this.viewCtrl.dismiss({data:this.dps});
    }).catch(err => {
      Log.l("saveSettings(): DPS settings not saved!");
      Log.e(err);
      this.alert.showAlert("ERROR", "DPS settings could not be saved.<br>\n<br>\n" + err.message);
    });
  }

  /* DPS Calculations start */
  public async runDPSCalculations():Promise<boolean> {
    // this.dps = this.data.dps;
    let spinnerID:string;
    try {
      this.periods = this.data.createPayrollPeriods();
      this.period = this.periods[0];
      this.periodSelectReady = true;
      spinnerID = await this.alert.showSpinnerPromise('Gathering DPS data...');
      // setTimeout(() =>  {
        // try {
          this.generateDPSCalculations(this.period);
          this.alert.hideSpinner(spinnerID);
          this.dataReady = true;
        // } catch(err) {
          // this.alert.hideSpinner(spinnerID);
          // Log.l("runWhenReady(): Error generating DPS calculations.");
          // Log.e(err);
          // this.alert.showAlert("ERROR", "Error generating DPS calculations:<br>\n<br>\n" + err.message);
        // }
      // }, 1000);
      
      return true;
    } catch(err) {
      // Log.l("runWhenReady(): Error generating DPS calculations.");
      Log.l(`runDPSCalculations(): Error generating DPS calculations`);
      Log.e(err);
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      await this.alert.showErrorMessage("ERROR", "Error generating DPS calculations", err);
      // this.alert.showAlert("ERROR", "Error generating DPS calculations:<br>\n<br>\n" + err.message);
      // Log.e(err);
      // throw err;
    }
  }

  public generateEmployeePeriodMap(period?:PayrollPeriod) {
    let p = period ? period : this.period;
    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.data.getFullClient(a.client);
      let cliB = this.data.getFullClient(b.client);
      let locA = this.data.getFullLocation(a.location);
      let locB = this.data.getFullLocation(b.location);
      let lidA = this.data.getFullLocID(a.locID);
      let lidB = this.data.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    }
    let _sortReports = (a:Report, b:Report) => {
      return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
    };

    let eperiod = this.data.createEmployeePeriodMap(period);
    this.ePeriod = eperiod;
    return eperiod;
  }

  public async generateDPSCalculations(period:PayrollPeriod):Promise<any[][]>{
    let spinnerID:string;
    try {
      spinnerID = await this.alert.showSpinnerPromise("Calculating DPS for selected payroll period …");
      let ep = this.generateEmployeePeriodMap(period);
      let datagrid:any[][] = this.generateDPSCalculationsGridData();
      // this.dataGrid = datagrid;
      this.DPSCalcsDataGrid = datagrid;
      await this.alert.hideSpinnerPromise(spinnerID);
      return datagrid;
    } catch(err) {
      Log.l(`generateDPSCalculations(): Error generating DPS calculations`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public generateDPSReportData() {
    let grid = this.DPSCalcsDataGrid;

    let reportData:Array<Array<string|number>> = [
      ['Type', 'Percentage'],
      ['Profit', ],
      ['Expenses', ],
    ];
    let profit   = new dec(0);
    let expenses = new dec(0);
    let revenue  = new dec(0);
    for(let row of grid) {
      expenses = expenses.plus(row[26]);
      revenue  = revenue.plus(row[27]);
      profit   = profit.plus(row[28]);
      // expenses += row[26].toNumber();
      // revenue  += row[27].toNumber();
      // profit   += row[28].toNumber();
    }
    reportData[1][1] = Number(profit.toFixed(2));
    reportData[2][1] = Number(expenses.toFixed(2));
    let calcProfit = revenue.minus(expenses);
    Log.l(`generateDPSReportData(): expenses: ${expenses.toFixed(2)}, revenue: ${revenue.toFixed(2)}, profit: ${profit.toFixed(2)}, calculatedProfit: ${calcProfit.toFixed(2)}.`);
    this.reportData = reportData;
    return this.reportData;
  }

  public generateAncillaryData() {
    let ancillary:any = {};
    let ep = this.ePeriod;
    let calcGrid = this.DPSCalcsDataGrid;
    let periodBillableHours:number = 0;
    let periodExpenses:number = 0;
    for(let entry of ep) {
      let tech = entry[0];
      let period = entry[1];
      // let techTotal:number = period.getNormalHours();
      let techTotal:number = period.getBillableHours();
      periodBillableHours += techTotal;
    }
    Log.l("generateAncillaryData(): Billable hours calculated at: ", periodBillableHours);
    let hourlyRate = 65;
    let grossRevenue = new dec(periodBillableHours).times(hourlyRate);
    let internalSalariesPerTech = this.data.dps.internalPerTech;
    ancillary.billableHours = periodBillableHours;
    ancillary.grossRevenue = grossRevenue;

    /* ancillary.runCalcGridSums() */
    let costs = new dec(0);
    let profit = new dec(0);
    let egp = new dec(0);
    for(let row of calcGrid) {
      let expenses:Decimal = row[26];
      costs = costs.plus(expenses);
    }
    ancillary.techCosts = costs;
    profit = grossRevenue.minus(costs);
    ancillary.estProfit = profit;

    if(!profit.eq(0)) {
      egp = profit.dividedBy(grossRevenue);
    }
    ancillary.estPercentDP = egp;
    /* end */

    /* ancillary.generateAncillaryDetailGrid() */
    let mTransportation = new dec(this.data.dps.transportation);
    let mFuel = new dec(this.data.dps.fuel);
    let mInsurance = new dec(0);
    let insurances = this.data.dps.insurance;
    for(let ins in insurances) {
      let insurance = insurances[ins];
      let value = new dec(insurance);
      mInsurance = mInsurance.plus(value);
    }
    // let daysInMonth = this.data.dps.days_in_month;
    let daysInMonth = 30;

    let expenses          = new dec(0) ;
    let vacation          = new dec(0) ;
    let training          = new dec(0) ;
    let travel            = new dec(0) ;
    let standby           = new dec(0) ;
    let transportation    = new dec(0) ;
    let fuel              = new dec(0) ;
    let insurance         = new dec(0) ;
    let perdiem           = new dec(0) ;
    let internal_salaries = new dec(0) ;
    let lodging           = new dec(0) ;
    let payroll           = new dec(0) ;

    let calcRows = this.calcRows;

    for(let row of calcGrid) {
      expenses          = expenses.plus(row[calcRows.expenses])                   ;
      vacation          = vacation.plus(row[calcRows.vacation])                   ;
      training          = training.plus(row[calcRows.training])                   ;
      travel            = travel.plus(row[calcRows.travel])                       ;
      standby           = standby.plus(row[calcRows.standby])                     ;
      transportation    = transportation.plus(row[calcRows.transportation])       ;
      fuel              = fuel.plus(row[calcRows.fuel])                           ;
      insurance         = insurance.plus(row[calcRows.insurance])                 ;
      perdiem           = perdiem.plus(row[calcRows.perdiem])                     ;
      internal_salaries = internal_salaries.plus(row[calcRows.internal_salaries]) ;
      lodging           = lodging.plus(row[calcRows.lodging])                     ;
      payroll           = payroll.plus(row[calcRows.payroll])                     ;
    }

    let mTransportationPercent  = new dec(transportation).div(mTransportation)              ;
    let mFuelPercent            = new dec(fuel).div(mFuel)                                  ;
    let mInsurancePercent       = new dec(insurance).div(mInsurance)                        ;
    let mTransportationCoverage = new dec(mTransportationPercent).div(7).times(daysInMonth) ;
    let mFuelCoverage           = new dec(mFuelPercent).div(7).times(daysInMonth)           ;
    let mInsuranceCoverage      = new dec(mInsurancePercent).div(7).times(daysInMonth)      ;

    let grid = [
      ["Technician Misc Expns"               , expenses          , 0                      , 0                       ] ,
      ["Technician Vacation"                 , vacation          , 0                      , 0                       ] ,
      ["Technician Training"                 , training          , 0                      , 0                       ] ,
      ["Technician Travel"                   , travel            , 0                      , 0                       ] ,
      ["Technician Non-Billable Standby Hrs" , standby           , 0                      , 0                       ] ,
      ["Technician Transportation"           , transportation    , mTransportationPercent , mTransportationCoverage ] ,
      ["Technician Fuel"                     , fuel              , mFuelPercent           , mFuelCoverage           ] ,
      ["Technician Insurance"                , insurance         , mInsurancePercent      , mInsuranceCoverage      ] ,
      ["Technician PerDiem"                  , perdiem           , 0                      , 0                       ] ,
      ["Internal Payroll"                    , internal_salaries , 0                      , 0                       ] ,
      ["Technician Lodging"                  , lodging           , 0                      , 0                       ] ,
      ["Technician Payroll"                  , payroll           , 0                      , 0                       ] ,
    ];
    ancillary.ancillaryGrid2 = grid;

    let totalTechCosts = new dec(0);
    for(let row of grid) {
      totalTechCosts = totalTechCosts.plus(row[1]);
    }

    ancillary.totalTechCosts = totalTechCosts;

    let total                = new dec(grossRevenue)   ;
    let miscTotalPercent     = new dec(expenses).div(total) ;
    let vacationTotalPercent = new dec(vacation).div(total) ;
    let trainingTotalPercent = new dec(training).div(total) ;
    let travelTotalPercent   = new dec(travel).div(total)   ;

    let grid3 = [
      ["Misc. Expenses", expenses, total, miscTotalPercent     ],
      ["Vacation"      , vacation, total, vacationTotalPercent ],
      ["Training"      , training, total, trainingTotalPercent ],
      ["Travel"        , travel  , total, travelTotalPercent   ],
    ]
    ancillary.ancillaryGrid3 = grid3;

    let col1Total = new dec(0);
    let col2Total = new dec(0);
    let col3Total = new dec(0);
    for(let row of grid3) {
      col1Total = col1Total.plus(row[1]);
    }

    let grid3percent = col1Total.div(total);

    let grid3total = [
      "Misc/Vac/Trng/Trvl", col1Total, total, grid3percent
    ];

    ancillary.ancillaryGrid3Totals = grid3total;

    // let profit = new dec(this.estProfit);

    let grid4 = [
      ["Gross Profit"       , profit            , total , profit.div(total)            ] ,
      ["Misc/Vac/Trng/Trvl" , col1Total         , total , grid3percent                 ] ,
      ["SESA Standby"       , standby           , total , standby.div(total)           ] ,
      ["Transportation"     , transportation    , total , transportation.div(total)    ] ,
      ["Fuel"               , fuel              , total , fuel.div(total)              ] ,
      ["Insurance"          , insurance         , total , insurance.div(total)         ] ,
      ["Per Diem"           , perdiem           , total , perdiem.div(total)           ] ,
      ["Office Payroll"     , internal_salaries , total , internal_salaries.div(total) ] ,
      ["Lodging"            , lodging           , total , lodging.div(total)           ] ,
      ["Tech Payroll"       , payroll           , total , payroll.div(total)           ] ,
    ];

    ancillary.ancillaryGrid4 = grid4;

    let chartData:Array<Array<any>> = [
      ["Type", "Percentage"],
    ];
    for(let row of grid4) {
      let rowNumber = new dec(row[3]).times(total).toNumber();
      let newrow = [row[0], rowNumber];
      chartData.push(newrow);
    }
    let slices = {
      0: { offset: 0.5 },
    };
    let chartOptions = {
      title: "Distribution of Gross Revenues with Costs Detail",
      is3D: true,
      slices: slices,
    }

    ancillary.chartOptions = chartOptions;
    ancillary.slices = slices;
    ancillary.chartData = chartData;
    /* end */

    this.dpsAncillaryData = ancillary;
    Log.l("generateAncillaryData(): Ancillary data generated is:\n", ancillary);
    return ancillary;
  }

  public countWorkingTechs() {
    let e = this.ePeriod;
    let working_techs = 0;
    for(let entry of e) {
      let tech:Employee = entry[0];
      let period:PayrollPeriod = entry[1];
      // let hours = period.getNormalHours();
      let hours = period.getBillableHours();
      if(hours > 0) {
        working_techs++;
      }
    }
    return working_techs;
  }

  public generateDPSCalculationsGridData():any[] {
    let techs = this.techs.slice(0);
    let e:Map<Employee,PayrollPeriod> = this.ePeriod;
    let grid = [];
    let i = 0;
    let dps:DPS = this.data.getDPS();
    let working_techs:number = this.dps.getWorkingTechs();
    // let working_techs = this.dps.getWorkingTechs();
    // let working_techs = this.countWorkingTechs();
    // this.dps.setWorkingTechs(working_techs);
    let transportation:Decimal = this.dps.getTransportationDaily();
    let fuel:Decimal = this.dps.getFuelDaily();
    let insurance:Decimal = this.dps.getInsuranceDaily();
    let internal:Decimal = this.dps.getInternalSalariesDaily();
    let transportationPerTech:Decimal = transportation.div(working_techs);
    let fuelPerTech:Decimal = fuel.div(working_techs);
    let insurancePerTech:Decimal = insurance.div(working_techs);
    let internalPerTech:Decimal = internal.div(working_techs);

    for(let entry of e) {
      let tech:Employee = entry[0];
      let period:PayrollPeriod = entry[1];
      i++;
      let pr = tech.payRate || 0;
      let rate = new dec(pr);
      // rate = rate.plus(pr);
      let site = this.data.getSiteForTech(tech);
      let pDate = moment(period.start_date);
      let rotation = this.data.getTechRotationForDate(tech, pDate);
      let rotSeq   = this.data.getRotationSequence(rotation);
      let billing_rate = new dec(site.billing_rate);
      let lodging = new dec(site.lodging_rate);
      let per_diem = new dec(site.per_diem_rate);
      let shifts = period.getPayrollShifts();
      for(let shift of shifts) {
        // let costs = new dec(0);
        let date = shift.getShiftDate();
        let strDay = date.format("ddd");
        let hours = shift.getPayrollHours();
        let billable_hours = shift.getBillableHours();
        let hrsTravel = shift.getTravelHours();
        let hrsTraining = shift.getTrainingHours();
        let hrsVacation = shift.getVacationHours();
        let hrsStandby = shift.getStandbyHours();
        let hrsSick = shift.getSickHours();
        let travel:Decimal, training:Decimal, vacation:Decimal, standby:Decimal, sick:Decimal, payroll:Decimal;
        travel   = rate.times(hrsTravel)   ;
        training = rate.times(hrsTraining) ;
        vacation = rate.times(hrsVacation) ;
        standby  = rate.times(hrsStandby)  ;
        sick     = rate.times(hrsSick)     ;
        payroll  = rate.times(hours)       ;
        let tpt:Decimal, fpt:Decimal, ipt:Decimal, spt:Decimal, ldg:Decimal, pdm:Decimal;
        if(!hours) {
          tpt = new dec(0);
          fpt = new dec(0);
          ipt = new dec(0);
          spt = new dec(0);
          ldg = new dec(0);
          pdm = new dec(0);
        } else {
          tpt = transportationPerTech;
          fpt = fuelPerTech;
          ipt = insurancePerTech;
          spt = internalPerTech;
          ldg = lodging;
          pdm = per_diem;
        }

        let costs:Decimal = payroll.plus(lodging).plus(per_diem).plus(vacation).plus(travel).plus(training).plus(standby).plus(sick).plus(transportationPerTech).plus(fuelPerTech).plus(insurancePerTech).plus(internalPerTech);
        let revenue:Decimal = billing_rate.times(billable_hours);
        let profit:Decimal = revenue.minus(costs);
        let profitPercent:Decimal = profit.div(revenue).times(100);
        let row:Array<any> = [
          /* 0  */ i,
          /* 1  */ shift.getShiftNumber(),
          /* 2  */ strDay,
          /* 3  */ tech.payRate,
          /* 4  */ site.getScheduleName(),
          /* 5  */ site.client.name,
          /* 6  */ site.location.name,
          /* 7  */ site.locID.name,
          /* 8  */ tech.getTechName(),
          /* 9  */ site.locID.fullName,
          /* 10 */ site.client.fullName,
          /* 11 */ date.format("MMM DD YYYY"),
          /* 12 */ rotSeq,
          /* 13 */ billable_hours,
          /* 14 */ payroll, //13
          /* 15 */ ldg,
          /* 16 */ pdm,
          /* 17    new dec(0), */
          /* 17 */ 0,
          /* 18 */ vacation,
          /* 19 */ travel,
          /* 20 */ training,
          /* 21 */ standby, //20
          /* 22 */ tpt,
          /* 23 */ fpt,
          /* 24 */ ipt,
          /* 25 */ spt,
          /* 26 */ costs,
          /* 27 */ revenue,
          /* 28 */ profit,
          /* 29 */ profitPercent,
        ];

        Object.defineProperty(row, 26, {
          get: function() {
            let offset = 12;
            let i = 26;
            let cost = row[14].plus(row[15]).plus(row[16]).plus(new dec(row[17])).plus(row[18]).plus(row[19]).plus(row[20]).plus(row[21]).plus(row[22]).plus(row[23]).plus(row[24]).plus(row[25]);
            return cost;
          }
        });

        Object.defineProperty(row, 28, {
          get: function() {
            let profit = row[27].minus(row[26]);
            return profit;
          }
        });

        Object.defineProperty(row, 29, {
          get: function() {
            let percent;
            if(row[27].eq(0)) {
              percent = new dec(0);
            } else {
              percent = row[28].div(row[27]).times(100);
            }
            return percent;
          }
        });

        grid.push(row);
      }
    }
    Log.l("generateDPSCalculationsGridData(): Created grid:\n", grid);
    return grid;
  }

  public async updatePeriod(period:PayrollPeriod):Promise<any> {
    let spinnerID:string;
    try {
      Log.l("updatePeriod(): Period changed, attempting to update ....\n", period);
      // this.dataReady = false;
      spinnerID = await this.alert.showSpinner("Setting period to " + period.getPeriodName("MMM DD") + " …");
      await this.data.delay(500);
      let res = await this.performPeriodCalculations(period);
      await this.alert.hideSpinner(spinnerID);
      Log.l("updatePeriod(): Period successfully updated!");
      await this.alert.hideSpinner(spinnerID);
      // await this.data.delay(1000);
      this.dispatch.updatePeriod(period);
          // setTimeout(() => {
          //   this.dispatch.updatePeriod(period);
          // }, 1000);
      //   }).catch(err => {
      //     Log.l("updatePeriod(): Error updating period.");
      //     Log.e(err);
      //     this.alert.hideSpinner(this.spinnerID);
      //     this.alert.showAlert("ERROR", "Error updating payroll period:<br>\n<br>\n" + err.message);
      //   });
      // }, 500);
      // setTimeout(() => {
      //   try {
      //     this.period = period;
      //     this.DPSCalcsDataGrid = this.generateDPSCalculations(period);
      //     this.alert.hideSpinner();
      //     this.dataReady = true;
      //     this.dispatch.updatePeriod(period);
      //     this.dispatch.updateDPSCalculationsGrid(this.DPSCalcsDataGrid);
      //   } catch(err) {
      //     this.alert.hideSpinner();
      //     this.alert.showAlert("ERROR", "Error updating payroll period:<br>\n<br>\n" + err.message);
      //   }
      // }, 1000);
    } catch(err) {
      Log.l("updatePeriod(): Error updating period.");
      Log.e(err);
      await this.alert.hideSpinner(spinnerID);
      // this.alert.showAlert("ERROR", "Error updating payroll period:<br>\n<br>\n" + err.message);
      await this.alert.showErrorMessage("ERROR", "Error updating payroll period", err);
    }
  }

  public async performPeriodCalculations(period:PayrollPeriod) {
    // return new Promise((resolve,reject) => {
      try {
        this.period = period;
        this.DPSCalcsDataGrid = await this.generateDPSCalculations(period);
        // this.alert.hideSpinnerPromise(this.spinnerID).then(res => {
        this.dataReady = true;
        this.dispatch.updatePeriod(period);
        this.dispatch.updateDPSCalculationsGrid(this.DPSCalcsDataGrid);
        this.generateDPSReportData();
        return true;
      } catch(err) {
        Log.l(`performPeriodCalculations(): Error while performing calculations!`);
        Log.e(err);
        throw err;
      }
        // resolve("Successfully performed period calculations.");
      // }).catch(err => {
      //   Log.l("performPeriodCalculations(): Error performing period calculations!");
      //   Log.e(err);
      //   reject(err);
      // });
    // });
  }

  public copyTable() {
    let table;
    // = this.printArea.nativeElement;
    if(this.tabIndex === 1 && this.dpsCalculationsComponent && this.dpsCalculationsComponent.DPSCalcTable) {
      // table = this.DPSCalcTable.nativeElement;
      table = this.dpsCalculationsComponent.DPSCalcTable.nativeElement;
    } else if(this.tabIndex === 3 && this.dpsDailySummaryComponent && this.dpsDailySummaryComponent.DPSDailySummaryTable) {
      table = this.dpsDailySummaryComponent.DPSDailySummaryTable.nativeElement;
    } else {
      Log.l("copyTable(): Attempted to copy with no valid table shown!");
      this.alert.showAlert("ERROR", "Can't find table to copy!");
    }
    let el = table.innerHtml;
    let range,selection;
    if(window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(table);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand('copy');
    selection.removeAllRanges();
    this.notify.addSuccess("SUCCESS", "Table copied to clipboard.", 3000);
  }
  /* DPS Calculations end */

  /* DPS Daily Summary start */
  public runDPSDailySummaryCalculations() {
    this.periods = this.data.createPayrollPeriods();
    this.period = this.periods[0];
    // let menu:MenuItem[] = [];
    // for(let period of this.periods) {
    //   let label = period.start_date.format("MMM DD YYYY") + " — " + period.end_date.format("MMM DD YYYY");
    //   let value = period;
    //   let shifts = period.getPayrollShifts();
    //   let menuItemArray:Array<any> = [];
    //   let item: MenuItem = { 'label': label, 'items': menuItemArray};
    //   for(let shift of shifts) {
    //     let date = shift.getShiftDate();
    //     let strDate = date.format("MMM DD YYYY");
    //     let subitem:MenuItem = {'label': strDate, 'command': (event) => {
    //       this.chooseShift(shift, period);
    //     }};
    //     // let subitem:MenuItem = {'label': strDate, 'command': (event) => { this.chooseShift(event)}};
    //     menuItemArray.push(subitem);
    //   }
    //   menu.push(item);
    // }
    // let toggler = {'label': "Toggle Detail Mode", 'command': (event) => {
    //   this.toggleDetailMode();
    // }};
    // menu.push(toggler);
    // toggler = {'label': 'Toggle Calculation Mode', 'command': (event) => {
    //   this.toggleCalculationMode();
    // }};
    // menu.push(toggler);
    // this.menuItems = menu;
    this.sites = this.data.getData('sites').filter((a:Jobsite) => {
      return a.site_active;
    }).sort((a:Jobsite,b:Jobsite) => {
      let sA = a.sort_number;
      let sB = b.sort_number;
      return sA < sB ? -1 : sA > sB ? 1 : 0;
    });
    this.shift = this.period.getPayrollShifts()[0];
    this.summaryDate = moment(this.shift.getShiftDate());
    let eperiod:Map<Employee,PayrollPeriod> = this.data.getData('ePeriod');
    if(eperiod && eperiod.size) {
      this.ePeriod = eperiod;
      this.createDPSDailySummaryShiftMap();
      this.createDPSDailySummaryDataGrid();
      this.DSTitle = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
      // this.dataReady = true;
    } else {
      eperiod = this.data.createEmployeePeriodMap(this.period);
      this.ePeriod = eperiod;
      this.createDPSDailySummaryShiftMap();
      this.createDPSDailySummaryDataGrid();
      this.DSTitle = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
      // this.dataReady = true;
    }
  }

  public createDPSDailySummaryShiftMap() {
    let ep = this.ePeriod;
    let date = this.shift.getShiftDate();
    let eshift = new Map<Employee,Shift>();
    for(let entry of ep) {
      let tech   = entry[0];
      let period = entry[1];
      let shifts = period.getPayrollShifts();
      for(let shift of shifts) {
        let sDate = shift.getShiftDate();
        if(!sDate.isSame(date, 'day')) {
          continue;
        } else {
          eshift.set(tech, shift);
        }
      }
    }
    this.eShift = eshift;
    return eshift;
  }

  public createDPSDailySummaryDataGrid() {
    let i = 1;
    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.data.getFullClient(a.client);
      let cliB = this.data.getFullClient(b.client);
      let locA = this.data.getFullLocation(a.location);
      let locB = this.data.getFullLocation(b.location);
      let lidA = this.data.getFullLocID(a.locID);
      let lidB = this.data.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    };

    let es = this.eShift;
    let grid1 = [], grid2 = [];
    let alltechs = this.data.getData('employees').filter((a:Employee) => {
      // let userIsManager = false;
      let uc:any = a.userClass;
      let userclass     = Array.isArray(uc) ? uc[0].toUpperCase() : typeof uc === 'string' ? uc.toUpperCase() : 'M-TECH';
      return a.active && a.username !== 'mike' && a.username !== 'Chorpler' && a.username !== 'Hachero' && userclass !== 'MANAGER';
    })
    .sort(_sortTechs);
    // .sort(testSort);
    // .sort((a:Employee, b:Employee) => {

    // });

    // let MIN = 1, MAX = 5;
    let sites = this.sites;
    let wt1 = 0, wt2 = 0;
    this.techs = alltechs;
    let eRot:Map<Employee,string> = new Map();
    for(let tech of alltechs) {
      let rotation = this.data.getTechRotationForDate(tech, this.summaryDate);
      let seq = rotation2sequence[rotation];
      if(seq === 'A' || seq === 'B' || seq === 'C') {
        wt1++;
      }
      let shft:Shift = es.get(tech);
      if(!shft) {
        let name = tech.getUsername();
        Log.w(`createDataGrid(): es.get(${name}) did not exist!`);
        continue;
      }
      let shift:Shift = shft;
      // let hours = shift.getNormalHours();
      let hours = shift.getBillableHours();
      if(hours) {
        wt2++;
      }
      // if(rotation === 'FIRST WEEK' || rotation === 'FINAL WEEK' || rotation === 'CONTN WEEK') {
        //   wt1++;
      eRot.set(tech, seq);
        // }
    }

    this.eRot = eRot;

    this.workingTechs1 = wt1;
    this.workingTechs2 = wt2;
    this.workingTechs = wt1;

    let siteSummary1:Map<Jobsite,any> = new Map();
    let siteSummary2:Map<Jobsite,any> = new Map();

    let transDaily = this.dps.getTransportationDaily();
    let fuelDaily = this.dps.getFuelDaily();
    let insDaily = this.dps.getInsuranceDaily();
    let officeDaily = this.dps.getInternalSalariesDaily();
    for(let site of sites) {
      if(Number(site.site_number) === 1075) {
        continue;
      }
      let siteName = site.getScheduleName();
      let techs = alltechs.filter((a:Employee) => {
        let cli  = _matchCLL(a.client, site.client);
        let loc  = _matchCLL(a.location, site.location);
        let lid  = _matchCLL(a.locID, site.locID);
        return cli && loc && lid;
      }).sort((a:Employee, b:Employee) => {
        let seqA = eRot.get(a);
        let seqB = eRot.get(b);
        let usrA = a.getTechName();
        let usrB = b.getTechName();
        return seqA > seqB ? 1 : seqA < seqB ? -1 : usrA > usrB ? 1 : usrA < usrB ? -1 : 0;
      });
      if(techs.length === 0) {
        continue;
      }
      let siteRow1:any = [siteName];
      let siteRow2:any = [siteName];
      grid1.push(siteRow1);
      grid2.push(siteRow2);
      this.rowNumber.push("");
      // Log.l(`createDataGrid(): for site '${siteName}', techs list is:\n`, techs);
      let siteTotals1 = {
        name: site.schedule_name,
        number: site.site_number,
        billed: new dec(0),
        expenses: new dec(0),
        zero: new dec(0),
        get profit() { return this.billed.minus(this.expenses); },
        get percent() { return this.billed.eq(0) ? this.zero : this.profit.div(this.billed).times(100); },
      };
      let siteTotals2 = {
        name: site.schedule_name,
        number: site.site_number,
        billed: new dec(0),
        expenses: new dec(0),
        zero: new dec(0),
        get profit() { return this.billed.minus(this.expenses); },
        get percent() { return this.billed.eq(0) ? this.zero : this.profit.div(this.billed).times(100); },
      };

      for(let tech of techs) {
        let name = tech.getUsername();
        let shft:Shift = es.get(tech);
        if(!shft) {
          Log.l(`createDataGrid(): es.get(${name}) did not exist:\n`, shft);
          continue;
        }
        let shift:Shift = shft;
        let paidHours = shift.getPayrollHours();
        let billedHours = shift.getBillableHours();
        let seq = eRot.get(tech);
        let techStatus:any = {workingFromShift: false, workingFromHours: false, sequence: seq};
        let hoursVac  = shift.getVacationHours();
        let hoursTrvl = shift.getTravelHours();
        let hoursTrng = shift.getTrainingHours();
        let hoursStby = shift.getStandbyHours();
        let payRate   = tech.payRate;
        let billRate  = site.billing_rate;
        let payroll   = new dec(payRate).times(paidHours);
        let billing   = new dec(billRate).times(billedHours);

        let lodging         = new dec(0) ;
        let perDiem         = new dec(0) ;
        let transportation  = new dec(0) ;
        let fuel            = new dec(0) ;
        let insurance       = new dec(0) ;
        let office          = new dec(0) ;

        let lodging2        = new dec(0) ;
        let perDiem2        = new dec(0) ;
        let transportation2 = new dec(0) ;
        let fuel2           = new dec(0) ;
        let insurance2      = new dec(0) ;
        let office2         = new dec(0) ;

        // let techIsWorking = eRot.get(tech);
        // if(techIsWorking) {
        // let seq = eRot.get(tech);
        // letging2, perDiem2, transportation2 = new dec(transDaily);
        // let fuel2           = new dec(fuelDaily);
        // l lodet insurance2      = new dec(insDaily);
        // let office2         = new dec(officeDaily);
        if(seq === 'A' || seq === 'B' || seq === 'C') {
          techStatus.workingFromShift = true;
          lodging        = new dec(site.lodging_rate);
          perDiem        = new dec(site.per_diem_rate);
          transportation = new dec(transDaily).div(this.workingTechs1);
          fuel           = new dec(fuelDaily).div(this.workingTechs1);
          insurance      = new dec(insDaily).div(this.workingTechs1);
          office         = new dec(officeDaily).div(this.workingTechs1);
        }
        if(billedHours) {
          techStatus.workingFromHours = true;
          lodging2        = new dec(site.lodging_rate);
          perDiem2        = new dec(site.per_diem_rate);
          transportation2 = new dec(transDaily).div(this.workingTechs2);
          fuel2           = new dec(fuelDaily).div(this.workingTechs2);
          insurance2      = new dec(insDaily).div(this.workingTechs2);
          office2         = new dec(officeDaily).div(this.workingTechs2);
        }
        // let transportation2 = new dec(transDaily).div(this.workingTechs);
        // let fuel2           = new dec(fuelDaily).div(this.workingTechs);
        // let insurance2      = new dec(insDaily).div(this.workingTechs);
        // let office2         = new dec(officeDaily).div(this.workingTechs);
        // }
        let miscExps = new dec(0);
        let miscExps2 = new dec(0);
        let vacation = new dec(hoursVac);
        let travel = new dec(hoursTrvl);
        let training = new dec(hoursTrng);
        let standby = new dec(hoursStby);
        let expenses = new dec(0).plus(payroll).plus(lodging).plus(perDiem).plus(miscExps).plus(vacation).plus(travel).plus(training).plus(standby).plus(transportation).plus(fuel).plus(insurance).plus(office);
        let expenses2 = new dec(0).plus(payroll).plus(lodging2).plus(perDiem2).plus(miscExps2).plus(vacation).plus(travel).plus(training).plus(standby).plus(transportation2).plus(fuel2).plus(insurance2).plus(office2);
        let profit1 = new dec(billing).minus(expenses);
        let profit2 = new dec(billing).minus(expenses2);
        let percent = billing.eq(0) ? new dec(0) : new dec(profit1).div(billing).times(100);
        let percent2 = billing.eq(0) ? new dec(0) : new dec(profit2).div(billing).times(100);
        siteTotals1.billed   = siteTotals1.billed.plus(billing);
        siteTotals1.expenses = siteTotals1.expenses.plus(expenses);
        siteTotals2.billed   = siteTotals2.billed.plus(billing);
        siteTotals2.expenses = siteTotals2.expenses.plus(expenses2);
        // siteTotals.profit = siteTotals.profit.plus(profit);
        // let seq = eRot.get(tech) || "X";
        // let status:any = {sequence: seq, techIsWorking: true};
        // if(seq === 'D' || seq === 'X') {
        //   status.techIsWorking = false;
        // }

        let row1 = [
          tech.getTechName(),
          payroll,
          lodging,
          perDiem,
          miscExps,
          vacation,
          travel,
          training,
          standby,
          transportation,
          fuel,
          insurance,
          office,
          billing,
          expenses,
          profit1,
          techStatus,
          // percent,
        ];
        this.addGettersToRow(row1);
        grid1.push(row1);

        let row2 = [
          tech.getTechName(),
          payroll,
          lodging2,
          perDiem2,
          new dec(0),
          vacation,
          travel,
          training,
          standby,
          transportation2,
          fuel2,
          insurance2,
          office2,
          billing,
          expenses2,
          profit2,
          techStatus,
          // percent,
        ];
        this.addGettersToRow(row2);
        grid2.push(row2);

        this.rowNumber.push(i++);
      }
      // siteTotals.percent = siteTotals.billed.eq(0) ? new dec(0) : new dec(siteTotals.profit).div(siteTotals.billed).times(100);

      siteSummary1.set(site, siteTotals1);
      siteSummary2.set(site, siteTotals2);
      siteRow1.push(siteTotals1);
      siteRow2.push(siteTotals2);
    }
    this.siteSummary1 = siteSummary1;
    this.siteSummary2 = siteSummary2;
    let allTotals1 = {
      billed: new dec(0),
      expenses: new dec(0),
      get profit() { return this.billed.minus(this.expenses); },
      get percent() {
        if(this.billed.eq(0)) {
          return new dec(0);
        } else {
          return this.profit.div(this.billed).times(100);
        }
      },
    };
    let allTotals2 = {
      billed: new dec(0),
      expenses: new dec(0),
      get profit() { return this.billed.minus(this.expenses); },
      get percent() {
        if(this.billed.eq(0)) {
          return new dec(0);
        } else {
          return this.profit.div(this.billed).times(100);
        }
      },
    };
    for(let entry of this.siteSummary1) {
      let site = entry[0];
      let stats = entry[1];
      allTotals1.billed = allTotals1.billed.plus(stats.billed);
      allTotals1.expenses = allTotals1.expenses.plus(stats.expenses);
      // siteTotals.profit = siteTotals.profit.plus(stats.profit);
    }
    for(let entry of this.siteSummary2) {
      let site = entry[0];
      let stats = entry[1];
      allTotals2.billed = allTotals2.billed.plus(stats.billed);
      allTotals2.expenses = allTotals2.expenses.plus(stats.expenses);
      // siteTotals.profit = siteTotals.profit.plus(stats.profit);
    }
    // siteTotals.percent = siteTotals.billed.eq(0) ? new dec(0) : siteTotals.profit.div(siteTotals.billed).times(100);
    this.grid1 = grid1;
    this.grid2 = grid2;
    this.DSGrid = grid1;
    this.DSsiteGrid1 = Array.from(siteSummary1);
    this.DSsiteGrid2 = Array.from(siteSummary2);
    this.DSsiteGrid = this.DSsiteGrid1;
    this.DSsiteTotals1 = allTotals1;
    this.DSsiteTotals2 = allTotals2;
    this.DSsiteTotals = allTotals1;
    return grid1;
  }

  public addGettersToRow(row:Array<any>) {
    // let row:Array<any> = inputRow;
    Object.defineProperty(row, rowval.expenses, {
      get: function() {
        let expenses = new dec(0)
        .plus(row[rowval.payroll])
        .plus(row[rowval.lodging])
        .plus(row[rowval.perDiem])
        .plus(new dec(row[rowval.miscExps]))
        .plus(row[rowval.vacation])
        .plus(row[rowval.travel])
        .plus(row[rowval.training])
        .plus(row[rowval.standby])
        .plus(row[rowval.transportation])
        .plus(row[rowval.fuel])
        .plus(row[rowval.insurance])
        .plus(row[rowval.office])
        return expenses;
      }
    });

    Object.defineProperty(row, rowval.profit, {
      get: function() {
        let profit = new dec(0)
        .plus( row[rowval.billing])
        .minus(row[rowval.expenses]);
        return profit;
      }
    });

    return row;
  }

  public runGridCalculations() {
    // for(let row of grid) {
    //   if(row.length > 1) {
    //     continue;
    //   } else {

    //   }
    // }
    // let row = [
    // 0 :  tech.getTechName(),
    // 1 :  payroll,
    // 2 :  lodging,
    // 3 :  perDiem,
    // 4 :  miscExps,
    // 5 :  vacation,
    // 6 :  travel,
    // 7 :  training,
    // 8 :  standby,
    // 9 :  transportation,
    // 10:  fuel,
    // 11:  insurance,
    // 12:  office,
    // 13:  billing,
    // 14:  expenses,
    // 15:  profit,
    // ];
    // for(let row of grid) {

    // }
    // this.createDataGrid();
  }

  public chooseShift(shift:Shift, period:PayrollPeriod) {
    let date = shift.getShiftDate();
    Log.l("chooseShift(): Shift, period, and this.period are:\n", shift, period, this.period);
    if(this.period.start_date.format("YYYY-MM-DD") === period.start_date.format("YYYY-MM-DD")) {
      Log.l("chooseShift(): Shift changed to:\n", shift);
      this.shift = shift;
      this.dispatch.updateShift(shift);
      // this.summaryDate = moment(shift.getShiftDate());
      // this.createDPSDailySummaryShiftMap();
      // this.createDPSDailySummaryDataGrid();
      // // this.createShiftMap();
      // // this.createDataGrid();
      // this.DSTitle = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    } else {
      Log.l("chooseShift(): Period and shift changed to:\n", period, shift);
      this.period = period;
      this.shift = shift;
      // this.summaryDate = moment(shift.getShiftDate());
      this.ePeriod = this.data.createEmployeePeriodMap(period);
      this.dispatch.updateEmployeePeriodMap(this.ePeriod);
      this.dispatch.updatePeriod(period);
      this.dispatch.updateShift(shift);
      // this.createDPSDailySummaryShiftMap();
      // this.createDPSDailySummaryDataGrid();
      // // this.createShiftMap();
      // // this.createDataGrid();
      // this.DSTitle = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    }
    // this.toggleCalculationMode();
    // this.toggleCalculationMode();
    // this.dispatch.updateShift(shift);
  }

  public updateExpenses() {

  }

  // public updatePeriod(period:PayrollPeriod) {
  //   Log.l("updatePeriod(): Period changed to:\n", period);
  //   this.period = period;
  //   this.dispatch.updatePeriod(period);
  // }

  public updateWorkingTechCount() {
    let grid = this.DSGrid;
    let mode = this.calcMode;
    let totalWorkingTechs = 0;
    if(mode === 'reports') {
      for(let row of grid) {
        if(row.length > 2) {
          if(!row[rowval.billing].eq(0)) {
            row[rowval.status].techIsWorking = true;
            totalWorkingTechs++;
          } else {
            row[rowval.status].techIsWorking = false;
          }
        }
      }
    } else {
      for(let row of grid) {
        if(row.length > 2) {
          let seq = row[rowval.status].sequence;
          if(seq === 'D' || seq === 'X') {
            row[rowval.status].techIsWorking = false;
          } else {
            row[rowval.status].techIsWorking = true;
            totalWorkingTechs++;
          }
        }
      }
    }
    this.workingTechs = totalWorkingTechs;
    return this.workingTechs;
  }

  public toggleDetailMode(event?:any) {
    let len = this.menuItems.length;
    let idx = len - 2;
    let item = this.menuItems[idx];
    if(this.tableMode === 'summary') {
      this.tableMode = 'detail';
      item.icon = 'fa-check';
    } else {
      this.tableMode = 'summary';
      item.icon = '';
    }
    Log.l("toggleDetailMode(): Mode toggled to '%s'", this.tableMode);
    this.dispatch.updateTableMode(this.tableMode);
  }

  public toggleCalculationMode(event?:any) {
    let len = this.menuItems.length;
    let idx = len - 1;
    let item = this.menuItems[idx];
    if(this.calcMode === 'reports') {
      this.calcMode = 'schedule';
      item.icon = '';
      // this.DSGrid = this.grid1;
      // this.DSsiteGrid   = this.DSsiteGrid1;
      // this.DSsiteTotals = this.DSsiteTotals1;
    } else {
      this.calcMode = 'reports';
      item.icon = 'fa-check';
      // this.DSGrid = this.grid2;
      // this.DSsiteGrid   = this.DSsiteGrid2;
      // this.DSsiteTotals = this.DSsiteTotals2;
    }
    // this.DSTitle = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    Log.l("toggleCalculationMode(): Mode toggled to '%s'", this.calcMode);
    this.dispatch.updateCalcMode(this.calcMode);
  }
  /* DPS Daily Summary end */

  /* DPS Settings */
  public saveDPSSettings(event?:any) {
    let dps = this.dps.serialize();
    let user = this.data.getUser();
    if(!user.isLevel1Manager()) {
      Log.l("saveDPSSettings(): Attempt to save DPS settings made by a non-manager.");
      // this.alert.showAlert("ERROR", "You must be a Level 1 Manager to save DPS settings.")
      this.notify.addError("ERROR", "You must be a Level 1 Manager to save DPS settings.", 10000);
    } else {
      this.server.saveDPSSettings(dps).then(res => {
        this.updatedSettings = false;
      });
    }
  }

  public settingsSaved(event?:any) {
    let evt = event || this.settingsOpenEvent;
    this.hideDPSSettings(evt);
    // this.toggleDPSSettings(event, this.actualTarget);
  }

  public settingsCanceled(event?:any) {
    let evt = event || this.settingsOpenEvent;
    this.hideDPSSettings(evt);
    // this.toggleDPSSettings(event, this.actualTarget);
  }

  public settingsUpdated(event:Event) {
    this.updatedSettings = true;
  }

  public receiveDPSCalculations(grid:Array<Array<any>>) {
    // Log.l("receiveDPSCalculations(): Event is:\n", event);
    this.DPSCalcsDataGrid = grid;
    this.dispatch.updateDPSCalculationsGrid(grid);

  }

  public isDirty() {
    // return this.settingsUpdated;
  }

  public whichElementHasFocus() {
    this.inputElement = new ElementRef(document.activeElement);
    Log.l("whichElementHasFocus(): Focused element is:\n", this.inputElement);
  }

  public moneyAdd(event:any, key:string) {
    Log.l("moneyAdd(): Event is:\n", event);
    let el = event.srcElement;
    let amount:Decimal = new dec("1");
    if(key === 'multiplier') {
      amount = new dec("0.00001");
    }
    let value = new dec(this.settings[key]) || new dec(0);
    if(key === 'days_in_month' || key === 'working_techs') {
      let newValue:Decimal = value.plus(amount);
      // let newValue = Number(+value.toFixed(2)) + 0.05;
      value = newValue;
      this.settings[key] = newValue.toNumber();
    } else {
      let newValue:Decimal = value.plus(amount);
      // let newValue = Number(+value.toFixed(2)) + 0.05;
      value = newValue;
      this.settings[key] = newValue;
    }
    Log.l("moneyAdd(): value is now: ", value.toString());
    this.setDirty();
  }

  public moneySubtract(event:any, key:string) {
    Log.l("moneySubtract(): Event is:\n", event);
    let el = event.srcElement;
    // let value = new dec(this[key]) || new dec(0);
    // .attributes['ng-reflect-model'].
    // let newValue = Number(+value.toFixed(2)) - 0.05;
    // let newValue:Decimal = value.minus(0.05);
    // value = newValue;
    // this.settings[key] = newValue;
    // Log.l("moneySubtract(): value is now: ", value.toString());
    // this.setDirty();
    let amount:Decimal = new dec("1");
    if(key === 'multiplier') {
      amount = new dec("0.00001");
    }
    let value = new dec(this.settings[key]) || new dec(0);
    if(key === 'days_in_month' || key === 'working_techs') {
      let newValue:Decimal = value.plus(amount);
      // let newValue = Number(+value.toFixed(2)) + 0.05;
      value = newValue;
      this.settings[key] = newValue.toNumber();
    } else {
      let newValue:Decimal = value.minus(amount);
      // let newValue = Number(+value.toFixed(2)) + 0.05;
      value = newValue;
      this.settings[key] = newValue;
    }
    Log.l("moneySubtract(): value is now: ", value.toString());
    this.setDirty();
  }

  public setDirty(value?:boolean) {
    let val = value ? value : true;
    // this.updated.emit(val);
    this.updatedSettings = val;
    Log.l("setDirty(): Dirty set to '%s'", val);
    // this.updated.emit(true);
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

}
