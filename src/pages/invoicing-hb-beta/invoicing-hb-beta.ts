/*  TODO (2018-07-03)
    - Change report count display in title to show matching report count (DONE 2018-07-05)
    - Actually generate invoices via generate button (DONE 2018-07-05)
    - Figure out better layout for menu buttons

    2018-07-05:
    - Fix invoice generation doubling
    - Sorting options?
*/

import { Subscription                                         } from 'rxjs'                          ;
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, } from '@angular/core'                 ;
import { ViewChildren, QueryList, ContentChildren,            } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams                  } from 'ionic-angular'                 ;
import { ViewController                                       } from 'ionic-angular'                 ;
import { Log, Moment, moment, oo, _matchCLL, _matchReportSite } from 'domain/onsitexdomain'          ;
import { isMoment,                                            } from 'domain/onsitexdomain'          ;
import { _sortTechs, _sortTechsByFullName, _dedupe,           } from 'domain/onsitexdomain'          ;
import { Employee, Report, ReportOther, Shift,                } from 'domain/onsitexdomain'          ;
import { PayrollPeriod, Jobsite, Schedule, Schedules,         } from 'domain/onsitexdomain'          ;
import { Invoice,                                             } from 'domain/onsitexdomain'          ;
import { OSData,                                              } from 'providers/data-service'        ;
import { ServerService,                                       } from 'providers/server-service'      ;
import { DBService,                                           } from 'providers/db-service'          ;
import { Preferences, DatabaseKey,                                         } from 'providers/preferences'         ;
import { DispatchService,                                     } from 'providers'                     ;
import { AlertService,                                        } from 'providers/alert-service'       ;
import { NotifyService,                                       } from 'providers/notify-service'      ;
import { NumberService,                                       } from 'providers/number-service'      ;
import { InvoiceService,                                      } from 'providers/invoice-service'     ;
import { SpinnerService,                                      } from 'providers/spinner-service'     ;
import { Command, KeyCommandService,                          } from 'providers/key-command-service' ;
import { OptionsGenericComponent,                             } from 'components/options-generic'    ;
import { SelectItem,                                          } from 'primeng/api'                   ;
import { Dropdown,                                            } from 'primeng/dropdown'              ;
import { MultiSelect,                                         } from 'primeng/multiselect'           ;
import { Dialog,                                              } from 'primeng/dialog'                ;
import { ReportViewComponent                                  } from 'components/report-view'        ;
import { InvoiceHBComponent                                   } from 'components/invoice-hb'         ;

var MAX_LINES    : number = 27;
// const SUMMARY_LINES: number = 10;
enum gridcol {
  date   = 0,
  tech   = 1,
  unit   = 2,
  wonum  = 3,
  hours  = 4,
  total  = 5,
  report = 6,
}
enum sumcol {
  unit  = 0,
  hours = 1,
  total = 2,
  fill1 = 3,
  fill2 = 4,
  fill3 = 5,
  fill4 = 6,
}

const _sortSites = (a:Jobsite, b:Jobsite) => {
  if(a instanceof Jobsite && b instanceof Jobsite) {
      if(a instanceof Jobsite && b instanceof Jobsite) {
        let nA:string = a.getSiteSelectName();
        let nB:string = b.getSiteSelectName();
        return nA > nB ? 1 : nA < nB ? -1 : 0;
      } else {
        return 0;
      }
  }
};

const _sortReportsByColumn = (field:string, direction:number) => {
  return (a:Report, b:Report) => {
    if(a instanceof Report && b instanceof Report) {
      let aV = a[field];
      let bV = b[field];
      if(!aV) {
        return 1;
      }
      if(!bV) {
        return -1;
      }
      if(direction === 0) {
        return aV > bV ? 1 : aV < bV ? -1 : 0;
      } else {
        return aV > bV ? -1 : aV < bV ? 1 : 0;
      }
    }
  };
};

@IonicPage({name: "Invoicing HB Beta"})
@Component({
  selector: 'page-invoicing-hb-beta',
  templateUrl: 'invoicing-hb-beta.html',
})
export class InvoicingHBBetaPage implements OnInit,OnDestroy {
  @ViewChild('printArea') printArea:ElementRef;
  @ViewChild('reportView') reportView:ReportViewComponent;
  @ViewChild('reportViewTarget') reportViewTarget:ElementRef;
  @ViewChild('reportViewDialog') reportViewDialog:Dialog;
  @ViewChild('printIframe') printIframe:ElementRef;
  @ViewChild('optionsComponent') optionsComponent:OptionsGenericComponent;
  @ViewChildren(InvoiceHBComponent) invoiceComponents:QueryList<InvoiceHBComponent>;

  public invoiceOpenVisible: boolean              = false                           ;
  public iframeVisible     : boolean              = false                           ;
  public reportViewVisible : boolean              = false                           ;
  public reportViewTitle   : string               = "Report"                        ;
  public dialogTarget      : string               = "reportViewTarget"              ;
  public dialogLeft        : number               = 250                             ;
  public dialogTop         : number               = 100                             ;
  public period            : PayrollPeriod                                          ;
  public invoice           : Invoice                                                ;
  public site              : Jobsite                                                ;
  public tech              : Employee                                               ;
  public report            : Report                                                 ;
  public dbUpdate          : Subscription                                           ;
  public dsSubscription    : Subscription                                           ;
  public sortSub           : Subscription                                           ;
  public gridcol           : any                  = gridcol                         ;
  public sumcol            : any                  = sumcol                          ;
  public MAX_LINES         : number               = MAX_LINES                       ;
  // public SUMMARY_LINES     : number               = SUMMARY_LINES                   ;
  public logoPath          : string               = "assets/images/SESALogoBlue.svg";
  public transactionTotal  : number               = 0                               ;
  public transactionCount  : number               = 0                               ;
  public totalUnitHours    : number               = 0                               ;
  public totalUnitBilled   : number               = 0                               ;
  public totalHours        : number               = 0                               ;
  public totalBilled       : number               = 0                               ;
  public billedText        : string               = ""                              ;
  public modalMode         : boolean              = false                           ;
  public dataReady         : boolean              = false                           ;
  public summary           : Array<Array<any>>    = [[ ]]                           ;
  public invoiceGrid       : Array<Array<any>>    = [[ ]]                           ;
  public sites             : Array<Jobsite>       = [   ]                           ;
  public reports           : Array<Report>        = [   ]                           ;
  public allReports        : Array<Report>        = [   ]                           ;
  public matchReports      : Array<Report>        = [   ]                           ;
  public invoices          : Array<Invoice>       = [   ]                           ;
  public oldInvoices       : Array<Invoice>       = [   ]                           ;
  public techs             : Array<Employee>      = [   ]                           ;
  public periods           : Array<PayrollPeriod> = [   ]                           ;
  public periodList        : SelectItem[]         = [   ]                           ;
  public siteList          : SelectItem[]         = [   ]                           ;
  public sorts             : Array<number>        = [-1,-1,-1,-1,-1,-1]             ;




  public title          :string  = "Invoicing HB"      ;
  public optionsVisible :boolean = false               ;
  public optionsType    :string  = 'other'             ;
  // public optionsType    :string  = 'invoicinghb'       ;

  // public MAX_LINES   :number          = 15 ;
  public mode        :string     = 'rw'    ;
  public shiftreport :any                  ;
  public shiftreports:Array<any>      = [] ;
  // public tech        :Employee             ;
  public allEmployees:Array<Employee> = [] ;
  // public techs       :Array<Employee> = [] ;
  // public allReports  :Array<Report>   = [] ;
  public allShifts   :Array<Shift>    = [] ;
  // public site        :Jobsite              ;
  // public sites       :Array<Jobsite>  = [] ;
  // public period      :PayrollPeriod        ;
  // public periods     :PayrollPeriod[] = [] ;
  public schedule    :Schedule             ;
  public schedules   :Schedule[]      = [] ;
  public allSchedules:Schedules            ;
  public shift       :Shift                ;
  public shifts      :Shift[]      = []    ;
  public siteMenu    :SelectItem[] = []    ;
  public shiftMenu   :SelectItem[] = []    ;
  public techMenu    :SelectItem[] = []    ;
  public colorMap    :Object               ;
  public selectedDate:string               ;
  public selectedDates:Array<string> = []  ;
  public previousDates:Array<string> = []  ;
  public selectedSite:Jobsite              ;
  public selectedTech:Employee             ;
  public selTechs    :Array<string> = []   ;
  public selectedTechs:Array<Employee> = [];
  public opacity     :number       = 1     ;
  public keySub      :Subscription         ;
  public sub         :Subscription         ;
  public ePeriod     :Map<Employee,PayrollPeriod> = new Map();

  constructor(
    public viewCtrl       : ViewController    ,
    public navCtrl        : NavController     ,
    public navParams      : NavParams         ,
    public alert          : AlertService      ,
    public prefs          : Preferences       ,
    public data           : OSData            ,
    public server         : ServerService     ,
    public notify         : NotifyService     ,
    public spinner        : SpinnerService    ,
    public dispatch       : DispatchService   ,
    public invoiceService : InvoiceService    ,
    public numServ        : NumberService     ,
    public keyService     : KeyCommandService ,
  ) {
    window['invoicinghbbeta']  = this;
    window['invoicinghbbeta2'] = this;
    window['p'] = this;
    window['_dedupe'] = _dedupe;
  }

  ngOnInit() {
    Log.l("InvoicingHBBetaPage: ngOnInit() fired!");
    // if(this.data.isAppReady()) {
    //   if(this.navParams.get('mode') !== undefined) {
    //     this.mode = this.navParams.get('mode');
    //   }
    //   if(this.navParams.get('reports') !== undefined) {
    //     this.reports = this.navParams.get('reports');
    //     this.getAllData();
    //     this.generateShiftReportsForReports(this.reports);
    //     this.generateDropdownMenus();
    //     this.dataReady = true;
    //   } else {
    //     this.runOnDelay();
    //   }
    // }
    if(this.data.isAppReady()) {
      // this.runWhenReady();
      this.runOnDelay();
    }
  }

  ngOnDestroy() {
    Log.l("InvoicingHBBetaPage: ngOnDestroy() fired!");
    this.cancelSubscriptions();
  }

  public runOnDelay() {
    setTimeout(() => {
      this.runWhenReady();
    }, 500);
  }

  public runWhenReady() {
    Log.l("InvoicingHBBeta: running when ready...");
    if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
    this.initializeSubscriptions();
    this.runWhenSubscriptionsAreAlreadyInitialized();
  }

  public initializeSubscriptions() {
    this.keySub = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "InvoicingHBPage.showOptions": this.showOptions(command.ev); break;
      }
    });
    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe((data:{type:DatabaseKey, payload:any}) => {
      let key = data.type;
      let payload = data.payload;
      // if(key === 'reports' || key === 'reports_ver101100') {
      if(key === 'reports' || key.includes('ver101100')) {
          // this.data.setData('reports', payload);
        setTimeout(() => {
          this.runWhenSubscriptionsAreAlreadyInitialized();
        }, 500);
      }
    });
    // this.sortSub = this.dispatch.invoiceSorted().subscribe((columns:Array<number>) => {
    this.sortSub = this.dispatch.invoiceEventFired().subscribe((data:{channel:string,event?:any}) => {
      Log.l(`InvoicingHBPage: Got sort event with parameters: `, data);
      let channel:string = data && data.channel ? data.channel : null;
      let event:any = data && data.event ? data.event : null;
      if(channel) {
        if(channel === 'sort') {
          let columns:number[] = event;
          let col:number = columns[0];
          let dir:number = columns[1];
          if(this.reports.length) {
            this.sorts = [-1, -1, -1, -1, -1, -1];
            this.sorts[col] = dir;
            if(col === 0) {
              let reports:Report[] = this.reports.sort(_sortReportsByColumn('report_date', dir));
              this.reports = reports;
            } else if(col === 1) {
              let reports:Report[] = this.reports.sort(_sortReportsByColumn('technician', dir));
              this.reports = reports;
            } else if(col === 2) {
              let reports:Report[] = this.reports.sort(_sortReportsByColumn('unit_number', dir));
              this.reports = reports;
            } else if(col === 3) {
              let reports:Report[] = this.reports.sort(_sortReportsByColumn('work_order_number', dir));
              this.reports = reports;
            } else if(col === 4) {
              let reports:Report[] = this.reports.sort(_sortReportsByColumn('repair_hours', dir));
              this.reports = reports;
            } else if(col === 5) {
              // let reports:Report[] = this.reports.sort(_sortReportsByColumn('', dir));
              // this.reports = reports;
            } else {
            }
            this.invoices = [];
            Log.l(`InvoicingHBPage: sorts is now ${JSON.stringify(this.sorts)}`);
            Log.l(`InvoicingHBPage: Reports is now:\n`, this.reports);
            this.generateInvoiceGrid();
          } else {
            this.sorts = [-1, -1, -1, -1, -1, -1];
            this.sorts[col] = dir;
          }
        } else if(channel === 'date') {
          let date:Moment = moment(event);
          if(isMoment(date)) {
            this.setInvoicesField('date', date);
          }
        } else if(channel === 'po') {
          let po_number:string = event;
          this.setInvoicesField('po_number', po_number);
        } else if(channel === 'invoice_number') {
          let invoice_number:number = event;
          this.setInvoicesField('invoice_number', invoice_number);
        }
      }
    });
  }

  public async runWhenSubscriptionsAreAlreadyInitialized() {
    try {
      // this.getData();
      this.initializeData();
      this.generateDropdownMenus();
      // // this.updateSite(this.site);
      // // this.updateShift(this.selectedDate);
      // this.initializeInvoice();
      // // this.initializeDropdownMenus();
      // this.parameterChange();
      // this.generateSelectedReports();
      // this.generateInvoiceGrid();
      this.updateSite(this.site);
      // this.generateInvoiceGrid();
      this.dataReady = true;
      this.setPageLoaded();
    } catch(err) {
      Log.l(`runWhenSubscriptionsAreAlreadyInitialize(): Error during data initialization and/or recalculation`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public cancelSubscriptions() {
    if(this.keySub && !this.keySub.closed) {
      this.keySub.unsubscribe();
    }
    if(this.dsSubscription && !this.dsSubscription.closed) {
      this.dsSubscription.unsubscribe();
    }
    if(this.sortSub && !this.sortSub.closed) {
      this.sortSub.unsubscribe();
    }
    if(this.sub && !this.sub.closed) {
      this.sub.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public getAllData() {
    this.schedules = this.data.getSchedules();
    let allSchedules:Schedules = this.data.schedules;
    let techs:Employee[] = this.data.getData('employees');
    let sites:Jobsite[] = this.data.getData('sites');

    this.allSchedules = allSchedules;
    this.techs = techs;
    this.sites = sites;
    this.allReports = this.data.getData('reports');
    this.allEmployees = this.techs;

    let weeks:number = this.prefs.CONSOLE.global.payroll_periods || 4;
    Log.l(`InvoicingHBBeta.getAllData(): Creating payroll periods back '${weeks}' weeks...`);

    this.periods = this.data.createPayrollPeriods(weeks);
    this.period  = this.periods[0];
  }

  public getData() {
    this.schedules = this.data.getSchedules();
    let allSchedules:Schedules = this.data.schedules;
    let techs:Employee[] = this.data.getData('employees');
    let sites:Jobsite[] = this.data.getData('sites');

    if(!this.prefs.CONSOLE.techshiftreports.showAllTechs) {
      techs = techs.filter((a:Employee) => {
        return a.active && a.userClass[0].toUpperCase() !== 'OFFICE' && a.userClass[0].toUpperCase() !== 'MANAGER';
      });
    }

    if(!this.prefs.CONSOLE.techshiftreports.showAllSites) {
      sites = sites.filter((a:Jobsite) => {
        return a.site_active && a.site_number !== 1;
      });
    }

    this.allSchedules = allSchedules;
    this.techs = techs;
    this.sites = sites;
    this.allReports = this.data.getData('reports');
    this.allEmployees = this.techs;

    let weeks:number = this.prefs.CONSOLE.techshiftreports.payroll_periods || this.prefs.CONSOLE.global.payroll_periods || 4;
    Log.l(`InvoicingHBBeta.getData(): Creating payroll periods back '${weeks}' weeks...`);

    this.periods = this.data.createPayrollPeriods(weeks);
    this.period  = this.periods[0];
  }

  public generateDropdownMenus(event?:any) {
    let menuShifts:SelectItem[] = [];
    let techs:Employee[] = this.techs;
    let sites:Jobsite[] = this.sites;
    if(!this.prefs.CONSOLE.techshiftreports.showAllTechs) {
      techs = this.techs.filter((a:Employee) => {
        return a.active && a.userClass[0].toUpperCase() !== 'OFFICE' && a.userClass[0].toUpperCase() !== 'MANAGER';
      });
    }

    if(!this.prefs.CONSOLE.techshiftreports.showAllSites) {
      sites = this.sites.filter((a:Jobsite) => {
        return a.site_active && a.site_number !== 1;
      });
    }
    let periods:PayrollPeriod[] = this.periods;
    let allShifts:Shift[]       = [];
    // let list:SelectItem[]       = [];
    let shiftList:SelectItem[]  = [];
    let periodNumber = 0;
    let itemIndex = 0;
    for(let period of periods) {
      let periodName = period.getPeriodName("DD MMM");
      // let shifts = period.getPayrollShifts().reverse();
      let shifts:Shift[] = period.getPayrollShifts();
      // shifts = shifts.reverse();
      let periodTitle = `Pay Period ${periodName}`;
      let periodItem = {label: periodTitle, value: String(itemIndex++), divider: true };
      shiftList.push(periodItem);
      let count:number = shifts.length;
      // for(let shift of shifts) {
      for(let i = count - 1; i >= 0; i--) {
        let shift:Shift = shifts[i];
        allShifts.push(shift);
        let shiftDate  = shift.getShiftDate();
        let label = shiftDate.format("DD MMM YYYY");
        let value = shiftDate.format("YYYY-MM-DD");
        let shiftItem:any = { label: label, value: value, divider: false };
        shiftList.push(shiftItem);
        itemIndex++;
      }
    }
    this.allShifts = allShifts;
    this.shifts = allShifts.slice(0);

    // let count = sites.length;
    let menuSites:SelectItem[] = [];
    for(let site of this.sites) {
      if(site.site_number !== 1) {
        let name = site.getSiteSelectName();
        let item:SelectItem = { 'label': name, 'value': site };
        menuSites.push(item);
      }
    }

    let menuTechs:SelectItem[] = [];
    for(let tech of techs) {
      let name = tech.getTechName();
      let user = tech.getUsername();
      let item:SelectItem = { 'label': name, 'value': user };
      menuTechs.push(item);
    }
    this.shiftMenu = shiftList;
    this.siteMenu  = menuSites;
    this.techMenu  = menuTechs;

    this.selectedDates = [];
    this.selTechs = [];
    this.site = menuSites[1].value;
  }

  public getColor(payroll_date:number):string {
    let colorMap:any = this.colorMap || {};
    if(colorMap[payroll_date]) {
      return colorMap[payroll_date];
    } else {
      colorMap[payroll_date] = this.getRandomColor();
      this.colorMap = colorMap;
      return colorMap[payroll_date];
    }
  }

  public getRandomColor(alpha?:number) {
    let R:number, G:number, B:number, A:number;
    R = this.data.random(180, 240, 20);
    G = this.data.random(180, 240, 20);
    B = this.data.random(180, 240, 20);
    // A = this.data.random(0, 255, 20);
    A = 1;
    if(alpha !== undefined) {
      let val = Number(alpha);
      A = val || 1;
    }
    return `rgba(${R}, ${G}, ${B}, ${A})`;
  }

  public generateShiftReport(date:Moment,tech:Employee,site:Jobsite):any {
    let shiftreport:any = {};
    let username = tech.getUsername();
    let day = date.format("YYYY-MM-DD");
    let reports:Report[] = this.allReports.filter((a:Report) => {
      if(a instanceof Report) {
        let uA = a.username;
        let dA = a.report_date;
        return uA === username && dA === day && a.matchesSite(site);
      } else {
        return false;
      }
    }).sort((a:Report, b:Report) => {
      if(a instanceof Report && b instanceof Report) {
        let sA = a.getStartTime().toExcel();
        let sB = b.getStartTime().toExcel();
        return sA > sB ? 1 : sA < sB ? -1 : 0;
      } else {
        return 0;
      }
    });
    Log.l(`generateShiftReport(): for date '${date.format("YYYYMMDD")} and tech '${username}' and site '${site.site_number}' ...`)
    Log.l(`generateShiftReport(): started with reports:\n`, reports);
    let total = 0;
    shiftreport.date = date.format("MMM DD YYYY");
    shiftreport.site = site;
    shiftreport.tech = tech;
    shiftreport.grid = [];
    for(let report of reports) {
      let row = [
        report.unit_number,
        report.work_order_number,
        report.notes,
        report.time_start.format("HH:mm"),
        report.time_end.format("HH:mm"),
        report.repair_hours,
      ];
      total += report.repair_hours;
      shiftreport.grid.push(row);
    }
    shiftreport.total_hours = total;
    let lines = shiftreport.grid.length;
    let blank_lines = this.MAX_LINES - lines;
    for (let i = 0; i < blank_lines; i++) {
      let row = ["", "", "", "", "", ""];
      shiftreport.grid.push(row);
    }
    return shiftreport;
  }

  public generateSelectedReports(event?:any):Report[] {
    let dates:string[] = this.selectedDates || [];
    let techUsers:string[]  = this.selTechs || [];
    let site:Jobsite = this.site;
    let reports:Report[];
    if(!(this.allReports && this.allReports.length)) {
      Log.l(`generateSelectedReports(): No reports loaded, quitting.`);
      return;
    }
    if(site) {
      reports = this.allReports.filter((a:Report) => {
        if(a instanceof Report) {
          return a.matchesSite(site);
        } else {
          return false;
        }
      });
    } else {
      reports = this.allReports.slice(0);
    }
    if(dates && dates.length) {
      reports = reports.filter((a:Report) => {
        if(a instanceof Report) {
          let dA:string = a.report_date;
          return dates.indexOf(dA) > -1;
        } else {
          return false;
        }
      });
    } else {
    }
    if(techUsers && techUsers.length) {
      reports = reports.filter((a:Report) => {
        if(a instanceof Report) {
          let uA:string = a.username;
          return techUsers.indexOf(uA) > -1;
        } else {
          return false;
        }
      });
    }
    // let reports:Report[] = this.allReports.filter((a:Report) => {
    //   if(a instanceof Report && a.username && a.report_date) {
    //     let uA:string = a.username;
    //     let dA:string = a.report_date;
    //     return techUsers.indexOf(uA) > -1 && dates.indexOf(dA) > -1;
    //   } else {
    //     return false;
    //   }
    // });
    let count:number = reports.length;
    Log.l(`generateSelectedReports(): Returned '${count}' reports:\n`, reports);
    this.shiftreports = reports;
    this.matchReports = reports;
    if(site && dates && dates.length && techUsers && techUsers.length) {
      this.reports = this.matchReports;
    } else {
      this.reports = [];
    }
    return reports;
    // let shifts:Shift[] = this.shifts.filter((a:Shift) => {
    //   if(a instanceof Shift) {
    //     let shift_date = a.getShiftDate().format("YYYY-MM-DD");
    //     return dates.indexOf(shift_date) > -1;
    //   } else {
    //     return false;
    //   }
    // }).sort((a:Shift,b:Shift) => {
    //   if(a instanceof Shift && b instanceof Shift) {
    //     let dA = a.getShiftDate().toExcel();
    //     let dB = b.getShiftDate().toExcel();
    //     return dA > dB ? -1 : dA < dB ? 1 : 0;
    //   } else {
    //     return 0;
    //   }
    // });
    // Log.l(`generateSelectedReports(): shifts result is:\n`, shifts);
    // let techs:Employee[] = this.allEmployees.filter((a:Employee) => {
    //   if(a instanceof Employee) {
    //     let username = a.getUsername();
    //     return techUsers.indexOf(username) > -1;
    //   } else {
    //     return false;
    //   }
    // }).sort((a:Employee,b:Employee) => {
    //   if(a instanceof Employee && b instanceof Employee) {
    //     let nA = a.getFullName();
    //     let nB = b.getFullName();
    //     return nA > nB ? 1 : nA < nB ? -1 : 0;
    //   } else {
    //     return 0;
    //   }
    // });
    // Log.l(`generateSelectedReports(): techs result is:\n`, techs);
    // // let date:Moment = moment(, "YYYY-MM-DD");
    // // let techs:Array<Employee> = this.selectedTechs;
    // // let site:Jobsite = this.site;
    // Log.l("generateSelectedReports(): Now running with techs and shifts and dates:\n", techs);
    // Log.l(shifts);
    // Log.l(dates);
    // // this.shiftreports = this.shiftreports || [];
    // let reports:Report[] = [];
    // for(let tech of techs) {
    //   let user:string = tech.getUsername();
    //   for(let shift of shifts) {
    //     let shiftDate:Moment = shift.getShiftDate();
    //     let dateString:string = shiftDate.format("YYYY-MM-DD");
    //     let reports:Report[] = this.allReports.filter((a:Report) => {
    //       if(a instanceof Report) {
    //         let uA:string = a.username;
    //         let dA:string = a.report_date;
    //         return uA === user && dA === dateString;
    //       } else {
    //         return false;
    //       }
    //     });
    //     // let shiftreport = this.generateShiftReport(shiftDate, tech, site);
    //     // Log.l("shiftreport is:\n", shiftreport)
    //     // if(shiftreport && shiftreport.grid && shiftreport.grid.length) {
    //     //   let hasData = false;
    //     //   outerloop:
    //     //   for(let row of shiftreport.grid) {
    //     //     for(let col of row) {
    //     //       if(col) {
    //     //         hasData = true;
    //     //         break outerloop;
    //     //       }
    //     //     }
    //     //   }
    //     //   if(hasData) {
    //     //     reports.push(shiftreport);
    //     //   }
    //     //   // this.notify.addSuccess("SUCCESS", "Shift report generated successfully.", 3000);
    //     // } else {
    //     //   let errText = `Could not generate shift report for '${tech.getTechName()}' on '${shiftDate.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
    //     //   this.notify.addWarn("ALERT", errText, 5000);
    //     // }
    //   }
    // }
    // this.shiftreports = reports;
    // let count:number = reports.length;
    // Log.l(`generateSeledtedReports(): `)
    // return reports;
  }

  public generateShiftReportsForReports(reports:Report[]) {
    Log.l(`generateShiftReportsForReports(): called with report list:\n`, reports);
    let reportList:Report[] = reports.sort((a:Report,b:Report) => {
      if(a instanceof Report && b instanceof Report) {
      let uA = a.username;
      let uB = b.username;
      let dA = a.report_date;
      let dB = b.report_date;
      return uA > uB ? 1 : uA < uB ? -1 : dA > dB ? 1 : dA < dB ? -1 : 0;
      } else {
        return 0;
      }
    });

    let techNames:string[]    = _dedupe(reportList.map((a:Report) => a.username)).sort((a:string,b:string) => { return a > b ? 1 : a < b ? -1 : 0});
    let reportDates:string[]  = _dedupe(reportList.map((a:Report) => a.report_date));
    let reportSites:Jobsite[] = [], reportSiteIDs:string[] = [], tmp1 = [], tmp2 = [];
    for(let report of reportList) {
      for(let site of this.sites) {
        if(report.matchesSite(site)) {
          reportSites.push(site);
          reportSiteIDs.push(site._id);
        }
      }
    }

    reportSiteIDs = _dedupe(reportSiteIDs, '_id');
    reportSites = this.sites.filter((a:Jobsite) => {
      return reportSiteIDs.indexOf(a._id) > -1;
    });

    Log.l(`generateShiftReportsForReports(): calculated techNames, reportDates, and sites:\n`, techNames);
    Log.l(reportDates);
    Log.l(reportSites);
    let shiftReports = [];
    for(let site of reportSites) {
      for(let rptDate of reportDates) {
        let date = moment(rptDate, "YYYY-MM-DD");
        for(let name of techNames) {
          let tech = this.allEmployees.find((a:Employee) => {
            return a.username === name;
          });
          if(tech) {
            let shiftreport = this.generateShiftReport(date, tech, site);
            let valid = this.checkShiftReportGrid(shiftreport);
            if(valid) {
              shiftReports.push(shiftreport);
            } else {
              let errText = `Could not generate shift report for '${tech.getTechName()}' on '${date.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
              this.notify.addWarn("ALERT", errText, 5000);
            }
          }
        }
      }
    }
    this.shiftreports = shiftReports;
    Log.l(`generateShiftReportsForReports(): Result`);
    return shiftReports;
  }

  public checkShiftReportGrid(shiftreport:any) {
    if(shiftreport && shiftreport.grid && shiftreport.grid.length) {
      let hasData = false;
      // outerloop:
      for(let row of shiftreport.grid) {
        for(let col of row) {
          if(col) {
            return true;
            // hasData = true;
            // break outerloop;
          }
        }
      }
    }
    return false;
    //   if(hasData) {
    //     return true;
    //     this.shiftreports.push(shiftreport);
    //   }
    //   // this.notify.addSuccess("SUCCESS", "Shift report generated successfully.", 3000);
    // } else {
      // let errText = `Could not generate shift report for '${tech.getTechName()}' on '${shiftDate.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
      // this.notify.addWarn("ALERT", errText, 5000);
    // }
  }

  // public generateSelectedShiftReports(event?:any) {
  //   let selectedDates:Array<string> = this.selectedDates || [];
  //   let selTechs:Array<string> = this.selTechs || [];
  //   let site = this.site || this.siteMenu[0].value;
  //   let dates:Array<string> = this.selectedDates || [];
  //   for(let selectedDate of selectedDates) {
  //     let date:Moment = moment(selectedDate, "YYYY-MM-DD");
  //     // let techs:Array<Employee> = this.selectedTechs;
  //     // let site:Jobsite = this.site;
  //     for(let tech of techs) {
  //       let shiftreport = this.generateShiftReport(date, tech, site);
  //       this.shiftreports = this.shiftreports || [];
  //       if(shiftreport && shiftreport.grid && shiftreport.grid.length && shiftreport.grid[0][0] !== "") {
  //         this.shiftreports.push(shiftreport);
  //         // this.notify.addSuccess("SUCCESS", "Shift report generated successfully.", 3000);
  //       } else {
  //         let errText = `Could not generate shift rpeort for '${tech.getTechName()}' on '${date.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
  //         this.notify.addWarn("ALERT", errText, 5000);
  //       }
  //     }

  //   }
  //   return this.shiftreports;
  // }

  public clearReports(event?:any) {
    this.shiftreports = [];
    this.notify.addSuccess("SUCCESS", "Shift Reports cleared.", 3000);
  }

  public checkSelectedTechs(selTechs:Array<string>, event?:any):Employee[] {
    let chosenTechs:Array<Employee>;
    chosenTechs = this.techs.filter((a:Employee) => {
      return selTechs.indexOf(a.username) !== -1;
    }).sort((a:Employee,b:Employee) => {
      if(a instanceof Employee && b instanceof Employee) {
        let uA = a.getFullName();
        let uB = b.getFullName();
        return uA > uB ? 1 : uA < uB ? -1 : 0;
      } else {
        return 0;
      }
    });
    this.selectedTechs = chosenTechs;
    this.generateSelectedReports();
    return chosenTechs;
  }

  public checkShiftSelections(dateList?:string[], event?:any) {
    let dateStrings:string[] = dateList || this.selectedDates;
    Log.l(`checkShiftSelections(): Shifts selected are:\n`, dateStrings);
    let selections:Array<string> = dateStrings.sort((a:string,b:string) => {
      return a > b ? -1 : a < b ? 1 : 0;
    });
    let pSelections:Array<string> = this.previousDates ? this.previousDates : [];

    for(let sel of selections) {
      if(sel.length < 10) {
        // This is the stringified index of a payroll period
        let idx = Number(sel);
        let idx1 = pSelections.indexOf(sel);
        if(idx1 === -1) {
          // this is a newly checked "payroll period" menu item, so we need to check the next 7 items
          let start = idx + 1, end = idx + 8;
          for(let i = start; i < end; i++) {
            let val = this.shiftMenu[i].value;
            let j = selections.indexOf(val);
            if(j === -1) {
              selections.push(val);
            }
          }
        }
      }
    }
    for(let sel of pSelections) {
      if(sel.length < 10) {
        // This is the stringified index of a payroll period
        let idx = Number(sel);
        let selIndex = selections.indexOf(sel);
        if(selIndex === -1) {
          // This is a removed checkbox for a payroll period, so we need to uncheck the next 7 items
          let start = idx + 1, end = idx + 8;
          for(let i = start; i < end; i++) {
            let val = this.shiftMenu[i].value;
            let j = selections.indexOf(val);
            if(j > -1) {
              selections.splice(j, 1);
            }
          }
        }
      }
    }
    let tmpList = selections.filter(a => {
      return a.length > 5;
    });
    let shifts:Array<Shift> = [];
    let len = tmpList.length;
    for(let i = 0; i < len; i++) {
      let selection = tmpList[i];
      let shift = this.allShifts.find(a => a.getShiftDate().format("YYYY-MM-DD") === selection);
      shifts.push(shift);
    }
    this.shifts = shifts;
    pSelections = selections.slice(0);
    this.previousDates = pSelections;
    if(this.shifts && this.shifts.length) {
      this.matchReports = this.allReports.filter((a:Report) => {
        if(a instanceof Report) {
          return a.matchesSite(this.site) && this.selectedDates.indexOf(a.report_date) > -1;
        } else {
          return false;
        }
      });
    }
    this.generateTechList();
    this.generateSelectedReports();
  }

  public generateTechList():Employee[] {
    // let dates:Moment[] = this.selectedDates.filter((a:string) => a.length === 10).map((a:string) => moment(a, "YYYY-MM-DD"));
    let dates:string[] = this.selectedDates.filter((a:string) => a.length === 10);
    // let techs:Employee[] = [];
    let site:Jobsite = this.site;
    // let techSet:Set<Employee> = new Set();
    let techNamesSet:Set<string> = new Set();
    let datedReports:Report[] = this.matchReports.filter((a:Report) => {
      if(a instanceof Report) {
        return dates.indexOf(a.report_date) > -1;
      } else {
        return false;
      }
    });
    for(let report of datedReports) {
      techNamesSet.add(report.username);
    }
    // for(let date of dates) {
    //   // let schedule:Schedule = this.allSchedules.getScheduleForDate(date);
    //   // let scheduledTechs:Employee[] = schedule.getAllTechsForSite(site);
    //   let
    //   scheduledTechs.forEach((a:Employee) => {
    //     techSet.add(a);
    //   });
    //   // techs = [...techs, ...scheduledTechs];
    // }
    let techNames:string[] = Array.from(techNamesSet);
    let techs:Employee[] = this.allEmployees.filter((a:Employee) => {
      if(a instanceof Employee) {
        return techNames.indexOf(a.username) > -1;
      } else {
        return false;
      }
    }).sort(_sortTechsByFullName);
    // let techs:Employee[] = Array.from(techSet).sort(_sortTechsByFullName);
    // techs = _dedupe(techs, 'username');
    // let techs = this.techs.filter((a:Employee) => {
    //   let techSite = this.data.getTechLocationForDate(a, date);
    //   return techSite.site_number === site.site_number;
    // });
    this.selTechs = [];
    let menuTechs:SelectItem[] = [];
    for(let tech of techs) {
      let name = tech.getTechName();
      let user = tech.getUsername();
      let item:SelectItem = { 'label': name, 'value': user };
      menuTechs.push(item);
    }
    this.selectedTechs = techs;
    this.techMenu = menuTechs;
    if(menuTechs.length) {
      this.tech = this.techMenu[0].value;
    }
    return techs;
  }


  public updateShifts(selDates:Array<string>, event?:any) {

  }

  public updateShift(selDate:string, event?:any) {
    let sDate = selDate || this.selectedDate;
    let selectedDate = moment(selDate, "YYYY-MM-DD");
    Log.l("updateShift(): Shift set to '%s'", selectedDate.format("YYYY-MM-DD"));
    this.selectedDates = [selDate];
    // let date = moment(selectedDate);
    // let strDate = date.format("YYYY-MM-DD");
    let selectedShift:Shift, selectedPeriod:PayrollPeriod;
    outerloop: for(let period of this.periods) {
      let shifts = period.getPayrollShifts();
      for(let shift of shifts) {
        let shiftDate = shift.getShiftDate();
        let strShiftDate = shiftDate.format("YYYY-MM-DD");
        if(strShiftDate === selDate) {
          selectedShift = shift;
          selectedPeriod = period;
          break outerloop;
        }
      }
    }
    let dateString  = selectedDate.format("DD MMM YYYY");
    if(selectedShift) {
      let selectedPeriodID = selectedPeriod.getPayrollSerial();
      let currentPeriodID  = this.period.getPayrollSerial();
      if(selectedPeriodID !== currentPeriodID) {
        // this.notify.addInfo("CHANGING PAY PERIOD...", `Payroll Period must change and be recalculated...`, 3000);
        this.period = selectedPeriod;
        Log.l("updateShift(): Also updating period...");
        this.spinner.showSpinner("Payroll Period changed, recalculating...");
        setTimeout(() => {
          this.ePeriod = this.data.createEmployeePeriodMap(selectedPeriod);
          this.spinner.hideSpinner();
          this.notify.addSuccess("PAYPERIOD CHANGED", `Payroll Period and Shift date changed to ${dateString}`, 3000);
        }, 750);
      } else {
        this.notify.addSuccess("SHIFT CHANGED", `Shift date changed to ${dateString}`, 3000);
      }
    } else {
      this.notify.addError("ERROR", `Could not find shift for date ${dateString}!`, 10000);
    }
  }

  // public updateSite(site:Jobsite, event?:any) {
  //   Log.l("updateSite(): Site set to:\n", site);
  //   this.generateTechList();
  // }

  public updateTech(tech:Employee) {
    Log.l("updateTech(): Tech set to:\n", tech);
    let date = moment(this.selectedDate);
    let techSite = this.data.getTechLocationForDate(tech, date);
    let menuSite = this.siteMenu.find((a:SelectItem) => {
      return a.value.site_number === techSite.site_number;
    }).value;
    if(menuSite) {
      this.site = menuSite;
    }
    this.selectedTechs = [
      tech
    ];
  }

  public updateTechs(selTechs:Array<Employee>) {
    Log.l("updateTechs(): Techs set to:\n", selTechs);
    let date = moment(this.selectedDate);
    for(let tech of selTechs) {
      let techSite = this.data.getTechLocationForDate(tech, date);
      let menuSite = this.siteMenu.find((a:SelectItem) => {
        return a.value.site_number === techSite.site_number;
      }).value;
    }
    // if(menuSite) {
    //   this.site = menuSite;
    // }
  }

  public printReports() {
    window.print();
  }

  public showOptions(event?:MouseEvent|KeyboardEvent) {
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public optionsSaved(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsSaved(): Event is:\n", event);
    let prefs = this.prefs.getPrefs();
    this.data.savePreferences(prefs).then(res => {
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
    }).catch(err => {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    });
  }



  public initializeData() {
    this.getData();
    let sites:Jobsite[] = this.data.getData('sites').filter((a:Jobsite) => {
      if(a instanceof Jobsite) {
        return a.client.name === "HB" && a.schedule_name !== 'DUNCAN MAINTENANCE SHOP';
      } else {
        return false;
      }
    });
    this.sites = sites.sort(_sortSites);
    this.site = this.sites[0];

    this.periods = this.data.createPayrollPeriods();
    this.period = this.periods[0];
    let start = moment(this.period.start_date);
    let end   = moment(this.period.end_date);

    this.allReports = this.data.getData('reports');
    this.techs = this.data.getData('employees');
    this.sorts = [ -1, -1, -1, -1, -1, -1, ];
  }

  public initializeInvoice(ivc?:Invoice):Invoice {
    let site:Jobsite = this.site;
    let invoice:Invoice = ivc ? ivc : new Invoice();
    // if(ivc) {
    //   invoice = ivc;
    // } else {
    //   invoice = new Invoice();
    // }
    invoice.invoice_number         = "0";
    invoice.number                 = "0";
    invoice.type                   = "HB";
    invoice.address                = site.address.clone();
    // invoice.address.street.street1 = site.address.street.street1;
    // invoice.address.street.street2 = site.address.street.street2;
    // invoice.address.city           = site.address.city;
    // invoice.address.state          = site.address.state;
    // invoice.address.zipcode        = site.address.zipcode;
    invoice.site                   = site;
    invoice.period_start           = moment(this.period.start_date).format("YYYY-MM-DD");
    if(site.client.name === 'KN') {
      invoice.customer_name = "Keane Group";
      invoice.customer_number = "SES100";
    } else if(site.client.name === 'HB') {
      invoice.customer_name = "Halliburton";
    } else if(site.client.name === 'BE') {
      invoice.customer_name = "Basic Energy Services";
    } else {
      invoice.customer_name = "Unknown";
    }
    invoice.site_number            = site.site_number;
    invoice.site_name              = site.getInvoiceName();
    invoice.date                   = moment();

    invoice.grid = [];
    invoice.summary_grid = [];
    invoice.total_billed = 0;
    invoice.total_astext = "";
    invoice.total_unit_hours = 0;
    invoice.total_unit_billed = 0;
    invoice.total_hours_billed = 0;
    return invoice;
  }

  public storeAndGenerateNewInvoice(ivc:Invoice):Invoice {
    // this.invoices = this.invoices || [];
    this.invoices.push(ivc);
    let invoice = this.initializeInvoice();
    return invoice;
  }


  public parameterChange() {
    this.invoices = [];
    let period = this.period;
    let site = this.site;
    let start = moment(period.start_date).format("YYYY-MM-DD");
    let end   = moment(period.end_date).format("YYYY-MM-DD");

    this.reports = this.allReports.filter((a:Report) => {
      if(a instanceof Report) {
        let report_date = a.report_date;
        return report_date >= start && report_date <= end && _matchReportSite(a, site);
      } else {
        return false;
      }
    }).sort(this.sortReports);
  }

  public sortReports(a:Report, b:Report):number {
    if(a instanceof Report && b instanceof Report) {
      let out = 0;
      let tmpA: any = a.unit_number ? a.unit_number : "SHOP";
      let tmpB: any = b.unit_number ? b.unit_number : "SHOP";
      let tstA = Number(tmpA);
      let tstB = Number(tmpB);
      let uA = isNaN(tstA) ? String(tmpA).trim() : tstA;
      let uB = isNaN(tstB) ? String(tmpB).trim() : tstB;
      let dbg = `sortReports(): Comparing '${uA}' and '${uB}': `;
      if (typeof uA === 'number' && typeof uB === 'number') {
        out = uA > uB ? 1 : uA < uB ? -1 : 0;
      } else if (typeof uA === 'string' && typeof uB === 'string') {
        if (uA === 'SHOP' && uB === 'SHOP') {
          out = 0;
        } else if (uA === 'SHOP') {
          out = 1;
        } else if (uB === 'SHOP') {
          out = -1;
        } else {
          out = uA > uB ? 1 : uA < uB ? -1 : 0;
        }
      } else if (!uA && !uB) {
        out = 0;
      } else if (uA === undefined || !uA) {
        out = 1;
      } else if (uB === undefined || !uB) {
        out = -1;
      } else if (typeof uA === 'number') {
        out = -1;
      } else if (typeof uB === 'number') {
        out = 1;
      } else {
        out = 0;
      }
      dbg += `${out} ... `;
      if (out === 0) {
        let dA = a.report_date;
        let dB = b.report_date;
        out = dA > dB ? 1 : dA < dB ? -1 : 0;
        dbg += `'${dA}' to '${dB}': ${out} ... `
      }
      if (out === 0) {
        let tA = a.technician;
        let tB = b.technician;
        out = tA > tB ? 1 : tA < tB ? -1 : 0;
        dbg += `'${tA}' to '${tB}': ${out} ... `
      }
      dbg += ` RESULT: ${out}`
      return out;
    } else {
      return 0;
    }
  }

  public updatePeriod(period:PayrollPeriod) {
    this.period = period;
    Log.l("updatePeriod(): Called with period:\n", period);
    this.parameterChange();
    // this.initializeInvoice();
    // this.generateInvoiceGrid();

  }

  public updateSite(site:Jobsite) {
    this.site = site;
    Log.l("updateSite(): Called with site:\n", site);
    this.generateTechList();
    // this.parameterChange();
    // this.initializeInvoice();
    if(this.allReports && this.allReports.length) {
      this.invoices = [];

      this.generateSelectedReports();
      this.generateInvoiceGrid();
    }
  }

  public viewReport(report:Report|string) {
    if(typeof report === 'string') {
      return;
    } else {
      let tech = this.getTech(report);
      let site = this.getSite(report);
      let rowIndex = this.reports.indexOf(report);
      this.report = report;
      this.tech = tech;
      this.site = site;
      let data = { report: report, reports: this.reports, tech: tech, site: site };
      Log.l(`editReport(${rowIndex}): Editing with data:\n`, data);
      this.updateHeader(rowIndex + 1);
      this.showReport();
    }
  }

  public showReport() {
    this.reportViewVisible = true;
  }

  public hideReport() {
    this.reportViewVisible = false;
  }

  public toggleReport() {
    this.reportViewVisible = !this.reportViewVisible;
  }

  public updateHeader(index:number) {
    let idx = index;
    let count = this.reports.length;
    this.reportViewTitle = `Report (${index} / ${count})`;
  }

  public updateReport(event:any) {
    Log.l("updateReport(): Received event:\n", event);
    this.reportViewVisible = false;
  }

  public changeReport(event:any) {
    let count = this.reports.length;
    let index = event;
    this.reportViewTitle = `Report (${index+1} / ${count})`;
  }

  public getTech(report:Report) {
    let name = report.username;
    this.tech = this.techs.find((a:Employee) => {
      return a.username === name;
    });
    return this.tech;
  }

  public getSite(report:Report) {
    let cli  = this.data.getFullClient(report.client);
    let loc  = this.data.getFullLocation(report.location);
    let lid  = this.data.getFullLocID(report.location_id);
    let site = this.sites.find((a:Jobsite) => {
      let client = cli.name.toUpperCase();
      let location = loc.name.toUpperCase();
      let locID = lid.name.toUpperCase();
      let siteClient   = a.client.name;
      let siteLocation = a.location.name;
      let siteLocID    = a.locID.name;
      return siteClient === client && siteLocation === location && siteLocID === locID;
    });
    this.site = site;
    return site;
  }

  public printInvoices(event?:any) {  window.print(); }

  public copyTable(event?:any) {
    let table = this.printArea.nativeElement;
    let el = table.innerHTML;
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
    this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
  }

  public refreshData(event?:any) {
    this.parameterChange();
    this.initializeInvoice();
    this.generateInvoiceGrid();
  }

  public async numberInvoices(event?:any) {
    Log.l("numberInvoices(): Event is:\n", event);
    let count = this.invoices.length;
    let invoice_numbers = await this.invoiceService.getNextInvoiceNumber('HB', count);
    for(let i = 0; i < count; i++) {
      let invoice:Invoice = this.invoices[i];
      let oldInvoiceNumber = invoice.getInvoiceNumber();
      let oldID = invoice.getInvoiceID();
      let invoice_number = invoice_numbers[i];
      invoice.invoice_number = String(invoice_number);
      let newID = invoice.generateInvoiceID();
    }
  }

  public getReportTooltip(report:Report|string) {
    if(report instanceof Report) {
      let out = `View Report ('${report._id}')`;
      return out;
    } else {
      return null;
    }
  }

  public openInvoices(event?: any) {
    Log.l("openInvoices(): Event is:\n", event);
    this.invoiceOpenVisible = true;
  }

  public invoicesOpen(event?:any) {
    Log.l("invoicesOpen(): Got event:\n", event);
    this.invoiceOpenVisible = false;
    let invoices = event || this.invoices || [];
    for(let invoice of invoices) {
      let site_number = invoice.site_number;
      let site = this.sites.find((a:Jobsite) => {
        return a.site_number === site_number;
      });
      invoice.site = site;
      for(let row of invoice.grid) {
        let report_id = row[gridcol.report];
        if(report_id !== '') {
          let report = this.reports.find((a:Report) => {
            return a._id === report_id;
          });
          row[gridcol.report] = report;
        }
      }
    }
    this.invoices = invoices;
  }

  public cancelOpen(event?:any) {
    Log.l("cancelOpen(): Got event:\n", event);
    this.invoiceOpenVisible = false;
  }

  public async saveInvoices(event?:any) {
    Log.l("saveInvoices(): User clicked with event:\n", event);
    try {
      let errorFlag = false;
      if(this.invoices.length === 0) {
        this.notify.addError("ERROR", "No invoices loaded or generated!", 6000);
        return;
      } else {
        for(let invoice of this.invoices) {
          if(!invoice.invoice_number || invoice.invoice_number == "0" || invoice.invoice_number.length < 1) {
            errorFlag = true;
            break;
          }
        }
      }

      if(errorFlag) {
        this.notify.addError("ERROR", "All invoices must have invoice numbers!", 6000);
        return;
      } else {
        let save = await this.alert.showConfirmYesNo("SAVE INVOICES", "Do you want to save these invoices to the server? They must be numbered first.");
        if (save) {
          for(let invoice of this.invoices) {
            if(invoice['_$visited'] !== undefined) {
              delete invoice['_$visited'];
            }
            for(let row of invoice.grid) {
              let reportValue:any = row[gridcol.report];
              if(reportValue instanceof Report) {
                let id = reportValue._id;
                row[gridcol.report] = id;
              }
              let dateField = row[gridcol.date];
              if(dateField !== "") {
                let date = moment(dateField, "DD MMM YYYY");
                row[gridcol.date] = date.format("YYYY-MM-DD");
              }
            }
          }
          this.transactionTotal = this.invoices.length;
          let results = await this.server.saveInvoices('HB', this.invoices);
          Log.l("saveInvoices(): Success, results were:\n", results);
          for(let result of results) {
            let id = result.id, rev = result.rev;
            let inv = this.invoices.find((a:Invoice) => {
              return a._id === id;
            });
            inv._rev = rev;
            for(let row of inv.grid) {
              let reportValue:any = row[gridcol.report];
              if(reportValue instanceof Report) {
                let id = reportValue._id;
                row[gridcol.report] = id;
              }
              let dateField = row[gridcol.date];
              if(dateField !== "") {
                let date = moment(dateField, "YYYY-MM-DD");
                row[gridcol.date] = date.format("DD MMM YYYY");
              }
            }
          }
          this.notify.addSuccess("SUCCESS", "Saved invoices successfully.", 3000);
        } else {

        }
      }
    } catch (err) {
      Log.l("saveInvoices(): Caught error!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving invoices: '${err.message}'`, 10000);
    }
  }

  public async clearInvoices(event?:any) {
    Log.l("clearInvoices(): User clicked with event:\n", event);
    try {
      let clear = await this.alert.showConfirmYesNo("CLEAR INVOICES", "Do you want to clear the current invoice display?");
      if (clear) {
        this.oldInvoices = this.invoices;
        this.invoices = [];
        this.notify.addInfo("CLEARED", "Invoice display cleared.", 3000);
      } else { }
    } catch (err) {
      Log.l("clearInvoices(): Caught error!");
      Log.e(err);
      this.notify.addError("ERROR", `Error clearing invoices: '${err.message}'`, 10000);
    }
  }

  public async generateInvoices(event?:any) {
    // this.initializeInvoice();
    this.generateInvoiceGrid();
  }

  public generateInvoiceGrid():Invoice {
    // let reports:Report[] = this.reports.sort(this.reportSort);
    // let reports:Report[] = this.generateSelectedReports();
    // let reports:Report[] = this.reports && this.reports.length ? this.reports : this.generateSelectedReports();
    let dates:string[] = this.selectedDates || [];
    let techUsers:string[]  = this.selTechs || [];
    // let site:Jobsite = this.site;
    let reports:Report[];
    if(!(this.reports && this.reports.length && dates && dates.length && techUsers && techUsers.length)) {
      Log.w(`generateInvoiceGrid(): Can't generate an invoice grid without site, date(s), and tech(s) selected.`);
      return;
    } else {
      reports = this.reports;
    }
    let invoices:Invoice[] = this.invoices;
    let invoice:Invoice = this.initializeInvoice();

    Log.l("generateInvoiceGrid(): Using reports array:\n", reports);
    let unitStats = {};
    let unitCounts = {};
    let unitData   = {};
    let totalUnitHours = 0;
    let totalUnitBilled = 0;
    let totalHours = 0;
    let totalBilled = 0;
    let site:Jobsite = this.site;
    let rate = Number(site.billing_rate);
    // let finalCrew:string = "";
    if(isNaN(rate)) {
      rate = 65;
    }
    let i = 0, j = 0;
    let grid_lines = 0, summary_lines = 0;
    // let crewList = this.getCrewList(reports);
    // for(let crew of crewList) {
    //   finalCrew = crew;
    //   let regex = new RegExp(`^crew[^1-9]*${crew}$`, 'i');
    //   let newReports = reports.filter((a:Report) => {
    //     return a.work_order_number.trim().match(regex);
    //   });
      // Log.l(`Crew ${crew}: ${newReports.length} matching reports.`);
    // let invoices:Invoice[] = this.invoices;
    for(let report of reports) {
      let date  = moment(report.report_date, "YYYY-MM-DD");
      let tech  = report.technician;
      let user  = report.username;
      let unit  = report.unit_number ? String(report.unit_number).trim() : "SHOP";
      let wonum = report.work_order_number ? String(report.work_order_number).trim() : "";
      let hours = report.repair_hours;
      let total = hours * rate;
      if(unitData[unit]) {
        if(unitData[unit][user]) {
          unitData[unit][user].hours += hours;
          unitData[unit][user].total += total;
          unitData[unit][user].reports.push(report);
          unitData[unit]['hours'] += hours;
          unitData[unit]['total'] += total;
        } else {
          unitData[unit][user] = {
            date: date.format("YYYY-MM-DD"),
            tech: tech,
            unit: unit,
            hours: hours,
            total: total,
            reports: [report],
          };
          unitData[unit]['hours'] += hours;
          unitData[unit]['total'] += total;
        }
      } else {
        unitData[unit] = {
          hours: hours,
          total: total,
        };
        unitData[unit][user] = {
          date: date.format("YYYY-MM-DD"),
          tech: tech,
          unit: unit,
          hours: hours,
          total: total,
          reports: [ report ],
        };
      }
      // invoice.unitData = unitData;
      let row   = [ date.format("DD MMM YYYY"), tech, unit, wonum, hours, total, report ];
      invoice.grid.push(row);
      grid_lines++;
      // Log.l(`generateInvoiceGrid(): Line ${grid_lines}: `, row);
      let unitTotalHours = unitStats[unit] || 0;
      unitTotalHours += hours;
      unitStats[unit] = unitTotalHours;
      if(unitCounts[unit] !== undefined) {
        unitCounts[unit]++;
      } else {
        unitCounts[unit] = 1;
      }
      i++;
      // if(grid_lines >= MAX_LINES || Object.keys(unitCounts).length >= SUMMARY_LINES) {
      if(grid_lines >= this.MAX_LINES) {
        Log.l(`generateInvoiceGrid(): grid line count ${grid_lines} is >= max_line count ${this.MAX_LINES}`);
        let count = 0;
        let units = Object.keys(unitStats);
        for(let unit of units) {
          let hours = unitStats[unit];
          let total = hours * rate;
          totalUnitHours += hours;
          totalUnitBilled += total;
          totalHours += hours;
          totalBilled += total;
          let row = [unit, hours, total, "", "", ""];
          invoice.summary_grid.push(row);
          summary_lines++;
        }
        // let max_summary_lines = this.SUMMARY_LINES;
        // count = max_summary_lines - invoice.summary_grid.length;
        // for (let i = 0; i < count; i++) {
        //   invoice.summary_grid.push(["", "", "", "", ""]);
        // }

        invoice.unit_counts        = unitCounts;
        invoice.total_unit_hours   = totalUnitHours;
        invoice.total_unit_billed  = totalUnitBilled;
        invoice.total_hours_billed = totalHours;
        invoice.total_billed       = totalBilled;
        invoice.total_astext       = this.numServ.toCurrency(totalBilled);
        invoice.customer_number    = "SES100";
        let max_lines = this.MAX_LINES;
        let gridLineCount = max_lines - invoice.grid.length;
        for (let i = 0; i < gridLineCount; i++) {
          invoice.grid.push(["", "", "", "", "", "", ""]);
        }
        // invoice.crew = String(Number(crew.slice(5)));
        // invoice.crew = crew;

        invoice.getTotalHours();
        invoice.getTechCount();
        invoice.getUnitCount();
        invoice.getTotalBilledAsText(this.numServ);
        invoice.getTotalBilled();
        let newInvoice:Invoice = this.storeAndGenerateNewInvoice(invoice);
        grid_lines      = 0         ;
        unitCounts      = {}        ;
        unitStats       = {}        ;
        summary_lines   = 0         ;
        totalUnitHours  = 0         ;
        totalUnitBilled = 0         ;
        totalHours      = 0         ;
        totalBilled     = 0         ;
        invoice         = newInvoice;
      }
    }
    let max_lines = this.MAX_LINES;
    let count = max_lines - invoice.grid.length;
    for(let i = 0; i < count; i++) {
      invoice.grid.push([ "", "", "", "", "", "" ]);
    }

    let units = Object.keys(unitStats);
    for(let unit of units) {
      let hours = unitStats[unit];
      let total = hours * rate;
      totalUnitHours  += hours;
      totalUnitBilled += total;
      totalHours      += hours;
      totalBilled     += total;
      let row = [unit, hours, total, "", "", ""];
      invoice.summary_grid.push(row);
    }
    // let max_summary_lines = this.SUMMARY_LINES;
    // count = max_summary_lines - invoice.summary_grid.length;
    // for(let i = 0; i < count; i++) {
    //   invoice.summary_grid.push(["", "", "", "", ""]);
    // }

    let billedText             = this.numServ.toCurrency(totalBilled);
    invoice.unit_counts        = unitCounts;
    invoice.total_unit_hours   = totalUnitHours;
    invoice.total_unit_billed  = totalUnitBilled;
    invoice.total_hours_billed = totalHours;
    invoice.total_billed       = totalBilled;
    invoice.total_astext       = billedText;
    // invoice.crew               = String(Number(finalCrew.slice(5)));
    // invoice.crew               = finalCrew;

    invoices.push(invoice);
    this.invoices = invoices;

    // let max_lines = this.MAX_LINES;
    // let count = max_lines - invoice.grid.length;
    // for(let i = 0; i < count; i++) {
    //   invoice.grid.push([ "", "", "", "", "", "" ]);
    // }

    // let units = Object.keys(unitStats);
    // for(let unit of units) {
    //   let hours = unitStats[unit];
    //   let total = hours * rate;
    //   totalUnitHours += hours;
    //   totalUnitBilled += total;
    //   totalHours += hours;
    //   totalBilled += total;
    //   let row = [unit, hours, total, "", "", ""];
    //   invoice.summary_grid.push(row);
    // }
    // let max_summary_lines = this.SUMMARY_LINES;
    // count = max_summary_lines - invoice.summary_grid.length;
    // for(let i = 0; i < count; i++) {
    //   invoice.summary_grid.push(["", "", "", "", ""]);
    // }

    // let billedText             = this.numServ.toCurrency(totalBilled);
    // invoice.unit_counts        = unitCounts;
    // invoice.total_unit_hours   = totalUnitHours;
    // invoice.total_unit_billed  = totalUnitBilled;
    // invoice.total_hours_billed = totalHours;
    // invoice.total_billed       = totalBilled;
    // invoice.total_astext       = billedText;
    // // invoice.crew               = String(Number(finalCrew.slice(5)));
    // invoice.crew               = finalCrew;

    // this.invoices.push(invoice);
    return invoice;
  }

  public reportSort(a:Report, b:Report) {
    let dA = a.report_date;
    let dB = b.report_date;
    let tA = a.technician;
    let tB = b.technician;
    let uA = a.unit_number;
    let uB = b.unit_number;
    return dA > dB ? 1 : dA < dB ? -1 : tA > tB ? 1 : tA < tB ? -1 : uA > uB ? 1 : uA < uB ? -1 : 0;
  }

  public sortUnitCounts(invoice:Invoice) {
    let unitCounts = invoice.unit_counts;
    let counts = [];
    for(let key in unitCounts) {
      let item = {unit: key, count: unitCounts[key] };
      counts.push(item);
    }
    counts.sort((a:any,b:any) => {
      let cA = a.count;
      let cB = b.count;
      return cA > cB ? -1 : cA < cB ? 1 : 0;
    });
    Log.l("sortUnitCounts(): Array is:\n", counts);
    return counts;
  }

  public async refreshReportData(event?:any) {
    try {
      this.notify.addInfo("OK", "Refreshing reports...", 5000);
      this.dispatch.triggerAppEvent('updatedata');
      // setTimeout(async () => {
      //   let j = await this.data.getReports();
      //   // let k = await this.data.getReportOthers();
      //   // let M = await this.runWhenReady();
      //   let M = await this.runWhenSubscriptionsAreAlreadyInitialized();
      //   this.notify.addSuccess("SUCCESS", "Refreshed data and recalculated payroll!", 3000);
      // }, 500);
    } catch (err) {
      Log.l("refreshData(): Error refreshing data!");
      Log.e(err);
      this.notify.addError("Error", `Error refreshing data: '${err.message}'`, 10000);
    }
  }

  public resetMenus(evt?:any) {
    this.generateDropdownMenus(evt);
    this.updateSite(this.site);
  }

  public setInvoicesField(field:string, value:any) {
    let invoices:Invoice[] = this.invoices;
    if(field === 'date') {
      let date:Moment = moment(value);
      // invoice.setDate(date);
        this.invoiceComponents.forEach((a:InvoiceHBComponent) => {
          a.setDate(date);
        });
    } else if(field === 'po_number' || field === 'invoice_number') {
      for(let invoice of invoices) {
        invoice[field] = value;
      }
    }
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

}
