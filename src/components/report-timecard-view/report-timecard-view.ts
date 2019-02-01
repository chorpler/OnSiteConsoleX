import { Subscription                                              } from 'rxjs'                          ;
import { sprintf                                                   } from 'sprintf-js'                    ;
import { Component, OnInit, OnDestroy, NgZone, Input, Output,      } from '@angular/core'                 ;
import { ElementRef, ViewChild, EventEmitter,                      } from '@angular/core'                 ;
import { OptionsComponent                                          } from 'components/options/options'    ;
import { ServerService                                             } from 'providers/server-service'      ;
import { DBService                                                 } from 'providers/db-service'          ;
import { AuthService                                               } from 'providers/auth-service'        ;
import { AlertService                                              } from 'providers/alert-service'       ;
import { OSData                                                    } from 'providers/data-service'        ;
// import { PDFService                                                } from 'providers/pdf-service'         ;
import { NumberService                                             } from 'providers/number-service'      ;
import { ScriptService                                             } from 'providers/script-service'      ;
import { Jobsite, Employee, Schedule, Shift, PayrollPeriod         } from 'domain/onsitexdomain'          ;
import { ReportTimeCard,                                           } from 'domain/onsitexdomain'          ;
import { Log, moment, Moment, isMoment, oo, _dedupe,               } from 'domain/onsitexdomain'          ;
// import { SESAClient, SESALocation, SESALocID, SESAAux,             } from 'domain/onsitexdomain'          ;
import { OnSiteGeolocation                                         } from 'domain/onsitexdomain'          ;
import { ILatLng                                                   } from 'domain/onsitexdomain'          ;
import { Message, SelectItem, InputTextarea, Dropdown,             } from 'primeng/primeng'               ;
import { NotifyService                                             } from 'providers/notify-service'      ;
import { Command, KeyCommandService                                } from 'providers/key-command-service' ;
import { Dialog,                                                   } from 'primeng/dialog'                ;

declare const google:any;

@Component({
  selector:    'report-timecard-view',
  templateUrl: 'report-timecard-view.html',
})
export class ReportTimeCardViewComponent implements OnInit,OnDestroy {
  @ViewChild('reportTimeCardViewDialog') reportTimeCardViewDialog:Dialog;
  @Input('mode')       mode : string = "edit"        ;
  @Input('shift')     shift : Shift                  ;
  @Input('period')   period : PayrollPeriod          ;
  @Input('report')   report : ReportTimeCard        ;
  @Input('reports') reports : ReportTimeCard[] = [] ;
  @Input('tech')       tech : Employee               ;
  @Input('site')       site : Jobsite                ;
  @Input('sites')     sites : Jobsite[]         = [] ;
  @Output('finished') finished = new EventEmitter<any>();
  @Output('reportChange') reportChange = new EventEmitter<any>();
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('save')     save = new EventEmitter<any>();
  // @ViewChild('googleMapComponent') googleMapComponent:GMap;
  // @ViewChild('locationMenu') locationMenu:Dropdown;
  public title      : string         = "View Time Card"   ;
  public visible    : boolean        = true               ;
  public dialogLeft : number         = 250                ;
  public dialogTop  : number         = 100                ;
  public header     : string         = "View Time Card"   ;
  public keySubscription: Subscription                    ;
  public dialogTarget:any            = null               ;
  public calendarTarget:any          = 'body'             ;

  public moment                      = moment             ;
  public idx        : number         = 0                  ;
  public count      : number         = 0                  ;
  public report_date: Date                                ;
  // public client     : any            ;
  // public location   : any            ;
  // public locID      : any            ;

  // public clients     :Array<any>     = []                 ;
  // public locations   :Array<any>     = []                 ;
  // public locIDs      :Array<any>     = []                 ;
  public repair_hours:number = 0;
  public time_start  :Date           = new Date()         ;
  public time_end    :Date           = new Date()         ;
  public time_final  :Date           = new Date()         ;
  public locFrom     :string         = ""                 ;
  public locTo       :string         = ""                 ;
  public locFinal    :string         = ""                 ;
  public milesStart  :number         = 0                  ;
  public milesEnd    :number         = 0                  ;
  public milesFinal  :number         = 0                  ;
  public clientList  :SelectItem[]   = []                 ;
  public locationList:SelectItem[]   = []                 ;
  public locIDList   :SelectItem[]   = []                 ;
  public timeList    :SelectItem[]   = []                 ;
  public reportUndo  :ReportTimeCard[] = []              ;

  // public location    : OnSiteGeolocation = new OnSiteGeolocation();

  // public gmapOptions    : any                                  ;
  // public gmapOverlays   : any[]          = []                  ;
  // public mapUpdateDelay : number         = 750                 ;
  // public mapUpdateDelay : number         = 400                 ;
  // public googleMapVisible          : boolean       = false      ;
  // public googleMapVisible          : boolean       = true      ;
  // public mapMode        : string         = "hybrid"            ;
  // public mapZoom        : number         = 16                  ;
  // public radiusColor    : string         = "rgba(255,0,0,0.5)" ;
  // public tmpColor       : string         = "rgba(0,255,0,0.5)" ;
  // public tmpStrokeColor : string         = "rgba(0,255,0,0.8)" ;



  public dataReady   :boolean        = false              ;

  constructor(
    public db         : DBService         ,
    public server     : ServerService     ,
    public alert      : AlertService      ,
    public data       : OSData            ,
    public notify     : NotifyService     ,
    public keyService : KeyCommandService ,
    public scripts    : ScriptService     ,
    public numServ    : NumberService     ,
  ) {
    window['onsitetimecardreportview']  = this;
    window['onsitetimecardreportview2'] = this;
    window['p'] = this;
    window['_dedupe'] = _dedupe;
  }

  ngOnInit() {
    Log.l("ReportTimeCardViewComponent: ngOnInit() called");
    if(this.data.isAppReady()) {
      let backupReport:ReportTimeCard = oo.clone(this.report);
      this.reportUndo.push(backupReport);
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportTimeCardViewComponent: ngOnDestroy() fired.");
    this.cancelSubscriptions();
  }

  public installSubscribers() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "ReportTimeCardView.previous" : this.previous(); break;
        case "ReportTimeCardView.next"     : this.next(); break;
        case "ReportTimeCardView.previous" : this.previous(); break;
        case "ReportTimeCardView.next"     : this.next(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
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
      throw err;
    }
  }

  public async runWhenReady() {
    this.installSubscribers();

    // let out:any = await this.loadGoogleMapsScript();
    // // let clients:SESAClient[]     = this.sites.map((a:Jobsite) => a.client);
    // // let locations:SESALocation[] = this.sites.map((a:Jobsite) => a.location);
    // // let locIDs:SESALocID[]       = this.sites.map((a:Jobsite) => a.locID);
    // // this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    // // this.locations = _dedupe(this.sites.map((a:Jobsite) => a.location));
    // // this.locIDs    = _dedupe(this.sites.map((a:Jobsite) => a.locID));
    // // this.clients   = _dedupe(clients  , 'value');
    // // this.locations = _dedupe(locations, 'value');
    // // this.locIDs    = _dedupe(locIDs   , 'value');
    Log.l(`runWhenReady(): Done loading google maps script`)
    let rpt:ReportTimeCard = this.report || this.reports[0];
    this.idx = this.reports.indexOf(rpt);
    this.count = this.reports.length;
    // let site = this.getReportLocation();
    // this.site = site;
    let report:ReportTimeCard = this.report;
    this.setHeader()
    this.createMenuLists();
    this.updateDisplay(report);
    this.dataReady = true;
    // this.googleMapVisible = true;
    // this.updateOverlays();
  }

  // public updateOverlays(evt?:any) {
  //   // this.refreshMap();
  //   // setTimeout(() => {
  //     this.createGoogleMapsOverlays();
  //   // }, 500);
  // }

  // public fitMapBounds() {
  //   // if(this.googleMapComponent && Array.isArray(this.gmapOverlays) && this.gmapOverlays.length > 0) {
  //   //   let map = this.googleMapComponent.getMap();
  //   //   let circle = this.gmapOverlays[0];
  //   //   let bounds = circle.getBounds();
  //   //   map.fitBounds(bounds);
  //   // }
  // }

  // public addGoogleMapListener() {
  //   if(this.googleMapComponent) {
  //     let map = this.googleMapComponent.getMap();
  //     // map.addListener('dblclick', (e) => {
  //     map.addListener('rightclick', (e) => {
  //       this.handleMapRightClick(e);
  //     });
  //     map.addListener('click', (e) => {
  //       this.handleMapSingleClick(e);
  //     });
  //   }
  // }

  // public createGoogleMapsOverlays():Array<any> {
  //   let rpt:ReportTimeCard = this.report;
  //   let loc1:OnSiteGeolocation = rpt.fromLocation  ;
  //   let loc2:OnSiteGeolocation = rpt.toLocation    ;
  //   let loc3:OnSiteGeolocation = rpt.finalLocation ;
  //   if(!this.location) {
  //     if(loc1 instanceof OnSiteGeolocation) {
  //       this.location = loc1;
  //     }
  //   }

  //   // if(this.jobsite) {
  //   //   Log.l(`createGoogleMapsOverlays(): current jobsite is:\n`, this.jobsite)
  //   //   let latitude  : number = Number(this.jobsite.latitude)  ||  26.177260;
  //   //   let longitude : number = Number(this.jobsite.longitude) || -97.964594;

  //   let latLng = this.location.toLatLng();
  //   let latitude:number  = Number(latLng.lat);
  //   let longitude:number = Number(latLng.lng);
  //   // let radius    : number = this.jobsite.within ? Number(this.jobsite.within) : 500;
  //   let radius:number = 500;
  //     // let radius:number = this.siteRadius ? Number(this.siteRadius) : 500;
  //     let strColor:string = this.radiusColor;
  //     let strokeColor:string = "rgba(255, 0, 0, 0.8)";
  //     let overlays:Array<any> = [];
  //     let zoom:number = 15;
  //     // if(radius < 20) {
  //     //   zoom = 21;
  //     // } else if(radius < 50) {
  //     //   zoom = 20;
  //     // } else if(radius < 100) {
  //     //   zoom = 19;
  //     // } else if(radius < 250) {
  //     //   zoom = 18;
  //     // } else if(radius < 500) {
  //     //   zoom = 17;
  //     // } else {
  //     //   zoom = 16;
  //     // }
  //     let center:any = {
  //       lat: latitude ,
  //       lng: longitude,
  //     }
  //     let options:any = {
  //       center: center,
  //       mapTypeId: 'hybrid',
  //       zoom: zoom,
  //     };
  //     // let circle:any = new google.maps.Circle(
  //     //   {
  //     //     center: center,
  //     //     fillColor: strColor,
  //     //     strokeColor: strokeColor,
  //     //     strokeWeight: 1,
  //     //     radius: radius,
  //     //   }
  //     // );
  //     // this.gmapOverlays = [];
  //     // this.gmapOverlays.push(circle);
  //     // this.gmapOptions = options;
  //     let marker:any = new google.maps.Marker({
  //       position: center,
  //       title: "Location",
  //     });
  //     // overlays.push(circle);
  //     overlays.push(marker);
  //     Log.l(`createGoogleMapOverlays(): Options and overlays will be:\n`, options);
  //     Log.l(overlays);
  //     this.gmapOptions = options;
  //     this.gmapOverlays = overlays;
  //     if(this.googleMapComponent) {
  //       setTimeout(() => {
  //         this.googleMapComponent.initialize();
  //         let map:any = this.googleMapComponent.getMap();
  //         map.setCenter(center);
  //         map.setZoom(zoom);
  //         this.fitMapBounds();
  //         this.addGoogleMapListener();
  //       }, this.mapUpdateDelay);
  //     }
  //     return overlays;
  //   // } else {
  //   //   Log.w(`createGoogleMapsOverlays(): Invalid jobsite.`);
  //   // }
  // }

  // public addTempMapMarker(pos:ILatLng) {
  //   // let radius:number = this.jobsite.within || 500;
  //   let radius:number = 500;
  //   let center = pos;
  //   let map = this.googleMapComponent.getMap();
  //   let tmpColor:string       = this.tmpColor       ;
  //   let tmpStrokeColor:string = this.tmpStrokeColor ;
  //   let marker = new google.maps.Marker({
  //     position: center
  //   });
  //   let tmpCircle:any = new google.maps.Circle(
  //     {
  //       center: center,
  //       fillColor: tmpColor,
  //       strokeColor: tmpStrokeColor,
  //       strokeWeight: 1,
  //       radius: radius,
  //     }
  //   );
  //   this.gmapOverlays.push(marker);
  //   this.gmapOverlays.push(tmpCircle);
  // }

  // public async handleMapRightClick(evt?:any) {
  //   try {
  //     let keys = Object.keys(evt);
  //     let event:MouseEvent;
  //     for(let key of keys) {
  //       let item:any = evt[key];
  //       if(item instanceof MouseEvent) {
  //         event = item;
  //         break;
  //       }
  //     }
  //     // let event:any = evt && evt.fa ? evt.fa : evt;
  //     let loc:any = evt && evt.latLng ? evt.latLng : null;
  //     Log.l(`handleMapRightClick(): Map clicked, event is:\n`, evt);
  //     // if(event && loc) {
  //     //   let lat:number = loc.lat();
  //     //   let lon:number = loc.lng();
  //     //   let strLat:string = sprintf("%.6f", lat);
  //     //   let strLon:string = sprintf("%.6f", lon);
  //     //   let newLat:number = Number(strLat);
  //     //   let newLon:number = Number(strLon);
  //     //   let pos = {
  //     //     lat: newLat,
  //     //     lng: newLon,
  //     //   };
  //     //   this.addTempMapMarker(pos);
  //     //   // if(event.shiftKey) {
  //     //   let addNewLocation:boolean = true;
  //     //   if(addNewLocation) {
  //     //     let confirm:boolean = await this.alert.showConfirmYesNo("UPDATE SITE", `Do you want to set the work site location to (${strLat}, ${strLon})?`);
  //     //     if(confirm) {
  //     //       this.jobsite.latitude  = newLat;
  //     //       this.jobsite.longitude = newLon;
  //     //       this.updateOverlays();
  //     //     } else {
  //     //       Log.l("handleMapRightClick(): User chose not to update jobsite.");
  //     //       this.gmapOverlays.pop();
  //     //       this.gmapOverlays.pop();
  //     //       this.notify.addInfo("CANCELED", `Job site location not updated.`, 3000);
  //     //     }
  //     //   } else {
  //     //     this.notify.addInfo("MAP CLICKED", `Map clicked at (${lat}, ${lon})`, 3000);
  //     //   }
  //     // }
  //   } catch(err) {
  //     Log.l(`handleMapRightClick(): Error during handling of map click!`);
  //     Log.e(err);
  //     this.notify.addError("ERROR", `Error clicking map: '${err.message}'`, 4000);
  //     // throw new Error(err);
  //   }
  // }

  // public async handleMapSingleClick(evt?:any) {
  //   try {
  //     let keys:string[] = Object.keys(evt);
  //     let event:MouseEvent;
  //     for(let key of keys) {
  //       let item:any = evt[key];
  //       if(item instanceof MouseEvent) {
  //         event = item;
  //         break;
  //       }
  //     }
  //     // let event:any = evt && evt.fa ? evt.fa : evt;
  //     let loc:any = evt && evt.latLng ? evt.latLng : null;
  //     Log.l(`handleMapSingleClick(): Map clicked, event is:\n`, evt);
  //     if(event && loc) {
  //       let lat:number = loc.lat();
  //       let lon:number = loc.lng();
  //       let strLat:string = sprintf("%.6f", lat);
  //       let strLon:string = sprintf("%.6f", lon);
  //       let newLat:number = Number(strLat);
  //       let newLon:number = Number(strLon);
  //       let pos:ILatLng = {
  //         lat: newLat,
  //         lng: newLon,
  //       };
  //       // this.addTempMapMarker(pos);
  //       if(event.shiftKey) {
  //         this.notify.addInfo("MAP CLICKED", `Map shift-clicked at (${lat}, ${lon})`, 3000);
  //       } else {
  //         this.notify.addInfo("MAP CLICKED", `Map clicked at (${lat}, ${lon})`, 3000);
  //       }
  //     }
  //   } catch(err) {
  //     Log.l(`handleMapClick(): Error during handling of map click!`);
  //     Log.e(err);
  //     this.notify.addError("ERROR", `Error clicking map: '${err.message}'`, 4000);
  //     // throw new Error(err);
  //   }
  // }

  // public refreshMap() {
  //   let map:GMap = this.googleMapComponent;
  //   if(map) {
  //     this.googleMapComponent.initialize();
  //   } else {
  //     Log.w(`refreshMap(): Can't refresh map when no map is displayed.`);
  //   }
  // }

  public setHeader(idx?:number) {
    let count = this.reports.length;
    let index = idx || this.idx;
    this.header = `View Time Card (${index+1} / ${count})`;
    return this.header;
  }

  public createMenuLists() {
    let rpt:ReportTimeCard = this.report;
    let rd:string = rpt.report_date;
    let reportDate:Moment = moment(rpt.report_date, "YYYY-MM-DD").startOf('day');
    let timeList:SelectItem[] = [];
    for(let i = 0; i < 24; i++) {
      for(let j = 0; j < 60; j += 30) {
        let time:string = sprintf("%02d:%02d", i, j);
        let dateTime:Moment = moment(reportDate).hour(i).minute(j);
        let item:SelectItem = {label: time, value: dateTime};
        timeList.push(item);
      }
    }
    // let locationList:SelectItem[] = [];
    // let locations:OnSiteGeolocation[] = rpt.getLocations();
    // let i:number = 1;
    // for(let location of locations) {
    //   let name:string = sprintf("Location %d", i++);
    //   let item:SelectItem = {
    //     label: name,
    //     value: location,
    //   };
    //   locationList.push(item);
    // }
    // this.locationList = locationList;
    // this.location = locationList[0].value;

    // let clientList  : SelectItem[] = [] ;
    // let locationList: SelectItem[] = [] ;
    // let locIDList   : SelectItem[] = [] ;
    // for(let val of this.clients) {
    //   let item:SelectItem = {label: val.fullName, value: val}
    //   clientList.push(item);
    // }
    // for(let val of this.locations) {
    //   let item:SelectItem = {label: val.fullName, value: val}
    //   locationList.push(item);
    // }
    // for(let val of this.locIDs) {
    //   let item:SelectItem = {label: val.fullName, value: val}
    //   locIDList.push(item);
    // }
    this.timeList     = timeList     ;
    // this.clientList   = clientList   ;
    // this.locationList = locationList ;
    // this.locIDList    = locIDList    ;
  }

  public updateDisplay(report?:ReportTimeCard) {
    let rpt:ReportTimeCard = report || this.report;
    let reportDate = moment(rpt.report_date, "YYYY-MM-DD");
    // // let hours = this.report.getRepairHours();
    // // let repair_hours = this.data.convertTimeStringToHours(hours);
    // let time_start:Moment = moment(rpt.startTime);
    // let time_end  :Moment = moment(rpt.endTime);
    // let time_final:Moment = moment(rpt.finalTime);
    // this.time_start = time_start.toDate() ;
    // this.time_end   = time_end.toDate()   ;
    // this.time_final = time_final.toDate() ;
    // // this.repair_hours = repair_hours;
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


    let name  = rpt.username;
    let index = this.reports.indexOf(rpt) + 1;
    let count = this.reports.length;
    let report_date:Date = moment(rpt.report_date).toDate();
    this.report_date = report_date;
    this.createMenuLists();
    // let client = this.data.getFullClient(rpt.client);
    // let location = this.data.getFullLocation(rpt.location);
    // let locID = this.data.getFullLocID(rpt.location_id);
    // this.client = this.clientList.find((a:SelectItem) => {
      // return a.value.name === client.name;
    // }).value;
    // this.location = this.locationList.find((a:SelectItem) => {
      // return a.value.name === location.name;
    // }).value;
    // this.locID = this.locIDList.find((a:SelectItem) => {
      // return a.value.name === locID.name;
    // }).value;
  }

  public cancelClicked(event?:Event) {
    // this.viewCtrl.dismiss();
    Log.l("cancel(): Clicked, event is:\n", event);
    this.cancel.emit(event);
    this.finished.emit(event);
  }

  public async saveNoExit(event?:Event):Promise<any> {
    try {
      let res:any = await this.db.saveReportTimecard(this.report);
      // if(this.period) {
      //   // this.period.addLogisticsReport(this.report);
      // } else if(this.shift) {
      //   this.shift.addLogisticsReport(this.report);
      // }
      this.reportChange.emit();
      return res;
    } catch(err) {
      Log.l(`saveNoExit(): Error saving timecard report without exiting`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving timecard report: '${err.message}'`, 10000);
    }
  }

  public async saveClicked(event?:Event):Promise<any> {
    try {
      let res:any = await this.saveNoExit(event);
      this.save.emit(event);
      this.finished.emit(event);
      return res;
    } catch(err) {
      Log.l(`saveClicked(): Error saving report`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving timecard report: '${err.message}'`, 10000);
    }
  }

  public async deleteReport(event:Event) {
    let spinnerID;
    let report:ReportTimeCard = this.report;
    try {
      Log.l(`deleteReport(): Event is:\n`, event);
      // let report:ReportTimeCard = this.report;
      let title:string = "DELETE REPORT";
      let text:string = `Are you sure you want to delete this timecard report? This will permanently delete this timecard report and cannot be undone.`;
      if(this.data.isDeveloper) {
        text += "<br>\n<br>\n(However, just between a couple of developers, I'm saving the timecard report to the onsitedeletedtimecardreports array, so you can recover it from the DevTools.)";
      }
      window['onsitedeletedtimecardreports'] = window['onsitedeletedtimecardreports'] || [];
      let confirm:boolean = await this.alert.showConfirmYesNo(title, text);
      if(confirm) {
        let newReport:ReportTimeCard = report.clone();
        window['onsitedeletedtimecardreports'].push(report);
        let res:any = await this.db.deleteTimecardReport(report);
        Log.l("deleteReport(): Successfully deleted report.");
          // this.cancelClicked(event);
        this.cancel.emit(event);
        return res;
      }
    } catch(err) {
      Log.l(`deleteReport(): Error deleting report!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error deleting timecard report ${report._id}: '${err.message}'`, 10000);
      // this.alert.showAlert("ERROR", `Error  report ${report._id}:<br>\n<br>\n` + err.message);
      // throw new Error(err);
    }
  }

  public updateDate(newDate:Date) {
    let date = moment(newDate);
    let report = this.report;
    report.report_date = date.format("YYYY-MM-DD");
    // report.shift_serial = Shift.getShiftSerial(date);
    // report.payroll_period = PayrollPeriod.getPayrollSerial(date);
  }

  // public setReportLocation(site:Jobsite) {
  //   let tech = this.tech;
  //   // let report = this.report;
  //   // let cli = this.data.getFullClient(tech.client);
  //   // let loc = this.data.getFullLocation(tech.location);
  //   // let lid = this.data.getFullLocation(tech.locID);
  //   let cli = site.client;
  //   let loc = site.location;
  //   let lid = site.locID;
  //   this.updateReportCLL('client', cli);
  //   this.updateReportCLL('location', loc);
  //   this.updateReportCLL('locID', lid);
  //   this.client = this.clients.find(a => {
  //     return a['name'] === cli.name;
  //   });
  //   this.location = this.locations.find(a => {
  //     return a['name'] === loc.name;
  //   });
  //   this.locID = this.locIDs.find(a => {
  //     return a['name'] === lid.name;
  //   });
  //   // this.updateReportCLL('client', client);
  //   // this.updateReportCLL('location', location);
  //   // this.updateReportCLL('locID', locID);
  //   // this.site = site;
  //   // return this.site;
  //   return this.report;
  // }

  // public getReportLocation() {
  //   let rpt = this.report;
  //   let cli  = this.data.getFullClient(rpt.client);
  //   let loc  = this.data.getFullLocation(rpt.location);
  //   let lid  = this.data.getFullLocID(rpt.location_id);
  //   let site = this.sites.find((a:Jobsite) => {
  //     let siteClient   = a.client.name;
  //     let siteLocation = a.location.name;
  //     let siteLocID    = a.locID.name;
  //     return siteClient === cli.name && siteLocation === loc.name && siteLocID === lid.name;
  //   });
  //   Log.l(`getReportLocation(): Report/tech located at site:\n`, site);
  //   return site;
  // }

  // public updateReportCLL(key:string, value:any) {
  //   let report = this.report;
  //   Log.l(`updateReportCLL(): Setting report key ${key} to:\n`, value);
  //   if(key === 'client') {
  //     report.client = value.fullName;
  //   } else if(key === 'location') {
  //     report.location = value.fullName;
  //   } else if(key === 'locID') {
  //     report.location_id = value.name;
  //   } else {
  //     Log.w(`updateReportCLL(): Unable to find key ${key} to set, in ReportOther:\n`, report);
  //   }  }

  // public updateRepairHours() {
  //   let report = this.report;
  //   report.setRepairHours(Number(this.report.repair_hours));
  //   // this.time_start = moment(report.time_start);
  //   // this.time_end = moment(report.time_end);
  //   this.updateDisplay();
  // }

  public updateTimeStart(event?:Event) {
    let report:ReportTimeCard = this.report;
    let start:Moment = moment(this.time_start);
    // report.setStartTime(start);
    this.updateDisplay();
  }

  public updateTimeEnd(event?:Event) {
    let report:ReportTimeCard = this.report;
    let end:Moment = moment(this.time_end);
    // report.setEndTime(end);
    this.updateDisplay();
  }

  public updateTimeFinal(event?:Event) {
    let report:ReportTimeCard = this.report;
    let final:Moment = moment(this.time_final);
    // report.setFinalTime(final);
    this.updateDisplay();
  }

  public previous() {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.report = this.reports[this.idx];
    this.setHeader(this.idx);
    this.updateDisplay(this.report);
    // this.updateOverlays();
    // this.updateLocation(this.location);
    // // this.reportChange.emit(this.idx);
  }

  public next() {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.report = this.reports[this.idx];
    this.setHeader(this.idx);
    this.updateDisplay(this.report);
    // this.updateLocation(this.location);
    // this.reportChange.emit(this.idx);
  }

  // public updateLocation(location:OnSiteGeolocation, evt?:Event) {
  //   Log.l(`updateLocation(): Event is:\n`, evt);
  //   if(location instanceof OnSiteGeolocation) {
  //     this.location = location;
  //     this.updateOverlays();
  //   } else {
  //     Log.w(`updateLocation(): First parameter must be an OnSiteGeolocation object!`);
  //   }
  // }

  // public splitReport(event?:Event) {
  //   let report = this.report;
  //   Log.l(`splitReport(): Now attempting to split report:\n`, report);
  //   this.notify.addInfo("DISABLED", `This function is not yet enabled.`, 3000);
  //   let proceed:boolean = false;
  //   if(proceed) {
  //     let idx = this.reports.indexOf(report);
  //     let rpt1:ReportTimeCard = this.reports.splice(idx, 1)[0];
  //     this.reports.push(rpt1);
  //     let reportDoc = report.serialize();
  //     // let newReport = new Report();
  //     // newReport.readFromDoc(reportDoc);
  //     let newReport = this.data.splitReport(report);
  //     report.split_count++;
  //     newReport.split_count++;
  //     newReport._rev = "";
  //     let start = moment(report.time_start);
  //     let hours = report.getRepairHours();
  //     let splitHours1 = hours / 2;
  //     let splitHours2 = hours / 2;
  //     let splitMinutes1 = splitHours1 * 60;
  //     let splitMinutes2 = splitHours2 * 60;
  //     let remainder = splitMinutes1 % 30;
  //     if(remainder !== 0) {
  //       splitMinutes1 += remainder;
  //       splitMinutes2 -= remainder;
  //     }
  //     splitHours1 = splitMinutes1 / 60;
  //     splitHours2 = splitMinutes2 / 60;
  //     // let newStart = moment(start).add(splitMinutes1, 'minutes');
  //     report.setRepairHours(splitHours1);
  //     let end = moment(report.time_end);
  //     newReport.setStartTime(end);
  //     newReport.setRepairHours(splitHours2);
  //     this.reports.push(newReport);
  //     this.report = newReport;
  //     this.count = this.reports.length;
  //     this.idx = this.count - 1;
  //     this.reportChange.emit(this.idx);
  //   }
  // }

//   public
// }

}
