import { Injectable, Inject, ReflectiveInjector,     } from '@angular/core'            ;
import { ComponentFactoryResolver, ViewContainerRef, } from '@angular/core'            ;
import { SpinnerComponent                            } from 'components/spinner'       ;
import { InvoicesOpenComponent                       } from 'components/invoices-open' ;
import { PreauthOpenComponent                        } from 'components/preauth-open'  ;
import { Log                                         } from 'domain/onsitexdomain'           ;

@Injectable()
export class LoaderService {
  // public spinnerObserver   : Observer<any>   ;
  // public spinnerObservable : Observable<any> ;
  public rootViewContainer : ViewContainerRef;
  public factoryResolver   :any;
  public loadedComponents  :Array<any> = [];
  public spinner           :any;
  public spinners          :Array<any> = [];

  // constructor(public factoryResolver:ComponentFactoryResolver) {
  constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
    // window['OnSiteSpinnerComponent'] = SpinnerComponent;
    // window['OnSiteSpinnerService'] = SpinnerService;
    window['onsiteloaderservice'] = this;
    this.factoryResolver = factoryResolver;
    // this.spinnerObservable = new Observable(observer => {
    //   this.spinnerObserver = observer;
    // }).share();
  }

  public setRootViewContainerRef(vcr: ViewContainerRef) {
    this.rootViewContainer = vcr;
  }

  public loadComponent(name:string) {
    let componentToLoad;
    if(name === 'preauth-open') {
      componentToLoad = PreauthOpenComponent;
    } else if(name === 'invoices-open') {
      componentToLoad = InvoicesOpenComponent;
    } else {
      Log.w(`loadComponent(): unknown component '${name}' specified.`);
      return;
    }
    const factory = this.factoryResolver.resolveComponentFactory(componentToLoad);
    const component = factory.create(this.rootViewContainer.parentInjector);
    this.rootViewContainer.insert(component.hostView);
    this.loadedComponents.push(component);
    return component;
  }

  public showSpinner(msg?:string) {
    if(this.rootViewContainer) {
      if(this.rootViewContainer.length > 0) {
        return;
      } else {
        const factory = this.factoryResolver.resolveComponentFactory(SpinnerComponent);
        const component = factory.create(this.rootViewContainer.parentInjector);
        this.rootViewContainer.insert(component.hostView);
        let spinner = component.instance;
        if(msg) {
          spinner.loadingText = msg;
        }
        this.spinner = spinner;
        this.spinners.push(spinner);
        return spinner;
      }
    } else {
      Log.w("showSpinner(): Need to call setRootViewContainerRef() first!");
      // const factory = this.factoryResolver.resolveComponentFactory(SpinnerComponent);
      // const component = factory.create(this.rootViewContainer.parentInjector);
      // this.rootViewContainer.insert(component.hostView);
    }
  }

  public hideSpinner() {
    if(this.rootViewContainer) {
      if(this.rootViewContainer.length > 0) {
        let len = this.rootViewContainer.length;
        this.rootViewContainer.remove(len-1);
        this.spinners.pop();
      } else {
        Log.w("hideSpinner(): No spinner found.");
      }
    } else {
      Log.w("hideSpinner(): Need to call setRootViewContainerRef() first!");
    }
  }

  public setText(msg:string) {
    let spinner = this.spinner;
    spinner.loadingText = msg;
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
