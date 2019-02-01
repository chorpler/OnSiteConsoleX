import { Subscription                                            } from 'rxjs'                     ;
import { sprintf                                                 } from 'sprintf-js'               ;
import { Component, ViewChild, OnInit, OnDestroy, Input, Output, } from '@angular/core'            ;
import { ElementRef, EventEmitter,                               } from '@angular/core'            ;
import { Log, moment, Moment, oo, _matchCLL                      } from 'domain/onsitexdomain'     ;
import { SESAClient, SESALocation, SESALocID, SESACLL,           } from 'domain/onsitexdomain'     ;
import { SESAShift, SESAShiftLength, SESAShiftRotation,          } from 'domain/onsitexdomain'     ;
import { SESAShiftStartTime,                                     } from 'domain/onsitexdomain'     ;
import { Employee                                                } from 'domain/onsitexdomain'     ;
import { DBService                                               } from 'providers/db-service'     ;
import { ServerService                                           } from 'providers/server-service' ;
import { Jobsite                                                 } from 'domain/onsitexdomain'     ;
import { AlertService                                            } from 'providers/alert-service'  ;
import { SmartAudio                                              } from 'providers/smart-audio'    ;
import { OSData                                                  } from 'providers/data-service'   ;
import { NotifyService                                           } from 'providers/notify-service' ;
import { Command, KeyCommandService                              } from 'providers'                ;
import { DispatchService                                         } from 'providers'                ;

@Component({
  selector: 'add-site-locale',
  templateUrl: 'add-site-locale.html'
})
export class AddSiteLocaleComponent implements OnInit,OnDestroy {
  @ViewChild('addSiteLocaleCodeInput') addSiteLocaleCodeInput:ElementRef              ;
  @ViewChild('addSiteLocaleValueInput') addSiteLocaleValueInput:ElementRef            ;
  @Input('type') type:string    = 'client'                                            ;
  @Output('onSubmit')  onSubmit = new EventEmitter<SESACLL>()                         ;
  @Output('onCancel')  onCancel = new EventEmitter<any>()                             ;
  @Output('onDelete')  onDelete = new EventEmitter<any>()                             ;
  public addSiteLocaleHeader : string        = "Add Site Locale (Generic)"            ;
  public keySubscription: Subscription                                                ;

  public editorOptions  : any           = {}                                          ;
  public localeType     : any           = [ "Client", "Location", "Location ID" ]     ;
  // public site           : Jobsite                                                     ;
  public sites          : Array<Jobsite> = []                                         ;
  // public username       : string = "unknown"                                          ;
  // public backupEmployee : any                                                         ;
  // public type            : string        = "client"                                    ;
  public newCLL          : SESACLL       = new SESACLL()                               ;
  public existingCLLs    : SESACLL[]     = []                                          ;
  public clients         : SESAClient[]  = []                                          ;
  public locations       : SESALocation[]= []                                          ;
  public locIDs          : SESALocID[]   = []                                          ;
  public existingIDs     : number[]      = []                                          ;
  public typeDisplay     : string        = "Client"                                    ;
  public typeValueDigits : number        = 3                                           ;
  public typeCodeDigits  : number        = 3                                           ;
  public errorInCode     : boolean       = false                                       ;
  public errorInValue    : boolean       = false                                       ;
  public errorInID       : boolean       = false                                       ;
  public newLocaleError  : boolean       = false                                       ;
  public errorMessage    : string        = ""                                          ;
  public isVisible       : boolean       = true                                        ;
  public dataReady       : boolean       = false                                       ;

  constructor(
    public db        : DBService         ,
    public server    : ServerService     ,
    public alert     : AlertService      ,
    public audio     : SmartAudio        ,
    public data      : OSData            ,
    public notify    : NotifyService     ,
    public keyService: KeyCommandService ,
    public dispatch  : DispatchService   ,
  ) {
    window['onsiteaddsitelocale'] = this;
  }

  ngOnInit() {
    Log.l("AddSiteLocaleComponent: ngOnInit() fired.");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  ngOnDestroy() {
    Log.l("AddSiteLocaleComponent: ngOnDestroy() fired.");
    this.cancelSubscriptions();
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    this.initializeEmployeeData();
    this.checkInput();
    let sites:Jobsite[] = this.data.getData('sites');
    this.sites = sites;
    let type:string = this.type;
    let siteLocaleTitle:string = "Add Site Locale (%s)";
    if(type === 'client') {
      this.typeDisplay = 'Client';
      this.typeCodeDigits = 2;
      this.addSiteLocaleHeader = sprintf(siteLocaleTitle, this.typeDisplay);
      this.newCLL = new SESAClient();
      this.existingIDs = this.clients.map((a:SESAClient) => a.id);
    } else if(type === 'location') {
      this.typeDisplay = 'Location';
      this.typeCodeDigits = 3;
      this.addSiteLocaleHeader = sprintf(siteLocaleTitle, this.typeDisplay);
      this.newCLL = new SESALocation();
      this.existingIDs = this.locations.map((a:SESALocation) => a.id);
    } else if(type === 'locID') {
      this.typeDisplay = 'LocID';
      this.typeCodeDigits = 6;
      this.addSiteLocaleHeader = sprintf(siteLocaleTitle, this.typeDisplay);
      this.newCLL = new SESALocID();
      this.existingIDs = this.locIDs.map((a:SESALocID) => a.id);
    }
    this.existingIDs = this.existingIDs.sort();
    this.dataReady = true;
  //   this.sites = sites;
  }

  public initializeSubscriptions() {
    // this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
    //   Log.l("Hotkey fired, command is:\n", command);
    //   switch(command.name) {
    //     case "AddSiteLocale.previous" : this.previous(); break;
    //     case "AddSiteLocale.next"     : this.next(); break;
    //     case "AddSiteLocale.default"  : this.defaultFill(command.ev); break;
    //   }
    // });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public initializeEmployeeData() {
    // let techs = this.data.getData('employees');
    // let techs = this.employees;
    // let tech = this.employee;
    // let idx = techs.indexOf(tech);
    // let count = techs.length;
    // this.idx = idx;
    // this.count = count;
    let shifts           = this.data.getConfigData('shifts');
    let shiftlengths     = this.data.getConfigData('shiftLengths');
    let shiftstarttimes  = this.data.getConfigData('shiftStartTimes');
    let rotations        = this.data.getConfigData('rotations');
    let clients          = this.data.getConfigData('clients');
    let locations        = this.data.getConfigData('locations');
    let locIDs           = this.data.getConfigData('locIDs');
    let clis:SESAClient[] = [];
    let locs:SESALocation[] = [];
    let lids:SESALocID[] = [];
    for(let client of clients) {
      let cli:SESAClient = new SESAClient(client);
      clis.push(cli);
    }
    for(let location of locations) {
      let loc:SESALocation = new SESALocation(location);
      locs.push(loc);
    }
    for(let locID of locIDs) {
      let lid:SESALocID = new SESALocID(locID);
      lids.push(lid);
    }
    this.clients = clis;
    this.locations = locs;
    this.locIDs = lids;
    this.initializeDisplayVariables();
  }

  public initializeDisplayVariables() {
    if(this.type.toLowerCase() === 'client') {
      this.typeDisplay     = "Client";
      this.typeCodeDigits  = 2;
    } else if(this.type.toLowerCase() === 'location') {
      this.typeDisplay     = "Location";
      this.typeCodeDigits  = 3;
    } else if(this.type.toLowerCase() === 'locID') {
      this.typeDisplay     = "Location ID";
      this.typeCodeDigits  = 6;
    }
  }

  public checkInput(evt?:any):number {
    let type = this.type.toLowerCase();
    let input:any = "";
    let lengthShouldBe:number = -1;
    if(type === 'client') {
      lengthShouldBe = 2;
    } else if(type === 'location') {
      lengthShouldBe = 3;
    } else if(type === 'locID') {
      lengthShouldBe = 6;
    }
    this.typeCodeDigits = lengthShouldBe;
    return lengthShouldBe;
  }

  public checkChars(inString:string):number {
    if(typeof inString === 'string') {
      return inString.length;
    } else {
      Log.w(`checkChars(): input is supposed to be a string, but it was:\n`, inString);
      return 0;
    }
  }

  public updateCode(evt?:any) {
    Log.l(`updateCode(): CLL code updated, event is:\n`, evt);
    let event:any = evt ? evt : "";
    let cll:SESACLL = this.newCLL;
    let len:number = this.checkChars(cll.code);
    if(len !== this.typeCodeDigits) {
      this.errorInCode = true;
    } else {
      this.errorInCode = false;
      cll.name = cll.code;
      if(cll.value) {
        cll.fullName = cll.value;
        cll.capsName = cll.value.toUpperCase();
      }
    }
  }

  public updateValue(evt?:any) {
    Log.l(`updateValue(): CLL value updated, event is:\n`, evt);
    let event:any = evt ? evt : "";
    let cll:SESACLL = this.newCLL;
    if(cll.code) {
      cll.name = cll.code;
    }
    if(cll.value) {
      cll.fullName = cll.value;
      cll.capsName = cll.value.toUpperCase();
    }
  }

  public updateID(evt?:any) {
    Log.l(`updateID(): CLL ID updated, event is:\n`, evt);
    let event:any = evt ? evt : "";
    let cll:SESACLL = this.newCLL;
    let id = cll.id;
    let digits = String(id).length;
    if(digits !== 2) {
      this.errorInID = true;
    } else {
      this.errorInID = false;
    }
  }

  public checkCode(evt?:any):boolean {
    Log.l(`checkCode(): Event is:\n`, evt);
    let codes:string[] = [];
    let values:string[] = [];
    let code:string = this.newCLL.code.toUpperCase();
    if(this.type === 'client') {
      codes = this.clients.map((a:SESAClient) => a.code.toUpperCase());
      values = this.clients.map((a:SESAClient) => a.value);
    } else if(this.type === 'location') {
      codes = this.locations.map((a:SESALocation) => a.code.toUpperCase());
      values = this.locations.map((a:SESALocation) => a.value);
    } else if(this.type === 'locID') {
      codes = this.locIDs.map((a:SESALocID) => a.code.toUpperCase());
      values = this.locIDs.map((a:SESALocID) => a.value);
    }
    let i = codes.indexOf(code);
    if(i > -1) {
      this.newLocaleError = true;
      let value:string = values[i];
      this.errorMessage = `Code exists: '${code}' → '${value}'`;
      return true;
    } else {
      this.newLocaleError = false;
      this.errorMessage = "";
      return false;
    }
  }

  public checkValue(evt?:any):boolean {
    let value:string = this.newCLL.value;
    let len:number = value.length;
    if(len < 1) {
      this.newLocaleError = true;
      this.errorMessage = `Value is not long enough.`;
      return true;
    } else {
      this.newLocaleError = false;
      this.errorMessage = "";
      return false;
    }
  }

  public checkID(evt?:any):boolean {
    let id:number = this.newCLL.id;
    let digits = String(id).length;
    if(digits !== 2) {
      this.errorInID = true;
      this.newLocaleError = true;
      this.errorMessage = `ID must be 2 digits!`;
      return true;
    }
    let i = this.existingIDs.indexOf(id);
    if(i > -1) {
      this.errorInID = true;
      this.newLocaleError = true;
      this.errorMessage = `ID already exists!`;
      return true;
    }
    this.errorInID = false;
    this.newLocaleError = false;
    this.errorMessage = "";
    return false;
  }

  public cancel(evt?:any) {
    Log.l(`cancel(): Cancel button clicked, event is:\n`, evt);
    this.onCancel.emit(false);
  }

  public async submit(evt?:any) {
    try {
      Log.l(`submit(): Save button clicked, event is:\n`, evt);
      if(this.errorInCode || this.errorInValue || this.errorInID || this.checkCode() || this.checkValue() || this.checkID()) {
        this.notify.addError("ERROR", `Can't save, there's an error!`, 3000);
      } else {
        let type:string = this.type ? this.type : "";
        let out:any;
        if(type === 'client') {
          out = await this.db.saveClient(this.newCLL);
        } else if(type === 'location') {
          out = await this.db.saveLocation(this.newCLL);
        } else if(type === 'locID') {
          let value:SESALocID;
          if(this.newCLL instanceof SESALocID) {
            value = this.newCLL;
            out = await this.db.saveLocID(value);
          }
        }
        Log.l(`submit(): Successfully saved ${this.type}, now:\n`, out);
        this.onSubmit.emit(this.newCLL);
      }
    } catch(err) {
      Log.l(`submit(): Error saving new site locale:\n`, this.newCLL);
      Log.e(err);
      throw new Error(err);
    }
  }
}
