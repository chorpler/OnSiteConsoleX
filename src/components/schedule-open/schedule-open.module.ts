import { NgModule                } from '@angular/core'     ;
import { CommonModule            } from '@angular/common'   ;
import { FormsModule             } from '@angular/forms'    ;
import { ScheduleOpenComponent   } from './schedule-open'   ;
import { SharedModule            } from 'primeng/shared'    ;
import { ListboxModule           } from 'primeng/listbox'   ;
import { DialogModule            } from 'primeng/dialog'    ;
import { CalendarModule          } from 'primeng/calendar'  ;
import { ScheduleModule          } from 'primeng/schedule'  ;
import { DropdownModule          } from 'primeng/dropdown'  ;

@NgModule({
  declarations: [
    ScheduleOpenComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ListboxModule,
    DialogModule,
    CalendarModule,
    ScheduleModule,
    DropdownModule,
  ],
  exports: [
    ScheduleOpenComponent,
  ],
})
export class ScheduleOpenComponentModule { }
