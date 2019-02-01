import { Subscription                                                 } from 'rxjs'                        ;
import { Log, Moment, moment, isMoment,                               } from 'domain/onsitexdomain'        ;
import { _matchCLL, _matchSite, _matchReportSite,                     } from 'domain/onsitexdomain'        ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef  } from '@angular/core'               ;
import { IonicPage, NavController, NavParams                          } from 'ionic-angular'               ;
import { ModalController                                              } from 'ionic-angular'               ;
import { PayrollPeriod, Report, ReportOther, Shift, Jobsite, Employee } from 'domain/onsitexdomain'        ;
import { OSData                                                       } from 'providers/data-service'      ;
import { DBService                                                    } from 'providers/db-service'        ;
import { ServerService                                                } from 'providers/server-service'    ;
import { AlertService                                                 } from 'providers/alert-service'     ;
import { Preferences                                                  } from 'providers/preferences'       ;
import { NotifyService                                                } from 'providers/notify-service'    ;
import { SpinnerService                                               } from 'providers/spinner-service'   ;
import { Calendar,                                                    } from 'primeng/calendar'            ;
import { MultiSelect                                                  } from 'primeng/multiselect'         ;
import { Table                                                        } from 'primeng/table'               ;
import { ClipboardService                                             } from 'providers/clipboard-service' ;
// import { ClipboardService                                             } from 'ngx-clipboard'               ;

const copyStringToClipboard = (url:string, mimeType?:string):any => {
  document.addEventListener('copy', (e:ClipboardEvent) => {
    Log.l(`FIRED: Document event 'copy', calling callback function.`)
    let type:string = mimeType || 'text/plain';
    e.clipboardData.setData(type, url);
    e.preventDefault();
    Log.l(`copyStringToClipboard(): event is:\n`, e);
    window['onsitecopyclipboardevent'] = e;
    document.removeEventListener('copy', null);
    Log.l(`REMOVED: Document event 'copy' to copy string to clipboard!`)
    // ('copy', this.ClipboardEvent);
  });
  Log.l(`ADDED: Document event listener 'copy'`)
  let millisecondsToWait:number = 500;
  setTimeout(() => {
    Log.l(`ADDED: Document event listener 'copy'`)
    document.execCommand('copy');
  }, millisecondsToWait);
};

export type TurboTableExportOptions = {
  selectionOnly   ?: boolean,
  copyToClipboard ?: boolean,
  separator       ?: string ,
};

@IonicPage({name: 'Work Reports'})
@Component({
  selector: 'page-reports',
  templateUrl: 'reports.html',
})
export class ReportsPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:Table;
  @ViewChild('columnSelect') columnSelect:MultiSelect;
  @ViewChild('globalFilterInput') globalFilterInput:ElementRef;
  // @ViewChild('dateFrom') dateFrom:Calendar;
  // @ViewChild('dateTo') dateTo:Calendar;
  @ViewChild('dateRangeCalendar') dateRangeCalendar:Calendar;
  @ViewChild('printArea') printArea:ElementRef;
  public title         : string    = "Work Reports" ;
  public pageSizeOptions:number[]  = [50,100,200,500,1000,2000];
  public prefsSub         : Subscription                      ;
  public report           : Report                            ;
  public tech             : Employee                          ;
  public techs            : Employee[]         = []           ;
  public site             : Jobsite                           ;
  public sites            : Jobsite[]          = []           ;
  public editReports      : Array<Report>      = []           ;
  public reports          : Array<Report>      = []           ;
  public others           : Array<ReportOther> = []           ;
  public allReports       : Array<Report>      = []           ;
  public allOthers        : Array<ReportOther> = []           ;
  public selectedReport   : Report             = null         ;
  public reportViewVisible: boolean            = false        ;
  public globalSearch     : string             = ""           ;
  public fromDate         : Date                              ;
  public toDate           : Date                              ;
  public dateRange        : Array<Date>        = null         ;
  public minDateString    : string             = "2017-01-01" ;
  public maxDateString    : string             = "2025-12-31" ;
  public minDate          : Date                              ;
  public maxDate          : Date               = new Date()   ;
  public allFields        : Array<any>         = []           ;
  public cols             : Array<any>         = []           ;
  public selectedColumns  : Array<any>         = []           ;
  public styleColIndex    : any                               ;
  public styleColEdit     : any                               ;
  public colsReorder      : boolean            = true         ;
  public autoLayout       : boolean            = true         ;
  public dateTimeout      : any                               ;
  public fromDateTimeout  : any                               ;
  public toDateTimeout    : any                               ;
  public selectedLabel    : string          = "{0} columns shown";
  public showFilterRow    : boolean         = true            ;
  public showButtonCol    : boolean         = true            ;
  public showTableHead    : boolean         = true            ;
  public showTableFoot    : boolean         = true            ;

  public dataReady     : boolean            = false ;
  public get filteredCount():number { return this.getFilteredCount(); };
  public get rowCount()   : number { return this.prefs.CONSOLE.pages.reports; };
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.reports = val; };

  constructor(
    public navCtrl   : NavController    ,
    public navParams : NavParams        ,
    // public modalCtrl : ModalController  ,
    public zone      : NgZone           ,
    public prefs     : Preferences      ,
    public db        : DBService        ,
    public server    : ServerService    ,
    public data      : OSData           ,
    public alert     : AlertService     ,
    public notify    : NotifyService    ,
    public spinner   : SpinnerService   ,
    public clipboard : ClipboardService ,
  ) {
    window['onsitereports'] = this;
    window['_matchCLL'] = _matchCLL;
    window['_matchSite'] = _matchSite;
    window['_matchReportSite'] = _matchReportSite;
  }

  ngOnInit() {
    Log.l('ReportsPage: ngOnInit() fired');
    this.cols = this.getFields();
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportsPage: ngOnDestroy() fired");
    this.cancelSubscriptions();
  }

  public async runWhenReady() {
    try {
      this.initializeSubscriptions();
      this.styleColEdit = {'max-width':'40px', 'width': '40px', 'padding': '0px'};
      this.styleColIndex = {'max-width':'50px', 'width': '50px'};
      let reports = this.data.getData('reports');
      this.sites = this.data.getData('sites');
      this.techs = this.data.getData('employees');

      this.updatePageSizes();

      if(reports.length) {
        Log.l("Reports: using existing work order data.");
        this.cols = this.getFields();
        this.allReports = reports;
        this.reports = this.allReports.slice(0);
        this.others = this.data.getData('others');
        this.dataReady = true;
        return true;
      } else {
        Log.l(`Reports: no reports found. Retrieving reports from database...`);
        let res = await this.getData();
        this.cols = this.getFields();
        this.dataReady = true;
        return true;
      }
    } catch(err) {
      Log.l(`ReportsPage.runWhenReady(): Error getting reports and initializing data!`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public initializeSubscriptions() {

  }

  public cancelSubscriptions() {
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public updatePageSizes() {
    let newPageSizes = this.prefs.CONSOLE.pageSizes.reports;
    let rowCount = Number(this.prefs.CONSOLE.pages.reports);
    if(newPageSizes.indexOf(rowCount) === -1) {
      newPageSizes.push(rowCount);
      this.pageSizeOptions = newPageSizes.slice(0).sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
      this.rowCount = rowCount;
    } else {
      this.pageSizeOptions = newPageSizes.slice(0);
      this.rowCount = rowCount;
    }
  }

  public getFields():Array<any> {
    let fields:Array<any> = [
      { field: '_id'              , header: 'ID'          , filter: true, filterPlaceholder: "ID"          , order:  1 , style: "", class: "col-nowrap col-00 col-id"        , format: ""      , tooltip: "ID"          , },
      { field: 'report_date'      , header: 'Date'        , filter: true, filterPlaceholder: "Date"        , order:  2 , style: "", class: "col-wrap   col-01 col-date"      , format: ""      , tooltip: "Date"        , },
      { field: 'timestamp'        , header: "Timestamp"   , filter: true, filterPlaceholder: "Timestamp"   , order:  3 , style: "", class: "col-wrap   col-02 col-time"      , format: ""      , tooltip: "Timestamp"   , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true, filterPlaceholder: "Last Name"   , order:  4 , style: "", class: "col-wrap   col-03 col-last"      , format: ""      , tooltip: "Last Name"   , },
      { field: 'first_name'       , header: 'First Name'  , filter: true, filterPlaceholder: "First Name"  , order:  5 , style: "", class: "col-wrap   col-04 col-first"     , format: ""      , tooltip: "First Name"  , },
      { field: 'time_start'       , header: 'Start'       , filter: true, filterPlaceholder: "Start"       , order:  6 , style: "", class: "col-wrap   col-05 col-start"     , format: "HH:mm" , tooltip: "Start"       , },
      { field: 'time_end'         , header: 'End'         , filter: true, filterPlaceholder: "End"         , order:  7 , style: "", class: "col-wrap   col-06 col-end"       , format: "HH:mm" , tooltip: "End"         , },
      { field: 'repair_hours'     , header: 'Hrs'         , filter: true, filterPlaceholder: "Hrs"         , order:  8 , style: "", class: "col-wrap   col-07 col-hours"     , format: ""      , tooltip: "Repair hours", },
      { field: 'client'           , header: 'Client'      , filter: true, filterPlaceholder: "Client"      , order:  9 , style: "", class: "col-wrap   col-08 col-cli"       , format: ""      , tooltip: "Client"      , },
      { field: 'location'         , header: 'Location'    , filter: true, filterPlaceholder: "Location"    , order: 10 , style: "", class: "col-wrap   col-09 col-loc"       , format: ""      , tooltip: "Location"    , },
      { field: 'location_id'      , header: 'LocID'       , filter: true, filterPlaceholder: "LocID"       , order: 11 , style: "", class: "col-wrap   col-10 col-lid"       , format: ""      , tooltip: "LocID"       , },
      { field: 'unit_number'      , header: 'Unit #'      , filter: true, filterPlaceholder: "Unit #"      , order: 12 , style: "", class: "col-nowrap col-11 col-unitno"    , format: ""      , tooltip: "Unit #"      , },
      { field: 'work_order_number', header: 'Work Order'  , filter: true, filterPlaceholder: "WO #"        , order: 13 , style: "", class: "col-nowrap col-12 col-wonum"     , format: ""      , tooltip: "WO #"        , },
      { field: 'notes'            , header: 'Notes'       , filter: true, filterPlaceholder: "Notes"       , order: 14 , style: "", class: "col-nowrap col-13 col-notes"     , format: ""      , tooltip: "Notes"       , },
      { field: 'site_number'      , header: 'Site#'       , filter: true, filterPlaceholder: "Site#"       , order: 15 , style: "", class: "col-nowrap col-14 col-sitenum"   , format: ""      , tooltip: "Site#"       , },
      { field: 'workSite'         , header: 'Site'        , filter: true, filterPlaceholder: "Site"        , order: 16 , style: "", class: "col-nowrap col-15 col-worksite"  , format: ""      , tooltip: "Site"        , },
      { field: 'change_log'       , header: 'Log'         , filter: true, filterPlaceholder: "Log"         , order: 17 , style: "", class: "col-nowrap col-16 col-changelog" , format: ""      , tooltip: "Log"         , },
      { field: 'flagged_fields'   , header: 'Flags'       , filter: true, filterPlaceholder: "Flags"       , order: 18 , style: "", class: "col-nowrap col-17 col-flgd"      , format: ""      , tooltip: "Flags"       , },
      { field: 'preauthed'        , header: 'Preauthed'   , filter: true, filterPlaceholder: "Preauthed"   , order: 19 , style: "", class: "col-nowrap col-18 col-preauthed" , format: ""      , tooltip: "Preauthed"   , },
      { field: 'preauth_dates'    , header: 'PA Dates'    , filter: true, filterPlaceholder: "PA Dates"    , order: 20 , style: "", class: "col-nowrap col-19 col-padates"   , format: ""      , tooltip: "PA Dates"    , },
      { field: 'invoiced'         , header: 'Invoiced'    , filter: true, filterPlaceholder: "Invoiced"    , order: 21 , style: "", class: "col-nowrap col-20 col-invoiced"  , format: ""      , tooltip: "Invoiced"    , },
      { field: 'invoiced_dates'   , header: 'Inv Dates'   , filter: true, filterPlaceholder: "Inv Dates"   , order: 22 , style: "", class: "col-nowrap col-21 col-invdates"  , format: ""      , tooltip: "Inv Dates"   , },
      { field: 'invoice_numbers'  , header: 'Inv #\'s'    , filter: true, filterPlaceholder: "Inv #'s"     , order: 23 , style: "", class: "col-nowrap col-22 col-invno"     , format: ""      , tooltip: "Inv #'s"     , },
    ];
    this.allFields = fields;
    this.cols      = fields;
    let initialColumns = [
      "_id"               ,
      "report_date"       ,
      "timestamp"         ,
      "last_name"         ,
      "first_name"        ,
      "time_start"        ,
      "time_end"          ,
      "repair_hours"      ,
      "client"            ,
      "location"          ,
      "location_id"       ,
      "unit_number"       ,
      "work_order_number" ,
      "notes"             ,
    ];
    let visibleCols = this.cols.filter((a:any) => {
      let field:string = a.field ? a.field : "";
      if(field && initialColumns.indexOf(field) > -1) {
        return true;
      } else {
        return false;
      }
    });
    // this.selectedColumns = initialColumns;
    this.selectedColumns = visibleCols;
    this.columnsChanged();
    return fields;
  }

  public columnsChanged(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    // let cols = this.cols;
    Log.l("columnsChanged(): Items now selected:\n", vCols);
    // let sel = [];
    // let sel = this.allFields.filter((a:any) => {
    //   return (vCols.indexOf(a.field) > -1);
    // }).sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Items selected via string:\n", sel);
    // // this.displayColumns = [];
    // // this.displayColumns = oo.clone(sel);
    // // this.cols = oo.clone(sel);
    // this.cols = sel;
    // this.displayColumns = [];
    // for(let item of sel) {
    //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    //   this.displayColumns.push(oo.clone(item));
    //   // let i = dc.findIndex((a:any) => {
    //   //   return (a.field === item['field']);
    //   // });
    //   // if(i === -1) {
    //   //   dc = [...dc, item];
    //   // }
    // }
    this.cols = this.cols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    Log.l("columnsChanged(): Now field list is:\n", this.cols);
    if(this.columnSelect) {
      this.columnSelect.updateLabel();
    }
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public selectionChanged(evt?:any) {
    Log.l(`selectionChanged(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChanged();
    this.dataReady = true;
  }

  public getFilteredCount():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    if(this.dt && this.dt.filteredValue && this.dt.filteredValue.length) {
      out = this.dt.filteredValue.length;
    }
    return out;
  }

  public async getData():Promise<Report[]> {
    try {
      // let res:Array<Report> = await this.db.getAllReportsPlusNew();
      let res:Array<Report> = await this.data.getReports(1000000);
      Log.l("getData(): Got reports:\n", res);
      this.allReports = res;
      // this.data.setData('reports', res.slice(0));
      this.reports = this.allReports.slice(0);
      return this.reports;
    } catch (err) {
      Log.l(`getData(): Error downloading reports.`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public async refreshData(event?:any) {
    try {
      this.notify.addInfo("RETRIEVING", "Starting download of work reports...", 3000);
      let res1 = await this.getData();
      this.notify.addSuccess("SUCCESS!", `Downloaded ${res1.length} reports.`, 3000);
      let res2 = await this.downloadOldReports();
      return this.reports;
    } catch(err) {
      Log.l(`refreshData(): Error downloading reports.`);
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing reports: '${err.message}'`, 10000);
    }
  }

  public async loadOldReports(event?: any) {
    Log.l("loadOldReports() clicked.");
    this.notify.addInfo("RETRIEVING", `Downloading old reports...`, 3000);
    try {
      // let res = await this.db.getOldReports();
      let res = await this.server.getOldReports();0
      let allReports = this.reports.concat(res);
      this.data.setData('oldreports', res);
      let len = res.length;
      this.notify.addSuccess("SUCCESS", `Loadeded ${len} old reports.`, 3000);
      return res;
    } catch (err) {
      Log.l(`loadOldReports(): Error loading reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error loading old reports: '${err.message}'`, 10000);
    }
  }

  public async downloadOldReports(event?:any) {
    try {
      this.notify.addInfo("RETRIEVING", "Starting download of old reports...", 3000);
      Log.l("downloadOldReports(): Retrieving old reports...");
      // let res:Report[] = await this.db.getOldReports();
      let res:Report[] = await this.server.getOldReports();
      Log.l("downloadOldReports(): Success!");

      this.data.setData('oldreports', res);
      for(let report of res) {
        this.reports.push(report);
      }
      let allReports = this.reports.sort((a:Report,b:Report) => {
        let dA = a.report_date;
        let dB = b.report_date;
        let lA = a.last_name;
        let lB = b.last_name;
        let fA = a.first_name;
        let fB = b.first_name;
        return dA > dB ? -1 : dA < dB ? -1 : lA > lB ? 1 : lA < lB ? -1 : fA > fB ? 1 : fA < fB ? -1 : 0;
      });
      this.reports = allReports;
      this.allReports = allReports;
      let len = res.length;
      Log.l(`downloadOldReports(): Done downloading ${len} old reports.`);;
      this.notify.addSuccess("SUCCESS!", `Downloaded ${len} old reports.`, 3000);
      return res;
    } catch(err) {
      Log.l(`downloadOldReports(): Error while getting old reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error downloading old reports: '${err.message}'`, 10000);
    }
  }

  public onRowSelect(event:any) {
    Log.l("onRowSelect(): Event passed is:\n", event);
    this.showReport(event.data);
  }

  public getDateRangeStrings(startDate:Moment|Date,endDate:Moment|Date):Array<string> {
    let range:Array<Moment> = this.getDateRange(startDate, endDate);
    let out:Array<string> = range.map((a:Moment) => a.format("YYYY-MM-DD"));
    return out;
  }

  public getDateRangeAsStrings = this.getDateRangeStrings;

  public getDateRange(startDate:Moment|Date,endDate:Moment|Date):Array<Moment> {
    let start:Moment   = moment(startDate);
    let end:Moment     = moment(endDate);
    let moments:Moment[] = [];
    let current:Moment = moment(start);
    while(current.isBefore(end, 'day')) {
      moments.push(moment(current));
      current.add(1, 'day');
    }
    moments.push(current);
    return moments;
  }

  public updateFromDate(event:any, dt:Table) {
    Log.l("updateFromDate(): Event passed is:\n", event);
    let now:Moment  = moment().startOf('day').add(1, 'day');
    if(!this.fromDate) {
      this.fromDate = moment(this.minDateString, "YYYY-MM-DD").toDate();
    }
    let from:Moment = moment(this.fromDate);
    let to:Moment   = this.toDate   ? moment(this.toDate)   : moment(now);
    let fromDate:string = from.format("YYYY-MM-DD");
    let toDate:string   = to.format("YYYY-MM-DD");
    Log.l(`updateFromDate(): Now filtering from ${fromDate} - ${toDate}...`);
    // let reports:Report[] = this.allReports.filter((a:Report) => {
    //   return a.report_date >= fromDate && a.report_date <= toDate;
    // });
    let dateRange:Array<string> = this.getDateRangeStrings(from, to);
    this.minDate = from.toDate();
    this.maxDate = to.toDate();

    if(this.dateTimeout) {
      clearTimeout(this.dateTimeout);
    }
    this.dateTimeout = setTimeout(() => {
      dt.filter(dateRange, 'report_date', 'in');
    }, 250);
  }

  public updateToDate(event:any, dt:Table) {
    let now:Moment  = moment().startOf('day').add(1, 'day');
    if(!this.toDate) {
      this.toDate = now.toDate();
    }
    let from:Moment = this.fromDate ? moment(this.fromDate) : moment(this.minDateString, "YYYY-MM-DD");
    let to:Moment   = moment(this.toDate);
    let fromDate:string = from.format("YYYY-MM-DD");
    let toDate:string   = to.format("YYYY-MM-DD");
    Log.l(`updateToDate(): Now filtering from ${fromDate} - ${toDate}...`);
    // let reports:Report[] = this.allReports.filter((a:Report) => {
    //   return a.report_date >= fromDate && a.report_date <= toDate;
    // });
    this.minDate = from.toDate();
    this.maxDate = to.toDate();
    let dateRange:Array<string> = this.getDateRangeStrings(from, to);
    // let ltDate = moment(to).add(1, 'day').format("YYYY-MM-DD");
    // this.reports = reports;
    if(this.dateTimeout) {
      clearTimeout(this.dateTimeout);
    }
    this.dateTimeout = setTimeout(() => {
      dt.filter(dateRange, 'report_date', 'in');
    }, 250);
    // this.reports = reports;
  }

  public clearDates(event:any, dt:Table) {
    Log.l(`clearDates(): Clearing from and to search fields.`);
    this.fromDate = null;
    this.toDate = null;
    this.dateRange = null;
    dt.filter(null, 'report_date', 'startsWith');
  }

  public checkDateRange(evt?:any) {
    Log.l(`checkDateRange(): dateRange is now:\n`, this.dateRange);
    let cal:Calendar = this.dateRangeCalendar;
    let dates:Date[] = this.dateRange;
    if(dates && Array.isArray(dates) && dates.length === 2) {
      let dStart:Date = dates[0];
      let dEnd:Date   = dates[1];
      if(dStart && dEnd) {
        cal.overlayVisible = false;
        setTimeout(() => {
          this.updateDateRange(dStart, this.dt);
        }, 400);
      }
    }
  }

  public checkDateRangeOnClose(evt?:any) {
    Log.l(`checkDateRange(): dateRange is now:\n`, this.dateRange);
    let cal:Calendar = this.dateRangeCalendar;
    let dates:Date[] = this.dateRange;
    if(dates && Array.isArray(dates) && dates.length === 2) {
      let dStart:Date = dates[0];
      let dEnd:Date   = dates[1];
      if(dStart && dEnd) {
        cal.overlayVisible = false;
        setTimeout(() => {
          this.updateDateRange(dStart, this.dt);
        }, 400);
      } else if(dStart || dEnd) {
        this.dateRange = null;
      } else {

      }
    }
  }

  public updateDateRange(value:Date, table:Table) {
    // Log.l(`updateDateRange(): Arguments are:\n`, arguments);
    Log.l(`updateDateRange(): dateRange is now:\n`, this.dateRange);
    let dt:Table = table && table instanceof Table ? table : this.dt;
    let dStart:Date = this.dateRange[0];
    let dEnd:Date   = this.dateRange[1];
    if(dStart && dEnd) {
      let from:Moment = moment(dStart);
      let to:Moment = moment(dEnd);
      let fromDate:string = from.format("YYYY-MM-DD");
      let toDate:string   = to.format("YYYY-MM-DD");
      Log.l(`updateDateRange(): Now filtering from ${fromDate} - ${toDate}...`);
      let dateRange:Array<string> = this.getDateRangeStrings(from, to);
      // this.minDate = from.toDate();
      // this.maxDate = to.toDate();

      if(this.dateTimeout) {
        clearTimeout(this.dateTimeout);
      }
      this.dateTimeout = setTimeout(() => {
        dt.filter(dateRange, 'report_date', 'in');
      }, 250);
    } else {
      this.dateRange = null;
    }
  }

  public showReport(report:Report, event?:any) {
    Log.l(`showReport(): Called with report:\n`, report);
    let reportList = this.dt.hasFilter() ? this.dt.filteredValue : this.dt.value;
    let site = this.sites.find((a:Jobsite) => {
      // return _matchReportSite(report, a);
      if(a instanceof Jobsite) {
        return report.matchesSite(a);
      }
    });
    if(!site) {
      Log.l(`showReport(): Could not find site matching this report in sites array:\n`, this.sites);
      this.notify.addWarn("SITE ERROR", "Could not determine what work site this report is for!", 6000);
      // let reportPage = this.modalCtrl.create("View Work Report", { report: report, reports: reportList});
      // reportPage.onDidDismiss(data => {
//
      // });
      // reportPage.present();
    } else {
      let tech = this.techs.find((a:Employee) => {
        return _matchSite(a, site);
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this report!", 6000);
        return;
      }
      this.site        = site;
      this.tech        = tech;
      this.editReports = reportList;
      this.report      = report;
      this.reportViewVisible = true;
    }
  }

  public exportWorkReportsForPayroll() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Work Reports', { data: data, csv: csv });
  }

  public createExportData() {
    let dat = this.reports;
    let overall = [];
    let i = 0, j = 0;
    //    ScheduleID	RotSeq	TechRotation	TechShift	JobSiteOnSchedule	Client	TechLocation	TechLocID	TechOnSchedule	Jun 28	Jun 29	Jun 30	Jul 01	Jul 02	Jul 03	Jul 04
    let header = [
      "Period",
      "Type",
      "Training",
      "Date",
      "Timestamp",
      "Last Name",
      "First Name",
      "Start Time",
      "End Time",
      "Hours",
      "Client",
      "Location",
      "LocID",
      "Unit",
      "Work Order",
      "Notes",
    ];

    // let now = moment("2017-10-17");
    let now = moment();
    // let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getScheduleStartDate(now) : this.data.getScheduleStartDate(moment(now).subtract(7, 'days'));
    let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getNextScheduleStartDate(now) : this.data.getNextScheduleStartDate(moment(now).subtract(7, 'days'));
    let end   = this.toDate   ? moment(this.toDate)   : moment(start).add(6, 'days');
    let strStart = start.format("YYYY-MM-DD");
    let strEnd   = end.format("YYYY-MM-DD");
    let period = new PayrollPeriod(start, end);
    period.getPayrollShifts();
    Log.l(`createExportData(): start is '${strStart}', end is '${strEnd}', and period is:\n`, period);
    let reports = this.allReports.filter((a:Report) => {
      let date = a.report_date;
      return date >= strStart && date <= strEnd;
    }).sort((a:Report,b:Report) => {
      let dA=a.report_date, dB=b.report_date;
      let tA=a.time_start, tB=b.time_start;
      return dA > dB ? 1 : dA < dB ? -1 : tA > tB ? 1 : tA < tB ? -1 : 0;
    });
    Log.l("createExportData(): Reports for export is:\n", reports);

    let grid = [];
    // grid[0] = header;
    let keys = ['payroll_period', 'type', 'training_type', 'report_date', 'timestamp', 'last_name', 'first_name', 'time_start', 'time_end', 'repair_hours', 'client', 'location', 'location_id', 'unit_number', 'work_order_number', 'notes'];
    let others = this.others.filter((a:ReportOther) => {
      let date = a.report_date.format("YYYY-MM-DD");
      return date >= strStart && date <= strEnd;
    }).sort((a,b) => {
      let dA=a.report_date.format("YYYY-MM-DD"), dB=b.report_date.format("YYYY-MM-DD");
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    let allreports = [...reports, ...others];
    Log.l("createExportData(): showreports is now:\n", allreports);
    let showreports = allreports.filter((a:Report|ReportOther) => {
      // let date = obj['report_date'];
      // return date >= strStart && date <= strEnd;
      let lname = a.last_name, fname = a.first_name;
      return !((lname === 'Bates' && fname === 'Michael') || (lname === 'Sargeant' && fname === 'David') || (fname === 'Cecilio' && lname === 'Jauregui'));
    }).sort((a:Report|ReportOther, b:Report|ReportOther) => {
      let dA:string = a instanceof Report ? a.report_date : a.report_date.format("YYYY-MM_DD");
      let dB:string = b instanceof Report ? b.report_date : b.report_date.format("YYYY-MM_DD");
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    Log.l("createExportData(): showreports is now:\n", showreports);
    for(let report of showreports) {
      let row = [];
      for(let key of keys) {
        if(!report[key]) {
          if(key === 'type') {
            row.push("Work Report");
          } else if(key === 'training_type') {
            row.push("");
          } else {
            row.push("");
          }
        } else if(key === 'timestamp') {
          let ts = report[key], time;
          if(typeof ts === 'number') {
            time = moment.fromExcel(ts);
          } else {
            time = moment(ts);
          }
          row.push(time.toExcel());
          // let ts = moment(report[key]);

        } else if(key === 'report_date') {
          if(report instanceof Report) {
            row.push(report[key]);
          } else if(report instanceof ReportOther) {
            row.push(report[key].format("YYYY-MM-DD"));
          }
        } else {
          row.push(report[key]);
        }
      }
      grid.push(row);
    }

    let output = {header: header, rows: grid};
    Log.l("createExportData(): Output is:\n", output);
    return output;
  }

  public toCSV(header: Array<any>, table: Array<Array<any>>) {
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

  public payrollReports() {
    // this.navCtrl.
  }

  public reportViewSave(event?:any) {
    Log.l("reportViewSave(): Event is:\n", event);
    this.reportViewVisible = false;
  }

  public reportViewCancel(event?:any) {
    Log.l("reportViewCancel(): Event is:\n", event);
    this.reportViewVisible = false;
  }

  public openTechShiftReports(event?:any) {
    Log.l("openTechShiftReports(): Now opening Tech Shift Reports page...");
    let reportsList:Report[] = this.dt && this.dt.filteredValue && this.dt.filteredValue.length ? this.dt.filteredValue : this.reports;
    let count = reportsList.length;
    if(count < 1) {
      this.notify.addError("TOO FEW", `${count} reports is not enough!`, 10000);
    } else if(count > 200) {
      this.notify.addError("TOO MANY", `${count} reports is too many, you can only send 200 reports at once.`, 10000);
    } else {
      // this.navCtrl.setRoot("Tech Shift Reports", { reports: reportsList });
      this.navCtrl.push("Tech Shift Reports", { reports: reportsList, mode: 'ro' });
    }
  }

  public exportReportsTableAsCSV(evt?:any) {
    Log.l(`exportReportsTableAsCSV(): event is:\n`, evt);
    if(this.dt && this.dt.exportCSV) {
      this.dt.exportCSV();
    }
  }

  public copyTable(evt?:MouseEvent) {
    Log.l(`copyTable(): event is:\n`, evt);
    let table:Table = this.dt && this.dt instanceof Table ? this.dt : null;
    if(table) {
      Log.l(`copyTable(): called for the TurboTable:\n`, table);
      let options:TurboTableExportOptions = {
        copyToClipboard : true,
        separator       : "\t",
      };
      if(evt && evt.shiftKey) {
        options.copyToClipboard = false;
      }
      this.exportCSV(table, options);
      Log.l(`copyTable(): Finished!`);
    } else {

    }
    // let wrapperElement = this.printArea.nativeElement;
    // document.getElementsByTagName('table')[0]
    // this.showButtonCol = false;
    // this.showFilterRow = false;
    // let tables = document.getElementsByTagName('table');
    // let table:HTMLElement;
    // if(tables && tables.length > 0) {
    //   table = tables[0];
    // }
    // if(table) {
    //   // let el = table.innerHTML;
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
    //   this.showButtonCol = true;
    //   this.showFilterRow = true;
    //   this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
    // }
  }

  public exportCSV(table:Table, options?:TurboTableExportOptions):void {
    let dt:Table = table && table instanceof Table ? table : this.dt;
    let data:Array<Report> = dt.filteredValue || dt.value;
    let csv:string = '\ufeff';
    let copyOnly:boolean = false;
    let separator:string = "\t";

    if(options && options.selectionOnly) {
      data = dt.selection || [];
    }
    if(options && options.copyToClipboard) {
      copyOnly = true;
    }
    if(options && options.separator) {
      separator = options.separator;
    }

    /* Headers */
    for(let i = 0; i < dt.columns.length; i++) {
      let column = dt.columns[i];
      if(column.exportable !== false && column.field) {
        if(copyOnly) {
          csv += (column.header || column.field);
        } else {
          csv += '"' + (column.header || column.field) + '"';
        }
        if(i < (dt.columns.length - 1)) {
          // csv += dt.csvSeparator;
          csv += separator;
        }
      }
    }

    /* Body */
    data.forEach((record, i) => {
      csv += '\n';
      for(let i = 0; i < dt.columns.length; i++) {
        let column = dt.columns[i];
        if(column.exportable !== false && column.field) {
          let cellData = dt.objectUtils.resolveFieldData(record, column.field);

          if(cellData != null) {
            if(dt.exportFunction) {
              cellData = dt.exportFunction({
                data: cellData,
                field: column.field
              });
            } else {
              if(copyOnly) {
                cellData = String(cellData);
              } else {
                cellData = String(cellData).replace(/"/g, '""');
              }
            }
          } else {
            cellData = '';
          }

          if(copyOnly) {
            if(cellData.indexOf('\n') > -1) {
              cellData = cellData.replace(/"/g, '""');
              csv += '"' + cellData + '"';
            } else {
              csv += cellData;
            }
          } else {
            csv += '"' + cellData + '"';
          }

          if(i < (dt.columns.length - 1)) {
            // csv += dt.csvSeparator;
            csv += separator;
          }
        }
      }
    });

    if(copyOnly) {
      // copyStringToClipboard(csv, "text/csv");
      let success:boolean = this.clipboard.copyFromContent(csv);
      if(success) {
        this.notify.addSuccess("COPIED", `Successfully copied visible table to clipboard.`, 3000);
      } else {
        this.notify.addError("ERROR", `Error copying table.`, 3000);
      }
    } else {
      let blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
      });

      if(window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, dt.exportFilename + '.csv');
      } else {
        let link = document.createElement("a");
        link.style.display = 'none';
        document.body.appendChild(link);
        if(link.download !== undefined) {
          link.setAttribute('href', URL.createObjectURL(blob));
          link.setAttribute('download', dt.exportFilename + '.csv');
          link.click();
        } else {
          csv = 'data:text/csv;charset=utf-8,' + csv;
          window.open(encodeURI(csv));
        }
        document.body.removeChild(link);
      }
    }

  }

  public resetReportsTable(evt?:any) {
    Log.l(`resetReportsTable(): Event is:\n`, evt);
    // let dt:DataTable;
    let dt:Table;
    if(this.dt && this.dt instanceof Table) {
      dt = this.dt;
      dt.reset();
      let filterInputElements:any = document.getElementsByClassName('reports-col-filter');
      Log.l(`resetReportsTable(): filter input elements are:\n`, filterInputElements);
      if(filterInputElements && filterInputElements.length) {
        let count = filterInputElements.length;
        for(let i = 0; i < count; i++) {
          let inputElement = filterInputElements[i];
          if(inputElement instanceof HTMLInputElement) {
            inputElement.value = "";
          }
        }
      }
      if(this.globalFilterInput && this.globalFilterInput instanceof ElementRef) {
        let gfInput:HTMLInputElement = this.globalFilterInput.nativeElement;
        gfInput.value = "";
      }
      this.dateRange = null;
    }
  }

}
