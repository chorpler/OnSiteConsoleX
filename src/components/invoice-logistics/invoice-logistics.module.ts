import { NgModule                  } from '@angular/core'       ;
import { CommonModule              } from '@angular/common'     ;
import { FormsModule               } from '@angular/forms'      ;
import { InvoiceLogisticsComponent } from './invoice-logistics' ;
import { CalendarModule            } from 'primeng/calendar'    ;

@NgModule({
  declarations: [
    InvoiceLogisticsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
  ],
  exports: [
    InvoiceLogisticsComponent,
  ]
})
export class InvoiceLogisticsComponentModule {}
