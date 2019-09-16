import { NgModule            } from '@angular/core'         ;
import { CommonModule        } from '@angular/common'       ;
import { FormsModule         } from '@angular/forms'        ;
import { TranslationEditor   } from './translation-editor'  ;
import { SharedModule        } from 'primeng/shared'        ;
import { ButtonModule        } from 'primeng/button'        ;
import { InputTextModule     } from 'primeng/inputtext'     ;
import { InputTextareaModule } from 'primeng/inputtextarea' ;
import { InputSwitchModule   } from 'primeng/inputswitch'   ;
import { EditorModule        } from 'primeng/editor'        ;
import { DialogModule        } from 'primeng/dialog'        ;
import { DropdownModule      } from 'primeng/dropdown'      ;

@NgModule({
  declarations: [
    TranslationEditor,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    EditorModule,
    DialogModule,
    DropdownModule,
  ],
  exports: [
    TranslationEditor,
  ]
})
export class TranslationEditorModule {}
