// import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'       ;
// import { DPS                                                                             } from 'domain/onsitexdomain'       ;
// import { PDFService                                                                      } from 'providers/pdf-service'      ;
// import { OptionsComponent                                                                } from 'components/options/options' ;
// import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'           ;
import { sprintf                                                               } from 'sprintf-js'               ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef           } from '@angular/core'            ;
import { IonicPage, NavController, NavParams, ModalController, ViewController  } from 'ionic-angular'            ;
import { ServerService                                                         } from 'providers/server-service' ;
import { DBService                                                             } from 'providers/db-service'     ;
import { AuthService                                                           } from 'providers/auth-service'   ;
import { AlertService                                                          } from 'providers/alert-service'  ;
import { Log, Moment, moment, dec, Decimal, oo,          _matchCLL, _matchSite } from 'domain/onsitexdomain'     ;
import { SESAClient, SESALocation, SESALocID,                                  } from 'domain/onsitexdomain'     ;
import { OSData                                                                } from 'providers/data-service'   ;
import { SelectItem, MenuItem,                                                 } from 'primeng/api'              ;
import { DataTable                                                             } from 'primeng/datatable'        ;
import { Table                                                                 } from 'primeng/table'            ;

@IonicPage({name: 'Config Values'})
@Component({
  selector: 'page-config-values',
  templateUrl: 'config-values.html',
})
export class ConfigValuesPage implements OnInit,OnDestroy {
  @ViewChild('dtrt') dtrt:DataTable;
  @ViewChild('dttt') dttt:DataTable;
  @ViewChild('dtlocids') dtlocids:DataTable;
  @ViewChild('dtclients') dtclients:DataTable;
  @ViewChild('dtlocations') dtlocations:DataTable;

  public title:string = "Configuration";
  public config:any;
  public training_types:any[] = [];
  public report_types:any[] = [];
  public locIDs:SESALocID[] = [];
  public clients:SESAClient[] = [];
  public locations:SESALocation[] = [];
  public mwords:string[] = [];
  public enouns:string[] = [];
  public mnouns:string[] = [];
  public rt_fields   :any[] = [];
  public tt_fields   :any[] = [];
  public locID_fields:any[] = [];
  public client_fields:any[] = [];
  public location_fields:any[] = [];
  public word_fields:any[] = [];
  public numberColumnStyle:any = {'max-width': '50px', 'width': '40px', 'text-align': 'right'};
  public buttonColumnStyle:any = {'max-width': '50px', 'width': '40px', 'text-align': 'center'};
  public globalSearchReportType   : string = "";
  public globalSearchTrainingType : string = "";
  public globalSearchLocID        : string = "";
  public globalSearchClient       : string = "";
  public globalSearchLocation     : string = "";
  public selectedValue            :any;
  public modalMode: boolean = false;
  public dataReady:boolean = false;

  constructor(
    public viewCtrl  : ViewController  ,
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public server    : ServerService   ,
    public db        : DBService       ,
    public alert     : AlertService    ,
    public data      : OSData          ,
    public auth      : AuthService     ,
    public modalCtrl : ModalController ,
    public zone      : NgZone          ,
  ) {
    window['onsiteconfigvalues']  = this;
    window['onsiteconfigvalues2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l(`ConfigValuesPage: ngOnInit() fired`);
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l(`ConfigValuesPage: ngOnDestroy() fired`);
  }

  public async runWhenReady() {
    try {
      if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
      let training_types:any[] = this.data.getData('training_types');
      let report_types:any[] = this.data.getData('report_types');
      let locIDs:SESALocID[] = this.data.getConfigData('locIDs');
      let clients:SESAClient[] = this.data.getConfigData('clients');
      let locations:SESALocation[] = this.data.getConfigData('locations');
      // let mverbs = this.data.getConfigData('')
      if(training_types && training_types.length > 0) {
        this.training_types = training_types;
        this.report_types = report_types;
        this.locIDs = locIDs;
        this.clients = clients;
        this.locations = locations;
        this.setupFields();
        this.dataReady = true;
        this.setPageLoaded();
      } else {
        let res:any = await this.db.getAllConfigData();
        this.config = res;
        this.report_types = res.report_types;
        this.training_types = res.training_types;
        this.locIDs = res.locids;
        this.clients = res.clients;
        this.locations = res.locations;
        this.setupFields();
        this.dataReady = true;
        this.setPageLoaded();
      }
    } catch(err) {
      Log.l(`ConfigValuesPage.runWhenReady(): Error initializing page`);
      Log.e(err);
      this.setPageLoaded();
      this.alert.showAlert("ERROR", "Error retrieving config data:<br>\n<br>\n" + err.message);
  // throw err;
    }
  }

  public setupFields() {
    let rt = [
      {field: "name", header: "Value"},
      {field: "value", header: "Display Name"},
    ];
    let tt = [
      {field: "name", header: "Value"},
      {field: "value", header: "Display Name"},
      {field: "hours", header: "Default Hours"},
    ];
    let lid = [
      // {field: "name", header: "Code" },
      {field: "code", header: "Code" },
      {field: "fullName", header: "Value" },
      {field: "techClass", header: "Tech Class" },
      {field: "id", header: "ID" },
    ];
    let cli = [
      {field: "code", header: "Code" },
      {field: "fullName", header: "Value" },
      {field: "id", header: "ID" },
    ];
    let loc = [
      {field: "code", header: "Code" },
      {field: "fullName", header: "Value" },
      {field: "id", header: "ID" },
    ];
    this.rt_fields = rt;
    this.tt_fields = tt;
    // this.locID_fields = lid;
    // this.client_fields = cli;
    // this.location_fields = loc;
    let clikeys = Object.keys(this.clients[0]).filter((a:string) => {
      return a !== 'techClass';
    });
    let lockeys = Object.keys(this.locations[0]).filter((a:string) => {
      return a !== 'techClass';
    });
    let lidkeys = Object.keys(this.locIDs[0]).filter((a:string) => {
      // return a !== 'techClass';
      return true;
    });
    this.client_fields = clikeys.map((a:string) => {
      let out:{field:string, header:string} = {
        field  : a ,
        header : this.capitalize(a),
      };
      if(a == 'name') {
        out.field = 'code';
      }
      if(a === 'fullName') {
        out.field = 'value';
      }
      return out;
    });
    this.location_fields = lockeys.map((a:string) => {
      let out:{field:string, header:string} = {
        field  : a ,
        header : this.capitalize(a),
      };
      if(a == 'name') {
        out.field = 'code';
      }
      if(a === 'fullName') {
        out.field = 'value';
      }
      return out;
    });
    this.locID_fields = lidkeys.map((a:string) => {
      let out:{field:string, header:string} = {
        field  : a ,
        header : this.capitalize(a),
      };
      if(a == 'name') {
        out.field = 'code';
      }
      if(a === 'fullName') {
        out.field = 'value';
      }
      return out;
    });
  }

  public capitalize(value:string):string {
    if(typeof value === 'string') {
      let out:string = "";
      let firstLetter:string = value[0].toUpperCase();
      let restOfString:string = value.slice(1);
      out = firstLetter + restOfString;
      return out;
    } else {
      Log.w(`capitalize(): input value is not string:\n`, value);
      return "";
    }
  }

  public addConfig(type:string, event?:any) {
    if(type === 'report_type') {
      let report_type = {name: "", fullName: ""};
      this.report_types.push(report_type);
      this.report_types = this.report_types.slice(0);
    } else if(type === 'training') {
      let training = {name: "", fullName: ""};
      this.training_types.push(training);
      this.training_types = this.training_types.slice(0);
    } else if(type === 'locID') {
      let locID = new SESALocID();
      this.locIDs.push(locID);
      this.locIDs = this.locIDs.slice(0);
    } else if(type === 'client') {
      let client:SESAClient = new SESAClient();
      this.clients.push(client);
      this.clients = this.clients.slice(0);
    } else if(type === 'location') {
      let location = new SESALocation();
      this.locations.push(location);
      this.locations = this.locations.slice(0);
    }
  }

  public async saveConfig(type:string, event?:any) {
    try {
      if(type === 'report_type') {
        // let report_type = {name: "", fullName: ""};
        // this.report_types.push(report_type);
        // this.report_types = this.report_types.slice(0);
      } else if(type === 'training') {
        // let training = {name: "", fullName: ""};
        // this.training_types.push(training);
        // this.training_types = this.training_types.slice(0);
      } else if(type === 'locID') {

        // let locID = new SESALocID();
        // this.locIDs.push(locID);
        // this.locIDs = this.locIDs.slice(0);
      } else if(type === 'client') {
        // let client:SESAClient = new SESAClient();
        // this.clients.push(client);
        // this.clients = this.clients.slice(0);
      } else if(type === 'location') {
        // let location = new SESALocation();
        // this.locations.push(location);
        // this.locations = this.locations.slice(0);
      }
      // return res;
    } catch(err) {
      Log.l(`saveConfig(): Error saving config type '${type}'`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public async rowSelected(evt:any, datatable:DataTable) {
    try {
      let event:MouseEvent = evt.originalEvent;
      let data  = evt.data;
      // let index = evt.index;
      let dt:DataTable = datatable;
      Log.l(`rowSelected(): event is:\n`, evt);
      if(event.shiftKey) {
        Log.l(`rowSelect(): Row should delete.`);
        let confirm:boolean = await this.alert.showConfirmYesNo("DELETE ROW", `Delete this row?`);
        if(confirm) {
          let tabledata = datatable.value;
          let index = tabledata.indexOf(data);
          if(index > -1) {
            tabledata.splice(index, 1);
          }
        }
      }
      // return res;
    } catch(err) {
      Log.l(`rowSelected(): Error `);
      Log.e(err);
      throw new Error(err);
    }
  }

  public async deleteRow(table:any[], idx:number, evt?:Event) {
    try {
      // let event:MouseEvent = evt.originalEvent;
      // let data  = evt.data;
      // let index = evt.index;
      // let dt:DataTable = datatable;
      Log.l(`deleteRow(): event is:`, evt);
      let item = table.splice(idx, 1);
      window['onsiteconfigdeletedrow'] = item;
      // return res;
    } catch(err) {
      Log.l(`deleteRow(): Error `);
      Log.e(err);
      throw err;
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

}
