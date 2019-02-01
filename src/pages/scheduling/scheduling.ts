import { sprintf                                            } from 'sprintf-js'                         ;
import { Subscription                                       } from 'rxjs'                               ;
import { Component, NgZone, OnInit, OnDestroy,              } from '@angular/core'                      ;
import { ViewChild, ElementRef,                             } from '@angular/core'                      ;
import { IonicPage, NavController, NavParams,               } from 'ionic-angular'                      ;
import { ModalController, PopoverController, ViewController } from 'ionic-angular'                      ;
import { ServerService                                      } from 'providers/server-service'           ;
import { DBService                                          } from 'providers/db-service'               ;
import { AuthService                                        } from 'providers/auth-service'             ;
import { AlertService                                       } from 'providers/alert-service'            ;
import { Preferences                                        } from 'providers/preferences'              ;
import { NotifyService                                      } from 'providers/notify-service'           ;
import { OSData                                             } from 'providers/data-service'             ;
import { Log, Moment, moment, isMoment, oo, _dedupe,        } from 'domain/onsitexdomain'               ;
import { Jobsite, Employee, Schedule,                       } from 'domain/onsitexdomain'               ;
import { OptionsGenericComponent                            } from 'components/options-generic'         ;
import { Command, KeyCommandService                         } from 'providers/key-command-service'      ;
import { VideoPlayComponent                                 } from 'components/video-play'              ;
import { ScheduleOpenComponent                              } from 'components/schedule-open'           ;
import { Dropdown                                           } from 'primeng/dropdown'                   ;
import { OverlayPanel                                       } from 'primeng/overlaypanel'               ;
import { SelectItem                                         } from 'primeng/api'                        ;
// import { faExclamationCircle, faCheckCircle                 } from '@fortawesome/pro-regular-svg-icons' ;

type SCLL = {
  name      : string ,
  fullName  : string ,
  code     ?: string ,
  value    ?: string ,
};
type TechCounts = {total:number, working:number, off:number, office?:number, SESA?:number, RGV?:number};
type SESAStats  = {
  CLIENTS   : any        ,
  SESA      : TechCounts ,
  RGV      ?: TechCounts ,
  VACATION  : number     ,
  SITES     : any        ,
  TECHS     : TechCounts ,
  ROTATIONS : any        ,
};
type InSchedule = {
  site?: Jobsite,
  tech?: Employee,
  scheduled: boolean,
};
type EmployeeSorts = "none" | "checked-asc" | "checked-desc" | "active-asc" | "active-desc" | "name-asc" | "name-desc";

type TechItem = {
  title : string ,
  note  : string ,
  icon  : string ,
};

const _siteSort = (a:Jobsite, b:Jobsite) => {
  if(a instanceof Jobsite && b instanceof Jobsite) {
    return a.sort_number > b.sort_number ? 1 : a.sort_number < b.sort_number ? -1 : 0;
  } else {
    return 0;
  }
}

const _techSort = (a:Employee, b:Employee) => {
  if(a instanceof Employee && b instanceof Employee) {
    return (a.lastName < b.lastName) ? -1 : (a.lastName > b.lastName) ? 1 : (a.firstName < b.firstName) ? -1 : (a.firstName > b.firstName) ? 1 : (a.middleName < b.middleName) ? -1 : (a.middleName > b.middleName) ? 1 : (a.suffix < b.suffix) ? -1 : (a.suffix > b.suffix) ? 1 : 0;
  } else {
    return 0;
  }
}

const _techFilter = (a:Employee) => {
  if(a instanceof Employee) {
    let u = a.username;
    return u !== 'mike' && a.active;
  } else {
    return false;
  }
}

@IonicPage({ name: 'Scheduling' })
@Component({
  selector: 'page-scheduling',
  templateUrl: 'scheduling.html'
})
export class SchedulingPage implements OnInit,OnDestroy {
  // @ViewChild('optionsTarget') optionsTarget:ElementRef;
  // @ViewChild('optionsDialog') optionsDialog:Dialog;
  @ViewChild('optionsComponent') optionsComponent:OptionsGenericComponent       ;
  @ViewChild('videoComponent') videoComponent:VideoPlayComponent                ;
  @ViewChild('scheduleOpenTemplate') scheduleOpenTemplate:ScheduleOpenComponent ;
  @ViewChild('scheduleDateDropdown') scheduleDateDropdown:Dropdown              ;
  @ViewChild('op1') overlayPanel1:OverlayPanel                                  ;

  public title           : string          = "Scheduling"                       ;
  public panelTarget     : any             = 'body'                             ;
  public optionsType     : string          = 'scheduling'                       ;
  public modal           : boolean         = false                              ;
  // public faExclamationCircle : any         = faExclamationCircle                ;
  // public faCheckCircle       : any         = faCheckCircle                      ;
  // public faSize          : string          = 'lg'                               ;
  // public faSize          : string          = '2x'                               ;
  public icons           : string[]                                             ;
  public keySubscription : Subscription                                         ;
  public buttonLocation  : number          = 1                                  ;
  public updated         : boolean         = false                              ;
  public items           : TechItem[]      = []                                 ;
  public stats           : any             = null                               ;
  public techs           : Employee[] = []                                 ;
  public allTechs        : Employee[] = []                                 ;
  public unassignedTechs : Employee[] = []                                 ;
  public legrave         : Employee[] = []                                 ;
  public clients         : any[]      = []                                      ;
  public sites           : Jobsite[]  = []                                 ;
  public scheduleSites   : Jobsite[]  = []                                 ;
  public unscheduledSites: Jobsite[]  = []                                 ;
  public shiftTypes      : any[]      = []                                 ;
  public shiftHeaders    : SCLL[]     = []                                 ;
  public slots           : any[]      = []                                 ;
  public tmpSlots        : any[]      = []                                 ;
  public slotIndex       : number          = 0                                  ;
  public slotHTMLIndex   : number          = 0                                  ;
  public shiftCount      : number          = 0                                  ;
  public siteCount       : number          = 0                                  ;
  public techCount       : number          = 0                                  ;
  // public shiftsData      : any             = {}                                 ;
  public unassignedSite  : Jobsite                                              ;
  public legraveSite     : Jobsite                                              ;
  public dragOngoing     : boolean         = false                              ;
  public currentSchedule : any                                                  ;
  public doc             : any                                                  ;
  public scheduleReady   : boolean         = false                              ;
  public start           : Moment          = null                               ;
  public end             : Moment          = null                               ;
  public dateStart       : Date                                                 ;
  public dateEnd         : Date                                                 ;
  public strDateEnd      : string                                               ;
  // public get dateStart():Date { return moment(this.start).toDate();}            ;
  // public set dateStart(value:Date) { this.oldStartDate = moment(this.start); this.start = moment(value);};
  // public get dateEnd():Date { return moment(this.end).toDate();}                ;
  // public set dateEnd(value:Date) { this.end = moment(value);}                   ;
  // public get strDateEnd():string { return moment(this.end).format("DD MMM YYYY");};
  // public set strDateEnd(value:string) { this.end = moment(value, "DD MMM YYYY");};
  public oldStartDate    : Moment                                               ;
  public minDate         : any                                                  ;
  // public techTotal       : any             = null                               ;
  public invalidDates    : any[]      = []                                 ;
  public moment          : any             = moment                             ;
  public schedules       : Schedule[] = []                                 ;
  public schedule        : Schedule                                             ;
  public shiftKeyOn      : boolean         = false                              ;
  public mode            : string          = "Add"                              ;
  public employee        : Employee                                             ;
  public editEmployees   : Employee[]      = []                                 ;
  public videoVisible         : boolean     = false                             ;
  public optionsVisible       : boolean     = false                             ;
  public employeeViewVisible  : boolean     = false                             ;
  public scheduleOpenVisible  : boolean     = false                             ;
  public scheduleNewVisible   : boolean     = false                             ;
  public componentsAreReady   : boolean     = false                             ;
  public unsavedChanges       : boolean     = false                             ;
  public unsavedReason        : string      = ""                                ;
  public sortUnassignedStatus : number      = 1                                 ;
  public sortLegraveStatus    : number      = 1                                 ;
  public scheduleDatesMenu    : SelectItem[] = []                               ;
  public sitesListHeader      : string      = "Work Site List"                  ;
  public showSitesList        : boolean     = false                             ;
  public siteList             : InSchedule[]= []                                ;
  public siteSorts            : number[]    = [ -1, -1, -1 ]                    ;
  public showAllSites         : boolean     = true                              ;
  public sitesListClosable    : boolean     = true                              ;
  public sitesListESCable     : boolean     = true                              ;
  public employeeListHeader   : string      = "Employee List"                   ;
  public showEmployeeList     : boolean     = false                             ;
  public employeeList         : InSchedule[]= []                                ;
  public fullEmployeeList     : InSchedule[]= []                                ;
  public fullSitesList        : InSchedule[]= []                                ;
  public sorts                : number[]    = [ -1, -1, -1 ]                    ;
  public showAllEmployees     : boolean     = true                              ;
  public showUnassignedOnly   : boolean     = true                              ;
  public employeeListClosable : boolean     = true                              ;
  public employeeListESCable  : boolean     = true                              ;
  public sitesModal           : boolean     = false                             ;
  public employeesModal       : boolean     = false                             ;
  public dialogTarget         : string      = null                              ;
  // public dialogTarget         : string      = "body"                            ;
  public employeeSearch       : string      = ""                                ;
  public sitesSearch          : string      = ""                                ;
  public switchDelay          : number      = 500                               ;

  constructor(
    public navCtrl     : NavController     ,
    public navParams   : NavParams         ,
    public zone        : NgZone            ,
    public viewCtrl    : ViewController    ,
    public prefs       : Preferences       ,
    public db          : DBService         ,
    public server      : ServerService     ,
    public auth        : AuthService       ,
    public alert       : AlertService      ,
    public modalCtrl   : ModalController   ,
    public data        : OSData            ,
    // public pdf         : PDFService        ,
    public popCtrl     : PopoverController ,
    public keyService  : KeyCommandService ,
    public notify      : NotifyService     ,
    // public appComponent: OnSiteConsoleX    ,
  ) {
      this.doc              = {}   ;
      window['scheduling']  = this ;
      window['scheduling2'] = this ;
      window['p']           = this ;
  }

  public ngOnInit() {
    Log.l("SchedulingPage: ngOnInit() fired.");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  public ngOnDestroy() {
    Log.l("SchedulingPage: ngOnDestroy() fired.");
    this.cancelSubscriptions();
  }

  public ionViewDidEnter() {
    window['p'] = this;
  }

  public runWhenReady() {
    // let user_prefs = this.prefs.get
    if(this.navParams.get('modal') !== undefined) { this.modal = this.navParams.get('modal'); }
    this.initializeSubscriptions();
    this.clearSorting(-1);

    let user = this.data.getUser();
    let name = user.getUsername(), filtername = name;
    if(name === 'Chorpler') {
      filtername = 'grumpy';
    }
    this.schedules = this.data.getSchedules().filter((a:Schedule) => {
      // let result = (a.creator === filtername);
      // if(name === 'Chorpler') {
        // result = result || (a.creator === name);
      // }
      // return result;
      // return a.creator === filtername;
      return true;
    }).sort((a:Schedule,b:Schedule) => {
      let startA = a.start.format("YYYY-MM-DD");
      let startB = b.start.format("YYYY-MM-DD");
      return startA > startB ? -1 : startA < startB ? 1 : 0;
    });

    this.sites = this.data.getData('sites').sort(_siteSort);
    // .sort((a:Jobsite, b:Jobsite) => {
    //   let an = a.sort_number;
    //   let bn = b.sort_number;
    //   return an < bn ? -1 : an > bn ? 1 : 0;
    // });

    let unassignedSite:Jobsite = this.sites.find((a:Jobsite) => {
      return a.client.name === 'XX';
    });
    this.unassignedSite = unassignedSite;
    let legraveSite:Jobsite = this.sites.find((a:Jobsite) => {
      return a.inactive_users;
    });
    this.legraveSite = legraveSite;

    let techs = this.data.getData('employees');
    this.allTechs = techs.slice(0).sort(_techSort);
    this.techs = techs.filter(_techFilter);
    this.shiftTypes = this.data.getConfigData('rotations');
    this.shiftHeaders = this.data.getConfigData('rotations');
    // this.clients = this.data.getConfigData('clients');
    this.clients = _dedupe(this.sites.map((a:Jobsite) => a.client), 'fullName');

    if(this.navParams.get('schedule') !== undefined) {
      this.schedule = this.navParams.get('schedule');
    } else {
      this.schedule = this.schedules[0];
    }

    Log.l("Scheduling: Setting this.schedule to:\n", this.schedule);

    this.start = this.schedule.getStartDate();
    this.end   = this.schedule.getEndDate();
    // this.start = this.getScheduleStartDate().startOf('day');
    // this.end = moment(this.start).add(6, 'days');
    this.dateStart  = moment(this.start).toDate();
    this.dateEnd    = moment(this.end).toDate();
    this.strDateEnd = moment(this.dateEnd).format("DD MMM YYYY");
    this.oldStartDate = moment(this.start);

    this.schedule.loadSites(this.sites);
    // this.techs = [];
    // this.shiftTypes = [];
    // this.dateStart = this.start.toDate();
    // this.dateEnd    = this.end.toDate();
    // this.strDateEnd = this.end.format("DD MMM YYYY");
    this.minDate = moment().startOf('day').toDate();

    // let spinnerID = this.alert.showSpinner('Retrieving scheduling data...');
    // this.schedules = this.data.getSchedules();
    // this.techTotal = {};
    // for (let client of this.clients) {
    //   this.techTotal[client.fullName] = 0;
    // }

    this.shiftCount  = this.shiftTypes.length;
    this.siteCount   = this.sites.length;
    this.techCount   = this.techs.length;
    // this.shiftsData  = {};
    this.tmpSlots    = [];
    this.dragOngoing = false;

    // for (let site of this.sites) {
    //   this.shiftsData[site.schedule_name] = {};
    //   for (let shft of this.shiftTypes) {
    //     let oneShift = new Array();
    //     this.shiftsData[site.schedule_name][shft.name] = oneShift;
    //   }
    // }

    // let previousSchedule = this.prefs.getConsolePrefs().lastScheduleUsed;
    // if(!previousSchedule) {
    //   this.schedule = this.schedules[0];
    // } else {
    //   this.schedule = this.schedules.find(a => {
    //     return a['start'].format("YYYY-MM-DD") === previousSchedule;
    //   })
    // }
    // Log.l("Scheduling: About to getSchedule() ...");
    let schedule:Schedule = this.schedule;
    if(schedule && schedule['schedule']) {
      let tempSchedule = Object.assign({}, schedule);
      Log.l("Scheduling: got Schedule!\n", tempSchedule);
      this.doc = schedule;

      // schedule.createSchedulingObject(this.sites, this.techs);

      this.createDropdownMenus();
      Log.l("Scheduling: about to getScheduleStats()");
      this.getScheduleStats();
      // this.schedule = schedule;
      let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
      this.title = `Scheduling (${name})`;
      Log.l("Scheduling: schedule is ready.");
      this.scheduleChosen(schedule);
      this.scheduleReady = true;
      this.setPageLoaded();
      // this.alert.hideSpinner(spinnerID);
    } else {
      // this.alert.hideSpinner(spinnerID);
      this.setPageLoaded();
      this.scheduleReady = false;
      this.notify.addError("PROBLEM", "Could not read schedule. Please load a new schedule.", 10000);
      // this.alert.showAlert("PROBLEM", "Could not read schedule.  Please load a new schedule.");
    }
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "SchedulingPage.printSchedule"    : this.printSchedule(command.ev); break;
        case "SchedulingPage.showOptions"      : this.showOptions(); break;
        // case "SchedulingPage.newSchedule"      : this.newSchedule(); break;
        case "SchedulingPage.newSchedule"      : this.showNewSchedule(); break;
        case "SchedulingPage.persistSchedule"  : this.persistSchedule(); break;
        case "SchedulingPage.openSchedule"     : this.openSchedule(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && this.keySubscription.unsubscribe) {
      this.keySubscription.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public createDropdownMenus() {
    Log.l(`createDropdownMenus(): Now creating schedule dropdown menu...`);
    let schedules:Schedule[] = this.schedules || [];
    let scheduleMenu:SelectItem[] = [];
    for(let schedule of schedules) {
      let item:SelectItem;
      if(schedule instanceof Schedule) {
        let scheduleDate:Moment = schedule.getStartDate();
        let dateString:string = scheduleDate.format("DD MMM YYYY");
        item = {
          label: dateString,
          value: schedule  ,
        };
        scheduleMenu.push(item);
      }
    }
    this.scheduleDatesMenu = scheduleMenu;
    Log.l(`createDropdownMenus(): Dropdown menus created:\n`, scheduleMenu);
  }

  public openSchedule(id?:string):any {
    // if(id) {
    //   this.presentScheduleListModal();
    // } else {
    //   this.presentScheduleListModal();
    // }
    this.scheduleOpenVisible = true;
  }

  public presentScheduleListModal():any {
    let listModal = this.modalCtrl.create('Schedule List', {mode: 'original'}, {cssClass: 'schedule-list-modal'});
    listModal.onDidDismiss((data:any) => {
      Log.l("presentScheduleListModal(): Back from schedule list modal. Data:\n", data);
      window['p'] = this;
      if(data) {
        this.schedule = data.schedule;
        // this.shiftsData = this.schedule.schedule;
        this.techs = this.allTechs.filter(_techFilter).sort(_techSort);
        this.schedule.setTechs(this.techs.slice(0));
        this.schedule.createSchedulingObject(this.sites, this.techs);
        this.removeUsedTechs();
        this.getScheduleStats();
        this.start = moment(data.schedule.start);
        this.end   = moment(data.schedule.end);
        this.dateStart = moment(this.start).toDate();
        this.dateEnd    = moment(this.end).toDate();
        this.strDateEnd = moment(this.end).format("DD MMM YYYY");
        this.oldStartDate = moment(this.start);
        let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
        this.title = `Scheduling (${name})`;
      } else {

      }
    });
    listModal.present();
  }

  public closeScheduleChoose(event?:any) {
    Log.l(`closeScheduleChoose(): Event is:\n`, event);
    this.scheduleOpenVisible = false;
    window['p'] = this;
  }

  // public saveScheduleCustom() {
  //   let name;
  //   this.alert.showPrompt("Custom Save", "Enter a custom name for the schedule").then(res => {
  //     name = res;
  //     if(name) {
  //       let spinnerID = this.alert.showSpinner(`Saving as ${res}...`);
  //       let schedule:Schedule = new Schedule();
  //       // schedule.setSchedule(this.shiftsData);
  //       schedule.start = moment(this.start);
  //       schedule.startXL = moment(this.start).toExcel(true);
  //       schedule.end = moment(this.end);
  //       schedule.endXL = moment(this.end).toExcel(true);
  //       let doc = schedule.serialize();
  //       this.saveScheduleToDatabase(doc, true).then(res => {
  //         Log.l("saveScheduleCustom(): Successfully saved schedule.");
  //         this.alert.hideSpinner(spinnerID);
  //         this.updated = false;
  //       }).catch(err => {
  //         Log.l("saveScheduleCustom(): Error saving schedule.");
  //         Log.e(err);
  //         this.alert.hideSpinner(spinnerID);
  //         this.notify.addError('ERROR', `Error while saving schedule as ${name}: '${err.message}'`, 10000);
  //         // this.alert.showAlert('ERROR', `Error while saving schedule as ${name}:<br>\n<br>\n` + err.message);
  //       });
  //     }
  //   }).catch(err => {
  //     Log.l("saveScheduleCustom(): Error getting schedule name.");
  //     Log.e(err);
  //   })
  // }

  public async persistSchedule(startDate?:any, endDate?:any) {
    let spinnerID:string;
    try {
      Log.l("Persisting schedule to CouchDB server...");
      spinnerID = this.alert.showSpinner('Saving...');
      let doc:any = {}, key = "current";
      if (typeof startDate === 'string') {
        // key = startDate + "_" + endDate;
        key = startDate;
      } else if (isMoment(startDate)) {
        // key = startDate.format("YYYY-MM-DD") + "_" + endDate.format("YYYY-MM-DD");
        key = startDate.format("YYYY-MM-DD");
      }
      // doc['_id'] = this.doc['_id'] || key;
      let user:Employee = this.data.getUser();
      let name:string = user.getUsername();
      if(name !== 'grumpy' && name !== 'Chorpler') {
        doc._id = `${key}_${name}`;
      } else {
        doc._id = key;
      }
      if(this.doc['_rev']) {
        doc['_rev'] = this.doc['_rev'];
      }
      doc.start   = moment(this.start).format("YYYY-MM-DD");
      doc.startXL = moment(this.start).toExcel(true);
      doc.end     = moment(this.end).format("YYYY-MM-DD");
      doc.endXL   = moment(this.end).toExcel(true);
      doc.creator = name;
      doc.type    = 'week';
      let res:any = await this.saveScheduleToDatabase(doc, true);
      Log.l("persistSchedule(): Successfully saved schedule.");
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.updated = false;
      this.unsavedChanges = false;
      this.unsavedReason  = "";
      let techs:Employee[] = this.techs;
      for(let tech of techs) {
        tech.employeeMoved = false;
      }
      this.notify.addSuccess('SAVED', `Saved schedule '${this.schedule._id}'`, 3000);
      return res;
    } catch(err) {
      Log.l("persistSchedule(): Error saving schedule.");
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError('ERROR', `Error while saving schedule: '${err.message}'`, 10000);
      // this.alert.showAlert('ERROR', 'Error while saving schedule:<br>\n<br>\n' + err);
    }
  }

  public saveVisibleSchedule(schedule:Schedule) {
    // let scheduleDoc =
  }

  public saveScheduleToDatabase(doc:any, overwrite?:boolean) {
    return new Promise((resolve, reject) => {
      let schedule:Schedule = this.schedule;
      if(!(Array.isArray(schedule.sites) && schedule.sites.length > 0)) {
        schedule.loadSites(this.sites);
      }
      // if(!(Array.isArray(schedule.scheduleList) && schedule.scheduleList.length > 0)) {
        schedule.createScheduleList();
      // }
      let newdoc = schedule.serialize();
      Log.l("saveScheduleToDatabase(): Schedule to be persisted:\n", newdoc);
      // doc['schedule'] = this.shiftsData;
      // doc['schedule'] =
      // if(overwrite) {
        this.server.saveSchedule(newdoc, true).then((res) => {
          Log.l("saveScheduleToDatabase(): Shift data persisted.\n", res);
          resolve(true);
        }).catch((err) => {
          Log.l("saveScheduleToDatabase(): Error persisting shift data!");
          Log.e(err);
          reject(err);
        });
      // } else {
      //   this.server.saveSchedule(doc).then((res) => {
      //     Log.l("Shift data persisted.\n", res);
      //     resolve(true);
      //   //   return this.server.getSchedule();
      //   // }).then((doc) => {
      //   //   if (doc && doc['schedule']) {
      //   //     Log.l("Shift data retrieved, mostly for new _rev value.");
      //   //     this.doc = doc;
      //   //     resolve(doc);
      //   //   }
      //   }).catch((err) => {
      //     Log.l("Error persisting shift data!");
      //     Log.e(err);
      //     reject(err);
      //   });
      // }

    });
  }

  public incrementSchedule(scheduleObject?:any) {
    // let schedule = scheduleObject ? scheduleObject : this.shiftsData;
    let schedule = scheduleObject ? scheduleObject : this.schedule.getSchedule();
    for (let site in schedule) {
      Log.l("Rotating for site '%s':\n", site, schedule[site]);
      let tmpArr                   = schedule[site]["FIRST WEEK"];
      schedule[site]["FIRST WEEK"] = schedule[site]["DAYS OFF"];
      schedule[site]["DAYS OFF"]   = schedule[site]["FINAL WEEK"];
      schedule[site]["FINAL WEEK"] = tmpArr;
    }
    // this.persistSchedule();
    return schedule;
  }

  public removeUsedTechs() {
    // if (this.shiftsData && Object.keys(this.shiftsData)) {
    // if (this.shiftsData && Object.keys(this.shiftsData)) {
    //   for (let site in this.shiftsData) {
    //     for (let shift in this.shiftsData[site]) {
    //       for (let idx in this.shiftsData[site][shift]) {
    //         let name = this.shiftsData[site][shift][idx];
    //         let i = this.techs.findIndex((a:Employee) => {
    //           return a.getTechName() === name;
    //         });

    let schedule = this.schedule.getSchedule();
    if(schedule && Object.keys(schedule)) {
      for(let site in schedule) {
        for(let shift in schedule[site]) {
          for(let idx in schedule[site][shift]) {
            let name = schedule[site][shift][idx];
            let i = this.techs.findIndex((a:Employee) => {
              if(typeof name === 'string') {
                return a.getUsername() === name;
              } else if(name instanceof Employee) {
                return a.getUsername() === name.getUsername();
              } else {
                return false;
              }
            });
            // let tmpTech = new Employee();
            // tmpTech.readFromDoc(tech);
            // let techIndex = -1;
            // let i = 0;
            // let techName = tmpTech.toString().toUpperCase();
            // for(let tech2 of this.techs) {
            //   let tech2Name = tech2.toString().toUpperCase();
            //   if(tech2Name === techName) {
            //     techIndex = i;
            //     break;
            //   }
            //   i++;
            // }

            // if (techIndex > -1) {
            //   this.techs.splice(techIndex, 1);
            // }
            let tech;
            if(i > -1) {
              tech = this.techs.splice(i, 1)[0];
              // this.shiftsData[site][shift][idx] = tech;
              schedule[site][shift][idx] = tech;
            } else {
              Log.w(`removeUsedTechs(): Tech '${name}' not found in list!`);
            }
          }
        }
      }
    } else {
      Log.w("removeUsedTechs(): shiftsData is null or has no keys. Can't remove techs.");
    }
  }

  public keys(obj:any) {
    // Log.l("keys(): Now attempting to return Object.keys() for:\n", obj);
    return Object.keys(obj);
  }

  public updateDate() {
    Log.l("updateDate(): No longer used.");
    this.notify.addError("WARNING", "You shouldn't be able to see this; changing the date here is no longer supported. Just create a new schedule.", 10000);
    // this.alert.showAlert("WARNING", "You shouldn't be able to see this; changing the date here is no longer supported. Just create a new schedule.");
  }

  public updateEndDate() {
    Log.l("updateEndDate(): End date is now '%s'", moment(this.end).format("YYYY-MM-DD"));
    this.schedule.setEndDate(moment(this.end));

  }

  public newSchedule(evt?:Event) {
    let popover = this.popCtrl.create('Schedule New', {schedules: this.schedules}, {cssClass: 'scheduling-new-popover'});
    popover.onDidDismiss((data:any) => {
      Log.l("newSchedule(): Popover dismissed.");
      window['p'] = this;
      if(data) {
        Log.l("Data is:\n", data);
        let start = moment(data.date).startOf('day');
        let end = moment(start).add(6,'days');
        let startDate = start.toDate();
        let endDate = end.toDate();
        let user = this.data.getUser();
        let name = user.getUsername();
        let schedule:Schedule = new Schedule();
        schedule.setStartDate(start);
        schedule.setEndDate(end);
        schedule.setCreator(name);
        // let scheduleDoc = oo.clone(this.shiftsData);
        let scheduleDoc = oo.clone(this.schedule.getSchedule());
        let scheduleObject;
        if(data.action === 'increment') {
          scheduleObject = this.incrementSchedule(scheduleDoc);
        } else if(data.action === 'clear') {
          let sites = this.sites;
          scheduleObject = schedule.createEmptySchedule(sites);
          let techs = this.allTechs.slice(0);
          this.techs = techs.filter(_techFilter).sort(_techSort);
          this.prefs.getConsolePrefs().scheduling.showAllSites = true;
        } else {
          scheduleObject = scheduleDoc;
        }
        schedule.setSchedule(scheduleObject);
        // this.shiftsData = scheduleObject;
        // this.schedule.setSchedule(scheduleObject);
        this.schedule = schedule;
        this.removeUsedTechs();
        this.start = moment(start);
        this.end = moment(end);
        this.dateStart = startDate;
        this.dateEnd = endDate;
        this.strDateEnd = end.format("DD MMM YYYY");
        // this.schedule._id = start.format("YYYY-MM-DD");
        let weekStart = moment(this.schedule.getStartDate());
        this.schedule._id = weekStart.format("YYYY-MM-DD");
        this.schedule.techs = this.allTechs.slice(0);
        this.schedule.unassigned = this.techs.slice(0);
        this.schedule.loadTechs(this.allTechs);
        // this.schedule = schedule;
        let scheduleName = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
        this.title = `Scheduling (${scheduleName})`;
        this.getScheduleStats();
        this.generateUnscheduledSites();
      } else {
        Log.l("newSchedule(): No data returned, user must not want a new schedule after all.");
      }
    });
    popover.present();
  }

  public clearCurrentSchedule() {
    Log.l("clearCurrentSchedule(): Verifying...");
    // let popover = this.popCtrl.create('Show Popover', {}, {cssClass: 'video-popover'});
    // popover.present();
    this.videoVisible = true;
  }

  public getScheduleStartDate(date?:any) {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day = date ? moment(date) : moment();

    if(day.isoWeekday() <= scheduleStartsOnDay) { return day.isoWeekday(scheduleStartsOnDay); }
    else { return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  }

  public getScheduleStats():SESAStats {
    let stats:SESAStats = {
      CLIENTS   : {}                               ,
      SESA      : { total: 0, working: 0, off: 0, office: 0 } ,
      RGV       : { total: 0, working: 0, off: 0, office: 0 } ,
      VACATION  : 0                                ,
      SITES     : {}                               ,
      TECHS     : { total: 0, working: 0, off: 0, SESA: 0, RGV: 0 } ,
      ROTATIONS : {}                               ,
    };
    // let dat = this.shiftsData;
    let dat = this.schedule.getSchedule();
    let office_sites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      return a.site_number == 1075 || a.site_number === 1002 || a.is_office;
    });
    let officeSiteNames:string[] = office_sites.map((a:Jobsite) => {
      return a.getScheduleName();
    });
    let testSites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      return a.test_site;
    });
    let testSiteNames:string[] = testSites.map((a:Jobsite) => a.schedule_name);
    let nonSESASites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      return a.client.name === 'SP';
    });
    let nonSESASiteNames:string[] = nonSESASites.map((a:Jobsite) => a.schedule_name);
    for(let rotation of this.shiftTypes) {
      stats.ROTATIONS[rotation.name] = {total: 0};
      for(let i in dat) {
        let keys = Object.keys(dat[i]);
        for(let rotationName of keys) {
          if(rotation.name.toUpperCase() === rotationName.toUpperCase()) {
            // if(i == office_site.schedule_name) {
            if(officeSiteNames.indexOf(i) > -1) {
              if(this.prefs.CONSOLE.scheduling.showOffice) {
                stats.ROTATIONS[rotation.name].total += dat[i][rotationName].length;
              }
            } else if(testSiteNames.indexOf(i) > -1) {
              if(this.prefs.CONSOLE.scheduling.showTestSites) {
                stats.ROTATIONS[rotation.name].total += dat[i][rotationName].length;
              }
            } else if(nonSESASiteNames.indexOf(i) > -1) {
              if(this.prefs.CONSOLE.scheduling.showNonSESA) {
                stats.ROTATIONS[rotation.name].total += dat[i][rotationName].length;
              }
            } else {
              stats.ROTATIONS[rotation.name].total += dat[i][rotationName].length;
            }
          }
        }
      }
    }
    for(let client of this.clients) {
      // if(client.name !== 'SE') {
        stats.CLIENTS[client.name] = {total: 0, working: 0, off: 0, office:0};
      // }
    }
    let techStats:TechCounts = stats.TECHS;
    for(let site of this.sites) {
      // if(site.locID.name !== 'OFFICE') {
      // Log.l("getScheduleStats(): Now processing site:\n", site);
      let sitename = site.schedule_name;
      stats.SITES[sitename] = {total: 0, working: 0, off: 0};
    // if(site.client.name !== 'SE') {
      let sitestats = stats.SITES[sitename];
      let clientStats = stats.CLIENTS[site.client.name];
      let shifts = dat[sitename];
      for(let shiftname in shifts) {
        let shift = shifts[shiftname];
        let sub = shift.length;
        if(shiftname === 'FIRST WEEK' || shiftname === 'CONTN WEEK' || shiftname === 'FINAL WEEK') {
          if(site.is_office) {
            clientStats.office += sub;
          } else {
            clientStats.working += sub;
          }
          sitestats.working   += sub;
          if(site.client.name === 'SE') {
            techStats.SESA   += site.is_office ? 0 : sub;
          } else if(site.client.name === 'SP') {
            techStats.RGV    += site.is_office ? 0 : sub;
          } else {
            techStats.working   += site.is_office ? 0 : sub;
          }
        } else if(shiftname === 'DAYS OFF') {
          if(!site.is_office) {
            clientStats.off += sub;
          }
          sitestats.off   += sub;
          if(site.client.name === 'SE') {
            techStats.SESA   += site.is_office ? 0 : sub;
          } else if(site.client.name === 'SP') {
            techStats.RGV    += site.is_office ? 0 : sub;
          } else {
            techStats.off   += site.is_office ? 0 : sub;
          }
          // techStats.off   += site.is_office ? 0 : sub;
        } else if(shiftname === 'VACATION') {
          stats.VACATION  += sub;
          if(!site.is_office) {
            clientStats.off += sub;
          }
          sitestats.off   += sub;
          if(site.client.name === 'SE') {
            techStats.SESA   += site.is_office ? 0 : sub;
          } else if(site.client.name === 'SP') {
            techStats.RGV    += site.is_office ? 0 : sub;
          } else {
            techStats.off   += site.is_office ? 0 : sub;
          }
          // techStats.off   += site.is_office ? 0 : sub;
        }
        sitestats.total   = sitestats.working   + sitestats.off;
        // techStats.total   = techStats.working   + techStats.off + techStats.SESA + this.schedule.getUnassignedActiveCount();
        // techStats.total   = techStats.working   + techStats.off + this.schedule.getUnassignedActiveCount();
        techStats.total   = techStats.working   + techStats.off + this.schedule.getUnassignedCount();
        if(this.prefs.CONSOLE.scheduling.showNonSESA) {
          // techStats.total += techStats.RGV;
        }
        clientStats.total = clientStats.working + clientStats.off;
        if(site.locID.name !== 'OFFICE') {
        } else {
          // techStats.total = 0;
        }
      }
    }

    this.stats = stats;
    Log.l("getScheduleStats(): Overall statistics are: ", stats);
    return stats;
  }

  public addSite(site:Jobsite) {
    let schedule:Schedule = this.schedule;
    let scheduleDoc = schedule.getSchedule();
    let siteName = site.getScheduleName();
    let rotationObject:any = {};
    // scheduleObject[siteName] = {};
    let shiftRotations:any = site.getShiftRotations();
    for(let siteRotation of shiftRotations) {
      let rotation = siteRotation.name;
      rotationObject[rotation] = [];
    }
    let keys = Object.keys(scheduleDoc);
    if(keys.indexOf(siteName) === -1) {
      scheduleDoc[siteName] = rotationObject;
      schedule.sites.push(site);
      schedule.sites = schedule.sites.sort(_siteSort);
      this.generateScheduleSiteList();
      site['newsite'] = true;
      this.unsavedChanges = true;
      this.unsavedReason  = "site added";
    } else {
      Log.w(`addSite(): Site already exists in schedule:\n`, site);
      this.notify.addError('CONFLICT', `Site '${site.getScheduleName()}' is already in the schedule!`, 4000);
    }
  }

  public async addSiteToSchedule(site:Jobsite, evt?:Event) {
    try {
      site['newsite'] = true;
      let scheduleDate:string = this.schedule.getStartDate().format("DD MMM YYYY");
      let title:string = "ADD SITE";
      let text:string = `Add work site '${site.schedule_name}' to schedule for ${scheduleDate}?`;
      let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        this.addSite(site);
        this.notify.addSuccess("SUCCESS", `Added site '${site.schedule_name}' to this schedule`, 3000);
      } else {
        this.notify.addInfo("CANCELED", `Not adding site '${site.schedule_name}' to this schedule`, 3000);
      }
      // return res;
    } catch(err) {
      Log.l(`addSiteToSchedule(): Error adding site to schedule!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error adding site to schedule: '${err.message}'`, 5000);
      // throw new Error(err);
    }
  }

  public viewSiteList(event?:any) {
    Log.l(`viewSiteList(): Event is:\n`, event);
    if(!(this.siteList && this.siteList.length)) {
      this.generateSiteList();
    }
    Log.l(`viewSiteList(): Site list is:\n`, this.siteList);
    // }
    this.showSitesList = true;
  }

  public toggleSortSiteColumn(column:number) {
    Log.l(`toggleSortSiteColumn(): Event is:\n`, event);
    this.clearSorting(column);
    let sorts:number[] = this.sorts;
    if(sorts[column] === -1 || sorts[column] === 2) {
      sorts[column] = 1;
    } else if(sorts[column] === 1) {
      sorts[column] = 2;
    } else if(sorts[column] === 2) {
      sorts[column] = 1;
    }
    this.sorts = sorts;
    this.siteSorts = sorts;
    this.sortSiteList(column);
    Log.l(`toggleSortSiteColumn(): Sorting column ${column}, sorts is now:\n`, this.siteSorts);
    return this.siteSorts;
  }

  public sortSiteList(column:number) {
    let asc = 1;
    let sorts = this.sorts;
    let dir = sorts[column];
    if(dir === -1 || dir === 1) {
      /* Reverse */
      // this.siteList.reverse();
      asc = -1;
    } else if(dir === 2) {
      /* Leave sorted ascending */
      asc = 1;
    }
    if(column === 0) {
      this.siteList.sort((a:InSchedule, b:InSchedule) => {
        return a.scheduled > b.scheduled ? asc : a.scheduled < b.scheduled ? -asc : 0;
      });
    } else if(column === 1) {
      this.siteList.sort((a:InSchedule, b:InSchedule) => {
        let aA = a.site.site_active;
        let aB = b.site.site_active;
        return aA > aB ? asc : aA < aB ? -asc : 0;
      });
    } else if(column === 2) {
      this.siteList.sort((a:InSchedule, b:InSchedule) => {
        let nA = a.site.getScheduleName();
        let nB = b.site.getScheduleName();
        return nA > nB ? asc : nA < nB ? -asc : 0;
      });
    }
  }

  public async siteToggled(index:number, event?:any) {
    try {
      Log.l(`siteToggled(): Event is:\n`, event);
      let item:InSchedule = this.siteList[index];
      let site:Jobsite = item.site;
      let scheduled:boolean = item.scheduled;
      Log.l(`siteToggled(): Setting site '${index}' (${site.getScheduleName()}) to ${scheduled}:\n`, site);
      let schedule:Schedule = this.schedule;
      if(scheduled) {
        // schedule.addUnassignedTech(tech);
        schedule.addSite(site);
        this.unsavedChanges = true;
        this.unsavedReason  = "site added";
        this.generateScheduleSiteList();
      } else {
        let siteTechs:Employee[] = schedule.getAllTechsForSite(site);
        if(siteTechs && siteTechs.length) {
          let confirm:boolean = await this.alert.showConfirm("SITE IN USE", `This site has ${siteTechs.length} employees in the current schedule. They will be set to UNASSIGNED. Are you sure?`);
          if(!confirm) {
            item.scheduled = true;
            return;
          }
        }
        // Remove site
        /* Placeholder for site removal */
        schedule.removeSite(site);
        Log.l(`siteToggled(): Site '${site.getScheduleName()}' was removed from schedule '${schedule._id}'!`);
        this.unsavedChanges = true;
        this.unsavedReason  = "site removed";
        this.generateScheduleSiteList();
      }
    } catch(err) {
      Log.l(`siteToggled(): Error toggling site!`);
      Log.e(err);
      throw new Error(err);
    }
  }
  public toggleSiteActive(event?:any) {
    Log.l(`toggleSiteActive(): Event is:\n`, event);
  }
  // public editSite(event?:any) {
  //   Log.l(`editSite(): Event is:\n`, event);
  // }
  public closeSitesList(event?:any) {
    Log.l(`closeSitesList(): Event is:\n`, event);
    this.showSitesList = false;
  }

  public generateSiteList():InSchedule[] {
    let list:InSchedule[] = [];
    let sites:Jobsite[] = this.data.getData('sites').slice(0);
    let schedule:Schedule = this.schedule;
    // let techsInSchedule:Employee[] = this.schedule.getTechs();
    let names:string[] = sites.map((a:Jobsite) => a.getScheduleName());
    // let namesInSchedule:string[] = techsInSchedule.map((a:Employee) => a.username);
    sites.sort((a:Jobsite, b:Jobsite) => {
      let nA = a.getScheduleName();
      let nB = b.getScheduleName();
      return nA > nB ? 1 : nA < nB ? -1 : 0;
    });
    for(let site of sites) {
      let item:InSchedule = {
        site: site,
        scheduled: false,
      };
      let siteName:string = site.getScheduleName();
      if(schedule.isSiteNameInSchedule(siteName)) {
        item.scheduled = true;
      }
      // if(namesInSchedule.indexOf(name) > -1) {
      //   item.scheduled = true;
      // }
      list.push(item);
    }
    this.fullSitesList = list.slice(0);
    this.siteList = list;
    this.siteSorts = [ -1, -1, 2 ];
    return list;
  }

  public generateEmployeeList():InSchedule[] {
    let list:InSchedule[] = [];
    let techs:Employee[] = this.allTechs.slice(0);
    let schedule:Schedule = this.schedule;
    // let techsInSchedule:Employee[] = this.schedule.getTechs();
    let names:string[] = techs.map((a:Employee) => a.username);
    // let namesInSchedule:string[] = techsInSchedule.map((a:Employee) => a.username);
    techs.sort((a:Employee, b:Employee) => {
      let nA = a.getFullName();
      let nB = b.getFullName();
      return nA > nB ? 1 : nA < nB ? -1 : 0;
    });
    for(let tech of techs) {
      let item:InSchedule = {
        tech: tech,
        scheduled: false,
      };
      let name:string = tech.getUsername();
      if(schedule.isUsernameInSchedule(name)) {
        item.scheduled = true;
      }
      // if(namesInSchedule.indexOf(name) > -1) {
      //   item.scheduled = true;
      // }
      list.push(item);
    }
    this.fullEmployeeList = list.slice(0);
    this.employeeList = list;
    this.sorts = [ -1, -1, 2 ];
    this.clearEmployeeSearch();
    return list;
  }

  public viewTechList(event?:any) {
    Log.l(`viewTechList(): Event is:\n`, event);
    if(!(this.employeeList && this.employeeList.length)) {
      this.generateEmployeeList();
    }
    Log.l(`viewTechList(): Employee list is:\n`, this.employeeList);
    // }
    this.showEmployeeList = true;
  }

  public techToggled(index:number, event?:any) {
    let item:InSchedule = this.employeeList[index];
    let tech:Employee = item.tech;
    let scheduled:boolean = item.scheduled;
    Log.l(`techToggled(): Setting tech '${index}' (${tech.getUsername()}) to ${scheduled}:\n`, tech);
    let schedule:Schedule = this.schedule;
    if(scheduled) {
      schedule.addUnassignedTech(tech);
    } else {
      schedule.removeTech(tech);
    }
    this.unsavedChanges = true;
    this.unsavedReason  = "tech added/removed";
  }

  public closeTechList(event?:any) {
    Log.l(`closeTechList(): Event is:\n`, event);
    this.showEmployeeList = false;
  }

  public async toggleTechActive(tech:Employee) {
    let username = tech.getUsername();
    let loggedInUser = this.data.getUser();
    let loggedInUsername = loggedInUser.getUsername();
    let spinnerID;
    try {
      if(tech.active) {
        spinnerID = await this.alert.showSpinnerPromise(`Deactivating login for user '${username}'...`);
        let res:any = await this.server.deleteLoginUser(tech);
        tech.setStatus('inactive', loggedInUsername);
        res = await this.server.saveEmployeeRecord(tech);
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        this.notify.addSuccess("SUCCESS", `Deactivated user '${username}'`, 3000);
      } else {
        spinnerID = await this.alert.showSpinner(`Activating login for user '${username}'...`);
        let res:any = await this.server.createLoginUser(tech);
        tech.setStatus('active', loggedInUsername);
        res = await this.server.saveEmployeeRecord(tech);
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        this.notify.addSuccess("SUCCESS", `Activated user '${username}'`, 3000);
      }
    } catch(err) {
      Log.l(`toggleActive(): Error toggline active mode of user '${username}'`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error toggling employee '${username}': '${err.message}'`, 4000);
      // throw new Error(err);
    }
  }

  public clearSorting(column:number) {
    let sorts:number[] = [];
    let cols:number = 3;
    for(let i = 0; i < cols; i++) {
      if(i !== column) {
        sorts[i] = -1;
      } else {
        sorts[i] = this.sorts[i];
      }
    }
    this.sorts = sorts;
    this.siteSorts = sorts;
  }

  public toggleSortColumn(column:number) {
    this.clearSorting(column);
    let sorts:number[] = this.sorts;
    if(sorts[column] === -1 || sorts[column] === 2) {
      sorts[column] = 1;
    } else if(sorts[column] === 1) {
      sorts[column] = 2;
    } else if(sorts[column] === 2) {
      sorts[column] = 1;
    }
    this.sorts = sorts;
    this.siteSorts = sorts;
    this.sortEmployeeList(column);
    Log.l(`toggleSortColumn(): Sorting column ${column}, sorts is now:\n`, this.sorts);
    return this.sorts;
  }

  public sortEmployeeList(column:number) {
    let asc = 1;
    let sorts = this.sorts;
    let dir = sorts[column];
    if(dir === -1 || dir === 1) {
      /* Reverse */
      // this.employeeList.reverse();
      asc = -1;
    } else if(dir === 2) {
      /* Leave sorted ascending */
      asc = 1;
    }
    if(column === 0) {
      this.employeeList.sort((a:InSchedule, b:InSchedule) => {
        return a.scheduled > b.scheduled ? asc : a.scheduled < b.scheduled ? -asc : 0;
      });
    } else if(column === 1) {
      this.employeeList.sort((a:InSchedule, b:InSchedule) => {
        let aA = a.tech.active;
        let aB = b.tech.active;
        return aA > aB ? asc : aA < aB ? -asc : 0;
      });
    } else if(column === 2) {
      this.employeeList.sort((a:InSchedule, b:InSchedule) => {
        let nA = a.tech.getFullName();
        let nB = b.tech.getFullName();
        return nA > nB ? asc : nA < nB ? -asc : 0;
      });
    }
  }

  public addTech(event?:any) {
    Log.l("addTech(): called...");
    let tech = new Employee();
    this.mode = "add";
    this.editEmployees = [tech];
    this.employee = tech;
    this.employeeViewVisible = true;
    // let modal = this.modalCtrl.create('Add Employee', { mode: 'Add', from: 'scheduling'}, { cssClass: 'edit-employee-modal' });
    // modal.onDidDismiss(data => {
    //   Log.l("editTech(): Edit Employee modal was dismissed.");
    //   if (data) {
    //     Log.l("editTech(): Edit Employee modal returned data:\n", data);
    //     let tech = data.employee;
    //     this.techs.push(tech);
    //     this.techs = this.techs.sort(_techSort);
    //   }
    // });
    // modal.present();
  }

  public editTech(tech:Employee) {
    Log.l("editTech(): Editing tech:\n", tech);
    this.mode = "edit";
    this.employee = tech;
    this.editEmployees = [tech];
    this.employeeViewVisible = true;
    // let modal = this.modalCtrl.create('Add Employee', {mode: 'Edit', employee: tech, from:'scheduling'}, {cssClass: 'edit-employee-modal'});
    // modal.onDidDismiss(data => {
    //   Log.l("editTech(): Edit Employee modal was dismissed.");
    //   if(data) {
    //     Log.l("editTech(): Edit Employee modal returned data:\n", data);
    //     let oldtech = data.employee;
    //     if(data.deleted) {
    //       let i = this.techs.indexOf(oldtech);
    //       if(i > -1) {
    //         Log.l("Tech was deleted, saving as window.tmptech just in case.");
    //         let tmp1 = this.techs.splice(i, 1)[0];
    //         window['tmptech'] = tmp1;
    //       } else {
    //         // let dat = this.shiftsData;
    //         let dat = this.schedule.getSchedule();
    //         let shft = null;
    //         outerloop: for(let sitename of Object.keys(dat)) {
    //           let site = dat[sitename];
    //           for(let shiftname of Object.keys(site)) {
    //             let shift = site[shiftname];
    //             for(let tech of shift) {
    //               if(oldtech === tech) {
    //                 shft = shift;
    //                 break outerloop;
    //               }
    //             }
    //           }
    //         }
    //         let j = shft.indexOf(tech);
    //         if(j > -1) {
    //           Log.l("Tech '%s' found and deleted, saving to window.tmptech just in case.", tech.toString());
    //           let tmp1 = shft.splice(j, 1)[0];
    //           window['tmptech'] = tmp1;
    //         } else {
    //           Log.e("Error: deleted tech not found in unassigned or in site shift slots!");
    //         }
    //       }
    //     }
    //   }
    // });
    // modal.present();
  }

  public employeeUpdated(event?:any) {
    Log.l("employeeUpdated(): Event is:\n", event);
    this.employeeViewVisible = false;
    window['p'] = this;
    let tech = event.employee;
    let type = event.type;
    if(type === 'delete') {
      let oldtech = tech;
      let i = this.techs.indexOf(oldtech);
      if (i > -1) {
        Log.l("Tech was deleted, saving as window.tmptech just in case.");
        let tmp1 = this.techs.splice(i, 1)[0];
        window['tmptech'] = tmp1;
        this.notify.addSuccess("SUCCESS", "Tech deleted successfully.", 3000);
      } else {
        // let dat = this.shiftsData;
        let dat = this.schedule.getSchedule();
        let shft = null;
        outerloop: for (let sitename of Object.keys(dat)) {
          let site = dat[sitename];
          for (let shiftname of Object.keys(site)) {
            let shift = site[shiftname];
            for (let tech of shift) {
              if (oldtech === tech) {
                shft = shift;
                break outerloop;
              }
            }
          }
        }
        let j = shft.indexOf(tech);
        if (j > -1) {
          Log.l("Tech '%s' found and deleted, saving to window.tmptech just in case.", tech.toString());
          let tmp1 = shft.splice(j, 1)[0];
          window['tmptech'] = tmp1;
          this.notify.addSuccess("SUCCESS", "Tech deleted successfully.", 3000);
        } else {
          Log.e("Error: deleted tech not found in unassigned or in site shift slots!");
          this.notify.addWarn("WARNING", "Deleted tech was not found in unassigned list or in any slot of this schedule!", 6000);
        }
      }
    } else if(type === 'add') {
      this.techs.push(tech);
      this.techs = this.techs.sort(_techSort);
      this.notify.addSuccess("SUCCESS", "New tech added to unassigned list.", 3000);
    }
  }

  public employeeCanceled(event?:any) {
    Log.l("employeeCanceled(): Event is:\n", event);
    this.employeeViewVisible = false;
    window['p'] = this;
    // this.notify.addInfo("CANCELED", "User edit canceled.", 3000);
  }

  public employeeDeleted(employee:Employee, event?:any) {
    let schedule:Schedule = this.schedule;
    let techs:Employee[] = this.allTechs;
    let username:string = employee instanceof Employee ? employee.getUsername() : "";
    let i = techs.findIndex((a:Employee) => {
      if(a instanceof Employee) {
        return a.getUsername() === username;
      } else {
        return false;
      }
    });
    if(i > -1) {
      techs.splice(i, 1);
    }
    // let siteRotation:Employee[] = schedule.getContainerForTech(employee);
    // i = siteRotation.findIndex((a:Employee) => {
    //   if(a instanceof Employee) {
    //     return a.getUsername() === username;
    //   } else {
    //     return false;
    //   }
    // });
    // if(i > -1) {
    //   siteRotation.splice(i, 1);
    // }
    schedule.removeTech(employee);
    schedule.removeUnassignedTech(employee);
  }


  public getShiftSymbol(tech:Employee) {
    let shift = tech.shift;
    if(shift === 'AM') {
      return "☀";
    } else {
      return "☽";
    }
  }

  public modelChanged(event:any) {
    Log.l("modelChanged(): Event was: ", event);
  }

  public techDragged(event:any) {
    Log.l("techDragged(): Tech successfully dragged. Updating count. Event: ", event);
    // this.countTechTotals();
  }

  public techDropped(event:any) {
    Log.l("techDropped(): Tech successfully dropped. Updating count. Event: ", event);
    this.unsavedChanges = true;
    this.unsavedReason  = "tech moved";
    let tech = event;
    let js = null, rotation = "";
    // this.countTechTotals();
    this.updated = true;
    // let unassignedSlot:any[] = this.unassignedTechs;
    // let unassignedSlot:any[] = this.schedule.unassigned;
    let unassignedSlot:any[] = this.schedule.getUnassigned();
    // let legraveSlot:any[] = this.legrave;
    let devMode:boolean = false;
    if(this.data.status.role==='dev') {
      devMode = true;
    }
    if(devMode) {
      this.notify.addWarn("/DEV/TECH DROPPED", `Item Drop event fired for tech '${tech.getUsername()}'`, 3000);
    }
    this.getScheduleStats();
    let user:Employee = this.data.getUser();
    // let name:string = user.getUsername();
    tech.employeeMoved = true;
    // if(this.prefs.saveMovedTechs() || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
    if(this.prefs.saveMovedTechs()) {
      let i:number = unassignedSlot.indexOf(tech);
      // let j = legraveSlot.indexOf(tech);
      if(i > -1) {
        Log.l(`techDropped(): Tech '${tech.toString()}' found in unassigned pool.`);
        this.schedule.addUnassignedTech(tech);
        this.updateTechSettings(tech, this.unassignedSite, "UNASSIGNED", "AM");
      // } else if(j > -1) {
      //   let legravSite:Jobsite = this.sites.find((a:Jobsite) => {
      //     return a.locID.code === 'LEGRAV';
      //   });
      //   Log.l("techDropped(): Tech %s dropped into ex-employee pool.", tech.toString());
      //   this.schedule.removeTech(tech);
      //   this.schedule.removeUnassignedTech(tech);
      //   this.updateTechSettings(tech, legravSite, "UNASSIGNED", "AM");
      } else {
        this.schedule.removeUnassignedTech(tech);
        this.schedule.addTech(tech);
        let schedule = this.schedule.getSchedule();
        outerloop: for(let site of this.sites) {
          let siteEntry = schedule[site.schedule_name];
          for(let rotn in siteEntry) {
            // let slot = this.shiftsData[site.schedule_name][shift.name];
            let slot = schedule[site.schedule_name][rotn];
            let j = slot.indexOf(tech);
            if(j > -1) {
              Log.l("techDropped(): Tech %s found in %s.%s", tech.toString(), site.getSiteName(), rotation);
              js = site;
              rotation = rotn;
              break outerloop;
            }
          }
        }
        Log.l("techDropped(): Updating tech client, location, locID, loc2nd, shift, shiftLength, and shiftStartTime...");
        let shift = tech.shift;
        this.updateTechSettings(tech, js, rotation, shift);
      }
    }
  }

  public techDroppedInto(event:any) {
    Log.l("techDroppedInto(): Tech dropped into container successfully, event is: ", event)
    this.unsavedChanges = true;
    this.unsavedReason  = "tech moved";
    let slot = event[0];
    let tech = event[1];
    this.updated = true;
    // let unassignedSlot:any[] = this.unassignedTechs;
    let unassignedSlot:any[] = this.schedule.unassigned;
    // this.countTechTotals();
    this.getScheduleStats();
    let user = this.data.getUser();
    let name = user.getUsername();
    tech.employeeMoved = true;
    // if(this.prefs.saveMovedTechs() || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
    if(this.prefs.saveMovedTechs()) {
      if(slot === unassignedSlot) {
        Log.l("techDroppedInto(): Tech %s dropped into unassigned pool.", tech.toString());
        this.schedule.addUnassignedTech(tech);
        this.updateTechSettings(tech, this.unassignedSite, "UNASSIGNED", "AM");
      } else {
        // Log.l("techDroppedInto(): Drop slot was not unassigned, looking for slot...");
        let js = null, rotation = tech.rotation || "AM";
        let schedule = this.schedule.getSchedule();
        this.schedule.removeUnassignedTech(tech);
        this.schedule.addTech(tech);
        outerloop:
        for(let site of this.sites) {
          let siteEntry = schedule[site.schedule_name];
          for(let rotn in siteEntry) {
            let sSlot = schedule[site.schedule_name][rotn];
            // Log.l("techDroppedInto(): Now looking at site.shift: %s.%s", site.schedule_name, shift.name);
            if(slot === sSlot) {
              Log.l("techDroppedInto(): Tech was dropped into jobsite '%s' for '%s'.", site.schedule_name, rotation, tech);
              js = site;
              rotation = rotn;
              break outerloop;
            }
          }
        }
        Log.l("techDroppedInto(): Updating tech client, location, locID, loc2nd, shift, shiftLength, and shiftStartTime...");
        let shift = tech.shift;
        this.updateTechSettings(tech, js, rotation, shift);
      }
    }
  }

  public techDroppedIntoUnassigned(event?:any) {
    Log.l(`techDroppedIntoUnassigned(): Event is:\n`, event);
    let slot = event[0];
    let tech = event[1];
    let user = this.data.getUser();
    let name = user.getUsername();
    this.unsavedChanges = true;
    this.unsavedReason  = "tech moved";
    this.getScheduleStats();
    // if(this.prefs.saveMovedTechs() || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
    if(this.prefs.saveMovedTechs()) {
      Log.l("techDroppedIntoUnassigned(): Tech %s dropped into unassigned pool.", tech.toString());
      this.schedule.addUnassignedTech(tech);
      this.updateTechSettings(tech, this.unassignedSite, "UNASSIGNED", "AM");
    }
  }

  public techDroppedIntoLegrave(event?:any) {
    Log.l(`techDroppedIntoLegrave(): Event is:\n`, event);
    let slot = event[0];
    let tech = event[1];
    Log.l(`techDroppedIntoLegrave(): Tech is:\n`, tech);
    this.unsavedChanges = true;
    this.unsavedReason  = "tech moved";
    this.getScheduleStats();
    let legravSite:Jobsite = this.sites.find((a:Jobsite) => {
      return a.locID.code === 'LEGRAV';
    });
    let user = this.data.getUser();
    let name = user.getUsername();
    this.schedule.removeTech(tech);
    this.schedule.removeUnassignedTech(tech);
    // if(this.prefs.saveMovedTechs() || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
    if(this.prefs.saveMovedTechs() || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
      Log.l(`techDroppedIntoLegrave(): Tech ${tech.toString()} dropped into ex-employee pool.`);
      this.updateTechSettings(tech, legravSite, "UNASSIGNED", "AM");
    }
  }

  public async updateTechSettings(tech:Employee, site:Jobsite, rotation:string, shiftType:string) {
    try {
      let unassigned:Jobsite = this.sites.find((a:Jobsite) => {
        return a.site_number === 1;
      });
      let jobsite:Jobsite = site ? site : unassigned;
      Log.l(`updateTechSettings(): Now updating tech '${tech.getUsername()}' in rotation '${rotation}', shift type '${shiftType}', jobsite:`, jobsite);
      let shift = shiftType;
      tech.client      = jobsite.client.fullName.toUpperCase()       ;
      tech.location    = jobsite.location.fullName.toUpperCase()     ;
      tech.locID       = jobsite.locID.name.toUpperCase()            ;
      tech.rotation    = rotation                                    ;
      tech.shift       = shiftType                                   ;
      let hours        = jobsite.hoursList[rotation][shiftType][0]   ;
      tech.shiftLength = hours                                       ;
      let workSite:string = jobsite ? jobsite.getSiteSelectName() : unassigned.getSiteSelectName();
      let siteNumber:number = jobsite ? jobsite.site_number : -1;
      tech.workSite = workSite;
      tech.site_number = siteNumber;
      // let loc2         = site.loc2nd && site.loc2nd.name ? site.loc2nd.name.toUpperCase(): "NA" ;
      // tech.loc2nd      = loc2                                                            ;
      // let rotation     = type                                                            ;

      // doc = Object.assign({}, tech);
      let doc:any = tech.serialize();

      if(!doc._id) {
        doc._id = `org.couchdb.user:${tech.avatarName}`;
      }
      let res:any = await this.server.saveEmployeeRecord(tech);
      Log.l("updateTechSettings(): Successfully saved employee, result is:\n", res);
      return res;
    } catch(err) {
      Log.l("updateTechSettings(): Error saving tech settings for tech:\n", tech);
      Log.e(err);
      this.notify.addError("ERROR", "Error saving technician's new location. Please try again.", 10000);
    }
  }

  public toggleShift(tech:Employee, evt?:Event) {
    if(evt) {
      if(evt.preventDefault) {
        evt.preventDefault();
      }
      if(evt.stopPropagation) {
        evt.stopPropagation();
      }
    }
    Log.l(`toggleShift(): Clicked for tech:\n`, tech);
    if(tech instanceof Employee) {
      this.unsavedChanges = true;
      this.unsavedReason  = "tech shift change";
      if(tech.shift.toUpperCase() === "AM") {
        tech.shift = "PM";
      } else {
        tech.shift = "AM";
      }
    }
  }
z
  public editSite(site:Jobsite) {
    // this.alert.showAlert("SORRY", "Clicking here was going to allow you to edit the job site, but this feature is not implemented yet. Actually, it's only being implemented while Mike isn't watching. He said it was a stupid idea and I was stupid for thinking of it. And trust me, you don't want to mess with that guy. I saw him try to chop up a cat with a gate. <span class='alert-icons'>😨😿</span>");
    let modal = this.modalCtrl.create('Work Site', { mode: 'Edit', modal:true, source: 'scheduling', jobsite: site }, {cssClass: 'site-edit-modal'});
    modal.onDidDismiss(data => {
      Log.l("editSite(): Modal dismissed.");
      if(data) {
        Log.l("editSite(): Data:\n", data);
      }
    });
    modal.present();
  }

  public createCSV() {
    Log.l("createCSV(): Now starting process of exporting tech schedule....");
    // let dat = this.shiftsData;
    let dat = this.schedule.getSchedule();
    let out = [];
    for(let site of this.sites) {
      let siteData = dat[site.schedule_name];
      for(let rotation in site.getShiftRotations()) {
        let shiftData = siteData[rotation];
      }
    }
  }

  public createPDF() {
    this.notify.addWarn("DISABLED", "PDF output is deprecated in favor of HTML export.", 3000);
    // let dd = this.generateDesignDocument();
    // Log.l("createPDF(): Now attempting to create PDF from design document: ", dd);
    // this.pdf.createPDF(dd);
    // Log.l("createPDF(): Now attempting to show PDF...");
    // this.pdf.openPDF();
  }

  // public generateDesignDocument() {
  //   let dd = {content: [], styles: {}, defaultStyle: {}};
  //   let defaultMargin = [0,0,0,0];
  //   let headerMargin = [120,0,0,0];
  //   let defaultHeight = 10;
  //   let smallHeight = 10;
  //   let headerFontSize = 14;
  //   let dateFontSize = 12;
  //   let sitesDataFontSize = 10;
  //   let colWidths = ['*', 25, '*', 25, '*', 25, '*', 25];
  //   let defaultStyle = {alignment: 'left', margin: defaultMargin, color: 'black', fontSize: 14, bold:true};
  //   let styles = {
  //     LABEL:       { bold: true, alignment: 'right', margin: [0,0,5,0], color: 'black', fontSize: sitesDataFontSize },
  //     DATA :       { bold: true, alignment: 'left', margin:  [0,0,0,0], color: 'black', fontSize: sitesDataFontSize },
  //     DATEHDR:     { bold: true, alignment: 'left', margin:  [0,10,0,10], color: 'black', fontSize: headerFontSize },
  //     TECHHDR:     { bold: true, alignment: 'right', margin: [0,0,5,0], color: 'black', fontSize: sitesDataFontSize },
  //     TECHDATA:    { bold: true, alignment: 'right', margin: [0,0,0,0], color: 'black', fontSize: sitesDataFontSize },
  //     DATE:        { bold: true, alignment: 'center', fontSize: dateFontSize, color: colors.fg.date, fillColor: colors.bg.date },
  //     DATEDIVIDER: { bold: true, alignment: 'center', fontSize: dateFontSize, color: 'black' },
  //     DIVIDER:     { bold: true, margin: [0, 5, 0, 5]},
  //   };
  //   for(let client of this.clients) {
  //     styles[client.name]           = { bold: true, color: colors.fg[client.name], fontSize: sitesDataFontSize };
  //     styles[client.name + 'CELL']  = { bold: true, color: 'black', fillColor: colors.bg[client.name], margin: headerMargin, alignment: 'left', fontSize: headerFontSize};
  //     styles[client.name + 'HDR']   = { bold: true, color: colors.fg[client.name], margin: [0,0,10,0], alignment: 'right', fontSize: sitesDataFontSize};
  //     styles[client.name + 'DATA']  = { bold: true, color: colors.fg[client.name], margin: [0,0,0,0], alignment: 'right', fontSize: sitesDataFontSize};
  //   }
  //   let getRowHeight = function(i) {
  //     // let style = node.table.body[i][0].style;
  //     Log.l("getRowHeight(): params are: ", i);
  //     return 14;
  //     // if(style.indexOf('HDR') > -1) {
  //     //   return 14;
  //     // } else {
  //     //   return 14;
  //     // }
  //   };
  //   // dd['styles'] = styles;
  //   dd.styles = styles;
  //   dd.defaultStyle = defaultStyle;
  //   let table:any[] = [
  //     [{style: 'DATEHDR'     , colSpan: 8        , text: 'this.start.format("DD MMM YYYY")' + ' through ' + this.end.format("DD MMM YYYY") }, {}, {}, {}, {}, {}, {}, {}] ,
  //   ];

  //   // Reminder of what this.stats looks like:
  //   // let stats = { CLIENTS: {${client.name}: {total:0, working:0, off:0}}, SESA: { 'total': 0, 'working': 0, 'off': 0 }, VACATION: 0, SITES: {${site.schedule_name}: {total:0,working:0,off:0}}, TECHS: { 'total': 0, 'working': 0, 'off': 0 } };
  //   let grid = [];
  //   let row = [{}];
  //   for(let client of this.clients) {
  //     if(client.name==='SE') {
  //       continue;
  //     }
  //     let name = client.fullName;
  //     let stat = this.stats.CLIENTS[client.name];
  //     let headCell   = [{style: client.name + 'CELL', colSpan: 2, text: name.toUpperCase() }, {}];
  //     let totalRow   = [{style: 'LABEL', bold: true, text: 'Total'   }, {style: 'DATA', text: stat.total  }];
  //     let workingRow = [{style: 'LABEL', bold: true, text: 'Working' }, {style: 'DATA', text: stat.working}];
  //     let daysOffRow = [{style: 'LABEL', bold: true, text: 'Days Off'}, {style: 'DATA', text: stat.off    }];
  //     table = [...table, headCell, totalRow, workingRow, daysOffRow];
  //   }
  //   table.push([{text: '', colSpan: 2, style: 'DIVIDER'}, {}]);
  //   for(let site of this.sites) {
  //     if(site.client.name==='SE') {
  //       continue;
  //     }
  //     let name = site.schedule_name;
  //     let cli  = site.client.name;
  //     let stat = this.stats.SITES[name];
  //     let totalRow = [{style: cli + 'HDR', text: name}, {style: cli + 'DATA', text: stat.total}];
  //     table = [...table, totalRow];
  //   }
  //   let techTotalRow      = [ { style: 'TECHHDR', bold: true, text: 'Total Techs'      } , { style: 'TECHDATA', text: this.stats.TECHS.total   } ] ;
  //   let techWorkingRow    = [ { style: 'TECHHDR', bold: true, text: 'Techs Working'    } , { style: 'TECHDATA', text: this.stats.TECHS.working } ] ;
  //   let techDaysOffRow    = [ { style: 'TECHHDR', bold: true, text: 'Techs Days Off'   } , { style: 'TECHDATA', text: this.stats.TECHS.off     } ] ;
  //   let sesaTotalRow      = [ { style: 'SEHDR'  , bold: true, text: 'SESA HQ'          } , { style: 'SEDATA'  , text: this.stats.SESA.total    } ] ;
  //   let techUnassignedRow = [ { style: 'TECHHDR', bold: true, text: 'Techs Unassigned' } , { style: 'TECHDATA', text: this.techs.length        } ] ;
  //   table = [...table, techTotalRow, techWorkingRow, techDaysOffRow, sesaTotalRow, techUnassignedRow];
  //   // let table1 = {style: 'scheduleTable', table: {widths: colWidths, height: function(i) { return 14;}, body: table}};
  //   let table1 = {style: 'scheduleTable', table: {widths: colWidths, body: table}, layout: 'noBorders'};
  //   dd.content.push(table1);
  //   window['onsitedesigndocument'] = dd;
  //   Log.l("generateDesignDocument(): Returning:\n", dd);
  //   return dd;
  // }

  public mikePayrollData() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.data.currentlyOpeningPage = true;
    this.navCtrl.push('Schedule Summary', {data: data, csv: csv});
  }

  public createExportData() {
    // let dat = this.shiftsData;
    let dat = this.schedule.getSchedule();
    let overall = [];
    let i = 0, j = 0;
    let header = [
      "ScheduleID",
      "RotSeq",
      "TechRotation",
      "TechShift",
      "JobSiteOnSchedule",
      "Client",
      "TechLocation",
      "TechLocID",
      "TechOnSchedule",
    ];

    let start_date = moment(this.start).startOf('day');
    for(let i = 0; i < 7; i++) {
      let schedule_date = moment(start_date).add(i, 'day');
      header.push(schedule_date.format("MMM DD"));
    }
    for(let tech of this.allTechs) {
      let shift = null, js = null;
      // let row = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
      let row = [];
      let shiftTime = tech.shift;
      let unassigned = true;
      loop01: for (let site of this.sites) {
        let siteData = dat[site.schedule_name];
        let idx = 0;
        // if(idx % 5 === 0) { Log.l("Comparing tech '%s' and slot '%s'", tech.getFullName(), site.schedule_name);}
        for (let siteShift of this.shiftTypes) {
          let slotData = siteData[siteShift.name];
          for (let scheduledTech of slotData) {
            // if(idx++ % 10 === 0) { Log.l("Comparing tech '%s' and slot '%s.%s'", tech.getFullName(), site.schedule_name, siteShift.name);}
            // if(scheduledTech.lastName[0].toUpperCase() === tech.lastName[0].toUpperCase()) {
              // Log.l("Comparing tech '%s' and tech '%s' in slot '%s.%s'", tech.getFullName(), scheduledTech.getFullName(), site.schedule_name, siteShift.name);
            if (tech.avatarName === scheduledTech.avatarName) {
              Log.l("Found tech '%s' in slot '%s.%s'", tech.getFullName(), site.schedule_name, siteShift.name);
              js = site;
              shift = siteShift;
              unassigned = false;
              break loop01;
            } else {
              // Log.l("No match.")
            }
            // }
          }
        }
      }
      // loop02:
      // for(let site of this.sites) {
      //   if (tech.client.toUpperCase() === site.client.name.toUpperCase() || tech.client === site.client.fullName.toUpperCase()) {
      //     Log.l("Found jobsite match with tech '%s' at jobsite '%s'", tech.getFullName(), site.getShortID());
      //     js = site;
      //     unassigned = false;
      //     break loop02;
      //   }
      // }
      if(!unassigned) {
        Log.l("Tech not unassigned!");
        row.push(js.getShortID());
        row.push(this.getRotSeq(shift.name));
        row.push(shift.name);
        row.push(this.getTechShift(shiftTime));
        row.push(js.schedule_name);
        row.push(js.client.name);
        row.push(js.location.name);
        row.push(js.locID.name);
        row.push(tech.getFullName());
        let list = js.getHoursList(shift.name, shiftTime);
        for(let i = 0; i < 7; i++) {
          row.push(list[i]);
        }
      } else {
        Log.l("Tech unassigned! ☹");
        row.push("");
        row.push('X');
        row.push("");
        row.push("");
        row.push("");
        row.push("");
        row.push("");
        row.push("");
        row.push(tech.getFullName());
        // let list = js.getHoursList(shift.name, shiftTime);
        for(let i = 0; i < 7; i++) {
          row.push("");
        }
      }
      overall.push(row);
    }
    return {header: header, rows: overall};
  }

  public getRotSeq(shift:string) {
    if(shift.toUpperCase().trim() === 'FIRST WEEK') {
      return 'A';
    } else if(shift.toUpperCase().trim() === 'CONTN WEEK') {
      return 'B';
    } else if(shift.toUpperCase().trim() === 'FINAL WEEK') {
      return 'C';
    } else if(shift.toUpperCase().trim() === 'DAYS OFF') {
      return 'D';
    } else if(shift.toUpperCase().trim() === 'VACATION') {
      return 'V';
    } else {
      return 'X';
    }
  }

  public getTechShift(shiftTime:string) {
    if(shiftTime.toUpperCase().trim() === 'AM') {
      return '☼';
    } else {
      return '☽';
    }
  }

  public cancel() {
    Log.l("Modal canceled.");
  }

  public toCSV(header:any[], table:any[][]) {
    let html = "";
    let i = 0, j = 0;
    for(let hdr of header) {
      if(j++ === 0) {
        html += hdr;
      } else {
        html += "\t" + hdr;
      }
    }
    html += "\n";
    for(let row of table) {
      j = 0;
      for(let cell of row) {
        if(j++ === 0) {
          html += cell;
        } else {
          html += "\t" + cell;
        }
      }
      html += "\n";
    }
    return html;
  }

  public setButtonLocation(value:number) {
    this.buttonLocation = value;
  }

  public printSchedule(evt?:Event) {
    let schedule:Schedule = this.schedule;
    let stats:SESAStats = this.stats;
    let sites:Jobsite[] = this.scheduleSites;
    let event = evt ? evt : undefined;
    // !site.newsite && ((stats.SITES[site.schedule_name].total < 1 && !prefs.CONSOLE.scheduling.showAllSites)
    // ||
    // (site.is_office && !prefs.CONSOLE.scheduling.showOffice)
    // ||
    // (site.test_site === true && !prefs.CONSOLE.scheduling.showTestSites)
    // ||
    // (!prefs.CONSOLE.scheduling.showNonSESA && site.client.name==='SP'))
    if(!this.prefs.CONSOLE.scheduling.showAllSites) {
      sites = sites.filter((a:Jobsite) => {
        if(a instanceof Jobsite) {
          return this.stats && this.stats.SITES && this.stats.SITES[a.schedule_name] && this.stats.SITES[a.schedule_name].total ? true : false;
        } else {
          return false;
        }
      });
    }
    if(!this.prefs.CONSOLE.scheduling.showOffice) {
      sites = sites.filter((a:Jobsite) => {
        if(a instanceof Jobsite) {
          return a && a.locID && a.locID.name && a.is_office ? false : true;
        } else {
          return false;
        }
      });
    }
    if(!this.prefs.CONSOLE.scheduling.showTestSites) {
      sites = sites.filter((a:Jobsite) => {
        if(a instanceof Jobsite) {
          return a && a.test_site ? false : true;
        } else {
          return false;
        }
      });
    }
    if(!this.prefs.CONSOLE.scheduling.showNonSESA) {
      sites = sites.filter((a:Jobsite) => {
        if(a instanceof Jobsite) {
          return a && a.client && a.client.name && a.client.name === 'SP' ? false : true;
        } else {
          return false;
        }
      });
    }
    // if(event && event.shiftKey) {
    //   Log.l("printSchedule(): called with event:\n", event);
    //   this.navCtrl.push("Schedule Print Beta", {schedule:schedule, stats:stats});
    // } else {
    //   Log.l("printSchedule(): no event parameter used.");
    //   this.navCtrl.push("Schedule Print", {schedule:schedule});
    // }
    this.data.currentlyOpeningPage = true;
    this.navCtrl.push("Schedule Print Beta", {schedule:schedule, stats:stats, sites:sites});
  }

  public showOptions() {
    // let params = { cssClass: 'popover-options-show', showBackdrop: true, enableBackdropDismiss: true };
    // this.alert.showPopoverWithData('Show Options', { }, params).then(res => {
    //   Log.l("showOptions(): User returned options:\n", res);
    // }).catch(err => {
    //   Log.l("showoptions(): Error showing options popover!");
    //   Log.e(err);
    // });
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    window['p'] = this;
    Log.l("optionsClosed(): Event is:\n", event);
    this.getScheduleStats();
  }

  public async optionsSaved(event?:any) {
    try {
      this.optionsVisible = false;
      window['p'] = this;
      Log.l("optionsSaved(): Event is:\n", event);
      let prefs = this.prefs.getPrefs();
      let res:any = await this.data.savePreferences(prefs);
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      this.getScheduleStats();
      return res;
    } catch(err) {
      // Log.l(`optionsSaved(): Error updating options and updating display!`);
      // Log.e(err);
      // throw new Error(err);
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    }
  }

  public cancelAndExitModal(event?:any) {
    Log.l(`cancelAndExitModal(): Scheduling page closing.`);
    this.viewCtrl.dismiss();
  }

  public saveAndExitModal(event?:any) {
    Log.l(`saveAndExitModal(): Scheduling page closing.`);
    this.viewCtrl.dismiss();
  }

  public videoEnded(event?:any) {
    Log.l("videoEnded(): Event is:\n", event);
    this.videoVisible = false;
    window['p'] = this;
  }

  public showScheduleChoose(event?:any) {
    this.scheduleOpenVisible = true;
  }

  public scheduleChosen(event:any) {
    Log.l(`scheduleChosen(): Event is:\n`, event);
    this.scheduleOpenVisible = false;
    window['p'] = this;
    let schedule:Schedule;
    if(event instanceof Schedule) {
      schedule = event;
    } else if(event && event.value && event.value instanceof Schedule) {
      schedule = event.value;
    } else {
      Log.w(`scheduleChosen(): Supplied value was neither an event nor a schedule:`, event);
      schedule = new Schedule();
    }
    // let schedule:Schedule = event && event.value ? event.value : event ? event : new Schedule();
    this.schedule = schedule;
    // this.shiftsData = this.schedule.schedule;
    let techs:Employee[] = this.allTechs.filter(_techFilter).sort(_techSort);
    this.techs = techs;
    this.schedule.setTechs(techs);
    this.schedule.loadSites(this.sites);
    let unassignedTechs:Employee[] = schedule.getUnassigned();
    let workingTechs:Employee[] = schedule.getWorkingTechs();
    let scheduledTechs:Employee[] = [...unassignedTechs, ...workingTechs];
    let legrave:Employee[] = techs.filter((a:Employee) => {
      let index = scheduledTechs.indexOf(a);
      if(index > -1) {
        return false;
      } else {
        return true;
      }
    });

    // let siteNames:string[] = Object.keys(this.schedule.schedule);
    // let scheduleSites:Jobsite[] = this.sites.filter((a:Jobsite) => {
    //   return siteNames.indexOf(a.schedule_name) > -1;
    // });
    // this.scheduleSites = scheduleSites;

    this.generateScheduleSiteList();
    this.generateUnscheduledSites();

    // this.techs = schedule.getUnassigned();
    // this.schedule.createSchedulingObject(this.sites, this.techs);
    // this.removeUsedTechs();
    this.unassignedTechs = unassignedTechs;
    this.legrave = legrave;
    this.getScheduleStats();
    this.start = moment(schedule.start);
    this.end   = moment(schedule.end);
    this.dateStart = moment(this.start).toDate();
    this.dateEnd    = moment(this.end).toDate();
    this.strDateEnd = moment(this.end).format("DD MMM YYYY");
    this.oldStartDate = moment(this.start);
    let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
    this.title = `Scheduling (${name})`;
  }

  public generateScheduleSiteList() {
    let schedule:Schedule = this.schedule;
    let doc:any = schedule.getSchedule();
    let siteNames:string[] = Object.keys(doc);
    let sites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      return a.site_number > 9;
    });
    let scheduleSites:Jobsite[] = sites.filter((a:Jobsite) => {
      return siteNames.indexOf(a.schedule_name) > -1;
    }).sort(_siteSort);
    this.scheduleSites = scheduleSites;
  }

  public sortUnassigned(type:number, evt?:Event) {
    Log.l(`sortUnassigned(): Type is '${type}' and event is:\n`, evt);
    let schedule:Schedule = this.schedule;
    let unassigned:Employee[] = schedule.getUnassigned();
    if(type === 1) {
      /* Sort ascending (A-Z) */
      unassigned.sort((a:Employee, b:Employee) => {
        let nA = a.toString();
        let nB = b.toString();
        return nA > nB ? 1 : nA < nB ? -1 : 0;
      });
      schedule.setUnassigned(unassigned);
      this.sortUnassignedStatus = 2;
    } else if(type === 2) {
      /* Sort descending (Z-A) */
      unassigned.sort((a:Employee, b:Employee) => {
        let nA = a.toString();
        let nB = b.toString();
        return nA > nB ? 1 : nA < nB ? -1 : 0;
      });
      unassigned.reverse();
      schedule.setUnassigned(unassigned);
      this.sortUnassignedStatus = 1;
    }
  }

  public sortLegrave(type:number, evt?:Event) {
    Log.l(`sortLegrave(): Type is '${type}' and event is:\n`, evt);
    let schedule:Schedule = this.schedule;
    let legrave:Employee[] = this.legrave;
    if(type === 1) {
      /* Sort ascending (A-Z) */
      legrave = legrave.sort((a:Employee, b:Employee) => {
        let nA = a.toString();
        let nB = b.toString();
        return nA > nB ? 1 : nA < nB ? -1 : 0;
      });
      this.sortLegraveStatus = 2;
    } else if(type === 2) {
      /* Sort descending (Z-A) */
      legrave = legrave.sort((a:Employee, b:Employee) => {
        let nA = a.toString();
        let nB = b.toString();
        return nA > nB ? 1 : nA < nB ? -1 : 0;
      });
      legrave = legrave.reverse();
      this.sortLegraveStatus = 1;
    }
  }

  public updateScheduleDate(evt?:Event) {
    let schedule:Schedule = this.schedule;
    Log.l(`updateScheduleDate(): Schedule updated to:\n`, schedule);
    if(schedule instanceof Schedule) {
      this.scheduleChosen(schedule);
      this.generateUnscheduledSites();
      this.generateScheduleSiteList();
    }
  }

  public showNewSchedule(evt?:Event) {
    Log.l(`showNewSchedule(): Showing new schedule component.`);
    this.scheduleNewVisible = true;
  }

  public cancelNewSchedule(evt?:Event) {
    Log.l(`cancelNewSchedule(): Event is:\n`, evt);
    this.scheduleNewVisible = false;
    window['p'] = this;
  }

  public createNewSchedule(data:any) {
    Log.l(`createNewSchedule(): Data is:\n`, data);
    this.scheduleNewVisible = false;
    window['p'] = this;
    if(data) {
      let start = moment(data.date).startOf('day');
      let end = moment(start).add(6,'days');
      let startDate = start.toDate();
      let endDate = end.toDate();
      let user = this.data.getUser();
      let name = user.getUsername();
      // let schedule = new Schedule('week', name, start, end);
      // let scheduleDoc = oo.clone(this.shiftsData);
      let schedule:Schedule = new Schedule();
      schedule.setStartDate(start);
      schedule.setEndDate(end);
      schedule.setCreator(name);
      let scheduleDoc = oo.clone(this.schedule.getSchedule());
      let scheduleObject;
      if(data.action === 'increment') {
        scheduleObject = this.incrementSchedule(scheduleDoc);
      } else if(data.action === 'clear') {
        let sites = this.sites;
        scheduleObject = schedule.createEmptySchedule(sites);
        let techs = this.allTechs.slice(0);
        this.techs = techs.filter(_techFilter).sort(_techSort);
        this.prefs.getConsolePrefs().scheduling.showAllSites = true;
      } else {
        scheduleObject = scheduleDoc;
      }
      schedule.setSchedule(scheduleObject);
      // this.shiftsData = scheduleObject;
      // this.schedule.setSchedule(scheduleObject);
      let oldSchedule:Schedule = this.schedule;
      this.schedule = schedule;
      this.removeUsedTechs();
      this.start = moment(start);
      this.end = moment(end);
      this.dateStart = startDate;
      this.dateEnd = endDate;
      this.strDateEnd = end.format("DD MMM YYYY");
      // this.schedule._id = start.format("YYYY-MM-DD");
      let weekStart = moment(this.schedule.getStartDate());
      this.schedule._id = weekStart.format("YYYY-MM-DD");
      this.schedule.techs = this.allTechs.slice(0);
      this.schedule.loadTechs(this.allTechs);
      let newUnassigned:Employee[] = oldSchedule.getUnassignedActive();
      // this.schedule.unassigned = this.techs.slice(0);
      this.schedule.setUnassigned(newUnassigned);
      // this.schedule = schedule;
      let scheduleName = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
      this.title = `Scheduling (${scheduleName})`;
      this.createDropdownMenus();
      this.getScheduleStats();
      this.generateUnscheduledSites();
      this.unsavedChanges = true;
      this.unsavedReason = "new schedule";
    } else {
      Log.l("createNewSchedule(): No data returned, user must not want a new schedule after all.");
    }
  }

  public generateUnscheduledSites():Jobsite[] {
    let scheduledSites:Jobsite[] = this.schedule.sites;
    let unSites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      if(a instanceof Jobsite) {
        return a.site_number > 9 && scheduledSites.indexOf(a) === -1;
      } else {
        return false;
      }
    });
    this.unscheduledSites = unSites;
    return unSites;
  }

  public toggleAddNewSitePanel(evt?:Event) {
    this.generateUnscheduledSites();
    if(this.overlayPanel1 && this.overlayPanel1.toggle) {
      if(this.overlayPanel1.visible) {
        Log.l(`toggleAddNewSitePanel(): toggling panel off.`);
        this.overlayPanel1.toggle(evt);
      } else {
        if(!this.unscheduledSites.length) {
          Log.l(`toggleAddNewSitePanel(): No sites, not turning panel on.`);
          this.notify.addWarning("OOPS", "There are no sites that aren't already on this schedule!", 3000);
        } else {
          Log.l(`toggleAddNewSitePanel(): toggling panel on.`);
          this.overlayPanel1.toggle(evt);
        }
      }
    } else {
      Log.l(`toggleAddNewSitePanel(): overlay panel does not exist!`);
      if(!this.unscheduledSites.length) {
        this.notify.addWarning("OOPS", "There are no sites that aren't already on this schedule!", 3000);
      }
    }
  }

  public filterEmployees(value:string, evt?:Event):InSchedule[] {
    let startList:InSchedule[];
    if(this.showUnassignedOnly) {
      startList = this.getUnassignedList();
    } else {
      startList = this.fullEmployeeList;
    }
    if(value) {
      let searchValue:string = value.toLowerCase();
      let list:InSchedule[] = startList.filter((a:InSchedule) => {
        let tech:Employee = a.tech;
        let name:string = tech.getFullName().toLowerCase();
        if(name.indexOf(searchValue) > -1) {
          return true;
        }
      });
      this.employeeList = list;
      return list;
    } else {
      this.employeeList = startList.slice(0);
    }
  }

  public filterSites(value:string, evt?:Event):InSchedule[] {
    if(value) {
      let searchValue:string = value.toLowerCase();
      let list:InSchedule[] = this.fullSitesList.filter((a:InSchedule) => {
        let site:Jobsite = a.site;
        let name:string = site.getScheduleName().toLowerCase();
        if(name.indexOf(searchValue) > -1) {
          return true;
        }
      });
      this.siteList = list;
      return list;
    } else {
      this.siteList = this.fullSitesList.slice(0);
    }
  }

  public getUnassignedList():InSchedule[] {
    let techsToShow:Employee[] = this.schedule.getUnassigned();
    let techsToShowUsernames:string[] = techsToShow.map((a:Employee) => {
      return a.getUsername();
    });
    let techs:InSchedule[] = this.fullEmployeeList.filter((a:InSchedule) => {
      let tech:Employee = a.tech;
      let username:string = tech.getUsername();
      let index:number = techsToShowUsernames.indexOf(username);
      return index > -1;
    });
    return techs;
  }

  public toggleShowUnassignedOnly(evt?:Event) {
    // let show:boolean = this.showUnassignedOnly;
    // if(show) {
    //   let techsToShow:Employee[] = this.schedule.getUnassigned();
    //   let techsToShowUsernames:string[] = techsToShow.map((a:Employee) => {
    //     return a.getUsername();
    //   });
    //   let techs:InSchedule[] = this.fullEmployeeList.filter((a:InSchedule) => {
    //     let tech:Employee = a.tech;
    //     let username:string = tech.getUsername();
    //     let index:number = techsToShowUsernames.indexOf(username);
    //     return index > -1;
    //   });
    //   let value:string = this.employeeSearch;
    //   this.filterEmployees(value);
    // }
    setTimeout(() => {
      let value:string = this.employeeSearch;
      this.filterEmployees(value);
    }, this.switchDelay);
  }

  public clearEmployeeSearch(evt?:Event) {
    this.employeeSearch = "";
    this.filterEmployees("");
  }
  public clearSiteSearch(evt?:Event) {
    this.sitesSearch = "";
    this.filterSites("");
  }

  public async toggleApproveSchedule(evt?:Event) {
    try {
      let schedule:Schedule = this.schedule;
      let user:Employee = this.data.getUser();
      let name:string = "";
      if(user instanceof Employee) {
        name = user.getUsername();
      }
      let title:string = "APPROVE SCHEDULE";
      let text:string  = "Approve this schedule?";
      if(name.toLowerCase().indexOf('grumpy') == -1) {
        text += "<br/>\n<br/>\n(Normally this would be done by Saul)";
      }
      let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        if(schedule instanceof Schedule) {
          // if(!schedule.approved) {
            schedule.approved = true;
          // }
        }
      }
    } catch(err) {
      Log.l(`toggleApproveSchedule(): Error toggling schedule approval`);
      Log.e(err);
      throw err;
    }
  }

}
