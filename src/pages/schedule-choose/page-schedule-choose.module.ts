import { NgModule                       } from '@angular/core'          ;
import { IonicPageModule                } from 'ionic-angular'          ;
import { ScheduleChoosePage             } from './page-schedule-choose' ;
import { CalendarModule, ScheduleModule } from 'primeng/primeng'        ;
import { DropdownModule                 } from 'primeng/primeng'        ;

@NgModule({
  declarations: [
    ScheduleChoosePage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduleChoosePage),
    CalendarModule,
    ScheduleModule,
    DropdownModule,
  ],
  exports: [
    CalendarModule,
    ScheduleChoosePage,
  ],
})
export class ScheduleChoosePageModule { }
