import { Injectable          } from '@angular/core'        ;
import { AlertService        } from './alert-service'      ;
import { Log                 } from 'domain/onsitexdomain' ;
import { LocalStorageService } from 'ngx-store'            ;
// import { Storage             } from '@ionic/storage'       ;

type AuthInfo = {username:string,password:string};

@Injectable()
export class AuthService {
  private username : string = ''                                       ;
  private password : string = ''                                       ;
  private ajaxOpts : any    = {ajax: { headers: { Authorization: ''}}} ;

  constructor(
    public alert   : AlertService        ,
    public storage : LocalStorageService ,
    // public storage : Storage             ,
  ) {
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

  // public saveCredentials() {
  //   Log.l("Saving credentials...");
  //   return new Promise((resolve, reject) => {
  //     Log.l("saveCredentials(): SecureStorage not available, using Localstorage...");
  //     let userInfo = { username: this.username, password: this.password };
  //     Log.l("saveCredentials(): Saving credentials:\n", userInfo);
  //     this.storage.set('userInfo', userInfo).then((res) => {
  //       Log.l("Saved credentials to local storage.");
  //       Log.l(res); resolve(res);
  //     }).catch((err) => {
  //       Log.l("Error saving credentials in local storage!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public async saveCredentials():Promise<AuthInfo> {
    try {
      Log.l("AuthService.saveCredentials(): Saving credentials...");
      Log.l("AuthService.saveCredentials(): SecureStorage not available, using Localstorage...");
      let userInfo:AuthInfo = { username: this.username, password: this.password };
      Log.l("AuthService.saveCredentials(): Saving credentials:", userInfo);
      let res = this.storage.set('userInfo', userInfo);
      Log.l("AuthService.saveCredentials(): Saved credentials to local storage.");
      Log.l(res);
      return res;
    } catch(err) {
      Log.l(`AuthService.saveCredentials(): Error saving credentials`);
      Log.e(err);
      throw err;
    }
  }

  public async getCredentials():Promise<AuthInfo> {
    try {
      Log.l("AuthService.getCredentials(): Retrieving credentials...");
      let res = this.storage.get('userInfo');
      if(res != null) {
        Log.l("AuthService.getCredentials(): Credentials retrieved from local storage!");
        Log.l(res);
        let userInfo:AuthInfo = res;
        this.setUser(userInfo.username);
        this.setPassword(userInfo.password);
        return userInfo;
      } else {
        let text:string = "AuthService.getCredentials(): Local credentials not found or are not available";
        Log.l(text);
        let err = new Error(text);
        throw err;
      }
    } catch(err) {
      Log.l(`AuthService.getCredentials(): Error retrieving credentials`);
      Log.e(err);
      throw err;
    }
  }

  // public getCredentials() {
  //   Log.l("Retrieving credentials...");
  //   return new Promise((resolve, reject) => {
  //     this.storage.get('userInfo').then((res) => {
  //       if (res != null) {
  //         Log.l("getCredentials(): Credentials retrieved from local storage!");
  //         Log.l(res);
  //         let userInfo = res;
  //         this.setUser(userInfo.username);
  //         this.setPassword(userInfo.password);
  //         resolve(userInfo);
  //       } else {
  //         Log.l("getCredentials(): Credentials not available.");
  //         let err = new Error("getCredentials(): Local credentials not found or are not available");
  //         reject(err);
  //       }
  //     }).catch((err) => {
  //       Log.l("getCredentials(): Error retrieving credentials from local storage!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public async clearCredentials():Promise<boolean> {
    try {
      Log.l("AuthService.clearCredentials(): Clearing credentials...");
      Log.l("AuthService.clearCredentials(): Running in a browser environment, using LocalStorage...");
      this.storage.remove('userInfo')
      Log.l("AuthService.clearCredentials(): Cleared credentials from local storage");
      return true;
    } catch(err) {
      Log.l(`AuthService.clearCredentials(): Error clearing credentials`);
      Log.e(err);
      throw err;
    }
  }

  // public clearCredentials() {
  //   Log.l("Clearing credentials...");
  //   return new Promise((resolve, reject) => {
  //     Log.l("clearCredentials(): Running in a browser environment, using LocalStorage...");
  //     this.storage.remove('userInfo').then((res) => {
  //       Log.l("Cleared credentials from local storage.");
  //       Log.l(res);
  //       resolve(res);
  //     }).catch((err) => {
  //       Log.l("Error clearing credentials from local storage!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public async areCredentialsSaved():Promise<boolean> {
    Log.l("AuthService.areCredentialsSaved(): Checking status of saved credentials...");
    try {
      // Log.l("AuthService.areCredentialsSaved(): SecureStorage not available, using Localstorage...");
      let res = this.storage.get('userInfo');
      if(res != null && typeof res.username != 'undefined' && res.username != '') {
        Log.l("AuthService.areCredentialsSaved(): Credentials retrieved from local storage:", res);
        let userInfo:AuthInfo = res;
        this.setUser(userInfo.username);
        this.setPassword(userInfo.password);
        return true;
      } else {
        Log.l("AuthService.areCredentialsSaved(): Returned null value, credentials do not exist");
        return false;
      }
    } catch(err) {
      Log.l(`AuthService.areCredentialsSaved(): Error checking for credentials`);
      Log.e(err);
      throw err;
    }
  }

  public async setLoginFlag():Promise<boolean> {
    try {
      Log.l("AuthService.setLoginFlag(): Attempting to set login flag to true...");
      let res = this.storage.set('hasLoggedIn', true);
      Log.l(`AuthService.setLoginFlag(): hasLoggedIn set to: ${res}`);
      return res;
    } catch(err) {
      Log.l(`AuthService.setLoginFlag(): Error setting login flag`);
      Log.e(err);
      throw err;
    }
  }

  public async clearLoginFlag():Promise<boolean> {
    try {
      Log.l("AuthService.clearLoginFlag(): Attempting to clear login flag...");
      this.storage.remove('hasLoggedIn')
      Log.l("AuthService.clearLoginFlag(): Successfully cleared hasLoggedIn flag");
      this.clearCredentials();
      Log.l("AuthService.clearLoginFlag(): Also cleared credentials.");
      return true;
    } catch(err) {
      Log.l(`AuthService.clearLoginFlag(): Error while attempting to clear hasLoggedIn flag`);
      Log.e(err);
      throw err;
    }
  }

  public async logout():Promise<boolean> {
    try {
      Log.l("AuthService.logout(): Attempting to remove logged-in flag...");
      this.clearLoginFlag()
      Log.l("AuthService.logout(): Cleared hasLoggedIn flag. User is now logged out.");
      return true;
    } catch(err) {
      Log.l(`AuthService.logout(): Error while logging out`);
      Log.e(err);
      throw err;
    }
  }
  // public areCredentialsSaved() {
  //   Log.l("areCredentialsSaved(): Checking status of saved credentials...");
  //   return new Promise((resolve, reject) => {
  //     Log.l("areCredentialsSaved(): SecureStorage not available, using Localstorage...");
  //     this.storage.get('userInfo').then((res) => {
  //       if(res != null && typeof res.username != 'undefined' && res.username != '') {
  //         Log.l("areCredentialsSaved(): Credentials retrieved from local storage!");
  //         Log.l(res);
  //         let userInfo = res;
  //         this.setUser(userInfo.username);
  //         this.setPassword(userInfo.password);
  //         resolve(true);
  //       } else {
  //         Log.l("areCredentialsSaved(): Returned null value, credentials not saved.\n", res);
  //         resolve(false);
  //       }
  //     }).catch((err) => {
  //       Log.l("areCredentialsSaved(): Error retrieving credentials from local storage!");
  //       Log.e(err);
  //       resolve(false);
  //     });
  //   });
  // }

  // public setLoginFlag() {
  //   Log.l("setLoginFlag(): Attempting to set login flag to true...");
  //   return new Promise((resolve, reject) => {
  //     this.storage.set('hasLoggedIn', true).then((res) => {
  //       Log.l("Set hasLoggedIn to true.\n", res);
  //       resolve(res);
  //     }).catch((err) => {
  //       Log.l("Error setting hasLoggedIn to true!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  // public clearLoginFlag() {
  //   Log.l("clearLoginFlag(): Attempting to clear login flag...");
  //   return new Promise((resolve, reject) => {
  //     this.storage.remove('hasLoggedIn').then((res) => {
  //       Log.l("clearLoginFlag(): Successfully cleared hasLoggedIn flag.\n", res);
  //       return this.clearCredentials();
  //     }).then((res) => {
  //       Log.l("clearLoginFlag(): Also cleared credentials.\n", res);
  //       resolve(res);
  //     }).catch((err) => {
  //       Log.l("clearLoginFlag(): Error while attempting to clear hasLoggedIn flag.");
  //       Log.w(err);
  //       reject(err);
  //     });
  //   });
  // }

  // public logout() {
  //   Log.l("logout(): Attempting to remove logged-in flag...");
  //   return new Promise((resolve, reject) => {
  //     this.clearLoginFlag().then((res) => {
  //       Log.l("AuthSrvcs.logout(): Cleared hasLoggedIn flag. User is now logged out.");
  //       resolve(res);
  //     }).catch((err) => {
  //       Log.l("AuthSrvcs.logout(): Error while logging out.");
  //       Log.e(err);
  //       resolve(err);
  //     });
  //   });
  // }
}
