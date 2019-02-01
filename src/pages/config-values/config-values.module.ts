import { NgModule                     } from '@angular/core'   ;
import { IonicPageModule              } from 'ionic-angular'   ;
import { ConfigValuesPage             } from './config-values' ;
import { DataTableModule,SharedModule } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    ConfigValuesPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfigValuesPage),
    DataTableModule,
    SharedModule,
  ],
})
export class ConfigValuesPageModule {}
