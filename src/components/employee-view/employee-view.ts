import { Subscription                                            } from 'rxjs'                          ;
import { sprintf                                                 } from 'sprintf-js'                    ;
import { Component, ViewChild, OnInit, OnDestroy, Input, Output, } from '@angular/core'                 ;
import { ElementRef, EventEmitter,                               } from '@angular/core'                 ;
import { Log, moment, Moment, isMoment, oo, _matchCLL            } from 'domain/onsitexdomain'          ;
import { SESAClient, SESALocation, SESALocID, SESACLL,           } from 'domain/onsitexdomain'          ;
import { SESAShift, SESAShiftLength, SESAShiftRotation,          } from 'domain/onsitexdomain'          ;
import { SESAShiftStartTime,                                     } from 'domain/onsitexdomain'          ;
import { Employee                                                } from 'domain/onsitexdomain'          ;
import { Jobsite                                                 } from 'domain/onsitexdomain'          ;
import { Preferences                                             } from 'providers/preferences'         ;
import { ServerService                                           } from 'providers/server-service'      ;
import { AlertService                                            } from 'providers/alert-service'       ;
import { SmartAudio                                              } from 'providers/smart-audio'         ;
import { OSData                                                  } from 'providers/data-service'        ;
import { NotifyService                                           } from 'providers/notify-service'      ;
import { SelectItem,                                             } from 'primeng/api'                   ;
import { Command, KeyCommandService                              } from 'providers'                     ;
import { DispatchService                                         } from 'providers'                     ;

@Component({
  selector: 'employee-view',
  templateUrl: 'employee-view.html'
})
export class EmployeeViewComponent implements OnInit,OnDestroy {
  @ViewChild('avatarName') avatarName:ElementRef                                      ;
  @ViewChild('emailTextArea') emailTextArea:ElementRef                                ;
  @Input('employee') employee:Employee                                                ;
  @Input('employees') employees:Employee[] = []                                  ;
  @Input('mode') mode:string = "edit";
  @Output('onUpdate')  onUpdate = new EventEmitter<any>()                             ;
  @Output('onCancel')  onCancel = new EventEmitter<any>()                             ;
  @Output('onDelete')  onDelete = new EventEmitter<any>()                             ;
  public title          : string        = "Employee View"                             ;
  public editorOptions  : any           = {}                                          ;
  public get developerMode():boolean { return this.data.status.role === 'usr' ? false : true; };
  public keySubscription: Subscription                                                ;
  public idx            : number        = 0                                           ;
  public count          : number        = 0                                           ;
  public strBlank       : string        = ""                                          ;
  public userClass      : string        = ""                                          ;
  public userEmail      : string        = ""                                          ;
  public codeFocus      : boolean       = false                                       ;
  public errors         : any           = {username: false, email: false}             ;
  // public mode           : string        = "Add"                                       ;
  public from           : string        = "employees"                                 ;
  public usernames      : string[] = []                                          ;
  public clients        : SESAClient[]  = []                                          ;
  public locations      : SESALocation[]= []                                          ;
  public locids         : SESALocID[]   = []                                          ;
  public rotations      : SESACLL[]     = []                                          ;
  public shifts         : any[]         = []                                          ;
  public shiftlengths   : any[]         = []                                          ;
  public shiftstarttimes: any[]         = []                                          ;
  public jobsite        : Jobsite                                                     ;
  public client         : SESAClient         = new SESAClient()                       ;
  public location       : SESALocation       = new SESALocation()                     ;
  public locID          : SESALocID          = new SESALocID()                        ;
  public rotation       : SESAShiftRotation  = new SESAShiftRotation()                ;
  public shift          : SESAShift          = new SESAShift()                        ;
  public shiftLength    : SESAShiftLength    = new SESAShiftLength()                  ;
  public shiftStartTime : SESAShiftStartTime = new SESAShiftStartTime()               ;
  public employeeHeader : string        = ""                                          ;
  public prefixList     : SelectItem[]  = []                                          ;
  public suffixList     : SelectItem[]  = []                                          ;
  public jobsiteList    : SelectItem[]  = []                                          ;
  public employeeTypeList: SelectItem[]  = [
    { label: "FIELD"    , value: "FIELD"     },
    { label: "OFFICE"   , value: "OFFICE"    },
    { label: "LOGISTICS", value: "LOGISTICS" },
  ];
  public shiftList      : SelectItem[]  = []                                          ;
  public shiftLengthList: SelectItem[]  = []                                          ;
  public shiftStartList : SelectItem[]  = []                                          ;
  public rotationList   : SelectItem[]  = []                                          ;
  public birthdate      : Date          = new Date()                                  ;
  public isBirthdateReadOnly:boolean    = false                                       ;

  public prefixes       : string[] = ["", "Mr.", "Dr.", "Sr.", "Mrs.", "Ms.", "HRM"] ;
  public suffixes       : string[] = ["", "Jr.", "Sr.", "III", "Esq"]                ;
  public site           : Jobsite                                                     ;
  public sites          : Jobsite[]= []                                          ;
  public allSites       : Jobsite[]= []                                          ;
  public username       : string = "unknown"                                          ;
  public yearRange      : string = null                                               ;
  public backupEmployee : any                                                         ;
  public evOptionsVisible : boolean = false                                           ;
  public optionsType      : string = 'employeeView'                                   ;
  public dataReady      : boolean = false                                             ;
  public isVisible      : boolean = true                                              ;
  public 
  public dialogStyle    : any = {
    // overflow: 'visible',
    overflow: 'auto',
  };

  constructor(
    public prefs     : Preferences       ,
    public server    : ServerService     ,
    public alert     : AlertService      ,
    public audio     : SmartAudio        ,
    public data      : OSData            ,
    public notify    : NotifyService     ,
    public keyService: KeyCommandService ,
    public dispatch  : DispatchService   ,
  ) {
    window['onsiteemployeeview']  = this;
    window['onsiteemployeeview2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l("EmployeeViewComponent: ngOnInit() fired.");
    if(this.data.isAppReady()) {
      this.isVisible = true;
      this.runWhenReady();
    };
  }

  ngOnDestroy() {
    Log.l("EmployeeViewComponent: ngOnDestroy() fired.");
    this.cancelSubscriptions();
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    this.yearRange = this.generateYearRange();
    let allSites:Jobsite[] = this.data.getData('sites');
    this.allSites = allSites;
    let showAllSites:boolean = this.prefs.CONSOLE.employeeView.showAllSites;
    let sites:Jobsite[] = this.allSites.filter((a:Jobsite) => {
      if(showAllSites) {
        return true;
      } else {
        return a.site_active;
      }
    });
    this.sites = sites;
    let options = {
      minimap: {enabled: false},
      lineNumbers: "off",
    };
    this.editorOptions = options;
    // .then(res => {
      //   return
    if(this.mode === 'add') {
      this.employee = new Employee();
      this.employee.address.state = 'TX';
      this.employee.phone = '956-';
      this.employee.cell = '956-';
    }
    this.backupEmployee = oo.clone(this.employee.serialize());
    this.initializeJobsiteData();
    // }).then(res => {
    this.initializeForm();
    this.initializeMenus();
    this.initializeEmployeeData();
    this.updateEmployeeDropdownFields();
    // this.backupEmployee = oo.clone(this.employee);
    let user = this.data.getUser();
    if(user) {
      let username = user.getUsername();
      this.username = username;
      // this.developerMode = username === 'mike' || username === 'Chorpler' || username === 'Hachero' ? true : false;
      // this.developerMode = this.data.status.role;
    }
    let bday:string = this.employee.getBirthdate();
    let birthdate:Moment = moment(bday);
    if(isMoment(birthdate)) {
      this.birthdate = birthdate.toDate();
    }
    this.dataReady = true;
    // }).catch(err => {
    //   Log.l("initializeEmployeeData(): Error getting employee data!");
    //   Log.e(err);
    //   this.notify.addError('ERROR', `Could not read employee data: '${err.message}'`, 5000);
    // });
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      Log.l("Hotkey fired, command is:\n", command);
      switch(command.name) {
        case "EmployeeView.previous" : this.previous(); break;
        case "EmployeeView.next"     : this.next(); break;
        case "EmployeeView.default"  : this.defaultFill(command.ev); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public generateYearRange():string {
    let now = moment();
    let year = now.format("YYYY");
    let out = `1930:${year}`;
    return out;
  }

  public initializeEmployeeData() {
    // let techs = this.data.getData('employees');
    let techs = this.employees;
    let tech = this.employee;
    let idx = techs.indexOf(tech);
    let count = techs.length;
    this.idx = idx;
    this.count = count;
    // let shifts           = this.data.getConfigData('shifts');
    // let shiftlengths     = this.data.getConfigData('shiftLengths');
    // let shiftstarttimes  = this.data.getConfigData('shiftStartTimes');
    // let rotations        = this.data.getConfigData('rotations');
    // this.shifts          = shifts;
    // this.shiftlengths    = shiftlengths;
    // this.shiftstarttimes = shiftstarttimes;
    // this.rotations       = rotations;
    if(this.mode === 'add' || this.mode.toLowerCase() !== 'edit') {
      this.shift = this.shifts[0];
      this.shiftLength = this.shiftlengths[0];
      this.shiftStartTime = this.shiftstarttimes[0];
      let unassigned:Jobsite = this.sites.find((a:Jobsite) => a.site_number === 1);
      if(unassigned) {
        this.updateEmployee('jobsite', unassigned);
        this.updateEmployee('shift', this.shift);
        this.updateEmployee('shiftLength', this.shiftLength);
        this.updateEmployee('shiftStart', this.shiftStartTime);
      }
    } else {
      let e:Employee = this.employee;
      let eShift = e.getShift();
      let s1 = this.shiftList.find((a:SelectItem) => a.value.name == eShift);
      if(s1 && s1.value) {
        this.shift = s1.value;
      }
      let eShiftLength = e.getShiftLength();
      let s2 = this.shiftLengthList.find((a:SelectItem) => a.value.name == eShiftLength);
      if(s2 && s2.value) {
        this.shiftLength = s2.value;
      }
      let eShiftStartTime = e.shiftStartTime;
      let s3 = this.shiftStartList.find((a:SelectItem) => a.value.name == eShiftStartTime);
      if(s3 && s3.value) {
        this.shiftStartTime = s3.value;
      }
    }
    let name = tech.getFullNameNormal();
    // this.editEmployees = techs;
    if(this.mode === 'add') {
      this.employeeHeader = `Adding user`;
    } else {
      this.employeeHeader = `Editing '${name}' (${idx+1} / ${count})`;
    }

    this.usernames = techs.map((a:Employee) => a.username);

    // return new Promise((resolve,reject) => {
    //   this.server.getAllConfigData().then(res => {
    //     Log.l("initializeEmployeeData(): Successfuly fetched employee config data!");
    //     for(let key of Object.keys(res)) {
    //       this[key] = res[key];
    //     }
    //     resolve(res);
    //   }).catch(err => {
    //     Log.l("initializeEmployeeData(): Error fetching employee config data!");
    //     Log.e(err);
    //     reject(err);
    //   });
    // });
  }

  public initializeJobsiteData() {
    Log.l(`initializeJobsiteData(): Function called...`);
    // let sites = this.data.getData('sites');
    // this.sites = sites;
    // return new Promise((resolve,reject) => {
    //   this.server.getJobsites().then(res => {
    //     Log.l("initializeJobsiteData(): Successfully fetched jobsite list:\n",res);
    //     let sites = new Jobsite[]();
    //     for(let key of Object.keys(res)) {
    //       let doc  = res[key];
    //       let site = new Jobsite();
    //       site.readFromDoc(doc);
    //       sites.push(site);
    //     }
    //     this.sites = sites;
    //     resolve(this.sites);
    //   }).catch(err => {
    //     Log.l("initializeJobsiteData(): Error retrieving jobsite list!");
    //     Log.e(err);
    //     reject(err);
    //   });
    // });
  }

  public initializeForm() {
    Log.l(`initializeForm(): Function called...`);
    let e = this.employee;
    let tech = e;
    type HoursItem = {name:string, fullName:string, value?:string, code?:string, capsName?:string};
    let hours:HoursItem[] = [];
    for(let i = 0; i < 24; i++) {
      let hour = sprintf("%02d:00", i);
      let time = {name: String(i), fullName: hour};
      hours.push(time);
    }
    this.shiftstarttimes = hours;
    let shifts           = this.data.getConfigData('shifts');
    let shiftlengths     = this.data.getConfigData('shiftLengths');
    let shiftstarttimes  = this.data.getConfigData('shiftStartTimes');
    let rotations        = this.data.getConfigData('rotations');
    this.shifts          = shifts;
    this.shiftlengths    = shiftlengths;
    this.shiftstarttimes = shiftstarttimes;
    this.rotations       = rotations;
    Log.l(`initializeForm(): shifts, shiftlengths, shiftstarttimes, and rotations:`);
    Log.l(`shifts:          `, shifts);
    Log.l(`shiftlengths:    `, shiftlengths);
    Log.l(`shiftstarttimes: `, shiftstarttimes);
    Log.l(`rotations:       `, rotations);
    let unassignedSite:Jobsite = this.sites.find((a:Jobsite) => a.site_number === 1);

    if(this.mode === 'edit') {
      this.shiftStartTime = this.shiftstarttimes.find((a:any) => a.name == tech.shiftStartTime);
      this.shift          = this.shifts.find((a:any) => a.name == tech.shift)                  ;
      this.shiftLength    = this.shiftlengths.find((a:any) => a.name == tech.shiftLength)      ;
      this.site           = this.data.getTechLocationForDate(tech, moment())                   ;
    } else {
      this.shiftStartTime = this.shiftstarttimes && this.shiftstarttimes.length ? this.shiftstarttimes[0] : null          ;
      this.shift          = this.shifts          && this.shifts.length          ? this.shifts[0]          : null          ;
      this.shiftLength    = this.shiftlengths    && this.shiftlengths.length    ? this.shiftlengths[0]    : null          ;
      this.site           = unassignedSite                                      ? unassignedSite          : this.sites && this.sites.length ? this.sites[0] : null;
    }
    Log.l(`initializeForm(): shiftStartTime, shift, shiftLength, and site are:`);
    Log.l(`shiftStartTime : `, this.shiftStartTime);
    Log.l(`shift          : `, this.shift);
    Log.l(`shiftLength    : `, this.shiftLength);
    Log.l(`site           : `, this.site);
    let userClass = "";
    if(typeof this.employee.userClass === 'string') {
      this.employee.userClass = [this.employee.userClass];
    }
    for(let uclass of this.employee.userClass) {
      userClass += uclass + "\n";
    }
    this.userClass = userClass;

    let userEmail = "";
    if(!this.employee.email) {
      this.employee.email = [];
    }
    if(typeof this.employee.email === 'string') {
      this.employee.email = [this.employee.email];
    }
    for(let email of this.employee.email) {
      userEmail += email + "\n";
    }
    this.userEmail = userEmail;
  }

  public initializeMenus() {
    Log.l(`initializeMenus(): Function called...`);
    let prefixList      : SelectItem[] = [] ;
    let suffixList      : SelectItem[] = [] ;
    let jobsiteList     : SelectItem[] = [] ;
    let shiftList       : SelectItem[] = [] ;
    let shiftLengthList : SelectItem[] = [] ;
    let shiftStartList  : SelectItem[] = [] ;
    let rotationList    : SelectItem[] = [] ;
    let employeeTypeList: SelectItem[] = [] ;

    // for(let prefix of this.prefixes) {
    //   let item:SelectItem = {label: prefix, value: prefix};
    //   prefixList.push(item);
    // }

    prefixList                     = this.prefixes.map((a:string) => {
      let out:SelectItem = { label: a, value: a };
      return out;
    });
    suffixList                     = this.suffixes.map((a:string) => {
      let out:SelectItem = { label: a, value: a };
      return out;
    });
    jobsiteList                    = this.sites.map((a:Jobsite) => {
      let out:SelectItem = { label: a.schedule_name, value: a };
      return out;
    });
    shiftList                      = this.shifts.map((a:any) => {
      let out:SelectItem = { label: a.fullName, value: a };
      return out;
    });
    shiftLengthList                = this.shiftlengths.map((a:any) => {
      let out:SelectItem = { label: a.fullName, value: a };
      return out;
    });
    shiftStartList                 = this.shiftstarttimes.map((a:any) => {
      let out:SelectItem = { label: a.fullName, value: a };
      return out;
    });
    rotationList                   = this.rotations.map((a:SESACLL) => {
      let out:SelectItem = { label: a.fullName, value: a };
      return out;
    });
    this.prefixList      = prefixList      ;
    this.suffixList      = suffixList      ;
    this.jobsiteList     = jobsiteList     ;
    this.shiftList       = shiftList       ;
    this.shiftLengthList = shiftLengthList ;
    this.shiftStartList  = shiftStartList  ;
    this.rotationList    = rotationList    ;
    Log.l(`initializeMenus(): prefixList, suffixList, jobsiteList, shiftList, shiftLengthList, shiftStartList, rotationList are:`);
    Log.l(`prefixList:      `, prefixList     );
    Log.l(`suffixList:      `, suffixList     );
    Log.l(`jobsiteList:     `, jobsiteList    );
    Log.l(`shiftList:       `, shiftList      );
    Log.l(`shiftLengthList: `, shiftLengthList);
    Log.l(`shiftStartList:  `, shiftStartList );
    Log.l(`rotationList:    `, rotationList   );
  }

  public createJobsiteMenu() {
    Log.l(`createJobsiteMenu(): Now creating/updating jobsite menu...`);
    let showAllSites = this.prefs.CONSOLE.employeeView.showAllSites;
    let sites:Jobsite[] = this.allSites.filter((a:Jobsite) => {
      if(showAllSites) {
        return true;
      } else {
        return a.site_active;
      }
    });
    this.sites = sites;
    let jobsiteList     : SelectItem[] = [] ;
    jobsiteList = this.sites.map((a:Jobsite) => {
      let out:SelectItem = { label: a.schedule_name, value: a };
      return out;
    });
    this.jobsiteList = jobsiteList;
    Log.l(`createJobsiteMenu(): Jobsite menu is now:\n`, jobsiteList);

  }

  public updateEmployeeDropdownFields() {
    Log.l(`updateEmployeeDropdownFields(): Function called...`);
    let tech = this.employee;
    let now = moment();
    let unassignedSite:Jobsite = this.sites.find((a:Jobsite) => {
      return a.site_number === 1;
    });
    let site:Jobsite = this.sites.find((a:Jobsite) => {
      // return a.client.name === "XX";
      return a.site_number == 1;
    });
    if(this.mode.toLowerCase() === 'edit') {
      // site = this.data.getTechLocationForDate(tech, now);
      site = tech.findSite(this.sites);
    }
    let snum = site.site_number || 1;
    let menuSite = this.jobsiteList.find((a:SelectItem) => {
      let siteFromMenu:Jobsite = a.value;
      return siteFromMenu.site_number === snum;
    });

    this.jobsite = menuSite.value;

    if(this.mode === 'edit') {
      let shift = this.shiftList.find((a:SelectItem) => {
        return a.value.name == tech.shift;
      });
      let shiftLength = this.shiftLengthList.find((a:SelectItem) => {
        return a.value.name == tech.shiftLength;
      });
      let shiftStartTime = this.shiftStartList.find((a:SelectItem) => {
        return a.value.name == tech.shiftStartTime;
      });
      let rotation = this.rotationList.find((a:SelectItem) => {
        return a.value.name == tech.rotation;
      });
      if(shift) {
        delete shift['_$visited'];
        this.shift = shift.value;
      } else if(this.shiftList && this.shiftList.length) {
        this.shift = this.shiftList[0].value;
      } else {
        this.shift = null;
      }
      if(shiftLength) {
        delete shiftLength['_$visited'];
        this.shiftLength = shiftLength.value;
      } else {
        let shiftLengthList:SelectItem[] = this.shiftlengths.map((a:any) => {
          let shiftLength:SESAShiftLength = new SESAShiftLength(a.name);
          let item:SelectItem =  {
            label: a.name,
            value: shiftLength,
          };
          return item;
        });
        // this.shiftLengthList = shiftLengthList.map((a:SelectItem) => {
        //   let item:SelectItem = {
        //     label: a.name,
        //     value: a,
        //   };
        //   return item;
        // });
        this.shiftLength = this.shiftLengthList[0].value;
      }
      if(shiftStartTime) {
        delete shiftStartTime['_$visited'];
        this.shiftStartTime = shiftStartTime.value;
      } else {
        let shiftStartTime:SESAShiftStartTime = new SESAShiftStartTime();
        let shiftStartTimeList:SESAShiftStartTime[] = [
          shiftStartTime,
        ];
        this.shiftStartList = shiftStartTimeList.map((a:SESAShiftStartTime) => {
          let item:SelectItem = {
            label: a.name,
            value: a,
          };
          return item;
        });
        this.shiftStartTime = this.shiftStartList[0].value;
      }
      if(rotation) {
        delete rotation['_$visited'];
        this.rotation = rotation.value;
      } else {
        let rotation:SESAShiftRotation = new SESAShiftRotation();
        let rotationList:SESAShiftRotation[] = [
          rotation,
        ];
        this.rotationList = rotationList.map((a:SESAShiftRotation) => {
          let item:SelectItem = {
            label: a.name,
            value: a,
          };
          return item;
        });
        this.rotation = this.rotationList[0].value;
      }
      // let employeeEmail = tech.email || "\n";
    }
    let employeeEmail = tech.email && tech.email.length ? tech.email.join("\n") : "";
    this.userEmail = employeeEmail;

  }

  // public updateSite(site:Jobsite) {
  //     let tech         = this.employee                                                                         ;
  //     let shiftTimes   = site.getShiftTypes()                                                                  ;
  //     let times        = []                                                                                    ;
  //     for(let time of shiftTimes) {
  //       let one = {name: time.toUpperCase(), fullName: time.toUpperCase()};
  //       times.push(one);
  //     }
  //     if(!tech.rotation) {
  //       tech.rotation = "CONTN WEEK";
  //     }
  //     if(!tech.shift) {
  //       tech.shift = "AM";
  //     }

  //     let shift            = tech.shift                                                                        ;
  //     this.shift           = this.shifts.find(a => {return a['name']==shift || a['fullName']==shift;})         ;

  //     let len              = site.getSiteShiftLength(tech.rotation, tech.shift, moment())                      ;
  //     let strt             = site.getShiftStartTime(tech.shift)                                                ;
  //     let shiftLength      = this.shiftlengths.find(a => {return a['name'] == len || a['fullName'] == len;})   ;
  //     let shiftStartTime   = this.shiftstarttimes.find(a => {return a['name'] == strt || a['fullName']==strt;});
  //     tech.shiftLength     = shiftLength                                                                       ;
  //     tech.shiftStartTime  = shiftStartTime                                                                    ;
  //     this.shiftLength     = shiftLength                                                                       ;
  //     this.shiftStartTime  = shiftStartTime                                                                    ;
  //     this.site            = site                                                                              ;
  //     // this.shift           = this.shifts.find(a => {return a['name']===tech.shift || a['fullName']===tech.shift;});
  //     this._shift.setValue(this.shift, {emitEvent: false})                                                     ;
  //     this._shiftLength.setValue(tech.shiftLength, {emitEvent: false})                                         ;
  //     this._shiftStartTime.setValue(tech.shiftStartTime, {emitEvent: false})                                   ;
  // }

  public async updateEmployeeList():Promise<Employee[]> {
    Log.l(`updateEmployeeList(): Function called...`);
    try {
      let res:Employee[] = await this.server.getEmployees();
      Log.l(`updateEmployeeLists(): Success! Result:\n`, res);
      return res;
    } catch(err) {
      Log.l(`updateEmployeeList(): Error updating employee list!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error updating employee list: '${err.message}'`, 4000);
      // throw err;
    }
  }

  public updateEmployee(param:string, value:any) {
    // public updateEmployee(event:any) {
    Log.l(`updateEmployee(): param: '${param}' and value is:\n`, value);
    if(!this.dataReady) {
      Log.l(`updateEmployee(): Not running because data is not ready.`);
      return;
    }
    if(param === 'prefix') {
      this.employee.prefix = value;
    } else if(param === 'suffix') {
      this.employee.suffix = value;
    } else if(param === 'jobsite') {
      Log.l("updateEmployee(): Now updating employee jobsite for site:", value);
      let site:Jobsite = value;
      let cli = site.client.name;
      let loc = site.location.name;
      let lid = site.locID.name;
      let now = moment();
      let shiftTime = this.employee.shift || this.shift || "AM";
      if(typeof shiftTime === 'object') {
        shiftTime = shiftTime.name;
      }
      let t1 = site.getShiftStartTime(shiftTime);
      let startHour = typeof t1 === 'string' && t1.length === 5 ? Number(t1.split(":")[0]) : Number(t1);
      let startTime = Number(startHour);
      let shiftStartTime:SelectItem = this.shiftStartList.find((a:SelectItem) => {
        return Number(startTime) === Number(a.value.name);
      });
      if(shiftStartTime && shiftStartTime.value) {
        this.shiftStartTime = shiftStartTime.value;
      } else {
        if(Array.isArray(this.shiftStartList) && this.shiftStartList.length > 0) {
          this.shiftStartTime = this.shiftStartList[0].value;
        } else {
          let shiftStartTime:SESAShiftStartTime = new SESAShiftStartTime();
          let shiftStartItem:SelectItem = {
            label: shiftStartTime.name,
            value: shiftStartTime,
          };
          this.shiftStartList = [
            shiftStartItem,
          ];
        }
      }
      // let rotation = this.data.getTechRotationForDate(this.employee, now);
      let rotation = this.employee.rotation || "CONTN WEEK";
      let payPeriodStartDate = this.data.getPayrollPeriodStartDate(now);
      let shiftLength = site.getShiftLengthForDate(rotation, shiftTime, payPeriodStartDate);
      if(isNaN(Number(shiftLength))) {
        shiftLength = 11;
      }
      let shiftLengthItem = this.shiftLengthList.find((a:SelectItem) => {
        return Number(shiftLength) === Number(a.value.name);
      });
      if(shiftLengthItem && shiftLengthItem.value) {
        this.shiftLength = shiftLengthItem.value;
        this.employee.shiftLength = Number(shiftLength);
      } else {
        this.shiftLength = this.shiftLengthList[0].value;
        this.employee.shiftLength = Number(shiftLength);
      }
      this.employee.client = cli;
      this.employee.location = loc;
      this.employee.locID = lid;
      this.employee.site_number = site.site_number;
      this.employee.workSite = site.getSiteID();
      this.employee.shift = shiftTime;
      this.employee.shiftStartTime = Number(startTime);
    } else if(param === 'shift') {
      this.employee.shift = value.name;
      this.updateEmployee('jobsite', this.jobsite);
    } else if(param === 'shiftLength') {
      this.employee.shiftLength = Number(value.name);
    } else if(param === 'shiftStart') {
      this.employee.shiftStartTime = Number(value.name);
      this.employee.shiftStartTimeHour = value.fullName;
    } else if(param === 'rotation') {
      this.employee.rotation = value.name;
    }
    Log.l("updateEmployee(): Final updated employee is:\n", this.employee);
    // this.updated.emit(event);
  }

  public createEmail(event?:any) {
    let username:string = this.employee.avatarName;
    let email:string = `${username}@sesafleetservices.com`;
    if(username && username.length) {
      let exists:boolean = this.userEmail.includes(email);
      if(!exists) {
        if(this.userEmail === "" || this.userEmail === '\n') {
          this.userEmail = email + "\n";
        } else {
          this.userEmail += email + "\n";
        }
      } else {
        this.notify.addError("ERROR", "This e-mail address is already listed!", 5000);
      }
    } else {
      this.notify.addWarn("ALERT", "You must enter a username in order to create an e-mail address automatically.", 5000);
    }
  }

  public focusOnUsername() {
    setTimeout(() => {
      // this.avatarName.setFocus();
      let el:any = this.avatarName.nativeElement;
      if(el) {
        this.codeFocus = true;
        el.focus();
        el.select();
      }
    }, 300)
  }

  // public usernameFocused() {
  //   if(this.codeFocus) {
  //     this.
  //   }
  // }

  public finalizeEmployee() {
    this.employee.technician = this.employee.getTechName();
    this.employee.username = this.employee.name = this.employee.avatarName;
    this.employee._id = `org.couchdb.user:${this.employee.username}`;
    this.employee.avtrNameAsUser = true;
    if(!this.employee.rotation) {
      this.employee.rotation = "CONTN WEEK";
    }
    if(!this.employee.payRate && !this.employee.salaried) {
      this.employee.payRate = 12;
    }
    if(!this.employee.email || !Array.isArray(this.employee.email)) {
      let email = `${this.employee.avatarName}@sesafleetservices.com`;
      this.employee.email = [email];
    } else {

    }
  }

  public setError(type:string, value:boolean) {
    if(type === 'all') {
      this.setError('username', value);
      this.setError('email', value);
    } else if(type === 'username') {
      this.errors.username = value;
    } else if(type === 'email') {
      this.errors.email = value;
    }
  }

  public async saveNoExit(employee?:Employee, event?:any) {
    let spinnerID;
    try {
      let tech:Employee = employee || this.employee;
      let names = this.usernames || [];
      let name = tech.avatarName;
      if (!tech.avatarName) {
        this.notify.addError("USERNAME REQUIRED", "The username field cannot be left blank.", 3000);
        this.focusOnUsername();
        this.setError('username', true);
        return false;
      } else if (names.indexOf(name) > -1 && this.mode.toUpperCase() === 'ADD') {
        // this.alert.showAlert("USER EXISTS", "This Avatar Name (username) already exists. Please change avatar name.").then(res => {
        this.notify.addError("DUPLICATE USER", "Another user already has that username.", 3000);
        this.focusOnUsername();
        this.setError('username', true);
        return false;
        // })
      } else if (names.indexOf(name) > -1 && names.indexOf(name) !== this.employees.indexOf(this.employee)) {
        // this.alert.showAlert("USER EXISTS", "This Avatar Name (username) already exists. Please change avatar name.").then(res => {
        this.notify.addError("DUPLICATE USER", `Cannot change user to '${name}': another user already has that username.`, 3000);
        this.focusOnUsername();
        this.setError('username', true);
        return false;
        // })
      } else {
        Log.l("saveNoExit(): Saving employee from form:\n", tech);
        spinnerID = await this.alert.showSpinnerPromise("Saving employee...");
        this.finalizeEmployee();
        let ts = moment().format();
        let user = this.data.getUser();
        let loggedInUser = user.getUsername();
        if(this.mode === 'add') {
          tech.addStatusUpdate('created', loggedInUser);
          tech.created = ts;
        } else {
          tech.addStatusUpdate('updated', loggedInUser);
          let oldActive = this.backupEmployee.active;
          if(tech.active !== oldActive) {
            if(tech.active) {
              tech.setStatus('active', loggedInUser);
            } else {
              tech.setStatus('inactive', loggedInUser);
            }
          }
        }
        tech.lastUpdated = ts;
        // this.employee.readFromDoc();
        // Log.l("saveNoExit(): Read employee in from form:\n", this.employee);
        // let employeeDoc = Object.assign({}, this.employee);
        // let employeeDoc:any = oo.clone(this.employee);
        let employeeDoc = tech.serialize();
        if (employeeDoc.shiftStartTimeHour !== undefined) { delete employeeDoc.shiftStartTimeHour; }
        if (employeeDoc.shiftStartTimeMoment !== undefined) { delete employeeDoc.shiftStartTimeMoment; }
        Log.l("saveNoExit(): User name is: '%s'", name);
        employeeDoc._id = `org.couchdb.user:${name}`;
        employeeDoc.roles = employeeDoc.roles || ["TECHNICIAN"];
        employeeDoc.type = "user";
        employeeDoc.docID = employeeDoc.docID || employeeDoc._id;
        // if(!employeeDoc['docID']) {
        //   employeeDoc['docID'] = employeeDoc['_id'];
        // }
        employeeDoc.name = name;
        employeeDoc.username = name;
        // let doc = tech.serialize();
        Log.l("saveNoExit(): Now saving employee:\n", employeeDoc);
        let res = await this.server.saveEmployee(employeeDoc);
          // this.server.saveEmployee(tech).then((res) => {
        Log.l(`saveNoExit(): Success! Result:\n`, res);
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        if(!employee) {
          return res;
        } else {
          this.notify.addSuccess("SUCCESS", `Successfully saved user '${name}'`, 3000);
          this.backupEmployee = oo.clone(this.employee.serialize());
        }
          // this.employeeUpdated(evt, 'save');
          // if(this.mode === 'Edit' || this.from === 'scheduling') {
          //   this.viewCtrl.dismiss({employee: this.employee, deleted: false});
          // } else {
          //   this.navCtrl.setRoot("Employees");
          // }
      }
    } catch(err) {
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      if(!employee) {
        throw err;
      } else {
        Log.l(`saveNoExit(): Error saving employee '${employee.getUsername()}'`);
        Log.e(err);
        this.notify.addError("ERROR", `Could not save employee '${name}': '${err.message}'`, 10000);
        throw err;
      }
    }
  }

  public async onSubmit(evt?:any) {
    // let formInput = this.employeeForm.value;
    this.finalizeEmployee();
    try {
      let res = await this.saveNoExit();
      if(res) {
        let name = this.employee.getUsername();
        this.notify.addSuccess("SUCCESS", `Successfully saved user '${name}'`, 3000);
        Log.l("onSubmit(): Successfully saved user:\n", res);
        if(this.mode === 'add' || this.mode === 'Add') {
          this.onUpdate.emit({ type: 'add', employee: this.employee })
        } else {
          this.onUpdate.emit(res);
        }
        return res;
      }
    } catch(err) {
      Log.l(`onSubmit(): Error saving employee!`);
      Log.e(err);
      let name = this.employee.getUsername();
      this.notify.addError("ERROR", `Could not save employee '${name}': '${err.message}'`, 10000);
    }

  }

  public cancel(evt:any) {
    // if (this.mode === 'Edit' || this.from === 'scheduling') {
      //   // this.viewCtrl.dismiss();
      // } else {
        //   // this.navCtrl.setRoot("Employees");
        // }
    // let employee = new Employee();
    // employee.readFromDoc(oo.clone(this.backupEmployee));
    // this.employee.readFromDoc(this.backupEmployee);
    Log.l("cancel(): Employee edit canceled. Employee reverted to:\n", this.employee);
    // this.notify.addInfo("CANCELED", "User edit canceled.", 3000);
    // this.isVisible = false;
    // this.employeeUpdated(evt, 'cancel');
    this.onCancel.emit(evt)
  }

  public deleteEmployee(employee:Employee) {
    Log.l("deleteEmployee(): User clicked on delete employee.");
    this.attemptToDelete(employee).then(res => {
      if(res) {
        Log.l("deleteEmployee(): Success.");
        if(this.mode === 'Edit' || this.from === 'scheduling') {
          this.onUpdate.emit({ type: 'delete', employee: employee });
          // this.viewCtrl.dismiss({ employee: this.employee, deleted: true});
        } else {
          // this.navCtrl.setRoot("Employees");
          this.onUpdate.emit({type: 'delete', employee: employee});
        }
      } else {
        Log.l("deleteEmployee(): User chose not to.");
        this.notify.addInfo("DELETE CANCELED", "User not deleted.", 3000);
      }
    }).catch(err => {
      Log.l("deleteEmployee(): Error!");
      Log.e(err);
      // this.alert.showAlert("ERROR", "Could not delete employee. Connection down or other error!");
      this.notify.addError("DELETE FAILED", `Could not delete employee: '${err.message}'`, 5000);
    });
  }

  public refreshEmployeeView() {
    Log.l(`refreshEmployeeView(): `)
    this.initializeForm();
    this.initializeMenus();
    this.initializeEmployeeData();
    this.updateEmployeeDropdownFields();
  }

  public async attemptToDelete(employee:Employee) {
    try {
      let warning1 = await this.alert.showConfirmYesNo("WARNING", "Are you sure you want to delete an employee? This may cause problems and should only be used on accidentally created users.");
      if (warning1) {
        let warning2 = await this.alert.showConfirmYesNo("BE AWARE", "This is a permanent operation. Are you absolutely sure you want to delete this user?");
        if (warning2) {
          let name = employee.getUsername();
          // let formInput = this.employeeForm.value;
          // let formInput = this.employee;
          // let tech = this.employee;
          // let employeeDoc = Object.assign({}, employee);
          let employeeDoc: any = oo.clone(employee);
          delete employeeDoc.shiftStartTimeHour;
          delete employeeDoc.shiftStartTimeMoment;
          employeeDoc.roles = ["TECHNICIAN"];
          employeeDoc.type = "user";
          if (!employeeDoc._id) {
            employeeDoc._id = `org.couchdb.user:${employee.avatarName}`;
          }
          if (!employeeDoc.docID) {
            employeeDoc.docID = employeeDoc._id;
          }
          let res = await this.server.deleteUser(employeeDoc);
          Log.l(`attemptToDelete(): Successfully deleted employee '${employee.getUsername()}'`);
          let details = `User '${name}' successfully deleted.`;
          // this.notify.addSuccess("DELETED", details, 3000);
          this.audio.playRandomSound('delete_user');
          return true;
        } else {
          return false;
          // this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`, 3000)
        }
      } else {
        return false;
        // this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`, 3000)
      }
    } catch(err) {
      Log.l(`attemptToDelete(): Error deleting user '${employee.getUsername()}'!`);
      Log.e(err);
      throw err;
    }
    // return new Promise((resolve,reject) => {
  }

  // public attemptToDelete(employee:Employee) {
  //   return new Promise((resolve,reject) => {
  //     this.alert.showConfirmYesNo("WARNING", "Are you sure you want to delete an employee? This may cause problems and should only be used on accidentally created users.").then(goAhead => {
  //       if (goAhead) {
  //         this.alert.showConfirmYesNo("BE AWARE", "This is a permanent operation. Are you absolutely sure you want to delete this user?").then(goAhead => {
  //           if (goAhead) {
  //             let name = employee.getUsername();
  //             // let formInput = this.employeeForm.value;
  //             // let formInput = this.employee;
  //             // let tech = this.employee;
  //             // let employeeDoc = Object.assign({}, employee);
  //             let employeeDoc:any = oo.clone(employee);
  //             delete employeeDoc.shiftStartTimeHour;
  //             delete employeeDoc.shiftStartTimeMoment;
  //             employeeDoc.roles = ["TECHNICIAN"];
  //             employeeDoc.type = "user";
  //             if (!employeeDoc._id) {
  //               employeeDoc._id = `org.couchdb.user:${employee.avatarName}`;
  //             }
  //             if (!employeeDoc.docID) {
  //               employeeDoc.docID = employeeDoc._id;
  //             }
  //             this.server.deleteUser(employeeDoc).then(res => {
  //               Log.l("attemptToDelete(): Successfully deleted employee.");
  //               let name = employee.getUsername();
  //               let details = `User '${name}' successfully deleted.`;
  //               // this.notify.addSuccess("DELETED", details, 3000);
  //               this.audio.playRandomSound('delete_user');
  //               resolve(res);
  //             }).catch(err => {
  //               Log.l("attemptToDelete(): Error deleting employee.");
  //               Log.e(err);
  //               reject(err);
  //             });
  //           } else {
  //             Log.l("attemptToDelete(): User first opted to delete, but then thought better.");
  //             let name = employee.getUsername();
  //             this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`)
  //             resolve(false);
  //           }
  //         }).catch(err => {
  //           Log.l("attemptToDelete(): Error getting user response to second prompt. Not deleting.");
  //           Log.e(err);
  //           reject(err);
  //         });
  //       } else {
  //         Log.l("attemptToDelete(): User opted not to delete, probably wisely.");
  //         this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`)
  //         resolve(false);
  //       }
  //     }).catch(err => {
  //       Log.l("attemptDelete(): Error attempting to get user's input. Not deleting.");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public copyPhone(src:string, dest:string) {
    Log.l(`copyPhone(): Copying '${src}' to '${dest}' ...`);
    this.employee[dest] = this.employee[src];
  }

  public checkKeyUp(type:string, event?:any) {
    Log.l("checkKeyUp(): Event is:\n", event);
    if(type === 'phone') {
      if(event && event.key && event.key === 'PageDown') {
        this.copyPhone('phone', 'cell');
      }
    } else if(type === 'cell') {
      if(event && event.key && event.key === 'PageUp') {
        this.copyPhone('cell', 'phone');
      }
    }
  }

  public updateName(evt?:any) {
    Log.l(`updateName(): Event is:\n`, evt);
    let first:string = "", last:string = "", username:string = "";
    if(!this.employee.avatarName) {
      first = this.employee.firstName.toLowerCase();
      last  = this.employee.lastName.toLowerCase();
      if(first && first.length) {
        username = first[0];
      }
      if(last && last.length) {
        username += last;
      }
      this.employee.avatarName = username;
    }
  }

  public updateUserClass(userclass:string) {
    let classArray = userclass.trim().split('\n');
    Log.l(`updateUserClass(): string '${userclass}' split into array:\n`, classArray);
    this.employee.userClass = classArray;
  }

  public updateUserEmail(emails?:string) {
    let email = emails ? emails : this.userEmail;
    Log.l(`updateUserEmail: updating user email from:\n`, email);
    this.setError('email', false);
    let emailArray = email.trim().split('\n');
    Log.l(`updateUserRole(): string '${email}' split into array:\n`, emailArray);
    this.userEmail = email;
    this.employee.email = emailArray;
  }

  public toggleEmployeeStatus(evt?:any) {
    let employee:Employee = this.employee;
    let user = this.data.getUser();
    let loggedInUser = user.getUsername();
    if(employee.active) {
      employee.setStatus('active', loggedInUser);
    } else {
      employee.setStatus('inactive', loggedInUser);
    }
  }

  public async defaultFill(event?:any) {
    try {
      let confirm = await this.alert.showConfirmYesNo("FILL DEFAULT", "Fill the current user with default test user info?");
      if(confirm) {
        this.setError('all', false);
        this.employee.firstName = 'Aaron';
        this.employee.middleName = 'Aaron';
        this.employee.lastName = 'Aaaronson';
        this.employee.username = this.employee.avatarName = 'Aaaron';
        this.employee.avtrNameAsUser = true;
        let site = this.sites.find((a: Jobsite) => {
          return a.site_number == 1075;
        });
        if (site) {
          this.jobsite = site;
          this.updateEmployee('jobsite', site);
          // this.employee.setJobsite(site);
        }
        let email = `${this.employee.avatarName}@sesafleetservices.com`;
        this.userEmail = email + "\n";
        this.updateUserEmail(email);
        this.employee.phone = "956-614-5117";
        this.employee.cell = "956-614-5117";
        this.employee.address.street.street1 = "2801 Corporate Drive";
        this.employee.address.city = "Weslaco";
        this.employee.address.state = "TX";
        this.employee.address.zip = "78599";
        this.employee.rotation = "CONTN WEEK";
        this.employee.payRate = 12;
        this.employee.active = true;
        this.finalizeEmployee();
        this.notify.addSuccess("SUCCESS", "User set to default test user", 3000);
      } else {
        this.notify.addInfo("CANCELED", "User not set to default.", 3000);
      }
       // return res;
    } catch(err) {
      Log.l(`defaultFill(): Error with default fill for some reason.`);
      Log.e(err);
      this.notify.addError("ERROR", `Error filling default: ${err.message}`, 10000);
      // throw err;
    }
  }

  public previous(event?:any) {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.employee = this.employees[this.idx];
    let count = this.employees.length;
    let name = this.employee.getFullNameNormal();
    this.employeeHeader = `Editing '${name}' (${this.idx + 1} / ${count})`;
    this.updateEmployeeDropdownFields();

    // this.report = this.reports[this.idx];
    // this.reportChange.emit(this.idx);
  }

  public next(event?: any) {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.employee = this.employees[this.idx];
    let count = this.employees.length;
    let name = this.employee.getFullNameNormal();
    this.employeeHeader = `Editing '${name}' (${this.idx + 1} / ${count})`;
    this.updateEmployeeDropdownFields();
    // this.report = this.reports[this.idx];
    // this.reportChange.emit(this.idx);
  }

  public showOptions(evt?:any) {
    Log.l(`showOptions(): Event is:\n`, evt);
    this.evOptionsVisible = true;
  }

  public optionsClosed(evt?:any) {
    Log.l(`optionsClosed(): Event is:\n`, evt);
    this.evOptionsVisible = false;
  }
  public async optionsSaved(evt?:any) {
    try {
      Log.l(`optionsSaved(): Event is:\n`, evt);
      this.evOptionsVisible = false;
      this.createJobsiteMenu();
      this.updateEmployeeDropdownFields();
      let prefs = this.prefs.getPrefs();
      let res:any = await this.data.savePreferences(prefs);
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
    } catch(err) {
      Log.l(`optionsSaved(): Error saving options!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    }
  }

  public updateBirthdate(evt?:any):string {
    Log.l(`updateBirthdate(): New birthdate is:\n`, this.birthdate);
    let bdate:Moment = moment(this.birthdate);
    if(isMoment(bdate)) {
      let birthdate:string = bdate.format("YYYY-MM-DD");
      this.employee.birthdate = birthdate;
      return birthdate;
    } else {
      Log.l(`updateBirthdate(): Birthdate invalid:\n`, this.birthdate);
    }
  }

  public updateEmployeeType(evt?:any) {
    Log.l(`updateEmployeeType(): Employee type set to:\n`, this.employee.employeeType);
  }

}
