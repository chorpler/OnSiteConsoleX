// import { DatagridComponent                                                  } from 'components/datagrid/datagrid'                 ;
import { Subscription                                                       } from 'rxjs'                                         ;
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output } from '@angular/core'                                ;
import { EventEmitter, NgZone, ViewChildren, QueryList, AfterViewInit,      } from '@angular/core'                                ;
import { IonicPage, NavController, NavParams                                } from 'ionic-angular'                                ;
import { ViewController                                                     } from 'ionic-angular'                                ;
import { Log, moment, Moment, oo, s2ab,                                     } from 'domain/onsitexdomain'                         ;
import { Report, Invoice, Jobsite, Employee, Shift, PayrollPeriod, PreAuth, } from 'domain/onsitexdomain'                         ;
import { AlertService                                                       } from 'providers/alert-service'                      ;
import { DBService                                                          } from 'providers/db-service'                         ;
import { ServerService                                                      } from 'providers/server-service'                     ;
import { OSData                                                             } from 'providers/data-service'                       ;
import { Preferences                                                        } from 'providers/preferences'                        ;
import { NotifyService                                                      } from 'providers/notify-service'                     ;
import { DispatchService                                                    } from 'providers/dispatch-service'                   ;
import { SelectItem,                                                        } from 'primeng/api'                                  ;
import { MenuItem,                                                          } from 'primeng/api'                                  ;
import { Dropdown,                                                          } from 'primeng/dropdown'                             ;
import { MultiSelect,                                                       } from 'primeng/multiselect'                          ;
import { ReportViewComponent                                                } from 'components/report-view'                       ;
import { LoaderService                                                      } from 'providers/loader-service'                     ;

export enum Row {
  vendor,
  itemno,
  itemtype,
  shorttext,
  materialgroup,
  quantity,
  unit,
  netprice,
  currency,
  priceunit,
  contractno,
  contractitem,
  contractserviceline,
  accountcategory,
  accountingobject,
  internalorder,
  gicode,
}

@IonicPage({name: "Preauth HB"})
@Component({
    selector: 'page-invoicing-hb-preauth',
    templateUrl: 'invoicing-hb-preauth.html',
})
export class HBPreauthPage implements OnInit,OnDestroy {
  @ViewChild('ionContentElement') ionContentElement:ElementRef;
  @ViewChild('menubarMultiselectShift') menubarMultiselectShift:MultiSelect;
  @ViewChildren('printArea') printArea:QueryList<any>;
  // @ViewChild('printArea') printArea:ElementRef;
  // @ViewChild('preauthTable') preauthTable: ElementRef;
  public title      : string     = "HB Preauth" ;
  public optionsVisible:boolean = false         ;
  public optionsType:string = "hbpreauth"       ;
  public Row                     = Row          ;
  public preauthGrid: Array<any> = []           ;
  public options    : any                       ;
  public schema     : Array<any> = []           ;
  public MAX_ROWS   : number     = 38           ;
  public ROW_COUNT  : number     = 0            ;
  public keySub     : Subscription              ;
  public dataSub    : Subscription              ;
  public allSites   : Array<Jobsite>= []        ;
  public allReports : Array<Report> = []        ;
  public reports    : Array<Report> = []        ;
  public report     : Report                    ;
  public dayReports : Array<Array<Report>> = [] ;
  public shiftReports:Array<Report>  = []       ;
  public sites      : Array<Jobsite> = []       ;
  public site       : Jobsite                   ;
  public siteList   : SelectItem[]  = []        ;
  public periodList : SelectItem[]  = []        ;
  public shiftList  : SelectItem[]  = []        ;
  public shiftMenu  : MenuItem[]    = []        ;
  public allShifts  : Array<Shift>  = []        ;
  public shifts     : Array<Shift>  = []        ;
  public shift      : Shift                     ;
  public selShifts  : Array<string> = []        ;
  public prevShifts : Array<string> = []        ;
  public periods    : Array<PayrollPeriod> = [] ;
  public period     : PayrollPeriod             ;
  public techs      : Array<Employee> = []      ;
  public preauth    : PreAuth                   ;
  public preauths   : Array<PreAuth>  = []      ;
  public editTable  : Array<any>      = []      ;
  public editTables : Array<Array<any>>=[]      ;
  public highlight  : Array<Array<boolean>> =[] ;
  public tablehighlight: Array<Array<boolean>> =[] ;
  public copyMode   : boolean         = false   ;
  public modalMode  : boolean         = false   ;
  public timeoutHandle:number                   ;
  public editsFired :number           = 0       ;
  public unassigned :Jobsite                    ;
  public reportViewVisible:boolean    = false   ;
  public preauthOpenVisible:boolean   = false   ;
  public preauthsReady:boolean   = false        ;
  public dataReady  : boolean    = false        ;

  constructor(
    public viewCtrl  : ViewController  ,
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public zone      : NgZone          ,
    public prefs     : Preferences     ,
    public db        : DBService       ,
    public server    : ServerService   ,
    public alert     : AlertService    ,
    public data      : OSData          ,
    public notify    : NotifyService   ,
    public loader    : LoaderService   ,
    public dispatch  : DispatchService ,
  ) {
    window['onsitehbpreauthpage'] = this;
  }

  ngOnInit() {
    Log.l("HBPreauthPage: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  public initializeSubscriptions() {
    this.dataSub = this.dispatch.datastoreUpdated().subscribe((data:{type:string, payload:any}) => {
      Log.l("Home.subscriptions: Got updated data payload!\n", data);
      let key = data.type;
      let payload = data.payload;
      if(key === 'reports' || key === 'reports_ver101100') {
        Log.l("HBPreauthPage: Updated data payload was for reports.")
        this.allReports = payload;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.dataSub && !this.dataSub.closed) {
      this.dataSub.unsubscribe();
    }
  }

  public runWhenReady() {
    // this.options = {autoResizeColumns: true, editable: true};
    this.initializeSubscriptions();
    if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
    let schema      = this.generateSchema();
    this.techs      = this.data.getData('employees');
    this.allReports = this.data.getData('reports');
    this.allSites   = this.data.getData('sites');
    if(this.prefs.CONSOLE.hbpreauth.showAllSites) {
      this.sites    = this.allSites.slice(0);
    } else {
      this.sites      = this.allSites.filter((a:Jobsite) => {
        return a.client.name === 'HB';
      });
    }
    this.unassigned = this.allSites.find((a:Jobsite) => {
      return a.site_number === 1;
    });
    let periodCount = this.prefs.CONSOLE.hbpreauth.payroll_periods || this.prefs.getPayrollPeriodCount() || 4;
    this.periods    = this.data.createPayrollPeriods(periodCount);
    this.generateDropdowns();
    // this.createTieredMenu();
    this.setMenuValues();
    this.schema    = schema;
    this.options   = {autoResizeColumns: false, editable: true, schema: schema};
    // this.preauthGrid = this.generatePreauthGrid();
    this.preauth = this.initializePreauth();
    this.setupPreauth(this.preauth);
    // this.preauth.grid = this.generatePreauthGrid();
    // let count = this.preauth.grid.length;
    // this.generateEditTable(count);
    // this.preauth.grid = this.preauthGrid;
    this.dataReady = true;
    this.preauthsReady = true;
    this.setPageLoaded();
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public initializePreauth(preauthToUse?:PreAuth):PreAuth {
    // let preauth:PreAuth;
    let preauth:PreAuth = preauthToUse || new PreAuth();
    // if(!preauthToUse) {
    let site:Jobsite = this.site;
    let now = moment();
    let period_number = this.period.getPayrollSerial();
    let period_date   = this.period.start_date.format("YYYY-MM-DD");
    preauth.site = site;
    preauth.site_number = site.site_number;
    preauth.site_id = site['uid'] || site.site_number;
    preauth.preauth_date = now.format("YYYY-MM-DD");
    preauth.shift_date = moment().format("YYYY-MM-DD");
    preauth.period_date = period_date;
    preauth.period_number = period_number;
    preauth.grid = [];
    preauth.getID();
    return preauth;
    // } else {
      // return preauth;
    // }
  }

  public initializePreauthWithShift(shift:Shift) {
    let preauth:PreAuth = this.initializePreauth();
    let sDate = shift.getShiftDate().format("YYYY-MM-DD");
    let period_number = shift.getPayrollPeriod();
    let period_date = moment().fromExcel(period_number).format("YYYY-MM-DD");
    preauth.shift_date = sDate;
    preauth.period_number = period_number;
    preauth.period_date = period_date;
    preauth._id = preauth.generateID();
    return preauth;
  }

  public setupPreauth(preauthToUse?:PreAuth):PreAuth {
    let preauth = preauthToUse || this.preauth;
    // if(preauthToUse) {
      // preauth = this.initializePreauth();
    // preauth.shift_date = this.shift.getShiftDate().format("YYYY-MM-DD");
    preauth.grid = this.generatePreauthGrid();
    // let count = preauth.grid.length;
    // this.generateEditTable(count);
    return preauth;
  }

  public generateEditTable(lines?:number) {
    let table = [];
    let count;
    if(lines !== undefined) {
      count = lines;
    } else {
      count = this.MAX_ROWS;
    }
    for(let i = 0; i < count; i++) {
      table.push("");
    }
    this.editTable = table;
    return table;
  }

  public generateEditTables() {
    let table = [];
    for(let preauth of this.preauths) {
      let row = [];
      let rowCount = preauth.grid.length;
      for(let i = 0; i < rowCount; i++) {
        row.push("");
      }
      table.push(row);
    }
    this.editTables = table;
    this.generateHighlightArray();
    return table;
  }

  public generateHighlightArray() {
    let table = [];
    let tablehighlight = [];
    let tableCount = this.preauths.length;
    for(let preauth of this.preauths) {
      tablehighlight.push(false);
      let highlightRow = [];
      let rowCount = preauth.grid.length;
      for(let i = 0; i < rowCount; i++) {
        highlightRow.push(false);
      }
      table.push(highlightRow);
    }
    this.highlight = table;
    this.tablehighlight = tablehighlight;
    return table;
  }

  public generateDropdowns() {
    let siteList:SelectItem[] = [];
    let sites = this.sites, periods = this.periods;
    for(let site of sites) {
      let item:SelectItem = {label: site.getSiteName(), value: site };
      siteList.push(item);
    }
    this.siteList = siteList;

    let list:SelectItem[] = [];
    let shiftList:SelectItem[] = [];
    let periodNumber = 0;
    let itemIndex = 0;
    for(let period of periods) {
      let name = period.getPeriodName("DD MMM");
      let item:SelectItem = {label: period.getPeriodName("DD MMM"), value: period };
      list.push(item);
      let shifts = period.getPayrollShifts().reverse();
      // let shiftItem = [];
      let periodTitle = `Pay Period ${name}`;
      let periodItem = {label: periodTitle, value: String(itemIndex++), divider: true };
      shiftList.push(periodItem);
      for(let shift of shifts) {
        this.allShifts.push(shift);
        let date = shift.getShiftDate();
        let label = date.format("DD MMM YYYY");
        // let value = shift;
        let value = date.format("YYYY-MM-DD");
        // let real  = true;
        // let disabled = false;
        // let shiftItem = {label: label, value: value, real: real, disabled: disabled};
        let shiftItem = {label: label, value: value, divider: false};
        shiftList.push(shiftItem);
        itemIndex++;
      }
    }
    this.periodList = list;
    this.shiftList = shiftList;
  }

  // public createTieredMenu() {
  //   let menu:MenuItem[] = [];
  //   for (let period of this.periods) {
  //     let label = period.getPeriodName("DD MMM YYYY");
  //     let value = period;
  //     let shifts = period.getPayrollShifts().sort((a:Shift,b:Shift) => {
  //       let dA = a.getShiftID();
  //       let dB = b.getShiftID();
  //       return dA > dB ? -1 : dA < dB ? 1 : 0;
  //     });
  //     let subMenu:MenuItem[] = [];
  //     for (let shift of shifts) {
  //       let date = shift.getShiftDate();
  //       let strDate = date.format("DD MMM YYYY");
  //       let subitem:MenuItem = {
  //         'label': strDate,
  //         'badge': '5',
  //         'command': (event) => {
  //           this.updateShift(shift, period, event);
  //         }
  //       };
  //       // let subitem:MenuItem = {'label': strDate, 'command': (event) => { this.chooseShift(event)}};
  //       subMenu.push(subitem);
  //     }
  //     let item: MenuItem = { 'label': label, 'items': subMenu };
  //     menu.push(item);
  //   }
  //   // let toggler = {
  //   //   'label': "Toggle Detail Mode",
  //   //   'command': (event) => {
  //   //     this.toggleDetailMode(event);
  //   //   }
  //   // };
  //   // menu.push(toggler);
  //   // toggler = {
  //   //   'label': 'Toggle Calculation Mode', 'command': (event) => {
  //   //     this.toggleCalculationMode();
  //   //   }
  //   // };
  //   // menu.push(toggler);
  //   // this.menuItems = menu;
  //   this.shiftMenu = menu;
  //   return menu;
  // }

  public setMenuValues() {
    this.site   = this.siteList[0].value;
    this.period = this.periodList[0].value;
    let shifts  = this.period.getPayrollShifts();
    this.shift  = shifts[0];
  }

  public generatePreauthGrid(rprts?:Array<Report>):Array<Array<any>> {
    let grid = [];
    let reports = rprts || this.reports || [];
    let count = reports.length;
    let ROW_COUNT = 0;
    for(let i = 0; i < count; i++) {
      let report:Report = reports[i];
      // let row = [];
      let unit = report.unit_number;
      if(!unit) {
        unit = "00000000";
      }
      let uname = report.username;
      let hours = report.getRepairHours();
      let acct_object = report.work_order_number;
      let tech = this.techs.find((a:Employee) => {
        return a.username === uname;
      });
      let techname = `${tech.firstName[0]}. ${tech.lastName}`;
      let short_text = `${unit} ${techname}`;
      let row = [
        1232314,
        i + 1,
        3,
        short_text,
        "ZM110000",
        hours,
        "H",
        65,
        "",
        1,
        4601009569,
        1,
        "",
        "F",
        acct_object,
        "",
        550420,
      ];
      grid.push(row);
      ROW_COUNT++;
    }

    return grid;
  }

  public generateSchema() {
    let schema = [
      { name: "Vendor"               , type: "string", width: 100 },
      { name: "Item no"              , type: "string", width: 100 },
      { name: "Item type"            , type: "string", width: 100 },
      { name: "Short text"           , type: "string", width: 100 },
      { name: "Material Group"       , type: "string", width: 100 },
      { name: "Quantity"             , type: "string", width: 100 },
      { name: "Unit"                 , type: "string", width: 100 },
      { name: "Net Price"            , type: "string", width: 100 },
      { name: "Currency"             , type: "string", width: 100 },
      { name: "Price Unit"           , type: "string", width: 100 },
      { name: "Contract No"          , type: "string", width: 100 },
      { name: "Contract Item"        , type: "string", width: 100 },
      { name: "Contract service line", type: "string", width: 100 },
      { name: "Account Category"     , type: "string", width: 100 },
      { name: "Accounting Object"    , type: "string", width: 100 },
      { name: "Internal Order"       , type: "string", width: 100 },
      { name: "GI Code"              , type: "string", width: 100 },
    ];
    return schema;
  }

  public parameterChange() {
    // this.invoices = [];
    let site   = this.site;
    // let period = this.period;
    // let shift  = this.shift;
    let dates:Array<string> = [];
    for(let shift of this.shifts) {
      let date   = moment(shift.getShiftDate()).format("YYYY-MM-DD");
      dates.push(date);
    }
    let reports:Report[] = this.allReports.filter((a:Report) => {
      let dA = a.report_date;
      return dates.indexOf(dA) !== -1 && a.matchesSite(site);
    }).sort(this.sortReports);
    this.reports = reports;
  }

  public getReports(shift:Shift, site:Jobsite):Array<Report> {
    let shiftDate = shift.getShiftDate().format("YYYY-MM-DD");
    let reports:Array<Report> = this.allReports.filter((a:Report) => {
      let dA = a.report_date;
      return shiftDate === dA && a.matchesSite(site);
    });
    return reports;
  }

  public sortReports(a:Report, b:Report):number {
    let uA = a.technician;
    let uB = b.technician;
    return uA > uB ? 1 : uA < uB ? -1 : 0;
  }

  public checkShiftSelections(event?:any) {
    let selections:Array<string> = this.selShifts.sort((a,b) => {
      return a > b ? -1 : a < b ? 1 : 0;
    });
    let pSelections:Array<string> = this.prevShifts ? this.prevShifts : [];

    for(let sel of selections) {
      if(sel.length < 10) {
        // This is the stringified index of a payroll period
        let idx = Number(sel);
        let idx1 = pSelections.indexOf(sel);
        if(idx1 === -1) {
          // this is a newly checked "payroll period" menu item, so we need to check the next 7 items
          let start = idx + 1, end = idx + 8;
          for(let i = start; i < end; i++) {
            let val = this.shiftList[i].value;
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
            let val = this.shiftList[i].value;
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
    this.prevShifts = pSelections;
    // for(let selection of selections) {
    //   if(selection instanceof PayrollPeriod) {
    //     let index = this.shiftList.findIndex(a => {
    //       return a.value === selection;
    //     });
    //     if(index > -1) {
    //       for(let i = index+1; i < index + 7; i++) {

    //       }
    //     }
    //   }
    // }
    this.parameterChange();
  }

  public updateShifts(selectedShifts:Array<Shift>, event?:any) {
    Log.l(`updateShifts(): event is:\n`, event);
    Log.l(`updateShifts(): Chose shift(s):`, selectedShifts);
    let shifts = selectedShifts.sort((a:Shift,b:Shift) => {
      let dA = a.getShiftDate().toExcel();
      let dB = b.getShiftDate().toExcel();
      return dA > dB ? -1 : dA < dB ? 1 : 0;
    });
    let site = this.site;
    let preauths:Array<PreAuth> = [];
    let dayReports:Array<Array<Report>> = [];
    for(let shift of shifts) {
      let preauth:PreAuth = this.initializePreauthWithShift(shift);
      let reports:Array<Report> = this.getReports(shift, site);
      let singleDayReports:Array<Report> = reports;
      // this.setupPreauth(preauth);
      preauth.grid = this.generatePreauthGrid(reports);
      preauths.push(preauth);
      dayReports.push(singleDayReports);
    }
    this.preauths = preauths;
    this.dayReports = dayReports;
    this.generateEditTables();
    this.generateHighlightArray();
  }

  // public updateShift(shift:Shift, period:PayrollPeriod, event?:any) {
  //   Log.l(`updateShift(): Chose shift ${shift.getShiftDate().format("YYYY-MM-DD")} in period ${period.getPeriodName("YYYY-MM-DD")}, event is:\n`, event);
  //   this.shift = shift;
  //   let currentPeriod = this.period;
  //   if(period === currentPeriod) {
  //     this.parameterChange();

  //     // this.preauthGrid = this.generatePreauthGrid();
  //     let preauth = this.initializePreauth();
  //     this.setupPreauth(preauth);
  //     this.preauths = [preauth];
  //     this.preauth = preauth;
  //     this.generateEditTables();
  //     this.notify.addInfo("SHIFT CHANGED", `Changed shift to date ${shift.getShiftName("DD MMM YYYY")}`, 3000);
  //   } else {
  //     this.updatePeriod(period);
  //     this.shift = shift;
  //     this.notify.addInfo("PAY PERIOD CHANGED", `Changed pay period and shift to date ${shift.getShiftName("DD MMM YYYY")}`, 3000);
  //   }
  // }

  // public updatePeriod(period:PayrollPeriod) {
  //   this.period = period;
  //   Log.l("updatePeriod(): Called with period:\n", period);
  //   this.parameterChange();
  //   // this.preauthGrid = this.generatePreauthGrid();
  //   let preauth = this.initializePreauth();
  //   this.setupPreauth(preauth);
  //   this.preauths = [preauth];
  //   this.preauth = preauth;
  //   this.generateEditTables();
  // }

  public updateSite(site:Jobsite) {
    this.site = site;
    Log.l("updateSite(): Called with period:\n", site);
    this.parameterChange();
    // this.preauthGrid = this.generatePreauthGrid();
    // let preauth = this.initializePreauth();
    // this.setupPreauth(preauth);
    // this.preauths = [preauth];
    // this.preauth = preauth;
    // this.generateEditTables();
  }

  public editReport(tableIndex:number, idx:number, event?:any) {
    Log.l("editReport(): Called with paramters tableIndex[%d][%d] and event:\n", tableIndex, idx, event);
    let reports:Array<Report> = this.dayReports[tableIndex];
    let len = reports.length;
    if(len > 0 && idx < len && idx >= 0) {
      Log.l("editReport(): Showing report %d/%d...", idx, len);
      let report:Report = reports[idx];
      this.shiftReports = reports;
      this.report = report;
      this.reportViewVisible = true;
    } else {
      this.notify.addWarn("NO REPORT", `Row ${idx+1} has no actual report!`, 4000);
      this.reportViewVisible = false;
    }
  }

  public reportViewSave(event?:any) {
    Log.l("reportViewSave(): Event is:\n", event);
    this.reportViewVisible = false;
  }

  public reportViewCancel(event?:any) {
    Log.l("reportViewCancel(): Event is:\n", event);
    this.reportViewVisible = false;
  }

  public reportViewChange(event?:any) {
    Log.l("reportViewChange(): Event is:\n", event);
  }

  public rowClick(event:any) {
    Log.l("rowClick(): Event was:\n", event);
  }

  // public toggleTieredMenu(event?:any) {
  //   Log.l("toggleTieredMenu(): Event is:\n", event);
  //   this.menubarTieredMenu.toggle(event);
  // }

  public gridEdited(row:number, col:number, event?:any) {
    // if(this.editsFired > 0) {
    //   return;
    // } else {
    //   this.timeoutHandle = setTimeout(() => {
    //     this.editsFired = 0;
    //   });
    // }
  }

  public async copyTables(event?: any) {
    // let table = this.printArea.nativeElement;
    try {
      let tables = this.printArea.toArray();
      let ranges = [];
      this.copyMode = true;
      for (let table of tables) {
        let singleRange = await this.selectSingleTable(table);
        ranges.push(singleRange);
      }
      document.execCommand('copy');
      this.notify.addSuccess("SUCCESS", "All tables copied to clipboard", 3000);
      this.copyMode = false;
    } catch (err) {
      Log.l("copyTables(): Error selecting and/or copying tables!");
      Log.e(err);
      this.notify.addError("ERROR", `Error copying tables: '${err.message}', 10000`);
    }

      // setTimeout(() => {
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
      //   selection.removeAllRanges();
      //   this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
      //   this.copyMode = false;
      // }, 500);
    // }

  }

  public async copySingleTable(tableElementRef:any, event?: any) {
    let table = tableElementRef && tableElementRef.nativeElement ? tableElementRef.nativeElement : tableElementRef;
    // Log.l("copySingleTable(): printTable is:\n", printTable);
    // Log.l("copySingleTable(): and event is:\n", printTable);

    this.copyMode = true;
    setTimeout(() => {
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
      this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
      this.copyMode = false;
    }, 500);
  }

  public async selectSingleTable(printTableEl:ElementRef, event?: any) {
    return new Promise((resolve,reject) => {
      try {
        let table = printTableEl.nativeElement;
        // Log.l("copySingleTable(): printTable is:\n", printTable);
        // Log.l("copySingleTable(): and event is:\n", printTable);

        this.copyMode = true;
        // setTimeout(() => {
        let el = table.innerHtml;
        let range, selection;
        if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(table);
          // selection.removeAllRanges();
          selection.addRange(range);
          resolve(selection);
        } else {
          throw new Error("selectSingleTable(): No window.getSelection() command available!");
        }
      } catch (err) {
        Log.l("selectSingleTable(): Error while attempting to set up range!");
        Log.e(err);
      }
      // document.execCommand('copy');
      // selection.removeAllRanges();
      // this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
      // this.copyMode = false;
    // }, 500);
    });
  }

  public async printPreauth(event?:any) {
    Log.l("printPreauth(): Event is:\n", event);
    window.print();
  }

  public async printPreauths(event?:any) {
    this.printPreauth();
  }

  public async generatePreauths(event?:any) {
    try {
      let shifts = this.shifts;
      // selShifts;
      this.updateShifts(shifts, event);
    } catch (err) {
      Log.l("generatePreauths(): Error during generation.");
      Log.e(err);
      this.notify.addError("ERROR", `Error generating preauth(s): '${err.message}'`, 10000);
    }
  }

  public async clearPreauth(event?:any) {
    try {
      let answer = await this.alert.showConfirmYesNo("CLEAR PREAUTH(S)", "Are you sure you want to clear the existing pre-authorization sheets?");
      if (answer) {
        this.preauths = [];
        this.editTables = [];
        this.dayReports = [];
        this.shiftReports = [];
        // this.preauthGrid = [];
        // this.editTable = [];
      } else {

      }
    } catch (err) {
      Log.l("clearPreauth(): Error getting confirmation to clear preauths!");
      Log.e(err);
      this.notify.addError("ERROR", `Error clearing preauths: '${err.message}'`, 10000);
    }
  }

  public async openPreauths(event?:any) {
    try {
      // this.loader.loadComponent('preauth-open');
      this.preauthOpenVisible = true;
    } catch (err) {
      Log.l("openPreauths(): Error loading preauth-open component.");
      Log.e(err);
      this.notify.addError("ERROR", `Error showing Preauth Open: '${err.message}'`, 10000);
    }
  }

  public async refreshData(event?:any) {
    try {

    } catch (err) {
      Log.l("refreshData(): Error refreshing preauths!");
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing Pre-Authorization sheet(s): '${err.message}'`, 10000);
    }
  }

  public async savePreauths(event?:any) {
    try {
      Log.l("savePreauths(): Event is:\n", event);
      let preauth = this.preauth;
      let results = await this.db.savePreauth(preauth);
      Log.l("savePreauths(): Success, results are:\n", results);
      this.notify.addSuccess("SUCCESS", `Saved Pre-Auth(s) to server.`, 3000);
    } catch(err) {
      Log.l("savePreauths(): Error saving preauths!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving Pre-Authorization sheet: '${err.message}'`, 10000);
    }
  }

  public preauthsOpen(event?: any) {
    Log.l("preauthsOpen(): Got event:\n", event);
    this.preauthOpenVisible = false;
    let preauths = event;
    if(Array.isArray(preauths)) {
      for(let preauth of preauths) {
        let site_number = 1;
        if(preauth.site_number) {
          site_number = preauth.site_number;
        } else if(typeof preauth.site_id === 'number') {
          site_number = preauth.site_id;
        } else {
          site_number = 1;
        }
        let site = this.sites.find((a:Jobsite) => {
          return a.site_number === site_number;
        });
        if(site) {
          preauth.site = site;
        } else {
          let errText = `Could not find jobsite with site number ${site_number}!`;
          Log.l(`preauthsOpen(): ${errText}`);
          this.notify.addError("ERROR", errText, 10000);
          site = this.unassigned;
        }
        this.setupPreauth(preauth);
      }
      this.preauths = event || this.preauth || [];
      this.generateEditTables();
    } else {
      Log.w("preauthsOpen(): Open succeeded but did not return a list of preauths!");
    }
  }

  public cancelOpen(event?: any) {
    Log.l("cancelOpen(): Got event:\n", event);
    this.preauthOpenVisible = false;
    // this.invoices = event || this.invoices || [];
  }

  public updatePeriodCount() {
    let periodCount = this.prefs.CONSOLE.hbpreauth.payroll_periods || this.prefs.getPayrollPeriodCount() || 4;
    this.periods    = this.data.createPayrollPeriods(periodCount);
    if(this.prefs.CONSOLE.hbpreauth.showAllSites) {
      this.sites    = this.allSites.slice(0);
    } else {
      this.sites      = this.allSites.filter((a:Jobsite) => {
        return a.client.name === 'HB';
      });
    }
    this.generateDropdowns();
    this.setMenuValues();
  }

  public showOptions(event?:MouseEvent|KeyboardEvent) {
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public async optionsSaved(event?:any) {
    try {
      this.optionsVisible = false;
      Log.l("optionsSaved(): Event is:\n", event);
      let prefs = this.prefs.getPrefs();
      let res:any = await this.data.savePreferences(prefs);
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      this.updatePeriodCount();
      return res;
    } catch(err) {
      Log.l(`optionsSaved(): Error saving options!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 6000);
    }
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

  public moment(...args):Moment {
    let mo = moment(...args);
    return mo;
  }

}
