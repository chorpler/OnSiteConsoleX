import { NgModule                     } from '@angular/core'           ;
import { CommonModule,                } from '@angular/common'         ;
import { FormsModule                  } from '@angular/forms'          ;
import { ReportLogisticsViewComponent } from './report-logistics-view' ;
import { DialogModule,                } from 'primeng/dialog'          ;
import { DropdownModule,              } from 'primeng/dropdown'        ;
import { CalendarModule,              } from 'primeng/calendar'        ;
import { InputMaskModule,             } from 'primeng/inputmask'       ;
import { InputTextareaModule,         } from 'primeng/inputtextarea'   ;
import { GMapModule                   } from 'primeng/gmap'            ;

@NgModule({
  declarations: [
    ReportLogisticsViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    InputMaskModule,
    InputTextareaModule,
    GMapModule,
  ],
  exports: [
    ReportLogisticsViewComponent,
  ]
})
export class ReportLogisticsViewComponentModule {}
