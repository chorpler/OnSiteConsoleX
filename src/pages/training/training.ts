import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log                                 } from 'domain/onsitexdomain' ;

@IonicPage({name: "Training"})
@Component({
  selector: 'page-training',
  templateUrl: 'training.html',
})
export class TrainingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad TrainingPage');
  }

}
