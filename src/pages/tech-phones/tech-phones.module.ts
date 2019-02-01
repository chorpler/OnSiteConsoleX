import { NgModule                      } from '@angular/core'              ;
import { IonicPageModule               } from 'ionic-angular'              ;
import { TechPhonesPage                } from './tech-phones'              ;
import { SharedModule                  } from 'primeng/shared'             ;
import { MultiSelectModule             } from 'primeng/multiselect'        ;
import { DropdownModule                } from 'primeng/dropdown'           ;
import { TableModule                   } from 'primeng/table'              ;
import { OptionsGenericComponentModule } from 'components/options-generic' ;

@NgModule({
  declarations: [
    TechPhonesPage,
  ],
  imports: [
    IonicPageModule.forChild(TechPhonesPage),
    SharedModule,
    MultiSelectModule,
    DropdownModule,
    TableModule,
    OptionsGenericComponentModule,
  ],
  exports: [
    TechPhonesPage,
  ]
})
export class TechPhonesPageModule {}
