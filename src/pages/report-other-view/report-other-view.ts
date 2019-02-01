import { Component, OnInit, NgZone,                                             } from '@angular/core'              ;
import { IonicPage, NavController, NavParams, ViewController                    } from 'ionic-angular'              ;
import { OptionsComponent                                                       } from 'components/options/options' ;
import { ServerService                                                          } from 'providers/server-service'   ;
import { DBService                                                              } from 'providers/db-service'       ;
import { AuthService                                                            } from 'providers/auth-service'     ;
import { AlertService                                                           } from 'providers/alert-service'    ;
import { OSData                                                                 } from 'providers/data-service'     ;
// import { PDFService                                                             } from 'providers/pdf-service'      ;
import { Jobsite, Employee, Schedule, Report, ReportOther, Shift, PayrollPeriod } from 'domain/onsitexdomain'       ;
import { Log, moment, Moment, isMoment, oo                                      } from 'domain/onsitexdomain'       ;

const _dedupe = (array, property?) => {
  let prop = "fullName";
  if (property) {
    prop = property;
  }
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

@IonicPage({name: "View Other Report"})
@Component({
  selector: 'page-report-other-view',
  templateUrl: 'report-other-view.html',
})
export class ReportOtherViewPage implements OnInit {
  public title         : string         = "View Other Report"           ;
  public dataReady     : boolean        = false                         ;
  public moment        = moment         ;
  public report        : ReportOther    = null                          ;
  public tech          : Employee       ;
  public report_date   : string         = moment().format("YYYY-MM-DD") ;
  public report_types  : Array<any>     = []                            ;
  public training_types: Array<any>     = []                            ;
  public report_type   : any            ;
  public training_type : any            ;
  public timestampDate : string         = ""                            ;
  public sites         : Array<Jobsite> = []                            ;
  public site          : Jobsite        ;
  public client        : any            ;
  public location      : any            ;
  public locID         : any            ;
  public clients       : Array<any>     = []                            ;
  public locations     : Array<any>     = []                            ;
  public locIDs        : Array<any>     = []                            ;
  public timestampXL   : number                                         ;
  public timestampM    : Moment                                         ;

  constructor(
    public navCtrl   : NavController  ,
    public navParams : NavParams      ,
    public viewCtrl  : ViewController ,
    public db        : DBService      ,
    public server    : ServerService  ,
    public alert     : AlertService   ,
    public data      : OSData         ,
    ) {
    window['consolereportotherview'] = this;
  }

  ngOnInit() {
    Log.l("ReportView: ngOnInit() called");
    this.sites = this.data.getData('sites');
    this.report_types = this.data.getConfigData('report_types');
    this.training_types = this.data.getConfigData('training_types');
    if(this.report_types[0].name === 'work_report') {
      this.report_types.shift();
    }
    if(this.navParams.get('other') !== undefined) {
      this.report = this.navParams.get('other');
      this.report_date = this.report.report_date.format("YYYY-MM-DD");
      let XL = Number(this.report.timestamp);
      this.timestampXL = XL;
      this.timestampM = moment().fromExcel(XL);
    } else {
      this.report = new ReportOther();
      let now = moment().startOf('day');
      this.timestampM = moment(now);
      this.report.timestampM = moment(this.timestampM);
      this.timestampXL = this.timestampM.toExcel();
      this.report.timestamp = this.timestampXL;

      this.report.report_date = now;
      this.report_date = now.format("YYYY-MM-DD");
    }
    if(this.navParams.get('tech') !== undefined) { this.tech = this.navParams.get('tech');}
    this.clients   = _dedupe(this.sites.map((a:Jobsite) => a['client']));
    this.locations = _dedupe(this.sites.map((a:Jobsite) => a['location']));
    this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a['locID']));
    this.timestampDate = moment(this.report.timestampM).format();
    this.report.time = 0;
    // let site = this.getReportLocation();
    // this.site = site;
    // let report = this.report;
    // if(!report.client || !report.location || !report.location_id) {
    //   this.setReportLocation(site);
    // }
    this.dataReady = true;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ReportViewPage');
  }

  public cancel() {
    this.viewCtrl.dismiss();
  }

  public save() {
    this.db.saveOtherReport(this.report).then(res => {
      Log.l("save(): Report successfully saved.");
      this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving report.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving report!");
    });
  }

  public deleteReport() {
    let report = this.report;
    this.db.deleteOtherReport(report).then(res => {
      Log.l("deleteReport(): Successfully deleted report.");
      this.cancel();
    }).catch(err => {
      Log.l("deleteReport(): Error deleting report.");
      Log.e(err);
      this.alert.showAlert("ERROR", `Error deleting report ${report._id}:<br>\n<br>\n` + err.message);
    });
  }

  public updateReportDate(reportDate:string) {
    let date = moment(reportDate, "YYYY-MM-DD");
    this.report.report_date = date;
    this.report.shift_serial = Shift.getShiftSerial(date);
    this.report.payroll_period = PayrollPeriod.getPayrollSerial(date);
    return this.report;
  }

  public modifyTimestamp(XL:number) {
    let report = this.report;
    let date = moment().fromExcel(XL);
    Log.l(`modifyTimestamp(): Using ${XL} as timestamp, setting report.timestampM to:\n`, date);
    this.report.timestampM = moment(date);
    this.report.timestamp = Number(XL);
    this.timestampDate = moment(date).format();
    // this.timestampM = moment(date);
  }

  public modifyTimestampM(ts:string) {
    let report = this.report;
    // let date = moment(ts, "YYYY-MM-DDTHH:mm:ssZ");
    let date = moment(ts);
    let xl = date.toExcel();
    Log.l(`modifyTimestampM(): Using ${ts} as timestamp, setting report.timestampM to:\n`, date);
    this.report.timestampM = moment(date);
    this.report.timestamp = xl;
    this.timestampM = moment(date);
  }

  public setReportType(report_type:any) {
    let report = this.report;
    if(report_type) {
      let stype = report_type.name;
      report.type = report_type.value;
      if(stype === 'training') {
        this.training_type = this.training_types[0];
        this.setTrainingType(this.training_type);
      } else if(stype === 'travel') {
        let tech = this.tech;
        let cli = this.data.getFullClient(tech.client).name;
        let loc = this.data.getFullLocation(tech.location).name;
        let lid = this.data.getFullLocID(tech.locID).name;
        let site = this.sites.find((a:Jobsite) => {
          return ((a.client.name === cli) && (a.location.name === loc) && (a.locID.name === lid));
        });
        this.site = site;
        this.setTravelLocation(site);
      } else if(stype === 'standby_hb_duncan') {
        report.time = 8;
      } else if(stype === 'standby') {
        report.time = 8;
      } else if(stype === 'sick') {
        report.time = 8;
      } else if(stype === 'vacation') {
        report.time = 8;
      } else if(stype === 'holiday') {
        report.time = 8;
      } else {
        let type = report_type && report_type.value ? report_type.value : report_type;
        Log.w(`setReportType(): Error during attempt to set report type:\n`, type);
        this.alert.showAlert("ERROR", "Error attempting to set report type to:<br>\n<br>\n" + type);
      }
    } else {
      report.type = "";
      report.time = 0;
    }
    return this.report;
  }

  public setTrainingType(training_type:any) {
    let report = this.report;
    report.training_type = training_type.value;
    let hours = Number(training_type.hours);
    report.time = hours;
    return report.training_type;
  }

  public setTravelLocation(site:Jobsite) {
    let report = this.report;
    report.travel_location = site.getSiteID();
    let time = Number(site.travel_time);
    report.time = time;
    return this.setReportLocation(site);
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
    this.updateReportCLL('client'  , cli);
    this.updateReportCLL('location', loc);
    this.updateReportCLL('locID'   , lid);
    this.client = this.clients.find((a:any) => {
      return a.name === cli.name;
    });
    this.location = this.locations.find(a => {
      return a.name === loc.name;
    });
    this.locID = this.locIDs.find(a => {
      return a.name === lid.name;
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
    let rpt = this.report;
    let cli  = this.data.getFullClient(rpt.client);
    let loc  = this.data.getFullLocation(rpt.location);
    let lid  = this.data.getFullLocID(rpt .location_id);
    let site = this.sites.find((a:Jobsite) => {
      let siteClient   = a.client.name;
      let siteLocation = a.location.name;
      let siteLocID    = a.locID.name;
      return siteClient === cli.name && siteLocation === loc.name && siteLocID === lid.name;
    });
    if(site) {
      return site;
    } else {
      return null;
    }
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

}
