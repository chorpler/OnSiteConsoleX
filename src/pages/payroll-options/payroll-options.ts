import { Component                                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'                 ;
import { Log, moment, Moment, isMoment                       } from 'domain/onsitexdomain' ;
import { AlertService                                        } from '../../providers/alert-service' ;
import { OSData                                              } from '../../providers/data-service'  ;
import { Preferences                                         } from '../../providers/preferences'   ;

@IonicPage({ name: 'Payroll Options' })
@Component({
  selector: 'page-payroll-options',
  templateUrl: 'payroll-options.html',
})
export class PayrollOptionsPage {
  public title:string = "Payroll Options";
  public static PREFS:any = new Preferences();
  public get prefs() { return PayrollOptionsPage.PREFS;};
  public get showColors():boolean { return this.prefs.CONSOLE.payroll.showColors; };
  public get showShiftLength():boolean { return this.prefs.CONSOLE.payroll.showShiftLength; };
  public set showColors(value:boolean) { this.prefs.CONSOLE.payroll.showColors = value; };
  public set showShiftLength(value:boolean) { this.prefs.CONSOLE.payroll.showShiftLength = value; };
  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public data: OSData, public alert: AlertService) {
    window['onsitepayrolloptions'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad PayrollOptionsPage');
  }

  public close() {
    this.viewCtrl.dismiss();
  }

  public toggleShowColors() {
    Log.l("toggleShowColors(): showColors is now: '%s'", this.showColors);
  }

  public toggleShowShiftLength() {
    Log.l("toggleShowShiftLength(): showColors is now: '%s'", this.showShiftLength);
  }

  public save() {
    this.data.savePreferences().then(res => {
      this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving preferences.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving payroll options:<br>\n<br>\n" + err.message);
    });
  }

  public cancel() {
    Log.l("Payroll Options: Modal canceled.");
    this.viewCtrl.dismiss();
  }


}
