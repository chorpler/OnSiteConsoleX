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
import { SESAClient, SESALocation, SESALocID, SESAAux,             } from 'domain/onsitexdomain'          ;
import { Message, SelectItem, InputTextarea, Dropdown,             } from 'primeng/primeng'               ;
import { NotifyService                                             } from 'providers/notify-service'      ;
import { Command, KeyCommandService                                } from 'providers/key-command-service' ;
import { Calendar } from 'primeng/calendar';

@Component({
  selector: 'report-view',
  templateUrl: 'report-view.html',
})
export class ReportViewComponent implements OnInit,OnDestroy {
  @ViewChild('startTimeCal') startTimeCal:Calendar;
  @ViewChild('endTimeCal') endTimeCal:Calendar;
  @Input('mode')       mode : string = "edit"     ;
  @Input('shift')     shift : Shift               ;
  @Input('period')   period : PayrollPeriod       ;
  @Input('report')   report : Report              ;
  @Input('reports') reports : Report[]  = []      ;
  @Input('tech')       tech : Employee            ;
  @Input('site')       site : Jobsite             ;
  @Input('sites')     sites : Jobsite[] = []      ;
  @Output('finished') finished = new EventEmitter<any>();
  @Output('reportChange') reportChange = new EventEmitter<any>();
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('save')     save = new EventEmitter<any>();

  public title      : string         = "View Work Report" ;
  public visible    : boolean        = true               ;
  public dialogLeft : number         = 250                ;
  public dialogTop  : number         = 100                ;
  public header     : string         = "View Report"      ;
  public keySubscription: Subscription                    ;

  public moment                      = moment             ;
  public idx        : number         = 0                  ;
  public count      : number         = 0                  ;
  public report_date: Date                                ;
  public client     : any            ;
  public location   : any            ;
  public locID      : any            ;

  public clients     :any[]           = []                 ;
  public locations   :any[]           = []                 ;
  public locIDs      :any[]           = []                 ;
  public repair_hours:number = 0;
  public time_start  :Date           = new Date()         ;
  public time_end    :Date           = new Date()         ;
  public siteList    :SelectItem[]   = []                 ;
  public clientList  :SelectItem[]   = []                 ;
  public locationList:SelectItem[]   = []                 ;
  public locIDList   :SelectItem[]   = []                 ;
  public timeList    :SelectItem[]   = []                 ;
  public reportUndo  :any[]          = []                 ;
  public prevComp    :any                                 ;
  public reportTimeError:boolean     = false              ;
  public stepMinute  :number         = 15                 ;
  public dropdownScroll : string     = "200px"            ;
  public detailedSite:boolean        = false              ;
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
    window['onsitereportview']  = this;
    window['onsitereportview2'] = this;
    this.prevComp = window['p'];
    window['p'] = this;
    window['_dedupe'] = _dedupe;
  }

  ngOnInit() {
    Log.l("ReportViewComponent: ngOnInit() called");
    if(this.data.isAppReady()) {
      let backupReport = oo.clone(this.report);
      this.reportUndo.push(backupReport);
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportViewComponent: ngOnDestroy() fired.");
    this.cancelSubscriptions();
    if(this.prevComp) {
      window['p'] = this.prevComp;
    }
  }

  public installSubscribers() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "ReportView.previous" : this.previous(); break;
        case "ReportView.next"     : this.next(); break;
        case "ReportView.previous" : this.previous(); break;
        case "ReportView.next"     : this.next(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    this.installSubscribers();
    let clients:SESAClient[]     = this.sites.map((a:Jobsite) => a.client);
    let locations:SESALocation[] = this.sites.map((a:Jobsite) => a.location);
    let locIDs:SESALocID[]       = this.sites.map((a:Jobsite) => a.locID);
    // this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    // this.locations = _dedupe(this.sites.map((a:Jobsite) => a.location));
    // this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a.locID));
    this.clients   = _dedupe(clients  , 'value');
    this.locations = _dedupe(locations, 'value');
    this.locIDs    = _dedupe(locIDs   , 'value');
    let rpt:Report = this.report || this.reports[0];
    this.idx = this.reports.indexOf(rpt);
    this.count = this.reports.length;
    let site = this.getReportLocation();
    this.site = site;
    let report = this.report;
    this.setHeader();
    this.createMenuLists();
    this.updateDisplay(report);
    // let report_date = rpt.getReportDateAsMoment().toDate();
    // this.report_date = report_date;
    this.report_date = rpt.getReportDateAsMoment().toDate();


    this.dataReady = true;
  }

  public setHeader(idx?:number) {
    let count = this.reports.length;
    let index = idx || this.idx;
    this.header = `View Report (${index+1} / ${count})`;
    return this.header;
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

    let siteList    : SelectItem[] = [] ;
    let clientList  : SelectItem[] = [] ;
    let locationList: SelectItem[] = [] ;
    let locIDList   : SelectItem[] = [] ;
    for(let site of this.sites) {
      let name:string = site.getSiteSelectName();
      let item:SelectItem = {label: name, value: site}
      siteList.push(item);
    }
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
    this.siteList     = siteList     ;
    this.clientList   = clientList   ;
    this.locationList = locationList ;
    this.locIDList    = locIDList    ;
  }

  public updateDisplay(report?:Report) {
    let rpt:Report = report || this.report;
    // let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    // let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    let hours = rpt.getRepairHours();
    let repair_hours = this.data.convertTimeStringToHours(hours);
    let time_start = moment(rpt.time_start);
    let time_end   = moment(rpt.time_end  );
    // rpt.getStartTime().toDate()
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


    // let name  = rpt.username;
    // let index = this.reports.indexOf(rpt) + 1;
    // let count = this.reports.length;
    // let report_date = moment(rpt.report_date).toDate();
    // this.report_date = report_date;
    // this.report_date = report_date;
    let site:Jobsite = this.sites.find((a:Jobsite) => {
      return this.report.matchesSite(a);
    });
    if(site) {
      this.site = this.siteList.find((a:SelectItem) => {
        return a.value === site;
      }).value;
    }
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

  public cancelClicked(event?:any) {
    // this.viewCtrl.dismiss();
    Log.l("cancel(): Clicked, event is:", event);
    this.cancel.emit(event);
    this.finished.emit(event);
  }

  public async saveNoExitClicked(event?:any) {
    let spinnerID:string;
    let rpt:Report = this.report;
    try {
      Log.l("saveNoExitClicked(): Attempting to save report …");
      let username:string = this.data.getUsername();
      if(rpt.times_error || rpt.date_error) {
        let text:string = "This report has an error somewhere. The report date and start time may not match, or the start time plus repair hours may not match the end time. Are you sure you want to save a broken report?";
        let confirm:boolean = await this.alert.showConfirmYesNo("WARNING", text);
        if(!confirm) {
          return;
        }
      }
      spinnerID = await this.alert.showSpinnerPromise("Saving report …");
      let res = await this.db.saveReport(rpt, username);
      Log.l("saveNoExitClicked(): Report successfully saved.");
      await this.alert.hideSpinnerPromise(spinnerID);
      // if(this.period) {
        //   this.period.addReport(this.report);
        // } else if(this.shift) {
          //   this.shift.addShiftReport(this.report);
          // }
          // this.viewCtrl.dismiss();
      // this.save.emit(event);
      // this.finished.emit(event);
      return res;
    } catch(err) {
      Log.l(`saveNoExitClicked(): Error saving report`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      // this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 5000);
      await this.alert.showErrorMessage("ERROR", "Error saving report", err);
    }
  }

  // public saveNoExit(event?:any) {
  //   this.db.saveReport(this.report).then(res => {
  //     Log.l("saveNoExit(): Report successfully saved.");
  //     if(this.period) {
  //       this.period.addReport(this.report);
  //     } else if(this.shift) {
  //       this.shift.addShiftReport(this.report);
  //     }
  //     this.reportChange.emit()
  //     // this.viewCtrl.dismiss();
  //   }).catch(err => {
  //     Log.l("save(): Error saving report.");
  //     Log.e(err);
  //     this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 10000);
  //     // this.alert.showAlert("ERROR", "Error saving report:<br>\n<br>\n" + err.message);
  //   });
  // }

  public async saveClicked(event?:any) {
    let spinnerID:string;
    let rpt:Report = this.report;
    try {
      Log.l("saveClicked(): Attempting to save report …");
      let username:string = this.data.getUsername();
      if(rpt.times_error || rpt.date_error) {
        let text:string = "This report has an error somewhere. The report date and start time may not match, or the start time plus repair hours may not match the end time. Are you sure you want to save a broken report?";
        let confirm:boolean = await this.alert.showConfirmYesNo("WARNING", text);
        if(!confirm) {
          return;
        }
      }
      spinnerID = await this.alert.showSpinnerPromise("Saving report …");
      let res = await this.db.saveReport(rpt, username);
      Log.l("saveClicked(): Report successfully saved.");
      await this.alert.hideSpinnerPromise(spinnerID);
      // if(this.period) {
        //   this.period.addReport(this.report);
        // } else if(this.shift) {
          //   this.shift.addShiftReport(this.report);
          // }
          // this.viewCtrl.dismiss();
      this.save.emit(event);
      this.finished.emit(event);
      return res;
    } catch(err) {
      Log.l(`saveClicked(): Error saving report`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      // this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 5000);
      await this.alert.showErrorMessage("ERROR", "Error saving report", err);
    }
  }

  public async deleteReport(event:any) {
    let spinnerID;
    let report:Report = this.report;
    try {
      Log.l(`deleteReport(): Event is:`, event);
      // let report:Report = this.report;
      let title:string = "DELETE REPORT";
      let text:string = `Are you sure you want to delete this report? This will permanently delete this report and cannot be undone.`;
      if(this.data.isDeveloper) {
        text += "<br>\n<br>\n(However, just between a couple of developers, I'm saving the report to the onsitedeletedreports array, so you can recover it from the DevTools.)";
      }
      window['onsitedeletedreports'] = window['onsitedeletedreports'] || [];
      let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        let newReport:Report = report.clone();
        window['onsitedeletedreports'].push(report);
        let res:any = await this.db.deleteReport(report);
        Log.l("deleteReport(): Successfully deleted report.");
          // this.cancelClicked(event);
        this.cancel.emit(event);
        return res;
      }
    } catch(err) {
      Log.l(`deleteReport(): Error deleting report!`);
      Log.e(err);
      Log.l("deleteReport(): Error deleting report.");
      Log.e(err);
      this.notify.addError("ERROR", `Error deleting report ${report._id}: '${err.message}'`, 10000);
      // this.alert.showAlert("ERROR", `Error  report ${report._id}:<br>\n<br>\n` + err.message);
      // throw new Error(err);
    }
  }

  public updateDate(newDate:Date) {
    Log.l(`updateDate(): setting date to:`, newDate);
    let date = moment(newDate);
    let report = this.report;
    // report.report_date = date.format("YYYY-MM-DD");
    report.setReportDate(date);
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

  public getReportLocation():Jobsite {
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
    Log.l(`getReportLocation(): Report/tech located at site:`, site);
    return site;
  }

  public updateReportCLL(key:string, value:any) {
    let report = this.report;
    Log.l(`updateReportCLL(): Setting report key ${key} to:`, value);
    if(key === 'client') {
      report.client = value.fullName;
      let site = this.getReportLocation();
      this.site = site;
    } else if(key === 'location') {
      report.location = value.fullName;
      let site = this.getReportLocation();
      this.site = site;
    } else if(key === 'locID') {
      report.location_id = value.name;
      let site = this.getReportLocation();
      this.site = site;
    } else {
      Log.w(`updateReportCLL(): Unable to find key ${key} to set, in Report:`, report);
    }
  }
    
  public updateRepairHours() {
    let report = this.report;
    let hours:number = report.getRepairHours();
    Log.l(`updateRepairHours(): Setting repair hours to:`, hours);
    report.forceRepairHours(hours);
    // report.setRepairHours(Number(this.report.repair_hours));
    // this.time_start = moment(report.time_start);
    // this.time_end = moment(report.time_end);
    this.updateDisplay();
  }

  public timeChanged(type:number, event?:any) {
    Log.l(`timeChanged(): Called for type ${type}, value is:`, event);
    let date:Date;
    let time:Moment;
    let report:Report = this.report;
    if(type === 1) {
      date = this.time_start;
      time = moment(date);
      Log.l(`timeChanged(): Setting report start time to: `, time);
      // report.setStartTime(time);
      // report.forceStartTime(time);
    } else if(type === 2) {
      date = this.time_end;
      time = moment(date);
      Log.l(`timeChanged(): Setting report end time to: `, time);
      // report.setEndTime(time);
      // report.forceEndTime(time);
    }
    // if(!report.areTimesValid()) {
    //   this.reportTimeError = true;
    // } else {
    //   this.reportTimeError = false;
    // }
    // this.updateDisplay();
  }

  public updateTime(type:number, event?:Date) {
    Log.l(`updateTime(): Called for type ${type}, value is:`, event);
    let date:Date;
    let time:Moment;
    let report:Report = this.report;
    if(type === 1) {
      date = this.time_start;
      time = moment(date);
      Log.l(`updateTime(): Setting report start time to: `, time);
      // report.setStartTime(time);
      report.forceStartTime(time);
    } else if(type === 2) {
      date = this.time_end;
      time = moment(date);
      Log.l(`updateTime(): Setting report end time to: `, time);
      // report.setEndTime(time);
      report.forceEndTime(time);
    }
    // if(!report.areTimesValid()) {
    //   this.reportTimeError = true;
    // } else {
    //   this.reportTimeError = false;
    // }
    this.updateDisplay();
  }

  public selectTime(type:number, event?:Date) {
    Log.l(`selectTime(): Called for type ${type}, value is:`, event);
    let date:Date;
    let time:Moment;
    let report:Report = this.report;
    if(type === 1) {
      date = this.time_start;
      time = moment(date);
      Log.l(`selectTime(): Setting report start time to: `, time);
      report.forceStartTime(time);
    } else if(type === 2) {
      date = this.time_end;
      time = moment(date);
      Log.l(`selectTime(): Setting report end time to: `, time);
      report.forceEndTime(time);
    }
    // if(!report.areTimesValid()) {
    //   this.reportTimeError = true;
    // } else {
    //   this.reportTimeError = false;
    // }
    // this.updateDisplay();
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
    this.setHeader(this.idx);
    this.updateDisplay(this.report);
    // this.reportChange.emit(this.idx);
  }

  public next() {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.report = this.reports[this.idx];
    // this.reportChange.emit(this.idx);
    this.setHeader(this.idx);
    this.updateDisplay(this.report);
  }

  public splitReport(event?:any) {
    let report = this.report;
    Log.l(`splitReport(): Now attempting to split report:`, report);
    this.notify.addInfo("DISABLED", `This function is not yet enabled.`, 3000);
    let proceed:boolean = false;
    if(proceed) {
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
  }

  public toggleDetailedSiteView(evt?:Event) {
    this.detailedSite = !this.detailedSite;
    Log.l(`toggleDetailedSiteView(): Toggled to:`, this.detailedSite);
  }

  public updateReportSite(site:Jobsite, evt?:Event) {
    Log.l(`updateReportSite(): Updating site to:`, site);
    let rpt:Report = this.report;
    let siteCLI = site.getSiteKeyAsString('client').toUpperCase();
    let siteLOC = site.getSiteKeyAsString('location').toUpperCase();
    let siteLID = site.getSiteKeyAsString('locID').toUpperCase();
    let cli = this.clientList.find((a:SelectItem) => {
      let val:SESAClient = a.value;
      return val.name.toUpperCase() === siteCLI || val.fullName.toUpperCase() === siteCLI;
    }).value;
    let loc = this.locationList.find((a:SelectItem) => {
      let val:SESALocation = a.value;
      return val.name.toUpperCase() === siteLOC || val.fullName.toUpperCase() === siteLOC;
    }).value;
    let lid = this.locIDList.find((a:SelectItem) => {
      let val:SESALocID = a.value;
      return val.name.toUpperCase() === siteLID || val.fullName.toUpperCase() === siteLID;
    }).value;
    if(cli && loc && lid) {
      this.client = cli;
      this.location = loc;
      this.locID = lid;
      rpt.setSite(site);
      Log.l(`updateReportSite(): Updated CLI, LOC, LID to:`, cli, loc, lid);
    } else {
      Log.w(`updateReportSite(): Error updating CLI, LOC, LID to:`, cli, loc, lid);
      this.notify.addError("SITE ERROR", "Could not find details for this work site!", 6000);
    }
  }
}
