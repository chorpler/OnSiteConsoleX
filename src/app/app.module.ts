// import { StatusBar                                } from '@ionic-native/status-bar'                              ;
// import { SplashScreen                             } from '@ionic-native/splash-screen'                           ;
// import { ClipboardService                         } from 'ngx-clipboard'                                         ;
// import { GoogleMapsAPIWrapper                     } from '@agm/core'                                             ;
// import { WebWorkerService                         } from 'angular2-web-worker'                                   ;
// import { AgmCoreOverrideModule                    } from 'lib/angular-google-maps-lazyload.module'               ;
// import { AgmCoreModule                            } from '@agm/core'                                             ;
// import { NgJsonEditorModule                       } from 'ang-jsoneditor'                                        ;
// import { NotificationComponentModule,             } from 'components/notification/notification.module'           ;
import { BrowserModule                            } from '@angular/platform-browser'                             ;
import { HttpClientModule,                        } from '@angular/common/http'                                  ;
import { BrowserAnimationsModule                  } from '@angular/platform-browser/animations'                  ;
import { Nav                                      } from 'ionic-angular'                                         ;
import { ErrorHandler, NgModule                   } from '@angular/core'                                         ;
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'                                         ;
import { FormsModule                              } from '@angular/forms'                                        ;
// import { IonicStorageModule                       } from '@ionic/storage'                                        ;
import { WebStorageModule, LocalStorageService    } from 'ngx-store'                                             ;
import { OnSiteConsoleX                           } from './app.component'                                       ;
import { DndModule                                } from 'components/dnd/dnd.module'                             ;
import { SharedModule,                            } from 'primeng/shared'                                        ;
import { BlockUIModule                            } from 'primeng/blockui'                                       ;
import { DialogModule,                            } from 'primeng/dialog'                                        ;
import { OverlayPanelModule,                      } from 'primeng/overlaypanel'                                  ;
import { PanelMenuModule                          } from 'primeng/panelmenu'                                     ;
import { ProgressBarModule                        } from 'primeng/progressbar'                                   ;
import { ToastModule                              } from 'primeng/toast'                                         ;
import { MessageService as ToastService           } from 'primeng/api'                                           ;
import { LoginComponentModule                     } from 'components/login/login.module'                         ;
import { FindInPageComponentModule                } from 'components/find-in-page'                               ;
import { OptionsComponentModule                   } from 'components/options/options.module'                     ;
import { SpinnerModule,                           } from 'components/spinner/spinner.module'                     ;
import { SpinnerComponent,                        } from 'components/spinner/spinner'                            ;
import { SpinnerService                           } from 'providers/spinner-service'                             ;
import { PreauthOpenComponentModule               } from 'components/preauth-open/preauth-open.module'           ;
import { PreauthOpenComponent,                    } from 'components/preauth-open/preauth-open'                  ;
// import { DatabaseProgressComponentModule          } from 'components/database-progress'                          ;
import { DatabaseStatusComponentModule            } from 'components/database-status'                            ;
// import { EditorJsonComponentModule                } from 'components/editor-json'                                ;
import { DomHandler                               } from 'providers/dom-handler'                                 ;
import { NotifyService                            } from 'providers/notify-service'                              ;
import { CurrencyMaskModule                       } from 'components/ngx-currency-mask/ngx-currency-mask.module' ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'components/ngx-currency-mask/ngx-currency-mask.config' ;
import { PouchDBService                           } from 'providers/pouchdb-service'                             ;
import { StorageService                           } from 'providers/storage-service'                             ;
import { DBService                                } from 'providers/db-service'                                  ;
import { AuthService                              } from 'providers/auth-service'                                ;
import { AlertService                             } from 'providers/alert-service'                               ;
import { ServerService                            } from 'providers/server-service'                              ;
import { SmartAudio                               } from 'providers/smart-audio'                                 ;
import { Preferences                              } from 'providers/preferences'                                 ;
import { OSData                                   } from 'providers/data-service'                                ;
// import { PDFService                               } from 'providers/pdf-service'                                 ;
import { InvoiceService                           } from 'providers/invoice-service'                             ;
import { DispatchService                          } from 'providers/dispatch-service'                            ;
import { LoaderService                            } from 'providers/loader-service'                              ;
import { KeyCommandService                        } from 'providers/key-command-service'                         ;
import { DomainService                            } from 'providers/domain-service'                              ;
import { ScriptService                            } from 'providers/script-service'                              ;
import { HotkeyModule                             } from 'angular2-hotkeys'                                      ;
import { OnSiteConsoleLibrary                     } from 'providers/lib-service'                                 ;
import { NumberService                            } from 'providers/number-service'                              ;
import { MenuService                              } from 'providers/menu-service'                                ;
import { PipesModule                              } from 'pipes/pipes.module'                                    ;
// import { WebWorkerService                         } from 'angular2-web-worker'                                   ;
// import { AgmCoreOverrideModule                    } from 'lib/angular-google-maps-lazyload.module'               ;
// import { AgmCoreModule                            } from '@agm/core'                                             ;
import { ElectronService                          } from 'providers/electron-service'                            ;
import { ClipboardService                         } from 'providers/clipboard-service'                           ;
// import { PdfViewerModule                          } from 'ng2-pdf-viewer'                                        ;
import { MomentModule                             } from 'ngx-moment'                                            ;
// import { FontAwesomeModule                        } from '@fortawesome/angular-fontawesome'                      ;
// import { library                                  } from '@fortawesome/fontawesome-svg-core'                     ;
// import { fas                                      } from '@fortawesome/pro-solid-svg-icons'                      ;
// import { far                                      } from '@fortawesome/pro-regular-svg-icons'                    ;
// import { fal                                      } from '@fortawesome/pro-light-svg-icons'                      ;
// import { faDatabase                                                  } from '@fortawesome/pro-light-svg-icons'   ;
// import { faCircle                                                    } from '@fortawesome/pro-light-svg-icons'   ;
// import { faCircle as fasCircle                                       } from '@fortawesome/pro-solid-svg-icons'   ;
// import { faArrowAltDown                                              } from '@fortawesome/pro-light-svg-icons'   ;
// import { faArrowAltCircleDown                                        } from '@fortawesome/pro-light-svg-icons'   ;
// import { faArrowAltCircleDown as farArrowAltCircleDown               } from '@fortawesome/pro-regular-svg-icons' ;
// import { faArrowAltCircleDown as fasArrowAltCircleDown               } from '@fortawesome/pro-solid-svg-icons'   ;

const CustomCurrencyMaskConfig:CurrencyMaskConfig = {
  align        : "right",
  allowNegative: true,
  allowZero    : true,
  decimal      : ".",
  precision    : 2,
  prefix       : "$ ",
  suffix       : "",
  thousands    : ","
};

@NgModule({
  declarations: [
    OnSiteConsoleX,
    // GoogleChart,
  ],
  entryComponents: [
    OnSiteConsoleX,
    SpinnerComponent,
    PreauthOpenComponent,
  ],
  bootstrap: [
    IonicApp,
  ],
  imports: [
    BrowserModule,
    // HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(OnSiteConsoleX),
    WebStorageModule,
    // IonicStorageModule.forRoot(),
    // FontAwesomeModule,
    DndModule.forRoot(),
    SpinnerModule,
    PreauthOpenComponentModule,
    LoginComponentModule,
    FindInPageComponentModule,
    OptionsComponentModule,
    FormsModule,
    SharedModule,
    PanelMenuModule,
    DialogModule,
    ProgressBarModule,
    ToastModule,
    // DatabaseProgressComponentModule,
    DatabaseStatusComponentModule,
    // EditorJsonComponentModule,
    // DataTableModule,
    // CalendarModule.forRoot(),
    // GrowlModule,
    BlockUIModule,
    OverlayPanelModule,
    HotkeyModule.forRoot(),
    CurrencyMaskModule,
    PipesModule.forRoot(),
    // NotificationComponentModule,
    // PdfViewerModule,
    MomentModule,
    // NgJsonEditorModule,
    // NotificationsComponentModule,
    // NoticeComponentModule,
    // NoticesComponentModule,
    // NotificationComponentModule.forRoot(),
    // PrimeGrowlComponentModule,
    // KeysModule,
  ],
  providers: [
    // StatusBar,
    // SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Preferences,
    Nav,
    DndModule.forRoot().providers,
    OSData,
    SpinnerService,
    LocalStorageService,
    StorageService,
    // ConfirmationService,
    DBService,
    AuthService,
    AlertService,
    ServerService,
    PouchDBService,
    SmartAudio,
    InvoiceService,
    // PDFService,
    // GoogleMapsAPIWrapper,
    OnSiteConsoleLibrary,
    NumberService,
    MenuService,
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    // WebWorkerService,
    DomHandler,
    NotifyService,
    ToastService,
    KeyCommandService,
    DomainService,
    ScriptService,
    DispatchService,
    LoaderService,
    ClipboardService,
    ElectronService,
  ]
})
export class AppModule {
  constructor() {
    // // library.add(faDatabase, faArrowAltCircleDown, faArrowAltDown, farArrowAltCircleDown, fasArrowAltCircleDown);
    // library.add(faCircle);
    // library.add(fasCircle);
    // library.add(faDatabase);
    // library.add(faArrowAltCircleDown);
    // library.add(faArrowAltDown);
    // library.add(farArrowAltCircleDown);
    // library.add(fasArrowAltCircleDown);

    // library.add(fas, far, fal);
  }
}
