import { NgModule                     } from '@angular/core'           ;
import { CommonModule,                } from '@angular/common'         ;
import { FormsModule                  } from '@angular/forms'          ;
import { ReportViewLogisticsComponent } from './report-view-logistics' ;
import { DialogModule,                } from 'primeng/dialog'          ;
import { DropdownModule,              } from 'primeng/dropdown'        ;
import { CalendarModule,              } from 'primeng/calendar'        ;
import { InputMaskModule,             } from 'primeng/inputmask'       ;
import { InputTextareaModule,         } from 'primeng/inputtextarea'   ;

@NgModule({
  declarations: [
    ReportViewLogisticsComponent,
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
    ReportViewLogisticsComponent,
  ]
})
export class ReportViewLogisticsComponentModule {}
