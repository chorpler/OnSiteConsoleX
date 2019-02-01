import { Injectable } from '@angular/core'        ;
import { Observable } from 'rxjs'                 ;
import { Log        } from 'domain/onsitexdomain' ;

@Injectable()
export class Readify {
  public ready:Observable<boolean>;
  public signal:any;
  public signalObserver:any;
  public watcher:any;
  constructor() {
    Log.l('Hello ReadifyProvider Provider');
  }

  getObservable() {
    this.signal = Observable.create(observer => { this.watcher = observer;});
    return this.signal;
  }

  fireObservable() {
    this.watcher.next(true);
  }


  getSubscribe(_fn) {
    this.watcher = this.signal.subscribe(_fn)
    return this.watcher;
  }

}
