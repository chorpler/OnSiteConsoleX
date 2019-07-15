import { sprintf                                                   } from 'sprintf-js'                               ;
import { Component, OnInit, OnDestroy, NgZone, Input, Output,      } from '@angular/core'                            ;
import { ElementRef, ViewChild, EventEmitter,                      } from '@angular/core'                            ;
import { OptionsComponent                                          } from '../../components/options/options'         ;
import { ServerService                                             } from '../../providers/server-service'           ;
import { DBService                                                 } from '../../providers/db-service'               ;
import { AuthService                                               } from '../../providers/auth-service'             ;
import { AlertService                                              } from '../../providers/alert-service'            ;
import { OSData                                                    } from '../../providers/data-service'             ;
// import { PDFService                                                } from '../../providers/pdf-service'              ;
import { NumberService                                             } from '../../providers/number-service'           ;
import { Jobsite, Employee, Schedule, Report, Shift, PayrollPeriod } from 'domain/onsitexdomain'              ;
import { ReportOther,                                              } from 'domain/onsitexdomain'              ;
import { Log, moment, Moment, isMoment, oo                         } from 'domain/onsitexdomain'            ;
import { Message, SelectItem, InputTextarea, Dropdown,             } from 'primeng/primeng'                          ;
import { NotifyService                                             } from '../../providers/notify-service'           ;
import { Subscription                                              } from 'rxjs'                        ;
import { Command, KeyCommandService                                } from '../../providers/key-command-service'      ;

const _dedupe = (array, property?) => {
  let prop = "fullName";
  if (property) {
    prop = property;
  }
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

@Component({
  selector: 'report-view',
  templateUrl: 'report-view.html',
})
export class ReportViewComponent implements OnInit,OnDestroy {
  @Input('mode')       mode : string = "edit"     ;
  @Input('shift')     shift : Shift               ;
  @Input('period')   period : PayrollPeriod       ;
  @Input('report')   report : Report              ;
  @Input('reports') reports : Report[]  = [] ;
  @Input('tech')       tech : Employee            ;
  @Input('site')       site : Jobsite             ;
  @Input('sites')     sites : Jobsite[] = [] ;
  @Output('finished') finished = new EventEmitter<any>();
  @Output('reportChange') reportChange = new EventEmitter<any>();
  public title      : string         = "View Work Report" ;
  public keySubscription: Subscription                    ;

  public moment                      = moment             ;
  public idx        : number         = 0                  ;
  public count      : number         = 0                  ;
  public report_date: Date                                ;
  public client     : any            ;
  public location   : any            ;
  public locID      : any            ;

  public clients     :any[]     = []                 ;
  public locations   :any[]     = []                 ;
  public locIDs      :any[]     = []                 ;
  public repair_hours:number = 0;
  public time_start  :Date           = new Date()         ;
  public time_end    :Date           = new Date()         ;
  public clientList  :SelectItem[]   = []                 ;
  public locationList:SelectItem[]   = []                 ;
  public locIDList   :SelectItem[]   = []                 ;
  public timeList    :SelectItem[]   = []                 ;
  public reportUndo  :any[]     = []                 ;
  public dataReady   :boolean        = false              ;

  constructor(
    public db        : DBService         ,
    public server    : ServerService     ,
    public alert     : AlertService      ,
    public data      : OSData            ,
    public notify    : NotifyService     ,
    public keyService: KeyCommandService ,
    public numServ   : NumberService     ,
  ) {
    window['reportviewcomponent'] = this;
    window['p'] = this;
    window['_dedupe'] = _dedupe;
  }

  ngOnInit() {
    Log.l("ReportViewComponent: ngOnInit() called");
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "ReportView.previous" : this.previous(); break;
        case "ReportView.next"     : this.next(); break;
        case "ReportView.previous" : this.previous(); break;
        case "ReportView.next"     : this.next(); break;
      }
    });

    this.data.appReady().then(res => {
      let backupReport = oo.clone(this.report);
      this.reportUndo.push(backupReport);
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("ReportViewComponent: ngOnDestroy() fired.");
    this.keySubscription.unsubscribe();
  }

  public runWhenReady() {
    this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    this.locations = _dedupe(this.sites.map((a:Jobsite) => a.location));
    this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a.locID));
    this.idx = this.reports.indexOf(this.report);
    this.count = this.reports.length;
    let site = this.getReportLocation();
    this.site = site;
    let report = this.report;

    this.createMenuLists();
    this.updateDisplay(report);

    this.dataReady = true;
  }

  public createMenuLists() {
    let rpt:Report = this.report;
    let rd = rpt.report_date;
    let reportDate = moment(rpt.report_date, "YYYY-MM-DD").startOf('day');
    let timeList:SelectItem[] = [];
    for(let i = 0; i < 24; i++) {
      for(let j = 0; j < 60; j += 30) {
        let time = sprintf("%02d:%02d", i, j);
        let dateTime:Moment = moment(reportDate).hour(i).minute(j);
        let item:SelectItem = {label: time, value: dateTime};
        timeList.push(item);
      }
    }

    let clientList  : SelectItem[] = [] ;
    let locationList: SelectItem[] = [] ;
    let locIDList   : SelectItem[] = [] ;
    for(let val of this.clients) {
      let item:SelectItem = {label: val.fullName, value: val}
      clientList.push(item);
    }
    for(let val of this.locations) {
      let item:SelectItem = {label: val.fullName, value: val}
      locationList.push(item);
    }
    for(let val of this.locIDs) {
      let item:SelectItem = {label: val.fullName, value: val}
      locIDList.push(item);
    }
    this.timeList     = timeList     ;
    this.clientList   = clientList   ;
    this.locationList = locationList ;
    this.locIDList    = locIDList    ;
  }

  public updateDisplay(report?:Report) {
    let rpt:Report = report || this.report;
    let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    let hours = this.report.getRepairHours();
    let repair_hours = this.data.convertTimeStringToHours(hours);
    let time_start = moment(rpt.time_start);
    let time_end   = moment(rpt.time_end  );
    this.time_start = time_start.toDate();
    this.time_end = time_end.toDate();
    this.repair_hours = repair_hours;
    // let startItem:SelectItem = this.timeList.find((a:SelectItem) => {
    //   let time = moment(a.value);
    //   return time.isSame(time_start);
    // });
    // let endItem:SelectItem = this.timeList.find((a:SelectItem) => {
    //   let time = moment(a.value);
    //   return time.isSame(time_end);
    // });
    // this.time_start = startItem.value.toDate();
    // this.time_end = endItem.value.toDate();


    let name  = rpt.username;
    let index = this.reports.indexOf(rpt) + 1;
    let count = this.reports.length;
    let report_date = moment(rpt.report_date).toDate();
    this.report_date = report_date;
    let client = this.data.getFullClient(rpt.client);
    let location = this.data.getFullLocation(rpt.location);
    let locID = this.data.getFullLocID(rpt.location_id);
    this.client = this.clientList.find((a:SelectItem) => {
      return a.value.name === client.name;
    }).value;
    this.location = this.locationList.find((a:SelectItem) => {
      return a.value.name === location.name;
    }).value;
    this.locID = this.locIDList.find((a:SelectItem) => {
      return a.value.name === locID.name;
    }).value;
  }

  public cancel(event?:any) {
    // this.viewCtrl.dismiss();
    Log.l("cancel(): Clicked, event is:\n", event);
    this.finished.emit(event);
  }

  public saveNoExit() {
    this.db.saveReport(this.report).then(res => {
      Log.l("saveNoExit(): Report successfully saved.");
      if(this.period) {
        this.period.addReport(this.report);
      } else if(this.shift) {
        this.shift.addShiftReport(this.report);
      }
      this.reportChange.emit()
      // this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving report.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving report:<br>\n<br>\n" + err.message);
    });

  }

  public save(event?:any) {
    this.db.saveReport(this.report).then(res => {
      Log.l("save(): Report successfully saved.");
      if(this.period) {
        this.period.addReport(this.report);
      } else if(this.shift) {
        this.shift.addShiftReport(this.report);
      }
      // this.viewCtrl.dismiss();
      this.finished.emit(event);
    }).catch(err => {
      Log.l("save(): Error saving report.");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 1000);
    });
  }

  public deleteReport(event:any) {
    let report = this.report;
    this.db.deleteReport(report).then(res => {
      Log.l("deleteReport(): Successfully deleted report.");
      this.cancel(event);
    }).catch(err => {
      Log.l("deleteReport(): Error deleting report.");
      Log.e(err);
      this.alert.showAlert("ERROR", `Error deleting report ${report._id}:<br>\n<br>\n` + err.message);
    });
  }

  public updateDate(newDate:Date) {
    let date = moment(newDate);
    let report = this.report;
    report.report_date = date.format("YYYY-MM-DD");
    report.shift_serial = Shift.getShiftSerial(date);
    report.payroll_period = PayrollPeriod.getPayrollSerial(date);
  }

  public setReportLocation(site:Jobsite) {
    let tech = this.tech;
    // let report = this.report;
    // let cli = this.data.getFullClient(tech.client);
    // let loc = this.data.getFullLocation(tech.location);
    // let lid = this.data.getFullLocation(tech.locID);
    let cli = site.client;
    let loc = site.location;
    let lid = site.locID;
    this.updateReportCLL('client', cli);
    this.updateReportCLL('location', loc);
    this.updateReportCLL('locID', lid);
    this.client = this.clients.find(a => {
      return a['name'] === cli.name;
    });
    this.location = this.locations.find(a => {
      return a['name'] === loc.name;
    });
    this.locID = this.locIDs.find(a => {
      return a['name'] === lid.name;
    });
    // this.updateReportCLL('client', client);
    // this.updateReportCLL('location', location);
    // this.updateReportCLL('locID', locID);
    // this.site = site;
    // return this.site;
    return this.report;
  }

  public getReportLocation() {
    let rpt = this.report;
    let cli  = this.data.getFullClient(rpt.client);
    let loc  = this.data.getFullLocation(rpt.location);
    let lid  = this.data.getFullLocID(rpt.location_id);
    let site = this.sites.find((a:Jobsite) => {
      let siteClient   = a.client.name;
      let siteLocation = a.location.name;
      let siteLocID    = a.locID.name;
      return siteClient === cli.name && siteLocation === loc.name && siteLocID === lid.name;
    });
    Log.l(`getReportLocation(): Report/tech located at site:\n`, site);
    return site;
  }

  public updateReportCLL(key:string, value:any) {
    let report = this.report;
    Log.l(`updateReportCLL(): Setting report key ${key} to:\n`, value);
    if(key === 'client') {
      report.client = value.fullName;
    } else if(key === 'location') {
      report.location = value.fullName;
    } else if(key === 'locID') {
      report.location_id = value.name;
    } else {
      Log.w(`updateReportCLL(): Unable to find key ${key} to set, in ReportOther:\n`, report);
    }  }

  public updateRepairHours() {
    let report = this.report;
    report.setRepairHours(Number(this.report.repair_hours));
    // this.time_start = moment(report.time_start);
    // this.time_end = moment(report.time_end);
    this.updateDisplay();
  }

  public updateTimeStart() {
    let report = this.report;
    let start = moment(this.time_start);
    report.setStartTime(start);
    this.updateDisplay();
  }

  public updateTimeEnd() {
    let report = this.report;
    let end = moment(this.time_end);
    report.setEndTime(end);
    this.updateDisplay();
  }

  public previous() {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.report = this.reports[this.idx];
    this.reportChange.emit(this.idx);
    this.updateDisplay();
  }

  public next() {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.report = this.reports[this.idx];
    this.reportChange.emit(this.idx);
    this.updateDisplay(this.report);
  }

  public splitReport(event?:any) {
    let report = this.report;
    let idx = this.reports.indexOf(report);
    let rpt1:Report = this.reports.splice(idx, 1)[0];
    this.reports.push(rpt1);
    let reportDoc = report.serialize();
    // let newReport = new Report();
    // newReport.readFromDoc(reportDoc);
    let newReport = this.data.splitReport(report);
    report.split_count++;
    newReport.split_count++;
    newReport._rev = "";
    let start = moment(report.time_start);
    let hours = report.getRepairHours();
    let splitHours1 = hours / 2;
    let splitHours2 = hours / 2;
    let splitMinutes1 = splitHours1 * 60;
    let splitMinutes2 = splitHours2 * 60;
    let remainder = splitMinutes1 % 30;
    if(remainder !== 0) {
      splitMinutes1 += remainder;
      splitMinutes2 -= remainder;
    }
    splitHours1 = splitMinutes1 / 60;
    splitHours2 = splitMinutes2 / 60;
    // let newStart = moment(start).add(splitMinutes1, 'minutes');
    report.setRepairHours(splitHours1);
    let end = moment(report.time_end);
    newReport.setStartTime(end);
    newReport.setRepairHours(splitHours2);
    this.reports.push(newReport);
    this.report = newReport;
    this.count = this.reports.length;
    this.idx = this.count - 1;
    this.reportChange.emit(this.idx);
  }

//   public
// }

}
