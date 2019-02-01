import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Log } from 'domain/onsitexdomain';
// import { ServerService } from '../../providers/server-service';
// import { DBService } from '../../providers/db-service';
// import { AlertService } from '../../providers/alert-service';
// import { Street } from 'domain/onsitexdomain';
// import { Address } from 'domain/onsitexdomain';
// import { Jobsite } from 'domain/onsitexdomain';


/**
 * Generated class for the AddLocationId_2Page page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({name: "Add Location 2"})
@Component({
  selector: 'page-add-location-2',
  templateUrl: 'add-location-2.html',
})
export class AddLocation2Page implements OnInit {
  public loc2ndData: any;
  public nav: any;
  public loc2ndForm: FormGroup;
  public loc2ndName: FormControl;
  public loc2ndAbbreviation: FormControl;
  public newLoc2nd: any;
  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController) {
    Log.l("addLoc2ndModal(): Created");
    this.nav = navCtrl;
  }

  ngOnInit() {
    this.initializeAddLoc2ndForm();

  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad AddLoc2ndPage');
  }

  initializeAddLoc2ndForm() {
    this.loc2ndForm = new FormGroup({
      'loc2ndName': new FormControl('', Validators.required),
      'loc2ndAbbreviation': new FormControl('', Validators.required)
    });
  }

  saveLoc2nd() {
    Log.l("saveLoc2nd(): Now saving loc2nd...");
    let tmpLoc2nd = this.loc2ndForm.value;

    this.newLoc2nd = { name: tmpLoc2nd.loc2ndAbbreviation, fullName: tmpLoc2nd.loc2ndName };
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.newLoc2nd);
  }

  goBack() {
    this.navCtrl.setRoot('Add Work Site');
  }


}
