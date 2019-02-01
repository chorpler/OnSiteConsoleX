import { Subscription                                         } from 'rxjs'                          ;
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams                  } from 'ionic-angular'                 ;
import { ViewController                                       } from 'ionic-angular'                 ;
import { Log, moment, Moment, oo, _sortReportsByStartTime,    } from 'domain/onsitexdomain'          ;
import { _sortTechs, _sortTechsByFullName, _dedupe,           } from 'domain/onsitexdomain'          ;
import { Employee, Report, ReportOther, Shift,                } from 'domain/onsitexdomain'          ;
import { PayrollPeriod, Jobsite, Schedule, Schedules,         } from 'domain/onsitexdomain'          ;
import { OSData                                               } from 'providers/data-service'        ;
import { DispatchService, Preferences                         } from 'providers'                     ;
import { SelectItem,                                          } from 'primeng/api'                   ;
import { Dropdown,                                            } from 'primeng/dropdown'              ;
import { MultiSelect,                                         } from 'primeng/multiselect'           ;
import { NotifyService                                        } from 'providers/notify-service'      ;
import { SpinnerService                                       } from 'providers/spinner-service'     ;
import { Command, KeyCommandService                           } from 'providers/key-command-service' ;
import { ElectronService                                      } from 'providers/electron-service'    ;
import { OptionsGenericComponent                              } from 'components/options-generic'    ;

@IonicPage({name: "Tech Shift Reports"})
@Component({
  selector: 'page-tech-shift-reports',
  templateUrl: 'tech-shift-reports.html',
})
export class TechShiftReportsPage implements OnInit,OnDestroy {
  @ViewChild('optionsComponent') optionsComponent:OptionsGenericComponent;

  public title          :string  = "Tech Shift Reports" ;
  public optionsVisible :boolean = false                ;
  public optionsType    :string  = 'techshiftreports'   ;
  public modalMode      :boolean = false                ;

  public MAX_LINES   :number          = 15 ;
  public mode        :string     = 'rw'    ;
  public shiftreport :any                  ;
  public shiftreports:Array<any>      = [] ;
  public tech        :Employee             ;
  public allEmployees:Array<Employee> = [] ;
  public techs       :Array<Employee> = [] ;
  public allReports  :Array<Report>   = [] ;
  public allShifts   :Array<Shift>    = [] ;
  public site        :Jobsite              ;
  public sites       :Array<Jobsite>  = [] ;
  public period      :PayrollPeriod        ;
  public periods     :PayrollPeriod[] = [] ;
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
  public dataReady   :boolean      = false ;
  public opacity     :number       = 1     ;
  public keySub      :Subscription         ;
  public sub         :Subscription         ;
  public reports     :Report[]     = []    ;
  public ePeriod     :Map<Employee,PayrollPeriod> = new Map();

  constructor(
    public viewCtrl   : ViewController    ,
    public navCtrl    : NavController     ,
    public navParams  : NavParams         ,
    public prefs      : Preferences       ,
    public data       : OSData            ,
    public notify     : NotifyService     ,
    public spinner    : SpinnerService    ,
    public dispatch   : DispatchService   ,
    public keyService : KeyCommandService ,
    public electron   : ElectronService   ,
  ) {
    window['techshiftreports']  = this;
    window['techshiftreports2'] = this;
    window['p'] = this;
    // window['_dedupe'] = _dedupe;
  }

  ngOnInit() {
    Log.l("TechShiftReportsPage: ngOnInit() fired!");
    if(this.data.isAppReady()) {
      if(this.navParams.get('mode') !== undefined) {
        this.mode = this.navParams.get('mode');
      }
      if(this.navParams.get('reports') !== undefined) {
        this.reports = this.navParams.get('reports');
        this.getAllData();
        this.generateShiftReportsForReports(this.reports);
        this.generateDropdownMenus();
        this.dataReady = true;
      } else {
        this.runOnDelay();
      }
    }
  }

  ngOnDestroy() {
    Log.l("TechShiftReportsPage: ngOnDestroy() fired!");
    this.cancelSubscriptions();
  }

  public runOnDelay() {
    setTimeout(() => {
      this.runWhenReady();
    }, 500);
  }

  public runWhenReady() {
    Log.l("TechShiftReports: running when ready...");
    if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
    this.initializeSubscriptions();
    this.getData();
    this.generateDropdownMenus();
    this.updateSite(this.site);
    // this.updateShift(this.selectedDate);
    this.dataReady = true;
    this.setPageLoaded();
  }

  public initializeSubscriptions() {
    this.keySub = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "TechShiftReportsPage.showOptions"      : this.showOptions(command.ev); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySub && !this.keySub.closed) {
      this.keySub.unsubscribe();
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

    let weeks:number = this.prefs.CONSOLE.techshiftreports.payroll_periods || this.prefs.CONSOLE.global.payroll_periods || 4;
    Log.l(`TechShiftReports.getAllData(): Creating payroll periods back '${weeks}' weeks...`);

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
    Log.l(`TechShiftReports.getData(): Creating payroll periods back '${weeks}' weeks...`);

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
      let shifts = period.getPayrollShifts().reverse();
      let periodTitle = `Pay Period ${periodName}`;
      let periodItem = {label: periodTitle, value: String(itemIndex++), divider: true };
      shiftList.push(periodItem);
      for(let shift of shifts) {
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
      let sA = a.getStartTime().toExcel();
      let sB = b.getStartTime().toExcel();
      return sA > sB ? 1 : sA < sB ? -1 : 0;
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

  public generateSelectedReports(event?:any) {
    let dates:string[] = this.selectedDates || [];
    let techUsers:string[]  = this.selTechs || [];
    let site:Jobsite = this.site;
    let shifts:Shift[] = this.shifts.filter((a:Shift) => {
      let shift_date = a.getShiftDate().format("YYYY-MM-DD");
      return dates.indexOf(shift_date) > -1;
    }).sort((a:Shift,b:Shift) => {
      let dA = a.getShiftDate().toExcel();
      let dB = b.getShiftDate().toExcel();
      return dA > dB ? -1 : dA < dB ? 1 : 0;
    });
    Log.l(`generateSelectedReports(): shifts result is:\n`, shifts);
    let techs:Employee[] = this.allEmployees.filter((a:Employee) => {
      let username = a.getUsername();
      return techUsers.indexOf(username) > -1;
    }).sort((a:Employee,b:Employee) => {
      let nA = a.getFullName();
      let nB = b.getFullName();
      return nA > nB ? 1 : nA < nB ? -1 : 0;
    });
    Log.l(`generateSelectedReports(): techs result is:\n`, techs);
    // let date:Moment = moment(, "YYYY-MM-DD");
    // let techs:Array<Employee> = this.selectedTechs;
    // let site:Jobsite = this.site;
    Log.l("generateSelectedReports(): Now running with techs and shifts and dates:\n", techs);
    Log.l(shifts);
    Log.l(dates);
    this.shiftreports = this.shiftreports || [];
    for(let tech of techs) {
      for(let shift of shifts) {
        let shiftDate = shift.getShiftDate();
        let shiftreport = this.generateShiftReport(shiftDate, tech, site);
        Log.l("shiftreport is:\n", shiftreport)
        if(shiftreport && shiftreport.grid && shiftreport.grid.length) {
          let hasData = false;
          outerloop:
          for(let row of shiftreport.grid) {
            for(let col of row) {
              if(col) {
                hasData = true;
                break outerloop;
              }
            }
          }
          if(hasData) {
            this.shiftreports.push(shiftreport);
          }
          // this.notify.addSuccess("SUCCESS", "Shift report generated successfully.", 3000);
        } else {
          let errText = `Could not generate shift report for '${tech.getTechName()}' on '${shiftDate.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
          this.notify.addWarn("ALERT", errText, 5000);
        }
      }
    }
    return this.shiftreports;
  }

  public generateShiftReportsForReports(reports:Report[]) {
    Log.l(`generateShiftReportsForReports(): called with report list:\n`, reports);
    let reportList:Report[] = reports.sort((a:Report,b:Report) => {
      let uA = a.username;
      let uB = b.username;
      let dA = a.report_date;
      let dB = b.report_date;
      return uA > uB ? 1 : uA < uB ? -1 : dA > dB ? 1 : dA < dB ? -1 : 0;
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

  public checkSelectedTechs(selTechs:Array<string>, event?:any) {
    let chosenTechs:Array<Employee>;
    chosenTechs = this.techs.filter((a:Employee) => {
      return selTechs.indexOf(a.username) !== -1;
    }).sort((a:Employee,b:Employee) => {
      let uA = a.getFullName();
      let uB = b.getFullName();
      return uA > uB ? 1 : uA < uB ? -1 : 0;
    });
    this.selectedTechs = chosenTechs;
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
    for (let i = 0; i < len; i++) {
      let selection = tmpList[i];
      let shift = this.allShifts.find(a => a.getShiftDate().format("YYYY-MM-DD") === selection);
      shifts.push(shift);
    }
    this.shifts = shifts;
    pSelections = selections.slice(0);
    this.previousDates = pSelections;
    this.generateTechList();
  }

  public generateTechList():Employee[] {
    let dates:Moment[] = this.selectedDates.filter((a:string) => a.length === 10).map((a:string) => moment(a, "YYYY-MM-DD"));
    // let techs:Employee[] = [];
    let site:Jobsite = this.site;
    let techSet:Set<Employee> = new Set();
    for(let date of dates) {
      let schedule:Schedule = this.allSchedules.getScheduleForDate(date);
      let scheduledTechs:Employee[] = schedule.getAllTechsForSite(site);
      scheduledTechs.forEach((a:Employee) => {
        techSet.add(a);
      });
      // techs = [...techs, ...scheduledTechs];
    }
    let techs:Employee[] = Array.from(techSet).sort(_sortTechsByFullName);
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

  public updateSite(site:Jobsite, event?:any) {
    Log.l("updateSite(): Site set to:\n", site);
    this.generateTechList();
  }

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

  public printReports(evt?:MouseEvent) {
    if(this.electron) {
      let devtools:boolean = false;
      if(evt && evt.shiftKey) {
        devtools = true;
      }
      this.electron.showPrintPreview({loadDevTools: devtools, printBackground: false, marginsType: 0});
    } else{
      window.print();
    }
  }

  public showOptions(event?:MouseEvent|KeyboardEvent) {
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
    this.getData();
    this.generateDropdownMenus();
    this.updateSite(this.site);
  }

  public optionsSaved(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsSaved(): Event is:\n", event);
    let prefs = this.prefs.getPrefs();
    this.data.savePreferences(prefs).then(res => {
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      this.getData();
      this.generateDropdownMenus();
      this.updateSite(this.site);
    }).catch(err => {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    });
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

}
