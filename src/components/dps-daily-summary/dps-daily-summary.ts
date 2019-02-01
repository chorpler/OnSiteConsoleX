import { sprintf                                                                         } from 'sprintf-js'                           ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input              } from '@angular/core'                        ;
import { EventEmitter, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef        } from '@angular/core'                        ;
import { Subscription                                                                    } from 'rxjs'                    ;
import { ServerService                                                                   } from 'providers/server-service'             ;
import { DBService                                                                       } from 'providers/db-service'                 ;
import { AuthService                                                                     } from 'providers/auth-service'               ;
import { AlertService                                                                    } from 'providers/alert-service'              ;
import { NumberService                                                                   } from 'providers/number-service'             ;
import { Log, Moment, moment, dec, Decimal, oo,          _matchCLL, _matchSite           } from 'domain/onsitexdomain'              ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'                ;
import { DPS                                                                             } from 'domain/onsitexdomain'                ;
import { OSData                                                                          } from 'providers/data-service'               ;
// import { PDFService                                                                      } from 'providers/pdf-service'                ;
import { OptionsComponent                                                                } from 'components/options/options'           ;
import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                     ;
import { DispatchService                                                                 } from 'providers/dispatch-service'           ;
import { SelectItem, MenuItem,                                                           } from 'primeng/primeng'                      ;
import { NotifyService                                                                   } from 'providers/notify-service'             ;
import { NotificationComponent                                                           } from 'components/notification/notification' ;

export enum rowval {
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
  // percent        = 16,
  status = 16,
}
export enum rotation2sequence {
  "FIRST WEEK" = 'A',
  "CONTN WEEK" = 'B',
  "FINAL WEEK" = 'C',
  "DAYS OFF"   = 'D',
  "UNASSIGNED" = 'X',
}

@Component({
  selector   : 'dps-daily-summary',
  templateUrl: 'dps-daily-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DPSDailySummaryComponent implements OnInit {
  @ViewChild('DPSDailySummaryTable') DPSDailySummaryTable: ElementRef;
  @ViewChild('menuBtn') menuBtn                          : ElementRef;
  @ViewChild('menuTB') menuTB                            : ElementRef;
  @ViewChild('menu') menu                                : ElementRef;
  @ViewChild('btn') btn                                  : ElementRef;
  @Input('PayrollPeriod') period                         : PayrollPeriod               ;
  @Input('PayrollPeriods') periods                       : Array<PayrollPeriod>        ;
  @Input('ePeriod') ePeriod                              : Map<Employee,PayrollPeriod> ;
  @Input('shift') shift                                  : Shift                       ;
  @Input('tableMode') tableMode                          : string = "summary"          ;
  @Input('calcMode') calcMode                            : string = "schedule"         ;
  public     title                                       : string                      = "DPS Daily Summary" ;
  public     mode                                        : string                      = 'page'              ;
  public     psubscription                               : Subscription                                      ;
  public     ePsubscription                              : Subscription                                      ;
  public     shiftSubscription                           : Subscription                                      ;
  public     tableModeSubscription                       : Subscription                                      ;
  public     calcModeSubscription                        : Subscription                                      ;

  public     siteSummary1                                : Map<Jobsite,any>             = new Map()         ;
  public     siteSummary2                                : Map<Jobsite,any>             = new Map()         ;
  public     siteTotals                                  : any                                              ;
  public     siteTotals1                                 : any                                              ;
  public     siteTotals2                                 : any                                              ;
  public     siteGrid                                    : any                                              ;
  public     siteGrid1                                   : any                                              ;
  public     siteGrid2                                   : any                                              ;
  public     periodMenu                                  : Array<SelectItem>           = []                  ;
  public     menuItems                                   : Array<MenuItem>             = []                  ;
  public     eShift                                      : Map<Employee,Shift>         = new Map()           ;
  public     sites                                       : Array<Jobsite>              = []                  ;
  public     techs                                       : Array<Employee>             = []                  ;
  public     summaryDate                                 : Moment                                            ;
  public     workingTechs                                : number                      = 0                   ;
  public     workingTechs1                               : number                      = 0                  ;
  public     workingTechs2                               : number                      = 0                  ;
  // public     get dps()                                   : DPS { return OSData.dps;}                          ;
  public  dps                                            : DPS                         = this.data.dps       ;
  public     eRot                                        : Map<Employee,string>        = new Map()           ;
  public     dataGrid                                    : Array<Array<any>>           = []                  ;
  public     grid1                                       : Array<Array<any>>           = []                  ;
  public     grid2                                       : Array<Array<any>>           = []                  ;
  public     popupMode                                   : boolean                     = true                ;
  public     rowNumber                                   : Array<any>                  = []                  ;
  public     dataReady                                   : boolean                     = false               ;
  public     rowval                                      : any = rowval;

  constructor(
    public application:ApplicationRef,
    public changeDetector:ChangeDetectorRef,
    public zone:NgZone,
    public alert:AlertService,
    public db:DBService,
    public server:ServerService,
    public data:OSData,
    public dispatch:DispatchService,
    public notify:NotifyService
  ) {
    window['onsitedpsdailysummary'] = this;
    window['rotation2sequence']     = rotation2sequence;
  }

  ngOnInit() {
    Log.l("DPSDailySummaryComponent: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  ngOnDestroy() {
    Log.l("DPSDailySummaryComponent: ngOnDestroy() fired");
    this.changeDetector.detach();
    if(this.psubscription && !this.psubscription.closed) {
      this.psubscription.unsubscribe();
    }
    if(this.ePsubscription && !this.ePsubscription.closed) {
      this.ePsubscription.unsubscribe();
    }
    if(this.shiftSubscription && !this.shiftSubscription.closed) {
      this.shiftSubscription.unsubscribe();
    }
    if(this.tableModeSubscription && !this.tableModeSubscription.closed) {
      this.tableModeSubscription.unsubscribe();
    }
    if(this.calcModeSubscription && !this.calcModeSubscription.closed) {
      this.calcModeSubscription.unsubscribe();
    }
    // this.calcGridSubscription.unsubscribe();
  }

  public runWhenReady() {
    this.sites = this.data.getData('sites').filter((a:Jobsite) => {
      return a.site_active;
    }).sort((a:Jobsite,b:Jobsite) => {
      let sA = a.sort_number;
      let sB = b.sort_number;
      return sA < sB ? -1 : sA > sB ? 1: 0;
    });

    this.installSubscribers();
    this.updateShift(this.shift);
    this.dataReady = true;
  }

  public installSubscribers() {
    this.psubscription = this.dispatch.periodUpdated().subscribe((periodObject: any) => {
      Log.l("DPSDailySummary(): period observable updated!")
      let period: PayrollPeriod = periodObject.period;
      this.updatePeriod(period);
      this.updateView('update');
    });
    this.ePsubscription = this.dispatch.employeePeriodMapUpdated().subscribe((ePeriodObject: any) => {
      Log.l("DPSDailySummary(): ePeriod observable updated!")
      let ePeriod: Map<Employee, PayrollPeriod> = ePeriodObject.ePeriod;
      this.ePeriod = ePeriod;
      this.createDataGrid();
      this.updateView('update');
    });
    this.shiftSubscription = this.dispatch.shiftUpdated().subscribe((shiftObject: any) => {
      Log.l("DPSDailySummary(): shift observable updated!")
      let shift: Shift = shiftObject.shift;
      this.shift = shift;
      this.updateShift(shift);
      this.updateView('update');
    });
    this.tableModeSubscription = this.dispatch.tableModeUpdated().subscribe((tableModeObject: any) => {
      Log.l("DPSDailySummary(): tableMode observable updated!")
      let tableMode: string = tableModeObject.tableMode;
      // this.tableMode = tableMode;
      this.setTableMode(tableMode);
      this.updateTitle();
    });
    this.calcModeSubscription = this.dispatch.calcModeUpdated().subscribe((calcModeObject: any) => {
      Log.l("DPSDailySummary(): calcMode observable updated!")
      let calcMode: string = calcModeObject.mode;
      // this.calcMode = calcMode;
      this.setCalculationMode(calcMode);
      this.updateTitle();
    });
  }

  public updateShift(shift:Shift) {
    this.createShiftMap();
    this.createDataGrid();
    this.summaryDate = moment(shift.getShiftDate());
    this.updateTitle();
    this.updateView('update');
  }

  public updateTitle() {
    let title = `DPS Daily Summary for ${this.summaryDate.format("dddd, MMM DD, YYYY")} (${this.calcMode} mode)`;
    this.title = title;
    this.updateView('update');
  }

  public updateView(param?: string) {
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

  public createShiftMap() {
    let ep     = this.ePeriod;
    let date   = this.shift.getShiftDate();
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

  public createDataGrid() {
    let i          = 1;
    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA                                          = this.data.getFullClient(a.client);
      let cliB                                          = this.data.getFullClient(b.client);
      let locA                                          = this.data.getFullLocation(a.location);
      let locB                                          = this.data.getFullLocation(b.location);
      let lidA                                          = this.data.getFullLocID(a.locID);
      let lidB                                          = this.data.getFullLocID(b.locID);
      let usrA                                          = a.getTechName();
      let usrB                                          = b.getTechName();
      !  (cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !  (cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !  (locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !  (locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !  (lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !  (lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
          cliA                                          = cliA ? cliA : 0;
          cliB                                          = cliB ? cliB : 0;
          locA                                          = locA ? locA : 0;
          locB                                          = locB ? locB : 0;
          lidA                                          = lidA ? lidA : 0;
          lidB                                          = lidB ? lidB : 0;
      let rotA                                          = a.rotation;
      let rotB                                          = b.rotation;
      let rsA                                           = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB                                           = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1: locA < locB ? -1 : locA > locB ? 1: lidA < lidB ? -1 : lidA > lidB ? 1: rsA < rsB ? -1 : rsA > rsB ? 1: usrA < usrB ? -1 : usrA > usrB ? 1: 0;
    };

    let es       = this.eShift;
    let grid1    = [], grid2 = [];
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
    let sites                     = this.sites;
    let wt1                       = 0, wt2 = 0;
        this.techs                = alltechs;
    let eRot:Map<Employee,string> = new Map();
    for(let tech of alltechs) {
      let rotation = this.data.getTechRotationForDate(tech, this.summaryDate);
      let seq      = rotation2sequence[rotation];
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
      // let hours       = shift.getNormalHours();
      let hours       = shift.getBillableHours();
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
    this.workingTechs  = wt1;

    let siteSummary1:Map<Jobsite,any> = new Map();
    let siteSummary2:Map<Jobsite,any> = new Map();

    let transDaily  = this.dps.getTransportationDaily();
    let fuelDaily   = this.dps.getFuelDaily();
    let insDaily    = this.dps.getInsuranceDaily();
    let officeDaily = this.dps.getInternalSalariesDaily();
    for(let site of sites) {
      if(Number(site.site_number) === 1075) {
        continue;
      }
      let siteName = site.getScheduleName();
      let techs    = alltechs.filter((a:Employee) => {
        let cli = _matchCLL(a.client, site.client);
        let loc = _matchCLL(a.location, site.location);
        let lid = _matchCLL(a.locID, site.locID);
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
        name    : site.schedule_name,
        number  : site.site_number,
        billed  : new dec(0),
        expenses: new dec(0),
        zero    : new dec(0),
        get profit() { return this.billed.minus(this.expenses); },
        get percent() { return this.billed.eq(0) ? this.zero : this.profit.div(this.billed).times(100); },
      };
      let siteTotals2 = {
        name    : site.schedule_name,
        number  : site.site_number,
        billed  : new dec(0),
        expenses: new dec(0),
        zero    : new dec(0),
        get profit() { return this.billed.minus(this.expenses); },
        get percent() { return this.billed.eq(0) ? this.zero : this.profit.div(this.billed).times(100); },
      };

      for(let tech of techs) {
        let name       = tech.getUsername();
        let shft:Shift = es.get(tech);
        if(!shft) {
          Log.l(`createDataGrid(): es.get(${name}) did not exist:\n`, shft);
          continue;
        }
        let shift:Shift    = shft;
        let paidHours      = shift.getPayrollHours();
        let billedHours    = shift.getBillableHours();
        let seq            = eRot.get(tech);
        let techStatus:any = {workingFromShift: false, workingFromHours: false, sequence: seq};
        let hoursVac       = shift.getVacationHours();
        let hoursTrvl      = shift.getTravelHours();
        let hoursTrng      = shift.getTrainingHours();
        let hoursStby      = shift.getStandbyHours();
        let payRate        = tech.payRate;
        let billRate       = site.billing_rate;
        let payroll        = new dec(payRate).times(paidHours);
        let billing        = new dec(billRate).times(billedHours);

        let lodging        = new dec(0) ;
        let perDiem        = new dec(0) ;
        let transportation = new dec(0) ;
        let fuel           = new dec(0) ;
        let insurance      = new dec(0) ;
        let office         = new dec(0) ;

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
          lodging                     = new dec(site.lodging_rate);
          perDiem                     = new dec(site.per_diem_rate);
          transportation              = new dec(transDaily).div(this.workingTechs1);
          fuel                        = new dec(fuelDaily).div(this.workingTechs1);
          insurance                   = new dec(insDaily).div(this.workingTechs1);
          office                      = new dec(officeDaily).div(this.workingTechs1);
        }
        if(billedHours) {
          techStatus.workingFromHours = true;
          lodging2                    = new dec(site.lodging_rate);
          perDiem2                    = new dec(site.per_diem_rate);
          transportation2             = new dec(transDaily).div(this.workingTechs2);
          fuel2                       = new dec(fuelDaily).div(this.workingTechs2);
          insurance2                  = new dec(insDaily).div(this.workingTechs2);
          office2                     = new dec(officeDaily).div(this.workingTechs2);
        }
        // let transportation2 = new dec(transDaily).div(this.workingTechs);
        // let fuel2           = new dec(fuelDaily).div(this.workingTechs);
        // let insurance2      = new dec(insDaily).div(this.workingTechs);
        // let office2         = new dec(officeDaily).div(this.workingTechs);
        // }
        let miscExps             = new dec(0);
        let miscExps2            = new dec(0);
        let vacation             = new dec(hoursVac);
        let travel               = new dec(hoursTrvl);
        let training             = new dec(hoursTrng);
        let standby              = new dec(hoursStby);
        let expenses             = new dec(0).plus(payroll).plus(lodging).plus(perDiem).plus(miscExps).plus(vacation).plus(travel).plus(training).plus(standby).plus(transportation).plus(fuel).plus(insurance).plus(office);
        let expenses2            = new dec(0).plus(payroll).plus(lodging2).plus(perDiem2).plus(miscExps2).plus(vacation).plus(travel).plus(training).plus(standby).plus(transportation2).plus(fuel2).plus(insurance2).plus(office2);
        let profit1              = new dec(billing).minus(expenses);
        let profit2              = new dec(billing).minus(expenses2);
        let percent              = billing.eq(0) ? new dec(0) : new dec(profit1).div(billing).times(100);
        let percent2             = billing.eq(0) ? new dec(0) : new dec(profit2).div(billing).times(100);
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
    let allTotals1        = {
      billed  : new dec(0),
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
      billed  : new dec(0),
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
      let site                = entry[0];
      let stats               = entry[1];
          allTotals1.billed   = allTotals1.billed.plus(stats.billed);
          allTotals1.expenses = allTotals1.expenses.plus(stats.expenses);
      // siteTotals.profit = siteTotals.profit.plus(stats.profit);
    }
    for(let entry of this.siteSummary2) {
      let site                = entry[0];
      let stats               = entry[1];
          allTotals2.billed   = allTotals2.billed.plus(stats.billed);
          allTotals2.expenses = allTotals2.expenses.plus(stats.expenses);
      // siteTotals.profit = siteTotals.profit.plus(stats.profit);
    }
    // siteTotals.percent = siteTotals.billed.eq(0) ? new dec(0) : siteTotals.profit.div(siteTotals.billed).times(100);
    this.grid1       = grid1;
    this.grid2       = grid2;
    this.dataGrid    = grid1;
    this.siteGrid1   = Array.from(siteSummary1);
    this.siteGrid2   = Array.from(siteSummary2);
    this.siteGrid    = this.siteGrid1;
    this.siteTotals1 = allTotals1;
    this.siteTotals2 = allTotals2;
    this.siteTotals  = allTotals1;
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

  public chooseShift(shift:Shift, period:PayrollPeriod) {
    let date = shift.getShiftDate();
    Log.l("chooseShift(): Shift, period, and this.period are:\n", shift, period, this.period);
    if(this.period === period) {
      Log.l("chooseShift(): Shift changed to:\n", shift);
      this.shift       = shift;
      this.summaryDate = moment(shift.getShiftDate());
      this.createShiftMap();
      this.createDataGrid();
      this.title = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    } else {
      Log.l("chooseShift(): Period and shift changed to:\n", period, shift);
      this.period      = period;
      this.shift       = shift;
      this.summaryDate = moment(shift.getShiftDate());
      this.ePeriod     = this.data.createEmployeePeriodMap(period);
      this.createShiftMap();
      this.createDataGrid();
      this.title = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    }
    this.toggleCalculationMode();
    this.toggleCalculationMode();
  }

  public updatePeriod(period:PayrollPeriod) {
    Log.l("updatePeriod(): Period changed to:\n", period);
    this.period = period;
  }

  public updateWorkingTechCount() {
    let grid              = this.dataGrid;
    let mode              = this.calcMode;
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

  public setCalculationMode(mode:string) {
    if(mode === 'reports') {
      this.calcMode   = 'reports';
      this.dataGrid   = this.grid2;
      this.siteGrid   = this.siteGrid2;
      this.siteTotals = this.siteTotals2;
    } else {
      this.calcMode   = 'schedule';
      this.dataGrid   = this.grid1;
      this.siteGrid   = this.siteGrid1;
      this.siteTotals = this.siteTotals1;
    }
    Log.l("setCalculationMode(): mode set to '%s'", mode);
    // this.title = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    // Log.l("toggleCalculationMode(): Mode toggled to '%s'", this.calcMode);
  }

  public setTableMode(mode:string) {
    this.tableMode = mode;
    Log.l("setTableMode(): Mode set to '%s'", mode);
  }

  public toggleDetailMode() {
    if(this.tableMode === 'summary') {
      this.tableMode = 'detail';
    } else {
      this.tableMode = 'summary';
    }
    Log.l("toggleDetailMode(): Mode toggled to '%s'", this.tableMode);
  }

  public toggleCalculationMode() {
    if(this.calcMode === 'reports') {
      this.calcMode   = 'schedule';
      this.dataGrid   = this.grid1;
      this.siteGrid   = this.siteGrid1;
      this.siteTotals = this.siteTotals1;
    } else {
      this.calcMode   = 'reports';
      this.dataGrid   = this.grid2;
      this.siteGrid   = this.siteGrid2;
      this.siteTotals = this.siteTotals2;
    }
    this.title = `DPS Daily Summary (${this.summaryDate.format("MMM DD YYYY")}) (${this.calcMode})`;
    Log.l("toggleCalculationMode(): Mode toggled to '%s'", this.calcMode);
  }

  public decimalize(value:number):Decimal {
    return new dec(value);
  }

}
