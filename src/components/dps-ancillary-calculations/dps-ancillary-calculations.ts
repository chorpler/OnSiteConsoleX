import { Subscription                                                                    } from 'rxjs'                    ;
import { sprintf                                                                         } from 'sprintf-js'                           ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input              } from '@angular/core'                        ;
import { EventEmitter, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef        } from '@angular/core'                        ;
import { ServerService                                                                   } from 'providers/server-service'             ;
import { DBService                                                                       } from 'providers/db-service'                 ;
import { AuthService                                                                     } from 'providers/auth-service'               ;
import { AlertService                                                                    } from 'providers/alert-service'              ;
import { NumberService                                                                   } from 'providers/number-service'             ;
import { DispatchService                                                                 } from 'providers/dispatch-service'           ;
import { Log, Moment, moment, oo, _matchCLL, _matchSite, Decimal, dec                    } from 'domain/onsitexdomain'              ;
import { OSData                                                                          } from 'providers/data-service'               ;
// import { PDFService                                                                      } from 'providers/pdf-service'                ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'                ;
import { DPS,                                                                            } from 'domain/onsitexdomain'                ;
import { SelectItem                                                                      } from 'primeng/primeng'                      ;
import { NotifyService                                                                   } from 'providers/notify-service'             ;
import { NotificationComponent                                                           } from 'components/notification/notification' ;

export enum calcRows {
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

@Component({
  selector: 'dps-ancillary-calculations',
  templateUrl: 'dps-ancillary-calculations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DPSAncillaryCalculationsComponent implements OnInit,OnDestroy {
  @ViewChild('printArea') printArea      : ElementRef                  ;
  @ViewChild('DPSCalcTable') DPSCalcTable: ElementRef                  ;
  @Input('PayrollPeriod') period         : PayrollPeriod               ;
  @Input('PayrollPeriods') periods       : Array<PayrollPeriod>        ;
  @Input('ePeriod') ePeriod              : Map<Employee,PayrollPeriod> ;
  @Input('calcGrid') calcGrid            : Array<Array<any>>           =[] ;

  public title            : string                      = "DPS Ancillary Calculations" ;
  public techs            : Array<Employee>             = []                           ;
  public sites            : Array<Jobsite>              = []                           ;
  public dps              : DPS                         = this.data.dps                ;
  public psubscription    : Subscription                                               ;
  public ePsubscription   : Subscription                                               ;
  public calcGridSubscription : Subscription                                           ;

  public slices           : any                                                        ;
  public chartData        : Array<Array<any>>           = []                           ;
  public chartOptions     : any                                                        ;
  public chartType        : string                      = "PieChart"                   ;

  public schedules        : Array<Schedule>             = []                           ;
  public schedule         : Schedule                    ;
  // public periods          : Array<PayrollPeriod>        = []                           ;
  // public period           : PayrollPeriod               ;
  // public ePeriod       : Map<Employee,PayrollPeriod> = new Map()                    ;
  public allShifts        : Array<Shift>                = []                           ;
  public dataGrid         : Array<Array<any>>           = []                           ;
  public ancillaryGrid    : Array<Array<any>>           = []                           ;
  public ancillaryGrid2   : Array<Array<any>>           = []                           ;
  public ancillaryGrid3   : Array<Array<any>>           = []                           ;
  public ancillaryGrid4   : Array<Array<any>>           = []                           ;
  public ancillaryGrid3Totals:Array<any>                = []                           ;
  public ancillaryGrid4Totals:Array<any>                = []                           ;
  public dpsCalcGrid      : Array<Array<any>>           = []                           ;
  public billableHours    : number                      = 0                            ;
  public hourlyRate       : number                      = 65                           ;
  public grossRevenue     : Decimal                     = new dec(0)                   ;
  public techCosts        : Decimal                     = new dec(0)                   ;
  public estProfit        : Decimal                     = new dec(0)                   ;
  public estPercentDP     : Decimal                     = new dec(0)                   ;
  public totalTechCosts   : Decimal                     = new dec(0)                   ;
  public techCostsBreakdownHeader: string               = ""                           ;
  public periodSelectReady: boolean                     = false                        ;
  public periodList       : SelectItem[]                = []                           ;
  public dataReady        : boolean                     = false                        ;

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
    window['onsitedpsancillary'] = this;
    window['onsitedpsancillarycalculations'] = this;
  }

  ngOnInit() {
    Log.l('DPSAncillaryCalculationsComponent: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l('DPSAncillaryCalculationsComponent: ngOnDestroy() fired');
    this.updateView('detach');
    this.psubscription.unsubscribe();
    this.ePsubscription.unsubscribe();
    this.calcGridSubscription.unsubscribe();
  }

  public runWhenReady() {
    // this.dps = this.data.dps;
    this.ePeriod = this.ePeriod || new Map();
    // let periods = this.data.createPayrollPeriods();
    let periods = this.periods || [];
    this.dpsCalcGrid = this.calcGrid || [];
    let selectitems:SelectItem[] = [];
    // for(let period of periods) {
      //   let name = period.getPeriodName("DD MMM");
      //   let item:SelectItem = { label: name, value: period };
      //   selectitems.push(item);
      // }
    // this.periodList = selectitems;
    this.periods = periods || [];
    this.period = this.period || this.periods[0];
    let start = this.period.start_date.format("MMM DD");
    let end = this.period.end_date.format("MMM DD YYYY");
    this.techCostsBreakdownHeader = sprintf("Technician Costs for Payroll Period %s Through %s", start, end);
    this.installSubscribers();
    this.generateAncillaryData();
    this.runCalcGridSums();
    this.generateAncillaryDetailGrid();
    this.dataReady = true;
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

  public installSubscribers() {
    this.psubscription = this.dispatch.periodUpdated().subscribe((periodObject: any) => {
      Log.l("DPSAncillaryCalculations(): period observable updated!")
      let period: PayrollPeriod = periodObject.period;
      this.updatePeriod(period);
    });
    this.ePsubscription = this.dispatch.employeePeriodMapUpdated().subscribe((ePeriodObject: any) => {
      Log.l("DPSAncillaryCalculations(): ePeriod observable updated!")
      let ePeriod: Map<Employee, PayrollPeriod> = ePeriodObject.ePeriod;
      this.ePeriod = ePeriod;
    });
    this.calcGridSubscription = this.dispatch.dpsCalculationsGridUpdated().subscribe((grid: Array<Array<any>>) => {
      Log.l("DPSAncillaryCalculations(): DPSCalculationsGrid observable updated!")
      this.dpsCalcGrid = grid;
    });
  }

  public generateAncillaryData() {
    let ep = this.ePeriod;
    let periodBillableHours:number = 0;
    let periodExpenses:number = 0;
    for(let entry of ep) {
      let tech = entry[0];
      let period = entry[1];
      let techTotal:number = period.getBillableHours();
      periodBillableHours += techTotal;
    }
    Log.l("generateAncillaryData(): Billable hours calculated at: ", periodBillableHours);
    let hourlyRate = 65;
    let grossRevenue = new dec(periodBillableHours).times(hourlyRate);
    let internalSalariesPerTech = this.data.dps.internalPerTech;
    this.billableHours = periodBillableHours;
    this.grossRevenue = grossRevenue;
    return periodBillableHours;
  }

  public runCalcGridSums() {
    let grid = this.dpsCalcGrid;
    let costs = new dec(0);
    let profit = new dec(0);
    let egp = new dec(0);
    for(let row of grid) {
      let expenses:Decimal = row[26];
      costs = costs.plus(expenses);
    }
    this.techCosts = costs;
    profit = this.grossRevenue.minus(costs);
    this.estProfit = profit;

    if(!profit.eq(0)) {
      egp = profit.dividedBy(this.grossRevenue);
    }
    this.estPercentDP = egp;
  }

  public generateAncillaryDetailGrid() {
    // let grid = [];
    let calcGrid = this.dpsCalcGrid;

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
    this.ancillaryGrid2 = grid;

    let totalTechCosts = new dec(0);
    for(let row of grid) {
      totalTechCosts = totalTechCosts.plus(row[1]);
    }

    this.totalTechCosts = totalTechCosts;

    let total                = new dec(this.grossRevenue)   ;
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
    this.ancillaryGrid3 = grid3;

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

    this.ancillaryGrid3Totals = grid3total;

    let profit = new dec(this.estProfit);

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

    this.ancillaryGrid4 = grid4;

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
      slices: this.slices,
      width: 700,
      height: 500,
      tooltip: { isHtml: true }
    };

    this.chartOptions = chartOptions;
    this.slices = slices;
    this.chartData = chartData;

    return grid;
  }

  public generateAncillaryCategoryGrid() {
    let calcGrid = this.dpsCalcGrid;
    let total = this.grossRevenue;

  }

  public generateAncillaryDistributionGrid() {
    let calcGrid = this.dpsCalcGrid;

  }

  public generateDPSCalculations(period:PayrollPeriod) {
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

    this.ePeriod = this.data.createEmployeePeriodMap(period);
    let allEmployees = this.data.getData('employees');
    // let employees = allEmployees.filter((a:Employee) => {
    //   let userclass = Array.isArray(a.userClass) ? a.userClass[0].toUpperCase() : typeof a.userClass === 'string' ? a.userClass.toUpperCase() : "M-TECH";
    //   return a.active === true && a.client && a.location && a.locID && userclass !== 'MANAGER';
    // }).sort(_sortTechs);
    let datagrid = this.generateGridData();
    this.dataGrid = datagrid;
  }

  public countWorkingTechs() {
    let e = this.ePeriod;
    let working_techs = 0;
    for(let entry of e) {
      let tech:Employee = entry[0];
      let period:PayrollPeriod = entry[1];
      let hours = period.getBillableHours();
      if(hours > 0) {
        working_techs++;
      }
    }
    return working_techs;
  }

  public generateGridData() {
    let techs = this.techs.slice(0);
    let e = this.ePeriod;
    let grid = [];
    let i = 0;
    // let working_techs = this.dps.getWorkingTechs();
    let working_techs = this.countWorkingTechs();
    this.dps.setWorkingTechs(working_techs);
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
          /* 17 new dec(0), */
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
    Log.l("generateGridData(): Created grid:\n", grid);
    return grid;
  }

  public updatePeriod(period:PayrollPeriod) {
    this.dataReady = false;
    this.alert.showSpinner("Setting period to " + period.getPeriodName("MMM DD") + " ...");
    setTimeout(() => {
      try {
        this.generateDPSCalculations(period);
        this.alert.hideSpinner();
        this.dataReady = true;
      } catch(err) {
        this.alert.hideSpinner();
        this.alert.showAlert("ERROR", "Error updating payroll period:<br>\n<br>\n" + err.message);
      }
    }, 1000);
  }

  public chartSliceSelect(event:any) {
    // let chart = this.dpsReportPieChart.nativeElement;
    Log.l("chartSliceSelect(): Event was:\n", event);
  }

  // public copyTable() {
  //   let table = this.printArea.nativeElement;
  //   let el = table.innerHtml;
  //   let range,selection;
  //   if(window.getSelection) {
  //     selection = window.getSelection();
  //     range = document.createRange();
  //     range.selectNodeContents(table);
  //     selection.removeAllRanges();
  //     selection.addRange(range);
  //   }
  //   document.execCommand('copy');
  // }

  public decimalize(value:number):Decimal {
    return new dec(value);
  }
}
