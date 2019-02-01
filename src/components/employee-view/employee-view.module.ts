import { NgModule                      } from '@angular/core'                   ;
import { CommonModule                  } from '@angular/common'                 ;
import { FormsModule                   } from '@angular/forms'                  ;
import { EmployeeViewComponent         } from './employee-view'                 ;
import { SharedModule                  } from 'primeng/shared'                  ;
import { DialogModule                  } from 'primeng/dialog'                  ;
import { CheckboxModule                } from 'primeng/checkbox'                ;
import { ButtonModule,                 } from 'primeng/button'                  ;
import { DropdownModule,               } from 'primeng/dropdown'                ;
import { CalendarModule                } from 'primeng/calendar'                ;
import { InputTextModule               } from 'primeng/inputtext'               ;
// import { EditorComponentModule         } from 'components/editor/editor.module' ;
import { DirectivesModule,             } from 'directives/directives.module'    ;
import { OptionsGenericComponentModule } from 'components/options-generic'      ;

@NgModule({
  declarations: [
    EmployeeViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DirectivesModule,
    // EditorComponentModule,
    DropdownModule,
    CheckboxModule,
    ButtonModule,
    DialogModule,
    CalendarModule,
    InputTextModule,
    OptionsGenericComponentModule,
  ],
  exports: [
    EmployeeViewComponent,
  ]
})
export class EmployeeViewComponentModule {}
