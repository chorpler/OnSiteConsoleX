import { NgModule                     } from '@angular/core'   ;
import { CommonModule                 } from '@angular/common' ;
import { FormsModule                  } from '@angular/forms'  ;
import { InvoicesOpenComponent        } from './invoices-open' ;
import { ListboxModule, DialogModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    InvoicesOpenComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ListboxModule,
    DialogModule,
  ],
  exports: [
    InvoicesOpenComponent
  ]
})
export class InvoicesOpenComponentModule {}
