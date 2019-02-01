import { NgModule        } from '@angular/core'  ;
import { IonicPageModule } from 'ionic-angular'  ;
import { ScheduleNewPage } from './schedule-new' ;
import { CalendarModule  } from 'primeng/primeng';

@NgModule({
  declarations: [
    ScheduleNewPage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduleNewPage),
    CalendarModule,
  ],
  exports: [
    ScheduleNewPage,
  ]
})
export class ScheduleNewPageModule {}
