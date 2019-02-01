import { NgModule              } from '@angular/core'         ;
import { IonicPageModule       } from 'ionic-angular'         ;
import { SchedulePrintBetaPage } from './schedule-print-beta' ;

@NgModule({
  declarations: [
    SchedulePrintBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulePrintBetaPage),
  ],
})
export class SchedulePrintBetaPageModule {}
