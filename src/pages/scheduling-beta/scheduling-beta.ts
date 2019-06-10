// import { PDFService                                         } from 'providers/pdf-service'         ;
// import { OnSiteConsoleX                                     } from 'app/app.component'             ;
// import { ScheduleChooseComponent                            } from 'components/schedule-choose'    ;
import { sprintf                                            } from 'sprintf-js'                    ;
import { Subscription                                       } from 'rxjs'             ;
import { Component, NgZone, OnInit, OnDestroy,              } from '@angular/core'                 ;
import { ViewChild, ElementRef,                             } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams,               } from 'ionic-angular'                 ;
import { ModalController, PopoverController, ViewController } from 'ionic-angular'                 ;
import { ServerService                                      } from 'providers/server-service'      ;
import { DBService                                          } from 'providers/db-service'          ;
import { AuthService                                        } from 'providers/auth-service'        ;
import { AlertService                                       } from 'providers/alert-service'       ;
import { Preferences                                        } from 'providers/preferences'         ;
import { NotifyService                                      } from 'providers/notify-service'      ;
import { OSData                                             } from 'providers/data-service'        ;
import { Log, Moment, moment, isMoment, oo, _dedupe,        } from 'domain/onsitexdomain'          ;
import { Jobsite, Employee, Schedule,                       } from 'domain/onsitexdomain'          ;
import { OptionsGenericComponent                            } from 'components/options-generic'    ;
import { Dialog                                             } from 'primeng/dialog'               ;
import { Command, KeyCommandService                         } from 'providers/key-command-service' ;
import { VideoPlayComponent                                 } from 'components/video-play'         ;
import { ScheduleOpenComponent                              } from 'components/schedule-open'      ;

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

@IonicPage({ name: 'Scheduling Beta' })
@Component({
  selector: 'page-scheduling-beta',
  templateUrl: 'scheduling-beta.html'
})
export class SchedulingBetaPage implements OnInit,OnDestroy {
  @ViewChild('optionsComponent') optionsComponent:OptionsGenericComponent       ;
  @ViewChild('videoComponent') videoComponent:VideoPlayComponent                ;
  @ViewChild('scheduleOpenTemplate') scheduleOpenTemplate:ScheduleOpenComponent ;

  public optionsType     : string          = 'scheduling'                       ;
  public modal           : boolean         = false                              ;
  public icons           : string[]                                             ;
  public keySubscription : Subscription                                         ;
  public buttonLocation  : number          = 1                                  ;
  public updated         : boolean         = false                              ;
  public items           : Array<{ title: string, note: string, icon: string }> ;
  public title           : string          = "Scheduling Beta"                  ;
  public stats           : any             = null                               ;
  public techs           : Array<Employee> = []                                 ;
  public allTechs        : Array<Employee> = []                                 ;
  public unassignedTechs : Array<Employee> = []                                 ;
  public newTechs        : Array<Employee> = []                                 ;
  public clients         : Array<any>                                           ;
  public sites           : Array<Jobsite>  = []                                 ;
  public shiftTypes      : Array<any>      = []                                 ;
  public shiftHeaders    : Array<string>   = []                                 ;
  public slots           : Array<any>                                           ;
  public tmpSlots        : Array<any>      = []                                 ;
  public slotIndex       : number          = 0                                  ;
  public slotHTMLIndex   : number          = 0                                  ;
  public shiftCount      : number          = 0                                  ;
  public siteCount       : number          = 0                                  ;
  public techCount       : number          = 0                                  ;
  // public shiftsData      : any             = {}                                 ;
  public unassignedSite  : Jobsite                                              ;
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
  public invalidDates    : Array<any>      = []                                 ;
  public moment          : any             = moment                             ;
  public schedules       : Array<Schedule> = []                                 ;
  public schedule        : Schedule                                             ;
  public shiftKeyOn      : boolean         = false                              ;
  public mode            : string          = "Add"                              ;
  public employee        : Employee                                             ;
  public editEmployees   : Employee[]      = []                                 ;
  public videoVisible         : boolean     = false                             ;
  public optionsVisible       : boolean     = false                             ;
  public employeeViewVisible  : boolean     = false                             ;
  public scheduleOpenVisible  : boolean     = false                             ;
  public componentsAreReady   : boolean     = false                             ;
  public dropHighlightArray      : boolean[][] = [];
  public unassignedDropHighlight : boolean     = false;
  public newTechsDropHighlight   : boolean     = false;
  public exitUnassignedTimeoutHandle  : any                ;
  public exitNewTechsTimeoutHandle    : any                ;

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
      this.doc                          = {}                         ;
      window['schedulingbeta']              = this                       ;
      window['onsitedebug']             = window['onsitedebug'] || {};
      window['onsitedebug']['Schedule'] = Schedule                   ;
  }

  public ngOnInit() {
    Log.l("SchedulingBetaPage: ngOnInit() fired.");
    // this.data.appReady().then(res => {
    //   this.runWhenReady();
    // });
    if (this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  public ngOnDestroy() {
    Log.l("SchedulingBetaPage: ngOnDestroy() fired.");
    this.cancelSubscriptions();
  }

  public async runWhenReady() {
    let spinnerID:string;
    try {
      // let user_prefs = this.prefs.get
      if(this.navParams.get('modal') !== undefined) { this.modal = this.navParams.get('modal'); }
      this.initializeSubscriptions();
  
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
  
      this.sites = this.data.getData('sites')
      // .filter((a:Jobsite) => {
      //   return a.site_active;
      // })
      .sort((a:Jobsite, b:Jobsite) => {
        let an = a.sort_number;
        let bn = b.sort_number;
        return an < bn ? -1 : an > bn ? 1 : 0;
      });
  
      let unassignedSite = this.sites.find((a:Jobsite) => {
        return a.client.name === 'XX';
      });
      this.unassignedSite = unassignedSite;
  
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
  
      Log.l("SchedulingBeta: Setting this.schedule to:", this.schedule);
  
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
  
      spinnerID = await this.alert.showSpinner('Retrieving scheduling data...');
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
      let schedule = this.schedule;
      if(schedule && schedule['schedule']) {
        let tempSchedule = Object.assign({}, schedule);
        Log.l("Scheduling: got Schedule!\n", tempSchedule);
        this.doc = schedule;
        // Log.l("Scheduling: about to readScheduleFromDoc(): ", schedule['schedule']);
        // this.readScheduleFromDoc(schedule['schedule']);
        // this.shiftsData =
        schedule.createSchedulingObject(this.sites, this.techs);
        // Log.l("Scheduling: about to removeUsedTechs()");
        // this.removeUsedTechs();
        Log.l("SchedulingBeta: about to getScheduleStats()");
        this.getScheduleStats();
        // this.schedule = schedule;
        let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
        this.title = `Scheduling (${name})`;
        Log.l("SchedulingBeta: schedule is ready.");
        this.scheduleChosen(schedule);
        this.initializeHighlights();
        this.scheduleReady = true;
        await this.alert.hideSpinner(spinnerID);
      } else {
        await this.alert.hideSpinner(spinnerID);
        this.scheduleReady = false;
        this.notify.addError("PROBLEM", "Could not read schedule. Please load a new schedule.", 10000);
        // this.alert.showAlert("PROBLEM", "Could not read schedule.  Please load a new schedule.");
      }
    } catch(err) {
      Log.l(`SchedulingBeta.runWhenReady(): Error loading schedule`);
      Log.e(err);
      // Log.e(err);
      // throw err;
      await this.alert.hideSpinner(spinnerID);
      this.scheduleReady = false;
      this.notify.addError("PROBLEM", "Could not read schedule. Please load a new schedule.", 10000);
    }
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "SchedulingBetaPage.printSchedule"    : this.printSchedule(command.ev); break;
        case "SchedulingBetaPage.showOptions"      : this.showOptions(); break;
        case "SchedulingBetaPage.newSchedule"      : this.newSchedule(); break;
        case "SchedulingBetaPage.persistSchedule"  : this.persistSchedule(); break;
        case "SchedulingBetaPage.openSchedule"     : this.openSchedule(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && this.keySubscription.unsubscribe) {
      this.keySubscription.unsubscribe();
    }
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
    listModal.onDidDismiss(data => {
      Log.l("presentScheduleListModal(): Back from schedule list modal. Data:\n", data);
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
  }

  public initializeHighlights():Array<Array<boolean>> {
    let sdoc:any = this.schedule.getSchedule();
    let hilite:Array<Array<boolean>> = [];
    for(let siteName in sdoc) {
      let siteRotations = sdoc[siteName];
      let hiliteRow:Array<boolean> = [];
      for(let rotationName in siteRotations) {
        let rotation = siteRotations[rotationName];
        hiliteRow.push(false);
      }
      hilite.push(hiliteRow);
    }
    this.dropHighlightArray = hilite;
    this.newTechsDropHighlight = false;
    this.unassignedDropHighlight = false;
    return hilite;
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

  public async persistSchedule(startDate?:any, endDate?:any):Promise<any> {
    let spinnerID:string;
    try {
      Log.l("persistSchedule(): Persisting schedule to CouchDB server...");
      spinnerID = await this.alert.showSpinner('Saving...');
      let doc:any = {}, key = "current";
      if(typeof startDate === 'string') {
        // key = startDate + "_" + endDate;
        key = startDate;
      } else if (isMoment(startDate)) {
        // key = startDate.format("YYYY-MM-DD") + "_" + endDate.format("YYYY-MM-DD");
        key = startDate.format("YYYY-MM-DD");
      }
      // doc['_id'] = this.doc['_id'] || key;
      let user = this.data.getUser();
      let name = user.getUsername();
      if(name !== 'grumpy' && name !== 'Chorpler') {
        doc._id = `${key}_${name}`;
      } else {
        doc._id = key;
      }
      if (this.doc['_rev']) {
        doc['_rev'] = this.doc['_rev'];
      }
      doc.start   = moment(this.start).format("YYYY-MM-DD");
      doc.startXL = moment(this.start).toExcel(true);
      doc.end     = moment(this.end).format("YYYY-MM-DD");
      doc.endXL   = moment(this.end).toExcel(true);
      doc.creator = name;
      doc.type    = 'week';
      let res = await this.saveScheduleToDatabase(doc, true);
      Log.l("persistSchedule(): Successfully saved schedule.");
      this.alert.hideSpinner(spinnerID);
      this.updated = false;
    } catch(err) {
      Log.l("persistSchedule(): Error saving schedule.");
      Log.e(err);
      await this.alert.hideSpinner(spinnerID);
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
      if(!(Array.isArray(schedule.scheduleList) && schedule.scheduleList.length > 0)) {
        schedule.createScheduleList();
      }
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

  public newSchedule(evt?:any) {
    let popover = this.popCtrl.create('Schedule New', {schedules: this.schedules}, {cssClass: 'scheduling-new-popover'});
    popover.onDidDismiss(data => {
      Log.l("newSchedule(): Popover dismissed.");
      if(data) {
        Log.l("Data is:\n", data);
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

  public getScheduleStats() {
    let stats = { CLIENTS: {}, SESA: { 'total': 0, 'working': 0, 'off': 0 }, VACATION: 0, SITES: {}, TECHS: {'total': 0, 'working': 0, 'off': 0}, ROTATIONS: {}};
    // let dat = this.shiftsData;
    let dat = this.schedule.getSchedule();
    let office_site = this.sites.find((a:Jobsite) => {
      return a.site_number == 1075;
    });
    for(let rotation of this.shiftTypes) {
      stats.ROTATIONS[rotation.name] = {total: 0};
      for(let i in dat) {
        let keys = Object.keys(dat[i]);
        for(let rotationName of keys) {
          if(rotation.name.toUpperCase() === rotationName.toUpperCase()) {
            if(!this.prefs.CONSOLE.scheduling.showOffice) {
              if(i !== office_site.schedule_name) {
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
        stats.CLIENTS[client.name] = {'total': 0, 'working': 0, 'off': 0};
      // }
    }
    let techStats = stats.TECHS;
    for(let site of this.sites) {
      // if(site.locID.name !== 'OFFICE') {
        // Log.l("getScheduleStats(): Now processing site:\n", site);
        let sitename = site.schedule_name;
        stats.SITES[sitename] = {'total': 0, 'working': 0, 'off': 0};
      // if(site.client.name !== 'SE') {
        let sitestats = stats.SITES[sitename];
        let clientStats = stats.CLIENTS[site.client.name];
        let shifts = dat[sitename];
        for(let shiftname in shifts) {
          let shift = shifts[shiftname];
          let sub = shift.length;
          if(shiftname === 'FIRST WEEK' || shiftname === 'CONTN WEEK' || shiftname === 'FINAL WEEK') {
            clientStats.working += sub;
            sitestats.working   += sub;
            techStats.working   += site.locID.name === 'OFFICE' ? 0 : sub;
          } else if(shiftname === 'DAYS OFF') {
            clientStats.off += sub;
            sitestats.off   += sub;
            techStats.off   += site.locID.name === 'OFFICE' ? 0 : sub;
          } else if(shiftname === 'VACATION') {
            stats.VACATION  += sub;
            clientStats.off += sub;
            sitestats.off   += sub;
            techStats.off   += site.locID.name === 'OFFICE' ? 0 : sub;
          }
          sitestats.total   = sitestats.working   + sitestats.off;
          techStats.total   = techStats.working   + techStats.off + stats.VACATION  + this.techs.length;
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
    let tech = event;
    let js = null, rotation = "";
    // this.countTechTotals();
    this.updated = true;
    // let unassignedSlot:Array<any> = this.unassignedTechs;
    let unassignedSlot:Array<any> = this.schedule.unassigned;
    this.getScheduleStats();
    let user = this.data.getUser();
    let name = user.getUsername();
    if(this.data.status.persistTechChanges || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
      let i = unassignedSlot.indexOf(tech);
      if(i > -1) {
        Log.l("techDropped(): Tech %s found in unassigned pool.", tech.toString());
        this.schedule.addUnassignedTech(tech);
        this.updateTechSettings(tech, this.unassignedSite, "UNASSIGNED", "AM");
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
    let slot = event[0];
    let tech = event[1];
    this.updated = true;
    // let unassignedSlot:Array<any> = this.unassignedTechs;
    let unassignedSlot:Array<any> = this.schedule.unassigned;
    // this.countTechTotals();
    this.getScheduleStats();
    let user = this.data.getUser();
    let name = user.getUsername();
    if(this.data.status.persistTechChanges || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike' || name === 'Chilo') {
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

  public editSite(site:Jobsite) {
    // this.alert.showAlert("SORRY", "Clicking here was going to allow you to edit the job site, but this feature is not implemented yet. Actually, it's only being implemented while Mike isn't watching. He said it was a stupid idea and I was stupid for thinking of it. And trust me, you don't want to mess with that guy. I saw him try to chop up a cat with a gate. <span class='alert-icons'>😨😿</span>");
    let modal = this.modalCtrl.create('Add Work Site', { mode: 'Edit', source: 'scheduling', jobsite: site }, {cssClass: 'site-edit-modal'});
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
  //   let table:Array<any> = [
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

  public toCSV(header:Array<any>, table:Array<Array<any>>) {
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

  public printSchedule(evt?:any) {
    let schedule = this.schedule;
    let stats = this.stats;
    let event = evt ? evt : undefined;
    // if(event && event.shiftKey) {
    //   Log.l("printSchedule(): called with event:\n", event);
    //   this.navCtrl.push("Schedule Print Beta", {schedule:schedule, stats:stats});
    // } else {
    //   Log.l("printSchedule(): no event parameter used.");
    //   this.navCtrl.push("Schedule Print", {schedule:schedule});
    // }
    this.navCtrl.push("Schedule Print Beta", {schedule:schedule, stats:stats});
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
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public optionsSaved(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsSaved(): Event is:\n", event);
    let prefs = this.prefs.getPrefs();
    this.data.savePreferences(prefs).then(res => {
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      this.getScheduleStats();
    }).catch(err => {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    });
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
  }

  public showScheduleChoose(event?:any) {
    this.scheduleOpenVisible = true;
  }

  public scheduleChosen(event:any) {
    Log.l(`scheduleChosen(): Event is:\n`, event);
    this.scheduleOpenVisible = false;
    let schedule:Schedule = event;
    this.schedule = schedule;
    // this.shiftsData = this.schedule.schedule;
    let techs:Employee[] = this.allTechs.filter(_techFilter).sort(_techSort);
    this.techs = techs;
    this.schedule.setTechs(techs);
    let unassignedTechs:Employee[] = schedule.getUnassigned();
    let workingTechs:Employee[] = schedule.getWorkingTechs();
    let scheduledTechs:Employee[] = [...unassignedTechs, ...workingTechs];
    let newTechs:Employee[] = techs.filter((a:Employee) => {
      let index = scheduledTechs.indexOf(a);
      if(index > -1) {
        return false;
      } else {
        return true;
      }
    });
    // this.techs = schedule.getUnassigned();
    this.schedule.createSchedulingObject(this.sites, this.techs);
    this.removeUsedTechs();
    this.unassignedTechs = unassignedTechs;
    this.newTechs = newTechs;
    this.getScheduleStats();
    this.start = moment(schedule.start);
    this.end   = moment(schedule.end);
    this.dateStart = moment(this.start).toDate();
    this.dateEnd    = moment(this.end).toDate();
    this.strDateEnd = moment(this.end).format("DD MMM YYYY");
    this.oldStartDate = moment(this.start);
    let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
    this.title = `Scheduling (${name})`;
    this.initializeHighlights();
  }

  public techDroppedIntoNewTechList(evt?:any) {
    Log.l(`techDroppedIntoNewTechList(): Event is:\n`, evt);
    this.newTechsDropHighlight = false;
  }

  public toggleShift(tech:Employee, evt?:any) {
    Log.l(`toggleShift(): Clicked for tech:\n`, tech);
    if(tech instanceof Employee) {
      if(tech.shift.toUpperCase() === "AM") {
        tech.shift = "PM";
      } else {
        tech.shift = "AM";
      }
    }
  }
  public techDroppedIntoUnassigned(event:any) {
    Log.l(`techDroppedIntoUnassigned(): Event is:\n`, event);
    this.unassignedDropHighlight = false;

  }
  public techDraggedFromUnassigned(event:any) {
    Log.l(`techDraggedFromUnassigned(): Event is:\n`, event);

  }
  public dragEnter(i1:number, i2:number, event:any) {
    Log.l(`dragEnter(): Entered dropHighlightArray[${i1}][${i2}], event is:\n`, event);
    this.dropHighlightArray[i1][i2] = true;
  }
  public dragExit(i1:number, i2:number, event:any) {
    Log.l(`dragExit(): Exited dropHighlightArray[${i1}][${i2}], event is:\n`, event);
    this.dropHighlightArray[i1][i2] = false;
  }
  public dragEnterUnassigned(event:any) {
    Log.l(`dragEnterUnassigned(): Event is:\n`, event);
    this.unassignedDropHighlight = true;
    if(this.exitUnassignedTimeoutHandle) {
      clearTimeout(this.exitUnassignedTimeoutHandle);
      this.exitUnassignedTimeoutHandle = null;
    }
  }
  public dragEnterNewTechs(event:any) {
    Log.l(`dragEnterNewTechs(): Event is:\n`, event);
    this.newTechsDropHighlight = true;
    if(this.exitNewTechsTimeoutHandle) {
      clearTimeout(this.exitNewTechsTimeoutHandle);
      this.exitNewTechsTimeoutHandle = null;
    }
  }
  public dragExitUnassigned(event:any) {
    this.exitUnassignedTimeoutHandle = setTimeout(() => {
      Log.l(`dragExitUnassigned(): Event is:\n`, event);
      this.unassignedDropHighlight = false;
    }, 250);
  }
  public dragExitNewTechs(event:any) {
    this.exitNewTechsTimeoutHandle = setTimeout(() => {
      Log.l(`dragExitNewTechs(): Event is:\n`, event);
      this.newTechsDropHighlight = false;
    },250);
  }
  public techDraggedFromNewTechList(event:any) {
    Log.l(`techDraggedFromNewTechList(): Event is:\n`, event);

  }

}

