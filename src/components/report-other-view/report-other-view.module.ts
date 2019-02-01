import { NgModule                 } from '@angular/core'         ;
import { CommonModule,            } from '@angular/common'       ;
import { FormsModule              } from '@angular/forms'        ;
import { ReportOtherViewComponent } from './report-other-view'   ;
import { DialogModule,            } from 'primeng/dialog'        ;
import { DropdownModule,          } from 'primeng/dropdown'      ;
import { CalendarModule,          } from 'primeng/calendar'      ;
import { InputMaskModule,         } from 'primeng/inputmask'     ;
import { InputTextareaModule,     } from 'primeng/inputtextarea' ;

@NgModule({
  declarations: [
    ReportOtherViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    InputMaskModule,
    InputTextareaModule,
  ],
  exports: [
    ReportOtherViewComponent,
  ]
})
export class ReportOtherViewComponentModule {}
