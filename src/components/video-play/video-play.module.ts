import { NgModule           } from '@angular/core'      ;
import { VideoPlayComponent } from './video-play'       ;
import { PipesModule        } from 'pipes/pipes.module' ;
import { DialogModule       } from 'primeng/dialog'     ;

@NgModule({
  declarations: [
    VideoPlayComponent,
  ],
  imports: [
    PipesModule,
    DialogModule,
  ],
  exports: [
    VideoPlayComponent,
  ]
})
export class VideoPlayComponentModule {}
