import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log, Moment, moment                 } from 'domain/onsitexdomain' ;
import { OSData                              } from '../../providers/data-service'  ;

@IonicPage({name: 'Payroll Work Reports'})
@Component({
  selector: 'page-reports-payroll',
  templateUrl: 'reports-payroll.html',
})
export class ReportsPayrollPage {
  public data     : any     ;
  public csv      : any     ;
  public dataReady: boolean = false ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public osdata:OSData) {
    window['reportspayroll'] = this;
    if (this.navParams.get('data') !== undefined) {
      this.data = this.navParams.get('data');
    }
    if (this.navParams.get('csv') !== undefined) {
      this.csv = this.navParams.get('csv');
    }
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    Log.l('ionViewDidLoad ReportsPayrollPage');
    let keys = [];
    if (this.data !== undefined && this.data !== null) {
      keys = Object.keys(this.data);
    }
    if (this.data && keys.length > 0) {
      this.dataReady = true;
    } else {
      if (this.navParams.get('data') !== undefined) {
        this.data = this.navParams.get('data');
        this.dataReady = true;
      }
    }
    if (this.dataReady) {
      Log.l("Get ready for CSV data:");
      Log.l(this.csv);
      window['mikepayrollcsv'] = this.csv;
    }
  }

}
