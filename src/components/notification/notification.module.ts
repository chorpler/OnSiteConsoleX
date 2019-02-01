import { NgModule, ModuleWithProviders } from '@angular/core'                  ;
import { CommonModule                  } from '@angular/common'                ;
import { NotificationComponent         } from './notification'                 ;

@NgModule({
  declarations: [
    NotificationComponent,
  ],
  entryComponents: [
    NotificationComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    NotificationComponent,
  ],
})
export class NotificationComponentModule {}
