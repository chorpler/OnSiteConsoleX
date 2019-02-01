import { NgModule        } from '@angular/core'  ;
import { IonicPageModule } from 'ionic-angular'  ;
import { AddEmployee     } from './add-employee' ;

@NgModule({
  declarations: [
    AddEmployee,
  ],
  imports: [
    IonicPageModule.forChild(AddEmployee),
  ],
  exports: [
    AddEmployee,
  ]
})
export class AddEmployeePageModule {}
