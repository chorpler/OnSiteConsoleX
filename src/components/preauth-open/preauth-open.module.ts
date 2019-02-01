import { NgModule                     } from '@angular/core'   ;
import { CommonModule                 } from '@angular/common' ;
import { FormsModule                  } from '@angular/forms'  ;
import { PreauthOpenComponent         } from './preauth-open'  ;
import { ListboxModule, DialogModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    PreauthOpenComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ListboxModule,
    DialogModule,
  ],
  exports: [
    PreauthOpenComponent
  ]
})
export class PreauthOpenComponentModule {}
