import { Component } from '@angular/core';
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
 * Generated class for the AddLocationPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({name: "Add New Location"})
@Component({
  selector: 'page-add-location',
  templateUrl: 'add-location.html',
})
export class AddLocationPage {
  public title:string = "Add Location";
  public locationData: any;
  public nav: any;
  public locationForm: FormGroup;
  public locationName: FormControl;
  public locationAbbreviation: FormControl;
  public newLocation: any;
  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController) {
    Log.l("addLocationModal(): Created");
    this.nav = navCtrl;
  }

  ngOnInit() {
    this.initializeAddLocationForm();
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad AddLocationPage');
  }

  initializeAddLocationForm() {
    this.locationForm = new FormGroup({
      'locationName': new FormControl('', Validators.required),
      'locationAbbreviation': new FormControl('', Validators.required)
    });
  }

  saveLocation() {
    Log.l("saveLocation(): Now saving location...");
    let tmpLocation = this.locationForm.value;

    this.newLocation = {name: tmpLocation.locationAbbreviation, fullName: tmpLocation.locationName};
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.newLocation);
  }

  goBack() {
    this.navCtrl.pop();
  }


}
