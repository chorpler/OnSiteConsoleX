import { fromEvent                                                             } from 'rxjs'                 ;
import { map, debounceTime,                                                    } from 'rxjs/operators'       ;
import { Observable                                                            } from 'rxjs'                 ;
import { EventEmitter, ElementRef, OnInit, OnDestroy, Directive, Input, Output } from '@angular/core'        ;
import { NgModel                                                               } from '@angular/forms'       ;
import { Log                                                                   } from 'domain/onsitexdomain' ;

@Directive({ selector: '[debounce]' })
export class DebounceDirective implements OnInit {
  @Input('delay') delay: number = 700;
  @Output('func') func: EventEmitter<any> = new EventEmitter();
  private eventStream:any;
  constructor(private elementRef: ElementRef, private model: NgModel) {
  }

  ngOnInit(): void {
    const eventStream = fromEvent(this.elementRef.nativeElement, 'keyup')
    .pipe(
      map(() => this.model.value),
      debounceTime(this.delay)
    );

    this.eventStream = eventStream;

    eventStream.subscribe(input => {
      Log.l("DebounceDirective: inputStream event fired, input is:\n", input);
      this.func.emit(input)
    });
  }

  ngOnDestroy() {
    Log.l("DebounceDirective: ngOnDestroy() fired.");
    if(this.eventStream && this.eventStream.unsubscribe) {
      this.eventStream.unsubscribe();
    }
  }

}
