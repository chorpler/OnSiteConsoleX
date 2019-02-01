import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PeriodReportsPage } from './period-reports';

@NgModule({
  declarations: [
    PeriodReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(PeriodReportsPage),
  ],
  exports: [
    PeriodReportsPage
  ]
})
export class PeriodReportsPageModule {}
