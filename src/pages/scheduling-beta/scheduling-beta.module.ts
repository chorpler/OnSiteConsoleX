import { NgModule                      } from '@angular/core'              ;
import { IonicPageModule               } from 'ionic-angular'              ;
import { SchedulingBetaPage            } from './scheduling-beta'          ;
// import { DndModule                     } from 'components/dnd'             ;
import { CalendarModule                } from 'primeng/calendar'           ;
import { DialogModule,                 } from 'primeng/dialog'             ;
import { ScheduleModule                } from 'primeng/schedule'           ;
import { DragDropModule                } from 'primeng/dragdrop'           ;
import { OptionsGenericComponentModule } from 'components/options-generic' ;
import { VideoPlayComponentModule      } from 'components/video-play'      ;
import { EmployeeViewComponentModule   } from 'components/employee-view'   ;
import { ScheduleOpenComponentModule   } from 'components/schedule-open'   ;

@NgModule({
  declarations: [
    SchedulingBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulingBetaPage),
    DragDropModule,
    CalendarModule,
    DialogModule,
    ScheduleModule,
    OptionsGenericComponentModule,
    VideoPlayComponentModule,
    EmployeeViewComponentModule,
    ScheduleOpenComponentModule,
  ],
  exports: [
    SchedulingBetaPage,
  ]
})
export class SchedulingBetaPageModule {}
