import { NgModule                  } from '@angular/core'       ;
import { CommonModule              } from '@angular/common'     ;
import { DatabaseStatusComponent   } from './database-status'   ;
import { SharedModule              } from 'primeng/shared'      ;
import { ButtonModule              } from 'primeng/button'      ;
import { DialogModule              } from 'primeng/dialog'      ;
import { ProgressBarModule         } from 'primeng/progressbar' ;
// import { MomentModule              } from 'ngx-moment'          ;

@NgModule({
  declarations: [
    DatabaseStatusComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
    // MomentModule,
  ],
  exports: [
    DatabaseStatusComponent,
  ]
})
export class DatabaseStatusComponentModule { }
