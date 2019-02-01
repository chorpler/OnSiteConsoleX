import { Component, NgZone, OnInit, OnDestroy, EventEmitter, Output, Input,   } from '@angular/core'                  ;
import { Log, Moment, moment, isMoment                                        } from 'domain/onsitexdomain'  ;
import { OSData                                                               } from '../../providers/data-service'   ;
import { ServerService                                                        } from '../../providers/server-service' ;
import { DBService                                                            } from '../../providers/db-service'     ;
import { AuthService                                                          } from '../../providers/auth-service'   ;
import { AlertService                                                         } from '../../providers/alert-service'  ;
import { NotifyService                                                        } from '../../providers/notify-service' ;
import { Jobsite, Employee, Invoice, Report, PreAuth,                         } from 'domain/onsitexdomain'    ;
import { Listbox, SelectItem                                                  } from 'primeng/primeng'                ;

enum ListMode {
  listbox,
  manual,
}

@Component({
  selector: 'preauth-open',
  templateUrl: 'preauth-open.html',
})
export class PreauthOpenComponent implements OnInit,OnDestroy {
  @Output('cancel') cancel = new EventEmitter<any>();
  @Output('open') open = new EventEmitter<Array<PreAuth>>();
  @Input('mode') mode:ListMode = ListMode.listbox;
  public title      : string          = "Open Preauths" ;
  public visible    : boolean         = true            ;
  public preauth    : PreAuth                           ;
  public preauths   : Array<PreAuth>  = []              ;
  public preauthList: SelectItem[]    = []              ;
  public selectedPreauths:Array<PreAuth> = []           ;
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
    window['onsiteopenpreauths'] = this;
  }

  ngOnInit() {
    Log.l("PreauthOpenComponent: ngOnInit() called");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("PreauthOpenComponent: ngOnDestroy() called");
  }

  public runWhenReady() {
    this.refreshPreauthList();
    // .then(res => {
    //   this.dataReady = true;
    // });
  }

  public async refreshPreauthList() {
    try {
      // let delay = await this.delay(3000);
      let preauths = await this.server.getPreauths("2017-01-01", "2100-01-01");
      this.preauths = preauths.sort((a:PreAuth,b:PreAuth) => {
        return a._id > b._id ? -1 : a._id < b._id ? 1 : 0;
      });
      this.generatePreauthList();
      this.dataReady = true;
    } catch (err) {
      Log.l("refreshPreauthList(): Error getting preauths!");
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing preauth list: '${err.message}'`, 10000);
    }
    // return new Promise((resolve,reject) => {

    // });
    // return this.server.getInvoices('HB', "2017-01-01", "2100-01-01").then(res => {
    //   this.invoices = res;
    //   this.dataReady = true;
    // }).catch(err => {
    //   Log.l("refreshInvoiceList(): Error getting invoice list!");
    //   Log.e(err);
    //   this.notify.addError("ERROR", `Error refreshing invoice list: '${err.message}'`, 10000);
    // })
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

  public generatePreauthList() {
    let list:SelectItem[] = [];
    for(let preauth of this.preauths) {
      let date = moment(preauth.period_date, "YYYY-MM-DD");
      let end   = moment(date).add(6, 'day');
      let label:string = `${preauth._id} (${date.format("MMM DD")} — ${end.format("MMM DD")})`;
      let item:SelectItem = { label: label, value: preauth };
      list.push(item);
    }
    this.preauthList = list;
    return list;
  }

  public async openPreauth(preauth:PreAuth, event?:any) {
    Log.l("openInvoice(): Event is:\n", event);
    let preauths = [preauth];
    this.open.emit(preauths);
  }

  public async openPreauths(preauths:Array<PreAuth>, event?:any) {
    Log.l("openPreauths(): Event is:\n", event);
    this.open.emit(preauths);
  }

  public async cancelClicked(event?:any) {
    Log.l("PreauthOpenPage: User canceled.");
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
