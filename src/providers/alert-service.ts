import { sprintf                                           } from 'sprintf-js'           ;
import { Injectable                                        } from '@angular/core'        ;
import { NavParams, LoadingController, PopoverController,  } from 'ionic-angular'        ;
import { ModalController, AlertController, ToastController } from 'ionic-angular'        ;
import { Loading, Alert, Toast, Popover                    } from 'ionic-angular'        ;
import { Log, UUID,                                        } from 'domain/onsitexdomain' ;
// import { Log, SpinnerRecord, Spinners, UUID,               } from 'domain/onsitexdomain' ;

export interface SpinnerRecord {
  id: string;
  spinner: Loading;
};
export interface AlertRecord {
  id:string;
  alert:Alert;
}
export type Spinners = Map<string,Loading>;
export type Alerts = Map<string,Alert>;

@Injectable()
export class AlertService {
  public loading        : any        ;
  public alert          : any        ;
  public popover        : any        ;
  public modal          : any        ;
  public toast          : any        ;
  public popoverData    : any        ;
  public nav            : any        ;
  // public static ALERTS  : Alert[] = [] ;
  // public static LOADINGS: Loading[] = [] ;
  // public static POPOVERS: Popover[] = [] ;
  // public static TOASTS  : Toast[] = [] ;
  // public static SPINNERS: Spinners = new Map();
  // public static SPINNERS:Spinners = [];
  // public static SPINNERS:Spinners = {};
  // public get SPINNERS():Spinners {return AlertService.SPINNERS;}    ;
  // public get spinners():Spinners {return AlertService.SPINNERS;}    ;
  // public get alerts():Alert[] {return AlertService.ALERTS;  }    ;
  // public get loadings():Loading[] {return AlertService.LOADINGS; } ;
  // public get popovers():Popover[] {return AlertService.POPOVERS; } ;
  // public get toasts():Toast[] {return AlertService.TOASTS; }     ;

  public spinners:Spinners = new Map();
  // public alerts:Alerts = new Map();
  public alerts:AlertRecord[] = [];
  public loadings:Loading[] = [];
  public popovers:Popover[] = [];
  public toasts:Toast[] = [];

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
    window['consolealertservice'] = this;
  }

  public async showSpinnerPromise(text:string):Promise<string> {
    try {
      const loading = this.loadingCtrl.create({
        content: text,
        showBackdrop: false,
      });

      let id:string = UUID.v4();
      // let id = loading.id;
      let i:number = this.spinners.size;
      Log.l(`showSpinner(): Created spinner #${i} '${id}':`, loading);
      if(!id) {
        Log.l("showSpinner(): Spinner ID 'undefined' for spinner, can't add it to Spinners Map:", loading);
      } else {
        this.spinners.set(id, loading);
      }
      Log.l("showSpinner(): Active spinner array:", this.spinners);
      try {
        let res:any = await loading.present();
        return id;
      } catch(err) {
        Log.l("showSpinner(): Error presenting spinner!", loading);
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
      // throw err;
    }
  }

  public async showSpinner(text:string):Promise<string> {
    try {
      const loading = this.loadingCtrl.create({
        content: text,
        showBackdrop: false,
      });
  
      let id:string = UUID.v4();
      let i:number = this.spinners.size;
      Log.l(`showSpinner(): Created spinner #${i} '${id}':`, loading);
      if(!id) {
        Log.l("showSpinner(): Spinner ID 'undefined' for spinner, can't add it to Spinners Map:", loading);
      } else {
        this.spinners.set(id, loading);
      }
      Log.l("showSpinner(): Active spinner array:", this.spinners);
      try {
        await loading.present();
        return id;
      } catch (error) {
        Log.l("showSpinner(): Error presenting spinner!", loading);
        Log.e(error);
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
    } catch(err) {
      Log.l(`showSpinner(): Error showing spinner`);
      Log.e(err);
      // throw err;
    }
  }

  public getSpinner(spinID?:string):Loading {
    let spinners:Spinners = this.spinners;
    let length:number = spinners.size;
    let spinner:Loading;
    if(!length) {
      Log.l("getSpinner(): No spinners found!");
      return spinner;
    }
    let id:string;
    if(spinID != undefined) {
      id = spinID;
      spinner = spinners.get(id);
    } else {
      let list:[string, Loading][] = Array.from(spinners);
      let entry:[string, Loading] = list.pop();
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

  public async hideSpinner(spinID?:string):Promise<boolean> {
    let id:string = spinID && typeof spinID === 'string' ? spinID : "(no id provided)";
    try {
      let spinner:Loading = this.getSpinner(spinID);
      let spinners:Spinners = this.spinners;
      if(spinner) {
        Log.l(`hideSpinner(): Hiding spinner '${id}':`, spinner);
          await spinner.dismiss();
          spinners.delete(id);
          return true;
      } else {
        Log.l(`hideSpinner(): Could not find spinner '${id}' to hide! Spinners array is:`, spinners);
        return false;
      }
    } catch(err) {
      Log.l(`hideSpinner(): Error dismissing spinner '${id}'!`);
      Log.l(err);
      return false;
  // throw err;
    }
  }

  public hideSpinnerPromise(spinID?:string):Promise<any> {
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
        // reject(msg);
        resolve(false);
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

  public showAlert(title: string, text: string):Promise<string> {
    return new Promise(async (resolve, reject) => {
      let id:string = UUID();
      let alert:Alert = this.alertCtrl.create({
        title: title,
        message: text,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              Log.l(`OK clicked for alert ${id}:`, alert);
              resolve(id);
            }
          }
        ],
      });
      this.alert = alert;
      let record:AlertRecord = {
        id: id,
        alert: alert,
      };
      this.alerts.push(record);
      await alert.present();
      return id;
    });
  }

  public showAlertPromise(title:string, text:string):Promise<string> {
    return new Promise(async (resolve,reject) => {
      let id:string = UUID.v4();
      let alert:Alert = this.alertCtrl.create({
        title: title,
        message: text,
        enableBackdropDismiss: false,
        buttons: [
          {
            text: "OK", handler: () => {
              // let thisAlert:Alert;
              // let i:number = 0;
              let i:number = this.alerts.findIndex((a:AlertRecord) => {
                return a.id === id;
              });
              if(i > -1) {
                let record:AlertRecord = this.alerts.splice(i, 1)[0];
                let thisAlert:Alert = record.alert;
                Log.l(`OK clicked from alert ${id}:`, thisAlert);
                window['onsitealertdismissed'] = thisAlert;
              }
              resolve(id);
            }
          }
        ]
      });
      // let oneAlert:AlertRecord = {id:uuid, alert: alert};
      // this.alerts.set(id, oneAlert);
      // this.alert = alert;
      // alert.present();
      let record:AlertRecord = {
        id: id,
        alert: alert,
      };
      this.alerts.push(record);
      await alert.present();
      return id;
    });
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
