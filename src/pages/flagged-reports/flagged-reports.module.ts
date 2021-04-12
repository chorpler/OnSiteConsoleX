import { NgModule                      } from '@angular/core'               ;
import { IonicPageModule               } from 'ionic-angular'               ;
import { FlaggedReportsPage            } from './flagged-reports'           ;
import { DataTableModule, SharedModule } from 'primeng/primeng'             ;
import { CalendarModule                } from 'primeng/primeng'             ;
import { ReportViewComponentModule     } from 'components/report-view'      ;

@NgModule({
  declarations: [
    FlaggedReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(FlaggedReportsPage),
    DataTableModule,
    SharedModule,
    CalendarModule,
    ReportViewComponentModule,
  ],
  exports: [
    FlaggedReportsPage
  ]
})
export class FlaggedReportsPageModule {}
