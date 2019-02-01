import { NgModule               } from '@angular/core'     ;
import { CommonModule,          } from '@angular/common'   ;
import { FormsModule            } from '@angular/forms'    ;
import { WorkSiteHoursComponent } from './work-site-hours' ;
import { SharedModule           } from 'primeng/shared'    ;
import { DataTableModule        } from 'primeng/datatable' ;
import { DialogModule,          } from 'primeng/dialog'    ;
import { DropdownModule,        } from 'primeng/dropdown'  ;
import { CalendarModule,        } from 'primeng/calendar'  ;
import { InputTextModule,       } from 'primeng/inputtext' ;
import { ButtonModule,          } from 'primeng/button'    ;

@NgModule({
  declarations: [
    WorkSiteHoursComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DialogModule,
    DataTableModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
  ],
  exports: [
    WorkSiteHoursComponent,
  ]
})
export class WorkSiteHoursComponentModule {}
