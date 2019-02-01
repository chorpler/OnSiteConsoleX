import { Component, OnInit, NgZone                                            } from '@angular/core'                  ;
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular'                  ;
import { Log, moment, Moment, isMoment                                        } from 'domain/onsitexdomain'  ;
import { Report, ReportOther, Shift, PayrollPeriod, Jobsite, Employee         } from 'domain/onsitexdomain'    ;
import { ServerService                                                        } from '../../providers/server-service' ;
import { AlertService                                                         } from '../../providers/alert-service'  ;
import { OSData                                                               } from '../../providers/data-service'   ;


@IonicPage({name: 'Period Reports'})
@Component({
  selector: 'page-period-reports',
  templateUrl: 'period-reports.html',
})
export class PeriodReportsPage {
  public title    : string             = "Period Other Reports" ;
  public reports  : Array<Report>      = []              ;
  public shift    : Shift              ;
  public shifts   : Array<Shift>       ;
  public period   : PayrollPeriod      ;
  public others   : Array<ReportOther> = []              ;
  public tech     : Employee           ;
  public reportAdded:ReportOther;
  public dataReady: boolean            = false           ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl:ModalController, public viewCtrl: ViewController, public alert:AlertService, public server: ServerService, public data: OSData) {
    window['onsiteperiodreports'] = this;
  }

  ngOnInit() {
    Log.l("PeriodReportsPage: ngOnInit() called");
    if (this.navParams.get('reports') !== undefined) { this.reports = this.navParams.get('reports'); }
    if (this.navParams.get('others')  !== undefined) { this.others = this.navParams.get('others');   }
    if (this.navParams.get('tech')    !== undefined) { this.tech = this.navParams.get('tech');       }
    if (this.navParams.get('period')  !== undefined) { this.period = this.navParams.get('period');   }
    this.dataReady = true;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad PeriodReportsPage');
  }

  cancel() {
    Log.l("PeriodReports: user canceled.");
    if(this.reportAdded) {
      this.viewCtrl.dismiss({reportAdded: this.reportAdded});
    } else {
      this.viewCtrl.dismiss();
    }
  }

  public openReport(other: ReportOther) {
    let tech = this.tech;
    let showReportPage = this.modalCtrl.create("View Other Report", { other: other, tech: tech,  });
    showReportPage.onDidDismiss(data => {

    });
    showReportPage.present();
  }

  public newReportOther() {
    let now = moment();
    let other = new ReportOther();
    let tech = this.tech;
    other.report_date = moment().startOf('day');
    other.first_name = tech.firstName;
    other.last_name = tech.lastName;
    other.username = tech.getUsername();
    other._id = other.genReportID(tech);
    other.shift_serial = Shift.getShiftSerial(now);
    other.payroll_period = PayrollPeriod.getPayrollSerial(now);
    other.client = this.data.getFullClient(this.tech.client).fullName;
    other.location = this.data.getFullLocation(this.tech.location).fullName;
    other.location_id = this.data.getFullLocID(this.tech.locID).name;
    let modal = this.modalCtrl.create("View Other Report", {other: other, tech: tech});
    modal.onDidDismiss(data => {
      Log.l("newReportOther(): modal dismissed.");
      if(data) {
        Log.l("newReportOther(): Returned data:\n", data);
        let other:ReportOther = data.other;
        try {
          this.period.addReportOther(other);
          this.reportAdded = other;
        } catch(err) {
          this.alert.showAlert("ERROR", "Error saving report!<br>\n<br>\n" + err.message);
        }
      }
    });
    modal.present();
  }

}
