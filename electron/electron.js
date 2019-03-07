'use strict';
const HARDCLOSE = true;
const sprintf = require('sprintf-js').sprintf;
// const WHATWG    = require('whatwg-url');
// const URL       = WHATWG.URL;
// const electron  = require('electron');
// const PDFWindow = require('electron-pdf-window');
const windowStateKeeper = require('electron-window-state');
// const windowPlus = require('electron-window-plus');
// Module to control application life.
const moment = require('moment');
const { app, remote, BrowserWindow, dialog, ipcMain, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('graceful-fs');
const process = require('process');
const logger = require('electron-log');
const nativeImage = require('electron').nativeImage;
// const cp = require('child_process');
// @ts-ignore
const packageJson = require('../package.json');
var packageVersion = packageJson.version;
var windowTitle = `OnSiteConsoleX ${packageVersion}`;
// const PouchDB = require('pouchdb');

var testMode = false;

// logger.transports.file.level = 'debug';
logger.transports.file.level = 'silly';
logger.catchErrors({showDialog:true});
autoUpdater.logger = logger;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
// const log = logger;
const updateWindowTimeout = 3000;

// log.transports.rendererConsole.level = 'verbose';

process.on('warning', e => console.warn(e.stack));

const conlog = function(...args) {
  // let args = Array.from(arguments);
  logger.info(...args);
  sendEventToWindow('log-from-app', ...args);
  // if(con) {
  //   con.log(args);
  // }
};

const conerr = function(...args) {
  logger.error(...args);
}

const log = {
  info: conlog,
  err: conerr,
};

console.log(`Electron startup: file base path is: '${__dirname}'`);

// const icon_file_name = '/../www/onsitexconsole.ico';
const icon_file_name     = 'onsitexconsole.ico';
const splash_screen_name = 'splash-screen.html';
const index_file_name    = 'index.html';
const test_file_name     = 'test.html';
const update_file_name   = 'version.html';

function getWWWPath(file_name) {
  let filename = file_name ? file_name : icon_file_name;
  // console.log(`getWWWPath(): Checking for '${filename}' in path '${__dirname}'`);
  let relative_path = filename;
  let first = filename.slice(0,1);
  if(first !== '/' && first !== '.') {
    relative_path = path.join('..', 'www', filename);
  }
  // let file_path = path.join(__dirname, relative_path);
  console.log(`getWWWPath(): Path is '${relative_path}'`);
  return relative_path;
  // } else {
  //   return filename;
  // }
}

function getFilePath(filename) {
  let path1 = __dirname;
  if(filename.indexOf(path1) > -1 || filename.indexOf('app.asar') > -1) {
    return filename;
  } else {
    let fullPath = path.join(__dirname, filename);
    return fullPath;
  }
}

function getFilePathAsURL(filename) {
  try {
    let fullPath = getFilePath(filename);
    console.log(`getFilePathAsURL(): Now trying to get file path for filename '${filename}', full path '${fullPath}'`);
    if(fullPath.slice(0, 7) !== 'file://') {
      fullPath = "file://" + fullPath;
    }
    // let parsedURL = WHATWG.parseURL(fullPath);
    let parsedURL = new URL(fullPath);
    if(!(parsedURL && parsedURL.protocol)) {
      console.log(`getFilePathAsURL(): ERROR! could not parse full path as URL!`);
      return null;
    } else {
      // let fileURL = parsedURL;
      let fileURL = fullPath;
      if(parsedURL.protocol === 'file:') {
        let newURL = new URL(`${fullPath}`);
        fileURL = newURL.href;
      } else {
        let prefix = "file://";
        if(fullPath.slice(0,1) !== '/') {
          prefix += "/";
        }
        let newURL = new URL(`${prefix}${fullPath}`);
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

// const icon_name = '/../www/onsitexconsole.ico';
const icon_name = getWWWPath(icon_file_name);
const icon_path = getFilePath(icon_name);
// console.log(`ICON PATH: '${icon_path}'`);
// const icon_url  = getFilePathAsURL(icon_name);
// logger.info(`app icon path is: '${icon_path}'\nand icon URL is: '${icon_url}'`);

const app_icon = nativeImage.createFromPath(icon_path);


// let con, win, winUpdate, startupWin, pdfWin, mainWindowState;
let win, winUpdate, pdfWin, mainWindowState, splashWindow, randomWindows = [], updateSignal;

// function createPDFWindow(pdfFile, loadDevTools) {
//   if(!win) {
//     log.info(`createPDFWindow() has no parent window! Can't create it.`);
//     return;
//   } else {

//     // let pdfWindowOptions = {
//     //   'x': mainWindowState.x,
//     //   'y': mainWindowState.y,
//     //   'width': mainWindowState.width,
//     //   'height': mainWindowState.height,
//     //   'parent': win,
//     // };

//     // let height =

//     let pdfWindowOptions = {
//       // 'x': mainWindowState.x,
//       // 'y': mainWindowState.y,
//       'width': 1024,
//       'height': 768,
//       // 'parent': win,
//     };

//     pdfWin = new BrowserWindow(pdfWindowOptions);
//     // pdfWin = new PDFWindow(pdfWindowOptions);

//     let parsedURL = WHATWG.parseURL(pdfFile);
//     let pdfURL = pdfFile;
//     if(!(parsedURL && parsedURL.scheme && parsedURL.scheme === 'file')) {
//       pdfURL = new URL(`file:///${pdfFile}`).href;
//     }

//     log.info(`createPDFWin(): Loading URL '${pdfURL}'`);

//     PDFWindow.addSupport(pdfWin);
//     // pdfWin.loadURL(pdfURL);
//     pdfWin.loadURL(pdfFile);
//     pdfWin.show();
//     pdfWin.setMenu(null);
//     pdfWin.setTitle('PRINT PREVIEW (OnSiteX Console)');
//     // windowPlus.loadURL(win, url);

//     // Open the DevTools.
//     if(loadDevTools) {
//       log.info("Developer tools loading.");
//       pdfWin.webContents.openDevTools();
//     }

//     sendEventToWindow('pdf-window-created', pdfWin);


//     // Emitted when the window is closed.
//     pdfWin.on('closed', () => {
//       // Dereference the window object, usually you would store windows
//       // in an array if your app supports multi windows, this is the time
//       // when you should delete the corresponding element.
//       sendEventToWindow('pdf-window-closed');
//       pdfWin = null;
//     });
//   }
// }

function createWindow() {
  // Create the browser window.
  // win = new BrowserWindow({
  //     width: 1600,
  //     height: 900
  // });
  // Load the previous state with fallback to defaults

  mainWindowState = windowStateKeeper({
    // defaultWidth: 1600,
    // defaultHeight: 900,
    defaultWidth: 1024,
    defaultHeight: 768,
    maximize: false,
    fullScreen: false,
  });

  let defaultWindowOptions = {
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

  // win = Splashscreen.initSplashScreen(splashConfig);
  // if(!windowPlus.restore()) {
  //   win = new BrowserWindow(defaultWindowOptions);
  //   windowPlus.manage(win);
  // }
  mainWindowState.manage(win);
  win.setTitle(windowTitle);
  win.once('ready-to-show', () => {
    // win.once('did-finish-load', () => {
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

  win.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });


  // win = new PDFWindow({
  //   'x': mainWindowState.x,
  //   'y': mainWindowState.y,
  //   'width': mainWindowState.width,
  //   'height': mainWindowState.height
  // });

  // PDFWindow.addSupport(win);

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  // var url = 'file://' + __dirname + '/../www/index.html';
  var index_location = getWWWPath(index_file_name);
  var url = getFilePathAsURL(index_location);
  var Args = process.argv.slice(1);
  // let loadDevTools = false, unFullScreen = false;
  let loadDevTools = false, unFullScreen = false;
  for(let val of Args) {
    let arg = val.toLowerCase();
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
}

function createSplashWindow(loadDevTools, dimensions) {
  let width = 500, height = 500;
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
  let splash_location = getWWWPath(splash_screen_name);
  let splashURL = getFilePathAsURL(splash_location);
  let appVersion = app.getVersion();
  let url = `${splashURL}#${appVersion}`;
  splashWindow.loadURL(url);
  if(loadDevTools) {
    splashWindow.webContents.openDevTools();
  }
}

function sendStatusToWindow(evt) {
  log.info(`Sending status to winUpdate: '${evt}'`);
  if(winUpdate && winUpdate.webContents) {
    winUpdate.webContents.send('message', evt);
  }
}

function sendEventToUpdateWindow(channel, object) {
  if(winUpdate && winUpdate.webContents) {
    let strObj = JSON.stringify(object);
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

function sendEventToWindow(channel, event) {
  if(channel !== 'log-from-app') {
    logger.info(`ELECTRON MAIN: sending '${channel}' event to window`);
  }
  if(win && win.webContents) {
    win.webContents.send(channel, event);
  }
}


function createUpdateStatusWindow(updateVersion, showDevTools) {
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
  let devTools = testMode ? true : showDevTools ? true : false;
  let currentVersion = app.getVersion();
  let newVersion = updateVersion ? updateVersion : currentVersion;
  // let newVersion     = app.getVersion();
  let update_location = getWWWPath(update_file_name);
  let updateURL = getFilePathAsURL(update_location);
  let url = `${updateURL}#${currentVersion}#${newVersion}`;
  // let url = `file://${__dirname}/../www/version.html#${currentVersion}#${newVersion}`;
  log.info(`createUpdateStatusWindow(): Loading with url '${url}' ...`);
  winUpdate.loadURL(url);
  winUpdate.once('ready-to-show', () => {
    winUpdate.show();
    // createUpdateStatusMenu();
    // winUpdate.setMenu(null);
    // winUpdate.setTitle(`DOWNLOADING UPDATE`);
    // if(devTools) {
    //   winUpdate.webContents.openDevTools();
    // }
    // setTimeout(() => {
    //   winUpdate.setMenu(null);
    // }, 500);
  });
  return winUpdate;
}

function closeWindow() {
  if(win) {
    log.info(`closeWindow(): Closing the main window.`);
    let closeWin = win;
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
    let closeWin = splashWindow;
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
    let closeWin = winUpdate;
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

function createRandomWindow() {
  // log.info(`createRandomWindow(): `);
  let opts = {
    width  : 400  ,
    height : 400  ,
    frame  : true ,
    show   : true,
  };
  if(win) {
    opts.parent = win;
  }
  
  let test_location = getWWWPath(test_file_name);
  let url = getFilePathAsURL(test_location);
  let count = randomWindows.length;
  let title = sprintf("randomwindow%03d", count + 1);
  if(count > 0) {
    let lastWin = randomWindows[count - 1];
    let pos = lastWin.getPosition();
    let x = pos[0];
    let y = pos[1];
    opts.x = x + 30;
    opts.y = y + 30;
  }
  let randomWin = new BrowserWindow(opts);
  randomWin.setTitle(title);
  randomWindows.push(randomWin);
  let newCount = randomWindows.length;
  let id = randomWin.id;
  log.info(`createRandomWindow(): Created random window with title '${title}', ID is '${id}', there are now ${newCount} random windows`);
  randomWin.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });
  randomWin.on('close', (event) => {
    event.preventDefault();
    let thiswin = event && event.sender && event.sender instanceof BrowserWindow ? event.sender : randomWin;
    // let wintitle = randomWin.getTitle();

    let id = thiswin.id;
    // log.info(`RandomWindow: got 'close' event for window '${id}': `, event);
    log.info(`RandomWindow: got 'close' event for window '${id}' …`);
    // closeRandomWindow(wintitle);
    closeRandomWindow(randomWin);
    // let idx = randomWindows.findIndex(a => {
    //   // return a === this;
    //   // return a.getTitle() === wintitle;
    //   return a === randomWin;
    // });
    // if(idx > -1) {
    //   randomWindows.splice(idx, 1);
    //   let count = randomWindows.length;
    //   log.info(`RandomWindow: '${wintitle}' closed and removed from array, ${count} random windows left.`);
    // } else {
    //   log.info(`RandomWindow: '${wintitle}' could not be found to close`);
    // }
  });
  randomWin.loadURL(url);
  return randomWin;
}

function hardClose(browserwindow) {
  if(browserwindow instanceof BrowserWindow && !browserwindow.isDestroyed()) {
    let id = browserwindow.id;
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

function closeRandomWindow(randomWin) {
  // log.info(`closeRandomWindow(): `);
  // let randomWin, title, winID;
  // let count = randomWindows.length;
  if(randomWin instanceof BrowserWindow) {
    let count = randomWindows.length;
    let id = randomWin.id;
    log.info(`closeRandomWindow(): Called for window ID '${id}' …`);
    let idx = randomWindows.findIndex(a => {
      return a === randomWin || a.id === id || a.title === id;
    });
    let winref = randomWindows.splice(idx, 1)[0];
    hardClose(randomWin);
    if(randomWin !== winref) {
      hardClose(winref);
    }
    let newCount = randomWindows.length;
    log.info(`closeRandomWindow(): closed random window ID '${id}', there are ${newCount} random windows left`);
  } else {
    log.info(`closeRandomWindow(): parameter was not a BrowserWindow`);
  }
}

function closeRandomWindowWithID(id) {
  let winID = Number(id);
  log.info(`closeRandomWindowWithID(${winID}): called …`);
  if(!isNaN(winID)) {
    let randomWin = randomWindows.find(a => {
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
  let count = randomWindows.length;
  // log.info(`closeRandomWindowLast(): `);
  if(count > 0) {
    let randomWindow = randomWindows.pop();
    closeRandomWindow(randomWindow);
  } else {
    log.info(`closeRandomWindowLast(): No random windows exist`);
  }
}

function closeAllRandomWindows() {
  // let randomWin;
  if(randomWindows && randomWindows.length) {
    let count = randomWindows.length;
    log.info(`closeAllRandomWindows(): closing ${count} random windows …`);
    for(let i = count - 1; i >= 0; i--) {
      let randomWin = randomWindows.pop();
      // let id = randomWin.getTitle();
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
  //   const dialogOpts = {
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
  let currentVersion = app.getVersion();
  let newVersion = info.version;
  let message = `Found update from ${currentVersion} to ${newVersion}. Do you want to update now?`;
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: message,
    buttons: ['Yes', 'No']
  }, (buttonIndex) => {
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

autoUpdater.on('error', (ev, err) => {
  if(err && err.message) {
    log.info(`autoUpdater(): received event 'error':\n`, err.message);
  }
  sendStatusToWindow('Error while running updater!');
  sendEventToWindow('update-error-event', err);
  sendEventToUpdateWindow('error-message', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`autoUpdater(): received event 'progress':\n`, JSON.stringify(progressObj));
  if(progressObj && progressObj.bytesPerSecond) {
    // let log_message = "Download speed: " + progressObj.bytesPerSecond;
    // log_message += ' - Downloaded ' + progressObj.percent + '%';
    // log_message += ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    // sendEventToWindow('update-download-progress', log_message);
    // sendStatusToWindow('progress-message', progressObj);
    sendEventToUpdateWindow('progress-message', progressObj);
  }
});

autoUpdater.on('update-downloaded', (ev, info) => {
  log.info(`autoUpdater(): received event 'update-downloaded':\n`, JSON.stringify(info));
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  // let releaseNotes = info.releaseNotes || "None";
  // let releaseName = info.releaseName || "None";
  let msg = info && info.releaseNotes ? info.releaseNotes : "Updated version available";
  sendStatusToWindow("Update downloaded");
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: msg,
    detail: 'A new version has been downloaded. Restart now to install the update?'
  };

  dialog.showMessageBox(dialogOpts, (response) => {
    closeUpdateWindow();
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('update-not-available', (ev, info) => {
  log.info(`autoUpdater(): received event 'update-not-available':\n`, ev, `\n`, info);
  // sendStatusToWindow('No new update available.');
  const dialogOpts = {
    type: 'info',
    'buttons': ['OK'],
    'title': 'Update not found',
    message: 'No update found.',
    detail: 'This version is up to date!',
  };
  dialog.showMessageBox(dialogOpts, (response) => {
    sendEventToWindow('update-not-available');
    log.info("autoUpdater(): dialogbox received back response:\n", response);
    setTimeout(() => {
      closeUpdateWindow();
    }, updateWindowTimeout);
  });
  // createWindow();
});

ipcMain.on('manual-check-update', (event) => {
  log.info(`IPC: Received manual-check-update event, event:\n`, event);
  autoUpdater.checkForUpdates().then((res) => {
    log.info("Done checking for updates. Result:");
    // let out = JSON.stringify(res);
    log.info(res);
    sendEventToWindow('done-checking-update');
    autoUpdater.signals.progress((info) => {
      if(info && info.bytesPerSecond) {
        // let log_message = "Download speed: " + progressObj.bytesPerSecond;
        // log_message += ' - Downloaded ' + progressObj.percent + '%';
        // log_message += ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        // sendEventToWindow('update-download-progress', log_message);
        // sendStatusToWindow('progress-message', progressObj);
        sendEventToUpdateWindow('progress-message', info);
      }
    });
  }).catch(err => {
    logger.error("Error checking for update:\n", err);
    let errText = err && typeof err.message === 'string' ? err.message : err && typeof err.status === 'string' ? err.status : typeof err.status === 'number' ? err.status : typeof err === 'string' ? err : "UNKNOWN_ERROR (code -42)";
    let errString = `Error contacting update server: '${errText}'`;
    let errHTML = `An error was encountered checking for app update. The server http://updates.sesa.us is probably offline. The error is:\n\n'${errText}'`;
    sendStatusToWindow(errString);
    sendEventToWindow('update-server-error', err);
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Error',
      message: "Error contacting update server",
      detail: errHTML,
    };
    dialog.showMessageBox(dialogOpts, (response) => {
      logger.info(`Error dialog box closed, response:\n`, response);
      sendEventToWindow('update-check-error', err);
      setTimeout(() => {
        closeUpdateWindow();
      }, updateWindowTimeout);
    });
  });
});

function showAlert(title, text, detail) {
  const dialogOpts = {
    type: 'info',
    buttons: ['OK'],
    title: title,
    message: text,
  };
  if(typeof detail === 'string') {
    dialogOpts.detail = detail;
  }

  dialog.showMessageBox(win, dialogOpts, (response) => {
    log.info(`showAlert(): user responded '${response}'.`);
    return response;
  });
}

function showDialog(dialogOpts) {
  let opts = {};
  let keys = Object.keys(dialogOpts);
  for(let key of keys) {
    if(dialogOpts[key] !== undefined) {
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
  dialog.showMessageBox(win, opts, (response) => {
    log.info(`showDialog(): user responded '${response}'.`);
    return response;
  });
}

function showDialogPromise(dialogOpts) {
  let opts = {};
  let keys = Object.keys(dialogOpts);
  for(let key of keys) {
    if(dialogOpts[key] !== undefined) {
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
      dialog.showMessageBox(win, opts, (response) => {
        log.info(`showDialog(): user responded '${response}', sending response to app...`);
        resolve(response);
      });
    } catch(err) {
      log.error(`showDialog(): Error showing dialog message box!`);
      log.error(err);
      resolve(null);
    }
  });
}

ipcMain.on('dialog-show', (event, dialogOpts) => {
  let stringOpts = JSON.stringify(dialogOpts);
  log.info(`IPC: Got dialog request with options:\n`, stringOpts);
  showDialogPromise(dialogOpts).then(res => {
    sendEventToWindow('dialog-response', res);
  });
// const genericOpts = {
  //   type: 'info',
  //   buttons: ['OK'],
  //   title: 'Dialog',
  //   message: 'Generic dialog box',
  //   detail: 'This is a generic dialog box.'
  // };
});

ipcMain.on('kill-update-status-window', (event, options) => {
  log.info(`IPC: Got kill-update-status-window event, options:\n`, options);
  closeUpdateWindow();
});

ipcMain.on('show-update-status-window', (event, options) => {
  log.info(`IPC: Got show-update-status-window event. Options: `, options);
  if(typeof options === 'object' && options['text']) {
    log.info(`IPC: Sending text '${options['text']}' to update window.`);
    sendStatusToWindow(options['text']);
  }
  // let version = app.getVersion();
  let version  = options && typeof options.version === 'string' ? options.version : "X.Y.Z";
  let opts = {
    version: version,
  };
  if(!winUpdate) {
    log.info(`IPC: Creating update window...`);
    if(options === true || options && options['showDevTools'] === true) {
      createUpdateStatusWindow(version, true);
    } else {
      createUpdateStatusWindow(version, false);
    }
  } else {
    log.info(`IPC: update window already exists!`);
  }
});

ipcMain.on('show-about', (event, options) => {
  log.info(`IPC: Got show-about event, options: `, options);
  try {
    let thisAppVersion = app.getVersion();
    let strDate = "UNKNOWN_DATE_AND_TIME";
    let message = "Version: UNKNOWN_VERSION\n     Built: UNKNOWN_DATE_AND_TIME", date;
    // let fmt = "dddd DD MMM YYYY HH:mm:ss Z";
    let fmt = "ddd DD MMM YYYY HH:mm";
    let opts = {
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
        let appdir = getFilePath('..');
        let wwwdir = path.join(appdir, 'www');
        let builddir = path.join(wwwdir, 'build');
        let vendorfile = path.join(builddir, 'vendor.js');
        // let stats = await fs.stats(vendorfile);
        log.info(`IPC: SHOW-ABOUT says vendorFile is at '${vendorfile}'`);
        let stats = fs.statSync(vendorfile);
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

ipcMain.on('show-pdf', (event, options) => {
  let strOptions = JSON.stringify(options);
  log.info(`IPC: got show-pdf event with options:\n${strOptions}`);
  let pdfURL = options.url;
  let loadDevTools = typeof options.loadDevTools !== 'boolean' ? options.loadDevTools : false;
  showAlert("DISABLED", "The PDF creation function is disabled in this version. Please tell the developers if you see this message.");
  // createPDFWindow(pdfURL, loadDevTools);
});

ipcMain.on('show-splash', (event, options) => {
  log.info(`IPC: got show-splash event`);
  let devtools = options != undefined && options.devtools != undefined ? options.devtools : false;
  let dimensions = options != undefined && options.dimensions != undefined ? options.dimensions : {width: 500, height: 500 };
  createSplashWindow(devtools, dimensions);
});

ipcMain.on('hide-splash', () => {
  log.info(`IPC: got hide-splash event`);
  closeSplashWindow();
});

ipcMain.on('show-update', (event, appInfo) => {
  log.info(`IPC: got show-update event`);
  let version = appInfo && appInfo.version ? appInfo.version : "X.Y.Z";
  let devTools = appInfo && appInfo.devTools ? appInfo.devTools : false;
  // let opts = {
  //   version: version,
  // };
  createUpdateStatusWindow(version, devTools);
});

ipcMain.on('hide-update', () => {
  log.info(`IPC: got hide-update event`);
  closeUpdateWindow();
});

ipcMain.on('send-update-error', (event, text) => {
  log.info(`IPC: got send-update-error event:\n`, text);
  let errText = typeof text === 'string' ? text : "UNKNOWN ERROR (code -142)";
  // let err = new Error(errText);
  let err = {message: errText};
  sendEventToUpdateWindow('error-message', err);
});

ipcMain.on('progress-message', (event, progressObject) => {
  log.info(`IPC: got progress-message event:\n`, progressObject);
  if(winUpdate && winUpdate.webContents) {
    winUpdate.webContents.send('progress-message', progressObject);
  }
});

ipcMain.on('random-window-create', (event, data) => {
  log.info(`IPC: got random-window-create event`);
  createRandomWindow();
});

ipcMain.on('random-window-close', (event, data) => {
  let title = data && data.title ? data.title : data && data.id ? data.id : "";
  if(title !== "") {
    log.info(`IPC: got random-window-close event, trying to kill random window '${title}'`);
    closeRandomWindowWithID(title);
  } else {
    log.info(`IPC: got random-window-close event, no ID provided`);
    closeRandomWindowLast();
  }
});

ipcMain.on('random-window-close-all', (event, data) => {
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

process.on('uncaughtException', (error) => {
  log.info(`MAIN PROCESS: uncaught exception:`);
  log.error(error);
  let errText = error && typeof error.message === 'string' ? error.message : typeof error === 'string' ? error : "UNKNOWN_ERROR (code -42)";
  sendEventToUpdateWindow('error-message', error);
});

