import { sprintf                                             } from 'sprintf-js'               ;
import { Component, ViewChild, OnInit                        } from '@angular/core'            ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'            ;
import { FormGroup, FormControl, Validators                  } from "@angular/forms"           ;
import { Log, moment, Moment                                 } from 'domain/onsitexdomain'           ;
import { ServerService                                       } from 'providers/server-service' ;
import { Employee                                            } from 'domain/onsitexdomain'           ;
import { Jobsite                                             } from 'domain/onsitexdomain'           ;
import { AlertService                                        } from 'providers/alert-service'  ;
import { SmartAudio                                          } from 'providers/smart-audio'    ;
import { OSData                                              } from 'providers/data-service'   ;
import { NotifyService                                       } from 'providers/notify-service' ;
import { SelectItem, Dropdown                                } from 'primeng/primeng'          ;

const _compareTechAndSite = (tech: Employee, site: Jobsite) => {
  let keys = ['client', 'location', 'locID'];
  let equality = true;
  for(let key of keys) {
    let A = tech[key] ? tech[key].toUpperCase().trim() : "";
    // let B = key === 'loc2nd' ? (site[key] && typeof site[key] == 'object' ? site[key].name.toUpperCase().trim() : "NA") :
    let B = site[key].name.toUpperCase().trim();
    // let C = key === 'loc2nd' ? (site[key] && typeof site[key] == 'object' ? site[key].fullName.toUpperCase().trim() : "NA") :
    let C = site[key].fullName.toUpperCase().trim();
    equality = equality && (A == B || A == C);
  }
  return equality;
}

@IonicPage({name: 'Employee Beta'})
@Component({
  selector: 'employee-beta',
  templateUrl: 'employee-beta.html'
})

export class EmployeeBetaPage implements OnInit {
  @ViewChild('avatarName') avatarName                                                 ;
  @ViewChild('')
  public title          : string        = "Employee"                                  ;
  public developerMode  : boolean       = false                                       ;
  public mode           : string        = "Add"                                       ;
  public from           : string        = "employees"                                 ;
  public employee       : Employee                                                    ;
  public employeeForm   : FormGroup                                                   ;
  public usernames      : Array<string> = []                                          ;
  public dataReady      : boolean       = false                                       ;
  public clients        : any           = null                                        ;
  public locations      : any           = null                                        ;
  public locids         : any           = null                                        ;
  public shifts         : any           = null                                        ;
  public shiftlengths   : any           = null                                        ;
  public shiftstarttimes: any           = null                                        ;
  public client         : any           = null                                        ;
  public location       : any           = null                                        ;
  public locID          : any           = null                                        ;
  public shift          : any           = null                                        ;
  public shiftLength    : any           = null                                        ;
  public shiftStartTime : any           = null                                        ;
  public prefixList     : SelectItem[]  = []                                          ;
  public suffixList     : SelectItem[]  = []                                          ;
  public jobsiteList    : SelectItem[]  = []                                          ;
  public shiftList      : SelectItem[]  = []                                          ;
  public shiftLengthList: SelectItem[]  = []                                          ;
  public shiftStartList : SelectItem[]  = []                                          ;

  public prefixes       : Array<string> = ["Mr.", "Dr.", "Sr.", "Mrs.", "Ms.", "HRM"] ;
  public suffixes       : Array<string> = ["Jr.", "Sr.", "III", "Esq"]                ;
  public site           : Jobsite                                                     ;
  public sites          : Array<Jobsite>= []                                          ;
  // public data           : any                                                         ;
  public cmpTechSite    : any           = _compareTechAndSite                         ;
  public _jobsite       : any                                                         ;
  public _shift         : any                                                         ;
  public _shiftLength   : any                                                         ;
  public _shiftStartTime: any                                                         ;
  public username       : string = "unknown"                                          ;
  constructor(public navCtrl:NavController, public navParams:NavParams, public server:ServerService, public viewCtrl:ViewController, public alert:AlertService, public audio:SmartAudio, public data:OSData, public notify:NotifyService) {
    window['onsiteemployee'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad AddEmployeePage');
  }

  ngOnInit() {
    if(this.navParams.get('mode') !== undefined) {
      this.mode = this.navParams.get('mode');
    }
    if(this.navParams.get('from') !== undefined) {
      this.from = this.navParams.get('from');
    }
    this.title = `${this.mode} Employee`;
    if (this.navParams.get('employee') !== undefined) {
      this.employee = this.navParams.get('employee');
      Log.l("AddEmployeePage: Got employee:\n", this.employee);
    } else {
      Log.l("AddEmployeePage: employee not passed!");
      // this.employee = new Employee('', '', '', '', '', '', '', '', true, "M-TECH", '', '', '', 'NA', 'AM', 11, moment().hour(6).startOf('hour'), '', '', '');
      this.employee = new Employee();
    }
    if(this.navParams.get('usernames') !== undefined) { this.usernames = this.navParams.get('usernames');} else {
      let employees = this.data.getData('employees');
      this.usernames = employees.map(a => a['username']);
    }
    this.initializeEmployeeData().then(res => {
      return this.initializeJobsiteData();
    }).then(res => {
      this.initializeForm();
      this.initializeFormListeners();
      let user = this.data.getUser();
      if(user) {
        let username = user.getUsername();
        this.username = username;
        this.developerMode = username === 'mike' || username === 'Chorpler' || username === 'Hachero' ? true : false;
      }
      this.dataReady = true;
    }).catch(err => {
      Log.l("initializeEmployeeData(): Error getting employee data!");
      Log.e(err);
    });
  }

  public initializeMenus() {
    let prefixList     : SelectItem[] = [] ;
    let suffixList     : SelectItem[] = [] ;
    let jobsiteList    : SelectItem[] = [] ;
    let shiftList      : SelectItem[] = [] ;
    let shiftLengthList: SelectItem[] = [] ;
    let shiftStartList : SelectItem[] = [] ;

    for(let prefix of this.prefixes) {
      let item:SelectItem = {label: prefix, value: prefix};
      prefixList.push(item);
    }

    this.prefixList                     = this.prefixes.map((a:any) => {
      let item:SelectItem = {label: a, value: a};
      return item;
    });
    this.suffixList                     = this.suffixes.map((a:any) => {
      let item:SelectItem = {label: a, value: a};
      return item;
    });
    this.jobsiteList                    = this.sites.map((a:any) => {
      let item:SelectItem = {label: a.schedule_name, value: a};
      return item;
    });
    this.shiftList                      = this.shifts.map((a:any) => {
      let item:SelectItem = {label: a, value: a};
      return item;
    });
    this.shiftLengthList                = this.shiftlengths.map((a:any) => {
      let item:SelectItem = {label: a, value: a};
      return item;
    });
    this.shiftStartList                 = this.shiftstarttimes.map((a:any) => {
      let item:SelectItem = {label: a, value: a};
      return item;
    });

    // this.prefixList = prefixList;
    // this.suffixList = suffixList;
    // this.jobsiteList = jobsiteList;
    // this.shiftList = shiftList;
    // this.shiftLengthList = shiftLengthList;
    // this.shiftStartList = shiftStartList;
  }

  public initializeForm() {
    let e = this.employee;
    let tech = e;

    let hours = [];
    for(let i = 0; i < 24; i++) {
      let hour = sprintf("%02d:00", i);
      let time = {name: String(i), fullName: hour};
      hours.push(time);
    }
    this.shiftstarttimes = hours;
    this.shiftStartTime = this.shiftstarttimes.find(a => { return a['name'] == tech.shiftStartTime;});
    this.shift = this.shifts.find(a => {return a['name'] === tech.shift});
    this.shiftLength = this.shiftlengths.find(a => {return a['name'] == tech.shiftLength});

    // this.loc2nds = [{name: "N", fullName: "North"}, {name: "S", fullName: "South"}, {name: "NA", fullName: "N/A"}];
    for(let site of this.sites) {
      // let client = site.client   ;
      // let loc    = site.location ;
      // let locID  = site.locID    ;
      // let loc2   = site.loc2nd   ;

      // this.clients.push(client);
      // this.locations.push(loc);
      // this.locids.push(locID);
      // this.loc2nds.push(loc2);
      Log.l(`Checking to see if tech '${tech.getFullName()}' is at site '${site.getSiteID()}':\n`, tech);
      if(_compareTechAndSite(tech, site)) {
        Log.l(`Tech '${tech.getFullName()}' found at site:\n`, site);
        this.site     = site          ;
        this.client   = site.client   ;
        this.location = site.location ;
        this.locID    = site.locID    ;
        break;
        // this.loc2nd   = site.loc2nd   ;
      } else {
        // Log.l(`Tech '${tech.getFullName()}' NOT FOUND at site:\n`, site);
      }
    }

    // let startTime = now.hour(e.shiftStartTime).startOf('hour').format("HH:mm");
    let middle = e['middleName'] ? e['middleName']    : '' ;
    let prefix = e['prefix']     ? e['prefix']        : '' ;
    let suffix = e['suffix']     ? e['suffix']        : '' ;

    let street1 = new FormControl(e.address.street.street1);
    let street2 = new FormControl(e.address.street.street2);
    let street  = new FormGroup({ 'street1': street1, 'street2': street2 });
    let city    = new FormControl(e.address.city);
    let state   = new FormControl(e.address.state);
    let zipcode = new FormControl(e.address.zipcode);
    let address = new FormGroup({
      'street': street,
      'city'  : city,
      'state' : state,
      'zip'   : zipcode
    });

    this.employeeForm = new FormGroup({
      'prefix'        : new FormControl(prefix             , Validators.required),
      'firstName'     : new FormControl(e.firstName        , Validators.required),
      'middleName'    : new FormControl(middle             , Validators.required),
      'lastName'      : new FormControl(e.lastName         , Validators.required),
      'suffix'        : new FormControl(suffix             , Validators.required),
      'username'      : new FormControl(e.username         , Validators.required),
      'name'          : new FormControl(e.name             , Validators.required),
      'type'          : new FormControl(e.type             , Validators.required),
      'avatarName'    : new FormControl(e.avatarName       , Validators.required),
      'avtrNameAsUser': new FormControl(e.avtrNameAsUser   , Validators.required),
      'userClass'     : new FormControl(e.userClass        , Validators.required),
      'jobsite'       : new FormControl(this.site                               ),
      'shift'         : new FormControl(this.shift                              ),
      'shiftLength'   : new FormControl(this.shiftLength                        ),
      'shiftStartTime': new FormControl(this.shiftStartTime                     ),
      'email'         : new FormControl(e.email            , Validators.required),
      'phone'         : new FormControl(e.phone                                 ),
      'cell'          : new FormControl(e.cell                                  ),
      'address'       : address                                                  ,
      'payRate'       : new FormControl(e.payRate          , Validators.required), // should be $ anount or 'Salary' -> the "string" "Salary"
      'active'        : new FormControl(e.active           , Validators.required), // Style to be grayed in employee list as a visual cue on employees page
    });
  }

  public initializeFormListeners() {
    this._jobsite = this.employeeForm.get('jobsite');
    this._shift   = this.employeeForm.get('shift');
    this._shiftLength = this.employeeForm.get('shiftLength');
    this._shiftStartTime = this.employeeForm.get('shiftStartTime');

    this._jobsite.valueChanges.subscribe((value:any) => {
      let site         = value                                                                                 ;
      this.updateSite(site);
    });
  }

  public updateSite(site:Jobsite) {
      let tech         = this.employee                                                                         ;
      let shiftTimes   = site.getShiftTypes()                                                                  ;
      let times        = []                                                                                    ;
      for(let time of shiftTimes) {
        let one = {name: time.toUpperCase(), fullName: time.toUpperCase()};
        times.push(one);
      }
      if(!tech.rotation) {
        tech.rotation = "CONTN WEEK";
      }
      if(!tech.shift) {
        tech.shift = "AM";
      }

      let shift            = tech.shift                                                                        ;
      this.shift           = this.shifts.find(a => {return a['name']==shift || a['fullName']==shift;})         ;

      let len              = site.getSiteShiftLength(tech.rotation, tech.shift, moment())                      ;
      let strt             = site.getShiftStartTimeString(tech.shift)                                          ;
      let shiftLength      = this.shiftlengths.find(a => {return a['name'] == len || a['fullName'] == len;})   ;
      let shiftStartTime   = this.shiftstarttimes.find(a => {return a['name'] == strt || a['fullName']==strt;});
      tech.shiftLength     = shiftLength                                                                       ;
      tech.shiftStartTime  = shiftStartTime                                                                    ;
      this.shiftLength     = shiftLength                                                                       ;
      this.shiftStartTime  = shiftStartTime                                                                    ;
      this.site            = site                                                                              ;
      // this.shift           = this.shifts.find(a => {return a['name']===tech.shift || a['fullName']===tech.shift;});
      this._shift.setValue(this.shift, {emitEvent: false})                                                     ;
      this._shiftLength.setValue(tech.shiftLength, {emitEvent: false})                                         ;
      this._shiftStartTime.setValue(tech.shiftStartTime, {emitEvent: false})                                   ;
  }

  public initializeEmployeeData() {
    return new Promise((resolve,reject) => {
      this.server.getAllConfigData().then(res => {
        Log.l("initializeEmployeeData(): Successfuly fetched employee config data!");
        for(let key of Object.keys(res)) {
          this[key] = res[key];
        }
        resolve(res);
      }).catch(err => {
        Log.l("initializeEmployeeData(): Error fetching employee config data!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public initializeJobsiteData() {
    return new Promise((resolve,reject) => {
      this.server.getJobsites().then(res => {
        Log.l("initializeJobsiteData(): Successfully fetched jobsite list:\n",res);
        let sites = new Array<Jobsite>();
        for(let key of Object.keys(res)) {
          let doc  = res[key];
          let site = new Jobsite();
          site.readFromDoc(doc);
          sites.push(site);
        }
        this.sites = sites;
        resolve(this.sites);
      }).catch(err => {
        Log.l("initializeJobsiteData(): Error retrieving jobsite list!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public updateEmployeeList() {
    this.server.getEmployees().then((res) => {
      Log.l(`updateEmployeeLists(): Success! Result:\n`, res);
      // this.
    }).catch((err) => {
      Log.l(`updateEmployeeLists(): Error!`);
      Log.e(err);
    });
  }

  public updateEmployee(param:string, value:any) {
    if(param === 'prefix') {
    } else if(param === 'suffix') {
    } else if(param === 'jobsite') {
    } else if(param === 'shift') {
    } else if(param === 'shiftLength') {
    } else if(param === '') {
    }
  }

  public onSubmit() {
    let formInput = this.employeeForm.value;
    let names = this.usernames || [];
    let name = formInput['avatarName']
    if(!formInput.avatarName) {
      // this.alert.showAlert("COME ON, MAN!", "The Avatar Name (username) field must be filled in with a unique ID for each employee.");
      this.notify.addError("DUPLICATE USER", "The username field cannot be left blank.", 3000);
    } else if(names.indexOf(name) > -1 && this.mode === 'Add') {
      // this.alert.showAlert("USER EXISTS", "This Avatar Name (username) already exists. Please change avatar name.").then(res => {
      this.notify.addError("DUPLICATE USER", "Another user already has that username.", 3000);
      setTimeout(() => {
        this.avatarName.setFocus();
      }, 500)
      // })
    } else {
      Log.l("onSubmit(): Saving employee from form:\n", formInput);
      this.alert.showSpinner("Saving employee...");
      this.employee.readFromDoc(formInput);
      Log.l("onSubmit(): Read employee in from form:\n", this.employee);
      let employeeDoc = Object.assign({}, this.employee);
      if(employeeDoc['shiftStartTimeHour'] !== undefined) { delete employeeDoc.shiftStartTimeHour; }
      if(employeeDoc['shiftStartTimeMoment'] !== undefined) { delete employeeDoc.shiftStartTimeMoment; }
      Log.l("onSubmit(): User name is: '%s'", name);
      employeeDoc['_id']   = `org.couchdb.user:${name}`;
      employeeDoc['roles'] = employeeDoc['roles'] || ["M-TECH"];
      employeeDoc['type']  = "user";
      employeeDoc['docID'] = employeeDoc['docID'] || employeeDoc['_id'];
      // if(!employeeDoc['docID']) {
      //   employeeDoc['docID'] = employeeDoc['_id'];
      // }
      employeeDoc['name']     = name;
      employeeDoc['username'] = name;
      Log.l("onSubmit(): Now saving employee:\n", employeeDoc);
      this.server.saveEmployee(employeeDoc).then((res) => {
        Log.l(`onSubmit(): Success! Result:\n`, res);
        this.alert.hideSpinner();
        if(this.mode === 'Edit' || this.from === 'scheduling') {
          this.viewCtrl.dismiss({employee: this.employee, deleted: false});
        } else {
          this.navCtrl.setRoot("Employees");
        }
      }).catch((err) => {
        Log.l(`onSubmit(): Error!`);
        Log.e(err);
        this.alert.hideSpinner();
        this.notify.addError("ERROR", "Could not save employee: " + err.message, -1);
        // this.alert.showAlert("ERROR", "Could not save employee. Connection down or other error!");
      });
    }
  }

  cancel() {
    Log.l("Add/Edit employee canceled.");
    if (this.mode === 'Edit' || this.from === 'scheduling') {
      this.viewCtrl.dismiss();
    } else {
      this.navCtrl.setRoot("Employees");
    }
  }

  deleteEmployee(employee:Employee) {
    Log.l("deleteEmployee(): User clicked on delete employee.");
    this.attemptToDelete(employee).then(res => {
      if(res) {
        Log.l("deleteEmployee(): Success.");
        if(this.mode === 'Edit' || this.from === 'scheduling') {
          this.viewCtrl.dismiss({ employee: this.employee, deleted: true});
        } else {
          this.navCtrl.setRoot("Employees");
        }
      } else {
        Log.l("deleteEmployee(): User chose not to.");
      }
    }).catch(err => {
      Log.l("deleteEmployee(): Error!");
      Log.e(err);
      this.alert.showAlert("ERROR", "Could not delete employee. Connection down or other error!");
    });
  }

  attemptToDelete(employee:Employee) {
    return new Promise((resolve,reject) => {
      this.alert.showConfirmYesNo("WARNING", "Are you sure you want to delete an employee? This may cause problems and should only be used on accidentally created users.").then(goAhead => {
        if (goAhead) {
          this.alert.showConfirmYesNo("BE AWARE", "This is a permanent operation. Are you absolutely sure you want to delete this user?").then(goAhead => {
            if (goAhead) {
              let name = employee.getUsername();
              let formInput = this.employeeForm.value;
              let employeeDoc = Object.assign({}, employee);
              delete employeeDoc.shiftStartTimeHour;
              delete employeeDoc.shiftStartTimeMoment;
              employeeDoc['roles'] = ["TECHNICIAN"];
              employeeDoc['type'] = "user";
              if (!employeeDoc['_id']) {
                employeeDoc['_id'] = `org.couchdb.user:${formInput.username}`;
              }
              if (!employeeDoc['docID']) {
                employeeDoc['docID'] = employeeDoc['_id'];
              }
              this.server.deleteUser(employeeDoc).then(res => {
                Log.l("attemptToDelete(): Successfully deleted employee.");
                let name = employee.getUsername();
                let details = `User '${name}' successfully deleted.`;
                // this.notify.addSuccess("DELETED", details, 3000);
                this.audio.playRandomSound('delete_user');
                resolve(res);
              }).catch(err => {
                Log.l("attemptToDelete(): Error deleting employee.");
                Log.e(err);
                reject(err);
              });
            } else {
              Log.l("attemptToDelete(): User first opted to delete, but then thought better.");
              let name = employee.getUsername();
              this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`)
              resolve(false);
            }
          }).catch(err => {
            Log.l("attemptToDelete(): Error getting user response to second prompt. Not deleting.");
            Log.e(err);
            reject(err);
          });
        } else {
          Log.l("attemptToDelete(): User opted not to delete, probably wisely.");
          this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`)
          resolve(false);
        }
      }).catch(err => {
        Log.l("attemptDelete(): Error attempting to get user's input. Not deleting.");
        Log.e(err);
        reject(err);
      });
    });
  }

}
