// import { GoogleMapsAPIWrapper                                        } from '@agm/core'                     ;
import { sprintf                                                     } from 'sprintf-js'                    ;
import { Subscription                                                } from 'rxjs'                          ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                 ;
import { Input, Output, EventEmitter,                                } from '@angular/core'                 ;
// import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                 ;
// import { ViewController, ModalController, PopoverController          } from 'ionic-angular'                 ;
import { Log, moment, Moment, isMoment, oo, _dedupe,                 } from 'domain/onsitexdomain'          ;
import { SESACLL, SESAClient, SESALocation, SESALocID,               } from 'domain/onsitexdomain'          ;
import { Preferences                                                 } from 'providers/preferences'         ;
import { OSData                                                      } from 'providers/data-service'        ;
import { AuthService                                                 } from 'providers/auth-service'        ;
import { DBService                                                   } from 'providers/db-service'          ;
import { ServerService                                               } from 'providers/server-service'      ;
import { AlertService                                                } from 'providers/alert-service'       ;
import { ScriptService, ScriptLoadResult,                            } from 'providers/script-service'      ;
import { Street            } from 'domain/onsitexdomain' ;
import { Address           } from 'domain/onsitexdomain' ;
import { Jobsite           } from 'domain/onsitexdomain' ;
import { CLLType           } from 'domain/onsitexdomain' ;
import { SiteKeyValue      } from 'domain/onsitexdomain' ;
import { OnSiteGeolocation } from 'domain/onsitexdomain' ;
import { ILatLng           } from 'domain/onsitexdomain' ;
import { LatLng            } from 'domain/onsitexdomain' ;

import { Command, KeyCommandService                                  } from 'providers/key-command-service' ;
import { NotifyService                                               } from 'providers/notify-service'      ;
// import { OverlayPanel                                                } from 'primeng/overlaypanel'          ;
import { SelectItem                                                  } from 'primeng/api'                   ;
import { Dialog                                                      } from 'primeng/dialog'                ;
// import { Checkbox,                                                   } from 'primeng/checkbox'              ;
import { GMap                                                        } from 'primeng/gmap'                  ;
// import '@types/googlemaps';
// declare const google:any;

export type GoogleMap     = google.maps.Map;
export type MapOptions    = google.maps.MapOptions;
export type MapTypeId     = google.maps.MapTypeId;
export type MapMouseEvent = google.maps.MouseEvent;
export type MapCircle     = google.maps.Circle;
export type MapOverlay    = google.maps.MVCObject;
export type MapOverlays   = MapOverlay[];

// export enum GoogleMapType {
//   HYBRID    = "hybrid"    ,
//   ROADMAP   = "roadmap"   ,
//   SATELLITE = "satellite" ,
//   TERRAIN   = "terrain"   ,
// }

// export enum GoogleMapType {
//   HYBRID = google.maps.MapTypeId.HYBRID,
// }

export class ModKeys {
  public shift  :boolean = false;
  public alt    :boolean = false;
  public meta   :boolean = false;
  public control:boolean = false;
  public command:boolean = false;
  public option :boolean = false;
  public windows:boolean = false;
  public context:boolean = false;
  public left   :boolean = false;
  public right  :boolean = false;
  public get cmdctrl():boolean { return (this.command || this.control || this.meta); };
  public get commandcontrol():boolean { return (this.command || this.control || this.meta); };
  constructor() {

  }
}

@Component({
  selector: 'work-site-view',
  templateUrl: 'work-site.html'
})
export class WorkSiteComponent implements OnInit,OnDestroy {
  @Input('jobsite') jobsite:Jobsite;
  @Input('sites') sites:Jobsite[] = [];
  @Input('mode') mode:string = "Add";
  @Output('onCancel') onCancel = new EventEmitter<any>();
  @Output('onSave') onSave = new EventEmitter<any>();

  @ViewChild('hoursDialog') hoursDialog:Dialog;
  // @ViewChild('hoursOverlay') hoursOverlay:OverlayPanel;
  @ViewChild('workSiteHours') workSiteHours:ElementRef;
  @ViewChild('overlayTarget') overlayTarget:ElementRef;
  @ViewChild('googleMapComponent') googleMapComponent:GMap;
  @ViewChild('workSiteDialog') workSiteDialog:Dialog;

  public workSiteHeader   : string         = "Work Site"       ;
  public showWorkSite     : boolean        = true              ;
  public workSiteModal    : boolean        = false             ;
  public workSiteClosable : boolean        = false             ;
  public workSiteESCable  : boolean        = false             ;
  // public workSiteESCable  : boolean        = true              ;
  public title            : string         = "Work Site"       ;
  // public static    PREFS: any            = new Preferences()   ;
  public keySubscription: Subscription                         ;
  public keys           : ModKeys        = new ModKeys()       ;
  public newSite        : Jobsite                              ;
  public siteIndex      : number         = 0                   ;
  public siteCount      : number         = 0                   ;
  public modal          : boolean        = false               ;
  public source         : string         = ''                  ;
  public client         : any                                  ;
  public location       : any                                  ;
  public locID          : any                                  ;
  public clientList     : any[]     = []                  ;
  public locationList   : any[]     = []                  ;
  public locIDList      : any[]     = []                  ;
  public clientMenu     : SelectItem[]   = []                  ;
  public locationMenu   : SelectItem[]   = []                  ;
  public locIDMenu      : SelectItem[]   = []                  ;
  public accountMenu    : SelectItem[]   = []                  ;
  public rotations      : any[]     = []                  ;
  public techShifts     : any[]     = []                  ;
  public siteLat        : number         = 26.177260           ;
  public siteLon        : number         = -97.964594          ;
  // public siteRadius     : number         = 500                 ;
  public lat            : number         = 26.177260           ;
  public lon            : number         = -97.964594          ;
  public mapMode        : string         = "hybrid"            ;
  public mapZoom        : number         = 16                  ;
  public radiusColor    : string         = "rgba(255,0,0,0.5)" ;
  public tmpColor       : string         = "rgba(0,255,0,0.5)" ;
  public tmpStrokeColor : string         = "rgba(0,255,0,0.8)" ;
  public tooltipPosition:string          = "left"              ;
  public tooltipDelay   :number          = 500                 ;
  public hoursDialogVisible:boolean      = false               ;
  public hoursClosable  :boolean         = false               ;
  public hoursModalMode :boolean         = false               ;
  public dropdownHeight :string          = "200px"             ;
  public cancelEdit     : boolean        = false               ;
  public addSiteLocaleVisible:boolean    = false               ;
  public addSiteLocaleType:string        = 'client'            ;
  // public gmapOptions    : any                                  ;
  public gmapOptions    : MapOptions                           ;
  public gmapOverlays   : MapOverlays   = []                   ;
  // public mapUpdateDelay : number         = 750                 ;
  public mapUpdateDelay : number         = 400                 ;
  public googleMapVisible          : boolean       = false     ;
  public map:GoogleMap;

  public shiftStartTimes           : any                       ;
  public startOptions              : string[] = []        ;
  public startOptionsAM            : string[] = []        ;
  public startOptionsPM            : string[] = []        ;
  public startAM                   : string        = ""        ;
  public startPM                   : string        = ""        ;
  public timeAM                    : string        = ""        ;
  public timePM                    : string        = ""        ;
  public onkeyup                   : any                       ;
  public onkeydown                 : any                       ;
  public debugKeys                 : boolean = false           ;
  public debugClicks               : boolean = false           ;
  public siteKeyCollision          : boolean = false           ;
  public scheduleNameCollision     : boolean = false           ;
  public siteNumberCollision       : boolean = false           ;
  public sortNumberReadOnly        : boolean = true            ;
  public dialogTarget              : string  = null            ;
  // public dialogTarget              : string  = "body"          ;

  // public addClient   : SESAClient   = new SESAClient(  { name: "__", fullName: "Add new client"      , code: "__", value: "Add new client"      , capsName: "ADD NEW CLIENT"      , scheduleName: "Add new client"      ,});
  // public addLocation : SESALocation = new SESALocation({ name: "__", fullName: "Add new location"    , code: "__", value: "Add new location"    , capsName: "ADD NEW LOCATION"    , scheduleName: "Add new location"    ,});
  // public addLocID    : SESALocID    = new SESALocID(   { name: "__", fullName: "Add new location ID" , code: "__", value: "Add new location ID" , capsName: "ADD NEW LOCATION ID" , scheduleName: "Add new location ID" ,});
  // public addLoc2nd                  : any     = {name:"__", fullName:"Add new secondary location"} ;
  public modalMode: boolean = false;
  public dataReady: boolean = false;
  public prevComp : any;
  public keyListeningElement:Element|Window;
  public siteError:boolean = false;
  public workSiteDialogClasses:string = "work-site-dialog";
  public contentStyle:any = {
    "min-height": "500px",
  };

  constructor(
    // public navCtrl    : NavController        ,
    // public navParams  : NavParams            ,
    // public viewCtrl   : ViewController       ,
    // public modalCtrl  : ModalController      ,
    public prefs      : Preferences          ,
    public scripts    : ScriptService        ,
    public db         : DBService            ,
    public server     : ServerService        ,
    public alert      : AlertService         ,
    public auth       : AuthService          ,
    public data       : OSData               ,
    public keyService : KeyCommandService    ,
    public notify     : NotifyService        ,
  ) {
    window['onsiteworksite']  = this;
    window['onsiteworksite2'] = this;
    this.prevComp = window['p'];
    window['p'] = this;
    window['_dedupe'] = _dedupe;
  }

  public ngOnInit() {
    Log.l("WorkSiteComponent: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  public ngOnDestroy() {
    Log.l("WorkSiteComponent: ngOnDestroy() fired");
    this.cancelSubscriptions();
    if(this.prevComp) {
      window['p'] = this.prevComp;
    }
  }

  public async loadGoogleMapsScript():Promise<any> {
    try {
      Log.l(`loadGoogleMapsScript(): Starting`)
      let key:string = "maps";
      let res:ScriptLoadResult = await this.scripts.loadScript(key);
      if(res && res.loaded) {
        Log.l(`loadGoogleMapsScript(): Returning in a good way`)
        return res;
      }
      Log.l(`loadGoogleMapsScript(): Returning in a bad way`)
    } catch(err) {
      Log.l(`loadGoogleMapsScript(): Error loading script!`);
      Log.e(err);
      throw err;
    }
  }

  public async runWhenReady() {
    try {
      this.initializeSubscribers();
      this.modalMode = false;
      this.modal = false;
      this.source = "worksites";
      this.title = `${this.mode} Job Site`;
      this.workSiteHeader = this.title;
      if(this.jobsite != undefined) {
        this.siteIndex = this.sites.indexOf(this.jobsite) + 1;
        this.siteCount = this.sites.length;
        // this.siteLat = this.jobsite.latitude;
        // this.siteLon = this.jobsite.longitude;
        // this.siteRadius = this.jobsite.within;
      } else {
        this.jobsite = new Jobsite();
        this.sites.push(this.jobsite);
        this.newSite = this.jobsite;
        this.siteIndex = this.sites.length;
        let sortedSites = this.sites.sort((a:Jobsite, b:Jobsite) => {
          let sA = a.site_number;
          let sB = b.site_number;
          return sA > sB ? 1 : sA < sB ? -1 : 0;
        });
        let siteNumber = sortedSites[sortedSites.length - 1].site_number;
        siteNumber++;
        this.jobsite.setSiteNumber(siteNumber);
        this.siteCount = this.sites.length;
      }
      Log.l(`WorkSiteComponent: Mode is '${this.mode}' and jobsite is:\n`, this.jobsite);

      for(let i = 0; i < 24; i++) {
        for(let j = 0; j < 60; j += 30) {
          let time = sprintf("%02d:%02d", i, j);
          this.startOptions.push(time);
          this.startOptionsAM.push(time);
          this.startOptionsPM.push(time);
        }
      }
      if(this.jobsite) {
        let times = this.jobsite.getShiftStartTimes();
        this.shiftStartTimes = times;
        this.startAM = times.AM;
        this.startPM = times.PM;
      }
      // this.server.getClients().then((res:any[]) => {
      //   Log.l("WorkSiteComponent: got client data:\n", res);
      //   this.clientList = res;
      //   this.clientList.push(this.addClient);
      //   return this.server.getLocations();
      // }).then((res:any[]) => {
      //   Log.l("WorkSiteComponent: got location data:\n", res);
      //   this.locationList = res;
      //   this.locationList.push(this.addLocation);
      //   return this.server.getLocIDs();
      // }).then((res:any[]) => {
      //   Log.l("WorkSiteComponent: got locID data:\n", res);
      //   this.locIDList = res;
      //   this.locIDList.push(this.addLocID);
      //   // return this.server.getLoc2nds();
      //   // }).then((res) => {
      //   // Log.l("WorkSiteComponent: got loc2nd data:\n", res);
      //   // this.loc2ndList = res;
      //   // this.loc2ndList.push(this.addLoc2nd);
      //   return this.server.getShiftRotations();
      // }).then((res:any[]) => {
      //   Log.l("WorkSiteComponent: got shift rotation data:\n", res);
      //   this.rotations = res;
      //   let rotnames = Object.keys(this.jobsite.shiftRotations);
      //   if(!rotnames.length) {
      //     this.jobsite.shiftRotations = this.rotations;
      //   }
      //   return this.server.getTechShifts();
      this.setDialogTitle();
      let res:any = await this.getConfigData();
      Log.l("WorkSiteComponent: got tech shift data:\n", res);
      this.techShifts = res;
      let shiftNames = Object.keys(this.jobsite.techShifts);
      if(!shiftNames.length) {
        this.jobsite.techShifts = this.techShifts;
      }
      Log.l("WorkSiteComponent: all data ready, Jobsite is:\n", this.jobsite);
      this.initializeDropdownOptions();
      this.initializeForm();
      // this.createGoogleMapsOverlays();
      // this.updateForm();
      res = await this.loadGoogleMapsScript();
      this.dataReady = true;
      this.googleMapVisible = true;
      Log.l(`WorkSiteComponent.runWhenReady(): About to await updateOverlays ...`);
      res = await this.updateOverlays();
      Log.l(`WorkSiteComponent.runWhenReady(): Done with that, now about to setTimeout`);
      setTimeout(() => {
        let out:any = this.addGoogleMapListener();
        this.setPageLoaded();
        this.initializeKeyListeners();
        Log.l(`WorkSiteComponent.runWhenReady(): Done with all timeouts and stuff!`);
      }, this.mapUpdateDelay);
      Log.l(`WorkSiteComponent.runWhenReady(): Returning...`);
      return res;
    } catch(err) {
      Log.l(`WorkSiteComponent.runWhenReady(): Error during initialization!`);
      Log.e(err);
      this.setPageLoaded();
      // throw err;
    }
    // }).catch((err) => {
    //   Log.l("WorkSiteComponent: error getting data!");
    //   Log.e(err);
    // });
  }

  public initializeSubscribers() {
    this.keySubscription = this.keyService.commands.subscribe((command: Command) => {
      switch(command.name) {
        case "WorkSiteComponent.saveNoExit"  : this.saveNoExit(); break;
        case "WorkSiteComponent.sitePrevious": this.sitePrevious(); break;
        case "WorkSiteComponent.siteNext"    : this.siteNext(); break;
        case "WorkSiteComponent.onSubmit"    : this.onSubmit(); break;
      }
    });
  }

  public cancelSubscriptions() {
    // let el = window;
    Log.l(`WorkSite.cancelSubscriptions(): Now unsubscribing to keys, clicks, and hotkeys …`);
    if(this.keySubscription && this.keySubscription.unsubscribe) {
      this.keySubscription.unsubscribe();
    }
    this.cancelMapListeners();
    this.cancelKeyListeners();
  }

  public setPageLoaded() {
    Log.l(`WorkSite.setPageLoaded(): Page is now loaded!`);
    this.data.currentlyOpeningPage = false;
  }

  public cancelKeyListeners() {
    let el = this.keyListeningElement ? this.keyListeningElement : window;
    // if(el && typeof (el as any).eventListeners === 'function') {
    if(el) {
      // let listeners = (el as any).eventListeners();
      el.removeEventListener('keydown' , this.onkeydown);
      el.removeEventListener('keyup'   , this.onkeyup);
      this.keyListeningElement = null;
    } else {
      Log.w(`cancelKeyListeners(): Could not find element to remove listeners from:`, this.keyListeningElement);
    }
  }

  public cancelMapListeners() {
    let map:GoogleMap = this.map ? this.map : this.googleMapComponent.getMap();
    if(map && google && google.maps && google.maps.event) {
      google.maps.event.clearListeners(map, 'click');
      google.maps.event.clearListeners(map, 'dblclick');
      google.maps.event.clearListeners(map, 'rightclick');
    } else {
      Log.w(`cancelMapListeners(): Could not find Google Map object to remove listeners from`);
    }
  }

  public initializeKeyListeners(element?:Element) {
    Log.l(`initializeKeyListeners(): Started …`);
    if(this.workSiteDialog && this.workSiteDialog.el && this.workSiteDialog.el.nativeElement) {
      // let dlg:HTMLElement = this.workSiteDialog.el.nativeElement;
      // let el = window;
      let bodyElement:Element = document.querySelector('.onsiteconsolex-index-body');
      let el = element && element instanceof Element ? element : bodyElement && bodyElement instanceof Element ? bodyElement : window;
      // let opts:AddEventListenerOptions = {
      //   capture: undefined,
      //   once: false,
      //   passive: undefined,
      // };
      // opts = null;
      // const keydown = (evt:KeyboardEvent) => {
      //   // let key = evt.key;
      //   // Log.l(`KeyDown: '${key}'`);

      //   return this.keydown(evt);
      // };
      // const keyup = (evt:KeyboardEvent) => {
      //   // let key = evt.key;
      //   // Log.l(`KeyUp: '${key}'`);
      //   return this.keyup(evt);
      // };
      this.keyListeningElement = el;
      this.onkeydown = this.keydown.bind(this);
      this.onkeyup = this.keyup.bind(this);
      // el.addEventListener('keydown', keydown, opts);
      // el.addEventListener('keyup', keyup, opts);
      // el.addEventListener('keydown', this.keydown.bind(this) , opts);
      // el.addEventListener('keyup'  , this.keyup.bind(this)   , opts);
      // el.addEventListener('keydown', this.keydown.bind(this) , opts);
      // el.addEventListener('keyup'  , this.keyup.bind(this)   , opts);
      // dlg.addEventListener('onkeydown', keydown, opts);
      // dlg.addEventListener('onkeyup', keyup, opts);
      el.addEventListener('keydown', this.onkeydown );
      el.addEventListener('keyup'  , this.onkeyup   );
    } else {
      Log.w(`initializeKeyListeners(): Could not find dialog to attach key listener to`);
    }
  }

  public keydown(evt:KeyboardEvent) {
    if(evt && evt.repeat) {
      return;
    }
    let key = evt.key;
    // let code = evt.code;
    // let isModifierKey:boolean = true;
    if(this.debugKeys) {
      Log.l(`KeyDown: '${key}':`, evt);
    }
    // Log.l(`KeyDown: 'this' points to:`, this);
    switch(key) {
      case 'Alt':
        this.keys.alt     = true;
        this.keys.option  = true;
        break;
      case 'Command':
        this.keys.command = true;
        break;
        case 'ContextMenu':
        this.keys.context = true;
        break;
        case 'Control':
        this.keys.control = true;
        break;
        case 'Meta':
        this.keys.meta    = true;
        this.keys.windows = true;
        this.keys.command = true;
        break;
      case 'Option':
        this.keys.option  = true;
        this.keys.alt     = true;
        break;
      case 'Shift':
        this.keys.shift   = true;
        break;
      default:
        // isModifierKey     = false;
    }
    window['onsitekeys'] = this.keys;
    // if(isModifierKey) {
    //   if(code.indexOf('Left') > -1) {
    //     this.keys.left    = true;
    //   }
    //   if(code.indexOf('Right') > -1) {
    //     this.keys.right   = true;
    //   }
    // }
  }

  public keyup(evt:KeyboardEvent) {
    if(evt && evt.repeat) {
      return;
    }
    let key = evt.key;
    // let code = evt.code;
    // let isModifierKey:boolean = true;
    // Log.l(`KeyDown: '${key}':`, evt);
    // Log.l(`KeyUp: 'this' points to:`, this);
    switch(key) {
      case 'Alt':
        this.keys.alt     = false;
        break;
      case 'Command':
        this.keys.command = false;
        break;
      case 'ContextMenu':
        this.keys.context = false;
        break;
      case 'Control':
        this.keys.control = false;
        break;
      case 'Meta':
        this.keys.meta    = false;
        this.keys.windows = false;
        break;
      case 'Option':
        this.keys.option  = false;
        break;
      case 'Shift':
        this.keys.shift   = false;
        break;
      default:
        // isModifierKey     = false;
    }
    window['onsitekeys'] = this.keys;
    // if(isModifierKey) {
    //   if(code.indexOf('Left') > -1) {
    //     this.keys.left    = true;
    //   }
    //   if(code.indexOf('Right') > -1) {
    //     this.keys.right   = true;
    //   }
    // }
  }

  public closeModal(evt?:any) {
    // this.viewCtrl.dismiss();
    this.onCancel.emit(true);
  }

  public close() {
    this.onCancel.emit(true);
  }

  public setDialogTitle():string {
    let site  = this.jobsite;
    let sites = this.sites;
    let idx   = sites.indexOf(site);
    let count = sites.length;
    let mode  = this.mode || "Edit";
    this.siteIndex = idx + 1;
    this.siteCount = count;
    this.title =  `${mode} Job Site (${this.siteIndex} / ${this.siteCount})`
    this.workSiteHeader =  this.title;
    return this.workSiteHeader;
  }

  public initializeDropdownOptions() {
    Log.l("initializeDropdownOptions(): Now running...");
    // let sites = this.sites;
    // let site = this.jobsite;
    // let clientList    = _dedupe(sites.map((a:Jobsite) => a.client));
    // let locationList  = _dedupe(sites.map((a:Jobsite) => a.location));
    // let locIDList     = _dedupe(sites.map((a:Jobsite) => a.locID));

    // this.clientList   = clientList;
    // this.locationList = locationList;
    // this.locIDList    = locIDList;
  }

  public initializeForm() {
    Log.l("initializeForm(): Now running...");
    let site = this.jobsite;
    let clientMenu:SelectItem[]   = [];
    let locationMenu:SelectItem[] = [];
    let locIDMenu:SelectItem[]    = [];
    for(let client of this.clientList) {
      let item:SelectItem = {label: client.fullName, value: client};
      clientMenu.push(item);
    }
    for(let location of this.locationList) {
      let item:SelectItem = {label: location.fullName, value: location};
      locationMenu.push(item);
    }
    for(let locID of this.locIDList) {
      let item:SelectItem = {label: locID.fullName, value: locID};
      locIDMenu.push(item);
    }
    let accountMenu:SelectItem[]  = [
      {label: "Contract", value: "Contract" },
      {label: "Account" , value: "Account"  },
    ];

    let cli = site.client.code.toUpperCase();
    let loc = site.location.code.toUpperCase();
    let lid = site.locID.code.toUpperCase();
    Log.l(`initializeForm(): Now loading site ${cli}, ${loc}, ${lid} ...`);
    let client, location, locID;
    let clientEntry = clientMenu.find((a:SelectItem) => {
      return cli === a.value.code.toUpperCase();
    });
    if(clientEntry && clientEntry.value) {
      client = clientEntry.value;
    }
    let locationEntry = locationMenu.find((a:SelectItem) => {
      return loc === a.value.code.toUpperCase();
    });
    if(locationEntry && locationEntry.value) {
      location = locationEntry.value;
    }
    let locIDEntry = locIDMenu.find((a:SelectItem) => {
      return lid === a.value.code.toUpperCase();
    });
    if(locIDEntry && locIDEntry.value) {
      locID = locIDEntry.value;
    }

    this.clientMenu   = clientMenu;
    this.locationMenu = locationMenu;
    this.locIDMenu    = locIDMenu;
    this.accountMenu  = accountMenu;

    this.client   = client;
    this.location = location;
    this.locID    = locID;
  }

  public async getConfigData() {
    try {
      let res:any = await this.db.getClients();
      Log.l("getConfigData(): got client data:\n", res);
      this.clientList = res;
        // this.clientList.push(this.addClient);
      res = await this.db.getLocations();
      Log.l("getConfigData(): got location data:\n", res);
      this.locationList = res;
      // this.locationList.push(this.addLocation);
      res = await this.db.getLocIDs();
      Log.l("getConfigData(): got locID data:\n", res);
      this.locIDList = res;
        // this.locIDList.push(this.addLocID);
        // return this.server.getLoc2nds();
        // }).then((res) => {
        // Log.l("WorkSiteComponent: got loc2nd data:\n", res);
        // this.loc2ndList = res;
        // this.loc2ndList.push(this.addLoc2nd);
      res = await this.server.getShiftRotations();
      Log.l("getConfigData(): got shift rotation data:\n", res);
      this.rotations = res;
        // let rotnames = Object.keys(this.jobsite.shiftRotations);
        // if(!rotnames.length) {
        //   this.jobsite.shiftRotations = this.rotations;
        // }
      res = await this.server.getTechShifts();
      Log.l("getConfigData(): got tech shift data:\n", res);
      this.techShifts = res;
        // let shiftNames = Object.keys(this.jobsite.techShifts);
        // if(!shiftNames.length) {
        //   this.jobsite.techShifts = this.techShifts;
        // }
      return res;
    } catch(err) {
      Log.l(`getConfigData(): Error getting client, location, locID, or whatever!`);
      Log.e(err);
      throw err;
    }
  }

  public async addJobSite(evt?:any) {
    try {
      this.dataReady = false;
      this.mode = 'Add';
      let cli:SESAClient   = new SESAClient()  ;
      let loc:SESALocation = new SESALocation();
      let locID = {
        "capsName" : "MAINTENANCE SHOP",
        "code"     : "MNSHOP"          ,
        "fullName" : "Maintenance Shop",
        "value"    : "Maintenance Shop",
        "name"     : "MNSHOP"          ,
        "techClass": "M-TECH"          ,
        "id"       : 87                ,
      };
      let lid:SESALocID    = new SESALocID(locID)   ;
      // let jobsite = new Jobsite(cli, loc, lid, new Address(new Street('', ''), '', '', ''), 26.177260, -97.964594, 500);
      let jobsite:Jobsite = new Jobsite();
      jobsite.client = cli;
      jobsite.location = loc;
      jobsite.locID = lid;
      let sortedSites = this.sites.sort((a:Jobsite, b:Jobsite) => {
        let sA = a.site_number;
        let sB = b.site_number;
        return sA > sB ? 1 : sA < sB ? -1 : 0;
      });
      let siteNumber = sortedSites[sortedSites.length - 1].site_number;
      siteNumber++;
      jobsite.setSiteNumber(siteNumber);
      sortedSites = this.sites.sort((a: Jobsite, b: Jobsite) => {
        let sA = a.sort_number;
        let sB = b.sort_number;
        return sA > sB ? 1 : sA < sB ? -1 : 0;
      });
      let sortNumber = sortedSites[sortedSites.length - 1].sort_number;
      jobsite.sort_number = sortNumber + 1;
      this.sites.push(jobsite);
      this.siteIndex = this.sites.length;
      this.siteCount = this.sites.length;
      let times = jobsite.getShiftStartTimes();
      this.shiftStartTimes = times;
      this.startAM = times.AM;
      this.startPM = times.PM;
      let res:any = await this.getConfigData();
      jobsite.techShifts = this.techShifts;
      jobsite.shiftRotations = this.rotations;
      this.jobsite = jobsite;
      this.initializeDropdownOptions();
      this.initializeForm();
      // this.updateForm();
      this.updateDisplay();
      this.dataReady = true;
      return res;
    } catch(err) {
      Log.l("addJobSite(): Error while adding.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error adding new job site:<br>\n<br>\n" + err.message);
    }
  }

  public async cloneJobSite(evt?:MouseEvent):Promise<any> {
    try {
      this.dataReady = false;
      this.mode = 'Add';
      let oldSite:Jobsite = this.jobsite;
      let bkSite:Jobsite = this.jobsite.clone();
      let newSite:Jobsite = this.jobsite.clone();
      let cli:SESAClient   = new SESAClient()  ;
      let loc:SESALocation = new SESALocation();
      let locID = {
        "capsName" : "MAINTENANCE SHOP",
        "code"     : "MNSHOP"          ,
        "fullName" : "Maintenance Shop",
        "value"    : "Maintenance Shop",
        "name"     : "MNSHOP"          ,
        "techClass": "M-TECH"          ,
        "id"       : 87                ,
      };
      let lid:SESALocID    = new SESALocID(locID)   ;
      let sortedSites = this.sites.sort((a:Jobsite, b:Jobsite) => {
        let sA = a.site_number;
        let sB = b.site_number;
        return sA > sB ? 1 : sA < sB ? -1 : 0;
      });
      let jobsite:Jobsite = newSite;
      let siteNumber = sortedSites[sortedSites.length - 1].site_number;
      siteNumber++;
      jobsite.setSiteNumber(siteNumber);
      sortedSites = this.sites.sort((a: Jobsite, b: Jobsite) => {
        let sA = a.sort_number;
        let sB = b.sort_number;
        return sA > sB ? 1 : sA < sB ? -1 : 0;
      });
      let sortNumber = sortedSites[sortedSites.length - 1].sort_number;
      jobsite.sort_number = sortNumber + 1;
      this.sites.push(jobsite);
      this.siteIndex = this.sites.length;
      this.siteCount = this.sites.length;
      let times = jobsite.getShiftStartTimes();
      this.shiftStartTimes = times;
      this.startAM = times.AM;
      this.startPM = times.PM;
      let res:any = await this.getConfigData();
      jobsite.techShifts = this.techShifts;
      jobsite.shiftRotations = this.rotations;
      this.jobsite = jobsite;
      this.initializeDropdownOptions();
      this.initializeForm();
      // this.updateForm();
      this.updateDisplay();
      this.dataReady = true;
      return res;
    } catch(err) {
      Log.l("addJobSite(): Error while adding.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error adding new job site:<br>\n<br>\n" + err.message);
    }
  }

  public updateDisplay() {
    // let f = this.jobSiteForm;
    this.setDialogTitle();
    let a = this.jobsite.address;
    let b = this.jobsite.billing_address;
    let a_s = a.street;
    let b_s = b.street;
    // f.controls.address.setValue();
    // f.controls.billing_address.setValue();
    let client = this.clientList.find(a => {
      return a.code.toUpperCase() === this.jobsite.client.code.toUpperCase();
    });
    let location = this.locationList.find(a => {
      return a.code.toUpperCase() === this.jobsite.location.code.toUpperCase();
    });
    let locID = this.locIDList.find(a => {
      return a.code.toUpperCase() === this.jobsite.locID.code.toUpperCase();
    });

    this.client   = client   ;
    this.location = location ;
    this.locID    = locID    ;
    this.updateLatLon();
    // this.refreshMap();
  }

  public updateSiteKey(type:CLLType, value:SiteKeyValue) {
    let site:Jobsite = this.jobsite;
    if(type === 'client') {
      site.client = value;
    } else if(type === 'location') {
      site.location = value;
    } else if(type === 'locID') {
      site.locID = (value as SESALocID);
    } else if(type === 'aux') {
      site.aux = value;
    } else {
      Log.w(`WorkSite.updateSiteKey(): Could not find site key type:`, type);
      return;
    }
    site.generateSiteID();
    this.checkForDuplication();
    this.checkForScheduleNameCollision();
  }

  public updateClient(client:any) {
    Log.l("updateClient(): Set to:\n", client);
    if(client.code === '__') {
      this.addNewClient();
    } else {
      this.jobsite.client = client;
    }
    this.jobsite.generateSiteID();
  }

  public updateLocation(location:any) {
    Log.l("updateLocation(): Set to:\n", location);
    if(location.code === '__') {
      this.addNewLocation();
    } else {
      this.jobsite.location = location;
      this.jobsite.address.city = location.fullName;
    }
    this.jobsite.generateSiteID();
  }

  public updateLocID(locID:any) {
    Log.l("updateLocID(): Set to:\n", locID);
    if(locID.code === '__') {
      this.addNewLocID();
    } else {
      this.jobsite.locID = locID;
    }
    this.jobsite.generateSiteID();
  }

  public updateLatLon(evt?:any) {
    Log.l(`updateLatLon(): Event is:`, evt);
    let lat = Number(this.jobsite.latitude);
    let lon = Number(this.jobsite.longitude);
    if(!isNaN(lat) && !isNaN(lon)) {
      this.jobsite.latitude = lat;
      this.jobsite.longitude = lon;
      // this.createGoogleMapsOverlays();
      this.updateOverlays();
    }
  }

  public updateRadius(evt?:any) {
    Log.l(`updateRadius(): Event is:`, evt);
    // let radius = Number(this.siteRadius);
    let radius = Number(this.jobsite.within);
    if(!isNaN(radius)) {
      this.jobsite.within = radius;
      this.setRadius(radius);
    }
  }

  public addNewLocation() {
    Log.l("addNewLocation(): Called, now adding new location...");
    // let addLocationPage = this.modalCtrl.create('Add New Location', {}, { cssClass: 'add-location-modal' });
    // addLocationPage.onDidDismiss(data => {
    //   Log.l("Got back:\n", data);
    //   if(data) {
    //     let newLocation = data;
    //     this.insertLocation(newLocation);
    //   }
    // });
    // addLocationPage.present();
    this.addSiteLocaleType = 'location';
    this.addSiteLocaleVisible = true;
  }

  public async insertLocation(newLocation: any) {
    // this.locationList.pop();
    this.locationList.push(newLocation);
    // this.locationList.push(this.addLocation);
    this.jobsite.location = newLocation;
    // this.jobSiteForm.controls['location'].setValue(newLocation);
    this.server.saveLocation(newLocation).then((res) => {
      Log.l("insertLocation(): Saved new location successfully!");
    }).catch((err) => {
      Log.l("insertLocation(): Error saving new location!");
      Log.e(err);
    });
  }

  public addNewLocID() {
    Log.l("addNewLocID(): Called, now adding new location...");
    // let addLocIDPage = this.modalCtrl.create('Add New Location ID', {}, { cssClass: 'add-locid-modal' });
    // addLocIDPage.onDidDismiss(data => {
    //   Log.l("Got back:\n", data);
    //   if(data != null) {
    //     let newLocID = data;
    //     this.insertLocID(newLocID);
    //   }
    // });
    // addLocIDPage.present();
    this.addSiteLocaleType = 'locID';
    this.addSiteLocaleVisible = true;
  }

  public insertLocID(newLocID:any) {
    // this.locIDList.pop();
    this.locIDList.push(newLocID);
    // this.locIDList.push(this.addLocation);
    this.jobsite.locID = newLocID;
    // this.jobSiteForm.controls['locID'].setValue(newLocID);
    this.server.saveLocID(newLocID).then((res) => {
      Log.l("insertLocID(): Saved new locID successfully!");
      this.notify.addSuccess("SAVED", `New Tech Class ID created`, 3000);
    }).catch((err) => {
      Log.l("insertLocID(): Error saving new locID!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving new Tech Class ID: ${err.message}`, 10000);
    });
  }

  public addNewClient() {
    Log.l("addClient(): Called, now adding new client...");
    // let addClientPage = this.modalCtrl.create('Add New Client', {}, { cssClass: 'add-client-modal' });
    // addClientPage.onDidDismiss(data => {
    //   Log.l("Got back:\n", data);
    //   if(data != null) {
    //     let newClient = { name: data.clientAbbreviation, fullName: data.clientName };
    //     this.insertClient(newClient);
    //   }
    // });
    // addClientPage.present();
    this.addSiteLocaleType = 'client';
    this.addSiteLocaleVisible = true;
  }

  public insertClient(newClient: any) {
    // this.clientList.pop();
    this.clientList.push(newClient);
    // this.clientList.push(this.addClient);
    this.jobsite.client = newClient;
    // this.jobSiteForm.controls['client'].setValue(newClient);
    this.server.saveClient(newClient).then((res) => {
      Log.l("insertClient(): Saved new client successfully!");
      this.notify.addSuccess("SAVED", `New client created`, 3000);
    }).catch((err) => {
      Log.l("insertClient(): Error saving new client!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving new client: ${err.message}`, 10000);
    });
  }

  public saveSite() {
    return new Promise((resolve, reject) => {
      // let siteInfo = this.jobSiteForm.value;
      let siteInfo = this.jobsite;
      // Log.l(siteInfo);
      let client     = siteInfo.client      ;
      let location   = siteInfo.location    ;
      let locID      = siteInfo.locID       ;
      let siteNumber = siteInfo.site_number ;
      let existing = this.sites.filter((a: Jobsite) => {
        return a.client.code === client.code && a.location.code === location.code && a.locID.code === locID.code;
      });
      let locMatches = existing.length;
      let existingNumber = this.sites.filter((a: Jobsite) => {
        return a.site_number === siteNumber;
      });
      let numberMatches = existingNumber.length;
      if(locMatches > 1 && this.mode !== 'Edit') {
        // this.alert.showAlert("DUPLICATION", "There is already a site with that client, location, and location ID!").then(res => {
        reject({ message: `Site already exists for client '${client.fullName}', location '${location.fullName}', locID '${locID.fullName}'.` })
        // });
      } else if(numberMatches > 1 && this.mode !== 'Edit') {
        reject({ message: `Site already exists with number '${siteNumber}'.` })
      } else {
        // for(let prop in siteInfo) {
        //   let val = siteInfo[prop];
        //   Log.l(`saveSite(): Now setting jobsite['${prop}'] to: `, val);
        //   if(prop == 'address') {
        //     this.jobsite.address = new Address(new Street(val.street.street1, val.street.street2), val.city, val.state, val.zip);
        //   } else if(prop == 'billing_address') {
        //     this.jobsite.billing_address = new Address(new Street(val.street.street1, val.street.street2), val.city, val.state, val.zip);
        //   } else {
        //     this.jobsite[prop] = siteInfo[prop];
        //   }
        // }
        let lat = Number(this.jobsite.latitude);
        let lon = Number(this.jobsite.longitude);
        let rad = Number(this.jobsite.within);
        this.jobsite.latitude  = lat ? lat: this.jobsite.latitude  ;
        this.jobsite.longitude = lon ? lon: this.jobsite.longitude ;
        this.jobsite.within    = rad ? rad: this.jobsite.within    ;

        delete this.jobsite['_$visited'];

        this.db.saveJobsite(this.jobsite).then((res) => {
          Log.l("saveSite(): Successfully saved jobsite.");
          resolve(res);
        }).catch((err) => {
          Log.l("saveSite(): Error saving jobsite!");
          Log.e(err);
          this.notify.addError("ERROR", `Error saving work site: ${err.message}`, 10000);
          reject(err);
        });
      }
    });
  }

  public async onSubmit(evt?:MouseEvent) {
    let spinnerID;
    try {
      Log.l("onSubmit(): Now attempting to save jobsite from form:");
      spinnerID = await this.alert.showSpinnerPromise('Saving job site...');
      let res:any = await this.saveSite();
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addSuccess("SAVED", "Saved jobsite successfully.", 3000);
      this.cancelEdit = false;
      // this.leavePage();
      this.onSave.emit(true);
      return res;
    } catch(err) {
      Log.l("onSubmit(): Error saving site.");
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error saving site: ${err.message}`, 5000);
    }
  }

  public leavePage() {
    // if(this.source === 'worksites') {
    //   this.navCtrl.setRoot("Work Sites");
    // } else {
    //   this.viewCtrl.dismiss();
    // }
    if(this.cancelEdit) {
      this.cancel();
    } else {
      // this.navCtrl.setRoot("Work Sites");
      this.exitPage(false);
    }
  }

  public async saveNoExit(evt?:MouseEvent) {
    let spinnerID;
    try {
      Log.l("saveNoExit(): Now attempting to save jobsite from form:");
      spinnerID = await this.alert.showSpinnerPromise('Saving job site...');
      let res:any = await this.saveSite();
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addSuccess("SUCCESS", "Saved jobsite successfully");
      this.cancelEdit = false;
      // this.leavePage();
      // this.onSave.emit(true);
      return res;
    } catch(err) {
      Log.l("saveNoExit(): Error saving site.");
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error saving site: ${err.message}`, 5000);
    }
  }

  // public editSiteHours() {
  //   Log.l("editSiteHours(): Called, now editing site hours...");
  //   let editSiteHoursModal = this.modalCtrl.create('Edit Site Hours', { shiftRotations: this.rotations, jobsite: this.jobsite }, { cssClass: 'edit-site-hours-modal' });
  //   editSiteHoursModal.onDidDismiss(data => {
  //     Log.l("Got back:\n", data);
  //   });
  //   editSiteHoursModal.present();
  // }

  public editSiteHours(event:any) {
    Log.l("editSiteHours(): Called with event:\n", event);
    // let editSiteHoursModal = this.modalCtrl.create('Edit Site Hours', { shiftRotations: this.rotations, jobsite: this.jobsite }, { cssClass: 'edit-site-hours-modal' });
    // editSiteHoursModal.onDidDismiss(data => {
    //   Log.l("Got back:\n", data);
    // });
    // editSiteHoursModal.present();
    // this.hoursOverlay.show(event);
    // this.hoursOverlay.show({}, this.overlayTarget.nativeElement);
    this.showHoursDialog();
  }

  public showHoursDialog() {
    this.hoursDialogVisible = true;
  }

  public hideHoursDialog() {
    this.hoursDialogVisible = false;
  }

  public jobsiteUpdated(event:any) {
    Log.l("jobsiteUpdated(): Event received:\n", event);
    // this.hoursOverlay.hide();
    this.hideHoursDialog();
  }


  public async cancel(evt?:MouseEvent):Promise<any> {
    let res:any
    try {
      Log.l("Canceled input of job site.");
      let confirm:boolean = await this.alert.showConfirmYesNo("CANCEL", "Are you sure you want to cancel? Any unsaved changes will be lost.");
      if(confirm) {
        this.cancelEdit = false;
        let site:Jobsite = this.jobsite;
        // if(this.mode === 'Add') {
        //   this.sites = this.sites.filter((a:Jobsite) => {
        //     return a !== site;
        //   });
        //   // let idx:number = this.sites.findIndex((a:Jobsite) => {
        //   //   return a === site;
        //   // });
        //   // if(idx > -1) {
        //   // }
        // }
        this.exitPage(true);
      } else {
        Log.l("cancel(): User declined to cancel edit.")
      }
      return res;
    } catch(err) {
      Log.l(`cancel(): Error during cancel!`);
      Log.e(err);
      throw err;
    }
  }

  public exitPage(isCancel?:boolean) {
    let res:any;
    if(this.mode.toLowerCase() === 'add' && isCancel) {
      let site:Jobsite = this.jobsite;
      this.sites = this.sites.filter((a:Jobsite) => {
        return a !== site;
      });
  // let i = this.sites.indexOf(this.newSite);
      // if(i > -1) {
      //   this.sites.splice(i, 1);
      // }
    } else {
    }
    this.onCancel.emit(true);
  }

  public cancelAndExitModal(evt?:any) {
    let event = evt ? evt : null;
    Log.l(`cancelAndExitModal(): Event is:`, event);
    this.cancel(event);
  }

  public startTimeUpdated(shiftType:string, time:string) {
    Log.l("startTimeUpdated(): Now updating start time for '%s' to '%s'...", shiftType, time);
    this.jobsite.shift_start_times[shiftType] = time;
    // if(shiftType === 'AM') {
    //   this.jobsite.shift_start_times.AM = time;
    // } else if(shiftType === 'PM') {
    //   this.jobsite.shift_start_times.PM = time;
    // }
  }

  public addressCopy(direction: "up" | "down") {
    // let f = this.jobSiteForm.value;
    let f = this.jobsite;
    let a1 = f.address;
    let b1 = f.billing_address;
    let src = a1, dest = b1;
    if(direction === 'down') {
      dest.city = src.city                     + "";
      dest.state = src.state                   + "";
      dest.zipcode = src.zipcode               + "";
      dest.street.street1 = src.street.street1 + "";
      dest.street.street2 = src.street.street2 + "";
      // this.updateDisplay();
    } else if(direction === 'up') {
      src = b1, dest = a1;
      dest.city = src.city                     + "";
      dest.state = src.state                   + "";
      dest.zipcode = src.zipcode               + "";
      dest.street.street1 = src.street.street1 + "";
      dest.street.street2 = src.street.street2 + "";
      // this.updateDisplay();
    } else {
      let errStr = `addressCopy(): Invalid option '${direction}' passed! Valid options are 'down' (address to billing) or 'up' (billing to address)!`;
      Log.w(errStr);
      this.alert.showAlert("ERROR", errStr);
    }
  }

  public numberize(val:any) {
    let num = Number(val);
    if(isNaN(num)) {
      Log.w("numberize(): Non-numerical value specified: " + val);
      return null;
    } else {
      return num;
    }
  }

  public sitePrevious() {
    if(this.siteIndex > 1) {
      this.siteIndex--;
      this.jobsite = this.sites[this.siteIndex - 1];
      this.updateDisplay();
    }
  }

  public siteNext() {
    if(this.siteIndex < this.siteCount) {
      this.siteIndex++;
      this.jobsite = this.sites[this.siteIndex - 1];
      this.updateDisplay();
    }
  }

  public noPrevious() {
    this.notify.addWarn("ALERT", `No previous work site.`, 3000);
    // this.alert.showAlert("START OF SITES", "Can't go to previous work site. Already at start of list.");
  }

  public noNext() {
    this.notify.addWarn("ALERT", `No next work site.`, 3000);
    // this.alert.showAlert("END OF SITES", "Can't go to next work site. Already at end of list.");
  }

  public addSiteLocaleSave(evt?:any) {
    let event:any = evt ? evt : "NO_SITE_LOCALE";
    Log.l(`addSiteLocaleSave(): Site Locale added, event is:`, event);
    this.addSiteLocaleVisible = false;
    if(event instanceof SESAClient) {
      let client:SESAClient = event;
      let item:SelectItem = {
        label: client.value,
        value: client,
      };
      this.clientMenu.push(item);
      this.client = client;
      this.updateClient(client);
    } else if(event instanceof SESALocation) {
      let location:SESALocation = event;
      let item:SelectItem = {
        label: location.fullName,
        value: location,
      };
      this.locationMenu.push(item);
      this.location = location;
      this.updateLocation(location);
    } else if(event instanceof SESALocID) {
      let locID:SESALocID = event;
      let item:SelectItem = {
        label: locID.fullName,
        value: locID,
      };
      this.locIDMenu.push(item);
      this.locID = locID;
      this.updateLocID(locID);
    }
  }

  public addSiteLocaleCancel(evt?:any) {
    Log.l(`addSiteLocaleCancel(): Add Site Locale canceled`);
    this.addSiteLocaleVisible = false;
  }

  public async setRadius(radius:number):Promise<any> {
    // this.siteRadius = radius;
    Log.l(`setRadius(): Started.`);

    let out:any = await this.updateOverlays();
    Log.l(`setRadius(): Returning...`);
    return out;
    // this.fitMapBounds();
    // this.refreshMap();
    // new google.maps.Circle({center: {lat: 36.90707, lng: 30.56533}, fillColor: '#1976D2', fillOpacity: 0.35, strokeWeight: 1, radius: 1500}),
  }

  public async updateOverlays(evt?:any):Promise<any> {
    // this.refreshMap();
    // setTimeout(() => {
      Log.l(`updateOverlays(): Started.`);
      let out:any = await this.createGoogleMapsOverlays();
      Log.l(`updateOverlays(): Returning...`);
      return out;
    // }, 500);
  }

  public fitMapBounds() {
    if(this.googleMapComponent && Array.isArray(this.gmapOverlays) && this.gmapOverlays.length > 0) {
      let map:GoogleMap = this.googleMapComponent.getMap();
      let circle = this.gmapOverlays[0];
      if(circle instanceof google.maps.Circle) {
        let bounds = circle.getBounds();
        map.fitBounds(bounds);
      }
    }
  }

  public addGoogleMapListener() {
    if(this.googleMapComponent) {
      let map:google.maps.Map = this.googleMapComponent.getMap();
      // map.addListener('dblclick', (e) => {
      map.addListener('rightclick', this.handleMapRightClick.bind(this));
      map.addListener('dblclick'  , this.handleMapRightClick.bind(this));
      map.addListener('click'     , this.handleMapSingleClick.bind(this));
    }
  }

  public async createGoogleMapsOverlays():Promise<any> {
    try {
      return new Promise((resolve,reject) => {
        if(this.jobsite) {
          Log.l(`createGoogleMapsOverlays(): current jobsite is:`, this.jobsite)
          let latitude  : number = Number(this.jobsite.latitude)  ||  26.177260;
          let longitude : number = Number(this.jobsite.longitude) || -97.964594;
          let radius    : number = this.jobsite.within ? Number(this.jobsite.within) : 500;
          // let radius:number = this.siteRadius ? Number(this.siteRadius) : 500;
          let strColor:string = this.radiusColor;
          let strokeColor:string = "rgba(255, 0, 0, 0.8)";
          let overlays:any[] = [];
          let zoom:number = 16;
          if(radius < 20) {
            zoom = 21;
          } else if(radius < 50) {
            zoom = 20;
          } else if(radius < 100) {
            zoom = 19;
          } else if(radius < 250) {
            zoom = 18;
          } else if(radius < 500) {
            zoom = 17;
          } else {
            zoom = 16;
          }
          let center:ILatLng = {
            lat: latitude ,
            lng: longitude,
          };
          // let maptype:GoogleMapType = 'hybrid';
          // let maptype:MapTypeId = GoogleMapType.HYBRID;
          let options:MapOptions = {
            center: center,
            // mapTypeId: 'hybrid',
            // mapTypeId: google.maps.MapTypeId.HYBRID,
            mapTypeId: ('hybrid' as any),
            zoom: zoom,
            disableDoubleClickZoom: true,
          };
          let circle = new google.maps.Circle(
            {
              center: center,
              fillColor: strColor,
              strokeColor: strokeColor,
              strokeWeight: 1,
              radius: radius,
            }
          );
          // this.gmapOverlays = [];
          // this.gmapOverlays.push(circle);
          // this.gmapOptions = options;
          overlays.push(circle);
          Log.l(`createGoogleMapOverlays(): Options and overlays will be:\n`, options);
          Log.l(overlays);
          this.gmapOptions = options;
          this.gmapOverlays = overlays;
          if(this.googleMapComponent) {
            setTimeout(() => {
              this.googleMapComponent.initialize();
              let map:any = this.googleMapComponent.getMap();
              map.setCenter(center);
              map.setZoom(zoom);
              this.fitMapBounds();
              this.addGoogleMapListener();
              Log.l(`createGoogleMapOverlays(): Done doing all the google maps stuff.`);
              resolve(true);
            }, this.mapUpdateDelay);
          } else {
            Log.l(`createGoogleMapOverlays(): Oh no, couldn't initialize the Google Maps stuff!`);
            resolve(false);
          }
          // return overlays;
        } else {
          let errText:string = `createGoogleMapsOverlays(): Invalid jobsite.`;
          Log.l(errText);
          let err:Error = new Error(errText);
          Log.e(err);
          reject(err);
        }
      });
    } catch(err) {
      Log.l(`createGoogleMapsOverlays(): Error creating overlays, perhaps invalid jobsite or location`);
      Log.e(err);
      throw err;
    }
  }

  public clearGeofenceCircle():any {
    this.gmapOverlays = null;
    this.updateOverlays();
    // this.createGoogleMapsOverlays();
    // this.refreshMap();
  }

  public addTempMapMarker(pos:ILatLng) {
    let radius:number = this.jobsite.within || 500;
    let center = pos;
    let map = this.googleMapComponent.getMap();
    let tmpColor:string       = this.tmpColor       ;
    let tmpStrokeColor:string = this.tmpStrokeColor ;
    let marker = new google.maps.Marker({
      position: center
    });
    let tmpCircle:any = new google.maps.Circle(
      {
        center: center,
        fillColor: tmpColor,
        strokeColor: tmpStrokeColor,
        strokeWeight: 1,
        radius: radius,
      }
    );
    this.gmapOverlays.push(marker);
    this.gmapOverlays.push(tmpCircle);
  }

  public async handleMapRightClick(evt?:MapMouseEvent, thisObject?:any) {
    try {
      if(this.debugClicks) {
        Log.l(`handleMapRightClick(): Map clicked, event is:`, evt);
      }
      // let keys = Object.keys(evt);
      // let event:MouseEvent;
      // for(let key of keys) {
      //   let item:any = evt[key];
      //   if(item instanceof MouseEvent) {
      //     event = item;
      //     break;
      //   }
      // }
      let loc:google.maps.LatLng = evt && evt.latLng ? evt.latLng : null;
      if(evt && typeof evt.stop === 'function') {
        // evt.stop();
      }
      // if(event && loc) {
      if(loc) {
        let lat:number = loc.lat();
        let lon:number = loc.lng();
        let strLat:string = sprintf("%.6f", lat);
        let strLon:string = sprintf("%.6f", lon);
        let newLat:number = Number(strLat);
        let newLon:number = Number(strLon);
        let pos:ILatLng = {
          lat: newLat,
          lng: newLon,
        };
        this.addTempMapMarker(pos);
        let map:GoogleMap = this.googleMapComponent.getMap();
        let oldCenter = map.getCenter();
        map.setCenter(pos);
        // if(event.shiftKey) {
        let addNewLocation:boolean = true;
        if(addNewLocation) {
          let confirm:boolean = await this.alert.showConfirmYesNo("UPDATE SITE", `Do you want to set the work site location to (${strLat}, ${strLon})?`);
          if(confirm) {
            this.jobsite.latitude  = newLat;
            this.jobsite.longitude = newLon;
            this.updateOverlays();
          } else {
            Log.l("handleMapRightClick(): User chose not to update jobsite.");
            this.gmapOverlays.pop();
            this.gmapOverlays.pop();
            map.setCenter(oldCenter);
            this.notify.addInfo("CANCELED", `Job site location not updated.`, 3000);
          }
        } else {
          this.notify.addInfo("MAP CLICKED", `Map clicked at (${lat}, ${lon})`, 3000);
        }
      }
    } catch(err) {
      Log.l(`handleMapRightClick(): Error during handling of map click!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error clicking map: '${err.message}'`, 4000);
      // throw err;
    }
  }

  public async handleMapSingleClick(evt?:MapMouseEvent) {
    try {
      if(this.debugClicks) {
        Log.l(`handleMapSingleClick(): Map clicked, event:`, evt);
      }
      // Log.l(`handleMapSingleClick(): Map clicked, event and this:`, evt, this);
      // let keys = Object.keys(evt);
      // let event:MouseEvent;
      // for(let key of keys) {
      //   let item:any = evt[key];
      //   if(item instanceof MouseEvent) {
      //     event = item;
      //     break;
      //   }
      // }
      // let event:any = evt && evt.fa ? evt.fa : evt;

      // let keys:ModKeys = this.keys && typeof this.keys.shift === 'boolean' ? this.keys : window['onsitekeys'] && typeof window['onsitekeys'].shift === 'boolean' ? window['onsitekeys'] : new ModKeys();
      // const rightClick = (event?:MapMouseEvent) => {
      //   return this.handleMapRightClick(event);
      // };
      // if(keys.shift || keys.cmdctrl) {
      //   await rightClick(evt);
      // }
      // if(this.keys) {
      if(this.keys.shift || this.keys.cmdctrl) {
        Log.l(`handleMapSingleClick(): Modifier key pressed during click, handing off to right/double click handler …`);
        return this.handleMapRightClick(evt);
      }
      // }

      // let loc:google.maps.LatLng = evt && evt.latLng ? evt.latLng : null;
      // if(evt && typeof evt.stop === 'function') {
      //   evt.stop();
      // }
      // // if(event && loc) {
      // if(loc) {
      //   let lat:number = loc.lat();
      //   let lon:number = loc.lng();
      //   let strLat:string = sprintf("%.6f", lat);
      //   let strLon:string = sprintf("%.6f", lon);
      //   let newLat:number = Number(strLat);
      //   let newLon:number = Number(strLon);
      //   let pos = {
      //     lat: newLat,
      //     lng: newLon,
      //   };
      //   // this.addTempMapMarker(pos);
      //   // if(event.shiftKey) {
      //   //   this.notify.addInfo("MAP CLICKED", `Map shift-clicked at (${lat}, ${lon})`, 3000);
      //   // } else {
      //     // this.notify.addInfo("MAP CLICKED", `Map clicked at (${lat}, ${lon})`, 3000);
      //   // }
      // }
    } catch(err) {
      Log.l(`handleMapSingleClick(): Error during handling of map click!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error clicking map: '${err.message}'`, 4000);
      // throw err;
    }
  }

  public refreshMap() {
    let map:GMap = this.googleMapComponent;
    if(map) {
      this.googleMapComponent.initialize();
    } else {
      Log.w(`refreshMap(): Can't refresh map when no map is displayed.`);
    }
  }

  public setSiteError():string {
    this.siteError = true;
    this.workSiteDialogClasses = "work-site-dialog site-error";
    return this.workSiteDialogClasses;
  }

  public clearSiteError():string {
    this.siteError = false;
    this.workSiteDialogClasses = "work-site-dialog";
    return this.workSiteDialogClasses;
  }

  public toggleSiteError():string {
    let base:string = "work-site-dialog";
    let out:string = base;
    this.siteError = !this.siteError;
    if(this.siteError) {
      out = base + " site-error";
    }
    this.workSiteDialogClasses = out;
    return out;
  }

  public isSiteDuplicate():boolean {
    let site:Jobsite    = this.jobsite;
    let sites:Jobsite[] = this.sites  ;
    let isDuplicate:boolean = false   ;
    for(let js of sites) {
      if(js.isDuplicateOf(site)) {
        isDuplicate = true;
        break;
      }
    }
    return isDuplicate;
  }

  public getDuplicateSiteIndex():number {
    let site:Jobsite = this.jobsite;
    let i:number = this.sites.indexOf(site);
    let dupeIndex:number = -1;
    let dupeSites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      return a.isDuplicateOf(site);
    });
    for(let js of dupeSites) {
      let idx:number = this.sites.indexOf(js);
      if(idx !== i) {
        dupeIndex = idx;
      }
    }
    return dupeIndex;
  }

  public checkForDuplication() {
    let idx:number = this.getDuplicateSiteIndex();
    if(idx > -1) {
      this.workSiteHeader = this.title + " (COLLISION WITH SITE " + idx + ")";
      this.siteKeyCollision = true;
    } else {
      this.workSiteHeader = this.title;
      this.siteKeyCollision = false;
    }
  }

  public checkForScheduleNameCollision() {
    let site:Jobsite = this.jobsite;
    let sname:string = site.getScheduleName().toUpperCase();
    let idx:number = -1;
    for(let js of this.sites) {
      let siteSN:string = js.getScheduleName().toUpperCase();
      if(siteSN === sname && site !== js) {
        idx = this.sites.indexOf(js);
        break;
      }
    }
    if(idx > -1) {
      this.workSiteHeader = this.title + " (SCHEDULE NAME COLLISION WITH SITE " + idx + ")";
      this.scheduleNameCollision = true;
    } else {
      this.workSiteHeader = this.title;
      this.scheduleNameCollision = false;
    }
  }

  public checkForSiteNumberCollision() {
    let site:Jobsite = this.jobsite;
    let mynumber:number = site.getSiteNumber();
    let idx:number = -1;
    for(let js of this.sites) {
      let jsnum:number = js.getSiteNumber();
      if(mynumber === jsnum && site !== js) {
        idx = this.sites.indexOf(js);
        break;
      }
    }
    if(idx > -1) {
      this.workSiteHeader = this.title + " (SITE NUMBER COLLISION WITH SITE " + idx + ")";
      this.siteNumberCollision = true;
    } else {
      this.workSiteHeader = this.title;
      this.siteNumberCollision = false;
    }
  }

}
