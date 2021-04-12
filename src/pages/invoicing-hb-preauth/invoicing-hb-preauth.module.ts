// import { DatagridComponentModule       } from 'components/datagrid/datagrid.module'                 ;
import { NgModule                      } from '@angular/core'                                       ;
import { IonicPageModule               } from 'ionic-angular'                                       ;
import { HBPreauthPage                 } from './invoicing-hb-preauth'                              ;
import { DropdownModule                } from 'primeng/dropdown'                                    ;
import { MultiSelectModule,            } from 'primeng/multiselect'                                 ;
import { ReportViewComponentModule     } from 'components/report-view'                              ;
import { PreauthOpenComponentModule    } from 'components/preauth-open/preauth-open.module'         ;
import { OptionsGenericComponentModule } from 'components/options-generic'                          ;

@NgModule({
  declarations: [
    HBPreauthPage,
  ],
  // entryComponents: [
  //   PreauthOpenComponent,
  // ],
  imports: [
    IonicPageModule.forChild(HBPreauthPage),
    DropdownModule,
    MultiSelectModule,
    ReportViewComponentModule,
    PreauthOpenComponentModule,
    OptionsGenericComponentModule,
  ],
})
export class HBPreauthPageModule {}
