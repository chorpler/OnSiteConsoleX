import { Log } from 'domain/onsitexdomain';
// import { isRenderer } from 'is-electron-renderer';
// import * as WHATWG from 'whatwg-url';
import * as electron from 'electron';
import * as path from 'path';
import * as readChunk from 'read-chunk';
// import * as fileType from 'file-type';
import fileType from 'file-type';
import * as extend from 'deep-extend';
import got from 'got';
import { remote as electronRemote, BrowserWindow as electronBrowserWindow } from 'electron';
// const BrowserWindow:any = electronRemote.BrowserWindow;

type ElectronEvent = electron.Event;

export class PDFWindow extends electronRemote.BrowserWindow {
  constructor(opts?:any) {
    Log.l(`PDFWindow(): constructor called with arguments:`, opts);
    super(extend({}, opts, {
      webPreferences: { nodeIntegration: false }
    }));

    this.webContents.on('will-navigate', (event:ElectronEvent, url:string) => {
      event.preventDefault();
      this.loadURL(url);
    });

    this.webContents.on('new-window', (event:ElectronEvent, url:string) => {
      event.preventDefault();

      (event as any).newGuest = new PDFWindow();
      (event as any).newGuest.loadURL(url);
    });
  }

  public async loadURL(url:string, options?:electron.LoadURLOptions):Promise<void> {
    try {
      let isit:boolean = await PDFWindow.isPDF(url);
      if(isit) {
        // let fileURL:string = `file://${path.join(__dirname, 'pdfjs', 'web', 'viewer.html')}?file=${decodeURIComponent(url)}`;
        let fileURL:string = PDFWindow.getFullURL(decodeURIComponent(url));
        Log.l(`PDFWindow.loadURL(): isPDF() returned true, trying to load '${fileURL}'...`);
        super.loadURL(fileURL, options);
      } else {
        Log.l(`PDFWindow.loadURL(): isPDF() returned false, trying to load '${url}'...`);
        super.loadURL(url, options);
      }
    } catch(err) {
      Log.l(`PDFWindow.loadURL(): Error loading url:`, url);
      Log.w(err);
      super.loadURL(url, options);
      // throw err;
    }
  }

  public static async addSupport(browserWindow:Electron.BrowserWindow):Promise<void> {
    Log.l(`PDFWindow.addSupport() called.`)
    try {
      browserWindow.webContents.on('will-navigate', (event:ElectronEvent, url:string) => {
        event.preventDefault();
        browserWindow.loadURL(url);
      });
  
      browserWindow.webContents.on('new-window', (event:ElectronEvent, url:string) => {
        event.preventDefault();
  
        (event as any).newGuest = new PDFWindow();
        (event as any).newGuest.loadURL(url);
      });
  
      const load = browserWindow.loadURL;

      const pdfLoadURL = async function(url:string, options?:electron.LoadURLOptions):Promise<void> {
        let isit:boolean = await PDFWindow.isPDF(url);
        if(isit) {
          // let fileURL:string = `file://${PDF_JS_PATH}?file=${decodeURIComponent(url)}`;
          let fileURL:string = PDFWindow.getFullURL(decodeURIComponent(url));
          Log.l(`PDFWindow.addSupport.loadURL(): isPDF() true, Trying to load file url '${fileURL}' ...`);
          load.call(browserWindow, fileURL, options);
        } else {
          Log.l(`PDFWindow.addSupport.loadURL(): isPDF() false, Trying to load file url '${url}' ...`);
          load.call(browserWindow, url, options);
        }
      };
      browserWindow.loadURL = pdfLoadURL;

    } catch(err) {
      Log.l(`PDFWindow.addSupport() (static): Error adding PDF support to existing BrowserWindow:`, browserWindow);
      Log.w(err);
      throw err;
    }
  }

  public static isAlreadyLoadedWithPdfJs(url:string):boolean {
    // return url.startsWith(`file://${PDF_JS_PATH}?file=`);
    let pdfURL:string = "file://.*viewer\.html.file";
    let res =  url.match(pdfURL);
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

  public static async isPDF(url:string):Promise<boolean> {
    try {
      let status:boolean = false;;
      if(PDFWindow.isAlreadyLoadedWithPdfJs(url)) {
        return status;
      } else if(PDFWindow.isFile(url)) {
        let mimeType:string = PDFWindow.getMimeOfFile(url);
        status = mimeType === 'application/pdf';
        return status;
      } else if(PDFWindow.hasPdfExtension(url)) {
        return true;
      } else {
        let res = await got.head(url);
        if(res && res.headers && res.headers.location) {
          let location = res.headers.location;
          let isit:boolean = await PDFWindow.isPDF(location);
          return isit;
        } else {
          let contentType:string = res && res.headers && typeof res.headers['content-type'] === 'string' ? res.headers['content-type'] : "unknown";
          return contentType.indexOf('application/pdf') !== -1;
        }
      }
    } catch(err) {
      Log.l(`PDFWindow.isPDF(): Error checking for PDF status of url '${url}'`);
      Log.w(err);
      throw err;
    }
  }

  public static getBaseURL():string {
    let filePath:string = "";
    // if(isRenderer) {
      // filePath = electronRemote.app.getAppPath();
      // } else {
        // filePath = electron.app.getAppPath();
        // }
    filePath = electronRemote.app.getAppPath();
    return filePath;
  }

  public static getViewerURL():string {
    // let parsedURL = WHATWG.parseURL(pdfFile);
    let base:string = PDFWindow.getBaseURL();
    let viewerPath:string = path.join(base, 'www', 'pdfjs', 'web', 'viewer.html')
    // let parsedURL = WHATWG.parseURL(viewerPath);
    if(viewerPath.startsWith('/')) {
      viewerPath = "file://" + viewerPath;
    }
    let parsedURL:URL = new URL(viewerPath);
    let fileURL:string = viewerPath;
    // if(!(parsedURL && parsedURL.scheme && parsedURL.scheme === 'file')) {
    //   fileURL = new WHATWG.URL(`file:///${viewerPath}`).href;
    // }
    if(!(parsedURL && parsedURL.protocol && parsedURL.protocol === 'file:')) {
      // fileURL = new URL(`file:///${viewerPath}`).href;
      fileURL = parsedURL.href;
    }
    return fileURL;
  }

  public static getFullURL(pdfFile:string):string {
    let viewerURL:string = PDFWindow.getViewerURL();
    let url:string = `${viewerURL}?file=${pdfFile}`;
    return url;
  }

}

