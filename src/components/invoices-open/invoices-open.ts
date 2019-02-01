import { Component, NgZone, OnInit, OnDestroy, EventEmitter, Output, Input,   } from '@angular/core'                  ;
import { Log, Moment, moment, isMoment                                        } from 'domain/onsitexdomain'  ;
import { OSData                                                               } from '../../providers/data-service'   ;
import { ServerService                                                        } from '../../providers/server-service' ;
import { DBService                                                            } from '../../providers/db-service'     ;
import { AuthService                                                          } from '../../providers/auth-service'   ;
import { AlertService                                                         } from '../../providers/alert-service'  ;
import { NotifyService                                                        } from '../../providers/notify-service' ;
import { Jobsite, Employee, Invoice, Report,                                  } from 'domain/onsitexdomain'    ;
import { Listbox, SelectItem                                                  } from 'primeng/primeng'                ;

enum ListMode {
  listbox,
  manual,
}
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

@Component({
  selector: 'invoices-open',
  templateUrl: 'invoices-open.html',
})
export class InvoicesOpenComponent implements OnInit,OnDestroy {
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('open') open = new EventEmitter<Array<Invoice>>();
  @Input('type') type:string = "KN";
  @Input('mode') mode:ListMode = ListMode.listbox;
  public title      : string          = "Open Invoices" ;
  public visible    : boolean         = true            ;
  public invoice    : Invoice                           ;
  public invoices   : Array<Invoice>  = []              ;
  public invoiceList: SelectItem[]    = []              ;
  public selectedInvoices:Array<Invoice> = []           ;
  public showAll    : Boolean         = false           ;
  public dialogLeft : number          = 250             ;
  public dialogTop  : number          = 100             ;
  public ListMode                     = ListMode        ;
  // public mode       : ListMode        = ListMode.manual ;
  // public mode       : ListMode        = ListMode.manual ;
  public multipleMode:boolean         = true            ;
  public checkboxMode:boolean         = true            ;
  public filterMode  :boolean         = false           ;
  public dataReady  : boolean         = false           ;

  constructor(public zone:NgZone, public server:ServerService, public db:DBService, public alert:AlertService, public data:OSData, public notify:NotifyService) {
    window['onsiteopeninvoices'] = this;
  }

  ngOnInit() {
    Log.l("InvoicesOpenComponent: ngOnInit() called");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("InvoicesOpenComponent: ngOnDestroy() called");
  }

  public runWhenReady() {
    this.refreshInvoiceList();
    // .then(res => {
    //   this.dataReady = true;
    // });
  }

  public async refreshInvoiceList() {
    try {
      // let delay = await this.delay(3000);
      let invoices = await this.server.getInvoices(this.type, "2017-01-01", "2100-01-01");
      this.invoices = invoices.sort((a:Invoice,b:Invoice) => {
        return a._id > b._id ? -1 : a._id < b._id ? 1 : 0;
      });
      for(let invoice of this.invoices) {
        for(let row of invoice.grid) {
          let dateField = row[gridcol.date];
          if(dateField !== '') {
            let date = moment(dateField, "YYYY-MM-DD");
            row[gridcol.date] = date.format("DD MMM YYYY");
          }
        }
      }
      this.generateInvoiceList();
      this.dataReady = true;
    } catch (err) {
      Log.l("refreshInvoiceList(): Error getting invoices!");
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing invoice list: '${err.message}'`, 10000);
    }
  }

  public async delay(ms:number) {
    try {
      let timeout = setTimeout(() => {
        Log.l(`delay(): ${ms}ms timeout ran out.`);
        return `${ms}ms delay finished`;
      }, ms);
    } catch (err) {
      Log.l("delay(): Caught error!");
      Log.e(err);
    }
  }

  public generateInvoiceList() {
    let list:SelectItem[] = [];
    for(let invoice of this.invoices) {
      let start = moment(invoice.period_start, "YYYY-MM-DD");
      let end   = moment(start).add(6, 'day');
      let label:string = `${invoice._id} (${start.format("MMM DD")} — ${end.format("MMM DD")})`;
      let item:SelectItem = { label: label, value: invoice };
      list.push(item);
    }
    this.invoiceList = list;
    return list;
  }

  public openInvoice(invoice:Invoice, event?:any) {
    Log.l("openInvoice(): Event is:\n", event);
    let invoices = [invoice];
    this.open.emit(invoices);
  }

  public openInvoices(invoices:Array<Invoice>, event?:any) {
    Log.l("openInvoices(): Event is:\n", event);
    this.open.emit(invoices);
  }

  public cancelClicked(event?:any) {
    Log.l("InvoicesOpenPage: User canceled.");
    this.cancel.emit([]);
    // this.viewCtrl.dismiss();
  }

  public toggleMode(event?:any) {
    if(this.mode === ListMode.listbox) {
      this.mode = ListMode.manual;
    } else {
      this.mode = ListMode.listbox;
    }
    Log.l("toggleMode(): Mode is now '%s'", this.mode);
  }

}
