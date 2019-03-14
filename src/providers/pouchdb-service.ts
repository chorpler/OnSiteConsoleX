// import { PouchDB } from 'pouchdb';
// import * as pdbMemory           from 'pouchdb-adapter-memory'    ;
// import { Headers              } from 'pouchdb-fetch'            ;
// import * as pdbWorker         from 'worker-pouch'           ;
// import { PDB } from 'pouchdb-authentication' ;
// import { plugin as PDBAuthPlugin } from 'pouchdb-authentication';
// import * as pdbAllDBs           from 'pouchdb-all-dbs'        ;
// import * as websqlPouch         from 'pouchdb-adapter-websql' ;
// import * as nodeSqlPouch        from 'pouchdb-adapter-node-sql';
// import * as pdbReplicate       from 'pouchdb-replication'     ;
// import { UUID                 } from 'domain/onsitexdomain'     ;
// import { ElectronService      } from './electron-service'       ;
import { sprintf              } from 'sprintf-js'               ;
import { Injectable           } from '@angular/core'            ;
import { HttpClient           } from '@angular/common/http'     ;
import { Log                  } from 'domain/config/config.log' ;
import { Preferences          } from './preferences'            ;
import { app as eApp          } from 'electron'                 ;
import { remote as eRemote    } from 'electron'                 ;
// import { isElectron           } from 'is-electron'              ;
import   PouchDB                from 'pouchdb-core'             ;
import * as path                from 'path'                     ;
import * as rimraf              from 'rimraf'                   ;
import * as mkdirp              from 'mkdirp'                   ;
import * as fs                  from 'graceful-fs'              ;
import * as pdbDebug            from 'pouchdb-debug'            ;
import * as pdbMapReduce        from 'pouchdb-mapreduce'        ;
import * as pdbReplication      from 'pouchdb-replication'      ;
import * as httpPouch           from 'pouchdb-adapter-http'     ;
// import * as levelPouch          from 'pouchdb-adapter-leveldb'  ;
import * as levelPouch          from '@onsite/pouchdb-adapter-leveldb'  ;
// import * as nodeWebsqlPouch     from 'pouchdb-adapter-node-websql';
// import * as PDBAuth             from 'pouchdb-authentication'   ;
import * as PDBAuth             from '@onsite/pouchdb-auth-utils';
import * as pdbFind             from 'pouchdb-find'             ;
// import * as pdbUpsert           from 'pouchdb-upsert'           ;
import * as pdbUpsert           from '@onsite/pouchdb-upsert-plugin' ;
import * as UUID                from 'uuid'                     ;
// import * as crypto              from 'crypto-browserify'        ;

export function isElectron():boolean {
  // Renderer process
  if(typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  // Main process
  if(typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if(typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}

declare const window:any;
const fsp = fs.promises;
// const hash = crypto.createHash('md5');
// const PDB1 = window && window.PouchDB ? window.PouchDB : PouchDB;
const localAdapter:string = 'leveldb';
const PDB1 = window && window.PouchDB ? window.PouchDB : PouchDB;
const PDB2 = PouchDB;
// export type PouchDBMaker = typeof PouchDB;
export type PouchDBMaker = any;

enum FileOrDirectoryType {
  NONE      = 0,
  FILE      = 1,
  DIRECTORY = 2,
  OTHER     = 3,
}

const addPouchDBPlugin = (pouchdbObject:any, plugin:any, description?:string) => {
  let text:string = typeof description === 'string' ? description : "unknown";
  let key:string = text === 'unknown' ? UUID.v4() : text;
  // Log.l(`addPouchDBPLugin(): Attempting to add plugin '${text}':`, plugin);
  Log.l(`addPouchDBPLugin(): Attempting to add plugin '${text}' …`);
  if(pouchdbObject && typeof pouchdbObject.plugin === 'function') {
    if(plugin) {
      // PouchDBService.plugins[text] = plugin;
      PouchDBService.plugins[key] = plugin;
      if(plugin['default'] != undefined) {
        pouchdbObject.plugin(plugin.default);
      } else {
        pouchdbObject.plugin(plugin);
      }
      return pouchdbObject;
    } else {
      Log.w(`addPouchDBPlugin(): plugin '${text}' did not exist:`, plugin);
      return pouchdbObject;
    }
  } else {
    Log.e(`addPouchDBPlugin(): Invalid PouchDB constructor provided: `, pouchdbObject);
    return null;
  }
};

@Injectable()
export class PouchDBService {
  public app    = eApp    ;
  public remote = eRemote ;
  public dbDir:string   = "";
  public adapter:string = localAdapter;
  public prefix:string  = "";
  public static plugins:any = {};
  public get plugins():any { return PouchDBService.plugins; };
  public set plugins(val:any) { PouchDBService.plugins = val; };
  public StaticPouchDB : any;
  public NodePouchDB   : any;
  public PouchList     : PouchDBMaker[] = [];
  public Pouches       : {[key:string]:PouchDBMaker} = {};
  public testDB        : Database;
  public working       : boolean                  = false              ;
  public initialized   : boolean                  = false              ;
  public pdb           : DBList                   = new Map()          ;
  public rdb           : DBList                   = new Map()          ;
  public PDBSyncs      : DBSyncList               = new Map()          ;
  public InitialSyncs  : DBSyncList               = new Map()          ;
  public hostNumber    : number                   = 0                  ;
  public isElectron    : boolean                  = false              ;
  public fsutils = {
    rimraf : rimraf ,
    mkdirp : mkdirp ,
    fs     : fs     ,
  };

  constructor(
    public prefs    : Preferences     ,
    public http     : HttpClient      ,
    // public electron : ElectronService ,
  ) {
    Log.l('Hello PouchDBService Provider');
    // this.prefs = PouchDBService.PREFS;
    this.isElectron = isElectron();
    if(this.isElectron) {
      this.electronInit();
    }
    this.PouchInit();
  }

  public setupGlobals() {
    window['pouchdbauthenticationplugindebug'] = false;
    window['onsitePouchDB']               = PouchDB;
    window['onsitePouchDBService']        = PouchDBService;
    window['onsitepouchdbserviceclass']   = PouchDBService;
    window['onsitepouchdbservice']        = this;
    // window['onsitepouchdbworker']         = workerPouch;
    window['onsitepouchdbauthentication'] = PDBAuth;
    window['onsitepouchdbupsert']         = pdbUpsert;
    // window['onsitepouchdbwebsql']         = websqlPouch;
    window['onsitepouchdbfind']           = pdbFind;
    // window['PouchDB2']                    = PouchDB2;
    // window['onsitenodewebsql']            = nodeWebsqlPouch;
    // window['onsitepouchdblevel']          = pdbLevelDB;
    window['onsitepouchdbplugins'] = this.plugins;
    // window['onsitecrypto'] = crypto;
    window.PouchDB  = window.PouchDB || PouchDB;
    window.PouchDB2 = window.PouchDB || PouchDB;
  }

  public PouchInit() {
    if(!this.initialized) {
      this.setupGlobals();
      let pouchdb = PouchDB;
      addPouchDBPlugin(pouchdb, pdbDebug, 'debug');
      addPouchDBPlugin(pouchdb, pdbMapReduce, 'mapreduce');
      addPouchDBPlugin(pouchdb, pdbReplication, 'replication');
      addPouchDBPlugin(pouchdb, pdbFind, 'find');
      addPouchDBPlugin(pouchdb, pdbUpsert, 'upsert');
      addPouchDBPlugin(pouchdb, PDBAuth, 'auth');
      addPouchDBPlugin(pouchdb, levelPouch, 'adapter-leveldb');
      addPouchDBPlugin(pouchdb, httpPouch, 'adapter-http');
      // let SQLPouch = PouchDB.defaults({adapter:'websql'});
      // addPouchDBPlugin(SQLPouch, nodeWebsqlPouch, 'adapter-nodewebsql');
      // window.PouchDBSQL = SQLPouch;

      // addPouchDBPlugin(pouchdb, nodeSqlPouch, 'adapter-nodesql');
      // addPouchDBPlugin(pouchdb, websqlPouch, 'adapter-websql');
      // addPouchDBPlugin(pouchdb, pdbLevelDB, 'adapter-leveldb');
      // if(this.isElectron) {
      //   // let fs = require('fs');
      //   // Log.l(`PouchDBService: Creating 'db' directory if necessary ...`);
      //   // try {
      //   //   fs.accessSync('db');
      //   //   Log.l(`PouchDBService: 'db' directory existed already. We coo'.`);
      //   // } catch(err) {
      //   //   try {
      //   //     Log.l(`PouchDBService: Could not access 'db' directory, trying to create it ...`);
      //   //     fs.mkdirSync('db');
      //   //   } catch(err2) {
      //   //     Log.l(`PouchDBService: Error creating 'db' directory!`);
      //   //     Log.e(err2);
      //   //   }
      //   // }
      //   // let opts = {
      //   //   adapter: 'leveldb',
      //   //   prefix: 'db/',
      //   // };
      //   // let test1:Database = new PDB1('test01234321', opts);
      //   // this.testDB = test1;
      //   addPouchDBPlugin(PDB1, pdbUpsert, 'upsert');
      //   addPouchDBPlugin(PDB1, pdbFind, 'find');
      //   addPouchDBPlugin(PDB1, PDBAuth, 'auth');
      //   addPouchDBPlugin(PDB1, pdbDebug, 'debug');
      //   addPouchDBPlugin(PDB1, levelPouch, 'adapter-level');
      //   // addPouchDBPlugin(PDB1, nodeWebsqlPouch, 'adapter-nodewebsql');

      //   // addPouchDBPlugin(pouchdb, nodeSqlPouch, 'adapter-nodesql');
      //     // addPouchDBPlugin(PDB1, websqlPouch, 'adapter-websql');
      //     // (PouchDB as any).adapter('leveldb', pdbLevelDB);
      //   // addPouchDBPlugin(pouchdb, pdbNodeWebSql, 'adapter-node-websql');
      // }
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
      this.PouchList.push(PouchDB);
      this.Pouches.PouchDB = PouchDB;
      this.initialized = true;
      return this.StaticPouchDB;
    } else {
      return this.StaticPouchDB;
    }
  }

  public electronInit() {
    Log.l(`PouchDBService.electronInit(): Firing up …`);
    let dbPrefix:string = this.getPouchDBPrefix();
    Log.l(`PouchDBService.electronInit(): using DB prefix ${dbPrefix} …`);
    let db:string = dbPrefix;
    this.dbDir    = db;
    this.prefix   = db;
    try {
      this.makeDirectorySync(db);
    } catch (err) {
      Log.l(`PouchDBService.electronInit(): Error creating '${db}'`);
      Log.e(err);
    }
  }

  public inElectron():boolean {
    return isElectron();
  }

  public async loadPouchPlugin(plugin:string, description?:string):Promise<any> {
    try {
      if(typeof plugin !== 'string') {
        let text:string = "first parameter must be a string";
        let err:Error = new Error(text);
        throw err;
      }
      let name:string = typeof description === 'string' ? description : plugin;
      Log.l(`PouchDBService.loadPouchPlugin(): Attempting to dynamically import '${plugin}' …`);
      let pluginModule = await import(plugin);
      if(pluginModule) {
        addPouchDBPlugin(PouchDB, pluginModule, name);
        Log.l(`PouchDBService.loadPouchPlugin(): Success!`);
        return true;
      } else {
        Log.l(`PouchDBService.loadPouchPlugin(): FAILED to dynamically import '${plugin}'`);
        return false;
      }
    } catch(err) {
      Log.l(`PouchDBService.loadPouchPlugin(): Error loading plugin:`, plugin);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public async loadWebSql():Promise<any> {
    try {
      Log.l(`PouchDBService.loadWebSql(): Attempting to dynamically import 'pouchdb-adapter-node-websql' ...`);
      let nodeWebsqlPouch = await import('pouchdb-adapter-node-websql');
      if(nodeWebsqlPouch) {
        addPouchDBPlugin(PouchDB, nodeWebsqlPouch, 'adapter-nodewebsql');
        PouchDB.defaults({adapter:"leveldb"});
        let PouchDBSQL = PouchDB.defaults({adapter:"websql"});
        window['PouchDBSQL'] = PouchDBSQL;
        this.PouchList.push(PouchDBSQL);
        this.Pouches.PouchDBSQL = PouchDBSQL;
        Log.l(`PouchDBService.loadWebSql(): Success!`);
        return true;
      } else {
        Log.l(`PouchDBService.loadWebSql(): FAILED to dynamically import 'pouchdb-adapter-node-websql'`);
        return false;
      }
    } catch(err) {
      Log.l(`PouchDBService.loadWebSql(): Error loading pouchdb-adapter-node-websql`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public async loadIDB():Promise<any> {
    try {
      Log.l(`PouchDBService.loadIDB(): Attempting to dynamically import 'pouchdb-adapter-idb' ...`);
      let pdbIDB = await import('pouchdb-adapter-idb');
      if(pdbIDB) {
        addPouchDBPlugin(PouchDB, pdbIDB, 'adapter-idb');
        // if(!(PouchDB && (PouchDB as any).__defaults && (PouchDB as any).__defaults.adapters)) {
          //   PouchDB.defaults({adapter:"idb"});
          // }
        let PouchDBIDB = PouchDB.defaults({adapter:"idb"});
        window['PouchDBIDB'] = PouchDBIDB;
        this.PouchList.push(PouchDBIDB);
        this.Pouches.PouchDBIDB = PouchDBIDB;
        Log.l(`PouchDBService.loadIDB(): Success!`);
        return true;
      } else {
        Log.l(`PouchDBService.loadIDB(): FAILED to dynamically import 'pouchdb-adapter-idb'`);
        return false;
      }
    } catch(err) {
      Log.l(`PouchDBService.loadIDB(): Error loading pouchdb-adapter-idb`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public async loadWorker():Promise<any> {
    try {
      Log.l(`PouchDBService.loadWorker(): Attempting to dynamically import 'worker-pouch' ...`);
      let pdbWorker = await this.loadPouchPlugin('worker-pouch');
      if(pdbWorker) {
        addPouchDBPlugin(PouchDB, pdbWorker, 'adapter-worker');
        // if(!(PouchDB && (PouchDB as any).__defaults && (PouchDB as any).__defaults.adapters)) {
          //   PouchDB.defaults({adapter:"idb"});
          // }
        let PouchDBWorker = PouchDB.defaults({adapter:"worker"});
        window['PouchDBWorker'] = PouchDBWorker;
        this.PouchList.push(PouchDBWorker);
        this.Pouches.PouchDBWorker = PouchDBWorker;
        Log.l(`PouchDBService.loadWorker(): Success!`);
        return true;
      } else {
        Log.l(`PouchDBService.loadWorker(): FAILED to dynamically import 'worker-pouch'`);
        return false;
      }
    } catch(err) {
      Log.l(`PouchDBService.loadWorker(): Error loading worker-pouch`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  public async loadMemory():Promise<any> {
    try {
      Log.l(`PouchDBService.loadMemory(): Attempting to dynamically import 'pouchdb-adapter-memory' ...`);
      let pdbMemory = await this.loadPouchPlugin('pouchdb-adapter-memory', 'adapter-memory');
      if(pdbMemory) {
        addPouchDBPlugin(PouchDB, pdbMemory, 'adapter-memory');
        // if(!(PouchDB && (PouchDB as any).__defaults && (PouchDB as any).__defaults.adapters)) {
          //   PouchDB.defaults({adapter:"idb"});
          // }
        let PouchDBMemory = PouchDB.defaults({adapter:"memory"});
        window['PouchDBMemory'] = PouchDBMemory;
        this.PouchList.push(PouchDBMemory);
        this.Pouches.PouchDBMemory = PouchDBMemory;
        Log.l(`PouchDBService.loadMemory(): Success!`);
        return true;
      } else {
        Log.l(`PouchDBService.loadMemory(): FAILED to dynamically import 'pouchdb-adapter-memory'`);
        return false;
      }
    } catch(err) {
      Log.l(`PouchDBService.loadMemory(): Error loading pouchdb-adapter-memory`);
      Log.e(err);
      // throw err;
      return false;
    }
  }

  // public async loadIndexedDB():Promise<any> {
  //   try {
  //     Log.l(`PouchDBService.loadIndexedDB(): Attempting to dynamically import 'pouchdb-adapter-indexeddb' ...`);
  //     let pdbIndexedDB = await import('pouchdb-adapter-indexeddb');
  //     if(pdbIndexedDB) {
  //       addPouchDBPlugin(PouchDB, pdbIndexedDB, 'adapter-indexeddb');
  //       // if(!(PouchDB && (PouchDB as any).__defaults && (PouchDB as any).__defaults.adapters)) {
  //       //   PouchDB.defaults({adapter:"idb"});
  //       // }
  //       let PouchDBIndexedDB = PouchDB.defaults({adapter:"indexeddb"});
  //       window['PouchDBIndexedDB'] = PouchDBIndexedDB;
  //       this.Pouches.push(PouchDBIndexedDB);
  //     }
  //     Log.l(`PouchDBService.loadIndexedDB(): Success!`);
  //     return true;
  //   } catch(err) {
  //     Log.l(`PouchDBService.loadIndexedDB(): Error loading pouchdb-adapter-indexeddb`);
  //     Log.e(err);
  //     // throw err;
  //     return false;
  //   }
  // }

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
    let port:number     = this.prefs.getRemotePort() ;
    let protocol:string = this.prefs.getProtocol()   ;
    let server:string   = this.prefs.getServerHost() ;
    // let port     :number = this.prefs.SERVER.port     ;
    // let protocol :string = this.prefs.SERVER.protocol ;
    // let server   :string = this.prefs.SERVER.server   ;
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
    let port:number     = this.prefs.getRemotePort() ;
    let protocol:string = this.prefs.getProtocol()   ;
    let server:string   = this.prefs.getServerHost() ;
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

  public getDB(dbname:string):Database {
    let dbmap:DBList = this.pdb;
    if(dbmap.has(dbname)) {
      // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
      return dbmap.get(dbname);
    } else {
      return null;
    }
  }

  public getRDB(dbname:string):Database {
    let dbmap:DBList = this.rdb;
    if(dbmap.has(dbname)) {
      // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
      return dbmap.get(dbname);
    } else {
      return null;
    }
  }

  public addDB(dbname:string):Database {
    let dbmap:DBList = this.pdb;
    if(dbmap.has(dbname)) {
      // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
      return dbmap.get(dbname);
    } else {
      // let pdbAdapter:string = this.prefs.getLocalAdapter();
      // let PDB_ADAPTER:string = this.prefs && this.prefs.SERVER && this.prefs.SERVER.localAdapter ? this.prefs.SERVER.localAdapter : localAdapter;
      let PDB_ADAPTER:string = this.adapter;
      let opts:any = {
        'adapter': PDB_ADAPTER,
      };
      let pouch = this.StaticPouchDB;
      if(this.isElectron) {
        // pouch = PDB1;
        pouch = this.NodePouchDB;
        opts.adapter = PDB_ADAPTER;
        // opts.adapter = 'leveldb';
        // opts.adapter = 'websql';
        opts.prefix = this.prefix;
        // opts.prefix = "db/";
      }
      // if(this.prefix) {
      //   opts.prefix = this.prefix;
      // }
      // let fullDBName:string = opts.prefix + dbname;
      // let type:FileOrDirectoryType = this.isFileOrDirectorySync(fullDBName);
      // if(PDB_ADAPTER === 'leveldb') {
      //   if(!this.isDirectorySync(fullDBName)) {
      //     this.removeFileOrDirectorySync(fullDBName);
      //   }
      // } else if(PDB_ADAPTER === 'websql') {
      //   if(this.isDirectorySync(fullDBName)) {
      //     this.removeFileOrDirectorySync(fullDBName);
      //   }
      // }
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
        let result:any = await db.close();
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
    Log.l(`closeRDB(): called for database '${dbname}'`);
    try {
      let rdbmap:DBList = this.rdb;
      let url:string = this.getRemoteDatabaseURL(dbname);
      // Log.l(`addRDB(): Now fetching remote DB ${dbname} at ${url} ...`);
      if(rdbmap.has(dbname)) {
        let rdb:Database = rdbmap.get(dbname);
        if(this.isSynced(dbname)) {
          this.cancelSync(dbname);
        }
        let result:any = await rdb.close();
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

  public async closeAllDB():Promise<boolean> {
    try {
      let dbmap:DBList = this.pdb;
      let keys:string[] = Array.from(dbmap.keys());
      let problem:boolean = false;
      for(let key of keys) {
        Log.l(`PouchDBService.closeAllDB(): Attempting to close '${key}' …`);
        try {
          let out = await this.closeDB(key);
        } catch (error) {
          Log.l(`PouchDBService.closeAllDB(): Error closing database:`, key);
          Log.l(error);
          problem = true;
        }
      }
      Log.l(`closeAllDB(): RDB list is now:`, dbmap);
      Log.l(`closeAllDB(): Sync list is now:`, this.PDBSyncs);
      return problem;
    } catch(err) {
      Log.l(`closeAllDB(): Error closing all PouchDB databases`);
      Log.e(err);
      throw err;
    }
  }

  public async closeAllRDB():Promise<boolean> {
    try {
      let dbmap:DBList = this.rdb;
      let keys:string[] = Array.from(dbmap.keys());
      let problem:boolean = false;
      for(let key of keys) {
        Log.l(`PouchDBService.closeAllRDB(): Attempting to close '${key}' …`);
        try {
          let out = await this.closeRDB(key);
        } catch (error) {
          Log.l(`PouchDBService.closeAllRDB(): Error closing remote database:`, key);
          Log.l(error);
          problem = true;
        }
      }
      Log.l(`closeAllRDB(): RDB list is now:`, dbmap);
      Log.l(`closeAllRDB(): Sync list is now:`, this.PDBSyncs);
      return problem;
    } catch(err) {
      Log.l(`closeAllRDB(): Error closing all remote PouchDB databases`);
      Log.e(err);
      throw err;
    }
  }

  public async clearDatabaseDirectory():Promise<boolean> {
    try {
      let pouchdir:string = this.getPouchDBPrefix();
      try {
        let res:boolean = await this.closeAllRDB();
        res = await this.closeAllDB();
        if(!res) {
          return false;
        }
        let result:boolean = this.removeDirectoryContentsSync(pouchdir);
        return result;
      } catch (error) {
        Log.l(`PouchDBService.clearDatabaseDirectory(): Error cleaning directory '${pouchdir}'`);
        Log.l(error);
        return false;
      }
    } catch(err) {
      Log.l(`PouchDBService.clearDatabaseDirectory(): Error cleaning out DB directory`);
      Log.e(err);
      throw err;
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
        syncmap.delete(dbname);
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

  public getDataDir():string {
    return this.remote.app.getPath('userData');
  }

  public getDataDirAsPrefix():string {
    let datadir:string = this.getDataDir();
    let sep:string = path && path.sep ? path.sep : "/";
    return datadir + sep;
  }

  public getDBDir(...args:string[]):string {
    // let dbdir:string = this.dbDir;
    // let dbdirname:string = typeof directoryName === 'string' ? directoryName : "db";
    let defaultDBDirName:string = "db";
    let dbdirnames:string[] =  Array.isArray(args) && args.length > 0 ? args.filter(a => typeof a === 'string') : [defaultDBDirName];
    let dbdir:string = this.getFullDataPathForFile(...dbdirnames);
    return dbdir;
  }
  
  public getDBDirAsPrefix(...args:string[]):string {
    let dbdir:string = this.getDBDir(...args);
    let sep:string = path && path.sep ? path.sep : "/";
    let out:string = dbdir + sep;
    return out;
  }

  public getFullDataPathForFile(...args:string[]):string {
    let datadir:string = this.getDataDir();
    let files:string[] = Array.isArray(args) && args.length > 0 ? args.filter(a => typeof a === 'string') : [];
    let fullfile:string = path.normalize(path.join(datadir, ...files));
    return fullfile;
  }

  public getPouchDBPrefix():string {
    let adapter:string = this.adapter || "leveldb";
    let prefix:string;
    if(adapter === 'leveldb') {
      prefix = this.getDBDirAsPrefix("db", "leveldb");
    } else if(adapter === 'websql') {
      prefix = this.getDBDirAsPrefix("db");
    } else {
      prefix = "";
    }
    return prefix;
  }

  // public getFullDBPathForFile(...args:string[]):string {
  //   let dbdir:string = this.getDBDir();
  //   let fullfile:string = path.normalize(path.join(dbdir, filename));
  //   return fullfile;
  // }

  public async isDirectory(directoryName:string):Promise<boolean> {
    try {
      // Log.l(`isDirectory(): Called with arguments:\n`, arguments);
      let possibleDir:string = path.normalize(directoryName);
      try {
        let stat = await fsp.lstat(possibleDir);
        let isDirectory:boolean = stat.isDirectory();
        return isDirectory;
      } catch (error) {
        Log.l(`isDirectory(): Error checking '${directoryName}', returning false.`);
        return false;
      }
    } catch(err) {
      Log.l(`isDirectory(): Error checking for directory '${directoryName}'`);
      Log.e(err);
      return false;
      // throw err;
    }
  }
  
  public async fileOrDirectoryExists(fullpath:string):Promise<boolean> {
    try {
      // Log.l(`isDirectory(): Called with arguments:\n`, arguments);
      try {
        // let stat;
        let possibleFile:string = path.normalize(fullpath);
        let stat = await fsp.lstat(possibleFile);
        let exists:boolean = stat.isFile() || stat.isDirectory();
        return exists;
      } catch (error) {
        Log.l(`fileOrDirectoryExists(): Error checking '${fullpath}', returning false.`);
        return false;
      }
    } catch(err) {
      Log.l(`fileOrDirectoryExists(): Error checking for directory '${fullpath}'`);
      Log.e(err);
      return false;
      // throw err;
    }
  }
  
  public async makeDirectory(fullpath:string):Promise<boolean> {
    try {
      // Log.l(`isDirectory(): Called with arguments:\n`, arguments);
      let possibleDir:string = fullpath;
      try {
        possibleDir = path.normalize(fullpath);
        let stat = await fsp.lstat(possibleDir);
        let isDirectory:boolean = stat.isDirectory();
        return isDirectory;
      } catch (error) {
        Log.l(`makeDirectory(): '${fullpath}' does not exist. Creating …`);
        try {
          let res = await fsp.mkdir(possibleDir);
          return true;
        } catch (error2) {
          // Log.l(`makeDirectory(): Error trying to create '${fullpath}'`);
          // Log.e(error2);
          throw error2;
        }
      }
    } catch(err) {
      Log.l(`makeDirectory(): Error forcing creation of directory '${fullpath}'`);
      Log.e(err);
      throw err;
    }
  }

  public isDirectorySync(directoryName:string):boolean {
    try {
      // Log.l(`isDirectory(): Called with arguments:\n`, arguments);
      let possibleDir:string = path.normalize(directoryName);
      try {
        let stat = fs.lstatSync(possibleDir);
        let isDirectory:boolean = stat.isDirectory();
        return isDirectory;
      } catch (error) {
        Log.l(`isDirectorySync(): Error checking '${directoryName}', returning false.`);
        return false;
      }
    } catch(err) {
      Log.l(`isDirectorySync(): Error checking for directory '${directoryName}'`);
      Log.e(err);
      return false;
      // throw err;
    }
  }
  
  /**
   * Synchronously tests if a local file or directory at the provided path
   * (e.g. '/Users/myuser/docs/test.json' or 'C:\\Users\\myuser\\docs\\test.json')
   * exists. If not, returns 0. If so, returns:
   * - 1 if it is a regular file
   * - 2 for a directory
   * - 3 if it can't tell.
   *
   * @param {string} fullpath A string representing the full path of the possible local file or directory to be tested.
   * @returns {FileOrDirectoryType} 0 = does not exist, 1 = file, 2 = directory, 3 = other
   * @memberof PouchDBService
   */
  public isFileOrDirectorySync(fullpath:string):FileOrDirectoryType {
    let possibleFile:string = fullpath;
    try {
      possibleFile = path.normalize(fullpath);
      let stat = fs.lstatSync(possibleFile);
      if(stat.isFile()) {
        return FileOrDirectoryType.FILE;
      } else if(stat.isDirectory()) {
        return FileOrDirectoryType.DIRECTORY;
      } else {
        return FileOrDirectoryType.OTHER;
      }
    } catch (error) {
      Log.l(`isFileOrDirectorySync(): Error checking '${fullpath}', probably does not exist.`);
      return FileOrDirectoryType.NONE;
    }
  }
  
  public fileOrDirectoryExistsSync(fullpath:string):boolean {
    try {
      // Log.l(`isDirectory(): Called with arguments:\n`, arguments);
      try {
        // let stat;
        let possibleFile:string = path.normalize(fullpath);
        let stat = fs.lstatSync(possibleFile);
        let exists:boolean = stat.isFile() || stat.isDirectory();
        return exists;
      } catch (error) {
        Log.l(`fileOrDirectoryExistsSync(): Error checking '${fullpath}', returning false.`);
        return false;
      }
    } catch(err) {
      Log.l(`fileOrDirectoryExistsSync(): Error checking for directory '${fullpath}'`);
      Log.e(err);
      return false;
      // throw err;
    }
  }
  
  public makeDirectorySync(fullpath:string):boolean {
    try {
      // Log.l(`isDirectory(): Called with arguments:\n`, arguments);
      let possibleDir:string = fullpath;
      let db:string = possibleDir;
      try {
        possibleDir = path.normalize(fullpath);
        fs.accessSync(possibleDir);
        Log.l(`PouchDBService.makeDirectorySync(): '${db}' directory existed already. We coo'.`);
      } catch(err) {
        try {
          Log.l(`PouchDBService.makeDirectorySync(): Could not access '${db}' directory, trying to create it ...`);
          // fs.mkdirSync(db, {recursive: true});
          let dir:string = mkdirp.sync(db);
          return true;
        } catch(err2) {
          Log.l(`PouchDBService.makeDirectorySync(): Error creating '${db}' directory!`);
          // Log.e(err2);
          throw err2;
        }
      }
    } catch(err) {
      Log.l(`PouchDBService.makeDirectorySync(): Error forcing creation of directory '${fullpath}'`);
      Log.e(err);
      throw err;
    }
  }

  public removeFileOrDirectorySync(fullpath:string):boolean {
    let possibleFile:string = fullpath;
    let status:boolean = false;
    try {
      possibleFile = path.normalize(fullpath);
      let type:FileOrDirectoryType = this.isFileOrDirectorySync(possibleFile);
      if(type === FileOrDirectoryType.FILE) {
        fs.unlinkSync(possibleFile);
        status = true;
      } else if(type === FileOrDirectoryType.DIRECTORY) {
        // fs.rmdirSync(possibleFile);
        rimraf.sync(possibleFile);
        status = true;
      }
      return status;
    } catch (err) {
      Log.l(`removeFileOrDirectorySync(): Error removing '${fullpath}', returning false.`);
      Log.e(err)
      return false;
    }
  }
  
  public removeDirectoryContentsSync(fullpath:string):boolean {
    let dir:string = fullpath;
    let status:boolean = false;
    try {
      dir = path.normalize(fullpath);
      let type:FileOrDirectoryType = this.isFileOrDirectorySync(dir);
      if(type === FileOrDirectoryType.DIRECTORY) {
        let rmTarget:string = path.join(dir, "**", "*");
        rimraf.sync(rmTarget);
        // fs.unlinkSync(possibleFile);
        status = true;
      }
      return status;
    } catch (err) {
      Log.l(`removeFileOrDirectorySync(): Error removing '${fullpath}', returning false.`);
      Log.e(err)
      return false;
    }
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
// idb_attachment_format: string
export interface PDBInfo extends PDBInfoOriginal {
  db_name          : string             ;
  adapter         ?: string             ;
  auto_compaction ?: boolean            ;
  doc_count        : number             ;
  update_seq       : number|string      ;
  
  // LevelDB
  backend_adapter ?: string             ;

  // WebSql
  sqlite_plugin   ?: boolean            ;
  websql_encoding ?: 'UTF-8' | 'UTF-16' ;

  // IndexedDB
  idb_attachment_format ?: 'base64' | 'binary';
 
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
export type CorePDBOptions     = PouchDB.Configuration.CommonDatabaseConfiguration ;
export type LocalPDBOptions    = PouchDB.Configuration.LocalDatabaseConfiguration  ;
export type RemotePDBOptions   = PouchDB.Configuration.RemoteDatabaseConfiguration ;
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
