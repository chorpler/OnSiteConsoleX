import { NgModule                                 } from '@angular/core'                ;
import { IonicPageModule                          } from 'ionic-angular'                ;
import { HomePage                                 } from './home'                       ;
import { CommonModule,                            } from '@angular/common'              ;
import { FormsModule,                             } from '@angular/forms'               ;
import { CurrencyMaskModule                       } from 'components/ngx-currency-mask' ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'components/ngx-currency-mask' ;
import { SharedModule,                            } from 'primeng/shared'               ;
import { OverlayPanelModule,                      } from 'primeng/overlaypanel'         ;
import { PanelModule,                             } from 'primeng/panel'                ;
import { InputTextModule,                         } from 'primeng/inputtext'            ;
import { SpinnerModule,                           } from 'primeng/spinner'              ;
import { DropdownModule,                          } from 'primeng/dropdown'             ;
import { LoginComponentModule                     } from 'components/login'             ;
import { NotificationComponentModule,             } from 'components/notification'      ;
import { WorkReportItemsComponentModule           } from "components/work-report-items" ;
import { MomentModule                             } from 'ngx-moment'                   ;

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
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    CommonModule,
    FormsModule,
    SharedModule,
    CurrencyMaskModule,
    PanelModule,
    InputTextModule,
    SpinnerModule,
    DropdownModule,
    OverlayPanelModule,
    // MouseWheelModule,
    NotificationComponentModule,
    LoginComponentModule,
    WorkReportItemsComponentModule,
    MomentModule,
    // NotificationComponentModule.forRoot(),
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    // NotificationComponentModule.forRoot().providers,
  ],
  exports: [
    HomePage
  ]
})
export class HomePageModule {}
