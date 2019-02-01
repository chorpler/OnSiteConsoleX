import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log                                 } from 'domain/onsitexdomain' ;

@IonicPage({name: "Tech Locations"})
@Component({
  selector: 'page-tech-locations',
  templateUrl: 'tech-locations.html',
})
export class TechLocationsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad TechLocationsPage');
  }

}
