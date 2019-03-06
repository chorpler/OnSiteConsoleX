import { NgModule                    } from '@angular/core'                                     ;
import { IonicPageModule             } from 'ionic-angular'                                     ;
import { ReportsBetaPage             } from './reports-beta'                                    ;

@NgModule({
  declarations: [
    ReportsBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsBetaPage),
  ],
  exports: [
    ReportsBetaPage,
  ],
})
export class ReportsBetaPageModule {}
