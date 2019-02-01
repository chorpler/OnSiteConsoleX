import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log                                 } from 'domain/onsitexdomain' ;

@IonicPage({name: 'Invoicing'})
@Component({
  selector: 'page-invoicing',
  templateUrl: 'invoicing.html',
})
export class InvoicingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    window['onsiteinvoicing'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad InvoicingPage');
  }

}
