import { Component, NgZone, OnInit, EventEmitter, Output, Input,              } from '@angular/core'                  ;
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular'                  ;
import { Log, Moment, moment, isMoment                                        } from 'domain/onsitexdomain'  ;
import { OSData                                                               } from '../../providers/data-service'   ;
import { ServerService                                                        } from '../../providers/server-service' ;
import { DBService                                                            } from '../../providers/db-service'     ;
import { AuthService                                                          } from '../../providers/auth-service'   ;
import { AlertService                                                         } from '../../providers/alert-service'  ;
import { NotifyService                                                        } from '../../providers/notify-service' ;
import { Jobsite, Employee, Invoice, Report,                                  } from 'domain/onsitexdomain'    ;
import { Listbox, SelectItem                                                  } from 'primeng/primeng'                ;

export enum gridcol {
  date   = 0,
  tech   = 1,
  unit   = 2,
  wonum  = 3,
  hours  = 4,
  total  = 5,
  report = 6,
}
export enum sumcol {
  unit  = 0,
  hours = 1,
  total = 2,
  fill1 = 3,
  fill2 = 4,
  fill3 = 5,
  fill4 = 6,
}

@IonicPage({name: 'Open Invoices'})
@Component({
  selector: 'page-invoices-open',
  templateUrl: 'invoices-open.html',
})
export class InvoicesOpenPage implements OnInit {
  @Input('type') type:string = "KN";
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('open') open = new EventEmitter<any>();
  public title    : string          = "Open Invoices" ;
  // public schedule : Schedule                          ;
  public invoices : Array<Invoice> = []           ;
  // public allSchedules: Array<Schedule> = []           ;
  public showAll  : Boolean         = false           ;
  public dataReady: boolean         = false           ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl:ViewController, public zone:NgZone, public server:ServerService, public db:DBService, public alert:AlertService, public data:OSData, public notify:NotifyService) {
    window['onsiteopeninvoices'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad InvoicesOpenPage');
  }

  ngOnInit() {
    Log.l("ScheduleListPage: ngOnInit() called");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  public runWhenReady() {

  }

  public refreshInvoiceList() {
    return this.server.getInvoices(this.type, "2017-01-01", "2100-01-01").then(res => {
      for(let invoice of res) {
        for(let row of invoice.grid) {
          let dateField = row[gridcol.date];
          if(dateField !== '') {
            let date = moment(dateField, "YYYY-MM-DD");
            row[gridcol.date] = date.format("DD MMM YYYY");
          }
        }
      }
      this.invoices = res;
    }).catch(err => {
      Log.l("refreshInvoiceList(): Error getting invoice list!");
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing invoice list: '${err.message}'`, 10000);
    })
  }

  public openInvoices(invoices:Array<Invoice>) {
    this.open.emit(invoices);
  }

  public cancelClicked(event?:any) {
    Log.l("InvoicesOpenPage: User canceled.");
    this.cancel.emit([]);
  }

}
