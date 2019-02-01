// import { PDFService                                                                              } from 'providers/pdf-service'      ;
import { Subscription                                                                            } from 'rxjs'          ;
import { sprintf                                                                                 } from 'sprintf-js'                 ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef                             } from '@angular/core'              ;
import { IonicPage, NavController, NavParams, ModalController, PopoverController, ViewController } from 'ionic-angular'              ;
import { ServerService                                                                           } from 'providers/server-service'   ;
import { DBService                                                                               } from 'providers/db-service'       ;
import { AuthService                                                                             } from 'providers/auth-service'     ;
import { AlertService                                                                            } from 'providers/alert-service'    ;
import { Preferences                                                                             } from 'providers/preferences'      ;
import { OSData                                                                                  } from 'providers/data-service'     ;
import { Log, Moment, moment, isMoment, oo                                                       } from 'domain/onsitexdomain'       ;
import { Jobsite, Employee, Schedule,                                                            } from 'domain/onsitexdomain'       ;
import { SelectItem,                                                                             } from 'primeng/api'                ;
import { Table,                                                                                  } from 'primeng/table'              ;
import { NotifyService                                                                           } from 'providers/notify-service'   ;
import { DispatchService                                                                         } from 'providers/dispatch-service' ;
import { OptionsGenericComponent                                                                 } from 'components/options-generic' ;

@IonicPage({name: "Tech Phones"})
@Component({
  selector: 'page-tech-phones',
  templateUrl: 'tech-phones.html',
})
export class TechPhonesPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:Table;
  public title          : string       = "Tech Phones" ;
  public dsSubscription : Subscription                 ;
  public techPhoneLogins: any[]        = []            ;
  public allFields      : any[]        = []            ;
  public cols           : any[]        = []            ;
  public rowCount       : number       = 100           ;
  public colOpts        : SelectItem[] = []            ;
  public selectedColumns: any   []     = []            ;
  public autoTableLayout: boolean      = false         ;
  public optionsVisible : boolean      = false         ;
  public optionsType    : string       = 'techphones'  ;
  public modalMode      : boolean      = false         ;
  public dataReady      : boolean      = false         ;

  constructor(
    public viewCtrl  : ViewController  ,
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public prefs     : Preferences     ,
    public db        : DBService       ,
    public server    : ServerService   ,
    public alert     : AlertService    ,
    public data      : OSData          ,
    public notify    : NotifyService   ,
    public dispatch  : DispatchService ,
  ) {
    window['onsitetechphones']  = this;
    // window['onsitetechphones2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l('TechPhonesPage: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l('TechPhonesPage: ngOnDestroy() fired');
  }

  public async runWhenReady() {
    let spinnerID;
    try {
      spinnerID = this.alert.showSpinner("Retrieving latest tech login data...");
      if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
      this.initializeFields();
      let res:any[] = await this.db.getTechPhones();
      let loginArray = res;
      for(let record of loginArray) {
        let mo = moment(record.timestampM);
        record.ts = moment(mo);
        record.date = moment(mo).format("YYYY-MM-DD");
        record.time = moment(mo).format("HH:mm:ss");
      }
      this.techPhoneLogins = loginArray.sort((a:any,b:any) => {
        let aT = a.timestamp;
        let bT = b.timestamp;
        return aT > bT ? -1 : aT < bT ? 1 : 0;
      });
      this.alert.hideSpinner(spinnerID);
      this.dataReady = true;
      this.setPageLoaded();
      return this.techPhoneLogins;
    } catch(err) {
      this.alert.hideSpinner(spinnerID);
      Log.l(`runWhenReady(): Error getting tech phone login list!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error getting tech login list from server: '${err.message}'`, 10000);
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

  public initializeFields() {
    let fields:any[] = [
      { field: "_id"        , subfield: ""            , header: "ID"             , filter: true, filterPlaceholder: "ID"             , order: 0   , class: "col-01", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
      { field: "username"   , subfield: ""            , header: "User"           , filter: true, filterPlaceholder: "User"           , order: 1   , class: "col-02", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
      { field: "date"       , subfield: ""            , header: "Login Date"     , filter: true, filterPlaceholder: "Login Date"     , order: 2   , class: "col-03", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "time"       , subfield: ""            , header: "Login Time"     , filter: true, filterPlaceholder: "Login Time"     , order: 3   , class: "col-04", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "ts"         , subfield: ""            , header: "Timestamp"      , filter: true, filterPlaceholder: "Timestamp"      , order: 4   , class: "col-05", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
      { field: "timestamp"  , subfield: ""            , header: "TimestampXL"    , filter: true, filterPlaceholder: "Timestamp XL"   , order: 5   , class: "col-06", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
      { field: "timestampM" , subfield: ""            , header: "TimestampM"     , filter: true, filterPlaceholder: "TimestampM"     , order: 6   , class: "col-07", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
      { field: "device"     , subfield: "manufacturer", header: "Maker"          , filter: true, filterPlaceholder: "Maker"          , order: 7   , class: "col-08", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "device"     , subfield: "model"       , header: "Model"          , filter: true, filterPlaceholder: "Model"          , order: 8   , class: "col-09", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "device"     , subfield: "platform"    , header: "Platform"       , filter: true, filterPlaceholder: "Platform"       , order: 9   , class: "col-10", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "device"     , subfield: "version"     , header: "Version"        , filter: true, filterPlaceholder: "Version"        , order: 10  , class: "col-11", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "device"     , subfield: "appVersion"  , header: "App Version"    , filter: true, filterPlaceholder: "App Version"    , order: 11  , class: "col-12", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "device"     , subfield: "virtual"     , header: "Virtual Device" , filter: true, filterPlaceholder: "Virtual Device" , order: 12  , class: "col-13", style: {}, oldstyle: {width: "120px" }, format:"", } ,
      { field: "device"     , subfield: "uniqueID"    , header: "UDID"           , filter: true, filterPlaceholder: "UDID"           , order: 13  , class: "col-14", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
      // { field: "device.manufacturer" , header: "Maker"          , filter: true, filterPlaceholder: "Maker"          , order: 7   , class: "col-08", style: {width: "120px" }, format:"", } ,
      // { field: "device.model"        , header: "Model"          , filter: true, filterPlaceholder: "Model"          , order: 8   , class: "col-09", style: {width: "120px" }, format:"", } ,
      // { field: "device.platform"     , header: "Platform"       , filter: true, filterPlaceholder: "Platform"       , order: 9   , class: "col-10", style: {width: "120px" }, format:"", } ,
      // { field: "device.version"      , header: "Version"        , filter: true, filterPlaceholder: "Version"        , order: 10  , class: "col-11", style: {width: "120px" }, format:"", } ,
      // { field: "device.appVersion"   , header: "App Version"    , filter: true, filterPlaceholder: "App Version"    , order: 11  , class: "col-12", style: {width: "120px" }, format:"", } ,
      // { field: "device.virtual"      , header: "Virtual Device" , filter: true, filterPlaceholder: "Virtual Device" , order: 12  , class: "col-13", style: {width: "120px" }, format:"", } ,
      // { field: "device.uniqueID"     , header: "UDID"           , filter: true, filterPlaceholder: "UDID"           , order: 13  , class: "col-14", style: {width: "auto"  }, format:"", } ,
    ];
    this.allFields = fields;
    this.cols = this.allFields.slice(0);
    this.selectedColumns = [];
    for(let field of fields) {
      let item = { label: field.header, value: field.field };
      // let item = {label: field.header, value: field};
      this.colOpts.push(item);
      if(field.field !== "_id" && field.field !== "ts" && field.field !== "timestamp" && field.field !== "timestampM" && field.field !== 'device') {
        this.selectedColumns.push(field);
      } else if(field.field === 'device') {
        if(field.subfield !== 'uniqueID' && field.subfield !== 'virtual') {
          this.selectedColumns.push(field);
        }
      }
    }
    // for(let field of this.colOpts) {
    //   if(field.value !== "_id" && field.value !== "ts" && field.value !== "timestamp" && field.value !== "timestampM" && field.value !== "device.uniqueID") {
    //     this.selectedColumns.push(field.value);
    //   }
    // }
    // this.columnsChanged();
  }

  public tableReset() {
    Log.l("tableReset(): Now resetting data table...");
    this.dataReady = false;
    this.initializeFields();
    this.dt.reset();
    this.dataReady = true;
  }

  public selectionChanged(colList?: string[]) {
    this.dataReady = false;
    // this.columnsChanged(colList);
    this.dataReady = true;
  }

  public orderColumns(event?:any):any[] {
    let selectedColumns:any[] = [];
    selectedColumns = this.selectedColumns.sort((a:any,b:any) => {
      let oA = a['order'] !== undefined ? a.order : 0;
      let oB = b['order'] !== undefined ? b.order : 0;
      return oA > oB ? 1 : oA < oB ? -1 : 0;
    });
    this.selectedColumns = selectedColumns;
    return this.selectedColumns;
  }

  public columnsChanged(colList?:string[]) {
    // let vCols = colList ? colList : this.selectedColumns;
    // // let cols = this.cols;
    // Log.l("columnsChanged(): Items now selected:\n", vCols);
    // // let sel = [];
    // let sel = this.allFields.filter((a: any) => {
    //   return (vCols.indexOf(a.field) > -1);
    // }).sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Items selected via string:\n", sel);
    // // this.displayColumns = [];
    // // this.displayColumns = oo.clone(sel);
    // // this.cols = oo.clone(sel);
    // this.cols = sel;
    // // this.displayColumns = [];
    // // for(let item of sel) {
    // //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    // //   this.displayColumns.push(oo.clone(item));
    // //   // let i = dc.findIndex((a:any) => {
    // //   //   return (a.field === item['field']);
    // //   // });
    // //   // if(i === -1) {
    // //   //   dc = [...dc, item];
    // //   // }
    // // }
    // this.cols = this.cols.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.cols);
    // // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    // //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // // });
    // // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // // this.displayColumns = sel;
  }

  public showOptions(event?:MouseEvent|KeyboardEvent) {
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public async optionsSaved(event?:any) {
    try {
      this.optionsVisible = false;
      Log.l("optionsSaved(): Event is:\n", event);
      let prefs = this.prefs.getPrefs();
      let res:any = await this.data.savePreferences(prefs);
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      return res;
    } catch(err) {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    }
  }

  public showReport(phoneReport:any, event?:any) {
    Log.l(`showReport(): User selected report:\n`, phoneReport);
  }

}
