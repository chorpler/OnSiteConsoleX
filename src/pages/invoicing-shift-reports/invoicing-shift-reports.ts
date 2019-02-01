import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log                                 } from 'domain/onsitexdomain' ;

@IonicPage({name: "Invoicing Shift Reports"})
@Component({
  selector: 'page-invoicing-shift-reports',
  templateUrl: 'invoicing-shift-reports.html',
})
export class InvoicingShiftReportsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    window['invoicingshiftreports'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad InvoicingShiftReportsPage');
  }

}
