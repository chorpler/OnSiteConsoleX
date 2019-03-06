import { NgModule                     } from '@angular/core'                ;
import { CommonModule                 } from '@angular/common'              ;
import { FormsModule                  } from '@angular/forms'               ;
import { IonicPageModule              } from 'ionic-angular'                ;
import { DirectivesModule             } from 'directives/directives.module' ;
import { WorkSitePage                 } from './work-site'                  ;
import { WorkSiteHoursComponentModule } from 'components/work-site-hours'   ;
import { AddSiteLocaleComponentModule } from 'components/add-site-locale'   ;
import { DropdownModule               } from 'primeng/dropdown'             ;
import { OverlayPanelModule,          } from 'primeng/overlaypanel'         ;
import { InputTextModule              } from 'primeng/inputtext'            ;
import { ButtonModule                 } from 'primeng/button'               ;
import { CheckboxModule               } from 'primeng/checkbox'             ;
import { GMapModule                   } from 'primeng/gmap'                 ;
// import { DialogModule                 } from 'primeng/dialog'               ;
// import { AgmCoreModule                } from '@agm/core'                    ;

@NgModule({
  declarations: [
    WorkSitePage,
  ],
  imports: [
    IonicPageModule.forChild(WorkSitePage),
    CommonModule,
    FormsModule,
    DirectivesModule,
    DropdownModule,
    OverlayPanelModule,
    InputTextModule,
    ButtonModule,
    // DialogModule,
    CheckboxModule,
    GMapModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyBut4WZDku34NbzfwOOBPHfNJRn60dH-4k'
    // }),
    AddSiteLocaleComponentModule,
    WorkSiteHoursComponentModule,
  ],
  exports: [
    WorkSitePage,
  ]
})
export class WorkSitePageModule { }
