import 'rxjs/add/operator/map'                                                 ;
import { Injectable                        } from '@angular/core'        ;
import { Platform                          } from 'ionic-angular'        ;
import { Storage,                          } from '@ionic/storage'       ;
import { Log, moment, Moment, isMoment, oo } from 'domain/onsitexdomain' ;

@Injectable()
export class StorageService {

  remote      : any      ;
  options     : any      ;
  docId       : string   ;
  profileDoc  : any      ;
  settingsDoc : any      ;

  constructor(
    public storage : Storage,
    public platform: Platform,
  ) {
    window['onsitestorageservice'] = this;
  }

  persistentSave(key:string, value:any) {
    return new Promise((resolve,reject) => {
      this.storage.set(key, value).then((res) => {
        resolve(res);
      }).catch((err) => {
        Log.e("Error saving credentials in local storage!");
        Log.e(err);
        reject(err);
      });
    });
  }

  persistentSet(key:string, value:any) {
    return this.persistentSave(key, value);
  }

  persistentGet(key:string) {
    return new Promise((resolve,reject) => {
      this.storage.get(key).then((value) => {
        if(value) {
          Log.l("persistentGet(): Got:\n", value);
          resolve(value);
        } else {
          Log.l(`persistentGet(): key '${key}' not found in local storage!`);
          resolve(null);
        }
      }).catch((err) => {
        Log.e(`persistentGet(): Error retrieving '${key}' from local storage!`);
        Log.e(err);
        reject(err);
      });
    });
  }

  persistentDelete(key:string) {
    return new Promise((resolve,reject) => {
      this.storage.remove(key).then((value) => {
        if(value) {
          resolve(value);
        } else {
          Log.w(`persistentDelete(): key '${key}' not found in local storage!`);
          resolve(true);
        }
      }).catch((err) => {
        Log.e(`persistentDelete(): Error trying to delete '${key}' from local storage!`);
        Log.e(err);
        reject(err);
      });
    });
  }

  persistentClear() {
    return new Promise((resolve,reject) => {
      this.storage.clear().then(res => {
        Log.l(`persistentClear(): Local storage cleared.`);
        resolve(true);
      }).catch((err) => {
        Log.e(`persistentClear(): Error trying to clear local storage!`);
        Log.e(err);
        reject(err);
      });
    });
  }
}
