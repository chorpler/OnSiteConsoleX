'use strict';
const electron  = require('electron');
const PDFWindow = require('electron-pdf-window');
const windowStateKeeper = require('electron-window-state');
// const windowPlus = require('electron-window-plus');
// Module to control application life.
const { app, BrowserWindow, dialog, ipcMain } = electron;
const { autoUpdater } = require('electron-updater');
const process = require('process');
const logger = require('electron-log');


logger.transports.file.level = 'debug';
autoUpdater.logger = logger;
const log = logger;
const updateWindowTimeout = 3000;

process.on('warning', e => console.warn(e.stack));

let win, winUpdate, startupWin;
function createWindow() {
    // Create the browser window.
    // win = new BrowserWindow({
    //     width: 1600,
    //     height: 900
    // });
    // Load the previous state with fallback to defaults
    let mainWindowState = windowStateKeeper({
      // defaultWidth: 1600,
      // defaultHeight: 900,
      defaultWidth: 1024,
      defaultHeight: 768,
      maximize: false,
      fullScreen: false
    });

    const defaultWindowOptions = {
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      // width: 1600,
      // height: 900,
      // width: 1024,
      // height: 768,
      frame: true,
      kiosk: false,
    };
    const splashConfig = {
      windowOpts: defaultWindowOptions,
      templateUrl: `${__dirname}/splash-screen.html`,
      splashScreenOptions: {
          width: 700,
          height: 700,
      },
    };

    // Create the window using the state information
      win = new BrowserWindow(defaultWindowOptions);


    // win = Splashscreen.initSplashScreen(splashConfig);
    // if(!windowPlus.restore()) {
    //   win = new BrowserWindow(defaultWindowOptions);
    //   windowPlus.manage(win);
    // }



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
    mainWindowState.manage(win);
    var url = 'file://' + __dirname + '/../www/index.html';
    var Args = process.argv.slice(1);
    let loadDevTools = false, unFullScreen = false;
    Args.forEach(function (val) {
      let arg = val.toLowerCase();
      if(arg === "test") {
        log.info("Starting in test mode...");
        url = 'http://localhost:8110';
        loadDevTools = true;
      }
      if(arg.indexOf('dev') > -1) {
        log.info("Caught developer flag, turning devtools on.");
        loadDevTools = true;
      }
      if(arg === "sizeReset") {
        unFullScreen = true;
      }
    });
    // and load the index.html of the app.
    win.loadURL(url);
    // windowPlus.loadURL(win, url);

    // Open the DevTools.
    if(loadDevTools) {
      log.info("Developer tools loading.");
      win.webContents.openDevTools();
    } else {
      log.info("Developer tools not being loaded.");
      if(win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      }
    }
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

function sendStatusToWindow(text) {
  log.info(`Sending text to winUpdate: '${text}'`);
  if(winUpdate && winUpdate.webContents) {
    winUpdate.webContents.send('message', text);
  }
}

function sendEventToWindow(channel, event) {
  log.info(`ELECTRON MAIN: sending '${channel}' event to window`);
  if(win && win.webContents) {
    win.webContents.send(channel, event);
  }
}
function createUpdateStatusWindow(showDevTools) {
  winUpdate = new BrowserWindow({
    width  : 400  ,
    height : 400  ,
    frame  : true ,
    parent : win  ,
  });
  if(showDevTools) {
    winUpdate.webContents.openDevTools();
  }
  winUpdate.on('closed', () => {
    winUpdate = null;
  });
  winUpdate.loadURL(`file://${__dirname}/../www/version.html#v${app.getVersion()}`);
  winUpdate.setMenu(null);
  return winUpdate;
}

function closeUpdateWindow() {
  if(winUpdate) {
    logger.info(`closeUpdateWindow(): Closing the update window.`);
    winUpdate.close();
    winUpdate = null;
  } else {
    logger.info(`closeUpdateWindow(): Update window did not exist.`);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info("Electron: got app ready event!");
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
  createWindow();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
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
autoUpdater.on('update-available', (ev, info) => {
  log.info(`autoUpdater(): received event 'update-available':\n`, JSON.stringify(info));
  sendEventToWindow('update-available');
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Yes', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      if(!winUpdate) {
        createUpdateStatusWindow(showDevTools);
      }
      sendStatusToWindow('Begining download of update...');
      sendEventToWindow('update-downloading');
      autoUpdater.downloadUpdate();
    } else {
      updater.enabled = true;
      updater = null;
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
});

autoUpdater.on('download-progress', (ev, progressObj) => {
  log.info(`autoUpdater(): received event 'progress':\n`, JSON.stringify(progressObj));
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message += ' - Downloaded ' + progressObj.percent + '%';
  log_message += ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
  sendEventToWindow('update-download-progress', progressObj);
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
    setTimeout(() => {
      closeUpdateWindow();
    }, updateWindowTimeout);
  });
  // createWindow();
});

ipcMain.on('manual-check-update', (event, showDevTools) => {
  log.info(`IPC: Received manual-check-update event, checking for update...`);
  autoUpdater.checkForUpdates().then((res) => {
    log.info("Done checking for updates. Result:");
    let out = JSON.stringify(res);
    log.info(res);
    sendEventToWindow('done-checking-update');
  }).catch(err => {
    logger.error("Error checking for update.");
    sendStatusToWindow('Error contacting update server!');
    sendEventToWindow('update-server-error');
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Error',
      message: "Error contacting update server",
      detail: 'An error was encountered checking for app update. The server http://updates.sesa.us is probably offline.'
    };
    dialog.showMessageBox(dialogOpts, (response) => {
      sendEventToWindow('update-check-error', err);
      setTimeout(() => {
        closeUpdateWindow();
      }, updateWindowTimeout);
    });
  });
});

function showDialog(dialogOpts) {
  let opts = {};
  let keys = Object.keys(dialogOpts);
  for(let key of keys) {
    if(dialogOpts[key] !== undefined) {
      opts[key] = dialogOpts[key];
    }
  }
  if(!opts['type']) {
    opts.type = 'info';
  }
  if(!opts['buttons']) {
    opts.buttons = ['OK'];
  }
  logger.info(`showDialog(): Showing '${opts.type}' dialog box, title '${opts.title}'...`);
  dialog.showMessageBox(win, opts, (response) => {
    logger.info(`showDialog(): user responded '${response}'.`);
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
  if(!opts['type']) {
    opts.type = 'info';
  }
  if(!opts['buttons']) {
    opts.buttons = ['OK'];
  }
  logger.info(`showDialog(): Showing '${opts.type}' dialog box from app, title '${opts.title}'...`);
  return new Promise((resolve) => {
    dialog.showMessageBox(win, opts, (response) => {
      logger.info(`showDialog(): user responded '${response}', sending response to app...`);
      resolve(response);
    }).catch(err => {
      logger.error(`showDialog(): Error showing dialog message box!`);
    });
  });
}

ipcMain.on('dialog-show', (event, dialogOpts) => {
  let stringOpts = JSON.stringify(dialogOpts);
  logger.info(`IPC: Got dialog request with options:\n`, stringOpts);
  // const genericOpts = {
  //   type: 'info',
  //   buttons: ['OK'],
  //   title: 'Dialog',
  //   message: 'Generic dialog box',
  //   detail: 'This is a generic dialog box.'
  // };
});

ipcMain.on('kill-update-status-window', (event, options) => {
  logger.info(`IPC: Got kill-update-status-window event.`);
  closeUpdateWindow();
});

ipcMain.on('show-update-status-window', (event, options) => {
  logger.info(`IPC: Got show-update-status-window event.`);
  if(typeof options === 'object' && options['text']) {
    logger.info(`IPC: Sending text '${options['text']}' to update window.`);
    sendStatusToWindow(options['text']);
  }
  if(!winUpdate) {
    logger.info(`IPC: Creating update window...`);
    if(options === true || options && options['showDevTools'] === true) {
      createUpdateStatusWindow(true);
    } else {
      createUpdateStatusWindow();
    }
  } else {
    logger.info(`IPC: update window already exists!`);
  }
});

ipcMain.on('show-about', (event, options) => {
  logger.info(`IPC: Got show-about event.`);
  let thisAppVersion = app.getVersion();
  let opts = {
    type: 'info',
    title: 'About OnSiteX Console',
    buttons: ['OK'],
    message: `Version: ${thisAppVersion}`,
  };
  showDialogPromise(opts).then(res => {
    sendEventToWindow('dialog-response', res);
  });
});

ipcMain.on('exit-app', (event, options) => {
  logger.info(`IPC: got exit-app event.`);
  app.quit();
});
