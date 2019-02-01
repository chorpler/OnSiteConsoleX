import { NgModule                                           } from '@angular/core'   ;
import { IonicPageModule                                    } from 'ionic-angular'   ;
import { EmployeeBetaPage                                   } from './employee-beta' ;
import {  DropdownModule, OverlayPanelModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    EmployeeBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(EmployeeBetaPage),
    DropdownModule,
    OverlayPanelModule,
  ],
  exports: [
    EmployeeBetaPage,
  ]
})
export class EmployeePageModule {}
