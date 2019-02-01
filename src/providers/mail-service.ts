import { Injectable } from '@angular/core';
// import { Log, Moment, moment } from 'domain/onsitexdomain';
import { Message } from 'domain/onsitexdomain';
import { OSData } from './data-service';
// import { AlertService } from './alert-service';

@Injectable()
export class MailService {
  public messages:Array<Message> = [];
  constructor(public data:OSData) {
    window['onsitemailservice'] = this;
  }

}
