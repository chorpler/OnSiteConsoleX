import { NgModule          } from '@angular/core'      ;
import { IonicPageModule   } from 'ionic-angular'      ;
import { PayrollExportPage } from './payroll-export'   ;
import { InplaceModule,    } from 'primeng/inplace'    ;
import { DropdownModule,   } from 'primeng/dropdown'   ;
import { TieredMenuModule, } from 'primeng/tieredmenu' ;

@NgModule({
  declarations: [
    PayrollExportPage,
  ],
  imports: [
    IonicPageModule.forChild(PayrollExportPage),
    InplaceModule,
    DropdownModule,
    TieredMenuModule,
  ],
  exports: [
    PayrollExportPage,
  ]
})
export class PayrollExportPageModule {}
