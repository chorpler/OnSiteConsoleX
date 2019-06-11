import { Subscription                                                                    } from 'rxjs'                         ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, EventEmitter,      } from '@angular/core'                ;
import { ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy                      } from '@angular/core'                ;
import { IonicPage                                                                       } from 'ionic-angular'                ;
import { NavController                                                                   } from 'ionic-angular'                ;
import { ModalController                                                                 } from 'ionic-angular'                ;
import { NavOptions                                                                      } from 'ionic-angular'                ;
// import { Storage                                                                         } from '@ionic/storage'               ;
import { LoginPage                                                                       } from 'pages/login/login'            ;
import { OnSiteConsoleX                                                                  } from 'app/app.component'            ;
import { AuthService                                                                     } from 'providers/auth-service'       ;
import { ServerService                                                                   } from 'providers/server-service'     ;
import { DBService                                                                       } from 'providers/db-service'         ;
import { AlertService                                                                    } from 'providers/alert-service'      ;
import { OSData                                                                          } from 'providers/data-service'       ;
import { DispatchService                                                                 } from 'providers'                    ;
import { Log, Moment, moment, dec, Decimal, oo, _matchCLL, _matchSite                    } from 'domain/onsitexdomain'         ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'         ;
import { SESAClient                                                                      } from 'domain/onsitexdomain'         ;
import { ReportLogistics,                                                                } from 'domain/onsitexdomain'         ;
import { ReportTimeCard,                                                                 } from 'domain/onsitexdomain'         ;
import { NotifyService                                                                   } from 'providers/notify-service'     ;
import { WorkReportItemsComponent                                                        } from "components/work-report-items" ;
import { ElectronService                                                                 } from 'providers/electron-service'   ;
import { UUID                                                                            } from 'domain/onsitexdomain'         ;

@IonicPage({ name: 'OnSiteX Console' })
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit,OnDestroy {
  @ViewChild('LoginPage') loginPage:LoginPage;
  public title             : string          = "OnSiteX Console Home" ;
  public mainPanelTitle    : string          = "OnSiteX Information"  ;
  public mainPanelSubheader: string          = ""                     ;
  public dsSubscription    : Subscription                             ;
  public showLastUpdated   : boolean         = true                   ;
  public loginData         : any                                      ;
  public currentlyLoggedIn : boolean         = false                  ;
  public username          : string          = "unknown"              ;
  public reportsdb         : any                                      ;
  public schedulingdb      : any                                      ;
  public employeesdb       : any                                      ;
  public signalReceiver    : any                                      ;
  public readify           : any                                      ;
  public employees         : Employee[]        = []                   ;
  public techs             : Employee[]        = []                   ;
  public office            : Employee[]        = []                   ;
  public reports           : Report[]          = []                   ;
  public oldreports        : Report[]          = []                   ;
  public logistics         : ReportLogistics[] = []                   ;
  public timecards         : ReportTimeCard[]  = []                   ;
  public others            : ReportOther[]     = []                   ;
  public sites             : Jobsite[]         = []                   ;
  public clients           : SESAClient[]      = []                   ;
  public totalSites        : Jobsite[]         = []                   ;
  public sesaSites         : Jobsite[]         = []                   ;
  // public clients           : any[]         = []                  ;
  // public mainPanelStyle    : any                = {'height': '90vh'}  ;
  public mainPanelStyle    : any                = ""                  ;
  public angle             : number             = 0                   ;
  // public animFrameRef      : number             = 0                   ;
  public animFrameRef      : any                                      ;
  // public get rotateStyle():any { return {transform: "rotate(" + this.angle + "deg)"}; } ;
  public rotateStyle       : any                                      ;
  public spinnerOn         : boolean            = false               ;
  public showHome          : boolean            = true                ;

  public navDelay          : number             = 500                 ;

  public updateTime        : Moment             = moment()            ;
  public id                : string             = UUID()              ;

  constructor(
    public application    : ApplicationRef    ,
    public changeDetector : ChangeDetectorRef ,
    public zone           : NgZone            ,
    public navCtrl        : NavController     ,
    public modalCtrl      : ModalController   ,
    public auth           : AuthService       ,
    public server         : ServerService     ,
    public db             : DBService         ,
    // public storage        : Storage           ,
    public alert          : AlertService      ,
    public data           : OSData            ,
    public appComponent   : OnSiteConsoleX    ,
    public dispatch       : DispatchService   ,
    public notify         : NotifyService     ,
    public electron       : ElectronService   ,
  ) {
    window['consolehome']  = this;
    window['consolehome2'] = this;
    window['p'] = this;
    // this.AppBootPage = OnSiteConsoleX;
    window.document.title = "OnSiteX Console";
  }

  ngOnInit() {
    Log.l(`HomePage: ngOnInit fired for ID '${this.id}'.`);
    this.rotateStyle = { 'transform': 'rotate(0deg)' };
    this.data.appReady().then(res => {
      this.runWhenReady();
    })
    // this.go();
  }

  ngOnDestroy() {
    Log.l(`HomePage: ngOnDestroy fired for ID '${this.id}'.`);
    this.cancelSubscriptions();
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    if(this.data.status.loggedIn) {
      this.currentlyLoggedIn = true;
      this.username = this.auth.getUser();
      this.copyServerInfo();
      this.updatePanelTitle();
      this.setPageLoaded();
    }
  }

  public initializeSubscriptions() {
    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe((data:{type:string, payload:any}) => {
      Log.l("Home.subscriptions: Got updated data payload!\n", data);
      let key = data.type;
      let payload = data.payload;
      if(key === 'reports' || key === 'reports_ver101100') {
        Log.l("Home.subscriptions: Updated data payload was for reports.")
        this.reports = payload;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.dsSubscription && !this.dsSubscription.closed) {
      this.dsSubscription.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public copyServerInfo() {
    Log.l(`copyServerInfo(): Now getting HomePage variables...`)
    let employees = this.data.getData('employees');
    this.employees = employees.filter((a:Employee) => {
      return a.active && !a.isTestUser;
    });

    let sites:Jobsite[] = this.data.getData('sites');
    let schedule:Schedule = this.data.getCurrentSchedule();

    this.techs = this.employees.filter((a:Employee) => {
      if(!a.active || a.isTestUser) {
        return false;
      }
      let site:Jobsite = schedule.getTechLocation(a, sites);
      if(site && site.is_office) {
        return false;
      } else if(a.isOffice()) {
        return false;
      } else if(a.isLogistics()) {
        return true;
      } else {
        return true;
      }
      // let c = a.userClass;
      // let uc: string;
      // if (Array.isArray(c)) {
      //   uc = c[0].toLowerCase();
      // } else {
      //   uc = String(c).toLowerCase();
      // }
      // return a.active && a.username !== 'admin' && a.username !== 'mike' && uc !== 'office' && uc !== 'manager';
    });

    this.office = this.employees.filter((a:Employee) => {
      // if(a.isTestUser) {
      //   return false;
      // }
      let site:Jobsite = schedule.getTechLocation(a, sites);
      if(site) {
        if(site.is_office) {
          return true;
        }
      }
      if(a.isOffice()) {
        return true;
      }
      return false;
      // let c = a.userClass;
      // let uc:string;
      // if(Array.isArray(c)) {
      //   uc = c[0].toLowerCase();
      // } else {
      //   uc = String(c).toLowerCase();
      // }
      // return (uc === 'office' || uc === 'manager') && a.active && a.username !== 'Chorpler' && a.username !== 'mike';
    });

    let reports:Report[] = this.data.getData('reports');
    this.reports = reports;
    // let reports = this.data.getData('reports');
    // this.reports = reports;
    // // this.reports = reports.slice(0);

    let others:ReportOther[] = this.data.getData('others');
    this.others = others;
    // this.others = others.slice(0);

    let logistics:ReportLogistics[] = this.data.getData('logistics');
    this.logistics = logistics;

    let timecards:ReportTimeCard[] = this.data.getData('timecards');
    this.timecards = timecards;

    // let sites = this.data.getData('sites');
    this.totalSites = sites;
    // this.totalSites = sites.slice(0);

    this.sites = sites.filter((a:Jobsite) => {
      return a.site_active && a.site_number > 9;
    });
  }

  public updatePanelTitle() {
    let date = moment();
    let dateString = date.format("MMM DD, YYYY, HH:mm:ss");
    this.mainPanelSubheader = `(last updated ${dateString})`;
  }

  public go() {
    Log.l("Console: go() has been called.");
  }

  public testNotifications() {
    let MIN = 500, MAX = 7500;
    let live = this.data.random(MIN, MAX);
    let details:string = `Developers are always watching, for ${live}ms at least.`;
    Log.l(`HomePage.testNotifications(): generating a notification that should last ${live}ms...`);
    // let msg:Notice = {severity:'error', summary:'ERROR!', detail:details, life:live}
    this.notify.addError("ERROR!", details, live);
  }

  public presentLoginModal(event?:Event) {
    this.appComponent.showLogin();
  }

  // public presentLoginModal() {
  //   let loginPage = this.modalCtrl.create('Login', {user: '', pass: ''}, { cssClass: 'login-modal'});
  //   loginPage.onDidDismiss(data => {
  //     Log.l("Got back:\n", data);
  //     this.loginData = data;
  //     this.onSubmit();
  //   })
  //   loginPage.present();
  // }

  public onSubmit() {
    Log.l("Login submitted:\n", this.loginData);
    if(this.loginData != null) {
      let u = this.loginData.user;
      let p = this.loginData.pass;
      this.username = u;
      this.server.loginToServer(u, p, '_session').then((res) => {
        if(res) {
          Log.l("Successfully logged in to server.");
          window.document.title = "OnSiteX Console"
          this.currentlyLoggedIn = true;
        } else {
          Log.l("Failed logging in to server.");
          this.currentlyLoggedIn = false;
        }
      }).catch((err) => {
        Log.l("Error logging in to server.");
        Log.e(err);
      });
    } else {
      Log.l("Login was dismissed or left empty.");
    }
  }

  // public logoutOfApp() {
  //   Log.l("logoutOfApp(): User clicked logout button.");
  //   this.auth.logout().then((res) => {
  //     Log.l("logoutOfApp(): Done logging out. Now canceling PouchDB/CouchDB syncs...");
  //     this.server.cancelAllSyncs();
  //     Log.l("logoutOfApp(): Done canceling PouchDB/CouchDB syncs.");
  //     this.currentlyLoggedIn = false;
  //   });
  // }

  public logoutOfApp(event?:Event) {
    // this.appComponent.logout();
    this.appComponent.logoutClicked();
  }

  public async viewReports(event?:Event) {
    Log.l("viewReports(): Clicked.");
    // this.navCtrl.setRoot('Reports');
    this.goToPageDelay('Reports');
  }

  public async viewReportOthers(event?:Event) {
    Log.l("viewReportOthers(): Clicked.");
    // this.navCtrl.setRoot('Reports', {scrollTo: 'others'});
    this.goToPageDelay('Reports', {scrollTo: 'others'});
  }

  public async loadReports(event?:Event) {
    try {
      this.data.status.fetchWorkReports = true;
      this.dispatch.triggerAppEvent('updatedata');
      // let res:Report[] = await this.data.getReports();
      // this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      // this.application.tick();
      // return res;
    } catch(err) {
      Log.l(`loadReports(): Error updating data!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
    }
  }

  public async loadOldReports(event?:Event):Promise<Report[]> {
    Log.l("loadOldReports() clicked.");
    this.notify.addInfo("RETRIEVING", `Downloading old reports...`, 3000);
    try {
      // let res = await this.db.getOldReports();
      let res:Report[] = await this.data.getOldReports();
      this.oldreports = res;
      this.data.setData('oldreports', res);
      let len = res.length;
      this.notify.addSuccess("SUCCESS", `Loaded ${len} old reports.`, 3000);
      return res;
    } catch(err) {
      Log.l(`loadOldReports(): Error loading reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error loading old reports: '${err.message}'`, 10000);
    }
  }

  public async loadReportOthers(event?:Event):Promise<ReportOther[]> {
    Log.l("loadReportOthers() clicked.");
    // this.notify.addInfo("RETRIEVING", `Downloading non-work reports...`, 3000);
    try {
      // let res = await this.db.getOldReports();
      let res:ReportOther[] = await this.data.getReportOthers();
      this.others = res;
      this.data.setData('others', res);
      let len = res.length;
      this.notify.addSuccess("SUCCESS", `Loaded ${len} non-work reports.`, 3000);
      return res;
    } catch(err) {
      Log.l(`loadReportOthers(): Error loading non-work!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error loading non-work reports: '${err.message}'`, 10000);
    }
  }

  public showOptions(event?:Event) {
    this.appComponent.showOptions();
  }

  public toggleSpinner() {
    if(!this.spinnerOn) {
      this.spinnerOn = true;
      let timer = setInterval(() => {
        if (!this.spinnerOn) {
          if (this.angle < 360) {
            this.angle += 10;
            this.rotateStyle = { 'transform': 'rotate(' + this.angle + 'deg)' };
          } else {
            this.angle = 0;
            this.rotateStyle = { 'transform': 'rotate(' + this.angle + 'deg)' };
            clearInterval(timer);
          }
        } else {
          this.angle = this.angle >= 360 ? 0 : this.angle + 10;
          this.rotateStyle = { 'transform': 'rotate(' + this.angle + 'deg)' };
          // this.spinSpinner(this.angle);
        }
      }, 200);
      this.animFrameRef = timer;
    } else {
      // let timer = setInterval(() => {
      //   if(!this.spinnerOn) {

      //     if(this.angle < 360) {
      //       this.angle += 10;
      //     } else {
      //       this.angle = 0;
      //       clearInterval(timer);
      //     }
      //   } else {
      //     this.angle = this.angle >= 360 ? 0 : this.angle + 10;
      //     // this.spinSpinner(this.angle);
      //   }
      // }, 50);
      // this.animFrameRef = timer;
      this.spinnerOn = false;
    }
  }

  public async viewLogisticsReports(evt?:Event):Promise<any> {
    try {
      Log.l(`viewLogisticsReports(): Running with arguments:`, arguments);
      // this.navCtrl.setRoot('Reports', {scrollTo: 'logistics'});
      this.goToPageDelay('Reports', {scrollTo: 'logistics'});

      // return res;
    } catch(err) {
      Log.l(`viewLogisticsReports(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }
  public async loadLogisticsReports(evt?:Event):Promise<any> {
    try {
      Log.l(`loadLogisticsReports(): Running with arguments:`, arguments);
      this.dispatch.triggerAppEvent('updatelogistics');
    } catch(err) {
      Log.l(`loadLogisticsReports(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }
  public async viewTimeCardReports(evt?:Event):Promise<any> {
    try {
      Log.l(`viewTimeCardReports(): Running with arguments:`, arguments);
      // this.navCtrl.setRoot('Reports', {scrollTo: 'timecards'});
      this.goToPageDelay('Reports', {scrollTo: 'timecards'});

      // return res;
    } catch(err) {
      Log.l(`viewTimeCardReports(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }
  public async loadTimeCardReports(evt?:Event):Promise<any> {
    try {
      Log.l(`loadTimeCardReports(): Running with arguments:`, arguments);
      this.dispatch.triggerAppEvent('updatetimecards');

      // return res;
    } catch(err) {
      Log.l(`loadTimeCardReports(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }

  public async viewWorkSites(type:string, evt?:Event):Promise<any> {
    try {
      Log.l(`viewWorkSites(): Running with arguments:`, arguments);
      // this.navCtrl.setRoot('Reports', {scrollTo: 'timecards'});
      if(type === 'active') {
        this.goToPageDelay('Work Sites', {show: 'active'});
      } else {
        this.goToPageDelay('Work Sites', {show: 'all'});
      }

      // return res;
    } catch(err) {
      Log.l(`viewWorkSites(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }

  public async viewEmployees(type:string, evt?:Event):Promise<any> {
    try {
      Log.l(`viewEmployees(): Running with arguments:`, arguments);
      // this.navCtrl.setRoot('Reports', {scrollTo: 'timecards'});
      if(type === 'all') {
        this.goToPageDelay('Employees', {type: 'all'});
      } else if(type === 'techs') {
        this.goToPageDelay('Employees', {type: 'techs'});
      } else if(type === 'office') {
        this.goToPageDelay('Employees', {type: 'office'});
      }

      // return res;
    } catch(err) {
      Log.l(`viewEmployees(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }

  public async goToPageDelay(page:string, params?:any, options?:NavOptions, evt?:Event):Promise<any> {
    try {
      Log.l(`goToPageDelay(): Called with arguments:`, arguments);
      let pageDelay:number = 500;
      if(typeof this.navDelay === 'number') {
        pageDelay = this.navDelay;
      }
      Log.l(`goToPageDelay(): About to set up timeout for page '${page}' with params:`, params);
      setTimeout(() => {
        Log.l(`goToPageDelay(): Delay is up, now attempting to go to page '${page}' ...`);
        this.goToPage(page, params, options, evt);
      }, pageDelay);
    } catch(err) {
      Log.l(`goToPageDelay(): Error going to page`);
      Log.e(err);
      throw err;
    }
  }



  public async goToPage(page:string, params?:any, options?:NavOptions, evt?:Event):Promise<any> {
    try {
      Log.l(`goToPage(): Called with arguments:`, arguments);
      if(typeof page === 'string') {
        let navParams:any = {page: page};
        if(params != undefined) {
          navParams['params'] = params;
        }
        if(options != undefined) {
          navParams['options'] = options;
          // this.navCtrl.setRoot(page, params);
        }
        Log.l(`goToPage(): About to trigger 'openpage' event with data event:`, navParams);
        this.dispatch.triggerAppEvent('openpage', navParams);
        // if(params != undefined) {
        //   if(options != undefined) {
        //     this.navCtrl.setRoot(page, params);
        //   } else {
        //     this.navCtrl.setRoot(page, params, options);
        //   }
        // } else {
        //   this.navCtrl.setRoot(page);
        // }
      } else {
        Log.w(`goToPage(): Invalid page called:`, page);
      }
    } catch(err) {
      Log.l(`goToPage(): Error going to page:`, arguments);
      Log.e(err);
      throw err;
    }
  }

  public menuButtonClick(event?:any) {
    Log.l("menuButtonClick(): Event is:", event);
    if(event) {
      this.electron.buttonClick(event);
    }
  }

  public showDatabaseStatus(event?:MouseEvent) {
    Log.l("Home.showDatabaseStatus(): Event is:", event);
    this.dispatch.triggerAppEvent('showdbstatus', event);
  }

}

