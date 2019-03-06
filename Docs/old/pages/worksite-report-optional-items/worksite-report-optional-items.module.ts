import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorksiteReportOptionalItemsPage } from './worksite-report-optional-items';
import { WorkReportItemsComponentModule } from "components/work-report-items";

@NgModule({
  declarations: [
    WorksiteReportOptionalItemsPage,
  ],
  imports: [
    WorkReportItemsComponentModule,
    IonicPageModule.forChild(WorksiteReportOptionalItemsPage),
  ],
})
export class WorksiteReportOptionalItemsPageModule {}
