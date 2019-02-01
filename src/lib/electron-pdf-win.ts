import { Log } from 'domain/onsitexdomain';
// const isRenderer    = require('is-electron-renderer');
import { isRenderer } from 'is-electron-renderer';
import * as WHATWG from 'whatwg-url';
import * as electron from 'electron';
import * as path from 'path';
import * as readChunk from 'read-chunk';
import * as fileType from 'file-type';
import * as extend from 'deep-extend';
import * as got from 'got';
// import { PDFJS } from 'pdfjs-dist';
import { remote as electronRemote, BrowserWindow as electronBrowserWindow } from 'electron';
// const path          = require('path');
// const readChunk     = require('read-chunk');
// const fileType      = require('file-type');
// const extend        = require('deep-extend');
// const got           = require('got');

// type BrowserWindow = electron.BrowserWindow;
// type ElectronRemote = Electron.Remote;


// const BrowserWindow:any = isRenderer ? electronRemote.BrowserWindow : electronBrowserWindow;
const BrowserWindow:any = electronRemote.BrowserWindow;

// const PDF_JS_ROOT = isRenderer ? electron.remote.app.getAppPath() : electron.app.getAppPath();

// const PDF_JS_PATH = path.join(__dirname, 'pdfjs', 'web', 'viewer.html');
// const PDF_JS_PATH = path.join(PDF_JS_ROOT, 'pdfjs', 'web', 'viewer.html');

type ElectronEvent = electron.Event;

// function isAlreadyLoadedWithPdfJs(url:string):boolean {
//   // return url.startsWith(`file://${PDF_JS_PATH}?file=`);
//   let res =  url.match('file://.*viewer\.html.file');
//   return Boolean(res);
// }

// function isFile(url:string):boolean {
//   return Boolean(url.match(/^file:\/\//i));
// }

// function getMimeOfFile(url):string {
//   const fileUrl = url.replace(/^file:\/\//i, '');
//   const buffer = readChunk.sync(fileUrl, 0, 262);
//   const ft = fileType(buffer);

//   return ft && ft.mime ? ft.mime : null;
// }

// function hasPdfExtension(url:string):boolean {
//   return Boolean(url.match(/\.pdf$/i));
// }

// function isPDF(url:string):Promise<boolean> {
//   return new Promise((resolve, reject) => {
//     if(isAlreadyLoadedWithPdfJs(url)) {
//       resolve(false);
//     } else if(isFile(url)) {
//       resolve(getMimeOfFile(url) === 'application/pdf');
//     } else if(hasPdfExtension(url)) {
//       resolve(true);
//     } else {
//       got.head(url).then(res => {
//         if(res.headers.location) {
//           isPDF(res.headers.location).then(isit => resolve(isit)).catch(err => reject(err));
//         } else {
//           resolve(res.headers['content-type'].indexOf('application/pdf') !== -1);
//         }
//       }).catch(err => reject(err));
//     }
//   });
// }

// function getBaseURL():string {
//   let filePath:string = "";
//   if(isRenderer) {
//     filePath = electron.remote.app.getAppPath();
//   } else {
//     filePath = electron.app.getAppPath();
//   }
//   return filePath;
// }

// function getViewerURL():string {
//   // let parsedURL = WHATWG.parseURL(pdfFile);
//   let base:string = getBaseURL();
//   let viewerPath:string = path.join(base, 'pdfjs', 'web', 'viewer.html')
//   let parsedURL = WHATWG.parseURL(base);
//   let fileURL = parsedURL;
//   if(!(parsedURL && parsedURL.scheme && parsedURL.scheme === 'file')) {
//     fileURL = new URL(`file:///${parsedURL}`).href;
//   }
//   return fileURL;
// }

// function getFullURL(pdfFile:string):string {
//   let viewerURL:string = getViewerURL();
//   let url:string = `${viewerURL}?file=${pdfFile}`;
//   return url;
// }

export class PDFWindow extends electronRemote.BrowserWindow {
  constructor(opts?:any) {
    Log.l(`PDFWindow(): constructor called with arguments:\n`, opts);
    super(extend({}, opts, {
      webPreferences: { nodeIntegration: false }
    }));

    this.webContents.on('will-navigate', (event:any, url:string) => {
      event.preventDefault();
      this.loadURL(url);
    });

    this.webContents.on('new-window', (event:any, url:string) => {
      event.preventDefault();

      event.newGuest = new PDFWindow();
      event.newGuest.loadURL(url);
    });
  }

  public loadURL(url:string, options?:any) {
    PDFWindow.isPDF(url).then(isit => {
      if(isit) {
        // let fileURL:string = `file://${path.join(__dirname, 'pdfjs', 'web', 'viewer.html')}?file=${decodeURIComponent(url)}`;
        let fileURL:string = PDFWindow.getFullURL(decodeURIComponent(url));
        Log.l(`PDFWindow.loadURL(): isPDF() returned true, trying to load '${fileURL}'...`);
        super.loadURL(fileURL, options);
      } else {
        Log.l(`PDFWindow.loadURL(): isPDF() returned false, trying to load '${url}'...`);
        super.loadURL(url, options);
      }
    }).catch((err) => {
      Log.l(`PDFWindow.loadURL(): Error loading url!`);
      Log.e(err);
      super.loadURL(url, options);
    });
  }

  public static addSupport(browserWindow:Electron.BrowserWindow) {
    Log.l(`PDFWindow.addSupport() called.`)
    browserWindow.webContents.on('will-navigate', (event:any, url:string) => {
      event.preventDefault();
      browserWindow.loadURL(url);
    });

    browserWindow.webContents.on('new-window', (event:any, url:string) => {
      event.preventDefault();

      event.newGuest = new PDFWindow();
      event.newGuest.loadURL(url);
    });

    const load = browserWindow.loadURL;
    browserWindow.loadURL = function(url:string, options:any) {
      PDFWindow.isPDF(url).then(isit => {
        if(isit) {
          // let fileURL:string = `file://${PDF_JS_PATH}?file=${decodeURIComponent(url)}`;
          let fileURL:string = PDFWindow.getFullURL(decodeURIComponent(url));
          Log.l(`PDFWindow.addSupport.loadURL(): isPDF() true, Trying to load file url '${fileURL}' ...`);
          load.call(browserWindow, fileURL, options);
        } else {
          Log.l(`PDFWindow.addSupport.loadURL(): isPDF() false, Trying to load file url '${url}' ...`);
          load.call(browserWindow, url, options);
        }
      });
    };
  }

  public static isAlreadyLoadedWithPdfJs(url:string):boolean {
    // return url.startsWith(`file://${PDF_JS_PATH}?file=`);
    let res =  url.match('file://.*viewer\.html.file');
    return Boolean(res);
  }

  public static isFile(url:string):boolean {
    return Boolean(url.match(/^file:\/\//i));
  }

  public static getMimeOfFile(url):string {
    const fileUrl = url.replace(/^file:\/\//i, '');
    const buffer = readChunk.sync(fileUrl, 0, 262);
    const ft = fileType(buffer);

    return ft && ft.mime ? ft.mime : null;
  }

  public static hasPdfExtension(url:string):boolean {
    return Boolean(url.match(/\.pdf$/i));
  }

  public static isPDF(url:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      if(PDFWindow.isAlreadyLoadedWithPdfJs(url)) {
        resolve(false);
      } else if(PDFWindow.isFile(url)) {
        resolve(PDFWindow.getMimeOfFile(url) === 'application/pdf');
      } else if(PDFWindow.hasPdfExtension(url)) {
        resolve(true);
      } else {
        got.head(url).then(res => {
          if(res.headers.location) {
            PDFWindow.isPDF(res.headers.location).then(isit => resolve(isit)).catch(err => reject(err));
          } else {
            resolve(res.headers['content-type'].indexOf('application/pdf') !== -1);
          }
        }).catch(err => reject(err));
      }
    });
  }

  public static getBaseURL():string {
    let filePath:string = "";
    // if(isRenderer) {
      filePath = electronRemote.app.getAppPath();
    // } else {
      // filePath = electron.app.getAppPath();
    // }
    return filePath;
  }

  public static getViewerURL():string {
    // let parsedURL = WHATWG.parseURL(pdfFile);
    let base:string = PDFWindow.getBaseURL();
    let viewerPath:string = path.join(base, 'www', 'pdfjs', 'web', 'viewer.html')
    let parsedURL = WHATWG.parseURL(viewerPath);
    let fileURL = viewerPath;
    if(!(parsedURL && parsedURL.scheme && parsedURL.scheme === 'file')) {
      fileURL = new WHATWG.URL(`file:///${viewerPath}`).href;
    }
    return fileURL;
  }

  public static getFullURL(pdfFile:string):string {
    let viewerURL:string = PDFWindow.getViewerURL();
    let url:string = `${viewerURL}?file=${pdfFile}`;
    return url;
  }

}

// PDFWindow.addSupport = function (browserWindow) {
//   browserWindow.webContents.on('will-navigate', (event, url) => {
//     event.preventDefault();
//     browserWindow.loadURL(url);
//   });

//   browserWindow.webContents.on('new-window', (event, url) => {
//     event.preventDefault();

//     event.newGuest = new PDFWindow();
//     event.newGuest.loadURL(url);
//   });

//   const load = browserWindow.loadURL;
//   browserWindow.loadURL = function (url, options) {
//     isPDF(url).then(isit => {
//       if (isit) {
//         load.call(browserWindow, `file://${PDF_JS_PATH}?file=${
//           decodeURIComponent(url)}`, options);
//       } else {
//         load.call(browserWindow, url, options);
//       }
//     });
//   };
// };

// module.exports = PDFWindow;
