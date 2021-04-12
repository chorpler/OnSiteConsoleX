// import { PDFService                                           } from 'providers/pdf-service'         ;
import { Subscription                                         } from 'rxjs'                          ;
import { sprintf                                              } from 'sprintf-js'                    ;
import { Component, OnInit, OnDestroy, NgZone, Input, Output, } from '@angular/core'                 ;
import { ElementRef, ViewChild, EventEmitter,                 } from '@angular/core'                 ;
import { ViewChildren, QueryList,                             } from '@angular/core'                 ;
import { OptionsComponent                                     } from 'components/options/options'    ;
import { ServerService                                        } from 'providers/server-service'      ;
import { DBService                                            } from 'providers/db-service'          ;
import { AuthService                                          } from 'providers/auth-service'        ;
import { AlertService                                         } from 'providers/alert-service'       ;
import { OSData                                               } from 'providers/data-service'        ;
import { NumberService                                        } from 'providers/number-service'      ;
import { Jobsite                                              } from 'domain/onsitexdomain'          ;
import { Employee                                             } from 'domain/onsitexdomain'          ;
import { ReportMaintenance                                    } from 'domain/onsitexdomain'          ;
import { Schedule                                             } from 'domain/onsitexdomain'          ;
import { Shift                                                } from 'domain/onsitexdomain'          ;
import { PayrollPeriod                                        } from 'domain/onsitexdomain'          ;
import { MaintenanceTask                                      } from 'domain/onsitexdomain'          ;
import { MaintenanceTasks                                     } from 'domain/onsitexdomain'          ;
import { MaintenanceNouns                                     } from 'domain/onsitexdomain'          ;
import { MaintenanceVerbs                                     } from 'domain/onsitexdomain'          ;
import { MaintenanceTaskType                                  } from 'domain/onsitexdomain'          ;
import { MaintenanceNoun                                      } from 'domain/onsitexdomain'          ;
import { MaintenanceVerb                                      } from 'domain/onsitexdomain'          ;
import { MaintenanceTaskTypes                                 } from 'domain/onsitexdomain'          ;
import { Log, moment, Moment, isMoment, oo, _dedupe,          } from 'domain/onsitexdomain'          ;
import { SESAClient, SESALocation, SESALocID, SESAAux,        } from 'domain/onsitexdomain'          ;
import { Message, SelectItem, InputTextarea, Dropdown,        } from 'primeng/primeng'               ;
import { NotifyService                                        } from 'providers/notify-service'      ;
import { Command, KeyCommandService                           } from 'providers/key-command-service' ;
import { Calendar                                             } from 'primeng/calendar'              ;
import { MultiSelect                                          } from 'primeng/multiselect'           ;

@Component({
  selector: 'report-maintenance-view',
  templateUrl: 'report-maintenance-view.html',
})
export class ReportMaintenanceView implements OnInit,OnDestroy {
  @ViewChild('tasksScroller') tasksScroller:ElementRef;
  @ViewChildren('startTimeCal') startTimeCalList:QueryList<Calendar>;
  @ViewChildren('endTimeCal') endTimeCalList:QueryList<Calendar>;
  @ViewChildren('taskTechsSelect') techsSelectList:QueryList<MultiSelect>;
  @Input('mode')       mode : string = "edit"     ;
  @Input('shift')     shift : Shift               ;
  @Input('period')   period : PayrollPeriod       ;
  @Input('report')   report : ReportMaintenance   ;
  @Input('reports') reports : ReportMaintenance[]  = [];
  @Input('tech')       tech : Employee            ;
  @Input('site')       site : Jobsite             ;
  @Input('sites')     sites : Jobsite[] = []      ;
  @Output('finished') finished = new EventEmitter<any>();
  @Output('reportChange') reportChange = new EventEmitter<any>();
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('save')     save = new EventEmitter<any>();

  public title      : string         = "View Maintenance Report";
  public header     : string         = "View Maintenance Report";

  public visible        : boolean        = true               ;
  public dialogLeft     : number         = 250                ;
  public dialogTop      : number         = 100                ;
  public dialogTarget   : any            = null               ;
  public dropdownTarget : any            = 'body'             ;
  public calendarTarget : any            = 'body'             ;
  public dialogStyle    : any = {
    // overflow: 'visible',
    overflow: 'auto',
  };

  public keySubscription: Subscription                    ;
  
  public moment                      = moment             ;
  public idx        : number         = 0                  ;
  public count      : number         = 0                  ;
  public report_date: Date                                ;
  public client     : any            ;
  public location   : any            ;
  public locID      : any            ;
  public allTechs   : Employee[]     = []                 ;
  public techs      : Employee[]     = []                 ;
  
  public dirty      : boolean        = false              ;
  public includeMiddleName:boolean = true;
  public reverseTechLabel:boolean  = false;

  public selectedType              : MaintenanceTaskType;
  public selectedNoun              : MaintenanceNoun;
  public selectedVerb              : MaintenanceVerb;
  public taskTypes                 : MaintenanceTaskTypes = [];
  public taskMNouns                : MaintenanceNouns = [];
  public taskENouns                : MaintenanceNouns = [];
  public taskNouns                 : MaintenanceNouns = [];
  public taskVerbs                 : MaintenanceVerbs = [];
  public selectedTaskType          : MaintenanceTaskType;
  public selectedTaskNoun          : MaintenanceTaskType;
  public selectedTaskVerb          : MaintenanceTaskType;
  public selectedTechsLabel        : string = "{0} techs selected";

  public techsMenu      : SelectItem[] = [];
  public taskTypesMenu  : SelectItem[] = [];
  public taskMNounsMenu : SelectItem[] = [];
  public taskENounsMenu : SelectItem[] = [];
  public taskVerbsMenu  : SelectItem[] = [];

  public clients     :any[]           = []                 ;
  public locations   :any[]           = []                 ;
  public locIDs      :any[]           = []                 ;
  public repair_hours:number = 0;
  public time_start  :Date           = new Date()         ;
  public time_end    :Date           = new Date()         ;
  public defaultStartDate:Date       = new Date()         ;
  public defaultEndDate:Date         = new Date()         ;
  public siteList    :SelectItem[]   = []                 ;
  public clientList  :SelectItem[]   = []                 ;
  public locationList:SelectItem[]   = []                 ;
  public locIDList   :SelectItem[]   = []                 ;
  public timeList    :SelectItem[]   = []                 ;
  public reportUndo  :any[]          = []                 ;
  public prevComp    :any                                 ;
  public reportTimeError:boolean     = false              ;
  public stepMinute  :number         = 15                 ;
  public dropdownScroll : string     = "200px"            ;
  // public calendarDataType:string     = 'date'             ;
  public reportDateDataType:string     = 'date'           ;
  public calendarDataType:string     = 'string'           ;
  public scrollDelay :number         = 200                ;
  // public firstIfNull :boolean        = true               ;
  public firstIfNull :boolean        = false              ;
  public detailedSite:boolean        = false              ;
  public dataReady   :boolean        = false              ;
  public taskTimes   :{start:Date,end?:Date}[] = [];
  public tasksVisible:boolean[] = [];

  constructor(
    public db         : DBService         ,
    public server     : ServerService     ,
    public alert      : AlertService      ,
    public data       : OSData            ,
    public notify     : NotifyService     ,
    public keyService : KeyCommandService ,
    public numServ    : NumberService     ,
  ) {
    window['onsitemaintenanceview']  = this;
    window['onsitemaintenanceview2'] = this;
    this.prevComp = window['p'];
    window['p2'] = this;
    window['_dedupe'] = _dedupe;
  }

  ngOnInit() {
    Log.l("ReportMaintenanceView: ngOnInit() called");
    if(this.data.isAppReady()) {
      let backupReport = oo.clone(this.report);
      this.reportUndo.push(backupReport);
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportMaintenanceView: ngOnDestroy() fired.");
    this.cancelSubscriptions();
    if(this.prevComp) {
      window['p'] = this.prevComp;
    }
  }

  public installSubscribers() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "ReportView.previous" : this.previous(); break;
        case "ReportView.next"     : this.next(); break;
        case "ReportView.previous" : this.previous(); break;
        case "ReportView.next"     : this.next(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    this.installSubscribers();
    let clients:SESAClient[]     = this.sites.map((a:Jobsite) => a.client);
    let locations:SESALocation[] = this.sites.map((a:Jobsite) => a.location);
    let locIDs:SESALocID[]       = this.sites.map((a:Jobsite) => a.locID);
    // this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    // this.locations = _dedupe(this.sites.map((a:Jobsite) => a.location));
    // this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a.locID));
    this.clients   = _dedupe(clients  , 'value');
    this.locations = _dedupe(locations, 'value');
    this.locIDs    = _dedupe(locIDs   , 'value');
    let rpt:ReportMaintenance = this.report || this.reports[0];
    this.idx = this.reports.indexOf(rpt);
    this.count = this.reports.length;
    let site = this.getReportLocation();
    this.site = site;
    let report = this.report;
    this.allTechs = this.data.getData('employees');
    this.techs = this.allTechs.slice(0);
    this.setHeader();
    this.initializeSelections();
    this.createMenuLists();
    this.createTaskVisibilityArray();
    this.updateDisplay(report);
    // let report_date = rpt.getReportDateAsMoment().toDate();
    // this.report_date = report_date;
    this.report_date = rpt.getReportDateMoment().toDate();

    this.dataReady = true;
  }

  public setHeader(idx?:number) {
    let count = this.reports.length;
    let index = idx || this.idx;
    this.header = `View Maintenance Report (${index+1} / ${count})`;
    return this.header;
  }

  public createMenuLists() {
    let rpt:ReportMaintenance = this.report;
    let rd = rpt.report_date;
    let reportDate = moment(rpt.report_date, "YYYY-MM-DD").startOf('day');
    let timeList:SelectItem[] = [];
    for(let i = 0; i < 24; i++) {
      for(let j = 0; j < 60; j += 30) {
        let time = sprintf("%02d:%02d", i, j);
        let dateTime:Moment = moment(reportDate).hour(i).minute(j);
        let item:SelectItem = {label: time, value: dateTime};
        timeList.push(item);
      }
    }

    let siteList    : SelectItem[] = [] ;
    let clientList  : SelectItem[] = [] ;
    let locationList: SelectItem[] = [] ;
    let locIDList   : SelectItem[] = [] ;
    for(let site of this.sites) {
      let name:string = site.getSiteSelectName();
      let item:SelectItem = {label: name, value: site}
      siteList.push(item);
    }
    for(let val of this.clients) {
      let item:SelectItem = {label: val.fullName, value: val}
      clientList.push(item);
    }
    for(let val of this.locations) {
      let item:SelectItem = {label: val.fullName, value: val}
      locationList.push(item);
    }
    for(let val of this.locIDs) {
      let item:SelectItem = {label: val.fullName, value: val}
      locIDList.push(item);
    }
    let emptyType = {
      label: "(Select Task Type)",
      value: null,
    };
    let emptyNoun = {
      label: "(Select Part/System)",
      value: null,
    };
    let emptyVerb = {
      label: "(Select Action)",
      value: null,
    };
    // let emptyTech = {
    //   label: "Select Technicians",
    //   value: null,
    // };
    this.taskTypesMenu = this.taskTypes.map(a => {
      let value = this.data.getMaintenanceWord(a);
      let out:SelectItem = {
        label : value,
        value : a,
      };
      return out;
    });
    this.taskMNounsMenu = this.taskMNouns.map(a => {
      let value = this.data.getMaintenanceWord(a);
      let out:SelectItem = {
        label : value,
        value : a,
      };
      return out;
    });
    this.taskENounsMenu = this.taskENouns.map(a => {
      let value = this.data.getMaintenanceWord(a);
      let out:SelectItem = {
        label : value,
        value : a,
      };
      return out;
    });
    this.taskVerbsMenu = this.taskVerbs.map(a => {
      let label = this.data.getMaintenanceWord(a);
      let out:SelectItem = {
        label : label,
        value : a,
      };
      return out;
    });
    // this.taskTypesMenu.unshift(emptyType);
    // this.taskMNounsMenu.unshift(emptyNoun);
    // this.taskENounsMenu.unshift(emptyNoun);
    // this.taskVerbsMenu.unshift(emptyVerb);
    this.techsMenu = this.updateTechsMenu(this.includeMiddleName, this.reverseTechLabel);
    this.timeList     = timeList     ;
    this.siteList     = siteList     ;
    this.clientList   = clientList   ;
    this.locationList = locationList ;
    this.locIDList    = locIDList    ;
  }

  public updateTechsMenu(includeMiddle?:boolean, reversed?:boolean):SelectItem[] {
    let middle = typeof includeMiddle === 'boolean' ? includeMiddle : true;
    let nameFirst = typeof reversed === 'boolean' ? reversed : false;
    this.techsMenu = this.techs.map(user => {
      let label = user.getSelectableDescription(middle, nameFirst);
      let username = user.getUsername();
      let out:SelectItem = {
        label : label,
        value : username,
      };
      return out;
    });
    return this.techsMenu;
  }

  public initializeSelections() {
    let rpt = this.report;
    this.taskTypes  = rpt.getTaskTypes();
    this.taskMNouns = rpt.getTaskNouns('mechanical');
    this.taskENouns = rpt.getTaskNouns('electronic');
    this.taskNouns  = rpt.getAllNouns();
    this.taskVerbs  = rpt.getAllVerbs();
  }

  public updateDisplay(report?:ReportMaintenance) {
    let rpt:ReportMaintenance = report || this.report;
    let out:{start:Date,end?:Date}[] = [];
    for(let task of this.report.tasks) {
      let times:{start:Date,end?:Date} = {start:null};
      if(task.start) {
        times.start = moment(task.start).toDate();
      }
      if(task.end) {
        times.end = moment(task.end).toDate();
      }
      out.push(times);
    }
    this.taskTimes = out;
    // let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    // let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    // let hours = rpt.getRepairHours();
    // let repair_hours = this.data.convertTimeStringToHours(hours);
    // let time_start = moment(rpt.time_start);
    // let time_end   = moment(rpt.time_end  );
    // // rpt.getStartTime().toDate()
    // this.time_start = time_start.toDate();
    // this.time_end = time_end.toDate();
    // this.repair_hours = repair_hours;
    // // let startItem:SelectItem = this.timeList.find((a:SelectItem) => {
    // //   let time = moment(a.value);
    // //   return time.isSame(time_start);
    // // });
    // // let endItem:SelectItem = this.timeList.find((a:SelectItem) => {
    // //   let time = moment(a.value);
    // //   return time.isSame(time_end);
    // // });
    // // this.time_start = startItem.value.toDate();
    // // this.time_end = endItem.value.toDate();


    // // let name  = rpt.username;
    // // let index = this.reports.indexOf(rpt) + 1;
    // // let count = this.reports.length;
    // // let report_date = moment(rpt.report_date).toDate();
    // // this.report_date = report_date;
    // // this.report_date = report_date;
    let site:Jobsite = this.sites.find((a:Jobsite) => {
      return this.report.matchesSite(a);
    });
    if(site) {
      this.site = this.siteList.find((a:SelectItem) => {
        return a.value === site;
      }).value;
    }
    let client = this.data.getFullClient(rpt.client);
    let location = this.data.getFullLocation(rpt.location);
    let locID = this.data.getFullLocID(rpt.locID);
    this.client = this.clientList.find((a:SelectItem) => {
      return a.value.name === client.name;
    }).value;
    this.location = this.locationList.find((a:SelectItem) => {
      return a.value.name === location.name;
    }).value;
    this.locID = this.locIDList.find((a:SelectItem) => {
      return a.value.name === locID.name;
    }).value;
  }

  public cancelClicked(event?:any) {
    // this.viewCtrl.dismiss();
    Log.l("cancel(): Clicked, event is:", event);
    this.cancel.emit(event);
    this.finished.emit(event);
  }

  public async saveNoExitClicked(event?:any) {
    let spinnerID:string;
    let rpt:ReportMaintenance = this.report;
    try {
      Log.l("saveNoExitClicked(): Attempting to save report …");
      let username:string = this.data.getUsername();
      // if(rpt.times_error || rpt.date_error) {
      //   let text:string = "This report has an error somewhere. The report date and start time may not match, or the start time plus repair hours may not match the end time. Are you sure you want to save a broken report?";
      //   let confirm:boolean = await this.alert.showConfirmYesNo("WARNING", text);
      //   if(!confirm) {
      //     return;
      //   }
      // }
      spinnerID = await this.alert.showSpinnerPromise("Saving maintenance report …");
      let res = await this.db.saveReportMaintenance(rpt, username);
      Log.l("saveNoExitClicked(): Report successfully saved.");
      await this.alert.hideSpinnerPromise(spinnerID);
      // if(this.period) {
        //   this.period.addReport(this.report);
        // } else if(this.shift) {
          //   this.shift.addShiftReport(this.report);
          // }
          // this.viewCtrl.dismiss();
      // this.save.emit(event);
      // this.finished.emit(event);
      return res;
    } catch(err) {
      Log.l(`saveNoExitClicked(): Error saving report`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      // this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 5000);
      await this.alert.showErrorMessage("ERROR", "Error saving maintenance report", err);
    }
  }

  // public saveNoExit(event?:any) {
  //   this.db.saveReport(this.report).then(res => {
  //     Log.l("saveNoExit(): Report successfully saved.");
  //     if(this.period) {
  //       this.period.addReport(this.report);
  //     } else if(this.shift) {
  //       this.shift.addShiftReport(this.report);
  //     }
  //     this.reportChange.emit()
  //     // this.viewCtrl.dismiss();
  //   }).catch(err => {
  //     Log.l("save(): Error saving report.");
  //     Log.e(err);
  //     this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 10000);
  //     // this.alert.showAlert("ERROR", "Error saving report:<br>\n<br>\n" + err.message);
  //   });
  // }

  public async saveClicked(event?:any) {
    let spinnerID:string;
    let rpt:ReportMaintenance = this.report;
    try {
      Log.l("saveClicked(): Attempting to save report …");
      let username:string = this.data.getUsername();
      // if(rpt.times_error || rpt.date_error) {
      //   let text:string = "This report has an error somewhere. The report date and start time may not match, or the start time plus repair hours may not match the end time. Are you sure you want to save a broken report?";
      //   let confirm:boolean = await this.alert.showConfirmYesNo("WARNING", text);
      //   if(!confirm) {
      //     return;
      //   }
      // }
      spinnerID = await this.alert.showSpinnerPromise("Saving maintenance report …");
      let res = await this.db.saveReportMaintenance(rpt, username);
      Log.l("saveClicked(): Report successfully saved.");
      await this.alert.hideSpinnerPromise(spinnerID);
      // if(this.period) {
        //   this.period.addReport(this.report);
        // } else if(this.shift) {
          //   this.shift.addShiftReport(this.report);
          // }
          // this.viewCtrl.dismiss();
      this.save.emit(event);
      this.finished.emit(event);
      return res;
    } catch(err) {
      Log.l(`saveClicked(): Error saving maintenance report`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      // this.notify.addError("ERROR", `Error saving report: '${err.message}'`, 5000);
      await this.alert.showErrorMessage("ERROR", "Error saving maintenance report", err);
    }
  }

  public async deleteReport(event:any) {
    let spinnerID;
    let report:ReportMaintenance = this.report;
    try {
      Log.l(`deleteReport(): Event is:`, event);
      // let report:ReportMaintenance = this.report;
      let title:string = "DELETE REPORT";
      let text:string = `Are you sure you want to delete this report? This will permanently delete this report and cannot be undone.`;
      if(this.data.isDeveloper) {
        text += "<br>\n<br>\n(However, just between a couple of developers, I'm saving the report to the onsitedeletedreports array, so you can recover it from the DevTools.)";
      }
      window['onsitedeletedmaintenancereports'] = window['onsitedeletedmaintenancereports'] || [];
      let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        let newReport:ReportMaintenance = report.clone();
        window['onsitedeletedmaintenancereports'].push(report);
        let res:any = await this.db.deleteMaintenanceReport(report);
        Log.l("deleteReport(): Successfully deleted report.");
          // this.cancelClicked(event);
        this.cancel.emit(event);
        return res;
      }
    } catch(err) {
      Log.l(`deleteReport(): Error deleting report!`);
      Log.e(err);
      await this.alert.showErrorMessage("ERROR", "Error deleting this report", err);
      // this.notify.addError("ERROR", `Error deleting report ${report._id}: '${err.message}'`, 10000);
      // this.alert.showAlert("ERROR", `Error  report ${report._id}:<br>\n<br>\n` + err.message);

      // throw new Error(err);
    }
  }

  public updateDate(newDate:Date) {
    Log.l(`updateDate(): setting date to:`, newDate);
    let date = moment(newDate);
    let report = this.report;
    // report.report_date = date.format("YYYY-MM-DD");
    report.setReportDate(date);
    // report.shift_serial = Shift.getShiftSerial(date);
    // report.payroll_period = PayrollPeriod.getPayrollSerial(date);
  }

  public setReportLocation(site:Jobsite) {
    let tech = this.tech;
    // let report = this.report;
    // let cli = this.data.getFullClient(tech.client);
    // let loc = this.data.getFullLocation(tech.location);
    // let lid = this.data.getFullLocation(tech.locID);
    let cli = site.client;
    let loc = site.location;
    let lid = site.locID;
    this.updateReportCLL('client', cli);
    this.updateReportCLL('location', loc);
    this.updateReportCLL('locID', lid);
    this.client = this.clients.find(a => {
      return a['name'] === cli.name;
    });
    this.location = this.locations.find(a => {
      return a['name'] === loc.name;
    });
    this.locID = this.locIDs.find(a => {
      return a['name'] === lid.name;
    });
    // this.updateReportCLL('client', client);
    // this.updateReportCLL('location', location);
    // this.updateReportCLL('locID', locID);
    // this.site = site;
    // return this.site;
    return this.report;
  }

  public getReportLocation():Jobsite {
    let rpt = this.report;
    let cli  = this.data.getFullClient(rpt.client);
    let loc  = this.data.getFullLocation(rpt.location);
    let lid  = this.data.getFullLocID(rpt.locID);
    let site = this.sites.find((a:Jobsite) => {
      let siteClient   = a.client.name;
      let siteLocation = a.location.name;
      let siteLocID    = a.locID.name;
      return siteClient === cli.name && siteLocation === loc.name && siteLocID === lid.name;
    });
    Log.l(`getReportLocation(): Report/tech located at site:`, site);
    return site;
  }

  public updateReportCLL(key:string, value:any) {
    let report = this.report;
    Log.l(`updateReportCLL(): Setting report key ${key} to:`, value);
    if(key === 'client') {
      report.client = value.fullName;
      let site = this.getReportLocation();
      this.site = site;
    } else if(key === 'location') {
      report.location = value.fullName;
      let site = this.getReportLocation();
      this.site = site;
    } else if(key === 'locID') {
      report.locID = value.name;
      let site = this.getReportLocation();
      this.site = site;
    } else {
      Log.w(`updateReportCLL(): Unable to find key ${key} to set, in Report:`, report);
    }
  }

  public taskTypeUpdate(task:MaintenanceTask, evt?:Event) {
    Log.l(`ReportMaintenanceView.taskTypeUpdate(): Called for task with event:`, task, evt);
    let type = task && typeof task.type === 'string' ? task.type : "unknown";
    let noun = task.noun;
    let verb = task.verb;
    let verbs  = ReportMaintenance.VERBS;
    let mnouns = ReportMaintenance.MWORDS;
    let enouns = ReportMaintenance.EWORDS;
    if(type === 'mechanical') {
      if(mnouns.indexOf(noun) === -1) {
        task.noun = null;
      }
      task.verb = null;
      this.dirty = true;
    } else if(type === 'electronic') {
      if(enouns.indexOf(noun) === -1) {
        task.noun = null;
      }
      task.verb = null;
      this.dirty = true;
    } else {
      Log.w(`ReportMaintenance.taskTypeUpdate(): Could not update task to type '${type}':`, task);
    }
  }

  public taskWordUpdate(wordType:'noun'|'verb', task:MaintenanceTask, evt?:Event) {
    Log.l(`ReportMaintenanceView.taskWordUpdate(): Called for '${wordType}' for task:`, task);
  }

  public updateTaskTime(task:MaintenanceTask, timeToUpdate:'start'|'end', datetime?:Date|Moment|string, evt?:Event) {
    Log.l(`ReportMaintenanceView.updateTaskTime(): Called for '${timeToUpdate}' time in task, with event:`, task, evt);
    let mo = moment(datetime);
    if(!isMoment(mo)) {
      let text = `ReportMaintenanceView.updateTaskTime(): invalid datetime provided`;
      Log.w(text + ":", datetime);
      let err = new Error(text);
      throw err;
    } else {
      let rpt:ReportMaintenance = this.report;
      let time = mo.format();
      task[timeToUpdate] = time;
    }
    // this.update.emit(rpt);
  }

  public openTaskTime(task:MaintenanceTask, index:number, timeOpened:'start'|'end', calendar?:Calendar, evt?:Event) {
    Log.l(`ReportMaintenanceView.openTaskTime(): Called for '${timeOpened}' time in task, with event:`, task, evt);
    // let mo = moment();
    let time = this.getDefaultTaskTime(task);
    let mo = moment(time);
    let times = this.taskTimes[index];
    if(timeOpened === 'start') {
      // this.defaultStartDate = mo.toDate();
      if(!times.start) {
        // times.start = mo.toDate();
        calendar.selectDate({year:mo.year(),month:mo.month(),day:mo.date()});
      }
    } else if(timeOpened === 'end') {
      // this.defaultEndDate = mo.toDate();
      if(!times.end) {
        // times.end = mo.toDate();
        calendar.selectDate({year:mo.year(),month:mo.month(),day:mo.date()});
      }
    }
    // if(!isMoment(mo)) {
    //   let text = `ReportMaintenanceView.openTaskTime(): invalid datetime provided`;
    //   Log.w(text + ":", datetime);
    //   let err = new Error(text);
    //   throw err;
    // } else {
    //   let rpt:ReportMaintenance = this.report;
    //   let time = mo.format();
    //   task[timeToUpdate] = time;
    // }
    // this.update.emit(rpt);
  }

  // public updateRepairHours() {
  //   let report = this.report;
  //   let hours:number = report.getRepairHours();
  //   Log.l(`updateRepairHours(): Setting repair hours to:`, hours);
  //   report.forceRepairHours(hours);
  //   // report.setRepairHours(Number(this.report.repair_hours));
  //   // this.time_start = moment(report.time_start);
  //   // this.time_end = moment(report.time_end);
  //   this.updateDisplay();
  // }

  public timeChanged(type:number, event?:any) {
    Log.l(`timeChanged(): Called for type ${type}, value is:`, event);
    let date:Date;
    let time:Moment;
    let report:ReportMaintenance = this.report;
    if(type === 1) {
      date = this.time_start;
      time = moment(date);
      Log.l(`timeChanged(): Setting report start time to: `, time);
      // report.setStartTime(time);
      // report.forceStartTime(time);
    } else if(type === 2) {
      date = this.time_end;
      time = moment(date);
      Log.l(`timeChanged(): Setting report end time to: `, time);
      // report.setEndTime(time);
      // report.forceEndTime(time);
    }
    // if(!report.areTimesValid()) {
    //   this.reportTimeError = true;
    // } else {
    //   this.reportTimeError = false;
    // }
    // this.updateDisplay();
  }

  // public updateTime(type:number, event?:Date) {
  //   Log.l(`updateTime(): Called for type ${type}, value is:`, event);
  //   let date:Date;
  //   let time:Moment;
  //   let report:ReportMaintenance = this.report;
  //   if(type === 1) {
  //     date = this.time_start;
  //     time = moment(date);
  //     Log.l(`updateTime(): Setting report start time to: `, time);
  //     // report.setStartTime(time);
  //     report.forceStartTime(time);
  //   } else if(type === 2) {
  //     date = this.time_end;
  //     time = moment(date);
  //     Log.l(`updateTime(): Setting report end time to: `, time);
  //     // report.setEndTime(time);
  //     report.forceEndTime(time);
  //   }
  //   // if(!report.areTimesValid()) {
  //   //   this.reportTimeError = true;
  //   // } else {
  //   //   this.reportTimeError = false;
  //   // }
  //   this.updateDisplay();
  // }

  // public selectTime(type:number, event?:Date) {
  //   Log.l(`selectTime(): Called for type ${type}, value is:`, event);
  //   let date:Date;
  //   let time:Moment;
  //   let report:ReportMaintenance = this.report;
  //   if(type === 1) {
  //     date = this.time_start;
  //     time = moment(date);
  //     Log.l(`selectTime(): Setting report start time to: `, time);
  //     report.forceStartTime(time);
  //   } else if(type === 2) {
  //     date = this.time_end;
  //     time = moment(date);
  //     Log.l(`selectTime(): Setting report end time to: `, time);
  //     report.forceEndTime(time);
  //   }
  //   // if(!report.areTimesValid()) {
  //   //   this.reportTimeError = true;
  //   // } else {
  //   //   this.reportTimeError = false;
  //   // }
  //   // this.updateDisplay();
  // }

  // public updateTimeStart() {
  //   let report = this.report;
  //   let start = moment(this.time_start);
  //   report.setStartTime(start);
  //   this.updateDisplay();
  // }

  // public updateTimeEnd() {
  //   let report = this.report;
  //   let end = moment(this.time_end);
  //   report.setEndTime(end);
  //   this.updateDisplay();
  // }

  public previous(evt?:Event) {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.report = this.reports[this.idx];
    this.setHeader(this.idx);
    this.updateDisplay(this.report);
    // this.reportChange.emit(this.idx);
  }

  public next(evt?:Event) {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.report = this.reports[this.idx];
    // this.reportChange.emit(this.idx);
    this.setHeader(this.idx);
    this.updateDisplay(this.report);
  }

  public toggleDetailedSiteView(evt?:Event) {
    this.detailedSite = !this.detailedSite;
    Log.l(`toggleDetailedSiteView(): Toggled to:`, this.detailedSite);
  }

  public updateReportSite(site:Jobsite, evt?:Event) {
    Log.l(`updateReportSite(): Updating site to:`, site);
    let rpt:ReportMaintenance = this.report;
    let siteCLI = site.getSiteKeyAsString('client').toUpperCase();
    let siteLOC = site.getSiteKeyAsString('location').toUpperCase();
    let siteLID = site.getSiteKeyAsString('locID').toUpperCase();
    let cli = this.clientList.find((a:SelectItem) => {
      let val:SESAClient = a.value;
      return val.name.toUpperCase() === siteCLI || val.fullName.toUpperCase() === siteCLI;
    }).value;
    let loc = this.locationList.find((a:SelectItem) => {
      let val:SESALocation = a.value;
      return val.name.toUpperCase() === siteLOC || val.fullName.toUpperCase() === siteLOC;
    }).value;
    let lid = this.locIDList.find((a:SelectItem) => {
      let val:SESALocID = a.value;
      return val.name.toUpperCase() === siteLID || val.fullName.toUpperCase() === siteLID;
    }).value;
    if(cli && loc && lid) {
      this.client = cli;
      this.location = loc;
      this.locID = lid;
      rpt.setSite(site);
      Log.l(`updateReportSite(): Updated CLI, LOC, LID to:`, cli, loc, lid);
    } else {
      Log.w(`updateReportSite(): Error updating CLI, LOC, LID to:`, cli, loc, lid);
      this.notify.addError("SITE ERROR", "Could not find details for this work site!", 6000);
    }
  }

  public async removeTaskFromReport(task:MaintenanceTask, evt?:Event):Promise<MaintenanceTasks> {
    try {
      Log.l(`ReportMaintenanceView.removeTaskFromReport(): Called with task and event:`, task, evt);
      let rpt:ReportMaintenance = this.report;
      let tasks:MaintenanceTasks = rpt.tasks;
      let idx = tasks.indexOf(task);
      let newTasks = tasks.filter(a => a !== task);
      rpt.tasks = newTasks;
      // this.tasksVisible.splice(idx, 1);
      // this.update.emit(rpt);
      return rpt.tasks;
    } catch(err) {
      Log.l(`ReportMaintenanceView.removeTaskFromReport(): Error removing task from maintenance report:`, this.report);
      Log.e(err);
      throw err;
    }
  }

  public async possibleRemoveTask(task:MaintenanceTask, evt?:Event):Promise<any> {
    try {
      Log.l(`ReportMaintenanceView.possibleRemoveTask(): Called with event:`, evt);
      let title = "DELETE TASK";
      let text  = "Do you want to permanently delete this task from the report?"
      let confirm = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        let res = await this.removeTaskFromReport(task, evt);
        return res;
      }
    } catch(err) {
      Log.l(`ReportMaintenanceView.possibleRemoveTask(): Error removing task:`, task);
      Log.e(err);
      let title = "ERROR";
      let text = "Error while removing the task from this report";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }

  public async addTaskToReport(evt?:Event):Promise<MaintenanceTasks> {
    try {
      Log.l(`ReportMaintenanceView.addTaskToReport(): Called with event:`, evt);
      let rpt:ReportMaintenance = this.report;
      let tasks:MaintenanceTasks = rpt.tasks;
      let time = rpt.getLastTimeBlocked();
      let start = moment(time);
      this.tasksVisible.push(true);
      let newDates = {start: start.toDate(), end: null};
      this.taskTimes.push(newDates);
      rpt.startEmptyTask(start);
      let emptyTask = rpt.getLatestTask();
      let stime = emptyTask.start;
      let etime = moment(stime);
      this.defaultEndDate = etime.toDate();
      // rpt.tasks = rpt.tasks || [];
      // rpt.tasks.push(task);
      // this.tasksVisible.splice(idx, 1);
      // this.update.emit(rpt);
      return rpt.tasks;
    } catch(err) {
      Log.l(`ReportMaintenanceView.addTaskToReport(): Error removing task from maintenance report:`, this.report);
      Log.e(err);
      throw err;
    }
  }

  public async possibleAddTask(evt?:Event):Promise<any> {
    try {
      Log.l(`ReportMaintenanceView.possibleAddTask(): Called with event:`, evt);
      let title = "ADD NEW TASK";
      let text  = "Do you want to add a new task to this report?"
      let confirm = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        let res = await this.addTaskToReport(evt);
        this.dirty = true;
        await this.data.delay(this.scrollDelay);
        if(this.tasksScroller && this.tasksScroller.nativeElement) {
          let el:HTMLDivElement = this.tasksScroller.nativeElement;
          let height = el.scrollHeight || 10000;
          el.scrollTo(0, height);
        }
        // setTimeout(() => {
        //   if(this.tasksScroller && this.tasksScroller.nativeElement) {
        //     let el:HTMLDivElement = this.tasksScroller.nativeElement;
        //     let height = el.scrollHeight || 10000;
        //     el.scrollTo(0, height);
        //   }
        // }, this.scrollDelay);
        return res;
      }
    } catch(err) {
      Log.l(`ReportMaintenanceView.possibleAddTask(): Error adding new task`);
      Log.e(err);
      let title = "ERROR";
      let text = "Error while adding new task to this report";
      await this.alert.showErrorMessage(title, text, err);
      // throw err;
    }
  }

  public taskTechsChanged(task:MaintenanceTask, evt?:any) {
    Log.l(`ReportMaintenanceView.taskTechsChanged(): Called for task and event:`, task, evt);
  }

  public updateTasks(report?:ReportMaintenance) {
    let rpt = report && report instanceof ReportMaintenance ? report : this.report;
    Log.l(`ReportMaintenanceView.updateTasks(): Called with report:`, report);
    this.createTaskVisibilityArray(report);
    this.updateDisplay();
  }

  public createTaskVisibilityArray(report?:ReportMaintenance) {
    let rpt = report && report instanceof ReportMaintenance ? report : this.report;
    if(rpt instanceof ReportMaintenance) {
      Log.l(`ReportMaintenanceView.createTaskVisibilityArray(): Called with report and clone:`, rpt, rpt.clone());
      let count = rpt.getTaskCount();
      let visible:boolean[] = [];
      for(let i = 0; i < count; i++) {
        visible[i] = typeof this.tasksVisible[i] === 'boolean' ? this.tasksVisible[i] : true;
      }
      this.tasksVisible = visible;
      Log.l(`ReportMaintenanceView.createTaskVisibilityArray(): Called with report and clone:`, rpt, rpt.clone());
      return this.tasksVisible;
    } else {
      Log.w(`ReportMaintenanceView.createTaskVisibilityArray(): Error creating report visibility array for maintenance report:`, rpt);
      if(!Array.isArray(this.tasksVisible)) {
        this.tasksVisible = [];
      }
    }
  }

  public toggleTaskVisible(index:number, evt?:MouseEvent):boolean {
    Log.l(`ReportMaintenancePage.toggleTaskVisible(): Called for ${index} …`);
    this.tasksVisible[index] = !this.tasksVisible[index];
    Log.l(`ReportMaintenancePage.toggleTaskVisible(): Visibility set to: ${this.tasksVisible[index]}`);
    return this.tasksVisible[index];
  }
  
  public formatMultipleTechs(techs:Array<Employee|string>):string {
    if(Array.isArray(techs) && techs.length) {
      // return techs.map(tech => tech.getUsername()).join(', ');
      return techs.map(tech => {
        if(typeof tech === 'string') {
          return tech;
        } else if(tech instanceof Employee) {
          return tech.getUsername();
        } else {
          return '';
        }
      }).join(', ');
    } else {
      return "(NONE)";
    }
  }

  public getDefaultTaskTime(task:MaintenanceTask):Date {
    // let last = this.report.getLastTimeBlocked();
    let time:Moment = moment().round(this.stepMinute, 'minutes');
    if(task && task.start) {
      time = moment(task.start);
    }
    if(task && task.end) {
      time = moment(task.end);
    }
    Log.l(`getDefaultTaskTime(): Got time of:`, time.format());
    return time.toDate();
  }

}
