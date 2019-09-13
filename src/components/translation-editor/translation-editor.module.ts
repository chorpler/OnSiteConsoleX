import { NgModule            } from '@angular/core'         ;
import { CommonModule        } from '@angular/common'       ;
import { FormsModule         } from '@angular/forms'        ;
import { TranslationEditor   } from './translation-editor'  ;
import { SharedModule        } from 'primeng/shared'        ;
import { ButtonModule        } from 'primeng/button'        ;
import { InputTextModule     } from 'primeng/inputtext'     ;
import { InputTextareaModule } from 'primeng/inputtextarea' ;
import { InputSwitchModule   } from 'primeng/inputswitch' ;
import { EditorModule        } from 'primeng/editor'        ;
import { DialogModule        } from 'primeng/dialog'        ;

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
  ],
  exports: [
    TranslationEditor,
  ]
})
export class TranslationEditorModule {}
