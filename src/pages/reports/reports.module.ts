// import { NgxDatatableModule                 } from '@swimlane/ngx-datatable'          ;
// import { FontAwesomeModule                  } from '@fortawesome/angular-fontawesome' ;
import { NgModule                           } from '@angular/core'                    ;
import { IonicPageModule                    } from 'ionic-angular'                    ;
import { ReportsPage                        } from './reports'                        ;
import { SharedModule                       } from 'primeng/shared'                   ;
import { PanelModule,                       } from 'primeng/panel'                    ;
import { CalendarModule                     } from 'primeng/calendar'                 ;
import { MultiSelectModule                  } from 'primeng/multiselect'              ;
import { TableModule                        } from 'primeng/table'                    ;
import { ReportViewBetaComponentModule      } from 'components/report-view-beta'      ;
import { ReportOtherViewComponentModule     } from 'components/report-other-view'     ;
import { ReportLogisticsViewComponentModule } from 'components/report-logistics-view' ;
import { ReportTimeCardViewComponentModule  } from 'components/report-timecard-view'  ;

@NgModule({
  declarations: [
    ReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsPage),
    // FontAwesomeModule,
    SharedModule,
    PanelModule,
    CalendarModule,
    MultiSelectModule,
    TableModule,
    // NgxDatatableModule,
    ReportViewBetaComponentModule,
    ReportOtherViewComponentModule,
    ReportLogisticsViewComponentModule,
    ReportTimeCardViewComponentModule,
  ],
  exports: [
    ReportsPage,
  ]
})
export class ReportsPageModule {}
