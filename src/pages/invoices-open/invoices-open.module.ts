import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvoicesOpenPage } from './invoices-open';

@NgModule({
  declarations: [
    InvoicesOpenPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicesOpenPage),
  ],
  exports: [
    InvoicesOpenPage
  ]
})
export class InvoicesOpenPageModule {}
