import { Injectable   } from '@angular/core'             ;
import { AlertService } from './alert-service'           ;
import { Log          } from 'domain/onsitexdomain';
import { Storage      } from '@ionic/storage'            ;

@Injectable()
export class AuthService {

  private username : string = ''                                       ;
  private password : string = ''                                       ;
  private ajaxOpts : any    = {ajax: { headers: { Authorization: ''}}} ;

  constructor(public alert: AlertService, public storage: Storage) {
    window["authserv"] = this;
    Log.l('Hello AuthServiceProvider Provider');
  }

  public setUser(user1:string):string {
    this.username = user1;
    Log.l(`setUser set user to ${this.username}`);
    // this.ajaxOpts = { ajax: { headers: { Authorization: 'Basic ' + window.btoa(this.username + ':' + this.password) } } };
    return this.username;
  }

  public setPass(pass1:string):string {
    this.password = pass1;
    Log.l(`setPassword set password to ${this.password}`);
    // this.ajaxOpts = { ajax: { headers: { Authorization: 'Basic ' + window.btoa(this.username + ':' + this.password) } } };
    return this.password;
  }

  public setUsername(username:string):string {
    return this.setUser(username);
  }

  public setPassword(password:string):string {
    return this.setPass(password);
  }

  public getUser():string {
    return this.username;
  }

  public getPass():string {
    return this.password;
  }

  public getUsername():string {
    return this.getUser();
  }

  public getPassword():string {
    return this.getPass();
  }

  public saveCredentials() {
    Log.l("Saving credentials...");
    return new Promise((resolve, reject) => {
      Log.l("saveCredentials(): SecureStorage not available, using Localstorage...");
      let userInfo = { username: this.username, password: this.password };
      Log.l("saveCredentials(): Saving credentials:\n", userInfo);
      this.storage.set('userInfo', userInfo).then((res) => {
        Log.l("Saved credentials to local storage.");
        Log.l(res); resolve(res);
      }).catch((err) => {
        Log.l("Error saving credentials in local storage!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getCredentials() {
    Log.l("Retrieving credentials...");
    return new Promise((resolve, reject) => {
      this.storage.get('userInfo').then((res) => {
        if (res != null) {
          Log.l("getCredentials(): Credentials retrieved from local storage!");
          Log.l(res);
          let userInfo = res;
          this.setUser(userInfo.username);
          this.setPassword(userInfo.password);
          resolve(userInfo);
        } else {
          Log.l("getCredentials(): Credentials not available.");
          let err = new Error("getCredentials(): Local credentials not found or are not available");
          reject(err);
        }
      }).catch((err) => {
        Log.l("getCredentials(): Error retrieving credentials from local storage!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public clearCredentials() {
    Log.l("Clearing credentials...");
    return new Promise((resolve, reject) => {
      Log.l("clearCredentials(): Running in a browser environment, using LocalStorage...");
      this.storage.remove('userInfo').then((res) => {
        Log.l("Cleared credentials from local storage.");
        Log.l(res);
        resolve(res);
      }).catch((err) => {
        Log.l("Error clearing credentials from local storage!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public areCredentialsSaved() {
    Log.l("areCredentialsSaved(): Checking status of saved credentials...");
    return new Promise((resolve, reject) => {
      Log.l("areCredentialsSaved(): SecureStorage not available, using Localstorage...");
      this.storage.get('userInfo').then((res) => {
        if(res != null && typeof res.username != 'undefined' && res.username != '') {
          Log.l("areCredentialsSaved(): Credentials retrieved from local storage!");
          Log.l(res);
          let userInfo = res;
          this.setUser(userInfo.username);
          this.setPassword(userInfo.password);
          resolve(true);
        } else {
          Log.l("areCredentialsSaved(): Returned null value, credentials not saved.\n", res);
          resolve(false);
        }
      }).catch((err) => {
        Log.l("areCredentialsSaved(): Error retrieving credentials from local storage!");
        Log.e(err);
        resolve(false);
      });
    });
  }

  public setLoginFlag() {
    Log.l("setLoginFlag(): Attempting to set login flag to true...");
    return new Promise((resolve, reject) => {
      this.storage.set('hasLoggedIn', true).then((res) => {
        Log.l("Set hasLoggedIn to true.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("Error setting hasLoggedIn to true!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public clearLoginFlag() {
    Log.l("clearLoginFlag(): Attempting to clear login flag...");
    return new Promise((resolve, reject) => {
      this.storage.remove('hasLoggedIn').then((res) => {
        Log.l("clearLoginFlag(): Successfully cleared hasLoggedIn flag.\n", res);
        return this.clearCredentials();
      }).then((res) => {
        Log.l("clearLoginFlag(): Also cleared credentials.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("clearLoginFlag(): Error while attempting to clear hasLoggedIn flag.");
        Log.w(err);
        reject(err);
      });
    });
  }

  public logout() {
    Log.l("logout(): Attempting to remove logged-in flag...");
    return new Promise((resolve, reject) => {
      this.clearLoginFlag().then((res) => {
        Log.l("AuthSrvcs.logout(): Cleared hasLoggedIn flag. User is now logged out.");
        resolve(res);
      }).catch((err) => {
        Log.l("AuthSrvcs.logout(): Error while logging out.");
        Log.e(err);
        resolve(err);
      });
    });
  }
}
