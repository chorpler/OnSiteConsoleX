// import { FormGroup, FormControl, FormArray, Validators } from "@angular/forms"                ;
import { sprintf                                       } from 'sprintf-js'                    ;
import { Log, moment, Moment, oo                       } from 'domain/onsitexdomain'          ;
import { Component, OnInit, OnDestroy, Input, Output,  } from '@angular/core'                 ;
import { ElementRef, NgZone, EventEmitter,             } from '@angular/core'                 ;
import { OSData                                        } from 'providers/data-service'        ;
import { Jobsite                                       } from 'domain/onsitexdomain'          ;
import { Dropdown, SelectItem                          } from 'primeng/primeng'               ;

@Component({
  selector: 'work-site-hours',
  templateUrl: 'work-site-hours.html',
})
export class WorkSiteHoursComponent implements OnInit,OnDestroy {
  @Input('jobsite') jobsite:Jobsite;
  @Output('jobsiteUpdated') jobsiteUpdated = new EventEmitter<Jobsite>();
  public title          : string        = "Edit Site Hours" ;
  public weekdays       : string[] ;
  // public locIDHoursForm : FormGroup     ;
  // public hoursForm      : FormGroup     ;
  // public jobsite        : Jobsite       ;
  // public siteHours      : FormGroup     ;
  // public _locID         : any           ;

  public startTimeSelect : SelectItem[] = [];
  public locIDHours      : any           ;
  public hoursData       : any[]    ;
  public siteLocationID  : string        ;
  public siteLocation2nd : string        ;
  public shiftRotations  : any[]    ;
  public siteDivisions   : any           ;
  public defaultHours    : number        = 12                ;
  public dataReady       : boolean       = false             ;
  public grid            : {AM:any[], PM:any[]}    ;
  public hourKeys        : any           ;
  public timeKeys        : any           ;
  public dayKeys         : any           ;
  public locIDKeys       : any           ;
  public timeOptions     = []            ;
  public startOptions    : string[] = []                ;
  public startAM         : string        = ""                ;
  public startPM         : string        = ""                ;
  public shiftStartTimes : any           = {AM: "00:00", PM: "00:00"} ;
  public selectedStartAM : string        = ""                ;
  public selectedStartPM : string        = ""                ;
  public defaultShifts   : string[] = ["AM", "PM"]      ;
  public originalHours   : any                               ;
  public defaultRotations: {name:string,fullName:string}[] = [
    { name: "FIRST WEEK", fullName: "First Week"      },
    { name: "CONTN WEEK", fullName: "Continuing Week" },
    { name: "FINAL WEEK", fullName: "Final Week"      },
    { name: "DAYS OFF"  , fullName: "Days Off"        },
    { name: "VACATION"  , fullName: "Vacation"        },
    { name: "UNASSIGNED", fullName: "Unassigned"      },
  ];
  public shifts          : string[] = [          ]      ;
  public rotations       : {name:string,fullName:string}[] = []
  public dropdownHeight  : number = 200;
  public dropdownUnits   : string = "px";
  public get dropdownScroll():string { return this.dropdownHeight + this.dropdownUnits; };
  public hoursModalMode  : boolean = false;
  public hoursClosable   : boolean = true ;
  public isVisible       : boolean = true ;


  constructor(
    public zone : NgZone ,
    public data : OSData ,
  ) {
    window['worksitehourscomponent'] = this;
  }

  ngOnInit() {
    Log.l("WorkSiteHoursComponent: ngOnInit() fired.");
    // if(this.params.get('siteLocationIDs') !== undefined) {
    //   this.siteLocationID = this.params.get('siteLocationID');
    // }
    // if(this.params.get('jobsite') !== undefined) {
    //   this.jobsite = this.params.get('jobsite');
    //   Log.l("EditSiteHours: jobsite read in, was:\n", this.jobsite);
    // } else {
    //   Log.l("EditSiteHours: jobsite NOT PROVIDED!");
    // }

    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("WorkSiteHoursComponent: ngOnDestroy() fired.");
  }

  public runWhenReady() {
    // let i = this.startOptions.indexOf(this.jobsite.shift_start_times.AM);
    // if(i > -1) {
    //   this.jobsite.shift_start_times.AM = this.startOptions[i];
    // }
    // i = this.startOptions.indexOf(this.jobsite.shift_start_times.PM);
    // if(i > -1) {
    //   this.startPM = this.startOptions[i];
    // }
    // this.initializeForm();
    // this.timeKeys = this.jobsite.techShifts;
    // this.hourKeys = Object.keys(this.hoursForm.controls['timeList']['controls']);
    this.originalHours = oo.clone(this.jobsite.hoursList);
    this.initializeInterface();
    this.dataReady = true;
  }

  public initializeInterface() {
    this.weekdays = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
    // this.hoursData = [null, null, null, null, null, null, null];
    let dropdown:SelectItem[] = [];
    for (let i = 0; i < 24; i++) {
      let time = sprintf("%02d:00", i);
      this.timeOptions.push(time);
      let item:SelectItem = {label: time, value: time};
      dropdown.push(item);
      // for (let j = 0; j < 60; j += 30) {
      //   this.startOptions.push(time);
      // }
    }
    this.startTimeSelect = dropdown;
    if (this.jobsite) {
      let times = this.jobsite.getShiftStartTimes();
      this.shiftStartTimes = times;
    }
    this.startAM = this.jobsite.getShiftStartTime('AM').fullName;
    this.startPM = this.jobsite.getShiftStartTime('PM').fullName;
  }

  public initializeGrid() {
    let site = this.jobsite;
    let siteHourList = site.hoursList;
    let shifts       = Object.keys(site.techShifts);
    let rotations    = Object.keys(site.shiftRotations);
    let weekdayCount = this.weekdays.length;
    let fakeGrid:any = {};
    if(shifts.length === 0) {
      shifts = this.defaultShifts.slice(0);
    }
    if(rotations.length === 0) {
      rotations = this.defaultRotations.slice(0).map(a => a.name);
    }
    for(let shift of shifts) {
      fakeGrid[shift] = {};
      for(let rotation of rotations) {
        fakeGrid[shift][rotation] = [];
        for(let i = 0; i < weekdayCount; i++) {
          let val = "0";
          if (site && site.hoursList && site.hoursList[rotation] && site.hoursList[rotation][shift] && site.hoursList[rotation][shift].length) {
            val = String(site.hoursList[rotation][shift][i]);
          }
          fakeGrid[shift][rotation].push(val);
        }
      }
    }
    Log.l("initializeGrid(): Grid was set to:\n", fakeGrid);
    this.grid = fakeGrid;
    return fakeGrid;
  }

  public startTimeUpdated(shiftType: string, time: string) {
    Log.l("startTimeUpdated(): Now updating start time for '%s' to '%s'...", shiftType, time);
    this.jobsite.shift_start_times[shiftType] = time;
  }

  public startTimeChange(shiftType: string) {
    Log.l("startTimeUpdated(): Now updating start time for '%s' ...", shiftType);
    let time = "06:00";
    if(shiftType === 'AM') {
      time = this.startAM;
    } else {
      time = this.startPM;
    }
    this.jobsite.shift_start_times[shiftType] = time;
  }

  public saveSiteHours() {
    let site = this.jobsite;
    Log.l("saveSiteHours(): Site hours clicked, got hours:");
    // let hrs = this.hoursForm.value.timeList;
    // let siteHrs = this.jobsite.hoursList;
    Log.l("saveSiteHours(): Site hours entered:\n", site.hoursList);
    // this.jobsite.hoursList = hrs
    // for(let shift of this.jobsite.shiftRotations) {
    //   if(!siteHrs[shift.name]) {
    //     siteHrs[shift.name] = {};
    //   }
    //   for(let time of this.jobsite.techShifts) {
    //     siteHrs[shift.name][time] = hrs[time][shift.name];
    //   }
    // }
    // this.jobsite.shift_start_times['AM'] = this.startAM;
    // this.jobsite.shift_start_times['PM'] = this.startPM;
    // Log.l("saveSiteHours(): Site hours saved, jobsite is now:\n", this.jobsite);
    // this.dismiss();
    this.jobsiteUpdated.emit(site);
  }

  public dismiss() {
    // this.viewCtrl.dismiss(this.hoursForm.value.timeList)

  }

  public cancel() {
    Log.l("Canceled input of hours.");
    let site = this.jobsite;
    site.hoursList = oo.clone(this.originalHours);
    this.jobsiteUpdated.emit(site);
    // this.viewCtrl.dismiss(null);
  }

  public fillDefaultHours(value?:string|number) {
    let site = this.jobsite;
    // let defaultHours = this.hoursForm.getRawValue().defaultHours;
    // let defaultHours:string = String(this.defaultHours) || "12";
    let defaultHours = value ? String(value) : String(this.defaultHours);
    Log.l("fillDefaultHours(): Now attempting to fill with value '%s' ...", defaultHours);
    // string|number = 11;
    // defaultHours = value ? String(value) : String(defaultHours);

    let js = this.jobsite;
    // let rts = js.shiftRotations;
    // let ampm = js.techShifts;
    // let wd   = this.weekdays;
    // for(let i in js.hoursList) {
    //   let rotation = js.hoursList[i];
    //   for(let j in rotation) {
    //     let shift = rotation[j];
    //     for(let k in shift) {
    //       if(ro)
    //       shift[k] = ""
    //     }
    //   }
    // }
    let hrs = js.hoursList;
    Log.l("fillDefaultHours(): Hours List is initially:\n", JSON.stringify(hrs));
    for(let i in hrs) {
      let rot = hrs[i];
      for(let j in rot) {
        let shift = rot[j];
        for(let k in shift) {
          if(i === 'DAYS OFF') {
            shift[k] = "0";
          } else if(i === 'VACATION') {
            shift[k] = "V";
          } else {
            shift[k] = defaultHours;
          }
        }
      }
    }
    Log.l("fillDefaultHours(): Hours List is finally:\n", JSON.stringify(hrs));
  }

  public copyAM2PM() {
    Log.l("copyAM2PM(): Now attempting...");
    // let js   = this.jobsite;
    // let rts  = js.shiftRotations;
    // let ampm = js.techShifts;
    // let wd   = this.weekdays;
    // // let form = this.hoursForm.controls['timeList']['controls'];
    // let am   = form['AM']['controls'];
    // let pm   = form['PM']['controls'];
    // for (let j in rts) {
    //   let rt = rts[j].name;
    //   let amRotation = am[rt]['controls'];
    //   let pmRotation = pm[rt]['controls'];
    //   for (let i in wd) {
    //     pmRotation[i].setValue(amRotation[i].value);
    //   }
    // }
    let js = this.jobsite;
    let hrs = js.hoursList;
    for(let i in hrs) {
      let rot = hrs[i];
      let am = rot.AM;
      let pm = rot.PM;
      let keys = Object.keys(am);
      let count = keys.length;
      for(let j = 0; j < count; j++) {
        pm[j] = am[j];
      }
    }
  }
}
