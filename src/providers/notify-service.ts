import { Injectable           } from '@angular/core'        ;
import { Log                  } from 'domain/onsitexdomain' ;
import { Notice               } from 'domain/onsitexdomain' ;
import { Subject, Observable, } from 'rxjs'                 ;
import { MessageService       } from 'primeng/api'                   ;

type MessageSeverity = "success" | "info" | "warn" | "error";

@Injectable()
export class NotifyService {
  // private messageSource = new Subject<Notice|Notice[]>();
  private messageSource = new Subject<Notice>();
  public messageObserver = this.messageSource.asObservable();
  public messages:Notice[] = [];

  constructor(
    public toast : MessageService ,
  ) {
    Log.l(`Hello NotifyService provider`);
    window['onsitenotifyservice'] = this;
  }

  public add(message:Notice) {
    // if(message) {
    //   this.messages.push(message);
    //   this.messageSource.next(message);
    // }
    this.toast.add(message);
  }

  public addMessage(summary:string, details:string, severity?:MessageSeverity, life?:number) {
    let severityLevel:MessageSeverity = typeof severity === 'string' ? severity : 'info';
    let timeoutValue = life ? life : 3000;
    let msg:Notice = {severity: severityLevel, summary: summary, detail: details, life: timeoutValue, closable: true, sticky: false };
    this.add(msg);
  }

  public addSuccessMessage(summary:string, details:string, life?:number) {
    let severityLevel:MessageSeverity = 'success';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addWarningMessage(summary: string, details: string, life?: number) {
    let severityLevel:MessageSeverity = 'warn';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addInfoMessage(summary: string, details: string, life?: number) {
    let severityLevel:MessageSeverity = 'info';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addErrorMessage(summary: string, details: string, life?: number) {
    let severityLevel:MessageSeverity = 'error';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addMessages(messages:Notice[]) {
    if (messages && messages.length) {
      for(let message of messages) {
        this.messageSource.next(message);
      }
    }
  }
  // public addSuccess(summary: string, details: string, life?: number) {
  //   this.addSuccessMessage(summary, details, life);
  // }

  public addSuccess = this.addSuccessMessage;
  public addWarning = this.addWarningMessage;
  public addWarn    = this.addWarningMessage;
  public addInfo    = this.addInfoMessage;
  public addError   = this.addErrorMessage;
  public addAll     = this.addMessages;


  public clear() {
    // this.messages = [];
    this.messageSource.next(null);
  }

  public empty() {
    this.messages = [];
    this.messageSource.next(null);
  }
}
