import { NgModule          } from '@angular/core'    ;
import { IonicPageModule   } from 'ionic-angular'    ;
import { SchedulePrintPage } from './schedule-print' ;

@NgModule({
  declarations: [
    SchedulePrintPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulePrintPage),
  ],
})
export class SchedulePrintPageModule {}
