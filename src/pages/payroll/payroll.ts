// import { Dialog                                                                 } from 'primeng/dialog'                             ;
// import { PDFService                                                             } from 'providers/pdf-service'                      ;
// import { OptionsComponent                                                       } from 'components/options/options'                 ;
// import { OnSiteConsoleX                                                         } from 'app/app.component'                          ;
import { Subscription                                                           } from 'rxjs'                                       ;
import { sprintf                                                                } from 'sprintf-js'                                 ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef            } from '@angular/core'                              ;
import { ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy             } from '@angular/core'                              ;
import { IonicPage, NavController, NavParams, ModalController, ViewController   } from 'ionic-angular'                              ;
import { ServerService                                                          } from 'providers/server-service'                   ;
import { DBService                                                              } from 'providers/db-service'                       ;
// import { AuthService                                                            } from 'providers/auth-service'                     ;
import { AlertService                                                           } from 'providers/alert-service'                    ;
import { DispatchService                                                        } from 'providers/dispatch-service'                 ;
import { Log, Moment, moment, _matchCLL, _matchSite                             } from 'domain/onsitexdomain'                       ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule } from 'domain/onsitexdomain'                       ;
import { ReportLogistics                                                        } from 'domain/onsitexdomain'                       ;
import { ReportDriving                                                          } from 'domain/onsitexdomain'                       ;
import { ReportMaintenance                                                      } from 'domain/onsitexdomain'                       ;
import { ReportAny, ReportReal,                                                 } from 'domain/onsitexdomain'                       ;
import { OSData                                                                 } from 'providers/data-service'                     ;
import { Preferences, DatabaseKey,                                              } from 'providers/preferences'                      ;
import { SelectItem, MenuItem                                                   } from 'primeng/api'                                ;
import { Command, KeyCommandService                                             } from 'providers/key-command-service'              ;
import { OptionsGenericComponent                                                } from 'components/options-generic/options-generic' ;
import { NotifyService                                                          } from 'providers/notify-service'                   ;

const periodUpdateTimeout:number = 750;

@IonicPage({ name: 'Payroll' })
@Component({
  selector: 'page-payroll',
  templateUrl: 'payroll.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollPage implements OnInit,OnDestroy {
  // @ViewChild('optionsDialog') optionsDialog:Dialog;
  // @ViewChild('ionContent') content:ElementRef         ;
  // @ViewChild('optionsTarget') optionsTarget:ElementRef;
  @ViewChild('optionsComponent') optionsComponent:OptionsGenericComponent;

  public title              : string     = "Payroll"  ;
  public optionsVisible     : boolean    = false      ;
  public optionsType        : string     = 'payroll'  ;
  public employeeViewVisible: boolean    = false      ;
  public editEmployees      : Employee[] = []         ;
  public workTechs          : Employee[] = []         ;
  public exTechs            : Employee[] = []         ;
  public unassignedTechs    : Employee[] = []         ;
  public mode               : string     = 'edit'     ;
  public dataUpdated        : boolean    = false      ;
  public updatedDataCount   : number     = 0          ;
  public keySubscription:Subscription                 ;
  public dsSubscription:Subscription                  ;
  public rowAlerts: Boolean[]       = []         ;
  public employee : Employee                          ;
  public employees: Employee[]      = []         ;
  public reports  : Report[]        = []         ;
  public others   : ReportOther[]   = []         ;
  public logistics: ReportLogistics[] = []       ;
  public maintenances: ReportMaintenance[] = []       ;
  public drivings : ReportDriving[] = []       ;
  public periods  : PayrollPeriod[] = []         ;
  public sites    : Jobsite[]       = []         ;
  public schedules: Schedule[]      = []         ;
  public schedule : Schedule                          ;
  public period   : PayrollPeriod                     ;
  public eReports : Map<Employee,Report[]>       ;
  public eOthers  : Map<Employee,ReportOther[]>  ;
  public eLogistics: Map<Employee,ReportLogistics[]>  ;
  public eShifts  : Map<Employee,Shift[]>        ;
  public ePeriods : Map<Employee,PayrollPeriod[]>;
  public eSchedule: Map<Employee,Schedule>            ;
  public eReport  : Map<Employee,Report>              ;
  public eOther   : Map<Employee,ReportOther>         ;
  public eLogistic: Map<Employee,ReportLogistics>         ;
  public eShift   : Map<Employee,Shift>               ;
  public ePeriod  : Map<Employee,PayrollPeriod>       ;
  public eSite    : Map<Employee,Jobsite>             ;
  public alerts   : Map<Employee,Boolean>             ;
  public allData  : any = {employees: [], reports: [], others: [], logistics: [], drivings: [], maintenances: [], periods: [], sites: [] };
  public eRot     : Map<Employee,string> = new Map()  ;
  public periodList: SelectItem[]        = []         ;
  public loading  : any                               ;
  public moment   : any                  = moment     ;
  public scheduleMissing:boolean         = false      ;
  public spinnerLabel:string = "Initializing payroll page …";
  public dataReady: boolean              = false      ;
  public statusBarEnabled:boolean        = true       ;
  public reportsLocalTotal  : number       = 0        ;
  public reportsRemoteTotal : number       = 0        ;
  public reportsRemaining   : number       = 0        ;

  constructor(
    public application    : ApplicationRef    ,
    public changeDetector : ChangeDetectorRef ,
    public zone           : NgZone            ,
    public navCtrl        : NavController     ,
    public navParams      : NavParams         ,
    public prefs          : Preferences       ,
    public data           : OSData            ,
    public db             : DBService         ,
    public dispatch       : DispatchService   ,
    public server         : ServerService     ,
    public alert          : AlertService      ,
    public modalCtrl      : ModalController   ,
    public keyService     : KeyCommandService ,
    public notify         : NotifyService     ,
    // public appComponent   : OnSiteConsoleX    ,
  ) {
    window['onsitepayroll']  = this;
    // window['onsitepayroll2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l("PayrollPage: ngOnInit() called");
    if(this.data.isAppReady()) {
      // setTimeout(() => {
        Log.l("PayrollPage: App is ready, now running...");
        this.runWhenReady();
      // }, 1000);
        // this.runWhenReady();
    }
    // this.data.appReady().then(res => {
    //   setTimeout(() => {
    //     Log.l("PayrollPage: App is ready, now running...");
    //     this.runWhenReady();
    //   }, 1000);
    // });
  }

  ngOnDestroy() {
    Log.l("PayrollPage: ngOnDestroy() called");
    this.cancelSubscriptions();
    this.updateView('detach');
  }

  ionViewDidEnter() {
    window['p'] = this;
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    this.runWhenSubscriptionsAreAlreadyInitialized();
  }

  public async runWhenSubscriptionsAreAlreadyInitialized():Promise<any>
   {
    try {
      this.initializePayrollPeriods();
      this.setupInterface();
      this.setPageLoaded();
      // this.generatePayrollData();
      let out:any = await this.setupData();
      return "Hooray";
    } catch(err) {
      Log.l(`runWhenSubscriptionsAreAlreadyInitialize(): Error during data initialization and/or recalculation`);
      Log.e(err);
      throw err;
    }
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "PayrollPage.showOptions" : this.showOptions(); break;
      }
    });
    // this.dsSubscription = this.dispatch.datastoreUpdated().subscribe(async (data:{type:string, payload:any}) => {
    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe(async (data:{type:DatabaseKey, payload:any}) => {
      Log.l("PayrollPage: Received datastoreUpdated() event from dispatch service:", data);
      try {
        let key = data.type;
        let payload = data.payload;
        if(key.indexOf("reports-other") > -1 || key.indexOf('others') > -1) {
          let tempOthers:ReportOther[] = this.allData.others;
          let oldOtherCount:number = tempOthers.length;
          if(Array.isArray(payload) && payload.length) {
            let newOtherCount:number = payload.length;
            let difference:number = newOtherCount - oldOtherCount;
            this.allData.others = payload.slice(0);
            this.updatedDataCount += difference;
            this.dataUpdated = true;
            this.updateReportMatches();
            if(difference >= 1) {
              Log.l(`Payroll: DataStore gave us ${difference} new ReportOthers, updating payroll...`);
              let res:any = await this.setupData();
              Log.l(`Payroll: DataStore update event received and setupData() finished.`);
            } else {
              Log.l(`Payroll: DataStore gave us ${difference} new ReportOthers. Meh.`);
            }
            this.updateView();
          }
        // } else if(key === 'reports' || key === 'reports_ver101100' || key.indexOf('reports') > -1) {
        } else if(key === 'reports') {
          let tempReports = this.allData.reports;
          let oldReportCount:number = tempReports.length;
          if(Array.isArray(payload) && payload.length) {
            let newReportCount:number = payload.length;
            let difference:number = newReportCount - oldReportCount;
            this.allData.reports = payload.slice(0);
            this.updatedDataCount += difference;
            this.dataUpdated = true;
            this.updateReportMatches();
            if(difference >= 10) {
              Log.l(`Payroll: DataStore gave us ${difference} new Reports, updating payroll...`);
              let res:any = await this.setupData();
              Log.l(`Payroll: DataStore update event received and setupData() finished.`);
            } else {
              Log.l(`Payroll: DataStore gave us ${difference} new Reports. Meh.`);
            }
            this.updateView();
          }
        }
      } catch(err) {
        Log.l(`PayrollPage(): datastoreUpdated() but got error processing it! `);
        Log.e(err);
        throw err;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
    if(this.dsSubscription && !this.dsSubscription.closed) {
      this.dsSubscription.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public updateView(param?:string) {
    let action:string = param || 'update';
    let cd:any = this.changeDetector;
    let viewDead:boolean = cd.destroyed;
    if(!viewDead) {
      if(action === 'update') {
        this.changeDetector.detectChanges();
      } else if(action === 'detach') {
        this.changeDetector.detach();
      } else {
        this.changeDetector.detectChanges();
      }
    }
  }

  public updateReportMatches() {
    let period:PayrollPeriod = this.period;
    let date:Moment  = moment(period.start_date);
    let start:string = moment(date).format("YYYY-MM-DD");
    let end:string   = moment(date).add(6, 'days').format("YYYY-MM-DD");
    this.reports = this.allData.reports.filter((a:Report) => {
      if(a instanceof Report) {
        let date:string = a.report_date;
        return date >= start && date <= end;
      }
    });
    this.others = this.allData.others.filter((a:ReportOther) => {
      if(a instanceof ReportOther) {
        // let date = a.report_date.format("YYYY-MM-DD");
        let date:string = a.getReportDateAsString();
        return date >= start && date <= end;
      }
    });
    this.logistics = this.allData.logistics.filter((a:ReportLogistics) => {
      if(a instanceof ReportLogistics) {
        let date:string = a.report_date;
        return date >= start && date <= end;
      }
    });
    this.drivings = this.allData.drivings.filter((a:ReportDriving) => {
      if(a instanceof ReportDriving) {
        let date:string = a.report_date;
        return date >= start && date <= end;
      }
    });
    this.maintenances = this.allData.maintenances.filter((a:ReportMaintenance) => {
      if(a instanceof ReportMaintenance) {
        let date:string = a.report_date;
        return date >= start && date <= end;
      }
    });
    let counts:number[] = [this.reports.length, this.others.length, this.logistics.length, this.drivings.length, this.maintenances.length];
    Log.l(`updateReportMatches(): Matches: ${counts[0]} reports, ${counts[1]} others, ${counts[2]} logistics.`);
  }

//   public removeAccents(input:string) {
//     let accents = 'ÀÁÂÃÄÅĄàáâãäåąßÒÓÔÕÕÖØŐòóôőõöøĎďDŽdžÈÉÊËĘèéêëęðÇçČčĆćÐÌÍÎÏìíîïÙÚÛÜŰùűúûüĽĹŁľĺłÑŇŃňñńŔŕŠŚšśŤťŸÝÿýŽŻŹžżź';
//     let accentsOut = "AAAAAAAaaaaaaasOOOOOOOOoooooooDdDZdzEEEEEeeeeeeCcCcCcDIIIIiiiiUUUUUuuuuuLLLlllNNNnnnRrSSssTtYYyyZZZzzz";
//     // let str:string[] = input.split('');
//     return input
//     .split("")
//     .map((letter, index) => {
//       const accentIndex = accents.indexOf(letter);
//       return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
//     })
//     .join("");
// // str.forEach((letter, index) => {
//     //   let i = accents.indexOf(letter);
//     //   if (i !== -1) {
//     //     str[index] = accentsOut[i];
//     //   }
//     // })
//     // return str.join('');
//   }

  public initializePayrollPeriods():PayrollPeriod[] {
    let count:number = this.prefs.CONSOLE.payroll.payroll_periods || 4;
    this.periods = this.data.createPayrollPeriods(count);

    /* If it's the first day of a new period, we're probably actually running payroll for the previous period, so we want to see it by default */
    if(this.periods && this.periods.length > 1) {
      let now:Moment = moment();
      let latestPeriod:PayrollPeriod = this.periods[0];
      let previousPeriod:PayrollPeriod = this.periods[1];
      let latestPeriodStartDate:Moment = latestPeriod.start_date;
      if(latestPeriodStartDate.isSame(now, 'day')) {
        this.period = previousPeriod;
      } else {
        this.period = latestPeriod;
      }
    }
    return this.periods;
  }

  public setupInterface() {
    this.initializePayrollPeriodsMenu();
  }

  public async setupData() {
    try {
      this.spinnerLabel = "Running payroll calculations …";
      if(this.updatedDataCount > 0 || this.dataUpdated) {
        this.updateReportMatches();
      }
      let res:any = await this.generatePayrollData();
      if(res) {
        Log.l("setupData(): Generated payroll data.");
        this.spinnerLabel = "Formatting payroll table …";
        let out = await this.data.delay(250);
        this.dataReady = true;
        this.updatedDataCount = 0;
        this.dataUpdated = false;
        this.updateView();
        return res;
      }
    } catch(err) {
      Log.l("generatePayrollData(): Error while generating payroll data!");
      Log.e(err);
      let errTxt = "Error while generating payroll data:<br>\n<br>\n" + err.message;
      this.notify.addMessage("ERROR", errTxt, 'error', -1);
      return false;
    }
  }

  public initializePayrollPeriodsMenu() {
    // let count:number = this.prefs.CONSOLE.payroll.payroll_periods || 4;
    // let periods = this.data.createPayrollPeriods(count);
    if(!(Array.isArray(this.periods) && this.periods.length)) {
      this.initializePayrollPeriods();
    }
    let selectitems:SelectItem[] = [];
    for(let period of this.periods) {
      let name = period.getPeriodName("DD MMM");
      let item:SelectItem = { label: name, value: period };
      selectitems.push(item);
    }
    // this.periods    = periods     ;
    // this.period     = periods[0]  ;
    this.periodList = selectitems ;
  }

  public async rerunPayroll(evt?:any) {
    try {
      Log.l(`rerunPayroll(): Clicked, event is:\n`, evt);
      this.dataReady = false;
      // let res:any = await this.generatePayrollData();
      let res:any = await this.setupData();
      this.dataReady = true;
      this.notify.addSuccess("SUCCESS", "Payroll finished re-running.", 3000);

      return res;
    } catch(err) {
      Log.l(`rerunPayroll(): Error rerunning payroll!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error rerunning payroll: '${err.message}'`, 4000);
      throw err;
    }
  }

  public async generatePayrollData():Promise<boolean> {
    let spinnerID:string;
    try {
      Log.l("generatePayrollData(): Started...!");
      spinnerID = await this.alert.showSpinner(`Generating payroll data...`);
      let _sortTechs = (a:Employee, b:Employee) => {
        let date:Moment  = this.period.start_date;
        let siteA:Jobsite = this.data.getTechLocationForDate(a, date);
        let siteB:Jobsite = this.data.getTechLocationForDate(b, date);
        let rotA  = this.data.getTechRotationForDate(a, date);
        let rotB  = this.data.getTechRotationForDate(b, date);
        let cliA  = siteA.client.name.toUpperCase();
        let cliB  = siteB.client.name.toUpperCase();
        let locA  = siteA.location.name.toUpperCase();
        let locB  = siteB.location.name.toUpperCase();
        let lidA  = siteA.locID.name.toUpperCase();
        let lidB  = siteB.locID.name.toUpperCase();
        let usrA  = a.getTechName();
        let usrB  = b.getTechName();
        let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
        let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
        return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
      }
      let _sortReports = (a:ReportReal, b:ReportReal) => {
        if(a instanceof Report && b instanceof Report) {
          return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
        } else if(a instanceof ReportOther && b instanceof ReportOther) {
          // let dA:number = a.report_date.toExcel();
          // let dB:number = b.report_date.toExcel();
          let dA:string = a.getReportDateAsString();
          let dB:string = b.getReportDateAsString();
          return dA > dB ? 1 : dA < dB ? -1 : 0;
        } else if(a instanceof ReportLogistics && b instanceof ReportLogistics) {
          return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
        } else if(a instanceof ReportDriving && b instanceof ReportDriving) {
          return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
        } else if(a instanceof ReportMaintenance && b instanceof ReportMaintenance) {
          return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
        } else {
          return 0;
        }
      };

      window['_sortTechs']   = _sortTechs;
      window['_sortReports'] = _sortReports;
      // this.allData.employees = this.data.employees.slice(0) ;
      // this.allData.reports   = this.data.reports.slice(0)   ;
      // this.allData.others    = this.data.others.slice(0)    ;
      // this.allData.periods   = this.data.periods.slice(0)   ;
      // this.allData.sites     = this.data.sites.slice(0)     ;
      // this.allData.schedules = this.data.getSchedules().slice(0) ;
      this.allData.employees = this.data.getData('employees')      ;
      this.allData.reports   = this.data.getData('reports').slice(0);
      this.allData.others    = this.data.getData('others').slice(0);
      this.allData.logistics = this.data.getData('logistics').slice(0);
      this.allData.periods   = this.data.getData('periods')        ;
      this.allData.sites     = this.data.getData('sites')          ;
      this.allData.schedules = this.data.getSchedules().slice(0)   ;

      this.reports   = this.allData.reports.sort(_sortReports);
      this.others    = this.allData.others.sort(_sortReports);
      this.logistics = this.allData.logistics.sort(_sortReports);
      this.drivings = this.allData.drivings.sort(_sortReports);
      this.maintenances = this.allData.maintenances.sort(_sortReports);
      this.sites     = this.allData.sites.slice(0);
      this.schedules = this.allData.schedules.sort((a:Schedule, b:Schedule) => {
        return a.startXL < b.startXL ? 1 : a.startXL > b.startXL ? -1 : 0;
      });
      let dateString = this.period.start_date.format("YYYY-MM-DD");
      this.schedule = this.schedules.find((a:Schedule) => {
        return a._id === dateString;
      });
      if(!this.schedule) {
        let title:string = "NO SCHEDULE";
        let text:string  = "No schedule found for this payroll period. Payroll cannot be run without a schedule. Would you like to go to the Scheduling page?";
        let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
        if(confirm) {
          let out = await this.alert.hideSpinnerPromise(spinnerID);
          this.dispatch.triggerAppEvent('openpage', {page: 'Scheduling', mode: 'normal'});
          return false;
        } else {
          let out = await this.alert.hideSpinnerPromise(spinnerID);
          this.dataReady = false;
          this.scheduleMissing = true;
          this.updateView();
          return false;
        }
      }
      this.exTechs   = [];
      this.workTechs = [];
      this.unassignedTechs = [];
      let employees:Employee[] = this.allData.employees.filter((a:Employee) => {
        return a.active && !a.isManager();
      });
      for(let tech of employees) {
        if(this.schedule.isTechWorking(tech)) {
          this.workTechs.push(tech);
          tech['prstatus'] = 'working';
        } else if(this.schedule.isTechUnassigned(tech)) {
          this.unassignedTechs.push(tech);
          tech['prstatus'] = 'unassigned';
        } else {
          this.exTechs.push(tech);
          tech['prstatus'] = 'ex';
        }
      }
      this.employees = employees;
      // if(!this.prefs.CONSOLE.payroll.showExTechs) {
      //   this.employees = this.workTechs.slice(0);
      // }
      // if(!this.prefs.CONSOLE.payroll.showUnassignedTechs) {
      //   this.employees = this.employees.filter((a:Employee) => {
      //     return this.unassignedTechs.indexOf(a) === -1;
      //   });
      // }

      this.employees = this.employees.sort(_sortTechs);
      Log.l("generatePayrollData(): Done initializing, now generating for schedule:\n", this.schedule);
      this.eReports = new Map() ;
      this.eOthers  = new Map() ;
      this.eShifts  = new Map() ;
      this.eReport  = new Map() ;
      this.eOther   = new Map() ;
      this.eShift   = new Map() ;
      this.ePeriod  = new Map() ;
      this.eSite    = new Map() ;

      this.setEmployeeRotation();
      this.generateEmployeeSiteMap();

      let res:any = await this.updatePeriodPromise(this.period);
      this.generateAlertsArray();
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      return true;
    } catch(err) {
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      Log.l(`generatePayrollData(): Error generating payroll data!`);
      Log.e(err);
      throw err;
    }
  }

  public generateEmployeeSiteMap():Map<Employee,Jobsite> {
    let techs = this.employees;
    // let sites = this.sites;
    let date = moment(this.period.start_date)
    let eSite:Map<Employee,Jobsite> = new Map();
    for(let tech of techs) {
      let site:Jobsite = this.data.getTechLocationForDate(tech, date);
      eSite.set(tech, site);
    }
    this.eSite = eSite;
    return eSite;
  }

  public generateAlertsArray() {
    let alerts:Map<Employee,Boolean> = new Map();
    let minHours = this.prefs.CONSOLE.payroll.minHoursWhenOn;
    let maxHours = this.prefs.CONSOLE.payroll.maxHoursWhenOff;
    for(let tech of this.employees) {
      alerts.set(tech, false);
      let period = this.ePeriod.get(tech);
      let date = moment(period.start_date).startOf('day');
      // let rotation = this.data.getTechRotationForDate(tech, date);
      // let rotSeq   = this.data.getRotationSequence(rotation);
      let rotSeq = this.eRot.get(tech);
      let normalHours = period.getNormalHours();
      if(rotSeq === 'A' || rotSeq === 'B' || rotSeq === 'C') {
        if(normalHours < minHours) {
          alerts.set(tech, true);
        }
      } else {
        if(normalHours >= maxHours) {
          alerts.set(tech, true);
        }
      }
    }
    this.alerts = alerts;
    return alerts;
  }

  public async updatePeriod(period:PayrollPeriod):Promise<any> {
    let spinnerID;
    setTimeout(async ():Promise<any> => {
      try {
        let text = sprintf("Setting period to '%s' — '%s'...", period.start_date.format("DD MMM, YYYY"), period.end_date.format("DD MMM, YYYY"));
        spinnerID = await this.alert.showSpinnerPromise(text);
        this.loading = this.alert.getSpinner(spinnerID);
        let res:any = await this.changePeriod(period);
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        Log.l("updatePeriod(): Successfully updated, now running change detection...");
        this.updateView();
        Log.l("updatePeriod(): Successfully updatd and ran change detection!");
        return res;
      } catch(err) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        Log.l(`updatePeriod(): Error updating period to:\n`, period);
        Log.e(err);
        let errText = "Error while attempting to update payroll period:<br/>\n<br/>\n" + err.message;
        this.notify.addError("ERROR", errText, -1);
      }
    }, periodUpdateTimeout);
  }

  public async updatePeriodPromise(period:PayrollPeriod):Promise<any> {
    let spinnerID;
    try {
      let text:string = sprintf("Setting period to '%s' — '%s'...", period.start_date.format("DD MMM, YYYY"), period.end_date.format("DD MMM, YYYY"));
      spinnerID = await this.alert.showSpinnerPromise(text);
      // this.loading = this.alert.getSpinner(spinnerID);
      let res:any = await this.changePeriod(period);
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      Log.l("updatePeriodPromise(): Successfully updated, now running change detection...");
      this.updateView();
      Log.l("updatePeriodPromise(): Successfully updated and ran change detection!");
      return "Success!";
    } catch(err) {
      let out = await this.alert.hideSpinnerPromise(spinnerID);
      Log.l(`updatePeriodPromise(): Error while updating period!`);
      Log.e(err);
      throw err;
    }
  }

  public async changePeriod(period:PayrollPeriod) {
    try {
      this.periodChanged(period);
      return "updatePeriodPromise(): Successfully updated period.";
    } catch(err) {
      Log.l("updatePeriodPromise(): Error while updating period!");
      Log.e(err);
      throw err;
    }
  }

  public periodChanged(period:PayrollPeriod) {
    let date:Moment  = moment(period.start_date);
    let start:string = moment(date).format("YYYY-MM-DD");
    let end:string   = moment(date).add(6, 'days').format("YYYY-MM-DD");
    // let sites = this.sites;

    this.updateReportMatches();

    Log.l(`periodChanged(): For period ${start} - ${end}, reports is:`, this.reports);

    let pDate = moment(period.start_date);
    this.eRot = new Map();
    for(let tech of this.employees) {
      let rotation:string = this.data.getTechRotationForDate(tech, pDate);
      let rotSeq:string   = this.data.getRotationSequence(rotation);
      this.eRot.set(tech, rotSeq);
    }
    for(let tech of this.employees) {
      let username = tech.getUsername();
      let date:Moment = moment(period.start_date);
      let techPeriod:PayrollPeriod = this.data.createPeriodForTech(tech, date);
      let shifts:Shift[] = techPeriod.getPayrollShifts();
      for(let shift of shifts) {
        let shiftDate:string = shift.getShiftDateString();
        let reports:Report[] = this.reports.filter((a:Report) => {
          return a.report_date === shiftDate && a.username === username;
        });
        let others:ReportOther[] = this.others.filter((a:ReportOther) => {
          // let otherDate = a.report_date.format("YYYY-MM-DD");
          let date:string = a.getReportDateAsString();
          return date === shiftDate && a.username === username;
        });
        let logistics:ReportLogistics[] = this.logistics.filter((a:ReportLogistics) => {
          return a.report_date === shiftDate && a.username === username;
        });
        let drivings:ReportDriving[] = this.drivings.filter((a:ReportDriving) => {
          return a.report_date === shiftDate && a.username === username;
        });
        let maintenances:ReportMaintenance[] = this.maintenances.filter((a:ReportMaintenance) => {
          return a.report_date === shiftDate && a.username === username;
        });
        shift.setShiftReports([]);
        shift.setOtherReports([]);
        shift.setLogisticsReports([]);
        shift.setDrivingReports([]);
        shift.setMaintenanceReports([]);
        for(let report of reports) {
          shift.addShiftReport(report);
        }
        for(let other of others) {
          shift.addOtherReport(other);
        }
        for(let report of logistics) {
          shift.addLogisticsReport(report);
        }
        for(let report of drivings) {
          shift.addDrivingReport(report);
        }
        for(let report of maintenances) {
          shift.addMaintenanceReport(report);
        }
      }

      this.ePeriod.set(tech, techPeriod);
    }
  }

  public setEmployeeRotation() {
    let eRot:Map<Employee,string> = new Map();
    let date = moment(this.period.start_date);
    for(let tech of this.employees) {
      let rotation = this.data.getTechRotationForDate(tech, date);
      let rotSeq   = this.data.getRotationSequence(rotation);
      eRot.set(tech, rotSeq);
    }
    this.eRot = eRot;
    return eRot;
  }

  public viewTechReports(period:PayrollPeriod, tech:Employee) {
    Log.l(`viewTechReports(): Now showing reports for '${tech.getUsername()}' for period '${period.getPayrollSerial()}'...`);
    let modalOptions = {
      enableBackdropDismiss: true,
      cssClass: 'shift-reports-modal'
    };
    let modal = this.modalCtrl.create('Shift Reports', {tech:tech, period:period, mode:0}, modalOptions);
    modal.onDidDismiss(data => {
      Log.l("All Period Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.dataReady = true;
      this.updateView();
    });
    modal.present();
  }

  public viewTechReportsForPeriod(period:PayrollPeriod, tech:Employee) {
    Log.l(`viewTechReportsForPeriod(): Now showing reports for '${tech.getUsername()}' for period '${period.getPayrollSerial()}'...`);
    let modalOptions = {
      enableBackdropDismiss: true,
      cssClass: 'shift-reports-modal'
    };
    let modal = this.modalCtrl.create('Shift Reports', {tech:tech, period:period, mode:1}, modalOptions);
    modal.onDidDismiss(data => {
      Log.l("All Period Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.dataReady = true;
      this.updateView();
    });
    modal.present();
  }

  // public showTech(tech:Employee) {
  //   Log.l("showTech(): Now viewing tech:\n", tech);
  //   let modalOptions = {
  //     enableBackdropDismiss: true,
  //     cssClass: 'edit-employee-modal'
  //   };
  //   let modal = this.modalCtrl.create('Add Employee', { mode: 'Edit', employee: tech }, modalOptions);
  //   modal.onDidDismiss(data => {
  //     Log.l("Edit Employee modal: dismissed.");
  //     if(data) {
  //       Log.l("data is:\n", data);
  //     }
  //     this.updateView();
  //   });
  //   modal.present();
  // }

  public showTech(tech:Employee) {
    Log.l("showTech(): Now viewing tech:\n", tech);
    this.employee = tech;
    this.editEmployees = [tech];
    this.mode = 'edit';
    this.employeeViewVisible = true;
    // let modalOptions = {
    //   enableBackdropDismiss: true,
    //   cssClass: 'edit-employee-modal'
    // };
    // let modal = this.modalCtrl.create('Add Employee', { mode: 'Edit', employee: tech }, modalOptions);
    // modal.onDidDismiss(data => {
    //   Log.l("Edit Employee modal: dismissed.");
    //   if(data) {
    //     Log.l("data is:\n", data);
    //   }
    //   this.updateView();
    // });
    // modal.present();
  }

  public employeeUpdated(event?:any) {
    Log.l(`employeeUpdated(): Event is:\n`, event);
    this.employeeViewVisible = false;
    this.setupData();
  }

  public employeeCanceled(event?:any) {
    Log.l(`employeeCanceled(): Event is:\n`, event);
    this.employeeViewVisible = false;
    this.updateView();
  }

  public employeeDeleted(event?:any) {
    Log.l(`employeeDeleted(): Event is:\n`, event);
    this.employeeViewVisible = false;
    this.setupData();
  }

  public viewShift(shift:Shift, tech:Employee) {
    Log.l("viewShift(): Now viewing shift for tech:\n", shift);
    Log.l(tech);
    let modalOptions = {
      enableBackdropDismiss: true,
      cssClass: 'shift-reports-modal'
    };
    let modal = this.modalCtrl.create('Shift Reports', {tech:tech, shift:shift}, modalOptions);
    modal.onDidDismiss(data => {
      Log.l("Shift Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.updateView();
    });
    modal.present();
  }

  public showPeriodOtherReports(tech:Employee, period:PayrollPeriod) {
    Log.l("showPeriodOtherReports(): Now viewing period for tech:\n", period);
    Log.l(tech);
    let modalOptions = {
      enableBackdropDismiss: true,
      cssClass: 'period-reports-modal'
    };
    let modal = this.modalCtrl.create('Period Reports', {tech:tech, period:period}, modalOptions);
    modal.onDidDismiss(data => {
      Log.l("Period Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.updateView();
    });
    modal.present();
  }

  public checkAlert(tech:Employee, event?:any) {
    Log.l(`checkAlert(): Clicked for tech:\n`, tech);
    let date = moment(this.period.start_date).format("YYYY-MM-DD");
    let schedules = this.data.getSchedules();
    let schedule:Schedule = schedules.find((a:Schedule) => {
      return a._id === date;
    });
    if(schedule) {
      let modalOptions = {
        enableBackdropDismiss: false,
        cssClass: 'payroll-scheduling-modal'
      };
      let modal = this.modalCtrl.create('Scheduling', {schedule: schedule, modal: true}, modalOptions);
      modal.onDidDismiss((data) => {
        Log.l(`PayrollPage: Scheduling modal dismissed. Data:\n`, data);
        this.updateSchedule();
        this.setupData();
      });
      modal.present();
    } else {
      Log.l(`checkAlert(): Unable to find schedule for date '${date}' in schedules:\n`, schedules);
      this.notify.addError("NOT FOUND", `Could not find schedule for this pay period.`, 3000);
    }
  }

  public updateSchedule() {
    this.allData.schedules = this.data.getSchedules().slice(0)   ;
    let dateString = this.period.start_date.format("YYYY-MM-DD");

    this.schedules = this.allData.schedules.sort((a:Schedule, b:Schedule) => {
      return a.startXL < b.startXL ? 1 : a.startXL > b.startXL ? -1 : 0;
    });

    this.schedule = this.schedules.find((a:Schedule) => {
      return a._id === dateString;
    });
  }

  public exportForPayroll() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Export', { grid: data, csv: csv });
  }

  public exportForInvoicing() {
    let data = this.createInvoiceExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Export', { grid: data, csv: csv });
  }

  public createInvoiceExportData():any {
    let outer = [];
    let overall = [];
    let i = 0, j = 0;

    let header = [
      "#",
      "CLNT",
      "LOC",
      "LocID",
      "Tech",
      "Shft",
      "WeekDay",
      "Day",
      "Month",
      "Year",
      "Start",
      "End",
      "Hrs",
      "Order No.",
      "Unit No.",
      "Notes",
      " | ",
      "Date",
      "Payroll",
      "TS",
    ];
    let date = moment(this.period.start_date);
    for(let tech of this.employees) {
      let techPeriod = this.ePeriod.get(tech);
      let shifts = techPeriod.getPayrollShifts();
      let rotation = this.data.getTechRotationForDate(tech, date);
      let rotSeq   = this.data.getRotationSequence(rotation);
      let usr = tech.getFullName();
      for(let shift of shifts) {
        let reports = shift.getShiftReports();
        let psn = shift.getPayrollPeriod();
        let ssn = shift.getShiftNumber();
        for(let report of reports) {
          let row = [];
          let cli = this.data.getFull('client', report.client).name;
          let loc = this.data.getFull('location', report.location).name;
          let lid = this.data.getFull('locID', report.location_id).name;
          row = [rotSeq, cli, loc, lid, usr];
          row.push(ssn);
          let date = moment(report.report_date, "YYYY-MM-DD");
          let xl   = date.toExcel();
          row.push(xl);
          row.push(xl);
          row.push(xl);
          row.push(xl);
          row.push(report.time_start.format("HH:mm"));
          row.push(report.time_end.format("HH:mm"));
          row.push(report.getRepairHours());
          row.push(report.work_order_number);
          row.push(report.unit_number);
          row.push(report.notes);
          row.push("   |   ");
          row.push(xl);
          row.push(psn);
          row.push(report.timestamp);
          outer.push(row);
        }
      }
    }
    let grid = outer.sort((a,b) => {
      let less = -1;
      let grtr = 1;
      return a[0] < b[0] ? less : a[0] > b[0] ? grtr : a[1] < b[1] ? less : a[1] > b[1] ? grtr : a[2] < b[2] ? less : a[2] > b[2] ? grtr : a[3] < b[3] ? less : a[3] > b[3] ? grtr : a[4] < b[4] ? less : a[4] > b[4] ? grtr : a[12] < b[12] ? less : a[12] > b[12] ? grtr : 0;
    });
    let output = { header: header, rows: grid };
    Log.l("createInvoiceExportData(): Final data is:\n", output);
    return output;
  }

  public createExportData() {
    let outer = [];
    let overall = [];
    let i = 0, j = 0;

    let header:string[] = [
      "#",
      "SHFT",
      "LEN",
      "TIME",
      "CLNT",
      "LOC",
      "LocID",
      "Tech",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "($)",
      "(Hrs)",
      "S",
      "T",
      "Q",
      "H",
      "V",
      "E",
      "NOTES",
      "Rate",
    ];
    let pDate = moment(this.period.start_date);
    i = header.findIndex(a => {
      return a === "";
    });
    for(let shift of this.period.getPayrollShifts()) {
      let momentDate = moment(shift.getShiftDate());
      let date = String(momentDate.toExcel(true));
      header[i++] = date;
    }
    for(let tech of this.employees) {
      let shift = tech.shift;
      let rotation = this.data.getTechRotationForDate(tech, pDate);
      let rotSeq   = this.data.getRotationSequence(rotation);
      let techPeriod = this.ePeriod.get(tech);
      let shifts = techPeriod.getPayrollShifts();
      let row = [];
      let site:Jobsite = this.data.getTechLocationForDate(tech, pDate);
      let cli = site.client.name;
      let loc = site.location.name;
      let lid = site.locID.name;
      let shiftLen = site.getSiteShiftLength(rotation, shift, pDate);
      // let shiftStart = site.getShiftStartTime(shift);
      let shiftStart = site.getShiftStartTimeString(shift);
      // let shiftStart = site.getShiftStartTimeNumber(shift);
      let usr = "";
      let rate = !isNaN(Number(tech.payRate)) ? Number(tech.payRate) : 0;
      if(this.prefs.CONSOLE.payroll.exportUseQuickbooksName) {
        usr = tech.getQuickbooksName();
      } else {
        usr = tech.getFullName();
      }
      row = [rotSeq, shift, shiftLen, shiftStart, cli, loc, lid, usr];
      for(let shift of shifts) {
        let code = shift.getShiftCode();
        if(rotSeq === 'D') {
          if(code === '0' || code === 0) {
            code = 'OFF';
          }
        } else if(rotSeq == 'X') {
          if(code === '0' || code === 0) {
            code = 'UA';
          }
        }
        row.push(code);
      }
      row.push("");
      row.push("");
      let periodTotal = techPeriod.getPayrollPeriodTotal();

      row.push(periodTotal.Standby);
      row.push(periodTotal.Training);
      row.push(periodTotal.Travel);
      row.push(periodTotal.Holiday);
      row.push(periodTotal.Vacation);
      row.push(periodTotal.Sick);
      row.push("");
      row.push(rate);
      outer.push(row);
    }
    if(this.prefs.CONSOLE.payroll.exportUseQuickbooksName) {
      let nameCol = header.indexOf("Tech");
      outer = outer.sort((a:any[],b:any[]) => {
        let aName = this.data.removeAccents(a[nameCol]);
        let bName = this.data.removeAccents(b[nameCol]);
        return aName < bName ? -1 : aName > bName ? 1 : 0;
      });
    }
    return { header: header, rows: outer };
  }

  public toCSV(header: any[], table: any[][]) {
    let html = "";
    let i = 0, j = 0;
    for (let hdr of header) {
      if (j++ === 0) {
        html += hdr;
      } else {
        html += "\t" + hdr;
      }
    }
    html += "\n";
    for (let row of table) {
      j = 0;
      for (let cell of row) {
        if (j++ === 0) {
          html += cell;
        } else {
          html += "\t" + cell;
        }
      }
      html += "\n";
    }
    return html;
  }

  public showOptions(event?:any) {
    // let params = { cssClass: 'popover-options-show', showBackdrop: true, enableBackdropDismiss: true};
    // this.alert.showPopoverWithData('Payroll Options', { }, params).then(res => {
    //   Log.l("showOptions(): User returned options:\n", res);
    //   this.updateView('update');
    // }).catch(err => {
    //   Log.l("showoptions(): Error showing payroll options popover!");
    //   Log.e(err);
    // });
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
    this.generateAlertsArray();
    this.updateView();
  }

  public async optionsSaved(event?:any) {
    try {
      this.optionsVisible = false;
      Log.l("optionsSaved(): Event is:\n", event);
      let prefs = this.prefs.getPrefs();
      let res:any = await this.data.savePreferences(prefs);
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      this.initializePayrollPeriodsMenu();
      this.generateAlertsArray();
      this.updateView();
      return true;
    } catch(err) {
      Log.l(`optionsSaved(): Error saving preferences!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
      return false;
    }
  }

  public async readReports(period:PayrollPeriod):Promise<any> {
    let spinnerID:string;
    try {
      let date = moment(period.start_date);
      spinnerID = await this.alert.showSpinner(`readReports(): Reading reports for week '${date.format("DD MMM YYYY")}'...`);
      let spinner = this.alert.getSpinner(spinnerID);
      let res = await this.db.getAllReportsPlusNew(date)
      Log.l("Payroll.readReports(): Read in:", res);
      this.reports = res;
      this.data.setData('reports', res);
      this.updatePeriod(period);
      await this.alert.hideSpinner(spinnerID);
      // }).catch(err => {
      //   Log.l("readReports(): Error reading reports for PayrollPeriod.");
      //   Log.e(err);
      //   this.alert.hideSpinner(spinnerID);
      //   this.notify.addError("ERROR", "Error reading reports for payroll period:<br>\n<br>\n" + err.message, 10000);
      // });
    } catch(err) {
      Log.l("Payroll.readReports(): Error reading reports for PayrollPeriod.");
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      this.notify.addError("ERROR", "Error reading reports for payroll period:<br>\n<br>\n" + err.message, 10000);
    }
  }

  public async refreshData(event?:any) {
    let spinnerID:string;
    try {
      // this.notify.addInfo("OK", "Refreshing data and recalculating payroll...", 5000);
      // setTimeout(async () => {
      await this.data.delay(500);
      let dbname1 = this.prefs.getDB('reports');
      let dbname2 = this.prefs.getDB('reports_other');
      let dbname3 = this.prefs.getDB('logistics');
      let dbname4 = this.prefs.getDB('drivings');
      let dbname5 = this.prefs.getDB('maintenances');
      let count1:number = await this.db.getDocCount(dbname1);
      let count2:number = await this.db.getDocCount(dbname2);
      let count3:number = await this.db.getDocCount(dbname3);
      let count4:number = await this.db.getDocCount(dbname4);
      let count5:number = await this.db.getDocCount(dbname5);
      let text:string = `Reading ${count1} work reports, ${count2} misc reports, ${count3} logistics reports, ${count4} driving reports, ${count5} maintenance reports …`;
      spinnerID = await this.alert.showSpinner(text);
      this.dispatch.triggerAppEvent('updatefromdb', {db: 'reports'});
      this.dispatch.triggerAppEvent('updatefromdb', {db: 'others'});
      this.dispatch.triggerAppEvent('updatefromdb', {db: 'logistics'});
      this.dispatch.triggerAppEvent('updatefromdb', {db: 'drivings'});
      this.dispatch.triggerAppEvent('updatefromdb', {db: 'maintenances'});
      // let j = await this.data.getReports(1000000);
      // let k = await this.data.getReportOthers();
      // let n = await this.data.getReportLogistics();
      // let M = await this.runWhenReady();
      let M:any;
      M = await this.alert.hideSpinnerPromise(spinnerID);
      M = await this.runWhenSubscriptionsAreAlreadyInitialized();
      this.notify.addSuccess("SUCCESS", "Refreshed data and recalculated payroll!", 3000);
      // }, 500);
    } catch (err) {
      Log.l("refreshData(): Error refreshing data!");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("Error", `Error refreshing data: '${err.message}'`, 10000);
    }
  }

  public async refreshReports(doNotRecalculate?:boolean, event?:any) {
    let spinnerID:string;
    try {
      let recalc:boolean = doNotRecalculate === true ? false : true;
      this.notify.addInfo("OK", "Refreshing work reports ...", 5000);
      await this.data.delay(500);
      // setTimeout(async () => {
      // let dbname:string = this.prefs.getDB('reports');
      // let count:number = await this.db.getDocCount(dbname);
      let count:number = await this.db.getDBDocCount('reports');
      let text:string;
      if(recalc) {
        text = `Reading ${count} reports and recalculating...`;
      } else {
        text = `Reading ${count} reports. Payroll must be recalculated after this is done.`;
      }
      spinnerID = await this.alert.showSpinnerPromise(text);
      
      // let j = await this.data.getReports(1000000);
      // let k = await this.data.getReportOthers();
      // let M = await this.runWhenReady();
      let j = await this.data.updateFromDB('reports');
      let k = await this.data.updateFromDB('reports_other');
      let M:any;
      if(recalc) {
        M = await this.runWhenSubscriptionsAreAlreadyInitialized();
      }
      await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addSuccess("SUCCESS", "Refreshed work reports", 3000);
      // }, 500);
    } catch (err) {
      Log.l("Payroll.refreshReports(): Error refreshing data!");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("Error", `Error refreshing reports: '${err.message}'`, 10000);
    }
  }

  public async refreshOthers(doNotRecalculate?:boolean, event?:any) {
    let spinnerID:string;
    try {
      let recalc:boolean = doNotRecalculate === true ? false : true;
      this.notify.addInfo("OK", "Refreshing misc reports ...", 5000);
      await this.data.delay(500);
      // setTimeout(async () => {
      // let dbname:string = this.prefs.getDB('reports_other');
      // let count:number = await this.db.getDocCount(dbname);
      let count:number = await this.db.getDBDocCount('reports_other');
      let text:string;
      if(recalc) {
        text = `Reading ${count} misc reports and recalculating...`;
      } else {
        text = `Reading ${count} misc reports. Payroll must be recalculated after this is done.`;
      }
      spinnerID = await this.alert.showSpinnerPromise(text);
      // let j = await this.data.getReportOthers();
      let j = await this.data.updateFromDB('reports_other');
      // let k = await this.runWhenReady();
      let M:any;
      if(recalc) {
        M = await this.runWhenSubscriptionsAreAlreadyInitialized();
      }
      M = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addSuccess("SUCCESS", "Refreshed misc reports", 3000);
      // }, 500);
    } catch (err) {
      Log.l("Payroll.refreshOthers(): Error refreshing misc reports!");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("Error", `Error refreshing misc reports: '${err.message}'`, 10000);
    }
  }

  public async refreshLogistics(doNotRecalculate?:boolean, event?:any) {
    let spinnerID:string;
    try {
      let recalc:boolean = doNotRecalculate === true ? false : true;
      this.notify.addInfo("OK", "Refreshing logistics reports ...", 5000);
      await this.data.delay(500);
      // setTimeout(async () => {
      // let dbname:string = this.prefs.getDB('logistics');
      // let count:number = await this.db.getDocCount(dbname);
      let count:number = await this.db.getDBDocCount('logistics');
      let text:string;
      if(recalc) {
        text = `Reading ${count} logistics reports and recalculating...`;
      } else {
        text = `Reading ${count} logistics reports. Payroll must be recalculated after this is done.`;
      }
      spinnerID = await this.alert.showSpinnerPromise(text);
      // let j = await this.data.getReportLogistics();
      let j = await this.data.updateFromDB('logistics');
      // let k = await this.runWhenReady();
      let M:any;
      if(recalc) {
        M = await this.runWhenSubscriptionsAreAlreadyInitialized();
      }
      await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addSuccess("SUCCESS", "Refreshed logistics reports", 3000);
      // }, 500);
    } catch (err) {
      Log.l("refreshLogistics(): Error refreshing logistics reports!");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("Error", `Error refreshing logistics reports: '${err.message}'`, 10000);
    }
  }

  public toggleFlags(evt?:any) {
    this.prefs.CONSOLE.payroll.showAlerts = !this.prefs.CONSOLE.payroll.showAlerts;
  }

  public printf(...params):string {
    return sprintf(...params);
  }

  public async getReportsStatus(dbkey?:DatabaseKey):Promise<any> {
    let dbTotal = 0, rdbTotal = 0, dbDiff = 0;
    let key = dbkey && typeof dbkey === 'string' ? dbkey : 'reports';
    let spinnerID:string;
    try {
      Log.l(`Payroll.getReportsStatus(): Called with dbkey:`, dbkey);
      let dbname  = this.prefs.getDB(key);
      let db1     = this.db.addDB(dbname);
      let dbInfo  = await db1.info();
      dbTotal     = dbInfo.doc_count;
      let rdb1    = this.server.addRDB(dbname);
      let rdbInfo = await rdb1.info();
      rdbTotal    = rdbInfo.doc_count;
      dbDiff      = rdbTotal - dbTotal;
      if(dbDiff < 0) {
        dbDiff = Math.abs(dbDiff);
      }
      this.reportsLocalTotal = dbTotal;
      this.reportsRemoteTotal = rdbTotal;
      this.reportsRemoteTotal = dbDiff;
      Log.l(`Payroll.getReportsStatus(): For '${key}', local: ${dbTotal}, remote: ${rdbTotal}, remaining: ${dbDiff}`);
      // spinnerID = await this.alert.showSpinner(`readReports(): Reading reports for week '${date.format("DD MMM YYYY")}'...`);
      // let spinner = this.alert.getSpinner(spinnerID);
      // let res = await this.db.getAllReportsPlusNew(date)
      // Log.l("Payroll.readReports(): Read in:", res);
      // this.reports = res;
      // this.data.setData('reports', res);
      // this.updatePeriod(period);
      // await this.alert.hideSpinner(spinnerID);
      // }).catch(err => {
      //   Log.l("readReports(): Error reading reports for PayrollPeriod.");
      //   Log.e(err);
      //   this.alert.hideSpinner(spinnerID);
      //   this.notify.addError("ERROR", "Error reading reports for payroll period:<br>\n<br>\n" + err.message, 10000);
      // });
    } catch(err) {
      Log.l("Payroll.readReports(): Error reading reports for PayrollPeriod.");
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      this.notify.addError("ERROR", "Error reading reports for payroll period:<br>\n<br>\n" + err.message, 10000);
    }
  }
  
  public toggleStatusBar(evt?:Event):boolean {
    this.statusBarEnabled = !this.statusBarEnabled;
    Log.l("Payroll.toggleStatusBar(): Toggling status bar to:", this.statusBarEnabled);
    this.updateView();
    return this.statusBarEnabled;
    
  }

}

