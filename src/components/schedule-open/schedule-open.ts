import { Component, OnInit, OnDestroy, ViewChild, } from '@angular/core'            ;
import { Input, Output                            } from '@angular/core'            ;
import { EventEmitter,                            } from '@angular/core'            ;
import { Jobsite, Employee, Schedule,             } from 'domain/onsitexdomain'     ;
import { Log, moment, Moment, isMoment, oo        } from 'domain/onsitexdomain'     ;
import { DBService                                } from 'providers/db-service'     ;
import { ServerService                            } from 'providers/server-service' ;
import { AlertService                             } from 'providers/alert-service'  ;
import { OSData                                   } from 'providers/data-service'   ;
import { Preferences                              } from 'providers/preferences'    ;
import { NotifyService                            } from 'providers/notify-service' ;
import { SelectItem                               } from 'primeng/api'              ;
import { Dialog                                   } from 'primeng/dialog'           ;
import { Dropdown                                 } from 'primeng/dropdown'         ;
import { Schedule as ScheduleComponent            } from 'primeng/schedule'         ;


@Component({
  selector: 'schedule-open',
  templateUrl: 'schedule-open.html',
})
export class ScheduleOpenComponent implements OnInit,OnDestroy {
  @Output('onClose') onClose:EventEmitter<any> = new EventEmitter<any>()    ;
  @Output('onChoose') onChoose:EventEmitter<any> = new EventEmitter<any>()  ;
  @ViewChild('scheduleOpenDialog') scheduleOpenDialog:Dialog;
  @ViewChild('scheduleOpenDropdown') scheduleOpenDropdown:Dropdown;
  @ViewChild('scheduleOpenSchedule') scheduleOpenSchedule:ScheduleComponent;
  public title       : string                          = "Schedule Open"    ;
  public scheduleOptions:any                                                ;
  public dateStart   : Date                                                 ;
  public schedules   : Array<Schedule>                 = []                 ;
  public allSchedules: Array<Schedule>                 = []                 ;
  public creator     : Employee                                             ;
  public creators    : Array<Employee>                 = []                 ;
  public creatorList : SelectItem[]                    = []                 ;
  public scheduleList: SelectItem[]                    = []                 ;
  public calendarHeight:number                         = 500                ;
  public invalidDates: Array<Date>                     = []                 ;
  public maxDate     : Date                                                 ;
  public minDate     : Date                                                 ;
  public events      : Array<any>                      = []                 ;
  public isVisible   : boolean                         = true               ;
  // public dialogVisible:boolean                         = false              ;
  public dataReady   : boolean                         =false               ;

  constructor(
    public data         : OSData        ,
    public db           : DBService     ,
    public server       : ServerService ,
    public alert        : AlertService  ,
    public notify       : NotifyService ,
    public prefs        : Preferences   ,
  ) {
    window['onsitescheduleopen'] = this;
  }

  ngOnInit() {
    Log.l('ScheduleOpenComponent: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l('ScheduleOpenComponent: ngOnDestroy() fired');
  }

  public runWhenReady() {
    this.createMenus();
    let creator = this.creators[0];
    this.selectCreator(creator);
    this.dataReady = true;
  }

  public createMenus() {
    let schedules = this.data.getSchedules();
    let techs = this.data.getData('employees');
    let startDay = 3;
    if(this.prefs.CONSOLE.global.weekStartDay !== undefined) {
      startDay = this.prefs.CONSOLE.global.weekStartDay;
    }
    this.scheduleOptions = {
      firstDay: startDay,
    };
    this.creators = [];
    let creators = {};
    let scheduleList:SelectItem[] = [];
    for(let schedule of schedules) {
      creators[schedule.getCreator()] = true;
      let item:SelectItem = { label: schedule.start.format("DD MMM YYYY"), value: schedule };
      scheduleList.unshift(item);
    }

    let creatorList:SelectItem[] = [];
    for(let creator of Object.keys(creators)) {
      let user = techs.find((a:Employee) => {
        return a.username === creator;
      });
      this.creators.push(user);
      let item:SelectItem = {label: user.getFullNameNormal(), value: user};
      creatorList.push(item);
    }

    let creator = this.creators[0];
    this.creatorList = creatorList;
    this.scheduleList = scheduleList.sort((a:SelectItem, b:SelectItem) => {
      let dA = a.value.start.format("YYYY-MM-DD");
      let dB = b.value.start.format("YYYY-MM-DD");
      return dA > dB ? -1 : dA < dB ? 1 : 0;
    });;

    this.allSchedules = schedules.slice(0);
    // this.selectCreator(creator);
    this.creator = this.creators[0];
  }

  public openSchedule(schedule:Schedule) {
    // this.navCtrl.push('Scheduling', {schedule: schedule});
    this.onChoose.emit(schedule);
  }

  public cancel(event?:any) {
    this.onClose.emit(true);
  }

  public openScheduleByDate(dateStart:Date) {
    let date = moment(dateStart);
    let schedule = this.schedules.find((a:Schedule) => {
      return a['start'].isSame(date, 'day');
    });
    if(schedule) {
      Log.l("openScheduleByDate(): Found and opening schedule:\n", schedule);
      this.openSchedule(schedule);
    } else {
      this.alert.showAlert("ERROR", `Could not find schedule with start date '${date.format("DD MMM YYYY")}'. How peculiar...`);
    }
  }

  public makeEventsFromSchedules(schedules:Array<Schedule>) {
    let events = [];
    let i = 0;
    let color = "rgb(255,255,0)";
    for(let schedule of schedules) {
      if(schedule._id.indexOf("backup") > -1) {
        continue;
      } else {
        switch(i++) {
          case 0: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 1: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 2: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 3: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 4: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
        }
        let start   = moment(schedule.start);
        let end     = moment(schedule.end);
        let fakeEnd = moment(schedule.end).add(1, 'day');
        let titleString: string;
        if (`${start.format("MMM")}` === `${end.format("MMM")}`) {
          titleString = `${start.format("DD")} - ${end.format("DD MMM")}`
        } else {
          titleString = `${start.format("DD MMM")} - ${end.format("DD MMM")}`
        }
        let event = {
          title: titleString,
          start: start,
          end: fakeEnd,
          allDay: true,
          backgroundColor: color,
          scheduleRef: schedule
        }
        events.push(event);
      }
    }
    return events;
  }

  public selectCreator(creator:Employee) {
    Log.l("selectCreator(): Selected creator '%s'", creator.getFullNameNormal());
    this.creator = creator;
    let schedules = this.allSchedules;

    this.schedules = schedules.filter((a:Schedule) => {
      return a.creator === creator.username;
    }).sort((a:Schedule, b:Schedule) => {
      let dA = a.start;
      let dB = b.start;
      return dA.isAfter(dB) ? -1 : dA.isBefore(dB) ? 1 : 0;
    });

    this.minDate = this.schedules[this.schedules.length - 1].getStartDate().toDate();
    this.maxDate = this.schedules[0].getStartDate().toDate();
    this.events = this.makeEventsFromSchedules(this.schedules);
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

  public openScheduleEvent(event:any) {
    Log.l("openScheduleEvent(): Event is:\n", event);
    let schedule:Schedule = event.calEvent.scheduleRef;
    this.openSchedule(schedule);
  }

  public showOptions(event?:any) {
    // this.appComponent.showOptions(event);
    Log.l(`ScheduleChoosePage.showOptions(): Called.`);
  }

}
