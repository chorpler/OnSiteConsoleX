import { Component, OnInit                                   } from '@angular/core'                  ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'                  ;
import { FormGroup, FormControl, Validators                  } from "@angular/forms"                 ;
import { DBService                                           } from '../../providers/db-service'     ;
import { ServerService                                       } from '../../providers/server-service' ;
import { Log                                                 } from 'domain/onsitexdomain'  ;


@IonicPage({ name    : 'Login'  })
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage implements OnInit {

  public title          : string  = 'Login'              ;
  private username      : string                         ;
  public loginError     : boolean = false                ;
  public localURL       : string  = "_local/techProfile" ;
  public loading        : any     = {}                   ;
  public networkGood    : boolean = true                 ;
  private LoginForm     : FormGroup                      ;
  private submitAttempt : boolean = false                ;
  public creds          : any     = {}                   ;
  public dbServ         : any                            ;
  public server         : any                            ;
  public loginData      : any                            ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public dbService: DBService, public serverService: ServerService) {
    window['loginscreen'] = this; this.dbServ = dbService; this.server = serverService;
  }

  ngOnInit() {
    Log.l("LoginPage fired ngOnInit().");
    this.initializeForm();
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad LoginPage');
  }

  private initializeForm() {
    this.LoginForm = new FormGroup({
      'formUser': new FormControl(null, Validators.required),
      'formPass': new FormControl(null, Validators.required)
    });
  }

  dismiss() {

    let cred = this.loginData;
    let data = {user: cred.username , pass:cred.password};

    Log.l("Got creds:\n", cred);

    this.creds = cred;
    this.viewCtrl.dismiss(data);
  }

  onSubmit() {
    this.submitAttempt = true;
    this.loginClicked();
  }

  loginClicked() {
    let c = this.LoginForm.value;
    this.creds = c;
    Log.l("loginClicked(): User entered credentials:\n", this.creds);
    if (this.creds != null) {
      let u = this.creds.formUser;
      let p = this.creds.formPass;
      this.loginData = {"username": u, "password": p};
      this.username = u;
      this.server.loginToServer(u, p, '_session').then((res) => {
        if (res) {
          Log.l("loginClicked(): Successfully logged in to server.");
          if (window['PasswordCredential'] && window['navigator'] && window['navigator']['credentials'] && window['navigator']['credentials']['store']) {
            let cred = { "id": c.formUser, "password": c.formPass, "name": "OnSiteConsoleX" };
            let chromeCred = new window['PasswordCredential'](cred);
            Log.l("loginClicked(): Now trying to save Chrome credential:\n", chromeCred);
            navigator['credentials']['store'](chromeCred).then((res) => {
              Log.l("loginClicked(): Successfully created and stored credentials with Google Smart Lock.");
              this.dismiss();
            }).catch((err) => {
              Log.l("loginClicked(): Error storing credentials with Google Smart Lock.");
              Log.e(err);
              this.dismiss();
            });
          } else {
            Log.l("loginClicked(): Not in a browser supporting Google Smart Lock. Lame!");
            this.dismiss();
          }
        } else {
          Log.l("loginClicked(): Failed logging in to server.");
          this.loginError = true;
        }
      }).catch((err) => {
        Log.l("Error logging in to server.");
        Log.e(err);
        this.loginError = true;
      });
    } else {
      Log.l("loginClicked(): Login was dismissed or left empty.");
      this.loginError = true;
    }
  }

  goBack() { this.navCtrl.pop(); }
}
