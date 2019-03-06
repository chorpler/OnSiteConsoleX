import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams      } from 'ionic-angular'                 ;
import { Log                                      } from 'domain/onsitexdomain' ;
import { OSData                                   } from '../../providers/data-service'  ;
import { Report                                   } from 'domain/onsitexdomain'   ;

@IonicPage({name: "Reports Beta"})
@Component({
  selector: 'page-reports-beta',
  templateUrl: 'reports-beta.html',
})
export class ReportsBetaPage {
  @ViewChild('gridContainer') gridContainer:ElementRef;
  title: string = 'Reports Beta (Fin Hypergrid)';
  public gdata:any;
  public gridoptions:any;
  public reports:Array<Report> = [];
  public dataReady:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public data:OSData) {
    window['consoletesting'] = this;
  }

  ngOnInit() {
    Log.l("ReportsBetaPage: ngOnInit() fired.");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  // ionViewDidLoad() {
  //   Log.l("FlexBoxesPage: ionViewDidLoad() fired.");
  //   this.data.appReady().then(res => {
  //     this.runWhenReady();
  //   });
  // }

  public runWhenReady() {
    Log.l("ReportsBetaPage: now instantiating hypergrid...");
    // let gridEl = this.gridContainer.nativeElement;
    this.reports = this.data.getData('reports');
    this.gdata = this.convertReportsToDataGrid(this.reports);
    this.dataReady = true;
    // let data = [
    //   { name: 'Company 1', price: 300 },
    //   { name: 'Company 2', price: 200 },
    //   { name: 'Company 3', price: 150 },
    //   { name: 'Company 4', price: 500 },
    //   { name: 'Company 5', price: 999 },
    // ];
    // let data = this.reports;
    // let options = {container: '#gridcontainer', data: data};
    // this.gridoptions = options;
    // let hGrid:Hypergrid = new Hypergrid(this.gridoptions);
    // this.hgrid = hGrid;
  }

  public convertReportsToDataGrid(rpts?:Array<Report>) {
    let reports = rpts || this.reports || [];
    let grid = [];
    let keys = []
    for(let report of reports) {
      let reportDoc = {
        "ID"          : report._id                        || "" ,
        "Date"        : report.report_date                || "" ,
        "Timestamp"   : report.timestamp                  || "" ,
        "User"        : report.username                   || "" ,
        "Last Name"   : report.last_name                  || "" ,
        "First Name"  : report.first_name                 || "" ,
        "Start"       : report.time_start.format("HH:mm") || "" ,
        "End"         : report.time_end.format("HH:mm")   || "" ,
        "Hours"       : report.repair_hours               || "" ,
        "Client"      : report.client                     || "" ,
        "Location"    : report.location                   || "" ,
        "LocID"       : report.location_id                || "" ,
        "Unit #"      : report.unit_number                || "" ,
        "Work Order #": report.work_order_number          || "" ,
        "Notes"       : report.notes                      || "" ,
      };
      grid.push(reportDoc);
    }
    return grid;
  }

}
