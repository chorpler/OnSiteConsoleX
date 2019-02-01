import { NgModule            } from '@angular/core'   ;
import { CommonModule,       } from '@angular/common' ;
import { FormsModule,        } from '@angular/forms'  ;
import { FindInPageComponent } from './find-in-page'  ;
import { DialogModule        } from 'primeng/dialog'  ;
// import { PanelModule         } from 'primeng/panel'   ;
import { InputTextModule     } from 'primeng/primeng' ;
// import { ButtonModule,       } from 'primeng/primeng' ;
// import { OverlayPanelModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    FindInPageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    // PanelModule,
    InputTextModule,
    // ButtonModule,
    // OverlayPanelModule,
  ],
  exports: [
    FindInPageComponent,
  ]
})
export class FindInPageComponentModule {}
