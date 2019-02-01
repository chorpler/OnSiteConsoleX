// import { SelectItem, MenuItem, TieredMenuModule, } from 'primeng/primeng'                                   ;
// import { NotificationComponentModule,            } from 'components/notification/notification.module'       ;
// import { DialogModule,                           } from 'primeng/dialog'                                   ;
import { NgModule                                } from '@angular/core'                                     ;
import { IonicPageModule                         } from 'ionic-angular'                                     ;
import { PayrollPage                             } from './payroll'                                         ;
import { InplaceModule,                          } from 'primeng/inplace'                                   ;
import { DropdownModule,                         } from 'primeng/dropdown'                                  ;
import { OptionsComponentModule                  } from 'components/options/options.module'                 ;
import { OptionsGenericComponentModule           } from 'components/options-generic/options-generic.module' ;
import { EmployeeViewComponentModule             } from 'components/employee-view/employee-view.module'     ;

@NgModule({
  declarations: [
    PayrollPage,
  ],
  imports: [
    IonicPageModule.forChild(PayrollPage),
    InplaceModule,
    DropdownModule,
    // DialogModule,
    OptionsComponentModule,
    OptionsGenericComponentModule,
    EmployeeViewComponentModule,
  ],
  exports: [
    PayrollPage,
  ]
})
export class PayrollPageModule {}
