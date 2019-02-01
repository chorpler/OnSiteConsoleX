import { NgModule            } from '@angular/core'       ;
import { IonicPageModule     } from 'ionic-angular'       ;
import { ReportOtherViewPage } from './report-other-view' ;

@NgModule({
  declarations: [
    ReportOtherViewPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportOtherViewPage),
  ],
})
export class ReportOtherViewPageModule {}
