import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvoicingPage } from './invoicing';

@NgModule({
  declarations: [
    InvoicingPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingPage),
  ],
  exports: [
    InvoicingPage
  ]
})
export class InvoicingPageModule {}
