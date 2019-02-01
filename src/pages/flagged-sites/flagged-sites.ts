import { Subscription                                                } from 'rxjs'                       ;
import { sprintf                                                     } from 'sprintf-js'                 ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'              ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'              ;
import { Log                                                         } from 'domain/onsitexdomain'       ;
import { AuthService                                                 } from 'providers/auth-service'     ;
import { ServerService                                               } from 'providers/server-service'   ;
import { AlertService                                                } from 'providers/alert-service'    ;
import { OSData                                                      } from 'providers/data-service'     ;
import { Preferences                                                 } from 'providers/preferences'      ;
import { DispatchService,                                            } from 'providers/dispatch-service' ;
import { NotifyService,                                              } from 'providers/notify-service'   ;
import { Street, Address, Jobsite                                    } from 'domain/onsitexdomain'       ;
import { DataTable                                                   } from 'primeng/primeng'            ;

@IonicPage({name: "Flagged Sites"})
@Component({
  selector: 'page-flagged-sites',
  templateUrl: 'flagged-sites.html',
})
export class FlaggedSitesPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:DataTable                        ;
  public title            : string         = "Flagged Work Sites" ;
  public pageSizeOptions  : number[]       = [5,10,20,30,40,50,100];
  public prefsSub         : Subscription                  ;
  public jobsites         : Array<Jobsite> = []           ;
  public selectedJobsite  : any                           ;
  public selectedClient   : any                           ;
  public clientList       : any                           ;
  public dataReady        : boolean        = false        ;
  public sortMode         : boolean        = false        ;
  public navStatus        : string         = 'new'        ;
  public cols             : Array<any>     = []           ;
  public allFields        : Array<any>     = []           ;
  public tooltipPosition  : string         = "left"       ;
  public tooltipDelay     : number         = 500          ;
  public sprintf          : any            = sprintf      ;
  public static PREFS     : any           = new Preferences()      ;
  public get prefs()      : any { return FlaggedSitesPage.PREFS; } ;
  public get rowCount()   : number { return this.prefs.CONSOLE.pages.jobsites; };
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.jobsites = val; };

  constructor(
    public navCtrl  : NavController,
    public navParams: NavParams,
    public zone     : NgZone,
    public server   : ServerService,
    public auth     : AuthService,
    public alert    : AlertService,
    public data     : OSData,
    public notify   : NotifyService,
    public dispatch : DispatchService,
  ) {
    window['Street'] = Street;
    window['Address'] = Address;
    window['Jobsite'] = Jobsite;
    window['worksites'] = this;
    window['sprintf'] = sprintf;
    // this.clientList = [{client: "HB", fullName:"Halliburton"}];
    // this.selectedClient = this.clientList[0];
  }
  public ngOnInit() {
    Log.l("FlaggedSites: ngOnInit() fired");
  }

  public ngOnDestroy() {
    Log.l("FlaggedSites: ngOnDestroy() fired");
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public ionViewDidLoad() {
    Log.l('ionViewDidLoad FlaggedSitesPage');
  }

  public ionViewWillEnter() {
    Log.l("ionViewWillEnter FlaggedSitesPage");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    this.updatePageSizes();
    this.updateJobsiteList().then((res) => {
      Log.l("FlaggedSites: ionViewWillEnter() updated job sites successfully.");
      this.cols = this.getFields();
      this.dataReady = true;
    }).catch((err) => {
      Log.l("FlaggedSites: ionViewWillEnter() threw error while trying to update job site list!");
      Log.e(err);
    });
  }

  public initializeSubscriptions() {
    this.prefsSub = this.dispatch.prefsUpdated().subscribe(() => {
      this.updatePageSizes();
    });
  }

  public updatePageSizes() {
    let newPageSizes = this.prefs.CONSOLE.pageSizes.jobsites;
    let rowCount = Number(this.prefs.CONSOLE.pages.jobsites);
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
    let fields = [];
    fields.push({ field : 'schedule_name'     , header: 'Name'        , filter: true, filterPlaceholder: "Name"        }) ;
    fields.push({ field : '_id'               , header: 'Site ID'     , filter: true, filterPlaceholder: "Site ID"     }) ;
    fields.push({ field : 'client.fullName'   , header: 'Client'      , filter: true, filterPlaceholder: "Client"      }) ;
    fields.push({ field : 'location.fullName' , header: 'Location'    , filter: true, filterPlaceholder: "Location"    }) ;
    fields.push({ field : 'locID.fullName'    , header: 'Location ID' , filter: true, filterPlaceholder: "Location ID" }) ;
    fields.push({ field : 'address.city'      , header: 'City'        , filter: true, filterPlaceholder: "City"        }) ;
    fields.push({ field : 'address.state'     , header: 'State'       , filter: true, filterPlaceholder: "State"       }) ;
    fields.push({ field : 'travel_time'       , header: 'Travel Hrs.' , filter: true, filterPlaceholder: "Travel Hrs." }) ;
    return fields;
  }

  public addJobSite() {
    this.navCtrl.push('Add Work Site', { mode: 'Add' });
  }

  public updateJobsiteList() {
    return new Promise((resolve,reject) => {
      // this.jobsites = [];
      this.jobsites = this.data.getData('sites').slice(0);
      this.jobsites.sort((a:Jobsite, b:Jobsite) => {
        return a.sort_number < b.sort_number ? -1 : a.sort_number > b.sort_number ? 1 : 0;
      });
      if(this.jobsites && this.jobsites.length) {
        resolve(this.jobsites);
      } else {
        this.server.getJobsites().then((docs: Array<any>) => {
          Log.l("FlaggedSites: got job sites:\n", docs);
          // this.jobsites = [];
          let jobsites:Array<Jobsite> = [];
          for (let doc of docs) {
            // let doc = docs[i];
            // let newSite = new Jobsite({ "name": "HB", "fullName": "Halliburton" }, { "name": "ODS", "fullName": "Odessa" }, { "name": "MNSHOP", "fullName": "Maintenance Shop" }, new Address(new Street('', ''), '', '', ''), 0.0, 0.0, 500);
            let newSite = new Jobsite();
            newSite.readFromDoc(doc);
            jobsites.push(newSite);
            // Log.l("FlaggedSites: Read in job site:\n", newSite);
            // this.jobsites = [...this.jobsites, newSite];
          }
          this.jobsites = jobsites.sort((a:Jobsite,b:Jobsite) => {
            return a.sort_number < b.sort_number ? -1 : a.sort_number > b.sort_number ? 1 : 0;
          });
          resolve(this.jobsites);
        }).catch((err) => {
          Log.l("FlaggedSites: Error retrieving jobsites!");
          Log.e(err);
          reject(err);
        });
      }
    });
  }

  public onRowSelect(event:any) {
    Log.l("onRowSelect(): Event was:\n", event);
    this.editSite(event);
  }

  public workSiteDroppedInto(event:any) {
    Log.l("workSiteDroppedInto(): Event is:\n", event);
  }

  public workSiteDropped(event:any) {
    Log.l("workSiteDropped(): Event is:\n", event);
  }

  public editSite(siteOrEvent:any, evt?:any) {
    // Log.l("editSite(): Selected jobsite:\n", this.selectedJobsite);
    let event, site;
    if(evt) {
      event = evt;
      site = siteOrEvent;
    } else if(siteOrEvent instanceof Jobsite) {
      site = siteOrEvent;
    } else if(siteOrEvent && siteOrEvent.data && siteOrEvent.originalEvent) {
      event = siteOrEvent.originalEvent;
      site = siteOrEvent.data;
    } else {
      this.notify.addError("ERROR", "Could not edit site. Contact developers.", -1);
      return;
    }
    Log.l("editSite(): Event and site are:\n", event);
    Log.l(site);
    if(event && event.shiftKey) {
      this.navCtrl.push('Add Work Site', { mode: 'Edit', jobsite: this.selectedJobsite, sites: this.jobsites });
    } else {
      this.navCtrl.push('Work Site', {mode: 'Edit', jobsite: site, sites: this.jobsites});
    }
  }

  public saveSortOrder() {
    Log.l("saveSortOrder(): The sort order is now:");
    let str = "";
    for(let site of this.jobsites) {
      str += site.sort_number + ": " + site.getSiteName() + "\n";
    }
    Log.l(str);
    let len = this.jobsites.length;
    for(let i = 0; i < len; i++) {
      let site = this.jobsites[i];
      site.sort_number = i+1;
    }
    Log.l("saveSortOrder(): Site array is now:\n", this.jobsites);
    let spinnerID = this.alert.showSpinner("Saving all sites in new order...");
    this.server.saveJobsiteSortOrder(this.jobsites).then(res => {
      Log.l("saveSortOrder(): Success!");
      this.alert.hideSpinner(spinnerID);
      this.sortMode = false;
    }).catch(err => {
      Log.l("saveSortOrder(): Failure!");
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      // this.alert.showAlert("ERROR", "Could not save new sort order for job sites.");
      this.notify.addError("ERROR", `Could not save new sort order for job sites: ${err.message}`)
    });
  }

  public toggleSortMode() {
    this.sortMode = !this.sortMode;
    Log.l("toggleSortMode(): Sort mode is now '%s'.", this.sortMode);
  }

  public showFields() {

  }

  public generateFieldList() {

  }

}
