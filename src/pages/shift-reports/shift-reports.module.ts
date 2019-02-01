import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShiftReportsPage } from './shift-reports';

@NgModule({
  declarations: [
    ShiftReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShiftReportsPage),
  ],
  exports: [
    ShiftReportsPage
  ]
})
export class ShiftReportsPageModule {}
