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
 * Generated class for the AddClientPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({name: "Add New Client"})
@Component({
  selector: 'page-add-client',
  templateUrl: 'add-client.html',
})
export class AddClientPage implements OnInit {
  public title:string = "Add New Client";
  public clientData: any;
  public nav: any;
  public clientForm: FormGroup;
  public clientName: FormControl;
  public clientAbbreviation: FormControl;
  public newClient: any;
  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController) {
    Log.l("addClientModal(): Created");
    this.nav = navCtrl;
  }

  ngOnInit() {
    this.initializeAddClientForm();
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad AddClientPage');
  }

  initializeAddClientForm() {
    this.clientForm = new FormGroup({
      'clientName': new FormControl('', Validators.required),
      'clientAbbreviation': new FormControl('', Validators.required)
    });
  }

  saveClient() {
    Log.l("saveClient(): Now saving client...");
    this.newClient = this.clientForm.value;
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.newClient);
  }

  goBack() {
    this.navCtrl.setRoot('Add Work Site');
  }

}
