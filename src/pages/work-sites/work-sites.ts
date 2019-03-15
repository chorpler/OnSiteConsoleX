// import { DataTable                                                   } from 'primeng/datatable'        ;
import { Subscription    } from 'rxjs'                     ;
import { sprintf         } from 'sprintf-js'               ;
import { Component       } from '@angular/core'            ;
import { OnInit          } from '@angular/core'            ;
import { OnDestroy       } from '@angular/core'            ;
import { ViewChild       } from '@angular/core'            ;
import { IonicPage       } from 'ionic-angular'            ;
import { NavParams       } from 'ionic-angular'            ;
import { ViewController  } from 'ionic-angular'            ;
import { Log             } from 'domain/onsitexdomain'     ;
import { AuthService     } from 'providers/auth-service'   ;
import { DBService       } from 'providers/db-service'     ;
import { ServerService   } from 'providers/server-service' ;
import { AlertService    } from 'providers/alert-service'  ;
import { OSData          } from 'providers/data-service'   ;
import { Preferences     } from 'providers/preferences'    ;
import { DispatchService } from 'providers'                ;
import { NotifyService   } from 'providers'                ;
import { Jobsite         } from 'domain/onsitexdomain'     ;
import { SelectItem      } from 'primeng/api'              ;
import { Table           } from 'primeng/table'            ;
import { MultiSelect     } from 'primeng/multiselect'      ;

@IonicPage({name: "Work Sites"})
@Component({
  selector: 'work-sites',
  templateUrl: 'work-sites.html',
})
export class WorkSitesPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:Table                                     ;
  @ViewChild('columnMultiselect') columnMultiselect:MultiSelect ;
  public title          : string         = "Work Sites" ;
  public pageSizeOptions: number[]       = [5,10,20,30,40,50,100];
  public optionsVisible : boolean        = false        ;
  public optionsType    : string         = 'jobsites'   ;
  public prefsSub       : Subscription                  ;
  public site           : Jobsite                       ;
  public jobsites       : Jobsite[] = []                ;
  public orgSites       : Jobsite[] = []                ;
  public selectedJobsite: any                           ;
  public selectedClient : any                           ;
  public clientList     : any                           ;
  public dataReady      : boolean        = false        ;
  public sortMode       : boolean        = false        ;
  public navStatus      : string         = 'new'        ;
  public cols           : any[]     = []           ;
  public selectedCols   : any[]     = []           ;
  public allColumns     : any[]     = []           ;
  public tooltipPosition: string         = "left"       ;
  public tooltipDelay   : number         = 500          ;
  public sprintf        : any            = sprintf      ;
  public scrollHeight   : string = "calc(100vh - 190px)";
  public sortUpdated    : boolean = false               ;
  public tableScrollable: boolean = false               ;
  public modalMode      : boolean = false               ;
  public viewWorkSiteVisible: boolean = false           ;
  public siteEditMode   : string = "Edit"               ;
  public prevComp       : any                           ;
  public get rowCount()   : number { return this.prefs.CONSOLE.pages.jobsites; };
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.jobsites = val; };
  public get autoLayout():boolean {
    if(this.prefs && this.prefs.CONSOLE && this.prefs.CONSOLE.jobsites && this.prefs.CONSOLE.jobsites.autoLayoutTable) {
      return true;
    } else {
      return false;
    }
  };

  constructor(
    // public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public viewCtrl  : ViewController  ,
    // public zone      : NgZone          ,
    public prefs     : Preferences     ,
    public db        : DBService       ,
    public server    : ServerService   ,
    public auth      : AuthService     ,
    public alert     : AlertService    ,
    public data      : OSData          ,
    public notify    : NotifyService   ,
    public dispatch  : DispatchService ,
  ) {
    this.prevComp = window['p'];
    window['p'] = this;
    window['onsiteworksites']  = this;
    window['onsiteworksites2'] = this;
    // window['Street'] = Street;
    // window['Address'] = Address;
    // window['Jobsite'] = Jobsite;
    // window['worksites'] = this;
    // window['sprintf'] = sprintf;
    // this.clientList = [{client: "HB", fullName:"Halliburton"}];
    // this.selectedClient = this.clientList[0];
  }

  public ngOnInit() {
    Log.l("WorkSites: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  public ngOnDestroy() {
    Log.l("WorkSites: ngOnDestroy() fired");
    this.cancelSubscriptions();
    if(this.prevComp) {
      window['p'] = this.prevComp;
    }
  }

  public async runWhenReady() {
    try {
      this.prefs.CONSOLE.jobsites.autoLayoutTable = true;
      if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
      let show:string = this.navParams.get('show');
      if(show === 'active') {
        this.prefs.CONSOLE.jobsites.showAllSites = false;
      } else {
        this.prefs.CONSOLE.jobsites.showAllSites = true;
      }
      this.initializeSubscriptions();
      this.updatePageSizes();
      let res:any = await this.updateJobsiteList();
      Log.l("WorkSites: ionViewWillEnter() updated job sites successfully.");
      // this.selectedCols = this.getColumns();
      this.getColumns();
      this.dataReady = true;
      this.setPageLoaded();
      return res;
    } catch(err) {
      Log.l(`WorkSites.runWhenReady(): Error loading page!`);
      Log.e(err);
      throw err;
    }
  }

  public initializeSubscriptions() {
    this.prefsSub = this.dispatch.prefsUpdated().subscribe(() => {
      this.updatePageSizes();
    });
  }

  public cancelSubscriptions() {
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
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

  public getColumns() {
    let fields = [];
    let colList:SelectItem[] = [];
    fields.push({ field : 'site_number'       , subfield: ""      , header: 'Site No.'    , order: 0 , filter: true, filterPlaceholder: "Site #"      , class: "col-01 col-siteno"   });
    fields.push({ field : 'schedule_name'     , subfield: ""      , header: 'Name'        , order: 1 , filter: true, filterPlaceholder: "Name"        , class: "col-00 col-name"     });
    fields.push({ field : '_id'               , subfield: ""      , header: 'Site ID'     , order: 2 , filter: true, filterPlaceholder: "Site ID"     , class: "col-01 col-id"       });
    fields.push({ field : 'client'            , subfield: "value" , header: 'Client'      , order: 3 , filter: true, filterPlaceholder: "Client"      , class: "col-02 col-client"   });
    fields.push({ field : 'location'          , subfield: "value" , header: 'Location'    , order: 4 , filter: true, filterPlaceholder: "Location"    , class: "col-03 col-location" });
    fields.push({ field : 'locID'             , subfield: "value" , header: 'Location ID' , order: 5 , filter: true, filterPlaceholder: "Location ID" , class: "col-04 col-locID"    });
    fields.push({ field : 'address'           , subfield: "city"  , header: 'City'        , order: 6 , filter: true, filterPlaceholder: "City"        , class: "col-05 col-city"     });
    fields.push({ field : 'address'           , subfield: "state" , header: 'State'       , order: 7 , filter: true, filterPlaceholder: "State"       , class: "col-06 col-state"    });
    fields.push({ field : 'address'           , subfield: "zip"   , header: 'ZIP'         , order: 8 , filter: true, filterPlaceholder: "ZIP"         , class: "col-07 col-zip"      });
    fields.push({ field : 'travel_time'       , subfield: ""      , header: 'Hrs.'        , order: 9 , filter: true, filterPlaceholder: "Hrs."        , class: "col-08 col-time"     });
    fields.push({ field : 'per_diem_rate'     , subfield: ""      , header: 'Per Diem'    , order: 10, filter: true, filterPlaceholder: "Per Diem"    , class: "col-09 col-perdiem"  });
    fields.push({ field : 'lodging_rate'      , subfield: ""      , header: 'Lodging'     , order: 11, filter: true, filterPlaceholder: "Lodging"     , class: "col-10 col-lodging"  });
    fields.push({ field : 'site_active'       , subfield: ""      , header: 'Active'      , order: 12, filter: true, filterPlaceholder: "Active"      , class: "col-11 col-active"   });
    fields.push({ field : 'site_number'       , subfield: ""      , header: 'Number'      , order: 13, filter: true, filterPlaceholder: "Number"      , class: "col-12 col-siteno"   });
    fields.push({ field : 'shift_start_times' , subfield: "AM"    , header: 'AM'          , order: 14, filter: true, filterPlaceholder: "AM"          , class: "col-13 col-am"       });
    fields.push({ field : 'shift_start_times' , subfield: "PM"    , header: 'PM'          , order: 15, filter: true, filterPlaceholder: "PM"          , class: "col-14 col-pm"       });
    fields.push({ field : 'lunch_hour_time'   , subfield: ""      , header: 'Lunch (hrs)' , order: 16, filter: true, filterPlaceholder: "Lunch (hrs)" , class: "col-15 col-lunch"    });
    // for(let field of fields) {
    //   let item:SelectItem = { label: field.header, value: field };
    //   colList.push(item);
    // }
    this.selectedCols = fields.filter((a:any) => {
      // let field = a.value;
      // return field.order < 7 || field.order === 8;
      let order = a['order'] === undefined ? -1 : a.order;
      return (order >= 0 && order < 7) || order === 8;
    });
    this.allColumns = fields;
    return fields;
  }

  public addJobSite(event?:MouseEvent) {
    // if(event && event.shiftKey) {
    //   this.navCtrl.push('Add Work Site', { mode: 'Add' });
    // } else {
    //   this.navCtrl.push('Work Site', {mode: 'Add', sites: this.jobsites});
    // }
    this.siteEditMode = 'Add';
    if(event && event.shiftKey) {
      let site:Jobsite = new Jobsite();
      this.jobsites.push(site);
      this.site = site;
      this.showViewWorkSite(site);
    } else {
      let site:Jobsite = new Jobsite();
      this.jobsites.push(site);
      this.site = site;
      this.showViewWorkSite(site);
    }
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
        this.server.getJobsites().then((docs:Jobsite[]) => {
          Log.l("WorkSites: got job sites:\n", docs);
          // this.jobsites = [];
          let jobsites:Jobsite[] = docs;
          // for (let doc of docs) {
          //   // let doc = docs[i];
          //   // let newSite = new Jobsite({ "name": "HB", "fullName": "Halliburton" }, { "name": "ODS", "fullName": "Odessa" }, { "name": "MNSHOP", "fullName": "Maintenance Shop" }, new Address(new Street('', ''), '', '', ''), 0.0, 0.0, 500);
          //   let newSite = new Jobsite();
          //   newSite.readFromDoc(doc);
          //   jobsites.push(newSite);
          //   // Log.l("WorkSites: Read in job site:\n", newSite);
          //   // this.jobsites = [...this.jobsites, newSite];
          // }
          this.jobsites = jobsites.sort((a:Jobsite,b:Jobsite) => {
            return a.sort_number < b.sort_number ? -1 : a.sort_number > b.sort_number ? 1 : 0;
          });
          resolve(this.jobsites);
        }).catch((err) => {
          Log.l("WorkSites: Error retrieving jobsites!");
          Log.e(err);
          reject(err);
        });
      }
    });
  }

  public onRowSelect(evt:any) {
    Log.l("onRowSelect(): Event was:\n", evt);
    // this.editSite(event);
    let event = evt.originalEvent;
    let site = evt.data;
    this.data.currentlyOpeningPage = true;
    this.siteEditMode = 'Edit';
    this.showViewWorkSite(site);
    // if(event && event.shiftKey) {
    //   // this.navCtrl.push('Add Work Site', { mode: 'Edit', jobsite: this.selectedJobsite, sites: this.jobsites });
    //   this.navCtrl.push('Work Site', { mode: 'Edit', jobsite: this.selectedJobsite, sites: this.jobsites });
    // } else {
    //   this.navCtrl.setRoot('Work Site', {mode: 'Edit', jobsite: site, sites: this.jobsites});
    // }
  }

  public async reorderSites(evt:any):Promise<any> {
    try {
      Log.l(`reorderSites(): Event was:\n`, evt);
      let originalIndex = evt.dragIndex;
      let newIndex = evt.dropIndex;
      let sites:Jobsite[] = this.dt.value;
      let siteCount = sites.length;
      for(let i = 0; i < siteCount; i++) {
        let site:Jobsite = sites[i];
        site.sort_number = i;
      }
      this.jobsites = sites;
      // let res:Jobsite[] = await this.saveSortOrder();
      // return res;
      this.sortUpdated = true;
    } catch(err) {
      Log.l(`reorderSites(): Error saving reordered site list!`);
      Log.e(err);
      throw new Error(err);
    }
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
    this.siteEditMode = 'Edit';
    this.showViewWorkSite(site);
    // if(event && event.shiftKey) {
    //   this.navCtrl.push('Add Work Site', { mode: 'Edit', jobsite: this.selectedJobsite, sites: this.jobsites });
    // } else {
    //   this.navCtrl.push('Work Site', {mode: 'Edit', jobsite: site, sites: this.jobsites});
    // }
  }

  public showFields(sel:MultiSelect, evt?:any) {
    Log.l(`showFields(): Clicked, event and sel are:\n`, evt);
    Log.l(sel);
    // let sel:MultiSelect = this.columnMultiselect;
    if(!(sel instanceof MultiSelect)) {
      sel = this.columnMultiselect;
    }
    sel.overlayVisible = !sel.overlayVisible;
    // if(sel.overlayVisible) {
    //   Log.l(`showFields(): overlay visible, turning off.`);
    //   this.zone.run(() => { sel.hide(); });
    // } else {
    //   Log.l(`showFields(): overlay not visible, turning on.`);
    //   this.zone.run(() => { sel.show(); });
    // }
    // }
  }

  public orderColumns(event?:any):any[] {
    let selectedColumns:any[] = [];
    selectedColumns = this.selectedCols.sort((a:any,b:any) => {
      let oA = a['order'] !== undefined ? a.order : 0;
      let oB = b['order'] !== undefined ? b.order : 0;
      return oA > oB ? 1 : oA < oB ? -1 : 0;
    });
    this.selectedCols = selectedColumns;
    return this.selectedCols;
  }

  public async saveSortOrder(evt?:any):Promise<Jobsite[]> {
    try {
      Log.l(`saveSortOrder(): Attempting to save site list:\n`, this.dt.value);
      let siteList:Jobsite[] = this.dt.value;
      let updatedSites:Jobsite[] = await this.db.saveSites(siteList);
      let updatedSiteCount = 0;
      let allSites = this.jobsites.slice(0);
      if(updatedSites) {
        for(let site of updatedSites) {
          let oldSite = allSites.find((a:Jobsite) => a._id === site._id);
          if(oldSite) {
            if(oldSite._rev !== site._rev) {
              updatedSiteCount++;
              oldSite._rev = site._rev;
            }
          }
        }
        this.data.setData('sites', allSites);
        this.jobsites = allSites;
      }
      Log.l(`saveSortOrder(): Updated ${updatedSiteCount} sites, result:\n`, allSites);
      this.notify.addSuccess("SUCCESS", `Saved new work site sort order.`, 3000);
      this.sortUpdated = false;
      return allSites;
    } catch(err) {
      Log.l(`saveSortOrder(): Error saving jobsite list!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving work site sort order: '${err.message}'`, 3000);
      // throw new Error(err);
    }
  }

  public showOptions(event?:MouseEvent|KeyboardEvent) {
    this.optionsVisible = true;
  }

  public optionsClosed(event?:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public async optionsSaved(event?:any) {
    try {
      this.optionsVisible = false;
      Log.l("optionsSaved(): Event is:\n", event);
      let prefs = this.prefs.getPrefs();
      let res:any = await this.data.savePreferences(prefs);
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      // this.updatePeriodCount();
      return res;
    } catch(err) {
      Log.l(`optionsSaved(): Error saving options!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 6000);
    }
  }

  public deselectAll() {
    let dt:Table = this.dt;
    if(dt) {
      dt.selection = null;
      dt.selectRange(undefined, undefined);
    }
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }
  public showViewWorkSite(site:Jobsite, evt?:Event) {
    Log.l(`showViewWorkSite(): Event is:`, evt);
    this.site = site;
    this.orgSites = this.jobsites.slice(0);
    this.viewWorkSiteVisible = true;
  }
  public cancelViewWorkSite(evt?:Event) {
    Log.l(`cancelViewWorkSite(): Event is:`, evt);
    window['p'] = this;
    this.viewWorkSiteVisible = false;
    this.deselectAll();
    this.jobsites = this.orgSites;
    let site:Jobsite = this.site;
    if(this.siteEditMode === 'Add') {
      this.jobsites = this.jobsites.filter((a:Jobsite) => {
        return a !== site;
      });
    }
  }
  public saveViewWorkSite(evt?:Event) {
    Log.l(`saveViewWorkSite(): Event is:`, evt);
    window['p'] = this;
    this.viewWorkSiteVisible = false;
    this.deselectAll();
  }

  public toggleShowAll() {

  }

  public async toggleSiteActive(site:Jobsite, event?:MouseEvent):Promise<any> {
    try {
      Log.l(`toggleSiteActive(): Event is:`, event);
      if(event) {
        event.stopPropagation();
        // event.preventDefault();
      }
      site.site_active = !site.site_active;
      let res:any = await this.db.saveJobsite(site);
    } catch(err) {
      Log.l(`toggleSiteActive(): Error toggling site!`);
      Log.e(err);
      throw err;
    }
  }

  public toggleViewAll(evt?:MouseEvent):boolean {
    let current:boolean = this.prefs && this.prefs.CONSOLE && this.prefs.CONSOLE.jobsites && this.prefs.CONSOLE.jobsites.showAllSites ? true : false;
    let visible:boolean = !current;
    Log.l(`toggleViewAll(): View All Sites mode is:`, visible);
    this.prefs.CONSOLE.jobsites.showAllSites = visible;
    return visible;
  }

}
