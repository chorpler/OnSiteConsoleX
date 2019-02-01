import { NgModule             } from '@angular/core'    ;
import { CommonModule         } from '@angular/common'  ;
import { FormsModule          } from '@angular/forms'   ;
import { SharedModule         } from 'primeng/shared'   ;
import { DialogModule         } from 'primeng/dialog'   ;
import { CalendarModule       } from 'primeng/calendar' ;
import { DropdownModule       } from 'primeng/dropdown' ;
import { ScheduleNewComponent } from './schedule-new'   ;

@NgModule({
  declarations: [
    ScheduleNewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
  ],
  exports: [
    ScheduleNewComponent,
  ]
})
export class ScheduleNewComponentModule {}
