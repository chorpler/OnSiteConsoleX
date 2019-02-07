// import { Subject      } from 'rxjs'                 ;
import { Observable   } from 'rxjs'                 ;
import { Subscription } from 'rxjs'                 ;
import { fromEvent    } from 'rxjs'                 ;
import { map          } from 'rxjs/operators'       ;
import { debounceTime } from 'rxjs/operators'       ;
import { EventEmitter } from '@angular/core'        ;
import { ElementRef   } from '@angular/core'        ;
import { OnInit       } from '@angular/core'        ;
import { OnDestroy    } from '@angular/core'        ;
import { Directive    } from '@angular/core'        ;
import { Input        } from '@angular/core'        ;
import { Output       } from '@angular/core'        ;
import { NgModel      } from '@angular/forms'       ;
import { Log          } from 'domain/onsitexdomain' ;

@Directive({ selector: '[debounce]' })
export class DebounceDirective implements OnInit,OnDestroy {
  @Input('delay') delay: number = 700;
  @Output('func') func: EventEmitter<any> = new EventEmitter();
  private eventStream:Observable<any>;
  private eventSubscription:Subscription;
  constructor(
    private elementRef : ElementRef ,
    private model      : NgModel    ,
  ) { }

  ngOnInit(): void {
    const eventStream = fromEvent(this.elementRef.nativeElement, 'keyup').pipe(
      map(() => this.model.value),
      debounceTime(this.delay)
    );

    this.eventStream = eventStream;

    this.eventSubscription = eventStream.subscribe(input => {
      Log.l("DebounceDirective: inputStream event fired, input is: ", input);
      this.func.emit(input)
    });
  }

  ngOnDestroy() {
    Log.l("DebounceDirective: ngOnDestroy() fired.");
    if(this.eventSubscription && !this.eventSubscription.closed) {
      // this.eventStream.unsubscribe();
      this.eventSubscription.unsubscribe();
    }
  }

}
