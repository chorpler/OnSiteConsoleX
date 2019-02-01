import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DrugTestPage } from './drug-test';

@NgModule({
  declarations: [
    DrugTestPage,
  ],
  imports: [
    IonicPageModule.forChild(DrugTestPage),
  ],
  exports: [
    DrugTestPage
  ]
})
export class DrugTestPageModule {}
