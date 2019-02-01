import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormArray, FormControl } from "@angular/forms";
import { Log } from 'domain/onsitexdomain';
// import { AuthService } from '../../providers/auth-service';
import { ServerService } from '../../providers/server-service';
// import { DBService } from '../../providers/db-service';
import { AlertService } from '../../providers/alert-service';

/**
 * Generated class for the DrugTestPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({name: "Drug Test"})
@Component({
  selector: 'page-drug-test',
  templateUrl: 'drug-test.html',
})
export class DrugTestPage implements OnInit {
  public title:string = "Drug Test";
  public testQuestions:any;
  public mjNames:any;
  public testForm:FormGroup;
  public testArray:FormArray;
  public questions:any;
  public dataready:boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public alert:AlertService, public server:ServerService) {
    window['drugtest'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad DrugTestPage');
  }

  ngOnInit() {
    this.server.getDrugTest().then((res:any) => {
      Log.l(`DrugTest: Success getting drug test data! Result:\n`, res);
      this.testQuestions = res.questions;
      this.mjNames       = res.MJNAMES;
      this.initializeForm();
      Log.l("DrugTest: Form is now:\n",this.testForm);
      this.dataready=true;
    }).catch((err) => {
      Log.l(`DrugTest: Error getting drug test data!`);
      Log.e(err);
    });
  }

  initializeForm() {
    this.testForm = new FormGroup({});
    this.testArray = new FormArray([]);
    for(let QandA of this.testQuestions) {
      // let oneLine = new FormArray([]);
      let oneLine = new FormGroup({});
      let question = QandA.q;
      // let answerList = QandA.a;
      let qForm = new FormControl(question);
      let aForm = new FormControl('');
      oneLine.addControl('question', qForm);
      oneLine.addControl('answers', aForm);
      this.testArray.push(oneLine);
    }
    this.testForm.addControl('test', this.testArray);
  }

  onSubmit() {
    this.alert.showAlert("SCORE", "Beats the fuck out of me.");
  }
}
