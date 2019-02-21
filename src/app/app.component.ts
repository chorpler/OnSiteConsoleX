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
import { Log, CONSOLE, moment, Moment, oo, JSON5, blobUtil, Duration,      } from 'domain/onsitexdomain'          ;
import { ooPatch, ooPointer, sizeOf, round, roundMaxDecimals,              } from 'domain/onsitexdomain'          ;
import { Employee, Shift, Report, ReportOther, Invoice, DPS, PreAuth,      } from 'domain/onsitexdomain'          ;
import { Jobsite, Address, Street, OnSiteGeolocation, Schedule, Schedules, } from 'domain/onsitexdomain'          ;
import { Timesheet,                                                        } from 'domain/onsitexdomain'          ;
import { PayrollPeriod                                                     } from 'domain/onsitexdomain'          ;
import { PayrollPeriods                                                    } from 'domain/onsitexdomain'          ;
import { Message                                                           } from 'domain/onsitexdomain'          ;
import { Jobsites,                                                         } from 'domain/onsitexdomain'          ;
import { ReportLogistics,                                                  } from 'domain/onsitexdomain'          ;
import { ScheduleBeta,                                                     } from 'domain/onsitexdomain'          ;
import { OnSiteCoordinates, OnSiteGeoposition,                             } from 'domain/onsitexdomain'          ;
import { LatLng, LatLonLiteral,                                            } from 'domain/onsitexdomain'          ;
import { DatabaseProgress,                                                 } from 'domain/onsitexdomain'          ;
import { Employee as NewEmployee,                                          } from 'domain/newdomain'              ;
import { Jobsite as NewJobsite,                                            } from 'domain/newdomain'              ;
import { Street as NewStreet,                                              } from 'domain/newdomain'              ;
import { Address as NewAddress,                                            } from 'domain/newdomain'              ;
import { Report as NewReport,                                              } from 'domain/newdomain'              ;
import { SESAClient as NewSESAClient,                                      } from 'domain/newdomain'              ;
import { SESALocation as NewSESALocation,                                  } from 'domain/newdomain'              ;
import { SESALocID as NewSESALocID,                                        } from 'domain/newdomain'              ;
import { SESACLL as NewSESACLL,                                            } from 'domain/newdomain'              ;
import { SESAShift as NewSESAShift,                                        } from 'domain/newdomain'              ;
import { SESAShiftLength as NewSESAShiftLength,                            } from 'domain/newdomain'              ;
import { SESAShiftStartTime as NewSESAShiftStartTime,                      } from 'domain/newdomain'              ;
import { SESAShiftSymbols as NewSESAShiftSymbols,                          } from 'domain/newdomain'              ;
import { SESAShiftRotation as NewSESAShiftRotation,                        } from 'domain/newdomain'              ;
import { SESAReportType as NewSESAReportType,                              } from 'domain/newdomain'              ;
import { SESATrainingType as NewSESATrainingType,                          } from 'domain/newdomain'              ;
import { OSData                                                            } from 'providers/data-service'        ;
import { Preferences                                                       } from 'providers/preferences'         ;
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
import { DatabaseProgressComponent                                         } from 'components/database-progress'  ;
import { ElectronService                                                   } from 'providers/electron-service'    ;
import { DomainService                                                     } from 'providers/domain-service'      ;
import { MessageService as ToastService                                    } from 'primeng/api'                   ;
// import { JsonEditorOptions                                                 } from 'ang-jsoneditor'                ;
import { FileSaverSaveAs } from 'domain/onsitexdomain';
import isElectron from 'is-electron';
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
  @ViewChild('databaseProgressComponent') databaseProgressComponent:DatabaseProgressComponent;
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
  public replicationStart :Moment                                ;
  public replicationEnd   :Moment                                ;
  public replicationTime  :Duration                              ;
  public elapsedTime      :Duration                              ;
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
    classes['ScheduleBeta']      = ScheduleBeta      ;
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

    g['onsitedebug']    = classes;
    g['consoleobjects'] = classes;
    g['consoleclasses'] = classes;

    let newClasses:any = g['newdebug'] || {};
    newClasses['Employee']           = NewEmployee           ;
    newClasses['Address']            = NewAddress            ;
    newClasses['Street']             = NewStreet             ;
    newClasses['Report']             = NewReport             ;
    newClasses['Jobsite']            = NewJobsite            ;
    newClasses['SESAClient']         = NewSESAClient         ;
    newClasses['SESALocation']       = NewSESALocation       ;
    newClasses['SESALocID']          = NewSESALocID          ;
    newClasses['SESACLL']            = NewSESACLL            ;
    newClasses['SESAShift']          = NewSESAShift          ;
    newClasses['SESAShiftLength']    = NewSESAShiftLength    ;
    newClasses['SESAShiftStartTime'] = NewSESAShiftStartTime ;
    newClasses['SESAShiftSymbols']   = NewSESAShiftSymbols   ;
    newClasses['SESAShiftRotation']  = NewSESAShiftRotation  ;
    newClasses['SESAReportType']     = NewSESAReportType     ;
    newClasses['SESATrainingType']   = NewSESATrainingType   ;

    g['newdebug'] = newClasses;
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
      Log.l("OnSiteX Console: initializeApp() running. Now initializing PouchDB...");
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
      let out:any = await this.alert.showErrorMessage("STARTUP ERROR", "There was an error starting up", err);
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

    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe((data:{type:string, payload:any}) => {
      let key = data.type;
      let payload = data.payload;
      if(key === 'reports' || key === 'reports_ver101100') {
        this.data.setData('reports', payload);
      }
    });

    this.appSubscription = this.dispatch.appEventFired().subscribe((data:{channel:AppEvents, event?:any}) => {
      // Log.l(`appSubscription: received event:\n`, data);
      if(data) {
        let channel:AppEvents = data.channel;
        if(channel === 'openpage') {
          Log.l(`AppComponent: Received event 'openpage' ...`);
          if(data && data.event && data.event.page) {
            let pageData = data.event;
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
            Log.w(`AppComponent: unable to open page, no page provided in data packet:\n`, event);
            this.notify.addWarning('NO PAGE', `Invalid page provided: ${JSON.stringify(data['event'])}`, 3000)
          }
        } else if(channel === 'find-in-page') {
          Log.l(`AppComponent: Received event 'find-in-page' ...`);
          this.toggleFindInPage(true);
        } else if(channel === 'saveprefs') {
          Log.l(`AppComponent: Received event 'saveprefs' ...`);
          this.savePreferences();
        } else if(channel === 'replicationerror') {
          let dbname:string = data && data.event ? data.event : "UNKNOWN";
          Log.l(`AppComponent: Received event 'replicationerror' for '${dbname}' ...`);
          this.notify.addError("ERROR", `Replication error for database '${dbname}'. Replication will retry.`, 5000);
        } else if(channel === 'elapsedtime') {
          Log.l(`AppComponent: Received event 'elapsedtime' ...`);

        } else if(channel === 'logout') {
          Log.l(`AppComponent: Received event 'logout' ...`);
          this.logoutClicked();
        } else if(channel === 'login') {
          Log.l(`AppComponent: Received event 'login' ...`);
          this.showLogin();
        } else if(channel === 'authenticate') {
          Log.l(`AppComponent: Received event 'authenticate' ...`);
          this.reauthenticate();
        } else if(channel === 'updatedata') {
          Log.l(`AppComponent: Received event 'updatedata' ...`);
          this.updateData();
        } else if(channel === 'updatelogistics') {
          Log.l(`AppComponent: Received event 'updatelogistics' ...`);
          this.updateLogistics();
        } else if(channel === 'updatetimecards') {
          Log.l(`AppComponent: Received event 'updatetimecards' ...`);
          this.updateTimeCards();
        } else if(channel === 'options') {
          Log.l(`AppComponent: Received event 'options' ...`);
          let type = data.event;
          this.showOptions(type);
        } else if(channel === 'testnotifications') {
          Log.l(`AppComponent: Received event 'testnotifications' ...`);
          this.testNotifications();
        } else if(channel === 'replicationcomplete') {
          // let dbname = data && data.event && data.event.db ? data.event.db : "UNKNOWN";
          // Log.l(`AppComponent: Received event 'replicationcomplete' for '${dbname}' ...`);
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
          let reports = await this.data.getReports(count);
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
    // let spinnerID = '';
    try {
      let res:any;
      if(this.menuCtrl.isOpen()) {
        res = await this.menuCtrl.close();
      }
      // spinnerID = this.alert.showSpinner("Reauthenticating to server...");
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
        this.downloadStatus = "Downloading database ZIP file ..."
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
            if(isElectron()) {
              this.downloadStatus = "Saving downloaded file ...";
              // let fs = require('graceful-fs');
              let fs = gracefulfs;
              let abuffer:ArrayBuffer = await blob.arrayBuffer();
              let data:DataView = new DataView(abuffer);
              fs.writeFileSync(fileName, data);
              // fs.createReadStream(fileName).pipe(unzipper.Extract({ path: '.' }).on('close', (data:any) => {
              // fs.createReadStream(fileName).pipe(gunzip()).pipe(tar.extract('.')).on('close', (data:any) => {
              //   Log.l(`initialReplication(): ZIP file extracted. Resulting data:\n`, data);
              // });
              this.downloadStatus = "Extracting databases ...";
              fs.readFile(fileName, async (err, data) => {
                if(!err) {
                  try {
                    let zip:JSZip = new JSZip();
                    let contents = await zip.loadAsync(data);
                    Log.l(`AFTER CREATION, ZIP FILE IS: `, zip);
                    let zipfiles = contents.files;
                    for(let filename in zipfiles) {
                      this.downloadStatus = `Extracting database '${filename}' ...`;
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
    let spinnerID;
    try {
      let res:any;
      if(this.menuCtrl.isOpen()) {
        let out:any = await this.menuCtrl.close();
      }
      let count:number = 0, queued:number = 0;

      count = await this.server.getDocCount('reports');
      if(this.prefs.CONSOLE.global.reportsToLoad) {
        queued = this.prefs.CONSOLE.global.reportsToLoad;
      } else {
        queued = count || 1000000;
      }
      let text:string = `Retrieving ${count} work reports`;
      if(queued > 0 && queued !== 1000000) {
        text += ` (${count} total)`;
      }
      text += ' ...';
      spinnerID = await this.alert.showSpinnerPromise(text);
      let fetchCount:number = queued;
      res = await this.data.getReports(fetchCount, spinnerID);
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
      res = await this.data.getReports(fetchCount, spinnerID);
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
      Log.l("syncData(): Authenticated and synchronization started. Now fetching actual data.");
      res = await this.data.fetchAllData();
      Log.l("syncData(): All data fetched.");
      return res;
    } catch(err) {
      Log.l(`syncData(): Error with authentication of fetching data!`);
      Log.e(err);
      throw err;
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
    let spinnerID;
    try {
      // let spinnerID = this.alert.showSpinner("Logging in to server...");
      let spinnerText = "Logging in to databases on server...";
      let res:any = await this.auth.areCredentialsSaved();
      spinnerID = this.alert.showSpinner(spinnerText);
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
          this.alert.hideSpinner(spinnerID);
          throw err;
        }
      } else {
        Log.l("authenticate(): user credentials not found. Need to log in.");
        this.currentlyLoggedIn = false;
        this.data.status.loggedIn = false;
        this.alert.hideSpinner(spinnerID);
        let err:Error = new Error("authenticate(): No credentials found");
        throw err;
      }
    } catch(err) {
      Log.l(`authenticate(): Error during authentication!`);
      Log.e(err);
      this.currentlyLoggedIn = false;
      this.data.status.loggedIn = false;
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
      spinnerID = this.alert.showSpinner('Saving preferences...');
      let prefs = updatedPrefs ? updatedPrefs : this.prefs.getPrefs();
      let res:any = await this.storage.persistentSet('PREFS', prefs);
      Log.l("savePreferences: Preferences stored:\n", this.prefs.getPrefs());
      let out:any = await this.alert.hideSpinner(spinnerID);
      // this.notify.addSuccess('SAVED', `Saved user preferences!`, 3000);
      return res;
    } catch(err) {
      Log.l(`savePreferences(): Error saving preferences!`);
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      // return err;
      throw err;
    }
  }

  public async quietSavePreferences(updatedPrefs?:any) {
    // let spinnerID;
    try {
      // spinnerID = this.alert.showSpinner('Saving preferences...');
      let prefs = updatedPrefs ? updatedPrefs : this.prefs.getPrefs();
      let res:any = await this.storage.persistentSet('PREFS', prefs);
      Log.l("savePreferences: Preferences stored:\n", this.prefs.getPrefs());
      // let out:any = await this.alert.hideSpinner(spinnerID);
      // this.notify.addSuccess('SAVED', `Saved user preferences!`, 3000);
      return res;
    } catch(err) {
      Log.l(`savePreferences(): Error saving preferences!`);
      Log.e(err);
      // this.alert.hideSpinner(spinnerID);
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
    } catch(err) {
      Log.l(`showOptions(): Error showing options, type '${event}'!`);
      Log.e(err);
      throw err;
    }
  }

  public hideOptions() {
    this.globalOptionsVisible = false;
  }

  public optionsClosed(event:any) {
    this.globalOptionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public optionsSaved(event:any) {
    this.globalOptionsVisible = false;
    Log.l("optionsSaved(): Event is:\n", event);
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
  // }

  public isArray(value:any):boolean {
    if(Array.isArray(value)) {
      return true;
    } else {
      return false;
    }
  }

  public toggleMenu():boolean {
    this.menuEnabled = !this.menuEnabled;
    return this.menuEnabled;
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
  }

  public progressClosed(evt?:Event) {
    Log.l(`progressClosed(): Event is:\n`, evt);
    this.progressVisible = false;
  }

  public progressAborted(evt?:Event) {
    Log.l(`progressAborted(): Event is:\n`, evt);
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
}
