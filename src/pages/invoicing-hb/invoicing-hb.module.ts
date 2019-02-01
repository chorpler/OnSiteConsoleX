import { NgModule                    } from '@angular/core'                                 ;
import { IonicPageModule             } from 'ionic-angular'                                 ;
import { InvoicingHBPage             } from './invoicing-hb'                                ;
import { InvoiceHBComponentModule    } from 'components/invoice-hb/invoice-hb.module'       ;
import { InvoicesOpenComponentModule } from 'components/invoices-open/invoices-open.module' ;
import { DropdownModule,             } from 'primeng/dropdown'                              ;

@NgModule({
  declarations: [
    InvoicingHBPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingHBPage),
    DropdownModule,
    InvoiceHBComponentModule,
    InvoicesOpenComponentModule,
  ],
  exports: [
    InvoicingHBPage,
  ]
})
export class InvoicingHBPageModule {}
