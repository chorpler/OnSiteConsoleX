import { sprintf                                          } from 'sprintf-js'           ;
import { Injectable, NgZone                               } from '@angular/core'        ;
import { Loading                                          } from 'ionic-angular'        ;
import { Log, moment, Moment, isMoment                    } from 'domain/onsitexdomain' ;
import { PouchDBService,                                  } from './pouchdb-service'    ;
import { Database, PDBInfo,                               } from './pouchdb-service'    ;
import { UpsertResponse, UpsertDiffCallback,              } from './pouchdb-service'    ;
import { AuthService                                      } from './auth-service'       ;
import { AlertService                                     } from './alert-service'      ;
import { NotifyService                                    } from './notify-service'     ;
import { Jobsite, Employee,Shift, PayrollPeriod, Schedule } from 'domain/onsitexdomain' ;
import { Report,                                          } from 'domain/onsitexdomain' ;
import { ReportOther,                                     } from 'domain/onsitexdomain' ;
import { ReportLogistics,                                 } from 'domain/onsitexdomain' ;
import { ReportTimeCard,                                  } from 'domain/onsitexdomain' ;
import { DPS, Invoice, PreAuth, blobUtil,                 } from 'domain/onsitexdomain' ;
import { Preferences                                      } from './preferences'        ;
import { SESAClient, SESALocation, SESALocID, SESACLL,    } from 'domain/onsitexdomain' ;

type CLLNames = "client" | "location" | "locID";
type CLLS = SESAClient | SESALocation | SESALocID;

const delay = (ms:number):Promise<boolean> => {
  return new Promise((resolve) => {
    if(!ms) {
      resolve(true);
    // } else if(typeof ms === 'number') {
    } else {
      setTimeout(() => { resolve(true) }, ms);
    }
  });
};

@Injectable()
export class DBService {
  // public db            : any                                                ;
  // public serverdb      : any                                                ;
  public u                           : any                                            ;
  public p                           : any                                            ;
  public remote                      : any                                            ;
  public remoteDB                    : any                                            ;
  public pdbOpts                     : any                                            ;
  public StaticPouchDB : any = null                                         ;
  // public PREFS         : any = new Preferences()                            ;
  public opts          : any = {auto_compaction: true}                      ;
  public repopts       : any = {live: false, retry: false}                  ;
  public syncOptions   : any = {live: true, retry: true, continuous: true}  ;
  public loading       : Loading | {setContent:(text:string) => any};
  public loadDelay     : number = 1;
  // public runInZone     : boolean = true;
  public runInZone     : number = 1;
  public useQuery      : boolean = false;
  public thisApp       : any;
  public testDocs      : any;

  // constructor(public data:OSData, public alert:AlertService) {
  constructor(
    public zone    : NgZone         ,
    public prefs   : Preferences    ,
    public pouchdb : PouchDBService ,
    public alert   : AlertService   ,
    public auth    : AuthService    ,
    public notify  : NotifyService  ,
  ) {
    Log.l('Hello DBService Provider');

    window["onsitedbservice"] = this;
    window["onsiteDBService"] = DBService;

    Log.l("DBService: Initializing PouchDB!");
    this.StaticPouchDB = this.pouchdb.getPouchDB();
    Log.l("DBService: Done initializing PouchDB!");
    this.pdbOpts = { auto_compaction: true };

    // this.addDB('reports');
  }

  /**
   * Returns a copy of the PouchDB method, which can be used as normal.
   * @type {PouchDB}
   */
  // public getAdapter()    { return this.StaticPouchDB;                       }
  // public getThisDB()     { return DBService.db;                                  }
  // public getDBs()        { return DBService.pdb;                                 }
  // public getRDBs()       { return DBService.rdb;                                 }
  public getServerInfo() { return this.prefs.SERVER.protocol + "://" + this.prefs.SERVER.server; }
  public getAuthStatus() {                                                       }

  public addDB(dbname:string):Database {
    return this.pouchdb.addDB(dbname);
  }

  public addRDB(dbname:string):Database {
    return this.pouchdb.addRDB(dbname);
  }

  public async closeDB(dbname:string):Promise<boolean> {
    return this.pouchdb.closeDB(dbname);
  }
  
  public async closeRDB(dbname:string):Promise<boolean> {
    return this.pouchdb.closeRDB(dbname);
  }
  
  public async getDoc(dbname:string, docID:string):Promise<any> {
    try {
      let db1 = this.addDB(dbname);
      let res:any = await db1.get(docID);
      return res;
    } catch(err) {
      Log.l(`getDoc(): Error getting doc ${docID} from database '${dbname}'!`);
      Log.e(err);
      throw err;
    }
  }

  public async getConfigDoc(docID:string):Promise<any> {
    let dbname = "UNKNOWN_CONFIG_DATABASE";
    try {
      dbname = this.prefs.getDB('config');
      let res:any = await this.getDoc(dbname, docID);
      return res;
    } catch(err) {
      Log.l(`DB.getConfigDoc(): Error getting doc ${docID} from database '${dbname}'!`);
      Log.e(err);
      throw err;
    }
  }

  public async saveDoc(dbname:string, newDoc:any):Promise<any> {
    let id = "EMPTY_DOC_ID";
    try {
      id = newDoc['_id'];
      if(!id) {
        let text:string = `DB.saveDoc(): Error saving to database '${dbname}': document must have _id field`;
        throw new Error(text);
      } else {
        Log.l(`DB.saveDoc(): Attempting to save to db '${dbname}' for doc:\n`, newDoc);
        let db1 = this.addDB(dbname);
        let res:any = await db1.upsert(id, (doc:any) => {
          if(doc) {
            if(doc['_rev']) {
              newDoc._rev = doc._rev;
              doc = newDoc;
            } else {
              delete newDoc._rev;
              doc = newDoc;
            }
          } else {
            delete newDoc._rev;
            doc = newDoc;
          }
          return doc;
        });
        if(!res['ok'] && !res.updated) {
          Log.l(`DB.saveDoc(): Upsert error saving report ${newDoc._id}:`, res);
          let text:string = `saveDoc(): Upsert error saving report '${newDoc._id}'`;
          throw new Error(text);
        } else {
          Log.l(`DB.saveDoc(): Successfully saved report ${newDoc._id}:`, res);
          return res;
        }
      }
    } catch(err) {
      Log.l(`DB.saveDoc(): Error saving doc '${id}' to database '${dbname}'!`);
      Log.e(err);
      throw err;
    }
  }

  public async saveConfigDoc(newDoc:any) {
    let dbname = "UNKNOWN_CONFIG_DATABASE", id = "UNKNOWN_DOC_ID";
    try {
      dbname = this.prefs.getDB('config');
      let res:any = await this.saveDoc(dbname, newDoc);
      return res;
    } catch(err) {
      Log.l(`saveConfigDoc(): Error saving doc to config database!`);
      Log.e(err);
      throw err;
    }
  }

  public async saveDocs(dbname:string, docs:any[]):Promise<any[]> {
    try {
      let outDoc = {
        docs: docs,
      };
      Log.l(`DB.saveDocs(): Attempting to save bulkDocs doc:\n`, outDoc);
      let db1:Database = this.addDB(dbname);
      let res:any = await db1.bulkDocs(<any>outDoc);
      db1.bulkDocs
      Log.l(`saveDocs(): Successfully saved docs array to database '${dbname}', results:\n`, res);
      if(res) {
        return res;
      }
    } catch(err) {
      Log.l(`saveDocs(): Error saving docs array to database '${dbname}'`);
      Log.e(err);
      throw err;
    }
  }

  public async saveSites(sites:Jobsite[]):Promise<Jobsite[]> {
    try {
      let dbname = this.prefs.getDB('jobsites');
      let sitesDocs = [];
      for(let site of sites) {
        let doc = site.serialize();
        sitesDocs.push(doc);
      }
      let res:any = await this.saveDocs(dbname, sitesDocs);
      Log.l(`DB.saveSites(): saved sites list, result:\n`, res);
      for(let result of res) {
        if(result.ok) {
          let id = result.id;
          let site = sites.find((a:Jobsite) => {
            return a._id === id;
          });
          if(site) {
            site._rev = result.rev;
          }
        }
      }
      return sites;
    } catch(err) {
      Log.l(`DB.saveSites(): Error saving jobsite array!`);
      Log.e(err);
      throw err;
    }
  }

  // public syncFromServer(dbname: string) {
  //   Log.l(`syncToServer(): About to attempt replication of remote->'${dbname}'`);
  //   let options = this.syncOptions;
  //   let ev1 = (a) => { Log.l(a.status); Log.l(a); };
  //   let db1 = this.addDB(dbname);
  //   let db2 = this.addRDB(dbname);
  //   let done = db1.replicate.from(db2, options)
  //     .on('change', info => { Log.l("syncFromServer(): change event fired. Status: ", info.status); Log.l(info); })
  //     .on('active', info => { Log.l("syncFromServer(): active event fired. Status: ", info.status); Log.l(info); })
  //     .on('paused', info => { Log.l("syncFromServer(): paused event fired. Status: ", info.status); Log.l(info); })
  //     .on('denied', info => { Log.l("syncFromServer(): denied event fired. Status: ", info.status); Log.l(info); })
  //     .on('complete', info => { Log.l("syncFromServer(): complete event fired. Status: ", info.status); Log.l(info); })
  //     .on('error', info => { Log.l("syncFromServer(): error event fired. Status: ", info.status); Log.l(info); })
  //     .on('cancel', info => { Log.l("syncFromServer(): cancel event fired. Status: ", info.status); Log.l(info); });
  //   Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
  //   window["stat1"] = done;
  //   return done;
  // }

  public async getAllConfigData():Promise<any> {
    try {
      Log.l("getAllConfigData(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, and shiftTimes …");
      let dbname = this.prefs.getDB('config');
      let db1 = this.addDB(dbname);
      // return new Promise((resolve, reject) => {
        // rdb1.allDocs({ keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shiftstarttime', 'other_reports'], include_docs: true }).then((records) => {
      let records:any = await db1.allDocs({ keys: ['client', 'location', 'locid', 'rotation', 'shift', 'shiftlength', 'shiftstarttime', 'other_reports'], include_docs: true });
      Log.l("getAllConfigData(): Retrieved documents:\n", records);
      let results = { clients: [], locations: [], locids: [], loc2nds: [], rotations: [], shifts: [], shiftlengths: [], shiftstarttimes: [], report_types: [], training_types: [] };
      for(let record of records.rows) {
        let type = record.id;
        let types = record.id + "s";
        if(type === 'other_reports') {
          let doc                = record.doc         ;
          let report_types       = doc.report_types   ;
          let training_types     = doc.training_types ;
          results.report_types   = report_types       ;
          results.training_types = training_types     ;
        } else {
          Log.l(`getAllConfigData(): Now retrieving type '${type}'...`);
          let doc = record.doc;
          if (doc) {
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
      Log.l("getAllConfigData(): Final config data retrieved is:\n", results);
      return results;
    } catch(err) {
      Log.l(`DB.getAllConfigData(): Error getting config data!`);
      Log.e(err);
      throw err;
    }
  }

  // public getAllConfig() {
  //   Log.l("getAllConfig(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, shiftTimes, shiftLengths, shiftTypes, and shiftStartTimes …");
  //   let db1 = this.addDB('sesa-config');
  //   return new Promise((resolve, reject) => {
  //     db1.allDocs({ keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shifttype', 'shiftstarttime'], include_docs: true }).then((docs) => {
  //       let results = { client: [], location: [], locid: [], loc2nd: [], rotation: [], shift: [], shiftlength: [], shifttype: [], shiftstarttime: [] };
  //       for(let type in docs.rows[0].doc) {
  //         let item = docs[type];
  //         if (item.doc) {
  //           results[type].push(item.doc);
  //         }
  //       }
  //       let clients:SESAClient[] = [];
  //       let locations:SESALocation[] = [];
  //       let locIDs:SESALocID[] = [];
  //       for(let row of results.client) {
  //         let item:SESAClient = new SESAClient(row);
  //         clients.push(item);
  //       }
  //       for(let row of results.location) {
  //         let item:SESALocation = new SESALocation(row);
  //         locations.push(item);
  //       }
  //       for(let row of results.locid) {
  //         let item:SESALocID = new SESALocID(row);
  //         locIDs.push(item);
  //       }
  //       results.client = clients;
  //       results.location = locations;
  //       results.locid = locIDs;
  //       resolve(results);
  //     }).catch((err) => {
  //       Log.l("getAllConfig(): Error getting all config docs!");
  //       Log.e(err);
  //       resolve([]);
  //     });
  //   });
  // }

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
      let dbname = this.prefs.getDB('employees');
      let db1 = this.addDB(dbname);
      db1.allDocs({ include_docs: true }).then((res) => {
        Log.l(`getEmployees(): Success! Result:\n`, res);
        let docArray = [];
        for (let item of res.rows) {
          if (item.doc && item.id[0] !== '_') {
            docArray.push(item.doc);
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

  public async getJobsites():Promise<Jobsite[]> {
    Log.l("getJobsites(): Retrieving job sites …");
    try {
      let dbname = this.prefs.getDB('jobsites');
      let db1 = this.addDB(dbname);
      let res:any = await db1.allDocs({ include_docs: true })
      Log.l("getJobsites(): Got allDocs for jobsites:\n", res);
      let sites:Jobsite[] = [];
      for(let row of res.rows) {
        let doc = row.doc;
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
    // return new Promise((resolve, reject) => {
    //   let db1 = this.addDB('sesa-jobsites');
    //   db1.allDocs({ include_docs: true }).then((docs) => {
    //     let docArray = [];
    //     Log.l("getJobsites(): Got allDocs for jobsites:\n", docs);
    //     for (let item of docs.rows) {
    //       if (item.doc && item.id[0] !== '_') {
    //         docArray.push(item.doc);
    //       }
    //     }
    //     Log.l("getJobsites(): Created docArray:\n", docArray);
    //     resolve(docArray);
    //   }).catch((err) => {
    //     Log.l("getJobsites(): Error getting allDocs from jobsites!");
    //     Log.e(err);
    //     resolve([]);
    //   })
    // });
  }

  public async getDBDocCount(dbtype:string):Promise<number> {
    try {
      let dbname:string = this.prefs.getDB(dbtype);
      if(dbname) {
        let db1:Database = this.addDB(dbname);
        let info:PDBInfo = await db1.info();
        let count:number = info.doc_count;
        return count;
      } else {
        Log.w(`DB.getDBDocCount(): Error finding database for DB type ${dbtype}`);
        return -1;
      }
    } catch(err) {
      Log.l(`DB.getDBDocCount(): Error getting doc count for DB type '${dbtype}'`);
      Log.e(err);
      // throw err;
      return -1;
    }
  }

  public async getDocCount(dbname:string):Promise<number> {
    try {
      let db1:Database = this.addDB(dbname);
      let info:PDBInfo = await db1.info();
      let count:number = info.doc_count;
      return count;
    } catch(err) {
      Log.l(`DB.getDocCount(): Error getting doc count for database '${dbname}'`);
      Log.e(err);
      throw err;
    }
  }

  public getReports(dbname:string, startDate?:Moment|Date) {
    let db1 = this.addDB(dbname);
    let query: any = { selector: { rprtDate: { $gte: "1900-01-01" } }, limit: 1000000 };
    if(startDate) {
      let date = moment(startDate);
      query.selector.rprtDate.$gte = date.format("YYYY-MM-DD");
    }
    return new Promise((resolve, reject) => {
      // db1.allDocs({ include_docs: true }).then(res => {
      db1.createIndex(query).then(res => {
        return db1.find(query);
      }).then((res:any) => {
        Log.l("DB.getReports(): Got documents:\n", res);
        let docArray:Report[] = [];
        for (let row of res.rows) {
          if (row.id[0] !== "_" && row['doc'] !== undefined) {
            let doc = row['doc'];
            let tmpReport = new Report();
            tmpReport.readFromDoc(doc);
            docArray.push(tmpReport);
          }
        }
        Log.l("DB.getReports(): Got reports:\n", docArray);
        resolve(docArray);
      }).catch(err => {
        Log.l("DB.getReports(): Error getting all work reports!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public updateStatusSync(text:string) {
    let loadText:string = "Retrieving data from:<br>\n";
    let elem = document.querySelector("div.loading-wrapper div.loading-content");
    if(elem) {
      elem.innerHTML = loadText + text + " …";
    } else {
      Log.l("updateStatusSync(): Fake loading controller text:\n", text);
    }
  }

  public updateStatus(text:string, loading:Loading) {
    let loadText:string = "Retrieving data from:<br>\n";
    if(loading && typeof loading.setContent === 'function') {
      loading.setContent(loadText + text + " …");
    } else {
      Log.l("updateStatus(): Fake loading controller text:\n", text);
    }
  }

  public updateStatusTick(text:string, loading:Loading) {
    let loadText:string = "Retrieving data from:<br>\n";
    // if(loading && typeof loading.setContent === 'function') {
    // Log.l("updateStatusTick(): Fake loading controller text:\n", text);
    loading.setContent(loadText + text + " …");
    this.thisApp.tick();
    // } else {
      // Log.l("updateStatus(): Fake loading controller text:\n", text);
    // }
  }

  public async updateStatusTickAsync(text:string, loading:Loading):Promise<any> {
    let loadText:string = "Retrieving data from:<br>\n";
    // if(loading && typeof loading.setContent === 'function') {
    // Log.l("updateStatusTick(): Fake loading controller text:\n", text);
    loading.setContent(loadText + text + " …");
    this.thisApp.tick();
    // } else {
      // Log.l("updateStatus(): Fake loading controller text:\n", text);
    // }
  }

  public async getWorkReports(fetchCount:number, spinnerID?:string):Promise<Report[]> {
    try {
      let reportsDB:string = this.prefs.getDB('reports');
      let db1 = this.addDB(reportsDB);
      // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : null;
      // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getWorkReports(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
      // let loading:Loading|{setContent:(text:string) => any} = this.alert.getSpinner(spinnerID);
      // loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      let loading:Loading = this.alert.getSpinner(spinnerID);
      function updateLoaderStatus(text:string) {
        let loadText:string = "Retrieving data from:<br>\n";
        if(loading && typeof loading.setContent === 'function') {
          loading.setContent(loadText + text + "…");
        } else {
          Log.l("Fake loading controller text:\n", text);
        }
      }

      Log.l("DB.getWorkReports(): Loading spinner is:", loading);
      let options = {include_docs: true};
      let res:any, reports:Report[] = [];
      // if(fetchCount && !fetchCount) {
      if(this.useQuery) {
        // Log.l(`DB.getWorkReports(): Attempting to load last ${fetchCount} reports …`);
        let total:number = await this.getDocCount(reportsDB);
        let fetch:number = typeof fetchCount === 'number' ? fetchCount : 1000000;
        Log.l(`DB.getWorkReports(): Attempting to load last ${total} reports …`);
        let select:any = {
          selector: {rprtDate: {$gte: "2000-01-01"}},
          sort: [{ rprtDate: "desc"}],
          limit: fetch,
        };
        res = await db1.find(select);
        if(res && Array.isArray(res.docs)) {
          let count:number = res.docs.length;
          Log.l(`DB.getWorkReports(): Got ${count} documents:`, res);
          let i:number = 0;
          let text:string = sprintf("Processing report %06d/%06d", i, count);
          Log.l(text);
          for(let doc of res.docs) {
            let tmpReport:Report = Report.deserialize(doc);
            reports.push(tmpReport);
          }
          let newCount:number = reports.length;
          Log.l(`DB.getWorkReports(): Queried and created array of ${newCount} reports.`);
        }
      } else {
        Log.l(`DB.getWorkReports(): Attempting to load all reports …`);
        if(!this.testDocs) {
          res = await db1.allDocs(options);
        } else {
          res = this.testDocs;
        }
        if(res && Array.isArray(res['rows'])) {
          Log.ti("processreports");
          let count:number = res.rows.length;
          Log.l(`DB.getWorkReports(): Got ${count} documents:`, res);
          let i = 0;
          let text1 = sprintf("Processing report %06d/%06d", i, count);
          Log.l(text1);
          // if(loading && loading.setContent) { loading.setContent(text); }
          // let reports:Report[] = new Report[]();
          for(let row of res.rows) {
            if(row.id[0] === '_' || row['doc'] == undefined) {
              i++;
              continue;
            }
            // if(loading && i % 2000 === 1) {
            if(i % 2000 === 1) {
              let text = sprintf("Processing report %06d/%06d", i-1, count);
              // let text:string = `Processing report ${i-2}/${count}`;
              Log.l(text);
              if(this.loadDelay) {
                await delay(this.loadDelay);
              }
              // if(this.runInZone) {
              if(this.runInZone === 1) {
                this.zone.run(() => {
                  // loading.setContent(text);
                  updateLoaderStatus(text);
                });
              } else if(this.runInZone === 2) {
                this.updateStatusTick(text, loading);
              } else if(this.runInZone === 3) {
                await this.updateStatusTickAsync(text, loading);
              } else if(this.runInZone === 4) {
                this.updateStatus(text, loading);
              } else if(this.runInZone === 5) {
                this.updateStatusSync(text);
              } else {
                updateLoaderStatus(text);
                // loading.setContent(text);
              }
            }
            let doc = row.doc;
            let tmpReport:Report = Report.deserialize(doc);
            reports.push(tmpReport);
            i++;
          }
          let newCount = reports.length;
          Log.l(`DB.getWorkReports(): Created array of ${newCount} reports.`);
          reports = reports.sort((a:Report,b:Report) => {
            let tsA = a.timestamp;
            let tsB = b.timestamp;
            return tsA > tsB ? -1 : tsA < tsB ? 1 : 0;
          });
          Log.tie("processreports");
        }
      }
      return reports;
    } catch(err) {
      Log.l(`DB.getWorkReports(): Error getting all work reports!`);
      Log.e(err);
      Log.tie("processreports");
      throw err;
    }
  }

  public delay = delay;

  public async testLoadReports():Promise<any> {
    try {
      let tn = "testloadreports";
      Log.ti(tn);
      let dbname:string = this.prefs.getDB('reports');
      let db1 = this.addDB(dbname);
      Log.l("DB.testLoadReports(): Loading ...");
      let options = {include_docs: true};
      let res:any = await db1.allDocs(options);
      this.testDocs = res;
      Log.tie(tn);
      return res;
    } catch(err) {
      Log.l(`testLoadReports(): Error test loading reports`);
      Log.e(err);
      throw err;
    }
  }

  public zoneInc(forceValue?:number):number {
    if(typeof forceValue === 'number') {
      this.runInZone = forceValue;
    } else {
      this.runInZone = this.runInZone >= 5 ? 0 : this.runInZone + 1;
    }
    return this.runInZone;
  }

  public async getAllReports(startDate?:Moment|Date, endDate?:Moment|Date):Promise<Report[]> {
    try {
      let dbname = this.prefs.getDB('reports');
      let db1 = this.addDB(dbname);
      this.loading = this.loading || {setContent: (input:string) => {Log.l("getAllReports(): Fake loading text: %s", input)}};
      Log.l("DB.getAllReports(): this.loading is:", this.loading);
      let options = {include_docs: true};
      let query: any = { selector: { rprtDate: { $gte: "1900-01-01" } }, limit: 1000000 };
      if(startDate) {
        let date = moment(startDate);
        query.selector.rprtDate.$gte = date.format("YYYY-MM-DD");
      }
      if(endDate) {
        let sdate = moment(startDate).format("YYYY-MM-DD");
        let edate = moment(endDate).format("YYYY-MM-DD");
        query = {selector: {rprtDate: {$and: [{$gte: sdate}, {$lte: edate}]}}, limit: 1000000};
      }
        // db1.allDocs(options).then(res => {
      let res:any = await db1.find(query);
      let count = res.docs.length;
      Log.l(`DB.getAllReports(): Got ${count} documents:\n`, res);
      let i = 0;
      let text = sprintf("Processing report %06d/%06d", i, count);
      Log.l(text);
      // if(this.loading) { this.loading.setContent(text);}
      this.loading.setContent(text);
      let docArray:Report[] = [];
      for (let doc of res.docs) {
        // if (row.id[0] !== "_" && row['doc'] !== undefined) {
          // let doc = row['doc'];
          // if(((i++%50)===0) && this.loading) {
          if(i % 50 === 0) {
            // let newText = sprintf("Processing report %06d/%06d", ++i, count);
            // this.loading.setContent(newText);
            Log.l("Processing report %d/%d ...", i, count);
            this.loading.setContent("Processing report " + i + " ...");
          }
          let tmpReport = new Report();
          tmpReport.readFromDoc(doc);
          docArray.push(tmpReport);
          i++;
        // }
      }
      // Log.l("getAllReports(): Got reports:\n", docArray);
      let newCount = docArray.length;
      Log.l(`DB.getAllReports(): Created array of ${newCount} reports.`);
      return docArray;
    } catch(err) {
      Log.l(`DB.getAllReports(): Error getting all work reports!`);
      Log.e(err);
      throw err;
    }
  }

  public async getAllReportsPlusNew(startDate?:Moment|Date):Promise<Report[]> {
    try {
      let res:Report[] = await this.getAllReports(startDate);
      Log.l("DB.getAllReportsPlusNew(): Returning final array of reports:", res);
      return res;
    } catch(err) {
      Log.l(`DB.getAllReportsPlusNew(): Error retrieving reports.`);
      Log.e(err);
      throw err;
    }
  }

  public async getReportOthers(spinnerID?:string):Promise<ReportOther[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getOtherReports(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getReportOthers(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    try {
      let dbname:string = this.prefs.getDB('reports_other');
      let db1 = this.addDB(dbname);
      // this.loading.setContent("Processing non-work reports …");
      let res:any = await db1.allDocs({ include_docs: true });
      Log.l(`DB.getReportOthers(): Successfully retrieved other reports:\n`, res);
      let others:ReportOther[] = [];
      if(res && Array.isArray(res['rows'])) {
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] != undefined) {
            let doc = row['doc'];
            let other = new ReportOther();
            other.readFromDoc(doc);
            others.push(other);
          }
        }
      }
      Log.l("DB.getReportOthers(): Returning array of other reports:", others);
      return others;
    } catch(err) {
      Log.l(`DB.getReportOthers(): Error retrieving ReportOther list!`);
      Log.e(err);
      throw err;
    }
  }

  public async getReportLogistics(fetchCount?:number, spinnerID?:string):Promise<ReportLogistics[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getReportLogistics(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getReportLogistics(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    try {
      let dbname:string = this.prefs.getDB('logistics');
      let db1:Database = this.addDB(dbname);
      // this.loading.setContent("Processing logistics reports …");
      let res:any = await db1.allDocs({ include_docs: true });
      Log.l(`DB.getReportLogistics(): Successfully retrieved logistics reports:`, res);
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
      Log.l("DB.getReportLogistics(): Returning array of logistics reports:\n", logistics);
      return logistics;
    } catch(err) {
      Log.l(`DB.getReportLogistics(): Error retrieving ReportLogistics list!`);
      Log.e(err);
      throw err;
    }
  }

  public getLogisticsReports = this.getReportLogistics;

  public async getReportTimeCards(spinnerID?:string):Promise<ReportTimeCard[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getReportTimeCards(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getReportTimeCards(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    let reports:ReportTimeCard[] = [];
    try {
      let dbname:string = this.prefs.getDB('timecards');
      let db1:Database = this.addDB(dbname);
      // this.loading.setContent("Processing timecard reports …");
      let res:any = await db1.allDocs({ include_docs: true });
      Log.l(`DB.getReportTimeCards(): Successfully retrieved timecard reports:\n`, res);
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
      Log.l("DB.getReportTimeCards(): Returning array of timecard reports:\n", reports);
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
      Log.l(`DB.getReportTimeCards(): Error retrieving TimeCard report list`);
      Log.l(err);
      // return reports;
      throw err;
    }
  }

  public getTimeCards = this.getReportTimeCards;

  public async getOldReports(spinnerID?:string):Promise<Report[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getOtherReports(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getOldReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    let dbnames = this.prefs.getOldReportsDBList();
    try {
      let loading:Loading|{setContent:Function} = this.alert.getSpinner(spinnerID);
      loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    // this.loading.setContent("Processing old reports …");
      let reports:Report[] = [];
      for(let dbname of dbnames) {
        try {
          let db1 = this.addDB(dbname);
          Log.l(`DB.getOldReports(): retrieving all reports from '${dbname}'...`)
          let resOneDB:Report[] = await this.getReportsFromDB(dbname);
          Log.l(`DB.getOldReports(): Successfully retrieved reports from '${dbname}', report list is:\n`, resOneDB);
          reports = [...reports, ...resOneDB];
        } catch(err) {
          Log.l(`DB.getOldReports(): Error getting reports from old reports DB '${dbname}'!`);
          Log.e(err);
          throw err;
        }
      }
      Log.l(`DB.getOldReports(): Final array of old reports from is:`, reports);
      return reports;
    } catch(err) {
      Log.l(`DB.getOldReports(): Error retrieving old reports at some point from OldReports list:`, dbnames);
      Log.e(err);
      throw err;
    }
  }

  // public async getSchedules(archives?:boolean, employees?:Employee[]):Promise<Schedule[]> {
  public async getSchedules(archives?:boolean, employees?:Employee[], spinnerID?:string):Promise<Schedule[]> {
      try {
      Log.l("DB.getSchedules(): Firing up, spinnerID is:", spinnerID);
      let dbname:string = this.prefs.getDB('scheduling');
      let db1 = this.addDB(dbname);
      let now = moment().startOf('day');
      let startDate:Moment = moment(now).subtract(12, 'weeks').startOf('week');
      let endDate:Moment = moment(now).add(10, 'years').startOf('week');
      let start:string = startDate.format("YYYY-MM-DD");
      let end:string = endDate.format("YYYY-MM-DD");
      let res:any = await db1.allDocs({ include_docs: true, startkey: start, endkey: end});
      Log.l("DB.getSchedules(): Got initial schedule results:", res);
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
        Log.l("DB.getSchedules(): Final result array is:", schedules);
      }
      return schedules;
    } catch(err) {
      Log.l("DB.getSchedules(): Error retrieving schedule list!");
      Log.e(err);
      return null;
      // resolve(null);
    }
  }

  // public async getData(dbname:string, spinnerID?:string):Promise<any> {
  //   try {

  //     return res;
  //   } catch(err) {
  //     Log.l(`getDataFor(): Error getting data for '${dbname}'`);
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  public async getAllNonScheduleData(getReports:boolean, spinnerID?:string):Promise<any> {
    try {
      // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      // let loading:any = this.alert.getSpinner(spinnerID);
      // let loading:Loading|{setContent:Function} = this.alert.getSpinner(spinnerID);
      // loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      Log.l(`DB.getAllNonScheduleData(): GETTING REPORTS: ${getReports}, spinnerID:`, spinnerID);
      // function updateLoaderStatus(text:string) {
      //   let loadText:string = "Retrieving data from:<br>\n";
      //   loading.setContent(loadText + text + "…");
      // }
      let loading:Loading = this.alert.getSpinner(spinnerID);
      function updateLoaderStatus(text:string) {
        let loadText:string = "Retrieving data from:<br>\n";
        if(loading && typeof loading.setContent === 'function') {
          loading.setContent(loadText + text + "…");
        } else {
          Log.l("Fake loading controller text:\n", text);
        }
      }
      // let reportDate:Moment = moment().subtract(2, 'weeks');
      // let data:any = { sites: [], employees: [], reports: [], others: [], logistics:[], timecards: [], periods: [], shifts: [], old_reports: [], schedules: [] };
      let data:{ sites:Jobsite[], employees:Employee[], reports:Report[], others:ReportOther[], logistics:ReportLogistics[], timecards:ReportTimeCard[], periods:PayrollPeriod[], shifts:any[], old_reports:Report[], schedules:any[] } = {
        sites: [], employees: [], reports: [], others: [], logistics:[], timecards: [], periods: [], shifts: [], old_reports: [], schedules: [],
      };
      // if(loading && loading.setContent) { loading.setContent(loadText + "sesa-jobsites …"); }
      // let text:string = "sesa-jobsites";
      // updateLoaderStatus(text);
      // loading.setContent(loadText + text);
      // let res:any = await this.getJobsites();
      updateLoaderStatus("sesa-jobsites");
      let res:any;
      let sites:Jobsite[] = await this.getJobsites();
      data.sites = sites;
      // for(let doc of res) {
      //   let site = new Jobsite();
      //   site.readFromDoc(doc);
      //   data.sites.push(site);
      // }
      // data.sites = res;
      updateLoaderStatus("sesa-employees");
      data.employees = await this.getEmployees();
      // data.employees = 
      // for(let doc of res) {
      //   let user = new Employee();
      //   user.readFromDoc(doc);
      //   data.employees.push(user);
      // }
      updateLoaderStatus("sesa-logistics");
      res = await this.getReportLogistics();
      data.logistics = res;

      updateLoaderStatus("sesa-timecards");
      res = await this.getReportTimeCards();
      data.timecards = res;

      if(this.prefs.CONSOLE.global.loadMiscReports) {
        updateLoaderStatus("sesa-reports-other");
        // loading.setContent(loadText + "sesa-reports-other …");
        let ros:ReportOther[] = await this.getReportOthers();
        data.others = ros.sort((a:ReportOther, b:ReportOther) => {
          // let dA = a.report_date.format("YYYYMMDD");
          // let dB = b.report_date.format("YYYYMMDD");
          let dA:string = a.getReportDateAsString();
          let dB:string = b.getReportDateAsString();
          let tA = a.timestamp;
          let tB = b.timestamp;
          let uA = a.username;
          let uB = b.username;
          return dA > dB ? -1 : dA < dB ? 1 : tA > tB ? -1 : tA < tB ? 1 : uA < uB ? -1 : uA > uB ? 1 : 0;
        });
      }
      if(this.prefs.CONSOLE.global.loadOldReports) {
        updateLoaderStatus("sesa-reports-old");
        // loading.setContent(loadText + "sesa-reports-old ...");
        let ors:Report[] = await this.getOldReports();
        data.old_reports = ors;
      }
      // loading.setContent(loadText + "sesa-scheduling …");
      // res = await this.getSchedules();
      // data.schedules = res;
      if(!getReports) {
        Log.l("getAllNonScheduleData(): Success, final data to be returned is:\n", data);
        return data;
      } else {
        let fetchCount:number = this.prefs.CONSOLE.global.reportsToLoad || 1000000;
        updateLoaderStatus("sesa-reports");
        let rpts:Report[] = await this.getReportsData(fetchCount, spinnerID);
        Log.l("getAllNonScheduleData(): Success plus reports, final data to be returned is:\n", data);
        data.reports = rpts;
        return data;
      }
    } catch(err) {
      Log.l(`getAllNonScheduleData(): Error retrieving data!`);
      Log.e(err);
      throw err;
    }
  }

  public getAllData(getReports:boolean, spinnerID?:string):Promise<any> {
    // let loading = loadingController ? loadingController : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    let loadText = "Retrieving data from:<br>\n"
    return new Promise((resolve, reject) => {
      let reportDate = moment().subtract(2, 'weeks');
      let data = { sites: [], employees: [], reports: [], others: [], logistics:[], timecards: [], periods: [], shifts: [], schedules: [] };
      loading.setContent(loadText + "sesa-jobsites …");
      this.getJobsites().then(res => {
        for (let doc of res) {
          let site = new Jobsite();
          site.readFromDoc(doc);
          data.sites.push(site);
        }
        loading.setContent(loadText + "sesa-employees …");
        return this.getEmployees();
      }).then(res => {
        for (let doc of res) {
          let user = new Employee();
          user.readFromDoc(doc);
          data.employees.push(user);
        }
        loading.setContent(loadText + "sesa-reports-other …");
        return this.getReportOthers();
      }).then((res:ReportOther[]) => {
        data.others = res.sort((a:ReportOther, b:ReportOther) => {
          // let dA = a.report_date.format("YYYYMMDD");
          // let dB = b.report_date.format("YYYYMMDD");
          let dA:string = a.getReportDateAsString();
          let dB:string = b.getReportDateAsString();
          let tA = a.timestamp;
          let tB = b.timestamp;
          let uA = a.username;
          let uB = b.username;
          return dA > dB ? -1 : dA < dB ? 1 : tA > tB ? -1 : tA < tB ? 1 : uA < uB ? -1 : uA > uB ? 1 : 0;
        });
        // Log.l("getAllData(): Success, final data to be returned is:\n", data);
        loading.setContent(loadText + "sesa-scheduling …");
        return this.getSchedules();
      }).then(res => {
        data.schedules = res;
        if(!getReports) {
          Log.l("getAllData(): Success, final data to be returned is:\n", data);
          resolve(data);
        } else {
          let count:number = this.prefs.CONSOLE.global.reportsToLoad || 1000000;
          this.getReportsData(count, spinnerID).then(res => {
            Log.l("getAllData(): Success plus reports, final data to be returned is:\n", data);
            data.reports = res;
            resolve(data);
          }).catch(err => {
            throw err;
          });
        }
      }).catch(err => {
        Log.l("getAllData(): Error retrieving all data!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public async getReportsData(fetchCount:number, spinnerID?:string):Promise<Report[]> {
    // let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    try {
      // let loadText = "Retrieving data from:<br>\n";
      // if(loading && loading.setContent) { loading.setContent(loadText + "reports_ver101100 …"); }
      let res:Report[] = await this.getWorkReports(fetchCount, spinnerID);
      return res;
    } catch(err) {
      Log.l(`getReportsData(): Error getting reports!`);
      Log.e(err);
      throw err;
    }
  }

  public async str2blob(str:string):Promise<Blob> {
    return blobUtil.base64StringToBlob(str);
  }

  public async data2blob(data:any, out:any):Promise<any> {
    try {
      let keys = Object.keys(data);
      for(let i of keys) {
        // out[i] = [];
        let dat = data[i];
        for(let doc of dat) {
          let binData = doc.asset;
          let binURL:string;
          let contentType:string = doc && doc.type ? doc.type : 'audio/mpeg';
          if(binData instanceof ArrayBuffer) {
            let sound:Blob = blobUtil.arrayBufferToBlob(binData, contentType);
            // let sound = blobUtil.arrayBufferToBinaryString(buffer)
            binURL = URL.createObjectURL(sound);
            // out[i].push(sound)
          } else if(binData instanceof Uint8Array) {
            // let binBuffer:ArrayBuffer = binData.buffer.slice(0);
            // let binBuffer:any = binData.buffer;
            let binBuffer = binData.buffer;
            let sound:Blob = blobUtil.arrayBufferToBlob((binBuffer as ArrayBuffer), contentType);
            binURL = URL.createObjectURL(sound);
          } else if(binData instanceof Blob) {
            binURL = URL.createObjectURL(binData);
          } else if(typeof binData === 'string') {
            let blob:Blob = await this.str2blob(binData);
            binURL = URL.createObjectURL(blob);
          } else {
            Log.w(`DB.data2blob(): Could not figure out type of data to convert to blob:`, binData);
            binURL = "";
          }
          if(!Array.isArray(out[i])) {
            out[i] = [];
          }
          out[i].push(binURL);
        }
      }
      return out;
    } catch (err) {
      Log.l("data2blob(): Error processing base64 data to Blob!");
      Log.e(err);
      throw err;
    }
  }

  public async getSounds() {
    try {
      let dbname:string = this.prefs.getDB('sounds');
      let db1:Database = this.addDB(dbname);
      // const str2blob = async (str:string):Promise<Blob> => {
      //   return blobUtil.base64StringToBlob(str);
      // };
      // const data2blob = async (data:any, out:any):Promise<any> => {
      //   // return new Promise((resolve, reject) => {
      //   try {
      //     // let out = {};
      //     let keys = Object.keys(data);
      //     for(let i of keys) {
      //       // out[i] = [];
      //       let dat = data[i];
      //       for(let doc of dat) {
      //         let binData = doc.asset;
      //         let binURL:string;
      //         let contentType:string = doc && doc.type ? doc.type : 'audio/mpeg';
      //         if(binData instanceof ArrayBuffer) {
      //           let sound:Blob = blobUtil.arrayBufferToBlob(binData, contentType);
      //           // let sound = blobUtil.arrayBufferToBinaryString(buffer)
      //           binURL = URL.createObjectURL(sound);
      //           // out[i].push(sound)
      //         } else if(binData instanceof Blob) {
      //           binURL = URL.createObjectURL(binData);
      //         } else if(typeof binData === 'string') {
      //           let blob:Blob = await str2blob(binData);
      //           binURL = URL.createObjectURL(blob);
      //         }
      //         out[i].push(binURL);
      //       }
      //     }

      //     return out;
      //     // resolve(out);
      //   } catch (err) {
      //     Log.l("data2blob(): Error processing base64 data to Blob!");
      //     Log.e(err);
      //     throw err;
      //     // reject(err);
      //   }
      //   // });
      // };
      Log.l("getSounds(): Now attempting to get sounds from server ….");
      let res:any = await db1.allDocs({ include_docs: true, attachments: true, binary:true });
      Log.l("getSounds(): Successfully got sounds back from server:\n", res);
      let out:any = {};
      let docs:any[] = res.rows.map((a:any) => {return a.doc;});
      // for(let row of res.rows) {
      for(let doc of docs) {
        let id:string = doc._id;
        if(doc && doc._attachments) {
          let oneType:any[] = [];
          // out[id] = [];
          for(let key in doc._attachments) {
            let data = doc._attachments[key].data;
            let type:string = doc._attachments[key].content_type;
            type SoundItem = {file:string, type:string, asset:string|Blob|ArrayBuffer};
            let item:SoundItem = { file: key, type: type, asset: data };
            oneType.push(item);
            // out[id].push();
          }
          out[id] = oneType;
        } else {
          out[id] = [];
        }
      }
      let output:any = {};
      let keys = Object.keys(out);
      for(let key of keys) {
        output[key] = [];
      }
      Log.l("getSounds(): Calling data2blob with out and finalout:", out);
      // JSON.stringify(output)
      Log.l(output);
      let res2:any = await this.data2blob(out, output);
      Log.l("getSounds(): Final output will be:", output);
      // this.sounds = output;
      // resolve(output);
        // }).then(res => {
      Log.l("getSounds(): Success! Got sounds:", res2);
      return res2;
    } catch(err) {
      Log.l("getSounds(): Error getting sounds back from server!");
      Log.e(err);
      throw err;
    }
  }

  // public getSoundsPromise() {
  //   return new Promise((resolve, reject) => {
  //     let dbname:string = this.prefs.getDB('sounds');
  //     let db1 = this.addDB(dbname);
  //     const str2blob = async (str: string) => {
  //       return blobUtil.base64StringToBlob(str);
  //     };
  //     const data2blob = async (data: any, out: any) => {
  //       // return new Promise((resolve, reject) => {
  //       try {
  //         // let out = {};
  //         let keys = Object.keys(data);
  //         for(let i of keys) {
  //           // out[i] = [];
  //           let dat = data[i];
  //           for(let doc of dat) {
  //             let blob = await str2blob(doc.asset);
  //             let blobURL = URL.createObjectURL(blob);
  //             out[i].push(blobURL);
  //           }
  //         }
  //         return out;
  //         // resolve(out);
  //       } catch (err) {
  //         Log.l("data2blob(): Error processing base64 data to Blob!");
  //         Log.e(err);
  //         throw err;
  //         // reject(err);
  //       }
  //       // });
  //     };
  //     Log.l("getSounds(): Now attempting to get sounds from server ….");
  //     db1.allDocs({ include_docs: true, attachments: true }).then(res => {
  //       Log.l("getSounds(): Successfully got sounds back from server:\n", res);
  //       let out = {};
  //       for (let row of res.rows) {
  //         let doc = row.doc;
  //         if (doc && doc._attachments) {
  //           out[row.id] = [];
  //           for (let key in doc._attachments) {
  //             let data = doc._attachments[key].data;
  //             out[row.id].push({ 'file': key, 'asset': data });
  //           }
  //         }
  //       }
  //       let output = {};
  //       let keys = Object.keys(out);
  //       for (let key of keys) {
  //         output[key] = [];
  //       }
  //       Log.l("getSounds(): Calling data2blob with out and finalout:\n", out, JSON.stringify(output));
  //       return data2blob(out, output);
  //     }).then(output => {

  //       Log.l("getSounds(): Final output will be:\n", output);
  //       resolve(output);
  //       // }).then(res => {
  //       //   Log.l("getSounds(): Success! Got sounds:\n", res);
  //       //   resolve(res);
  //     }).catch(err => {
  //       Log.l("getSounds(): Error getting sounds back from server!");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public async saveReport(report:Report, username?:string):Promise<UpsertResponse> {
    try {
      let dbname = this.prefs.getDB('reports');
      let db1 = this.addDB(dbname);
      let ts:string = moment().format();
      let user:string = username ? username : window['onsiteconsoleusername'] ? window['onsiteconsoleusername'] : "unknown_user";
      let nr:any = report.serialize();
      // nr.time_start = report.time_start.format();
      // nr.time_end = report.time_end.format();
      // let rpt:any = JSON.stringify(report);
      let res = await db1.upsert(nr._id, (doc:any) => {
        if(doc && doc._id) {
          let rev = doc._rev;
          nr._rev = rev;
          doc = nr;
          doc.change_log = doc.change_log || [];
          doc.change_log.push({
            change: "updated",
            user: user,
            timestamp: ts,
          });
        } else {
          doc = nr;
          doc.change_log = doc.change_log || [];
          doc.change_log.push({
            change: "created",
            user: user,
            timestamp: ts,
          });
        }
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        Log.l(`saveReport(): Upsert error saving report ${report._id}.`, res);
        throw res;
      } else {
        Log.l(`saveReport(): Successfully saved report ${report._id}.`, res);
      }
      return res;
    } catch(err) {
      Log.l(`DB.saveReport(): Error saving report '${report._id}'`);
      Log.e(err);
      throw err;
    }
  }

  public deleteReport(report:Report) {
    let db = this.prefs.getDB();
    let db1 = this.addDB(db.reports);
    return new Promise((resolve, reject) => {
      db1.upsert(report._id, (doc:any) => {
        doc._deleted = true;
        return doc;
      }).then(res => {
        if (!res['ok'] && !res.updated) {
          Log.l(`deleteReport(): Upsert error trying to delete doc ${report._id}.`);
          Log.e(res);
          reject(res);
        } else {
          Log.l(`deleteReport(): Successfully deleted doc ${report._id}.`);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`deleteReport(): Could not delete doc ${report._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveOtherReport(other:ReportOther) {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.reports_other);
      db1.upsert(other._id, (doc:any) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          other._rev = rev;
          doc = other;
        } else {
          doc = other;
        }
        return doc;
      }).then(res => {
        if (!res['ok'] && !res.updated) {
          Log.l(`saveOtherReport(): Upsert error saving ReportOther ${other._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`saveOtherReport(): Successfully saved ReportOther ${other._id}.\n`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`saveOtherReport(): Error saving ReportOther ${other._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public deleteOtherReport(other:ReportOther) {
    let db = this.prefs.getDB();
    let db1 = this.addRDB(db.reports);
    return new Promise((resolve, reject) => {
      db1.upsert(other._id, (doc:any) => {
        doc._deleted = true;
        return doc;
      }).then(res => {
        if (!res['ok'] && !res.updated) {
          Log.l(`deleteOtherReport(): Upsert error trying to delete doc ${other._id}.`);
          Log.e(res);
          reject(res);
        } else {
          Log.l(`deleteOtherReport(): Successfully deleted doc ${other._id}.`);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`deleteOtherReport(): Could not delete doc ${other._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async saveJobsite(jobsite:Jobsite):Promise<UpsertResponse> {
    try {
      Log.l("saveJobsite(): Saving job site:", jobsite);
      let db1 = this.addDB('sesa-jobsites');
      if(!jobsite._id) {
        jobsite._id = jobsite.getSiteID();
      }
      Log.l(`saveJobsite(): Now attempting to save jobsite '${jobsite._id}:\n`,jobsite);
      let siteDoc = jobsite.serialize();
      let res:UpsertResponse = await db1.upsert(siteDoc._id, (doc:any) => {
        if(doc._id && doc._rev) {
          siteDoc._rev = doc._rev;
        } else {
          delete siteDoc._rev;
        }
        return siteDoc;
      });
      if(!res.ok && !res.updated) {
        Log.l(`saveJobsite(): Upsert error saving jobsite '${jobsite._id}:`, res);
        let text:string = res && typeof res.message === 'string' ? res.message : "unknown_upsert_error";
        let err = new Error(text);
        throw err;
      } else {
        return res;
      }
    } catch(err) {
      Log.l(`saveJobsite(): Error saving jobsite:`, jobsite);
      Log.e(err);
      throw err;
    }
  }

  public saveInvoice(type:string, invoice: Invoice) {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let dbname = `invoices_${type.toLowerCase()}`;
      let db1 = this.addDB(db[dbname]);
      let ts = moment().format();
      // let user = username ? username : window['onsiteconsoleusername'] ? window['onsiteconsoleusername'] : "unknown_user";
      let inv:any = invoice.serialize();
      // nr.time_start = report.time_start.format();
      // nr.time_end = report.time_end.format();
      // let rpt:any = JSON.stringify(report);
      db1.upsert(inv._id, (doc:any) => {
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

  public async saveInvoices(type:string, invoices:Invoice[]) {
    let results = [];
    for(let invoice of invoices) {
      let saveResult = await this.saveInvoice(type, invoice);
      results.push(saveResult);
    }
    Log.l("saveInvoices(): Results are:\n", results);
    return results;
  }

  public getInvoices(type:string, start:string, end:string) {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let dbname = `invoices_${type.toLowerCase()}`;
      let db1 = this.addDB(db[dbname]);
      db1.allDocs({include_docs: true}).then(res => {
        Log.l(`getInvoices(): Successfully retrieved invoices, raw results are:\n`, res);
        let invoices:Invoice[] = [];
        for(let row of res.rows) {
          if(row.id[0] !== '_' && row.doc) {
            let doc:any = row.doc;
            if(doc.period_start >= start && moment(doc.period_start, "YYYY-MM-DD").add(6, 'day').format("YYYY-MM-DD") <= end) {
              let invoice:Invoice = Invoice.deserialize(doc);
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

  public savePreauth(preauth:PreAuth) {
    return new Promise((resolve,reject) => {
      let dbname:string = this.prefs.getDB('preauths');
      let db1:Database = this.addDB(dbname);
      // db1.allDocs({include_docs: true}).then(res => {
      // })
      let pdoc:any = preauth.serialize();
      db1.upsert(pdoc._id, (doc:any) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          pdoc._rev = rev;
          doc = pdoc;
        } else {
          delete pdoc._rev;
          doc = pdoc;
        }
        return doc;
      }).then(res => {
        if (!res['ok'] && !res.updated) {
          Log.l(`savePreauth(): Upsert error saving report ${pdoc._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`savePreauth(): Successfully saved report ${pdoc._id}.\n`, res);
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
    Log.l("savePreauths(): Results are:\n", results);
    return results;
  }

  public getPreauths(start:string, end:string):Promise<PreAuth[]> {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.preauths);
      db1.allDocs({include_docs: true}).then(res => {
        Log.l(`getPreauths(): Successfully retrieved preauths, raw results are:\n`, res);
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
        Log.l(`getPreauths(): Final invoice array is:\n`, preauths);
        resolve(preauths);
      }).catch(err => {
        Log.l(`getPreauths(): Error getting invoices between '${start}' and '${end}'.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public getDPSSettings() {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB('sesa-config');
      let id = "dps_config";
      db1.get(id).then(res => {
        let dps = new DPS();
        dps.deserialize(res);
        Log.l("getDPSSettings(): Successfully retrieved DPS settings:\n", dps);
        resolve(dps);
      }).catch(err => {
        Log.l("getDPSSettings(): Error getting DPS settings!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveDPSSettings(dpsDoc:any) {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB('sesa-config');
      let id = "dps_config";
      db1.upsert(id, (doc:any) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = dpsDoc;
          doc._id = id;
          doc._rev = rev;
        } else {
          doc = dpsDoc;
          doc._id = id;
        }
        Log.l("saveDPSSettings(): Now upserting doc:\n", doc);
        return doc;
      }).then(res => {
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

  public getTechPhones():Promise<any[]> {
    Log.l("getTechPhones(): Firing up …");
    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-tech-phones');
      db1.allDocs({ include_docs: true }).then(res => {
        Log.l("getTechPhones(): Got initial doc list:\n", res);
        let techPhones: any[] = [];
        for (let row of res.rows) {
          if (row.id[0] !== '_' && row.doc) {
            let doc = row.doc;
            techPhones.push(doc);
          }
        }
        Log.l("getTechPhones(): Final result array is:\n", techPhones);
        resolve(techPhones);
      }).catch((err) => {
        Log.l("getTechPhones(): Error retrieving tech phones list!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public async getReportsFromDB(dbname:string):Promise<Report[]> {
    try {
      // let db = this.prefs.getDB();
      // let db1 = this.addDB(db.reports_old01);
      let db1 = this.addDB(dbname);
      Log.l(`DB.getReportsFromDB(): retrieving all reports from '${dbname}'...`)
      let res:any = await db1.allDocs({include_docs:true});
      Log.l(`DB.getReportsFromDB(): Successfully retrieved reports from '${dbname}', raw list is:\n`, res);
      let reports:Report[] = [];
      for (let row of res.rows) {
        if (row.id[0] !== '_' && row.doc) {
          let doc = row.doc;
          let rpt = new Report();
          rpt.readFromDoc(doc);
          reports.push(rpt);
        }
      }
      Log.l(`DB.getReportsFromDB(): Final array of reports from '${dbname}' is:\n`, reports);
      return reports;
    } catch(err) {
      Log.l(`DB.getReportsFromDB(): Error retrieving reports from db '${dbname}'.`);
      Log.e(err);
      throw err;
    }
  }

  public async getAllCLL(type:CLLNames):Promise<CLLS[]> {
    try {
      let dbname = this.prefs.getDB('config');
      let db1 = this.addDB(dbname);
      let docid:string = "", record:string = "";
      if(type === 'client') {
        docid = 'client';
      } else if(type === 'location') {
        docid = 'location';
      } else if(type === 'locID') {
        docid = 'locid';
      }
      record = `${docid}s`;
      Log.l(`getAllCLL(): Getting list of ${type}s ...`);
      let doc:any = await db1.get(docid);
      Log.l(`getAllCLL(): Got ${type} list:\n`, doc);
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
      Log.l(`getAllCLL(): Error getting ${type} list.`);
      Log.e(err);
      return [];
    }
  }

  public async saveCLL(type:CLLNames, newCLL:CLLS):Promise<CLLS[]> {
    try {
      let dbname = this.prefs.getDB('config');
      let db1 = this.addDB(dbname);
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
      let res:any = await db1.upsert(docid, (doc:any) => {
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
        Log.l(`saveCLL(): Error saving ${type}:`, newCLL);
        Log.e(res);
        let text:string = `saveCLL(): Error saving '${type}'`;
        throw new Error(text);
      } else {
        Log.l(`saveCLL(): ${type} saved:\n`, res);
        let out:CLLS[] = await this.getAllCLL(type);
        return out;
      }
    } catch(err) {
      Log.l(`saveCLL(): Error saving ${type}:\n`, newCLL);
      Log.e(err);
      throw err;
    }
  }

  public async saveCLLs(type:CLLNames, newCLLs:CLLS[]):Promise<CLLS[]> {
    try {
      let dbname = this.prefs.getDB('config');
      let db1 = this.addDB(dbname);
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
        let text:string = `saveCLLs(): Type invalid: ${type}`;
        Log.w(text);
        throw new Error(text);
      }
      // let code   = newCLL && newCLL.code ? newCLL.code : "";
      let res:any = await db1.upsert(docid, (doc:any) => {
        if(doc) {
          doc[record] = newCLLs;
        }
        doc['list'] = doc[record].map((a:any) => a.code);
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        let text:string = `saveCLLs(): Error saving type '${type}'`;
        Log.l(text, newCLLs);
        Log.e(res);
        throw new Error(text);
      } else {
        Log.l(`saveCLLs(): ${type}s saved:\n`, res);
        let out:CLLS[] = await this.getAllCLL(type);
        return out;
      }
    } catch(err) {
      Log.l(`saveCLLs(): Error saving ${type}s:\n`, newCLLs);
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
      Log.l(`getClients(): Error getting ${type} list!`);
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
      Log.l(`saveClient(): Error saving ${type}:\n`, item);
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
      Log.l(`saveClients(): Error saving ${type}s:\n`, items);
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
      Log.l(`getLocations(): Error getting ${type} list!`);
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
      Log.l(`saveLocation(): Error saving ${type}:\n`, item);
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
      Log.l(`saveLocations(): Error saving ${type}s:\n`, items);
      Log.e(err);
      return [];
    }
  }

  public async getLocIDs():Promise<SESALocID[]> {
    let type:CLLNames = 'locID';
    try {
      let out:SESALocID[] = [];
      let res:CLLS[] = await this.getAllCLL(type);
      for(let item of res) {
        if(item instanceof SESALocID) {
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`getLocIDs(): Error getting ${type} list!`);
      Log.e(err);
      return [];
    }
  }

  public async saveLocID(item:SESALocID):Promise<SESALocID[]> {
    let type:CLLNames = 'locID';
    try {
      let out:SESALocID[] = [];
      let res:CLLS[] = await this.saveCLL(type, item);
      for(let item of res) {
        if(item instanceof SESALocID) {
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`saveLocation(): Error saving ${type}:\n`, item);
      Log.e(err);
      return [];
    }
  }

  public async saveLocIDs(items:SESALocID[]):Promise<SESALocID[]> {
    let type:CLLNames = 'location';
    try {
      let out:SESALocID[] = [];
      let res:CLLS[] = await this.saveCLLs(type, items);
      for(let item of res) {
        if(item instanceof SESALocID) {
          out.push(item);
        }
      }
      return out;
    } catch(err) {
      Log.l(`saveLocIDs(): Error saving ${type}s:\n`, items);
      Log.e(err);
      return [];
    }
  }

  // public async getOldReports():Promise<Report[]> {
  //   try {
  //     let db = this.prefs.getDB();
  //     let db1 = this.addDB(db.reports_old01);
  //     Log.l(`DB.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
  //     let res:any = await db1.allDocs({include_docs:true});
  //     Log.l("getOldReports(): Successfully retrieved old reports, raw list is:\n", res);
  //     let reports:Report[] = [];
  //     for (let row of res.rows) {
  //       if (row.id[0] !== '_' && row.doc) {
  //         let doc = row.doc;
  //         let rpt = new Report();
  //         rpt.readFromDoc(doc);
  //         reports.push(rpt);
  //       }
  //     }
  //     Log.l("getOldReports(): Final array of old reports is:\n", reports);
  //     return reports;
  //   } catch(err) {
  //     Log.l(`DB.getOldReports(): Error retrieving reports.`);
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  // public async getOldReports():Promise<Report[]> {
  //   try {
  //     let db = this.prefs.getDB();
  //     let db1 = this.addDB(db.reports_old01);
  //     Log.l(`DB.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
  //     let res = await db1.allDocs({include_docs:true});
  //     Log.l("getOldReports(): Successfully retrieved old reports, raw list is:\n", res);
  //     let reports:Report[] = [];
  //     for (let row of res.rows) {
  //       if (row.id[0] !== '_' && row.doc) {
  //         let doc = row.doc;
  //         let rpt = new Report();
  //         rpt.readFromDoc(doc);
  //         reports.push(rpt);
  //       }
  //     }
  //     Log.l("getOldReports(): Final array of old reports is:\n", reports);
  //     return reports;
  //   } catch (err) {
  //     Log.l("getOldReports(): Error retrieving reports.");
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  public async saveReportLogistics(report:ReportLogistics):Promise<any> {
    try {
      Log.l(`saveReportLogistics(): Now attempting to save report:\n`, report);
      let reportDoc:any = report.serialize();
      Log.l(`saveReportLogistics(): Now attempting to save serialized report:\n`, reportDoc);
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
        let text:string = `saveReportLogistics(): Upsert error for report '${report._id}'`;
        throw new Error(text);
      } else {
        return res;
      }
    } catch(err) {
      Log.l(`saveReportLogistics(): Error saving report '${report._id}'`);
      Log.e(err);
      throw err;
    }
  }

  public async saveReportTimecard(report:ReportTimeCard):Promise<any> {
    try {
      let reportDoc:any = report.serialize();
      let dbname:string = this.prefs.getDB('timecards');
      let db1 = this.addDB(dbname);
      let res:any = await db1.upsert(report._id, (doc:any) => {
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
        let text:string = `saveReportTimecard(): Upsert error for report '${report._id}'`;
        throw new Error(text);
      } else {
        return res;
      }
    } catch(err) {
      Log.l(`saveReportTimecard(): Error saving report '${report._id}'`);
      Log.e(err);
      throw err;
    }
  }

  public async deleteLogisticsReport(report:ReportLogistics):Promise<any> {
    try {
      let dbname:string = this.prefs.getDB('logistics');
      let db1 = this.addDB(dbname);
      let res:any = await db1.upsert(report._id, (doc:any) => {
        doc._deleted = true;
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        Log.l(`DB.deleteLogisticsReport(): Upsert error trying to delete doc ${report._id}.`);
        Log.e(res);
        let text:string = `DB.deleteLogisticsReport(): Upsert error with document '${report._id}'.`;
        throw new Error(text);
      } else {
        Log.l(`DB.deleteLogisticsReport(): Successfully deleted doc ${report._id}.`);
        return res;
      }
    } catch(err) {
      Log.l(`DB.deleteLogisticsReport(): Error deleting report '${report._id}'`);
      Log.e(err);
      throw err;
    }
  }

  public async deleteTimecardReport(report:ReportTimeCard):Promise<any> {
    try {
      let dbname:string = this.prefs.getDB('timecards');
      let db1 = this.addDB(dbname);
      let res:any = await db1.upsert(report._id, (doc:any) => {
        doc._deleted = true;
        return doc;
      });
      if(!res['ok'] && !res.updated) {
        Log.l(`DB.deleteTimecardReport(): Upsert error trying to delete doc ${report._id}.`);
        Log.e(res);
        let text:string = `DB.deleteTimecardReport(): Upsert error with document '${report._id}'`;
        throw new Error(text);
      } else {
        Log.l(`DB.deleteTimecardReport(): Successfully deleted doc ${report._id}.`);
        return res;
      }
    } catch(err) {
      Log.l(`DB.deleteTimecardReport(): Error deleting report '${report._id}'`);
      Log.e(err);
      throw err;
    }
  }


}
