import { Subscription                                                } from 'rxjs'          ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'              ;
import { ChangeDetectorRef, AfterViewInit,                           } from '@angular/core'              ;
import { IonicPage                                                   } from 'ionic-angular'              ;
import { NavController, ModalController, ViewController,             } from 'ionic-angular'              ;
import { NavParams                                                   } from 'ionic-angular'              ;
// import { Storage                                                     } from '@ionic/storage'             ;
import { Log, moment, Moment, isMoment, oo,                          } from 'domain/onsitexdomain'       ;
import { AuthService                                                 } from 'providers/auth-service'     ;
import { ServerService                                               } from 'providers/server-service'   ;
import { DBService                                                   } from 'providers/db-service'       ;
import { OSData                                                      } from 'providers/data-service'     ;
import { AlertService                                                } from 'providers/alert-service'    ;
import { Preferences                                                 } from 'providers/preferences'      ;
import { DispatchService                                             } from 'providers/dispatch-service' ;
import { Employee                                                    } from 'domain/onsitexdomain'       ;
import { SelectItem, MenuItem,                                       } from 'primeng/api'                ;
import { MultiSelect,                                                } from 'primeng/multiselect'        ;
import { EmployeeViewComponent                                       } from 'components/employee-view'   ;
import { NotifyService                                               } from 'providers/notify-service'   ;
// import { DataTable                                                   } from 'primeng/datatable'          ;
import { Table                                                       } from 'primeng/table'              ;

@IonicPage({ name: 'Employees' })
@Component({
  selector: 'page-employees',
  templateUrl: 'employees.html',
})
export class EmployeesPage implements OnInit,OnDestroy,AfterViewInit {
  // @ViewChild('dt') dt:DataTable;
  @ViewChild('dt') dt:Table;
  @ViewChild('columnSelect') columnSelect:MultiSelect;
  @ViewChild('globalFilterInput') globalFilterInput:ElementRef;
  @ViewChild('employeeView') employeeView:EmployeeViewComponent;
  public title              : string          = "Employees"                        ;
  public pageSizeOptions    : number[]   = [30,50,100,150,200,250,300,400,500];
  public prefsSub           : Subscription                                        ;
  public modalMode          : boolean         = false                             ;
  public mode               : string          = "edit"                            ;
  public employeeHeader     : string          = "Edit"                            ;
  public employeeHighlight  : boolean[]  = []                                ;
  public employeesdb        : any                                                 ;
  public editMode           : boolean         = false                             ;
  public userInfo           : any             = {u: '', p: '' }                   ;
  public employeeViewVisible:boolean          = false                             ;
  public employeeFields     : string[]   = ["firstName", "lastName", "name"] ;
  public employeeList       : any             = []                                ;
  public employee           : Employee                                            ;
  public allEmployees       : Employee[] = []                                ;
  public employees          : Employee[] = []                                ;
  public displayEmployees   : Employee[] = []                                ;
  public editEmployees      : Employee[] = []                                ;
  public selectedEmployee   : Employee                                            ;
  public styleColIndex      : any                                                 ;
  public styleColEdit       : any                                                 ;
  public styleColActive     : any                                                 ;
  public moment             : any             = moment                            ;
  public cols               : any[]      = []                                ;
  public colOpts            : SelectItem[]    = []                                ;
  public fields             : any[]      = []                                ;
  public allFields          : any[]      = []                                ;
  public items              : SelectItem[]    = []                                ;
  public selected           : SelectItem[]    = []                                ;
  public displayColumns     : any[]      = []                                ;
  public dataReady          : boolean         = false                             ;
  public showUsername       : boolean         = false                             ;
  public showAllEmployees   : boolean         = false                             ;
  public fieldsDialogVisible: boolean         = false                             ;
  public selectedColumns    : any[]           = []                                ;
  public ctxItems           : MenuItem[]      = []                                ;
  public tooltipDelay       : number          = 0                                 ;
  public selectedLabel      : string          = "{0} columns shown"               ;

  public get rowCount():number    { return this.prefs.CONSOLE.pages.employees; }  ;
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.employees = val; }   ;
  public get filteredCount():number { return this.getFilteredCount(); };
  public get totalDisplayedRecords():number { return this.getTotalDisplayedCount(); };
  public get currentDisplayedRecords():number { return this.getCurrentDisplayedRecords(); };

  constructor(
    public navCtrl   : NavController     ,
    public navParams : NavParams         ,
    public modalCtrl : ModalController   ,
    public viewCtrl  : ViewController    ,
    public cdRef     : ChangeDetectorRef ,
    public prefs     : Preferences       ,
    public server    : ServerService     ,
    public db        : DBService         ,
    public alert     : AlertService      ,
    // public storage   : Storage           ,
    public data      : OSData            ,
    public auth      : AuthService       ,
    public zone      : NgZone            ,
    public notify    : NotifyService     ,
    public dispatch  : DispatchService   ,
  ) {
    Log.l(`EmployeesPage constructor`);
    window['onsiteemployees']  = this;
    window['onsiteemployees2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l(`EmployeesPage: ngOnInit() fired`);
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l(`EmployeesPage: ngOnDestroy() fired`);
    this.cancelSubscriptions();
  }

  ngAfterViewInit() {
    Log.l(`EmployeesPage: ngAfterViewInit() fired`);
    // if(this.data.isAppReady()) {
    //   this.runWhenReady();
    // }
    // this.cdRef.detectChanges();
  }

  ionViewDidEnter() {
    Log.l(`EmployeesPage: ionViewDidEnter() fired`);
    window['p'] = this;
  }

  public async runWhenReady() {
    let spinnerID;
    try {
      if(this.navParams.get('modalMode') !== undefined) { this.modalMode = this.navParams.get('modalMode'); }
      if(this.navParams.get('mode') !== undefined) { this.mode = this.navParams.get('mode'); }
      // let spinnerID = this.alert.showSpinner('Retrieving employee list...');
      // this.styleColEdit   = {'max-width':'50px', 'width': '50px'};
      this.styleColActive = {'max-width':'50px', 'width': '50px'};
      // this.styleColIndex = {'max-width':'50px', 'width': '50px'};
      this.selected = this.fields;
      this.ctxItems = [
        {label: 'Edit Employee', icon: 'fa-user', command: (event) => this.editEmployee(this.selectedEmployee)},
      ];

      this.initializeSubscriptions();
      this.updatePageSizes();

      this.generateFieldList();
      // this.createFields();
      let employees:Employee[] = [];
      let elist:Employee[] = this.data.getData('employees');
      if(elist && elist.length > 0) {
        this.allEmployees = elist;
      } else {
        spinnerID = await this.alert.showSpinnerPromise('Retrieving employee list...');
        let docs:Employee[] = await this.db.getEmployees();
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        Log.l("EmployeesPage: got results:\n", docs);
        this.allEmployees = docs;
      }
      Log.l("EmployeesPage: final employees list:\n", this.allEmployees);
      this.employees = this.allEmployees.filter((a: Employee) => {
        if(!this.showAllEmployees) {
          return a.active;
          // return obj['active'] && obj['lastName'] !== 'Sargeant' && obj['username'] !== 'mike';
        } else {
          return true;
        }
      });
      this.displayEmployees = this.allEmployees.filter((a: Employee) => {
        if(!this.showAllEmployees) {
          return a.active;
          // return obj['active'] && obj['lastName'] !== 'Sargeant' && obj['username'] !== 'mike';
        } else {
          return true;
        }
      });
      this.editEmployees = this.displayEmployees;
      let len = this.displayEmployees.length;
      for(let i = 0; i < len; i++) {
        this.employeeHighlight[i] = false;
      }
      // this.displayEmployees = this.employees.slice(0);
      for(let tech of this.displayEmployees) {
        let client    = tech.client                                 ;
        let location  = tech.location                               ;
        let locID     = tech.locID                                  ;
        tech.client   = this.data.getFullName('client'  , client)   ;
        tech.location = this.data.getFullName('location', location) ;
        tech.locID    = this.data.getFullName('locID'   , locID)    ;
      }
      // this.alert.hideSpinner(spinnerID);
      this.dataReady = true;
      this.setPageLoaded();
      // return res;
    } catch(err) {
      Log.l(`Employees.runWhenReady(): Error during initialization!`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      // this.alert.hideSpinner(spinnerID);
      // Log.l("Error retrieving docs from users DB!");
      // Log.e(err);
      // this.notify.addError("ERROR", `Error retrieving employees from database: '${err.message}'`, 10000);
      this.alert.showAlert("ERROR", `Error retrieving employees from database:<br>\n'${err.message}'`);
      // throw new Error(err);
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

  public getFilteredCount():number {
    // let out:number = this.reports.length;
    let out:number = 0;
    if(this.dt && this.dt.filteredValue && this.dt.filteredValue.length) {
      out = this.dt.filteredValue.length;
    }
    return out;
  }

  public getTotalDisplayedCount():number {
    let out:number = 0;
    if(this.dt && this.dt.totalRecords) {
      out = this.dt.totalRecords;
    }
    return out;
  }

  public getCurrentDisplayedRecords():number {
    let out:number = 0;
    if(this.dt && this.dt.totalRecords) {
      out = this.dt.totalRecords;
    }
    return out;
  }



  public updatePageSizes() {
    let newPageSizes = this.prefs.CONSOLE.pageSizes.employees;
    let rowCount = Number(this.prefs.CONSOLE.pages.employees);
    if(newPageSizes.indexOf(rowCount) === -1) {
      newPageSizes.push(rowCount);
      this.pageSizeOptions = newPageSizes.slice(0).sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
      this.rowCount = rowCount;
    } else {
      this.pageSizeOptions = newPageSizes.slice(0);
      this.rowCount = rowCount;
    }
  }

  public setHighlight(rowIndex:number, val:boolean) {
    // Log.l(`setHighlight(): Row ${rowIndex} should have highlight set to '${val}'`);
    this.employeeHighlight[rowIndex] = val;
  }

  public updateHighlight(event?:any) {
    Log.l("updateHighlight(): Event is:\n", event);
    // let dt:DataTable = this.dt;
    let dt:Table = this.dt;
    if(dt.filteredValue && dt.filteredValue.length > 0) {
      let employeeHighlight = [];
      let len = dt.filteredValue.length;
      for(let i = 0; i < len; i++) {
        employeeHighlight[i] = false;
      }
      this.editEmployees = dt.filteredValue;
    } else {
      let employeeHighlight = [];
      let len = dt.value.length;
      for(let i = 0; i < len; i++) {
        employeeHighlight[i] = false;
      }
      this.editEmployees = dt.value;
    }
  }


  // public createFields() {
  //   let fields = [];
  //   let af = this.allFields;
  //   fields.push(af[7]);
  //   fields.push(af[5]);
  //   fields.push(af[4]);
  //   fields.push(af[9]);
  //   fields.push(af[10]);
  //   fields.push(af[11]);
  //   let sel = [];
  //   for(let field of fields) {
  //     sel.push(field.value);
  //   }
  //   // this.selectedColumns = sel;
  //   // this.columnsChanged();
  //   // this.displayColumns = sel;
  //   return fields;
  // }

  // public updateFields() {
  //   let fields = [];
  //   if(this.showUsername) {
  //     fields.push(this.allFields[7]);
  //     // fields.push({field: 'avatarName', header: 'User', filter: true, filterPlaceholder: "Username"});
  //   }
  //   for(let field of this.selectedColumns) {
  //     // if(field.field !== 'avatarName') {
  //       fields.push(field);
  //     }
  //   }
  //   this.fields = fields;
  //   Log.l("updateFields(): Now using fields:\n", fields);
  //   // this.employees = [...this.employees];
  //   return this.fields;
  // }

  public toggleShowAllEmployees() {
    this.showAllEmployees = !this.showAllEmployees;
    Log.l("toggleShowAllEmployees(): ShowAllEmployees set to '%s'.", this.showAllEmployees);
    // this.employees = this.allEmployees.filter((a:Employee) => {
    //   if (!this.showAllEmployees) {
    //     return a.active && a.lastName !== 'Sargeant' && a.username !== 'mike';
    //   } else {
    //     return true;
    //   }
    // });
    this.displayEmployees = this.allEmployees.filter((a: Employee) => {
      if(!this.showAllEmployees) {
        return a.active && a.username !== 'mike';
      } else {
        return true;
      }
    });
    this.employees = this.displayEmployees.slice(0);
    for(let tech of this.displayEmployees) {
      let client    = tech.client  ;
      let location  = tech.location;
      let locID     = tech.locID   ;
      tech.client   = this.data.getFullName('client', client);
      tech.location = this.data.getFullName('location', location);
      tech.locID    = this.data.getFullName('locID', locID);
    }
    // let i = this.selectedColumns.indexOf("active");
    // if(this.showAllEmployees) {
    //   if(i === -1) {
    //     this.selectedColumns.unshift("active");
    //     this.columnsChanged();
    //   }
    // } else {
    //   if(i !== -1) {
    //     this.selectedColumns.splice(i, 1);
    //     this.columnsChanged();
    //   }
    // }
  }

  public onRowSelect(event: any) {
    let user:Employee = event.data;
    this.editEmployee(user);
  }

  // public editEmployee(user:Employee, event?:any) {
  public editEmployee(user:Employee, event?:MouseEvent) {
    let employee = user;
    // let employee = this.employees.find((a: Employee) => {
    //   return a.username === user.username;
    // });
    Log.l("editEmployee(): Editing employee:\n", employee);
    let dt = this.dt;
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      this.editEmployees = dt.filteredValue;
    } else {
      this.editEmployees = dt.value;
    }
    let techs = this.editEmployees;
    // let techs = this.displayEmployees;
    // let modalTarget = 'Add Employee';
    // if(event && event.shiftKey) {
    //   modalTarget = "Employee";
    // }

    let index = techs.indexOf(employee) + 1;
    let count = techs.length;

    let tech = employee;
    let name = tech.getFullNameNormal();
    this.employee = employee;
    // this.editEmployees = techs;
    this.employeeHeader = `Editing '${name}' (${index} / ${count})`;
    this.mode = 'edit';
    this.employeeViewVisible = true;
    // let modal = this.modalCtrl.create('Add Employee', { mode: 'Edit', employee: employee }, { cssClass: 'edit-employee-modal' });
    // let modal = this.modalCtrl.create(modalTarget, { mode: 'Edit', employee: employee }, { cssClass: 'edit-employee-modal' });
    // modal.onDidDismiss(data => {
    //   Log.l("editEmployee(): Edit Employee modal was dismissed, returned data:\n", data);
    //   if (data && data.deleted) {
    //     let i = this.employees.indexOf(data.employee);
    //     if (i > -1) {
    //       Log.l("editEmployee(): Edit Employee modal sent back a deleted employee or something.")
    //       let tmp1 = this.employees.slice(i, i + 1)[0];
    //       window['tmpemployee'] = tmp1;
    //       let tmp2 = [...this.employees.slice(0, i), ...this.employees.slice(i + 1)];
    //       this.employees = tmp2;
    //     }
    //   }
    // });
    // modal.present();

  }

  public employeeUpdated(event:any) {
    Log.l("employeeUpdated(): Event is:\n", event);
    this.employeeViewVisible = false;
    if(event && event.type && event.employee) {
      if(event.type === 'delete') {
        let employee = event.employee;
        let index = this.allEmployees.indexOf(employee);
        if(index > -1) { this.allEmployees.splice(index, 1); }
        index = this.displayEmployees.indexOf(employee);
        if(index > -1) { this.displayEmployees.splice(index, 1); }
        index = this.editEmployees.indexOf(employee);
        if(index > -1) { this.editEmployees.indexOf(employee); }
      } else if(event.type === 'add') {
        let employee = event.employee;
        this.allEmployees.push(employee);
        this.displayEmployees.push(employee);
      }
    }
    // if(this.mode === 'add') {
    // }
  }

  public employeeCanceled(event:any) {
    Log.l("employeeCanceled(): Event is:\n", event);
    this.employeeViewVisible = false;
  }

  public addEmployee(event?:any) {
    let techs = this.displayEmployees;
    let employee = new Employee();
    let index = 0;
    // techs.push(employee);
    // let index = techs.indexOf(employee) + 1;
    // let count = techs.length;

    let tech = employee;
    // let name = tech.getFullNameNormal();
    this.employee = employee;
    // this.editEmployees = [employee];
    this.editEmployees = this.displayEmployees;
    // this.employeeHeader = `Adding New Employee`;
    this.mode = 'add';
    // if(event && event.shiftKey) {
    this.employeeViewVisible = true;
    // } else {
    //   let employees = this.employees.map((a: Employee) => a.username);
    //   // let modal = this.modalCtrl.create('Add Employee', { mode: 'Add', usernames: employees }, { cssClass: 'edit-employee-modal' });
    //   let modal = this.modalCtrl.create('Employee', { mode: 'Add', usernames: employees }, { cssClass: 'edit-employee-modal' });
    //   modal.onDidDismiss(data => { Log.l("Employee modal was dismissed, returned data:\n", data); });
    //   modal.present();
    // }

  }

  public generateFieldList() {
    // let fields = [], selectItems = [], items = [];
    // { field: "_id", subfield: "", header: "ID", filter: true, filterPlaceholder: "ID", order: 0, class: "col-01", style: {}, oldstyle: {width: "auto"  }, format:"", } ,
    // { field: "device", subfield: "model", header: "Model", filter: true, filterPlaceholder: "Model", order: 8, class: "col-09", style: {}, oldstyle: {width: "120px" }, format:"", } ,
    // fields.push({ field: "active"         , header: "Active"      , filter: true , filterPlaceholder: "Active"      , order: 1  , class: "col-01", style: {}, format: "" , }); // 0
    let fields:any[] = [
      { field: "avatarName"     , header: "Username"    , filter: true , filterPlaceholder: "Username search"    , order: 0  , class: "col-00", style: {}, format: "" , }, // 7
      { field: "updated"        , header: "Updated"     , filter: true , filterPlaceholder: "Updated search"     , order: 1  , class: "col-01", style: {}, format: "" , }, // 1
      { field: "lastName"       , header: "Last"        , filter: true , filterPlaceholder: "Last search"        , order: 2  , class: "col-05", style: {}, format: "" , }, // 5
      { field: "firstName"      , header: "First"       , filter: true , filterPlaceholder: "First search"       , order: 3  , class: "col-04", style: {}, format: "" , }, // 4
      { field: "middleName"     , header: "Middle"      , filter: true , filterPlaceholder: "Middle search"      , order: 4  , class: "col-03", style: {}, format: "" , }, // 3
      { field: "prefix"         , header: "Prefix"      , filter: true , filterPlaceholder: "Prefix search"      , order: 5  , class: "col-02", style: {}, format: "" , }, // 2
      { field: "suffix"         , header: "Suffix"      , filter: true , filterPlaceholder: "Suffix search"      , order: 6  , class: "col-06", style: {}, format: "" , }, // 6
      { field: "userClass"      , header: "Class"       , filter: true , filterPlaceholder: "Class search"       , order: 7  , class: "col-07", style: {}, format: "" , }, // 8
      { field: "client"         , header: "Client"      , filter: true , filterPlaceholder: "Client search"      , order: 8  , class: "col-08", style: {}, format: "" , }, // 9
      { field: "location"       , header: "Loc"         , filter: true , filterPlaceholder: "Loc search"         , order: 9  , class: "col-09", style: {}, format: "" , }, // 10
      { field: "locID"          , header: "LocID"       , filter: true , filterPlaceholder: "LocID search"       , order: 10 , class: "col-10", style: {}, format: "" , }, // 11
      { field: "shift"          , header: "Shift"       , filter: true , filterPlaceholder: "Shift search"       , order: 11 , class: "col-11", style: {}, format: "" , }, // 12
      { field: "shiftLength"    , header: "ShiftLen"    , filter: true , filterPlaceholder: "ShiftLen search"    , order: 12 , class: "col-12", style: {}, format: "" , }, // 13
      { field: "shiftStartTime" , header: "Shift Start" , filter: true , filterPlaceholder: "Shift Start search" , order: 13 , class: "col-13", style: {}, format: "" , }, // 14
      { field: "rotation"       , header: "Rot"         , filter: true , filterPlaceholder: "Rot search"         , order: 14 , class: "col-14", style: {}, format: "" , }, // 15
      { field: "email"          , header: "Email"       , filter: true , filterPlaceholder: "Email search"       , order: 15 , class: "col-15", style: {}, format: "" , }, // 16
      { field: "phone"          , header: "Phone"       , filter: true , filterPlaceholder: "Phone search"       , order: 16 , class: "col-16", style: {}, format: "" , }, // 17
      { field: "cell"           , header: "Cell"        , filter: true , filterPlaceholder: "Cell search"        , order: 17 , class: "col-17", style: {}, format: "" , }, // 18
      { field: "address"        , header: "Address"     , filter: true , filterPlaceholder: "Address search"     , order: 18 , class: "col-18", style: {}, format: "" , }, // 19
      { field: "payRate"        , header: "Pay Rate"    , filter: true , filterPlaceholder: "Pay Rate search"    , order: 19 , class: "col-19", style: {}, format: "" , }, // 20
      { field: "salaried"       , header: "Salaried"    , filter: true , filterPlaceholder: "Salaried search"    , order: 20 , class: "col-20", style: {}, format: "" , }, // 21
      { field: "created"        , header: "Created"     , filter: true , filterPlaceholder: "Created search"     , order: 21 , class: "col-21", style: {}, format: "" , }, // 22
    ];
    // this.colOpts = [];
    // let initialize = [];
    // fields = fields.sort((a:any,b:any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // for(let field of fields) {
    //   let item:SelectItem = {
    //     label: field.header,
    //     value: field       ,
    //   };
    //   // let item = {label: field.header, value: field};
    //   this.colOpts.push(item);
    //   initialize.push(field.field);
    // }

    // let colMenu:SelectItem[] = fields.map((a:any) => {
    //   let item:SelectItem = {
    //     label: a.header,
    //     value: a       ,
    //   };
    //   return item;
    // });
    // this.cols = colMenu;

    this.cols = fields;

    this.allFields = fields;
    // this.items = this.colOpts;
    // let initialColumns = initialize;
    let initialColumns = [
      "avatarName",
      "lastName",
      "firstName",
      "client",
      "location",
      "locID",
    ];
    let visibleCols = this.cols.filter((a:any) => {
      let field:string = a.field ? a.field : "";
      if(field && initialColumns.indexOf(field) > -1) {
        return true;
      } else {
        return false;
      }
    });
    // this.selectedColumns = initialColumns;
    this.selectedColumns = visibleCols;
    this.columnsChanged();
    return fields;
  }

  public showFields() {
    this.fieldsDialogVisible = true;
  }

  public selectionChanged(event?:any) {
    this.dataReady = false;
    this.columnsChanged();
    this.dataReady = true;
  }

  public selectionChanged2() {
    Log.l("Selection is now:\n", this.cols);
  }

  public columnsChanged(colList?: string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    // let cols = this.cols;
    Log.l("columnsChanged(): Items now selected:\n", vCols);
    // let sel = [];
    // let sel = this.allFields.filter((a:any) => {
    //   return (vCols.indexOf(a.field) > -1);
    // }).sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Items selected via string:\n", sel);
    // // this.displayColumns = [];
    // // this.displayColumns = oo.clone(sel);
    // // this.cols = oo.clone(sel);
    // this.cols = sel;
    // this.displayColumns = [];
    // for(let item of sel) {
    //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    //   this.displayColumns.push(oo.clone(item));
    //   // let i = dc.findIndex((a:any) => {
    //   //   return (a.field === item['field']);
    //   // });
    //   // if(i === -1) {
    //   //   dc = [...dc, item];
    //   // }
    // }
    this.selectedColumns = vCols.sort((a:any, b:any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    Log.l("columnsChanged(): Now field list is:\n", this.selectedColumns);
    if(this.columnSelect) {
      this.columnSelect.updateLabel();
    }
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public toggleEditMode() {
    this.editMode = !this.editMode;
    Log.l("toggleEditMode(): Edit Mode is now '%s'", this.editMode);
  }

  public async toggleActive(tech:Employee) {
    let username = tech.getUsername();
    let loggedInUser = this.data.getUser();
    let loggedInUsername = loggedInUser.getUsername();
    let spinnerID;
    try {
      if(tech.active) {
        spinnerID = await this.alert.showSpinnerPromise(`Deactivating login for user '${username}'...`);
        let res:any = await this.server.deleteLoginUser(tech);
        tech.setStatus('inactive', loggedInUsername);
        res = await this.server.saveEmployeeRecord(tech);
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        this.notify.addSuccess("SUCCESS", `Deactivated user '${username}'`, 3000);
      } else {
        spinnerID = await this.alert.showSpinner(`Activating login for user '${username}'...`);
        let res:any = await this.server.createLoginUser(tech);
        tech.setStatus('active', loggedInUsername);
        res = await this.server.saveEmployeeRecord(tech);
        let out:any = await this.alert.hideSpinnerPromise(spinnerID);
        this.notify.addSuccess("SUCCESS", `Activated user '${username}'`, 3000);
      }
    } catch(err) {
      Log.l(`toggleActive(): Error toggline active mode of user '${username}'`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.notify.addError("ERROR", `Error toggling employee '${username}': '${err.message}'`, 4000);
      // throw new Error(err);
    }
  }

  public resetEmployeeTable(evt?:any) {
    Log.l(`resetEmployeeTable(): Event is:\n`, evt);
    // let dt:DataTable;
    let dt:Table;
    if(this.dt && this.dt instanceof Table) {
      dt = this.dt;
      dt.reset();
      let filterInputElements:any = document.getElementsByClassName('employees-col-filter');
      Log.l(`resetEmployeeTable(): filter input elements are:\n`, filterInputElements);
      if(filterInputElements && filterInputElements.length) {
        let count = filterInputElements.length;
        for(let i = 0; i < count; i++) {
          let inputElement = filterInputElements[i];
          if(inputElement instanceof HTMLInputElement) {
            inputElement.value = "";
          }
        }
      }
      if(this.globalFilterInput && this.globalFilterInput instanceof ElementRef) {
        let gfInput:HTMLInputElement = this.globalFilterInput.nativeElement;
        gfInput.value = "";
      }
    }
  }

  public cancelAndExitModal(event?:any) {
    Log.l(`cancelAndExitModal(): Scheduling page closing.`);
    this.viewCtrl.dismiss();
  }

  public saveAndExitModal(event?:any) {
    Log.l(`saveAndExitModal(): Scheduling page closing.`);
    this.viewCtrl.dismiss();
  }

}
