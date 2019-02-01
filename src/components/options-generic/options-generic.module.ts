import { NgModule                } from '@angular/core'     ;
import { CommonModule            } from '@angular/common'   ;
import { FormsModule             } from '@angular/forms'    ;
import { OptionsGenericComponent } from './options-generic' ;
import { SharedModule            } from 'primeng/shared'    ;
import { DropdownModule          } from 'primeng/dropdown'  ;
import { DialogModule            } from 'primeng/dialog'    ;
import { CheckboxModule          } from 'primeng/checkbox'  ;
import { ButtonModule            } from 'primeng/button'    ;

@NgModule({
  declarations: [
    OptionsGenericComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DropdownModule,
    DialogModule,
    CheckboxModule,
    ButtonModule,
  ],
  exports: [
    OptionsGenericComponent,
  ]
})
export class OptionsGenericComponentModule { }
