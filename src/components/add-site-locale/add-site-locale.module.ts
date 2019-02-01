import { NgModule               } from '@angular/core'                ;
import { CommonModule           } from '@angular/common'              ;
import { FormsModule            } from '@angular/forms'               ;
import { DirectivesModule,      } from 'directives/directives.module' ;
import { SharedModule           } from 'primeng/shared'               ;
import { DialogModule           } from 'primeng/dialog'               ;
import { AddSiteLocaleComponent } from './add-site-locale'            ;

@NgModule({
  declarations: [
    AddSiteLocaleComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DirectivesModule,
    SharedModule,
    DialogModule,
  ],
  exports: [
    AddSiteLocaleComponent,
  ]
})
export class AddSiteLocaleComponentModule {}
