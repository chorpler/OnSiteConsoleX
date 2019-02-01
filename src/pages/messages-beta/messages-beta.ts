import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core'              ;
import { IonicPage, NavController, NavParams                 } from 'ionic-angular'              ;
import { ViewController                                      } from 'ionic-angular'              ;
import { Log, Moment, moment, isMoment                       } from 'domain/onsitexdomain'       ;
import { Employee, Message                                   } from 'domain/onsitexdomain'       ;
import { DBService                                           } from 'providers/db-service'       ;
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

@IonicPage({ name: 'Messages Beta' })
@Component({
  selector: 'page-messages-beta',
  templateUrl: 'messages-beta.html',
})
export class MessagesBetaPage implements OnInit,OnDestroy {
  @ViewChild('inputSubject') inputSubject:ElementRef;
  @ViewChild('inputSubjectES') inputSubjectES:ElementRef;
  @ViewChild('inputDuration') inputDuration:ElementRef;
  @ViewChild('messageTextEditorEn') messageTextEditorEn:Editor;
  @ViewChild('messageTextEditorEs') messageTextEditorEs:Editor;
  @ViewChild('messagesListbox') messagesListbox:Listbox;
  public title          : string = "Messages"      ;
  public employee       : Employee                 ;
  public allEmployees   : Employee[]     = []      ;
  public toEmployees    : Employee[]     = []      ;
  public messageDate    : Date                     ;
  public messageList    : SelectItem[]   = []      ;
  public employeeList   : SelectItem[]   = []      ;
  public currentMessage : Message                  ;
  public message        : Message                  ;
  public messages       : Message[]      = []      ;
  public dirty          : boolean        = false   ;
  public modalMode      : boolean        = false   ;
  public dataReady      : boolean        = false   ;
  // public moment         : any            = moment  ;
  public editorStyle    : any = { height: '250px' };

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
    window['onsitemessages']  = this;
    // window['onsitemessages2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l('MessagesPage: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.initializeMessages();
    }
  }

  ngOnDestroy() {
    Log.l('MessagesPage: ngOnDestroy() fired');
  }

  public async initializeMessages() {
    try {
      if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
      this.newMessage();
      let res:Array<Message> = await this.server.getMessages();
      this.messages = res.sort(_sortMessages);
      this.allEmployees = this.data.getData('employees').slice(0).filter((a:Employee) => {
        return a.active;
      }).sort(_sortEmployees);
      this.generateMenus();
      this.dataReady = true;
      this.setPageLoaded();
      this.focusOnSubject();
    } catch(err) {
      Log.l("initializeMessages(): Error getting messages list!");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error getting existing messages:<br>\n<br>\n" + err.message);
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

  public moment(value:Date|Moment):Moment {
    let mo:Moment = moment(value);
    return mo;
  }

  public generateMenus() {
    let messagesList:SelectItem[] = [];
    let employeeList:SelectItem[] = [];
    for(let message of this.messages) {
      let item:SelectItem = { label: message._id, value: message };
      messagesList.push(item);
    }
    for(let employee of this.allEmployees) {
      let item:SelectItem = { label: employee.getFullName(), value: employee };
      employeeList.push(item);
    }
    this.messageList = messagesList;
    this.employeeList = employeeList;
  }

  public newMessage() {
    let message:Message = new Message();
    let user:Employee = this.data.getUser();
    this.employee = user;
    message.from = user ? this.employee.getFullNameNormal() : "";
    let now:Moment = moment();
    message.date = now.format("YYYY-MM-DD");
    message.duration = 7;
    this.messageDate = now.toDate();
    this.message = message;
    this.currentMessage = message;
    this.focusOnSubject();
  }

  public focusOnSubject() {
    if (this.inputSubject) {
      setTimeout(() => {
        this.inputSubject.nativeElement.focus();
      }, 400);
    }
  }

  // public openMessage(message:Message) {
  //   this.message = message;
  // }

  public async openMessage(evt?:any) {
    Log.l(`openMessage(): Event is:\n`, evt);
    try {
      let event = evt['originalEvent'];
      let value:Message = evt.value;
      if(this.dirty) {
        let confirm:boolean = await this.alert.showConfirmYesNo("MESSAGE CHANGED", `Do you want to load a new message? You have made changes to this message that will be lost!`);
        if(confirm) {
          this.dirty = false;
          this.message = value;
          let date:string = this.message.date;
          this.messageDate = moment(date, "YYYY-MM-DD").toDate();
        } else {

        }
      } else {
        this.dirty = false;
        this.message = value;
        let date:string = this.message.date;
        this.messageDate = moment(date).toDate();
      }
    } catch(err) {
      Log.l(`(): Error opening message!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error opening message: '${err.message}'`, 5000);
      // throw new Error(err);
    }
  }

  public updateFromDate(event:any) {
    Log.l("updateFromDate(): Event passed is:\n", event);
    // let fromDate = moment(event).format("YYYY-MM-DD");
    let msgDate = moment(this.messageDate);
    let date:string = msgDate.format("YYYY-MM-DD");
    this.message.date = date;
  }

  public textChanged(event?:any) {
    let text:string = event.textValue;
    let html:string = event.htmlValue;
    let delta = event.delta;
    Log.l(`textChanged(): Event is:\n`, event);
    this.dirty = true;
  }

  public updateToList(evt:any) {
    let event = evt.originalEvent;
    let value:Array<Employee> = evt.value;
    let itemValue:Employee = evt.itemValue;
    if(value && value.length > 0) {
      let usernames:string[] = value.map((a:Employee) => a.getUsername());
      this.message.to = usernames;
    } else {
      this.message.to = null;
    }
  }

  public async postMessage(evt?:any) {
    try {
      let msg = this.message, text = msg.text, textES = msg.textES, subj = msg.subject, subjES = msg.subjectES, dur = msg.duration;
      let alert:string = "";
      let missingErrorDuration:number = 4000;
      Log.l(`postMessage(): Checking for missing elements...`);
      if(!text) {
        this.notify.addError("MISSING", `The message text is empty!`, missingErrorDuration);
        this.messageTextEditorEn.getQuill().focus();
      } else if(!textES) {
        this.notify.addError("MISSING", `The Spanish text is empty!`, missingErrorDuration);
        this.messageTextEditorEs.getQuill().focus();
      } else if(!subj) {
        this.notify.addError("MISSING", `The message subject is empty!`, missingErrorDuration);
        this.inputSubject.nativeElement.focus();
      } else if(!subjES) {
        this.notify.addError("MISSING", `The Spanish subject is empty!`, missingErrorDuration);
        this.inputSubjectES.nativeElement.focus();
      } else if(!dur || dur < 0) {
        this.notify.addError("INVALID DURATION", "The duration is missing or invalid!", missingErrorDuration);
        this.inputDuration.nativeElement.focus();
      } else {
        Log.l(`postMessage(): No missing message elements. Posting message.`);
        let res:any = await this.server.saveMessage(this.message, this.employee);
        Log.l("postMessage(): Success!");
        this.messages.push(this.message);
        this.messages = this.messages.sort(_sortMessages);
        this.generateMenus();
        this.dirty = false;
        this.notify.addSuccess("SUCCESS", `Successfully posted message to all users.`, 3000);
        // return res;
      }
    } catch(err) {
      Log.l(`postMessage(): Error posting message to users!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving message: '${err.message}'`, 5000);
    }
  }

  public focusOn(item:ElementRef) {
    setTimeout(() => {
      item.nativeElement.focus();
    }, 400);
  }

  public async showOptions(evt?:Event):Promise<any> {
    try {
      // Log.l(`showOptions(): Called with arguments:\n`, arguments);
      Log.l(`MessagesBeta.showOptions(): Called ...`);

      // return res;
    } catch(err) {
      Log.l(`MessagesBeta.showOptions(): Error showing options for Messages page`);
      Log.e(err);
      throw err;
    }
  }



  public async cancel() {
    try {
      // let msg = this.message;
      // if((msg.text && msg.text.length > 0) || (msg.textES && msg.textES.length > 0)) {
      if(this.dirty) {
        let confirm:boolean = await this.alert.showConfirm("CANCEL", "Do you really want to cancel the current message? You will lose the text you've entered.");
        if(confirm) {
          this.dirty = false;
          this.newMessage();
        }
      } else {
        this.dirty = false;
        this.newMessage();
      }
    } catch(err) {
      Log.l(`cancel(): Error during cancel of message.`);
      Log.e(err);
      throw new Error(err);
    }
  }
}
