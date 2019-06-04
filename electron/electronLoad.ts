let HARDCLOSE:boolean = true;
// import { sprintf } from 'sprintf-js';
const sprintf:(...args) => string = require('sprintf-js').sprintf;
import { app, remote, BrowserWindow, dialog, ipcMain, nativeImage, globalShortcut, BrowserWindowConstructorOptions, MessageBoxOptions } from 'electron';
import windowStateKeeper from 'electron-window-state';
import * as moment from 'moment';
import { autoUpdater } from 'electron-updater';
import { UpdateCheckResult } from 'electron-updater';
import { UpdateDownloadedEvent } from 'electron-updater';
// import { CancellationToken, PackageFileInfo, ProgressInfo, UpdateFileInfo, UpdateInfo } from "builder-util-runtime";
import { ProgressInfo } from "builder-util-runtime";
import { ReleaseNoteInfo } from "builder-util-runtime";
import * as path from 'path';
import * as fs from 'graceful-fs';
import * as process from 'process';
import * as logger from 'electron-log';

// @ts-ignore
const packageJson:any = require('../package.json');
let packageVersion:string = packageJson.version;

export class WindowDimensions {
  public width  : number = 0;
  public height : number = 0;
}

export type DialogType = "none" | "info" | "error" |"question" | "warning";
export interface DialogOptions {
  type    ?: DialogType;
  buttons ?: string[];
  title   ?: string;
  message ?: string;
  detail  ?: string;
  timeout ?: number;
};

export interface BrowserWindowOptions extends Electron.BrowserWindowConstructorOptions {
  experimentalFeatures ?: boolean;
  experimentalCanvasFeatures ? : boolean;
}


let windowTitle:string = `OnSiteConsoleX ${packageVersion}`;

let testMode:boolean = false;

// logger.transports.file.level = 'debug';
logger.transports.file.level = 'silly';
logger.catchErrors({showDialog:true});
autoUpdater.logger = logger;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
const updateWindowTimeout:number = 3000;

// log.transports.rendererConsole.level = 'verbose';

process.on('warning', e => console.warn(e.stack));

const conlog = function(...args) {
  // let args:string[] = Array.from(arguments);
  logger.info(...args);
  sendEventToWindow('log-from-app', args);
  // if(con) {
  //   con.log(args);
  // }
};

const conerr = function(...args) {
  logger.error(...args);
};

const log = {
  info: conlog,
  err: conerr,
};

console.log(`Electron startup: file base path is: '${__dirname}'`);

// const icon_file_name     : string = '/../www/onsitexconsole.ico';
const icon_file_name     : string = 'onsitexconsole.ico' ;
const splash_screen_name : string = 'splash-screen.html' ;
const index_file_name    : string = 'index.html'         ;
const test_file_name     : string = 'test.html'          ;
const update_file_name   : string = 'version.html'       ;

function getWWWPath(file_name:string):string {
  let filename:string = file_name ? file_name : icon_file_name;
  // console.log(`getWWWPath(): Checking for '${filename}' in path '${__dirname}'`);
  let relative_path:string = filename;
  let first:string = filename.slice(0,1);
  if(first !== '/' && first !== '.') {
    relative_path = path.join('..', 'www', filename);
  }
  // let file_path:string = path.join(__dirname, relative_path);
  console.log(`getWWWPath(): Path is '${relative_path}'`);
  return relative_path;
  // } else {
  //   return filename;
  // }
}

function getFilePath(filename:string):string {
  let path1:string = __dirname;
  if(filename.indexOf(path1) > -1 || filename.indexOf('app.asar') > -1) {
    return filename;
  } else {
    let fullPath:string = path.join(__dirname, filename);
    return fullPath;
  }
}

function getFilePathAsURL(filename:string):string {
  try {
    let fullPath:string = getFilePath(filename);
    console.log(`getFilePathAsURL(): Now trying to get file path for filename '${filename}', full path '${fullPath}'`);
    if(fullPath.slice(0, 7) !== 'file://') {
      fullPath = "file://" + fullPath;
    }
    // let parsedURL:string = WHATWG.parseURL(fullPath);
    let parsedURL:URL = new URL(fullPath);
    if(!(parsedURL && parsedURL.protocol)) {
      console.log(`getFilePathAsURL(): ERROR! could not parse full path as URL!`);
      return null;
    } else {
      // let fileURL:string = parsedURL;
      let fileURL:string = fullPath;
      if(parsedURL.protocol === 'file:') {
        let newURL:URL = new URL(`${fullPath}`);
        fileURL = newURL.href;
      } else {
        let prefix:string = "file://";
        if(fullPath.slice(0,1) !== '/') {
          prefix += "/";
        }
        let newURL:URL = new URL(`${prefix}${fullPath}`);
        fileURL = newURL.href;
      }
      return fileURL;
    }
  } catch(err) {
    logger.info(`getFilePathAsURL(): Error getting URL from '${filename}'`);
    logger.error(err);
    // throw new Error(err);
  }
}

// const icon_name:string = '/../www/onsitexconsole.ico';
const icon_name:string = getWWWPath(icon_file_name);
const icon_path:string = getFilePath(icon_name);
// console.log(`ICON PATH: '${icon_path}'`);
// const icon_url :string = getFilePathAsURL(icon_name);
// logger.info(`app icon path is: '${icon_path}'\nand icon URL is: '${icon_url}'`);

const app_icon:Electron.NativeImage = nativeImage.createFromPath(icon_path);

// let con, win, winUpdate, startupWin, pdfWin, mainWindowState;
let win:BrowserWindow, winUpdate:BrowserWindow, splashWindow:BrowserWindow, randomWindows:BrowserWindow[] = [];
let mainWindowState:windowStateKeeper.State;

function createWindow():Electron.BrowserWindow {

  mainWindowState = windowStateKeeper({
    // defaultWidth: 1600,
    // defaultHeight: 900,
    defaultWidth: 1024,
    defaultHeight: 768,
    maximize: false,
    fullScreen: false,
  });

  let defaultWindowOptions:BrowserWindowOptions = {
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    // width: 1600,
    // height: 900,
    // width: 1024,
    // height: 768,
    title: windowTitle,
    frame: true,
    kiosk: false,
    experimentalFeatures: true,
    experimentalCanvasFeatures: true,
    show: false,
    icon: app_icon,
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8',
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  };

  // Create the window using the state information
  win = new BrowserWindow(defaultWindowOptions);

  mainWindowState.manage(win);
  win.setTitle(windowTitle);
  win.once('ready-to-show', () => {

    log.info(`MAIN WINDOW: 'ready-to-show' event fired`);
    win.setTitle(windowTitle);
    closeSplashWindow();
    // win.maximize();
    win.show();
    // Open the DevTools.
    if(loadDevTools) {
      log.info("MAIN WINDOW: Developer tools loading.");
      win.webContents.openDevTools();
    } else {
      log.info("MAIN WINDOW: Developer tools not being loaded.");
      if(win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      }
    }
  });

  win.on('page-title-updated', (evt:Electron.Event, title:string) => {
    evt.preventDefault();
    log.info("MAIN WINDOW: Title was changed to:", title);
  });


  // win = new PDFWindow({
  //   'x': mainWindowState.x,
  //   'y': mainWindowState.y,
  //   'width': mainWindowState.width,
  //   'height': mainWindowState.height
  // });

  // PDFWindow.addSupport(win);

  // Register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  // var url = 'file://' + __dirname + '/../www/index.html';
  let index_location:string = getWWWPath(index_file_name);
  let url:string = getFilePathAsURL(index_location);
  let Args:string[] = process.argv.slice(1);
  // let loadDevTools:boolean = false, unFullScreen:boolean = false;
  let loadDevTools:boolean = false;
  let unFullScreen:boolean = false;
  for(let val of Args) {
    let arg:string = val.toLowerCase();
    if(arg === "test") {
      log.info("Starting in test mode...");
      url = 'http://localhost:8110';
      loadDevTools = true;
      testMode = true;
    }
    if(arg.indexOf('dev') > -1) {
      log.info("Caught developer flag, turning devtools on.");
      loadDevTools = true;
      testMode = true;
    }
    unFullScreen = win.isFullScreen();
    if(arg === "sizeReset" && unFullScreen) {
      // unFullScreen = true;
      win.setFullScreen(false);
    }
  }
  // Args.forEach(function (val) {
  // });
  // and load the index.html of the app.
  win.loadURL(url);
  // windowPlus.loadURL(win, url);

  log.info("createWindow(): Finished");

  // Emitted when the window is closed.
  win.on('close', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    log.info(`MAIN WINDOW: 'close' event received.`);
    win = null;
    closeAllRandomWindows();
    closeUpdateWindow();
    closeSplashWindow();
  });
  return win;
}

function createSplashWindow(loadDevTools?:boolean, dimensions?:WindowDimensions):BrowserWindow {
  let width:number  = 500;
  let height:number = 500;
  if(dimensions != undefined && typeof dimensions.width === 'number' && typeof dimensions.height === 'number') {
    width = dimensions.width;
    height = dimensions.height;
  }
  splashWindow = new BrowserWindow({
    width       : width  ,
    height      : height ,
    center      : true   ,
    resizable   : false  ,
    movable     : true   ,
    alwaysOnTop : true   ,
    skipTaskbar : true   ,
    frame       : false  ,
    transparent : true   ,
  });
  // splashWindow.loadURL(getFilePathAsURL('/../www/splash-screen.html'));
  let splash_location:string = getWWWPath(splash_screen_name);
  let splashURL:string = getFilePathAsURL(splash_location);
  let appVersion:string = app.getVersion();
  let url:string = `${splashURL}#${appVersion}`;
  splashWindow.loadURL(url);
  if(loadDevTools) {
    splashWindow.webContents.openDevTools();
  }
  return splashWindow;
}

function sendStatusToWindow(evt:string) {
  log.info(`Sending status to winUpdate: '${evt}'`);
  if(winUpdate && winUpdate.webContents) {
    winUpdate.webContents.send('message', evt);
  }
}

function sendEventToUpdateWindow(channel:string, object?:any) {
  if(winUpdate && winUpdate.webContents) {
    let strObj:string = JSON.stringify(object);
    log.info(`IPC Sending event to winUpdate: '${channel}': `, strObj);
    winUpdate.webContents.send(channel, object);
  } else {
    log.info(`IPC No update window, waiting 10 seconds to send event to winUpdate: '${channel}':\n`, object);
    setTimeout(() => {
      if(winUpdate && winUpdate.webContents) {
        winUpdate.webContents.send(channel, object);
      }
    }, 10000);
  }
}

function sendEventToWindow(channel:string, event?:any) {
  if(channel !== 'log-from-app') {
    logger.info(`ELECTRON MAIN: sending '${channel}' event to window`);
  }
  if(win && win.webContents) {
    win.webContents.send(channel, event);
  }
}


function createUpdateStatusWindow(updateVersion:string, showDevTools:boolean) {
  winUpdate = new BrowserWindow({
    width  : 400  ,
    height : 400  ,
    frame  : true ,
    parent : win  ,
    show   : false,
  });
  winUpdate.on('closed', () => {
    winUpdate = null;
  });
  let devTools:boolean = testMode ? true : showDevTools ? true : false;
  let currentVersion:string = app.getVersion();
  let newVersion:string = updateVersion ? updateVersion : currentVersion;
  // let newVersion:string     = app.getVersion();
  let update_location:string = getWWWPath(update_file_name);
  let updateURL:string = getFilePathAsURL(update_location);
  let url:string = `${updateURL}#${currentVersion}#${newVersion}`;
  // let url:string = `file://${__dirname}/../www/version.html#${currentVersion}#${newVersion}`;
  log.info(`createUpdateStatusWindow(): Loading with url '${url}' ...`);
  winUpdate.loadURL(url);
  winUpdate.once('ready-to-show', () => {
    winUpdate.show();
    // createUpdateStatusMenu();
    // winUpdate.setMenu(null);
    // winUpdate.setTitle(`DOWNLOADING UPDATE`);
    if(devTools) {
      winUpdate.webContents.openDevTools();
    }
    // setTimeout(() => {
    //   winUpdate.setMenu(null);
    // }, 500);
  });
  return winUpdate;
}

function closeWindow() {
  if(win) {
    log.info(`closeWindow(): Closing the main window.`);
    let closeWin:BrowserWindow = win;
    if(HARDCLOSE) {
      closeWin.destroy();
    } else {
      closeWin.close();
    }
    // win.destroy();
    win = null;
  } else {
    log.info(`closeWindow(): Main window already closed.`);
  }
}

function closeSplashWindow() {
  if(splashWindow) {
    log.info(`closeSplashWindow(): Closing splash window`);
    let closeWin:BrowserWindow = splashWindow;
    if(HARDCLOSE) {
      closeWin.destroy();
    } else {
      closeWin.close();
    }
    // splashWindow.destroy();
    splashWindow = null;
  } else {
    log.info(`closeSplashWindow(): Splash window already closed`);
  }
}

function closeUpdateWindow() {
  if(winUpdate) {
    log.info(`closeUpdateWindow(): Closing the update window.`);
    let closeWin:BrowserWindow = winUpdate;
    if(HARDCLOSE) {
      closeWin.destroy();
    } else {
      closeWin.close();
    }
    // winUpdate.close();
    // winUpdate.destroy();
    winUpdate = null;
  } else {
    log.info(`closeUpdateWindow(): Update window did not exist.`);
  }
}

function createRandomWindow():BrowserWindow {
  // log.info(`createRandomWindow(): `);
  let opts:BrowserWindowConstructorOptions = {
    width  : 400  ,
    height : 400  ,
    frame  : true ,
    show   : true,
  };
  if(win) {
    opts.parent = win;
  }
  
  let test_location:string = getWWWPath(test_file_name);
  let url:string = getFilePathAsURL(test_location);
  let count:number = randomWindows.length;
  let title:string = sprintf("randomwindow%03d", count + 1);
  if(count > 0) {
    let lastWin:BrowserWindow = randomWindows[count - 1];
    let pos:number[] = lastWin.getPosition();
    let x:number = pos[0];
    let y:number = pos[1];
    opts.x = x + 30;
    opts.y = y + 30;
  }
  let randomWin:BrowserWindow = new BrowserWindow(opts);
  randomWin.setTitle(title);
  randomWindows.push(randomWin);
  let newCount:number = randomWindows.length;
  let id:number = randomWin.id;
  log.info(`createRandomWindow(): Created random window with title '${title}', ID is '${id}', there are now ${newCount} random windows`);
  randomWin.on('page-title-updated', (evt:Electron.Event, title:string) => {
    evt.preventDefault();
    log.info(`RandomWindow(${id}): Window title updated to:`, title);
  });
  randomWin.on('close', (evt:Electron.Event) => {
    evt.preventDefault();
    let thiswin:BrowserWindow = evt && evt.sender && evt.sender instanceof BrowserWindow ? evt.sender : randomWin;
    // let wintitle:string = randomWin.getTitle();

    let id:number = thiswin.id;
    // log.info(`RandomWindow: got 'close' event for window '${id}': `, event);
    log.info(`RandomWindow: got 'close' event for window '${id}' …`);
    // closeRandomWindow(wintitle);
    closeRandomWindow(randomWin);
    // let idx:number = randomWindows.findIndex(a => {
    //   // return a === this;
    //   // return a.getTitle() === wintitle;
    //   return a === randomWin;
    // });
    // if(idx > -1) {
    //   randomWindows.splice(idx, 1);
    //   let count:number = randomWindows.length;
    //   log.info(`RandomWindow: '${wintitle}' closed and removed from array, ${count} random windows left.`);
    // } else {
    //   log.info(`RandomWindow: '${wintitle}' could not be found to close`);
    // }
  });
  randomWin.loadURL(url);
  return randomWin;
}

function hardClose(browserwindow:BrowserWindow) {
  if(browserwindow instanceof BrowserWindow && !browserwindow.isDestroyed()) {
    let id:number = browserwindow.id;
    log.info(`hardClose(): closing window '${id}' …`);
    if(HARDCLOSE) {
      browserwindow.destroy();
    } else {
      browserwindow.close();
    }
  } else {
    log.info(`hardClose(): parameter was not an undestroyed BrowserWindow`);
  }
}

function closeRandomWindow(randomWin:BrowserWindow) {
  // log.info(`closeRandomWindow(): `);
  // let randomWin:Electron.BrowserWindow;
  // let title:string;
  // let winID:number;
  // let count:number = randomWindows.length;
  if(randomWin instanceof BrowserWindow) {
    let count:number = randomWindows.length;
    let id:number = randomWin.id;
    log.info(`closeRandomWindow(): Called for window ID '${id}' …`);
    let idx:number = randomWindows.findIndex((a:BrowserWindow) => {
      // return a === randomWin || a.id === id || (a as any).title === id;
      return a === randomWin || a.id === id || (typeof a.getTitle === 'function' && a.getTitle() == String(id));
    });
    let winref:BrowserWindow = randomWindows.splice(idx, 1)[0];
    hardClose(randomWin);
    if(randomWin !== winref) {
      hardClose(winref);
    }
    let newCount:number = randomWindows.length;
    log.info(`closeRandomWindow(): closed random window ID '${id}', there are ${newCount} random windows left`);
  } else {
    log.info(`closeRandomWindow(): parameter was not a BrowserWindow`);
  }
}

function closeRandomWindowWithID(id:number|string) {
  let winID:number = Number(id);
  log.info(`closeRandomWindowWithID(${winID}): called …`);
  if(!isNaN(winID)) {
    let randomWin:BrowserWindow = randomWindows.find(a => {
      return a.id === winID;
    });
    if(randomWin) {
      closeRandomWindow(randomWin);
      return true;
    }
  }
  log.info(`closeRandomWindowWithID(): failed to close random window '${id}'`);
  return false;
}

function closeRandomWindowLast() {
  let count:number = randomWindows.length;
  // log.info(`closeRandomWindowLast(): `);
  if(count > 0) {
    let randomWindow:BrowserWindow = randomWindows.pop();
    closeRandomWindow(randomWindow);
  } else {
    log.info(`closeRandomWindowLast(): No random windows exist`);
  }
}

function closeAllRandomWindows() {
  // let randomWin:BrowserWindow;
  if(randomWindows && randomWindows.length) {
    let count:number = randomWindows.length;
    log.info(`closeAllRandomWindows(): closing ${count} random windows …`);
    for(let i = count - 1; i >= 0; i--) {
      let randomWin:BrowserWindow = randomWindows.pop();
      // let id:string = randomWin.getTitle();
      closeRandomWindow(randomWin);
      // log.info(`closeAllRandomWindows(): closing random window '${id}' …`);
      // randomWin.close();
    }
    log.info(`closeAllRandomWindows(): done closing all random windows`);
  } else {
    log.info(`closeAllRandomWindows(): No random windows to close`);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info("Electron: got app ready event!");
  createSplashWindow();
  setTimeout(createWindow, 1000);
  // globalShortcut.register('CmdOrCtrl+F', () => {
  //   if(win && win.webContents && win.isFocused()) {
  //     win.webContents.send('shortcut-search', null);
  //   }
  // });

  // createWindow();
  // // if(!winUpdate) {
  // //   createDefaultWindow();
  // // }
  // startupWin = new BrowserWindow({width: 800, height: 600, frame: false})
  // startupWin.on('closed', () => {
  //   startupWin = null;
  // });
  // startupWin.loadURL(`file://${__dirname}/../www/startup.html`)
  // autoUpdater.checkForUpdatesAndNotify().then((res) => {
  //   log.info("Done checking for updates, now creating window.");
  //   if(startupWin) {
  //     startupWin.close();
  //   }
  //   createWindow();
  // }).catch(err => {
  //   log.info("Error checking for update, asking if should continue.");
  //   const dialogOpts:MessageBoxOptions = {
  //     type: 'info',
  //     buttons: ['OK'],
  //     title: 'Error',
  //     message: "Error contacting update server",
  //     detail: 'An error was encountered checking for app update. The server updates.sesa.us is probably offline.'
  //   };

  //   dialog.showMessageBox(dialogOpts, (response) => {
  //     createWindow();
  //   });
  // });
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  log.info(`MAIN APP: Got 'window-all-closed' event. Quitting.`);
  // app.quit();
  quitApp();
  // if(process.platform !== 'darwin') {
  //   app.quit();
  // }
});
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if(startupWin) {
  //   startupWin.close();
  // }
  if (win === null) {
    createWindow();
  }
});



autoUpdater.on('checking-for-update', () => {
  log.info(`autoUpdater(): received event 'checking-for-update'.`);
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  log.info(`autoUpdater(): received event 'update-available':\n`, JSON.stringify(info));
  sendEventToWindow('update-available');
  let currentVersion:string = app.getVersion();
  let newVersion:string = info.version;
  let message:string = `Found update from ${currentVersion} to ${newVersion}. Do you want to update now?`;
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: message,
    buttons: ['Yes', 'No']
  }, (buttonIndex:number, checked?:boolean) => {
    if (buttonIndex === 0) {
      if(!winUpdate) {
        createUpdateStatusWindow(newVersion, testMode);
      }
      sendStatusToWindow('Begining download of update...');
      sendEventToWindow('update-downloading');
      autoUpdater.downloadUpdate();
    } else {
      // if(updater && typeof updater['enabled'] !== 'undefined') {
      //   updater.enabled = true;
      //   updater = null;
      // }
      sendStatusToWindow('Not downloading update.');
      sendEventToWindow('update-not-downloaded');
      setTimeout(() => {
        closeUpdateWindow();
      }, updateWindowTimeout);
    }
  });
});

autoUpdater.on('error', (ev:Electron.Event, err:Error) => {
  if(err && err.message) {
    log.info(`autoUpdater(): received event 'error':`, err.message);
  }
  sendStatusToWindow('Error while running updater!');
  sendEventToWindow('update-error-event', err);
  sendEventToUpdateWindow('error-message', err);
});

autoUpdater.on('download-progress', (progress:ProgressInfo) => {
  log.info(`autoUpdater(): received event 'progress':`, JSON.stringify(progress));
  if(progress && progress.bytesPerSecond) {
    // let log_message:string = "Download speed: " + progressObj.bytesPerSecond;
    // log_message += ' - Downloaded ' + progressObj.percent + '%';
    // log_message += ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    // sendEventToWindow('update-download-progress', log_message);
    // sendStatusToWindow('progress-message', progressObj);
    sendEventToUpdateWindow('progress-message', progress);
  }
});

autoUpdater.on('update-downloaded', (ev:Electron.Event, info:UpdateDownloadedEvent) => {
  log.info(`autoUpdater(): received event 'update-downloaded':`, JSON.stringify(info));
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  // let releaseNotes:string = info.releaseNotes || "None";
  // let releaseName:string = info.releaseName || "None";

  // let msg:string = info && info.releaseNotes ? info.releaseNotes : "Updated version available";
  let msg:string = "Updated version available";
  if(info) {
    if(typeof info.releaseNotes === 'string') {
      msg = info.releaseNotes;
    } else if(Array.isArray(info.releaseNotes)) {
      let count:number = info.releaseNotes.length;
      let note:ReleaseNoteInfo = info.releaseNotes[count - 1];
      if(note.note) {
        msg = note.note;
      }
    }
  }
  sendStatusToWindow("Update downloaded");
  const dialogOpts:MessageBoxOptions = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: msg,
    detail: 'A new version has been downloaded. Restart now to install the update?'
  };

  dialog.showMessageBox(dialogOpts, (response:number, checked?:boolean) => {
    closeUpdateWindow();
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('update-not-available', (ev:Electron.Event, info:any) => {
  log.info(`autoUpdater(): received event 'update-not-available':\n`, ev, `\n`, info);
  // sendStatusToWindow('No new update available.');
  const dialogOpts:MessageBoxOptions = {
    type: 'info',
    'buttons': ['OK'],
    'title': 'Update not found',
    message: 'No update found.',
    detail: 'This version is up to date!',
  };
  dialog.showMessageBox(dialogOpts, (response:number, checked?:boolean) => {
    sendEventToWindow('update-not-available');
    log.info("autoUpdater(): dialogbox received back response:", response);
    setTimeout(() => {
      closeUpdateWindow();
    }, updateWindowTimeout);
  });
  // createWindow();
});

ipcMain.on('manual-check-update', (event:any) => {
  log.info(`IPC: Received manual-check-update event, event:`, event);
  autoUpdater.checkForUpdates().then((res:UpdateCheckResult) => {
    log.info("Done checking for updates. Result:");
    // let out:string = JSON.stringify(res);
    log.info(res);
    sendEventToWindow('done-checking-update');
    autoUpdater.signals.progress((info:ProgressInfo) => {
      if(info && info.bytesPerSecond) {
        // let log_message:string = "Download speed: " + progressObj.bytesPerSecond;
        // log_message += ' - Downloaded ' + progressObj.percent + '%';
        // log_message += ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        // sendEventToWindow('update-download-progress', log_message);
        // sendStatusToWindow('progress-message', progressObj);
        sendEventToUpdateWindow('progress-message', info);
      }
    });
  }).catch(err => {
    log.err("Error checking for update:", err);
    let errText:string = err && typeof err.message === 'string' ? err.message : err && typeof err.status === 'string' ? err.status : typeof err.status === 'number' ? err.status : typeof err === 'string' ? err : "UNKNOWN_ERROR (code -42)";
    let errString:string = `Error contacting update server: '${errText}'`;
    let errHTML:string = `An error was encountered checking for app update. The server http://updates.sesa.us is probably offline. The error is:\n\n'${errText}'`;
    sendStatusToWindow(errString);
    sendEventToWindow('update-server-error', err);
    const dialogOpts:MessageBoxOptions = {
      type: 'info',
      buttons: ['OK'],
      title: 'Error',
      message: "Error contacting update server",
      detail: errHTML,
    };
    dialog.showMessageBox(dialogOpts, (response:number, checked?:boolean) => {
      log.info(`Error dialog box closed, response:`, response);
      sendEventToWindow('update-check-error', err);
      setTimeout(() => {
        closeUpdateWindow();
      }, updateWindowTimeout);
    });
  });
});

function showAlert(title:string, text:string, detail:string) {
  const dialogOpts:MessageBoxOptions = {
    type: 'info',
    buttons: ['OK'],
    title: title,
    message: text,
  };
  if(typeof detail === 'string') {
    dialogOpts.detail = detail;
  }

  dialog.showMessageBox(win, dialogOpts, (response:number, checked?:boolean) => {
    log.info(`showAlert(): user responded '${response}'.`);
    return response;
  });
}

function showDialog(dialogOpts:MessageBoxOptions) {
  let opts:MessageBoxOptions = {
    title: "dialog",
    message: "default message",
  };
  let keys:string[] = Object.keys(dialogOpts);
  for(let key of keys) {
    if(dialogOpts[key] != undefined) {
      opts[key] = dialogOpts[key];
    }
  }
  if(!opts.type) {
    opts.type = 'info';
  }
  if(!opts.buttons) {
    opts.buttons = ['OK'];
  }
  if(!opts.message) {
    opts.message = "default message";
  }
  log.info(`showDialog(): Showing '${opts.type}' dialog box, title '${opts.title}'...`);
  dialog.showMessageBox(win, opts, (response:number, checked?:boolean) => {
    log.info(`showDialog(): user responded '${response}'.`);
    return response;
  });
}

function showDialogPromise(dialogOpts:MessageBoxOptions):Promise<number> {
  let opts:MessageBoxOptions = {
    title: "dialog",
    message: "default message",
  };
  let keys:string[] = Object.keys(dialogOpts);
  for(let key of keys) {
    if(dialogOpts[key] != undefined) {
      opts[key] = dialogOpts[key];
    }
  }
  if(!opts.type) {
    opts.type = 'info';
  }
  if(!opts.buttons) {
    opts.buttons = ['OK'];
  }
  if(!opts.message) {
    opts.message = "default message";
  }
  log.info(`showDialog(): Showing '${opts.type}' dialog box from app, title '${opts.title}'...`);
  return new Promise((resolve) => {
    try {
      dialog.showMessageBox(win, opts, (response:number, checked?:boolean) => {
        log.info(`showDialog(): user responded '${response}', sending response to app...`);
        resolve(response);
      });
    } catch(err) {
      log.err(`showDialog(): Error showing dialog message box!`);
      log.err(err);
      resolve(null);
    }
  });
}

ipcMain.on('dialog-show', (event:any, dialogOpts:MessageBoxOptions) => {
  let stringOpts:string = JSON.stringify(dialogOpts);
  log.info(`IPC: Got dialog request with options:\n`, stringOpts);
  showDialogPromise(dialogOpts).then((res:number) => {
    sendEventToWindow('dialog-response', res);
  });
// const genericOpts:MessageBoxOptions = {
  //   type: 'info',
  //   buttons: ['OK'],
  //   title: 'Dialog',
  //   message: 'Generic dialog box',
  //   detail: 'This is a generic dialog box.'
  // };
});

ipcMain.on('kill-update-status-window', (event:any, options:any) => {
  log.info(`IPC: Got kill-update-status-window event, options:`, options);
  closeUpdateWindow();
});

ipcMain.on('show-update-status-window', (event:any, options:any) => {
  log.info(`IPC: Got show-update-status-window event. Options: `, options);
  if(typeof options === 'object' && options.text) {
    log.info(`IPC: Sending text '${options.text}' to update window.`);
    sendStatusToWindow(options.text);
  }
  // let version:string = app.getVersion();
  let version:string  = options && typeof options.version === 'string' ? options.version : "X.Y.Z";
  let opts:any = {
    version: version,
  };
  if(!winUpdate) {
    log.info(`IPC: Creating update window...`);
    if(options === true || options && options.showDevTools === true) {
      createUpdateStatusWindow(version, true);
    } else {
      createUpdateStatusWindow(version, false);
    }
  } else {
    log.info(`IPC: update window already exists!`);
  }
});

ipcMain.on('show-about', (event:any, options:any) => {
  log.info(`IPC: Got show-about event, options: `, options);
  try {
    let thisAppVersion:string = app.getVersion();
    let strDate:string = "UNKNOWN_DATE_AND_TIME";
    let message:string = "Version: UNKNOWN_VERSION\n     Built: UNKNOWN_DATE_AND_TIME";
    let date:moment.Moment;
    // let fmt:string = "dddd DD MMM YYYY HH:mm:ss Z";
    let fmt:string = "ddd DD MMM YYYY HH:mm";
    let opts:Electron.MessageBoxOptions = {
      type: 'info',
      title: 'About OnSiteX Console',
      buttons: ['OK'],
      message: message,
    };
    if(options) {
      if(options.date) {
        date = moment(options.date);
      }
      if(options.version) {
        thisAppVersion = options.version;
      }
      if(options.format) {
        fmt = options.format;
      }
    }
    if(!date) {
      try {
        let appdir:string = getFilePath('..');
        let wwwdir:string = path.join(appdir, 'www');
        let builddir:string = path.join(wwwdir, 'build');
        let vendorfile:string = path.join(builddir, 'vendor.js');
        // let stats = await fs.stats(vendorfile);
        log.info(`IPC: SHOW-ABOUT says vendorFile is at '${vendorfile}'`);
        let stats:fs.Stats = fs.statSync(vendorfile);
        if(stats.isFile() && stats.mtime instanceof Date) {
          date = moment(stats.mtime);
          strDate = date.format(fmt);
        }
      } catch(err) {
        log.info("IPC: SHOW-ABOUT could not get date for app build.");
        // date = moment("1970-01-01");
        // strDate = date.format(fmt); 
        strDate = "UNKNOWN_DATE_AND_TIME";
      }
    } else {
      strDate = date.format(fmt);
    }
    message = `Version: ${thisAppVersion}\n     Built: ${strDate}`;
    opts.message = message;
    showDialogPromise(opts).then(res => {
      sendEventToWindow('dialog-response', res);
    });
  } catch(err) {
    log.info("IPC: Show-About failure");
    log.err(err);
  }
});

ipcMain.on('exit-app', (event, options) => {
  log.info(`IPC: got exit-app event, options:\n`, options);
  // app.quit();
  quitApp();
});

ipcMain.on('window-console', (event, windowConsole) => {
  log.info(`IPC: got window-console event with options:\n`, windowConsole);
  // con = windowConsole;
});

ipcMain.on('show-pdf', (event:any, options:any) => {
  let strOptions:string = JSON.stringify(options);
  log.info(`IPC: got show-pdf event with options:\n${strOptions}`);
  let pdfURL:string = options.url;
  let loadDevTools:boolean = typeof options.loadDevTools !== 'boolean' ? options.loadDevTools : false;
  showAlert("DISABLED", "Can't Create PDF File", "The PDF creation function is disabled in this version. Please tell the developers if you see this message.");
  // createPDFWindow(pdfURL, loadDevTools);
});

ipcMain.on('show-splash', (event:any, options:any) => {
  log.info(`IPC: got show-splash event`);
  let devtools:boolean = options != undefined && options.devtools != undefined ? options.devtools : false;
  let dimensions:WindowDimensions = options != undefined && options.dimensions != undefined ? options.dimensions : {width: 500, height: 500 };
  createSplashWindow(devtools, dimensions);
});

ipcMain.on('hide-splash', () => {
  log.info(`IPC: got hide-splash event`);
  closeSplashWindow();
});

ipcMain.on('show-update', (event:any, appInfo:any) => {
  log.info(`IPC: got show-update event`);
  let version:string = appInfo && appInfo.version ? appInfo.version : "X.Y.Z";
  let devTools:boolean = appInfo && appInfo.devTools ? appInfo.devTools : false;
  // let opts:any = {
  //   version: version,
  // };
  createUpdateStatusWindow(version, devTools);
});

ipcMain.on('hide-update', () => {
  log.info(`IPC: got hide-update event`);
  closeUpdateWindow();
});

ipcMain.on('send-update-error', (event:any, text?:string) => {
  log.info(`IPC: got send-update-error event: `, text);
  let errText:string = typeof text === 'string' ? text : "UNKNOWN ERROR (code -142)";
  // let err:Error = new Error(errText);
  let err:Error | {message:string} = {message: errText};
  sendEventToUpdateWindow('error-message', err);
});

ipcMain.on('progress-message', (event:any, progressObject:any) => {
  log.info(`IPC: got progress-message event: `, progressObject);
  if(winUpdate && winUpdate.webContents) {
    winUpdate.webContents.send('progress-message', progressObject);
  }
});

ipcMain.on('random-window-create', (event:any, data:any) => {
  log.info(`IPC: got random-window-create event`);
  createRandomWindow();
});

ipcMain.on('random-window-close', (event:any, data:any) => {
  let title:string = data && data.title ? data.title : data && data.id ? data.id : "";
  if(title !== "") {
    log.info(`IPC: got random-window-close event, trying to kill random window '${title}'`);
    closeRandomWindowWithID(title);
  } else {
    log.info(`IPC: got random-window-close event, no ID provided`);
    closeRandomWindowLast();
  }
});

ipcMain.on('random-window-close-all', (event:any, data:any) => {
  log.info(`IPC: got random-window-close-all event`);
  closeAllRandomWindows();
});

function quitApp() {
  log.info(`quitApp(): Quitting app …`);
  closeWindow();
  closeSplashWindow();
  closeUpdateWindow();
  closeAllRandomWindows();
  app.exit(0);
  // process.exit(0);
}

app.on('will-quit', () => {
  log.info(`MAIN PROCESS: Got 'will-quit', shutting down ...`);
  quitApp();
  // app.quit();
});

// @ts-ignore
app.on('dev-exit-app', () => {
  log.info(`APP: Got 'dev-exit-app', shutting down ...`);
  quitApp();
});

// @ts-ignore
process.on('dev-exit-app', () => {
  log.info(`MAIN PROCESS: Got 'dev-exit-app', shutting down ...`);
  quitApp();
});

// @ts-ignore
app.on('SIGINT', () => {
  log.info(`APP: Got SIGINT, shutting down ...`);
  quitApp();
});

process.on('SIGINT', () => {
  log.info(`MAIN PROCESS: Got SIGINT, shutting down ...`);
  quitApp();
});

process.on('exit', () => {
  log.info(`MAIN PROCESS: Got exit event, shutting down ...`);
  quitApp();
});

process.on('uncaughtException', (error:Error) => {
  log.info(`MAIN PROCESS: uncaught exception:`);
  log.err(error);
  let errText:string = error && typeof error.message === 'string' ? error.message : typeof error === 'string' ? error : "UNKNOWN_ERROR (code -42)";
  sendEventToUpdateWindow('error-message', error);
});

