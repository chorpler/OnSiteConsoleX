// import { DataTableModule               } from 'primeng/datatable'          ;
// import { DndModule                     } from 'components/dnd/dnd.module'  ;
// import { SharedModule                  } from 'primeng/shared'             ;
import { NgModule                      } from '@angular/core'              ;
import { IonicPageModule               } from 'ionic-angular'              ;
import { WorkSitesPage             } from './work-sites'          ;
import { ScrollPanelModule             } from 'primeng/scrollpanel'        ;
import { TableModule                   } from 'primeng/table'              ;
import { MultiSelectModule             } from 'primeng/multiselect'        ;
import { OptionsGenericComponentModule } from 'components/options-generic' ;
import { WorkSiteComponentModule       } from 'components/work-site'       ;

@NgModule({
  declarations: [
    WorkSitesPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkSitesPage),
    // DataTableModule,
    // DndModule,
    // SharedModule,
    ScrollPanelModule,
    TableModule,
    MultiSelectModule,
    OptionsGenericComponentModule,
    WorkSiteComponentModule,
  ],
  exports: [
    WorkSitesPage,
  ]
})
export class WorkSitesPageModule {}
