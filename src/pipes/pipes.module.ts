import { NgModule      } from '@angular/core'     ;
import { SafePipe      } from './safe'            ;
import { MapValuesPipe } from './map-values-pipe' ;

@NgModule({
  declarations: [
    SafePipe,
    MapValuesPipe,
  ],
  imports: [

  ],
  exports: [
    SafePipe,
    MapValuesPipe,
  ]
})
export class PipesModule {
  static forRoot() {
    return {
        ngModule: PipesModule,
        providers: [],
    };
  }
}
