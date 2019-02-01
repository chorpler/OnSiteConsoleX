import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrainingSelectPage } from './training-select';

@NgModule({
  declarations: [
    TrainingSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(TrainingSelectPage),
  ],
})
export class TrainingSelectPageModule {}
