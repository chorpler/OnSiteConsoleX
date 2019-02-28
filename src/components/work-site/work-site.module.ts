import { NgModule                     } from '@angular/core'              ;
import { CommonModule                 } from '@angular/common'            ;
import { FormsModule                  } from '@angular/forms'             ;
import { WorkSiteComponent            } from './work-site'                ;
import { DirectivesModule             } from 'directives'                 ;
import { SharedModule                 } from 'primeng/shared'             ;
import { DialogModule                 } from 'primeng/dialog'             ;
import { InputSwitchModule            } from 'primeng/inputswitch'        ;
import { DropdownModule               } from 'primeng/dropdown'           ;
import { OverlayPanelModule,          } from 'primeng/overlaypanel'       ;
import { InputTextModule              } from 'primeng/inputtext'          ;
import { ButtonModule                 } from 'primeng/button'             ;
import { CheckboxModule               } from 'primeng/checkbox'           ;
import { GMapModule                   } from 'primeng/gmap'               ;
import { WorkSiteHoursComponentModule } from 'components/work-site-hours' ;
import { AddSiteLocaleComponentModule } from 'components/add-site-locale' ;

@NgModule({
  declarations: [
    WorkSiteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DirectivesModule,
    SharedModule,
    DialogModule,
    InputSwitchModule,
    DropdownModule,
    OverlayPanelModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    GMapModule,
    WorkSiteHoursComponentModule,
    AddSiteLocaleComponentModule,
  ],
  exports: [
    WorkSiteComponent,
  ]
})
export class WorkSiteComponentModule { }
