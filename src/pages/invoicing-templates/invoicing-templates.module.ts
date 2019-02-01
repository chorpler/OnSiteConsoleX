import { NgModule                       } from '@angular/core'                                       ;
import { IonicPageModule                } from 'ionic-angular'                                       ;
import { InvoicingTemplatesPage         } from './invoicing-templates'                               ;
import { InplaceModule, DropdownModule, } from 'primeng/primeng'                                     ;
import { DialogModule                   } from 'primeng/primeng'                                     ;
import { ReportViewComponentModule      } from 'components/report-view/report-view.module'     ;
import { InvoicesOpenComponentModule    } from 'components/invoices-open/invoices-open.module' ;

@NgModule({
  declarations: [
    InvoicingTemplatesPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingTemplatesPage),
    InvoicesOpenComponentModule,
    DropdownModule,
    DialogModule,
    ReportViewComponentModule,
  ],
  exports: [
    InvoicingTemplatesPage,
  ]
})
export class InvoicingTemplatesPageModule {}
