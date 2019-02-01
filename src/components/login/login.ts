import { Subscription                                                               } from 'rxjs'                                 ;
import { sprintf                                                                    } from 'sprintf-js'                           ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input, Output } from '@angular/core'                        ;
import { EventEmitter, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef   } from '@angular/core'                        ;
import { HttpClient                                                                 } from '@angular/common/http'                 ;
import { FormGroup, FormControl, Validators                                         } from "@angular/forms"                       ;
import { ServerService                                                              } from 'providers/server-service'             ;
import { DBService                                                                  } from 'providers/db-service'                 ;
import { AuthService                                                                } from 'providers/auth-service'               ;
import { AlertService                                                               } from 'providers/alert-service'              ;
import { Log, Moment, moment, oo, _matchCLL, _matchSite, Decimal, dec               } from 'domain/onsitexdomain'                 ;
import { OSData                                                                     } from 'providers/data-service'               ;
import { DispatchService                                                            } from 'providers/dispatch-service'           ;
import { SelectItem, MenuItem,                                                      } from 'primeng/api'                          ;
import { NotifyService                                                              } from 'providers/notify-service'             ;
import { NotificationComponent                                                      } from 'components/notification/notification' ;
import * as tar from 'tar';

@Component({
  selector: 'login',
  templateUrl: 'login.html',
})
export class LoginComponent implements OnInit,OnDestroy {
  @Output('loginAttempt') loginAttempt = new EventEmitter<any>();
  public title              : string  = 'Login'              ;
  public username          : string  = ""                   ;
  public password          : string  = ""                   ;
  public loginError         : boolean = false                ;
  public errorBlankUsername : boolean = false                ;
  public errorBlankPassword : boolean = false                ;
  private LoginForm         : FormGroup                      ;
  private submitAttempt     : boolean = false                ;
  public creds              : any     = {}                   ;
  public loginData          : any                            ;
  public isVisible          : boolean = true                 ;

  constructor(
    public application       : ApplicationRef    ,
    public changeDetector    : ChangeDetectorRef ,
    public zone              : NgZone            ,
    public alert             : AlertService      ,
    public auth              : AuthService       ,
    public db                : DBService         ,
    public server            : ServerService     ,
    public data              : OSData            ,
    public dispatch          : DispatchService   ,
    public notify            : NotifyService     ,
  ) {
    window['logincomponent']  = this;
    window['logincomponent2'] = this;
    window['p'] = this;
  }

  ngOnInit() {
    Log.l("LoginComponent: ngOnInit() fired.");
    this.initializeForm();
  }

  ngOnDestroy() {
    Log.l("LoginComponent: ngOnDestroy() fired.");
  }


  private initializeForm() {
    this.LoginForm = new FormGroup({
      'formUser': new FormControl(null, Validators.required),
      'formPass': new FormControl(null, Validators.required)
    });
    if(this.auth && this.auth.getUser()) {
      this.username = this.auth.getUser();
    }
    if(this.auth && this.auth.getPass()) {
      this.password = this.auth.getPass();
    }
  }

  public cancel() {
    Log.l("LoginComponent: cancel() clicked.");
  }

  public async checkPasswordKeypress(evt?:KeyboardEvent):Promise<any> {
    try {
      Log.l(`checkPasswordKeypress(): Event is:`, evt);
      if(evt && evt.key && evt.key === 'Enter') {
        this.loginClicked();
      }
      // return res;
    } catch(err) {
      Log.l(`checkPasswordKeypress(): Error checking keypress event`);
      Log.e(err);
      throw err;
    }
  }

  public async loginClicked():Promise<any> {
    try {
      Log.l("LoginComponent: loginClicked() clicked.");
      let loginData = {u: this.username, p: this.password};
      if(loginData.u && loginData.p) {
        let res:any = await this.attemptLogin(loginData);
        return res;
      } else {
        if(!this.username) {
          this.errorBlankUsername = true;
        } else {
          this.errorBlankUsername = false;
        }
        if(!this.password) {
          this.errorBlankPassword = true;
        } else {
          this.errorBlankPassword = false;
        }
      }
    } catch(err) {
      Log.l("LoginComponent: Error logging in.");
      Log.e(err);
      this.loginError = true;
    }
  }

  public dismiss() {
    let cred = this.loginData;
    let data = {user: cred.username , pass:cred.password};

    Log.l("Got creds:\n", cred);

    this.creds = cred;
    // this.viewCtrl.dismiss(data);
  }

  public onSubmit() {
    this.submitAttempt = true;
    this.loginClicked();
  }

  public async attemptLogin(data:{u:string, p:string}):Promise<any> {
    try {
      let u = data.u;
      let p = data.p;
      let res:any = await this.server.loginToServer(u, p, '_session');
      if(res) {
        Log.l("loginClicked(): Successfully logged in to server.");
        if (window['PasswordCredential'] && window['navigator'] && window['navigator']['credentials'] && window['navigator']['credentials']['store']) {
          let cred = { "id": u, "password": p, "name": "OnSiteConsoleX" };
          let chromeCred = new window['PasswordCredential'](cred);
          Log.l("loginClicked(): Now trying to save Chrome credential:\n", chromeCred);
          try {
            let res2:any = await navigator['credentials']['store'](chromeCred);
            Log.l("loginClicked(): Successfully created and stored credentials with Google Smart Lock.");
              // this.dismiss();
            this.loginAttempt.emit(true);
            return res2;
          } catch(err) {
            Log.l("loginClicked(): Error storing credentials with Google Smart Lock.");
            Log.e(err);
            // this.dismiss();
            this.loginAttempt.emit(true);
          }
        } else {
          Log.l("loginClicked(): Not in a browser supporting Google Smart Lock. Lame!");
          // this.dismiss();
          this.loginAttempt.emit(true);
        }
      } else {
        Log.l("loginClicked(): Failed logging in to server.");
        this.loginError = true;
      }
    } catch(err) {
      Log.l("Error logging in to server.");
      Log.e(err);
      this.loginError = true;
    }
  }

  public checkUsername() {
    let d = this.username;
    if(this.errorBlankUsername && d && d.length) {
      this.errorBlankUsername = false;
    }
  }
  public checkPassword() {
    let d = this.password;
    if (this.errorBlankPassword && d && d.length) {
      this.errorBlankPassword = false;
    }
  }

  public showOptions(evt?:any) {
    this.dispatch.showGlobalOptions('global');
  }

  // loginClicked() {
  //   let c = this.LoginForm.value;
  //   this.creds = c;
  //   Log.l("loginClicked(): User entered credentials:\n", this.creds);
  //   if (this.creds != null) {
  //     let u = this.creds.formUser;
  //     let p = this.creds.formPass;
  //     this.loginData = {"username": u, "password": p};
  //     this.username = u;
  //     this.server.loginToServer(u, p, '_session').then((res) => {
  //       if (res) {
  //         Log.l("loginClicked(): Successfully logged in to server.");
  //         if (window['PasswordCredential'] && window['navigator'] && window['navigator']['credentials'] && window['navigator']['credentials']['store']) {
  //           let cred = { "id": c.formUser, "password": c.formPass, "name": "OnSiteConsoleX" };
  //           let chromeCred = new window['PasswordCredential'](cred);
  //           Log.l("loginClicked(): Now trying to save Chrome credential:\n", chromeCred);
  //           navigator['credentials']['store'](chromeCred).then((res) => {
  //             Log.l("loginClicked(): Successfully created and stored credentials with Google Smart Lock.");
  //             this.dismiss();
  //           }).catch((err) => {
  //             Log.l("loginClicked(): Error storing credentials with Google Smart Lock.");
  //             Log.e(err);
  //             this.dismiss();
  //           });
  //         } else {
  //           Log.l("loginClicked(): Not in a browser supporting Google Smart Lock. Lame!");
  //           this.dismiss();
  //         }
  //       } else {
  //         Log.l("loginClicked(): Failed logging in to server.");
  //         this.loginError = true;
  //       }
  //     }).catch((err) => {
  //       Log.l("Error logging in to server.");
  //       Log.e(err);
  //       this.loginError = true;
  //     });
  //   } else {
  //     Log.l("loginClicked(): Login was dismissed or left empty.");
  //     this.loginError = true;
  //   }
  // }

  // goBack() { this.navCtrl.pop(); }
}
