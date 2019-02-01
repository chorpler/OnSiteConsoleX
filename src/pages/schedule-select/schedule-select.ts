import { Component                                                            } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular'                 ;
import { Jobsite, Employee, Schedule,                                         } from 'domain/onsitexdomain'   ;
import { Log, moment, Moment, isMoment, oo                                    } from 'domain/onsitexdomain' ;
import { DBService                                                            } from '../../providers/db-service'    ;
import { ServerService                                                        } from '../../providers/server-service';
import { AlertService                                                         } from '../../providers/alert-service' ;
import { OSData                                                               } from '../../providers/data-service'  ;
import { Preferences                                                          } from '../../providers/preferences'   ;

@IonicPage({ name: 'Schedule Select' })
@Component({
  selector: 'page-schedule-select',
  templateUrl: 'schedule-select.html',
})
export class ScheduleSelectPage {
  public title:string = "Schedule Select";
  public static PREFS:any = new Preferences();
  public get prefs() { return ScheduleSelectPage.PREFS;};
  public dateStart:Date;
  public schedules:Array<Schedule> = [];
  public allSchedules:Array<Schedule> = [];
  public creator:Employee;
  public creators:Array<Employee> = [];
  public invalidDates:Array<Date> = [];
  public maxDate:Date;
  public minDate:Date;
  public dataReady:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public data:OSData, public db:DBService, public server:ServerService, public alert:AlertService) {
    window['onsitescheduleselect'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ScheduleSelectPage');
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  public runWhenReady() {
    let schedules = this.data.getSchedules();
    let techs = this.data.getData('employees');
    try {
      this.creators = [];
      let creators = {};
      for(let schedule of schedules) {
        creators[schedule.getCreator()] = true;
      }

      for(let creator of Object.keys(creators)) {
        // let user = this.data.getEmployeeFromUsername(creator);
        let user = techs.find((a:Employee) => {
          return a.username === creator;
        });
        this.creators.push(user);
      }

      let creator = this.creators[0];

      this.allSchedules = schedules.slice(0);

      this.selectCreator(creator);

      this.dataReady = true;
    } catch(err) {
      Log.l("runWhenReady(): Caught error while populating schedule creator list.");
      Log.e(err);
      this.server.getEmployees().then(res => {
        this.data.setData('employees', res);
        techs = res;
        this.creators = [];
        let creators = {};
        for(let schedule of schedules) {
          creators[schedule.getCreator()] = true;
        }

        for(let creator of Object.keys(creators)) {
          // let user = this.data.getEmployeeFromUsername(creator);
          let user = techs.find((a:Employee) => {
            return a.username === creator;
          });
          this.creators.push(user);
        }

        let creator = this.creators[0];

        this.allSchedules = schedules.slice(0);

        this.selectCreator(creator);

        this.dataReady = true;
      }).catch(err => {
        Log.l("runWhenReady(): Error fetching new employees list!");
        Log.e(err);
        this.alert.showAlert("ERROR", "Error fetching updated employees list:<br>\n<br>\n" + err.message);
      });
    }
  }

  public openSchedule(schedule:Schedule) {
    this.navCtrl.push('Scheduling', {schedule: schedule});
  }

  public openScheduleByDate(dateStart:Date) {
    let date = moment(dateStart);
    let schedule = this.schedules.find((a:Schedule) => {
      let dateA = a.start;
      let idA = a._id;
      let strDateA = dateA.format("YYYY-MM-DD");
      return dateA.isSame(date, 'day') && strDateA === idA;
    });
    if(schedule) {
      Log.l("openScheduleByDate(): Found and opening schedule:\n", schedule);
      this.openSchedule(schedule);
    } else {
      this.alert.showAlert("ERROR", `Could not find schedule for date '${date.format("DD MMM YYYY")}'. How peculiar...`);
    }
  }

  public selectCreator(creator:Employee) {
    Log.l("selectCreator(): Selected creator '%s'", creator.getFullNameNormal());
    this.creator = creator;
    let schedules = this.allSchedules;

    this.schedules = schedules.filter(a => {
      return a['creator'] === creator.username;
    }).sort((a: Schedule, b: Schedule) => {
      let dA = a['start'];
      let dB = b['start'];
      return dA.isAfter(dB) ? -1 : dA.isBefore(dB) ? 1 : 0;
    });

    this.minDate = this.schedules[this.schedules.length - 1].getStartDate().toDate();
    this.maxDate = this.schedules[0].getStartDate().toDate();
    this.invalidDates = this.updateDisabledDates();
  }

  public updateDisabledDates() {
    let start         = moment(this.minDate);
    let end           = moment(this.maxDate);
    let startXL       = start.toExcel(true);
    let endXL         = end.toExcel(true);
    let scheduleDates = [];
    for(let schedule of this.schedules) {
      scheduleDates.push(schedule.getStartDate().toExcel(true));
    }
    let invalidDates = [];
    for(let i = startXL; i <= endXL; i++) {
      let j = scheduleDates.indexOf(i);
      if(j === -1) {
        invalidDates.push(moment().fromExcel(i).toDate());
      }
    }
    return invalidDates;
  }

}
