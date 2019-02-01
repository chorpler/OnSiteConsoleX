import { Component                                           } from '@angular/core'                ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'                ;
import { Log, moment, Moment, isMoment                       } from 'domain/onsitexdomain';
import { AlertService                                        } from '../../providers/alert-service';
import { OSData                                              } from '../../providers/data-service' ;
import { Preferences                                         } from '../../providers/preferences'  ;

@IonicPage({name: 'Show Options'})
@Component({
  selector: 'page-show-options',
  templateUrl: 'show-options.html',
})
export class ShowOptionsPage {
  public static PREFS:any = new Preferences();
  public get prefs() { return ShowOptionsPage.PREFS;};
  public get showAllSites():boolean {return this.prefs.CONSOLE.scheduling.showAllSites;};
  public set showAllSites(value:boolean) {this.prefs.CONSOLE.scheduling.showAllSites = value;};
  public get showOffice():boolean {return this.prefs.CONSOLE.scheduling.showOffice;};
  public set showOffice(value:boolean) {this.prefs.CONSOLE.scheduling.showOffice = value;};
  public get persistTechChanges():boolean {return this.prefs.CONSOLE.scheduling.persistTechChanges;};
  public set persistTechChanges(value:boolean) {this.prefs.CONSOLE.scheduling.persistTechChanges = value;};
  public get enableAllDates(): boolean { return this.prefs.CONSOLE.scheduling.enableAllDates; };
  public set enableAllDates(value: boolean) { this.prefs.CONSOLE.scheduling.enableAllDates = value; };
  // public enableAllDates:boolean = this.data.status.enableAllDates;
  public indata: any = {};

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public data: OSData, public alert:AlertService) {
    window['consoleoptions'] = this;
    if (this.navParams.get('data') !== undefined) {
      this.indata = this.navParams.get('data');
    }
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad OptionsPage');
  }

  public updateSiteDisplay() {
    Log.l("updateSiteDisplay(): showAllSites is now: ", this.showAllSites);
    this.data.status.showAllSites = this.showAllSites;
  }

  public updateShowOffice() {
    Log.l("updateShowOffice(): showOffice is now '%s'.", this.showOffice);
    this.data.status.showOffice = this.showOffice;
  }

  public toggleAllDatesAvailable() {
    Log.l("toggleAllDatesAvailable(): enableAllDates is now '%s'.", this.enableAllDates);
  }

  public togglePersistTechChanges() {
    Log.l("togglePersistTechChanges(): persistTechChanges is now '%s'", this.persistTechChanges);
    this.data.status.persistTechChanges = this.persistTechChanges;
  }
  public close() {
    this.viewCtrl.dismiss();
  }

  public save() {
    this.data.savePreferences().then(res => {
      this.viewCtrl.dismiss();
    }).catch(err => {
      Log.l("save(): Error saving preferences.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving options:<br>\n<br>\n" + err.message);
    });
  }

  public cancel() {
    Log.l("Options: Modal canceled.");
    this.viewCtrl.dismiss();
  }

}
