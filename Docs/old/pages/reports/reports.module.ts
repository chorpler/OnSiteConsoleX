import { NgModule                      } from '@angular/core'               ;
import { IonicPageModule               } from 'ionic-angular'               ;
import { ReportsPage                   } from './reports'                   ;
import { SharedModule                  } from 'primeng/shared'              ;
import { CalendarModule                } from 'primeng/calendar'            ;
import { MultiSelectModule             } from 'primeng/multiselect'         ;
import { TableModule                   } from 'primeng/table'               ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta' ;

@NgModule({
  declarations: [
    ReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsPage),
    SharedModule,
    CalendarModule,
    MultiSelectModule,
    TableModule,
    ReportViewBetaComponentModule,
  ],
  exports: [
    ReportsPage,
  ]
})
export class ReportsPageModule {}
