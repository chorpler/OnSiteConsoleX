import { NgModule                      } from '@angular/core'                                 ;
import { IonicPageModule               } from 'ionic-angular'                                 ;
import { InvoicingBEPage               } from './invoicing-be'                                ;
import { InplaceModule                 } from 'primeng/inplace'                               ;
import { DropdownModule                } from 'primeng/dropdown'                              ;
import { DialogModule                  } from 'primeng/dialog'                                ;
import { ReportViewComponentModule     } from 'components/report-view'                        ;
import { InvoicesOpenComponentModule   } from 'components/invoices-open/invoices-open.module' ;

@NgModule({
  declarations: [
    InvoicingBEPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingBEPage),
    InvoicesOpenComponentModule,
    DropdownModule,
    DialogModule,
    ReportViewComponentModule,
  ],
  exports: [
    InvoicingBEPage,
  ]
})
export class InvoicingBEPageModule {}
