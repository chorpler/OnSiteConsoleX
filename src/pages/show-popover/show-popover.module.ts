import { NgModule        } from '@angular/core'  ;
import { IonicPageModule } from 'ionic-angular'  ;
import { ShowPopoverPage } from './show-popover' ;
import { PipesModule     } from 'pipes'          ;

@NgModule({
  declarations: [
    ShowPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(ShowPopoverPage),
    PipesModule,
  ],
  exports: [
    ShowPopoverPage
  ]
})
export class ShowPopoverPageModule {}
