import { NgModule         } from '@angular/core'   ;
import { CommonModule     } from '@angular/common' ;
import { SpinnerComponent } from './spinner'       ;

@NgModule({
  declarations: [
    SpinnerComponent,
  ],
  // entryComponents: [
  //   SpinnerComponent,
  // ],
  imports: [
    CommonModule,
  ],
  exports: [
    SpinnerComponent,
  ],
})
export class SpinnerModule { }
