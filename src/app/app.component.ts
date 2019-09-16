// import { JSONPath                                                          } from 'domain/onsitexdomain'          ;
// import * as CSS from 'css';
import * as path from 'path';
import 'screw-filereader';
import { tap, map, last, catchError,                                       } from 'rxjs/operators'                ;
import { Subscription, throwError,                                         } from 'rxjs'                          ;
import { Component, ViewChild, OnInit, OnDestroy, EventEmitter, ElementRef } from '@angular/core'                 ;
import { NgZone, Renderer, AfterViewInit, ApplicationRef,                  } from '@angular/core'                 ;
import { ComponentFactoryResolver, ViewContainerRef, ApplicationInitStatus } from '@angular/core'                 ;
import { ChangeDetectorRef,                                                } from '@angular/core'                 ;
import { HttpClient, HttpRequest, HttpEvent, HttpErrorResponse,            } from '@angular/common/http'          ;
import { HttpEventType, HttpResponse,                                      } from '@angular/common/http'          ;
import { trigger, transition, animate, style, query, animateChild, state,  } from '@angular/animations'           ;
import { group, useAnimation, stagger,                                     } from '@angular/animations'           ;
import { Nav, Platform, MenuController, ModalController,                   } from 'ionic-angular'                 ;
import { NavOptions,                                                       } from 'ionic-angular'                 ;
import { ModalOptions,                                                     } from 'ionic-angular'                 ;
import { Loading                                                           } from 'ionic-angular'                 ;
import { Log, CONSOLE, moment, Moment, oo, JSON5, blobUtil, Duration,      } from 'domain/onsitexdomain'          ;
import { ooPatch, ooPointer, sizeOf, round, roundMaxDecimals,              } from 'domain/onsitexdomain'          ;
import { Employee, Shift, Invoice, DPS, PreAuth,                           } from 'domain/onsitexdomain'          ;
import { Jobsite, Address, Street, OnSiteGeolocation, Schedule, Schedules, } from 'domain/onsitexdomain'          ;
import { Timesheet,                                                        } from 'domain/onsitexdomain'          ;
import { PayrollPeriod                                                     } from 'domain/onsitexdomain'          ;
import { PayrollPeriods                                                    } from 'domain/onsitexdomain'          ;
import { Message                                                           } from 'domain/onsitexdomain'          ;
import { Jobsites,                                                         } from 'domain/onsitexdomain'          ;
import { Report,                                                           } from 'domain/onsitexdomain'          ;
import { ReportOther,                                                      } from 'domain/onsitexdomain'          ;
import { ReportLogistics,                                                  } from 'domain/onsitexdomain'          ;
import { ReportDriving,                                                    } from 'domain/onsitexdomain'          ;
import { ReportMaintenance,                                                } from 'domain/onsitexdomain'          ;
import { ReportTimeCard,                                                   } from 'domain/onsitexdomain'          ;
// import { ScheduleBeta,                                                     } from 'domain/onsitexdomain'          ;
import { OnSiteCoordinates, OnSiteGeoposition,                             } from 'domain/onsitexdomain'          ;
import { LatLng, LatLonLiteral,                                            } from 'domain/onsitexdomain'          ;
import { DatabaseProgress,                                                 } from 'domain/onsitexdomain'          ;
import { SESAShift                                                         } from 'domain/onsitexdomain'          ;
// import { Employee as NewEmployee,                                          } from 'domain/newdomain'              ;
// import { Jobsite as NewJobsite,                                            } from 'domain/newdomain'              ;
// import { Street as NewStreet,                                              } from 'domain/newdomain'              ;
// import { Address as NewAddress,                                            } from 'domain/newdomain'              ;
// import { Report as NewReport,                                              } from 'domain/newdomain'              ;
// import { SESAClient as NewSESAClient,                                      } from 'domain/newdomain'              ;
// import { SESALocation as NewSESALocation,                                  } from 'domain/newdomain'              ;
// import { SESALocID as NewSESALocID,                                        } from 'domain/newdomain'              ;
// import { SESACLL as NewSESACLL,                                            } from 'domain/newdomain'              ;
// import { SESAShift as NewSESAShift,                                        } from 'domain/newdomain'              ;
// import { SESAShiftLength as NewSESAShiftLength,                            } from 'domain/newdomain'              ;
// import { SESAShiftStartTime as NewSESAShiftStartTime,                      } from 'domain/newdomain'              ;
// import { SESAShiftSymbols as NewSESAShiftSymbols,                          } from 'domain/newdomain'              ;
// import { SESAShiftRotation as NewSESAShiftRotation,                        } from 'domain/newdomain'              ;
// import { SESAReportType as NewSESAReportType,                              } from 'domain/newdomain'              ;
// import { SESATrainingType as NewSESATrainingType,                          } from 'domain/newdomain'              ;
import { OSData                                                            } from 'providers/data-service'        ;
import { Preferences, DatabaseKey,                                         } from 'providers/preferences'         ;
import { AuthService                                                       } from 'providers/auth-service'        ;
import { StorageService                                                    } from 'providers/storage-service'     ;
import { PouchDBService                                                    } from 'providers/pouchdb-service'     ;
import { DBService                                                         } from 'providers/db-service'          ;
import { ServerService                                                     } from 'providers/server-service'      ;
import { ScriptService                                                     } from 'providers/script-service'      ;
import { AlertService                                                      } from 'providers/alert-service'       ;
import { SmartAudio                                                        } from 'providers/smart-audio'         ;
import { NumberService                                                     } from 'providers/number-service'      ;
import { InvoiceService                                                    } from 'providers/invoice-service'     ;
import { DispatchService, AppEvents,                                       } from 'providers/dispatch-service'    ;
import { Command, KeyCommandService                                        } from 'providers/key-command-service' ;
// import { WebWorkerService                                                  } from 'angular2-web-worker'           ;
// import { OverlayPanel,                                                     } from 'primeng/overlaypanel'          ;
// import { Dialog,                                                           } from 'primeng/dialog'                ;
import { PanelMenu                                                         } from 'primeng/panelmenu'             ;
import { MenuItem                                                          } from 'primeng/api'                   ;
import { NotifyService                                                     } from 'providers/notify-service'      ;
// import { NotificationComponent                                             } from 'components/notification'       ;
import { FindInPageComponent                                               } from 'components/find-in-page'       ;
import { LoginComponent                                                    } from 'components/login/login'        ;
import { OptionsComponent                                                  } from 'components/options/options'    ;
import { SpinnerComponent                                                  } from 'components/spinner/spinner'    ;
import { SpinnerService                                                    } from 'providers/spinner-service'     ;
import { LoaderService                                                     } from 'providers/loader-service'      ;
import { MenuService                                                       } from 'providers/menu-service'        ;
// import { DatabaseProgressComponent                                         } from 'components/database-progress'  ;
import { DatabaseStatusComponent                                           } from 'components/database-status'  ;
import { ElectronService                                                   } from 'providers/electron-service'    ;
import { DomainService                                                     } from 'providers/domain-service'      ;
import { MessageService as ToastService                                    } from 'primeng/api'                   ;
// import { JsonEditorOptions                                                 } from 'ang-jsoneditor'                ;
import { FileSaverSaveAs } from 'domain/onsitexdomain';

import fetchProgress from 'fetch-progress';
import * as JSZip from 'jszip';
import * as gracefulfs from 'graceful-fs';
// import * as Mousetrap from 'mousetrap';

declare const window:any;

/* Two variables for google charts */
// export var googleLoaded = false;
// export var googleChartsPackagesToLoad = ['corechart'];

export const environment = {
  VERSION: require('../../package.json').version,
};
declare const global:any;

@Component({
  templateUrl: 'app.html',
  animations: [
    // trigger('menuButtonTrigger', [
    //   transition('* => *', [
    //     query('@openSubmenuTrigger',[
    //       // stagger(100, [
    //         animateChild()
    //       // ])
    //     ], {optional: true}),
    //     query('@rotateArrowTrigger',[
    //       stagger(200, [
    //         animateChild()
    //       ])
    //     ], {optional: true}),
    //   ])
    // ]),
    // trigger("rotateArrowTrigger", [
    //   state("right, void", style({'transform': 'rotate(0deg)'})),
    //   state("down", style({'transform': 'rotate(90deg)'})),
    //   transition('* => down', [
    //     animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'
    //       // ,style({'transform': 'rotate(90deg)'})
    //     )
    //   ]),
    //   transition('down => right, down => void', [
    //     animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'
    //     // ,style({'transform': 'rotate(0deg)'})
    //     )
    //   ])
    // ]),
    trigger("openSubmenuTrigger", [
      state("closed, void", style({'max-height': 0, 'padding-top': 0, 'padding-bottom': 0})),
      state("open", style({'max-height': '1000px', 'padding-top': '10px', 'padding-bottom': '10px'})),
      transition('* => open', [
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'
        )
      ]),
      transition('open => closed, open => void', [
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'
        // ,style({'max-height': 0, 'padding-top': 0, 'padding-bottom': 0})
        )
        // group([
        //   query('.submenu-wrapper', [
        //     animate(
        //       '400ms cubic-bezier(0.86, 0, 0.07, 1)',
        //       style({'max-height': 0, 'padding-top': 0, 'padding-bottom': 0}),
        //     )
        //   ], { optional: true}),
        //   query('.menu-icon-right', [
        //     // style({'max-height': 0, 'padding-top': 0, 'padding-bottom': 0}),
        //     // animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
        //     animate(
        //       '400ms cubic-bezier(0.86, 0, 0.07, 1)',
        //       style({'transform': 'rotate(0deg)'})
        //     )
        //   ], { optional: true })
        // ])
      ])
    ])
  ]
})
export class OnSiteConsoleX implements OnInit,OnDestroy {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('mainPanelMenu') mainPanelMenu:PanelMenu;
  @ViewChild('spinnerTemplate', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;
  @ViewChild('confirmTarget') confirmTarget:ElementRef;
  // @ViewChild('loginDialog')     loginDialog:Dialog;
  @ViewChild('loginComponent') loginComponent:LoginComponent;
  // @ViewChild('notificationElement') notificationElement:NotificationComponent;
  @ViewChild('loginTarget') loginTarget:ElementRef;
  // @ViewChild('globalOptionsDialog') globalOptionsDialog:Dialog;
  @ViewChild('globalOptionsComponent') globalOptionsComponent:OptionsComponent;
  // @ViewChild('databaseProgressComponent') databaseProgressComponent:DatabaseProgressComponent;
  @ViewChild('databaseStatusComponent') databaseStatusComponent:DatabaseStatusComponent;
  @ViewChild('findInPageComponent') findInPageComponent:FindInPageComponent;
  // @ViewChild('jsonEditorComponent') jsonEditorComponent:JsonEditorComponent;
  public rootPage           : any                                ;
  public title              : string     = "OnSiteX Console";
  public iconDeveloper      : string     = "icomoon-experiment"  ;
  public menuEnabled        : boolean    = true                  ;
  public pages              : any                                ;
  public pageList           : any[] = []                         ;
  public pagesNested        : any[] = []                         ;
  public observe            : any                                ;
  public keySubscription    : Subscription                       ;
  public dsSubscription     : Subscription                       ;
  public appSubscription    : Subscription                       ;
  public optionsSub         : Subscription                       ;
  public currentlyLoggedIn  : boolean     = false                ;
  public u                  : string      = ""                   ;
  public p                  : string      = ""                   ;
  public static initializing: boolean     = false                ;
  public static initialized : boolean     = false                ;
  public static loading     : any                                ;
  public get loading():any { return OnSiteConsoleX.loading;}     ;
  public set loading(val:any) { OnSiteConsoleX.loading = val; }  ;
  public scheduleStartDate     : Date                            ;
  public invalidDates          : Date[] = []                     ;
  public minDate               : Date                            ;
  public maxDate               : Date                            ;
  public requireLogin          : boolean     = false             ;
  public globalOptionsType     : string      = "global"          ;
  public globalOptionsVisible  : boolean     = false             ;
  public tooltipDelay          : number      = 500               ;
  public immutableNotify       : boolean     = true              ;
  public showNotificationComp  : boolean     = false             ;
  public showNotificationsComp : boolean     = true              ;
  public showNoticesComponent  : boolean     = true              ;
  public spinnerOn             : boolean     = false             ;
  public isDeveloper           : boolean     = false             ;
  public searchVisible         : boolean     = false             ;
  public findVisible           : boolean     = false             ;
  public menuOpenTimeoutHandle  : any                            ;
  public menuCloseTimeoutHandle : any                            ;
  public menuOpenPause          : number   = 300                 ;
  public menuClosePause         : number   = 300                 ;
  public mainMenu:MenuItem[]               = []                  ;
  public mainMenuSeparators:MenuItem[]     = []                  ;
  public mainMenuStyle:any   = {width:'100%'}                    ;
  public pagesArray:any[] = []                                   ;
  public pagesAndSeparatorsArray:any[] = []                      ;
  // public appVersion       :string  = environment && environment.VERSION ? environment.VERSION : "x.y.z";
  public appVersion       :string  = "xx.yy.zz";
  public panelMenuEnabled :boolean = false                       ;
  public menuType         :string  = 'nested'                    ;
  public dbProgress       :any                                   ;
  public isFirstBoot      :boolean = false                       ;
  public progressVisible  :boolean = false                       ;
  public progressPaused   :boolean = false                       ;
  public dbDownloadPercentage:number = 0                         ;
  public downloadUpdateSize:number = 5                           ;
  public downloadStatus   :string  = ""                          ;
  public dbStatusVisible  :boolean = false                       ;
  public replicationStart :Moment                                ;
  public replicationEnd   :Moment                                ;
  public replicationTime  :Duration                              ;
  public elapsedTime      :Duration                              ;
  public toastEnabled     :boolean = true                        ;
  public toastPosition    : string = "top-right"                 ;
  public toastStyle       : any = {
    marginTop: '80px',
  };
  // public jsonEditorOptions:JsonEditorOptions = new JsonEditorOptions();
  public jsonData         :any;
  public jsonEditorVisible:boolean = false                       ;
  public jsonEditorDialogStyle:any = {
    overflow: 'visible',
  };
  public path = path;
  public fs   = gracefulfs;

  constructor(
    // public elementRef         : ElementRef               ,
    // public events             : Events                   ,
    public app                : ApplicationRef           ,
    public cdRef              : ChangeDetectorRef        ,
    public http               : HttpClient               ,
    public platform           : Platform                 ,
    public zone               : NgZone                   ,
    public compFactoryResover : ComponentFactoryResolver ,
    public renderer           : Renderer                 ,
    public modalCtrl          : ModalController          ,
    public menuCtrl           : MenuController           ,
    public prefs              : Preferences              ,
    public domainServ         : DomainService            ,
    public pouchdb            : PouchDBService           ,
    public menu               : MenuService              ,
    public audio              : SmartAudio               ,
    public auth               : AuthService              ,
    public data               : OSData                   ,
    public num                : NumberService            ,
    public storage            : StorageService           ,
    public db                 : DBService                ,
    public server             : ServerService            ,
    public scripts            : ScriptService            ,
    public alert              : AlertService             ,
    // public worker             : WebWorkerService         ,
    public notify             : NotifyService            ,
    public toast              : ToastService             ,
    public keyService         : KeyCommandService        ,
    public dispatch           : DispatchService          ,
    public invoiceService     : InvoiceService           ,
    public spinnerService     : SpinnerService           ,
    public loader             : LoaderService            ,
    public electron           : ElectronService          ,
  ) {
    Log.l("OnSiteConsoleX: app.component.ts constructor() called!");
    this.appVersion = environment.VERSION;
    // this.jsonEditorOptions.modes = [ 'code', 'text', 'tree', 'view' ];
    this.jsonData = this.prefs.getPrefs();
    this.createConsoleObjects();
    this.electron.defaultTitle = `OnSiteConsoleX ${this.appVersion}`;
  }

  ngOnInit() {
    Log.l("OnSiteX Console: ngOnInit() called.");
    if (!OnSiteConsoleX.initializing && !OnSiteConsoleX.initialized) {
      OnSiteConsoleX.initializing = true;
      this.initializeApp();
    }
  }

  ngOnDestroy() {
    Log.l("OnSiteX Console: ngOnDestroy() called.");
    this.server.cancelAllSyncs();
    this.cancelSubscriptions();
  }

  public createConsoleObjects() {
    let g:any;
    if(typeof window === 'object') {
      g = window;
    } else if(typeof global === 'object') {
      g = global;
    }
    g['consoleapp']       = this;
    g['onsiteconsole']    = this;
    g[ 'moment' ]         = moment;
    g[ 'Log'    ]         = Log;
    g[ 't1'     ]         = CONSOLE.t1;
    g[ 'c1'     ]         = CONSOLE.c1;
    // g['PouchDB']          = this.pouchdb.PouchInit();
    g['JSON5']            = JSON5;
    g['json5']            = JSON5;
    g['ooPatch']          = ooPatch;
    g['ooPointer']        = ooPointer;
    // g['jsonpath']         = JSONPath;
    g['blobUtil']         = blobUtil;
    g['round']            = round;
    g['roundMaxDecimals'] = roundMaxDecimals;
    g['fetchProgress']    = fetchProgress;
    // g['unzipper']         = unzipper;
    // g['streamSaver']      = streamSaver;
    // g['tar']              = tar;
    // g['gunzip']           = gunzip;
    g['JSZip']            = JSZip;
    g['gracefulfs']       = gracefulfs;
    // g['css']              = CSS;

    let classes:any = g['onsitedebug'] || {};
    classes['Address']           = Address           ;
    classes['Comment']           = Comment           ;
    classes['DPS']               = DPS               ;
    classes['Employee']          = Employee          ;
    classes['Invoice']           = Invoice           ;
    classes['Jobsite']           = Jobsite           ;
    classes['Jobsites']          = Jobsites          ;
    classes['Message']           = Message           ;
    classes['PayrollPeriod']     = PayrollPeriod     ;
    classes['PayrollPeriods']    = PayrollPeriods    ;
    classes['PreAuth']           = PreAuth           ;
    classes['Report']            = Report            ;
    classes['ReportLogistics']   = ReportLogistics   ;
    classes['ReportOther']       = ReportOther       ;
    classes['Schedule']          = Schedule          ;
    // classes['ScheduleBeta']      = ScheduleBeta      ;
    classes['Schedules']         = Schedules         ;
    classes['Shift']             = Shift             ;
    classes['Street']            = Street            ;
    classes['Timesheet']         = Timesheet         ;

    classes['Geolocation']       = OnSiteGeolocation  ;
    classes['OnSiteGeolocation'] = OnSiteGeolocation  ;
    classes['Coordinates']       = OnSiteCoordinates  ;
    classes['Geoposition']       = OnSiteGeoposition  ;
    classes['OnSiteGeoposition'] = OnSiteGeoposition  ;
    classes['Location']          = OnSiteGeolocation  ;
    classes['Position']          = OnSiteGeoposition  ;
    classes['LatLng']            = LatLng             ;
    classes['SESAShift']         = SESAShift          ;

    g['onsitedebug']    = classes;
    g['consoleobjects'] = classes;
    g['consoleclasses'] = classes;

    // let newClasses:any = g['newdebug'] || {};
    // newClasses['Employee']           = NewEmployee           ;
    // newClasses['Address']            = NewAddress            ;
    // newClasses['Street']             = NewStreet             ;
    // newClasses['Report']             = NewReport             ;
    // newClasses['Jobsite']            = NewJobsite            ;
    // newClasses['SESAClient']         = NewSESAClient         ;
    // newClasses['SESALocation']       = NewSESALocation       ;
    // newClasses['SESALocID']          = NewSESALocID          ;
    // newClasses['SESACLL']            = NewSESACLL            ;
    // newClasses['SESAShift']          = NewSESAShift          ;
    // newClasses['SESAShiftLength']    = NewSESAShiftLength    ;
    // newClasses['SESAShiftStartTime'] = NewSESAShiftStartTime ;
    // newClasses['SESAShiftSymbols']   = NewSESAShiftSymbols   ;
    // newClasses['SESAShiftRotation']  = NewSESAShiftRotation  ;
    // newClasses['SESAReportType']     = NewSESAReportType     ;
    // newClasses['SESATrainingType']   = NewSESATrainingType   ;

    // g['newdebug'] = newClasses;
    g['t'] = this;

    this.initializeGoogleVariables();
  }

  public initializeGoogleVariables() {
    let g:any;
    if(window) {
      g = window;
    } else if(global) {
      g = global;
    }
    g['googleLoaded'] = false;
    g['googleChartsPackagesToLoad'] = ['corechart'];
  }

  public async initializeApp() {
    try {
      let res:any = await this.platform.ready();
      Log.l("OnSiteX Console: initializeApp() running. Now initializing PouchDB …");
      this.electron.setApp(this);
      // this.initializeWindow();
      this.initializeSubscriptions();
      Log.l("initializeApp(): PouchDB initialized!");
      this.initializeMenu();
      this.loader.setRootViewContainerRef(this.viewContainerRef);
      this.electron.createStartupMenus();
      // this.electron.registerWindowStateKeeper();
      // this.initializeRestOfApp();
      res = await this.checkAndUpdatePreferences();
      res = await this.checkForInitialLoad();
      return true;
    } catch(err) {
      Log.l(`initializeApp(): Error initializing app!`);
      Log.e(err);
      let title:string = "STARTUP ERROR";
      let text:string = "There was an error starting up";
      if(err.type === 'OpenError') {
        title= "DATABASE LOCKED";
        text = "The app's database files are currently locked. This almost always means you have another instance of the app open. Please close this window and use the other instance of the app. If you cannot find one, please reboot your computer.";
        let out:any = await this.alert.showAlertPromise(title, text);
      } else {
        let out:any = await this.alert.showErrorMessage(title, text, err);
      }
      if(this['electron']) {
        this.exitApp();
      }
      // throw err;
      return false;
    }
  }

  public initializeSubscriptions() {
    if(window && window.Mousetrap) {
      window.Mousetrap.bind(['ctrl+f', 'command+f'], (e:any) => {
        Log.l(`Window Shortcut received: search`);
        if(this.findVisible && this.findInPageComponent) {
          this.findInPageComponent.focusOnFindInput();
        } else {
          this.toggleFindInPage(true);
        }
      });
      window.Mousetrap.bind(['ctrl+shift+f', 'command+shift+f'], (e:any) => {
        Log.l(`Window Shortcut received: search with devtools`);
        if(this.findVisible && this.findInPageComponent) {
          this.findInPageComponent.focusOnFindInput();
        } else {
          this.toggleFindInPage(true);
        }
      });
    }
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "OnSiteConsoleX.showOptions" : this.showOptions(); break;
        // case "OnSiteConsoleX.showSearch" : this.showSearch(); break;
        // case "OnSiteConsoleX.hideSearch" : this.hideSearch(); break;
        case "OnSiteConsoleX.showSearch" : this.toggleFindInPage(true); break;
        // case "OnSiteConsoleX.hideSearch" : this.hideSearch(); break;
      }
    });

    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe((data:{type:DatabaseKey, payload:any}) => {
      let key = data.type;
      let payload = data.payload;
      if(key === 'reports' || key.includes('ver101100')) {
        this.data.setData('reports', payload);
      }
    });

    this.appSubscription = this.dispatch.appEventFired().subscribe((eventdata:{channel:AppEvents, event?:any}) => {
      // Log.l(`appSubscription: received event:\n`, data);
      if(eventdata) {
        let channel:AppEvents = eventdata.channel;
        let event:Event|MouseEvent|KeyboardEvent = eventdata && eventdata.event && eventdata.event.event ? eventdata.event.event : eventdata && eventdata.event ? eventdata.event : null;
        let data:any =  eventdata && eventdata.event && eventdata.event.data ? eventdata.event.data : eventdata && eventdata.event ? eventdata.event : null;

        if(channel === 'openpage') {
          let event = eventdata.event ? eventdata.event : null;
          Log.l(`AppComponent: Received event 'openpage':`, event);
          if(eventdata && eventdata.event && eventdata.event.page) {
            let pageData = eventdata.event;
            let page:string = pageData.page;
            let mode:boolean = pageData['modal'] ? pageData.modal : false;
            let navParams:any = pageData['params'] != undefined ? pageData.params : false;
            if(navParams) {
              if(pageData['navOptions'] != undefined) {
                let options:NavOptions = pageData['navOptions'];
                this.openPage(page, mode, navParams, options);
              } else {
                this.openPage(page, mode, navParams);
              }
            } else {
              this.openPage(page, mode);
            }
          } else {
            Log.w(`AppComponent: unable to open page, no page provided in data packet:`, event);
            this.notify.addWarning('NO PAGE', `Invalid page provided: ${JSON.stringify(eventdata['event'])}`, 3000)
          }
        } else if(channel === 'find-in-page') {
          Log.l(`AppComponent: Received event 'find-in-page' …`);
          this.toggleFindInPage(true);
        } else if(channel === 'changedetection') {
          Log.l(`AppComponent: Received event 'changedetection' …`);
          this.fireAppTick();
        } else if(channel === 'toggledevmode') {
          Log.l(`AppComponent: Received event 'toggledevmode' …`);
          this.toggleDeveloperMode();
        } else if(channel === 'showdbstatus') {
          Log.l(`AppComponent: Received event 'showdbstatus' …`);
          this.showDBStatus(event);
        } else if(channel === 'reinitializedb') {
          Log.l(`AppComponent: Received event 'reinitializedb' …`);
          this.reinitializeDatabases();
          // this.showDBStatus(event);
        } else if(channel === 'updatefromdb' || channel === 'updatefromserver') {
          Log.l(`AppComponent: Received event '${channel}' …`);
          let dbtype:DatabaseKey = data && data.db ? data.db : null;

          if(dbtype) {
            if(dbtype === 'reports') {
              let count = data && data.count && typeof data.count === 'number' ? data.count : 1000000;
              this.getReports(count);
            } else if(dbtype === 'reports_other') {
              this.getReportOthers();
            } else if(dbtype === 'logistics') {
              this.getReportLogistics();
            } else if(dbtype === 'drivings') {
              this.getReportDrivings();
            } else if(dbtype === 'maintenances') {
              this.getReportMaintenances();
            } else if(dbtype === 'scheduling') {
              let server = data && data.server && typeof data.server === 'boolean' ? data.server : false;
              this.getSchedulesFromDatabase(server);
            }
          } 
        } else if(channel === 'downloaddb') {
          Log.l(`AppComponent: Received event 'downloaddb' …`);
          this.showDBStatus(event);
        // } else if(channel === 'optionsopened') {
          // Log.l(`AppComponent: Received event 'optionsopened' …`);
        // } else if(channel === 'optionsclosed') {
          // Log.l(`AppComponent: Received event 'optionsclosed' …`);
        } else if(channel === 'saveprefs') {
          Log.l(`AppComponent: Received event 'saveprefs' …`);
          this.savePreferences();
        } else if(channel === 'replicationerror') {
          let dbname:string = data && data.event ? data.event : "UNKNOWN";
          Log.l(`AppComponent: Received event 'replicationerror' for '${dbname}' …`);
          this.notify.addError("ERROR", `Replication error for database '${dbname}'. Replication will retry.`, 5000);
        } else if(channel === 'elapsedtime') {
          Log.l(`AppComponent: Received event 'elapsedtime' …`);

        } else if(channel === 'logout') {
          Log.l(`AppComponent: Received event 'logout' …`);
          this.logoutClicked();
        } else if(channel === 'login') {
          Log.l(`AppComponent: Received event 'login' …`);
          this.showLogin();
        } else if(channel === 'authenticate') {
          Log.l(`AppComponent: Received event 'authenticate' …`);
          this.reauthenticate();
        } else if(channel === 'updatedata') {
          Log.l(`AppComponent: Received event 'updatedata' …`);
          this.updateData();
        } else if(channel === 'updatelogistics') {
          Log.l(`AppComponent: Received event 'updatelogistics' …`);
          this.updateLogistics();
        } else if(channel === 'updatetimecards') {
          Log.l(`AppComponent: Received event 'updatetimecards' …`);
          this.updateTimeCards();
        } else if(channel === 'options') {
          Log.l(`AppComponent: Received event 'options' …`);
          let type = eventdata.event;
          this.showOptions(type);
        } else if(channel === 'testnotifications') {
          Log.l(`AppComponent: Received event 'testnotifications' …`);
          this.testNotifications();
        } else if(channel === 'replicationcomplete') {
          // let dbname = data && data.event && data.event.db ? data.event.db : "UNKNOWN";
          // Log.l(`AppComponent: Received event 'replicationcomplete' for '${dbname}' …`);
          // this.databaseUpdated(dbname);
        }
      }
    });

    this.optionsSub = this.dispatch.optionsShown().subscribe((type:string) => {
      this.showOptions(type);
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
    if(this.dsSubscription && !this.dsSubscription.closed) {
      this.dsSubscription.unsubscribe();
    }
    if(this.appSubscription && !this.appSubscription.closed) {
      this.appSubscription.unsubscribe();
    }
    if(this.optionsSub && !this.optionsSub.closed) {
      this.optionsSub.unsubscribe();
    }
  }

  public async checkForInitialLoad() {
    try {
      let res:any;
      let isFirstLogin:boolean = await this.isFirstLogin();
      if(isFirstLogin) {
        Log.l(`checkForInitialLoad(): This is an initial load. Asking user confirmation to continue.`);
        let title:string = "FIRST LOGIN";
        let text:string  = `No databases have been found. The app may have been updated or freshly installed. Databases need to be downloaded and saved to this computer, which can take several minutes. Do you want to continue loading the app?`;
        let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
        if(confirm) {
          Log.l(`checkForInitialLoad(): User chose to continue, starting replication...`);
          res = await this.getSavedCredentials();
          res = await this.data.delay(500);
          this.showLogin();
        } else {
          let out:any = await this.alert.showAlert("NOT CONTINUING", "The app will not be loaded. Please restart later.");
          res = await this.data.delay(500);
          this.exitApp();
        }
      } else {
        Log.l(`checkForInitialLoad(): This is not an initial load. Continuing normally.`);
        res = await this.initializeRestOfApp();
        return res;
      }
    } catch(err) {
      Log.l(`checkForInitialLoad(): Error checking for initial boot!`);
      // Log.e(err);
      throw err;
    }
  }

  public async exitApp() {
    try {
      Log.l(`exitApp(): Attempting to exit app.`);
      if(this['electron']) {
        this['electron'].exitApp();
      } else {
        this.notify.addWarning("CAN'T EXIT", `This is a browser-based development version and cannot exit.`, 5000);
      }
      // return res;
    } catch(err) {
      Log.l(`exitApp(): Error exiting app!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error exiting app.`, 3000);
      // throw err;
    }
  }

  public async openPage(page:any, openAsModal:boolean, params?:any, options?:NavOptions|ModalOptions) {
    try {
      this.data.currentlyOpeningPage = true;
      this.prefs.CONSOLE.global.lastPage = page.page;
      let out:any = await this.quietSavePreferences();
      let navParams:any;
      let navOptions:NavOptions|ModalOptions;
      if(params != undefined) {
        navParams = params;
      } else {
        navParams = {};
      }
      if(options != undefined) {
        navOptions = options;
      } else {
        navOptions = {};
      }
      out = await this.menuCtrl.close();
      let pageTitle:string = page && page.page && typeof page.page === 'string' ? page.page.trim() : typeof page === 'string' ? page : 'OnSiteX Console';
      let modal:boolean = openAsModal ? true : false;
      Log.l(`openPage(): Opening page '${pageTitle}', modal mode: ${modal}`)
      if(openAsModal) {
        let out:any;
        navParams['modalMode'] = true;
        navParams['mode'] = 'modal';
        let options:any = navOptions;
        options.cssClass = 'modal-page';
        // let modal = this.modalCtrl.create(pageTitle, { modalMode: true, mode: 'modal' }, {cssClass: 'modal-page'});
        let modal = this.modalCtrl.create(pageTitle, navParams, options);
        modal.onDidDismiss((data) => {
          Log.l(`menuItemClick(): Modal page '${pageTitle}' dismissed. Returned data is\n`, data);
        });
        Log.l(`menuItemClick(): Opening page '${pageTitle}' as modal...`);
        modal.present();
      } else {
        if(params != undefined) {
          let options:any = navOptions;
          this.nav.setRoot(pageTitle, navParams, options);
        } else {
          this.nav.setRoot(pageTitle);
        }
      }
    } catch(err) {
      Log.l(`openPage(): Error opening page!`);
      Log.e(err);
      throw err;
    }
  }

  public initializeMenu() {
    let pagesNested = this.menu.generateMenuArray();
    this.pagesNested = pagesNested;
  }

  public generatePanelMenu(pageArray:any[]):MenuItem[] {
    let pages:any = this.pages;
    let menu:MenuItem[] = [];
    // let mainKeys:string[] = Object.keys(pages);
    // for(let key of mainKeys) {
    for(let record of pageArray) {
      let item:MenuItem = {};
      if(record['separator']) {
        item.separator = true;
        // menu.push(item);
      } else {
        // let pageRecord = pages[key];
        let pageRecord = record;
        item = {
          label: pageRecord.title,
        };
        if(!pageRecord.hasSubmenu) {
          item.command = (event) => {
            let thisItem = event.item;
            let title = thisItem.title;
            this.menu.menuItemClick(pageRecord);
          };
          if(pageRecord['icon'] && pageRecord['icon']['class']) {
            item.icon = pageRecord.icon.class;
          }
          if(pageRecord['tooltip']) {
            item.title = pageRecord.tooltip;
          }
          if(pageRecord['class']) {
            item.styleClass = pageRecord.class;
          }
          if(pageRecord['badge']) { item.badge = pageRecord.badge; } else { item.badge = "2"; }
          if(pageRecord['class']) { item.styleClass = pageRecord.class; } else { item.badgeStyleClass = "item-badge"; }
          if(pageRecord['role']) {
            if(pageRecord.role === 'dev') {
              item.visible = this.isDeveloperMenuVisible();
            } else {
              item.visible = true;
            }
          }
        } else {
          if(pageRecord['icon'] && pageRecord['icon']['class']) {
            item.icon = pageRecord.icon.class;
          }
          if(pageRecord['tooltip']) {
            item.title = pageRecord.tooltip;
          }
          if(pageRecord['class']) {
            item.styleClass = pageRecord.class;
          }
          if(pageRecord['badge']) { item.badge = pageRecord.badge; } else { item.badge = "2"; }
          if(pageRecord['class']) { item.styleClass = pageRecord.class; } else { item.badgeStyleClass = "item-badge"; }
          if(pageRecord['role']) {
            if(pageRecord.role === 'dev') {
              item.visible = this.isDeveloperMenuVisible();
            } else {
              item.visible = true;
            }
          }
          item.expanded = false;
          let subPages:any[] = pageRecord.submenu;
          let subMenu:MenuItem[] = [];
          for(let subpage of subPages) {
            let subitem:MenuItem = {
              label: subpage.title,
              command: (event) => {
                let thisItem = event.item;
                let title = thisItem.title;
                this.menu.menuItemClick(subpage, pageRecord);
              },
            };
            if(subpage['icon'] && subpage['icon']['class']) {
              subitem.icon = subpage.icon.class;
            }
            if(subpage['tooltip']) { subitem.title = subpage.tooltip; }
            if(subpage['class']) { subitem.styleClass = subpage.class; }
            if(subpage['badge']) { subitem.badge = subpage.badge; } else { subitem.badge = "2"; }
            if(subpage['class']) { subitem.styleClass = subpage.class; } else { subitem.badgeStyleClass = "subitem-badge"; }
            subMenu.push(subitem);
          }
          item.items = subMenu;
        }
      }
      menu.push(item);
    }
    return menu;
  }

  public isDeveloperMenuVisible():boolean {
    if(this.data && this.data.status && this.data.status.role) {
      let userRole = this.data.status.role;
      if(userRole === 'dev') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showSubmenuOf(item:any) {
    if(item && item['hasSubmenu'] && item['showSubMenu'] === false) {
      item.showSubMenu = true;
      item.style['max-height'] = '100px';
    }
  }

  public hideSubmenuOf(item:any) {
    if(item && item['hasSubmenu'] && item['showSubMenu'] === true) {
      item.showSubMenu = false;
      // item.style['max-height'] = '0px';
    }
  }

  public hideAllSubmenus() {
    for(let page of this.pageList) {
      this.hideSubmenuOf(page);
    }
  }

  public async initializeRestOfApp():Promise<any> {
    try {
      let res:any = await this.initializeData();
      Log.l("initializeRestOfApp(): initializeData() succeeeded! Now hiding spinner and setting root page and whatnot.");
      // this.alert.hideSpinner(spinnerID);
      OnSiteConsoleX.initialized = true;
      OnSiteConsoleX.initializing = false;
      this.electron.createMenus();
      if(!this.rootPage) {
        this.data.setReady(true);
        this.dispatch.setAppReady(true);
        this.electron.toggleDevModeTitle();
        let page:string = this.prefs.getStartupPage();
        if(page) {
          this.rootPage = page;
        } else {
          // this.rootPage = 'OnSiteX Console';
          this.goToHomePage();
        }
      } else {
        Log.l("initializeRestOfApp(): Hey, this.rootPage was already defined:", this.rootPage);
        Log.l("initializeRestOfApp(): initializeData() result is:\n", res);
        this.data.setReady(true);
        this.dispatch.setAppReady(true);
        this.electron.toggleDevModeTitle();
        // this.rootPage = this.rootPage || "OnSiteX Console";
        this.goToHomePage();
      }
      return true;
    } catch(err) {
      Log.l(`initializeRestOfApp(): Error during initializeData, probably!`);
      Log.e(err);
      OnSiteConsoleX.initialized = true;
      OnSiteConsoleX.initializing = false;
      this.data.setReady(true);
      this.dispatch.setAppReady(true);
      this.electron.toggleDevModeTitle();
      this.showLogin();
      return false;
    }
  }

  // public toggleDeveloperMode(event?:any) {
  //   this.data.toggleDeveloperMode();
  //   this.electron.createMenus();
  // }

  // public authenticateUser() {
  //   return new Promise((resolve,reject) => {

  //   });
  // }

  public async checkAndUpdatePreferences():Promise<any> {
    try {
      // let res:any = await someFunctionThatReturnsAPromise();
      Log.l("checkAndUpdatePreferences(): About to check preferences ...");
      let res:any = await this.checkPreferences();
      this.updateDateTimeFormats();
      return res;
    } catch(err) {
      Log.l(`checkAndUpdatePreferences(): Error checking and/or updating Preferences!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error checking preferences: '${err.message}'`, 5000);
      throw err;
    }
  }

  public async initializeData():Promise<any> {
    try {
      let res:any = await this.authenticate();
      Log.l("initializeApp: authenticated successfully.");
      this.spinnerService.setRootViewContainerRef(this.viewContainerRef);
      res = await this.syncData();
      if(this.prefs.CONSOLE.global.loadReports) {
        this.notify.addInfo("REPORTS", "Retrieving work reports...", 3000);
        // return new Promise((resolve2,reject2) => {
        //   setTimeout(() => {
        try {
          let count:number = this.prefs.getReportLoadCount();
          let reports = await this.getReports(count);
          Log.l("initializeApp: Successfully authenticated and logged in AND got reports.");
          res = await this.audio.preloadSounds();
        } catch(err) {
          Log.l(`initializeData(): Error retrieving reports!`);
          Log.e(err);
          throw err;
        }
      } else {
        Log.l("initializeApp: Successfully authenticated and logged in.");
        res = await this.audio.preloadSounds();
      }
      Log.l("initializeApp(): Successfully preloaded sounds:\n", res);
      let isDev = this.data.checkDeveloperStatus();
      // if(isDev) {
      //   this.addDeveloperOptions();
      // }
      Log.l("initializeApp(): Done initializing!");
      let out:any = {status: true, message: "initializeData() ran successfuly."};
      return out;
    } catch(err) {
      Log.l(`initializeData(): Error during data initialization!`);
      Log.e(err);
      throw err;
    }
  }

  public async reauthenticate(evt?:Event) {
    // let spinnerID:string;
    try {
      let res:any;
      if(this.menuCtrl.isOpen()) {
        res = await this.menuCtrl.close();
      }
      // spinnerID = await this.alert.showSpinnerPromise("Reauthenticating to server...");
      res = await this.authenticate();
      Log.l("reauthenticate(): success!");
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addSuccess("SUCCESS", `Successfully logged in to server`, 3000)
      return res;
    } catch(err) {
      Log.l(`reauthenticate(): Error during menu closing or reauthentication!`);
      Log.e(err);
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error during reauthentication: ${err.message}`, 10000);
      // throw err;
    }
  }

  public async isFirstLogin():Promise<boolean> {
    try {
      let firstBoot:boolean = false;
      if(firstBoot) {
        return true;
      } else {
        let dbname:string = this.prefs.getDB('jobsites');
        let db = this.db.addDB(dbname);
        let res = await db.info();
        if(res && res.doc_count != undefined && res.doc_count > 5) {
          return false;
        } else {
          await this.db.closeDB(dbname);
          return true;
        }
      }
    } catch(err) {
      Log.l(`isFirstLogin(): Error checking first login via PouchDB databases!`);
      // Log.e(err);
      throw err;
      // return true;
    }
  }

  public async initialReplication(evt?:Event):Promise<any> {
    try {
      Log.l(`initialReplication(): Called with arguments:\n`, arguments);
      return new Promise((resolve, reject) => {
        // let remoteTarArchiveURL:string = "http://sesafleetservices.com/onsitedb/onsiteconsolex.tar.gz";
        let remoteTarArchiveURL:string = "http://sesafleetservices.com/onsitedb/onsiteconsolex.db.zip";
        this.progressVisible = true;
        this.downloadStatus = "Downloading database ZIP file …";
        // let total:number = 50000000;
        // let total:number = 54755864;
        let total:number = 55226198;
        let requestOptions:any = {reportProgress: true, responseType: 'blob'};
        // let requestOptions:any = {reportProgress: true, responseType: 'json'};
        // let requestOptions:any = {reportProgress: true, responseType: 'arraybuffer'};
        // let requestOptions:any = {reportProgress: true, responseType: 'text'};
        const req:HttpRequest<null> = new HttpRequest('GET', remoteTarArchiveURL, requestOptions);
        Log.l(`initialReplication(): About to make request: `, req);
        let time:number = 0;
        let lastPercent:number = 0;
        let res = this.http.request(req).pipe(
          map((event:HttpEvent<any>) => {
            // if(time++ < 3) {
              // Log.l(`initialReplication(): On event ${time}, Request got event:\n`, event);
            // }
            switch (event.type) {
              case HttpEventType.Sent:
                return `Download started`;
              case HttpEventType.ResponseHeader:
                // Log.l(`initialReplication(): Got response header: `, event);
                return `Received response header event`;
              case HttpEventType.DownloadProgress:
              // Compute and show the % done:
                let totalBytes:number = event && typeof event.total === 'number' ? event.total : total;
                let percentDone:number = Math.round(1000 * event.loaded / totalBytes) / 10;
                if(percentDone >= 99 || percentDone - lastPercent >= this.downloadUpdateSize) {
                  this.dbDownloadPercentage = percentDone;
                  lastPercent = percentDone;
                }
                return `Download is ${percentDone}% finished.`;
              case HttpEventType.Response:
                // return `File download completed`;
                return event;
              default:
                return `Surprising download event: ${event.type}`;
            }
          }),
          tap(message => {
            // Log.l(`Download: progress message is:\n`, message);
          }),
          last(),
          catchError(this.handleError)
        );
        res.subscribe(async (res:HttpResponse<any>) => {
          try {
            Log.l(`initialReplication(): Download got response: `, res);
            let res2:any = await this.data.delay(1000);
            let blob:Blob = res.body;
            // let zipdir:string = this.electron.getDBDirAsPrefix();
            let zipFileName:string = 'onsiteconsolex.db.zip';
            let fileName:string = this.electron.getFullDataPathForFile(zipFileName);
            // let fileName:string = 'onsiteconsolex.tar.gz';
            // FileSaverSaveAs(blob, fileName);
            // FileSaverSaveAs(blob, 'onsiteconsolex.db.zip');
            // let res2:any = await tar.x({file: 'onsiteconsolex.tar.gz'});
            // let fileStream = streamSaver.createWriteStream(fileName);
            // let stream1:ReadableStream = blob.stream();
            // await blob.stream().pipeTo(fileStream);
            if(this.pouchdb.inElectron()) {
              this.downloadStatus = "Saving downloaded file …";
              // let fs = require('graceful-fs');
              let fs = gracefulfs;
              let abuffer:ArrayBuffer = await blob.arrayBuffer();
              let data:DataView = new DataView(abuffer);
              fs.writeFileSync(fileName, data);
              // fs.createReadStream(fileName).pipe(unzipper.Extract({ path: '.' }).on('close', (data:any) => {
              // fs.createReadStream(fileName).pipe(gunzip()).pipe(tar.extract('.')).on('close', (data:any) => {
              //   Log.l(`initialReplication(): ZIP file extracted. Resulting data:\n`, data);
              // });
              function getParentDir(filename:string):string {
                return path.basename(path.dirname(filename));
              }
              this.downloadStatus = "Extracting databases …";
              fs.readFile(fileName, async (err, data) => {
                if(!err) {
                  try {
                    let zip:JSZip = new JSZip();
                    let contents = await zip.loadAsync(data);
                    Log.l(`JSZIP: AFTER CREATION, ZIP FILE IS: `, zip);
                    let zipfiles = contents.files;
                    Log.l(`JSZIP: ZIP file contents: `, contents);
                    for(let filename in zipfiles) {
                      let basename:string = path.basename(filename);
                      // this.downloadStatus = `Extracting database '${filename}' …`;
                      this.downloadStatus = `Extracting database '${basename}' …`;
                      this.app.tick();
                      // await this.data.delay(300);
                      let zipfile = zipfiles[filename];
                      if(zipfile.dir) {
                        Log.l(`*** ====|) Attempting to create directory: '${filename}'`);
                        // this.createDirectoryIfNotExists(filename, zipdir);
                        this.createDirectoryIfNotExists(filename);
                      } else {
                        let content = await zip.file(filename).async('nodebuffer');
                        // let dest:string = path + filename;
                        let dest:string = filename;
                        dest = this.electron.getFullDataPathForFile(filename);
                        Log.l(`*** ======|] Attempting to save file to '${dest}'`);
                        fs.writeFileSync(dest, content);
                      }
                    }
                    this.progressVisible = false;
                    fs.unlinkSync(fileName);
                    resolve(true);
                  } catch(err2) {
                    Log.l(`*** =|> ERROR running JSZip utilities:`);
                    Log.e(err2);
                    // throw err2;
                    this.progressVisible = false;
                    reject(err2);
                  }
                } else {
                  Log.l(`initialReplication(): Read file '${fileName}' error:`);
                  Log.e(err);
                  // throw err;
                  this.progressVisible = false;
                  reject(err);
                }
              });
            }
          } catch(err) {
            this.progressVisible = false;
            Log.l(`initialReplication(): Error un-tarring downloaded archive`);
            Log.e(err);
            reject(err);
            // throw err;
          }
        });
        // return res.toPromise();
      });
          // return res2;
    } catch(err) {
      Log.l(`initialReplication(): Error during initial replication`);
      Log.e(err);
      throw err;
    }
  }

  public async reinitializeDatabases(evt?:Event):Promise<any> {
    try {
      Log.l(`reinitializeDatabases(): Called`);
      let res:any;
      res = await this.pouchdb.clearDatabaseDirectory();
      res = await this.initialReplication();
      // res = await this.syncData();
      res = await this.initializeRestOfApp();
      return res;
    } catch(err) {
      Log.l(`reinitializeDatabases(): Error reinitializing databases`);
      Log.e(err);
      throw err;
    }
  }
  
  

  public createDirectoryIfNotExists(directoryname:string) {
    let fs = gracefulfs;
    let dirToCreate:string = directoryname;
    try {
      dirToCreate = this.electron.getFullDataPathForFile(directoryname);
      fs.accessSync(dirToCreate);
      Log.l(`createDirectoryIfNotExists(): '${directoryname}' directory existed already. We coo'.`);
      return true;
    } catch(err) {
      try {
        Log.l(`createDirectoryIfNotExists(): Could not access '${directoryname}' directory, trying to create it ...`);
        fs.mkdirSync(dirToCreate, {recursive: true});
        return true;
      } catch(err2) {
        Log.l(`createDirectoryIfNotExists(): Error creating '${directoryname}' directory!`);
        Log.e(err2);
        return false;
        // throw err2;
      }
    }
  }

  // public async initialReplication3(evt?:Event):Promise<any> {
  //   try {
  //     Log.l(`initialReplication(): Called with arguments:\n`, arguments);
  //     let remoteTarArchiveURL:string = "http://sesafleetservices.com/onsitedb/onsiteconsolex.tar.gz";
  //     // let remoteTarArchiveURL:string = "http://sesafleetservices.com/onsitedb/onsiteconsolex.db.zip";
  //     let total:number = 50000000;
  //     let requestOptions:any = {reportProgress: true, responseType: 'blob'};
  //     // let requestOptions:any = {reportProgress: true, responseType: 'json'};
  //     // let requestOptions:any = {reportProgress: true, responseType: 'arraybuffer'};
  //     // let requestOptions:any = {reportProgress: true, responseType: 'text'};
  //     const req:HttpRequest<null> = new HttpRequest('GET', remoteTarArchiveURL, requestOptions);
  //     Log.l(`initialReplication(): About to make request: `, req);
  //     let time:number = 0;
  //     let res = this.http.request(req).pipe(
  //       map((event:HttpEvent<any>) => {
  //         if(time++ < 3) {
  //           Log.l(`initialReplication(): On event ${time}, Request got event:\n`, event);
  //         }
  //         switch (event.type) {
  //           case HttpEventType.Sent:
  //             return `Download started`;
  //           case HttpEventType.ResponseHeader:
  //             Log.l(`initialReplication(): Got response header: `, event);
  //             return `Received response header event`;
  //           case HttpEventType.DownloadProgress:
  //           // Compute and show the % done:
  //             const percentDone = Math.round(100 * event.loaded / total);
  //             return `Download is ${percentDone}% finished.`;
  //           case HttpEventType.Response:
  //             // return `File download completed`;
  //             return event;
  //           default:
  //             return `Surprising download event: ${event.type}`;
  //         }
  //       }),
  //       tap(message => {
  //         Log.l(`Download: progress message is:\n`, message);
  //       }),
  //       last(),
  //       catchError(this.handleError)
  //     );
  //     res.subscribe(async (res:HttpResponse<any>) => {
  //       try {
  //         Log.l(`initialReplication(): Download got response: `, res);
  //         let blob:Blob = res.body;
  //         // let fileName:string = 'onsiteconsolex.db.zip';
  //         let fileName:string = 'onsiteconsolex.tar.gz';
  //         FileSaverSaveAs(blob, fileName);
  //         // FileSaverSaveAs(blob, 'onsiteconsolex.db.zip');
  //         // let res2:any = await tar.x({file: 'onsiteconsolex.tar.gz'});
  //         if(isElectron()) {
  //           let fs = require('graceful-fs');
  //           // fs.createReadStream(fileName).pipe(unzipper.Extract({ path: '.' }).on('close', (data:any) => {
  //           fs.createReadStream(fileName).pipe(gunzip()).pipe(tar.extract('.')).on('close', (data:any) => {
  //             Log.l(`initialReplication(): ZIP file extracted. Resulting data:\n`, data);
  //           });
  //         }

  //         // return res2;
  //       } catch(err) {
  //         Log.l(`initialReplication(): Error un-tarring downloaded archive`);
  //         Log.e(err);
  //         throw err;
  //       }
  //     });
  //     // return res.toPromise();
  //   } catch(err) {
  //     Log.l(`initialReplication(): Error during initial replication`);
  //     Log.e(err);
  //     throw err;
  //   }
  // }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // console.error('An error occurred:', error.error.message);
      console.error('An error occurred:', error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      Log.l(`handleError(): Backend error:`);
      Log.e(error);
      // console.error(
      //   `Backend returned code ${error.status}, ` +
      //   `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };



  // public async initialReplication2(dbnames?:string[]) {
  //   try {
  //     let names:string[] = Array.isArray(dbnames) ? dbnames : this.prefs.getSyncableDBList();
  //     Log.l(`initialReplication(): Replicating from data:\n`, names);
  //     let promises:Promise<any>[] = [];
  //     let dbProgress:any = {};
  //     for(let dbname of names) {
  //       Log.l(`initialReplication(): about to initially replicate '${dbname}'...`);
  //       let progressObject:DatabaseProgress = new DatabaseProgress({dbname:dbname});
  //       dbProgress[dbname] = progressObject;
  //       let promise:Promise<any> = this.server.replicateFromServer(dbname, 200, progressObject);
  //       promises.push(promise);
  //       // let spinnerID = await this.alert.showSpinnerPromise(`Downloading '${dbname}...'`);
  //       // let res:any = await this.server.replicateFromServer(dbname, 100, spinnerID);

  //       // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
  //     }
  //     this.dbProgress = dbProgress;
  //     // this.replicationStart = moment();
  //     this.progressVisible = true;
  //     this.dispatch.triggerAppEvent('starttime');
  //     let allRes:any = await Promise.all(promises);
  //     this.progressVisible = false;
  //     this.notify.addSuccess("SUCCESS", `Initial replication succeeded!`, 3000);
  //   } catch(err) {
  //     Log.l(`initialReplication(): Error during initial replication!`);
  //     Log.e(err);
  //     this.notify.addError("ERROR", `Error in initial replication: ${err.message}`, 5000);
  //     // throw err;
  //   }
  // }

  public createDBProgress():any {
    let dbnames:string[] = this.prefs.getSyncableDBList();
    Log.l(`createDBProgress(): Creating DBProgress object...`);
    if(sizeOf(this.dbProgress) > 0) {
      Log.l(`createDBProgress(): dbProgress already exists. Using that one.`);
      return this.dbProgress;
    } else {
      let dbProgress:any = {};
      for(let dbname of dbnames) {
        let progressObject:DatabaseProgress = new DatabaseProgress({dbname:dbname});
        dbProgress[dbname] = progressObject;
      }
      this.dbProgress = dbProgress;
      Log.l(`createDBProgress(): resulting dbProgress object is:\n`, dbProgress);
      return dbProgress;
    }
  }

  public showProgress(evt?:Event) {
    this.createDBProgress();
    this.progressVisible = true;
  }

  public hideProgress(evt?:Event) {
    this.progressVisible = false;
  }

  public toggleProgress(evt?:Event) {
    if(this.progressVisible) {
      this.hideProgress();
    } else {
      this.showProgress();
    }
  }

  public async updateData(evt?:Event):Promise<any> {
    let spinnerID:string;
    try {
      let res:any;
      if(this.menuCtrl.isOpen()) {
        let out:any = await this.menuCtrl.close();
      }
      let count:number = 0, queued:number = 0;
      // count = await this.server.getDocCount('reports');
      count = await this.db.getDBDocCount('reports');
      if(this.prefs.CONSOLE.global.reportsToLoad) {
        queued = this.prefs.CONSOLE.global.reportsToLoad;
      } else {
        queued = count || 1000000;
      }
      let text:string = `Retrieving ${count} work reports`;
      if(queued > 0 && queued !== 1000000) {
        text += ` (${count} total)`;
      }
      text += ' …';
      spinnerID = await this.alert.showSpinnerPromise(text);
      let fetchCount:number = queued;
      res = await this.getReports(fetchCount, spinnerID);
      // let newReports:Report[] = res;
      this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return res;
    } catch(err) {
      Log.l(`updateData(): Error getting updated data!`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 4000);
      throw err;
    }
    // this.menu.close().then(res => {
    //   return this.data.getReports();
    // }).then(res => {
    //   this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
    // }).catch(err => {
    //   Log.l("openPage(): Error updating data!");
    //   Log.e(err);
    //   this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
    // });
  }

  public async updateLogistics(evt?:Event):Promise<any> {
    let spinnerID;
    try {
      Log.l(`updateLogistics(): Called with arguments:\n`, arguments);
      let res:any;
      if(this.menuCtrl.isOpen()) {
        let out:any = await this.menuCtrl.close();
      }
      let count:number  = 0;
      let queued:number = 0;

      count = await this.server.getDocCount('logistics');
      queued = count || 1000000;
      let text:string = `Retrieving ${count} logistics reports`;
      if(queued > 0 && queued !== 1000000) {
        text += ` (${count} total)`;
      }
      text += ' ...';
      spinnerID = await this.alert.showSpinnerPromise(text);
      let fetchCount:number = queued;
      res = await this.db.getLogisticsReports(fetchCount, spinnerID);
      // let newReports:Report[] = res;
      this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return res;
    } catch(err) {
      Log.l(`updateLogistics(): Error getting updated logistics data!`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      let errText:string = err && typeof err.message === 'string' ? err.message : typeof err === 'string' ? err : "UNKNOWN ERROR -42";
      this.notify.addError("ERROR", `Error updating logistics reports:<br/>\n<br/>\n'${errText}'`, 4000);
      throw err;
    }
  }

  public async updateTimeCards(evt?:Event):Promise<any> {
    let spinnerID;
    Log.l(`updateTimeCards(): Called with arguments:\n`, arguments);
    try {
      let res:any;
      if(this.menuCtrl.isOpen()) {
        let out:any = await this.menuCtrl.close();
      }
      let count:number = 0, queued:number = 0;

      count = await this.server.getDocCount('timecards');
      if(this.prefs.CONSOLE.global.reportsToLoad) {
        queued = this.prefs.CONSOLE.global.reportsToLoad;
      } else {
        queued = count || 1000000;
      }
      let text:string = `Retrieving ${count} time cards`;
      if(queued > 0 && queued !== 1000000) {
        text += ` (${count} total)`;
      }
      text += ' ...';
      spinnerID = await this.alert.showSpinnerPromise(text);
      let fetchCount:number = queued;
      res = await this.getReports(fetchCount, spinnerID);
      // let newReports:Report[] = res;
      this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return res;
    } catch(err) {
      Log.l(`updateTimeCards(): Error getting updated timecard data!`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      let errText:string = err && typeof err.message === 'string' ? err.message : typeof err === 'string' ? err : "UNKNOWN ERROR -42";
      this.notify.addError("ERROR", `Error updating timecards:<br/>\n<br/>\n'${errText}'`, 4000);
      throw err;
    }
  }

  public async logoutClicked():Promise<any> {
    // this.menu.close().then(res => {
    try {
      let res:any = await this.alert.showConfirmYesNo("CONFIRM", "Are you sure you want to log out?");
      if(res) {
        Log.l("User clicked okay to log out.");
        // let msg: Notice = { severity: 'info', summary: 'LOGGED OUT', detail: `User logged out.`, life: 3000 };
        this.notify.addInfo("LOGGED OUT", "User logged out.", 3000);
        // this.logout();
        let out:any = await this.closeMenuAndLogout();
        return true;
      } else {
        Log.l("User clicked not okay to log out.");
        // let msg: Notice = { severity: 'info', summary: 'OK', detail: `Logout canceled.`, life: 3000 };
        this.notify.addInfo("OK", "Logout canceled", 3000);
        return false;
      }
    } catch(err) {
      Log.l(`logoutClicked(): Error processing logout.`);
      Log.e(err);
      return false;
    }
  }

  public async closeMenuAndLogout():Promise<{message:string}> {
    try {
      let res:any;
      if(this.menuCtrl.isOpen()) {
        let out:any = await this.menuCtrl.close();
      }
      res = await this.logout();
      return res;
    } catch(err) {
      Log.l(`closeMenuAndLogout(): Error closing menu and logging out!`);
      Log.e(err);
      // throw err;
    }
  }

  public async logout():Promise<{message:string}> {
    try {
      let res:any = await this.auth.logout();
      res = await this.cancelInitSyncs();
      // this.rootPage = null;
      Log.l("Done showing login.");
      this.showLogin();
      return {message: "Successfully logged out and back in."};
    } catch(err) {
      Log.l(`logout(): Error during logout.`);
      Log.e(err);
      this.notify.addError("ERROR!", `Error logging out: ${err.message}`, 10000);
      return null;
    }
  }

  public showLogin() {
    Log.l("showLogin(): Now showing...");
    this.requireLogin = true;
    // this.loginOverlay.show({}, this.loginTarget.nativeElement);
  }

  public async receiveLoginAttempt(event:any):Promise<any> {
    try {
      Log.l("receiveLoginAttempt(): Received:\n", event);
      this.requireLogin = false;
      this.data.status.ready = false;
      this.data.status.loading = false;
      if(event === true) {
        // this.loginOverlay.hide();
        let username:string = this.auth.getUsername();
        let tech:Employee = await this.server.getEmployee(username);
        this.data.setUser(tech);
        if(await this.isFirstLogin()) {
          // this.requireLogin = false;
          let res:any = await this.initialReplication();
          res = await this.initializeRestOfApp();
          return res;
        } else {
          let res:any = await this.initializeRestOfApp();
          return res;
        }
      } else {
        Log.l(`receiveLoginAttempt(): Received event:\n`, event);
        Log.l(`receiveLoginAttempt(): Event not true, not initializing rest of app.`)
      }
    } catch(err) {
      Log.l(`receiveLoginAttempt(): Error processing login attempt!`);
      Log.e(err);
      let out:any = await this.alert.showErrorMessage("ERROR", "The app encountered an error", err);
      // throw err;
    }
  }

  public async testNotifications() {
    try {
      if(this.menuCtrl.isOpen()) {
        let out:any = await this.menuCtrl.close();
      }
      let MIN = 500, MAX = 7500;
      let live = this.data.random(MIN, MAX);
      let details:string = `Developers are always watching, for ${live}ms at least.`;
      Log.l(`AppComponent.testNotifications(): generating a notification that should last ${live}ms...`);
      // let msg:Notice = {severity:'error', summary:'ERROR!', detail:details, life:live}
      this.notify.addWarning("WARNING!", details, live);
      return true;
    } catch(err) {
      Log.l(`testNotifications(): Error testing notifications!`);
      Log.e(err);
      this.notify.addError("ERROR!", `Error testing notifcations!`, 3000);
      // throw err;
    }
  }

  // public menuClosed() {
  //   for(let eachPage of this.pageList) {
  //     if(eachPage['showSubMenu'] !== undefined) {
  //       eachPage.showSubMenu = false;
  //     }
  //     if(eachPage['parent'] !== undefined) {
  //       // eachPage.subStyle['max-height'] = '0px';
  //       eachPage.style['max-height'] = '0px';
  //     }
  //   }
  //   // this.events.publish("menu:closed", '');
  // }

  public menuClosed(event?:Event) {
    this.dispatch.triggerAppEvent('menuclosed');
  }

  /**
   * THIS IS WHERE DATA IS FETCHED
   */
  public async syncData():Promise<any> {
    try {
      let res:any = await this.setupAuthentication();
      Log.l("OnSiteConsoleX.syncData(): Authenticated and synchronization started. Now fetching actual data.");
      res = await this.fetchAllData();
      Log.l("OnSiteConsoleX.syncData(): All data fetched.");
      return res;
    } catch(err) {
      Log.l(`OnSiteConsoleX.syncData(): Error with authentication of fetching data!`);
      Log.e(err);
      throw err;
    }
  }

  public async fetchAllData():Promise<any> {
    try {
      if(this.data.status.ready || this.data.status.loading) {
        return true;
      } else {
        this.data.status.loading = true;
        Log.l("OnSiteConsoleX.fetchAllData(): About to begin fetching data...");
        let res:any = await this.fetchData();
        Log.l("OnSiteConsoleX.fetchAllData(): done fetching data.");
        this.data.status.ready   = true;
        this.data.status.loading = false;
        return true;
      }
    } catch(err) {
      Log.l(`OnSiteConsoleX.fetchAllData(): error fetching data.`);
      Log.e(err);
      this.data.status.ready   = false;
      this.data.status.loading = false;
      throw err;
    }
  }

  public async fetchData():Promise<any> {
    let spinnerID:string;
    try {
      if(this.data.status.ready) {
        return true;
      }
      this.data.status.loading = true;
      this.data.status.ready   = false;
      // this.alert.clearSpinners();
      spinnerID = await this.alert.showSpinnerPromise("Retrieving data from databases …");
      // let loading:Loading|{setContent:Function} = this.alert.getSpinner(spinnerID);
      // loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      // let loading:Loading|{setContent:Function} = this.alert.getSpinner(spinnerID);
      // loading = loading && typeof loading.setContent === 'function' ? loading : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
      let loading:Loading = this.alert.getSpinner(spinnerID);
      function updateLoaderStatus(text:string) {
        let loadText:string = "Retrieving data from:<br>\n";
        if(loading && typeof loading.setContent === 'function') {
          loading.setContent(loadText + text + "…");
        } else {
          Log.l("Fake loading controller text:\n", text);
        }
      }
      let tech:Employee = await this.server.getEmployee(this.auth.getUser());
      this.data.user = tech;
      // let res:any = await this.server.getUserData(this.auth.getUser());
      // this.user = new Employee();
      // this.user.readFromDoc(res);

      // });
      let res:any = await this.db.getAllNonScheduleData(false, spinnerID);
        // this.schedules = new Schedules();
      for(let key in res) {
        if(key !== 'schedules') {
          this.data.dbdata[key] = res[key];
        }
        // else {
          // this.schedules.setSchedules(res[key]);
        // }
      }
      this.data.loaded.sites = true;
      this.data.loaded.employees = true;
      this.data.loaded.logistics = true;
      this.data.loaded.timecards = true;
      // loading.setContent("Retrieving data from:<br>\nsesa-scheduling …");
      updateLoaderStatus("sesa-scheduling");
      // res = await this.db.getSchedules(false, this.dbdata.employees);
      // this.schedules = new Schedules();
      // this.schedules.setSchedules(res);
      // this.loaded.schedules = true;
      await this.getSchedulesFromDatabase();
      // loading.setContent("Retrieving data from:<br>\nsesa-config …");
      updateLoaderStatus("sesa-config");
      res = await this.db.getAllConfigData();
      this.data.config.clients            = res['clients']            ;
      this.data.config.locations          = res['locations']          ;
      this.data.config.locIDs             = res['locids']             ;
      this.data.config.rotations          = res['rotations']          ;
      this.data.config.shifts             = res['shifts']             ;
      this.data.config.shiftLengths       = res['shiftlengths']       ;
      // this.data.config.shiftTypes         = res['shifttypes']         ;
      this.data.config.shiftStartTimes    = res['shiftstarttimes']    ;
      this.data.config.report_types       = res['report_types']       ;
      this.data.config.training_types     = res['training_types']     ;
      this.data.report_types              = res['report_types']       ;
      this.data.training_types            = res['training_types']     ;
      this.data.config.maintenance_enouns = res['maintenance_enouns'] ;
      this.data.config.maintenance_mnouns = res['maintenance_mnouns'] ;
      this.data.config.maintenance_verbs  = res['maintenance_verbs']  ;
      // return this.db.getDPSSettings();
      this.data.loaded.config = true;
      updateLoaderStatus("sesa-dps-config");
      res = await this.server.getDPSSettings();
      // OSData.dps = res;
      this.data.dps = res;
      this.data.loaded.dps = true;
      await this.alert.hideSpinnerPromise(spinnerID);
      Log.l("OnSiteConsoleX.fetchData(): All data fetched.");
      this.data.status.ready   = true;
      this.data.status.loading = false;
      // let data = { sites: [], employees: [], reports: [], others: [], periods: [], shifts: [], schedules: [] };
      return true;
    } catch(err) {
      Log.l("OnSiteConsoleX.fetchData(): Error fetching all data.");
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      // let errText:string = err && err.message ? err.message : typeof err === 'string' ? err : "UNKNOWN ERROR";
      // this.alert.showAlert("ERROR", "Error retrieving data:<br>\n<br\n" + errText);
      await this.alert.showErrorMessage("ERROR", "Error retrieving data", err);
      this.data.status.ready   = false;
      this.data.status.loading = false;
      throw err;
    }
  }

  public async getSchedulesFromDatabase(server?:boolean, evt?:Event):Promise<Schedule[]> {
    try {
      Log.l(`OnSiteConsoleX.getSchedulesFromServer(): Called with server '${server}' and event:`, evt);
      let res;
      let employees:Employee[] = this.data.getData('employees');
      if(server === true) {
        res = await this.server.getSchedules(false, employees);
      } else {
        res = await this.db.getSchedules(false, employees);
      }
      this.data.schedules = new Schedules();
      this.data.schedules.setSchedules(res);
      this.data.loaded.schedules = true;
      this.dispatch.triggerUpdatedFromDB('scheduling', this.data.schedules);
      return res;
    } catch(err) {
      Log.l(`OnSiteConsoleX.getSchedulesFromServer(): Error getting schedules from server`);
      Log.e(err);
      throw err;
    }
  }
  
  

  public async getReports(fetchCount:number, existingSpinnerID?:string):Promise<Report[]> {
    // let spinnerID:string = existingSpinnerID && typeof existingSpinnerID === 'string' ? existingSpinnerID : null;
    try {
      // let reportsDB = this.prefs.getDB('reports');
      // spinnerID = await this.alert.showSpinnerPromise("Retrieving work reports …");
      // let res:Report[] = await this.db.getReportsData(fetchCount, reportsDB);
      let res:Report[] = await this.db.getWorkReports(fetchCount, existingSpinnerID);
      this.data.dbdata.reports = res;
      this.data.loaded.reports = true;
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.dispatch.updateDatastore('reports', this.data.dbdata.reports);
      this.dispatch.triggerUpdatedFromDB('reports', this.data.dbdata.reports);
      // let change = this.syncChanges(reportsDB);
      // this.pouchChanges[reportsDB] = change;
      return res;
    } catch(err) {
      Log.l("OnSiteConsoleX.getReports(): Error getting reports!");
      Log.e(err);
      // await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getOldReports(hideSpinner?:boolean):Promise<Report[]> {
    let spinnerID:string;
    try {
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise("Retrieving old work reports...");
      }
      let reports_old:string = "reports_old01";
      // let db = this.prefs.getDB();
      // let rdb1 = this.db.addDB(db.reports_old01);
      // Log.l(`Server.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
      // let res:any = await rdb1.allDocs({ include_docs: true });
      let reports:Report[] = await this.db.getOldReports(spinnerID);
      this.data.dbdata.oldreports = reports;
      this.data.loaded.oldreports = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('reports_old', this.data.dbdata.oldreports)
      this.dispatch.triggerUpdatedFromDB('reports_old', this.data.dbdata.oldreports)
      // let change = this.syncChanges(reports_old);
      // this.pouchChanges[reports_old] = change;
      Log.l("OnSiteConsoleX.getOldReports(): Final array of old reports is:", reports);
      return reports;
    } catch(err) {
      Log.l(`OnSiteConsoleX.getOldReports(): Error retrieving reports.`);
      Log.e(err);
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      throw err;
    }
  }

  public async getReportOthers(hideSpinner?:boolean):Promise<ReportOther[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('reports_other');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      // let othersDB = this.prefs.DB.reports_other;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinner(`Retrieving ${count} non-work reports...`);
      }
      let others:ReportOther[] = await this.db.getReportOthers(spinnerID);
      this.data.dbdata.others = others;
      this.data.loaded.others = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      // this.dispatch.updateDatastore('others', this.data.dbdata.others);
      this.dispatch.updateDatastore('reports_other', this.data.dbdata.others);
      this.dispatch.triggerUpdatedFromDB('reports_other', this.data.dbdata.others);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("OnSiteConsoleX.getReportOthers(): Final ReportOther array is:", others);
      return others;
    } catch(err) {
      Log.l("OnSiteConsoleX.getReportOthers(): Error getting reports!");
      Log.e(err);
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      throw err;
    }
  }

  public async getReportLogistics(hideSpinner?:boolean):Promise<ReportLogistics[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('logistics');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise(`Retrieving ${count} logistics reports...`);
      }
      let logistics:ReportLogistics[] = await this.server.getReportLogistics(spinnerID);
      // let logistics:ReportLogistics[] = await this.db.getReportLogistics(spinnerID);
      this.data.dbdata.logistics = logistics;
      this.data.loaded.logistics = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('logistics', this.data.dbdata.logistics);
      this.dispatch.triggerUpdatedFromDB('logistics', this.data.dbdata.logistics);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("OnSiteConsoleX.getReportLogistics(): Final ReportLogistics array is:", dbname);
      return logistics;
    } catch(err) {
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      Log.l("OnSiteConsoleX.getReportLogistics(): Error getting logistics reports!");
      Log.e(err);
      throw err;
    }
  }

  public async getReportDrivings(hideSpinner?:boolean):Promise<ReportDriving[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('drivings');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise(`Retrieving ${count} driving reports...`);
      }
      let drivings:ReportDriving[] = await this.server.getReportDrivings(spinnerID);
      // let logistics:ReportLogistics[] = await this.db.getReportLogistics(spinnerID);
      this.data.dbdata.drivings = drivings;
      this.data.loaded.drivings = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('drivings', this.data.dbdata.drivings);
      this.dispatch.triggerUpdatedFromDB('drivings', this.data.dbdata.drivings);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("OnSiteConsoleX.getReportDrivings(): Final ReportDriving array is:", dbname);
      return drivings;
    } catch(err) {
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      Log.l("OnSiteConsoleX.getReportDrivings(): Error getting driving reports!");
      Log.e(err);
      throw err;
    }
  }

  public async getReportMaintenances(hideSpinner?:boolean):Promise<ReportMaintenance[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('maintena');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise(`Retrieving ${count} maintenance reports...`);
      }
      let maintenances:ReportMaintenance[] = await this.server.getReportMaintenances(spinnerID);
      // let logistics:ReportLogistics[] = await this.db.getReportLogistics(spinnerID);
      this.data.dbdata.maintenances = maintenances;
      this.data.loaded.maintenances = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('maintenances', this.data.dbdata.maintenances);
      this.dispatch.triggerUpdatedFromDB('maintenances', this.data.dbdata.maintenances);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("OnSiteConsoleX.getReportMaintenances(): Final ReportMaintenance array is:", dbname);
      return maintenances;
    } catch(err) {
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      Log.l("OnSiteConsoleX.getReportMaintenances(): Error getting maintenance reports!");
      Log.e(err);
      throw err;
    }
  }

  public async getTimeCards(hideSpinner?:boolean):Promise<ReportTimeCard[]> {
    let spinnerID:string;
    try {
      let dbname = this.prefs.getDB('timecards');
      let db1 = this.db.addDB(dbname);
      let dbinfo:any = await db1.info();
      let count:number = dbinfo.doc_count;
      if(!hideSpinner) {
        spinnerID = await this.alert.showSpinnerPromise(`Retrieving ${count} time card reports...`);
      }
      let timecards:ReportTimeCard[] = await this.server.getReportTimeCards(spinnerID);
      this.data.dbdata.timecards = timecards;
      this.data.loaded.timecards = true;
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      this.dispatch.updateDatastore('timecards', this.data.dbdata.timecards);
      this.dispatch.triggerUpdatedFromDB('timecards', this.data.dbdata.timecards);
      // let change = this.syncChanges(dbname);
      // this.pouchChanges[dbname] = change;
      Log.l("OnSiteConsoleX.getTimeCards(): Final ReportTimeCard array is:", dbname);
      return timecards;
    } catch(err) {
      if(!hideSpinner) {
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      }
      Log.l("OnSiteConsoleX.getTimeCards(): Error getting reports!");
      Log.e(err);
      throw err;
    }
  }

  public syncChanges(dbname:string) {
    // return new Promise((resolve,reject) => {
    Log.l(`OnSiteConsoleX.syncChanges(): Called for '${dbname}'`)
    let a:boolean = false;
    if(!a) {
      return this.server.liveSyncWithServer(dbname);
    }
    let jobsitesDB:string = this.prefs.getDB('jobsites');
    let employeesDB:string = this.prefs.getDB('employees');
    let reportsDB:string = this.prefs.getDB('reports');
    let othersDB:string = this.prefs.getDB('reports_other');
    let logisticsDB:string = this.prefs.getDB('logistics');
    let drivingsDB:string = this.prefs.getDB('drivings');
    let maintenancesDB:string = this.prefs.getDB('maintenances');
    let timecardsDB:string = this.prefs.getDB('timecards');
    if(dbname === reportsDB) {
      let reports:Report[] = this.data.dbdata.reports;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true})
      .on('change', (change) => {

        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change event detected!`);
        let reports = this.data.dbdata.reports;
        if(change.deleted) {
          // change.id holds the deleted id
          let idx = reports.findIndex((a:Report) => {
            return a._id === change.id;
          });
          if(idx > -1) {
            let report = reports[idx];
            reports.splice(idx, 1);
            this.notify.addInfo("DELETED REPORT", `Deleted Report '${report._id}'.`, 3000);
          }
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          if(doc._id[0] === '_') {
            return;
          }
          let idx = reports.findIndex((a:Report) => {
            return a._id === change.id;
          });
          let report = new Report();
          report.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            reports[idx] = report;
            this.notify.addInfo("EDITED REPORT", `Edited Report '${report._id}'.`, 3000);
          } else {
            reports.push(report);
            this.notify.addInfo("NEW REPORT", `New Report '${report._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('reports', this.data.dbdata.reports);
      }).on('error', (err) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
      return changes;
    } else if(dbname === othersDB) {
      let others:ReportOther[] = this.data.dbdata.others;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change event detected!`);
        let reports = this.data.dbdata.reports;
        if(change.deleted) {
          // change.id holds the deleted id
          let idx = others.findIndex((a:ReportOther) => {
            return a._id === change.id;
          });
          others.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = others.findIndex((a:ReportOther) => {
            return a._id === change.id;
          });
          let other = new ReportOther();
          other.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            others[idx] = other;
            this.notify.addInfo("EDITED REPORTOTHER", `Edited ReportOther '${other._id}' added.`, 3000);
          } else {
            others.push(other);
            this.notify.addInfo("NEW REPORTOTHER", `New ReportOther '${other._id}' added.`, 3000);
          }
        }
        // this.dispatch.updateDatastore('others', this.data.dbdata.others);
        this.dispatch.updateDatastore('reports_other', this.data.dbdata.others);
      }).on('error', (err) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else if(dbname === jobsitesDB) {
      let sites:Jobsite[] = this.data.dbdata.sites;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change event detected!`);
        let reports = this.data.dbdata.sites;
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = sites.findIndex((a:Jobsite) => {
            return a._id === change.id;
          });
          sites.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = sites.findIndex((a:Jobsite) => {
            return a._id === change.id;
          });
          let site = new Jobsite();
          site.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            sites[idx] = site;
            this.notify.addInfo("EDITED JOBSITE", `Edited Jobsite '${site._id}' added.`, 3000);
          } else {
            sites.push(site);
            this.notify.addInfo("NEW JOBSITE", `New JOBSITE '${site._id}' added.`, 3000);
          }
        }
        // this.dispatch.updateDatastore('sites', this.data.dbdata.sites);
        this.dispatch.updateDatastore('jobsites', this.data.dbdata.sites);
      }).on('error', (err) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else if(dbname === employeesDB) {
      let employees:Employee[] = this.data.dbdata.employees;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change event detected!`);
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = employees.findIndex((a:Employee) => {
            return a._id === change.id;
          });
          employees.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = employees.findIndex((a:Employee) => {
            return a._id === change.id;
          });
          let tech = new Employee();
          tech.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            employees[idx] = tech;
            this.notify.addInfo("EDITED JOBSITE", `Edited Jobsite '${tech._id}' added.`, 3000);
          } else {
            employees.push(tech);
            this.notify.addInfo("NEW JOBSITE", `New JOBSITE '${tech._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('employees', this.data.dbdata.employees);
      }).on('error', (err) => {
        Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else {
      Log.l(`OnSiteConsoleX.syncChanges('${dbname}'): Can't sync to non-reports databases at the moment!`);
      return undefined;
    }
  }

  public async setupAuthentication():Promise<{message:string}> {
    // let dblist = this.prefs.getDB();
    // let dbs = Object.keys(this.prefs.getDBKeys());
    let dbNameList:string[] = this.prefs.getSyncableDBList();
    // let dbNameList:string[] = [];
    try {
      // let promises = [];
      let promises:Promise<any>[] = [];
      // for(let dbItem of dbNameList) {
      //   if(!Array.isArray(dbItem)) {
      //     /* dbItem is not an array, just a string */
      //     if(dbItem !== '_session' && dbItem !== 'login') {
      //       let db:string = dblist[dbItem];
      //       dbNameList.push(db);
      //     }
      //   } else {
      //     /* dbItem is an array. Retrieve its keys individually. */
      //     for(let key of dbItem) {
      //       let db:string = dblist[key];
      //       // promises.push(this.server.loginToDatabase(this.u, this.p, db));
      //       dbNameList.push(db);
      //     }
      //   }
      // }
      Log.gc(`setupAuthentication(): About to log in to databases...`);
      for(let dbName of dbNameList) {
        promises.push(this.server.loginToDatabase(this.u, this.p, dbName));
      }
      await Promise.all(promises);
      for(let dbName of dbNameList) {
        Log.l(`setupAuthentication(): Attempting to sync with remote '${dbName}'...`);
        if(!(dbName.includes('timesheets') || dbName.includes('sounds'))) {
          let res2:any = this.server.liveSyncWithServer(dbName);
        }
      }
      Log.ge();
      this.data.status.loggedIn = true;
      window['onsiteconsoleusername'] = this.u;
      return {message:"Successfully logged in"};

      // const promises = dbs.map((dbItem:string|Array<string>) => {
      //   if(dbItem !== '_session' && dbItem !== 'login' && !Array.isArray(dbItem)) {
      //     let db = dblist[dbItem];
      //     Log.l(`setupAuthentication(): Attempting to login to remote '${db}'...`);
      //     this.loading.setContent(`Logging in to database ${db}...`);
      //     return this.server.loginToDatabase(this.u, this.p, db);
      //     // Log.l(`CONSOLE: Successfully logged in and set up synchronization with remote '${db}'`);
      //   } else if(Array.isArray(dbItem)) {
      //     for(let key of dbItem) {
      //       let db = dblist[key];
      //       return this.server.loginToDatabase(this.u, this.p, db);
      //     }
      //   }
      // });
      // for(let key of dbs) {
      //   if(key !== '_session' && key !== 'login') {
      //     let db = dblist[key];
      //     Log.l(`CONSOLE: Attempting to login to remote '${db}'...`);
      //     this.loading.setContent(`Logging in to database ${db}...`);
      //     promises.push(this.server.loginToDatabase(this.u, this.p, db));
      //     Log.l(`CONSOLE: Successfully logged in and set up synchronization with remote '${db}'`);
      //   }
      // }
      // const replicationPromises = dbs.map(key => {
      //   if(key !== '_session' && key !== 'login') {
      //     let db = dblist[key];
      //     Log.l(`CONSOLE: Attempting to replicate '${db}'...`);
      //     this.loading.setContent(`Replicating '${db}'...`);
      //     return this.server.nonLiveSyncWithServer(db);
      //     // Log.l(`CONSOLE: Successfully logged in and set up synchronization with remote '${db}'`);
      //   }
      // });
      // await Promise.all(promises);
      // await Promise.all(replicationPromises);
      // for(let key of dbs) {
      //   if(key !== 'session' && key !== 'login') {
      //     let db = dblist[key];
      //     Log.l(`setupAuthentication(): Attempting to sync with remote '${db}'...`);
      //     let res2 = this.server.liveSyncWithServer(db);
      //   }
      // }
      // this.data.status.loggedIn = true;
      // window['onsiteconsoleusername'] = this.u;
      // return {message:"Successfully logged in"};
    } catch(err) {
      Log.l(`setupAuthentication(): Error logging in to at least one database.`);
      Log.e(err);
      throw err;
    }
  }

  public async getSavedCredentials():Promise<{user:string,pass:string}> {
    try {
      let res:any = await this.auth.areCredentialsSaved();
      if(res) {
        Log.l("getSavedCredentials(): User credentials found.");
        let user1:string = this.auth.getUser();
        let pass1:string = this.auth.getPass();
        this.u = user1;
        this.p = pass1;
        this.prefs.setAuth(user1, pass1);
        let out:{user:string,pass:string} = {user: user1, pass: pass1};
        return out;
      }
    } catch(err) {
      Log.l(`getSavedCredentials(): Error getting saved credentials`);
      Log.e(err);
      return null;
    }
  }

  public async authenticate():Promise<string> {
    let spinnerID:string;
    try {
      // spinnerID = await this.alert.showSpinnerPromise("Logging in to server...");
      let spinnerText = "Logging in to databases on server...";
      let res:any = await this.auth.areCredentialsSaved();
      spinnerID = await this.alert.showSpinnerPromise(spinnerText);
      this.loading = this.alert.getSpinner(spinnerID);
      if(res) {
        Log.l("authenticate(): User credentials found.");
        let user1:string = this.auth.getUser();
        let pass1:string = this.auth.getPass();
        this.u = user1;
        this.p = pass1;
        this.prefs.setAuth(user1, pass1);
        try {
          res = await this.server.loginToServer(this.u, this.p);
          Log.l(`authenticate(): successfully logged in to server as user '${user1}'.`);
          let user = user1;
          this.currentlyLoggedIn = true;
          this.data.status.loggedIn = true;
          let out:any = await this.alert.hideSpinnerPromise(spinnerID);
          this.notify.addSuccess("SUCCESS", `Successfully logged in to server`, 3000)
          return "authenticate(): Logged in!";
        } catch(err) {
          Log.l(`authenticate(): could not log in with provided credentials.`);
          Log.e(err);
          this.currentlyLoggedIn = false;
          this.data.status.loggedIn = false;
          let out:any = await this.alert.hideSpinnerPromise(spinnerID);
          throw err;
        }
      } else {
        Log.l("authenticate(): user credentials not found. Need to log in.");
        this.currentlyLoggedIn = false;
        this.data.status.loggedIn = false;
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        let err:Error = new Error("authenticate(): No credentials found");
        throw err;
      }
    } catch(err) {
      Log.l(`authenticate(): Error during authentication!`);
      Log.e(err);
      this.currentlyLoggedIn = false;
      this.data.status.loggedIn = false;
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error during authentication: ${err.message}`, 10000);
      throw err;
    }
  }

  public async checkPreferences():Promise<any> {
    try {
      let storedPrefs:any = await this.storage.persistentGet('PREFS');
      let updatePrefs = storedPrefs;
      if(storedPrefs) {
        Log.l(`checkPreferences(): Found stored preferences, comparing...`);
        updatePrefs = this.prefs.comparePrefs(storedPrefs);
        this.prefs.setPrefs(updatePrefs);
      } else {
        Log.l(`checkPreferences(): No stored preferences found, comparing...`);
        updatePrefs = this.prefs.getPrefs();
      }
      let version:number = this.prefs.getPreferencesVersion();
      Log.l(`checkPreferences: Preferences at version '${version}', saving again.`);
      let res:any = await this.quietSavePreferences(updatePrefs);
      Log.l("checkPreferences: Preferences saved successfully.");
      return res;
    } catch(err) {
      Log.l(`checkPreferences(): Error checking preferences!`);
      Log.e(err);
      // return err;
      // throw err;
      throw err;
    }
  }

  public async savePreferences(updatedPrefs?:any) {
    let spinnerID;
    try {
      spinnerID = await this.alert.showSpinner('Saving preferences...');
      let prefs = updatedPrefs ? updatedPrefs : this.prefs.getPrefs();
      let res:any = await this.storage.persistentSet('PREFS', prefs);
      Log.l("savePreferences: Preferences stored:\n", this.prefs.getPrefs());
      let out:any = await this.alert.hideSpinner(spinnerID);
      // this.notify.addSuccess('SAVED', `Saved user preferences!`, 3000);
      return res;
    } catch(err) {
      Log.l(`savePreferences(): Error saving preferences!`);
      Log.e(err);
      await this.alert.hideSpinner(spinnerID);
      // return err;
      throw err;
    }
  }

  public async quietSavePreferences(updatedPrefs?:any) {
    // let spinnerID:string;
    try {
      // spinnerID = await this.alert.showSpinnerPromise('Saving preferences...');
      let prefs = updatedPrefs ? updatedPrefs : this.prefs.getPrefs();
      let res:any = await this.storage.persistentSet('PREFS', prefs);
      Log.l("savePreferences: Preferences stored:", this.prefs.getPrefs());
      // await this.alert.hideSpinnerPromise(spinnerID);
      // this.notify.addSuccess('SAVED', `Saved user preferences!`, 3000);
      return res;
    } catch(err) {
      Log.l(`savePreferences(): Error saving preferences!`);
      Log.e(err);
      // await this.alert.hideSpinnerPromise(spinnerID);
      // return err;
      throw err;
    }
  }

  public async showOptions(event?:string) {
    try {
      let out:any = await this.menuCtrl.close();
      if(event) {
        if(event === 'global') {
          this.globalOptionsType = 'global';
        } else if(event === 'advanced') {
          this.globalOptionsType = 'advanced';
        }
      } else {
        this.globalOptionsType = 'global';
      }
      this.globalOptionsVisible = true;
      this.app.tick();
    } catch(err) {
      Log.l(`showOptions(): Error showing options, type '${event}'!`);
      Log.e(err);
      throw err;
    }
  }

  public hideOptions() {
    this.globalOptionsVisible = false;
    this.updateDateTimeFormats();
    this.app.tick();
  }
  
  public optionsClosed(event:any) {
    Log.l("optionsClosed(): Event is:", event);
    this.globalOptionsVisible = false;
    this.updateDateTimeFormats();
    this.app.tick();
  }
  
  public optionsSaved(event:any) {
    this.globalOptionsVisible = false;
    this.updateDateTimeFormats();
    Log.l("optionsSaved(): Event is:\n", event);
    this.app.tick();
    let prefs = this.prefs.getPrefs();
    this.savePreferences(prefs).then(res => {
      this.dispatch.updatePrefs();
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
    }).catch(err => {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    });
  }

  public updateDateTimeFormats() {
    if(this.prefs.is24Hour()) {
      this.data.calendarFormats = this.data.calendarFormats24;
    } else {
      this.data.calendarFormats = this.data.calendarFormats12;
    }
  }

  // public showSearch() {
  //   this.electron.pageSearch({css: 'default-style.css', html: 'search-window.html'}, false);
  //   // this.searchVisible = true;
  // }

  // public hideSearch() {
  //   this.electron.stopListeningForSearch();
  //   this.searchVisible = false;
  // }

  // public toggleSearch() {
  //   if(this.searchVisible) {
  //     this.searchVisible = false;
  //     this.electron.stopListeningForSearch();
  //   } else {
  //     this.searchVisible = true;
  //     this.electron.listenForSearch();
  //   }
  // }hack

  public isArray(value:any):boolean {
    if(Array.isArray(value)) {
      return true;
    } else {
      return false;
    }
  }

  public toggleMenu():boolean {
    this.menuEnabled = !this.menuEnabled;
    this.app.tick();
    return this.menuEnabled;
  }

  public fireAppTick() {
    this.app.tick();
  }

  public toggleDeveloperMode(event?:Event) {
    let mode:string = this.data.toggleDeveloperMode();
    let devMenuItem = this.mainMenu.find((a:MenuItem) => {
      return a.label === 'Developer';
    });
    if(devMenuItem) {
      if(mode === 'dev') {
        devMenuItem.visible = true;
      } else {
        devMenuItem.visible = false;
      }
    }
    this.electron.createMenus();
    this.electron.toggleDevModeTitle();
    this.app.tick();
  }

  public async showDBStatus(evt?:Event) {
    try {
      Log.l(`showDBStatus(): Event is:`, evt);
      if(evt instanceof MouseEvent) {
        if(evt.ctrlKey || evt.shiftKey) {
          let confirm:boolean = await this.alert.showConfirmYesNo("RESTART DATABASES", "This will erase the existing databases on your computer and re-download them from the server. Continue?");
          if(confirm) {
            this.reinitializeDatabases();
          }
        } else {
          this.data.status.showLastUpdated = false;
          this.dbStatusVisible = true;
        }
      }
    } catch(err) {
      Log.l(`showDBStatus(): Error after click`);
      Log.e(err);
      throw err;
    }
  }
  
  public hideDBStatus(evt?:Event) {
    Log.l(`hideDBStatus(): Event is:`, evt);
    this.data.status.showLastUpdated = true;
    this.dbStatusVisible = false;
  }
  
  public toggleDBStatus(evt?:Event) {
    Log.l(`toggleDBStatus(): Event is:`, evt);
    let show:boolean = !this.dbStatusVisible;
    this.data.status.showLastUpdated = !show;
    this.dbStatusVisible = show;
    return this.dbStatusVisible;
  }
  
  public dbStatusClosed(evt?:Event) {
    Log.l(`dbStatusClosed(): Event is:`, evt);
    this.hideDBStatus();
  }

  public progressClosed(evt?:Event) {
    Log.l(`progressClosed(): Event is:`, evt);
    this.progressVisible = false;
  }

  public progressAborted(evt?:Event) {
    Log.l(`progressAborted(): Event is:`, evt);
    this.progressVisible = false;
  }

  public async progressPause(evt?:boolean) {
    try {
      let res:any
      let pause:boolean = evt || false;
      Log.l(`progressPause(): Pause set to  '${pause}'...`);
      if(pause) {
        /* Call pause on replication */
        this.progressPaused = true;
        res = await this.cancelInitSyncs();
      } else {
        /* Unpause replication */
        this.progressPaused = false;
        res = await this.initialReplication();
        res = await this.initializeRestOfApp();
      }
      return res;
    } catch(err) {
      Log.l(`progressPause(): Error pausing or unpausing`);
      Log.e(err);
      throw err;
    }
  }

  public async cancelInitSyncs(evt?:Event):Promise<any> {
    try {
      // let res:any = await someFunctionThatReturnsAPromise();
      Log.l(`cancelInitSyncs(): Attempting to cancel all initial replication syncs...`);
      this.server.cancelAllInitialSyncs();
      return true;
      // return res;
    } catch(err) {
      Log.l(`cancelInitSyncs(): Error canceling initial replication syncs!`);
      Log.e(err);
      throw err;
    }
  }

  public goToHomePage() {
    this.rootPage = "OnSiteX Console";
  }

  public editPrefsCanceled(evt?:Event) {
    Log.l(`editPrefsCanceled(): Event is:\n`, evt);
    this.jsonEditorVisible = false;
  }

  public editPrefsSaved(evt?:Event) {
    Log.l(`editPrefsSaved(): Event is:\n`, evt);
    this.jsonEditorVisible = false;
  }

  public async menuItemClick(sub:any, evt?:Event):Promise<any> {
    try {
      Log.l(`menuItemClick(): Clicked on:\n`, sub);
      return true;
    } catch(err) {
      Log.l(`menuItemClick(): Error clicking!`);
      Log.e(err);
      // throw err;
    }
  }

  public toggleFindInPage(force?:boolean):boolean {
    if(typeof force === 'boolean') {
      this.findVisible = Boolean(force);
    } else {
      this.findVisible = !this.findVisible;
    }
    return this.findVisible;
  }

  public async loadTranslations():Promise<any> {
    try {
      Log.l(`OnSiteConsole.loadTranslations(): Called …`);
      let res = await this.server.loadTranslations();
      let keys = res.keys;
      // let translations = res.translations;
      // let translateKeys = Object.keys(translations);
      // let allTranslations:any = {};
      // for(let langKey of keys) {
      //   let idx = keys.indexOf(langKey);
      //   let langTranslations:any = {};
      //   for(let key of translateKeys) {
      //     langTranslations[key] = translations[key][idx];
      //   }
      //   this.translate.setTranslation(langKey, langTranslations);
      //   allTranslations[langKey] = langTranslations;
      // }
      // let currentLang = this.translate.currentLang;
      // this.ud.translations = allTranslations[currentLang];
      // return res;
    } catch(err) {
      Log.l(`OnSiteConsole.loadTranslations(): Error loading translations`);
      Log.e(err);
      throw err;
    }
  }

}
