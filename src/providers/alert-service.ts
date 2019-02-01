import { sprintf                                           } from 'sprintf-js'           ;
import { Injectable                                        } from '@angular/core'        ;
import { NavParams, LoadingController, PopoverController,  } from 'ionic-angular'        ;
import { ModalController, AlertController, ToastController } from 'ionic-angular'        ;
import { Log, SpinnerRecord, Spinners, UUID,               } from 'domain/onsitexdomain' ;

export type SpinnerRecord = {id: string, spinner: any};
export type Spinners = Map<string,any>;

@Injectable()
export class AlertService {
  public loading        : any        ;
  public alert          : any        ;
  public popover        : any        ;
  public modal          : any        ;
  public toast          : any        ;
  public popoverData    : any        ;
  public nav            : any        ;
  public static ALERTS  : Array<any> = [] ;
  public static LOADINGS: Array<any> = [] ;
  public static POPOVERS: Array<any> = [] ;
  public static TOASTS  : Array<any> = [] ;
  public static SPINNERS:Spinners = new Map();
  // public static SPINNERS:Spinners = [];
  // public static SPINNERS:Spinners = {};
  public get SPINNERS():Spinners {return AlertService.SPINNERS;}    ;
  public get spinners():Spinners {return AlertService.SPINNERS;}    ;
  public get alerts():Array<any> {return AlertService.ALERTS;  }    ;
  public get loadings():Array<any> {return AlertService.LOADINGS; } ;
  public get popovers():Array<any> {return AlertService.POPOVERS; } ;
  public get toasts():Array<any> {return AlertService.TOASTS; }     ;

  constructor(
    public loadingCtrl : LoadingController ,
    public alertCtrl   : AlertController   ,
    public popoverCtrl : PopoverController ,
    public modalCtrl   : ModalController   ,
    public toastCtrl   : ToastController   ,
  ) {
    Log.l('Hello AlertService Provider');
    // this.alerts = AlertService.ALERTS;
    // this.loadings = AlertService.LOADINGS;
    // this.popovers = AlertService.POPOVERS;
    // this.toasts = AlertService.TOASTS;
    window['consolealerts'] = this;
    window['AlertService'] = AlertService;
    window['alertservice'] = this;
    window['UUID'] = UUID;
  }

  public async showSpinnerPromise(text:string):Promise<string> {
    try {
      const loading = this.loadingCtrl.create({
        content: text,
        showBackdrop: false,
      });

      let id = UUID();
      // let id = loading.id;
      let i = this.spinners.size;
      Log.l(`showSpinner(): Created spinner #${i} '${id}':\n`, loading);
      if(!id) {
        Log.l("showSpinner(): Spinner ID 'undefined' for spinner, can't add it to Spinners Map:\n", loading);
      } else {
        this.spinners.set(id, loading);
      }
      Log.l("showSpinner(): Active spinner array:\n", this.spinners);
      try {
        let res:any = await loading.present();
        return id;
      } catch(err) {
        Log.l("showSpinner(): Error presenting spinner!\n", loading);
        Log.e(err);
      }

      // this.loadings.push(loading);
      // let spinner:SpinnerRecord = {id: id, spinner: loading};
      // return
      // }, 50);
      // }).catch((err) => {
      //   Log.l("showSpinner(): Error presenting spinner!\n", loading); Log.e(err);
      // });
      // this.spinners[id] = loading;
      // return loading;
      // return loading;
      // return id;
      // return res;
    } catch(err) {
      Log.l(`showSpinnerPromise(): Error presenting spinner!`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public showSpinner(text: string) {
    const loading = this.loadingCtrl.create({
      content: text,
      showBackdrop: false,
    });

    let id = UUID();
    // let id = loading.id;
    let i = this.spinners.size;
    Log.l(`showSpinner(): Created spinner #${i} '${id}':`, loading);
    if(!id) {
      Log.l("showSpinner(): Spinner ID 'undefined' for spinner, can't add it to Spinners Map:\n", loading);
    } else {
      this.spinners.set(id, loading);
    }
    Log.l("showSpinner(): Active spinner array:", this.spinners);
    loading.present()
    // ;
    .catch((err) => {
      Log.l("showSpinner(): Error presenting spinner!", loading);
      Log.e(err);
    });

    // this.loadings.push(loading);
    // let spinner:SpinnerRecord = {id: id, spinner: loading};
    // return
    // }, 50);
    // }).catch((err) => {
    //   Log.l("showSpinner(): Error presenting spinner!\n", loading); Log.e(err);
    // });
    // this.spinners[id] = loading;
    // return loading;
    // return loading;
    return id;
  }

  public getSpinner(spinID?:string) {
    let spinners = this.spinners;
    let length = spinners.size;
    let spinner = undefined;
    if(!length) {
      Log.l("getSpinner(): No spinners found!");
      return spinner;
    }
    let id;
    if(spinID !== undefined) {
      id = spinID;
      spinner = spinners.get(id);
    } else {
      let list = Array.from(spinners);
      let entry = list.pop();
      id = entry[0];
      spinner = spinners.get(id);
      Log.l(`getSpinner(): Called with no ID, returning last added spinner...`);
    }
    return spinner;
    // setTimeout(() => {
    //   let load = this.loadings.pop();
    //   if(load) {
    //     load.dismiss().catch((reason: any) => {
    //       Log.l("hideSpinner(): loading.dismiss() error!");
    //       for (let i in this.loadings) {
    //         this.loadings.pop().dismiss();
    //         // oneload.dismissAll();
    //       }
    //     });
    //   } else {
    //     Log.l("hideSpinner(): no spinners found!");
    //   }
    // });
  }

  public hideSpinner(spinID?:string) {
    let id = spinID ? spinID : "(no id provided)";
    let spinner = this.getSpinner(spinID);
    let spinners = this.spinners;
    if(spinner) {
      // id = spinner.id;
      Log.l(`hideSpinner(): Hiding spinner '${id}':`, spinner);
      spinner.dismiss().catch(err => {Log.l(`hideSpinner(): Error dismissing spinner '${id}'!`); Log.l(err); });
      spinners.delete(id);
    } else {
      Log.l(`hideSpinner(): Could not find spinner '${id}' to hide! Spinners array is:\n`, spinners);
    }
  }

  public hideSpinnerPromise(spinID?:string) {
    return new Promise((resolve,reject) => {
      let id = spinID ? spinID : "(no id provided)";
      let spinner = this.getSpinner(spinID);
      let spinners = this.spinners;
      if(spinner) {
        // id = spinner.id;
        Log.l(`hideSpinnerPromise(): Hiding spinner '${id}':`, spinner);
        spinner.dismiss().then(res => {
          spinners.delete(id);
          resolve(res);
        }).catch(err => {
          Log.l(`hideSpinnerPromise(): Error dismissing spinner '${id}'!`);
          Log.e(err);
          reject(err);
        });
      } else {
        Log.l(`hideSpinnerPromise(): Could not find spinner '${id}' to hide!`);
        let msg = {status: 101, message: `Spinner '${id}' not found to be dismissed.`};
        reject(msg);
      }
      // let load = this.loadings.pop();
      // load.dismiss().then(res => {
      //   resolve(res);
      // }).catch((reason: any) => {
      //   Log.l('AlertService: loading.dismiss() error:\n', reason);
      //   let count = this.loadings.length;
      //   // for (let i in this.loadings) {
      //   for(let i = 0; i < count; i++) {
      //     this.loadings.pop().dismiss();
      //     // oneload.dismissAll();
      //   }
      //   reject(new Error("Error trying to dismiss spinners."));
      // });
    });
  }

  public clearSpinners() {
    let spinners = this.spinners;
    Log.l("clearSpinners(): called, spinner array is:\n", spinners);
    for(let entry of spinners) {
      let id = entry[0];
      let spinner = entry[1];
      spinner.dismiss().then(res => {
        spinners.delete(id);
      }).catch(err => {
        Log.l(`clearSpinners(): Error dismissing spinner '${id}':\n`, spinner);
        Log.e(err);
        spinners.delete(id);
      });
    }
    // setTimeout(() => {
    //   for (let i in this.loadings) {
    //     let tmpLoad = this.loadings.pop();
    //     Log.l("clearSpinners(): Now clearing spinner:\n", tmpLoad);
    //     tmpLoad.dismiss().catch(err => {
    //       Log.l('clearSpinners(): loading.dismiss() error for loader:\n', tmpLoad);
    //       Log.e(err);
    //     });
    //   }
    // });
  }

  public showAlert(title: string, text: string) {
    return new Promise((resolve, reject) => {
      this.alert = this.alertCtrl.create({
        title: title,
        message: text,
        buttons: [
          { text: 'OK', handler: () => { Log.l("OK clicked."); resolve(true); } }
        ]
      });
      this.alert.present();
    });
  }

  public async showAlertPromise(title: string, text: string):Promise<any> {
    try {
      return new Promise((resolve,reject) => {
        let uuid = UUID.v4();
        let alert = this.alertCtrl.create({
          title: title,
          message: text,
          enableBackdropDismiss: false,
          buttons: [
            {
              text: "OK", handler: () => {
                let thisAlert;
                let i:number = 0;
                for(let alert of this.alerts) {
                  if(alert.id === uuid) {
                    thisAlert = alert.alert;
                    break;
                  }
                  i++;
                }
                let alert = this.alerts.splice(i, 1)[0];
                Log.l("OK clicked from:\n", alert);
                window['onsitealertdismissed'] = alert;
                resolve(true);
              }
            }
          ]
        });
        let oneAlert = {alert: alert, id: uuid};
        this.alerts.push(oneAlert);
        this.alert = alert;
        alert.present();
      });
    } catch(err) {
      Log.l(`showAlertPromise(): Error showing alert`);
      Log.e(err);
      throw err;
    }
  }

  /**
   * Shows an error alert
   *
   * @param {string} title - Title of the alert dialog
   * @param {string} text - Text to be displayed before error message
   * @param {(Error|string)} [err] - An Error object (with included .message member that is a string) or just an error string
   * @param {Event} [evt] - Event prompting this (usually a mouse click, and usually undefined)
   * @returns {Promise<any>} - The Promise returned after the OK button is clicked
   * @memberof AlertService
   */
  public async showErrorMessage(title:string, text:string, err:Error|string, evt?:Event):Promise<any> {
    try {
      Log.l(`showErrorMessage(): Called with error:\n`, err);
      let errText:string = typeof err === 'object' && typeof err.message === 'string' ? err.message : typeof err === 'string' ? err : "Unknown error (code -42)";
      let errMessage:string;
      if(errText) {
        errMessage = sprintf("%s:<br/>\n<br/>\n%s", text, errText);
      } else {
        errMessage = text + "";
      }
      let res:any = await this.showAlert(title, errMessage);
      return res;
    } catch(err) {
      Log.l(`showErrorMessage(): Error showing error message`);
      Log.e(err);
      throw err;
    }
  }

  public showConfirm(title: string, text: string, css?:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let options = {
        title: title,
        message: text,
        buttons: [
          { text: 'Cancel', handler: () => { Log.l("Cancel clicked."); resolve(false); } },
          { text: 'OK', handler: () => { Log.l("OK clicked."); resolve(true); } }
        ],
        enableBackdropDismiss: false,
      };
      if(css) {
        options['cssClass'] = css;
      }
      this.alert = this.alertCtrl.create(options);
      this.alert.present();
    });
  }

  public showConfirmYesNo(title: string, text: string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.alert = this.alertCtrl.create({
        title: title,
        message: text,
        buttons: [
          { text: 'No', handler: () => { Log.l("Cancel clicked."); resolve(false); } },
          { text: 'Yes', handler: () => { Log.l("OK clicked."); resolve(true); } }
        ],
        enableBackdropDismiss: false,
      });
      this.alert.present();
    });
  }

  public showCustomConfirm(title: string, text: string, buttons: any, css?:string) {
    return new Promise((resolve, reject) => {
      let customButtons = [];
      for(let button of buttons) {
        let newButton = {text: button.text, handler: null};
        newButton.handler = () => {Log.l("User chose option '%s'", button.text); resolve(button.resolve);};
        customButtons.push(newButton);
      }
      let options = {
        title: title,
        message: text,
        buttons: customButtons
      };
      if(css) {
        options['cssClass'] = css;
      }
      this.alert = this.alertCtrl.create(options);
      this.alert.present();
    });
  }

  public showPrompt(title: string, text: string, inputPlaceholder?:string) {
    return new Promise((resolve, reject) => {
      let placeholder = inputPlaceholder || "";
      this.alert = this.alertCtrl.create({
        title: title,
        message: text,
        inputs: [
          {name: 'input', placeholder: placeholder},
        ],
        buttons: [
          { text: 'Cancel', handler: (data) => { Log.l("Cancel clicked."); resolve(null); } },
          { text: 'OK', handler: (data) => { Log.l("OK clicked."); resolve(data); } }
        ]
      });
      this.alert.present();
    });
  }

  public showPopover(contents: any, data: any, event?: any) {
    let _event = null;
    let params = { cssClass: 'popover-template', showBackdrop: true, enableBackdropDismiss: true };
    if (event) {
      _event = event;
      params['ev'] = _event;
    }
    this.popoverData = {};
    this.popoverData = data || {};
    this.popoverData.contents = contents;

    Log.l("AlertService.showPopover(): About to create popover with popoverData and params:\n", this.popoverData);
    Log.l(params);

    this.popover = this.popoverCtrl.create('Popover', this.popoverData, params);
    this.popover.onDidDismiss(data => {
      Log.l("showPopover(): Popover dismissed with data:\n", data);
    });

    this.popovers.push(this.popover);
    this.popover.present().catch((err) => { Log.l("Popover present errorr!"); Log.e(err);});
    // let nav = this.app.getActiveNav();

  }

  public showPopoverWithData(contents: any, data: any, options:any, event?: any) {
    return new Promise((resolve,reject) => {
      let _event = null;
      let params = options || { cssClass: 'popover-template', showBackdrop: true, enableBackdropDismiss: true };
      if (event) {
        params['ev'] = event;
      }
      // this.popoverData = {};
      this.popoverData = data || {};
      this.popoverData.contents = contents;

      Log.l("AlertService.showPopover(): About to create popover with popoverData and params:\n", this.popoverData);
      Log.l(params);

      this.popover = this.popoverCtrl.create(contents, this.popoverData, params);
      this.popover.onDidDismiss(data => {
        Log.l("showPopover(): Popover dismissed with data:\n", data);
        resolve(data);
      });

      this.popovers.push(this.popover);
      this.popover.present().catch(() => { });
      // let nav = this.app.getActiveNav();
    });
  }

  public hidePopover() {
    setTimeout(() => {
      let popover = this.popovers.pop();
      popover.dismiss().catch((reason: any) => {
        Log.l('AlertService: popover.dismiss() error:\n', reason);
        for (let i in this.popovers) {
          this.loadings.pop().dismiss();
        }
      });
    });
  }

  public showToast(msg: string, ms?: number) {
    let duration = 3000;
    if (ms) {
      duration = ms;
    }
    this.toast = this.toast.create({
      message: msg,
      duration: duration
    });
    this.toasts.push(this.toast);
    this.toast.present();
  }

  public hideToast() {
    let toast = this.toasts.pop();
    toast.dismiss().catch((reason: any) => {
      Log.l("AlertService: toast.dismiss() error:\n", reason);
      for (let i in this.toasts) {
        this.toasts.pop().dismiss();
      }
    })
  }

}
