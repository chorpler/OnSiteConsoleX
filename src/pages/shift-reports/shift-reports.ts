import { Component, OnInit, NgZone                                            } from '@angular/core'                  ;
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular'                  ;
import { Log, moment, Moment, isMoment, oo                                    } from 'domain/onsitexdomain'  ;
import { Report, ReportOther, Shift, PayrollPeriod, Jobsite, Employee         } from 'domain/onsitexdomain'    ;
import { DBService                                                            } from '../../providers/db-service'     ;
import { ServerService                                                        } from '../../providers/server-service' ;
import { AlertService                                                         } from '../../providers/alert-service'  ;
import { OSData                                                               } from '../../providers/data-service'   ;

@IonicPage({name: 'Shift Reports'})
@Component({
  selector: 'page-shift-reports',
  templateUrl: 'shift-reports.html',
})
export class ShiftReportsPage implements OnInit {
  public title      : string             = "Shift Reports" ;
  public mode       : number             = 0               ;
  public reports    : Array<Report>      = []              ;
  public period     : PayrollPeriod      ;
  public shift      : Shift              ;
  public others     : Array<ReportOther> = []              ;
  public reportAdded: boolean            = false           ;
  public tech       : Employee           ;
  public dataReady  : boolean            = false           ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl:ModalController, public viewCtrl:ViewController, public alert:AlertService, public db:DBService, public server:ServerService, public data:OSData) {
    window['onsiteshiftreports'] = this;
  }

  ngOnInit() {
    Log.l("ShiftReportsPage: ngOnInit() called");
    if(this.navParams.get('mode')    !== undefined) { this.mode    = this.navParams.get('mode');    }
    if(this.navParams.get('reports') !== undefined) { this.reports = this.navParams.get('reports'); }
    if(this.navParams.get('others')  !== undefined) { this.others  = this.navParams.get('others');  }
    if(this.navParams.get('tech')    !== undefined) { this.tech    = this.navParams.get('tech');    }
    if(this.navParams.get('shift')   !== undefined) { this.shift   = this.navParams.get('shift');   }
    if(this.navParams.get('period')  !== undefined) { this.period  = this.navParams.get('period'); this.title = 'Payroll Period Reports';  }
    if(this.period) {
      for(let shift of this.period.getPayrollShifts()) {
        for(let report of shift.getShiftReports()) {
          this.reports.push(report);
        }
      }
      this.reports.sort((a:Report,b:Report) => {
        return a.report_date < b.report_date ? 1 : a.report_date > b.report_date ? -1 : 0;
      });
    }
    this.dataReady = true;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ShiftReportsPage');
  }

  cancel() {
    Log.l("ShiftReports: user canceled.");
    this.viewCtrl.dismiss();
  }

  public openReport(report:Report) {
    let showReportPage = this.modalCtrl.create("View Work Report", { report: report, });
    showReportPage.onDidDismiss(data => {

    });
    showReportPage.present();
  }

  public addNewReport() {
    let now = moment();
    let report = new Report();
    let tech = this.tech;
    report.report_date = now.format("YYYY-MM-DD");
    report.first_name = tech.firstName;
    report.last_name = tech.lastName;
    report.username = tech.getUsername();
    report.timestamp = now.toExcel();
    report._id = report.genReportID(tech);
    report.shift_serial = Shift.getShiftSerial(now);
    report.payroll_period = PayrollPeriod.getPayrollSerial(now);
    report.client = this.data.getFullClient(this.tech.client).fullName;
    report.location = this.data.getFullLocation(this.tech.location).fullName;
    report.location_id = this.data.getFullLocID(this.tech.locID).name;
    report.technician = tech.getTechName();
    let shift  = this.shift;
    let period = this.period;
    report.time_start = shift.getNextReportStartTime();
    report.repair_hours = 0;
    report.time_end = moment(report.time_start).add(report.repair_hours, 'hours');

    let modal = this.modalCtrl.create("View Work Report", {mode: 'add', report: report, tech: tech, shift: shift, period: period}, {cssClass: 'view-work-report-modal'});
    modal.onDidDismiss(data => {
      Log.l("addNewReport(): modal dismissed.");
      if(data) {
        Log.l("addNewReport(): Returned data:\n", data);
        let report:Report = data.report;
        try {
          this.period.addReport(report);
        } catch (err) {
          this.alert.showAlert("ERROR", "Error saving report!<br>\n<br>\n" + err.message);
        }
      }
    });
    modal.present();
  }

}
