import { NgModule                     } from '@angular/core'              ;
import { IonicPageModule              } from 'ionic-angular'              ;
import { DirectivesModule             } from 'directives'                 ;
import { GeolocationPage              } from './geolocation'              ;
import { DropdownModule,              } from 'primeng/dropdown'           ;
import { OverlayPanelModule,          } from 'primeng/overlaypanel'       ;
import { InputTextModule,             } from 'primeng/inputtext'          ;
import { ButtonModule,                } from 'primeng/button'             ;
import { DialogModule,                } from 'primeng/dialog'             ;
import { CheckboxModule               } from 'primeng/checkbox'           ;
import { WorkSiteHoursComponentModule } from 'components/work-site-hours' ;
import { GMapModule                   } from 'primeng/gmap'                 ;
// import { AgmCoreModule                } from '@agm/core'                  ;

@NgModule({
  declarations: [
    GeolocationPage,
  ],
  imports: [
    IonicPageModule.forChild(GeolocationPage),
    DirectivesModule,
    DropdownModule,
    OverlayPanelModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    WorkSiteHoursComponentModule,
    GMapModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyBut4WZDku34NbzfwOOBPHfNJRn60dH-4k'
    // })
  ],
  exports: [
    GeolocationPage,
  ]
})
export class GeolocationPageModule { }
