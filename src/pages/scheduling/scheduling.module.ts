import { NgModule                      } from '@angular/core'                    ;
import { IonicPageModule               } from 'ionic-angular'                    ;
import { SchedulingPage                } from './scheduling'                     ;
import { DndModule                     } from 'components/dnd'                   ;
import { MomentModule                  } from 'ngx-moment'                       ;
import { ButtonModule                  } from 'primeng/button'                   ;
import { CalendarModule                } from 'primeng/calendar'                 ;
import { DialogModule,                 } from 'primeng/dialog'                   ;
import { ScheduleModule                } from 'primeng/schedule'                 ;
import { DropdownModule                } from 'primeng/dropdown'                 ;
import { OverlayPanelModule            } from 'primeng/overlaypanel'             ;
import { CheckboxModule                } from 'primeng/checkbox'                 ;
import { InputSwitchModule             } from 'primeng/inputswitch'              ;
import { OptionsGenericComponentModule } from 'components/options-generic'       ;
import { VideoPlayComponentModule      } from 'components/video-play'            ;
import { EmployeeViewComponentModule   } from 'components/employee-view'         ;
import { ScheduleOpenComponentModule   } from 'components/schedule-open'         ;
import { ScheduleNewComponentModule    } from 'components/schedule-new'          ;
import { WorkSiteComponentModule       } from 'components/work-site'             ;

@NgModule({
  declarations: [
    SchedulingPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulingPage),
    // FontAwesomeModule,
    DndModule,
    ButtonModule,
    CalendarModule,
    DialogModule,
    ScheduleModule,
    DropdownModule,
    OverlayPanelModule,
    MomentModule,
    CheckboxModule,
    InputSwitchModule,
    OptionsGenericComponentModule,
    VideoPlayComponentModule,
    EmployeeViewComponentModule,
    ScheduleOpenComponentModule,
    ScheduleNewComponentModule,
    WorkSiteComponentModule,
  ],
  exports: [
    SchedulingPage,
  ]
})
export class SchedulingPageModule {}
