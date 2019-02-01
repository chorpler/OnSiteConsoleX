import { NgModule                      } from '@angular/core'               ;
import { IonicPageModule               } from 'ionic-angular'               ;
import { InvoicingHBBetaPage           } from './invoicing-hb-beta'         ;
import { DropdownModule,               } from 'primeng/dropdown'            ;
import { MultiSelectModule             } from 'primeng/multiselect'         ;
// import { DialogModule                  } from 'primeng/dialog'              ;
import { InvoiceHBComponentModule       } from 'components/invoice-hb/'     ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta' ;
import { OptionsGenericComponentModule } from 'components/options-generic'  ;
import { InvoicesOpenComponentModule   } from 'components/invoices-open'    ;

@NgModule({
  declarations: [
    InvoicingHBBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingHBBetaPage),
    DropdownModule,
    MultiSelectModule,
    // DialogModule,
    InvoiceHBComponentModule,
    ReportViewBetaComponentModule,
    InvoicesOpenComponentModule,
    OptionsGenericComponentModule,
  ],
  exports: [
    InvoicingHBBetaPage,
  ]
})
export class InvoicingHBBetaPageModule {}
