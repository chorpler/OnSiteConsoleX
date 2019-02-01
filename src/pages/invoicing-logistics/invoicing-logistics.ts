import { Subscription                                                                    } from 'rxjs'                             ;
import { sprintf                                                                         } from 'sprintf-js'                       ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ViewChildren, ElementRef,      } from '@angular/core'                    ;
import { IonicPage, NavController, NavParams, ModalController, ViewController            } from 'ionic-angular'                    ;
import { DBService                                                                       } from 'providers/db-service'             ;
import { ServerService                                                                   } from 'providers/server-service'         ;
import { AuthService                                                                     } from 'providers/auth-service'           ;
import { AlertService                                                                    } from 'providers/alert-service'          ;
import { NumberService                                                                   } from 'providers/number-service'         ;
import { Log, Moment, moment, oo, _matchCLL, _matchSite                                  } from 'domain/onsitexdomain'             ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'             ;
import { OSData                                                                          } from 'providers/data-service'           ;
// import { PDFService                                                                      } from 'providers/pdf-service'            ;
import { OptionsComponent                                                                } from 'components/options/options'       ;
import { InvoiceLogisticsComponent                                                       } from 'components/invoice-logistics'     ;
import { NotifyService                                                                   } from 'providers/notify-service'         ;
import { Dropdown, SelectItem                                                            } from 'primeng/primeng'                  ;
import { DispatchService                                                                 } from 'providers'                        ;
import { Command, KeyCommandService                                                      } from 'providers/key-command-service'    ;

@IonicPage({name: "Invoicing Logistics"})
@Component({
  selector: 'page-invoicing-logistics',
  templateUrl: 'invoicing-logistics.html',
})
export class InvoicingLogisticsPage implements OnInit,OnDestroy {
  @ViewChild('invoiceLogistics') invoiceLogistics:InvoiceLogisticsComponent;
  public title          : string            = "Invoicing Logistics" ;
  public keySubscription: Subscription      ;
  public site           : Jobsite           ;
  public sites          : Array<Jobsite>    = []             ;
  public periods        : Array<PayrollPeriod> = []          ;
  public period         : PayrollPeriod     ;
  public invoiceGrid    : Array<Array<any>> = [[]]           ;
  public invoice        : Invoice           ;
  public invoices       : Array<Invoice>    = []             ;
  public summary        : Array<Array<any>> = [[]]           ;
  public allReports     : Array<Report>     = []             ;
  public reports        : Array<Report>     = []             ;
  public siteMenu       : SelectItem[]      = []             ;
  public periodMenu     : SelectItem[]      = []             ;
  public totalUnitHours : number            = 0              ;
  public totalUnitBilled: number            = 0              ;
  public totalHours     : number            = 0              ;
  public totalBilled    : number            = 0              ;
  public billedText     : string            = ""             ;
  public invoiceOpenVisible:boolean         = false          ;
  public modalMode      : boolean           = false          ;
  public dataReady      : boolean           = false          ;

  constructor(
    public viewCtrl   : ViewController    ,
    public navCtrl    : NavController     ,
    public navParams  : NavParams         ,
    public data       : OSData            ,
    public db         : DBService         ,
    public server     : ServerService     ,
    public alert      : AlertService      ,
    public numServ    : NumberService     ,
    public modalCtrl  : ModalController   ,
    public notify     : NotifyService     ,
    public dispatch   : DispatchService   ,
    public keyService : KeyCommandService ,

  ) {
    window["onsiteinvoicinglogistics"] = this;
  }

  ngOnInit() {
    Log.l('InvoicingLogisticsPage: ngOnInit() fired');
    // if(this.navParams.get('period') !== undefined) { this.period = this.navParams.get('period'); }
    // if(this.navParams.get('site') !== undefined) { this.site = this.navParams.get('site'); }
    // if(this.navParams.get('invoice') !== undefined) { this.invoice = this.navParams.get('invoice'); } else { this.invoice = new Invoice(); }
    // let sites = this.data.getData('sites');
    // this.site = this.site || sites.find((a:Jobsite) => {
    //   return a.client.name === 'HB';
    // });
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("InvoicingLogisticsPage: ngOnDestroy() fired");
    this.cancelSubscriptions();
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        // case "InvoicingLogisticsPage.showOptions"      : this.showOptions(); break;
      }
    });
  }

  public cancelSubscriptions() {
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }
    this.allReports = this.data.getData('reports');
    this.sites = this.data.getData('sites')
    this.sites = this.sites.filter((a:Jobsite) => {
      return a.client.name === 'HB';
    }).sort((a:Jobsite,b:Jobsite) => {
      let aN = a.sort_number;
      let bN = b.sort_number;
      return aN < bN ? -1 : aN > bN ? 1 : 0;
    });
    this.invoice = new Invoice();
    this.invoices = [this.invoice];
    this.site = this.sites[0];
    this.createDropdownMenu();
    let period:PayrollPeriod = this.period;
    let site:Jobsite = this.site;
    this.reports = this.generateReportData(site, period);
    this.dataReady = true;
    this.setPageLoaded();
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public createDropdownMenu() {
    let sites = this.sites;
    let siteMenu:SelectItem[] = [];
    for(let site of sites) {
      let label = site.schedule_name;
      let value = site;
      let item:SelectItem = {label: label, value: value};
      siteMenu.push(item);
    }
    this.siteMenu = siteMenu;
    this.site = this.siteMenu[0].value;

    // let period:PayrollPeriod = this.period;
    let periods:Array<PayrollPeriod> = this.data.createPayrollPeriods();

    let periodMenu:SelectItem[] = [];
    for(let period of periods) {
      let label = period.start_date.format("MMM DD") + " — " + period.end_date.format("MMM DD");
      let value = period;
      let item:SelectItem = {label: label, value: value};
      periodMenu.push(item);
    }
    this.periodMenu = periodMenu;
    this.period = this.periodMenu[0].value;
  }

  public generateReportData(js?:Jobsite, prd?:PayrollPeriod):Array<Report> {
    let period = this.period || this.periods[0];
    if(prd) {
      period = prd;
    }
    // let sites = this.sites;
    let site = js || this.site || this.sites[0];
    let start_date = moment(period.start_date).format("YYYY-MM-DD");
    let end_date = moment(period.end_date).format("YYYY-MM-DD");
    let reports = this.allReports.filter((a:Report) => {
      let rd = a.report_date;
      return rd >= start_date && rd <= end_date && a.matchesSite(site) && !a.invoiced;
    }).sort((a:Report, b:Report) => {
      let da = a.report_date;
      let db = b.report_date;
      return da > db ? 1 : da < db ? -1 : 0;
    });
    Log.l("generateReportData(): Resulting reports list is:\n", reports);
    return reports;
  }

  public updateSite(site:Jobsite) {
    Log.l("updateSite(): Site changed to:\n", site);
    this.site = site;
    this.dispatch.updateInvoiceSite(site);
    this.updatePeriod(this.period);
  }

  public updatePeriod(period:PayrollPeriod) {
    Log.l("updatePeriod(): Period updated to:\n", period);
    this.period = period;
    let site = this.site;
    this.reports = this.generateReportData(site, period);
    this.dispatch.updateInvoiceReports(this.reports);
  }

  public copyTable(event?:any) {
    let hb = this.invoiceLogistics;
    let table = hb.printArea.nativeElement;
    // = this.printArea.nativeElement;
    let el = table.innerHtml;
    let range,selection;
    if(window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(table);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand('copy');
    selection.removeAllRanges();
    this.notify.addSuccess("SUCCESS", "Successfully copied table to clipboard.", 3000);
  }

  public printInvoices(event?:any) {
    Log.l("printInvoices(): Calling window print function.");
    window.print();
  }

  public async clearInvoices(event?:any) {

  }

  public async openInvoices(event?:any) {
    Log.l("openInvoices(): Event is:\n", event);
    this.invoiceOpenVisible = true;
  }

  public invoicesOpen(event?: any) {
    Log.l("invoicesOpen(): Got event:\n", event);
    this.invoiceOpenVisible = false;
    this.invoices = event || this.invoices || [];
  }

  public cancelOpen(event?: any) {
    Log.l("cancelOpen(): Got event:\n", event);
    this.invoiceOpenVisible = false;
    // this.invoices = event || this.invoices || [];
  }
  public async refreshData(event?:any) {

  }

  public async saveInvoices(event?:any) {
    Log.l("saveInvoices(): User clicked with event:\n", event);
    try {
      if(this.invoices.length === 0) {
        this.notify.addError("ERROR", "No invoices loaded or generated!", 6000);
      } else {
        let save = await this.alert.showConfirmYesNo("SAVE INVOICES", "Do you want to save these invoices to the server? They must be numbered first.");
        if (save) {
          for(let invoice of this.invoices) {
            if(invoice['_$visited'] !== undefined) {
              delete invoice['_$visited'];
            }
          }
          // this.transactionTotal = this.invoices.length;
          let results = await this.server.saveInvoices('HB', this.invoices);
          Log.l("saveInvoices(): Success, results were:\n", results);
          for(let result of results) {
            let id = result.id, rev = result.rev;
            let inv = this.invoices.find((a:Invoice) => {
              return a._id === id;
            });
            inv._rev = rev;
          }
          this.notify.addSuccess("SUCCESS", "Saved invoices successfully.", 3000);
          return results;
        } else {

        }
      }
    } catch (err) {
      Log.l("saveInvoices(): Caught error!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving invoices: '${err.message}'`, 10000);
    }
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

}
