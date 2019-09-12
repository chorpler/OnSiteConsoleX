// import { NgxDatatableModule                 } from '@swimlane/ngx-datatable'          ;
// import { FontAwesomeModule                  } from '@fortawesome/angular-fontawesome' ;
import { NgModule                           } from '@angular/core'                    ;
import { IonicPageModule                    } from 'ionic-angular'                    ;
import { TranslationsPage                   } from './translations'                   ;
import { SharedModule                       } from 'primeng/shared'                   ;
import { PanelModule,                       } from 'primeng/panel'                    ;
import { MultiSelectModule                  } from 'primeng/multiselect'              ;
import { TableModule                        } from 'primeng/table'                    ;

@NgModule({
  declarations: [
    TranslationsPage,
  ],
  imports: [
    IonicPageModule.forChild(TranslationsPage),
    // FontAwesomeModule,
    SharedModule,
    PanelModule,
    MultiSelectModule,
    TableModule,
  ],
  exports: [
    TranslationsPage,
  ]
})
export class TranslationsPageModule {}
