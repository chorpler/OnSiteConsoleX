import { Subscription                                                } from 'rxjs'                          ;
import { Log, Moment, moment, isMoment, _sortTechsByUsername,                              } from 'domain/onsitexdomain'          ;
import { _matchCLL, _matchSite, _matchReportSite,                    } from 'domain/onsitexdomain'          ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                 ;
import { ViewController, ModalController, Content, Scroll,           } from 'ionic-angular'                 ;
import { OSData                                                      } from 'providers/data-service'        ;
import { DBService                                                   } from 'providers/db-service'          ;
import { TranslationTableRecordKey                                   } from 'providers/db-service'          ;
import { TranslationLanguage                                         } from 'providers/db-service'          ;
import { TranslationDocument, TranslationRecord                      } from 'providers/db-service'          ;
import { TranslationTable, TranslationTableRecord                    } from 'providers/db-service'          ;
import { ServerService                                               } from 'providers/server-service'      ;
import { AlertService                                                } from 'providers/alert-service'       ;
import { Preferences                                                 } from 'providers/preferences'         ;
import { NotifyService                                               } from 'providers/notify-service'      ;
import { SpinnerService                                              } from 'providers/spinner-service'     ;
import { Table                                                       } from 'primeng/table'                 ;
import { Panel                                                       } from 'primeng/panel'                 ;
import { MultiSelect                                                 } from 'primeng/multiselect'           ;
import { TranslationEditor                                           } from 'components/translation-editor' ;

@IonicPage({name: 'Translations'})
@Component({
  selector: 'page-translations',
  templateUrl: 'translations.html',
  // styleUrls: ['./translations.scss'],
})
export class TranslationsPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:Table;
  @ViewChild('maintTable') maintTable:Table;
  @ViewChild('translationsPanel') translationsPanel:Panel;
  @ViewChild('columnSelect') columnSelect:MultiSelect;
  @ViewChild('columnSelectMaint') columnSelectMaint:MultiSelect;
  public title              : string    = "Translations"            ;
  public mode               : string    = 'page'                    ;
  public modalMode          : boolean   = false                     ;
  public visibleEditor      : boolean   = false                     ;
  public visibleMaintEditor : boolean   = false                     ;

  public pageSizeOptions:number[]  = [5, 10, 20, 25, 30, 40, 50,100,200,500,1000,2000];
  public dateFormat       : string    = "DD MMM YYYY HH:mm"   ;
  public prefsSub         : Subscription                      ;

  public autoLayout       : boolean            = true         ;
  public rowCount         : number             = 50           ;

  public cols             : any[]         = []           ;
  public selectedColumns  : any[]         = []           ;
  public selectedLabel    : string             = "{0} columns shown";
  public colsMaint            : any[]   = []           ;
  public selectedColumnsMaint : any[]   = []           ;
  public selectedLabelMaint   : string       = "{0} columns shown";

  public showFilterRow    : boolean         = true            ;
  public showButtonCol    : boolean         = true            ;
  public showTableHead    : boolean         = true            ;
  public showTableFoot    : boolean         = true            ;
  public styleColIndex    : any                               ;
  public styleColEdit     : any                               ;
  public multiSortMetaTrans : any = {};
  public multiSortMetaMaint : any = {};

  public langKeys         : TranslationLanguage[] = ['en', 'es'];

  public translations     : TranslationTable = [];
  public editTranslations : TranslationTable = [];
  public editRecord       : TranslationTableRecord;

  public maint_words  : TranslationTable = [];
  public maint_enouns : TranslationTable = [];
  public maint_mnouns : TranslationTable = [];
  public maint_verbs  : TranslationTable = [];
  public editMaint    : TranslationTableRecordKey;

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
      this.resetTablesSort();
      // this.colsOthers = this.getOthersFields();
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      let res:any = await this.loadTranslationData();
      this.dataReady = true;
      this.setPageLoaded();
      return true;
    } catch(err) {
      Log.l(`TranslationsPage.runWhenReady(): Error getting translations and initializing data!`);
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
      return a.show;
    });
    let maint_fields:any[] = [
      { field: 'key' , header: 'Key'     , filter: true , filterPlaceholder: "Key"     , order:  1 , show: true , style: "", class: "col-nowrap col-00 col-key"   , format: "" , tooltip: "Key", },
      { field: 'maint_type', header: 'Maintenance Type', filter: true , filterPlaceholder: "Maintenance Word Type", order:  2 , show: true , style: "", class: "col-nowrap col-01 col-maint-type", format: "" , tooltip: "Maintenance Word type (such as mechanical noun, electronic noun, verb)", },
      { field: 'en'  , header: 'English' , filter: true , filterPlaceholder: "English" , order:  3 , show: true , style: "", class: "col-wrap   col-02 col-value" , format: "" , tooltip: "English translation", },
      { field: 'es'  , header: 'Spanish' , filter: true , filterPlaceholder: "Spanish" , order:  4 , show: true , style: "", class: "col-wrap   col-03 col-value" , format: "" , tooltip: "Spanish translation", },
    ];
    this.colsMaint = maint_fields;
    this.selectedColumnsMaint = this.colsMaint.filter((a:any) => {
      return a.show;
    });
    // this.selectedColumns = initialColumns;
    return fields;
  }

  public async loadTranslationData():Promise<any> {
    try {
      let translationTable = await this.server.loadTranslations();
      this.translations = translationTable;
      let enouns = this.data.getConfigData('maintenance_enouns');
      let mnouns = this.data.getConfigData('maintenance_mnouns');
      let verbs  = this.data.getConfigData('maintenance_verbs');
      this.maint_enouns = [];
      this.maint_mnouns = [];
      this.maint_verbs  = [];
      let record:TranslationTableRecord;
      // let row:any = {};
      for(let word of enouns) {
        let translationRecord = this.translations.find(a => a.key === word);
        if(translationRecord) {
          record = translationRecord;
          record.maint_type = 'electronic_noun';
          this.maint_enouns.push(record);
          // for(let langKey of this.langKeys) {
            //   // let value = translationRecord[langKey];
            // }
          } else {
          Log.w(`TranslationsPage.loadTranslationData(): Error loading '${word}' translation record`);
        }
      }
      for(let word of mnouns) {
        let translationRecord = this.translations.find(a => a.key === word);
        if(translationRecord) {
          record = translationRecord;
          record.maint_type = 'mechanical_noun';
          this.maint_mnouns.push(record);
          // for(let langKey of this.langKeys) {
            //   // let value = translationRecord[langKey];
            // }
          } else {
            Log.w(`TranslationsPage.loadTranslationData(): Error loading '${word}' translation record`);
          }
      }
      for(let word of verbs) {
        let translationRecord = this.translations.find(a => a.key === word);
        if(translationRecord) {
          record = translationRecord;
          record.maint_type = 'verb';
          this.maint_verbs.push(record);
          // for(let langKey of this.langKeys) {
            //   // let value = translationRecord[langKey];
          // }
        } else {
          Log.w(`TranslationsPage.loadTranslationData(): Error loading '${word}' translation record`);
        }
      }
      this.maint_words = [ ...this.maint_enouns, ...this.maint_mnouns, ...this.maint_verbs, ];
    } catch(err) {
      Log.l(`TranslationsPage.loadTranslations(): Error loading translation data`);
      Log.e(err);
      throw err;
    }
  }

  public resetTablesSort() {
    this.resetTableSorted(1);
    this.resetTableSorted(2);
  }

  public resetTableSorted(tableNumber:number, table?:Table) {
    let sortMeta = [
      { field: 'key', order: 1 },
    ];
    if(tableNumber === 1) {
      this.multiSortMetaTrans = sortMeta.slice(0);
    } else if(tableNumber === 2) {
      this.multiSortMetaMaint = sortMeta.slice(0);
    } else {
      let text:string = `TranslationsPage.resetTableSorted(): Could not find table at index '${tableNumber}' to reset it with sorting`;
      Log.w(text);
      this.notify.addWarning("TABLE RESET ERROR", text, 5000);
      return;
    }
  }

  public resetAllTables(evt?:Event) {
    this.resetTable(this.dt);
    this.resetTable(this.maintTable);
  }

  public resetTable(table:Table, evt?:Event) {
    table.reset();
    this.clearTableSelection(table);
    this.clearTableFilters(table);
    let tableNumber = 1;
    if(table === this.maintTable) {
      tableNumber = 2;
    }
    this.resetTableSorted(tableNumber, table);
    // this.clearDates(tableNumber, dt);
  }

  // public clearTableSelection(tableNumber:number, evt?:Event) {
  public clearTableSelection(table:Table, evt?:Event) {
    Log.l(`TranslationsPage.clearTableSelection(): Clearing selected rows for table:`, table);
    // let dt:Table;
    // if(tableNumber === 1) {
    //   dt = this.dt;
    // } else if(tableNumber === 2) {
    //   dt = this.othersTable;
    // } else if(tableNumber === 3) {
    //   dt = this.logisticsTable;
    // } else if(tableNumber === 4) {
    //   dt = this.timecardsTable;
    // } else {
    //   let text:string = `clearTableSelection(): Could not find table at index '${tableNumber}' to reset it`;
    //   Log.w(text);
    //   this.notify.addWarning("CLEAR SELECTIONS ERROR", text, 5000);
    //   return;
    // }
    if(!(table && table instanceof Table)) {
      let text:string = `TranslationsPage.clearTableSelection(): Must provide a Table to clear selection of. Provided parameter was not a table`;
      Log.w(text, table);
      this.notify.addWarning("CLEAR SELECTIONS ERROR", text, 5000);
      return;
    }
    table.selection = null;
    return table;
  }

  public clearTableFilters(dt:Table, evt?:Event) {
    Log.l(`TranslationsPage.clearTableFilters(): Clearing filters for table:`, dt);
    if(!(dt && dt instanceof Table)) {
      let text:string = `TranslationsPage.clearTableFilters(): Must provide a Table to clear filters of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR FILTERS ERROR", text, 5000);
      return;
    }
    let elRef:ElementRef = dt.el;
    if(!(elRef && elRef.nativeElement)) {
      let text:string = `TranslationsPage.clearTableFilters(): Must provide a Table to clear filters of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR FILTERS ERROR", text, 5000);
      return;
    }
    let el:HTMLElement = elRef.nativeElement;
    // let filterInputElements:HTMLCollectionOf<Element> = el.getElementsByClassName('translations-col-filter');
    // let filterInputElements:HTMLCollectionOf<HTMLInputElement> = el.getElementsByTagName('input');
    let filterElements = el.querySelectorAll('input.translations-col-filter');
    let filterInputElements:NodeListOf<HTMLInputElement> = (filterElements as NodeListOf<HTMLInputElement>);
    Log.l(`TranslationsPage.clearTableFilters(): filter input elements are:`, filterInputElements);
    if(filterInputElements && filterInputElements.length) {
      let count = filterInputElements.length;
      for(let i = 0; i < count; i++) {
        let inputElement:HTMLInputElement = filterInputElements[i];
        if(inputElement instanceof HTMLInputElement) {
          inputElement.value = "";
        }
      }
    }
    // let globalFilterInput:HTMLInputElement = (el.querySelector('input.global-filter-input') as HTMLInputElement);
    let globalFilterInput:HTMLInputElement = el.querySelector('input.global-filter-input');
    globalFilterInput.value = "";
    return dt;
  }

  public selectionChanged(evt?:Event) {
    Log.l(`TranslationsPage.selectionChanged(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChanged();
    this.dataReady = true;
  }

  public selectionChangedMaint(evt?:Event) {
    Log.l(`TranslationsPage.selectionChangedMaint(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChangedMaint();
    this.dataReady = true;
  }

  public columnsChanged(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    this.selectedColumns = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("TranslationsPage.columnsChanged(): Now field list is:\n", this.cols);
    if(this.columnSelect) {
      this.columnSelect.updateLabel();
    }
  }

  public columnsChangedMaint(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    this.selectedColumnsMaint = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("TranslationsPage.columnsChanged(): Now field list is:\n", this.cols);
    if(this.columnSelectMaint) {
      this.columnSelectMaint.updateLabel();
    }
  }

  public async addTranslation(evt?:Event):Promise<any> {
    try {
      let record:TranslationTableRecord;
      let tmpRecord:any = {
        key: '',
        maint_type: null,
      };
      for(let key of this.langKeys) {
        tmpRecord[key] = '';
      }
      record = tmpRecord;
      this.translations.push(record);
      this.maint_words.push(record);
      this.editRecord = record;
      this.editTranslations = this.translations;
      this.visibleEditor = true;
      this.visibleMaintEditor = true;
    } catch(err) {
      Log.l(`TranslationsPage.addTranslation(): Error adding translation`);
      Log.e(err);
      let title = "ERROR ADDING";
      let text = "Error while attempting to add a new translation";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }

  public async editTranslation(row:TranslationTableRecord, evt?:Event):Promise<any> {
    try {
      Log.l(`TranslationsPage.editTranslation(): Called for row:`, row);
      this.editRecord = row;
      this.editTranslations = this.translations;
      this.visibleEditor = true;
    } catch(err) {
      Log.l(`TranslationsPage.editTranslation(): Error editing translation:`, row);
      Log.e(err);
      throw err;
    }
  }
  
  public async editMaintenance(row:TranslationTableRecord, evt?:Event):Promise<any> {
    try {
      Log.l(`TranslationsPage.editMaintenance(): Called for row:`, row);
      this.editRecord = row;
      this.editTranslations = this.maint_words;
      this.visibleEditor = true;
      this.visibleMaintEditor = true;
    } catch(err) {
      Log.l(`TranslationsPage.editMaintenance(): Error editing translation:`, row);
      Log.e(err);
      throw err;
    }
  }
  
  public async editorClosed(evt?:any):Promise<any> {
    try {
      Log.l(`TranslationsPage.editorClosed(): Called with event:`, evt);
      this.visibleEditor = false;
      this.visibleMaintEditor = false;
      this.reSortTables();
    } catch(err) {
      Log.l(`TranslationsPage.editorClosed(): Error closing editor component`);
      Log.e(err);
      throw err;
    }
  }

  public reSortTable(table:Table, evt?:Event) {
    table.sortMultiple();
  }

  public reSortTables(evt?:Event) {
    this.reSortTable(this.dt);
    this.reSortTable(this.maintTable);
  }
}
