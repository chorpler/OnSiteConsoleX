// import 'rxjs/add/operator/map'                                                 ;
// import { Storage             } from '@ionic/storage'       ;
import { Injectable          } from '@angular/core'        ;
import { Platform            } from 'ionic-angular'        ;
import { Log                 } from 'domain/onsitexdomain' ;
import { LocalStorageService } from 'ngx-store'            ;


@Injectable()
export class StorageService {
  // public remote      : any      ;
  // public options     : any      ;
  // public docId       : string   ;
  // public profileDoc  : any      ;
  // public settingsDoc : any      ;

  constructor(
    // public storage  : Storage             ,
    public storage  : LocalStorageService ,
    public platform : Platform            ,
  ) {
    window['onsitestorageservice'] = this;
  }

  public async persistentSave(key:string, value:any):Promise<any> {
    try {
      let res = this.storage.set(key, value);
      return res;
    } catch(err) {
      Log.l(`StorageService.persistentSave(): Error saving to localstorage`);
      Log.e(err);
      throw err;
    }
  }

  public async persistentSet(key:string, value:any):Promise<any> {
    try {
      let res = this.persistentSave(key, value);
      return res;
    } catch(err) {
      Log.l(`StorageService.persistentGet(): Error getting `);
      Log.e(err);
      throw err;
    }
  }

  public async persistentGet(key:string):Promise<any> {
    try {
      let value = this.storage.get(key);
      if(value) {
        Log.l(`StorageService.persistentGet('${key}'): got value:`, value);
        return value;
      } else {
        Log.l(`StorageService.persistentGet(): key '${key}' not found in local storage!`);
        return null;;
      }
    } catch(err) {
      Log.l(`StorageService.persistentGet(): Error getting key ${key} from localstorage`);
      Log.e(err);
      throw err;
    }
  }

  public async persistentDelete(key:string):Promise<boolean> {
    try {
      this.storage.remove(key);
      return true;
    } catch(err) {
      Log.l(`StorageService.persistentDelete(): Error deleting key ${key} from localstorage`);
      Log.e(err);
      throw err;
    }
  }

  public async persistentClear():Promise<boolean> {
    try {
      this.storage.clear();
      Log.l(`StorageService.persistentClear(): Local storage cleared.`);
      return true;
    } catch(err) {
      Log.l(`StorageService.persistentClear(): Error clearing localstorage`);
      Log.e(err);
      throw err;
    }
  }
}
