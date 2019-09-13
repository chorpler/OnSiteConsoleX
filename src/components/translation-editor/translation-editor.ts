import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core'              ;
import { Input, Output, EventEmitter,                        } from '@angular/core'              ;
import { IonicPage, NavController, NavParams                 } from 'ionic-angular'              ;
import { ViewController                                      } from 'ionic-angular'              ;
import { Log, Moment, moment, isMoment                       } from 'domain/onsitexdomain'       ;
import { Employee, Message                                   } from 'domain/onsitexdomain'       ;
import { DBService, TranslationDocument, TranslationRecord, TranslationTableRecordKey, TranslationLanguage                                           } from 'providers/db-service'       ;
import { TranslationTable, TranslationTableRecord            } from 'providers/db-service'       ;
import { ServerService                                       } from 'providers/server-service'   ;
import { AlertService                                        } from 'providers/alert-service'    ;
import { OSData                                              } from 'providers/data-service'     ;
import { Editor                                              } from 'primeng/editor'             ;
import { Listbox                                             } from 'primeng/listbox'            ;
import { SelectItem                                          } from 'primeng/api'                ;
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
})
export class TranslationEditor implements OnInit,OnDestroy {
  @Input('record') record:TranslationTableRecord;
  @Input('translations') translations:TranslationTable;
  @Output('close') close:EventEmitter<any> = new EventEmitter();
  @Output('cancel') cancel:EventEmitter<any> = new EventEmitter();
  public title         : string = "Translation Editor"         ;
  public visible       : boolean        = true                 ;
  public panelClosable : boolean        = false                ;
  public panelESCable  : boolean        = false                ;
  public mode          : "Add"|"Edit"   = "Edit"               ;
  public dialogLeft    : number         = 250                  ;
  public dialogTop     : number         = 100                  ;
  public header        : string         = "Translation Editor" ;
  public dirty         : boolean        = false                ;
  public modalMode     : boolean        = false                ;
  public dataReady     : boolean        = false                ;
  public langKeys      : string[]       = ['en', 'es']         ;
  public htmlModes     : {
    [langKey in TranslationLanguage]:boolean;
  } = {
    en: false,
    es: false,
  };
  public htmlMode      : boolean        = false                ;
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
  }

  public async runWhenReady() {
    try {
      this.updateDisplay();
      this.dataReady = true;
      this.setPageLoaded();
    } catch(err) {
      Log.l("TranslationEditor.runWhenReady(): Error loading translation editor!");
      Log.e(err);
      // this.alert.showAlert("ERROR", "Error getting existing messages:<br>\n<br>\n" + err.message);
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

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

  public textChanged(key:TranslationTableRecordKey, event?:any) {
    let text:string = event.textValue;
    let html:string = event.htmlValue;
    let delta = event.delta;
    Log.l(`TranslationEditor.textChanged(): Event is:`, event);
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

  public previous(evt?:Event) {
    if(this.recordIndex > 1) {
      this.recordIndex--;
      this.record = this.translations[this.recordIndex - 1];
      this.mode = 'Edit';
      this.updateDisplay();
    }
  }

  public next(evt?:Event) {
    if(this.recordIndex < this.recordCount) {
      this.recordIndex++;
      this.record = this.translations[this.recordIndex - 1];
      this.mode = 'Edit';
      this.updateDisplay();
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



  public async cancelClicked(evt?:Event):Promise<any> {
    try {
      // let msg = this.message;
      // if((msg.text && msg.text.length > 0) || (msg.textES && msg.textES.length > 0)) {
      if(this.dirty) {
        let confirm:boolean = await this.alert.showConfirm("CANCEL", "Do you really want to cancel? You will lose any changes you've made.");
        if(confirm) {
          this.dirty = false;
          this.close.emit(this.translations);
        }
      } else {
        this.dirty = false;
        this.close.emit(this.translations);
      }
    } catch(err) {
      Log.l(`TranslationEditor.cancelClicked(): Error during cancel of translation edit`);
      Log.e(err);
      throw err;
    }
  }

  public async saveClicked(evt?:Event):Promise<any> {
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
      let res = await this.server.saveTranslations(this.translations);
      this.close.emit(this.translations);
      return res;
    } catch(err) {
      Log.l(`TranslationEditor.saveClicked(): Error during save of translation edit`);
      Log.e(err);
      throw err;
    }
  }

  public async saveNoExitClicked(evt?:Event):Promise<any> {
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
      let res = await this.server.saveTranslations(this.translations);
      this.mode = 'Edit';
      this.dirty = false;
      return res;
    } catch(err) {
      Log.l(`TranslationEditor.saveClicked(): Error during save of translation edit`);
      Log.e(err);
      throw err;
    }
  }
}

