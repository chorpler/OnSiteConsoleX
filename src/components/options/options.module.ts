import { NgModule         } from '@angular/core'    ;
import { IonicPageModule  } from 'ionic-angular'    ;
import { OptionsComponent } from './options'        ;
import { SharedModule     } from 'primeng/primeng'  ;
import { DialogModule     } from 'primeng/dialog'   ;
import { CheckboxModule   } from 'primeng/checkbox' ;
import { ButtonModule,    } from 'primeng/button'   ;
import { DropdownModule   } from 'primeng/dropdown' ;
import { TabViewModule    } from 'primeng/tabview'  ;

@NgModule({
  declarations: [
    OptionsComponent,
  ],
  imports: [
    IonicPageModule.forChild(OptionsComponent),
    SharedModule,
    DialogModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
    TabViewModule,
  ],
  exports: [
    OptionsComponent,
  ]
})
export class OptionsComponentModule { }
