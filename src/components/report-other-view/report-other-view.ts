import { Subscription                                              } from 'rxjs'                          ;
import { sprintf                                                   } from 'sprintf-js'                    ;
import { Component, OnInit, OnDestroy, NgZone, Input, Output,      } from '@angular/core'                 ;
import { ElementRef, ViewChild, EventEmitter,                      } from '@angular/core'                 ;
import { OptionsComponent                                          } from 'components/options/options'    ;
import { ServerService                                             } from 'providers/server-service'      ;
import { DBService                                                 } from 'providers/db-service'          ;
import { AuthService                                               } from 'providers/auth-service'        ;
import { AlertService                                              } from 'providers/alert-service'       ;
import { OSData                                                    } from 'providers/data-service'        ;
// import { PDFService                                                } from 'providers/pdf-service'         ;
import { NumberService                                             } from 'providers/number-service'      ;
import { Jobsite, Employee, Schedule, Report, Shift, PayrollPeriod } from 'domain/onsitexdomain'          ;
import { ReportOther,                                              } from 'domain/onsitexdomain'          ;
import { Log, moment, Moment, isMoment, oo, _dedupe,               } from 'domain/onsitexdomain'          ;
import { Message, SelectItem, InputTextarea, Dropdown,             } from 'primeng/primeng'               ;
import { NotifyService                                             } from 'providers/notify-service'      ;
import { Command, KeyCommandService                                } from 'providers/key-command-service' ;

// const _dedupe = (array, property?) => {
//   let prop = "fullName";
//   if (property) {
//     prop = property;
//   }
//   return array.filter((obj, pos, arr) => {
//     return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
//   });
// }

@Component({
  selector: 'report-other-view',
  templateUrl: 'report-other-view.html',
})
export class ReportOtherViewComponent implements OnInit,OnDestroy {
  @Input('mode')       mode : string = "edit"         ;
  @Input('shift')     shift : Shift                   ;
  @Input('period')   period : PayrollPeriod           ;
  @Input('other')     other : ReportOther             ;
  @Input('others')   others : ReportOther[] = []      ;
  @Input('tech')       tech : Employee                ;
  @Input('site')       site : Jobsite                 ;
  @Input('sites')     sites : Jobsite[] = []          ;
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('finished') finished = new EventEmitter<any>();
  @Output('reportChange') reportChange = new EventEmitter<any>();
  
  public visible    : boolean        = true               ;
  public dialogLeft : number         = 250                ;
  public dialogTop  : number         = 100                ;
  public header     : string         = "View Misc Report" ;
  public title      : string         = "View Misc Report" ;
  public keySubscription: Subscription                    ;
  public dateFormat : "excel"|"moment" = "excel"          ;

  public moment                      = moment             ;
  public idx        : number         = 0                  ;
  public count      : number         = 0                  ;
  public report_date: Date                                ;
  public client     : any                                 ;
  public location   : any                                 ;
  public locID      : any                                 ;

  public clients     :any[]     = []                      ;
  public locations   :any[]     = []                      ;
  public locIDs      :any[]     = []                      ;
  public repair_hours:number = 0;
  public time_start  :Date           = new Date()         ;
  public time_end    :Date           = new Date()         ;
  public selectedSite:Jobsite                             ;
  public siteList    :SelectItem[]   = []                 ;
  public clientList  :SelectItem[]   = []                 ;
  public locationList:SelectItem[]   = []                 ;
  public locIDList   :SelectItem[]   = []                 ;
  public timeList    :SelectItem[]   = []                 ;
  public unassigned  :Jobsite                             ;
  public oldComponent:any                                 ;
  public reportUndo  :any[]     = []                      ;
  public dataReady   :boolean        = false              ;

  constructor(
    public db         : DBService         ,
    public server     : ServerService     ,
    public alert      : AlertService      ,
    public data       : OSData            ,
    public notify     : NotifyService     ,
    public keyService : KeyCommandService ,
    public numServ    : NumberService     ,
  ) {
    window['reportviewcomponent' ] = this;
    // window['reportviewcomponent2'] = this;
    window['_dedupe'] = _dedupe;
    this.oldComponent = window['p'];
    window['p'] = this;
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

    if(this.data.isAppReady()) {
      let backupReport = oo.clone(this.other);
      this.reportUndo.push(backupReport);
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportViewComponent: ngOnDestroy() fired.");
    if(this.keySubscription) {
      this.keySubscription.unsubscribe();
    }
    window['p'] = this.oldComponent;
  }

  public runWhenReady() {
    this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    this.locations = _dedupe(this.sites.map((a:Jobsite) => a.location));
    this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a.locID));
    this.idx = this.others.indexOf(this.other);
    this.count = this.others.length;
    let site = this.getReportLocation();
    this.site = site;
    this.unassigned = this.sites.find((a:Jobsite) => {
      return a.site_number == 1;
    });
    let other = this.other;

    this.createMenuLists();
    this.updateDisplay(other);

    this.dataReady = true;
  }

  public createMenuLists() {
    let rpt:ReportOther = this.other;
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
    let siteList    : SelectItem[] = [] ;
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
    for(let site of this.sites) {
      let item:SelectItem = { label: site.getSiteSelectName(), value: site };
      siteList.push(item);
    }
    this.timeList     = timeList     ;
    this.clientList   = clientList   ;
    this.locationList = locationList ;
    this.locIDList    = locIDList    ;
    this.siteList     = siteList     ;
  }

  public updateDisplay(other?:ReportOther) {
    let rpt:ReportOther = other || this.other;
    let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    // this.repair_hours = repair_hours;
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
    let index = this.others.indexOf(rpt) + 1;
    let count = this.others.length;
    let report_date = moment(rpt.report_date).toDate();
    this.report_date = report_date;
    let client = this.data.getFullClient(rpt.client);
    let location = this.data.getFullLocation(rpt.location);
    let locID = this.data.getFullLocID(rpt.location_id);
    let selClient = this.clientList.find((a:SelectItem) => {
      return a.value.name === client.name;
    });
    let selLocation = this.locationList.find((a:SelectItem) => {
      return a.value.name === location.name;
    });
    let selLocID = this.locIDList.find((a:SelectItem) => {
      return a.value.name === locID.name;
    });
    this.client = selClient ? selClient.value : this.unassigned.client;
    this.location = selLocation ? selLocation.value : this.unassigned.location;
    this.locID = selLocID ? selLocID.value : this.unassigned.locID;
  }

  public updateSite(site:Jobsite) {
    let client   = site.client;
    let location = site.location;
    let locID    = site.locID;
    this.other.setSite(site);
  }

  // public cancel(event?:any) {
  //   // this.viewCtrl.dismiss();
  //   Log.l("cancel(): Clicked, event is:\n", event);
  //   this.finished.emit(event);
  // }

  public saveNoExit() {
    this.db.saveOtherReport(this.other).then(res => {
      Log.l("saveNoExit(): Report successfully saved.");
      if(this.period) {
        this.period.addReportOther(this.other);
      } else if(this.shift) {
        this.shift.addOtherReport(this.other);
      }
      this.reportChange.emit()
      // this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving report.");
      Log.e(err);
      // this.alert.showAlert("ERROR", "Error saving report:<br>\n<br>\n" + err.message);
      this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 10000);
    });

  }

  public save(event?:any) {
    this.db.saveOtherReport(this.other).then(res => {
      Log.l("save(): Report successfully saved.");
      if(this.period) {
        this.period.addReportOther(this.other);
      } else if(this.shift) {
        this.shift.addOtherReport(this.other);
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
    let report = this.other;
    this.db.deleteOtherReport(report).then(res => {
      Log.l("deleteReport(): Successfully deleted report.");
      this.cancel.emit(event);
    }).catch(err => {
      Log.l("deleteReport(): Error deleting report.");
      Log.e(err);
      this.notify.addError("ERROR", `Error deleting ReportOther '${report._id}': '${err.message}'`, 10000);
    });
  }

  public updateDate(newDate:Date) {
    let date = moment(newDate);
    let report = this.other;
    report.report_date = moment(date);
    report.shift_serial = Shift.getShiftSerial(date);
    report.payroll_period = PayrollPeriod.getPayrollSerial(date);
  }

  public setReportLocation(site:Jobsite) {
    let tech = this.tech;
    // let report = this.other;
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
    return this.other;
  }

  public getReportLocation() {
    let rpt = this.other;
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
    let report = this.other;
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
    let report = this.other;
    // report.setRepairHours(Number(this.other.repair_hours));
    // this.time_start = moment(report.time_start);
    // this.time_end = moment(report.time_end);
    this.updateDisplay();
  }

  public updateTimeStart() {
    let report = this.other;
    let start = moment(this.time_start);
    // report.setStartTime(start);
    this.updateDisplay();
  }

  public updateTimeEnd() {
    let report = this.other;
    let end = moment(this.time_end);
    // report.setEndTime(end);
    this.updateDisplay();
  }

  public previous() {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.other = this.others[this.idx];
    this.reportChange.emit(this.idx);
  }

  public next() {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.other = this.others[this.idx];
    this.reportChange.emit(this.idx);
  }

  public toggleDateFormat() {
    if(this.dateFormat==='excel') {
      this.dateFormat = 'moment';
    } else {
      this.dateFormat = 'excel';
    }
  }

  public cancelClicked(event?:Event) {
    // this.viewCtrl.dismiss();
    Log.l("cancelClicked(): Clicked, event is:", event);
    this.cancel.emit(event);
    this.finished.emit(event);
  }

  // public splitReport(event?:any) {
  //   let report = this.other;
  //   let idx = this.others.indexOf(report);
  //   let rpt1:ReportOther = this.others.splice(idx, 1)[0];
  //   let tech:Employee = this.employee;
  //   this.others.push(rpt1);
  //   let reportDoc = report.serialize();
  //   // let newReport = new Report();
  //   // newReport.readFromDoc(reportDoc);
  //   let newReport = this.data.splitReport(report);
  //   report.split_count++;
  //   newReport.split_count++;
  //   newReport._rev = "";
  //   let start = moment(report.time_start);
  //   let hours = report.getRepairHours();
  //   let splitHours1 = hours / 2;
  //   let splitHours2 = hours / 2;
  //   let splitMinutes1 = splitHours1 * 60;
  //   let splitMinutes2 = splitHours2 * 60;
  //   let remainder = splitMinutes1 % 30;
  //   if(remainder !== 0) {
  //     splitMinutes1 += remainder;
  //     splitMinutes2 -= remainder;
  //   }
  //   splitHours1 = splitMinutes1 / 60;
  //   splitHours2 = splitMinutes2 / 60;
  //   // let newStart = moment(start).add(splitMinutes1, 'minutes');
  //   report.setRepairHours(splitHours1);
  //   let end = moment(report.time_end);
  //   newReport.setStartTime(end);
  //   newReport.setRepairHours(splitHours2);
  //   this.others.push(newReport);
  //   this.other = newReport;
  //   this.count = this.others.length;
  //   this.idx = this.count - 1;
  //   this.reportChange.emit(this.idx);
  // }

//   public
// }

}
