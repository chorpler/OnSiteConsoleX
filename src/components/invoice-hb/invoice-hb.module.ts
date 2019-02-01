import { NgModule           } from '@angular/core'    ;
import { CommonModule       } from '@angular/common'  ;
import { FormsModule        } from '@angular/forms'   ;
import { InvoiceHBComponent } from './invoice-hb'     ;
import { CalendarModule     } from 'primeng/calendar' ;

@NgModule({
  declarations: [
    InvoiceHBComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
  ],
  exports: [
    InvoiceHBComponent,
  ]
})
export class InvoiceHBComponentModule {}
