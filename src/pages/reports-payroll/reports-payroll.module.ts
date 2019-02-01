import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportsPayrollPage } from './reports-payroll';

@NgModule({
  declarations: [
    ReportsPayrollPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsPayrollPage),
  ],
  exports: [
    ReportsPayrollPage
  ]
})
export class ReportsPayrollPageModule {}
