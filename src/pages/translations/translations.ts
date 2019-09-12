import { Subscription                                                } from 'rxjs'                               ;
import { Log, Moment, moment, isMoment,                              } from 'domain/onsitexdomain'               ;
import { _matchCLL, _matchSite, _matchReportSite,                    } from 'domain/onsitexdomain'               ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                      ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                      ;
import { ViewController, ModalController, Content, Scroll,           } from 'ionic-angular'                      ;
import { OSData                                                      } from 'providers/data-service'             ;
import { DBService                                                   } from 'providers/db-service'               ;
import { TranslationDocument, TranslationRecord                      } from 'providers/db-service'               ;
import { TranslationTable, TranslationTableRecord                    } from 'providers/db-service'               ;
import { ServerService                                               } from 'providers/server-service'           ;
import { AlertService                                                } from 'providers/alert-service'            ;
import { Preferences                                                 } from 'providers/preferences'              ;
import { NotifyService                                               } from 'providers/notify-service'           ;
import { SpinnerService                                              } from 'providers/spinner-service'          ;
import { Table                                                       } from 'primeng/table'                      ;
import { Panel                                                       } from 'primeng/panel'                      ;
import { MultiSelect                                                 } from 'primeng/multiselect'                ;

@IonicPage({name: 'Translations'})
@Component({
  selector: 'page-translations',
  templateUrl: 'translations.html',
})
export class TranslationsPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:Table;
  @ViewChild('translationsPanel') translationsPanel:Panel;
  @ViewChild('columnSelect') columnSelect:MultiSelect;
  public title         : string    = "Translations"            ;
  public mode          : string    = 'page'                    ;
  public modalMode     : boolean   = false                     ;

  public pageSizeOptions:number[]  = [50,100,200,500,1000,2000];
  public dateFormat    : string    = "DD MMM YYYY HH:mm"      ;
  public prefsSub         : Subscription                      ;

  public autoLayout       : boolean            = true         ;
  public rowCount         : number             = 50           ;

  public cols             : any[]         = []           ;
  public selectedColumns  : any[]         = []           ;
  public selectedLabel    : string             = "{0} columns shown";
  public showFilterRow    : boolean         = true            ;
  public showButtonCol    : boolean         = true            ;
  public showTableHead    : boolean         = true            ;
  public showTableFoot    : boolean         = true            ;
  public styleColIndex    : any                               ;
  public styleColEdit     : any                               ;

  public translations : TranslationTable = [];

  public dataReady     : boolean            = false ;

  constructor(
    public navCtrl   : NavController    ,
    public navParams : NavParams        ,
    public viewCtrl  : ViewController   ,
    // public modalCtrl : ModalController  ,
    public zone      : NgZone           ,
    public prefs     : Preferences      ,
    public db        : DBService        ,
    public server    : ServerService    ,
    public data      : OSData           ,
    public alert     : AlertService     ,
    public notify    : NotifyService    ,
    public spinner   : SpinnerService   ,
  ) {
    window['onsitetranslations']  = this;
    // window['onsitereports2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l('TranslationsPage: ngOnInit() fired');
    this.getFields();
    // this.cols = this.getFields();
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("TranslationsPage: ngOnDestroy() fired");
    this.cancelSubscriptions();
  }

  public async runWhenReady():Promise<any> {
    let spinnerID;
    try {
      this.initializeSubscriptions();
      this.getFields();
      let translationTable = await this.server.loadTranslations();
      this.translations = translationTable;
      // this.colsOthers = this.getOthersFields();
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.dataReady = true;
      this.setPageLoaded();
      return true;
    } catch(err) {
      Log.l(`TranslationsPage.runWhenReady(): Error getting reports and initializing data!`);
      Log.e(err);
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public initializeSubscriptions() {

  }

  public cancelSubscriptions() {
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public moment(value:Date|Moment):Moment {
    let mo:Moment = moment(value);
    return mo;
  }

  public getFields() {
    this.styleColEdit = {'max-width':'40px', 'width': '40px', 'padding': '0px'};
    this.styleColIndex = {'max-width':'50px', 'width': '50px'};
    let fields:any[] = [
      { field: 'key' , header: 'Key'     , filter: true , filterPlaceholder: "Key"     , order:  1 , show: true , style: "", class: "col-nowrap col-00 col-key"   , format: "" , tooltip: "Key", },
      { field: 'en'  , header: 'English' , filter: true , filterPlaceholder: "English" , order:  2 , show: true , style: "", class: "col-wrap   col-01 col-value" , format: "" , tooltip: "English translation", },
      { field: 'es'  , header: 'Spanish' , filter: true , filterPlaceholder: "Spanish" , order:  3 , show: true , style: "", class: "col-wrap   col-02 col-value" , format: "" , tooltip: "Spanish translation", },
    ];
    this.cols = fields;
    this.selectedColumns = this.cols.filter((a:any) => {
      // let field:string = a.field ? a.field : "";
      // if(field && initialColumns.indexOf(field) > -1) {
      //   return true;
      // } else {
      //   return false;
      // }
      return a.show;
    });
    // this.selectedColumns = initialColumns;
    return fields;
  }

  public selectionChanged(evt?:Event) {
    Log.l(`selectionChanged(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChanged();
    this.dataReady = true;
  }

  public columnsChanged(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    // // let cols = this.cols;
    // Log.l("columnsChanged(): Items now selected:\n", vCols);
    // // let sel = [];
    // // let sel = this.allFields.filter((a:any) => {
    // //   return (vCols.indexOf(a.field) > -1);
    // // }).sort((a: any, b: any) => {
    // //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // // });
    // // Log.l("columnsChanged(): Items selected via string:\n", sel);
    // // // this.displayColumns = [];
    // // // this.displayColumns = oo.clone(sel);
    // // // this.cols = oo.clone(sel);
    // // this.cols = sel;
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
    this.selectedColumns = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChanged(): Now field list is:\n", this.cols);
    if(this.columnSelect) {
      this.columnSelect.updateLabel();
    }
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public async editTranslation(row:TranslationTableRecord, evt?:Event):Promise<any> {
    try {
      Log.l(`TranslationsPage.editTranslation(): Called for row:`, row);
    } catch(err) {
      Log.l(`TranslationsPage.editTranslation(): Error editing translation:`, row);
      Log.e(err);
      throw err;
    }
  }
}
