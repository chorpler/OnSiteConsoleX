import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvoicingShiftReportsPage } from './invoicing-shift-reports';

@NgModule({
  declarations: [
    InvoicingShiftReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingShiftReportsPage),
  ],
  exports: [
    InvoicingShiftReportsPage
  ]
})
export class InvoicingShiftReportsPageModule {}
