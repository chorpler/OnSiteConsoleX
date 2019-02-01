import { Component, Input                                    } from '@angular/core'            ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'            ;
import { Log, moment, Moment, isMoment                       } from 'domain/onsitexdomain'     ;
import { ServerService                                       } from 'providers/server-service' ;
import { DBService                                           } from 'providers/db-service'     ;
import { AuthService                                         } from 'providers/auth-service'   ;
import { AlertService                                        } from 'providers/alert-service'  ;
import { OSData                                              } from 'providers/data-service'   ;
import { Schedule, Employee, Jobsite                         } from 'domain/onsitexdomain'     ;

@IonicPage({name: "Schedule New"})
@Component({
  selector: 'page-schedule-new',
  templateUrl: 'schedule-new.html',
})
export class ScheduleNewPage {
  public date            : Date            = new Date()  ;
  public incrementCurrent: boolean         = false       ;
  public action          : string          = "increment" ;
  public username        : string          = ""          ;
  public schedule        : Schedule        ;
  public schedules       : Array<Schedule> = []          ;

  public get dateM(): Date | Moment { let d = this.date || new Date(); return moment(d); }
  public set dateM(value: Date | Moment) { this.date = moment(value).toDate(); };

  constructor(
    public navCtrl   : NavController  ,
    public navParams : NavParams      ,
    public viewCtrl  : ViewController ,
    public alert     : AlertService   ,
    public data      : OSData         ,
  ) {
    window['onsiteschedulenew'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ScheduleNewPage');
    if(this.navParams.get('schedules') !== undefined) {
      this.schedules = this.navParams.get('schedules');
    } else {
      this.schedules = this.data.getSchedules();
    }
    let lastScheduleDate = moment(this.schedules[this.schedules.length - 1].start);
    let now = moment();
    let start = Schedule.getNextScheduleStartDateFor(now);
    this.date = start.toDate();
  }

  public createNewSchedule() {
    this.viewCtrl.dismiss({date: this.dateM, action:this.action});
  }

  public cancel() {
    this.viewCtrl.dismiss();
  }



}
