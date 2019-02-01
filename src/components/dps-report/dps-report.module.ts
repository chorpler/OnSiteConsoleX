import { NgModule,                      } from '@angular/core'            ;
import { CommonModule,                  } from '@angular/common'          ;
import { FormsModule,                   } from '@angular/forms'           ;
import { DPSReportComponent             } from './dps-report'             ;
import { SharedModule,                  } from 'primeng/primeng'          ;
import { DropdownModule, InplaceModule, } from 'primeng/primeng'          ;
import { GoogleChartsModule             } from 'components/google-charts' ;

@NgModule({
  declarations: [
    DPSReportComponent,
  ],
  entryComponents: [
    DPSReportComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DropdownModule,
    InplaceModule,
    GoogleChartsModule,
  ],
  exports: [
    DPSReportComponent,
  ]
})
export class DPSReportComponentModule {
}


