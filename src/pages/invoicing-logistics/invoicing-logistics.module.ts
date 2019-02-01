import { NgModule                        } from '@angular/core'                                 ;
import { IonicPageModule                 } from 'ionic-angular'                                 ;
import { InvoicingLogisticsPage          } from './invoicing-logistics'                         ;
import { InvoiceLogisticsComponentModule } from 'components/invoice-logistics'                  ;
import { InvoicesOpenComponentModule     } from 'components/invoices-open/invoices-open.module' ;
import { DropdownModule,                 } from 'primeng/dropdown'                              ;

@NgModule({
  declarations: [
    InvoicingLogisticsPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingLogisticsPage),
    DropdownModule,
    InvoiceLogisticsComponentModule,
    InvoicesOpenComponentModule,
  ],
  exports: [
    InvoicingLogisticsPage,
  ]
})
export class InvoicingLogisticsPageModule {}
