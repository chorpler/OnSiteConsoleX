import { Component, OnInit} from '@angular/core';
import { DBService } from "providers/db-service";
import { NotifyService } from 'providers/notify-service';

/**
 * Generated class for the WorkReportItemsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'work-report-items',
  templateUrl: 'work-report-items.html'
})
export class WorkReportItemsComponent implements OnInit{

  text: string;
  reportItems: Array<Object> =[];
  configDocID: string = "jobsite-optional-work-report-items";
  configDoc: any;
  newReportItem: Object = {
    key: "",
    value: "",
    enabled: true
  };
  validItem: boolean = false;
  newItemKey: string;
  newItemValue: string;

  constructor(
    public dbService : DBService     ,
    public notify    : NotifyService ,
  ) {
    window['workreportitems'] = this;
  }

  async ngOnInit() {
  try {
    let doc = await this.dbService.getConfigDoc(this.configDocID);
    let keys = doc.keys;
    this.reportItems = keys
    this.configDoc = doc;
   } catch(err) { };
  }

  updateItemKey(value: string) {
    this.newReportItem["key"] = value;
      if (this.newReportItem["key"] === "" || this.newReportItem["value"] === "") {
        this.validItem = false;
      }
        else {
          this.validItem = true;
        }
    }

  updateItemValue(value: string) {
    this.newReportItem["value"] = value;
    if (this.newReportItem["key"] === "" || this.newReportItem["value"] === "") {
      this.validItem = false;
    }
      else {
        this.validItem = true;
      }
  }



  addItem(key: string, value: string) {
    key = this.newReportItem["key"];
    value = this.newReportItem["value"];
    this.configDoc.keys.push(this.newReportItem);
    this.newReportItem = {
      key: "",
      value: "",
      enabled: true
    };
    console.log(this.configDoc._id);
  }

  async updateWorkSite() {
    try {
      let out:any = await this.dbService.saveConfigDoc(this.configDoc);
      this.notify.addSuccess("SUCCESS", `Saved new work report item successfully!`, 3000);
    } catch(err) {
      this.notify.addError("ERROR", `Error saving new work report item!`, 3000);
    };
  }

}
