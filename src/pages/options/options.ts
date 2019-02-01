import { Component                                           } from '@angular/core'                ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'                ;
import { Log, moment, Moment, isMoment                       } from 'domain/onsitexdomain';
import { OSData                                              } from '../../providers/data-service' ;
@IonicPage({name: 'Options'})
@Component({
  selector: 'page-options',
  templateUrl: 'options.html',
})
export class OptionsPage {
  public showAllSites:boolean = this.data.status.showAllSites;
  public get enableAllDates():boolean { return this.data.status.enableAllDates;};
  public set enableAllDates(value:boolean) { this.data.status.enableAllDates = value;};
  // public enableAllDates:boolean = this.data.status.enableAllDates;
  public indata        :any     = {}   ;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public data:OSData) {
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

  public toggleAllDatesAvailable() {
    Log.l("toggleAllDatesAvailable(): enableAllDates is now '%s'.", this.enableAllDates);
  }
  public close() {
    this.viewCtrl.dismiss();
  }

  public save() {
    this.viewCtrl.dismiss({data: this.showAllSites});
  }

  public cancel() {
    Log.l("Options: Modal canceled.");
    this.viewCtrl.dismiss();
  }

}
