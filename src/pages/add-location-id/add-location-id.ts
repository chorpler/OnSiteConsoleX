import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Log } from 'domain/onsitexdomain';
// import { AuthService } from '../../providers/auth-service';
// import { ServerService } from '../../providers/server-service';
// import { DBService } from '../../providers/db-service';
// import { AlertService } from '../../providers/alert-service';
// import { Street } from 'domain/onsitexdomain';
// import { Address } from 'domain/onsitexdomain';
// import { Jobsite } from 'domain/onsitexdomain';


/**
 * Generated class for the AddLocationIdPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({name: "Add New Location ID"})
@Component({
  selector: 'page-add-location-id',
  templateUrl: 'add-location-id.html',
})
export class AddLocIDPage implements OnInit {
  public locIDData: any;
  public nav: any;
  public locIDForm: FormGroup;
  public locIDName: FormControl;
  public locIDAbbreviation: FormControl;
  public newLocID: any;
  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController) {
    Log.l("addLocIDModal(): Created");
    this.nav = navCtrl;
  }

  ngOnInit() {
    this.initializeAddLocIDForm();

  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad AddLocIDPage');
  }

  initializeAddLocIDForm() {
    this.locIDForm = new FormGroup({
      'locIDName': new FormControl('', Validators.required),
      'locIDAbbreviation': new FormControl('', Validators.required)
    });
  }

  saveLocID() {
    Log.l("saveLocID(): Now saving locID...");
    let tmpLocID = this.locIDForm.value;

    this.newLocID = { name: tmpLocID.locIDAbbreviation, fullName: tmpLocID.locIDName };
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.newLocID);
  }

  goBack() {
    this.navCtrl.setRoot('Add Work Site');  }


}
