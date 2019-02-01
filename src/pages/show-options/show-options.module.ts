import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShowOptionsPage } from './show-options';

@NgModule({
  declarations: [
    ShowOptionsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShowOptionsPage),
  ],
  exports: [
    ShowOptionsPage
  ]
})
export class ShowOptionsPageModule {}
