import { Component, Input, OnInit, OnDestroy, Output, } from '@angular/core'            ;
import { ViewChild, EventEmitter,                     } from '@angular/core'            ;
import { Log, moment, Moment, isMoment                } from 'domain/onsitexdomain'     ;
import { ServerService                                } from 'providers/server-service' ;
import { DBService                                    } from 'providers/db-service'     ;
import { AuthService                                  } from 'providers/auth-service'   ;
import { AlertService                                 } from 'providers/alert-service'  ;
import { OSData                                       } from 'providers/data-service'   ;
import { Schedule,                                    } from 'domain/onsitexdomain'     ;
import { Employee,                                    } from 'domain/onsitexdomain'     ;
import { Jobsite,                                     } from 'domain/onsitexdomain'     ;
import { Dialog                                       } from 'primeng/dialog'           ;
import { Dropdown                                     } from 'primeng/dropdown'         ;
import { SelectItem                                   } from 'primeng/api'              ;

@Component({
  selector: 'schedule-new',
  templateUrl: 'schedule-new.html',
})
export class ScheduleNewComponent implements OnInit,OnDestroy {
  @Output('onCancel') onCancel:EventEmitter<any> = new EventEmitter<any>();
  @Output('onNewSchedule') onNewSchedule:EventEmitter<any> = new EventEmitter<any>()  ;
  @ViewChild('scheduleNewDialog') scheduleNewDialog:Dialog;
  public date            : Date            = new Date()  ;
  public incrementCurrent: boolean         = false       ;
  public action          : string          = "increment" ;
  public username        : string          = ""          ;
  public schedule        : Schedule        ;
  public schedules       : Array<Schedule> = []          ;
  public actionsList     : SelectItem[]    = []          ;
  public isVisible       : boolean         = true        ;

  public get dateM():Date|Moment { let d = this.date || new Date(); return moment(d); }
  public set dateM(value:Date|Moment) { this.date = moment(value).toDate(); };

  constructor(
    public alert     : AlertService   ,
    public data      : OSData         ,
  ) {
    window['onsiteschedulenew'] = this;
  }

  ngOnInit() {
    Log.l(`ScheduleNewComponent: ngOnInit() fired`);
    let now = moment();
    // if(this.schedules.length > 0) {
    //   let lastScheduleDate = moment(this.schedules[this.schedules.length - 1].start);
    // } else {

    // }
    let start = Schedule.getNextScheduleStartDateFor(now);
    this.date = start.toDate();
    this.generateMenus();
  }

  ngOnDestroy() {
    Log.l(`ScheduleNewComponent: ngOnDestroy() fired`);
  }

  public generateMenus():SelectItem[] {
    let items:SelectItem[] = [
      { label: "Increment Current Schedule", value: "increment" },
      { label: "Keep Current Schedule"     , value: "keep"      },
      { label: "Clear Schedule"            , value: "clear"     },
    ];
    this.actionsList = items;
    return items;
  }

  public createNewSchedule(evt?:any) {
    // this.viewCtrl.dismiss({date: this.dateM, action:this.action});
    Log.l(`ScheduleNew.createNewSchedule(): New schedule canceled.`);
    let out:any = {
      date   : this.dateM  ,
      action : this.action ,
    };
    this.onNewSchedule.emit(out);
  }

  public cancel(evt?:any) {
    // this.viewCtrl.dismiss();
    Log.l(`ScheduleNew.cancel(): New schedule canceled.`);
    this.onCancel.emit(null);
  }



}
