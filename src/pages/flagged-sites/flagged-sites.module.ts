import { NgModule          } from '@angular/core'       ;
import { IonicPageModule   } from 'ionic-angular'       ;
import { FlaggedSitesPage  } from './flagged-sites'     ;
import { SharedModule      } from 'primeng/shared'      ;
import { DataTableModule,  } from 'primeng/datatable'   ;
import { MultiSelectModule } from 'primeng/multiselect' ;
import { DndModule         } from 'components/dnd'      ;

@NgModule({
  declarations: [
    FlaggedSitesPage,
  ],
  imports: [
    IonicPageModule.forChild(FlaggedSitesPage),
    DataTableModule,
    SharedModule,
    DndModule,
    MultiSelectModule,
  ],
  exports: [
    FlaggedSitesPage,
  ]
})
export class FlaggedSitesPageModule {}
