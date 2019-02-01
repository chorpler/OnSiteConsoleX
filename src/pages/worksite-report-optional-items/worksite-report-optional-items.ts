import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WorkReportItemsComponent } from "components/work-report-items";
import { NotifyService } from 'providers/notify-service';

@IonicPage({
  name: "Work Report Optional Items"
})
@Component({
  selector: 'page-worksite-report-optional-items',
  templateUrl: 'worksite-report-optional-items.html',
})
export class WorksiteReportOptionalItemsPage {

  constructor(
    public navCtrl   : NavController ,
    public navParams : NavParams     ,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WorksiteReportOptionalItemsPage');
  }

}
