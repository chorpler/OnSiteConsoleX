import { Injectable            } from '@angular/core'              ;
import { Log, Moment, isMoment } from 'domain/onsitexdomain' ;
import { NumberService         } from './number-service'           ;

@Injectable()
export class OnSiteConsoleLibrary {

  public constructor() {
    window['consolelibrary'] = this;
  }

  public numberToWords(value:number|string) {
    // return numberToWords.toWords(value);
  }
}

