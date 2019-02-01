import { NgModule                      } from '@angular/core'   ;
import { IonicPageModule               } from 'ionic-angular'   ;
import { FlaggedReportsOtherPage              } from './flagged-reports-other' ;
import { DataTableModule, SharedModule } from 'primeng/primeng' ;
import { CalendarModule                } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    FlaggedReportsOtherPage,
  ],
  imports: [
    IonicPageModule.forChild(FlaggedReportsOtherPage),
    DataTableModule,
    SharedModule,
    CalendarModule,
  ],
  exports: [
    FlaggedReportsOtherPage
  ]
})
export class FlaggedReportsOtherPageModule {}
