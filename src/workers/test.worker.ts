const ctx:Worker = self as any;
// declare function importScripts(...urls: string[]): void;
// declare function require(...mods: string[]):any;
// importScripts('./bundle.js');

// import { Street  } from "domain/domain/street"    ;
// import { Address } from 'domain/domain/address'   ;
import { Preferences } from 'providers/preferences';
import { Log     } from 'domain/config/config.log';
import PouchDB from 'pouchdb';
import * as PDBAuth             from '@onsite/pouchdb-auth-utils' ;
import * as pdbFind             from 'pouchdb-find'           ;
import * as pdbUpsert           from '@onsite/pouchdb-upsert-plugin';
// import * as pdbAllDBs           from 'pouchdb-all-dbs'        ;
import * as websqlPouch         from 'pouchdb-adapter-websql' ;
// import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';
// const PouchDB = require('pouchdb-core');

let wStyle = "background-color: rgba(255, 80, 180, 1.0); color: white; ";

// type DBPouch = PouchDB.Database;
type DBPouch = any;

let pdb           : Map<string,DBPouch>  = new Map();
let rdb           : Map<string,DBPouch>  = new Map();
let PDBSyncs      : Map<string,any>      = new Map();
// let PDBSyncs      : Map<string,any>      = new Map();
// let InitialSyncs  : Map<string,any>      = new Map();
// let prefs = new Preferences();

Log.l("%cWORKER START", wStyle);
// Log.l(`%cPREFERENCES:\n`, "background-color: rgba(255, 80, 180, 1.0); color: white;", prefs);

// var Address = require('Address');
// let address1 = new Address();
// let street1 = new Street("123 Jones Avenue");
// address1.street = street1;

let initialized:boolean = false;
let pouchdb:any = null;

const initializePouchDB = () => {
  if(!initialized) {
    pouchdb = PouchDB;
    addPouchDBPlugin(pouchdb, PDBAuth);
    addPouchDBPlugin(pouchdb, pdbUpsert);
    addPouchDBPlugin(pouchdb, pdbFind);
    // addPouchDBPlugin(pouchdb, pdbAllDBs);
    // addPouchDBPlugin(pouchdb, pdbAllDBs);
    // pouchdb.adapter('worker', workerPouch);
    // pouchdb.adapter('websql', websqlPouch);
    // PouchDB.plugin(pdbMemory);
    // let adapter = PouchDBService.PREFS.CONSOLE.SERVER.localAdapter || 'idb';
    // if(adapter !== 'idb') {
      // PouchDB.adapter('worker', workerPouch);
    // }
    // PouchDB.adapter('worker', workerPouch);
    // PouchDB.adapter('mem', );
    // this.StaticPouchDB = PouchDB;
    // this.initialized = true;
    // return this.StaticPouchDB;
    return pouchdb;
  } else {
    return pouchdb;
  }

};

const addPouchDBPlugin = (pouchdbObject:any, plugin:any) => {
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
};


let addDB = (dbname:string):DBPouch => {
  let dbmap = pdb;
  if(dbmap.has(dbname)) {
    // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
    return dbmap.get(dbname);
  } else {
    // let pdbAdapter:string = prefs.getLocalAdapter();
    // let PDB_ADAPTER:string = prefs && prefs.SERVER && prefs.SERVER.localAdapter ? prefs.SERVER.localAdapter : 'idb';
    let PDB_ADAPTER:string = 'idb';
    Log.l(`PouchDBService.addDB(): Adding database '${dbname}' with adapter '${PDB_ADAPTER}' ...`);
    let opts:any = {
      'adapter': PDB_ADAPTER,
    };
    let newPDB:DBPouch = new PouchDB(dbname, opts);
    // let newPDB:DBPouch = new DBPouchDB(dbname, {adapter: 'worker'});
    newPDB._remote = false;
    dbmap.set(dbname, newPDB);
    // Log.l(`addDB(): Added local database ${dbname} to the list.`);
    // return dbmap.get(dbname);
    return newPDB;
  }
};

let addRDB = (dbname:string):DBPouch => {
  let dbmap = rdb;
  if(dbmap.has(dbname)) {
    // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
    return dbmap.get(dbname);
  } else {
    // let pdbAdapter:string = prefs.getLocalAdapter();
    // let PDB_ADAPTER:string = prefs && prefs.SERVER && prefs.SERVER.localAdapter ? prefs.SERVER.localAdapter : 'idb';
    let PDB_ADAPTER:string = 'idb';
    Log.l(`PouchDBService.addDB(): Adding database '${dbname}' with adapter '${PDB_ADAPTER}' ...`);
    let opts:any = {
      'adapter': PDB_ADAPTER,
    };
    let newPDB:DBPouch = new PouchDB(dbname, opts);
    // let newPDB:DBPouch = new DBPouchDB(dbname, {adapter: 'worker'});
    newPDB._remote = false;
    dbmap.set(dbname, newPDB);
    // Log.l(`addDB(): Added local database ${dbname} to the list.`);
    // return dbmap.get(dbname);
    return newPDB;
  }
};

let addSync = (dbname:string, dbsync:any):any => {
  let syncmap = PDBSyncs;
  if(syncmap.has(dbname)) {
    let syncevent = syncmap.get(dbname);
    syncevent.cancel();
  }
  syncmap.set(dbname, dbsync);
  return syncmap.get(dbname);
};

let getSync = (dbname:string):any => {
  let syncmap = PDBSyncs;
  let outVal = null;
  if(syncmap.has(dbname)) {
    outVal = syncmap.get(dbname);
  } else {
    Log.w(`getSync('${dbname}'): Entry not found in sync list!`);
  }
  return outVal;
};

let isSynced = (dbname:string):boolean => {
  let syncmap = PDBSyncs;
  let exists:boolean = false;
  if(syncmap.has(dbname)) {
    exists = true;
  }
  return exists;
};
// Log.gc("%c WORKER START", "background-color: rgba(255, 80, 180, 1.0); color: white;");
// Log.l('hello from a webworker');
// Log.l(`The address class has a new object:\n`, address1);
// Log.ge();

const processChannelEvent = async (ch:string, pl:any) => {
  if(ch === 'addDB') {
    let dbname:string = pl ? pl : "TESTDB";
    addDB(dbname);
  } else if(ch === 'dbLogin') {
    let dbname:string = pl && pl.db ? pl.db : "_session";
    let username:string = pl && pl.username ? pl.username : "";
    let password:string = pl && pl.password ? pl.password : "";
    if(dbname && username && password) {

    }
  } else if(ch === 'syncDB') {
    let dbname:string = pl ? pl : "TESTDB";

  } else if(ch === 'debugOn') {
    let pouchdebug:string = `*`;
    if(pl && typeof pl === 'string') {
      pouchdebug = `pouchdb:${pl}`;
    }
    PouchDB.debug.enable(pouchdebug);
  } else if(ch === 'debugOff') {
    let pouchdebug:string = `*`;
    if(pl && typeof pl === 'string') {
      pouchdebug = `pouchdb:${pl}`;
    }
    // PouchDB.debug.disable(pouchdebug);
    PouchDB.debug.disable();
  } else {
    Log.l(`%cprocessChannelEvent(): Called with unknown channel:\n`, wStyle, ch);
  }
};

ctx.addEventListener('message', async (message:MessageEvent):Promise<any> => {
  Log.gc("%cWORKER CALLED", wStyle);
  Log.l('%cgot message:\n', wStyle, message);
  if(message && message.data && message.data.channel) {
    let ch = message.data.channel;
    let pl = message.data.payload;
    await processChannelEvent(ch, pl);
  }
  Log.l(`DB LIST:\n`, pdb);
  Log.ge();
  // Log.l('Address is: ', address1);
  // console.log('street type is:', street1.getClassName());
  // Log.ge();
  // ctx.postMessage('this is the response ' + message.data);

  // console.log('in webworker', message);
  // console.log('in worker, street is: ', street1);
  // console.log('in worker, street type is:', street1.getClassName());
  // ctx.postMessage('this is the response ' + message.data);
});

initializePouchDB();

// export default null as any;
