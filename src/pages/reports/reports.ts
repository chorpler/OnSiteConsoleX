import { Subscription                                                } from 'rxjs'                               ;
import { Log, Moment, moment, isMoment, ReportAny,                              } from 'domain/onsitexdomain'               ;
import { _matchCLL, _matchSite, _matchReportSite,                    } from 'domain/onsitexdomain'               ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                      ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                      ;
import { ViewController, ModalController, Content, Scroll,           } from 'ionic-angular'                      ;
import { PayrollPeriod, Shift, Jobsite, Employee                     } from 'domain/onsitexdomain'               ;
import { Report, ReportOther,                                        } from 'domain/onsitexdomain'               ;
import { ReportLogistics,                                            } from 'domain/onsitexdomain'               ;
import { ReportDriving,                                              } from 'domain/onsitexdomain'               ;
import { ReportMaintenance,                                          } from 'domain/onsitexdomain'               ;
import { ReportTimeCard,                                             } from 'domain/onsitexdomain'               ;
import { OSData                                                      } from 'providers/data-service'             ;
import { DispatchService, AppEvents                                  } from 'providers/dispatch-service'         ;
import { DBService                                                   } from 'providers/db-service'               ;
import { ServerService                                               } from 'providers/server-service'           ;
import { AlertService                                                } from 'providers/alert-service'            ;
import { Preferences, DatabaseKey,                                   } from 'providers/preferences'              ;
import { NotifyService                                               } from 'providers/notify-service'           ;
import { SpinnerService                                              } from 'providers/spinner-service'          ;
import { Calendar,                                                   } from 'primeng/calendar'                   ;
import { MultiSelect                                                 } from 'primeng/multiselect'                ;
import { Table                                                       } from 'primeng/table'                      ;
import { Panel                                                       } from 'primeng/panel'                      ;
import { MenuItem                                                    } from 'primeng/api'                        ;
import { ContextMenu                                                 } from 'primeng/contextmenu'                ;
import { ClipboardService                                            } from 'providers/clipboard-service'        ;
// import { faDatabase                                                  } from '@fortawesome/pro-light-svg-icons'   ;
// import { faArrowAltDown                                              } from '@fortawesome/pro-light-svg-icons'   ;
// import { faArrowAltCircleDown                                        } from '@fortawesome/pro-light-svg-icons'   ;
// import { faArrowAltCircleDown as farArrowAltCircleDown               } from '@fortawesome/pro-regular-svg-icons' ;
// import { faArrowAltCircleDown as fasArrowAltCircleDown               } from '@fortawesome/pro-solid-svg-icons'   ;

export type ReportsTableKey = 'reports' | 'others' | 'logistics' | 'drivings' | 'maintenances' | 'timecards';
export type ReportsTableNumIndex = 1|2|3|4|5|6;
export type ReportsTableIndex = '1'|'2'|'3'|'4'|'5'|'6';
// export type TableIndexKey = ReportsTableKey|ReportsTableNumIndex;
export type TableIndexKey = ReportsTableNumIndex;
export type ITABLEKEYS = {
  [propName in ReportsTableKey]: ReportsTableNumIndex;
}
export type ITABLEINDEXES = {
  [propIdx in ReportsTableIndex]: ReportsTableKey;
}
export const TABLEINDEX:ITABLEKEYS = {
  reports             : 1              ,
  others              : 2              ,
  logistics           : 3              ,
  drivings            : 4              ,
  maintenances        : 5              ,
  timecards           : 6              ,
};
export const TABLEINDEXTOKEY:ITABLEINDEXES = {
  1                   : 'reports'      ,
  2                   : 'others'       ,
  3                   : 'logistics'    ,
  4                   : 'drivings'     ,
  5                   : 'maintenances' ,
  6                   : 'timecards'    ,
};
export type TESTENUM = ITABLEKEYS&ITABLEINDEXES;

const copyStringToClipboard = (url:string, mimeType?:string):any => {
  document.addEventListener('copy', (e:ClipboardEvent) => {
    Log.l(`FIRED: Document event 'copy', calling callback function.`)
    let type:string = mimeType || 'text/plain';
    e.clipboardData.setData(type, url);
    e.preventDefault();
    Log.l(`copyStringToClipboard(): event is:\n`, e);
    window['onsitecopyclipboardevent'] = e;
    document.removeEventListener('copy', null);
    Log.l(`REMOVED: Document event 'copy' to copy string to clipboard!`)
    // ('copy', this.ClipboardEvent);
  });
  Log.l(`ADDED: Document event listener 'copy'`)
  let millisecondsToWait:number = 500;
  setTimeout(() => {
    Log.l(`ADDED: Document event listener 'copy'`)
    document.execCommand('copy');
  }, millisecondsToWait);
};

type TurboTableExportOptions = {
  selectionOnly   ?: boolean,
  copyToClipboard ?: boolean,
  separator       ?: string ,
};

@IonicPage({name: 'Reports'})
@Component({
  selector: 'page-reports',
  templateUrl: 'reports.html',
})
export class ReportsPage implements OnInit,OnDestroy {
  @ViewChild('reportsContent') reportsContent:Content;
  @ViewChild('dt') dt:Table;
  @ViewChild('othersTable') othersTable:Table;
  @ViewChild('logisticsTable') logisticsTable:Table;
  @ViewChild('drivingsTable') drivingsTable:Table;
  @ViewChild('maintenancesTable') maintenancesTable:Table;
  @ViewChild('timecardsTable') timecardsTable:Table;
  @ViewChild('reportsPanel') reportsPanel:Panel;
  @ViewChild('othersPanel') othersPanel:Panel;
  @ViewChild('logisticsPanel') logisticsPanel:Panel;
  @ViewChild('timecardsPanel') timecardsPanel:Panel;
  @ViewChild('columnSelect') columnSelect:MultiSelect;
  @ViewChild('columnSelectOthers') columnSelectOthers:MultiSelect;
  @ViewChild('columnSelectLogistics') columnSelectLogistics:MultiSelect;
  @ViewChild('columnSelectDriving') columnSelectDriving:MultiSelect;
  @ViewChild('columnSelectMaintenance') columnSelectMaintenance:MultiSelect;
  @ViewChild('columnSelectTimeCards') columnSelectTimeCards:MultiSelect;
  @ViewChild('globalFilterInput') globalFilterInput:ElementRef;
  @ViewChild('globalFilterInputOthers') globalFilterInputOthers:ElementRef;
  @ViewChild('globalFilterInputLogistics') globalFilterInputLogistics:ElementRef;
  @ViewChild('globalFilterInputDriving') globalFilterInputDriving:ElementRef;
  @ViewChild('globalFilterInputMaintenance') globalFilterInputMaintenance:ElementRef;
  @ViewChild('globalFilterInputTimeCards') globalFilterInputTimeCards:ElementRef;
  // @ViewChild('dateFrom') dateFrom:Calendar;
  // @ViewChild('dateTo') dateTo:Calendar;
  @ViewChild('dateRangeCalendar') dateRangeCalendar:Calendar;
  @ViewChild('dateRangeCalendarOthers') dateRangeCalendarOthers:Calendar;
  @ViewChild('dateRangeCalendarLogistics') dateRangeCalendarLogistics:Calendar;
  @ViewChild('dateRangeCalendarDriving') dateRangeCalendarDriving:Calendar;
  @ViewChild('dateRangeCalendarMaintenance') dateRangeCalendarMaintenance:Calendar;
  @ViewChild('dateRangeCalendarTimeCards') dateRangeCalendarTimeCards:Calendar;
  @ViewChild('printArea') printArea:ElementRef;
  @ViewChild('reportsCM1') reportsCM1:ContextMenu;
  @ViewChild('reportsCM2') reportsCM2:ContextMenu;
  @ViewChild('reportsCM3') reportsCM3:ContextMenu;
  @ViewChild('reportsCM4') reportsCM4:ContextMenu;
  @ViewChild('reportsCM5') reportsCM5:ContextMenu;
  @ViewChild('reportsCM6') reportsCM6:ContextMenu;
  public title         : string    = "Reports"                 ;
  public mode          : string    = 'page'                    ;
  public modalMode     : boolean   = false                     ;
  // public moment        : Function  = moment                    ;
  // public faDatabase    : any       = faDatabase                ;
  // public faArrowAltDown: any       = faArrowAltDown            ;
  // public faArrowAltCircleDown:any   = faArrowAltCircleDown     ;
  // public farArrowAltCircleDown:any  = farArrowAltCircleDown    ;
  // public fasArrowAltCircleDown:any  = fasArrowAltCircleDown    ;
  // public faFixedWidth  : boolean   = true                      ;
  // public faSize        : string    = "lg"                      ;
  // public faSize1       : string    = "lg"                      ;
  // public faSize2       : string    = "lg"                      ;
  // public faSize3       : string    = "lg"                      ;
  // public faIcon1Invert : boolean   = false                     ;
  // public faIcon1Transform:string   = "shrink-1"                ;
  // public faIcon2Invert : boolean   = false                     ;
  // public faIcon2Transform:string   = "shrink-6 down-5 right-5" ;
  // public faIcon3Invert : boolean   = false                     ;
  // public faIcon3Transform:string   = "shrink-6 down-5 right-5" ;
  // public faCircleIcon  : string[]  = ['fas', 'circle']         ;
  // public faDBIcon      : string[]  = ['fal', 'database']       ;
  // // public faArrowIcon   : string[]  = ['fal', 'arrow-alt-circle-down'];
  // public faArrowIcon   : string[]  = ['far', 'arrow-alt-circle-down'];
  // public faArrowStyle  : string    = "background: white"       ;
  // public faIcon1Classes: string[]  = ['icon-db']               ;
  // public faIcon2Classes: string[]  = ['icon-download']         ;
  // public faIcon3Classes: string[]  = ['icon-circle']           ;
  // public faIcon1Styles : any = {}                              ;
  // // public faIcon2Styles : any = {'background-color': 'white'}   ;
  // public faIcon2Styles : any = {}                              ;
  // public faIcon3Styles : any = {'color': 'white'}   ;
  // public faLayerClass  : any = ['fa-fw', 'icon-layer-datadl']  ;

  public TABLEINDEX:ITABLEKEYS = {
    reports             : 1              ,
    others              : 2              ,
    logistics           : 3              ,
    drivings            : 4              ,
    maintenances        : 5              ,
    timecards           : 6              ,
  };
  public TABLEINDEXTOKEY:ITABLEINDEXES = {
    1                   : 'reports'      ,
    2                   : 'others'       ,
    3                   : 'logistics'    ,
    4                   : 'drivings'     ,
    5                   : 'maintenances' ,
    6                   : 'timecards'    ,
  };
  public pageSizeOptions:number[]  = [50,100,200,500,1000,2000];
  public dateFormat       : string    = "DD MMM YYYY HH:mm"   ;
  public prefsSub         : Subscription                      ;
  public dataSub          : Subscription                      ;
  public report           : Report                            ;
  public other            : ReportOther                       ;
  public logistic         : ReportLogistics                   ;
  public driving          : ReportDriving                     ;
  public maintenance      : ReportMaintenance                 ;
  public timecard         : ReportTimeCard                    ;
  public tech             : Employee                          ;
  public techs            : Employee[]         = []           ;
  public site             : Jobsite                           ;
  public sites            : Jobsite[]          = []           ;
  public editReports      : Report[]           = []           ;
  public editOthers       : ReportOther[]      = []           ;
  public editLogistics    : ReportLogistics[]  = []           ;
  public editDriving       : ReportDriving[]  = []           ;
  public editMaintenance    : ReportMaintenance[]  = []           ;
  public editTimeCards      : ReportTimeCard[]   = []           ;
  public reports          : Report[]           = []           ;
  public others           : ReportOther[]      = []           ;
  public logistics        : ReportLogistics[]  = []           ;
  public drivings         : ReportDriving[]  = []           ;
  public maintenances     : ReportMaintenance[]  = []           ;
  public timecards        : ReportTimeCard[]   = []           ;
  public selectedReports            : Report[]           = []   ;
  public selectedReportsOther       : ReportOther[]      = []   ;
  public selectedReportsLogistics   : ReportLogistics[]  = []   ;
  public selectedReportsDriving     : ReportDriving[]  = []   ;
  public selectedReportsMaintenance : ReportMaintenance[]  = []   ;
  public selectedTimeCards        : ReportTimeCard[]   = []   ;
  public allReports       : Report[]           = []           ;
  public allOthers        : ReportOther[]      = []           ;
  public allLogistics     : ReportLogistics[]  = []           ;
  public allMaintenances  : ReportMaintenance[]  = []           ;
  public allDrivings      : ReportDriving[]  = []           ;
  public allTimeCards     : ReportTimeCard[]   = []           ;
  public selectedReport   : Report             = null         ;
  public reportViewVisible: boolean            = false        ;
  public reportOtherViewVisible: boolean       = false        ;
  public reportLogisticsViewVisible: boolean   = false        ;
  public reportDrivingViewVisible: boolean   = false        ;
  public reportMaintenanceViewVisible: boolean   = false        ;
  public reportTimeCardViewVisible : boolean   = false        ;
  public globalSearch     : string             = ""           ;
  public fromDate         : Date                              ;
  public toDate           : Date                              ;
  public dateRange        : Date[]             = null         ;
  public fromDates        : Date[]             = []           ;
  public toDates          : Date[]             = []           ;
  public dateRanges       : Date[][]           = [null,null,null,null];
  public fromDateOthers   : Date                              ;
  public toDateOthers     : Date                              ;
  public dateRangeOthers  : Date[]             = null         ;
  public fromDateLogistics : Date                              ;
  public toDateLogistics   : Date                              ;
  public dateRangeLogistics: Date[]             = null         ;
  public fromDateTimeCards   : Date                              ;
  public toDateTimeCards     : Date                              ;
  public dateRangeTimeCards  : Date[]             = null         ;
  public minDateString           : string             = "2017-01-01" ;
  public maxDateString           : string             = "2025-12-31" ;
  public minDateOthersString     : string             = "2017-01-01" ;
  public maxDateOthersString     : string             = "2025-12-31" ;
  public minDateLogisticsString  : string             = "2017-01-01" ;
  public maxDateLogisticsString  : string             = "2025-12-31" ;
  public minDateDrivingString    : string             = "2017-01-01" ;
  public maxDateDrivingString    : string             = "2017-01-01" ;
  public minDateMaintenanceString  : string             = "2025-12-31" ;
  public maxDateMaintenanceString  : string             = "2025-12-31" ;
  public minDateTimeCardsString  : string             = "2017-01-01" ;
  public maxDateTimeCardsString  : string             = "2025-12-31" ;
  public minDate          : Date                              ;
  public maxDate          : Date               = new Date()   ;
  public minDateOthers    : Date                              ;
  public maxDateOthers    : Date                              ;
  public minDateLogistics    : Date               = new Date()   ;
  public maxDateLogistics    : Date               = new Date()   ;
  public minDateDriving      : Date               = new Date()   ;
  public maxDateDriving      : Date               = new Date()   ;
  public minDateMaintenance  : Date               = new Date()   ;
  public maxDateMaintenance  : Date               = new Date()   ;
  public minDateTimeCards    : Date               = new Date()   ;
  public maxDateTimeCards    : Date               = new Date()   ;
  public allFields        : any[]         = []           ;
  public allFieldsOthers  : any[]         = []           ;
  public allFieldsLogistics  : any[]         = []           ;
  public allFieldsDriving      : any[]         = []           ;
  public allFieldsMaintenance  : any[]         = []           ;
  public allFieldsTimeCards  : any[]         = []           ;
  public cols             : any[]         = []           ;
  public selectedColumns  : any[]         = []           ;
  public selectedLabel    : string             = "{0} columns shown";
  public colsOthers             : any[]   = []           ;
  public selectedColumnsOthers  : any[]   = []           ;
  public colsLogistics            : any[]   = []           ;
  public selectedColumnsLogistics : any[]   = []           ;
  public colsDriving              : any[]   = []           ;
  public selectedColumnsDriving   : any[]   = []           ;
  public colsMaintenance          : any[]   = []           ;
  public selectedColumnsMaintenance : any[]   = []           ;
  public colsTimeCards            : any[]   = []           ;
  public selectedColumnsTimeCards : any[]   = []           ;
  public selectedLabelOthers      : string       = "{0} columns shown";
  public selectedLabelLogistics   : string       = "{0} columns shown";
  public selectedLabelDriving     : string       = "{0} columns shown";
  public selectedLabelMaintenance : string       = "{0} columns shown";
  public selectedLabelTimeCards   : string       = "{0} columns shown";
  public styleColIndex    : any                               ;
  public styleColEdit     : any                               ;
  public colsReorder      : boolean            = true         ;
  public autoLayout       : boolean            = true         ;
  public dateTimeout      : any                               ;
  public fromDateTimeout  : any                               ;
  public toDateTimeout    : any                               ;
  public showFilterRow    : boolean         = true            ;
  public showButtonCol    : boolean         = true            ;
  public showTableHead    : boolean         = true            ;
  public showTableFoot    : boolean         = true            ;
  public reportsMenu1     : MenuItem[]      = []              ;
  public reportsMenu2     : MenuItem[]      = []              ;
  public reportsMenu3     : MenuItem[]      = []              ;
  public reportsMenu4     : MenuItem[]      = []              ;
  public reportsMenu5     : MenuItem[]      = []              ;
  public reportsMenu6     : MenuItem[]      = []              ;
  public reportsMultiSortMeta:any;
  public othersMultiSortMeta:any;
  public logisticsMultiSortMeta:any;
  public drivingsMultiSortMeta:any;
  public maintenancesMultiSortMeta:any;
  public timeCardsMultiSortMeta:any;
  public scrollTo:string;
  public scrollDelay:number = 500;

  public dataReady     : boolean            = false ;
  public get filteredCount():number { return this.getFilteredCount(); };
  public get rowCount()   : number { return this.prefs.CONSOLE.pages.reports; };
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.reports = val; };
  public get filteredCountOthers():number { return this.getFilteredCountOthers(); };
  public get filteredCountLogistics():number { return this.getFilteredCountLogistics(); };
  public get filteredCountDriving():number { return this.getFilteredCountDriving(); };
  public get filteredCountMaintenance():number { return this.getFilteredCountMaintenance(); };
  public get filteredCountTimeCards():number { return this.getFilteredCountTimeCards(); };

  constructor(
    public navCtrl   : NavController    ,
    public navParams : NavParams        ,
    public viewCtrl  : ViewController   ,
    // public modalCtrl : ModalController  ,
    public zone      : NgZone           ,
    public prefs     : Preferences      ,
    public db        : DBService        ,
    public dispatch  : DispatchService  ,
    public server    : ServerService    ,
    public data      : OSData           ,
    public alert     : AlertService     ,
    public notify    : NotifyService    ,
    public spinner   : SpinnerService   ,
    public clipboard : ClipboardService ,
  ) {
    window['onsitereports']  = this;
    // window['onsitereports2'] = this;
    window['p'] = this;
    window['_matchCLL'] = _matchCLL;
    window['_matchSite'] = _matchSite;
    window['_matchReportSite'] = _matchReportSite;
  }

  ngOnInit() {
    Log.l('ReportsPage: ngOnInit() fired');
    this.getFields();
    // this.cols = this.getFields();
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportsPage: ngOnDestroy() fired");
    this.cancelSubscriptions();
  }

  public async runWhenReady():Promise<any> {
    let spinnerID;
    try {
      this.initializeSubscriptions();
      this.styleColEdit = {'max-width':'40px', 'width': '40px', 'padding': '0px'};
      this.styleColIndex = {'max-width':'50px', 'width': '50px'};
      if(this.navParams.get('scrollTo') != undefined) {
        this.scrollTo = this.navParams.get('scrollTo');
      }
      let reports:Report[] = this.data.getData('reports');
      let others:ReportOther[] = this.data.getData('others');
      let logistics:ReportLogistics[] = this.data.getData('logistics');
      let maintenances:ReportMaintenance[] = this.data.getData('maintenances');
      let drivings:ReportDriving[] = this.data.getData('drivings');
      let timecards:ReportTimeCard[] = this.data.getData('timecards');
      let sites:Jobsite[] = this.data.getData('sites');
      let techs:Employee[] = this.data.getData('employees');
      this.allReports = reports;
      this.reports = reports.slice(0);
      this.allOthers = others;
      this.others = others.slice(0);
      this.allLogistics = logistics;
      this.logistics = logistics.slice(0);
      this.allMaintenances = maintenances;
      this.maintenances = maintenances.slice(0);
      this.allDrivings = drivings;
      this.drivings = drivings.slice(0);
      this.allTimeCards = timecards;
      this.timecards = timecards.slice(0);
      this.sites = sites;
      this.techs = techs;

      this.updatePageSizes();
      this.createContextMenus();

      if(!reports.length) {
        // Log.l(`Reports: no reports found. Retrieving reports from database...`);
        // spinnerID = await this.alert.showSpinnerPromise('Reports not loaded, now loading reports...');
        // let confirm:boolean = await this.alert.showConfirmYesNo('EMPTY REPORTS', 'Reports not loaded. Do you want to load reports from database before continuing?');
        // if(confirm) {
        //   let res:any = await this.getReports();
        // }
      }
      if(!others.length) {
        // Log.l(`Reports: no misc reports found. Retrieving misc reports from database...`);
        // spinnerID = await this.alert.showSpinnerPromise('Reports not loaded, now loading reports...');
        // let confirm:boolean = await this.alert.showConfirmYesNo('EMPTY MISC REPORTS', 'Miscellaneous reports not loaded. Do you want to load miscellaneous reports from database before continuing?');
        // if(confirm) {
        //   let res:any = await this.getOthers();
        // }
      }
      if(!logistics.length) {
        // Log.l(`Reports: no logistics reports found. Retrieving logistics reports from database...`);
        // spinnerID = await this.alert.showSpinnerPromise('Reports not loaded, now loading reports...');
        // let confirm:boolean = await this.alert.showConfirmYesNo('EMPTY LOGISTICS REPORTS', 'Logistics reports not loaded. Do you want to load logistics reports from database before continuing?');
        // if(confirm) {
        //   let res:any = await this.getLogistics();
        // }
      }
      if(!timecards.length) {
        // Log.l(`Reports: no timecard reports found. Retrieving timecard reports from database...`);
        // spinnerID = await this.alert.showSpinnerPromise('Reports not loaded, now loading reports...');
        // let confirm:boolean = await this.alert.showConfirmYesNo('EMPTY TIME CARD REPORTS', 'Time cards not loaded. Do you want to load time cards from database before continuing?');
        // if(confirm) {
        //   let res:any = await this.getTimeCards();
        // }
      }
      this.getFields();
      // this.colsOthers = this.getOthersFields();
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.dataReady = true;
      this.setPageLoaded();
      setTimeout(() => {
        this.scrollToTargetPanel();
      }, this.scrollDelay);
      return true;
    } catch(err) {
      Log.l(`ReportsPage.runWhenReady(): Error getting reports and initializing data!`);
      Log.e(err);
      // let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public initializeSubscriptions() {
    // this.dataSub = this.dispatch.updatedFromDB().subscribe((eventdata:{type:string, payload?:any}) => {
    //   // Log.l(`appSubscription: received event:\n`, data);
    //   if(eventdata) {
    //     let dbtype:string = eventdata.type;
    //     let payload:any =  eventdata && eventdata.payload ? eventdata.payload : null;
    //     if(dbtype === 'reports') {
          
    //     } else if(dbtype === '')
    //   }
    // });
  }

  public cancelSubscriptions() {
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public moment(value:Date|Moment):Moment {
    let mo:Moment = moment(value);
    return mo;
  }

  public async scrollToTargetPanel():Promise<any> {
    try {
      if(this.reportsContent && this.scrollTo && typeof this.scrollTo === 'string') {
        Log.l(`scrollToTargetPanel(): Now attempting to scroll to target:\n`, this.scrollTo);
        let targetName:string = this.scrollTo;
      //  && this.scrollTo instanceof HTMLElement) {
        let target:HTMLElement;
        let panel:Panel;
        if(targetName === 'reports') {
          panel = this.reportsPanel;
        } else if(targetName === 'others') {
          panel = this.othersPanel;
        } else if(targetName === 'logistics') {
          panel = this.logisticsPanel;

        } else if(targetName === 'timecards') {
          panel = this.timecardsPanel;
        } else {
          Log.w(`Reports.runWhenReady(): 'scrollTo' was provided, but was invalid:`, targetName);
        }
        if(panel) {
          target = panel.getBlockableElement();
          if(target instanceof HTMLElement) {
            let scroller:HTMLElement = this.reportsContent.getScrollElement();
            target.scrollIntoView();
            if(scroller && scroller instanceof HTMLElement) {
              scroller.scrollBy(0, -10);
            }
          }
        }
      } else if(this.scrollTo) {
        Log.w(`scrollToTargetPanel(): target specified but could not scroll to it:\n`, this.scrollTo);
      } else {
        Log.l(`scrollToTargetPanel(): Target panel not specified.`);
      }
    } catch(err) {
      Log.l(`scrollToTargetPanel(): Error scrolling to target panel:\n`, this.scrollTo);
      Log.e(err);
      throw err;
    }
  }

  public createContextMenus() {
    this.reportsMenu1 = [
      { label: 'Update Work Reports …', icon: 'fal fa-edit', command: (event) => { this.updateReports(TABLEINDEX.reports, event); } },
    ];
    this.reportsMenu2 = [
      { label: 'Update Misc Reports …', icon: 'fal fa-edit', command: (event) => { this.updateReports(TABLEINDEX.others, event); } },
    ];
    this.reportsMenu3 = [
      { label: 'Update Logistics Reports …', icon: 'fal fa-edit', command: (event) => { this.updateReports(TABLEINDEX.logistics, event); } },
    ];
    this.reportsMenu4 = [
      { label: 'Update Maintenance Reports …', icon: 'fal fa-edit', command: (event) => { this.updateReports(TABLEINDEX.maintenances, event); } },
    ];
    this.reportsMenu5 = [
      { label: 'Update Driving Reports …', icon: 'fal fa-edit', command: (event) => { this.updateReports(TABLEINDEX.drivings, event); } },
    ];
    this.reportsMenu6 = [
      { label: 'Update TimeCards …', icon: 'fal fa-edit', command: (event) => { this.updateReports(TABLEINDEX.timecards, event); } },
    ];
  }

  public async updateReports(val:TableIndexKey, event?:any):Promise<any> {
    try {
      Log.l(`updateReports(${val}): Event is:`, event);
      // return res;
    } catch(err) {
      Log.l(`updateReports(${val}): Error updating reports`);
      Log.e(err);
      // throw err;
    }
  }

  public async possibleUpdateReports(type:TableIndexKey, evt?:Event):Promise<any> {
    try {
      let typeKey = TABLEINDEXTOKEY[type];
      Log.l(`possibleUpdateReports(): Called for type '${type}', which should be table '${typeKey}'`);
      if(type == TABLEINDEX.reports) {
        let dbname:string = this.prefs.getDB('reports');
        let count:number = await this.db.getDocCount(dbname);
        count = count > 7 ? count - 7 : count;
        let confirm:boolean = await this.alert.showConfirmYesNo('LOAD WORK REPORTS', `Do you want to load all ${count} work reports from database?`);
        if(confirm) {
          let res:any = await this.getReports();
        }
      } else if(type == TABLEINDEX.others) {
        let dbname:string = this.prefs.getDB('reports_other');
        let count:number = await this.db.getDocCount(dbname);
        count = count > 7 ? count - 7 : count;
        let confirm:boolean = await this.alert.showConfirmYesNo('LOAD MISC REPORTS', `Do you want to load all ${count} miscellaneous reports from database?`);
        if(confirm) {
          let res:any = await this.getOthers();
        }
      } else if(type == TABLEINDEX.logistics) {
        let dbname:string = this.prefs.getDB('logistics');
        let count:number = await this.db.getDocCount(dbname);
        count = count > 7 ? count - 7 : count;
        let confirm:boolean = await this.alert.showConfirmYesNo('LOAD LOGISTICS REPORTS', `Do you want to load all ${count} logistics reports from database?`);
        if(confirm) {
          let res:any = await this.getLogistics();
        }
      } else if(type == TABLEINDEX.maintenances) {
        let dbname:string = this.prefs.getDB('maintenances');
        let count:number = await this.db.getDocCount(dbname);
        count = count > 7 ? count - 7 : count;
        let confirm:boolean = await this.alert.showConfirmYesNo('LOAD MAINTENANCE REPORTS', `Do you want to load all ${count} maintenance reports from database?`);
        if(confirm) {
          let res:any = await this.getMaintenances();
        }
      } else if(type == TABLEINDEX.drivings) {
        let dbname:string = this.prefs.getDB('drivings');
        let count:number = await this.db.getDocCount(dbname);
        count = count > 7 ? count - 7 : count;
        let confirm:boolean = await this.alert.showConfirmYesNo('LOAD DRIVING REPORTS', `Do you want to load all ${count} driving reports from database?`);
        if(confirm) {
          let res:any = await this.getDrivings();
        }
      } else if(type == TABLEINDEX.timecards) {
        let dbname:string = this.prefs.getDB('timecards');
        let count:number = await this.db.getDocCount(dbname);
        count = count > 7 ? count - 7 : count;
        let confirm:boolean = await this.alert.showConfirmYesNo('LOAD TIME CARDS', `Do you want to load all ${count} time cards from database?`);
        if(confirm) {
          let res:any = await this.getTimeCards();
        }
      } else {
        Log.w(`possibleUpdateReports(): Type is not valid:`, type);
      }
    } catch(err) {
      Log.l(`possibleUpdateReports(): Error running with arguments:`, arguments);
      Log.e(err);
      throw err;
    }
  }


  public updatePageSizes() {
    let newPageSizes = this.prefs.getTablePageSizes('reports');
    // let rowCount = Number(this.prefs.CONSOLE.pages.reports);
    let rowCount = this.prefs.getTablePageSize('reports');
    if(newPageSizes.indexOf(rowCount) === -1) {
      newPageSizes.push(rowCount);
      this.pageSizeOptions = newPageSizes.slice(0).sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
      this.rowCount = rowCount;
    } else {
      this.pageSizeOptions = newPageSizes.slice(0);
      this.rowCount = rowCount;
    }
  }

  public getFields() {
    this.getReportsFields();
    this.getOthersFields();
    this.getLogisticsFields();
    this.getMaintenanceFields();
    this.getDrivingFields();
    this.getTimeCardsFields();
  }

  public resetTableSorted(tableNumber:TableIndexKey, dt:Table) {
    let sortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    if(tableNumber === TABLEINDEX.reports) {
      this.reportsMultiSortMeta = sortMeta.slice(0);
    } else if(tableNumber === TABLEINDEX.others) {
      this.othersMultiSortMeta = sortMeta.slice(0);
    } else if(tableNumber === TABLEINDEX.logistics) {
      this.logisticsMultiSortMeta = sortMeta.slice(0);
    } else if(tableNumber === TABLEINDEX.maintenances) {
      this.maintenancesMultiSortMeta = sortMeta.slice(0);
    } else if(tableNumber === TABLEINDEX.drivings) {
      this.drivingsMultiSortMeta = sortMeta.slice(0);
    } else if(tableNumber === TABLEINDEX.timecards) {
      this.timeCardsMultiSortMeta = sortMeta.slice(0);
    } else {
      let text:string = `resetTableSorted(): Could not find table at index '${tableNumber}' to reset it with sorting`;
      Log.w(text);
      this.notify.addWarning("TABLE RESET ERROR", text, 5000);
      return;
    }
  }

  public getReportsFields():any[] {
    let fields:any[] = [
      { field: '_id'              , header: 'ID'          , filter: true, filterPlaceholder: "ID"          , order:  1 , show: true , style: "", class: "col-nowrap col-00 col-id"        , format: ""      , tooltip: "ID"          , },
      { field: 'report_date'      , header: 'Date'        , filter: true, filterPlaceholder: "Date"        , order:  2 , show: true , style: "", class: "col-wrap   col-01 col-date"      , format: ""      , tooltip: "Date"        , },
      { field: 'timestamp'        , header: "Timestamp"   , filter: true, filterPlaceholder: "Timestamp"   , order:  3 , show: true , style: "", class: "col-wrap   col-02 col-time"      , format: ""      , tooltip: "Timestamp"   , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true, filterPlaceholder: "Last Name"   , order:  4 , show: true , style: "", class: "col-wrap   col-03 col-last"      , format: ""      , tooltip: "Last Name"   , },
      { field: 'first_name'       , header: 'First Name'  , filter: true, filterPlaceholder: "First Name"  , order:  5 , show: true , style: "", class: "col-wrap   col-04 col-first"     , format: ""      , tooltip: "First Name"  , },
      { field: 'time_start'       , header: 'Start'       , filter: true, filterPlaceholder: "Start"       , order:  6 , show: true , style: "", class: "col-wrap   col-05 col-start"     , format: "HH:mm" , tooltip: "Start"       , },
      { field: 'time_end'         , header: 'End'         , filter: true, filterPlaceholder: "End"         , order:  7 , show: true , style: "", class: "col-wrap   col-06 col-end"       , format: "HH:mm" , tooltip: "End"         , },
      { field: 'repair_hours'     , header: 'Hrs'         , filter: true, filterPlaceholder: "Hrs"         , order:  8 , show: true , style: "", class: "col-wrap   col-07 col-hours"     , format: ""      , tooltip: "Repair hours", },
      { field: 'client'           , header: 'Client'      , filter: true, filterPlaceholder: "Client"      , order:  9 , show: true , style: "", class: "col-wrap   col-08 col-cli"       , format: ""      , tooltip: "Client"      , },
      { field: 'location'         , header: 'Location'    , filter: true, filterPlaceholder: "Location"    , order: 10 , show: true , style: "", class: "col-wrap   col-09 col-loc"       , format: ""      , tooltip: "Location"    , },
      { field: 'location_id'      , header: 'LocID'       , filter: true, filterPlaceholder: "LocID"       , order: 11 , show: true , style: "", class: "col-wrap   col-10 col-lid"       , format: ""      , tooltip: "LocID"       , },
      { field: 'unit_number'      , header: 'Unit #'      , filter: true, filterPlaceholder: "Unit #"      , order: 12 , show: true , style: "", class: "col-nowrap col-11 col-unitno"    , format: ""      , tooltip: "Unit #"      , },
      { field: 'work_order_number', header: 'Work Order'  , filter: true, filterPlaceholder: "WO #"        , order: 13 , show: true , style: "", class: "col-nowrap col-12 col-wonum"     , format: ""      , tooltip: "WO #"        , },
      { field: 'notes'            , header: 'Notes'       , filter: true, filterPlaceholder: "Notes"       , order: 14 , show: true , style: "", class: "col-nowrap col-13 col-notes"     , format: ""      , tooltip: "Notes"       , },
      { field: 'site_number'      , header: 'Site#'       , filter: true, filterPlaceholder: "Site#"       , order: 15 , show: false, style: "", class: "col-nowrap col-14 col-sitenum"   , format: ""      , tooltip: "Site#"       , },
      { field: 'workSite'         , header: 'Site'        , filter: true, filterPlaceholder: "Site"        , order: 16 , show: false, style: "", class: "col-nowrap col-15 col-worksite"  , format: ""      , tooltip: "Site"        , },
      { field: 'change_log'       , header: 'Log'         , filter: true, filterPlaceholder: "Log"         , order: 17 , show: false, style: "", class: "col-nowrap col-16 col-changelog" , format: ""      , tooltip: "Log"         , },
      { field: 'flagged_fields'   , header: 'Flags'       , filter: true, filterPlaceholder: "Flags"       , order: 18 , show: false, style: "", class: "col-nowrap col-17 col-flgd"      , format: ""      , tooltip: "Flags"       , },
      { field: 'preauthed'        , header: 'Preauthed'   , filter: true, filterPlaceholder: "Preauthed"   , order: 19 , show: false, style: "", class: "col-nowrap col-18  col-preauthed" , format: ""      , tooltip: "Preauthed"   , },
      { field: 'preauth_dates'    , header: 'PA Dates'    , filter: true, filterPlaceholder: "PA Dates"    , order: 20 , show: false, style: "", class: "col-nowrap col-19 col-padates"   , format: ""      , tooltip: "PA Dates"    , },
      { field: 'invoiced'         , header: 'Invoiced'    , filter: true, filterPlaceholder: "Invoiced"    , order: 21 , show: false, style: "", class: "col-nowrap col-20 col-invoiced"  , format: ""      , tooltip: "Invoiced"    , },
      { field: 'invoiced_dates'   , header: 'Inv Dates'   , filter: true, filterPlaceholder: "Inv Dates"   , order: 22 , show: false, style: "", class: "col-nowrap col-21 col-invdates"  , format: ""      , tooltip: "Inv Dates"   , },
      { field: 'invoice_numbers'  , header: 'Inv #\'s'    , filter: true, filterPlaceholder: "Inv #'s"     , order: 23 , show: false, style: "", class: "col-nowrap col-22 col-invno"     , format: ""      , tooltip: "Inv #'s"     , },
    ];
    this.allFields = fields;
    this.cols      = fields;
    let initialColumns = [
      "_id"               ,
      "report_date"       ,
      "timestamp"         ,
      "last_name"         ,
      "first_name"        ,
      "time_start"        ,
      "time_end"          ,
      "repair_hours"      ,
      "client"            ,
      "location"          ,
      "location_id"       ,
      "unit_number"       ,
      "work_order_number" ,
      "notes"             ,
    ];
    let visibleCols = this.cols.filter((a:any) => {
      // let field:string = a.field ? a.field : "";
      // if(field && initialColumns.indexOf(field) > -1) {
      //   return true;
      // } else {
      //   return false;
      // }
      return a.show;
    });
    // this.selectedColumns = initialColumns;
    this.selectedColumns = visibleCols;
    this.columnsChanged();
    this.reportsMultiSortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    return fields;
  }

  public columnsChanged(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    // // let cols = this.cols;
    // Log.l("columnsChanged(): Items now selected:\n", vCols);
    // // let sel = [];
    // // let sel = this.allFields.filter((a:any) => {
    // //   return (vCols.indexOf(a.field) > -1);
    // // }).sort((a: any, b: any) => {
    // //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // // });
    // // Log.l("columnsChanged(): Items selected via string:\n", sel);
    // // // this.displayColumns = [];
    // // // this.displayColumns = oo.clone(sel);
    // // // this.cols = oo.clone(sel);
    // // this.cols = sel;
    // // this.displayColumns = [];
    // // for(let item of sel) {
    // //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    // //   this.displayColumns.push(oo.clone(item));
    // //   // let i = dc.findIndex((a:any) => {
    // //   //   return (a.field === item['field']);
    // //   // });
    // //   // if(i === -1) {
    // //   //   dc = [...dc, item];
    // //   // }
    // // }
    this.selectedColumns = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChanged(): Now field list is:\n", this.cols);
    if(this.columnSelect) {
      this.columnSelect.updateLabel();
    }
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public getOthersFields():any[] {
    let fields:any[] = [
      { field: '_id'              , header: 'ID'          , filter: true , filterPlaceholder: "ID"          , order:  1 , show: true , style: "", class: "col-nowrap col-00 col-id"       , format: ""      , tooltip: "ID"              , },
      { field: 'report_date'      , header: 'Date'        , filter: true , filterPlaceholder: "Date"        , order:  2 , show: true , style: "", class: "col-wrap   col-01 col-date"     , format: "YYYY-MM-DD"      , tooltip: "Date"            , },
      { field: 'type'             , header: 'Type'        , filter: true , filterPlaceholder: "Type"        , order:  3 , show: true , style: "", class: "col-wrap   col-02 col-type"     , format: ""      , tooltip: "Report Type"     , },
      { field: 'timestamp'        , header: "Timestamp"   , filter: true , filterPlaceholder: "Timestamp"   , order:  4 , show: true , style: "", class: "col-wrap   col-03 col-time"     , format: ""      , tooltip: "Timestamp"       , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true , filterPlaceholder: "Last Name"   , order:  5 , show: true , style: "", class: "col-wrap   col-04 col-last"     , format: ""      , tooltip: "Last Name"       , },
      { field: 'first_name'       , header: 'First Name'  , filter: true , filterPlaceholder: "First Name"  , order:  6 , show: true , style: "", class: "col-wrap   col-05 col-first"    , format: ""      , tooltip: "First Name"      , },
      { field: 'time'             , header: 'Hrs'         , filter: true , filterPlaceholder: "Hrs"         , order:  7 , show: true , style: "", class: "col-wrap   col-06 col-hours"    , format: ""      , tooltip: "Repair hours"    , },
      { field: 'training_type'    , header: 'Trn. Type'   , filter: true , filterPlaceholder: "Trn. Type"   , order:  8 , show: true , style: "", class: "col-nowrap col-07 col-training" , format: ""      , tooltip: "Training Type"   , },
      { field: 'travel_location'  , header: 'Travel Loc.' , filter: true , filterPlaceholder: "Travel Loc." , order:  9 , show: true , style: "", class: "col-nowrap col-08 col-travel"   , format: ""      , tooltip: "Travel Location" , },
      { field: 'site_number'      , header: 'Site#'       , filter: true , filterPlaceholder: "Site#"       , order: 10 , show: true , style: "", class: "col-nowrap col-09 col-sitenum"  , format: ""      , tooltip: "Site#"           , },
      { field: 'notes'            , header: 'Notes'       , filter: true , filterPlaceholder: "Notes"       , order: 11 , show: false, style: "", class: "col-nowrap col-10 col-notes"    , format: ""      , tooltip: "Notes"           , },
      { field: 'client'           , header: 'Client'      , filter: true , filterPlaceholder: "Client"      , order: 12 , show: false, style: "", class: "col-nowrap col-11 col-client"   , format: ""      , tooltip: "Client"          , },
      { field: 'location'         , header: 'Location'    , filter: true , filterPlaceholder: "Location"    , order: 13 , show: false, style: "", class: "col-nowrap col-12 col-location" , format: ""      , tooltip: "Location"        , },
      { field: 'location_id'      , header: 'LocID'       , filter: true , filterPlaceholder: "Location ID" , order: 14 , show: false, style: "", class: "col-nowrap col-13 col-locid"    , format: ""      , tooltip: "Location ID"     , },
      { field: 'flags'            , header: 'Flags'       , filter: false, filterPlaceholder: "Flags"       , order: 15 , show: false, style: "", class: "col-nowrap col-14 col-flags"    , format: ""      , tooltip: "Number of flags" , },
    ];
    this.allFieldsOthers = fields;
    this.colsOthers      = fields;
    // let initialColumns = [
    //   "_id"               ,
    //   "report_date"       ,
    //   "timestamp"         ,
    //   "last_name"         ,
    //   "first_name"        ,
    //   "time_start"        ,
    //   "time_end"          ,
    //   "repair_hours"      ,
    //   "client"            ,
    //   "location"          ,
    //   "location_id"       ,
    //   "unit_number"       ,
    //   "work_order_number" ,
    //   "notes"             ,
    // ];
    // let visibleCols = this.cols.filter((a:any) => {
    //   let field:string = a.field ? a.field : "";
    //   if(field && initialColumns.indexOf(field) > -1) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });
    // // this.selectedColumns = initialColumns;
    // this.selectedColumns = visibleCols;
    this.selectedColumnsOthers = fields.filter(a => {
      // return a.field !== 'notes' && a.field !== 'client' && a.field !== 'location' && a.field !== 'location_id';
      return a.show;
    });
    this.columnsChangedOthers();
    this.othersMultiSortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    return fields;
  }

  public columnsChangedOthers(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumnsOthers;
    // // let cols = this.cols;
    // Log.l("columnsChangedOthers(): Items now selected:\n", vCols);
    // // let sel = [];
    // // let sel = this.allFields.filter((a:any) => {
    // //   return (vCols.indexOf(a.field) > -1);
    // // }).sort((a: any, b: any) => {
    // //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // // });
    // // Log.l("columnsChanged(): Items selected via string:\n", sel);
    // // // this.displayColumns = [];
    // // // this.displayColumns = oo.clone(sel);
    // // // this.cols = oo.clone(sel);
    // // this.cols = sel;
    // // this.displayColumns = [];
    // // for(let item of sel) {
    // //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    // //   this.displayColumns.push(oo.clone(item));
    // //   // let i = dc.findIndex((a:any) => {
    // //   //   return (a.field === item['field']);
    // //   // });
    // //   // if(i === -1) {
    // //   //   dc = [...dc, item];
    // //   // }
    // // }
    this.selectedColumnsOthers = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChangedOthers(): Now field list is:\n", this.colsOthers);
    if(this.columnSelectOthers) {
      this.columnSelectOthers.updateLabel();
    }
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public getLogisticsFields():any[] {
    let fields:any[] = [
      { field: '_id'              , header: 'ID'          , filter: true , filterPlaceholder: "ID"          , order:  1 , style: "", class: "col-nowrap col-00 col-id"       , format: ""      , tooltip: "ID"              , },
      { field: 'report_date'      , header: 'Date'        , filter: true , filterPlaceholder: "Date"        , order:  2 , style: "", class: "col-wrap   col-01 col-date"     , format: "YYYY-MM-DD"      , tooltip: "Date"            , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true , filterPlaceholder: "Last Name"   , order:  3 , style: "", class: "col-wrap   col-02 col-last"     , format: ""      , tooltip: "Last Name"       , },
      { field: 'first_name'       , header: 'First Name'  , filter: true , filterPlaceholder: "First Name"  , order:  4 , style: "", class: "col-wrap   col-03 col-first"    , format: ""      , tooltip: "First Name"      , },
      { field: 'startTime'        , header: 'Start Time'  , filter: true , filterPlaceholder: "Start Time"  , order:  5 , style: "", class: "col-wrap   col-04 col-start"    , format: "MMM DD YYYY HH:mm"      , tooltip: "Start Time"      , },
      { field: 'endTime'          , header: 'Dest Time'   , filter: true , filterPlaceholder: "Dest Time"   , order:  6 , style: "", class: "col-wrap   col-05 col-end"      , format: "MMM DD YYYY HH:mm"      , tooltip: "Destination Time", },
      { field: 'finalTime'        , header: 'Final Time'  , filter: true , filterPlaceholder: "Final Time"  , order:  7 , style: "", class: "col-wrap   col-06 col-final"    , format: "MMM DD YYYY HH:mm"      , tooltip: "Final Time"      , },
      { field: 'startMiles'       , header: 'Start Miles' , filter: true , filterPlaceholder: "Start Miles" , order:  8 , style: "", class: "col-wrap   col-07 col-startm"   , format: ""      , tooltip: "Start Miles"      , },
      { field: 'endMiles'         , header: 'Dest Miles'  , filter: true , filterPlaceholder: "Dest Miles"  , order:  9 , style: "", class: "col-wrap   col-08 col-endm"     , format: ""      , tooltip: "Destination Miles", },
      { field: 'finalMiles'       , header: 'Final Miles' , filter: true , filterPlaceholder: "Final Miles" , order:  10, style: "", class: "col-wrap   col-09 col-finalm"   , format: ""      , tooltip: "Final Miles"      , },
      { field: 'fromLocation'     , header: 'From Loc.'   , filter: false, filterPlaceholder: "From"        , order:  11, style: "", class: "col-wrap   col-10 col-fromloc"  , format: ""      , tooltip: "From Location"    , type: "location" },
      { field: 'toLocation'       , header: 'To Loc.'     , filter: false, filterPlaceholder: "To"          , order:  12, style: "", class: "col-wrap   col-11 col-toloc"    , format: ""      , tooltip: "To Location"      , type: "location" },
      { field: 'finalLocation'    , header: 'Final Loc.'  , filter: false, filterPlaceholder: "Final"       , order:  13, style: "", class: "col-wrap   col-12 col-finalloc" , format: ""      , tooltip: "Final Location"   , type: "location" },
      { field: 'notes'            , header: 'Notes'       , filter: true , filterPlaceholder: "Notes"       , order:  14, style: "", class: "col-wrap   col-13 col-notes"    , format: ""      , tooltip: "Notes"            , },
    ];
    this.allFieldsLogistics = fields;
    this.colsLogistics      = fields;
    this.selectedColumnsLogistics = fields;
    this.columnsChangedLogistics();
    this.logisticsMultiSortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    return fields;
  }

  public columnsChangedLogistics(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumnsLogistics;
    // let cols = this.cols;
    // Log.l("columnsChangedLogistics(): Items now selected:\n", vCols);
    this.selectedColumnsLogistics = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChangedLogistics(): Now field list is:\n", this.colsLogistics);
    if(this.columnSelectLogistics) {
      this.columnSelectLogistics.updateLabel();
    }
  }

  public getMaintenanceFields():any[] {
    let fields:any[] = [
      { field: '_id'              , header: 'ID'          , filter: true , filterPlaceholder: "ID"          , order:  1 , style: "", class: "col-nowrap col-00 col-id"       , format: ""      , tooltip: "ID"              , },
      { field: 'report_date'      , header: 'Date'        , filter: true , filterPlaceholder: "Date"        , order:  2 , style: "", class: "col-wrap   col-01 col-date"     , format: "YYYY-MM-DD"      , tooltip: "Date"            , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true , filterPlaceholder: "Last Name"   , order:  3 , style: "", class: "col-wrap   col-02 col-last"     , format: ""      , tooltip: "Last Name"       , },
      { field: 'first_name'       , header: 'First Name'  , filter: true , filterPlaceholder: "First Name"  , order:  4 , style: "", class: "col-wrap   col-03 col-first"    , format: ""      , tooltip: "First Name"      , },
      // { field: 'startTime'        , header: 'Start Time'  , filter: true , filterPlaceholder: "Start Time"  , order:  5 , style: "", class: "col-wrap   col-04 col-start"    , format: "MMM DD YYYY HH:mm"      , tooltip: "Start Time"      , },
      // { field: 'endTime'          , header: 'Dest Time'   , filter: true , filterPlaceholder: "Dest Time"   , order:  6 , style: "", class: "col-wrap   col-05 col-end"      , format: "MMM DD YYYY HH:mm"      , tooltip: "Destination Time", },
      // { field: 'finalTime'        , header: 'Final Time'  , filter: true , filterPlaceholder: "Final Time"  , order:  7 , style: "", class: "col-wrap   col-06 col-final"    , format: "MMM DD YYYY HH:mm"      , tooltip: "Final Time"      , },
      // { field: 'startMiles'       , header: 'Start Miles' , filter: true , filterPlaceholder: "Start Miles" , order:  8 , style: "", class: "col-wrap   col-07 col-startm"   , format: ""      , tooltip: "Start Miles"      , },
      // { field: 'endMiles'         , header: 'Dest Miles'  , filter: true , filterPlaceholder: "Dest Miles"  , order:  9 , style: "", class: "col-wrap   col-08 col-endm"     , format: ""      , tooltip: "Destination Miles", },
      // { field: 'finalMiles'       , header: 'Final Miles' , filter: true , filterPlaceholder: "Final Miles" , order:  10, style: "", class: "col-wrap   col-09 col-finalm"   , format: ""      , tooltip: "Final Miles"      , },
      // { field: 'fromLocation'     , header: 'From Loc.'   , filter: false, filterPlaceholder: "From"        , order:  11, style: "", class: "col-wrap   col-10 col-fromloc"  , format: ""      , tooltip: "From Location"    , type: "location" },
      // { field: 'toLocation'       , header: 'To Loc.'     , filter: false, filterPlaceholder: "To"          , order:  12, style: "", class: "col-wrap   col-11 col-toloc"    , format: ""      , tooltip: "To Location"      , type: "location" },
      // { field: 'finalLocation'    , header: 'Final Loc.'  , filter: false, filterPlaceholder: "Final"       , order:  13, style: "", class: "col-wrap   col-12 col-finalloc" , format: ""      , tooltip: "Final Location"   , type: "location" },
      { field: 'notes'            , header: 'Notes'       , filter: true , filterPlaceholder: "Notes"       , order:  14, style: "", class: "col-wrap   col-13 col-notes"    , format: ""      , tooltip: "Notes"            , },
    ];
    this.allFieldsMaintenance = fields;
    this.colsMaintenance      = fields;
    this.selectedColumnsMaintenance = fields;
    this.columnsChangedMaintenance();
    this.maintenancesMultiSortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    return fields;
  }

  public columnsChangedMaintenance(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumnsMaintenance;
    // let cols = this.cols;
    // Log.l("columnsChangedMaintenance(): Items now selected:\n", vCols);
    this.selectedColumnsMaintenance = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChangedMaintenance(): Now field list is:\n", this.colsMaintenance);
    if(this.columnSelectMaintenance) {
      this.columnSelectMaintenance.updateLabel();
    }
  }

  public getDrivingFields():any[] {
    let fields:any[] = [
      { field: '_id'              , header: 'ID'          , filter: true , filterPlaceholder: "ID"          , order:  1 , style: "", class: "col-nowrap col-00 col-id"       , format: ""      , tooltip: "ID"              , },
      { field: 'report_date'      , header: 'Date'        , filter: true , filterPlaceholder: "Date"        , order:  2 , style: "", class: "col-wrap   col-01 col-date"     , format: "YYYY-MM-DD"      , tooltip: "Date"            , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true , filterPlaceholder: "Last Name"   , order:  3 , style: "", class: "col-wrap   col-02 col-last"     , format: ""      , tooltip: "Last Name"       , },
      { field: 'first_name'       , header: 'First Name'  , filter: true , filterPlaceholder: "First Name"  , order:  4 , style: "", class: "col-wrap   col-03 col-first"    , format: ""      , tooltip: "First Name"      , },
      { field: 'startTime'        , header: 'Start Time'  , filter: true , filterPlaceholder: "Start Time"  , order:  5 , style: "", class: "col-wrap   col-04 col-start"    , format: "MMM DD YYYY HH:mm"      , tooltip: "Start Time"      , },
      { field: 'endTime'          , header: 'Dest Time'   , filter: true , filterPlaceholder: "Dest Time"   , order:  6 , style: "", class: "col-wrap   col-05 col-end"      , format: "MMM DD YYYY HH:mm"      , tooltip: "Destination Time", },
      { field: 'finalTime'        , header: 'Final Time'  , filter: true , filterPlaceholder: "Final Time"  , order:  7 , style: "", class: "col-wrap   col-06 col-final"    , format: "MMM DD YYYY HH:mm"      , tooltip: "Final Time"      , },
      { field: 'startMiles'       , header: 'Start Miles' , filter: true , filterPlaceholder: "Start Miles" , order:  8 , style: "", class: "col-wrap   col-07 col-startm"   , format: ""      , tooltip: "Start Miles"      , },
      { field: 'endMiles'         , header: 'Dest Miles'  , filter: true , filterPlaceholder: "Dest Miles"  , order:  9 , style: "", class: "col-wrap   col-08 col-endm"     , format: ""      , tooltip: "Destination Miles", },
      { field: 'finalMiles'       , header: 'Final Miles' , filter: true , filterPlaceholder: "Final Miles" , order:  10, style: "", class: "col-wrap   col-09 col-finalm"   , format: ""      , tooltip: "Final Miles"      , },
      { field: 'fromLocation'     , header: 'From Loc.'   , filter: false, filterPlaceholder: "From"        , order:  11, style: "", class: "col-wrap   col-10 col-fromloc"  , format: ""      , tooltip: "From Location"    , type: "location" },
      { field: 'toLocation'       , header: 'To Loc.'     , filter: false, filterPlaceholder: "To"          , order:  12, style: "", class: "col-wrap   col-11 col-toloc"    , format: ""      , tooltip: "To Location"      , type: "location" },
      { field: 'finalLocation'    , header: 'Final Loc.'  , filter: false, filterPlaceholder: "Final"       , order:  13, style: "", class: "col-wrap   col-12 col-finalloc" , format: ""      , tooltip: "Final Location"   , type: "location" },
      { field: 'notes'            , header: 'Notes'       , filter: true , filterPlaceholder: "Notes"       , order:  14, style: "", class: "col-wrap   col-13 col-notes"    , format: ""      , tooltip: "Notes"            , },
    ];
    this.allFieldsDriving = fields;
    this.colsDriving      = fields;
    this.selectedColumnsDriving = fields;
    this.columnsChangedDriving();
    this.drivingsMultiSortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    return fields;
  }

  public columnsChangedDriving(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumnsDriving;
    // let cols = this.cols;
    // Log.l("columnsChangedDriving(): Items now selected:\n", vCols);
    this.selectedColumnsDriving = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChangedMaintenance(): Now field list is:\n", this.colsDriving);
    if(this.columnSelectDriving) {
      this.columnSelectDriving.updateLabel();
    }
  }

  public getTimeCardsFields():any[] {
    let fields:any[] = [
      { field: '_id'              , header: 'ID'          , filter: true, filterPlaceholder: "ID"          , order:  1 , style: "", class: "col-nowrap col-00 col-id"       , format: ""      , tooltip: "ID"              , },
      { field: 'report_date'      , header: 'Date'        , filter: true, filterPlaceholder: "Date"        , order:  2 , style: "", class: "col-wrap   col-01 col-date"     , format: "YYYY-MM-DD"      , tooltip: "Date"            , },
      { field: 'last_name'        , header: 'Last Name'   , filter: true, filterPlaceholder: "Last Name"   , order:  3 , style: "", class: "col-wrap   col-02 col-last"     , format: ""      , tooltip: "Last Name"       , },
      { field: 'first_name'       , header: 'First Name'  , filter: true, filterPlaceholder: "First Name"  , order:  4 , style: "", class: "col-wrap   col-03 col-first"    , format: ""      , tooltip: "First Name"      , },
      // { field: 'startTime'        , header: 'Start Time'  , filter: true, filterPlaceholder: "Start Time"  , order:  3 , style: "", class: "col-wrap   col-02 col-start"    , format: ""      , tooltip: "Start Time"      , },
      // { field: 'endTime'          , header: 'Dest Time'   , filter: true, filterPlaceholder: "Dest Time"   , order:  4 , style: "", class: "col-wrap   col-03 col-end"      , format: ""      , tooltip: "Destination Time", },
      // { field: 'finalTime'        , header: 'Final Time'  , filter: true, filterPlaceholder: "Final Time"  , order:  5 , style: "", class: "col-wrap   col-04 col-final"    , format: ""      , tooltip: "Final Time"      , },
      // { field: 'startMiles'       , header: 'Start Miles' , filter: true, filterPlaceholder: "Start Miles" , order:  6 , style: "", class: "col-wrap   col-05 col-startm"   , format: ""      , tooltip: "Start Miles"      , },
      // { field: 'endMiles'         , header: 'Dest Miles'  , filter: true, filterPlaceholder: "Dest Miles"  , order:  7 , style: "", class: "col-wrap   col-06 col-endm"     , format: ""      , tooltip: "Destination Miles", },
      // { field: 'finalMiles'       , header: 'Final Miles' , filter: true, filterPlaceholder: "Final Miles" , order:  8 , style: "", class: "col-wrap   col-07 col-finalm"   , format: ""      , tooltip: "Final Miles"      , },
      { field: 'notes'            , header: 'Notes'       , filter: true, filterPlaceholder: "Notes"       , order:  9 , style: "", class: "col-wrap   col-04 col-notes"    , format: ""      , tooltip: "Notes"            , },
    ];
    this.allFieldsTimeCards = fields;
    this.colsTimeCards      = fields;
    this.selectedColumnsTimeCards = fields;
    this.columnsChangedTimeCards();
    this.timeCardsMultiSortMeta = [
      { field: 'report_date', order: -1 },
      { field: '_id', order: -1 },
    ];
    return fields;
  }

  public columnsChangedTimeCards(colList?:string[]) {
    let vCols = colList ? colList : this.selectedColumnsTimeCards;
    // let cols = this.cols;
    // Log.l("columnsChangedTimeCards(): Items now selected:\n", vCols);
    this.selectedColumnsTimeCards = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    // Log.l("columnsChangedTimeCards(): Now field list is:\n", this.colsTimeCards);
    if(this.columnSelectTimeCards) {
      this.columnSelectTimeCards.updateLabel();
    }
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public selectionChanged(evt?:Event) {
    Log.l(`selectionChanged(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChanged();
    this.dataReady = true;
  }

  public selectionChangedOthers(evt?:Event) {
    Log.l(`selectionChangedOthers(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChangedOthers();
    this.dataReady = true;
  }

  public selectionChangedLogistics(evt?:Event) {
    Log.l(`selectionChangedLogistics(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChangedLogistics();
    this.dataReady = true;
  }

  public selectionChangedMaintenance(evt?:Event) {
    Log.l(`selectionChangedMaintenance(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChangedMaintenance();
    this.dataReady = true;
  }

  public selectionChangedDriving(evt?:Event) {
    Log.l(`selectionChangedDrivings(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChangedDriving();
    this.dataReady = true;
  }

  public selectionChangedTimeCards(evt?:Event) {
    Log.l(`selectionChangedTimeCards(): Event is:\n`, evt);
    this.dataReady = false;
    this.columnsChangedTimeCards();
    this.dataReady = true;
  }

  public getFilteredCount():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = this.dt ? this.dt : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  public getFilteredCountOthers():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = this.othersTable ? this.othersTable : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  public getFilteredCountLogistics():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = this.logisticsTable ? this.logisticsTable : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  public getFilteredCountDriving():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = this.drivingsTable ? this.drivingsTable : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  public getFilteredCountMaintenance():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = this.maintenancesTable ? this.maintenancesTable : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  public getFilteredCountTimeCards():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    let dt:Table = this.timecardsTable ? this.timecardsTable : null;
    if(dt && dt.filteredValue && dt.filteredValue.length) {
      out = dt.filteredValue.length;
    }
    return out;
  }

  public async getData():Promise<any> {
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      let res:any[] = await this.getReports();
      res = await this.getOthers();
      res = await this.getLogistics();
      res = await this.getDrivings();
      res = await this.getMaintenances();
      res = await this.getTimeCards();
      // this.allReports = res;
      // res = await this.
      // let res:Report[] = await this.data.getReports(1000000);
      // Log.l("getData(): Got reports:\n", res);
      // this.allReports = res;
      // this.data.setData('reports', res.slice(0));
      // this.reports = this.allReports.slice(0);
      // return this.reports;
    } catch (err) {
      Log.l(`getData(): Error downloading reports.`);
      Log.e(err);
      throw err;
    }
  }

  public async getReports():Promise<Report[]> {
    let spinnerID;
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      let count:number = await this.db.getDBDocCount('reports');
      let text:string = `Retrieving ${count} work reports from database …`;
      spinnerID = await this.alert.showSpinnerPromise(text);
      // this.dataReady = false;
      // this.resetReportsTable();
      this.resetTable(TABLEINDEX.reports);
      // this.dispatch.triggerAppEvent('updatefromdb', {db: 'reports', count: 1000000});
      // let res:Report[] = await this.data.getReports(1000000, spinnerID);
      let res1 = await this.data.updateFromDB('reports');
      let res:Report[] = res1.payload;
      Log.l("ReportsPage.getReports(): Got reports:", res);
      this.allReports = res;
      // this.data.setData('reports', res.slice(0));
      this.reports = this.allReports.slice(0);
      this.dataReady = true;
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return this.reports;
    } catch (err) {
      Log.l(`ReportsPage.getReports(): Error downloading reports.`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getOthers():Promise<ReportOther[]> {
    let spinnerID;
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      // this.resetReportsTable();
      this.resetTable(TABLEINDEX.others);
      // this.dataReady = false;
      let count:number = await this.db.getDBDocCount('reports_other');
      let text:string = `Retrieving ${count} misc reports from database …`;
      spinnerID = await this.alert.showSpinnerPromise(text);
      // let res:ReportOther[] = await this.data.getReportOthers(true);
      let res1 = await this.data.updateFromDB('reports_other');
      let res:ReportOther[] = res1.payload;
      Log.l("ReportsPage.getOthers(): Got others:", res);
      this.allOthers = res;
      // this.data.setData('others', res.slice(0));
      this.others = this.allOthers.slice(0);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.dataReady = true;
      return this.others;
    } catch (err) {
      Log.l(`ReportsPage.getOthers(): Error downloading others.`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getLogistics():Promise<ReportLogistics[]> {
    let spinnerID;
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      // this.resetReportsTable();
      this.resetTable(TABLEINDEX.logistics);
      // this.dataReady = false;
      let count:number = await this.db.getDBDocCount('logistics');
      let text:string = `Retrieving ${count} logistics reports from database …`;
      spinnerID = await this.alert.showSpinnerPromise(text);
      // let res:ReportLogistics[] = await this.data.getReportLogistics(true);
      let res1 = await this.data.updateFromDB('logistics');
      let res:ReportLogistics[] = res1.payload;
      Log.l("ReportsPage.getLogistics(): Got logistics:", res);
      this.allLogistics = res;
      // this.data.setData('logistics', res.slice(0));
      this.logistics = this.allLogistics.slice(0);
      this.dataReady = true;
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return this.logistics;
    } catch (err) {
      Log.l(`ReportsPage.getLogistics(): Error downloading logistics reports.`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getDrivings():Promise<ReportDriving[]> {
    let spinnerID;
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      let count:number = await this.db.getDBDocCount('drivings');
      let text:string = `Retrieving ${count} driving reports from database …`;
      spinnerID = await this.alert.showSpinnerPromise(text);
      // this.dataReady = false;
      // this.resetReportsTable();
      this.resetTable(TABLEINDEX.drivings);
      // this.dispatch.triggerAppEvent('updatefromdb', {db: 'reports', count: 1000000});
      // let res:Report[] = await this.data.getReports(1000000, spinnerID);
      let res1 = await this.data.updateFromDB('drivings');
      let res:ReportDriving[] = res1.payload;
      Log.l("ReportsPage.getDrivings(): Got reports:", res);
      this.allDrivings = res;
      // this.data.setData('reports', res.slice(0));
      this.drivings = this.allDrivings.slice(0);
      this.dataReady = true;
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return this.drivings;
    } catch (err) {
      Log.l(`ReportsPage.getDrivings(): Error downloading reports.`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getMaintenances():Promise<ReportMaintenance[]> {
    let spinnerID;
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      let count:number = await this.db.getDBDocCount('maintenances');
      let text:string = `Retrieving ${count} maintenance reports from database …`;
      spinnerID = await this.alert.showSpinnerPromise(text);
      // this.dataReady = false;
      // this.resetReportsTable();
      this.resetTable(TABLEINDEX.maintenances);
      // this.dispatch.triggerAppEvent('updatefromdb', {db: 'reports', count: 1000000});
      // let res:Report[] = await this.data.getReports(1000000, spinnerID);
      let res1 = await this.data.updateFromDB('maintenances');
      let res:ReportMaintenance[] = res1.payload;
      Log.l("ReportsPage.getMaintenances(): Got reports:", res);
      this.allMaintenances = res;
      // this.data.setData('reports', res.slice(0));
      this.maintenances = this.allMaintenances.slice(0);
      this.dataReady = true;
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return this.maintenances;
    } catch (err) {
      Log.l(`ReportsPage.getMaintenances(): Error downloading reports.`);
      Log.e(err);
      await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async getTimeCards():Promise<ReportTimeCard[]> {
    let spinnerID;
    try {
      // let res:Report[] = await this.db.getAllReportsPlusNew();
      // this.resetReportsTable();
      this.resetTable(TABLEINDEX.timecards);
      // this.dataReady = false;
      let count:number = await this.db.getDBDocCount('timecards');
      let text:string = `Retrieving ${count} timecards from database …`;
      spinnerID = await this.alert.showSpinnerPromise(text);
      // let res:ReportTimeCard[] = await this.data.getTimeCards(true);
      let res1 = await this.data.updateFromDB('timecards');
      let res:ReportTimeCard[] = res1.payload;
      Log.l("ReportsPage.getTimeCards(): Got timecards:", res);
      this.allTimeCards = res;
      // this.data.setData('others', res.slice(0));
      this.logistics = this.allLogistics.slice(0);
      this.dataReady = true;
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      return this.timecards;
    } catch (err) {
      Log.l(`ReportsPage.getTimeCards(): Error downloading time cards.`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      throw err;
    }
  }

  public async refreshData(event?:Event):Promise<Report[]> {
    try {
      this.notify.addInfo("RETRIEVING", "Starting download of work reports...", 3000);
      let res1:any = await this.getData();
      this.notify.addSuccess("SUCCESS!", `Downloaded ${res1.length} reports.`, 3000);
      // let res2 = await this.downloadOldReports();
      res1 = await this.downloadOldReports();
      return this.reports;
    } catch(err) {
      Log.l(`ReportsPage.refreshData(): Error downloading reports.`);
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing reports: '${err.message}'`, 10000);
    }
  }

  public async loadOldReports(event?: any):Promise<Report[]> {
    Log.l("ReportsPage.loadOldReports() clicked.");
    this.notify.addInfo("RETRIEVING", `Downloading old reports...`, 3000);
    try {
      // let res = await this.db.getOldReports();
      let res:Report[] = await this.server.getOldReports();
      // let allReports:Report[] = this.reports.slice(0).concat(res);
      this.data.setData('oldreports', res);
      let len:number = res.length;
      this.notify.addSuccess("SUCCESS", `Loadeded ${len} old reports.`, 3000);
      return res;
    } catch (err) {
      Log.l(`ReportsPage.loadOldReports(): Error loading reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error loading old reports: '${err.message}'`, 10000);
    }
  }

  public async downloadOldReports(event?:Event):Promise<Report[]> {
    try {
      this.notify.addInfo("RETRIEVING", "Starting download of old reports...", 3000);
      Log.l("ReportsPage.downloadOldReports(): Retrieving old reports...");
      // let res:Report[] = await this.db.getOldReports();
      let res:Report[] = await this.server.getOldReports();
      Log.l("ReportsPage.downloadOldReports(): Success!");

      this.data.setData('oldreports', res);
      for(let report of res) {
        this.reports.push(report);
      }
      let allReports:Report[] = this.reports.sort((a:Report,b:Report) => {
        let dA:string = a.report_date;
        let dB:string = b.report_date;
        let lA:string = a.last_name;
        let lB:string = b.last_name;
        let fA:string = a.first_name;
        let fB:string = b.first_name;
        return dA > dB ? -1 : dA < dB ? -1 : lA > lB ? 1 : lA < lB ? -1 : fA > fB ? 1 : fA < fB ? -1 : 0;
      });
      this.reports = allReports;
      this.allReports = allReports;
      let len:number = res.length;
      Log.l(`ReportsPage.downloadOldReports(): Done downloading ${len} old reports.`);;
      this.notify.addSuccess("SUCCESS!", `Downloaded ${len} old reports.`, 3000);
      return res;
    } catch(err) {
      Log.l(`ReportsPage.downloadOldReports(): Error while getting old reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error downloading old reports: '${err.message}'`, 10000);
    }
  }

  public onRowSelect(event:any) {
    Log.l("ReportsPage.onRowSelect(): Event passed is:\n", event);
    this.showReport(event.data);
  }

  public onRowSelectOther(event:any) {
    Log.l("ReportsPage.onRowSelectOther(): Event passed is:\n", event);
    this.showReportOther(event.data);
  }

  public getDateRangeStrings(startDate:Moment|Date,endDate:Moment|Date):string[] {
    let range:Moment[] = this.getDateRange(startDate, endDate);
    let out:string[] = range.map((a:Moment) => a.format("YYYY-MM-DD"));
    return out;
  }

  public getDateRangeAsStrings = this.getDateRangeStrings;

  public getDateRange(startDate:Moment|Date,endDate:Moment|Date):Moment[] {
    let start:Moment   = moment(startDate);
    let end:Moment     = moment(endDate);
    let moments:Moment[] = [];
    let current:Moment = moment(start);
    while(current.isBefore(end, 'day')) {
      moments.push(moment(current));
      current.add(1, 'day');
    }
    moments.push(current);
    return moments;
  }

  // public updateFromDate(event:any, dt:Table) {
  //   Log.l("updateFromDate(): Event passed is:\n", event);
  //   let now:Moment  = moment().startOf('day').add(1, 'day');
  //   if(!this.fromDate) {
  //     this.fromDate = moment(this.minDateString, "YYYY-MM-DD").toDate();
  //   }
  //   let from:Moment = moment(this.fromDate);
  //   let to:Moment   = this.toDate   ? moment(this.toDate)   : moment(now);
  //   let fromDate:string = from.format("YYYY-MM-DD");
  //   let toDate:string   = to.format("YYYY-MM-DD");
  //   Log.l(`updateFromDate(): Now filtering from ${fromDate} - ${toDate}...`);
  //   // let reports:Report[] = this.allReports.filter((a:Report) => {
  //   //   return a.report_date >= fromDate && a.report_date <= toDate;
  //   // });
  //   let dateRange:string[] = this.getDateRangeStrings(from, to);
  //   this.minDate = from.toDate();
  //   this.maxDate = to.toDate();

  //   if(this.dateTimeout) {
  //     clearTimeout(this.dateTimeout);
  //   }
  //   this.dateTimeout = setTimeout(() => {
  //     dt.filter(dateRange, 'report_date', 'in');
  //   }, 250);
  // }

  // public updateToDate(event:any, dt:Table) {
  //   let now:Moment = moment().startOf('day').add(1, 'day');
  //   if(!this.toDate) {
  //     this.toDate = now.toDate();
  //   }
  //   let from:Moment = this.fromDate ? moment(this.fromDate) : moment(this.minDateString, "YYYY-MM-DD");
  //   let to:Moment   = moment(this.toDate);
  //   let fromDate:string = from.format("YYYY-MM-DD");
  //   let toDate:string   = to.format("YYYY-MM-DD");
  //   Log.l(`updateToDate(): Now filtering from ${fromDate} - ${toDate}...`);
  //   // let reports:Report[] = this.allReports.filter((a:Report) => {
  //   //   return a.report_date >= fromDate && a.report_date <= toDate;
  //   // });
  //   this.minDate = from.toDate();
  //   this.maxDate = to.toDate();
  //   let dateRange:string[] = this.getDateRangeStrings(from, to);
  //   // let ltDate = moment(to).add(1, 'day').format("YYYY-MM-DD");
  //   // this.reports = reports;
  //   if(this.dateTimeout) {
  //     clearTimeout(this.dateTimeout);
  //   }
  //   this.dateTimeout = setTimeout(() => {
  //     dt.filter(dateRange, 'report_date', 'in');
  //   }, 250);
  //   // this.reports = reports;
  // }


  public checkDateRange(tableNumber:number, cal:Calendar, evt?:Event) {
    let dt:Table;
    let dateRange:Date[];
    if(tableNumber === TABLEINDEX.reports) {
      dt = this.dt;
      dateRange = this.dateRanges[TABLEINDEX.reports - 1];
    } else if(tableNumber === TABLEINDEX.others) {
      dt = this.othersTable;
      dateRange = this.dateRanges[TABLEINDEX.others - 1];
    } else if(tableNumber === TABLEINDEX.logistics) {
      dt = this.logisticsTable;
      dateRange = this.dateRanges[TABLEINDEX.logistics - 1];
    } else if(tableNumber === TABLEINDEX.maintenances) {
      dt = this.maintenancesTable;
      dateRange = this.dateRanges[TABLEINDEX.maintenances - 1];
    } else if(tableNumber === TABLEINDEX.drivings) {
      dt = this.drivingsTable;
      dateRange = this.dateRanges[TABLEINDEX.drivings - 1];
    } else if(tableNumber === TABLEINDEX.timecards) {
      dt = this.timecardsTable;
      dateRange = this.dateRanges[TABLEINDEX.timecards - 1];
    } else {
      let text:string = `ReportsPage.checkDateRange(): Could not find table at index '${tableNumber}' to reset it`;
      Log.w(text);
      // this.notify.addWarning("TABLE RESET ERROR", text, 5000);
      return;
    }
    Log.l(`ReportsPage.checkDateRange(): dateRange[${tableNumber}] is now:`, dateRange);
    // let cal:Calendar = this.dateRangeCalendar;
    let dates:Date[] = dateRange;
    if(dates && Array.isArray(dates) && dates.length === 2) {
      let dStart:Date = dates[0];
      let dEnd:Date   = dates[1];
      if(dStart && dEnd) {
        cal.overlayVisible = false;
        setTimeout(() => {
          this.updateDateRange(tableNumber, dates, cal, dt);
        }, 400);
      }
    }
  }

  public checkDateRangeOnClose(tableNumber:TableIndexKey, cal:Calendar, table:Table, evt?:Event) {
    let dt:Table;
    let dateRange:Date[];
    let idx:number;
    if(tableNumber === TABLEINDEX.reports) {
      dt = this.dt;
      idx = (TABLEINDEX.reports as number)
      dateRange = this.dateRanges[idx - 1];
    } else if(tableNumber === TABLEINDEX.others) {
      dt = this.othersTable;
      idx = (TABLEINDEX.others as number)
      dateRange = this.dateRanges[idx - 1];
    } else if(tableNumber === TABLEINDEX.logistics) {
      dt = this.logisticsTable;
      idx = (TABLEINDEX.logistics as number)
      dateRange = this.dateRanges[idx - 1];
    } else if(tableNumber === TABLEINDEX.maintenances) {
      dt = this.maintenancesTable;
      idx = (TABLEINDEX.maintenances as number)
      dateRange = this.dateRanges[idx - 1];
    } else if(tableNumber === TABLEINDEX.drivings) {
      dt = this.drivingsTable;
      idx = (TABLEINDEX.drivings as number)
      dateRange = this.dateRanges[idx - 1];
    } else if(tableNumber === TABLEINDEX.timecards) {
      dt = this.timecardsTable;
      idx = (TABLEINDEX.timecards as number)
      dateRange = this.dateRanges[idx - 1];
    } else {
      let text:string = `ReportsPage.checkDateRangeOnClose(): Could not find table at index '${tableNumber}' to check dates`;
      Log.w(text);
      // this.notify.addWarning("TABLE RESET ERROR", text, 5000);
      return;
    }
    Log.l(`ReportsPage.checkDateRangeOnClose(): dateRange[${idx}] is now:`, dateRange);
    // let cal:Calendar = this.dateRangeCalendar;
    // let dates:Date[] = this.dateRange;
    let dates:Date[] = dateRange;
    if(dates && Array.isArray(dates) && dates.length === 2) {
      let dStart:Date = dates[0];
      let dEnd:Date   = dates[1];
      if(dStart && dEnd) {
        cal.overlayVisible = false;
        setTimeout(() => {
          // this.updateDateRange(dStart, cal, this.dt);
          this.updateDateRange(tableNumber, dates, cal, dt);
        }, 400);
      } else if(dStart || dEnd) {
        // dateRange = null;
        dateRange = null;
        let i:number = idx - 1;
        if(i >= 0 && i < this.dateRanges.length) {
          this.dateRanges[i] = null;
        }
      } else {

      }
    }
  }

  public updateDateRange(tableNumber:TableIndexKey, dateRange:Date[], cal:Calendar, table:Table, evt?:Event) {
    // Log.l(`ReportsPage.updateDateRange(): Arguments are:\n`, arguments);
    Log.l(`ReportsPage.updateDateRange(): for table '${tableNumber}', provided date range is:`, dateRange);
    let idx:number = (tableNumber as number);
    if(!(cal && cal instanceof Calendar)) {
      let text:string = `ReportsPage.updateDateRange(): Provided calendar is invalid`;
      Log.w(text, cal);
      return;
    }
    if(!(table && table instanceof Table)) {
      let text:string = `ReportsPage.updateDateRange(): Provided Table is invalid`;
      Log.w(text, table);
      return;
    }
    let dt:Table  = table;
    let dStart:Date = dateRange[0];
    let dEnd:Date   = dateRange[1];
    cal.overlayVisible = false;
    if(dStart && dEnd) {
      let from:Moment = moment(dStart);
      let to:Moment = moment(dEnd);
      let fromDate:string = from.format("YYYY-MM-DD");
      let toDate:string   = to.format("YYYY-MM-DD");
      Log.l(`ReportsPage.updateDateRange(): Now filtering from ${fromDate} - ${toDate}...`);
      let dateRange:string[] = this.getDateRangeStrings(from, to);
      // this.minDate = from.toDate();
      // this.maxDate = to.toDate();

      if(this.dateTimeout) {
        clearTimeout(this.dateTimeout);
      }
      this.dateTimeout = setTimeout(() => {
        dt.filter(dateRange, 'report_date', 'in');
      }, 250);
    } else {
      dateRange = null;
      let i:number = idx - 1;
      if(i >= 0 && i < this.dateRanges.length) {
        this.dateRanges[i] = null;
      }
    }
  }

  public onRowSelectOthers(event:any) {
    Log.l("ReportsPage.onRowSelectOthers(): Event passed is:", event);
    this.showReportOther(event.data);
  }

  public onRowSelectLogistics(event:any) {
    Log.l("ReportsPage.onRowSelectLogistics(): Event passed is:", event);
    this.showReportLogistics(event.data);
  }

  public onRowSelectDriving(event:any) {
    Log.l("ReportsPage.onRowSelectDriving(): Event passed is:", event);
    this.showReportDriving(event.data);
  }

  public onRowSelectMaintenance(event:any) {
    Log.l("ReportsPage.onRowSelectMaintenance(): Event passed is:", event);
    this.showReportMaintenance(event.data);
  }

  public onRowSelectTimeCards(event:any) {
    Log.l("ReportsPage.onRowSelectTimeCards(): Event passed is:", event);
    this.showReportTimeCard(event.data);
  }

  // public updateFromDateOthers(event:any, dt:Table) {
  //   Log.l("updateFromDateOthers(): Event passed is:\n", event);
  //   let now:Moment  = moment().startOf('day').add(1, 'day');
  //   if(!this.fromDate) {
  //     this.fromDate = moment(this.minDateOthersString, "YYYY-MM-DD").toDate();
  //   }
  //   let from:Moment = moment(this.fromDateOthers);
  //   let to:Moment   = this.toDateOthers   ? moment(this.toDateOthers)   : moment(now);
  //   let fromDate:string = from.format("YYYY-MM-DD");
  //   let toDate:string   = to.format("YYYY-MM-DD");
  //   Log.l(`updateFromDateOthers(): Now filtering from ${fromDate} - ${toDate}...`);
  //   // let reports:Report[] = this.allReports.filter((a:Report) => {
  //   //   return a.report_date >= fromDate && a.report_date <= toDate;
  //   // });
  //   let dateRange:string[] = this.getDateRangeStrings(from, to);
  //   this.minDateOthers = from.toDate();
  //   this.maxDateOthers = to.toDate();

  //   if(this.dateTimeout) {
  //     clearTimeout(this.dateTimeout);
  //   }
  //   this.dateTimeout = setTimeout(() => {
  //     dt.filter(dateRange, 'report_date', 'in');
  //   }, 250);
  // }

  // public updateToDateOthers(event:any, dt:Table) {
  //   let now:Moment  = moment().startOf('day').add(1, 'day');
  //   if(!this.toDate) {
  //     this.toDate = now.toDate();
  //   }
  //   let from:Moment = this.fromDateOthers ? moment(this.fromDateOthers) : moment(this.minDateOthersString, "YYYY-MM-DD");
  //   let to:Moment   = moment(this.toDateOthers);
  //   let fromDate:string = from.format("YYYY-MM-DD");
  //   let toDate:string   = to.format("YYYY-MM-DD");
  //   Log.l(`updateToDateOthers(): Now filtering from ${fromDate} - ${toDate}...`);
  //   // let reports:Report[] = this.allReports.filter((a:Report) => {
  //   //   return a.report_date >= fromDate && a.report_date <= toDate;
  //   // });
  //   this.minDateOthers = from.toDate();
  //   this.maxDateOthers = to.toDate();
  //   let dateRangeOthers:string[] = this.getDateRangeStrings(from, to);
  //   // let ltDate = moment(to).add(1, 'day').format("YYYY-MM-DD");
  //   // this.reports = reports;
  //   if(this.dateTimeout) {
  //     clearTimeout(this.dateTimeout);
  //   }
  //   this.dateTimeout = setTimeout(() => {
  //     dt.filter(dateRangeOthers, 'report_date', 'in');
  //   }, 250);
  //   // this.reports = reports;
  // }

  // public clearDatesOthers(event:any, othersTable:Table) {
  //   Log.l(`clearDatesOthers(): Clearing from and to search fields.`);
  //   this.fromDateOthers = null;
  //   this.toDateOthers = null;
  //   this.dateRangeOthers = null;
  //   othersTable.filter(null, 'report_date', 'startsWith');
  // }

  // public checkDateRangeOthers(evt?:Event) {
  //   Log.l(`checkDateRangeOthers(): dateRange is now:\n`, this.dateRangeOthers);
  //   let cal:Calendar = this.dateRangeCalendarOthers;
  //   let dates:Date[] = this.dateRangeOthers;
  //   if(dates && Array.isArray(dates) && dates.length === 2) {
  //     let dStart:Date = dates[0];
  //     let dEnd:Date   = dates[1];
  //     if(dStart && dEnd) {
  //       cal.overlayVisible = false;
  //       setTimeout(() => {
  //         this.updateDateRangeOthers(dStart, this.othersTable);
  //       }, 400);
  //     }
  //   }
  // }

  // public checkDateRangeOnCloseOthers(evt?:Event) {
  //   Log.l(`checkDateRangeOnCloseOthers(): dateRange is now:\n`, this.dateRangeOthers);
  //   let cal:Calendar = this.dateRangeCalendarOthers;
  //   let dates:Date[] = this.dateRangeOthers;
  //   if(dates && Array.isArray(dates) && dates.length === 2) {
  //     let dStart:Date = dates[0];
  //     let dEnd:Date   = dates[1];
  //     if(dStart && dEnd) {
  //       cal.overlayVisible = false;
  //       setTimeout(() => {
  //         this.updateDateRangeOthers(dStart, this.othersTable);
  //       }, 400);
  //     } else if(dStart || dEnd) {
  //       this.dateRange = null;
  //     } else {

  //     }
  //   }
  // }

  // public updateDateRangeOthers(value:Date, table:Table) {
  //   // Log.l(`updateDateRangeOthers(): Arguments are:\n`, arguments);
  //   Log.l(`updateDateRangeOthers(): dateRange is now:\n`, this.dateRangeOthers);
  //   let dt:Table = table && table instanceof Table ? table : this.othersTable;
  //   let dStart:Date = this.dateRangeOthers[0];
  //   let dEnd:Date   = this.dateRangeOthers[1];
  //   if(dStart && dEnd) {
  //     let from:Moment = moment(dStart);
  //     let to:Moment = moment(dEnd);
  //     let fromDate:string = from.format("YYYY-MM-DD");
  //     let toDate:string   = to.format("YYYY-MM-DD");
  //     Log.l(`updateDateRangeOthers(): Now filtering from ${fromDate} - ${toDate}...`);
  //     let dateRangeOthers:string[] = this.getDateRangeStrings(from, to);
  //     // this.minDate = from.toDate();
  //     // this.maxDate = to.toDate();

  //     if(this.dateTimeout) {
  //       clearTimeout(this.dateTimeout);
  //     }
  //     this.dateTimeout = setTimeout(() => {
  //       dt.filter(dateRangeOthers, 'report_date', 'in');
  //     }, 250);
  //   } else {
  //     this.dateRange = null;
  //   }
  // }

  public async bulkEdit(type:TableIndexKey, event?:Event):Promise<any> {
    try {
      let docs:ReportAny[];
      let description:string;
      if(type === TABLEINDEX.reports) {
        docs = this.selectedReports;
        description = "work reports";
      } else if(type === TABLEINDEX.others) {
        docs = this.selectedReportsOther;
        description = "misc. reports";
      } else if(type === TABLEINDEX.logistics) {
        docs = this.selectedReportsLogistics;
        description = "logistics reports";
      } else if(type === TABLEINDEX.maintenances) {
        docs = this.selectedReportsMaintenance;
        description = "maintenance reports";
      } else if(type === TABLEINDEX.drivings) {
        docs = this.selectedReportsDriving;
        description = "driving reports";
      } else if(type === TABLEINDEX.timecards) {
        docs = this.selectedTimeCards;
        description = "time card reports";
      }
      if(!docs) {
        let text:string = `bulkEdit(): Could not determine what type of reports to edit`;
        Log.w(text);
        this.notify.addWarning("BULK EDIT ERROR", text, 6000);
        return;
      }
      if(!docs.length) {
        let text:string = `bulkEdit(): No reports are selected to be edited`;
        Log.w(text);
        this.notify.addWarning("NO REPORTS SELECTED", text, 3000);
        return;
      }
      let count:number = docs.length;
      let go:boolean = await this.alert.showConfirmYesNo("BULK EDIT", `Edit ${count} ${description}?`);
      if(!go) {
        Log.l(`bulkEdit(): User canceled edit.`);
        return;
      }

      let allkeys:string[] = this.findUsedKeys(docs);
      Log.l(`bulkEdit(): Keys used are:`, allkeys);

    } catch(err) {
      Log.l(`bulkEdit(): Error starting up bulk editor`);
      Log.e(err);
      throw err;
    }
  }

  public findUsedKeys(docs:ReportAny[]):string[] {
    let allkeys:Set<string> = new Set();
    docs.forEach(a => a.getKeys().forEach((b:string) => allkeys.add(b)));
    let out:string[] = Array.from(allkeys);
    return out;
  }

  public showReport(report:Report, event?:Event) {
    Log.l(`showReport(): Called with report:`, report);
    let reportList = this.dt.hasFilter() ? this.dt.filteredValue : this.dt.value;
    let site:Jobsite = this.sites.find((a:Jobsite) => {
      // return _matchReportSite(report, a);
      if(a instanceof Jobsite) {
        return report.matchesSite(a);
      }
    });
    if(!site) {
      Log.l(`showReport(): Could not find site matching this report in sites array:\n`, this.sites);
      this.notify.addWarn("SITE ERROR", "Could not determine what work site this report is for!", 6000);
      // let reportPage = this.modalCtrl.create("View Work Report", { report: report, reports: reportList});
      // reportPage.onDidDismiss(data => {
//
      // });
      // reportPage.present();
    } else {
      let username:string = report.username;
      let tech:Employee = this.techs.find((a:Employee) => {
        return a.username === username;
        // return _matchSite(a, site);
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this report!", 6000);
        return;
      }
      this.site        = site;
      this.tech        = tech;
      this.editReports = reportList;
      this.report      = report;
      this.reportViewVisible = true;
    }
  }

  public showReportOther(other:ReportOther, event?:Event) {
    Log.l(`showReportOther(): Called with report:`, other);
    let reportList:ReportOther[] = this.othersTable.hasFilter() ? this.othersTable.filteredValue : this.othersTable.value;
    // let site = this.sites.find((a:Jobsite) => {
    //   // return _matchReportSite(report, a);
    //   if(a instanceof Jobsite) {
    //     return other.matchesSite(a);
    //   }
    // });
//     if(!site) {
//       Log.l(`showReportOther(): Could not find site matching this report in sites array:\n`, this.sites);
//       this.notify.addWarn("SITE ERROR", "Could not determine what work site this report is for!", 6000);
//       // let reportPage = this.modalCtrl.create("View Work Report", { report: report, reports: reportList});
//       // reportPage.onDidDismiss(data => {
// //
//       // });
//       // reportPage.present();
//     } else {
    if(other && other instanceof ReportOther) {
      let username:string = other.username;
      let techs:Employee[] = this.techs;
      let tech:Employee = techs.find((a:Employee) => {
        let techUsername:string = a.getUsername();
        return username === techUsername;
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this misc report!", 6000);
        return;
      }
      // this.site        = site;
      this.tech        = tech;
      this.editOthers  = reportList;
      this.other       = other;
      this.reportOtherViewVisible = true;
      return;
    } else {
      this.notify.addWarn("MISC REPORT ERROR", "Misc report not found, cannot view/edit it");
      return;
    }
  }

  public showReportLogistics(logistic:ReportLogistics, event?:Event) {
    Log.l(`showReportLogistics(): Called with report:`, logistic);
    let reportList:ReportLogistics[] = this.logisticsTable && this.logisticsTable.hasFilter() ? this.logisticsTable.filteredValue : this.logisticsTable.value;
    if(logistic && logistic instanceof ReportLogistics) {
      let username:string = logistic.username;
      let techs:Employee[] = this.techs;
      let tech:Employee = techs.find((a:Employee) => {
        let techUsername:string = a.getUsername();
        return username === techUsername;
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this logistics report!", 6000);
        return;
      }
      // this.site        = site;
      this.tech          = tech;
      this.editLogistics = reportList;
      this.logistic      = logistic;
      this.reportLogisticsViewVisible = true;
      return;
    } else {
      this.notify.addWarn("LOGISTICS REPORT ERROR", "Logistics report not found, cannot view/edit it");
      return;
    }
  }

  public showReportMaintenance(report:ReportMaintenance, event?:Event) {
    Log.l(`showReportMaintenance(): Called with report:`, report);
    let reportList:ReportMaintenance[] = this.maintenancesTable && this.maintenancesTable.hasFilter() ? this.maintenancesTable.filteredValue : this.maintenancesTable.value;
    if(report && report instanceof ReportMaintenance) {
      let username:string = report.username;
      let techs:Employee[] = this.techs;
      let tech:Employee = techs.find((a:Employee) => {
        let techUsername:string = a.getUsername();
        return username === techUsername;
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this maintenance report!", 6000);
        return;
      }
      // this.site        = site;
      this.tech          = tech;
      this.editMaintenance = reportList;
      this.maintenance      = report;
      this.reportMaintenanceViewVisible = true;
      return;
    } else {
      this.notify.addWarn("MAINTENANCE REPORT ERROR", "Maintenance report not found, cannot view/edit it");
      return;
    }
  }

  public showReportDriving(report:ReportDriving, event?:Event) {
    Log.l(`showReportMaintenance(): Called with report:`, report);
    let reportList:ReportDriving[] = this.drivingsTable && this.drivingsTable.hasFilter() ? this.drivingsTable.filteredValue : this.drivingsTable.value;
    if(report && report instanceof ReportDriving) {
      let username:string = report.username;
      let techs:Employee[] = this.techs;
      let tech:Employee = techs.find((a:Employee) => {
        let techUsername:string = a.getUsername();
        return username === techUsername;
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this driving report!", 6000);
        return;
      }
      // this.site        = site;
      this.tech          = tech;
      this.editDriving  = reportList;
      this.driving      = report;
      this.reportDrivingViewVisible = true;
      return;
    } else {
      this.notify.addWarn("DRIVING REPORT ERROR", "Driving report not found, cannot view/edit it");
      return;
    }
  }

  public showReportTimeCard(timecard:ReportTimeCard, event?:Event) {
    Log.l(`showReportTimeCard(): Called with report:`, timecard);
    let reportList:ReportTimeCard[] = this.timecardsTable && this.timecardsTable.hasFilter() ? this.timecardsTable.filteredValue : this.timecardsTable.value;
    if(timecard && timecard instanceof ReportTimeCard) {
      let username:string = timecard.username;
      let techs:Employee[] = this.techs;
      let tech:Employee = techs.find((a:Employee) => {
        let techUsername:string = a.getUsername();
        return username === techUsername;
      });
      if(!tech) {
        this.notify.addWarn("TECH ERROR", "Could not determine what tech created this time card!", 6000);
        return;
      }
      // this.site        = site;
      this.tech          = tech;
      this.editTimeCards = reportList;
      this.timecard      = timecard;
      this.reportTimeCardViewVisible = true;
      return;
    } else {
      this.notify.addWarn("TIME CARD ERROR", "Time card not found, cannot view/edit it");
      return;
    }
  }

  public exportWorkReportsForPayroll() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Work Reports', { data: data, csv: csv });
  }

  public createExportData() {
    let dat = this.reports;
    let overall = [];
    let i = 0, j = 0;
    //    ScheduleID	RotSeq	TechRotation	TechShift	JobSiteOnSchedule	Client	TechLocation	TechLocID	TechOnSchedule	Jun 28	Jun 29	Jun 30	Jul 01	Jul 02	Jul 03	Jul 04
    let header = [
      "Period",
      "Type",
      "Training",
      "Date",
      "Timestamp",
      "Last Name",
      "First Name",
      "Start Time",
      "End Time",
      "Hours",
      "Client",
      "Location",
      "LocID",
      "Unit",
      "Work Order",
      "Notes",
    ];

    // let now = moment("2017-10-17");
    let now = moment();
    // let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getScheduleStartDate(now) : this.data.getScheduleStartDate(moment(now).subtract(7, 'days'));
    let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getNextScheduleStartDate(now) : this.data.getNextScheduleStartDate(moment(now).subtract(7, 'days'));
    let end   = this.toDate   ? moment(this.toDate)   : moment(start).add(6, 'days');
    let strStart = start.format("YYYY-MM-DD");
    let strEnd   = end.format("YYYY-MM-DD");
    let period = new PayrollPeriod(start, end);
    period.getPayrollShifts();
    Log.l(`createExportData(): start is '${strStart}', end is '${strEnd}', and period is:\n`, period);
    let reports = this.allReports.filter((a:Report) => {
      let date = a.report_date;
      return date >= strStart && date <= strEnd;
    }).sort((a:Report,b:Report) => {
      let dA=a.report_date, dB=b.report_date;
      let tA=a.time_start, tB=b.time_start;
      return dA > dB ? 1 : dA < dB ? -1 : tA > tB ? 1 : tA < tB ? -1 : 0;
    });
    Log.l("createExportData(): Reports for export is:\n", reports);

    let grid = [];
    // grid[0] = header;
    let keys = ['payroll_period', 'type', 'training_type', 'report_date', 'timestamp', 'last_name', 'first_name', 'time_start', 'time_end', 'repair_hours', 'client', 'location', 'location_id', 'unit_number', 'work_order_number', 'notes'];
    let others = this.others.filter((a:ReportOther) => {
      // let date:string = a.report_date.format("YYYY-MM-DD");
      let date:string = a.getReportDateAsString();
      return date >= strStart && date <= strEnd;
    }).sort((a,b) => {
      // let dA:string = a.report_date.format("YYYY-MM-DD");
      // let dB:string = b.report_date.format("YYYY-MM-DD");
      let dA:string = a.getReportDateAsString();
      let dB:string = b.getReportDateAsString();
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    let allreports = [...reports, ...others];
    Log.l("createExportData(): showreports is now:", allreports);
    let showreports = allreports.filter((a:Report|ReportOther) => {
      // let date = obj['report_date'];
      // return date >= strStart && date <= strEnd;
      let lname = a.last_name, fname = a.first_name;
      return !((lname === 'Bates' && fname === 'Michael') || (lname === 'Sargeant' && fname === 'David') || (fname === 'Cecilio' && lname === 'Jauregui'));
    }).sort((a:Report|ReportOther, b:Report|ReportOther) => {
      // let dA:string = a instanceof Report ? a.report_date : a.report_date.format("YYYY-MM_DD");
      // let dB:string = b instanceof Report ? b.report_date : b.report_date.format("YYYY-MM_DD");
      let dA:string = a.getReportDateAsString();
      let dB:string = b.getReportDateAsString();
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    Log.l("createExportData(): showreports is now:\n", showreports);
    for(let report of showreports) {
      let row = [];
      for(let key of keys) {
        if(!report[key]) {
          if(key === 'type') {
            row.push("Work Report");
          } else if(key === 'training_type') {
            row.push("");
          } else {
            row.push("");
          }
        } else if(key === 'timestamp') {
          let ts = report[key], time;
          if(typeof ts === 'number') {
            time = moment.fromExcel(ts);
          } else {
            time = moment(ts);
          }
          row.push(time.toExcel());
          // let ts = moment(report[key]);

        } else if(key === 'report_date') {
          if(report instanceof Report) {
            row.push(report[key]);
          } else if(report instanceof ReportOther) {
            // row.push(report[key].format("YYYY-MM-DD"));
            row.push(report[key]);
          }
        } else {
          row.push(report[key]);
        }
      }
      grid.push(row);
    }

    let output = {header: header, rows: grid};
    Log.l("createExportData(): Output is:\n", output);
    return output;
  }

  public toCSV(header: any[], table: Array<any[]>) {
    let html = "";
    let i = 0, j = 0;
    for (let hdr of header) {
      if (j++ === 0) {
        html += hdr;
      } else {
        html += "\t" + hdr;
      }
    }
    html += "\n";
    for (let row of table) {
      j = 0;
      for (let cell of row) {
        if (j++ === 0) {
          html += cell;
        } else {
          html += "\t" + cell;
        }
      }
      html += "\n";
    }
    return html;
  }

  public payrollReports() {
    // this.navCtrl.
  }

  public reportViewSave(event?:Event) {
    Log.l("reportViewSave(): Event is:\n", event);
    this.reportViewVisible = false;
    window['p'] = this;
  }

  public reportViewCancel(event?:Event) {
    Log.l("reportViewCancel(): Event is:\n", event);
    this.reportViewVisible = false;
    window['p'] = this;
  }

  public otherViewSave(event?:Event) {
    Log.l("otherViewSave(): Event is:\n", event);
    this.reportOtherViewVisible = false;
    window['p'] = this;
  }

  public otherViewCancel(event?:Event) {
    Log.l("otherViewCancel(): Event is:\n", event);
    this.reportOtherViewVisible = false;
    window['p'] = this;
  }

  public logisticsViewSave(event?:Event) {
    Log.l("logisticsViewSave(): Event is:\n", event);
    this.reportLogisticsViewVisible = false;
    window['p'] = this;
  }

  public logisticsViewCancel(event?:Event) {
    Log.l("logisticsViewCancel(): Event is:", event);
    this.reportLogisticsViewVisible = false;
    window['p'] = this;
  }

  public maintenanceViewSave(event?:Event) {
    Log.l("maintenanceViewSave(): Event is:", event);
    this.reportMaintenanceViewVisible = false;
    window['p'] = this;
  }

  public maintenanceViewCancel(event?:Event) {
    Log.l("maintenanceViewCancel(): Event is:", event);
    this.reportMaintenanceViewVisible = false;
    window['p'] = this;
  }

  public drivingViewSave(event?:Event) {
    Log.l("drivingViewSave(): Event is:\n", event);
    this.reportDrivingViewVisible = false;
    window['p'] = this;
  }

  public drivingViewCancel(event?:Event) {
    Log.l("drivingViewCancel(): Event is:", event);
    this.reportDrivingViewVisible = false;
    window['p'] = this;
  }

  public timeCardViewSave(event?:Event) {
    Log.l("timeCardViewSave(): Event is:", event);
    this.reportTimeCardViewVisible = false;
    window['p'] = this;
  }

  public timeCardViewCancel(event?:Event) {
    Log.l("timeCardViewCancel(): Event is:\n", event);
    this.reportTimeCardViewVisible = false;
    window['p'] = this;
  }

  public reportViewDeleted(report:Report) {
    Log.l(`ReportsPage.reportViewDeleted(): called for report:`, report);
    let reports = this.reports;
    let idx = reports.indexOf(report);
    if(idx > -1) {
      Log.l(`ReportsPage.reportViewDeleted(): Found report at ${idx}`);
      window['onsitelastdeletedreport'] = reports.splice(idx, 1);
    }
  }

  public otherViewDeleted(report:ReportOther) {
    Log.l(`ReportsPage.otherViewDeleted(): called for report:`, report);
    let reports = this.others;
    let idx = reports.indexOf(report);
    if(idx > -1) {
      Log.l(`ReportsPage.otherViewDeleted(): Found report at ${idx}`);
      window['onsitelastdeletedreport'] = reports.splice(idx, 1);
    }
  }

  public logisticsViewDeleted(report:ReportLogistics) {
    Log.l(`ReportsPage.logisticsViewDeleted(): called for report:`, report);
    let reports = this.logistics;
    let idx = reports.indexOf(report);
    if(idx > -1) {
      Log.l(`ReportsPage.logisticsViewDeleted(): Found report at ${idx}`);
      window['onsitelastdeletedreport'] = reports.splice(idx, 1);
    }
  }
  
  public maintenanceViewDeleted(report:ReportMaintenance) {
    Log.l(`ReportsPage.maintenanceViewDeleted(): called for report:`, report);
    let reports = this.maintenances;
    let idx = reports.indexOf(report);
    if(idx > -1) {
      Log.l(`ReportsPage.maintenanceViewDeleted(): Found report at ${idx}`);
      window['onsitelastdeletedreport'] = reports.splice(idx, 1);
    }
  }
  
  public drivingViewDeleted(report:ReportDriving) {
    Log.l(`ReportsPage.drivingViewDeleted(): called for report:`, report);
    let reports = this.drivings;
    let idx = reports.indexOf(report);
    if(idx > -1) {
      Log.l(`ReportsPage.drivingViewDeleted(): Found report at ${idx}`);
      window['onsitelastdeletedreport'] = reports.splice(idx, 1);
    }
  }
  
  public timeCardViewDeleted(report:ReportTimeCard) {
    Log.l(`ReportsPage.timeCardViewDeleted(): called for report:`, report);
    let reports = this.timecards;
    let idx = reports.indexOf(report);
    if(idx > -1) {
      Log.l(`ReportsPage.timeCardViewDeleted(): Found report at ${idx}`);
      window['onsitelastdeletedreport'] = reports.splice(idx, 1);
    }
  }

  public openTechShiftReports(event?:Event) {
    Log.l("openTechShiftReports(): Now opening Tech Shift Reports page...");
    let reportsList:Report[] = this.dt && this.dt.filteredValue && this.dt.filteredValue.length ? this.dt.filteredValue : this.reports;
    let count = reportsList.length;
    if(count < 1) {
      this.notify.addError("TOO FEW", `${count} reports is not enough!`, 10000);
    } else if(count > 200) {
      this.notify.addError("TOO MANY", `${count} reports is too many, you can only send 200 reports at once.`, 10000);
    } else {
      // this.navCtrl.setRoot("Tech Shift Reports", { reports: reportsList });
      this.navCtrl.push("Tech Shift Reports", { reports: reportsList, mode: 'ro' });
    }
  }

  public exportReportsTableAsCSV(evt?:Event) {
    Log.l(`exportReportsTableAsCSV(): event is:\n`, evt);
    if(this.dt && this.dt.exportCSV) {
      this.dt.exportCSV();
    }
  }

  public copyTable(evt?:MouseEvent) {
    Log.l(`copyTable(): event is:\n`, evt);
    let table:Table = this.dt && this.dt instanceof Table ? this.dt : null;
    if(table) {
      Log.l(`copyTable(): called for the TurboTable:\n`, table);
      let options:TurboTableExportOptions = {
        copyToClipboard : true,
        separator       : "\t",
      };
      if(evt && evt.shiftKey) {
        options.copyToClipboard = false;
      }
      this.exportCSV(table, options);
      Log.l(`copyTable(): Finished!`);
    } else {

    }
    // let wrapperElement = this.printArea.nativeElement;
    // document.getElementsByTagName('table')[0]
    // this.showButtonCol = false;
    // this.showFilterRow = false;
    // let tables = document.getElementsByTagName('table');
    // let table:HTMLElement;
    // if(tables && tables.length > 0) {
    //   table = tables[0];
    // }
    // if(table) {
    //   // let el = table.innerHTML;
    //   let range,selection;
    //   if(window.getSelection) {
    //     selection = window.getSelection();
    //     range = document.createRange();
    //     range.selectNodeContents(table);
    //     selection.removeAllRanges();
    //     selection.addRange(range);
    //   }
    //   document.execCommand('copy');
    //   selection.removeAllRanges();
    //   this.showButtonCol = true;
    //   this.showFilterRow = true;
    //   this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
    // }
  }

  public exportCSV(table:Table, options?:TurboTableExportOptions):void {
    let dt:Table = table && table instanceof Table ? table : this.dt;
    let data:Report[] = dt.filteredValue || dt.value;
    let csv:string = '\ufeff';
    let copyOnly:boolean = false;
    let separator:string = "\t";

    if(options && options.selectionOnly) {
      data = dt.selection || [];
    }
    if(options && options.copyToClipboard) {
      copyOnly = true;
    }
    if(options && options.separator) {
      separator = options.separator;
    }

    /* Headers */
    for(let i = 0; i < dt.columns.length; i++) {
      let column = dt.columns[i];
      if(column.exportable !== false && column.field) {
        if(copyOnly) {
          csv += (column.header || column.field);
        } else {
          csv += '"' + (column.header || column.field) + '"';
        }
        if(i < (dt.columns.length - 1)) {
          // csv += dt.csvSeparator;
          csv += separator;
        }
      }
    }

    /* Body */
    data.forEach((record, i) => {
      csv += '\n';
      for(let i = 0; i < dt.columns.length; i++) {
        let column = dt.columns[i];
        if(column.exportable !== false && column.field) {
          let cellData = dt.objectUtils.resolveFieldData(record, column.field);

          if(cellData != null) {
            if(dt.exportFunction) {
              cellData = dt.exportFunction({
                data: cellData,
                field: column.field
              });
            } else {
              if(copyOnly) {
                cellData = String(cellData);
              } else {
                cellData = String(cellData).replace(/"/g, '""');
              }
            }
          } else {
            cellData = '';
          }

          if(copyOnly) {
            if(cellData.indexOf('\n') > -1) {
              cellData = cellData.replace(/"/g, '""');
              csv += '"' + cellData + '"';
            } else {
              csv += cellData;
            }
          } else {
            csv += '"' + cellData + '"';
          }

          if(i < (dt.columns.length - 1)) {
            // csv += dt.csvSeparator;
            csv += separator;
          }
        }
      }
    });

    if(copyOnly) {
      // copyStringToClipboard(csv, "text/csv");
      let success:boolean = this.clipboard.copyFromContent(csv);
      if(success) {
        this.notify.addSuccess("COPIED", `Successfully copied visible table to clipboard.`, 3000);
      } else {
        this.notify.addError("ERROR", `Error copying table.`, 3000);
      }
    } else {
      let blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
      });

      if(window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, dt.exportFilename + '.csv');
      } else {
        let link = document.createElement("a");
        link.style.display = 'none';
        document.body.appendChild(link);
        if(link.download !== undefined) {
          link.setAttribute('href', URL.createObjectURL(blob));
          link.setAttribute('download', dt.exportFilename + '.csv');
          link.click();
        } else {
          csv = 'data:text/csv;charset=utf-8,' + csv;
          window.open(encodeURI(csv));
        }
        document.body.removeChild(link);
      }
    }
  }

  public resetAllTables(evt?:Event) {
    Log.l(`resetAllTables(): Event is:`, evt);
    // let dt:DataTable;
    // let dt:Table;
    let tables:Table[] = [
      this.dt,
      this.othersTable,
      this.logisticsTable,
      this.maintenancesTable,
      this.drivingsTable,
      this.timecardsTable,
    ];
    for(let dt of tables) {
      let tableNumber = (tables.indexOf(dt) + 1 as TableIndexKey);
      this.resetTable(tableNumber);
    }
    // for(let dt of tables) {
    //   if(dt && dt instanceof Table) {
    //     dt.reset();
    //     dt.selection = null;
    //   }
    // }
    // let filterInputElements:any = document.getElementsByClassName('reports-col-filter');
    // Log.l(`resetAllTables(): filter input elements are:`, filterInputElements);
    // if(filterInputElements && filterInputElements.length) {
    //   let count = filterInputElements.length;
    //   for(let i = 0; i < count; i++) {
    //     let inputElement = filterInputElements[i];
    //     if(inputElement instanceof HTMLInputElement) {
    //       inputElement.value = "";
    //     }
    //   }
    // }
    // let inputs:ElementRef[] = [
    //   this.globalFilterInput,
    //   this.globalFilterInputOthers,
    //   this.globalFilterInputLogistics,
    //   this.globalFilterInputTimeCards,
    // ];
    // for(let el of inputs) {
    //   if(el && el instanceof ElementRef) {
    //     let input:HTMLInputElement = el.nativeElement;
    //     input.value = "";
    //   }
    // }
    // this.clearAllDates(evt);
  }

  public resetTable(tableNumber:TableIndexKey, evt?:Event) {
    let dt:Table;
    if(tableNumber === TABLEINDEX.reports) {
      dt = this.dt;
    } else if(tableNumber === TABLEINDEX.others) {
      dt = this.othersTable;
    } else if(tableNumber === TABLEINDEX.logistics) {
      dt = this.logisticsTable;
    } else if(tableNumber === TABLEINDEX.maintenances) {
      dt = this.maintenancesTable;
    } else if(tableNumber === TABLEINDEX.drivings) {
      dt = this.drivingsTable;
    } else if(tableNumber === TABLEINDEX.timecards) {
      dt = this.timecardsTable;
    } else {
      let text:string = `resetTable(): Could not find table at index '${tableNumber}' to reset it`;
      Log.w(text);
      this.notify.addWarning("TABLE RESET ERROR", text, 5000);
      return;
    }
    dt.reset();
    this.clearTableSelection(dt);
    this.clearTableFilters(dt);
    this.clearTableDates(tableNumber, dt);
    this.resetTableSorted(tableNumber, dt);
    // this.clearDates(tableNumber, dt);
  }

  // public clearTableSelection(tableNumber:number, evt?:Event) {
  public clearTableSelection(dt:Table, evt?:Event) {
    Log.l(`clearTableSelection(): Clearing selected rows for table:`, dt);
    // let dt:Table;
    // if(tableNumber === 1) {
    //   dt = this.dt;
    // } else if(tableNumber === 2) {
    //   dt = this.othersTable;
    // } else if(tableNumber === 3) {
    //   dt = this.logisticsTable;
    // } else if(tableNumber === 4) {
    //   dt = this.timecardsTable;
    // } else {
    //   let text:string = `clearTableSelection(): Could not find table at index '${tableNumber}' to reset it`;
    //   Log.w(text);
    //   this.notify.addWarning("CLEAR SELECTIONS ERROR", text, 5000);
    //   return;
    // }
    if(!(dt && dt instanceof Table)) {
      let text:string = `clearTableSelection(): Must provide a Table to clear selection of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR SELECTIONS ERROR", text, 5000);
      return;
    }
    dt.selection = null;
    if(dt === this.dt) {
      this.selectedReports = null;
    } else if(dt === this.othersTable) {
      this.selectedReportsOther = null;
    } else if(dt === this.logisticsTable) {
      this.selectedReportsLogistics = null;
    } else if(dt === this.timecardsTable) {
      this.selectedTimeCards = null;
    }
    return dt;
  }

  public clearTableFilters(dt:Table, evt?:Event) {
    Log.l(`clearTableFilters(): Clearing filters for table:`, dt);
    if(!(dt && dt instanceof Table)) {
      let text:string = `clearTableFilters(): Must provide a Table to clear filters of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR FILTERS ERROR", text, 5000);
      return;
    }
    let elRef:ElementRef = dt.el;
    if(!(elRef && elRef.nativeElement)) {
      let text:string = `clearTableFilters(): Must provide a Table to clear filters of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR FILTERS ERROR", text, 5000);
      return;
    }
    let el:HTMLElement = elRef.nativeElement;
    // let filterInputElements:HTMLCollectionOf<Element> = el.getElementsByClassName('reports-col-filter');
    // let filterInputElements:HTMLCollectionOf<HTMLInputElement> = el.getElementsByTagName('input');
    let filterElements = el.querySelectorAll('input.reports-col-filter');
    let filterInputElements:NodeListOf<HTMLInputElement> = (filterElements as NodeListOf<HTMLInputElement>);
    Log.l(`clearTableFilters(): filter input elements are:`, filterInputElements);
    if(filterInputElements && filterInputElements.length) {
      let count = filterInputElements.length;
      for(let i = 0; i < count; i++) {
        let inputElement:HTMLInputElement = filterInputElements[i];
        if(inputElement instanceof HTMLInputElement) {
          inputElement.value = "";
        }
      }
    }
    // let globalFilterInput:HTMLInputElement = (el.querySelector('input.global-filter-input') as HTMLInputElement);
    let globalFilterInput:HTMLInputElement = el.querySelector('input.global-filter-input');
    globalFilterInput.value = "";
    return dt;
  }

  public clearTableDates(tableNumber:TableIndexKey, dt:Table, evt?:Event) {
    let tableKey = TABLEINDEXTOKEY[tableNumber];
    Log.l(`clearTableDates(): Clearing date filters for table '${tableNumber}', which is '${tableKey}':`, dt);
    if(!(dt && dt instanceof Table)) {
      let text:string = `clearTableDates(): Must provide a Table to clear dates of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR DATES ERROR", text, 5000);
      return;
    }
    let elRef:ElementRef = dt.el;
    if(!(elRef && elRef.nativeElement)) {
      let text:string = `clearTableDates(): Must provide a Table to clear dates of. Provided parameter was not a table`;
      Log.w(text, dt);
      this.notify.addWarning("CLEAR DATES ERROR", text, 5000);
      return;
    }
    let el:HTMLElement = elRef.nativeElement;
    this.clearDates(tableNumber, dt, evt);
    return dt;
  }

  public clearAllDates(event?:Event) {
    let tables:Table[] = [
      this.dt,
      this.othersTable,
      this.logisticsTable,
      this.maintenancesTable,
      this.drivingsTable,
      this.timecardsTable,
    ];
    for(let table of tables) {
      let i = ((tables.indexOf(table) + 1) as TableIndexKey);
      if(table && table instanceof Table) {
        this.clearDates(i, table, event);
      }
    }
  }

  public clearDates(tableNumber:TableIndexKey, dt:Table, evt?:Event) {
    Log.l(`clearDates(): Clearing from and to search fields.`);
    let i:number = tableNumber - 1;
    if(i >= 0 && i < this.dateRanges.length) {
      this.dateRanges[i] = null;
    }
    dt.filter(null, 'report_date', 'startsWith');
  }

  public cancelAndExitModal(event?:Event) {
    Log.l(`cancelAndExitModal(): Scheduling page closing.`);
    this.viewCtrl.dismiss();
  }

  public saveAndExitModal(event?:Event) {
    Log.l(`saveAndExitModal(): Scheduling page closing.`);
    this.viewCtrl.dismiss();
  }

  public getMomentString(val:string|Moment, format?:string):string {
    let out:string;
    let time:Moment;
    // let format:string = "DD MMM YYYY HH:mm";
    let fmt:string = typeof format === 'string' ? format : this.dateFormat;
    if(typeof val === 'string') {
      time = moment(val);
    } else if(isMoment(val)) {
      time = moment(val);
    } else {
      Log.w(`getMomentString(): Provided with an invalid value, must be Moment or momentable string:\n`, val);
    }
    if(isMoment(time)) {
      out = time.format(format);
    } else {
      out = "--"
    }
    return out;
  }

  public async showTotalHours(total:number, count:number, evt?:MouseEvent):Promise<boolean> {
    try {
      Log.l(`showTotalHours(): Called`);
      await this.alert.showAlert("TOTAL HOURS", `<b>Hours</b>: ${total}<br><b>Count</b>: ${count}`);
      return true;
    } catch(err) {
      Log.l(`showTotalHours(): Error showing total hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async showTotalMiles(total:number, count:number, evt?:MouseEvent):Promise<boolean> {
    try {
      Log.l(`showTotalMiles(): Called`);
      await this.alert.showAlert("TOTAL MILES", `<b>Miles</b>: ${total}<br><b>Count</b>: ${count}`);
      return true;
    } catch(err) {
      Log.l(`showTotalMiles(): Error showing total hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateHoursShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateHoursShown(): Called event:`, evt);
      let table:Table = this.dt;
      let reports:Report[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let hours:number = report.getRepairHours();
        total += hours;
      }
      await this.showTotalHours(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateHoursShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateMiscHoursShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateMiscHoursShown(): Called event:`, evt);
      let table:Table = this.othersTable;
      let reports:ReportOther[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let hours:number = Number(report.getTotalHours());
        if(isNaN(hours)) {
          hours = 0;
        }
        total += hours;
      }
      await this.showTotalHours(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateMiscHoursShown(): Error calculating visible misc report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateLogisticsHoursShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateLogisticsHoursShown(): Called event:`, evt);
      let table:Table = this.logisticsTable;
      let reports:ReportLogistics[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        // let hours:number = report.getTotalTime();
        let hours:number = report.getTotalTravelHours();
        total += hours;
      }
      await this.showTotalHours(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateLogisticsHoursShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateMaintenanceHoursShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateMaintenanceHoursShown(): Called event:`, evt);
      let table:Table = this.maintenancesTable;
      let reports:ReportMaintenance[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let hours:number = report.getTotalTime();
        // let hours:number = report.getTotalWorkHours();
        total += hours;
      }
      await this.showTotalHours(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateMaintenanceHoursShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateDrivingHoursShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateDrivingHoursShown(): Called event:`, evt);
      let table:Table = this.drivingsTable;
      let reports:ReportDriving[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let hours:number = report.getTotalTime();
        // let hours:number = report.getTotalWorkHours();
        total += hours;
      }
      await this.showTotalHours(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateDrivingHoursShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateTimeCardHoursShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateTimecardHoursShown(): Called event:`, evt);
      let table:Table = this.timecardsTable;
      let reports:ReportTimeCard[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let hours:number = report.getTotalTime();
        total += hours;
      }
      await this.showTotalHours(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateTimecardHoursShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateLogisticsMilesShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateLogisticsMilesShown(): Called event:`, evt);
      let table:Table = this.logisticsTable;
      let reports:ReportLogistics[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let miles:number = report.getTotalTravelMiles();
        total += miles;
      }
      await this.showTotalMiles(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateLogisticsMilesShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  public async calculateDrivingMilesShown(evt?:MouseEvent):Promise<number> {
    try {
      Log.l(`calculateDrivingMilesShown(): Called event:`, evt);
      let table:Table = this.drivingsTable;
      let reports:ReportDriving[];
      reports = table && typeof table.hasFilter === 'function' && table.hasFilter() ? table.filteredValue : table && Array.isArray(table.value) ? table.value : [];
      let total:number = 0;
      let count:number = reports.length;
      for(let report of reports) {
        let miles:number = report.getTotalMiles();
        total += miles;
      }
      await this.showTotalMiles(total, count);
      return total;
    } catch(err) {
      Log.l(`calculateDrivingMilesShown(): Error calculating visible report hours`);
      Log.e(err);
      throw err;
    }
  }
  
  
}
