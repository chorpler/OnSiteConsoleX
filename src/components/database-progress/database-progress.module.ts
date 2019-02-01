import { NgModule                  } from '@angular/core'       ;
import { CommonModule              } from '@angular/common'     ;
import { DatabaseProgressComponent } from './database-progress' ;
import { SharedModule              } from 'primeng/shared'      ;
import { ButtonModule              } from 'primeng/button'      ;
import { DialogModule              } from 'primeng/dialog'      ;
import { ProgressBarModule         } from 'primeng/progressbar' ;

@NgModule({
  declarations: [
    DatabaseProgressComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
  ],
  exports: [
    DatabaseProgressComponent,
  ]
})
export class DatabaseProgressComponentModule { }
