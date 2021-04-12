import { NgModule            } from '@angular/core'         ;
import { CommonModule        } from '@angular/common'       ;
import { FormsModule         } from '@angular/forms'        ;
import { TranslationImport   } from './translation-import'  ;
import { SharedModule        } from 'primeng/shared'        ;
import { ButtonModule        } from 'primeng/button'        ;
import { InputTextModule     } from 'primeng/inputtext'     ;
import { InputTextareaModule } from 'primeng/inputtextarea' ;
import { InputSwitchModule   } from 'primeng/inputswitch'   ;
import { DialogModule        } from 'primeng/dialog'        ;
import { DropdownModule      } from 'primeng/dropdown'      ;
import { MultiSelectModule   } from 'primeng/multiselect'   ;
import { TableModule         } from 'primeng/table'         ;

@NgModule({
  declarations: [
    TranslationImport,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule,
    TableModule,
  ],
  exports: [
    TranslationImport,
  ]
})
export class TranslationImportModule {}
