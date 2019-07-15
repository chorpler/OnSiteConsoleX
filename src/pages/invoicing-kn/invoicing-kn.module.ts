import { NgModule                      } from '@angular/core'                                 ;
import { IonicPageModule               } from 'ionic-angular'                                 ;
import { InvoicingKNPage               } from './invoicing-kn'                                ;
import { InplaceModule                 } from 'primeng/primeng'                               ;
import { DropdownModule                } from 'primeng/primeng'                               ;
import { DialogModule                  } from 'primeng/primeng'                               ;
import { ReportViewComponentModule     } from 'components/report-view'                        ;
import { InvoicesOpenComponentModule   } from 'components/invoices-open/invoices-open.module' ;

@NgModule({
  declarations: [
    InvoicingKNPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingKNPage),
    InvoicesOpenComponentModule,
    DropdownModule,
    DialogModule,
    ReportViewComponentModule,
  ],
  exports: [
    InvoicingKNPage,
  ]
})
export class InvoicingKnPageModule {}
