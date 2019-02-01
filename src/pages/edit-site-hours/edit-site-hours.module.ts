import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditSiteHoursPage } from './edit-site-hours';

@NgModule({
  declarations: [
    EditSiteHoursPage,
  ],
  imports: [
    IonicPageModule.forChild(EditSiteHoursPage),
  ],
  exports: [
    EditSiteHoursPage
  ]
})
export class EditSiteHoursPageModule {}
