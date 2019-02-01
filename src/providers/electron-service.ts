import { app as electronApp, webFrame, dialog, BrowserWindow as browserwindow, BrowserView as browserview, remote, ipcRenderer, IpcRenderer } from 'electron';
import { globalShortcut  } from 'electron';
import * as electron from 'electron';
import * as WHATWG from 'whatwg-url';
// import * as Mousetrap from 'mousetrap';
// import * as NapaJS from 'napajs';
// declare var PDFWindow;

const os = require('os')                                        ;
// const childProc = require('child_process');
// const NapaJS = require('napajs');
// import * as diskusage from 'diskusage';

import windowStateKeeper from 'electron-window-state'      ;
// import { windowStateKeeper } from 'electron-window-state';
// import * as PDFWindow         from 'electron-pdf-window'        ;
import * as fs from 'graceful-fs';
import * as path from 'path';
// import searchInPage, {InPageSearch} from 'electron-in-page-search';
// import searchInPage, {InPageSearch} from './electron-search-service';
// import * as PDFWindow from '../lib/electron-pdf-window';
import { PDFWindow } from '../lib/electron-pdf-win';
import { Subscription        } from 'rxjs/Subscription'          ;
import { Subject             } from 'rxjs/Subject'               ;
import { Observable          } from 'rxjs/Observable'            ;
import { Injectable          } from '@angular/core'              ;
import { EventEmitter        } from '@angular/core'              ;
import { NgZone              } from '@angular/core'              ;
// import { ChangeDetectorRef   } from '@angular/core'              ;
import { Log, moment, Moment } from 'domain/onsitexdomain'       ;
import { OSData              } from './data-service'             ;
import { NotifyService       } from './notify-service'           ;
import { DispatchService     } from './dispatch-service'         ;

declare const window:any;

export type Menu = Electron.Menu;
export type MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
export type MenuItem = Electron.MenuItem;
export type WebContents = Electron.WebContents;
export type ElectronEvent = Electron.Event;
export type Dialog = Electron.Dialog;
export type IPCRenderer = Electron.IpcRenderer;
export type Remote = Electron.Remote;
export type BrowserWindow = Electron.BrowserWindow;
export type BrowserView = Electron.BrowserView;

export type DialogOptions = {
  type    ?: string,
  buttons ?: string[],
  title    : string,
  message  : string,
  detail  ?: string,
};

@Injectable()
export class ElectronService {
  public dbDir:string = "";
  public static searchActive:boolean = false;
  public get searchActive():boolean { return ElectronService.searchActive; };
  public set searchActive(val:boolean) { ElectronService.searchActive = val; };
  // public searchEvent = new EventEmitter<any>();
  public searchListeners:number = 0;
  public searchSubject:Subject<any>;
  public searchEvent:Observable<any>;
  public currentZoom:number = 0;
  // public menu:electron.Menu;
  public menu:any;
  public app:any;
  public electronapp:any = electronApp;
  public win:any;
  public windowState:any;
  public remote:Remote = remote;
  public browserView:any = browserview;
  public browserWindow:any = browserwindow;
  public printPreviewWindow:Electron.BrowserWindow;
  // public elog = electronlog;
  // public autoUpdater = electronAutoUpdater;
  // public autoUpdater:any;
  public dialog:Dialog = dialog;
  public ipc:IPCRenderer = ipcRenderer;
  public WHATWG    = WHATWG;
  public URL       = WHATWG.URL;
  public pdfWindow = PDFWindow;
  public fspath;
  public searcher;
  // public childproc = childProc;

  constructor(
    public zone           : NgZone            ,
    // public changeDetector : ChangeDetectorRef ,
    public data           : OSData            ,
    public notify         : NotifyService     ,
    public dispatch       : DispatchService   ,
  ) {
    window['onsiteelectronservice'] = this;
    window['oselectron'] = electron;
    window['WHATWG'] = WHATWG;
    // window['NapaJS'] = NapaJS;
    // window['PDFWindow'] = PDFWindow;
    this.subscribeConsole();
    this.app = { openPage: (pageName?:string) => {this.notify.addError("ERROR", `Error loading page '${pageName}'.`, 5000);}};
    this.searchSubject = new Subject<any>();
    this.searchEvent = this.searchSubject.asObservable();
    this.electronDBInit();
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

  public electronDBInit() {
    let currentDir:string = path.join(".");
    let dataDir:string = this.remote.app.getPath('userData');
    let dbDir:string = path.join(dataDir, "db");
    let sep:string = path && path.sep ? path.sep : "/";
    this.dbDir = dbDir + sep;
    let db:string = this.dbDir;
    Log.l(`ElectronService.electronDBInit(): Creating '${db}' directory if necessary ...`);
    try {
      fs.accessSync(db);
      Log.l(`ElectronService.electronDBInit(): '${db}' directory existed already. We coo'.`);
    } catch(err) {
      try {
        Log.l(`ElectronService.electronDBInit(): Could not access '${db}' directory, trying to create it ...`);
        fs.mkdirSync(db);
      } catch(err2) {
        Log.l(`ElectronService.electronDBInit(): Error creating '${db}' directory!`);
        Log.e(err2);
      }
    }
  }

  public getDataDir():string {
    return this.remote.app.getPath('userData');
  }

  public getDataDirAsPrefix():string {
    let datadir:string = this.remote.app.getPath('userData');
    let sep:string = path && path.sep ? path.sep : "/";
    return datadir + sep;
  }

  public getDBDirAsPrefix():string {
    let dbdir:string = this.dbDir;
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
    let datadir:string = this.getDataDir();
    let dbdir:string = path.join(datadir, "db");
    let fullfile:string = path.normalize(path.join(dbdir, filename));
    return fullfile;
  }

  public setApp(component:any) {
    Log.l("setApp(): Now setting app to:\n", component);
    this.app = component;
    this.fspath = path;
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
          {role: 'copy'},
          {role: 'paste'},
          {role: 'pasteandmatchstyle'},
          {role: 'selectall'},
          { type: 'separator' },
          // { label: 'Find…', accelerator: 'CommandOrControl+G', click: () => { this.pageSearch(); } },
          { label: 'Find…', accelerator: 'CommandOrControl+G', click: () => { this.dispatch.triggerAppEvent('find-in-page'); } },
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
    Log.l("createMenu(): Resulting template is:\n", template);
    this.menu = remote.Menu.buildFromTemplate(template);
    Log.l("createMenu(): Resulting menu is:\n", this.menu);
    remote.Menu.setApplicationMenu(this.menu);
    // electron.Menu.setApplicationMenu(this.menu);
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
    Log.l("createStartupMenus(): Resulting template is:\n", template);
    this.menu = remote.Menu.buildFromTemplate(template);
    Log.l("createStartupMenus(): Resulting menu is:\n", this.menu);
    remote.Menu.setApplicationMenu(this.menu);
    // electron.Menu.setApplicationMenu(this.menu);
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

  public async showInfo(title:string, message:string, detail?:string):Promise<any> {
    try {
      let res:any = await this.showElectronAlert('info', title, message, detail);
      return res;
    } catch(err) {
      Log.l(`showInfo(): Error showing Electron info dialog.`);
      Log.e(err);
      this.notify.addError('DIALOG ERROR', `Error showing info dialog: ${err.message}`, 4000);
      // throw new Error(err);
    }
  }

  public async showWarning(title:string, message:string, detail?:string):Promise<any> {
    try {
      let res:any = await this.showElectronAlert('warning', title, message, detail);
      return res;
    } catch(err) {
      Log.l(`showInfo(): Error showing Electron warning dialog.`);
      Log.e(err);
      this.notify.addError('DIALOG ERROR', `Error showing warning dialog: ${err.message}`, 4000);
      // throw new Error(err);
    }
  }

  public showWarn = this.showWarning;

  public async showError(title:string, message:string, detail?:string):Promise<any> {
    try {
      let res:any = await this.showElectronAlert('error', title, message, detail);
      return res;
    } catch(err) {
      Log.l(`showInfo(): Error showing Electron error dialog.`);
      Log.e(err);
      this.notify.addError('DIALOG ERROR', `Error showing error dialog: ${err.message}`, 4000);
      // throw new Error(err);
    }
  }

  public async showElectronAlert(type:string, title:string, message:string, detail?:string):Promise<any> {
    try {
      let opts:DialogOptions = {
        type: 'info',
        title: title,
        message: message,
      };
      if(detail) {
        opts.detail = detail;
      }
      let response:any = await this.showElectronDialog(opts);
      return response;
    } catch(err) {
      Log.l(`showElectronAlert(): Error showing alert.`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public getElectronDialogResponse(timeout?:number):Promise<any> {
    return new Promise((resolve,reject) => {
      let ms:number = timeout || 30000;
      let timeoutHandle = setTimeout(() => {
        Log.l(`getElectronDialogResponse(): Timeout after ${ms}ms and no response from dialog.`);
        reject(new Error("Timeout waiting for dialog response."));
      }, ms);
      Log.l(`getElectronDialogResponse(): waiting ${ms}ms for a response...`);
      this.ipc.on('dialog-response', (event, response) => {
        clearTimeout(timeoutHandle);
        Log.l(`getEletronDialogResponse(): received a response:\n`, response);
        resolve(response);
      });
    });
  }

  public async showElectronDialog(dialogOptions:DialogOptions, timeout?:number):Promise<any> {
    try {
      this.ipc.send('dialog-show', dialogOptions);
      let response:any = await this.getElectronDialogResponse(timeout);
      Log.l(`showElectronDialog(): Got response:\n`, response);
      return response;
    } catch(err) {
      Log.l(`showElectronDialog(): Error showing Electron dialog box!`);
      Log.e(err);
      throw new Error(err);
    }
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

  public showAppOptions(value:string) {
    this.zone.run(() => {
      this.dispatch.showGlobalOptions(value);
    });
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

  public showPrintPreview({loadDevTools = false, marginsType = 1, printBackground = true, pageSize = 'Letter', printSelectionOnly = false, landscape = false}) {
    let win = remote.getCurrentWindow();
    let tempDir = remote.app.getPath('temp');
    // let marginType:number = 1, loadDevTools:boolean = false;
    let now = moment();
    // let name = `printpreview_${now.format('x')}.pdf`;
    let timestamp = now.format('x');
    let name = `printpreview_${timestamp}.pdf`;
    let outfile = path.join(tempDir, name);
    win.webContents.printToPDF({marginsType: marginsType, printBackground: printBackground, pageSize: pageSize, printSelectionOnly: printSelectionOnly, landscape: landscape}, (error, data) => {
      if(error) {
        Log.l("showPrintPreview(): Error!");
        Log.e(error);
        // throw error;
      } else {
        window['onsitePDFdata'] = data;
        fs.writeFile(outfile, data, (err) => {
          if(err) {
            Log.l("showPrintPreview(): Error saving PDF!");
            Log.e(err);
          } else {
            Log.l(`showPrintPreview(): PDF saved successfully as '${outfile}', attempting to load window...`);
            let pdfOptions:any = {
              url: outfile,
              loadDevTools: loadDevTools,
            };
            // this.ipc.send('show-pdf', pdfOptions);
            let pdfWin:BrowserWindow = this.createPDFWindow(outfile, loadDevTools);
            window['onsitenewpdfwindow'] = pdfWin;

            // Emitted when the window is closed.
            pdfWin.on('closed', () => {
              // Dereference the window object, usually you would store windows
              // in an array if your app supports multi windows, this is the time
              // when you should delete the corresponding element.
              // sendEventToWindow('pdf-window-closed');
              Log.l(`createPDFWindow(): PDF window closed.`);
              pdfWin = null;
              fs.unlink(outfile, (err) => {
                if(err) {
                  Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
                  Log.e(err);
                } else {
                  Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
                }
              });
            });

            // this.ipc.on('pdf-window-closed', (event, options) => {
            //   Log.l(`PDF Window closed.`);
            //   window['onsitenewpdfwindow'] = null;
            //   fs.unlink(outfile, (err) => {
            //     if(err) {
            //       Log.l(`showPrintPreview(): Error deleting print preview PDF '${outfile}'!`);
            //       Log.e(err);
            //     } else {
            //       Log.l(`showPrintPreview(): Successfully deleted print preview PDF '${outfile}'!`)
            //     }
            //   });
            // });
                    // let pdfWin = new PDFWindow({width: 1024, height: 768, parent: win});
            // pdfWin.loadURL(outfile);
          }
        })
      }
    });
    // let devTools:boolean = typeof evt === 'boolean' ? evt : false;
    // let pdfWin = new remote.BrowserWindow({width: 1024, height: 768, parent: win});

    // let pdfWin = new PDFWindow({width: 1024, height: 768, parent: win});
    // pdfWindow.addSupport(pdfWin);
    // pdfWin.loadURL(outfile);

    // let pdfWin = new remote.BrowserWindow({width: 1024, height: 768, parent: win});
  }

  public createPDFWindow(pdfFile:string, loadDevTools:boolean):BrowserWindow {
    let win:BrowserWindow = this.remote.getCurrentWindow();
    let pdfWin:BrowserWindow;
    if(!win) {
      Log.w(`createPDFWindow() has no parent window! Can't create it.`);
      return pdfWin;
    } else {
      let winWidth:number = win.getBounds().width;
      let winHeight:number = win.getBounds().height;
      let width:number = winWidth >= 1124 ? winWidth - 100 : 1024;
      let height:number = winHeight >= 868 ? winHeight - 100 : 768;
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
      this.printPreviewWindow = pdfWin;
      // pdfWin = new PDFWindow(pdfWindowOptions);

      let parsedURL = WHATWG.parseURL(pdfFile);
      let pdfURL = pdfFile;
      if(!(parsedURL && parsedURL.scheme && parsedURL.scheme === 'file')) {
        pdfURL = new URL(`file:///${pdfFile}`).href;
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
      return pdfWin;
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
      // throw new Error(err);
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
      throw new Error(err);
    }
  }

}
