import { Subscription                                                 } from 'rxjs'                     ;
import { Component, OnInit, OnDestroy,                                } from '@angular/core'            ;
import { IonicPage, NavController, NavParams                          } from 'ionic-angular'            ;
import { ModalController                                              } from 'ionic-angular'            ;
import { OSData                                                       } from 'providers/data-service'   ;
import { DBService                                                    } from 'providers/db-service'     ;
import { ServerService                                                } from 'providers/server-service' ;
import { AlertService                                                 } from 'providers/alert-service'  ;
import { Preferences                                                  } from 'providers/preferences'    ;
import { DispatchService, NotifyService,                              } from 'providers'                ;
import { Log, Moment, moment, isMoment, oo,                           } from 'domain/onsitexdomain'     ;
import { PayrollPeriod, Report, ReportOther, Shift, Jobsite, Employee } from 'domain/onsitexdomain'     ;

@IonicPage({name: 'Other Reports'})
@Component({
  selector: 'page-reports-other',
  templateUrl: 'reports-other.html',
})
export class ReportsOtherPage implements OnInit,OnDestroy {
  public title            : string    = "Other Reports"                               ;
  public pageSizeOptions  : number[]  = [50,100,200,500,1000,2000]                    ;
  public prefsSub         : Subscription                                              ;
  public others           : Array<ReportOther> = []                                   ;
  public allOthers        : Array<ReportOther> = []                                   ;
  public selectedReport   : Report             = null                                 ;
  public globalSearch     : string             = ""                                   ;
  public fromDate         : string             = ""                                   ;
  public toDate           : string             = ""                                   ;
  public cols             : Array<any>         = []                                   ;
  public dataReady        : boolean            = false                                ;
  public get rowCount()   : number { return this.prefs.CONSOLE.pages.reports_other; } ;
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.reports_other = val; }   ;

  constructor(
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public prefs     : Preferences     ,
    public db        : DBService       ,
    public server    : ServerService   ,
    public alert     : AlertService    ,
    public modalCtrl : ModalController ,
    public data      : OSData          ,
    public notify    : NotifyService   ,
    public dispatch  : DispatchService ,
  ) {
    window['onsiteotherreports'] = this;
  }

  public ionViewDidLoad() {
    Log.l('ionViewDidLoad OtherReportsPage');
  }

  public ngOnInit() {
    Log.l("OtherReports: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("OtherReports: ngOnDestroy() fired");
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public runWhenReady() {
    let others = this.data.getData('others');

    this.initializeSubscriptions();
    this.updatePageSizes();

    let rowCount = Number(this.prefs.CONSOLE.pages.reports_other);
    if(this.pageSizeOptions.indexOf(rowCount) === -1) {
      this.pageSizeOptions.push(rowCount);
      this.pageSizeOptions = this.pageSizeOptions.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
    }

    if(others && others.length) {
      Log.l("OtherReports: using existing work order data.");
      this.cols = this.getFields();
      this.allOthers = others.slice(0);
      this.others = this.allOthers.filter((a:ReportOther) => {
        return a.username !== 'Chorpler' && a.username !== 'Chilo' && a.username !== 'Hachero' && a.username !== 'mike';
      });
      this.dataReady = true;
    } else {
      this.getData().then(res => {
        this.cols = this.getFields();
        this.dataReady = true;
      });
    }
  }

  public initializeSubscriptions() {
    this.prefsSub = this.dispatch.prefsUpdated().subscribe(() => {
      this.updatePageSizes();
    });
  }

  public updatePageSizes() {
    let newPageSizes = this.prefs.CONSOLE.pageSizes.reports_other;
    let rowCount = Number(this.prefs.CONSOLE.pages.reports_other);
    if(newPageSizes.indexOf(rowCount) === -1) {
      newPageSizes.push(rowCount);
      this.pageSizeOptions = newPageSizes.slice(0).sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
      this.rowCount = rowCount;
    } else {
      this.pageSizeOptions = newPageSizes.slice(0);
      this.rowCount = rowCount;
    }
  }


  public getFields() {
    let fields = [];
    fields.push({ field: '_id'              , header: 'ID'          , filter: true, filterPlaceholder: "ID"} );
    fields.push({ field: 'type'             , header: 'Type'        , filter: true, filterPlaceholder: "Type"} );
    fields.push({ field: 'report_date'      , header: 'Date'        , filter: true, filterPlaceholder: "Date"} );
    fields.push({ field: 'timestampM'       , header: "Timestamp"   , filter: true, filterPlaceholder: "Timestamp"} );
    fields.push({ field: 'last_name'        , header: 'Last Name'   , filter: true, filterPlaceholder: "Last Name"} );
    fields.push({ field: 'first_name'       , header: 'First Name'  , filter: true, filterPlaceholder: "First Name"} );
    fields.push({ field: 'training_type'    , header: 'Training'    , filter: true, filterPlaceholder: "Training"} );
    fields.push({ field: 'travel_location'  , header: 'Travel Dest' , filter: true, filterPlaceholder: "Travel Dest"} );
    fields.push({ field: 'time'             , header: 'Hours'       , filter: true, filterPlaceholder: "Hours"} );
    fields.push({ field: 'notes'            , header: 'Notes'       , filter: true, filterPlaceholder: "Notes"} );
    return fields;
  }

  public async getData():Promise<ReportOther[]> {
    let spinnerID:string;
    try {
      spinnerID = await this.alert.showSpinnerPromise("Retrieving other reports …");
      let res:ReportOther[] = await this.db.getReportOthers(spinnerID);
      Log.l("ReportsOther.getData(): Got reports:", res);
      this.allOthers = res;
      this.data.setData('reports', res.slice(0));
      this.others = this.allOthers.slice(0);
      await this.alert.hideSpinnerPromise(spinnerID);
      return res;
    } catch(err) {
      Log.l("ReportsOther.getData(): Error getting Other Reports list!");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public onRowSelect(event:any) {
    Log.l("onRowSelect(): Event passed is:\n", event);
    this.showReportOther(event.data);
  }

  public updateFromDate(event:any) {
    Log.l("updateFromDate(): Event passed is:\n", event);
    let fromDate = "1900-01-01";
    let toDate   = "9999-12-31";
    if(this.fromDate) {
      fromDate = moment(this.fromDate).format("YYYY-MM-DD");
    }
    if(this.toDate) {
      toDate = moment(this.toDate).format("YYYY-MM-DD");
    }

    Log.l(`updateFromDate(): Now filtering from ${fromDate} - ${toDate}...`);
    this.others = this.allOthers.filter((a:ReportOther) => {
      // return a.report_date.format("YYYY-MM-DD") >= fromDate && a.report_date.format("YYYY-MM-DD") <= toDate;
      let dA:string = a.getReportDateAsString();
      return dA >= fromDate && dA <= toDate;
    });
  }

  public updateToDate(event:any) {
    let fromDate = "1900-01-01";
    let toDate = "9999-12-31";
    if(this.fromDate) {
      fromDate = moment(this.fromDate).format("YYYY-MM-DD");
    }
    if(this.toDate) {
      toDate = moment(this.toDate).format("YYYY-MM-DD");
    }
    Log.l(`updateToDate(): Now filtering from ${fromDate} - ${toDate}...`);
    this.others = this.allOthers.filter((a:ReportOther) => {
      // return a.report_date.format("YYYY-MM-DD") >= fromDate && a.report_date.format("YYYY-MM-DD") <= toDate;
      let dA:string = a.getReportDateAsString();
      return dA >= fromDate && dA <= toDate;
    });
  }

  public showReportOther(other: ReportOther) {
    let showReportPage = this.modalCtrl.create("View Other Report", {report: other});
    showReportPage.onDidDismiss(data => { });
    showReportPage.present();
  }

  public mikeTemporaryDab() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Other Reports', { data: data, csv: csv });
  }

  public createExportData() {
    let dat = this.others;
    let overall = [];
    let i = 0, j = 0;
    let header = [
      "Period",
      "Type",
      "Training",
      "Travel Dest",
      "Date",
      "Timestamp",
      "Last Name",
      "First Name",
      "Notes",
    ];

    let now = moment();
    // let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getScheduleStartDate(now) : this.data.getScheduleStartDate(moment(now).subtract(7, 'days'));
    let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getNextScheduleStartDate(now) : this.data.getNextScheduleStartDate(moment(now).subtract(7, 'days'));
    let end   = this.toDate ? moment(this.toDate) : moment(start).add(6, 'days');
    let strStart = start.format("YYYY-MM-DD");
    let strEnd   = end.format("YYYY-MM-DD");
    let period = new PayrollPeriod(start, end);
    period.getPayrollShifts();
    let reports:ReportOther[] = this.allOthers.filter((a:ReportOther) => {
      // let date = a.report_date.format("YYYY-MM-DD");
      let date:string = a.getReportDateAsString();
      return date >= strStart && date <= strEnd;
    }).sort((a:ReportOther,b:ReportOther) => {
      let dA:string = a.getReportDateAsString();
      let dB:string = b.getReportDateAsString();
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });

    let grid = [];
    // grid[0] = header;
    let keys = ['payroll_period', 'type', 'training_type', 'report_date', 'timestamp', 'last_name', 'first_name', 'time_start', 'time_end', 'repair_hours', 'client', 'location', 'location_id', 'unit_number', 'work_order_number', 'notes'];
    let others:ReportOther[] = this.others.slice(0).filter((a:ReportOther) => {
      // let date = obj['report_date'].format("YYYY-MM-DD");
      let date:string = a.getReportDateAsString();
      return date >= strStart && date <= strEnd;
    }).sort((a:ReportOther,b:ReportOther) => {
      // let dA=a['report_date'].format("YYYY-MM-DD"), dB=b['report_date'].format("YYYY-MM-DD");
      let dA:string = a.getReportDateAsString();
      let dB:string = b.getReportDateAsString();
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    let allreports  : ReportOther[] = [...reports, ...others];
    let showreports : ReportOther[] = allreports.slice(0).filter((a:ReportOther) => {
      let lname:string = a.last_name;
      let fname:string = a.first_name;
      return !((lname === 'Bates' && fname === 'Michael') || (lname === 'Sargeant' && fname === 'David') || (fname === 'Cecilio' && lname === 'Jauregui'));
    }).sort((a:ReportOther, b:ReportOther) => {
      // let dA:string = a.report_date.format("YYYY-MM-DD");
      // let dB:string = b.report_date.format("YYYY-MM-DD");
      let dA:string = a.getReportDateAsString();
      let dB:string = b.getReportDateAsString();
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
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
            // row.push(report[key].format("YYYY-MM-DD"));
            row.push(report[key]);
          }
        } else {
          row.push(report[key]);
        }
      }
      grid.push(row);
    }

    let html = this.toCSV(header, grid);

    // return html;
    return {header: header, rows: grid};
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

  }
}
