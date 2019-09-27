// import { ReplicationResult, ReplicateOptions, PDatabase         } from './pouchdb-service'    ;
// import { SyncOptions, Sync, SyncResult, SyncResultComplete,     } from './pouchdb-service'    ;
// import { PDBSync, PDBSyncResult, PDBSyncResultComplete,         } from './pouchdb-service'    ;
// import { UpsertResponse,                                        } from './pouchdb-service'    ;
import { sprintf                                                } from 'sprintf-js'           ;
import { Injectable                                             } from '@angular/core'        ;
import { URLSearchParams                                        } from '@angular/http'        ;
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http' ;
import { Log, moment, Moment, isMoment, blobUtil,               } from 'domain/onsitexdomain' ;
import { PouchDBService,                                        } from './pouchdb-service'    ;
import { Database                                               } from './pouchdb-service'    ;
import { PDBSync                                                } from './pouchdb-service'    ;
import { PDBChange                                              } from './pouchdb-service'    ;
import { DBList                                                 } from './pouchdb-service'    ;
import { DBSyncList                                             } from './pouchdb-service'    ;
import { PDBLoginOptions                                        } from './pouchdb-service'    ;
import { PDBOptions                                             } from './pouchdb-service'    ;
import { PDBResponse                                            } from './pouchdb-service'    ;
import { PouchDoc                                               } from './pouchdb-service'    ;
import { AllDocsOptions                                         } from './pouchdb-service'    ;
import { AllDocsResponse                                        } from './pouchdb-service'    ;
import { ReplicateOptions                                       } from './pouchdb-service'    ;
import { ReplicationComplete                                    } from './pouchdb-service'    ;
import { ReplicationCancel                                      } from './pouchdb-service'    ;
import { PDBChangeEvent                                         } from './pouchdb-service'    ;
import { PDBCompleteEvent                                       } from './pouchdb-service'    ;
import { PDBReplicationResult                                   } from './pouchdb-service'    ;
import { SyncOptions                                            } from './pouchdb-service'    ;
import { PDBSyncResult                                          } from './pouchdb-service'    ;
import { PDBSyncResultComplete                                  } from './pouchdb-service'    ;
import { UpsertResponse                                         } from './pouchdb-service'    ;
import { UpsertDiffCallback                                     } from './pouchdb-service'    ;
import { UpsertDiffDoc                                          } from './pouchdb-service'    ;
import { AllDocsRows                                            } from './pouchdb-service'    ;
import { AllDocsRow                                             } from './pouchdb-service'    ;
import { Selector                                               } from './pouchdb-service'    ;
import { FindRequest                                            } from './pouchdb-service'    ;
import { FindResponse                                           } from './pouchdb-service'    ;
import { PouchIndex                                             } from './pouchdb-service'    ;
import { CreateIndexResponse                                    } from './pouchdb-service'    ;
import { PDBUser                                                } from './pouchdb-service'    ;
import { PDBLoginResponse                                       } from './pouchdb-service'    ;
import { PDBSessionResponse                                     } from './pouchdb-service'    ;
import { PDBPutUserOptions                                      } from './pouchdb-service'    ;
import { PDBSession                                             } from './pouchdb-service'    ;
import { AuthHeader                                             } from './pouchdb-service'    ;
import { AuthService                                            } from './auth-service'       ;
import { AlertService                                           } from './alert-service'      ;
import { StorageService                                         } from './storage-service'    ;
import { Jobsite, Employee,Shift, PayrollPeriod, Schedule       } from 'domain/onsitexdomain' ;
import { Report                                                 } from 'domain/onsitexdomain' ;
import { ReportOther                                            } from 'domain/onsitexdomain' ;
import { ReportLogistics                                        } from 'domain/onsitexdomain' ;
import { ReportDriving                                          } from 'domain/onsitexdomain' ;
import { ReportMaintenance, MaintenanceWordType                 } from 'domain/onsitexdomain' ;
import { ReportTimeCard,                                        } from 'domain/onsitexdomain' ;
import { Message                                                } from 'domain/onsitexdomain' ;
import { Comment                                                } from 'domain/onsitexdomain' ;
import { DPS                                                    } from 'domain/onsitexdomain' ;
import { ScheduleBeta                                           } from 'domain/onsitexdomain' ;
import { Invoice                                                } from 'domain/onsitexdomain' ;
import { PreAuth                                                } from 'domain/onsitexdomain' ;
import { DatabaseProgress                                       } from 'domain/onsitexdomain' ;
import { SESAClient, SESALocation, SESALocID, SESACLL,          } from 'domain/onsitexdomain' ;
import { Preferences, DatabaseKey                                            } from './preferences'        ;
import { DispatchService                                        } from './dispatch-service'   ;
import { OSData, CONFIGKEY                                      } from './data-service'       ;
import { TranslationDocument                                    } from './db-service'         ;
import { TranslationTable                                       } from './db-service'         ;
import { TranslationRecord                                      } from './db-service'         ;
import { TranslationTableRecord                                 } from './db-service'         ;

// import * as WorkerLoader from "worker-loader!workers/test.worker";
// import * as Defiant from 'defiant.js';

// import Client from 'couchdb-howler';
// import * as howler from 'couchdb-howler';
// import 'defiant.js';

// declare global {
//   interface JSON {
//     search: any;
//   }
// }
const emph1:string = "background-color: rgba(224, 224, 0  , 0.5); color: rgba(64 , 64 , 64 , 1.0);";
const emph2:string = "background-color: rgba(64 , 224, 64 , 0.5); color: rgba(64 , 64 , 64 , 1.0);";
const emph3:string = "background-color: rgba(242, 64 , 64 , 0.4); color: rgba(64 , 64 , 64 , 1.0);";
const emph4:string = "background-color: rgba(255, 255, 160, 0.4); color: rgba(192, 192, 192, 1.0);";

const noDD:string = "_";
const GETDOCS  :AllDocsOptions = { include_docs: true };
const noDesign1:AllDocsOptions = { include_docs: true, startkey: noDD   };
const noDesign2:AllDocsOptions = { include_docs: true, endkey  : noDD   };
// const liveNoDesign = { live: true, since: 'now', include_docs: true, startkey: noDD };

type CLLNames = "client" | "location" | "locID";
// type CLLS = SESAClient | SESALocation | SESALocID;

@Injectable()
export class ServerService {
  // public static rdb           : Map<any,any> = new Map()                                     ;
  // public static syncs         : Map<any,any> = new Map()                                     ;
  // public rdb                  : any    = ServerService.rdb                                   ;
  // public syncs                : any    = ServerService.syncs                                 ;
  // public static StaticPouchDB : any    = PouchDBService.PouchInit()                          ;
  // public static PREFS         : any    = new Preferences()                                   ;
  public userInfo      : any    = {u: '', p: '' }                                     ;
  public repopts       : any    = { live: false, retry: false }                       ;
  public ajaxOpts      : any    = { headers: { Authorization: '' } }                  ;
  public remoteDBInfo  : any    = {}                                                  ;
  public hostNumber    : number = 0                                                   ;
  public syncOptions   : SyncOptions   = {live: true , retry: true , }              ;
  public nonsyncOptions: SyncOptions   = {live: false, retry: false, }              ;
  public maxPending:number = 0;
  public activePause   : any = {};
  // public worker:any;
  // public howlerClient  : Client;
  // public get syncOptions()    : any { return ServerService.syncOptions; }                    ;
  // public get nonsyncOptions() : any { return ServerService.nonsyncOptions; }                 ;

  constructor(
    // public data     : OSData          ,
    public http     : HttpClient      ,
    public data     : OSData          ,
    public prefs    : Preferences     ,
    public pouchdb  : PouchDBService  ,
    public auth     : AuthService     ,
    public alert    : AlertService    ,
    public storage  : StorageService  ,
    public dispatch : DispatchService ,
  ) {
    window['onsiteserverservice'] = this;
    // window['HowlerClient'] = Client;
    // window['onsitedefiant'] = Defiant;
    Log.l('Hello ServerService Provider');
    // let worker = new (WorkerLoader as any)();
    // this.worker = worker;

    // Log.l("ServerService: the worker is:\n", worker);

    // ServerService.StaticPouchDB = PouchDBService.getPouchDB();
    // ServerService.startupDatabases.forEach((db) => { Log.l(`ServerService(): now initializing startup database ${db} …`); });
  }


  public getBaseURL():string {
    return this.pouchdb.getBaseURL();
  }

  public getRemoteDatabaseURL(dbname?:string):string {
    return this.pouchdb.getRemoteDatabaseURL(dbname);
  }

  public getInsecureLoginBaseURL(user:string, pass:string):string {
    return this.pouchdb.getInsecureLoginBaseURL(user, pass);
  }

  // public getBaseURL():string {
  //   // let prefs    = ServerService.PREFS   ;
  //   let port:number     = this.prefs.SERVER.port     ;
  //   let protocol:string = this.prefs.SERVER.protocol ;
  //   let server:string   = this.prefs.SERVER.server   ;
  //   if(server.indexOf('pico.sesa.us') !== -1) {
  //     let hostNumber:number = (this.hostNumber++ % 16) + 1;
  //     server     = sprintf("db%02d.sesa.us", hostNumber);
  //   }
  //   if(port) {
  //     return `${protocol}://${server}:${port}`;
  //   } else {
  //     return `${protocol}://${server}`;
  //   }
  // }

  // public getRemoteDatabaseURL(dbname?:string):string {
  //   let url1:string = this.getBaseURL();
  //   let name:string = dbname || "_session";
  //   url1 = `${url1}/${name}`;
  //   return url1;
  // }

  // public getInsecureLoginBaseURL(user:string, pass:string):string {
  //   // let prefs    = ServerService.PREFS   ;
  //   let port:number     = this.prefs.SERVER.port     ;
  //   let protocol:string = this.prefs.SERVER.protocol ;
  //   let server:string   = this.prefs.SERVER.server   ;
  //   if(port) {
  //     return `${protocol}://${user}:${pass}@${server}:${port}`;
  //   } else {
  //     return `${protocol}://${user}:${pass}@${server}`;
  //   }
  // }

  // public static getAuthHeaders(user: string, pass: string):{headers:Object} {
  //   let authToken = 'Basic ' + window.btoa(user + ':' + pass);
  //   let ajaxOpts = { headers: { Authorization: authToken } };
  //   return ajaxOpts;
  // }

  public addDB(dbname:string):Database {
    return this.pouchdb.addDB(dbname);
  }

  public addRDB(dbname:string, options?:PDBOptions):Database {
    return this.pouchdb.addRDB(dbname, options);
  }

  public async addRDBAdmin(dbname:string):Promise<Database> {
    let rdb1:Database = await this.pouchdb.addRDBAdmin(dbname);
    return rdb1;
  }

  public async closeDB(dbname:string):Promise<boolean> {
    return this.pouchdb.closeDB(dbname);
  }
  
  public async closeRDB(dbname:string):Promise<boolean> {
    return this.pouchdb.closeRDB(dbname);
  }
  
  // public startHowlerClient() {
  //   let server:string = this.prefs.getHowlerURL();
  //   let client:howler.Client = new howler.Client(server);
  //   return client;
  // }

  public async loginToDatabase(user:string, pass:string, dbname:string):Promise<boolean> {
    let rdb1:Database, opts:PDBLoginOptions, loginOptions:PDBLoginOptions;
    try {
      let adapter:string = this.prefs.getProtocol();
      // let authToken = 'Basic ' + window.btoa(user + ':' + pass);
      // let authOpts = { headers: { Authorization: authToken } };
      // let ajaxOpts = { ajax: authOpts };
      // let opts = { adapter: adapter, skip_setup: true, ajax: { withCredentials: true, headers: authOpts.headers }, auth: { username: user, password: pass } };
      this.prefs.setAuth(user, pass);
      opts = this.prefs.getRemoteOptions();
      let text:string = `loginToDatabase('${dbname}') as '${user}' with opts:`;
      Log.l(text, opts);
      // Log.l(`loginToDatabase(): About to login to database ${dbname} as '${user}' with options:\n`, opts);
      // Log.l(opts);
      rdb1 = this.addRDB(dbname, opts);
      loginOptions = null;
      let res:any = await rdb1.logIn(user, pass, loginOptions);
      let session:any = await rdb1.getSession();
      if(typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
        Log.l(`loginToDatabase(): Authentication failed for '${dbname}'!`);
        // Log.ge();
        this.userInfo = { u: '', p: '' };
        return false;
      } else {
        Log.l(`loginToDatabase(): Authentication successful for '${dbname}'!`);
        // Log.ge();
        this.userInfo = { u: user, p: pass };
        return true;
      }
    } catch(err) {
      Log.l(`loginToDatabase(): Error logging in to '${dbname}', retrying once after 3 seconds!`);
      Log.e(err);
      // Log.ge();
      try {
        let out:any = await this.delay(3000);
        rdb1 = this.addRDB(dbname, opts);
        loginOptions = null;
        let res:any = await rdb1.logIn(user, pass, loginOptions);
        let session:any = await rdb1.getSession();
        if(typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
          Log.l(`loginToDatabase(): Authentication failed for '${dbname}'!`);
          // Log.ge();
          this.userInfo = { u: '', p: '' };
          return false;
        } else {
          Log.l(`loginToDatabase(): Authentication successful for '${dbname}'!`);
          // Log.ge();
          this.userInfo = { u: user, p: pass };
          return true;
        }
      } catch(err2) {
        Log.l(`loginToDatabase(): second error. Not retrying.`);
        Log.e(err2);
        throw err2;
      }
    }
  }

  public delay(msDelay?:number):Promise<boolean> {
    return new Promise(resolve => {
      let delay:number = typeof msDelay === 'number' ? msDelay : 500;
      setTimeout(() => {
        resolve(true);
      }, delay);
    });
  }

  public async loginToServer(user:string, pass:string, dbname?:string):Promise<any> {
    let dbURL:string = dbname || '_session';
    let rdb1:Database, opts:PDBLoginOptions, loginOptions:PDBLoginOptions;
    // let userDB:string = this.prefs.getDB('employees');
    try {
      Log.l("loginToServer(): PouchDB initialized, ready to go.");
      // let adapter = this.prefs.getProtocol();
      // let authToken = 'Basic ' + window.btoa(user + ':' + pass);
      // let authOpts = { headers: { Authorization: authToken } };
      // let ajaxOpts = { ajax: authOpts };
      // let opts = { adapter: adapter, skip_setup: true, auth: { username: user, password: pass }, ajax: { withCredentials: true, headers: authOpts.headers, } };
      let authResults:any = this.prefs.setAuth(user, pass);
      Log.l(`loginToServer(): set Auth results to:\n`, authResults);
      opts = this.prefs.getRemoteOptions();
      rdb1 = this.addRDB(dbURL);
      // let rdb2:Database = this.addRDB(userDB);
      Log.l(`About to try login to '${dbURL}' as '${user}' with options:\n`, opts);
      loginOptions = null;
      let res:any = await rdb1.logIn(user, pass, loginOptions);
      let session:any = await rdb1.getSession();
      if(typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
        Log.l(`loginToServer(): Authentication failed, session is:\n`, session);
        this.userInfo = { u: '', p: '' };
        throw new Error("Server login failed.");
      } else {
        Log.l(`loginToServer(): Authentication successful, DB '${dbURL}'.`);
        this.userInfo = { u: user, p: pass };
        this.auth.setUser(user);
        this.auth.setPassword(pass);
        let res:any = await this.auth.saveCredentials();
        Log.l("loginToServer(): Saved credentials.");
        return session;
      }
    } catch(err) {
      Log.l(`loginToServer(): Error logging in to '${dbURL}'`);
      Log.e(err);
      try {
        let out:any = await this.delay(3000);
        rdb1 = this.addRDB(dbname, opts);
        loginOptions = null;
        let res:any = await rdb1.logIn(user, pass, loginOptions);
        let session:any = await rdb1.getSession();
        if(typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
          Log.l(`loginToServer(): Authentication failed for '${dbname}'!`);
          // Log.ge();
          this.userInfo = { u: '', p: '' };
          return false;
        } else {
          Log.l(`loginToServer(): Authentication successful for '${dbname}'!`);
          // Log.ge();
          this.userInfo = { u: user, p: pass };
          return true;
        }
      } catch(err2) {
        Log.l(`loginToServer(): second error. Not retrying.`);
        Log.e(err2);
        let errText:string = err2 && err2.message ? err2.message : typeof err2 === 'string' ? err2 : "UNKNOWN_ERROR";
        this.alert.showAlert("ERROR", `Unable to log in to server database '${dbURL}'. Reason: <br>\n<br>\n'${errText}'`);
        // throw err;
        throw err2;
      }
    }
  }

  public async getUserData(username:string):Promise<any> {
    try {
      let rdb1:Database = this.addRDB('_session');
      let res:any = await rdb1.getUser(username);
      return res;
    } catch(err) {
      Log.l(`getUserData(): Error getting _users record from server for user '${username}'`);
      Log.e(err);
      throw err;
    }
  }

  public async getEmployee(username:string):Promise<Employee> {
    try {
      let dbname:string = this.prefs.getDB('employees');
      let userID:string = `org.couchdb.user:${username}`;
      let rdb1:Database = this.addRDB(dbname);
      let res:any = await rdb1.get(userID);
      let tech:Employee = Employee.deserialize(res);
      return tech;
    } catch(err) {
      Log.l(`getEmployee(): Error getting _users record from server for user '${username}'`);
      Log.e(err);
      throw err;
    }
  }

  public async getUserAdminStatus():Promise<boolean> {
    try {
      Log.l("getUserAdminStatus(): Now checking user admin status …");
      let isAdmin = false;
      let rdb1:Database = this.addRDB('_session');
      let res:any = await rdb1.getSession();
      let session = res;
      Log.l("getUserAdminStatus(): Got session, now checking user status …", session);
      if(session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
        isAdmin = true;
        Log.l("getUserAdminStatus(): User is admin.");
        return true;
      } else {
        Log.l("getUserAdminStatus(): User is not admin.");
        return false;
      }
    } catch(err) {
      Log.l(`getUserAdminStatus(): Unable to get session, user not logged in.`);
      Log.e(err);
      return false;
    }
  }

  public async getAllLoginUsers():Promise<any[]> {
    try {
      let rdb1:Database = this.addRDB('_users');
      let u:string = 'c2VzYWFkbWlu', p:string = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1:string = window.atob(u), p2:string = window.atob(p);
      let authToken:string = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts = { headers: { Authorization: authToken } };
      // let opts:PDBLoginOptions = { ajax: ajaxOpts };
      let opts:PDBLoginOptions = {};
      let outDocs:any[] = [];
      try {
        let loginOptions:PDBLoginOptions = null;
        let res2:PDBLoginResponse = await rdb1.logIn(u1, p2, loginOptions);
        let res:AllDocsResponse = await rdb1.allDocs(GETDOCS);
        if(res && Array.isArray(res['rows'])) {
          for(let item of res.rows) {
            if(item.doc && item.id[0]!=='_') {
              let doc = item.doc;
              outDocs.push(doc);
            }
          }
        }
        return outDocs;
      } catch(err) {
        Log.l(`getAllLoginUsers(): Error getting all login users: user not administrator or login error`);
        Log.e(err);
        return [];
      }
    } catch(err) {
      Log.l(`getAllLoginUsers(): Error getting docs from _users database!`);
      Log.e(err);
      throw err;
    }
  }

  // public async updateEmployee(employee:Employee) {
  //   try {
  //     Log.l("updateEmployee(): Saving employee:\n", employee);
  //     let dbname = this.prefs.getDB('employees');
  //     let rdb1:Database = this.addRDB(dbname);
  //     let id = employee._id;
  //     let res:UpsertResponse = await rdb1.upsert(id, (doc:UpsertDiffDoc) => {
  //       if(doc)
  //     });
  //       // rdb1.upsert(employee._id,)
  //       rdb1.get(employee._id).then((res) => {
  //         Log.l(`updateEmployee(): Found employee ${employee._id}.`);
  //         employee._rev = res._rev;
  //         return rdb1.put(employee);
  //       }).then((res) => {
  //         Log.l("updateEmployee(): Successfully saved employee.\n", res);
  //         resolve(res);

  //     return res;
  //   } catch(err) {
  //     Log.l(`ServerService.updateEmployee(): Error updating employee record!`);
  //     Log.e(err);
  //     throw err;
  //   }
  //     }).catch(err => {
  //       Log.l("updateEmployee(): Error updating employee info!");
  //       Log.e(err);
  //       if (err.status == 404) {
  //         Log.l(`updateEmployee(): Employee ${employee._id} was not found, saving new.`);
  //         delete employee._rev;
  //         rdb1.put(employee).then((res) => {
  //           Log.l(`updateEmployee(): Success saving new employee! Result:\n`, res);
  //           resolve(res);
  //         }).catch(err => {
  //           Log.l("updateEmployee(): Error saving new employee!");
  //           Log.e(err);
  //           reject(err);
  //         });
  //       } else {
  //         Log.l("updateEmployee(): Not a 404 error. Giving up.");
  //         Log.e(err);
  //         reject(err);
  //       }
  //     });
  //   });
  // }

  public async getDocCount(dbtype:DatabaseKey):Promise<number> {
    try {
      // let dbname:string = this.prefs.getDB(dbtype);
      // let dburl:string = this.prefs.getRemoteDBURL(dbtype);
      // if(!dburl) {
      //   let err = new Error("getDocCount(): Could not find remote config database");
      //   throw err;
      // }

      // let http = this.http;
      let dburl:string = "";
      Log.l("Server.getDocCount(): Getting from URL: '%s'", dburl);
      let res:any = await this.getJSONFromCouchDB(dbtype, dburl);
      // let res:any = await http.get(dburl, { headers: new HttpHeaders().set('Authorization', authHdr) }).toPromise();
      Log.l(`Server.getDocCount(): Success! Got data:\n`, res);
      if(res && typeof res.doc_count === 'number') {
        let docCount:number = res.doc_count;
        return docCount;
      } else {
        let err = new Error(`Server.getDocCount(): Document count for database type '${dbtype}' not found!`);
        throw err;
      }
    } catch(err) {
      let errText = `Server.getDocCount(): Error getting document count for database type '${dbtype}'!`;
      // let err = new Error(errText);
      Log.l(errText);
      Log.e(err);
      throw err;
    }
  }

  public async getJSONFromCouchDB(dbtype:DatabaseKey, url:string):Promise<any> {
    try {
      // let dbname:string = this.prefs.getDB(dbtype);
      let dburl:string = this.prefs.getRemoteDBURL(dbtype);
      if(!dburl) {
        let err = new Error("Server.getJSONFromCouchDB(): Could not find remote config database");
        throw err;
      }

      let fullURL:string = `${dburl}/${url}`;

      let http = this.http;
      let invoiceNumber = -1;
      let u = this.auth.getUser(), p = this.auth.getPass();
      let headerString = window.btoa(`${u}:${p}`);
      let authHdr = `Basic ${headerString}`;
      let type = "application/json";
      Log.l("Server.getJSONFromCouchDB(): Getting from URL: '%s'", fullURL);
      let res:any = await http.get(fullURL, { headers: new HttpHeaders().set('Authorization', authHdr).set('Content-Type', type) }).toPromise();
      Log.l(`Server.getJSONFromCouchDB(): Success! Got data:`, res);
      return res;
    } catch(err) {
      let errText = `Server.getJSONFromCouchDB(): Error getting document count for database type '${dbtype}'!`;
      // let err = new Error(errText);
      Log.l(errText);
      Log.e(err);
      throw err;
    }
  }

  // public async getDocCount(dbtype:string) {
  //   try {
  //     let dbname:string = this.prefs.getDB(dbtype);
  //     let dburl:string = this.prefs.getRemoteDBURL(dbname);
  //     let res:any = await
  //     return res;
  //   } catch(err) {
  //     Log.l(`getDocCount(): Error getting document count for '${dbtype}'`);
  //     Log.e(err);
  //     throw err;
  //   }

  // }

  public async saveEmployeeRecord(tech:Employee):Promise<boolean> {
    try {
      let employeeDoc:any = tech.serialize();
      let dbname:string = this.prefs.getDB('employees');
      let rdb1:Database = this.addRDB(dbname);
      let res:UpsertResponse = await rdb1.upsert(employeeDoc._id, (doc:UpsertDiffDoc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = employeeDoc;
          doc._rev = rev;
        } else {
          doc = employeeDoc;
          delete doc._rev;
        }
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        let text:string = `Server.saveEmployeeRecord(): Error upserting user to sesa-employees!`;
        let err:Error = new Error(text);
        Log.l(`${text}\n`, res);
        throw err;
      } else {
        Log.l(`Server.saveEmployeeRecord(): Successfully saved employee.`, tech);
        return true;
      }
    } catch(err) {
      Log.l(`Server.saveEmployeeRecord(): Error saving employee record!`);
      Log.e(err);
      throw err;
    }
  }

  public saveEmployee(employee: any) {
    Log.l("Server.saveEmployee(): Saving employee:", employee);
    return new Promise((resolve, reject) => {
      Log.l(`Server.saveEmployee(): Starting …`);
      let dbname:string = this.prefs.getDB('employees');
      let rdb1:Database = this.addRDB(dbname);
      // rdb1.get(employee._id).then((res) => {
      //   Log.l(`saveEmployee(): Found employee ${employee._id}.`);
      //   employee._rev = res._rev;
      //   return rdb1.put(employee);
      rdb1.upsert(employee.docID, (doc:any) => {
        let rev = doc._rev || null;
        doc = employee;
        // delete doc['_rev'];
        // delete doc['_id'];
        if (rev) { doc._rev = rev; }
        return doc;
      }).then((res:UpsertResponse) => {
        if(!res['ok'] && !res.updated) {
          Log.e('Server.saveEmployee(): Error upserting user to sesa-employees!', res);
          reject(res);
        } else {
          Log.l("Server.saveEmployee(): Successfully saved employee.", res);
          Log.l(`Server.saveEmployee(): Now adding employee to _users database …`);
          this.saveUser(employee, 'sesa1234').then(res => {
            Log.l("Server.saveEmployee(): Successfully saved employee.");
            resolve(res);
          }).catch(err => {
            Log.l("Server.saveEmployee(): Error saving employee to _users!");
            Log.e(err);
            reject(err);
          });
        }
      }).catch((err) => {
        Log.l(`Server.saveEmployee(): Error! Possibly just a not-existing-yet user?`);
        if (err.status === 404) {
          Log.l(`Server.saveEmployee(): Employee ${employee.docID} was not found, saving new.`);
          delete employee._rev;
          rdb1.upsert(employee.docID, (doc:any) => {
            let rev = doc._rev || null;
            doc = employee;
            // delete doc['_rev'];
            // delete doc['_id'];
            if(rev) { doc._rev = rev; }
            return doc;
          }).then((res:UpsertResponse) => {
            if(!res['ok'] && !res.updated) {
              Log.e("Server.saveEmployee(): Error saving employee via upsert:", res);
              reject(res);
            } else {
              Log.l(`Server.saveEmployee(): Success saving new employee! Result:`, res);
              Log.l(`Server.saveEmployee(): Now adding employee to _users database …`);
              this.saveUser(employee, 'sesa1234').then(res => {
                Log.l("Server.saveEmployee(): Successfully saved employee:", res);
                resolve(res);
              }).catch(err => {
                Log.l("Server.saveEmployee(): Successfully saved employee.");
                Log.e(err);
                reject(err);
              });
            }
          }).catch((err) => {
            Log.l(`Server.saveEmployee(): Error saving new employee!`);
            Log.e(err);
            reject(err);
          });
        } else {
          Log.e("Server.saveEmployee(): Nope, it was not a 404 error. Sorry.");
          Log.e(err);
          reject(err);
        }
      });
    });
  }

  public getUserCreationOptions(doc:any):{metadata:Object, roles?:string[]} {
    let opts:{metadata:Object, roles?:string[]} = {
      metadata : {}             ,
      roles    : ['TECHNICIAN'] ,
    };
    if(doc) {
      let reservedKeys = [
        '_id',
        '_rev',
        'name',
        'type',
        'password',
        'password_scheme',
        'password_sha',
        'salt',
        'derived_key',
        'iterations',
        'roles',
      ];
      if(doc['roles'] != undefined) {
        if(Array.isArray(doc.roles)) {
          let roles:any[] = doc.roles.slice(0);
          opts.roles = roles;
          delete doc['roles'];
        }
      }
      let keys = Object.keys(doc);
      for(let key of keys) {
        if(reservedKeys.indexOf(key) !== -1) {
          delete doc[key];
        }
      }
      opts.metadata = doc;
    }
    return opts;
  }

  public async saveUser(user:any, pass?:string):Promise<any> {
    try {
      let rdb1:Database = this.addRDB('_session');
      let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1 = window.atob(u), p2 = window.atob(p);
      let authToken = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts = { headers: { Authorization: authToken } };
      // let opts = { ajax: ajaxOpts };
      let opts = {};
      let loginOptions:PDBLoginOptions = null;
      let res:any     = await rdb1.logIn(u1, p2, loginOptions);
      let session:any = await rdb1.getSession();
      if(session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
        /* User is an administrator on CouchDB server */
        let un:string = user['avatarName'];
        if(user instanceof Employee) {
          un = user.getUsername();
        }
        try {
          // let un = user.avatarName;
          res = await rdb1.getUser(un, opts);
          Log.l("Server.saveUser(): Found user on server! Updating info …");
          let doc:any = Object.assign({}, user);
          doc._rev = res._rev;
          // doc._id  = res._id;
          if(doc['iterations']) {
            doc['iterations'] = Number(doc['iterations']);
          }
          delete doc['password'];
          Log.l(`Server.saveUser(): About to try to save user '${un}' with doc: `, doc);
          try {
            // delete doc['_id'];
            // delete doc['name'];
            // let roles = Array.isArray(doc['roles']) ? doc['roles'].slice(0) : ["TECHNICIAN"];
            // doc = this.stripUserMetadata(doc);
            let opts = this.getUserCreationOptions(doc);
            res = await rdb1.putUser(un, opts);
            Log.l("Server.saveUser(): Saved user successfully!");
            return res;
          } catch(err) {
            Log.l(`Server.saveUser(): Error executing putUser(). Probably not admin, or connection down.`);
            Log.e(err);
            throw err;
          }
        } catch(err) {
          Log.l(`Server.saveUser(): Error getting user. Maybe a new user …`);
          Log.l(err);
          if(err.status === 404 || err.error === 'not_found') {
            let doc = Object.assign({}, user);
            if(doc['iterations']) {
              doc['iterations'] = Number(doc['iterations']);
            }
            // doc['password'] = "sesa1234";
            let userID = `org.couchdb.user:${un}`;
            // doc._id = userID;
            // delete doc['_id'];
            // delete doc['name'];
            let opts = this.getUserCreationOptions(doc);
            // delete doc['_rev'];
            Log.l(`Server.saveUser(): About to try to save user '${un}' with doc:\n`, doc);
            try {
              res = await rdb1.signUp(un, 'sesa1234', opts);
              Log.l("Server.saveUser(): Saved user successfully: ", res);
              return res;
            } catch(err) {
              Log.l(`Server.saveUser(): Error creating new user!`);
              Log.e(err);
              throw err;
            }
          } else {
            Log.l("Server.saveUser(): Not a missing user error. Can't create user.");
            Log.e(err);
            throw err;
          }
        }
      } else {
        Log.e("Server.saveUser(): Unable to save, user is not admin. Session was:\n", session);
        throw new Error(session);
      }
    } catch(err) {
      Log.l(`Server.saveUser(): Error trying to log in and save user.`);
      Log.e(err);
      throw err;
    }
  }

  public deleteDoc(dbname:string, doc:PouchDoc):Promise<UpsertResponse> {
    let rdb1:Database = this.addRDB(dbname);
    // if(db instanceof this.pouchdb.StaticPouchDB) {
    //   rdb1 = dbname;
    // } else {
    //   rdb1 = this.addRDB(db);
    // }
    return new Promise((resolve,reject) => {
      rdb1.upsert(doc._id, (doc:UpsertDiffDoc) =>{
        doc._deleted = true;
        return doc;
      }).then((res:UpsertResponse) => {
        if(!res.ok && !res.updated) {
          Log.l(`Server.deleteDoc(): Could not delete doc ${doc._id}.`);
          Log.e(res);
          reject(res);
        } else {
          Log.l(`Server.deleteDoc(): Successfully deleted doc ${doc._id}.`);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`Server.deleteDoc(): Could not delete doc ${doc._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async deleteUserNew(user:any):Promise<UpsertResponse> {
    try {
      let dbname1:string = this.prefs.getDB('login');
      let dbname2:string = this.prefs.getDB('employees');
      let dbname3:string = '_users';
      let rdb1:Database = this.addRDB(dbname1);
      let rdb2:Database = this.addRDB(dbname2);
      let rdb3:Database = this.addRDB(dbname3);
      // let db2 = this.addDB('sesa-employees');
      let u:string = 'c2VzYWFkbWlu';
      let p:string = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1:string = window.atob(u);
      let p2:string = window.atob(p);
      let authToken:string = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts:any = { headers: { Authorization: authToken } };
      // let opts:PDBOptions = { ajax: ajaxOpts };
      let opts:PDBLoginOptions = { };
      let un:string = user.avatarName;
      let user_id:string = user['_id'] ? user['_id'] : "UNKNOWN_USER_ID";
      try {
        let loginOptions:PDBLoginOptions = null;
        let res:PDBLoginResponse = await rdb1.logIn(u1, p2, loginOptions);
        let session:PDBSession = await rdb1.getSession();
        if(session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
          /* User is admin */
          try {
            let res:PouchDoc = await rdb2.get(user._id);
            Log.l("Server.deleteUser(): Retrieved user from sesa-employees database: ", res);
            Log.l("Server.deleteUser(): Now deleting user from sesa-employees …");
            let doc1:PouchDoc = res;
            try {
              let res2:UpsertResponse = await this.deleteDoc(dbname2, doc1);
              Log.l("Server.deleteUser(): Removed user from sesa-employees fine. Now trying to read from _users: ", res2);
              try {
                let res3:PDBUser = await rdb1.getUser(un);
                Log.l("Server.deleteUser(): Got user from _users database: ", res3);
                Log.l("Server.deleteUser(): now deleting user from _users database …");
                let userDoc:PouchDoc = res3;
                try {
                  let res4:UpsertResponse = await this.deleteDoc(dbname3, userDoc);
                  Log.l("Server.deleteUser(): User deleted from _users, and didn't exist in sesa-employees: ", res4);
                  return res4;
                } catch(err) {
                  Log.l(`Server.deleteUser(): Error deleting user from _users. Guess there's no need to finish up.`);
                  Log.e(err);
                  throw err;
                }
              } catch (err) {
                throw err;
              }
            } catch(err) {
              throw err;
            }
          } catch(err) {
            Log.e("Server.deleteUser(): Unable to delete user, current user is not admin. Session was:\n", session);
            Log.e(err);
            return null;
            // throw err;
          }
          // Log.l("deleteUser(): Unable to retrieve user from sesa-employees! Checking _users …");
          // let res:PDBUser = await rdb2.getUser(un);
          // Log.l("deleteUser(): Got user from _users database: ", res);
          // Log.l("deleteUser(): now deleting user from _users database …");
          // let userDoc:PouchDoc = res;
          // let res2:UpsertResponse = await this.deleteDoc(dbname3, userDoc);
          // Log.l("deleteUser(): User deleted from _users, and didn't exist in sesa-employees: ", res2);
          // return res2;
        } else {
          Log.e("Server.deleteUser(): Unable to delete user, current user is not admin. Session was:\n", session);
          let text:string = "Unable to delete user, current user not administrator!";
          let err:Error = new Error(text);
          throw err;
        }
      } catch(err) {
        Log.l(`Server.deleteUser(): Error attempting to log in and get seesion. Can't delete user.`);
        Log.e(err);
        throw err;
      }
    } catch(err) {
      Log.l(`Server.deleteUser(): Error deleting user!`);
      Log.e(err);
      throw err;
    }
  }

  public deleteUser(user:any):Promise<any> {
  // public deleteUser(user:any) {
    return new Promise((resolve, reject) => {
      let dbname1:string = this.prefs.getDB('login');
      let dbname2:string = this.prefs.getDB('employees');
      let rdb1:Database = this.addRDB(dbname1);
      let rdb2:Database = this.addRDB(dbname2);
      // let rdb3:Database = this.addRDB('_users');
      // let db2:Database  = this.addDB('sesa-employees');
      let u:string = 'c2VzYWFkbWlu';
      let p:string = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1:string = window.atob(u);
      let p2:string = window.atob(p);
      let authToken:string = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts:any = { headers: { Authorization: authToken } };
      // let opts:PDBLoginOptions = { ajax: ajaxOpts };
      let opts:PDBLoginOptions = { };
      let un:string = user.avatarName;
      let user_id:string = user['_id'] ? user['_id'] : "UNKNOWN_USER_ID";
      let loginOptions:PDBLoginOptions = null;
      rdb1.logIn(u1, p2, loginOptions).then((res:PDBLoginResponse) => {
        return rdb1.getSession();
      }).then((session:PDBSession) => {
        if(session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
          // User is admin

          rdb2.get(user_id).then((res:PouchDoc) => {
            Log.l("Server.deleteUser(): Retrieved user from sesa-employees database: ", res);
            Log.l("Server.deleteUser(): Now deleting user from sesa-employees …");
            let doc1:PouchDoc = res;

            this.deleteDoc(dbname2, doc1).then((res:UpsertResponse) => {
              Log.l("Server.deleteUser(): Removed user from sesa-employees fine. Now trying to read from _users: ", res);
              rdb1.getUser(un).then((res:PDBUser) => {
                Log.l("Server.deleteUser(): Got user from _users database: ", res);
                Log.l("Server.deleteUser(): now deleting user from _users database …");
                // return this.deleteDoc(rdb3, res);
                // let id = res['_id'];
                return rdb1.deleteUser(un);
              }).then((res:PDBResponse) => {
                Log.l("Server.deleteUser(): User deleted from _users, and didn't exist in sesa-employees: ", res);
                resolve(res);
              }).catch(err => {
                Log.l("Server.deleteUser(): Error getting or deleting user. Guess there's no need to finish up.");
                Log.e(err);
                resolve(false);
              });
            }).catch(err => {
              Log.l("Server.deleteUser(): Error removing doc from sesa-employees.");
              Log.e(err);
              reject(err);
            });
          }).catch(err => {
            Log.l("Server.deleteUser(): Unable to retrieve user from sesa-employees! Checking _users …");
            rdb1.getUser(un).then((res:PDBUser) => {
              Log.l("Server.deleteUser(): Got user from _users database: ", res);
              Log.l("Server.deleteUser(): now deleting user from _users database …");
              // return this.deleteDoc(rdb3, res);
              // let id = res['_id'];
              return rdb1.deleteUser(un);
            }).then((res:PDBResponse) => {
              Log.l("Server.deleteUser(): User deleted from _users, and didn't exist in sesa-employees: ", res);
              resolve(res);
           }).catch(err => {
              Log.l("Server.deleteUser(): Error getting or deleting user. Guess there's no need to finish up.");
              Log.e(err);
              resolve(false);
            });
          });
        } else {
          Log.e("Server.deleteUser(): Unable to delete user, current user is not admin. Session was:\n", session);
          reject(session);
        }
      }).catch(err => {
        Log.l("Server.deleteUser(): Error attempting to login and get session. Can't delete user.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getRDBs():DBList {
    return this.pouchdb.rdb;
  }

  public addSync(dbname:string, dbsync:PDBSync):PDBSync {
    return this.pouchdb.addSync(dbname, dbsync);
  }

  // public addSync(dbname:string, dbsync:any) {
  //   return ServerService.addSync(dbname, dbsync);
  // }

  public getSync(dbname:string):PDBSync {
    return this.pouchdb.getSync(dbname);
  }

  // public getSync(dbname:string):any {
  //   return ServerService.getSync(dbname);
  // }

  public getAllSyncs():DBSyncList {
    let syncmap:DBSyncList = this.pouchdb.PDBSyncs;
    return syncmap;
  }

  public cancelSync(dbname:string):any {
    return this.pouchdb.cancelSync(dbname);
  }
  public cancelAllSyncs():any {
    return this.pouchdb.cancelAllSyncs();
  }
  public clearAllSyncs():any {
    return this.pouchdb.clearAllSyncs();
  }

  public addInitialSync(dbname:string, dbsync:PDBSync):PDBSync {
    return this.pouchdb.addInitialSync(dbname, dbsync);
  }

  public getInitialSync(dbname:string):PDBSync {
    return this.pouchdb.getInitialSync(dbname);
  }

  public getAllInitialSyncs():DBSyncList {
    // let syncmap = this.pouchdb.PDBSyncs;
    // return syncmap;
    return this.pouchdb.getAllInitialSyncs();
  }

  public cancelInitialSync(dbname:string):any {
    return this.pouchdb.cancelInitialSync(dbname);
  }
  public cancelAllInitialSyncs():any {
    return this.pouchdb.cancelAllInitialSyncs();
  }
  public clearAllInitialSyncs():any {
    return this.pouchdb.clearAllInitialSyncs();
  }

  public getScheduleJobsites():Promise<Jobsite[]> {
    Log.l("Server.getScheduleJobsites(): Retrieving job sites …");
    return new Promise((resolve, reject) => {
      let dbname:string = this.prefs.getDB('jobsites');
      let rdb1:Database = this.addRDB(dbname);
      rdb1.allDocs(noDesign2).then((res:AllDocsResponse) => {
        Log.l("Server.getScheduleJobsites(): Got allDocs for jobsites:", res);
        let jsArray:Jobsite[] = [];
        let rows:AllDocsRows = res.rows;
        for(let item of rows) {
          if(item.doc) {
            let doc:PouchDoc = item.doc;
            let client:any = doc.client;
            if(client) {
              let js:Jobsite = new Jobsite();
              js.readFromDoc(item.doc);
              jsArray.push(js);
            }
          }
        }
        Log.l("Server.getScheduleJobsites(): Created jobsite array:", jsArray);
        resolve(jsArray);
      }).catch((err) => {
        Log.l("Server.getScheduleJobsites(): Error getting allDocs from jobsites!");
        Log.e(err);
        resolve([]);
      })
    });
  }

  public getSchedule(date?:Moment|Date|string, employees?:Employee[]):Promise<Schedule> {
    Log.l("Server.getSchedule(): Firing up …");
    let key:string = "current";
    if(date) {
      if(isMoment(date) || date instanceof Date) {
        key = moment(date).format("YYYY-MM-DD");
      } else if(typeof date === 'string') {
        key = date;
      }
    }
    return new Promise((resolve,reject) => {
      let rdb1:Database = this.addRDB('sesa-scheduling');
      rdb1.get(key).then((doc:PouchDoc) => {
        if(doc) {
          let schedule:Schedule = new Schedule();
          schedule.readFromDoc(doc);
          if(employees) {
            schedule.loadTechs(employees);
          }
          resolve(schedule);
        } else {
          resolve(null);
        }
      }).catch((err) => {
        Log.l("Server.getSchedule(): Error retrieving schedule document!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public backupSchedule(scheduleDoc):Promise<UpsertResponse> {
    let id:string = scheduleDoc._id;
    Log.l(`Server.backupSchedule(): Saving a backup copy of schedule '${id}' …`);
    return new Promise((resolve,reject) => {
      let dbname:string = this.prefs.getDB('scheduling');
      let rdb1:Database = this.addRDB(dbname);
      this.storage.persistentSave("onsiteconsolex-schedule-latest", scheduleDoc).then((res:any) => {
        return rdb1.get(id);
      }).then((res:PouchDoc) => {
        let oldDoc:PouchDoc = res;
        let now:Moment = moment();
        let start:Moment = scheduleDoc.start || now;
        let dateObject:Moment = moment(start);
        let dateString:string = dateObject.format("YYYY-MM-DD");
        // let docID = id + "_backup_" + now.toExcel();

        // let docID = "backup_" + id + "_" + now.toExcel();
        let docID:string = "backup_" + id + "_" + now.format("YYYY-MM-DD-HH-mm-ss.SSSZ");
        oldDoc._id = docID;
        oldDoc.backup = true;
        delete oldDoc._rev;
        rdb1.upsert(oldDoc._id, (doc:UpsertDiffDoc) => {
          if(doc && doc._rev) {
            let rev:string = doc._rev;
            doc = oldDoc;
            doc._rev = rev;
          } else {
            doc = oldDoc;
            delete doc._rev;
          }
          return doc;
        }).then((res:UpsertResponse) => {
          if(!res.ok && !res.updated) {
            Log.l(`Server.backupSchedule(): Schedule '${id}' found but error upserting backup '${docID}'.`);
            Log.e(res);
            // resolve({message: `'${id}' found but error upserting ${docID}.`});
            resolve(res);
          } else {
            Log.l(`Server.backupSchedule(): Successfully backed up schedule '${id}' as '${docID}'.`);
            resolve(res);
          }
        }).catch(err => {
          Log.l(`Server.backupSchedule(): Error backing up '${id}' to '${docID}'.`);
          // resolve({message: `'${id}' error being backed up to '${docID}'.`})
          resolve(err);
        });
      }).catch(err => {
        if(err.status === 404) {
          // resolve({message: `Schedule '${id}' does not exist, no backup needed.`});
          resolve(err);
        } else {
          Log.l("Server.backupSchedule(): Error getting backup schedule.");
          // resolve({message: `Non-404 error getting schedule '${id}'`});
          resolve(err);
        }
      });
    });
  }

  public async saveSchedule(scheduleDoc, overwrite?:boolean):Promise<UpsertResponse> {
    try {
      Log.l("Server.saveSchedule(): Firing up …");
      let id:string = scheduleDoc._id;
      let dbname:string = this.prefs.getDB('scheduling');
      let rdb1:Database = this.addRDB(dbname);
      let res:UpsertResponse;
      // res = await this.backupSchedule(scheduleDoc);
      scheduleDoc._id = id;
      res = await rdb1.upsert(scheduleDoc._id, (doc:UpsertDiffDoc) => {
        if(doc && doc._rev) {
          let rev:string = doc._rev;
          doc = scheduleDoc;
          doc._rev = rev;
        } else {
          // doc.schedule = scheduleDoc.schedule;
          doc = scheduleDoc;
          delete doc._rev;
        }
        return doc;
      });
      if(!res.ok && !res.updated) {
        Log.l(`Server.saveSchedule(): Upsert error saving schedule ${scheduleDoc._id}:`, res);
        throw res;
      } else {
        Log.l(`Server.saveSchedule(): Successfully saved schedule ${scheduleDoc._id}:`, res);
        return res;
      }
    } catch(err) {
      Log.l(`saveSchedule(): Error saving schedule: `, scheduleDoc);
      Log.e(err);
      throw err;
    }
  }

  public getScheduleForDates(startDate:string, endDate:string):Promise<FindResponse> {
    return new Promise((resolve, reject) => {
      let dbname:string = this.prefs.getDB('scheduling');
      let rdb1:Database = this.addRDB(dbname);
      // let id = startDate + "_" + endDate;
      let id:string = startDate;
      let query:FindRequest = { selector: { _id: { $eq: id } } };
      // rdb1.createIndex({index: {fields: ["_id"]}}).then(res => {
        // Log.l("getScheduleForDates(): Successfully created index, now retrieving schedule for %s to %s …", startDate, endDate);
        // return rdb1.find(query);
      rdb1.find(query).then((res:FindResponse) => {
        Log.l("Server.getScheduleForDates(): Got back query:\n", res);
        if(res && res.docs && res.docs.length) {
          resolve(res);
        } else {
          let err:Error = new Error("Server.getScheduleForDates() returned but without any documents!");
          reject(err);
        }
      }).catch(err => {
        Log.l("Server.getScheduleForDates(): Error getting schedule for %s to %s.", startDate, endDate);
        Log.e(err);
        reject(err);
        // resolve(false);
      });
    });
  }

  public getAllDocs(dbname:string, params?:AllDocsOptions):Promise<PouchDoc[]> {
    Log.l(`Server.getAllDocs(): Getting all docs from '${dbname}' …`);
    let rdb1:Database = this.addRDB(dbname);
    let options:AllDocsOptions = params ? params : GETDOCS;
    return new Promise((resolve,reject) => {
      return rdb1.allDocs(options).then((res:AllDocsResponse) => {
        let docArray:PouchDoc[] = [];
        let rows:AllDocsRows = res.rows;
        for(let item of rows) {
          let id:string = item.id;
          let doc:PouchDoc = item.doc;
          if(doc && id[0]!=='_') {
            docArray.push(doc);
          }
        }
        resolve(docArray);
      }).catch((err) => {
        Log.l(`Server.getAllDocs(): Error getting allDocs for '${dbname}'!`);
        Log.e(err);
        resolve([]);
      })
    });
  }

  public getConfigData(type:string, key?:string):Promise<any> {
    let dbname:string = this.prefs.getDB('config');
    let rdb1:Database = this.addRDB(dbname);
    Log.l(`Server.getConfigData(): Getting config data of type '${type}' …`);
    return new Promise((resolve,reject) => {
      let id:string = type.toLowerCase();
      rdb1.get(id).then((doc:PouchDoc) => {
        if(key && doc[key] != undefined) {
          resolve(doc[key]);
        } else {
          resolve(doc.list);
        }
      }).catch(err => {
        Log.l(`Server.getConfigData(): Error getting config data '${type}'`);
        Log.e(err);
        reject(err);
      })
    })
  }

  public async saveConfigData(key:CONFIGKEY, data:any):Promise<any> {
    try {
      // let dbname:string = this.prefs.getDB('config');
      // let rdb1:Database = this.addRDB(dbname);
      // if(key && data) {
      //   Log.l(`Server.saveConfigData(): Saving config data of type '${key}':`, data);
      //   if()
      //   let id:string = type.toLowerCase();
      //   let doc:PouchDoc = await rdb1.get(id);
      //   if(doc && doc[key] != undefined) {

      //   } else {
      //     resolve(doc.list);
      //   }
      //   return res;
      // }
    } catch(err) {
      Log.l(`Server.saveConfigData(): Error saving config data '${key}':`, data);
      Log.e(err);
      throw err;
    }
  }

  public async saveMaintenanceConfig(key:MaintenanceWordType, data:string[]):Promise<any> {
    try {
      if(key && Array.isArray(data) && data.length) {
        let dbname:string = this.prefs.getDB('config');
        let rdb1:Database = this.addRDB(dbname);
        Log.l(`Server.saveMaintenanceConfig(): Attempting to save maintenance report data of type '${key}':`, data);
        let id:string;
        if(key === 'mechanical_noun') {
          id = 'maintenance_mnouns';
        } else if(key === 'electronic_noun') {
          id = 'maintenance_enouns';
        } else if(key === 'verb') {
          id = 'maintenance_verbs';
        } else {
          let text = `Server.saveMaintenanceConfig(): Key must be 'mechanical_noun','electronic_noun', or 'verb'. Invalid key`;
          Log.w(text + ":", key);
          let err = new Error(text);
          throw err;
        }
        let res = await rdb1.upsert(id, (doc:any) => {
          if(doc && doc._rev) {
            doc.list = data;
          } else {
            doc.list = data;
          }
          return doc;
        });
        if(!res.ok && !res.updated) {
          let text = `Server.saveMaintenanceConfig(): Upsert error saving maintenance report data of type '${key}'`;
          Log.w(text + ":", res);
          let err = new Error(text);
          throw err;
        } else {
          Log.l(`Server.saveMaintenanceConfig(): Successfully saved maintenance report data of type '${key}':`, res);
          return res;
        }
      } else {
        Log.w(`Server.saveMaintenanceConfig(): Parameter 1 must be a string like 'maintenance_noun' '${key}':`, data);
      }
    } catch(err) {
      Log.l(`Server.saveMaintenanceConfig(): Error saving maintenance report data '${key}':`, data);
      Log.e(err);
      throw err;
    }
  }

  public getTechnicians() {
    Log.l('Server.getTechnicians(): Getting list of technicians …');
    // let options = {include_docs: true, start_key: '_\uffff'};
    let options:AllDocsOptions = GETDOCS;
    return new Promise((resolve,reject) => {
      this.getAllDocs('sesa-employees', options).then((docs:any[]) => {
        let docArray = [];
        Log.l("Server.getTechnicians(): got docs:\n", docs);
        for (let doc of docs) {

          let c = doc.userClass;
          let d = doc.roles;
          let u = doc.username;
          let ln = doc.lastName;
          if(c && Array.isArray(c)) {
            c = c[0].toUpperCase();
          } else if(c) {
            c = c.toUpperCase();
          }
          d = Array.isArray(d) ? d[0].toUpperCase() : d ? d.toUpperCase() : "";
          if(ln !== 'Sargeant' && u !== 'mike' && (c === "M-TECH" || c === "E-TECH" || c === "P-TECH" || c === "TECHNICIAN" || c === 'OFFICE' || c === 'MANAGER' || d === 'MANAGER' || d === 'OFFICE')) {
            let employee = new Employee();
            employee.readFromDoc(doc);
            docArray.push(employee);
          }
        }
        resolve(docArray);
      }).catch(err => {
        Log.l("Server.getTechnicians(): Error getting technicians!");  Log.e(err);
        resolve([]);
      });
    });
  }

  public async getAllCLL(type:CLLNames):Promise<SESACLL[]> {
    try {
      let dbname = this.prefs.getDB('config');
      let rdb1:Database = this.addRDB(dbname);
      let docid:string = "", record:string = "";
      if(type === 'client') {
        docid = 'client';
      } else if(type === 'location') {
        docid = 'location';
      } else if(type === 'locID') {
        docid = 'locid';
      }
      record = `${docid}s`;
      Log.l(`Server.getAllCLL(): Getting list of ${type}s …`);
      let doc:any = await rdb1.get(docid);
      Log.l(`Server.getAllCLL(): Got ${type} list:\n`, doc);
      let out:SESACLL[] = [];
      if(doc && doc[record] && Array.isArray(doc[record])) {
        for(let cll of doc[record]) {
          let item:SESACLL;
          if(type === 'client') {
            item = new SESAClient(cll);
          } else if(type === 'location') {
            item = new SESALocation(cll);
          } else if(type === 'locID') {
            item = new SESALocID(cll);
          }
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`Server.getAllCLL(): Error getting ${type} list.`);
      Log.e(err);
      return [];
    }
  }

  public async saveCLL(type:CLLNames, newCLL:SESACLL):Promise<SESACLL[]> {
    try {
      let dbname = this.prefs.getDB('config');
      let rdb1:Database = this.addRDB(dbname);
      let list   = 'list'    ;
      let docid:string = "", record:string = "";
      // if(type === 'client') {

      // } else if(type === 'location') {

      // } else if(type === 'locID') {

      // }
      if(type === 'client') {
        docid = 'client';
        record = 'clients';
      } else if(type === 'location') {
        docid = 'location';
        record = 'locations';
      } else if(type === 'locID') {
        docid = 'locid';
        record = 'locids';
      }
      let code   = newCLL && newCLL.code ? newCLL.code : "";
      let res:any = await rdb1.upsert(docid, (doc:any) => {
        if(doc) {
          if(doc[record] && Array.isArray(doc[record])) {
            // let sorted = doc[record].sort((a:any, b:any) => {
            //   let iA = a && a.id !== undefined ? a.id : -1;
            //   let iB = b && b.id !== undefined ? b.id : -1;
            //   return iA > iB ? 1 : iA < iB ? -1 : 0;
            // });

            doc[record].push(newCLL);
          } else {
            doc[record] = [newCLL];
          }
        } else {
          doc._id = docid;
          doc[record] = [newCLL];
        }
        doc['list'] = doc[record].map((a:any) => a.code);
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        Log.l(`Server.saveCLL(): Error saving ${type}:\n`, newCLL);
        Log.e(res);
        throw new Error(res);
      } else {
        Log.l(`Server.saveCLL(): ${type} saved:\n`, res);
        let out:SESACLL[] = await this.getAllCLL(type);
        return out;
      }
    } catch(err) {
      Log.l(`Server.saveCLL(): Error saving ${type}:\n`, newCLL);
      Log.e(err);
      throw err;
    }
  }

  public async saveCLLs(type:CLLNames, newCLLs:SESACLL[]):Promise<SESACLL[]> {
    try {
      let dbname = this.prefs.getDB('config');
      let rdb1:Database = this.addRDB(dbname);
      let list   = 'list'    ;
      let docid:string = "", record:string = "";
      if(type === 'client') {
        docid = 'client';
        record = 'clients';
      } else if(type === 'location') {
        docid = 'location';
        record = 'locations';
      } else if(type === 'locID') {
        docid = 'locid';
        record = 'locids';
      } else {
        Log.w(`Server.saveCLLs(): Type invalid:\n`, type);
        throw new Error("Server.saveCLLs(): Invalid type specified");
      }
      // let code   = newCLL && newCLL.code ? newCLL.code : "";
      let res:any = await rdb1.upsert(docid, (doc:any) => {
        if(doc) {
          doc[record] = newCLLs;
        }
        doc['list'] = doc[record].map((a:any) => a.code);
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        Log.l(`Server.saveCLLs(): Error saving ${type}s:\n`, newCLLs);
        Log.e(res);
        throw new Error(res);
      } else {
        Log.l(`Server.saveCLLs(): ${type}s saved:\n`, res);
        let out:SESACLL[] = await this.getAllCLL(type);
        return out;
      }
    } catch(err) {
      Log.l(`Server.saveCLLs(): Error saving ${type}s:\n`, newCLLs);
      Log.e(err);
      throw err;
    }
  }

  public async getClients():Promise<SESAClient[]> {
    let type:CLLNames = 'client';
    try {
      let res:SESAClient[] = await this.getAllCLL(type);
      return res;
    } catch(err) {
      Log.l(`Server.getClients(): Error getting ${type} list!`);
      Log.e(err);
      return [];
    }
  }

  public async saveClient(item:SESAClient):Promise<SESAClient[]> {
    let type:CLLNames = 'client';
    try {
      let res:SESAClient[] = await this.saveCLL(type, item);
      return res;
    } catch(err) {
      Log.l(`Server.saveClient(): Error saving ${type}:\n`, item);
      Log.e(err);
      return [];
    }
  }

  public async saveClients(items:SESAClient[]):Promise<SESAClient[]> {
    let type:CLLNames = 'client';
    try {
      let res:SESAClient[] = await this.saveCLLs(type, items);
      return res;
    } catch(err) {
      Log.l(`Server.saveClients(): Error saving ${type}s:\n`, items);
      Log.e(err);
      return [];
    }
  }

  public async getLocations():Promise<SESALocation[]> {
    let type:CLLNames = 'location';
    try {
      let res:SESALocation[] = await this.getAllCLL(type);
      return res;
    } catch(err) {
      Log.l(`Server.getLocations(): Error getting ${type} list!`);
      Log.e(err);
      return [];
    }
  }

  public async saveLocation(item:SESALocation):Promise<SESALocation[]> {
    let type:CLLNames = 'location';
    try {
      let res:SESALocation[] = await this.saveCLL(type, item);
      return res;
    } catch(err) {
      Log.l(`Server.saveLocation(): Error saving ${type}:\n`, item);
      Log.e(err);
      return [];
    }
  }

  public async saveLocations(items:SESALocation[]):Promise<SESALocation[]> {
    let type:CLLNames = 'location';
    try {
      let res:SESALocation[] = await this.saveCLLs(type, items);
      return res;
    } catch(err) {
      Log.l(`Server.saveLocations(): Error saving ${type}s:\n`, items);
      Log.e(err);
      return [];
    }
  }

  public async getLocIDs():Promise<SESALocID[]> {
    let type:CLLNames = 'locID';
    try {
      let out:SESALocID[] = [];
      let res:SESACLL[] = await this.getAllCLL(type);
      for(let item of res) {
        if(item instanceof SESALocID) {
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`Server.getLocIDs(): Error getting ${type} list!`);
      Log.e(err);
      return [];
    }
  }

  public async saveLocID(item:SESALocID):Promise<SESALocID[]> {
    let type:CLLNames = 'locID';
    try {
      let out:SESALocID[] = [];
      let res:SESACLL[] = await this.saveCLL(type, item);
      for(let item of res) {
        if(item instanceof SESALocID) {
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`Server.saveLocation(): Error saving ${type}:\n`, item);
      Log.e(err);
      return [];
    }
  }

  public async saveLocIDs(items:SESALocID[]):Promise<SESALocID[]> {
    let type:CLLNames = 'location';
    try {
      let out:SESALocID[] = [];
      let res:SESACLL[] = await this.saveCLLs(type, items);
      for(let item of res) {
        if(item instanceof SESALocID) {
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`Server.saveLocIDs(): Error saving ${type}s:\n`, items);
      Log.e(err);
      return [];
    }
  }

  // public getLocations() {
  //   Log.l("getLocations(): Getting list of locations …");
  //   let rdb1:Database = this.addRDB('sesa-config');
  //   return new Promise((resolve,reject) => {
  //     rdb1.get('location').then((doc:any) => {
  //       Log.l("getLocations(): Got location list:\n", doc);
  //       if(doc.locations) {
  //         resolve(doc.locations);
  //       } else {
  //         resolve([]);
  //       }
  //     }).catch((err) => {
  //       Log.l("getLocations(): Error getting location list.");
  //       Log.e(err);
  //       resolve([]);
  //     });
  //   });
  // }

  // public saveLocation(newLocation:any) {
  //   Log.l("saveLocation(): Saving new location to list …");
  //   let rdb1:Database = this.addRDB('sesa-config');
  //   return new Promise((resolve,reject) => {
  //     rdb1.get('location').then((doc:any) => {
  //       Log.l("saveLocation(): Got location list:\n", doc);
  //       doc.locations.push(newLocation);
  //       doc.list.push(newLocation.name);
  //       return rdb1.put(doc);
  //     }).then((res) => {
  //       Log.l("saveLocation(): Saved updated location list.\n", res);
  //       resolve(res);
  //     }).catch((err) => {
  //       Log.l("saveLocation(): Error saving updated location list.");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  // public getLocIDs() {
  //   Log.l("getLocIDs(): Getting list of locIDs …");
  //   let rdb1:Database = this.addRDB('sesa-config');
  //   return new Promise((resolve,reject) => {
  //     rdb1.get('locid').then((doc:any) => {
  //       Log.l("getLocIDs(): Got locID list:\n", doc);
  //       if(doc.locids) {
  //         resolve(doc.locids);
  //       } else {
  //         resolve([]);
  //       }
  //     }).catch((err) => {
  //       Log.l("getLocIDs(): Error getting locID list.");
  //       Log.e(err);
  //       resolve([]);
  //     });
  //   });
  // }

  // public saveLocID(newLocation:any) {
  //   Log.l("saveLocID(): Saving new locID to list …");
  //   let rdb1:Database = this.addRDB('sesa-config');
  //   return new Promise((resolve,reject) => {
  //     rdb1.get('locid').then((doc:any) => {
  //       Log.l("saveLocID(): Got location list:\n", doc);
  //       doc.locids.push(newLocation);
  //       doc.list.push(newLocation.name);
  //       return rdb1.put(doc);
  //     }).then((res) => {
  //       Log.l("saveLocID(): Saved updated location list.\n", res);
  //       resolve(res);
  //     }).catch((err) => {
  //       Log.l("saveLocID(): Error saving updated location list.");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public getLoc2nds() {
    Log.l("Server.getLoc2nds(): Getting list of loc2nds …");
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('loc2nd').then((doc:any) => {
        Log.l("Server.getLoc2nds(): Got loc2nd list:", doc);
        if (doc.loc2nds) {
          resolve(doc.loc2nds);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("Server.getLoc2nds(): Error getting loc2nd list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public saveLoc2nd(newLoc2nd:any) {
    Log.l("Server.saveLoc2nd(): Saving new loc2nd to list …");
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('loc2nd').then((doc:any) => {
        Log.l("Server.saveLoc2nd(): Got loc2nd list:", doc);
        doc.locids.push(newLoc2nd);
        doc.list.push(newLoc2nd.name);
        return rdb1.put(doc);
      }).then((res) => {
        Log.l("Server.saveLoc2nd(): Saved updated loc2nd list.", res);
        resolve(res);
      }).catch((err) => {
        Log.l("Server.saveLoc2nd(): Error saving updated loc2nd list.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getShiftRotations() {
    Log.l("Server.getShiftRotations(): Getting list of loc2nds …");
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('rotation').then((doc:any) => {
        Log.l("Server.getShiftRotations(): Got rotation list:", doc);
        if (doc.rotations) {
          resolve(doc.rotations);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("Server.getShiftRotations(): Error getting rotation list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public saveShiftRotation(newShiftRotation:any):Promise<any> {
    Log.l("Server.saveShiftRotation(): Saving new rotation to list …");
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('rotation').then((doc:any) => {
        Log.l("Server.saveShiftRotation(): Got rotation list:", doc);
        doc.rotations.push(newShiftRotation);
        doc.list.push(newShiftRotation.name);
        return rdb1.put(doc);
      }).then((res) => {
        Log.l("Server.saveShiftRotation(): Saved updated rotation list.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("Server.saveShiftRotation(): Error saving updated rotation list.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getTechShifts():Promise<any[]> {
    Log.l("Server.getTechShifts(): Getting list of tech shifts …");
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve, reject) => {
      rdb1.get('shift').then((doc:any) => {
        Log.l("Server.getTechShifts(): Got tech shift list:", doc);
        if (doc.list) {
          resolve(doc.list);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("Server.getTechShifts(): Error getting tech shift list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public async getAllConfigData():Promise<any> {
    try {
      Log.l("Server.getAllConfigData(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, and shiftTimes …");
      let configKeys = [
        'client',
        'location',
        'locid',
        'rotation',
        'shift',
        'shiftlength',
        'shiftstarttime',
        'other_reports',
        'maintenance_enouns',
        'maintenance_mnouns',
        'maintenance_verbs',
      ];
      let dbname = this.prefs.getDB('config');
      let rdb1 = this.addRDB(dbname);
      // return new Promise((resolve, reject) => {
        // rdb1.allDocs({ keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shiftstarttime', 'other_reports'], include_docs: true }).then((records) => {
      let records:any = await rdb1.allDocs({ keys: configKeys, include_docs: true });
      Log.l("Server.getAllConfigData(): Retrieved documents:", records);
      let results = { clients: [], locations: [], locids: [], loc2nds: [], rotations: [], shifts: [], shiftlengths: [], shiftstarttimes: [], report_types: [], training_types: [], maintenance_enouns: [], maintenance_mnouns: [], maintenance_verbs: [], };
      for(let record of records.rows) {
        let type = record.id;
        let types = record.id + "s";
        if(type.includes('maintenance')) {
          types = type;
        }
        if(type === 'other_reports') {
          let doc                = record.doc         ;
          let report_types       = doc.report_types   ;
          let training_types     = doc.training_types ;
          results.report_types   = report_types       ;
          results.training_types = training_types     ;
        } else {
          Log.l(`Server.getAllConfigData(): Now retrieving type '${type}'...`);
          let doc = record.doc;
          if(doc) {
            if(doc[types]) {
              for(let result of doc[types]) {
                results[types].push(result);
              }
            } else {
              for(let result of doc.list) {
                results[type].push(result);
              }
            }
          }
        }
      }
      let clients:SESAClient[] = [];
      let locations:SESALocation[] = [];
      let locIDs:SESALocID[] = [];
      for(let row of results.clients) {
        let item:SESAClient = new SESAClient(row);
        clients.push(item);
      }
      for(let row of results.locations) {
        let item:SESALocation = new SESALocation(row);
        locations.push(item);
      }
      for(let row of results.locids) {
        let item:SESALocID = new SESALocID(row);
        locIDs.push(item);
      }
      results.clients = clients;
      results.locations = locations;
      results.locids = locIDs;
      Log.l("Server.getAllConfigData(): Final config data retrieved is:", results);
      return results;
    } catch(err) {
      Log.l(`Server.getAllConfigData(): Error getting config data!`);
      Log.e(err);
      throw err;
    }
  }

  public getAllConfigDataOld() {
    Log.l("Server.getAllConfigData(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, and shiftTimes …");
    let configKeys = [
      'client',
      'location',
      'locid',
      'rotation',
      'shift',
      'shiftlength',
      'shiftstarttime',
      'other_reports',
      'maintenance_enouns',
      'maintenance_mnouns',
      'maintenance_verbs',
    ];
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve, reject) => {
      rdb1.allDocs({ keys: configKeys, include_docs: true }).then((records) => {
        Log.l("Server.getAllConfigData(): Retrieved documents:", records);
        let results = { clients: [], locations: [], locids: [], loc2nds: [], rotations: [], shifts: [], shiftlengths: [], shiftstarttimes: [], report_types: [], training_types: [], maintenance_enouns: [], maintenance_mnouns: [], maintenance_verbs: [], };
        for(let record of records.rows) {
          // let record = records[i];
          let doc:any = record.doc;
          let type = record.id;
          let types = type + "s";
          if(type.includes('maintenance')) {

          }
          if(doc) {
            Log.l("Server.getAllConfigData(): Found doc, looking for type '%s'", types);
            Log.l(doc);
            if (doc[types]) {
              for (let result of doc[types]) {
                results[types].push(result);
              }
            } else {
              for (let result of doc.list) {
                results[types].push(result);
              }
            }
          }
        }
        Log.l("Server.getAllConfigData(): Final config data retrieved is:", results);
        resolve(results);
      }).catch((err) => {
        Log.l("Server.getAllConfig(): Error getting all config docs!");
        Log.e(err);
        // resolve([]);
        reject(err);
      });
    });
  }

  public getAllConfig() {
    Log.l("getAllConfig(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, shiftTimes, shiftLengths, shiftTypes, and shiftStartTimes …");
    let rdb1:Database = this.addRDB('sesa-config');
    return new Promise((resolve, reject) => {
      rdb1.allDocs({keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shifttype', 'shiftstarttime'], include_docs:true}).then((docs) => {
        let results = {client: [], location: [], locid: [], loc2nd: [], rotation: [], shift: [], shiftlength: [], shifttype: [], shiftstarttime: []};
        for(let type in docs.rows[0].doc) {
          let item = docs[type];
          if(item.doc) {
            results[type].push(item.doc);
          }
        }
        resolve(results);
      }).catch((err) => {
        Log.l("getAllConfig(): Error getting all config docs!");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public async getEmployees():Promise<Employee[]> {
    try {
      let res:any = await this.getEmployeeDocs();
      // Additional code
      let employees:Employee[] = [];
      for(let doc of res) {
        let tech = new Employee();
        tech.deserialize(doc);
        employees.push(tech);
      }
      return employees;
    } catch(err) {
      Log.l(`getEmployees(): Error getting Employee list!`);
      Log.e(err);
      throw err;
    }
  }

  public getEmployeeDocs():Promise<any[]> {
    Log.l("getEmployees(): Now retrieving employees …");
    return new Promise((resolve, reject) => {
      let rdb1:Database = this.addRDB('sesa-employees');
      rdb1.allDocs(GETDOCS).then((res) => {
        Log.l(`getEmployees(): Success! Result:\n`, res);
        let docArray = [];
        for(let item of res.rows) {
          if(item.doc && item.id[0] !== '_') {
            let doc = item.doc;
            let user = new Employee();
            user.readFromDoc(doc);
            docArray.push(user);
          }
        }
        resolve(docArray);
      }).catch((err) => {
        Log.l(`getEmployees(): Error!`);
        Log.e(err);
        resolve([]);
      });
    });
  }

  public async getLoginUser(tech:Employee):Promise<PDBUser> {
    try {
      let username:string = tech.getUsername();
      let rdb1:Database = this.addRDB('_users');
      // let db2 = this.addDB('sesa-employees');
      let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1 = window.atob(u), p2 = window.atob(p);
      let authToken = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts = { headers: { Authorization: authToken } };
      // let opts:PDBLoginOptions = { ajax: ajaxOpts };
      let opts:PDBLoginOptions = {};
      let un = tech.avatarName;
      let user_id = tech['_id'] ? tech['_id'] : "UNKNOWN_USER_ID";
      try {
        let loginOptions:PDBLoginOptions = null;
        let res:any = await rdb1.logIn(u1, p2, loginOptions);
        // let dbname = this.prefs.getDB('reports');
        // let rdb2 = this.addRDB(dbname);
        res = await rdb1.getUser(username);
        Log.l(`getLoginuser(): Successfully got user '${username}':\n`, res);
        return res;
      } catch(err) {
        Log.l(`getLoginUser(): Error getting login user: user not found or admin login error`);
        Log.e(err);
        return null;
        // throw err;
      }
      // // Additional code
      // return res;
    } catch(err) {
      Log.l(`getLoginUser(): Error during getLoginUser()`);
      Log.e(err);
      throw err;
    }
  }

  public getAdminAuth():{u:string,p:string} {
    let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
    let u1 = window.atob(u), p2 = window.atob(p);
    let out:{u:string,p:string} = {
      u: u1,
      p: p2,
    };
    return out;
  }

  public getLoginOptions():any {
    let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
    let u1 = window.atob(u), p2 = window.atob(p);
    let authToken = 'Basic ' + window.btoa(u1 + ':' + p2);
    let ajaxOpts = { headers: { Authorization: authToken } };
    let opts = { ajax: ajaxOpts };
    return opts;
  }

  public async deleteLoginUser(tech:Employee):Promise<boolean> {
    try {
      let username:string = tech.getUsername();
      let dbname:string = '_users';
      let rdb1:Database = this.addRDB(dbname);
      // let db2 = this.addDB('sesa-employees');
      let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1 = window.atob(u), p2 = window.atob(p);
      let authToken = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts = { headers: { Authorization: authToken } };
      // let opts:PDBLoginOptions = { ajax: ajaxOpts };
      let opts:PDBLoginOptions = {};
      // let un = tech.avatarName;
      // let user_id = tech['_id'] ? tech['_id'] : "UNKNOWN_USER_ID";
      try {
        let loginOptions:PDBLoginOptions = null;
        let res:PDBLoginResponse = await rdb1.logIn(u1, p2, loginOptions);
        // let dbname = this.prefs.getDB('reports');
        // let rdb2 = this.addRDB(dbname);
        let res2:PDBResponse = await rdb1.deleteUser(username);
        Log.l(`deleteLoginUser(): Successfully deleted user '${username}':\n`, res);
        return true;
      } catch(err) {
        Log.l(`deleteLoginUser(): Error deleting login user: user not found or admin login error`);
        Log.e(err);
        return false;
        // throw err;
      }
      // // Additional code
      // return res;
    } catch(err) {
      Log.l(`deleteLoginUser(): Error during deleteLoginUser()`);
      Log.e(err);
      throw err;
    }
  }

  public async createLoginUser(tech:Employee):Promise<boolean> {
    try {
      let username:string = tech.getUsername();
      let dbname:string = '_users';
      let rdb1:Database = this.addRDB(dbname);
      let opts:PDBLoginOptions = this.getLoginOptions();
      let ua = this.getAdminAuth();
      let u1 = ua.u, p2 = ua.p;
      // let un = tech.avatarName;
      // let user_id = tech['_id'] ? tech['_id'] : "UNKNOWN_USER_ID";
      let userOptions:PDBPutUserOptions;
      try {
        let loginOptions:PDBLoginOptions = null;
        let res:PDBLoginResponse = await rdb1.logIn(u1, p2, loginOptions);
        // let dbname = this.prefs.getDB('reports');
        // let rdb2 = this.addRDB(dbname);
        let doc:PouchDoc = tech.serialize();
        userOptions = this.getUserCreationOptions(doc);
        let res2:PDBResponse = await rdb1.signUp(username, 'sesa1234', userOptions);
        Log.l(`createLoginUser(): Successfully created user '${username}':`, res2);
        return true;
      } catch(err) {
        Log.l(`createLoginUser(): Error creating login user`);
        Log.e(err);
        // if(err.name === 'conflict') {
        //   try {
        //     Log.l(`createLoginUser(): username existed, trying to update user …`);
        //     let res2:PDBResponse = await rdb1.putUser(username, userOptions);
        //   } catch(err2) {}
        //   Log.l()
        // }
        // return false;
        throw err;
      }
      // // Additional code
      // return res;
    } catch(err) {
      Log.l(`createLoginUser(): Error during createLoginUser()`);
      Log.e(err);
      throw err;
    }
  }

  // public getJobsites():Promise<any[]> {
  //   Log.l("getJobsites(): Retrieving job sites …");

  //   return new Promise((resolve, reject) => {
  //     let rdb1:Database = this.addRDB('sesa-jobsites');
  //     rdb1.allDocs(GETDOCS).then((docs) => {
  //       let docArray = [];
  //       Log.l("getJobsites(): Got allDocs for jobsites:\n", docs);
  //       for (let item of docs.rows) {
  //         if (item.doc && item.id[0] !== '_') {
  //           docArray.push(item.doc);
  //         }
  //       }
  //       Log.l("getJobsites(): Created docArray:\n", docArray);
  //       resolve(docArray);
  //     }).catch((err) => {
  //       Log.l("getJobsites(): Error getting allDocs from jobsites!");
  //       Log.e(err);
  //       resolve([]);
  //     })
  //   });
  // }

  public async getJobsites():Promise<Jobsite[]> {
    Log.l("getJobsites(): Retrieving job sites …");
    try {
      let dbname = this.prefs.getDB('jobsites');
      let rdb1 = this.addDB(dbname);
      let res:any = await rdb1.allDocs(GETDOCS)
      Log.l("getJobsites(): Got allDocs for jobsites:\n", res);
      let sites:Jobsite[] = [];
      for(let row of res.rows) {
        let doc:any = row.doc;
        if(doc && row.id && row.id[0] !== '_') {
          let site:Jobsite = Jobsite.deserialize(doc);
          sites.push(site);
        }
      }
      Log.l("getJobsites(): Created jobsite array:\n", sites);
      return sites;
    } catch(err) {
      Log.l(`getJobsites(): Error getting allDocs from jobsites!`);
      Log.e(err);
      // throw err;
      return [];
    }
  }

  public saveJobsite(jobsite:Jobsite) {
    Log.l("saveJobsite(): Saving job site …", jobsite);
    return new Promise((resolve,reject) => {
      let rdb1:Database = this.addRDB('sesa-jobsites');
      // if(!jobsite._id) {
      //   if(typeof jobsite.loc2nd === 'string' && jobsite.loc2nd.length > 0) {
      //     jobsite._id = `${jobsite.client.name}_${jobsite.location.name}_${jobsite.loc2nd}_${jobsite.locID.name}`;
      //   } else {
      //     jobsite._id = `${jobsite.client.name}_${jobsite.location.name}_${jobsite.locID.name}`;
      //   }
      // }
      if(!jobsite._id) {
        if(jobsite instanceof Jobsite) {
          jobsite._id = jobsite.getSiteID();
        }
      }
      Log.l(`Now attempting to save jobsite '${jobsite._id}:`,jobsite);
      rdb1.get(jobsite._id).then((res) => {
        Log.l(`saveJobsite(): Retrieved jobsite '${jobsite._id}' successfully:`, res);
        jobsite._rev = res._rev;
        Log.l(`saveJobsite(): Now saving jobsite '${jobsite._id}' …`);
        return rdb1.put(jobsite);
      }).then((res) => {
        Log.l(`saveJobsite(): Successfully saved job site ${jobsite._id}.`, res);
        resolve(res);
      }).catch((err) => {
        if(err)
        Log.l("saveJobsite(): Error saving job site!");
        Log.e(err);
        if(err['status'] == 404) {
          Log.l(`saveJobsite(): Jobsite ${jobsite._id} was not found, saving new …`);
          rdb1.put(jobsite).then((res) => {
            Log.l(`saveJobsite(): Jobsite ${jobsite._id} was newly saved successfully!\n`, res);
            resolve(res);
          }).catch((err) => {
            Log.l(`saveJobsite(): Error saving new jobsite ${jobsite._id}!`);
            Log.l(err);
            reject(err);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  public async getAllReports(startDate?:Moment|Date):Promise<Report[]> {
    try {
      let dbname = this.prefs.getDB('reports');
      let rdb1:Database = this.addRDB(dbname);
      let options:any = GETDOCS;
      let res:any = await rdb1.allDocs(options);
      Log.l("Server.getAllReports(): Got documents:\n", res);
      let reports:Report[] = [];
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row.id[0] !== "_" && row['doc'] !== undefined) {
            let doc = row['doc'];
            let tmpReport = new Report();
            tmpReport.readFromDoc(doc);
            reports.push(tmpReport);
          }
        }
      }
      if(startDate) {
        let startDateString = moment(startDate).format("YYYY-MM-DD");
        reports = reports.filter((a:Report) => {
          return a.report_date >= startDateString;
        });
      }
      Log.l("Server.getAllReports(): Got reports:\n", reports);
      return reports;
    } catch(err) {
      Log.l("Server.getAllReports(): Error getting all work reports!");
      Log.e(err);
      throw err;
    }
  }

  // public getReports(dbname:string) {
  //   let rdb1:Database = this.addRDB(dbname);
  //   return new Promise((resolve, reject) => {
  //     rdb1.allDocs(GETDOCS).then(res => {
  //       Log.l("getAllReports(): Got documents:\n", res);
  //       let docArray = new Report[]();
  //       for (let row of res.rows) {
  //         if (row.id[0] !== "_" && row['doc'] !== undefined) {
  //           let doc = row['doc'];
  //           let tmpReport = new Report();
  //           tmpReport.readFromDoc(doc);
  //           docArray.push(tmpReport);
  //         }
  //       }
  //       Log.l("getAllReports(): Got reports:\n", docArray);
  //       resolve(docArray);
  //     }).catch(err => {
  //       Log.l("getAllReports(): Error getting all work reports!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  // public getAllReportsPlusNew():Promise<Report[]> {
  //   let tmpReports = new Report[]();
  //   return new Promise((resolve,reject) => {
  //     this.getAllReports().then((res:Report[]) => {
  //       Log.l("getAllReportsPlusNew(): Got first batch of report documents:\n", res);
  //       for(let report of res) {
  //         tmpReports.push(report);
  //       }
  //       return this.getReports('reports_ver101100');
  //     }).then((res: Report[]) => {
  //       Log.l("getAllReportsPlusNew(): Got second batch of report documents:\n", res);
  //       for(let report of res) {
  //         tmpReports.push(report);
  //       }
  //       Log.l("getAllReportsPlusNew(): Returning final array of reports:\n", tmpReports);
  //       resolve(tmpReports);
  //     }).catch(err => {
  //       Log.l("getAllReportsPlusNew(): Error retrieving reports.");
  //       Log.e(err);
  //       reject(err);
  //     })
  //   });
  // }

  public async getReportOthers(spinnerID?:string):Promise<ReportOther[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getOtherReports(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    try {
      let dbname:string = this.prefs.getDB('reports_other');
      let rdb1:Database = this.addRDB(dbname);
      // this.loading.setContent("Processing non-work reports …");
      let res:AllDocsResponse = await rdb1.allDocs(GETDOCS);
      Log.l(`Server.getReportOthers(): Successfully retrieved other reports:`, res);
      let others:ReportOther[] = [];
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] !== undefined) {
            let doc = row['doc'];
            let other = new ReportOther();
            other.readFromDoc(doc);
            others.push(other);
          }
        }
      }
      Log.l("Server.getReportOthers(): Returning array of other reports:", others);
      return others;
    } catch(err) {
      Log.l(`Server.getReportOthers(): Error retrieving ReportOther list!`);
      Log.e(err);
      throw err;
    }
  }

  public async getReportLogistics(spinnerID?:string):Promise<ReportLogistics[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Server.getReportLogistics(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    try {
      let dbname:string = this.prefs.getDB('logistics');
      let rdb1:Database = this.addRDB(dbname);
      // this.loading.setContent("Processing logistics reports …");
      let res:any = await rdb1.allDocs({ include_docs: true });
      Log.l(`Server.getReportLogistics(): Successfully retrieved logistics reports:`, res);
      let logistics:ReportLogistics[] = [];
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] !== undefined) {
            let doc = row['doc'];
            let logisticsReport:ReportLogistics = new ReportLogistics(doc);
            // logisticsReport.readFromDoc(doc);
            logistics.push(logisticsReport);
          }
        }
      }
      Log.l("Server.getReportLogistics(): Returning array of logistics reports:", logistics);
      return logistics;
    } catch(err) {
      Log.l(`Server.getReportLogistics(): Error retrieving ReportLogistics list!`);
      Log.e(err);
      throw err;
    }
  }

  public async getReportMaintenances(spinnerID?:string):Promise<ReportMaintenance[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Server.getReportMaintenances(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    try {
      let dbname:string = this.prefs.getDB('maintenances');
      let rdb1:Database = this.addRDB(dbname);
      // this.loading.setContent("Processing maintenance reports …");
      let res:any = await rdb1.allDocs({ include_docs: true });
      Log.l(`Server.getReportMaintenances(): Successfully retrieved maintenance reports:`, res);
      let maintenances:ReportMaintenance[] = [];
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] !== undefined) {
            let doc = row['doc'];
            let report:ReportMaintenance = new ReportMaintenance(doc);
            // logisticsReport.readFromDoc(doc);
            maintenances.push(report);
          }
        }
      }
      Log.l("Server.getReportMaintenances(): Returning array of maintenance reports:", maintenances);
      return maintenances;
    } catch(err) {
      Log.l(`Server.getReportMaintenances(): Error retrieving ReportMaintenance list!`);
      Log.e(err);
      throw err;
    }
  }

  public async getReportDrivings(spinnerID?:string):Promise<ReportDriving[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getReportLogistics(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    try {
      let dbname:string = this.prefs.getDB('drivings');
      let rdb1:Database = this.addRDB(dbname);
      // this.loading.setContent("Processing driving reports …");
      let res:any = await rdb1.allDocs({ include_docs: true });
      Log.l(`Server.getReportDrivings(): Successfully retrieved driving reports:`, res);
      let drivings:ReportDriving[] = [];
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] !== undefined) {
            let doc = row['doc'];
            let report:ReportDriving = new ReportDriving(doc);
            // logisticsReport.readFromDoc(doc);
            drivings.push(report);
          }
        }
      }
      Log.l("Server.getReportDrivings(): Returning array of other reports:", drivings);
      return drivings;
    } catch(err) {
      Log.l(`Server.getReportDrivings(): Error retrieving ReportDriving list!`);
      Log.e(err);
      throw err;
    }
  }

  public async getReportTimeCards(spinnerID?:string):Promise<ReportTimeCard[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Server.getReportTimeCards(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getReportTimeCards(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    let reports:ReportTimeCard[] = [];
    try {
      let dbname:string = this.prefs.getDB('timecards');
      let db1:Database = this.addDB(dbname);
      // this.loading.setContent("Processing timecard reports …");
      let res:any = await db1.allDocs({ include_docs: true });
      Log.l(`Server.getReportTimeCards(): Successfully retrieved timecard reports:`, res);
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] != undefined) {
            let doc = row['doc'];
            let timecard:ReportTimeCard = new ReportTimeCard(doc);
            // logisticsReport.readFromDoc(doc);
            reports.push(timecard);
          }
        }
      }
      Log.l("Server.getReportTimeCards(): Returning array of timecard reports:", reports);
      return reports;
      // let u:string = this.ud.getUsername();
      // let p:string = this.ud.getPassword();
      // let dbname:string = this.prefs.getDB('timecards');
      // let query:any = {selector: {username: {$eq: username}}, limit:10000};
      // Log.l(`getTimecardsForTech(): Using database: '${dbname}'`);
      // if(dates) {
      //   if(dates.start !== undefined && dates.end === undefined) {
      //     query.selector = {$and: [{username: {$eq: username}}, {report_date: {$eq: dates['start']}}]};
      //   } else if(dates.start !== undefined && dates.end !== undefined) {
      //     query.selector = { $and: [{ username: { $eq: username } }, {report_date: { $geq: dates['start'] }}, {report_date: {$leq: dates['end']}}]};
      //   }
      // }
      // let db1 = this.addDB(dbname);
      // // let db1 = this.addDB(dbname);
      // let res:any = await db1.find(query);
      // Log.l(`getTimecardsForTech(): Got reports for '${username}':\n`, res);
      // for(let doc of res.docs) {
      //   let report:ReportTimeCard = new ReportTimeCard(doc);
      //   reports.push(report);
      // }
      // Log.l("getTimecardsForTech(): Returning final reports array:\n", reports);
      // return reports;
    } catch(err) {
      Log.l(`Server.getReportTimeCards(): Error retrieving TimeCard report list`);
      Log.l(err);
      // return reports;
      throw err;
    }
  }

  public getTimeCards = this.getReportTimeCards;

  // public getOtherReports():Promise<ReportOther[]> {
  //   return new Promise((resolve,reject) => {
  //     let rdb1:Database = this.addRDB('sesa-reports-other');
  //     rdb1.allDocs(GETDOCS).then(res => {
  //       Log.l(`getOtherReports(): Successfully retrieved other reports:\n`, res);
  //       let others = new ReportOther[]();
  //       for(let row of res.rows) {
  //         if(row['id'][0] !== '_' && row['doc'] !== undefined) {
  //           let doc = row['doc'];
  //           let other = new ReportOther();
  //           other.readFromDoc(doc);
  //           others.push(other);
  //         }
  //       }
  //       Log.l("getOtherReports(): Returning array of other reports:\n", others);
  //       resolve(others);
  //     }).catch(err => {
  //       Log.l(`getOtherReports(): Error retrieving other reports.`);
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public upsert(dbname:string, cDoc:any):Promise<UpsertResponse> {
    let rdb1:Database = this.addRDB(dbname);
    return rdb1.upsert(cDoc._id, (doc:UpsertDiffDoc) => {
      return doc;
    });
  }

  public getDrugTest():Promise<PouchDoc> {
    let dbname:string = 'drugtest';
    let rdb1:Database = this.addRDB(dbname);
    return new Promise((resolve,reject) => {
      rdb1.get('DrugTestData').then((res:PouchDoc) => {
        Log.l(`getDrugTest(): Success! Result:\n`, res);
        resolve(res);
      }).catch((err) => {
        Log.l(`getDrugTest(): Error!`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async getSounds():Promise<any> {
    try {
      let dbname:string = this.prefs.getDB('sounds');
      let rdb1:Database = this.addRDB(dbname);
      const str2blob = async (str:string) => {
        return blobUtil.base64StringToBlob(str);
      };
      const data2blob = async (data:any, out:any) => {
        try {
          let keys:string[] = Object.keys(data);
          for(let i of keys) {
            let dat = data[i];
            for(let doc of dat) {
              let blob = await str2blob(doc.asset);
              let blobURL = URL.createObjectURL(blob);
              out[i].push(blobURL);
            }
          }
          return out;
        } catch(err) {
          Log.l("data2blob(): Error processing base64 data to Blob!");
          Log.e(err);
          throw err;
        }
      };
      Log.l("getSounds(): Now attempting to get sounds from server …");
      let res:any = await rdb1.allDocs({include_docs:true, attachments:true});
      Log.l("getSounds(): Successfully got sounds back from server:", res);
      let out = {};
      for(let row of res.rows) {
        let doc:any = row.doc;
        if(doc && doc._attachments) {
          out[row.id] = [];
          for(let key in doc._attachments) {
            let data = doc._attachments[key].data;
            out[row.id].push({'file': key, 'asset': data});
          }
        }
      }
      let output:any = {};
      let keys = Object.keys(out);
      for(let key of keys) {
        output[key] = [];
      }
      Log.l("getSounds(): Calling data2blob with out and finalout:",out,JSON.stringify(output));
      let result:any = await data2blob(out, output);
      Log.l("getSounds(): Final output will be:", output);
      return result;
    } catch(err) {
      Log.l(`getSounds(): Error getting sounds back from server!`);
      Log.e(err);
      throw err;
    }
  }

  public saveJobsiteSortOrder(sites:Jobsite[]):Promise<any> {
    Log.l("saveJobsiteSortOrder(): Saving sort order for:\n", sites);
    let rdb1:Database = this.addRDB('sesa-jobsites');
    let updateSite:Function = async (site:Jobsite):Promise<UpsertResponse> => {
      let res:UpsertResponse = await rdb1.upsert(site._id, (doc:UpsertDiffDoc) => {
        doc.sort_number = site.sort_number;
        return doc;
      });
      return res;
      // .catch((err) => {
      //   Log.l("updateSite(): Unable to update sort_number for site: ", site);
      // });
    };
    let saveSiteNumbers:Function = async (sites:Jobsite[]):Promise<Jobsite[]> => {
      try {
        for(let site of sites) {
          let res = await updateSite(site);
          Log.l("saveSiteNumbers(): Result for site '%s' was:\n", site.getSiteID(), res);
        }
        return sites;
      } catch(err) {
        Log.l("saveSiteNumbers(): Error saving sites!");
        Log.e(err);
        throw err;
      }
    };
    return new Promise((resolve, reject) => {
      saveSiteNumbers(sites).then((res:Jobsite[]) => {
        Log.l("saveJobsiteSortOrder(): Saved jobsite sort order, result:\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("saveJobsiteSortOrder(): ERROR saving jobsite sort order!");
        Log.e(err);
        reject(err);
      });
    });
  }

  // public async getAllData():Promise<any> {
  //   try {
  //     let data = { sites: [], employees: [], reports: [], others: [], periods: [], shifts: [], schedules: [] };
  //     let res:any[] = await this.getJobsites();
  //     for(let doc of res) {
  //       let site = new Jobsite();
  //       site.readFromDoc(doc);
  //       data.sites.push(site);
  //     }
  //     res = await this.getEmployees();
  //     for(let doc of res) {
  //       let employee = new Employee();
  //       employee.readFromDoc(doc);
  //       data.employees.push(employee);
  //     }
  //     res = await this.getAllReportsPlusNew();
  //     }).then(res => {
  //       // for(let doc of res) {
  //       //   data.reports.push(doc);
  //       // }
  //       data.reports = res;
  //       return this.getReportOthers();
  //     }).then(res => {
  //       data.others = res;
  //       // Log.l("getAllData(): Success, final data to be returned is:\n", data);
  //       return this.getSchedules();
  //     }).then(res => {
  //       data.schedules = res;
  //       Log.l("getAllData(): Success, final data to be returned is:\n", data);
  //       resolve(data);

  //     return res;
  //   } catch(err) {
  //     Log.l(`Server.getAllData(): Error retrieving all data from server!`);
  //     Log.e(err);
  //     throw err;
  //   }
  //   return new Promise((resolve,reject) => {
  //     }).catch(err => {
  //       Log.l("getAllData(): Error retrieving all data!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  // public getSchedules(archives?:boolean, employees?:Employee[]):Promise<Schedule[]> {
  //   Log.l("getSchedules(): Firing up …");
  //   return new Promise((resolve, reject) => {
  //     let dbname:string = this.prefs.getDB('scheduling');
  //     let rdb1:Database = this.addRDB(dbname);
  //     rdb1.allDocs(GETDOCS).then((res:AllDocsResponse) => {
  //       Log.l("getSchedules(): Got initial schedule results:\n", res);
  //       let schedules:Schedule[] = [];
  //       for(let row of res.rows) {
  //         let doc:any = row.doc;
  //         if(!archives && doc.archive) {
  //           continue;
  //         } else {
  //           if(doc && row.id[0] !== '_' && doc.schedule) {
  //             let schedule = new Schedule();
  //             schedule.readFromDoc(doc);
  //             if(employees) {
  //               schedule.loadTechs(employees);
  //             }
  //             schedules.push(schedule);
  //           }
  //         }
  //       }
  //       Log.l("getSchedules(): Final result array is:\n", schedules);
  //       resolve(schedules);
  //     }).catch((err) => {
  //       Log.l("getSchedules(): Error retrieving schedule list!");
  //       Log.e(err);
  //       resolve(null);
  //     });
  //   });
  // }

  public async getSchedules(archives?:boolean, employees?:Employee[], spinnerID?:string):Promise<Schedule[]> {
    try {
      Log.l("ServerService.getSchedules(): Firing up, spinnerID is:", spinnerID);
      let dbname:string = this.prefs.getDB('scheduling');
      let db1 = this.addDB(dbname);
      let now = moment().startOf('day');
      let weeks = this.prefs.getPastScheduleWeeksCount();
      let startDate:Moment = moment(now).subtract(weeks, 'weeks').startOf('week');
      let endDate:Moment = moment(now).add(10, 'years').startOf('week');
      let start:string = startDate.format("YYYY-MM-DD");
      let end:string = endDate.format("YYYY-MM-DD");
      let res:any = await db1.allDocs({ include_docs: true, startkey: start, endkey: end});
      Log.l("ServerService.getSchedules(): Got initial schedule results:", res);
      let schedules:Schedule[] = [];
      if(res && res.rows && Array.isArray(res.rows)) {
        for(let row of res.rows) {
          let doc = row.doc;
          if(!archives && (doc.archive || doc.backup)) {
            continue;
          } else {
            if(doc && row.id && row.id[0] !== '_' && doc.schedule) {
              let schedule = new Schedule(doc);
              if(employees && employees.length) {
                schedule.loadTechs(employees);
              }
              schedules.push(schedule);
            }
          }
        }
        Log.l("ServerService.getSchedules(): Final result array is:", schedules);
      }
      return schedules;
    } catch(err) {
      Log.l("ServerService.getSchedules(): Error retrieving schedule list!");
      Log.e(err);
      return null;
      // resolve(null);
    }
  }

  public getSchedulesAsBetas(archives?:boolean):Promise<ScheduleBeta[]> {
    Log.l("getSchedulesAsBetas(): Firing up …");
    return new Promise((resolve, reject) => {
      let rdb1:Database = this.addRDB('sesa-scheduling-beta');
      rdb1.allDocs(GETDOCS).then((res:AllDocsResponse) => {
        Log.l("getSchedulesAsBetas(): Got initial schedule results:\n", res);
        let schedules:ScheduleBeta[] = [];
        for(let row of res.rows) {
          let doc:any = row.doc;
          if(!archives && doc.archive) {
            continue;
          } else {
            if(doc && row.id[0] !== '_' && doc.schedule) {
              let schedule = new ScheduleBeta();
              schedule.readFromDoc(doc);
              schedules.push(schedule);
            }
          }
        }
        Log.l("getSchedulesAsBetas(): Final result array is:\n", schedules);
        resolve(schedules);
      }).catch((err) => {
        Log.l("getSchedulesAsBetas(): Error retrieving schedule list!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public saveScheduleBeta(value:ScheduleBeta):Promise<UpsertResponse> {
    Log.l("saveScheduleBeta(): Firing up to save ScheduleBeta:\n", value);
    return new Promise((resolve, reject) => {
      let rdb1:Database = this.addRDB('sesa-scheduling-beta');
      let scheduleToSave = value.serialize();
      rdb1.upsert(value._id, (doc:UpsertDiffDoc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = scheduleToSave;
          doc._rev = rev;
        } else {
          doc = scheduleToSave;
          delete doc._rev;
        }
        return doc;
      }).then((res:UpsertResponse) => {
        Log.l("saveScheduleBeta(): Final result is:\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("saveScheduleBeta(): Error saving ScheduleBeta!");
        Log.e(err);
        resolve(err);
      });
    });
  }

  // public syncFromServer(dbname: string) {
  //   Log.l(`syncToServer(): About to attempt replication of remote->'${dbname}'`);
  //   let options = this.syncOptions;
  //   let ev1 = (a) => { Log.l(a.status); Log.l(a); };
  //   let db1 = this.addDB(dbname);
  //   let db2 = this.addRDB(dbname);
  //   let done = db1.replicate.from(db2, options)
  //     .on('change',   (info) => { Log.l(`syncFromServer():   change event fired for ${dbname}. Status:\n`, info); })
  //     // .on('active',   (info) => { Log.l(`syncFromServer():   active event fired for ${dbname}. Status:\n`, info); })
  //     .on('paused',   (info) => { Log.l(`syncFromServer():   paused event fired for ${dbname}. Status:\n`, info); })
  //     .on('denied',   (info) => { Log.l(`syncFromServer():   denied event fired for ${dbname}. Status:\n`, info); })
  //     .on('complete', (info) => { Log.l(`syncFromServer(): complete event fired for ${dbname}. Status:\n`, info); })
  //     .on('error',    (err)  => {
  //       Log.l(`syncFromServer():    error event fired for ${dbname}. Status:\n`, err);
  //       if(err.status === 401)  {
  //         let user = this.auth.getUser();
  //         let pass = this.auth.getPass();
  //         if(user && pass) {
  //           this.loginToDatabase(this.auth.getUser(), this.auth.getPass(), dbname).then(res => {
  //             Log.l(`syncFromServer(): Successfully logged in to '${dbname}' after unauthorized errorr.`);
  //           }).catch(err => {
  //             Log.l(`syncFromServer(): Error logging in to '${dbname}' after unauthorized errorr.`);
  //           });
  //         }
  //       }
  //     }).on('cancel',   (info) => { Log.l(`syncFromServer():   cancel event fired for ${dbname}. Status:\n`, info); });
  //   Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
  //   Log.l(done);
  //   window["stat1"] = done;
  //   return done;
  // }

  public liveSyncWithServer(dbname:string, options?:SyncOptions):any {
    Log.l(`liveSyncWithServer(): About to set up live synchronization, remote=>'${dbname}'`);
    let exists:boolean = this.pouchdb.isSynced(dbname);
    if(exists) {
      Log.w(`liveSyncWithServer(): database '${dbname}' is already synchronizing`);
      return;
    }
    let opts:SyncOptions = options != undefined ? options : this.syncOptions;
    // let auth:AuthHeader = this.prefs.getAuth();

    let db1 :Database = this.addDB(dbname);
    let rdb1:Database = this.addRDB(dbname);
    let done:PDBSync = db1.sync(rdb1, opts)
    // let rdbURL:string = this.pouchdb.getRemoteDatabaseURL(dbname);
    // let done:PDBSync = db1.sync(rdbURL, opts)
    // let done = (PouchDB.sync(db1, rdb1, opts) as any)
    // let done = (db1.sync(rdb1, opts) as any)
    // let done = (db1.sync(rdbURL, opts) as any)
      // .on('complete',   (info:PDBSyncResult) => {})
      .on('change',   (info:PDBSyncResult) => {
        this.onChangeFromServer(dbname, info);
      // }).on('active',   (info) => {
        // Log.l(`liveSyncWithServer():   active event fired for ${dbname}. Status:\n`, info);
      }).on('paused',   (err) => {
        this.onPauseFromServer(dbname, err);
      }).on('denied',   (err) => {
        Log.l(`%c SERVER: Replication for '${dbname}': DENIED:`, emph3);
        Log.e(err);
      }).on('error', (err:HttpErrorResponse) => {
        this.onErrorFromServer(dbname, err);
      // }).on('complete', (info:PDBCompleteEvent) => {
        // Log.l(`liveSyncWithServer(): complete event fired for ${dbname}. Status:\n`, info);
        // this.onCompleteFromServer(dbname, info);
      // }).on('cancel', (info) => { Log.l(`liveSyncWithServer():   cancel event fired for ${dbname}. Status:\n`, info);
      });
    // Log.l(`liveSyncWithServer(): Ran replicate, now returning cancel object.`);
    // Log.l(done);
    // window["stat1"] = done;
    // return done;
    this.addSync(dbname, done);
    return done;
  }

  public onPauseFromServer(dbname:string, err?:any) {
    if(this.activePause[dbname]) {
      Log.l(`%c=============> SERVER: Replication for '${dbname}': Duplicate event blocked`, emph4);
      this.activePause[dbname] = false;
      return;
    }
    this.activePause[dbname] = true;
    if(!err) {
      Log.l(`%c SERVER: Replication for '${dbname}': PAUSED/COMPLETE`, emph1);
      let event:{db:string} = {
        db: dbname,
      };
      this.dispatch.triggerAppEvent('replicationcomplete', event);
    } else {
      Log.l(`%c SERVER: Replication for '${dbname}': PAUSED WITH ERROR:`, emph1);
      Log.e(err);
    }
    setTimeout(() => {
      this.activePause[dbname] = false;
    }, 5000);
    // this.activePause[dbname] = false;
    // let event:any = {
    //   db: dbname,
    // };
    // this.dispatch.triggerAppEvent('replicationcomplete', event);
  }

  public onCompleteFromServer(dbname:string, info?:PDBCompleteEvent) {
    Log.l(`%c SERVER: Replication for '${dbname}': COMPLETE`, emph2);
    let event:{db:string} = {
      db: dbname,
    };
    this.dispatch.triggerAppEvent('replicationcomplete', event);
  }

  // public onChangeFromServer(dbname:string, info?:PDBSyncResult) {
  //   let pending:number = 0;
  //   let label:string = `liveSyncWithServer('${dbname}')`;
  //   // let blankLabel:string = '';
  //   Log.gc(label);
  //   // Log.l(`%c *****************************************`, 'margin-top: 10px; margin-bottom: 20px;');
  //   let hideFull:boolean = !Boolean(window['onsiteshowfullchangeevents']);
  //   if(hideFull) {
  //     Log.gc(`FULL EVENT: 'CHANGE' for database '${dbname}'`);
  //     Log.l(info);
  //     Log.ge();
  //   } else {
  //     Log.l(`liveSyncWithServer(): Change event fired for '${dbname}'. Event:\n`, info);
  //   }
  //   if(info && info.direction && info.direction === 'pull') {
  //     let change:PDBChangeEvent = info.change;
  //     // let text:string = `liveSyncWithServer():   change event fired for ${dbname}.`;
  //     if(change.pending) {
  //       pending = change.pending;
  //     //   text += ` Docs pending: '${pending}'`;
  //     }
  //     // Log.l(text);
  //     if(change.docs) {
  //       // Log.l(`Docs pulled:`);
  //       if(change.docs.length < 10) {
  //         Log.t(change.docs);
  //       } else {
  //         Log.l(change.docs);
  //       }
  //     }
  //     Log.l(`liveSyncWithServer(): PENDING DOCS FOR '${dbname}': ${pending}`);
  //     // Log.l(`%c *****************************************`, 'margin-top: 20px; margin-bottom: 10px;');
  //     Log.l(`%c *****************************************`, 'margin-bottom: 10px;');
  //     this.dispatch.triggerAppEvent('dbupdated', {db: dbname, change: change});
  //     if(pending === 0) {
  //       this.onCompleteFromServer(dbname);
  //     }
  //   } else {
  //     Log.l(`liveSyncWithServer(): Change event fired for '${dbname}', non-pull. event:\n`, info);
  //   }
  //   Log.ge();
  // }

  public onChangeFromServer(dbname:string, info?:PDBSyncResult) {
    let pending:number = 0;
    let updates:number = 0;
    let docs:any[];
    let label:string = `liveSyncWithServer('${dbname}')`;
    let change:PDBChangeEvent;
    if(info && info.direction && info.direction === 'pull' && info.change && info.change.pending != undefined) {
      change = info.change;
      pending = change.pending;
    } else {
      Log.gc(label)
      Log.l(`liveSyncWithServer(): Change event fired for '${dbname}', non-pull. event:\n`, info);
      Log.ge();
      return;
    }
    if(change && change.docs) {
      docs = change.docs;
    }
    if(docs) {
      updates = docs.length;
    }
    label += ` (DOCS: ${updates}) (PENDING: ${pending})`;
    // let blankLabel:string = '';
    Log.gc(label);
    // Log.l(`%c *****************************************`, 'margin-top: 10px; margin-bottom: 20px;');
    let hideFull:boolean = !Boolean(window['onsiteshowfullchangeevents']);
    if(hideFull) {
      Log.gc(`FULL EVENT: 'CHANGE' for database '${dbname}'`);
      Log.l(info);
      Log.ge();
    } else {
      Log.l(`liveSyncWithServer(): Change event fired for '${dbname}'. Event:\n`, info);
    }
    if(docs) {
      if(docs.length < 10) {
        Log.t(docs);
      } else {
        Log.l(docs);
      }
      // Log.l(`liveSyncWithServer(): PENDING DOCS FOR '${dbname}': ${pending}`);
      // Log.l(`%c *****************************************`, 'margin-top: 20px; margin-bottom: 10px;');
      // Log.l(`%c *****************************************`, 'margin-bottom: 10px;');
      Log.ge();
      this.dispatch.triggerAppEvent('dbupdated', {db: dbname, change: change});
      // if(pending === 0) {
      //   this.onCompleteFromServer(dbname);
      // }
    } else {
      Log.ge();
    }
  }

  public onErrorFromServer(dbname:string, err:HttpErrorResponse) {
    Log.l(`%c SERVERE': 'ERROR' event for '${dbname}':`, emph3);
    Log.e(err);
    if(err.status === 401 || err.status === 408) {
      let user:string = this.auth.getUser();
      let pass:string = this.auth.getPass();
      if(user && pass) {
        this.loginToDatabase(user, pass, dbname).then(res => {
          Log.l(`SERVER: Successfully logged in to '${dbname}' after unauthorized errorr.`);
        }).catch(err => {
          Log.l(`SERVER: Error logging in to '${dbname}' after unauthorized errorr.`);
        });
      }
    } else {
      Log.l(`%c SERVER: Error event was not a 401 or 408 code, not attempting re-authentication.`, emph3);
    }
  }

  public nonLiveSyncWithServer(dbname:string) {
    Log.l(`nonLiveSyncWithServer(): About to replicate remote=>'${dbname}'`);
    // let options = this.syncOptions;
    let options = this.nonsyncOptions;
    let db1:Database = this.addDB(dbname);
    let db2:Database = this.addRDB(dbname);
    return new Promise((resolve,reject) => {
      db1.replicate.from(db2, options).then(res => {
        Log.l(`nonLiveSyncWithServer(): Successfully replicated '${dbname}' from remote to local. Now replicating local->remote …`);
        return db1.replicate.to(db2, options);
      }).then(res => {
        Log.l(`nonLiveSyncWithServer(): Successfully replicated '${dbname}' from local to remote! Now implementing EABOD routine … done.`);
        resolve(res);
      }).catch(err => {
        Log.l(`nonLiveSyncWithServer(): Failed replication for '${dbname}', either remote->local or local->remote. Now FOADIAF … done.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public async syncFromServerViaSelector(dbname:string, spinnerID?:string) {
    try {
      Log.l(`Server.syncFromServerViaSelector(): About to attempt replication of remote->'${dbname}' with options:`, this.prefs.SERVER.repopts);
      // let ev2 = function(b) { Log.l(b.status); Log.l(b);};
      let db1:Database = this.addDB(dbname);
      let db2:Database = this.addRDB(dbname);
      // Log.l(db1);
      // Log.l(db2);
      let rdbURL:string = this.getBaseURL() + "/" + dbname;
      let batch_size:number = 400;
      // let batch_size = 1;
      let pendingMax:number = 0;
      let opts:any = { live: false, retry: false, batch_size: batch_size };
      let u:string = this.auth.getUsername();
      let p:string = this.auth.getPassword();
      let res:any = await this.loginToDatabase(u, p, dbname);
      Log.l(`Server.syncFromServerViaSelector(): Successfully logged in to remote->'${dbname}'`);
      if(dbname === 'reports_ver101100' || dbname === 'sesa-reports-other' || dbname === 'aaa001_reports_ver101100') {
        // let now = moment();
        // let startDate = moment(now).subtract(5, 'weeks');
        // opts.filter = 'ref/forTechDate';
        // opts.query_
        // params = { username: u, start: startDate.format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
        // let username:string = u;
        // let query = {selector: { username: {$eq: username}}, limit:10000};
        let query = { "username": u };
        opts.selector = query;
      } else if(dbname === 'sesa-scheduling') {
        let now:Moment = moment();
        let fromDate:Moment = moment(now).subtract(4, 'weeks');
        opts.filter = 'ref/allRecent';
        opts.query_params = { fromDate: fromDate.format("YYYY-MM-DD"), toDate: now.format("YYYY-MM-DD") };
      }
      Log.l(`Server.syncFromServerViaSelector(): Now replicating '${dbname}' with options:\n`, opts);
      res = db1.replicate.from(db2, opts).on('change', (info) => {
        Log.l(`Replication '${dbname}': Change event:\n`, info);
        let progress = this.getProgress(info);
        Log.l(`PROGRESS: '${progress}'`);
      }).on('complete', (info) => {
        Log.l(`Replication '${dbname}': Complete event:\n`, info);
      }).on('error', (err:Error) => {
        Log.l(`Replication '${dbname}': Error event received!`);
        Log.e(err);
        // throw err;
        throw err;
      });
      Log.l(`Server.syncFromServerViaSelector(): Successfully replicated remote->'${dbname}'`);
      Log.l(res);
      return res;
    } catch(err) {
      Log.l(`Server.syncFromServerViaSelector(): Failure replicating remote->'${dbname}'`);
      Log.e(err);
      throw err;
    }
  }

  // public async replicateFromServer(dbname:string, batchSize:number, spinnerID?:string) {
  public async replicateFromServer(dbname:string, batchSize:number, progress:DatabaseProgress) {
    try {
      Log.l(`Server.replicateFromServer(): About to attempt replication of remote->'${dbname}' with options:\n`, this.prefs.SERVER.repopts);
      // let ev2 = function(b) { Log.l(b.status); Log.l(b);};
      let db1:Database = this.addDB(dbname);
      let db2:Database = this.addRDB(dbname);
      // Log.l(db1);
      // Log.l(db2);
      let rdbURL:string = this.getBaseURL() + "/" + dbname;
      let batch_size:number = batchSize ? batchSize : 100;
      // let batch_size = 1;
      // let opts:any = { live: true, retry: false, batch_size: batch_size, batches_limit: 2 };
      let opts:any = { live: false, retry: false, batch_size: batch_size };
      let u:string = this.auth.getUsername();
      let p:string = this.auth.getPassword();
      let res:any = await this.loginToDatabase(u, p, dbname);
      Log.l(`Server.replicateFromServer(): Successfully logged in to remote->'${dbname}'`);
      // if(dbname === 'reports_ver101100' || dbname === 'sesa-reports-other' || dbname === 'aaa001_reports_ver101100') {
      //   // let now = moment();
      //   // let startDate = moment(now).subtract(5, 'weeks');
      //   // opts.filter = 'ref/forTechDate';
      //   // opts.query_
      //   // params = { username: u, start: startDate.format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
      //   let username:string = u;
      //   // let query = {selector: { username: {$eq: username}}, limit:10000};
      //   let query = { "username": username };
      //   opts.selector = query;
      // } else if(dbname === 'sesa-scheduling') {
      //   let now = moment();
      //   let fromDate = moment(now).subtract(4, 'weeks');
      //   opts.filter = 'ref/allRecent';
      //   opts.query_params = { fromDate: fromDate.format("YYYY-MM-DD"), toDate: now.format("YYYY-MM-DD") };
      // }
      // let dbURL = this.prefs.getDBURL(dbname);
      // let pendingMax = 0;
      Log.l(`Server.replicateFromServer(): Now replicating '${dbname}' with options:\n`, opts);
      // let loading;
      // if(spinnerID) {
      //   loading = this.alert.getSpinner(spinnerID);
      // }
      // let loadingText = `Downloading '${dbname}' …%d / %d records (%2d%%)`;
      res = db2.replicate.to(db1, opts)
      .on('change', (info:PDBChangeEvent) => {
        Log.l(`Replication '${dbname}': Change event:`, info);
        // let pending = info.pending;
        // let progress:DatabaseProgress = this.getProgress(info, progress);
        Log.l(`Replication '${dbname}': Change event:\n`, info);
        this.updateProgress(info, progress);
        Log.l(`PROGRESS: '${progress.percent}%'`);
        this.dispatch.triggerAppEvent('elapsedtime', {});
        // if(loading) {
        //   Log.l(`replicateFromServer(): Setting content for spinner '${spinnerID}' …`)
        //   let content = sprintf("Downloading '%s':<br>\n%d / %d (%2d%%)", dbname, progress.done, progress.total, progress.percent);
        //   Log.l(`replicateFromServer(): New loading content will be '${content}'`);
        //   loading.setContent(content);
        // }
        // Log.l(`replicateFromServer(): Done setting up initial replication for '${dbname}'.`);
      }).on('complete', (info) => {
        Log.l(`Replication '${dbname}': Complete event:\n`, info);
        this.updateProgress(info, progress);
        this.dispatch.triggerAppEvent('elapsedtime', {});
      }).on('error', (err) => {
        Log.l(`Replication '${dbname}': Error event received!`);
        Log.e(err);
        this.dispatch.triggerAppEvent('replicationerror', dbname);
        // throw err;
      });
      Log.l(`Server.replicateFromServer(): Successfully started replication from remote->'${dbname}'`);
      // this.dispatch.triggerAppEvent('starttime', {});
      Log.l(res);
      this.addInitialSync(dbname, res);
      return res;
    } catch(err) {
      Log.l(`Server.replicateFromServer(): Failure replicating remote->'${dbname}'`);
      Log.e(err);
      throw err;
    }
  }

  public getProgress(info:PDBChangeEvent):DatabaseProgress {
    Log.l(`Server.getProgress(): received change event:\n`, info);
    let processed:number = info.docs_written === undefined ? 0 : info.docs_written;
    let remaining:number = info.pending === undefined ? 0 : info.pending;
    let total:number = processed + remaining;
    let fraction:number = processed / total;
    if(fraction < 0 ) {
      fraction = 0;
    }
    if(fraction > 1) {
      fraction = 1;
    }
    let percent:number = fraction * 100;
    let out:DatabaseProgress = new DatabaseProgress({done: processed, total: total, percent: percent});
    out.getPercent();
    Log.l(`Server.getProgress(): output is:\n`, out);
    return out;
  }

  public updateProgress(info:PDBChangeEvent, progress:DatabaseProgress):DatabaseProgress {
    Log.l(`Server.updateProgress(): received change event:\n`, info);
    let processed:number = info.docs_written === undefined ? 0 : info.docs_written;
    let remaining:number = info.pending === undefined ? 0 : info.pending;
    let total:number = processed + remaining;
    let fraction:number = processed / total;
    if(fraction < 0 ) {
      fraction = 0;
    }
    if(fraction > 1) {
      fraction = 1;
    }
    let percent:number = fraction * 100;
    // let out:DatabaseProgress = {done: processed, total: total, percent: percent};
    progress.done  = processed;
    progress.total = total;
    // progress.percent = percent;
    progress.touched = true;
    progress.getPercent();
    Log.l(`Server.updateProgress(): output is:\n`, progress);
    return progress;
  }

  // public getProgress(pending:number, pendingMax:number, batchSize:number):number {
  //   let progress;
  //   // let pendingMax = maxPending || 1;
  //   // pendingMax = pendingMax < pending ? pending + batch_size : pendingMax;
  //   pendingMax = pendingMax < pending ? pending + batchSize : pendingMax;
  //   if(pendingMax > 0) {
  //     progress = 1 - (pending / pendingMax);
  //     if(pending === 0) {
  //       pendingMax = 0;
  //     }
  //   } else {
  //     progress = 1; // 100%
  //   }
  //   return progress;
  // }

  public async queryDatabase(dbname:string, query:Selector, limit?:number):Promise<FindResponse> {
    try {
      let rdb1:Database = this.addRDB(dbname);
      let opts:FindRequest;
      if(query) {
        opts.selector = query;
        opts.limit = limit != undefined ? limit : 100000;
      } else {
        opts = {
          selector: {
            _id: {
              '$gt': null
            }
          },
          limit: 100000,
        };
      }
      Log.l(`Server.queryDatabase(): About to query database '${dbname}' with query:\n`, opts);
      let res:FindResponse = await rdb1.find(opts);
      Log.l(`Server.queryDatabase(): Query result is:\n`, res);
      return res;
    } catch(err) {
      Log.l(`Server.queryDatabase(): Error querying database!`);
      Log.e(err);
      throw err;
    }
  }

  public getMessages():Promise<Message[]> {
    let dbname:string = this.prefs.getDB('messages');
    let rdb1:Database = this.addRDB(dbname);
    let msgs:Message[] = [];
    return new Promise((resolve,reject) => {
      rdb1.allDocs(GETDOCS).then((res:AllDocsResponse) => {
        Log.l("Server.getMessages(): Raw doc input list read from server is:\n", res);
        for(let row of res.rows) {
          if(row.doc && row.id[0] !== '_') {
            let doc:any = row.doc;
            let msg = new Message();
            msg.readFromDoc(doc);
            msgs.push(msg);
          }
        }
        Log.l("Server.getMessages(): Final output is:\n", msgs);
        resolve(msgs);
      }).catch(err => {
        Log.l("Server.getMessages(): Error getting messages!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public async saveMessage(message:Message, tech:Employee):Promise<UpsertResponse> {
    try {
      Log.l(`Server.saveMessage(): Called with arguments:`, arguments);
      let dbname:string = this.prefs.getDB('messages');
      let rdb1:Database = this.addRDB(dbname);
      if(!message._id) {
        message.generateMessageID(tech);
      }
      let msgDoc:any = message.serialize();
      let res:UpsertResponse = await rdb1.upsert(msgDoc._id, (doc:UpsertDiffDoc) => {
        if(doc) {
          let rev:string = doc._rev;
          doc = msgDoc;
          doc._rev = rev;
          return doc;
        } else {
          doc = msgDoc;
          delete doc._rev;
          return doc;
        }
      });
      if(!res['ok'] && !res.updated) {
        let text:string = "Server.saveMessage(): Error saving message!";
        Log.l(text);
        Log.e(res);
        let err:Error = new Error(text);
        throw err;
      } else {
        Log.l("Server.saveMessage(): Message saved:\n", res);
        return res;
      }
    } catch(err) {
      Log.l(`Server.saveMessage(): Error saving message:\n`, message);
      Log.e(err);
      throw err;
    }
  }

  // public async saveMessage(message:Message):Promise<UpsertResponse> {
  //   let dbname:string = this.prefs.getDB('messages');
  //   let rdb1:Database = this.addRDB(dbname);
  //   if(!message._id) {
  //     message.generateMessageID();
  //   }
  //   let msgDoc:any = message.serialize();
  //   return new Promise((resolve,reject) => {
  //     rdb1.upsert(msgDoc._id, (doc:UpsertDiffDoc) => {
  //       if(doc) {
  //         let rev:string = doc._rev;
  //         doc = msgDoc;
  //         doc._rev = rev;
  //         return doc;
  //       } else {
  //         doc = msgDoc;
  //         delete doc._rev;
  //         return doc;
  //       }
  //     }).then((res:UpsertResponse) => {
  //       if(!res['ok'] && !res.updated) {
  //         Log.l("saveMessage(): Error saving message!");
  //         Log.e(res);
  //         reject(res);
  //       } else {
  //         Log.l("saveMessage(): Message saved:\n", res);
  //         resolve(res);
  //       }
  //     }).catch(err => {
  //       Log.l("saveMessage(): Error saving message!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public getComments():Promise<Comment[]> {
    let dbname:string = this.prefs.getDB('comments');
    let rdb1:Database = this.addRDB(dbname);
    return new Promise((resolve,reject) => {
      rdb1.allDocs(GETDOCS).then((res:AllDocsResponse) => {
        Log.l("getComments(): Read from database:\n", res);
        let msgs:Comment[] = [];
        for(let row of res.rows) {
          if(row.doc && row.id[0] !== '_') {
            let doc:any = row.doc;
            let msg:Comment = new Comment(doc);
            // msg.readFromDoc(doc);
            msgs.push(msg);
          }
        }
        Log.l("getComments(): Final list of comments is:\n", msgs);
        resolve(msgs);
      }).catch(err => {
        Log.l("getComments(): Error retrieving comments.");
        Log.e(err);
        reject(err);
      })
    });
  }

  public getDPSSettings():Promise<DPS> {
    return new Promise((resolve,reject) => {
      let dbname:string = this.prefs.getDB('config');
      let rdb1:Database = this.addRDB(dbname);
      let id:string = "dps_config";
      rdb1.get(id).then((res:PouchDoc) => {
        Log.l("getDPSSettings(): Retrieved raw DPS settings:\n", res);
        let dps:DPS = new DPS();
        dps.deserialize(res);
        Log.l("getDPSSettings(): Successfully retrieved DPS settings:\n", dps);
        resolve(dps);
      }).catch(err => {
        Log.l("getDPSSettings(): Error getting DPS settings!");
        Log.e(err);
        reject(err);
      })
    });
  }

  public saveDPSSettings(dpsDoc:any):Promise< UpsertResponse> {
    return new Promise((resolve,reject) => {
      let dbname:string = this.prefs.getDB('config');
      let rdb1:Database = this.addRDB(dbname);
      let id:string = "dps_config";
      rdb1.upsert(id, (doc:UpsertDiffDoc) => {
        if(doc && doc._rev) {
          let rev:string = doc._rev;
          doc = dpsDoc;
          doc._id = id;
          doc._rev = rev;
        } else {
          doc = dpsDoc;
          doc._id = id;
        }
        Log.l("saveDPSSettings(): Now upserting doc:\n", doc);
        return doc;
      }).then((res:UpsertResponse) => {
        if(!res['ok'] && !res.updated) {
          Log.l("saveDPSSettings(): Upsert error saving DPS settings!", res);
          reject(res);
        } else {
          resolve(res);
        }
      }).catch(err => {
        Log.l("saveDPSSettings(): Error saving DPS settings!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveInvoice(type:string, invoice: Invoice) {
    return new Promise((resolve, reject) => {
      let invoiceType = type.toLowerCase();
      let dbkey = (`invoices_${invoiceType}` as DatabaseKey);
      let dbname = this.prefs.getDB(dbkey);
      let rdb1 = this.addRDB(dbname);
      let ts = moment().format();
      // let user = username ? username : window['onsiteconsoleusername'] ? window['onsiteconsoleusername'] : "unknown_user";
      let inv:any = invoice.serialize();
      // nr.time_start = report.time_start.format();
      // nr.time_end = report.time_end.format();
      // let rpt:any = JSON.stringify(report);
      rdb1.upsert(inv._id, (doc:any) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          inv._rev = rev;
          doc = inv;
        } else {
          doc = inv;
        }
        return doc;
      }).then(res => {
        if (!res['ok'] && !res.updated) {
          Log.l(`saveInvoice(): Upsert error saving report ${inv._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`saveInvoice(): Successfully saved report ${inv._id}.\n`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`saveInvoice(): Error saving report ${inv._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async saveInvoices(type:string, invoices: Invoice[]) {
    try {
      let results = [];
      for (let invoice of invoices) {
        let saveResult = await this.saveInvoice(type, invoice);
        results.push(saveResult);
        // let update = {type:'save', id: invoice._id};
        this.dispatch.updateDBProgress('save', invoice._id);
      }
      Log.l("saveInvoices(): Results are:\n", results);
      return results;
    } catch(err) {
      Log.l(`saveInvoices(): Error saving invoices to server!`);
      Log.e(err);
      throw err;
    }
  }

  public getInvoices(type:string, start: string, end: string):Promise<Invoice[]> {
    return new Promise((resolve, reject) => {
      let dbtype = (`invoices_${type.toLowerCase()}` as DatabaseKey);
      let dbname:string = this.prefs.getDB(dbtype);
      let rdb1:Database = this.addDB(dbname);
      rdb1.allDocs(GETDOCS).then(res => {
        Log.l(`getInvoices(): Successfully retrieved invoices, raw results are:\n`, res);
        let invoices: Invoice[] = [];
        for(let row of res.rows) {
          if(row.id[0] !== '_' && row.doc) {
            let doc:any = row.doc;
            if(doc.type && doc.type === type && doc.period_start >= start && moment(doc.period_start, "YYYY-MM-DD").add(6, 'day').format("YYYY-MM-DD") <= end) {
              let invoice: Invoice = Invoice.deserialize(doc);
              invoices.push(invoice);
            }
          }
        }
        Log.l(`getInvoices(): Final invoice array is:\n`, invoices);
        resolve(invoices);
      }).catch(err => {
        Log.l(`getInvoices(): Error getting invoices between '${start}' and '${end}'.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public savePreauth(preauth:PreAuth):Promise<any> {
    return new Promise((resolve,reject) => {
      let dbname:string = this.prefs.getDB('preauths');
      let rdb1:Database = this.addDB(dbname);
      // db1.allDocs(GETDOCS).then(res => {
      // })
      let pdoc = preauth.serialize();
      rdb1.upsert(pdoc._id, (doc:UpsertDiffDoc) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          pdoc._rev = rev;
          doc = pdoc;
        } else {
          delete pdoc._rev;
          doc = pdoc;
        }
        return doc;
      }).then((res:UpsertResponse) => {
        if (!res['ok'] && !res.updated) {
          Log.l(`savePreauth(): Upsert error saving report ${pdoc._id}.`, res);
          reject(res);
        } else {
          Log.l(`savePreauth(): Successfully saved report ${pdoc._id}.`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`savePreauth(): Error saving report ${pdoc._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async savePreauths(preauths:PreAuth[]) {
    let results = [];
    for (let preauth of preauths) {
      let saveResult = await this.savePreauth(preauth);
      results.push(saveResult);
    }
    Log.l("savePreauths(): Results are:", results);
    return results;
  }

  public getPreauths(start:string, end:string):Promise<PreAuth[]> {
    return new Promise((resolve,reject) => {
      let dbname:string = this.prefs.getDB('preauths');
      let rdb1:Database = this.addDB(dbname);
      rdb1.allDocs(GETDOCS).then((res:AllDocsResponse) => {
        Log.l(`getPreauths(): Successfully retrieved preauths, raw results are:`, res);
        let preauths:PreAuth[] = [];
        for(let row of res.rows) {
          if(row.id[0] !== '_' && row.doc) {
            let doc:any = row.doc;
            if(doc.period_date >= start && moment(doc.period_date, "YYYY-MM-DD").add(6, 'day').format("YYYY-MM-DD") <= end) {
              let preauth:PreAuth = PreAuth.deserialize(doc);
              preauths.push(preauth);
            }
          }
        }
        Log.l(`getPreauths(): Final invoice array is:`, preauths);
        resolve(preauths);
      }).catch(err => {
        Log.l(`getPreauths(): Error getting invoices between '${start}' and '${end}'.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public async getOldReports(spinnerID?:string):Promise<Report[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getOtherReports(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    let dbnames = this.prefs.getOldReportsDBList();
    try {
      // this.loading.setContent("Processing old reports …");
      let reports:Report[] = [];
      for(let dbname of dbnames) {
        try {
          let rdb1:Database = this.addRDB(dbname);
          Log.l(`Server.getOldReports(): retrieving all reports from '${dbname}' …`)
          let resOneDB:Report[] = await this.getReportsFromDB(dbname);
          Log.l(`Server.getOldReports(): Successfully retrieved reports from '${dbname}', report list is:`, resOneDB);
          reports = [...reports, ...resOneDB];
        } catch(err) {
          Log.l(`Server.getOldReports(): Error getting reports from old reports DB '${dbname}'!`);
          Log.e(err);
          throw err;
        }
      }
      Log.l(`Server.getOldReports(): Final array of old reports from is:`, reports);
      return reports;
    } catch(err) {
      Log.l(`Server.getOldReports(): Error retrieving old reports at some point from OldReports list:`, dbnames);
      Log.e(err);
      throw err;
    }
  }

  public async getReportsFromDB(dbname:string):Promise<Report[]> {
    try {
      let rdb1:Database = this.addRDB(dbname);
      Log.l(`Server.getReportsFromDB(): retrieving all reports from '${dbname}' …`)
      let res:any = await rdb1.allDocs(GETDOCS);
      Log.l(`Server.getReportsFromDB(): Successfully retrieved reports from '${dbname}', raw list is:`, res);
      let reports:Report[] = [];
      if(res && Array.isArray(res['rows'])) {
        for (let row of res.rows) {
          if (row.id[0] !== '_' && row.doc) {
            let doc:any = row.doc;
            let rpt = new Report();
            rpt.readFromDoc(doc);
            reports.push(rpt);
          }
        }
      }
      Log.l(`Server.getReportsFromDB(): Final array of reports from '${dbname}' is:`, reports);
      return reports;
    } catch(err) {
      Log.l(`Server.getReportsFromDB(): Error retrieving reports from db '${dbname}'.`);
      Log.e(err);
      throw err;
    }
  }

  public async saveReportLogistics(report:ReportLogistics):Promise<any> {
    try {
      Log.l(`Server.saveReportLogistics(): Now attempting to save report:\n`, report);
      let reportDoc:any = report.serialize();
      Log.l(`Server.saveReportLogistics(): Now attempting to save serialized report:\n`, reportDoc);
      let dbname:string = this.prefs.getDB('logistics');
      let db1 = this.addDB(dbname);
      let res:any = await db1.upsert(reportDoc._id, (doc:any) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = reportDoc;
          doc._rev = rev;
        } else {
          doc = reportDoc;
          delete doc._rev;
        }
        return doc;
      });
      if(!res.ok && !res.updated) {
        let text:string = `Server.saveReportLogistics(): Upsert error for report '${report._id}'`;
        throw new Error(text);
      } else {
        return res;
      }
    } catch(err) {
      Log.l(`Server.saveReportLogistics(): Error saving report '${report._id}'`);
      Log.e(err);
      throw err;
    }
  }

  public isStringHTML(text:string):boolean {
    let doc = new DOMParser().parseFromString(text, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  }

  public stripTrivialHTML(text:string):string {
    if(typeof text === 'string' && text.startsWith('<p>') && text.endsWith('</p>')) {
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

  public async loadRawTranslations():Promise<TranslationDocument> {
    try {
      let dbname = this.prefs.getDB('translations');
      let rdb1 = this.addRDB(dbname);
      let res:any = await rdb1.get('onsitex');
      Log.w("Server.loadRawTranslations(): Got translations result:", res);
      if(res && res.keys && res.translations) {
        // let keys = res.keys;
        // let translations = res.translations;
        return res;
      } else {
        Log.w("Server.loadRawTranslations(): Invalid translation document");
        return null;
      }
    } catch(err) {
      Log.l(`Server.loadRawTranslations(): Error loading translations`);
      Log.e(err);
      throw err;
    }
  }

  public translationsToTable(langKeys:string[], translations:TranslationRecord):TranslationTable {
    if(!(Array.isArray(langKeys) && langKeys.length && translations)) {
      let text = `OnSiteX.translationsToTable(): parameters must be array of language codes and translation object, i.e. ['en','es']. Invalid parameter`;
      Log.w(text + ":", langKeys, translations);
      let err = new Error(text);
      throw err;
    }
    let out:TranslationTable = [];
    let translateKeys = Object.keys(translations);
    for(let translateKey of translateKeys) {
      let values = translations[translateKey];
      let record:TranslationTableRecord;
      let row:any = {
        key: translateKey,
      };
      for(let langKey of langKeys) {
        let idx = langKeys.indexOf(langKey);
        row[langKey] = values[idx];
      }
      record = row;
      out.push(record);
    }
    return out;
    // let keys = langKeys;
    // let translateKeys = Object.keys(translations);
    // let allTranslations:any = {};
    // for(let langKey of langKeys) {
    //   let idx = langKeys.indexOf(langKey);
    //   let langTranslations:any = {};
    //   for(let key of translateKeys) {
    //     langTranslations[key] = translations[key][idx];
    //   }
    //   // this.translate.setTranslation(langKey, langTranslations);
    //   allTranslations[langKey] = langTranslations;
    // }
  }

  public async loadTranslationTable():Promise<TranslationTable> {
    try {
      // let dbname = this.prefs.getDB('translations');
      // let rdb1 = this.addRDB(dbname);
      // let res:any = await rdb1.get('onsitex');
      let res = await this.loadRawTranslations();
      Log.l("Server.loadTranslationTable(): Got translations result:", res);
      let out:TranslationTable = [];
      if(res && res.keys && res.translations) {
        // // let keys = res.keys;
        // // let translations = res.translations;
        // // return res;
        let keys = res.keys;
        let translations = res.translations;
        // let out = this.translationsToTable(keys, translations);
        // let translateKeys = Object.keys(translations);
        // // let allTranslations:any = {};
        // for(let translateKey of translateKeys) {
        //   let values = translations[translateKey];
        //   let record:any = {
        //     key: translateKey,
        //   };
        //   for(let langKey of keys) {
        //     let idx = keys.indexOf(langKey);
        //     record[langKey] = values[idx];
        //   }
        //   out.push(record);
        // }
        // // for(let langKey of keys) {
        // //   let idx = keys.indexOf(langKey);
        // //   let langTranslations:any = {};
        // //   for(let key of translateKeys) {
        // //     langTranslations[key] = translations[key][idx];
        // //   }
        // //   allTranslations[langKey] = langTranslations;
        // // }
        out = this.translationsToTable(keys, translations);
      } else {
        Log.w("Server.loadTranslationTable(): Invalid translation document");
        // return null;
      }
      return out;
    } catch(err) {
      Log.l(`Server.loadTranslationTable(): Error loading translations`);
      Log.e(err);
      throw err;
    }
  }

  public cleanTranslationHTML(translationsTable:TranslationTable):TranslationTable {
    for(let row of translationsTable) {
      let rowKeys = Object.keys(row);
      for(let key of rowKeys) {
        if(key !== 'key' && key !== 'maint_type') {
          let value = row[key];
          let cleanedString = this.stripTrivialHTML(value);
          row[key] = cleanedString;
        }
      }
    }
    return translationsTable;
  }

  public async saveTranslations(translationsTable:TranslationTable, maintTable?:TranslationTable):Promise<any> {
    try {
      Log.l(`Server.saveTranslations(): Called, saving translation table:`, translationsTable);
      let table = this.cleanTranslationHTML(translationsTable);
      let document:TranslationDocument = new Object();
      let translationKeys:string[];
      let translationRecord:TranslationRecord = {}, sortedTranslationRecord:TranslationRecord = {};
      let row:TranslationTableRecord = table[0];
      let langKeys = Object.keys(row).filter(a => a !== 'key' && a !== 'maint_type');
      let isMaint = table.find(a => a.maint_type && typeof a.maint_type === 'string');
      if(maintTable) {
        Log.l(`Server.saveTranslations(): Got maintenance translation table:`, maintTable);
        let mnouns = maintTable.filter(a => a.maint_type === 'mechanical_noun').map(a => a.key).sort();
        let enouns = maintTable.filter(a => a.maint_type === 'electronic_noun').map(a => a.key).sort();
        let verbs  = maintTable.filter(a => a.maint_type === 'verb').map(a => a.key).sort();
        this.data.setConfigData("maintenance_mnouns", mnouns);
        this.data.setConfigData("maintenance_enouns", enouns);
        this.data.setConfigData("maintenance_verbs", verbs);
        await this.saveMaintenanceConfig('mechanical_noun', mnouns);
        await this.saveMaintenanceConfig('electronic_noun', enouns);
        await this.saveMaintenanceConfig('verb', verbs);
      // } else {
      }
        for(let record of table) {
          let key = record.key;
          let transArray = [];
          for(let langKey of langKeys) {
            let oneTranslatedString = record[langKey];
            let cleanedString = this.stripTrivialHTML(oneTranslatedString);
            transArray.push(cleanedString);
          }
          translationRecord[key] = transArray;
        }
        translationKeys = Object.keys(translationRecord).sort();
        for(let translationKey of translationKeys) {
          let record = translationRecord[translationKey];
          sortedTranslationRecord[translationKey] = record;
        }
        document._id = 'onsitex';
        document.keys = langKeys;
        // document.translations = translationRecord;
        document.translations = sortedTranslationRecord;
        Log.l(`Server.saveTranslations(): Now attempting to save translation document:`, document);
        let dbname:string = this.prefs.getDB('translations');
        let rdb1 = this.addRDB(dbname);
        let res:any = await rdb1.upsert(document._id, (doc:any) => {
          if(doc && doc._rev) {
            let rev = doc._rev;
            doc = document;
            doc._rev = rev;
          } else {
            doc = document;
            delete doc._rev;
          }
          return doc;
        });
        if(!res.ok && !res.updated) {
          let text:string = `Server.saveTranslations(): Upsert error for translation table`;
          Log.w(text + ":", res);
          let err = new Error(text);
          throw err;
        } else {
          return res;
        }
      // }
    } catch(err) {
      Log.l(`Server.saveTranslations(): Error saving translation table:`, translationsTable);
      Log.e(err);
      throw err;
    }
  }

  // public async getOldReports():Promise<Report[]> {
  //   try {
  //     let DB = this.prefs.getDB();
  //     let reportsDB = "reports_old01";
  //     let rdb1:Database = this.addRDB(reportsDB);
  //     Log.l(`Server.getOldReports(): retrieving all reports from '${reportsDB}' …`)
  //     let res:any = await rdb1.allDocs(GETDOCS);
  //     Log.l("Server.getOldReports(): Successfully retrieved old reports, raw list is:", res);
  //     let reports:Report[] = [];
  //     if()
  //     for (let row of res.rows) {
  //       if (row.id[0] !== '_' && row.doc) {
  //         let doc:any = row.doc;
  //         let rpt = new Report();
  //         rpt.readFromDoc(doc);
  //         reports.push(rpt);
  //       }
  //     }
  //     Log.l("Server.getOldReports(): Final array of old reports is:", reports);
  //     return reports;
  //   } catch(err) {
  //     Log.l(`Server.getOldReports(): Error retrieving reports.`);
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  // public async getOldReports(): Promise<Report[]> {
  //   try {
  //     let db   = this.prefs.getDB();
  //     let rdb1 = this.addDB(db.reports_old01);
  //     let res  = await rdb1.allDocs(GETDOCS);
  //     Log.l("getOldReports(): Successfully retrieved old reports, raw list is:", res);
  //     let reports: Report[] = [];
  //     for (let row of res.rows) {
  //       if (row.id[0] !== '_' && row.doc) {
  //         let doc:any = row.doc;
  //         let rpt = new Report();
  //         rpt.readFromDoc(doc);
  //         reports.push(rpt);
  //       }
  //     }
  //     Log.l("getOldReports(): Final array of old reports is:", reports);
  //     return reports;
  //   } catch (err) {
  //     Log.l("getOldReports(): Error retrieving reports.");
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  // public syncSquaredFromServer(dbname:string) {
  //   let options = {
  //     live: true,
  //     retry: true,
  //     continuous: true
  //   };

  //   Log.l(`syncFromServer(): About to attempt replication of remote->'${dbname}'`);
  //   let ev2 = (b) => { Log.l(b.status); Log.l(b); };
  //   let db1 = this.addRDB(dbname);
  //   let db2 = this.addDB(dbname);
  //   let done = db1.replicate.to(db2, this.prefs.SERVER.repopts)
  //     .on('change', info => { Log.l("syncFromServer(): change event fired. Status: ", info.status); Log.l(info); })
  //     .on('active', info => { Log.l("syncFromServer(): active event fired. Status: ", info.status); Log.l(info); })
  //     .on('paused', info => { Log.l("syncFromServer(): paused event fired. Status: ", info.status); Log.l(info); })
  //     .on('denied', info => { Log.l("syncFromServer(): denied event fired. Status: ", info.status); Log.l(info); })
  //     .on('complete', info => { Log.l("syncFromServer(): complete event fired. Status: ", info.status); Log.l(info); })
  //     .on('error', info => { Log.l("syncFromServer(): error event fired. Status: ", info.status); Log.l(info); })
  //     .on('cancel', info => { Log.l("syncFromServer(): cancel event fired. Status: ", info.status); Log.l(info); });
  //   Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
  //   window["stat2"] = done;
  //   return done;

  // }
}
