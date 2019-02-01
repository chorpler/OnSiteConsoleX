import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScheduleSummaryPage } from './schedule-summary';

@NgModule({
  declarations: [
    ScheduleSummaryPage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduleSummaryPage),
  ],
  exports: [
    ScheduleSummaryPage
  ]
})
export class ScheduleSummaryPageModule {}
