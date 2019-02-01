import { NgModule                      } from '@angular/core'               ;
import { IonicPageModule               } from 'ionic-angular'               ;
import { FlaggedReportsPage            } from './flagged-reports'           ;
import { DataTableModule, SharedModule } from 'primeng/primeng'             ;
import { CalendarModule                } from 'primeng/primeng'             ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta' ;

@NgModule({
  declarations: [
    FlaggedReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(FlaggedReportsPage),
    DataTableModule,
    SharedModule,
    CalendarModule,
    ReportViewBetaComponentModule,
  ],
  exports: [
    FlaggedReportsPage
  ]
})
export class FlaggedReportsPageModule {}
