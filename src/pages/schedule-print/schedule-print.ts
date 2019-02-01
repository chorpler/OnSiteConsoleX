import { sprintf                                                                                 } from 'sprintf-js'                 ;
import { Component, NgZone, ViewChild, ElementRef                                                } from '@angular/core'              ;
import { IonicPage, NavController, NavParams, ModalController, PopoverController, ViewController } from 'ionic-angular'              ;
import { ServerService                                                                           } from 'providers/server-service'   ;
import { DBService                                                                               } from 'providers/db-service'       ;
import { AuthService                                                                             } from 'providers/auth-service'     ;
import { AlertService                                                                            } from 'providers/alert-service'    ;
import { Preferences                                                                             } from 'providers/preferences'      ;
import { OSData                                                                                  } from 'providers/data-service'     ;
import { Log, Moment, moment, isMoment, oo                                                       } from 'domain/onsitexdomain'       ;
import { Jobsite, Employee, Schedule,                                                            } from 'domain/onsitexdomain'       ;
import { OptionsComponent                                                                        } from 'components/options'         ;
import { NotifyService                                                                           } from 'providers/notify-service'   ;
import { ElectronService                                                                         } from 'providers/electron-service' ;

const _dedupe = (array, property?) => {
  let prop = "fullName";
  if (property) {
    prop = property;
  }
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

@IonicPage({name: "Schedule Print"})
@Component({
  selector: 'page-schedule-print',
  templateUrl: 'schedule-print.html',
})
export class SchedulePrintPage {
  @ViewChild('printArea') printArea:ElementRef;
  public static PREFS:any = new Preferences();
  public get prefs() { return SchedulePrintPage.PREFS;};

  public title     : string                                   = "Schedule Print" ;
  public schedule  : Schedule                                 ;
  public schedules : Array<Schedule>                          = []               ;
  public sites     : Array<Jobsite>                           = []               ;
  public techs     : Array<Employee>                          = []               ;
  public unassigned: Array<Employee>                          = []               ;
  public stats     : any                                      = {}               ;
  public rotations : Array<any>                               = []               ;
  public clients   : Array<any>                               = []               ;
  public grid      : Array<Array<any>>                        = []               ;
  public totalGrid : Array<Array<any>>                        = []               ;
  public headerGrid: Array<Array<any>>                        = []               ;
  public headerTotalGrid: Array<any>                          = []               ;
  public outmap    : Map<Jobsite,Map<string,Array<Employee>>> = new Map()        ;
  public newWindow : any                                                         ;
  public dataReady : boolean                                  = false            ;

  constructor(
    public navCtrl  : NavController    ,
    public navParams: NavParams        ,
    public zone     : NgZone           ,
    public db       : DBService        ,
    public server   : ServerService    ,
    public auth     : AuthService      ,
    public alert    : AlertService     ,
    public modalCtrl: ModalController  ,
    public data     : OSData           ,
    public electron : ElectronService  ,
    public popCtrl  : PopoverController,
    public viewCtrl : ViewController   ,
    public notify   : NotifyService    ,
  ) {
    window['onsitescheduleprint'] = this;
    window['_dedupe'] = _dedupe;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad SchedulePrintPage');
    this.data.appReady().then(res => {
      if(this.navParams.get('schedule') !== undefined) { this.schedule = this.navParams.get('schedule');}
      if(this.schedule) {
        this.runWhenReady();
      } else {
        Log.l("SchedulePrintPage: not ready, should go to home page.");
        this.navCtrl.setRoot('OnSiteX Console');
      }
    });
  }

  public runWhenReady() {
    let sites = this.data.getData('sites');
    this.sites = sites.filter((a:Jobsite) => {
      return a.site_active;
    }).sort((a:Jobsite,b:Jobsite) => {
      return a.sort_number > b.sort_number ? 1 : a.sort_number < b.sort_number ? -1 : 0;
    });
    let showOffice = this.prefs.getConsolePrefs().scheduling.showOffice;
    this.techs = this.data.getData('employees').filter((a:Employee) => {
      let name = a.username;
      // return (name !== 'Chorpler' && name !== 'mike' && a.userClass[0].toUpperCase() !== 'MANAGER' && a.active);
      return (a.active && name !== 'Chorpler' && name !== 'mike');
    });
    if(!showOffice) {
      this.techs = this.techs.filter((a:Employee) => {
        let type = "";
        let uc:any = a.userClass;
        if(Array.isArray(uc)) {
          type = a.userClass[0].toUpperCase();
        } else if(typeof uc === 'string') {
          type = uc.toUpperCase();
        }
        return type !== 'MANAGER' &&  type !== 'OFFICE';
      });
    }
    this.unassigned = this.techs.slice(0);
    let schedule = this.schedule;
    this.rotations = _dedupe(this.sites.map((a:Jobsite) => a.shiftRotations))[0];
    this.clients   = _dedupe(this.sites.map((a:Jobsite) => a.client));
    let datamap = this.generateGridData();
    this.stats = this.getScheduleStats();
    let grid = this.generateOutputGrid(datamap);
    this.grid = grid;
    this.headerGrid = this.generateHeaderData();
    this.dataReady = true;
  }

  public getScheduleStats() {
    let stats = { CLIENTS: {}, SESA: { 'total': 0, 'working': 0, 'off': 0 }, VACATION: 0, SITES: {}, TECHS: { 'total': 0, 'working': 0, 'off': 0, 'unassigned': 0 }, ROTATIONS: {} };
    let dat = this.schedule.getSchedule();
    let showOffice = this.prefs.getConsolePrefs().scheduling.showOffice;
    for(let rotation of this.rotations) {
      stats.ROTATIONS[rotation.name] = { total: 0 };
      siteLoop: for(let i in dat) {
        let keys = Object.keys(dat[i]);
        if(!showOffice && i === 'OFFICE PERSONNEL') {
          continue siteLoop;
        }
        for(let rotationName of keys) {
          if (rotation.name.toUpperCase() === rotationName.toUpperCase()) {
            stats.ROTATIONS[rotation.name].total += dat[i][rotationName].length;
          }
        }
      }
    }
    for (let client of this.clients) {
      if(client.name !== 'XX') {
        stats.CLIENTS[client.name] = { 'total': 0, 'working': 0, 'off': 0 };
      }
    }
    let techStats = stats.TECHS;
    siteLoop: for (let site of this.sites) {
      if((Number(site.site_number) === 1075 && !showOffice) || Number(site.site_number === 1)) {
        continue siteLoop;
      }
      // if(site.locID.name !== 'OFFICE') {
      Log.l("getScheduleStats(): Now processing site:\n", site);
      let sitename = site.schedule_name;
      stats.SITES[sitename] = { 'total': 0, 'working': 0, 'off': 0 };
      // if(site.client.name !== 'SE') {
      let sitestats = stats.SITES[sitename];
      let clientStats = stats.CLIENTS[site.client.name];
      let shifts = dat[sitename];
      for (let shiftname in shifts) {
        let shift = shifts[shiftname];
        let sub = shift.length;
        if (shiftname === 'FIRST WEEK' || shiftname === 'CONTN WEEK' || shiftname === 'FINAL WEEK') {
          clientStats.working += sub;
          sitestats.working += sub;
          techStats.working += site.locID.name === 'OFFICE' ? 0 : sub;
        } else if (shiftname === 'DAYS OFF') {
          clientStats.off += sub;
          sitestats.off += sub;
          techStats.off += site.locID.name === 'OFFICE' ? 0 : sub;
        } else if (shiftname === 'VACATION') {
          stats.VACATION += sub;
          clientStats.off += sub;
          sitestats.off += sub;
          techStats.off += site.locID.name === 'OFFICE' ? 0 : sub;
        }
        sitestats.total = sitestats.working + sitestats.off;
        clientStats.total = clientStats.working + clientStats.off;
        // techStats.total = techStats.working + techStats.off + stats.VACATION + this.techs.length;
      }
    }
    stats.TECHS.unassigned = this.unassigned.length;
    techStats.total = techStats.working + techStats.off + techStats.unassigned;

    this.stats = stats;
    Log.l("getScheduleStats(): Overall statistics are: ", stats);
    return stats;
  }

  public generateGridData() {
    let out = [];
    let stats = this.stats;
    let sites = this.sites.sort((a: Jobsite, b: Jobsite) => {
      return a.sort_number < b.sort_number ? -1 : a.sort_number > b.sort_number ? 1 : 0;
    });
    let schedule = this.schedule;
    let dat = schedule.getSchedule();
    // let onegrid:Map<string,Map<string,Array<Employee>>> = new Map();
    let onegrid: Map<Jobsite, Map<string, Array<Employee>>> = new Map();
    let employeeSort = (a: Employee, b: Employee) => {
      let shiftA = a.shift;
      let shiftB = b.shift;
      let sortA = shiftA === 'AM' ? -1 : 1;
      let sortB = shiftB === 'AM' ? -1 : 1;
      let nameA = a.getTechName().toUpperCase();
      let nameB = b.getTechName().toUpperCase();
      return sortA < sortB ? -1 : sortA > sortB ? 1 : nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    }
    // let techs = this.unassigned;
    let techs = this.techs.slice(0);

    let showOffice = this.prefs.getConsolePrefs().scheduling.showOffice;

    for(let site of sites) {
      if(!showOffice && site.site_number === 1075) {
        continue;
      } else {
        let siteName = site.getScheduleName();
        let sitegrid = [];
        let rotMap: Map<string, Array<Employee>> = new Map();
        this.rotations = this.rotations.sort((rotA, rotB) => {
          // sometimes you have to type really hard to fuck this sort function to death!!!!!!!!!
          // but it's coo'
          let a = rotA.name;
          let b = rotB.name;
          let sortA = a === 'FIRST WEEK' ? -5 : a === 'CONTN WEEK' ? -4 : a === 'FINAL WEEK' ? -3 : a === 'DAYS OFF' ? -2 : a === 'VACATION' ? -1 : 0;
          let sortB = b === 'FIRST WEEK' ? -5 : b === 'CONTN WEEK' ? -4 : b === 'FINAL WEEK' ? -3 : b === 'DAYS OFF' ? -2 : b === 'VACATION' ? -1 : 0;
          return sortA > sortB ? 1 : sortA < sortB ? -1 : 0;
        });
        for (let rotation of this.rotations) {
          let rot = rotation.name;
          let employeeArray: Array<Employee> = [];
          for (let tech of dat[siteName][rot]) {
            let i = techs.findIndex((a:Employee) => {
              return a.username === tech.username;
            });
            if (i > -1) {
              let employee = techs.splice(i, 1)[0];
              employeeArray.push(employee);
            } else {
              Log.w(`generateOutputGrid(): Could not find employee with username '${tech.username}' in tech array:\n`, techs);
            }
          }

          employeeArray = employeeArray.sort(employeeSort);
          rotMap.set(rot, employeeArray);
        }
        onegrid.set(site, rotMap);
      }
    }

    this.outmap = onegrid;
    this.unassigned = techs;
    return onegrid;
  }

  public generateOutputGrid(gridData:any) {
    // let out = [];
    // let stats = this.stats;
    // let sites = this.sites.sort((a:Jobsite,b:Jobsite) => {
    //   return a.sort_number < b.sort_number ? -1 : a.sort_number > b.sort_number ? 1 : 0;
    // });
    // let schedule = this.schedule;
    // let dat = schedule.getSchedule();
    // // let onegrid:Map<string,Map<string,Array<Employee>>> = new Map();
    // let onegrid:Map<Jobsite,Map<string,Array<Employee>>> = new Map();

    // let employeeSort = (a:Employee, b:Employee) => {
    //   let shiftA = a.shift;
    //   let shiftB = b.shift;
    //   let sortA = shiftA === 'AM' ? -1 : 1;
    //   let sortB = shiftB === 'AM' ? -1 : 1;
    //   let nameA = a.getTechName().toUpperCase();
    //   let nameB = b.getTechName().toUpperCase();
    //   return sortA < sortB ? -1 : sortA > sortB ? 1 : nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    // }
    // let techs = this.techs.slice(0);

    // for(let site of sites) {
    //   let siteName = site.getScheduleName();
    //   let sitegrid = [];
    //   let rotMap:Map<string,Array<Employee>> = new Map();
    //   this.rotations = this.rotations.sort((rotA,rotB) => {
    //     // sometimes you have to type really hard to fuck this sort function to death!!!!!!!!!
    //     // but it's coo'
    //     let a = rotA.name;
    //     let b = rotB.name;
    //     let sortA = a === 'FIRST WEEK' ? -5 : a === 'CONTN WEEK' ? -4 : a === 'FINAL WEEK' ? -3 : a === 'DAYS OFF' ? -2 : a === 'VACATION' ? -1 : 0;
    //     let sortB = b === 'FIRST WEEK' ? -5 : b === 'CONTN WEEK' ? -4 : b === 'FINAL WEEK' ? -3 : b === 'DAYS OFF' ? -2 : b === 'VACATION' ? -1 : 0;
    //     return sortA > sortB ? 1 : sortA < sortB ? -1 : 0;
    //   });
    //   for(let rotation of this.rotations) {
    //     let rot = rotation.name;
    //     let employeeArray:Array<Employee> = [];
    //     for(let tech of dat[siteName][rot]) {
    //       let i = techs.findIndex(a => {
    //         return a['username'] === tech;
    //       });
    //       if(i > -1) {
    //         let employee = techs.splice(i, 1)[0];
    //         employeeArray.push(employee);
    //       } else {
    //         Log.w(`generateOutputGrid(): Could not find employee with username '${tech}'.`);
    //       }
    //     }

    //     employeeArray = employeeArray.sort(employeeSort);
    //     rotMap.set(rot, employeeArray);
    //   }
    //   onegrid.set(site, rotMap);
    // }

    // this.outmap = onegrid;

    let outTables = [];
    let stats = this.stats;
    let onegrid = gridData;

    let generateRotSeq = (a:string) => {
      return a === 'FIRST WEEK' ? "A" : a === 'CONTN WEEK' ? "B" : a === 'FINAL WEEK' ? "C" : a === 'DAYS OFF' ? "D" : a === 'VACATION' ? "V" : "X";
    }

    for(let site of onegrid.keys()) {
      let siteName = site.getScheduleName();
      if(site && stats && stats.SITES && stats.SITES[siteName] && stats.SITES[siteName].working) {
        let out = [];
        let rotMap = onegrid.get(site);
        let row = ["TOTAL", " ", siteName, " ", " ", " ", stats.SITES[siteName].working, stats.SITES[siteName].off];
        out.push(row);
        for(let rot of rotMap.keys()) {
          let techArray = rotMap.get(rot);
          for(let tech of techArray) {
            let row = ["  ", generateRotSeq(rot), siteName, rot, tech.getShiftSymbol(), tech.getTechName(), " ", " "];
            out.push(row);
          }
        }
        outTables.push(out);
      }
    }

    return outTables;
  }

  public generateHeaderData() {
    let stats = this.stats;
    let clients = _dedupe(this.sites.map((a:Jobsite) => a.client));
    // .filter((a:any) => { return a.name !== 'SE'}));
    let headerGrid = [];
    let totalWorking = 0, totalOff = 0, totalTotal = 0;
    for(let client of clients) {
      if(client.name === 'XX') {
        continue;
      }
      let cliname = client.fullName;
      let cli = client.name;
      let working = stats.CLIENTS[cli].working;
      let off = stats.CLIENTS[cli].off;
      let total = working + off;
      totalWorking += working;
      totalOff += off;
      totalTotal += total;
      let row = [cliname, working, off, total];
      headerGrid.push(row);
    }
    // this.headerGrid = headerGrid;
    let unassigned = this.unassigned.length;
    totalTotal += unassigned;
    let totalRow = ["TOTAL", totalWorking, totalOff, unassigned, totalTotal];
    this.headerTotalGrid = totalRow;
    return headerGrid;
  }

  public copyTable(evt?:MouseEvent) {
    let table = this.printArea.nativeElement;
    let el = table.innerHtml;
    let range,selection;
    if(window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(table);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand('copy');
    selection.removeAllRanges();
    this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
  }

  public printTable(evt?:MouseEvent) {
    // let table = this.printArea.nativeElement;
    // Log.l("printTable(): data is:\n", data);
    // let data = document.getElementsByClassName("Items-Container")[0].innerHTML;
    // let newWindow = window.open("data:text/html," + encodeURIComponent(data),
    //   "_blank");
    let newWindow = window.open("/assets/printpage.html", "_blank");
    this.newWindow = newWindow;
    window['printpagenewwindow'] = newWindow;
    this.populatePrintFrame();
    // newWindow.open("test", "_blank", )
    // window.print();
  }

  public populatePrintFrame() {
    // setTimeout(() => {
      let table = this.printArea.nativeElement;
      let data = table.innerHTML;
      window['printpagedata'] = data;
      this.newWindow.focus();
      setTimeout(() => {
        let printElement = this.newWindow.document.getElementById('PrintPageTarget');
        printElement.innerHTML = data;
        // let if1:any = this.newWindow.document.getElementById('ManualFrame');
        // window['printpageiframe1'] = if1;
        // if1.srcdoc = data;
      }, 500);

  }
}
