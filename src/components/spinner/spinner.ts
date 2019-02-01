// import { SpinnerService                                                           } from './spinner.service' ;
import { Component, OnInit, OnDestroy, Input, AfterViewInit, } from '@angular/core'                 ;
import { ViewEncapsulation, ViewContainerRef                 } from '@angular/core'                 ;
import { Subscription                                        } from 'rxjs'             ;
import { Log                                                 } from 'domain/onsitexdomain' ;

/**
 * Component
 * @export
 * @class SpinnerComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'spinner',
  templateUrl: 'spinner.html'
  // template: `
  // <div class="spinner-wrapper">
  //   <div class="spinner-container" [class.nonopaque]="isTransparent">
  //     <div class="spinner-image"></div>
  //     <div class="spinner-text">{{loadingText}}</div>
  //   </div>
  // </div>
  // `
  // ,
  // encapsulation: ViewEncapsulation.Native  // Use the native Shadow DOM to encapsulate our CSS
})
// templateUrl: 'spinner.html',
export class SpinnerComponent implements OnInit,OnDestroy,AfterViewInit {
  public isTransparent:boolean = true;
  // private _template:string = `
  // <div class="spinner-wrapper">
  //   <div class="spinner-container" [class.nonopaque]="isTransparent">
  //     <div class="spinner-image"></div>
  //     <div class="spinner-text">{{loadingText}}</div>
  //   </div>
  // </div>
  // `;
//   private _template:string = `
// <div class="loading-container">
//   <div class="spinner"></div>
//   <div class="spinner-center"></div>
//   <div class="loading-text">{{loadingText}}</div>
// </div>
//   `;
  private _loadingText:string = '';


  /**
   *
   * @type {Number}
   * @memberof SpinnerComponent
   */
  private _threshold: Number = 500;



  // /**
  //  * @memberof SpinnerComponent
  //  */
  // @Input('template')
  // public set template(value:string) {
  //   this._template = value;
  // }


  // /**
  //  * @readonly
  //  * @type {String}
  //  * @memberof SpinnerComponent
  //  */
  // public get template():string {
  //   return this._template;
  // }

  /**
   *
   * @memberof SpinnerComponent
   */
  @Input()
  public set loadingText(value:string) {
    this._loadingText = value;
  }


  /**
   *
   * @readonly
   * @type {String}
   * @memberof SpinnerComponent
   */
  public get loadingText():string {
    return this._loadingText;
  }


  /**
   *
   * @memberof SpinnerComponent
   */
  @Input()
  public set threshold(value: Number) {
    this._threshold = value;
  }

  /**
   *
   * @readonly
   * @type {Number}
   * @memberof SpinnerComponent
   */
  public get threshold(): Number {
    return this._threshold;
  }

  /**
   * Subscription
   * @type {Subscription}
   * @memberof SpinnerComponent
   */
  public subscription: Subscription;
  /**
   * Enable/Disable spinner
   * @memberof SpinnerComponent
   */
  public showSpinner:boolean = false;

  /**
   * Constructor
   * @param {SpinnerService} spinnerService Spinner Service
   * @memberof SpinnerComponent
   */
  // constructor(private spinnerService: SpinnerService) {
  constructor() {
    window['onsiteconsolespinnercomponent'] = this;
  }

  /**
   * Init function
   * @memberof SpinnerComponent
   */
  ngOnInit() {
    Log.l("SpinnerComponent: ngOnInit() fired");
    // this.createServiceSubscription();
  }
  /**
   * Destroy function
   * @memberof SpinnerComponent
   */
  ngOnDestroy() {
    Log.l("SpinnerComponent: ngOnDestroy() fired");
    if(this.subscription && this.subscription.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    Log.l("SpinnerComponent: ngAfterViewInit() fired");
  }


  /**
  //  * Create service subscription
  //  * @memberof SpinnerComponent
  //  */
  // public createServiceSubscription() {
  //   let timer: any;

  //   this.subscription = this.spinnerService.spinnerObservable.subscribe(show => {
  //     if (show) {
  //       if(timer) { return; }

  //       timer = setTimeout(() => {
  //         timer = null;
  //         this.showSpinner = show;
  //       }, this._threshold);
  //     } else {
  //       if(timer) {
  //         clearTimeout(timer);
  //         timer = null;
  //       }
  //       this.showSpinner = false;
  //     }
  //   });
  // }
}
