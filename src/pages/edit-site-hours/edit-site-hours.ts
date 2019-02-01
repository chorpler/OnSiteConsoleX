import { Component, OnInit, NgZone                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'                 ;
import { FormGroup, FormControl, FormArray, Validators       } from "@angular/forms"                ;
import { Log, moment, Moment                                 } from 'domain/onsitexdomain' ;
import { sprintf                                             } from 'sprintf-js'                    ;
import { Jobsite                                             } from 'domain/onsitexdomain'          ;

@IonicPage({name: "Edit Site Hours"})
@Component({
  selector: 'page-edit-site-hours',
  templateUrl: 'edit-site-hours.html',
})
export class EditSiteHoursPage implements OnInit {
  public title          : string        = "Edit Site Hours" ;
  public weekdays       : Array<string> ;
  public locIDHoursForm : FormGroup     ;
  public hoursForm      : FormGroup     ;
  public jobsite        : Jobsite       ;
  public siteHours      : FormGroup     ;
  public _locID         : any           ;

  public locIDHours     : any           ;
  public hoursData      : Array<any>    ;
  public siteLocationID : string        ;
  public siteLocation2nd: string        ;
  public shiftRotations : Array<any>    ;
  public siteDivisions  : any           ;
  public dataReady      : boolean       = false             ;
  public hourKeys       : any           ;
  public timeKeys       : any           ;
  public dayKeys        : any           ;
  public locIDKeys      : any           ;
  public timeOptions    = []            ;
  public startOptions   : Array<string> = []                ;
  public startAM        : string        = ""                ;
  public startPM        : string        = ""                ;
  public shiftStartTimes: any           = {AM: "00:00", PM: "00:00"} ;
  public selectedStartAM: string        = ""                ;
  public selectedStartPM: string        = ""                ;

  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController, public zone:NgZone) {
    Log.l("EditSiteHours: constructor called");
    window['editsitehours'] = this;
    window['moment'] = moment;
  }

  ngOnInit() {
    Log.l("EditSiteHours: ngOnInit() fired.");
    // if(this.params.get('siteLocationIDs') !== undefined) {
    //   this.siteLocationID = this.params.get('siteLocationID');
    // }
    if(this.params.get('jobsite') !== undefined) {
      this.jobsite = this.params.get('jobsite');
      Log.l("EditSiteHours: jobsite read in, was:\n", this.jobsite);
    } else {
      Log.l("EditSiteHours: jobsite NOT PROVIDED!");
    }

    this.weekdays = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
    this.hoursData = [ null, null, null, null, null, null, null ];
    for(let i = 0; i < 24; i++) {
      let time = sprintf("%02d:00", i);
      this.timeOptions.push(time);
      for(let j = 0; j < 60; j += 30) {
        let time2 = sprintf("%02d:%02d:", i, j);
        this.startOptions.push(time);
      }
    }
    if(this.jobsite) {
      let times = this.jobsite.getShiftStartTimes();
      this.shiftStartTimes = times;
    }
    this.startAM = this.jobsite.getShiftStartTime('AM');
    this.startPM = this.jobsite.getShiftStartTime('PM');
    // let i = this.startOptions.indexOf(this.jobsite.shift_start_times.AM);
    // if(i > -1) {
    //   this.jobsite.shift_start_times.AM = this.startOptions[i];
    // }
    // i = this.startOptions.indexOf(this.jobsite.shift_start_times.PM);
    // if(i > -1) {
    //   this.startPM = this.startOptions[i];
    // }
    this.initializeForm();
    this.timeKeys = this.jobsite.techShifts;
    this.hourKeys = Object.keys(this.hoursForm.controls['timeList']['controls']);
    this.dataReady = true;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad EditSiteHoursPage');
  }

  initializeForm() {
    let js = this.jobsite;
    let sdr = js.shiftRotations;
    this.hoursForm = new FormGroup({});
    let shiftTime = new FormGroup({});
    let startTimes = new FormGroup({});
    let hours = this.jobsite.hoursList;
    // let amTime = moment(js.shift_start_times.AM, 'HH:mm');
    // let pmTime = moment(js.shift_start_times.PM, 'HH:mm');
    // let amCtrl = new FormControl(js.shift_start_times.AM, Validators.required);
    // let pmCtrl = new FormControl(js.shift_start_times.PM, Validators.required);
    // let amCtrl = new FormControl(amTime.format(), Validators.required);
    // let pmCtrl = new FormControl(pmTime.format(), Validators.required);
    // let times = {'AM': amCtrl, 'PM': pmCtrl}
    // startTimes.addControl('PM', pmCtrl);
    for(let time of this.jobsite.techShifts) {
      let allRotationRows = new FormGroup({});
      for(let rot of sdr) {
        let rotCode = rot.name;
        if(!this.jobsite.hoursList) {
          this.jobsite.hoursList = {};
          this.jobsite.hoursList[rot.name] = {};
          this.jobsite.hoursList[rot.name][time] = [null, null, null, null, null, null, null];
        } else if(!hours[rot.name]) {
          hours[rot.name] = {};
          hours[rot.name][time] = [null, null, null, null, null, null, null];
        } else if(!hours[rot.name][time]) {
          hours[rot.name][time] = [null, null, null, null, null, null, null];
        }
        Log.l("initializeForm(): Jobsite is now:\n", this.jobsite);
        Log.l("initializeForm(): Creating form array controls for shift rotation:\n", rot);
        let oneHoursRow = new FormArray([]);
        for(let i in this.weekdays) {
          Log.l(`Now adding hour ${i} control...`);
          let value = hours[rot.name][time][i];
          // let value = rot['hours'][time][i];
          let control = new FormControl(value, Validators.required);
          oneHoursRow.push(control);
        }
        allRotationRows.addControl(rotCode, oneHoursRow);
      }
      // allRotationRows.addControl('startTime', times[time]);
      Log.l("Ended up with hours rows group:\n", allRotationRows);
      shiftTime.addControl(time, allRotationRows);
      // this.siteHours = allRotationRows;
    }

    // this.hoursForm = new FormGroup({'hoursList': this.siteHours});
    this.hoursForm = new FormGroup(
      {'timeList': shiftTime,
      'defaultHours': new FormControl(12)}
    );
    Log.l("Ended up with full form:\n", this.hoursForm);
  }

  // startTimeUpdated(shiftType:string) {
  //   Log.l("startTimeUpdated(): Now updating start time for '%s' to '%s'...",shiftType,this.startAM);
  //   if(shiftType === 'AM') {
  //     this.jobsite.shift_start_times.AM = this.startAM;
  //   }
  // }

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
    Log.l("saveSiteHours(): Site hours clicked, got hours:");
    let hrs = this.hoursForm.value.timeList;
    let siteHrs = this.jobsite.hoursList;
    Log.l("saveSiteHours(): Site hours entered:\n", hrs);
    // this.jobsite.hoursList = hrs
    for(let shift of this.jobsite.shiftRotations) {
      if(!siteHrs[shift.name]) {
        siteHrs[shift.name] = {};
      }
      for(let time of this.jobsite.techShifts) {
        siteHrs[shift.name][time] = hrs[time][shift.name];
      }
    }
    this.jobsite.shift_start_times['AM'] = this.startAM;
    this.jobsite.shift_start_times['PM'] = this.startPM;
    Log.l("saveSiteHours(): Site hours saved, jobsite is now:\n", this.jobsite);
    this.dismiss();
  }

  public oldSaveSiteHours() {
    let hrs = this.hoursForm.value.timeList;
    Log.l("saveSiteHours(): Site hours clicked, got hours:\n", hrs);
    for(let shift of this.jobsite.shiftRotations) {
      // let shift = this.jobsite.shiftRotations[shiftName];
      for(let time of this.jobsite.techShifts) {
        shift['hours'][time] = hrs[time][shift.name];
      }
    }

    Log.l(hrs);
    this.dismiss();
  }

  // saveHoursToDivisions() {
  //   let js = this.jobsite;
  //   let hours = this.hoursForm.value;
  //   js.updateSiteDivisions(this.rotations, this.hour)
  // }

  public dismiss() {
    this.viewCtrl.dismiss(this.hoursForm.value.timeList)
  }

  public cancel() {
    Log.l("Canceled input of hours.");
    this.viewCtrl.dismiss(null);
  }

  public fillDefaultHours(value?:string) {
    Log.l("fillDefaultHours(): Now attempting...");
    let defaultHours = this.hoursForm.getRawValue().defaultHours;
    defaultHours = value ? String(value) : defaultHours ? String(defaultHours) : 11;
    // string|number = 11;
    // defaultHours = value ? String(value) : String(defaultHours);

    let js = this.jobsite;
    let rts = js.shiftRotations;
    let ampm = js.techShifts;
    let wd   = this.weekdays;
    let form = this.hoursForm.controls['timeList']['controls'];
    for(let tod of ampm) {
      let time = form[tod]['controls'];
      for(let j in rts) {
        let rt = rts[j].name;
        let rotation = time[rt]['controls'];
        for(let i in wd) {
          let day = rotation[i];
          if(rt === 'DAYS OFF') {
            day.setValue("0");
          } else if(rt === 'VACATION') {
            day.setValue("V");
          } else {
            day.setValue(defaultHours);
          }
        }
      }
    }
  }

  public copyAM2PM() {
    Log.l("copyAM2PM(): Now attempting...");
    let js   = this.jobsite;
    let rts  = js.shiftRotations;
    let ampm = js.techShifts;
    let wd   = this.weekdays;
    let form = this.hoursForm.controls['timeList']['controls'];
    let am   = form['AM']['controls'];
    let pm   = form['PM']['controls'];
    for (let j in rts) {
      let rt = rts[j].name;
      let amRotation = am[rt]['controls'];
      let pmRotation = pm[rt]['controls'];
      for (let i in wd) {
        pmRotation[i].setValue(amRotation[i].value);
      }
    }
  }
}
