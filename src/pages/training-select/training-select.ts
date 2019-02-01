import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log                                 } from 'domain/onsitexdomain' ;

@IonicPage({name: "Select Training"})
@Component({
  selector: 'page-training-select',
  templateUrl: 'training-select.html',
})
export class TrainingSelectPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad TrainingSelectPage');
  }

}
