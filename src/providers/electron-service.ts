import { BrowserWindow as browserwindow } from 'electron' ;
import { BrowserView as browserview     } from 'electron' ;
import { IpcRenderer                    } from 'electron' ;
import { app as electronApp             } from 'electron' ;
import { webFrame                       } from 'electron' ;
import { dialog                         } from 'electron' ;
import { remote                         } from 'electron' ;
import { ipcRenderer                    } from 'electron' ;
// import { electronLocalshortcut          } from 'electron-localshortcut';
// import electronLocalshortcut from 'electron-localshortcut';
import * as electronLocalshortcut from 'electron-localshortcut';

import { globalShortcut  } from 'electron';
import * as electron from 'electron';
import { Remote } from 'electron';
// import { Menu } from 'electron';
import { Menu as MenuType } from 'electron';

// import * as WHATWG from 'whatwg-url';
import { isRenderer } from 'is-electron-renderer';
// import * as Mousetrap from 'mousetrap';
// import * as NapaJS from 'napajs';
// declare var PDFWindow;

// const os = require('os')                                        ;
import * as os from 'os';
// const childProc = require('child_process');
// const NapaJS = require('napajs');
// import * as diskusage from 'diskusage';

import windowStateKeeper from 'electron-window-state'      ;
// import { windowStateKeeper } from 'electron-window-state';
// imposrt * as PDFWindow         from 'electron-pdf-window'        ;
import * as fs from 'graceful-fs';
// import * as gfs from 'graceful-fs';
// const fs = gfs.promises;
import * as path from 'path';
// import searchInPage, {InPageSearch} from 'electron-in-page-search';
// import searchInPage, {InPageSearch} from './electron-search-service';
// import * as PDFWindow from '../lib/electron-pdf-window';
import { PDFWindow } from '../lib/electron-pdf-win';
// import { Subscription        } from 'rxjs/Subscription'          ;
import { Subject             } from 'rxjs/Subject'               ;
import { Observable          } from 'rxjs/Observable'            ;
import { Injectable          } from '@angular/core'              ;
// import { EventEmitter        } from '@angular/core'              ;
// import { NgZone              } from '@angular/core'              ;
// import { ChangeDetectorRef   } from '@angular/core'              ;
import { Log, moment, Moment } from 'domain/onsitexdomain'       ;
import { OSData              } from './data-service'             ;
import { NotifyService       } from './notify-service'           ;
import { DispatchService     } from './dispatch-service'         ;
import isElectron from 'is-electron';
import { MenuItemContent } from 'primeng/menu';
import * as contextMenu from 'electron-context-menu';

declare const window:any;
const fsp = fs.promises;

// export type Menu = Electron.Menu;
export type MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
export type MenuItem = Electron.MenuItem;
export type WebContents = Electron.WebContents;
export type ElectronEvent = Electron.Event;
export type Dialog = Electron.Dialog;
export type IPCRenderer = Electron.IpcRenderer;
export type Remote = Electron.Remote;
export type BrowserWindow = Electron.BrowserWindow;
export type BrowserView = Electron.BrowserView;

export type DialogType = "none" | "info" | "error" |"question" | "warning";

const Menu = remote.Menu;

export interface DialogOptions {
  type    ?: DialogType;
  buttons ?: string[];
  title    : string;
  message  : string;
  detail  ?: string;
  timeout ?: number;
};

export interface PDFPrintOptions extends electron.PrintToPDFOptions {
  loadDevTools ?: boolean;
}

@Injectable()
export class ElectronService {
  public dbDir:string = "";
  // public static searchActive:boolean = false;
  // public get searchActive():boolean { return ElectronService.searchActive; };
  // public set searchActive(val:boolean) { ElectronService.searchActive = val; };
  // public searchEvent = new EventEmitter<any>();
  public searchActive:boolean = false;
  public searchListeners:number = 0;
  public searchSubject:Subject<any>;
  public searchEvent:Observable<any>;
  public currentZoom:number = 0;
  // public menu:electron.Menu;
  public menu:MenuType;
  public app:any;
  public electronapp:any = electronApp;
  public win:BrowserWindow;
  public windowState:windowStateKeeper.State;
  public remote:Remote = remote;
  public browserView:any = browserview;
  public browserWindow:any = browserwindow;
  public printPreviewWindow:PDFWindow;
  // public printPreviewWindow:Electron.BrowserWindow;
  // public elog = electronlog;
  // public autoUpdater = electronAutoUpdater;
  // public autoUpdater:any;
  public dialog:Dialog = dialog;
  public ipc:IPCRenderer = ipcRenderer;
  // public WHATWG    = WHATWG;
  // public URL       = WHATWG.URL;
  // public pdfWindow = PDFWindow;
  public pdfWindow:PDFWindow;
  public path = path;
  public fs = fs;
  public fsp = fsp;
  public localShortcut = electronLocalshortcut;
  public searcher;
  public defaultTitle:string;
  // public childproc = childProc;

  constructor(
    // public zone           : NgZone            ,
    // public changeDetector : ChangeDetectorRef ,
    public data           : OSData            ,
    public notify         : NotifyService     ,
    public dispatch       : DispatchService   ,
  ) {
    window['onsiteelectronservice'] = this;
    window['oselectron'] = electron;
    // window['WHATWG'] = WHATWG;
    // window['NapaJS'] = NapaJS;
    // window['PDFWindow'] = PDFWindow;
    this.subscribeConsole();
    this.app = { openPage: (pageName?:string) => {this.notify.addError("ERROR", `Error loading page '${pageName}'.`, 5000);}};
    this.searchSubject = new Subject<any>();
    this.searchEvent = this.searchSubject.asObservable();
    let win:BrowserWindow = remote.getCurrentWindow();
    if(win) {
      this.defaultTitle = win.getTitle();
    }
    // this.electronDBInit();
    // this.pdfWindow = PDFWindow;
  }

  public subscribeConsole() {
    this.ipc.on('log-from-app', (event, ...params) => {
      Log.l(...params);
    });
    this.ipc.on('pdf-window-created', (event, pdfWin) => {
      Log.l(`PDF Window created:\n`, pdfWin);
      window['onsitenewpdfwindow'] = pdfWin;
    });
    // this.ipc.on('shortcut-search', () => {
    //   Log.l(`Global Shortcut received: search`);
    //   this.pageSearch(null, false);
    // });
    // if(window && window.Mousetrap) {
    //   window.Mousetrap.bind(['ctrl+f', 'command+f'], (e:any) => {
    //     Log.l(`Window Shortcut received: search`);
    //     this.pageSearch(null, false);
    //   });
    //   window.Mousetrap.bind(['ctrl+shift+f', 'command+shift+f'], (e:any) => {
    //     Log.l(`Window Shortcut received: search with devtools`);
    //     this.pageSearch(null, true);
    //   });
    // }

    // this.ipc.on('pdf-window-closed', (event, options) => {
    //   Log.l(`PDF Window closed.`);
    //   window['onsitenewpdfwindow'] = null;
    // });
  }

  // public electronDBInit() {
  //   let currentDir:string = path.join(".");
  //   let dataDir:string = this.remote.app.getPath('userData');
  //   let dbDir:string = path.join(dataDir, "db");
  //   let sep:string = path && path.sep ? path.sep : "/";
  //   this.dbDir = dbDir + sep;
  //   let db:string = this.dbDir;
  //   Log.l(`ElectronService.electronDBInit(): Creating '${db}' directory if necessary ...`);
  //   try {
  //     fs.accessSync(db);
  //     Log.l(`ElectronService.electronDBInit(): '${db}' directory existed already. We coo'.`);
  //   } catch(err) {
  //     try {
  //       Log.l(`ElectronService.electronDBInit(): Could not access '${db}' directory, trying to create it ...`);
  //       fs.mkdirSync(db);
  //     } catch(err2) {
  //       Log.l(`ElectronService.electronDBInit(): Error creating '${db}' directory!`);
  //       Log.e(err2);
  //     }
  //   }
  // }

  public isElectron():boolean {
    return isElectron();
  }

  public isElectronRenderer():boolean {
    return typeof isRenderer === 'boolean' ? isRenderer : false;
  }

  public getDataDir():string {
    return this.remote.app.getPath('userData');
  }

  public getDataDirAsPrefix():string {
    let datadir:string = this.remote.app.getPath('userData');
    let sep:string = path && path.sep ? path.sep : "/";
    return datadir + sep;
  }

  public getDBDir(directoryName?:string):string {
    // let dbdir:string = this.dbDir;
    let dbdirname:string = typeof directoryName === 'string' ? directoryName : "db";
    let dbdir:string = this.getFullDataPathForFile(dbdirname);
    return dbdir;
  }
  
  public getDBDirAsPrefix(directoryName?:string):string {
    let dbdir:string = this.getDBDir(directoryName);
    let sep:string = path && path.sep ? path.sep : "/";
    let out:string = dbdir + sep;
    return out;
  }

  public getFullDataPathForFile(filename:string):string {
    let datadir:string = this.getDataDir();
    let fullfile:string = path.normalize(path.join(datadir, filename));
    return fullfile;
  }

  public getFullDBPathForFile(filename:string):string {
    let dbdir:string = this.getDBDir();
    let fullfile:string = path.normalize(path.join(dbdir, filename));
    return fullfile;
  }

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
  
  public setApp(component:any) {
    Log.l("setApp(): Now setting app to:\n", component);
    this.app = component;
    // this.path = path;
  }

  public zoomIn() {
    webFrame.setZoomLevel(++this.currentZoom);
  }

  public zoomOut() {
    webFrame.setZoomLevel(--this.currentZoom);
  }

  public createMenuFromIonicMenu(ionicMenu:any[]) {
    let template:any[] = [];
    let thisApp = this.app;
    let dev = this.data.status.role === 'dev';
    // let Menu = Menu;
    // let MenuItem = MenuItem;
    let i = 0;
    for(let item of ionicMenu) {
      i++;
      let label = item.title;
      let page = item.page;
      let role = item.role;
      if(role === 'dev' && !dev) {
        continue;
      } else {
        if(item.submenu.length) {
          let submenu = [];
          for(let subitem of item.submenu) {
            let sublabel = subitem.title;
            let subpage  = subitem.page;
            let subMenuItem = {label: sublabel, click() { thisApp.openPage(subitem); }};
            submenu.push(subMenuItem);
          }
          let menuItem = {label: label, submenu: submenu};
          template.push(menuItem);
        } else {
          if(i === 1) {
            let menuItem = {label: label, accelerator: 'F5', click() { thisApp.openPage(item); }};
            template.push(menuItem);
          } else {
            let menuItem = {label: label, click() { thisApp.openPage(item); }};
            template.push(menuItem);
          }
        }
      }
    }
    Log.l("createMenuFromIonicMenu(): Final template is:\n", template);
    return template;
  }

  public createMenus() {
    // let template1:MenuItem = {
    let thisApp = this.app;
    let pages = this.app.pagesNested;
    let viewSubmenu:MenuItemConstructorOptions[] = [
      { label: 'Developer Tools', accelerator: 'F12', click: () => { this.showDeveloperTools(); }},
      { role: 'toggledevtools' },
      { label: 'Toggle Dev Mode', accelerator: 'CommandOrControl+F12', click: () => { this.toggleDeveloperMode(); } },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ];
    // let viewSub1:MenuItemConstructorOptions[] = [
    //   { label: 'Developer Tools', accelerator: 'F12', click: () => { this.showDeveloperTools(); }},
    //   { role: 'toggledevtools' },
    // ];
    // let viewSub2:MenuItemConstructorOptions[] = [
    //   { type: 'separator' },
    //   { role: 'resetzoom' },
    //   { role: 'zoomin' },
    //   { role: 'zoomout' },
    //   { type: 'separator' },
    //   { role: 'togglefullscreen' },
    // ];
    // let viewSubDev:MenuItemConstructorOptions[] = [
    //   { label: 'Toggle Dev Mode', accelerator: 'CommandOrControl+F12', click: () => { this.toggleDeveloperMode(); } },
    // ];
    if(!this.data.isDeveloper) {
      viewSubmenu = viewSubmenu.filter((a:MenuItemConstructorOptions) => {
        return a.label !== 'Toggle Dev Mode';
      });
    }
    let template:MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          { label: "Options", accelerator: "CommandOrControl+O", click: () => { this.showAppOptions('global'); }},
          { label: "Advanced Options", accelerator: "CommandOrControl+Shift+O", click: () => { this.showAppOptions('advanced'); }},
          { type: 'separator' },
          { label: "Restart App", accelerator: 'CommandOrControl+Shift+R', click: () => { this.relaunchApp(); } },
          { role: 'quit' },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          // { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          // { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          // { type: "separator" },
          // { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          //   {role: 'copy'},
          // {role: 'paste'},
          // {role: 'pasteandmatchstyle'},
          // {role: 'selectall'},
          { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" },
          { type: 'separator' },
          // { label: 'Find…', accelerator: 'CommandOrControl+G', click: () => { this.pageSearch(); } },
          { label: 'Find…', accelerator: 'CommandOrControl+G', click: () => { this.dispatch.triggerAppEvent('find-in-page'); } },
        ]
      },
      {
        label: 'View',
        accelerator: 'Alt+V',
        submenu: viewSubmenu,
      },
      {
        label: 'App',
        accelerator: 'Alt+A',
        submenu: [
          { label: "Reauthenticate", click: () => { this.reauthenticate(); } },
        ]
      },
    ];
    if(this.app && this.app.pagesNested && Array.isArray(this.app.pagesNested)) {
    // if(ionicMenu) {
      let screenMenu = this.createMenuFromIonicMenu(this.app.pagesNested);
      // let item = {label: 'Screens', submenu: screenMenu, accelerator: 'CmdOrCtrl+Shift+S' };
      let item = {label: 'Screens', submenu: screenMenu, accelerator: 'CommandOrControl+Alt+S' };
      template.push(item);
    }
      // template = [...template, ...screenMenu];
    // }
    // let help:MenuItemConstructorOptions = {
    //   label: 'Help',
    //   submenu: [
    //     {label: 'Check for update...', click: () => { this.checkForUpdate(); } },
    //     { type: 'separator' },
    //     {label: 'About OnSiteX Console...', click: () => { this.notify.addInfo("VERSION", `OnSiteX Console ${this.getVersion()}`, 5000); } },
    //   ]
    // };
    let helpMenu:MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {label: 'Check for update...', click: () => { this.checkForUpdate(); } },
        {type: 'separator' },
        {label: 'About OnSiteX Console...', click: () => { this.showVersion(); } },
      ]
    };
    template.push(helpMenu);
    if(process.platform === 'darwin') {
      template.unshift({
        label: electronApp.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services', submenu: [] },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }
    Log.l("createMenu(): Resulting template is:", template);
    let menu:MenuType = remote.Menu.buildFromTemplate(template);

    Log.l("createMenu(): Resulting menu is:", menu);
    remote.Menu.setApplicationMenu(menu);
    this.menu = menu;
    return menu;
  }

  public createStartupMenus() {
    // let template1:MenuItem = {
    let template:MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          { label: "Options", accelerator: "CommandOrControl+O", click: () => { this.showAppOptions('global'); }},
          { type: 'separator' },
          { label: "Restart App", accelerator: 'CommandOrControl+Shift+R', click: () => { this.relaunchApp(); } },
          { role: 'quit' },
        ]
      },
      {
        label: 'View',
        accelerator: 'Alt+V',
        submenu: [
          { label: 'Developer Tools', accelerator: 'F12', click: () => { this.showDeveloperTools(); }},
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
    ];
    let helpMenu:MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {label: 'Check for update...', click: () => { this.checkForUpdate(); } },
        {type: 'separator' },
        {label: 'About OnSiteX Console...', click: () => { this.showVersion(); } },
      ]
    };
    template.push(helpMenu);
    if(process.platform === 'darwin') {
      template.unshift({
        label: electronApp.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services', submenu: [] },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }
    Log.l("createStartupMenus(): Resulting template is:", template);
    let menu:MenuType = remote.Menu.buildFromTemplate(template);
    Log.l("createStartupMenus(): Resulting menu is:", menu);
    remote.Menu.setApplicationMenu(menu);
    this.menu = menu;
    return menu;
  }


  public buttonClick(event?:any) {
    Log.l("buttonClick(): Event is:\n", event);
    if(event) {
      let menu:any = remote.Menu.getApplicationMenu();
      let idx = menu.getCommandIdAt(0);
      let command = menu.commandsMap[idx];
      command.click(event, remote.BrowserWindow.getFocusedWindow(), remote.webContents.getFocusedWebContents());
    }
  }

  public async showInfo(title:string, message:string, detail:string, timeout?:number):Promise<any> {
    try {
      let res:any = await this.showElectronAlert('info', title, message, detail, timeout);
      return res;
    } catch(err) {
      Log.l(`showInfo(): Error showing Electron info dialog.`);
      Log.e(err);
      this.notify.addError('DIALOG ERROR', `Error showing info dialog: ${err.message}`, 4000);
      // throw err;
    }
  }

  public async showWarning(title:string, message:string, detail:string, timeout?:number):Promise<any> {
    try {
      let res:any = await this.showElectronAlert('warning', title, message, detail, timeout);
      return res;
    } catch(err) {
      Log.l(`showInfo(): Error showing Electron warning dialog.`);
      Log.e(err);
      this.notify.addError('DIALOG ERROR', `IRONIC! Error showing warning dialog: ${err.message}`, 4000);
      // throw err;
    }
  }

  public showWarn = this.showWarning;

  public async showError(err:Error, title:string, message:string, timeout?:number):Promise<any> {
    try {
      let detail:string = err && typeof err.message === 'string' ? err.message : "unknown error (code -42)";
      let res:any = await this.showElectronAlert('error', title, message, detail, timeout);
      return res;
    } catch(err2) {
      Log.l(`showInfo(): Error showing Electron error dialog.`);
      Log.e(err2);
      this.notify.addError('DIALOG ERROR', `HIGHLY IRONIC! Error showing error dialog: ${err2.message}`, 4000);
      // throw err2;
    }
  }

  public async showElectronAlert(type:DialogType, title:string, message:string, detail:string, timeout?:number):Promise<any> {
    try {
      let to:number = 60000;
      let opts:DialogOptions = {
        type: type && typeof type === 'string' ? type : 'info',
        title: title,
        message: message,
      };
      if(detail && typeof detail === 'string') {
        opts.detail = detail;
      } else if(detail && typeof detail === 'number') {
        to = detail;
      }
      if(timeout && typeof timeout === 'number') {
        to = timeout;
      }
      let response:any = await this.showElectronDialog(opts, to);
      return response;
    } catch(err) {
      Log.l(`showElectronAlert(): Error showing alert.`);
      Log.e(err);
      throw err;
    }
  }

  public getElectronDialogResponse(timeout?:number):Promise<any> {
    return new Promise((resolve,reject) => {
      let ms:number = timeout || 60000;
      let timeoutHandle = setTimeout(() => {
        Log.l(`getElectronDialogResponse(): Timeout after ${ms}ms and no response from dialog.`);
        reject(new Error("Timeout waiting for dialog response."));
      }, ms);
      Log.l(`getElectronDialogResponse(): waiting ${ms}ms for a response...`);
      this.ipc.on('dialog-response', (event, response) => {
        clearTimeout(timeoutHandle);
        Log.l(`getEletronDialogResponse(): received a response:`, response);
        resolve(response);
      });
    });
  }

  public showElectronDialog(dialogOptions:DialogOptions, timeout?:number):Promise<any> {
    // try {
      return new Promise(async (resolve,reject) => {
        // this.ipc.send('dialog-show', dialogOptions);
        // let response:any = await this.getElectronDialogResponse(timeout);
        // Log.l(`showElectronDialog(): Got response:`, response);
  
        // let win:BrowserWindow = this.remote.getCurrentWindow();
        try {
          let ms:number = typeof timeout === 'number' ? timeout : 60000;
          let timeoutHandle = setTimeout(() => {
            let text:string = `showElectronDialog(): Timeout after ${ms}ms and no response from dialog.`;
            Log.l(text);
            let err:Error = new Error(text);
            reject(err);
          }, ms)
          this.remote.dialog.showMessageBox(dialogOptions, (response:number, checkboxChecked:boolean) => {
            clearTimeout(timeoutHandle);
            Log.l(`showElectronDialog(): Received response: `, response);
            resolve(response);
          });
          // Log.l(`showElectronDialog(): Showing dialog right now, output of function is: `, out);
        } catch(err) {
          Log.l(`showElectronDialog(): Error showing dialog:`);
          Log.e(err);
          reject(err);
        }
        // Log.l(`showElectronDialog(): Got response:`, response);
        // return response;
        // resolve(response)
      });
    // } catch(err) {
    //   Log.l(`showElectronDialog(): Error showing Electron dialog box!`);
    //   Log.e(err);
    //   throw err;
    // }
  }

  public reauthenticate() {
    return this.app.reauthenticate();
  }

  public getVersion() {
    let version = remote.app.getVersion();
    return version;
  }

  public showVersion() {
    // this.notify.addInfo("VERSION", `OnSiteX Console ${this.getVersion()}`, 5000);
    this.ipcSend('show-about');
  }

  public relaunchApp() {
    let app = remote.app;
    app.relaunch();
    app.exit(0);
  }

  public showDeveloperTools() {
    let wc = remote.getCurrentWebContents();
    if(wc.isDevToolsOpened() && !wc.isDevToolsFocused()) {
      wc.devToolsWebContents.focus();
    } else {
      wc.openDevTools();
    }
  }

  public toggleDeveloperTools() {
    let wc = remote.getCurrentWebContents();
    wc.toggleDevTools();
  }

  public toggleDeveloperMode() {
    this.dispatch.triggerAppEvent('toggledevmode');
  }

  public setWindowTitle(title:string) {
    let win:BrowserWindow = remote.getCurrentWindow();
    let winTitle:string = typeof title === 'string' ? title : this.defaultTitle;
    if(win) {
      win.setTitle(winTitle);
    }
  }

  public getWindowTitle():string {
    let win:BrowserWindow = remote.getCurrentWindow();
    if(win && typeof win.getTitle === 'function') {
      return win.getTitle();
    } else {
      return "";
    }
  }

  public toggleDevModeTitle():string {
    let title:string = this.defaultTitle;
    let win:BrowserWindow = remote.getCurrentWindow();
    if(win && typeof win.setTitle === 'function') {
      let mode:boolean = this.data.isDevMode();
      if(mode) {
        title = title + " (DEV MODE)";
      }
      win.setTitle(title);
    }
    // this.app.tick();
    this.dispatch.triggerAppEvent('changedetection');
    return title;
  }

  public showAppOptions(value:string) {
    // this.zone.run(() => {
      this.dispatch.showGlobalOptions(value);
    // });
  }

  public registerWindowStateKeeper() {
    let app = remote.app;
    if(app.isReady()) {
      this.setWindowStateKeeperValues();
    } else {
      app.on('ready', () => {
        this.setWindowStateKeeperValues();
      });
    }
  }

  public setWindowStateKeeperValues() {
    let app = remote.app;
    let wsk = windowStateKeeper;
    let mainWindowState = wsk({
      defaultWidth: 1600,
      defaultHeight: 900
    });

    this.windowState = mainWindowState;

    let win = new remote.BrowserWindow({
      x: this.windowState.x,
      y: this.windowState.y,
      width: this.windowState.width,
      height: this.windowState.height,
    });

    this.win = win;

    this.windowState.manage(this.win);
  }

  public printToPDF(options:PDFPrintOptions):Promise<string> {
    return new Promise(async (resolve,reject) => {
      let win = remote.getCurrentWindow();
      let tempDir = remote.app.getPath('temp');
      // let marginType:number = 1, loadDevTools:boolean = false;
      let now:Moment = moment();
      // let name = `printpreview_${now.format('x')}.pdf`;
      let timestamp = now.format('x');
      let name = `printpreview_${timestamp}.pdf`;
      let outfile = path.join(tempDir, name);
      win.webContents.printToPDF(options, async (error, data) => {
        if(error) {
          Log.l("printToPDF(): Error!");
          Log.e(error);
          reject(error);
          // throw error;
        } else {
          window['onsitePDFdata'] = data;
          try {
            await fsp.writeFile(outfile, data);
          } catch(err) {
            Log.l(`printToPDF(): Error writing output file '${outfile}'`);
            Log.e(err);
            reject(err);
          }
          Log.l(`printToPDF(): Successfully saved PDF file to: '${outfile}'`)
          resolve(outfile);
          // let pdfWin:PDFWindow = await this.createPDFWindow(outfile, options.loadDevTools);
          // window['onsitenewpdfwindow'] = pdfWin;
          // this.pdfWindow = pdfWin;

          // // Emitted when the window is closed.
          // pdfWin.on('closed', () => {
          //   // Dereference the window object, usually you would store windows
          //   // in an array if your app supports multi windows, this is the time
          //   // when you should delete the corresponding element.
          //   // sendEventToWindow('pdf-window-closed');
          //   Log.l(`createPDFWindow(): PDF window closed.`);
          //   pdfWin = null;
          //   this.pdfWindow = null;
          //   fs.unlink(outfile, (err) => {
          //     if(err) {
          //       Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
          //       Log.e(err);
          //     } else {
          //       Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
          //     }
          //   });
          // });

          // resolve(pdfWin);
        //   fs.writeFile(outfile, data, (err) => {
        //     if(err) {
        //       Log.l("showPrintPreview(): Error saving PDF!");
        //       Log.e(err);
        //     } else {
        //       Log.l(`showPrintPreview(): PDF saved successfully as '${outfile}', attempting to load window...`);
        //       // let pdfOptions:any = {
        //       //   url: outfile,
        //       //   loadDevTools: loadDevTools,
        //       // };
        //       // this.ipc.send('show-pdf', pdfOptions);
        //       // let pdfWin:BrowserWindow = this.createPDFWindow(outfile, loadDevTools);
        //       // this.ipc.on('pdf-window-closed', (event, options) => {
        //       //   Log.l(`PDF Window closed.`);
        //       //   window['onsitenewpdfwindow'] = null;
        //       //   fs.unlink(outfile, (err) => {
        //       //     if(err) {
        //       //       Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
        //       //       Log.e(err);
        //       //     } else {
        //       //       Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
        //       //     }
        //       //   });
        //       // });
        //               // let pdfWin = new PDFWindow({width: 1024, height: 768, parent: win});
        //       // pdfWin.loadURL(outfile);
        //     }
        //   })
        }
      });

    });
  }

  // public async showPrintPreview({loadDevTools = false, marginsType = 1, printBackground = true, pageSize = 'Letter', printSelectionOnly = false, landscape = false}):Promise<any> {
  public async showPrintPreview({loadDevTools = false, marginsType = 1, printBackground = true, pageSize = 'Letter', printSelectionOnly = false, landscape = false}:PDFPrintOptions):Promise<any> {
    try {
      let outfile:string = await this.printToPDF({loadDevTools:loadDevTools, marginsType:marginsType, printBackground:printBackground, pageSize:pageSize, printSelectionOnly:printSelectionOnly, landscape: landscape});
      let pdfWin:PDFWindow = await this.createPDFWindow(outfile, loadDevTools);
      window['onsitenewpdfwindow'] = pdfWin;
      this.printPreviewWindow = pdfWin;
      this.pdfWindow = pdfWin;

      // Emitted when the window is closed.
      pdfWin.on('closed', async () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // sendEventToWindow('pdf-window-closed');
        Log.l(`createPDFWindow(): PDF window closed.`);
        pdfWin = null;
        this.pdfWindow = null;
        this.printPreviewWindow = null;
        try {
          await fsp.unlink(outfile);
          Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
          // return res;
        } catch(err) {
          Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'`);
          Log.e(err);
          // throw err;
        }
        Log.l(`showPrintPreview(): print preview finished successfully`)
      //   fs.unlink(outfile, (err) => {
      //     if(err) {
      //       Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
      //       Log.e(err);
      //     } else {
      //       Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
      //     }
      //   });
      // });
      });


    //   return new Promise((resolve,reject) => {
        
    //     let win = remote.getCurrentWindow();
    //     let tempDir = remote.app.getPath('temp');
    //     // let marginType:number = 1, loadDevTools:boolean = false;
    //     let now:Moment = moment();
    //     // let name = `printpreview_${now.format('x')}.pdf`;
    //     let timestamp = now.format('x');
    //     let name = `printpreview_${timestamp}.pdf`;
    //     let outfile = path.join(tempDir, name);
    //     win.webContents.printToPDF({marginsType: marginsType, printBackground: printBackground, pageSize: pageSize, printSelectionOnly: printSelectionOnly, landscape: landscape}, (error, data) => {
    //       if(error) {
    //         Log.l("showPrintPreview(): Error!");
    //         Log.e(error);
    //         reject(error);
    //         // throw error;
    //       } else {
    //         window['onsitePDFdata'] = data;
    //         fs.writeFile(outfile, data, (err) => {
    //           if(err) {
    //             Log.l("showPrintPreview(): Error saving PDF!");
    //             Log.e(err);
    //           } else {
    //             Log.l(`showPrintPreview(): PDF saved successfully as '${outfile}', attempting to load window...`);
    //             let pdfOptions:any = {
    //               url: outfile,
    //               loadDevTools: loadDevTools,
    //             };
    //             // this.ipc.send('show-pdf', pdfOptions);
    //             // let pdfWin:BrowserWindow = this.createPDFWindow(outfile, loadDevTools);
    //             let pdfWin:PDFWindow = await this.createPDFWindow(outfile, loadDevTools);
    //             window['onsitenewpdfwindow'] = pdfWin;
    //             this.pdfWindow = pdfWin;
    
    //             // Emitted when the window is closed.
    //             pdfWin.on('closed', () => {
    //               // Dereference the window object, usually you would store windows
    //               // in an array if your app supports multi windows, this is the time
    //               // when you should delete the corresponding element.
    //               // sendEventToWindow('pdf-window-closed');
    //               Log.l(`createPDFWindow(): PDF window closed.`);
    //               pdfWin = null;
    //               fs.unlink(outfile, (err) => {
    //                 if(err) {
    //                   Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
    //                   Log.e(err);
    //                 } else {
    //                   Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
    //                 }
    //               });
    //             });
    
    //             // this.ipc.on('pdf-window-closed', (event, options) => {
    //             //   Log.l(`PDF Window closed.`);
    //             //   window['onsitenewpdfwindow'] = null;
    //             //   fs.unlink(outfile, (err) => {
    //             //     if(err) {
    //             //       Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
    //             //       Log.e(err);
    //             //     } else {
    //             //       Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
    //             //     }
    //             //   });
    //             // });
    //                     // let pdfWin = new PDFWindow({width: 1024, height: 768, parent: win});
    //             // pdfWin.loadURL(outfile);
    //           }
    //         })
    //       }
    //     });
    //     // let devTools:boolean = typeof evt === 'boolean' ? evt : false;
    //     // let pdfWin = new remote.BrowserWindow({width: 1024, height: 768, parent: win});
    
    //     // let pdfWin = new PDFWindow({width: 1024, height: 768, parent: win});
    //     // pdfWindow.addSupport(pdfWin);
    //     // pdfWin.loadURL(outfile);
    
    //     // let pdfWin = new remote.BrowserWindow({width: 1024, height: 768, parent: win});
    //   });
    } catch(err) {
      Log.l(`showPrintPreview(): Error showing:`);
      Log.e(err);
      throw err;
    }
  }

  public async closePrintPreview():Promise<any> {
    try {
      let pdfWin:PDFWindow = this.pdfWindow || this.printPreviewWindow;
      if(pdfWin && typeof pdfWin.isClosable === 'function' && pdfWin.isClosable()) {
        pdfWin.close();
      }
      // return res;
    } catch(err) {
      Log.l(`closePrintPreview(): Error closing print preview`);
      Log.e(err);
      throw err;
    }
  }

  // public createPDFWindow(pdfFile:string, loadDevTools:boolean):BrowserWindow {
  public async createPDFWindow(pdfFile:string, loadDevTools:boolean):Promise<PDFWindow> {
    let pdfWin:BrowserWindow;
    let myWin:PDFWindow;
    let win:BrowserWindow;
    try {
      win = this.remote.getCurrentWindow();
      if(!win) {
        Log.w(`createPDFWindow() has no parent window! Can't create it.`);
        return null;
      } else {
        let parentPosition = win.getPosition();
        let winWidth:number = win.getBounds().width;
        let winHeight:number = win.getBounds().height;
        let width:number = winWidth >= 1124 ? winWidth - 100 : 1024;
        let height:number = winHeight >= 868 ? winHeight - 100 : 768;
        let x:number = winWidth >= 1124  ? parentPosition[0] + 50 : parentPosition[0] + 5;
        let y:number = winHeight >= 868  ? parentPosition[1] + 50 : parentPosition[1] + 5;
        // let pdfWindowOptions = {
        //   'x': mainWindowState.x,
        //   'y': mainWindowState.y,
        //   'width': mainWindowState.width,
        //   'height': mainWindowState.height,
        //   'parent': win,
        // };
  
        // let height =
  
        let pdfWindowOptions:Electron.BrowserWindowConstructorOptions = {
          // 'x': mainWindowState.x,or
          // 'y': mainWindowState.y,
          x: x,
          y: y,
          width: width,
          height: height,
          modal: true,
        };
        let platform:string = process.platform;
        Log.l(`createPDFWindow(): Platform is '${platform}'`);
        if(platform === 'darwin') {
          pdfWindowOptions.frame = true;
          pdfWindowOptions.kiosk = false;
          pdfWindowOptions.modal = false;
        } else {
          pdfWindowOptions.parent = win;
        }
  
        pdfWin = new this.remote.BrowserWindow(pdfWindowOptions);
        this.printPreviewWindow = (pdfWin as PDFWindow);

        // pdfWin = new PDFWindow(pdfWindowOptions);
  
        // let parsedURL = WHATWG.parseURL(pdfFile);
        // let pdfURL = pdfFile;
        // if(!(parsedURL && parsedURL.scheme && parsedURL.scheme === 'file')) {
        //   pdfURL = new URL(`file:///${pdfFile}`).href;
        // }
        Log.l(`createPDFWindow(): Now creating for URL: '${pdfFile}'`);
        // let parsedURL:URL;
        // if(!pdfFile.startsWith('file://')) {
        if(pdfFile.startsWith('/')) {
          pdfFile = "file://" + pdfFile;
        }
        let parsedURL:URL = new URL(pdfFile);
        let pdfURL = pdfFile;
        if(!(parsedURL && parsedURL.protocol && parsedURL.protocol === 'file:')) {
          // fileURL = new URL(`file:///${viewerPath}`).href;
          pdfURL = parsedURL.href;
        }
    
        Log.l(`createPDFWin(): Loading URL '${pdfURL}'`);
  
        PDFWindow.addSupport(pdfWin);
        // pdfWin.loadURL(pdfURL);
        pdfWin.loadURL(pdfFile);
        pdfWin.show();
        // windowPlus.loadURL(win, url);
  
        // Open the DevTools.
        if(loadDevTools) {
          Log.l("createPDFWindow(): Developer tools loading.");
          pdfWin.webContents.openDevTools();
        }
  
        setTimeout(() => {
          pdfWin.setMenu(null);
          pdfWin.setTitle('PRINT PREVIEW (OnSiteX Console)');
        }, 500)
  
        // sendEventToWindow('pdf-window-created', pdfWin);
        myWin = (pdfWin as PDFWindow);
        // return pdfWin;
        return myWin;
      }
    } catch(err) {
      Log.l(`createPDFWindow(): Error during creation`);
      Log.e(err);
      let out = await this.showError(err, "Print Error", "Error showing print preview window");
      if(this.pdfWindow && typeof this.pdfWindow.isClosable === 'function' && this.pdfWindow.isClosable()) {
        this.pdfWindow.close();
        this.pdfWindow = null;
      }
      // throw err;
      // return out;
    }
  }



  public getAppPath():string {
    let localPath:string = remote.app.getAppPath();
    let dirPath:string = __dirname;
    Log.l(`getPath(): localPath is '${localPath}' and dirPath is '${dirPath}'`);
    return localPath;
  }

  // public searchInPage = searchInPage;

  // public pageSearch(customSearch?:{css:string, html:string}, openDevTools?:boolean) {
  //   if(this.searcher) {
  //     Log.l(`pageSearch(): Search window is already open:\n`, this.searcher);
  //     return;
  //   } else {
  //     Log.l(`pageSearch(): Opening search window...`);
  //     let page = remote.getCurrentWebContents();
  //     let devMode = page.isDevToolsOpened();
  //     let css = fspath.join(__dirname, 'default-style.css');
  //     let html = fspath.join(__dirname, 'search-window.html');
  //     let options:any = {
  //       preloadSearchWindow: true,
  //       customCssPath: './default-style.css',
  //       customSearchWindowHtmlPath: './search-window.html',
  //       openDevToolsOfSearchWindow: false,
  //     };
  //     if(customSearch) {
  //       css = customSearch.css || css;
  //       html = customSearch.html || html;
  //       options.customCssPath = css;
  //       options.customSearchWindowHtmlPath = html;
  //     }
  //     // if(openDevTools || devMode) {
  //     if(openDevTools) {
  //       options.openDevToolsOfSearchWindow = true;
  //     }
  //     Log.l(`pageSearch(): starting plugin with CSS path '${css}' and html path '${html}'`)
  //     let search:InPageSearch = searchInPage(page, options);
  //     search.on('stop', (event) => {
  //       Log.l(`pageSearch(): Search window closed!`);
  //       this.searcher = null;
  //     });
  //     this.searcher = search;
  //     search.openSearchWindow();
  //     return search;
  //   }
  //   // let win = remote.getCurrentWindow();
  //   // let currentWebContents:WebContents = remote.getCurrentWebContents();
  //   // let currentWebContents:WebContents = win.webContents;
  //   // let currentWebContents:WebContents = remote.getCurrentWebContents();
  //   // let search = searchInPage(currentWebContents);
  //   // let search = electronSearch.searchInPage(currentWebContents);

  //   // let search:InPageSearch;
  //   // let sip:any = searchInPage;
  //   // let wc:WebContents = remote.getCurrentWebContents();
  //   // search = sip(wc);
  //   // search.openSearchWindow();

  //   // let ipc = electron.ipcRenderer;
  //   // let searcher = new ElectronSearchText({
  //   //   target: 'ion-content'
  //   // });
  //   // ipc.on('toggleSearch', () => {
  //   //   searcher.emit('toggle');
  //   // })
  // }

  // public listenForSearch() {
  //   let page = remote.getCurrentWebContents();
  //   if(this.searchListeners === 0) {
  //     this.searchListeners++;
  //     page.on('found-in-page', (event:any, result:any) => {
  //       Log.l("found-in-page event fired, event is:\n", result);
  //       if(!result) {
  //         return;
  //       }
  //       if(!result.finalUpdate) {
  //         return;
  //       }
  //       this.searchSubject.next(result);
  //     });
  //   }
  // }

  // public stopListeningForSearch() {
  //   let page = remote.getCurrentWebContents();
  //   page.removeAllListeners('found-in-page');
  // }

  // public searchText(text:string, seqSearch?:number) {
  //   let page = remote.getCurrentWebContents();
  //   // if(this.searchActive) {
  //   //   page.findInPage(text, {findNext: true});
  //   // } else {
  //     this.searchActive = true;
  //     page.findInPage(text);
  //   // }
  // }

  // public searchNext(text:string) {
  //   let page = remote.getCurrentWebContents();
  //   page.findInPage(text, {findNext:true});
  // }

  // public stopSearch() {
  //   let page = remote.getCurrentWebContents();
  //   page.stopFindInPage('clearSelection');
  //   this.stopListeningForSearch();
  //   this.searchListeners = 0;
  //   this.searchActive = false;
  // }

  public printPreview() {
  }

  public saveDialog() {
    let dialog = remote.dialog;
  }

  // public initializeAutoupdater() {
  //   this.autoUpdater.on('checking-for-update', (res) => {
  //     this.elog.info(`autoUpdater(): received event 'checking-for-update'.\n`, res);
  //     Log.l(`autoUpdater(): received event 'checking-for-update'.\n`, res);
  //     this.sendStatusToWindow('Checking for update...');
  //   });
  //   this.autoUpdater.on('update-available', (ev, info) => {
  //     this.elog.info(`autoUpdater(): received event 'update-available':\n`, ev, `\n`, info);
  //     Log.l(`autoUpdater(): received event 'update-available':\n`, ev, `\n`, info);
  //     this.sendStatusToWindow('Update available.');
  //   });
  //   this.autoUpdater.on('error', (ev, err) => {
  //     this.elog.info(`autoUpdater(): received event 'error':\n`, err);
  //     Log.l(`autoUpdater(): received event 'error':\n`, err);
  //     this.sendStatusToWindow('Error in auto-updater.');

  //   });
  //   this.autoUpdater.on('download-progress', (ev, progressObj) => {
  //     this.elog.info(`autoUpdater(): received event 'progress':\n`, progressObj);
  //     Log.l(`autoUpdater(): received event 'progress':\n`, progressObj);
  //     this.sendStatusToWindow('Download progress...');
  //   });

  //   this.autoUpdater.on('update-downloaded', (ev, info) => {
  //     this.elog.info(`autoUpdater(): received event 'update-downloaded':\n`, ev, `\n`, info);
  //     Log.l(`autoUpdater(): received event 'update-downloaded':\n`, ev, `\n`, info);
  //     Log.l(`autoUpdater(): received event 'update-downloaded':\n`, ev, `\n`, info);
  //     // Wait 5 seconds, then quit and install
  //     // In your application, you don't need to wait 5 seconds.
  //     // You could call autoUpdater.quitAndInstall(); immediately
  //     // let releaseNotes = info.releaseNotes || "None";
  //     // let releaseName = info.releaseName || "None";
  //     let msg = info && info.releaseNotes ? info.releaseNotes : "Updated version available";
  //     const dialogOpts = {
  //       type: 'info',
  //       buttons: ['Restart', 'Later'],
  //       title: 'Application Update',
  //       // message: process.platform === 'win32' ? releaseNotes : releaseName,
  //       // message: process.platform === 'win32' ? info.version : "new",
  //       message: msg,
  //       detail: 'A new version has been downloaded. Restart the application to install the update.'
  //     };

  //     this.dialog.showMessageBox(dialogOpts, (response) => {
  //       if(response === 0) {
  //         this.autoUpdater.quitAndInstall();
  //       }
  //     });
  //   });

  //   this.autoUpdater.on('update-not-available', (ev, info) => {
  //     this.elog.info(`autoUpdater(): received event 'update-not-available':\n`, ev, `\n`, info);
  //     Log.l(`autoUpdater(): received event 'update-not-available':\n`, ev, `\n`, info);
  //     this.sendStatusToWindow('Update not available.');
  //     // createWindow();
  //   });
  // }

  public async checkForUpdate() {
    try {
      Log.l(`checkForUpdate(): Now sending 'manual-check-update' event to main Electron process via IPC...`)
      // this.notify.addInfo('Checking', `Checking if update exists...`, 3000);
      this.ipc.send('manual-check-update');
      // this.ipc.on('no-update-available', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'no-update-available' message. Event:\n`, event);
      //   this.notify.addInfo('NO UPDATE', "No update is available at this time.", 3000);
      // });
      // this.ipc.on('update-server-error', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-server-error' message. Event:\n`, event);
      //   this.notify.addError('ERROR', "The update server is probably not running.", 3000);
      // });
      // this.ipc.on('update-available', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-available' message. Event:\n`, event);
      //   this.notify.addInfo("Auto-Update", `Update available!`, 3000);
      // });
      // this.ipc.on('update-downloading', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-downloading' message. Event:\n`, event);
      //   this.notify.addInfo("Auto-Update", `Update downloading...`, 3000);
      // });
      // this.ipc.on('update-download-progress', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-download-progress' message. Event:\n`, event);
      //   // this.notify.addInfo("Auto-Update", `Update downloading...`, 3000);
      // });
      // this.ipc.on('update-not-downloaded', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-not-downloaded' message. Event:\n`, event);
      //   this.notify.addInfo("Auto-Update", `Update not downloaded.`, 3000);
      // });
      // this.ipc.on('update-not-available', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-not-available' message. Event:\n`, event);
      //   this.notify.addInfo("Auto-Update", `No update available.`, 3000);
      // });
      // this.ipc.on('done-checking-update', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'done-checking-update' message. Event:\n`, event);
      //   this.notify.addInfo("Auto-Update", `Done checking for update.`, 3000);
      // });
      // this.ipc.on('update-server-error', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-server-error' message. Event:\n`, event);
      //   this.notify.addError("Auto-Update", `Update error: server offline?`, 3000);
      // });
      // this.ipc.on('update-check-error', (event) => {
      //   Log.l(`checkForUpdate(): Received IPC 'update-check-error' message. Event:\n`, event);
      //   this.notify.addInfo("Auto-Update", `There was an error checking for the update.`, 3000);
      // });
      return true;
    } catch(err) {
      Log.l(`(): Error checking for update!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error checking for update: ${err.message}`, 4000);
      // throw err;
    }
  }

  public ipcSend(channel:string, contents?:any) {
    if(this.ipc) {
      if(contents) {
        this.ipc.send(channel, contents);
      } else {
        this.ipc.send(channel);
      }
    } else {
      Log.w(`ipcSend(): IPC for electron was not found!`);
    }
  }

  public async exitApp():Promise<any> {
    try {
      Log.l(`exitApp(): Attempting to exit app...`);
      this.ipcSend('exit-app');
      // let res:any = await someFunctionThatReturnsAPromise();
      // Additional code
      // return res;
    } catch(err) {
      Log.l(`exitApp(): Error exiting app!`);
      Log.e(err);
      throw err;
    }
  }

}
