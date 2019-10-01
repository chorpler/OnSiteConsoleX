import { sprintf                                                     } from 'sprintf-js'                    ;
import { Subscription                                                } from 'rxjs'                          ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                 ;
import { ViewChildren, QueryList,                                    } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                 ;
import { ViewController, ModalController, Content, Scroll,           } from 'ionic-angular'                 ;
import { Log,                                                        } from 'domain/onsitexdomain'          ;
import { Moment, moment, isMoment,                                   } from 'domain/onsitexdomain'          ;
import { _sortTechsByUsername,                                       } from 'domain/onsitexdomain'          ;
import { _matchCLL, _matchSite, _matchReportSite,                    } from 'domain/onsitexdomain'          ;
import { JSON5                                                       } from 'domain/onsitexdomain'          ;
import { OSData                                                      } from 'providers/data-service'        ;
import { DBService                                                   } from 'providers/db-service'          ;
import { TranslationTableRecordKey                                   } from 'providers/db-service'          ;
import { TranslationLanguage                                         } from 'providers/db-service'          ;
import { TranslationDocument, TranslationRecord                      } from 'providers/db-service'          ;
import { TranslationTable, TranslationTableRecord                    } from 'providers/db-service'          ;
import { ServerService                                               } from 'providers/server-service'      ;
import { AlertService, CustomAlertButton                             } from 'providers/alert-service'       ;
import { Preferences                                                 } from 'providers/preferences'         ;
import { NotifyService                                               } from 'providers/notify-service'      ;
import { SpinnerService                                              } from 'providers/spinner-service'     ;
import { Table                                                       } from 'primeng/table'                 ;
import { Panel                                                       } from 'primeng/panel'                 ;
import { MultiSelect                                                 } from 'primeng/multiselect'           ;
import { Dropdown                                                    } from 'primeng/dropdown'              ;
import { TranslationEditor                                           } from 'components/translation-editor' ;
import { SelectItem                                                  } from 'primeng/api'                   ;

@IonicPage({name: 'Translations'})
@Component({
  selector: 'page-translations',
  templateUrl: 'translations.html',
  // styleUrls: ['./translations.scss'],
})
export class TranslationsPage implements OnInit,OnDestroy {
  @ViewChild('translationsContent') translationsContent:Content;
  @ViewChild('dt') dt:Table;
  @ViewChild('maintTable') maintTable:Table;
  @ViewChild('translationsPanel') translationsPanel:Panel;
  @ViewChild('columnSelect') columnSelect:MultiSelect;
  @ViewChild('columnSelectMaint') columnSelectMaint:MultiSelect;
  @ViewChildren('maintTypeDropdown') maintTypeDropdownList:QueryList<Dropdown>;
  public title              : string    = "Translations"            ;
  public mode               : string    = 'page'                    ;
  public modalMode          : boolean   = false                     ;
  public visibleEditor      : boolean   = false                     ;
  public visibleMaintEditor : boolean   = false                     ;

  public pageSizeOptions:number[]  = [5, 10, 20, 25, 30, 40, 50,100,200,500,1000,2000];
  public dateFormat       : string    = "DD MMM YYYY HH:mm"   ;
  public prefsSub         : Subscription                      ;

  public maintenanceTypes : SelectItem[] = [];

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
  public editorMode       : "Add"|"Edit" = "Edit";

  public maint_words  : TranslationTable = [];
  public maint_enouns : TranslationTable = [];
  public maint_mnouns : TranslationTable = [];
  public maint_verbs  : TranslationTable = [];
  public editMaint    : TranslationTableRecordKey;

  public dirtyRows    : boolean[][]         = [];
  public panelDirty   : boolean[]           = [];
  public pageDirty    : boolean             = false;
  public deleteModes  : boolean[]           = [false, false];
  public highlights   : boolean[][]         = [];
  
  public focusTimeout : number              = 300   ;

  public dataReady     : boolean            = false ;
  public get filteredCount():number { return this.getFilteredCount(this.dt); };
  public get filteredMaintCount():number { return this.getFilteredCount(this.maintTable); };

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
    window['p'] = this;
  }

  ngOnInit() {
    Log.l('TranslationsPage: ngOnInit() fired');
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
      this.initializeDirtyTrackers();
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

  public initializeDirtyTrackers() {
    this.pageDirty = false;
    this.initializeDirtyPanels();
    this.initializeDirtyRows();
  }

  public initializeDirtyPanels():boolean[] {
    let tables = [
      this.translations,
      this.maint_words,
    ];
    this.panelDirty = [];
    for(let table of tables) {
      this.panelDirty.push(false);
    }
    return this.panelDirty;
  }

  public initializeDirtyRows():boolean[][] {
    let dirtyRows:boolean[][] = [];
    let tables = [
      this.translations,
      this.maint_words,
    ];
    for(let table of tables) {
      let tableDirtyRows = [];
      for(let row of table) {
        row._meta = {dirty: false};
        tableDirtyRows.push(false);
      }
      dirtyRows.push(tableDirtyRows);
    }
    this.dirtyRows = dirtyRows;
    return dirtyRows;
  }

  public dirtyUpRow(tableIndex:number, rowData:TranslationTableRecord, rowIndex:number) {
    let tables = [
      this.translations,
      this.maint_words,
    ];
    rowData._meta.dirty = true;
    this.dirtyRows[tableIndex][rowIndex] = true;
    this.panelDirty[tableIndex] = true;
    this.pageDirty = true;
  }

  public cleanUpRow(tableIndex:number, rowIndex:number) {
    let tables = [
      this.translations,
      this.maint_words,
    ];
    tables[tableIndex][rowIndex]._meta.dirty = false;
    this.dirtyRows[tableIndex][rowIndex] = false;
    if(!this.dirtyRows[tableIndex].includes(true)) {
      this.panelDirty[tableIndex] = false;
    }
    if(!this.panelDirty.includes(true)) {
      this.pageDirty = false;
    }
  }

  public getFilteredCount(table?:Table):number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = table && typeof table === 'object' ? table : this.dt ? this.dt : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  // public setHeader(idx?:number) {
  //   let count = Array.isArray(this.translations) ? this.translations.length : 0;
  //   this.header = `View Report (${index+1} / ${count})`;
  //   return this.header;
  // }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
    setTimeout(() => {
      let myContent = this.translationsContent;
      if(myContent && myContent.getNativeElement) {
        Log.l(`TranslationsPage.setPageLoaded(): Focusing on IonContent element …`);
        let el1:HTMLElement = myContent.getNativeElement();
        el1.focus();
        Log.l(`TranslationsPage.setPageLoaded(): Done focusing!`);
      } else {
        Log.l(`TranslationsPage.setPageLoaded(): Tried to focus on IonContent element but could not find it!`);
      }
    }, this.focusTimeout);
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

    this.maintenanceTypes = [
      { label: "Mechanical Noun", value: "mechanical_noun" },
      { label: "Electronic Noun", value: "electronic_noun" },
      { label: "Verb", value: "verb" },
    ];
    // this.selectedColumns = initialColumns;
    return fields;
  }

  public async loadTranslationData():Promise<any> {
    try {
      let translationTable = await this.server.loadTranslationTable();
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
    Log.l(`TranslationsPage.selectionChanged(): Event is:`, evt);
    this.dataReady = false;
    this.columnsChanged();
    this.dataReady = true;
  }

  public selectionChangedMaint(evt?:Event) {
    Log.l(`TranslationsPage.selectionChangedMaint(): Event is:`, evt);
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
        _meta: {dirty:true},
      };
      for(let key of this.langKeys) {
        tmpRecord[key] = '';
      }
      record = tmpRecord;
      this.translations.push(record);
      this.maint_words.push(record);
      this.editRecord = record;
      this.editTranslations = this.translations;
      this.editorMode = "Add";
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
      this.editorMode = "Edit";
      this.visibleEditor = true;
      this.visibleMaintEditor = true;
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
      this.editorMode = "Edit";
      this.visibleEditor = true;
      this.visibleMaintEditor = true;
    } catch(err) {
      Log.l(`TranslationsPage.editMaintenance(): Error editing translation:`, row);
      Log.e(err);
      throw err;
    }
  }
  
  public async possibleDeleteTranslation(row:TranslationTableRecord, evt?:Event):Promise<any> {
    let spinnerID;
    try {
      Log.l(`TranslationsPage.possibleDeleteMaintenance(): Called for row:`, row);
      this.dt.selection = row;
      this.maintTable.selection = row;
      let title = "DELETE RECORD";
      let text = "Do you want to delete this translation record? This cannot be undone.";
      let confirm = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        this.dt.selection = null;
        this.maintTable.selection = null;
        spinnerID = await this.alert.showSpinnerPromise('Deleting translation …');
        await this.deleteTranslation(row, evt);
        await this.alert.hideSpinnerPromise(spinnerID);
      } else {
        this.dt.selection = null;
        this.maintTable.selection = null;
      }
    } catch(err) {
      Log.l(`TranslationsPage.possibleDeleteMaintenance(): Error editing translation:`, row);
      Log.e(err);
      let title = "DATABASE ERROR";
      let text  = "Error while deletion this translation from the database";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }
  
  public async possibleDeleteMaintenance(row:TranslationTableRecord, evt?:Event):Promise<any> {
    let spinnerID;
    try {
      Log.l(`TranslationsPage.possibleDeleteMaintenance(): Called for row:`, row);
      this.maintTable.selection = row;
      this.dt.selection = row;
      let title = "DELETE RECORD";
      let text = "Do you want to delete this translation record? This cannot be undone.";
      let confirm = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        this.maintTable.selection = null;
        this.dt.selection = null;
        spinnerID = await this.alert.showSpinnerPromise('Deleting translation …');
        await this.deleteMaintenanceTranslation(row, evt);
        await this.alert.hideSpinnerPromise(spinnerID);
      } else {
        this.maintTable.selection = null;
        this.dt.selection = null;
      }
    } catch(err) {
      Log.l(`TranslationsPage.possibleDeleteMaintenance(): Error editing translation:`, row);
      Log.e(err);
      let title = "DATABASE ERROR";
      let text  = "Error while deletion this maintenance translation from the database";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }

  public async deleteTranslation(record:TranslationTableRecord, evt?:Event):Promise<any> {
    let spinnerID;
    try {
      let idx1:number = this.translations.indexOf(record);
      if(idx1 > -1) {
        let deleted = this.translations.splice(idx1, 1)[0];
        window['onsitedeletedtranslation'] = deleted;
      }
      let idx2 = this.maint_words.indexOf(record);
      if(idx2 > -1) {
        let deleted2 = this.maint_words.splice(idx2, 1)[0];
        window['onsitedeletedtranslation2'] = deleted2;
      }
      try {
        // spinnerID = await this.alert.showSpinnerPromise('Deleting translation …');
        let res = await this.saveTranslations(evt);
        // await this.alert.hideSpinnerPromise(spinnerID);
      } catch(err) {
        Log.l(`TranslationsPage.deleteTranslation(): Error saving deletion`);
        throw err;
        // Log.e(err);
        // await this.alert.hideSpinnerPromise(spinnerID);
        // let title = "DATABASE ERROR";
        // let text  = "Error while saving this deletion to the database";
        // await this.alert.showErrorMessage(title, text, err);
        // return;
      }
      // return res;
    } catch(err) {
      Log.l(`TranslationsPage.deleteTranslation(): Error deleting translation`);
      Log.e(err);
      // await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async deleteMaintenanceTranslation(record:TranslationTableRecord, evt?:Event):Promise<any> {
    let spinnerID;
    try {
      let idx1:number = this.maint_words.indexOf(record);
      if(idx1 > -1) {
        let deleted = this.maint_words.splice(idx1, 1)[0];
        window['onsitedeletedtranslation'] = deleted;
      }
      let idx2 = this.translations.indexOf(record);
      if(idx2 > -1) {
        let deleted2 = this.maint_words.splice(idx2, 1)[0];
        window['onsitedeletedtranslation2'] = deleted2;
      }
      try {
        // spinnerID = await this.alert.showSpinnerPromise('Deleting translation …');
        let res = await this.saveTranslations(evt);
        // await this.alert.hideSpinnerPromise(spinnerID);
      } catch(err) {
        Log.l(`TranslationsPage.deleteMaintenanceTranslation(): Error saving deletion`);
        throw err;
        // Log.e(err);
        // await this.alert.hideSpinnerPromise(spinnerID);
        // let title = "DATABASE ERROR";
        // let text  = "Error while saving this deletion to the database";
        // await this.alert.showErrorMessage(title, text, err);
        // return;
      }
      // return res;
    } catch(err) {
      Log.l(`TranslationsPage.deleteMaintenanceTranslation(): Error deleting translation`);
      Log.e(err);
      // await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async possibleSaveTranslations(evt?:Event):Promise<any> {
    let spinnerID;
    try {
      Log.l(`TranslationsPage.possibleSaveTranslations(): Called with event:`, evt);
      let title = "SAVE TRANSLATIONS";
      let text  = "Do you want to save these translation records to the database?";
      let confirm = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        spinnerID = await this.alert.showSpinnerPromise('Saving translations …');
        let res = await this.saveTranslations(evt);
        this.initializeDirtyRows();
        await this.alert.hideSpinnerPromise(spinnerID);
        return res;
      }
    } catch(err) {
      Log.l(`TranslationsPage.possibleSaveTranslations(): Error during possible save of translation edit`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      let title = "ERROR SAVING";
      let text = "There was an error saving the translations to the database";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }

  public async saveTranslations(evt?:Event):Promise<any> {
    try {
      let table = this.translations;
      let maint = this.maint_words;
      let res:any;
      res = await this.server.saveTranslations(table, maint);
      this.cleanEverything();
      return res;
    } catch(err) {
      Log.l(`TranslationsPage.saveTranslations(): Error during save of translation edit`);
      Log.e(err);
      throw err;
    }
  }

  public cleanEverything() {
    let tables = [
      this.translations,
      this.maint_words,
    ];
    this.pageDirty = false;
    this.panelDirty = this.panelDirty.map(a => false);
    tables.forEach(table => {
      table.forEach(row => row._meta = {dirty:false});
    });
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

  public toggleDeleteMode(tableId:number, evt?:Event) {
    this.deleteModes[tableId] = !this.deleteModes[tableId];
  }

  public parseTextToJson(text:string):any {
    try {
      Log.l(`TranslationsPage.parseTextToJson(): Text is:`, text);
      let trimmed = text.trim();
      let json5object = !((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) ? "{" + trimmed + "}" : trimmed;
      let jsonOut = JSON5.parse(json5object);
      window['onsitepastejson5'] = jsonOut;
      // let rawData = text.trim().split("\n");
      // let rawData2 = rawData.map(str => str.replace(/ +(?= )/g,'')).map(str2 => str2.endsWith(",") ? str2.slice(0,-1) : str2).map(str3 => "{" + str3 + "}");
      // let rawData3 = rawData2.map(row => JSON.parse(row));
      // window['onsitepastejson'] = rawData3;
      Log.l(`TranslationsPage.parseTextToJson(): Final output is:`, jsonOut);
      return jsonOut;
    } catch(err) {
      Log.l(`TranslationsPage.parseTextToJson(): Error parsing string:`, text);
      Log.e(err);
      // throw err;
      return null;
    }
  }

  public onPaste(evt?:ClipboardEvent) {
    Log.l(`TranslationsPage.onPaste(): Called, event is:`, evt);
    window['onsitepasteevent'] = evt;
    window['onsitepastedata'] = evt && evt.clipboardData ? evt.clipboardData : (window as any).clipboardData ? (window as any).clipboardData : null;
    if(evt && evt.clipboardData) {
      let text = evt.clipboardData.getData('text');
      Log.l(`TranslationsPage.onPaste(): Text is:`, text);
      window['onsitepastetext'] = text;
      let res = this.parseTextToJson(text);
      if(res) {
        this.processJsonData(res);
      } else {
        Log.w(`TranslationsPage.onPaste(): Could not parse pasted data:`, text);
      }
    }
  }

  public async processJsonData(data:any) {
    try {
      let langKeys = this.langKeys;
      let langKeyCount = langKeys.length;
      let keys = Object.keys(data);
      let out = [];
      // let newRecords:TranslationTableRecord[] = [];
      // let newMaintRecords:TranslationTableRecord[] = [];
      for(let key of keys) {
        let value:string[] = data[key];
        let record:TranslationTableRecord;
        let row:any = {
          key: key,
        };
        let i = 0;
        for(let langKey of langKeys) {
          let langValue = value[i++];
          row[langKey] = langValue;
        }
        // if(value.length > langKeyCount) {
        //   let maint_type = value[i];
        //   row.maint_type = maint_type;
        // }
        record = row;
        let title = "ADD TRANSLATION";
        let text1  = "Add translation to table";
        let text  = sprintf("%s:<br>\n<br>\n%s<br>\n", text1, JSON.stringify(record));
        let confirm = await this.alert.showConfirmYesNo(title, text);
        if(confirm) {
          record._meta = {dirty: true};
          this.translations.push(record);
          // newRecords.push(record);
          // this.dirtyRows[0].push(false);
          this.panelDirty[0] = true;
          this.reSortTables();
          title = "ADD MAINTENANCE";
          text = "Add record to maintenance report translations as well?";
          let maintTypes = [
            {code: 'mechanical_noun', value: 'Add as Mechanical Noun' },
            {code: 'electronic_noun', value: 'Add as Electronic Noun' },
            {code: 'verb', value: 'Add as Verb' },
          ];
          let buttons:CustomAlertButton[] = [];
          for(let type of maintTypes) {
            let button:CustomAlertButton = {
              text: type.value,
              resolve: type.code,
            };
            buttons.push(button);
          }
          buttons.push({
            text: "No",
            role: 'cancel',
            resolve: null,
          })
          let res:string = await this.alert.showCustomConfirm(title, text, buttons);
          if(res && typeof res === 'string') {
            record.maint_type = res;
            record._meta = {dirty: true};
            this.maint_words.push(record);
            // newMaintRecords.push(record);
            // this.dirtyRows[1].push(false);
            this.panelDirty[1] = true;
            this.reSortTables();
          }
          out.push(record);
        }
      }
      Log.l(`TranslationsPage.processJsonData(): Final result of JSON data is:`, out);
      this.reSortTables();
      // let dt:Table = this.dt;
      // for(let record of newRecords) {
      //   let idx = dt.value.indexOf(record);
      //   if(idx > -1) {
      //     this.dirtyRows[0][idx] = true;
      //   }
      // }
      // dt = this.maintTable;
      // for(let record of newMaintRecords) {
      //   let idx = dt.value.indexOf(record);
      //   if(idx > -1) {
      //     this.dirtyRows[1][idx] = true;
      //   }
      // }
      return out;
    } catch(err) {
      Log.l(`TranslationsPage.processJsonData(): Error processing JSON data:`, data);
      Log.e(err);
      let title = "PASTE ERROR";
      let text  = "Error processing the pasted data";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }

}
