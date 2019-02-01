import { NgModule                      } from '@angular/core'                                 ;
import { IonicPageModule               } from 'ionic-angular'                                 ;
import { InvoicingBEPage               } from './invoicing-be'                                ;
import { InplaceModule                 } from 'primeng/inplace'                               ;
import { DropdownModule                } from 'primeng/dropdown'                              ;
import { DialogModule                  } from 'primeng/dialog'                                ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta'                   ;
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
    ReportViewBetaComponentModule,
  ],
  exports: [
    InvoicingBEPage,
  ]
})
export class InvoicingBEPageModule {}
