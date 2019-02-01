import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddLocIDPage } from './add-location-id';

@NgModule({
  declarations: [
    AddLocIDPage,
  ],
  imports: [
    IonicPageModule.forChild(AddLocIDPage),
  ],
  exports: [
    AddLocIDPage
  ]
})
export class AddLocIDPageModule {}
