import { NgModule          } from '@angular/core'     ;
import { IonicPageModule   } from 'ionic-angular'     ;
import { ConfigValuesPage  } from './config-values'   ;
import { SharedModule      } from 'primeng/shared'    ;
import { TableModule,      } from 'primeng/table'     ;
import { DataTableModule,  } from 'primeng/datatable' ;

@NgModule({
  declarations: [
    ConfigValuesPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfigValuesPage),
    SharedModule,
    TableModule,
    DataTableModule,
  ],
})
export class ConfigValuesPageModule {}
