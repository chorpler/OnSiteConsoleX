import { NgModule           } from '@angular/core'     ;
import { IonicPageModule    } from 'ionic-angular'     ;
import { ScheduleSelectPage } from './schedule-select' ;
import { CalendarModule     } from 'primeng/primeng'   ;

@NgModule({
  declarations: [
    ScheduleSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduleSelectPage),
    CalendarModule,
  ],
  exports: [
    ScheduleSelectPage
  ]
})
export class ScheduleSelectPageModule { }
