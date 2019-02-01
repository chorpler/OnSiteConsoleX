import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerClockComponent } from './spinner-clock';

@NgModule({
  declarations: [
    SpinnerClockComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    SpinnerClockComponent,
  ]
})
export class SpinnerClockComponentModule { }
