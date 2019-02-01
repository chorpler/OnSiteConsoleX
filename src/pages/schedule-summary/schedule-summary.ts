import { Component,                          } from '@angular/core'              ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'              ;
import { ViewController                      } from 'ionic-angular'              ;
import { Log, Moment, moment                 } from 'domain/onsitexdomain'       ;
import { OSData                              } from 'providers/data-service'     ;
import { AlertService                        } from 'providers/alert-service'    ;
import { DispatchService                     } from 'providers/dispatch-service' ;

// import { ServerService                                        } from '../../providers/server-service'  ;
// import { DBService                                            } from '../../providers/db-service'      ;
// import { AuthService                                          } from '../../providers/auth-service'    ;
// import { AlertService                                         } from '../../providers/alert-service'   ;
// import { Jobsite                                              } from 'domain/onsitexdomain'            ;
// import { Employee                                             } from 'domain/onsitexdomain'           ;
// import { Schedule                                             } from 'domain/onsitexdomain'           ;
// import { PDFService                                           } from '../../providers/pdf-service'     ;
// import { OptionsComponent                                     } from '../../components/options/options';

const colors = {
  // These are background colors used for Halliburton and other clients in Scheduling and whatnot
  bg: {
    HB: "#d9e1f2",
    KN: "#e2efda",
    BE: "#f8cbad",
    SE: "#ffffff",
    date: "#004080",
  },
  // Foreground colors for clients, used in Scheduling summary and whatnot
  fg: {
    HB: "#203764",
    KN: "#c65911",
    BE: "#375623",
    SE: "#cc0099",
    date: "#e6e6e6",
  },
  get date() { return { color: colors.fg.date, fillColor: colors.bg.date }; },

};


@IonicPage({name: 'Schedule Summary'})
@Component({
  selector: 'page-schedule-summary',
  templateUrl: 'schedule-summary.html',
})
export class ScheduleSummaryPage {
  public data: any;
  public csv : any;
  public modalMode:boolean = false;
  public dataReady:boolean = false;
  constructor(
    public viewCtrl  : ViewController  ,
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public dataServ  : OSData          ,
    public alert     : AlertService    ,
    public dispatch  : DispatchService ,
  ) {
    window['schedulingsummary']  = this;
    window['schedulingsummary2'] = this;
    window['p'] = this;
    if(this.navParams.get('modalMode') !== undefined) {
      this.modalMode = this.navParams.get('modalMode');
    }
    if(this.navParams.get('data') !== undefined) {
      this.data = this.navParams.get('data');
    }
    if(this.navParams.get('csv') !== undefined) {
      this.csv = this.navParams.get('csv');
    }
  }

  ionViewDidEnter() {
    Log.l('ionViewDidLoad ScheduleSummaryPage');
    let keys =[];
    if(this.data !== undefined && this.data !== null) {
      keys = Object.keys(this.data);
    }
    if(this.data && keys.length > 0) {
      this.dataReady = true;
      this.setPageLoaded();
    } else {
      if (this.navParams.get('data') !== undefined) {
        this.data = this.navParams.get('data');
        this.dataReady = true;
        this.setPageLoaded();
      }
    }
    if(this.dataReady) {
      Log.l("Get ready for CSV data:");
      Log.l(this.csv);
      window['mikecsv'] = this.csv;
    }
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }


}
