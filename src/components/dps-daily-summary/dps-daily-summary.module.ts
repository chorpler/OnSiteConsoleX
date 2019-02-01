import { NgModule,                                       } from '@angular/core'       ;
import { CommonModule,                                   } from '@angular/common'     ;
import { FormsModule,                                    } from '@angular/forms'      ;
import { DPSDailySummaryComponent                        } from './dps-daily-summary' ;
import { SharedModule,                                   } from 'primeng/primeng'     ;
import { DropdownModule, InplaceModule, TieredMenuModule } from 'primeng/primeng'     ;

@NgModule({
  declarations: [
    DPSDailySummaryComponent,
  ],
  entryComponents: [
    DPSDailySummaryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DropdownModule,
    InplaceModule,
    TieredMenuModule,
  ],
  exports: [
    DPSDailySummaryComponent,
  ]
})
export class DPSDailySummaryComponentModule {
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: DPSCalculationsComponentModule,
  //     providers: providers
  //   };
  // }
}


