import { Subscription                                              } from 'rxjs'                        ;
import { Component, OnInit, OnDestroy, NgZone,                     } from '@angular/core'                            ;
import { IonicPage, NavController, NavParams, ViewController       } from 'ionic-angular'                            ;
import { OptionsComponent                                          } from 'components/options/options'               ;
import { ServerService                                             } from 'providers/server-service'                 ;
import { DBService                                                 } from 'providers/db-service'                     ;
import { AuthService                                               } from 'providers/auth-service'                   ;
import { AlertService                                              } from 'providers/alert-service'                  ;
import { OSData                                                    } from 'providers/data-service'                   ;
// import { PDFService                                                } from 'providers/pdf-service'                    ;
import { Jobsite, Employee, Schedule, Report, Shift, PayrollPeriod } from 'domain/onsitexdomain'                    ;
import { Log, moment, Moment, isMoment, oo                         } from 'domain/onsitexdomain'                  ;
import { Message                                                   } from 'primeng/primeng'                          ;
import { MessageService                                            } from 'primeng/components/common/messageservice' ;
import { Command, KeyCommandService                                } from 'providers/key-command-service'            ;

const _dedupe = (array, property?) => {
  let prop = "fullName";
  if (property) {
    prop = property;
  }
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

@IonicPage({name: "View Work Report"})
@Component({
  selector: 'page-report-view',
  templateUrl: 'report-view.html',
})
export class ReportViewPage implements OnInit,OnDestroy {
  public title      : string         = "View Work Report" ;
  public mode       : string         = "edit"             ;
  public keySubscription: Subscription                    ;

  public moment                      = moment             ;
  public report     : Report         = null               ;
  public reports    : Array<Report>  = []                 ;
  public idx        : number         = 0                  ;
  public count      : number         = 0                  ;
  public report_date: string         = ""                 ;
  public shift      : Shift          ;
  public period     : PayrollPeriod  ;
  public tech       : Employee       ;
  public site       : Jobsite        ;
  public sites      : Array<Jobsite> = []                 ;
  public client     : any            ;
  public location   : any            ;
  public locID      : any            ;

  public clients    : Array<any>     = []                 ;
  public locations  : Array<any>     = []                 ;
  public locIDs     : Array<any>     = []                 ;
  public repair_hours:number = 0;
  public time_start  :string = "";
  public time_end    :string = "";
  public dataReady  : boolean        = false              ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl:ViewController, public db:DBService, public server:ServerService, public alert:AlertService, public data:OSData, public keyService:KeyCommandService) {
    window['consolereportview'] = this;
  }

  ngOnInit() {
    Log.l("ReportView: ngOnInit() called");
    // this.hotkeys.add(new Hotkey(['pageup', 'shift+pageup'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("AddWorkSite: got hotkey:\n", event, combo);
    //   this.previous();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['pagedown', 'shift+pagedown'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("ReportView: got hotkey:\n", event, combo);
    //   this.next();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['ctrl+up', 'command+up'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("ReportView: got hotkey:\n", event, combo);
    //   this.previous();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['ctrl+down', 'command+down'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("ReportView: got hotkey:\n", event, combo);
    //   this.next();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['ctrl+s', 'command+s', 'alt+s', 'meta+s'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("AddWorkSite: got hotkey:\n", event, combo);
    //   this.saveNoExit();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    if(this.data.isAppReady()) {
      this.runWhenReady();
    }

  }

  ngOnDestroy() {
    Log.l("ReportViewPage: ngOnDestroy() fired.");
    this.cancelSubscriptions();
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    if(this.navParams.get('mode') !== undefined)   { this.mode   = this.navParams.get('mode'); }
    if(this.navParams.get('tech') !== undefined)   { this.tech   = this.navParams.get('tech'); }
    if(this.navParams.get('shift') !== undefined)  { this.shift  = this.navParams.get('shift'); }
    if(this.navParams.get('period') !== undefined) { this.period = this.navParams.get('period'); }
    if(this.navParams.get('reports') !== undefined) { this.reports = this.navParams.get('reports'); }
    if(this.navParams.get('report') !== undefined) {
      this.report = this.navParams.get('report');
      this.idx = this.reports.indexOf(this.report);
      this.count = this.reports.length;
    } else {
      this.report = new Report();
      this.idx = 0;
      this.count = 0;
    }
    this.sites = this.data.getData('sites');
    this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    this.locations = _dedupe(this.sites.map((a:Jobsite) => a.location));
    this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a.locID));
    let reportDate;
    let rpt = this.report;
    if(this.mode === 'add') {
      // reportDate = moment();
      let shiftDate = moment(this.shift.getShiftDate());
      reportDate = moment(shiftDate);
      this.report.report_date = reportDate.format("YYYY-MM-DD");
      let start = this.shift.getNextReportStartTime();
      this.report.setStartTime(moment(start));
      let hours = this.report.getRepairHours();
      this.time_start = moment(start).format();
      this.time_end   = moment(start).add(hours, 'hours').format();
      this.updateDate(reportDate.format());
    } else {
      reportDate = moment(this.report.report_date, "YYYY-MM-DD");
      let hours = this.report.getRepairHours();
      this.repair_hours = this.data.convertTimeStringToHours(hours);
      this.time_start = moment(this.report.time_start).format();
      this.time_end   = moment(this.report.time_end).format();
      let name = this.report.username;
      let tech = this.data.getEmployeeFromUsername(name);
      this.tech = tech;
      let client = this.data.getFullClient(rpt.client);
      let location = this.data.getFullLocation(rpt.location);
      let locID = this.data.getFullLocID(rpt.location_id);
      this.client = this.clients.find(a => {
        return a.name === client.name;
      });
      this.location = this.locations.find(a => {
        return a.name === location.name;
      });
      this.locID = this.locIDs.find(a => {
        return a.name === locID.name;
      });
    }
    this.report_date = reportDate.format("YYYY-MM-DD");
    let site = this.getReportLocation();
    this.site = site;
    let report = this.report;
    if(this.mode === 'add') {
      this.setReportLocation(site);
    }
    this.dataReady = true;
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "ReportViewPage.previous" : this.previous(); break;
        case "ReportViewPage.next"     : this.next(); break;
        case "ReportViewPage.previous" : this.previous(); break;
        case "ReportViewPage.next"     : this.next(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }


  public cancel() {
    this.viewCtrl.dismiss();
  }

  public saveNoExit() {
    this.db.saveReport(this.report).then(res => {
      Log.l("save(): Report successfully saved.");
      if(this.period) {
        this.period.addReport(this.report);
      } else if(this.shift) {
        this.shift.addShiftReport(this.report);
      }
      this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving report.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving report:<br>\n<br>\n" + err.message);
    });

  }

  public save() {
    this.db.saveReport(this.report).then(res => {
      Log.l("save(): Report successfully saved.");
      if(this.period) {
        this.period.addReport(this.report);
      } else if(this.shift) {
        this.shift.addShiftReport(this.report);
      }
      this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving report.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving report:<br>\n<br>\n" + err.message);
    });
  }

  public deleteReport() {
    let report = this.report;
    this.db.deleteReport(report).then(res => {
      Log.l("deleteReport(): Successfully deleted report.");
      this.cancel();
    }).catch(err => {
      Log.l("deleteReport(): Error deleting report.");
      Log.e(err);
      this.alert.showAlert("ERROR", `Error deleting report ${report._id}:<br>\n<br>\n` + err.message);
    });
  }

  public updateDate(newDate:string) {
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
    let tech = this.tech;
    let cli  = this.data.getFullClient(tech.client);
    let loc  = this.data.getFullLocation(tech.location);
    let lid  = this.data.getFullLocID(tech.locID);
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
    }
  }

  public updateRepairHours() {
    let report = this.report;
    report.setRepairHours(Number(this.repair_hours));
    this.time_start = moment(report.time_start).format();
    this.time_end = moment(report.time_end).format();
  }

  public updateTimeStart() {
    let report = this.report;
    let start = moment(this.time_start);
    report.setStartTime(start);
    this.time_start = moment(report.time_start).format();
    this.time_end = moment(report.time_end).format();
  }

  public updateTimeEnd() {
    let report = this.report;
    let end = moment(this.time_end);
    report.setEndTime(end);
    this.time_start = moment(report.time_start).format()
    this.time_end = moment(report.time_end).format()
  }

  public previous() {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.report = this.reports[this.idx];
  }

  public next() {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.report = this.reports[this.idx];
  }

}
