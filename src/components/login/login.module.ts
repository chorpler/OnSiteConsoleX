import { NgModule            } from '@angular/core'   ;
import { CommonModule,       } from '@angular/common' ;
import { FormsModule,        } from '@angular/forms'  ;
import { LoginComponent      } from './login'         ;
import { DialogModule        } from 'primeng/dialog'  ;
import { PanelModule         } from 'primeng/panel'   ;
import { InputTextModule     } from 'primeng/primeng' ;
import { ButtonModule,       } from 'primeng/primeng' ;
import { OverlayPanelModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    OverlayPanelModule,
  ],
  exports: [
    LoginComponent,
  ]
})
export class LoginComponentModule {}
