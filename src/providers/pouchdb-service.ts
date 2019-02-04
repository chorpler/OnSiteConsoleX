// import { PouchDB } from 'pouchdb';
// import * as pdbMemory           from 'pouchdb-adapter-memory'    ;
import { sprintf              } from 'sprintf-js'             ;
import { Injectable           } from '@angular/core'          ;
import { HttpClient           } from '@angular/common/http'   ;
import { Log                  } from 'domain/onsitexdomain'   ;
import { Preferences          } from './preferences'          ;
import { app as electronApp, remote as electronRemote } from 'electron';
import { Headers              } from 'pouchdb-fetch'          ;
import   PouchDB                from 'pouchdb'                ;
import * as path from 'path';
import * as fs from 'graceful-fs';
// import * as workerPouch         from 'worker-pouch'           ;
// import { PDB } from 'pouchdb-authentication' ;
import * as PDBAuth             from 'pouchdb-authentication' ;
// import { plugin as PDBAuthPlugin } from 'pouchdb-authentication';
import * as pdbFind             from 'pouchdb-find'           ;
import * as pdbUpsert           from 'pouchdb-upsert'         ;
// import * as pdbAllDBs           from 'pouchdb-all-dbs'        ;
// import * as websqlPouch         from 'pouchdb-adapter-websql' ;
// import * as nodeSqlPouch        from 'pouchdb-adapter-node-sql';

// import * as nodeWebsqlPouch     from 'pouchdb-adapter-node-websql';
import * as levelPouch          from 'pouchdb-adapter-leveldb' ;
import * as pdbDebug            from 'pouchdb-debug'          ;

// import * as pdbReplicate       from 'pouchdb-replication'     ;
import isElectron from 'is-electron';

// const PouchDB2 = require('pouchdb');

declare const window:any;

// const PDB1 = window && window.PouchDB ? window.PouchDB : PouchDB;
const PDB1 = window && window.PouchDB ? window.PouchDB : PouchDB;
const PDB2 = PouchDB;

// const localAdapter = 'worker';
const localAdapter:string = 'idb';
// let remoteTarArchiveURL:string = "http://sesafleetservices.com/onsitedb/onsiteconsolex.tar.gz";
const addPouchDBPlugin = (pouchdbObject:any, plugin:any, description?:string) => {
  let text:string = description || "unknown";
  Log.l(`addPouchDBPLugin(): Attempting to add plugin '${text}': `, plugin);
  if(pouchdbObject && typeof pouchdbObject.plugin === 'function') {
    if(plugin) {
      if(plugin['default'] !== undefined) {
        pouchdbObject.plugin(plugin.default);
      } else {
        pouchdbObject.plugin(plugin);
      }
    } else {
      Log.w(`addPouchDBPlugin(): This plugin did not exist:\n`, plugin);
      return;
    }
  } else {
    Log.e(`addPouchDBPlugin(): Invalid PouchDB constructor provided: `, pouchdbObject);
  }
};

@Injectable()
export class PouchDBService {
  public app    = electronApp    ;
  public remote = electronRemote ;
  public dbDir:string = "";
  public StaticPouchDB : any;
  public NodePouchDB   : any;
  public testDB        : Database;
  public working       : boolean                  = false              ;
  public initialized   : boolean                  = false              ;
  public pdb           : DBList                   = new Map()          ;
  public rdb           : DBList                   = new Map()          ;
  public PDBSyncs      : DBSyncList               = new Map()          ;
  public InitialSyncs  : DBSyncList               = new Map()          ;
  public hostNumber    : number                   = 0                  ;
  public isElectron    : boolean                  = false              ;

  constructor(
    public prefs : Preferences ,
    public http  : HttpClient  ,
  ) {
    Log.l('Hello PouchDBService Provider');
    // this.prefs = PouchDBService.PREFS;
    window['pouchdbauthenticationdebug'] = false;
    this.isElectron = isElectron();
    if(this.isElectron) {
      this.electronInit();
    }
    this.PouchInit();
  }

  public setupGlobals() {
    window['onsitePouchDB']               = PouchDB;
    window['onsitePouchDBService']        = PouchDBService;
    window['onsitepouchdbservice']        = this;
    // window['onsitepouchdbworker']         = workerPouch;
    window['onsitepouchdbauthentication'] = PDBAuth;
    window['onsitepouchdbupsert']         = pdbUpsert;
    // window['onsitepouchdbwebsql']         = websqlPouch;
    window['onsitepouchdbfind']           = pdbFind;
    // window['PouchDB2']                    = PouchDB2;
    // window['onsitenodewebsql']            = pdbNodeWebSql;
    // window['onsitepouchdblevel']          = pdbLevelDB;
    window.PouchDB  = window.PouchDB || PouchDB;
    window.PouchDB2 = window.PouchDB || PouchDB;
  }

  public PouchInit() {
    if(!this.initialized) {
      this.setupGlobals();
      let pouchdb = PouchDB;
      addPouchDBPlugin(pouchdb, pdbUpsert, 'upsert');
      addPouchDBPlugin(pouchdb, pdbFind, 'find');
      addPouchDBPlugin(pouchdb, PDBAuth, 'auth');
      addPouchDBPlugin(pouchdb, pdbDebug, 'debug');
      addPouchDBPlugin(pouchdb, levelPouch, 'adapter-leveldb');
      // addPouchDBPlugin(pouchdb, nodeWebsqlPouch, 'adapter-nodewebsql');

      // addPouchDBPlugin(pouchdb, nodeSqlPouch, 'adapter-nodesql');
      // addPouchDBPlugin(pouchdb, websqlPouch, 'adapter-websql');
      // addPouchDBPlugin(pouchdb, pdbLevelDB, 'adapter-leveldb');
      if(this.isElectron) {
        // let fs = require('fs');
        // Log.l(`PouchDBService: Creating 'db' directory if necessary ...`);
        // try {
        //   fs.accessSync('db');
        //   Log.l(`PouchDBService: 'db' directory existed already. We coo'.`);
        // } catch(err) {
        //   try {
        //     Log.l(`PouchDBService: Could not access 'db' directory, trying to create it ...`);
        //     fs.mkdirSync('db');
        //   } catch(err2) {
        //     Log.l(`PouchDBService: Error creating 'db' directory!`);
        //     Log.e(err2);
        //   }
        // }
        // let opts = {
        //   adapter: 'leveldb',
        //   prefix: 'db/',
        // };
        // let test1:Database = new PDB1('test01234321', opts);
        // this.testDB = test1;
        addPouchDBPlugin(PDB1, pdbUpsert, 'upsert');
        addPouchDBPlugin(PDB1, pdbFind, 'find');
        addPouchDBPlugin(PDB1, PDBAuth, 'auth');
        addPouchDBPlugin(PDB1, pdbDebug, 'debug');
        addPouchDBPlugin(PDB1, levelPouch, 'adapter-level');
        // addPouchDBPlugin(PDB1, nodeWebsqlPouch, 'adapter-nodewebsql');

        // addPouchDBPlugin(pouchdb, nodeSqlPouch, 'adapter-nodesql');
          // addPouchDBPlugin(PDB1, websqlPouch, 'adapter-websql');
          // (PouchDB as any).adapter('leveldb', pdbLevelDB);
        // addPouchDBPlugin(pouchdb, pdbNodeWebSql, 'adapter-node-websql');
      }
      // addPouchDBPlugin(pouchdb, pdbAllDBs);
      // addPouchDBPlugin(pouchdb, pdbAllDBs);
      // (pouchdb as any).adapter('worker', workerPouch);
      // pouchdb.adapter('websql', websqlPouch);
      // PouchDB.plugin(pdbMemory);
      // let adapter = PouchDBService.PREFS.CONSOLE.SERVER.localAdapter || 'idb';
      // if(adapter !== 'idb') {
        // PouchDB.adapter('worker', workerPouch);
      // }
      // PouchDB.adapter('worker', workerPouch);
      // PouchDB.adapter('mem', );
      // window["pouchdbserv"] = this;
      // window["StaticPouchDB"] = PouchDB;
      this.StaticPouchDB = PouchDB;
      this.NodePouchDB = PDB1;
      this.initialized = true;
      return this.StaticPouchDB;
    } else {
      return this.StaticPouchDB;
    }
  }

  public electronInit() {
    let currentDir:string = path.join(".");
    let dataDir:string = this.remote.app.getPath('userData');
    let dbDir:string = path.join(dataDir, "db");
    let sep:string = path && path.sep ? path.sep : "/";
    this.dbDir = dbDir + sep;
    let db:string = this.dbDir;
    Log.l(`PouchDBService.electronInit(): Creating '${db}' directory if necessary ...`);
    try {
      fs.accessSync(db);
      Log.l(`PouchDBService.electronInit(): '${db}' directory existed already. We coo'.`);
    } catch(err) {
      try {
        Log.l(`PouchDBService.electronInit(): Could not access '${db}' directory, trying to create it ...`);
        fs.mkdirSync(db);
      } catch(err2) {
        Log.l(`PouchDBService: Error creating '${db}' directory!`);
        Log.e(err2);
      }
    }
  }

  public getAuthPouchDB():Promise<any> {
    return new Promise((resolve, reject) => {
      // let pouchdb = PouchDB;
      PouchDB.plugin(pdbUpsert);
      PouchDB.plugin(pdbFind);
      // PouchDB.plugin(PDBAuth);
      // pouchdb.plugin(PouchDBAuth);
      window["pouchdbserv"] = this;
      window["StaticPouchDB"] = PouchDB;
      this.StaticPouchDB = PouchDB;
      resolve(this.StaticPouchDB);
    });
  }

  public getPouchDB() {
    return this.StaticPouchDB;
  }

  public getNodePouchDB() {
    return this.NodePouchDB;
  }

  public getBaseURL():string {
    // let prefs    = PouchDBService.PREFS   ;
    let port     :number = this.prefs.SERVER.port     ;
    let protocol :string = this.prefs.SERVER.protocol ;
    let server   :string = this.prefs.SERVER.server   ;
    if(server.indexOf('pico.sesa.us') !== -1) {
      let hostNumber:number = (this.hostNumber++ % 16) + 1;
      server     = sprintf("db%02d.sesa.us", hostNumber);
    } else if(server.indexOf('ndb.sesa.us') > -1 || server.indexOf('neptune.sesa.us') > -1) {
      let hostNumber:number = (this.hostNumber++ % 16) + 1;
      server     = sprintf("ndb%02d.sesa.us", hostNumber);
    }
    if(port && (protocol === 'https' && port != 443) || (protocol === 'http' && port != 80)) {
      return `${protocol}://${server}:${port}`;
    } else {
      return `${protocol}://${server}`;
    }
  }

  public getRemoteDatabaseURL(dbname?:string):string {
    let url1:string = this.getBaseURL();
    let name:string = dbname || "_session";
    url1 = `${url1}/${name}`;
    return url1;
  }

  public getInsecureLoginBaseURL(user:string, pass:string):string {
    // let prefs    = ServerService.PREFS   ;
    let port:number     = this.prefs.SERVER.port     ;
    let protocol:string = this.prefs.SERVER.protocol ;
    let server:string   = this.prefs.SERVER.server   ;
    if(server.indexOf('pico.sesa.us') !== -1) {
      let hostNumber:number = (this.hostNumber++ % 16) + 1;
      server     = sprintf("db%02d.sesa.us", hostNumber);
    } else if(server.indexOf('ndb.sesa.us') > -1 || server.indexOf('neptune.sesa.us') > -1) {
      let hostNumber:number = (this.hostNumber++ % 16) + 1;
      server     = sprintf("ndb%02d.sesa.us", hostNumber);
    }
    if(port && (protocol === 'https' && port != 443) || (protocol === 'http' && port != 80)) {
      return `${protocol}://${user}:${pass}@${server}:${port}`;
    } else {
      return `${protocol}://${user}:${pass}@${server}`;
    }
  }

  public addDB(dbname:string):Database {
    let dbmap:DBList = this.pdb;
    if(dbmap.has(dbname)) {
      // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
      return dbmap.get(dbname);
    } else {
      // let pdbAdapter:string = this.prefs.getLocalAdapter();
      let PDB_ADAPTER:string = this.prefs && this.prefs.SERVER && this.prefs.SERVER.localAdapter ? this.prefs.SERVER.localAdapter : localAdapter;
      let opts:any = {
        'adapter': PDB_ADAPTER,
      };
      let pouch = this.StaticPouchDB;
      if(this.isElectron) {
        // pouch = PDB1;
        pouch = this.NodePouchDB;
        opts.adapter = 'leveldb';
        // opts.adapter = 'websql';
        opts.prefix = "db/";
        // opts.prefix = "db/";
      }
      if(this.dbDir) {
        opts.prefix = this.dbDir;
      }
      Log.l(`PouchDBService.addDB(): Adding database '${dbname}' with adapter '${opts.adapter}' and options:`, opts);
      let newPDB:Database = new pouch(dbname, opts);
      // let newPDB:PDatabase = new this.StaticPouchDB(dbname, {adapter: 'worker'});
      newPDB['_remote'] = false;
      dbmap.set(dbname, newPDB);
      // Log.l(`addDB(): Added local database ${dbname} to the list.`);
      // return dbmap.get(dbname);
      return newPDB;
    }
  }

  public addRDB(dbname:string, options?:any):Database {
    let rdbmap:DBList = this.rdb;
    let url:string = this.getRemoteDatabaseURL(dbname);
    // Log.l(`addRDB(): Now fetching remote DB ${dbname} at ${url} ...`);
    if(rdbmap.has(dbname)) {
      return rdbmap.get(dbname);
    } else {
      let opts:any;
      if(options) {
        opts = options;
      } else {
        opts = this.prefs.getRemoteOptions();
      }
      let token:string = this.prefs.getAuthString();
      // if(token) {
      //   Log.l(`addRDB(): User logged in, adding fetch authentication headers...`);
      //   // opts.fetch = function(fetchURL:string, fetchOpts:any) {
      //   let fetch = function(fetchURL:string, fetchOpts:any) {
      //     Log.l(`PouchDB.CUSTOMFETCH(): URL is '${fetchURL}'`);
      //     if(fetchOpts && fetchOpts.headers && typeof fetchOpts.headers.set === 'function') {
      //       fetchOpts.headers.set('Authorization', token);
      //       Log.l(`PouchDB.CUSTOMFETCH(): Fetch headers exist, will be:\n`, fetchOpts);
      //       return PouchDB.fetch(fetchURL, fetchOpts);
      //     } else {
      //       let newOpts:any = {
      //         headers: new Headers(),
      //       };
      //       newOpts.headers.set('Authorization', token);
      //       // newOpts.headers.append('Content-Type', 'application/json');
      //       Log.l(`PouchDB.CUSTOMFETCH(): Fetch headers did not exist, will now be:\n`, newOpts);
      //       return PouchDB.fetch(fetchURL, newOpts);
      //     }
      //   };
      //   PouchDB.defaults({
      //     fetch: fetch,
      //   });
      // } else {
      //   Log.l(`addRDB(): User not logged in, not adding fetch authentication headers`);
      // }
      // Log.l(`PouchDBService.addRDB(): Now creating remote DB '${dbname}' at '${url}' ...`);
      Log.l(`PouchDBService.addRDB(): Now creating remote DB '${dbname}' at '${url}' with options:`, opts);
      let rdb1:Database = new PouchDB(url, opts);
      (rdb1 as any)._remote = true;
      rdbmap.set(dbname, rdb1);
      // Log.l(`addRDB(): Added remote database ${url} to the list as ${dbname}.`);
      return rdbmap.get(dbname);
    }
  }

  public async closeDB(dbname:string):Promise<boolean> {
  // public closeDB(dbname:string):boolean {
    try {
      let dbmap:DBList = this.pdb;
      if(dbmap.has(dbname)) {
        // Log.l(`closeDB(): Found '${dbname}' in database list, closing …`);
        let db:Database = dbmap.get(dbname);
        if(this.isSynced(dbname)) {
          Log.l(`closeDB(): Database '${dbname}' found with active sync, canceling it first …`);
          let out:boolean = this.cancelSync(dbname);
          if(out) {
            Log.l(`closeDB(): Database '${dbname}' sync canceled successfully.`);
          } else {
            Log.w(`closeDB(): Database '${dbname}' sync was not properly canceled!`);
          }
        }
        let result:any = await db.destroy();
        // let result:any = db.destroy();
        let success:boolean = dbmap.delete(dbname);
        return success;
      } else {
        Log.l(`closeDB(): Cannot find existing database '${dbname}'`);
        return true;
      }
    } catch(err) {
      Log.l(`closeDB(): Error closing database '${dbname}'`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public async closeRDB(dbname:string):Promise<boolean> {
  // public closeRDB(dbname:string):boolean {
    Log.l(`closeRDB(): Called with arguments:\n`, arguments);
    try {
      let rdbmap:DBList = this.rdb;
      let url:string = this.getRemoteDatabaseURL(dbname);
      // Log.l(`addRDB(): Now fetching remote DB ${dbname} at ${url} ...`);
      if(rdbmap.has(dbname)) {
        let rdb:Database = rdbmap.get(dbname);
        let result:any = await rdb.destroy();
        // let result:any = rdb.destroy();
        let success:boolean = rdbmap.delete(dbname);
        return success;
      } else {
        Log.l(`closeRDB(): Cannot find existing remote database '${dbname}'`);
        return true;
      }
    } catch(err) {
      Log.l(`closeRDB(): Error closing remote database '${dbname}'`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public async possibleMigrateDB(dbname:string):Promise<Database> {
    let convertFrom:string = "websql" ;
    let convertTo:string   = "leveldb";
    try {
      let dbmap:DBList = this.pdb;
      if(dbmap.has(dbname)) {
        // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
        return dbmap.get(dbname);
      } else {
        // let pdbAdapter:string = this.prefs.getLocalAdapter();
        let PDB_ADAPTER:string = this.prefs && this.prefs.SERVER && this.prefs.SERVER.localAdapter ? this.prefs.SERVER.localAdapter : localAdapter;
        let opts:any = {
          'adapter': PDB_ADAPTER,
        };
        let pouch = this.StaticPouchDB;
        if(this.isElectron) {
          // pouch = PDB1;
          pouch = this.NodePouchDB;
          opts.adapter = 'leveldb';
          // opts.adapter = 'websql';
          opts.prefix = "db/";
          // opts.prefix = "db/";
        }
        if(this.dbDir) {
          opts.prefix = this.dbDir;
        }
        Log.l(`PouchDBService.possibleMigrateDB(): Adding database '${dbname}' with adapter '${opts.adapter}' and options:`, opts);
        let localdb:Database = new pouch(dbname, opts);
        localdb['_remote'] = false;
        dbmap.set(dbname, localdb);
        // return new Promise(function(resolve, reject) {
        let info:PDBInfo = await localdb.info();
        let dbAdapter:string = info.adapter;
        if(dbAdapter !== convertFrom) {
          return localdb;
        }
        let newopts:any = opts || {};
        newopts.adapter = convertTo;
        let newdb:Database = new pouch(dbname, newopts);
        let replicate = localdb.replicate.to(newdb);
        let out = await replicate;
        return newdb;
      }
    } catch(err) {
      Log.l(`possibleMigrateDB(): Error migrating or opening database '${dbname}'`);
      Log.e(err);
      throw err;
    }
  }

  public async addRDBAdmin(dbname:string):Promise<Database> {
    // let rdbmap = this.rdb;
    // let url = this.prefs.SERVER.rdbServer.protocol + "://" + this.prefs.SERVER.rdbServer.server + "/" + dbname;
    let url:string = this.getRemoteDatabaseURL(dbname);
    let u  :string = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
    let u1 :string = window.atob(u), p2 = window.atob(p);
    let authToken:string = 'Basic ' + window.btoa(u1 + ':' + p2);
    let ajaxOpts:any = { headers: { Authorization: authToken } };
    let opts:any = { ajax: ajaxOpts };
    let rdb1:Database = this.StaticPouchDB(url, opts);
    return rdb1;
  }

  public getAllDB():DBList {
    let dbmap:DBList = this.pdb;
    return dbmap;
  }

  public getAllRDB():DBList {
    let dbmap:DBList = this.rdb;
    return dbmap;
  }

  public addSync(dbname:string, dbsync:PDBSync):PDBSync {
    let syncmap:DBSyncList = this.PDBSyncs;
    if(syncmap.has(dbname)) {
      let syncevent:PDBSync = syncmap.get(dbname);
      syncevent.cancel();
    }
    syncmap.set(dbname, dbsync);
    return syncmap.get(dbname);
  }

  public getSync(dbname:string):PDBSync {
    let syncmap:DBSyncList = this.PDBSyncs;
    let outVal:PDBSync = null;
    if(syncmap.has(dbname)) {
      outVal = syncmap.get(dbname);
    } else {
      Log.w(`getSync('${dbname}'): Entry not found in sync list!`);
    }
    return outVal;
  }

  public isSynced(dbname:string):boolean {
    let syncmap:DBSyncList = this.PDBSyncs;
    let exists:boolean = false;
    if(syncmap.has(dbname)) {
      exists = true;
    }
    return exists;
  }

  public getAllSyncs():Map<string,PDBSync> {
    let syncmap:DBSyncList = this.PDBSyncs;
    return syncmap;
  }

  public cancelSync(dbname:string):boolean {
    try {
      let syncmap:DBSyncList = this.PDBSyncs;
      if(syncmap.has(dbname)) {
        let dbsync:PDBSync = syncmap.get(dbname);
        Log.l(`cancelSync('${dbname}'): Attempting to cancel sync via dbsync:\n`, dbsync);
        let output:any = dbsync.cancel();
        // Log.l(`cancelSync('${dbname}'): Output of cancel event was:\n`, output);
        return true;
      } else {
        Log.w(`cancelSync('${dbname}'): Entry not found in sync list!`);
        // return "ERROR_NO_SUCH_SYNC";
        return false;
      }
    } catch(err) {
      Log.l(`cancelSync(): Error canceling sync for '${dbname}'`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public cancelAllSyncs():any {
    let syncmap:DBSyncList = this.PDBSyncs;
    let errCount:number = 0;
    for(let entry of syncmap) {
      let dbname:string = entry[0];
      // let dbsync:any    = entry[1];
      Log.l(`cancelAllSyncs(): Now attempting to cancel sync of '${dbname}'...`);
      let out:any = this.cancelSync(dbname);
      if(out === "ERROR_NO_SUCH_SYNC") {
        errCount++;
      }
    }
    if(errCount === 0) {
      Log.l(`cancelAllSyncs(): All syncs evidently canceled. Clearing all sync events...`);
      syncmap.clear();
    } else {
      Log.w(`cancelAllSyncs(): Not all syncs canceled! Not clearing syncs! Error count: ${errCount}. Sync list:\n`, syncmap);
    }
  }

  public clearAllSyncs() {
    let syncmap:DBSyncList = this.PDBSyncs;
    Log.l(`clearAllSyncs(): Clearing out all syncs from map:\n`, syncmap);
    syncmap.clear();
  }

  public addInitialSync(dbname:string, dbsync:PDBSync):PDBSync {
    let syncmap:DBSyncList = this.InitialSyncs;
    if(syncmap.has(dbname)) {
      let syncevent:PDBSync = syncmap.get(dbname);
      syncevent.cancel();
    }
    syncmap.set(dbname, dbsync);
    return syncmap.get(dbname);
  }

  public getInitialSync(dbname:string):PDBSync {
    let syncmap:DBSyncList = this.InitialSyncs;
    let outVal:PDBSync = null;
    if(syncmap.has(dbname)) {
      outVal = syncmap.get(dbname);
    } else {
      Log.w(`getSync('${dbname}'): Entry not found in sync list!`);
    }
    return outVal;
  }

  public getAllInitialSyncs():DBSyncList {
    let syncmap:DBSyncList = this.InitialSyncs;
    return syncmap;
  }

  public cancelInitialSync(dbname:string):any {
    let syncmap:DBSyncList = this.InitialSyncs;
    if(syncmap.has(dbname)) {
      let dbsync:PDBSync = syncmap.get(dbname);
      Log.l(`cancelInitialSync('${dbname}'): Attempting to cancel sync via dbsync:\n`, dbsync);
      let output:any = dbsync.cancel();
      Log.l(`cancelInitialSync('${dbname}'): Output of cancel event was:\n`, output);
      return output;
    } else {
      Log.w(`cancelInitialSync('${dbname}'): Entry not found in sync list!`);
      return "ERROR_NO_SUCH_SYNC";
    }
  }

  public cancelAllInitialSyncs():any {
    let syncmap:DBSyncList = this.InitialSyncs;
    let errCount:number = 0;
    for(let entry of syncmap) {
      let dbname:string = entry[0];
      // let dbsync:any    = entry[1];
      Log.l(`cancelAllInitialSyncs(): Now attempting to cancel sync of '${dbname}'...`);
      let out:any = this.cancelInitialSync(dbname);
      if(out === "ERROR_NO_SUCH_SYNC") {
        errCount++;
      }
    }
    if(errCount === 0) {
      Log.l(`cancelAllInitialSyncs(): All syncs evidently canceled. Clearing all sync events...`);
      syncmap.clear();
    } else {
      Log.w(`cancelAllInitialSyncs(): Not all syncs canceled! Not clearing syncs! Error count: ${errCount}. Sync list:\n`, syncmap);
    }
  }

  public clearAllInitialSyncs():any {
    let syncmap:DBSyncList = this.InitialSyncs;
    Log.l(`clearAllInitialSyncs(): Clearing out all syncs from map:\n`, syncmap);
    syncmap.clear();
  }
}


export type Database           = PouchDB.Database           ;
export type StaticPouch        = Database                   ;
export type PDatabase          = Database                   ;
export type PDBResponse        = PouchDB.Core.Response      ;
export type PDBError           = PouchDB.Core.Error         ;
export type BulkResponse       = Array<PDBResponse|PDBError>;
export type PDBInfoOriginal    = PouchDB.Core.DatabaseInfo  ;
// adapter: "https"
// auto_compaction: false
// compact_running: false
// data_size: 116369463
// db_name: "reports_ver101100"
// disk_format_version: 6
// disk_size: 277360852
// doc_count: 108491
// doc_del_count: 21362
// host: "https://db04.sesa.us/reports_ver101100/"
// instance_start_time: "0"
// other: {data_size: 155588651}
// purge_seq: 0
// sizes: {file: 277360852, external: 155588651, active: 116369463}
// update_seq: "158400-g2wAAAABaANkAA9jZGIyMTBAc2VjdXJlZGJsAAAAAmEAbgQA_____2piAAJqwGo"
export interface PDBInfo extends PDBInfoOriginal {
  db_name          : string        ;
  adapter         ?: string        ;
  auto_compaction ?: boolean       ;
  doc_count        : number        ;
  update_seq       : number|string ;
  
  // LevelDB
  backend_adapter ?: string  ;
  
  // HTTP/HTTPS
  compact_running     ?: boolean       ;
  data_size           ?: number        ;
  disk_size           ?: number        ;
  doc_del_count       ?: number        ;
  host                ?: string        ;
  instance_start_time ?: number        ;
  other               ?: {data_size ?: number };
  purge_seq           ?: number        ;
  sizes               ?: {
    file     ?: number ,
    external ?: number ,
    active   ?: number ,
  };
};
export type PouchDatabase      = PouchDB.Database           ;
export type PDBCoreOptions     = PouchDB.Core.Options       ;
export type PDBLoginOptions    = PouchDB.Core.Options       ;
export type CorePDBOptions     =  PouchDB.Configuration.CommonDatabaseConfiguration ;
export type LocalPDBOptions    =  PouchDB.Configuration.LocalDatabaseConfiguration  ;
export type RemotePDBOptions   =  PouchDB.Configuration.RemoteDatabaseConfiguration ;
export type PDBOptions         = LocalPDBOptions|RemotePDBOptions;

export interface PouchDocRequired extends Object {
  _id:string;
  _rev?:string;
  [propName:string]:any;
}
export type PDBContent = PouchDocRequired;
// export type PDBContent = PouchDB.Core.Document<any>;
// export type PDBContent = PouchDB.Core.Document<PouchDocRequired>;
export type PouchDoc           = PDBContent;

export type AllDocsNoKeysOptions        = PouchDB.Core.AllDocsOptions;
export type AllDocsWithKeyOptions       = PouchDB.Core.AllDocsWithKeyOptions;
export type AllDocsWithKeysOptions      = PouchDB.Core.AllDocsWithKeysOptions;
export type AllDocsWithinRangeOptions   = PouchDB.Core.AllDocsWithinRangeOptions;
export type AllDocsOptions              = AllDocsNoKeysOptions|AllDocsWithKeyOptions|AllDocsWithKeysOptions|AllDocsWithinRangeOptions;
export type AllDocsResponse             = PouchDB.Core.AllDocsResponse<PouchDoc>;
export type AllDocsRows                 = AllDocsResponse["rows"];
export type AllDocsRow                  = AllDocsRows[0];

export type ReplicateOptions       = PouchDB.Replication.ReplicateOptions;
export type ReplicationResult<T>   = PouchDB.Replication.ReplicationResult<T>  ;
export type PDBReplicationResult   = ReplicationResult<PouchDoc>;
// export type OriginalReplicationResult<T> = PouchDB.Replication.ReplicationResult<T>;
// export interface OnSiteReplicationResult<T> extends OriginalReplicationResult<T> {
//   pending?:number;
// }
// export type PDBReplicationResult   = OnSiteReplicationResult<PouchDoc>;
export interface PDBChangeEvent extends PDBReplicationResult {
  pending?:number;
}
export type ReplicationComplete    = PouchDB.Replication.ReplicationResultComplete<PouchDoc>;
export type PDBCompleteEvent       = ReplicationComplete;
export type ReplicationCancel      = PouchDB.Replication.Replication<PouchDoc>;
export type SyncOptions            = PouchDB.Replication.SyncOptions           ;
// export type Sync<T>                = PouchDB.Replication.Sync<T>               ;
// export type SyncResult<T>          = PouchDB.Replication.SyncResult<T>         ;
// export type SyncResultComplete<T>  = PouchDB.Replication.SyncResultComplete<T> ;
export type PDBSync                = PouchDB.Replication.Sync<PouchDoc>      ;
export type SyncResult             = PouchDB.Replication.SyncResult<PouchDoc>      ;
export interface PDBSyncResult extends SyncResult {
  change:PDBChangeEvent;
}
export type PDBSyncResultComplete  = PouchDB.Replication.SyncResultComplete<PouchDoc>      ;

export type UpsertResponse = PouchDB.UpsertResponse;
// export interface UpsertResponse extends OriginalUpsertResponse {
//   ok?:boolean;
// }
export type UpsertDiffCallback     = PouchDB.UpsertDiffCallback<PouchDoc>;
export type UpsertDiffDoc          = Partial<PouchDB.Core.Document<PouchDoc>>;

export type ConditionOperators     = PouchDB.Find.ConditionOperators;
export type CombinationOperators   = PouchDB.Find.CombinationOperators;
export type Selector               = PouchDB.Find.Selector;
export type FindRequest            = PouchDB.Find.FindRequest<PouchDoc>;
export type FindResponse           = PouchDB.Find.FindResponse<PouchDoc>;
export type PDBIndex               = PouchDB.Find.Index;
export type PouchIndex             = PDBIndex;
export type CreateIndexOptions     = PouchDB.Find.CreateIndexOptions;
export type CreateIndexResponse    = PouchDB.Find.CreateIndexResponse<PouchDoc>;
export type GetIndexesResponse     = PouchDB.Find.GetIndexesResponse<PouchDoc>;
export type DeleteIndexOptions     = PouchDB.Find.DeleteIndexOptions;
export type DeleteIndexResponse     = PouchDB.Find.DeleteIndexResponse<PouchDoc>;

export type PDBQuery               = PouchDB.Find.Selector;
export type PDBChange              = PouchDB.Core.ChangesResponseChange<PouchDoc>;

export type PDBGetUserResponse     = PouchDB.Authentication.User            ;
export type PDBUser                = PouchDB.Core.ExistingDocument<PDBGetUserResponse>;
// export type PDBUser                = PouchDB.Core.Document<PouchDB.Authentication.User>;
export type PDBLoginResponse       = PouchDB.Authentication.LoginResponse   ;
export type PDBSessionResponse     = PouchDB.Authentication.SessionResponse ;
export type PDBPutUserOptions      = PouchDB.Authentication.PutUserOptions  ;
export type PDBSession             = PouchDB.Authentication.SessionResponse ;

export type AuthHeader             = PouchDB.Authentication.AuthHeader      ;

export type DBList     = Map<string,Database>;
export type DBSyncList = Map<string,PDBSync>;
