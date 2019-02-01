// import { Injectable, ComponentFactoryResolver, ReflectiveInjector, ViewContainerRef } from '@angular/core'                 ;
// import 'rxjs/add/operator/share';
// import { Observable                                  } from 'rxjs'               ;
// import { Observer                                    } from 'rxjs'                 ;
import { Injectable, Inject, ReflectiveInjector,     } from '@angular/core'                 ;
import { ComponentFactoryResolver, ViewContainerRef, } from '@angular/core'                 ;
import { SpinnerComponent                            } from '../components/spinner/spinner' ;
import { Log                                         } from 'domain/onsitexdomain'    ;

@Injectable()
export class SpinnerService {
  // public spinnerObserver   : Observer<any>   ;
  // public spinnerObservable : Observable<any> ;
  public static rootViewContainer: ViewContainerRef;
  public get rootViewContainer():ViewContainerRef { return SpinnerService.rootViewContainer; };
  public set rootViewContainer(val:ViewContainerRef) { SpinnerService.rootViewContainer = val; };

  public static visible:boolean = false;
  public get visible():boolean { return SpinnerService.visible; };
  public set visible(val:boolean) { SpinnerService.visible = val; };

  public message:string = "";

  public factoryResolver   :any;
  public spinner           :any;
  public spinners          :Array<any> = [];

  // constructor(public factoryResolver:ComponentFactoryResolver) {
  constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
    window['OnSiteSpinnerComponent'] = SpinnerComponent;
    window['OnSiteSpinnerService'] = SpinnerService;
    window['onsitespinnerservice'] = this;
    this.factoryResolver = factoryResolver;
    // this.spinnerObservable = new Observable(observer => {
    //   this.spinnerObserver = observer;
    // }).share();
  }

  public setRootViewContainerRef(vcr: ViewContainerRef) {
    this.rootViewContainer = vcr;
  }

  public showSpinner(msg?:string) {
    this.visible = true;
    this.message = msg;

    // if(this.rootViewContainer) {
    //   if(this.rootViewContainer.length > 0) {
    //     return;
    //   } else {
    //     const factory = this.factoryResolver.resolveComponentFactory(SpinnerComponent);
    //     const component = factory.create(this.rootViewContainer.parentInjector);
    //     this.rootViewContainer.insert(component.hostView);
    //     window['SpinnerServiceFactory'] = factory;
    //     window['SpinnerServiceComponent'] = component;
    //     window['SpinnerRootViewContainer'] = this.rootViewContainer;
    //     let spinner = component.instance;
    //     if(msg) {
    //       spinner.loadingText = msg;
    //     }
    //     this.spinner = spinner;
    //     this.spinners.push(spinner);
    //     setTimeout(() => {
    //       spinner.isTransparent = false;
    //     }, 400);
    //     return spinner;
    //   }
    // } else {
    //   Log.w("showSpinner(): Need to call setRootViewContainerRef() first!");
    // }
  }

  public hideSpinner() {
    this.visible = false;
    // if(this.rootViewContainer) {
    //   if(this.rootViewContainer.length > 0) {
    //     let len = this.rootViewContainer.length;
    //     let spinner = this.spinner;
    //     spinner.isTransparent = true;
    //     setTimeout(() => {
    //       this.spinners.pop();
    //       this.rootViewContainer.remove(len-1);
    //     }, 400);
    //   } else {
    //     Log.w("hideSpinner(): No spinner found.");
    //   }
    // } else {
    //   Log.w("hideSpinner(): Need to call setRootViewContainerRef() first!");
    // }
  }

  public getText() {
    // let spinner = this.spinner;
    // return spinner.loadingText;
    return this.message;
  }

  public setText(msg:string) {
    // let spinner = this.spinner;
    // spinner.loadingText = msg;
    // return spinner;
    this.message = msg;
    return this.message;
  }

  public addText(msg:string) {
    let spinner = this.spinner;
    spinner.loadingText += msg;
    return spinner;
  }

  // public show() {
  //   if (this.spinnerObserver) {
  //     this.spinnerObserver.next(true);
  //   }
  // }

  // public hide() {
  //   if (this.spinnerObserver) {
  //     this.spinnerObserver.next(false);
  //   }
  // }

}
