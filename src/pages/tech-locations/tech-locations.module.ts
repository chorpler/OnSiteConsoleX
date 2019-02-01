import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TechLocationsPage } from './tech-locations';

@NgModule({
  declarations: [
    TechLocationsPage,
  ],
  imports: [
    IonicPageModule.forChild(TechLocationsPage),
  ],
})
export class TechLocationsPageModule {}
