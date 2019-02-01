import { NgModule,                               } from '@angular/core'      ;
import { CommonModule,                           } from '@angular/common'    ;
// import { DecimalPipe, CurrencyPipe, PercentPipe, } from '@angular/common'    ;
import { FormsModule,                            } from '@angular/forms'     ;
import { DPSCalculationsComponent                } from './dps-calculations' ;
import { SharedModule,                           } from 'primeng/primeng'    ;
import { DropdownModule, InplaceModule,          } from 'primeng/primeng'    ;

@NgModule({
  declarations: [
    DPSCalculationsComponent,
  ],
  entryComponents: [
    DPSCalculationsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DropdownModule,
    InplaceModule,
  ],
  exports: [
    DPSCalculationsComponent,
  ]
})
export class DPSCalculationsComponentModule {
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: DPSCalculationsComponentModule,
  //     providers: providers
  //   };
  // }
}


