import { NgModule,                                    } from '@angular/core'                ;
import { CommonModule,                                } from '@angular/common'              ;
import { FormsModule,                                 } from '@angular/forms'               ;
import { DPSAncillaryCalculationsComponent            } from './dps-ancillary-calculations' ;
import { DropdownModule, InplaceModule,               } from 'primeng/primeng'              ;
import { SharedModule, OverlayPanelModule             } from 'primeng/primeng'              ;
import { PanelModule, InputTextModule, SpinnerModule, } from 'primeng/primeng'              ;
import { GoogleChartsModule                           } from 'components/google-charts'     ;

@NgModule({
  declarations: [
    DPSAncillaryCalculationsComponent,
  ],
  entryComponents: [
    DPSAncillaryCalculationsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DropdownModule,
    InplaceModule,
    PanelModule,
    OverlayPanelModule,
    InputTextModule,
    SpinnerModule,
    GoogleChartsModule,
    // GoogleChartComponentModule,
  ],
  exports: [
    DPSAncillaryCalculationsComponent,
  ]
})
export class DPSAncillaryCalculationsComponentModule {
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: DPSCalculationsComponentModule,
  //     providers: providers
  //   };
  // }
}


