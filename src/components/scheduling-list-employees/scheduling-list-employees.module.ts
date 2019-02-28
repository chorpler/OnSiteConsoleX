import { NgModule                         } from '@angular/core'               ;
import { CommonModule                     } from '@angular/common'             ;
import { SchedulingListEmployeesComponent } from './scheduling-list-employees' ;
import { SharedModule                     } from 'primeng/shared'              ;
import { ButtonModule                     } from 'primeng/button'              ;
import { DialogModule                     } from 'primeng/dialog'              ;
import { CheckboxModule                   } from 'primeng/checkbox'            ;
import { InputSwitchModule                } from 'primeng/inputswitch'         ;

@NgModule({
  declarations: [
    SchedulingListEmployeesComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    InputSwitchModule,
  ],
  exports: [
    SchedulingListEmployeesComponent,
  ]
})
export class SchedulingListEmployeesComponentModule { }
