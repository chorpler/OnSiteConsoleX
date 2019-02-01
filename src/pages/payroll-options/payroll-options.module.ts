import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PayrollOptionsPage } from './payroll-options';

@NgModule({
  declarations: [
    PayrollOptionsPage,
  ],
  imports: [
    IonicPageModule.forChild(PayrollOptionsPage),
  ],
  exports: [
    PayrollOptionsPage
  ]
})
export class PayrollOptionsPageModule { }
