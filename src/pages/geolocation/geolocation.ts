import 'rxjs/add/operator/debounceTime';
import { sprintf                                                     } from 'sprintf-js'                           ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                        ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                        ;
import { ViewController, ModalController, PopoverController          } from 'ionic-angular'                        ;
// import { FormGroup, FormControl, Validators                          } from "@angular/forms"                       ;
import { Log, moment, Moment, isMoment, oo, _dedupe                  } from 'domain/onsitexdomain'                 ;
import { OSData                                                      } from 'providers/data-service'               ;
import { AuthService                                                 } from 'providers/auth-service'               ;
import { DBService                                                   } from 'providers/db-service'                 ;
import { ServerService                                               } from 'providers/server-service'             ;
import { AlertService                                                } from 'providers/alert-service'              ;
import { Preferences                                                 } from 'providers/preferences'                ;
import { Street                                                      } from 'domain/onsitexdomain'                 ;
import { Address                                                     } from 'domain/onsitexdomain'                 ;
import { Jobsite                                                     } from 'domain/onsitexdomain'                 ;
// import { GoogleMapsAPIWrapper                                        } from '@agm/core'                            ;
import { Subscription                                                } from 'rxjs'                                 ;
import { Command, KeyCommandService                                  } from 'providers/key-command-service'        ;
import { NotifyService                                               } from 'providers/notify-service'             ;
import { ScriptService                                               } from 'providers/script-service'      ;
// import { OverlayPanel, SelectItem, Dialog, Checkbox,                 } from 'primeng/primeng'                      ;
import { SelectItem                                                  } from 'primeng/api'                          ;
import { GMap                                                        } from 'primeng/gmap'                         ;

declare const google:any;

@IonicPage({ name: "Geolocation" })
@Component({
  selector: 'page-geolocation',
  templateUrl: 'geolocation.html'
})

export class GeolocationPage implements OnInit,OnDestroy {
  @ViewChild('googleMapComponent') googleMapComponent:GMap;

  public title          : string         = "Geolocation"       ;
  public keySubscription: Subscription                         ;
  public jobsite        : Jobsite                              ;
  public sites          : Array<Jobsite> = []                  ;
  public latitude       : number         = 26.177280           ;
  public longitude      : number         = -97.964652          ;
  public siteIndex      : number         = 0                   ;
  public siteCount      : number         = 0                   ;
  public modal          : any                                  ;
  public mode           : string         = 'Add'               ;
  public source         : string         = ''                  ;
  public client         : any                                  ;
  public location       : any                                  ;
  public locID          : any                                  ;
  public clientList     : Array<any>     = []                  ;
  public locationList   : Array<any>     = []                  ;
  public locIDList      : Array<any>     = []                  ;
  public clientMenu     : SelectItem[]   = []                  ;
  public locationMenu   : SelectItem[]   = []                  ;
  public locIDMenu      : SelectItem[]   = []                  ;
  public accountMenu    : SelectItem[]   = []                  ;
  public rotations      : Array<any>     = []                  ;
  public techShifts     : Array<any>     = []                  ;
  public siteLat        : number         = 26.177260           ;
  public siteLon        : number         = -97.964594          ;
  public siteRadius     : number         = 500                 ;
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

  public shiftStartTimes           : any                ;
  public startOptions              : Array<string> = [] ;
  public startOptionsAM            : Array<string> = [] ;
  public startOptionsPM            : Array<string> = [] ;
  public startAM                   : string        = "" ;
  public startPM                   : string        = "" ;
  public timeAM                    : string        = "" ;
  public timePM                    : string        = "" ;
  public gmapOptions    : any                                  ;
  public gmapOverlays   : Array<any>     = []                  ;
  // public mapUpdateDelay : number         = 750                 ;
  public mapUpdateDelay : number         = 400                 ;
  public googleMapVisible          : boolean       = true      ;

  public addClient: any = { name: "__", fullName: "Add new client" };
  public addLocation: any = { name: "__", fullName: "Add new location" };
  public addLocID: any = { name: "__", fullName: "Add new location ID" };
  public modalMode: boolean = false;
  public dataReady: boolean = false;


  constructor(
    public navCtrl    : NavController        ,
    public navParams  : NavParams            ,
    public viewCtrl   : ViewController       ,
    public modalCtrl  : ModalController      ,
    public popover    : PopoverController    ,
    public zone       : NgZone               ,
    public prefs      : Preferences          ,
    public db         : DBService            ,
    public server     : ServerService        ,
    public alert      : AlertService         ,
    public auth       : AuthService          ,
    public data       : OSData               ,
    public scripts    : ScriptService        ,
    public keyService : KeyCommandService    ,
    public notify     : NotifyService        ,
  ) {
    window['onsitegeolocation']  = this;
    window['onsitegeolocation2'] = this;
    window['p'] = this;
    window['_dedupe'] = _dedupe;
  }

  public ngOnInit() {
    Log.l("GeolocationPage: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  public ngOnDestroy() {
    Log.l("GeolocationPage: ngOnDestroy() fired");
    this.cancelSubscriptions();
  }

  public async runWhenReady() {
    try {
      if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
      let res:any = await this.loadGoogleMapsScript();
      this.dataReady = true;
      this.updateOverlays();
      setTimeout(() => {
        this.addGoogleMapListener();
      }, this.mapUpdateDelay);
      this.setPageLoaded();
      return res;
    } catch(err) {
      Log.l(`GeolocationPage.runWhenReady(): Error during initialization!`);
      Log.e(err);
      throw new Error(err);
    }
    // this.initializeSubscribers();
  }

  public initializeSubscribers() {

  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

  public async loadGoogleMapsScript():Promise<any> {
    try {
      let key:string = "maps";
      let res:any = await this.scripts.loadScript(key);
      if(res && res.loaded) {
        return res;
      }
    } catch(err) {
      Log.l(`loadGoogleMapsScript(): Error loading script!`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public setRadius(radius:number) {
    // this.siteRadius = radius;
    this.updateOverlays();
    // this.fitMapBounds();
    // this.refreshMap();
    // new google.maps.Circle({center: {lat: 36.90707, lng: 30.56533}, fillColor: '#1976D2', fillOpacity: 0.35, strokeWeight: 1, radius: 1500}),
  }

  public updateOverlays(evt?:any) {
    // this.refreshMap();
    // setTimeout(() => {
      this.createGoogleMapsOverlays();
    // }, 500);
  }

  public fitMapBounds() {
    if(this.googleMapComponent && Array.isArray(this.gmapOverlays) && this.gmapOverlays.length > 0) {
      let map = this.googleMapComponent.getMap();
      let circle = this.gmapOverlays[0];
      let bounds = circle.getBounds();
      map.fitBounds(bounds);
    }
  }

  public addGoogleMapListener() {
    if(this.googleMapComponent) {
      let map = this.googleMapComponent.getMap();
      // map.addListener('dblclick', (e) => {
      map.addListener('rightclick', (e) => {
        this.handleMapRightClick(e);
      });
      map.addListener('click', (e) => {
        this.handleMapSingleClick(e);
      });
    }
  }

  public createGoogleMapsOverlays():Array<any> {
    if(this.jobsite) {
      Log.l(`createGoogleMapsOverlays(): current jobsite is:\n`, this.jobsite)
      let latitude  : number = Number(this.jobsite.latitude)  ||  26.177260;
      let longitude : number = Number(this.jobsite.longitude) || -97.964594;
      let radius    : number = this.jobsite.within ? Number(this.jobsite.within) : 500;
      // let radius:number = this.siteRadius ? Number(this.siteRadius) : 500;
      let strColor:string = this.radiusColor;
      let strokeColor:string = "rgba(255, 0, 0, 0.8)";
      let overlays:Array<any> = [];
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
      let center:any = {
        lat: latitude ,
        lng: longitude,
      }
      let options:any = {
        center: center,
        mapTypeId: 'hybrid',
        zoom: zoom,
      };
      let circle:any = new google.maps.Circle(
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
        }, this.mapUpdateDelay);
      }
      return overlays;
    } else {
      Log.w(`createGoogleMapsOverlays(): Invalid jobsite.`);
    }
  }

  public clearGeofenceCircle():any {
    this.gmapOverlays = null;
    this.updateOverlays();
    // this.createGoogleMapsOverlays();
    // this.refreshMap();
  }

  public addTempMapMarker(pos:{lat:number,lng:number}) {
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

  public async handleMapRightClick(evt?:any) {
    try {
      let keys = Object.keys(evt);
      let event:MouseEvent;
      for(let key of keys) {
        let item:any = evt[key];
        if(item instanceof MouseEvent) {
          event = item;
          break;
        }
      }
      // let event:any = evt && evt.fa ? evt.fa : evt;
      let loc:any = evt && evt.latLng ? evt.latLng : null;
      Log.l(`handleMapRightClick(): Map clicked, event is:\n`, evt);
      if(event && loc) {
        let lat:number = loc.lat();
        let lon:number = loc.lng();
        let strLat:string = sprintf("%.6f", lat);
        let strLon:string = sprintf("%.6f", lon);
        let newLat:number = Number(strLat);
        let newLon:number = Number(strLon);
        let pos = {
          lat: newLat,
          lng: newLon,
        };
        this.addTempMapMarker(pos);
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
      // throw new Error(err);
    }
  }

  public async handleMapSingleClick(evt?:any) {
    try {
      let keys = Object.keys(evt);
      let event:MouseEvent;
      for(let key of keys) {
        let item:any = evt[key];
        if(item instanceof MouseEvent) {
          event = item;
          break;
        }
      }
      // let event:any = evt && evt.fa ? evt.fa : evt;
      let loc:any = evt && evt.latLng ? evt.latLng : null;
      Log.l(`handleMapSingleClick(): Map clicked, event is:\n`, evt);
      if(event && loc) {
        let lat:number = loc.lat();
        let lon:number = loc.lng();
        let strLat:string = sprintf("%.6f", lat);
        let strLon:string = sprintf("%.6f", lon);
        let newLat:number = Number(strLat);
        let newLon:number = Number(strLon);
        let pos = {
          lat: newLat,
          lng: newLon,
        };
        // this.addTempMapMarker(pos);
        if(event.shiftKey) {
          this.notify.addInfo("MAP CLICKED", `Map shift-clicked at (${lat}, ${lon})`, 3000);
        } else {
          this.notify.addInfo("MAP CLICKED", `Map clicked at (${lat}, ${lon})`, 3000);
        }
      }
    } catch(err) {
      Log.l(`handleMapClick(): Error during handling of map click!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error clicking map: '${err.message}'`, 4000);
      // throw new Error(err);
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


}
