import { NgModule             } from '@angular/core'       ;
import { DebounceDirective    } from './debounce.directive';

@NgModule({
	declarations: [
    DebounceDirective,
  ],
	exports: [
    DebounceDirective,
  ]
})
export class DirectivesModule {}
