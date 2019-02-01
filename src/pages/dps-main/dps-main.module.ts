import { NgModule                                  } from '@angular/core'                         ;
import { IonicPageModule                           } from 'ionic-angular'                         ;
import { DPSMainPage                               } from './dps-main'                            ;
import { PipesModule                               } from 'pipes'                                 ;
import { SharedModule                              } from 'primeng/shared'                        ;
import { DataTableModule,                          } from 'primeng/datatable'                     ;
import { PanelModule,                              } from 'primeng/panel'                         ;
import { InputTextModule,                          } from 'primeng/inputtext'                     ;
import { ButtonModule,                             } from 'primeng/button'                        ;
import { MultiSelectModule,                        } from 'primeng/multiselect'                   ;
import { TabMenuModule,                            } from 'primeng/tabmenu'                       ;
import { TabViewModule                             } from 'primeng/tabview'                       ;
import { InplaceModule                             } from 'primeng/inplace'                       ;
import { DropdownModule,                           } from 'primeng/dropdown'                      ;
import { SelectItem,                               } from 'primeng/api'                           ;
import { MenuItem,                                 } from 'primeng/api'                           ;
import { SpinnerModule,                            } from 'primeng/spinner'                       ;
import { OverlayPanelModule,                       } from 'primeng/overlaypanel'                  ;
import { DialogModule,                             } from 'primeng/dialog'                        ;
import { TieredMenuModule                          } from 'primeng/tieredmenu'                    ;
import { CurrencyMaskModule,                       } from "components/ngx-currency-mask"          ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG, } from "components/ngx-currency-mask"          ;
// import { KeysModule,                               } from "components/keys"                       ;
import { DPSReportComponentModule,                 } from 'components/dps-report'                 ;
import { DPSCalculationsComponentModule,           } from 'components/dps-calculations'           ;
import { DPSAncillaryCalculationsComponentModule,  } from 'components/dps-ancillary-calculations' ;
import { DPSDailySummaryComponentModule,           } from 'components/dps-daily-summary'          ;
import { DPSSettingsComponentModule,               } from 'components/dps-settings'               ;
import { GoogleChartsModule                        } from 'components/google-charts'              ;

const CustomCurrencyMaskConfig:CurrencyMaskConfig = {
  align        : "right",
  allowNegative: true,
  allowZero    : true,
  decimal      : ".",
  precision    : 2,
  prefix       : "$ ",
  suffix       : "",
  thousands    : ","
};

@NgModule({
  declarations: [
    DPSMainPage,
    // DPSCalculationsPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSMainPage),
    // KeysModule.forRoot(),
    PipesModule,
    DataTableModule,
    SharedModule,
    ButtonModule,
    MultiSelectModule,
    TabMenuModule,
    TabViewModule,
    SpinnerModule,
    TieredMenuModule,
    InplaceModule,
    DropdownModule,
    PanelModule,
    OverlayPanelModule,
    DialogModule,
    CurrencyMaskModule,
    // MouseWheelModule,
    DPSReportComponentModule,
    DPSCalculationsComponentModule,
    DPSAncillaryCalculationsComponentModule,
    DPSDailySummaryComponentModule,
    DPSSettingsComponentModule,
    GoogleChartsModule,
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
  exports: [
    DPSMainPage,
  ]
})
export class DPSMainPageModule {}
