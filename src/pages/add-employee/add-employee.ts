import { sprintf                                                } from 'sprintf-js'               ;
import { Component, ViewChild, OnInit                           } from '@angular/core'            ;
import { IonicPage,    NavController, NavParams, ViewController } from 'ionic-angular'            ;
import { FormGroup,    FormControl,   Validators                } from '@angular/forms'           ;
import { Log, moment, Moment                                    } from 'domain/onsitexdomain'           ;
import { ServerService                                          } from 'providers/server-service' ;
import { Employee                                               } from 'domain/onsitexdomain'           ;
import { Jobsite                                                } from 'domain/onsitexdomain'           ;
import { AlertService                                           } from 'providers/alert-service'  ;
import { SmartAudio                                             } from 'providers/smart-audio'    ;
import { OSData                                                 } from 'providers/data-service'   ;

const _compareTechAndSite = (tech:Employee, site:Jobsite) => {
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

@IonicPage({ name    : 'Add Employee'                                   })
@Component({ selector: 'add-employee', templateUrl: 'add-employee.html' })

export class AddEmployee implements OnInit {
  @ViewChild('avatarName') avatarName                                                 ;
  public title          : string        = "Add Employee"                              ;
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
  public loc2nds        : any           = null                                        ;
  public shifts         : any           = null                                        ;
  public shiftlengths   : any           = null                                        ;
  public shiftstarttimes: any           = null                                        ;
  public client         : any           = null                                        ;
  public location       : any           = null                                        ;
  public locID          : any           = null                                        ;
  public loc2nd         : any           = null                                        ;
  public shift          : any           = null                                        ;
  public shiftLength    : any           = null                                        ;
  public shiftStartTime : any           = null                                        ;
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
  constructor(public navCtrl:NavController, public navParams:NavParams, public server:ServerService, public viewCtrl:ViewController, public alert:AlertService, public audio:SmartAudio, public data:OSData) {
    window['addemployee'] = this;
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
      this.employee.userClass = ["M-TECH"];
      this.employee.shift = "AM";
      this.employee.shiftLength = 11;
      // let now = moment();
      this.employee.shiftStartTime = 6;
      this.employee.shiftStartTimeHour = "06:00";
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

  initializeForm() {
    // let now = moment();
    // let keys1 = ['client', 'location', 'locid', 'loc2nd', 'shift', 'shiftlength', 'shiftstarttime']
    // let keys2 = ['clients', 'locations', 'locids', 'loc2nds', 'shifts', 'shiftlengths', 'shiftstarttimes'];
    // let keys3 = ["client", "location", "locID", "loc2nd", "shift", "shiftLength", "shiftStartTime"]
    // for(let i in keys2) {
    //   let key2 = keys2[i];
    //   let key3 = keys3[i];
    //   // let key1 = keys1[i];
    //   for(let j of this[key2]) {
    //     let fullName = String(j.fullName).toUpperCase();
    //     let name = String(j.name).toUpperCase();
    //     let employeeData = String(this.employee[key3]).toUpperCase();
    //     if(fullName === employeeData || name === employeeData) {
    //       this[key3] = j;
    //       // Log.l("initializeForm(): Set value of this.%s to:\n", key3, j);
    //     }
    //   }
    // }
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

  initializeFormListeners() {
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
      tech.client          = site.client.fullName.toUpperCase()                                                ;
      tech.location        = site.location.fullName.toUpperCase()                                              ;
      tech.locID           = site.locID.fullName.toUpperCase()                                                 ;
      let len              = site.getSiteShiftLength(tech.rotation, tech.shift, moment())                      ;
      let strt             = site.getShiftStartTime(tech.shift)                                                ;
      let shiftLength      = this.shiftlengths.find(a => {return a['name'] == len || a['fullName'] == len;})   ;
      let shiftStartTime   = this.shiftstarttimes.find(a => {return a['name'] == strt || a['fullName']==strt;});
      tech.shiftLength     = shiftLength                                                                       ;
      tech.shiftStartTime  = shiftStartTime                                                                    ;
      this.shiftLength     = shiftLength;
      this.shiftStartTime  = shiftStartTime;
      this.site            = site                                                                              ;
      // this.shift           = this.shifts.find(a => {return a['name']===tech.shift || a['fullName']===tech.shift;});
      this._shift.setValue(this.shift, {emitEvent: false})                                                     ;
      this._shiftLength.setValue(tech.shiftLength, {emitEvent: false})                                         ;
      this._shiftStartTime.setValue(tech.shiftStartTime, {emitEvent: false})                                   ;
  }

  initializeEmployeeData() {
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

  initializeJobsiteData() {
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

  updateEmployeeList() {
    this.server.getEmployees().then((res) => {
      Log.l(`updateEmployeeLists(): Success! Result:\n`, res);
      // this.
    }).catch((err) => {
      Log.l(`updateEmployeeLists(): Error!`);
      Log.e(err);
    });
  }

  onSubmit() {
    let formInput = this.employeeForm.value;
    let names = this.usernames || [];
    let name = formInput['avatarName']
    if(!formInput.avatarName) {
      this.alert.showAlert("COME ON, MAN!", "The Avatar Name (username) field must be filled in with a unique ID for each employee.");
    } else if(names.indexOf(name) > -1 && this.mode === 'Add') {
      this.alert.showAlert("USER EXISTS", "This Avatar Name (username) already exists. Please change avatar name.").then(res => {
        setTimeout(() => {
          this.avatarName.setFocus();
        }, 500)
      })
    } else {
      Log.l("onSubmit(): Saving employee from form:\n", formInput);
      this.alert.showSpinner("Saving employee...");
      this.employee.readFromDoc(formInput);
      Log.l("onSubmit(): Read employee in from form:\n", this.employee);
      let employeeDoc = Object.assign({}, this.employee);
      if(employeeDoc['shiftStartTimeHour'] !== undefined) { delete employeeDoc.shiftStartTimeHour; }
      if(employeeDoc['shiftStartTimeMoment'] !== undefined) { delete employeeDoc.shiftStartTimeMoment; }
      let name = formInput['avatarName'];
      Log.l("onSubmit(): User name is: '%s'", name);
      employeeDoc['_id']   = `org.couchdb.user:${name}`;
      employeeDoc['roles'] = ["TECHNICIAN"];
      employeeDoc['type']  = "user";
      if(!employeeDoc['docID']) {
        employeeDoc['docID'] = employeeDoc['_id'];
      }
      employeeDoc['name'] = name;
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
        this.alert.showAlert("ERROR", "Could not save employee. Connection down or other error!");
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
                this.audio.playRandomSound('delete_user');
                resolve(res);
              }).catch(err => {
                Log.l("attemptToDelete(): Error deleting employee.");
                Log.e(err);
                reject(err);
              });
            } else {
              Log.l("attemptToDelete(): User first opted to delete, but then thought better.");
              resolve(false);
            }
          }).catch(err => {
            Log.l("attemptToDelete(): Error getting user response to second prompt. Not deleting.");
            Log.e(err);
            reject(err);
          });
        } else {
          Log.l("attemptToDelete(): User opted not to delete, probably wisely.");
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
