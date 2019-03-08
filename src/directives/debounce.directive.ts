import { Subject              } from 'rxjs'                 ;
import { Observable           } from 'rxjs'                 ;
import { Subscription         } from 'rxjs'                 ;
// import { fromEvent            } from 'rxjs'                 ;
// import { map                  } from 'rxjs/operators'       ;
import { debounceTime         } from 'rxjs/operators'       ;
import { distinctUntilChanged } from 'rxjs/operators'       ;
import { EventEmitter         } from '@angular/core'        ;
import { ElementRef           } from '@angular/core'        ;
import { OnInit               } from '@angular/core'        ;
import { OnDestroy            } from '@angular/core'        ;
import { OnChanges            } from '@angular/core'        ;
import { SimpleChanges        } from '@angular/core'        ;
import { Directive            } from '@angular/core'        ;
import { Input                } from '@angular/core'        ;
import { Output               } from '@angular/core'        ;
import { NgModel              } from '@angular/forms'       ;
import { Log                  } from 'domain/onsitexdomain' ;

declare const window:any;

@Directive({ selector: '[debounce]' })
// export class DebounceDirective implements OnInit,OnDestroy,OnChanges {
export class DebounceDirective implements OnInit,OnDestroy {
  @Input('delay') delay:number = 700;
  @Output('func') func:EventEmitter<any> = new EventEmitter();
  // private eventStream:Observable<any>;
  private eventSubscription:Subscription;
  // private modelChanged:Subject<string> = new Subject<string>();
  constructor(
    private elementRef : ElementRef ,
    private model      : NgModel    ,
  ) {
    // Log.l(`DebounceDirective: Constructed for:`, this);
    // window.onsitedebounces = window.onsitedebounces || [];
    // window.onsitedebounces.push(this);
  }

  ngOnInit(): void {
    // const eventStream = fromEvent(this.elementRef.nativeElement, 'keyup').pipe(
    //   map(() => this.model.value),
    //   debounceTime(this.delay)
    // );

    // this.eventStream = eventStream;

    // this.eventSubscription = eventStream.subscribe(input => {
    //   Log.l("DebounceDirective: inputStream event fired, input is: ", input);
    //   this.func.emit(input)
    // });
    // this.model.ngOnChanges(changes)
    this.eventSubscription = this.model.valueChanges.pipe(debounceTime(this.delay), distinctUntilChanged()).subscribe((input) => {
      let el:HTMLInputElement|HTMLTextAreaElement = this.elementRef.nativeElement;
      let activeEl:Element = document.activeElement;
      if(el === activeEl) {
        // Log.l("DebounceDirective: ModelChanged event fired, input is: ", input);
        this.func.emit(input);
      } else {
        // Log.l("DebounceDirective: ModelChanged fired while input not active. Not firing.");
      }
    });
    // this.eventSubscription = this.modelChanged.pipe(debounceTime(this.delay), distinctUntilChanged()).subscribe((input) => {
    //   Log.l("DebounceDirective: ModelChanged event fired, input is: ", input);
    //   this.func.emit(input);
    // });
  }

  // ngOnChanges(changes:SimpleChanges) {
  //   Log.l("DebounceDirective: ngOnChanges fired:", changes);
  //   // let value:string = changes.currentValue;
  //   // this.modelChanged.next()
  // }

  ngOnDestroy() {
    // Log.l("DebounceDirective: ngOnDestroy() fired.");
    if(this.eventSubscription && !this.eventSubscription.closed) {
      // this.eventStream.unsubscribe();
      this.eventSubscription.unsubscribe();
    }
    // window.onsitedebounces = window.onsitedebounces || [];
    // window.onsitedebounces = window.onsitedebounces.filter(a => a !== this);
  }

}
