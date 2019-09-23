import { Subject                                             } from 'rxjs'                       ;
import { Subscription                                        } from 'rxjs'                       ;
import { debounceTime, distinctUntilChanged                  } from 'rxjs/operators'             ;
import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core'              ;
import { Input, Output, EventEmitter,                        } from '@angular/core'              ;
import { IonicPage, NavController, NavParams                 } from 'ionic-angular'              ;
import { ViewController                                      } from 'ionic-angular'              ;
import { Log, oo                                             } from 'domain/onsitexdomain'       ;
import { Moment, moment, isMoment, MomentTimer,              } from 'domain/onsitexdomain'       ;
import { Employee, Message                                   } from 'domain/onsitexdomain'       ;
import { MaintenanceTaskType                                 } from 'domain/onsitexdomain'       ;
import { DBService                                           } from 'providers/db-service'       ;
import { TranslationDocument                                 } from 'providers/db-service'       ;
import { TranslationRecord                                   } from 'providers/db-service'       ;
import { TranslationTableRecordKey                           } from 'providers/db-service'       ;
import { TranslationLanguage                                 } from 'providers/db-service'       ;
import { TranslationTable, TranslationTableRecord            } from 'providers/db-service'       ;
import { ServerService                                       } from 'providers/server-service'   ;
import { AlertService                                        } from 'providers/alert-service'    ;
import { OSData                                              } from 'providers/data-service'     ;
import { Editor                                              } from 'primeng/editor'             ;
import { Listbox                                             } from 'primeng/listbox'            ;
import { SelectItem                                          } from 'primeng/api'                ;
import { Dropdown                                            } from 'primeng/dropdown'           ;
import { NotifyService                                       } from 'providers/notify-service'   ;
import { DispatchService                                     } from 'providers/dispatch-service' ;

const _sortMessages = (a:Message, b:Message) => {
  if(a instanceof Message && b instanceof Message) {
    // let dA = a.date.format();
    // let dB = b.date.format();
    let dA:string = a.date;
    let dB:string = b.date;
    return dA > dB ? -1 : dA < dB ? 1 : 0;
  } else {
    return 0;
  }
};

const _sortEmployees = (a:Employee, b:Employee) => {
  if(a instanceof Employee && b instanceof Employee) {
    let nA = a.getFullName();
    let nB = b.getFullName();
    return nA > nB ? 1 : nA < nB ? -1 : 0;
  } else {
    return 0;
  }
};

@Component({
  selector: 'translation-editor',
  templateUrl: 'translation-editor.html',
  // styleUrls: ['./translation-editor.scss'],
})
export class TranslationEditor implements OnInit,OnDestroy {
  @Input('record') record:TranslationTableRecord;
  @Input('translations') translations:TranslationTable = [];
  @Input('maintTranslations') maintTranslations:TranslationTable = [];
  @Input('allTranslations') allTranslations:TranslationTable = [];
  @Input('mode') mode:"Add"|"Edit" = "Edit";
  @Output('close') close:EventEmitter<any> = new EventEmitter();
  @Output('cancel') cancel:EventEmitter<any> = new EventEmitter();
  public title         : string = "Translation Editor"         ;
  public visible       : boolean        = true                 ;
  public panelClosable : boolean        = false                ;
  public panelESCable  : boolean        = false                ;
  // public mode          : "Add"|"Edit"   = "Edit"               ;
  public dialogLeft    : number         = 250                  ;
  public dialogTop     : number         = 100                  ;
  public header        : string         = "Translation Editor" ;
  public dirty         : boolean        = false                ;
  public modalMode     : boolean        = false                ;
  public debounceTime  : number         = 750                  ;
  public timer         : MomentTimer                           ;
  public dataReady     : boolean        = false                ;
  public backupRecord  : TranslationTableRecord                ;
  public maint_types   : SelectItem[]   = [
    { label: "(NONE)"          , value: null              , },
    { label: "Mechanical Noun" , value: "mechanical_noun" , },
    { label: "Electronic Noun" , value: "electronic_noun" , },
    { label: "Verb (Action)"   , value: "verb"            , },
  ];
  public langKeys      : string[]       = ['en', 'es'];
  public htmlModes     : {
    [langKey in TranslationLanguage]:boolean;
  } = {
    en: false,
    es: false,
  };
  public htmlMode      : boolean        = false                ;
  public modelChanged  : Subject<string> = new Subject<string>();
  public textSub       : Subscription;
  // public moment         : any            = moment              ;
  public editorStyle   : any = { height: '250px' }             ;
  public autoResize    : boolean        = true                 ;
  public recordIndex   : number         = 0                    ;
  public get recordCount():number { return this.translations && this.translations.length ? this.translations.length : 0; }

  constructor(
    public viewCtrl  : ViewController  ,
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public notify    : NotifyService   ,
    public dispatch  : DispatchService ,
    public db        : DBService       ,
    public server    : ServerService   ,
    public alert     : AlertService    ,
    public data      : OSData          ,
  ) {
    window['onsitetranslationeditor']  = this;
    // window['onsitemessages2'] = this;
    window['p2'] = this;
  }

  ngOnInit() {
    Log.l('TranslationEditor: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l('TranslationEditor: ngOnDestroy() fired');
    this.cancelSubscriptions();
  }

  public async runWhenReady() {
    try {
      this.initializeSubscriptions();
      this.storeRecord();
      this.updateDisplay();
      this.dataReady = true;
      this.setPageLoaded();
    } catch(err) {
      Log.l("TranslationEditor.runWhenReady(): Error loading translation editor!");
      Log.e(err);
      // this.alert.showAlert("ERROR", "Error getting existing messages:<br>\n<br>\n" + err.message);
    }
  }

  public initializeSubscriptions() {
    // this.modelChanged.debounceTime(this.debounceTime)
    this.textSub = this.modelChanged.pipe(debounceTime(this.debounceTime), distinctUntilChanged()).subscribe(data => {
      Log.l(`TranslationEditor: Model changed and debounce time elapsed. Data:`, data);
    });
  }

  public cancelSubscriptions() {
    if(this.textSub && !this.textSub.closed) {
      this.textSub.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public setDialogTitle():string {
    let record  = this.record;
    let records = this.translations;
    let idx   = records.indexOf(record);
    let mode  = this.mode || "Edit";
    this.recordIndex = idx + 1;
    this.title =  `${mode} Translation (${this.recordIndex} / ${this.recordCount})`;
    this.header =  this.title;
    return this.header;
  }

  public updateDisplay() {
    this.setDialogTitle();
    this.htmlMode = false;
    for(let key of this.langKeys) {
      let value = this.record[key];
      let isHTML = this.isStringHTML(value);
      if(isHTML) {
        this.htmlMode = true;
        break;
      }
      // this.htmlModes[key] = isHTML;
      // this.htmlMode[key] = isHTML;
    }
  }

  public storeRecord():TranslationTableRecord {
    let doc:TranslationTableRecord = oo.clone(this.record);
    this.backupRecord = doc;
    return doc;
  }

  public revertRecord():TranslationTableRecord {
    let doc:TranslationTableRecord = this.backupRecord;
    let existingDoc:TranslationTableRecord = oo.clone(this.record);
    this.record = doc;
    this.backupRecord = null;
    // this.backupRecord = existingDoc;
    return this.record;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

  public textChanged(key:TranslationTableRecordKey, value:string, element?:any, event?:any) {
    // Log.l(`TranslationEditor.textChanged(): Key:`, key);
    // Log.l(`TranslationEditor.textChanged(): Value:`, value);
    // Log.l(`TranslationEditor.textChanged(): Element:`, element);
    // Log.l(`TranslationEditor.textChanged(): Event:`, event);
    // window['onsiteelement1'] = element;
    this.modelChanged.next(value);
    // if(this.timer) {
    //   this.timer.clearTimer();
    // }
    // // Log.l(`TranslationEditor.textChanged(): Event is:`, event);
    // this.timer = moment.duration(this.debounceTime).timer(() => {
    //   // Log.l(`TranslationEditor.textChanged(): Timeout, running function. Event is:`, event);
    //   // let text:string = event.textValue;
    //   // let html:string = event.htmlValue;
    //   // let delta = event.delta;
    //   Log.l(`TranslationEditor.textChanged(): Key:`, key);
    //   Log.l(`TranslationEditor.textChanged(): Value:`, value);
    //   Log.l(`TranslationEditor.textChanged(): Element:`, element);
    //   Log.l(`TranslationEditor.textChanged(): Event:`, event);
    //   window['onsiteelement1'] = element;
    //   this.dirty = true;
    // });
  }
  
  public updateMaintenanceType(type:MaintenanceTaskType, event?:any) {
    Log.l(`TranslationEditor.updateMaintenanceType(): type is '${type}', event is:`, event);
    if(!type) {
      Log.l(`TranslationEditor.updateMaintenanceType(): Type was null.`);
      // let idx1 = this.allTranslations.indexOf(this.record);
      let idx = this.maintTranslations.indexOf(this.record);
      if(idx > -1) {
        Log.l(`TranslationEditor.updateMaintenanceType(): translation has to be removed from maintenance translations`);
        this.maintTranslations.splice(idx, 1);
      }
    } else {
      Log.l(`TranslationEditor.updateMaintenanceType(): Type was NOT null.`);
      let idx2 = this.maintTranslations.indexOf(this.record);
      if(idx2 === -1) {
        Log.l(`TranslationEditor.updateMaintenanceType(): translation has to be added to maintenance translations`);
        this.maintTranslations.push(this.record);
      }
      // if(idx1 === -1) {
      //   this.allTranslations.push(this.record);
      // }
    }
    this.dirty = true;
  }

  public isStringHTML(text:string):boolean {
    let doc = new DOMParser().parseFromString(text, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }

  public stripTrivialHTML(text:string):string {
    if(text.startsWith('<p>') && text.endsWith('</p>')) {
      let len = text.length;
      let stripped = text.slice(3, len - 4);
      if(this.isStringHTML(stripped)) {
        return text;
      } else {
        return stripped;
      }
    } else {
      return text;
    }
  }

  public async addTranslation(evt?:Event):Promise<any> {
    try {
      Log.l(`TranslationEditor.addTranslation(): Called …`);
      let record:TranslationTableRecord;
      let row:any = {};
      row.key = "";
      let langKeys = ['en', 'es'];
      for(let langKey of langKeys) {
        row[langKey] = "";
      }
      record = row;
      this.translations.push(record);
      this.recordIndex = this.translations.length;
      this.record = this.translations[this.recordIndex - 1];
      this.dirty = true;
      this.mode = 'Add';
      this.updateDisplay();
      // return res;
    } catch(err) {
      Log.l(`TranslationEditor.addTranslation(): Error adding new translation`);
      Log.e(err);
      throw err;
    }
  }

  public async deleteTranslation(evt?:Event):Promise<any> {
    try {
      Log.l(`TranslationEditor.deleteTranslation(): Called …`);
      let title = "DELETE TRANSLATION";
      let text = "Do you want to delete this translation record? This cannot be undone except by adding the translation again.";
      let confirm = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        let record:TranslationTableRecord = this.record;
        let idx1:number = this.allTranslations.indexOf(record);
        if(idx1 > -1) {
          let deleted = this.allTranslations.splice(idx1, 1)[0];
          window['onsitedeletedtranslation'] = deleted;
        }
        let idx2 = this.translations.indexOf(record);
        if(idx2 > -1) {
          let deleted2 = this.translations.splice(idx2, 1)[0];
          window['onsitedeletedtranslation2'] = deleted2;
        }
        try {
          await this.saveTranslations();
        } catch(err) {
          Log.l(`TranslationEditor.deleteTranslation(): Error saving deletion`);
          Log.e(err);
          let title = "DATABASE ERROR";
          let text  = "Error while saving this deletion to the database";
          await this.alert.showErrorMessage(title, text, err);
          return;
        }
        if(this.recordIndex > 1) {
          this.recordIndex = this.recordIndex--;
          this.dirty = false;
          this.record = this.translations[this.recordIndex - 1];
          this.mode = 'Edit';
          this.updateDisplay();
          this.storeRecord();
        } else {
          this.addTranslation();
        }
      }
      // return res;
    } catch(err) {
      Log.l(`TranslationEditor.deleteTranslation(): Error deleting translation`);
      Log.e(err);
      throw err;
    }
  }

  public async showOptions(evt?:Event):Promise<any> {
    try {
      // Log.l(`showOptions(): Called with arguments:\n`, arguments);
      Log.l(`TranslationEditor.showOptions(): Called …`);

      // return res;
    } catch(err) {
      Log.l(`TranslationEditor.showOptions(): Error showing options for Translation Editor page`);
      Log.e(err);
      throw err;
    }
  }

  public async previous(evt?:Event):Promise<any> {
    try {
      let row = this.record;
      if(this.recordIndex > 1) {
        if(this.dirty || this.mode === 'Add') {
          let confirm:number = await this.alert.showConfirmYesNoCancel("UNSAVED CHANGES", "You made changes but have not saved them. Save changes first?");
          if(confirm === 0) {
            return;
          }
          if(confirm === 1) {
            await this.saveNoExitClicked(evt);
          } else if(confirm === -1) {
            if(this.mode === 'Add') {
              this.inplaceFilter(row, this.allTranslations);
              this.inplaceFilter(row, this.maintTranslations);
            } else {
              this.revertRecord();
            }
          }
        }
        this.recordIndex--;
        this.record = this.translations[this.recordIndex - 1];
        this.mode = 'Edit';
        this.updateDisplay();
        this.storeRecord();
      }
    } catch(err) {
      Log.l(`TranslationEditor.previous(): Error during move to previous record`);
      Log.e(err);
      throw err;
    }
  }

  public async next(evt?:Event):Promise<any> {
    try {
      let row = this.record;
      if(this.recordIndex < this.recordCount) {
        if(this.dirty || this.mode === 'Add') {
          let confirm:number = await this.alert.showConfirmYesNoCancel("UNSAVED CHANGES", "You made changes but have not saved them. Save changes first?");
          if(confirm === 0) {
            return;
          }
          if(confirm === 1) {
            await this.saveNoExitClicked(evt);
          } else if(confirm === -1) {
            if(this.mode === 'Add') {
              this.inplaceFilter(row, this.allTranslations);
              this.inplaceFilter(row, this.maintTranslations);
            } else {
              this.revertRecord();
            }
          }
        }
        this.recordIndex++;
        this.record = this.translations[this.recordIndex - 1];
        this.mode = 'Edit';
        this.updateDisplay();
        this.storeRecord();
      }
    } catch(err) {
      Log.l(`TranslationEditor.next(): Error during move to next record`);
      Log.e(err);
      throw err;
    }
  }

  public noPrevious(evt?:Event) {
    this.notify.addWarn("ALERT", `No previous translation.`, 3000);
    // this.alert.showAlert("START OF SITES", "Can't go to previous work site. Already at start of list.");
  }

  public noNext() {
    this.notify.addWarn("ALERT", `No next work site.`, 3000);
    // this.alert.showAlert("END OF SITES", "Can't go to next work site. Already at end of list.");
  }

  public inplaceFilter(row:TranslationTableRecord, table:TranslationTable):TranslationTable {
    if(Array.isArray(table)) {
      let idx = table.indexOf(row);
      if(idx > -1) {
        table.splice(idx, 1);
      }
    }
    return table;
  }

  public overwriteRecord(src:TranslationTableRecord, dest:TranslationTableRecord, table?:TranslationTable):TranslationTableRecord {
    if(src && dest && src !== dest && typeof src === 'object' && typeof dest === 'object') {
      let srcKeys = Object.keys(src);
      let destKeys = Object.keys(dest);
      for(let srcKey of srcKeys) {
        dest[srcKey] = src[srcKey];
      }
      for(let destKey of destKeys) {
        if(!srcKeys.includes(destKey)) {
          delete dest[destKey];
        }
      }
    } else {
      let text = `TranslationEditor.cancelClicked(): overwriteRecord(): Must provide two object parameters. Invalid parameter(s)`;
      Log.w(text + ":", src, dest);
      let err = new Error(text);
      throw err;
    }
    return dest;
  }

  public async cancelClicked(evt?:Event):Promise<any> {
    try {
      // let msg = this.message;
      // if((msg.text && msg.text.length > 0) || (msg.textES && msg.textES.length > 0)) {
      let row = this.record;
      if(this.mode === 'Add') {
        if(this.dirty) {
          let confirm:boolean = await this.alert.showConfirm("CANCEL", "Do you really want to cancel? You will lose any changes you've made.");
          if(confirm) {
            this.inplaceFilter(row, this.allTranslations);
            this.inplaceFilter(row, this.maintTranslations);
          }
        } else {
          this.inplaceFilter(row, this.allTranslations);
          this.inplaceFilter(row, this.maintTranslations);
        }
      } else {
        if(this.dirty) {
          let confirm:boolean = await this.alert.showConfirm("CANCEL", "Do you really want to cancel? You will lose any changes you've made.");
          if(confirm) {
            let backup = this.backupRecord;
            this.overwriteRecord(backup, this.record);
            this.dirty = false;
          }
        } else {
          this.dirty = false;
        }
      }
      this.close.emit(this.translations);
    } catch(err) {
      Log.l(`TranslationEditor.cancelClicked(): Error during cancel of translation edit`);
      Log.e(err);
      throw err;
    }
  }

  public async saveClicked(evt?:Event):Promise<any> {
    let spinnerID;
    try {
      // let document:TranslationDocument = new Object();
      // let translationRecord:TranslationRecord = {};
      // document._id = 'onsitex';
      // let keys:string[] = [];
      // let langKeys = Object.keys(this.record);
      // document.keys = langKeys;
      // for(let record of this.translations) {
      //   let key = record.key;
      //   let transArray = [];
      //   for(let key of langKeys) {
      //     transArray.push(this.record[key]);
      //   }
      //   translationRecord[key] = transArray;
      // }
      // document.translations = translationRecord;
      // let res = await this.server.saveTranslations(this.translations);
      spinnerID = await this.alert.showSpinnerPromise('Saving translations …');
      let res = await this.saveTranslations(evt);
      await this.alert.hideSpinnerPromise(spinnerID);
      this.close.emit(this.translations);
      return res;
    } catch(err) {
      Log.l(`TranslationEditor.saveClicked(): Error during save of translation edit`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async saveNoExitClicked(evt?:Event):Promise<any> {
    let spinnerID;
    try {
      // let document:TranslationDocument = new Object();
      // let translationRecord:TranslationRecord = {};
      // document._id = 'onsitex';
      // let keys:string[] = [];
      // let langKeys = Object.keys(this.record);
      // document.keys = langKeys;
      // for(let record of this.translations) {
      //   let key = record.key;
      //   let transArray = [];
      //   for(let key of langKeys) {
      //     transArray.push(this.record[key]);
      //   }
      //   translationRecord[key] = transArray;
      // }
      // document.translations = translationRecord;
      // let res = await this.server.saveTranslations(this.translations);
      spinnerID = await this.alert.showSpinnerPromise('Saving translations …');
      let res = await this.saveTranslations(evt);
      await this.alert.hideSpinnerPromise(spinnerID);
      this.mode = 'Edit';
      this.dirty = false;
      return res;
    } catch(err) {
      Log.l(`TranslationEditor.saveClicked(): Error during save of translation edit`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async saveTranslations(evt?:Event):Promise<any> {
    try {
      let table = this.translations;
      let maint = this.maintTranslations;
      let allTable = this.allTranslations;
      if(Array.isArray(table) && table.length && Array.isArray(maint) && maint.length) {
        let res:any;
        if(this.record && this.record.maint_type) {
          // res = await this.server.saveTranslations(allTable, table);
          res = await this.server.saveTranslations(allTable, maint);
          this.mode = 'Edit';
          this.dirty = false;
          return res;
        } else {
          // res = await this.server.saveTranslations(table);
          res = await this.server.saveTranslations(allTable, maint);
          this.mode = 'Edit';
          this.dirty = false;
          return res;
        }
      }
    } catch(err) {
      Log.l(`TranslationEditor.saveTranslations(): Error during save of translation edit`);
      Log.e(err);
      throw err;
    }
  }
}

