import { Subscription                                                                    } from 'rxjs'                  ;
import { sprintf                                                                         } from 'sprintf-js'                         ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef                     } from '@angular/core'                      ;
import { IonicPage, NavController, NavParams, ModalController, ViewController            } from 'ionic-angular'                      ;
import { ServerService                                                                   } from 'providers/server-service'           ;
import { DBService                                                                       } from 'providers/db-service'               ;
import { AuthService                                                                     } from 'providers/auth-service'             ;
import { AlertService                                                                    } from 'providers/alert-service'            ;
import { NumberService                                                                   } from 'providers/number-service'           ;
import { Log, Moment, moment, oo, _matchCLL, _matchReportSite                            } from 'domain/onsitexdomain'            ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/onsitexdomain'              ;
import { OSData                                                                          } from 'providers/data-service'             ;
// import { PDFService                                                                      } from 'providers/pdf-service'              ;
import { OptionsComponent                                                                } from 'components/options/options'         ;
import { SelectItem, MenuItem, Dropdown, Dialog,                                         } from 'primeng/primeng'                    ;
import { Command, KeyCommandService                                                      } from 'providers/key-command-service'      ;
import { DispatchService                                                                 } from 'providers/dispatch-service'         ;
import { NotifyService                                                                   } from 'providers/notify-service'           ;
import { InvoiceService                                                                  } from 'providers/invoice-service'          ;
import { ReportViewComponent                                                             } from 'components/report-view/report-view' ;

const MAX_LINES:number = 25;
const SUMMARY_LINES:number = 10;

@IonicPage({name: "Invoicing Templates"})
@Component({
  selector: 'page-invoicing-templates',
  templateUrl: 'invoicing-templates.html',
})
export class InvoicingTemplatesPage implements OnInit,OnDestroy {
  @ViewChild('printArea') printArea:ElementRef;
  @ViewChild('reportView') reportView:ReportViewComponent;
  @ViewChild('reportViewTarget') reportViewTarget:ElementRef;
  @ViewChild('reportViewDialog') reportViewDialog:Dialog;
  @ViewChild('printIframe') printIframe:ElementRef;

  public title            :string = "Invoicing Templates";
  public MAX_LINES        :number = MAX_LINES           ;
  public SUMMARY_LINES    :number = SUMMARY_LINES       ;
  // public logoPath:string = "/assets/images/SESA-Logo-Original.svg"
  public logoPath:string = "assets/images/SESALogoBlue.svg"
  public invoiceOpenVisible:boolean            = false   ;
  public iframeVisible    :boolean            = false   ;
  public reportViewVisible:boolean            = false   ;
  public reportViewTitle  :string  = "Report"           ;
  public dialogTarget     : string = "reportViewTarget" ;
  public dialogLeft       : number            = 250     ;
  public dialogTop        : number            = 100     ;
  public site             : Jobsite                     ;
  public sites            : Array<Jobsite>    = []      ;
  public tech             : Employee                    ;
  public techs            : Array<Employee>   = []      ;
  public period           : PayrollPeriod               ;
  public periods          : Array<PayrollPeriod> = []   ;
  public periodList       : SelectItem[]      = []      ;
  public siteList         : SelectItem[]      = []      ;
  public report           : Report                      ;
  public reports          : Array<Report>     = []      ;
  public allReports       : Array<Report>     = []      ;
  public invoiceGrid      : Array<Array<any>> = [[]]    ;
  public invoice          : Invoice                     ;
  public invoices         : Array<Invoice>    = []      ;
  public oldInvoices      : Array<Invoice>    = []      ;
  public summary          : Array<Array<any>> = [[]]    ;
  public dbUpdate         : Subscription                ;
  public transactionTotal : number            = 0       ;
  public transactionCount : number            = 0       ;
  public totalUnitHours   : number            = 0       ;
  public totalUnitBilled  : number            = 0       ;
  public totalHours       : number            = 0       ;
  public totalBilled      : number            = 0       ;
  public billedText       : string            = ""      ;
  public dataReady        : boolean           = false   ;

  constructor(
    public navCtrl        : NavController   ,
    public navParams      : NavParams       ,
    public data           : OSData          ,
    public server         : ServerService   ,
    public alert          : AlertService    ,
    public numServ        : NumberService   ,
    public modalCtrl      : ModalController ,
    public notify         : NotifyService   ,
    public invoiceService : InvoiceService  ,
    public dispatch       : DispatchService ,
  ) {
    window["onsiteinvoicetemplates"] = this;
    window["_matchReportSite"] = _matchReportSite;
  }

  // ionViewDidLoad() {
  //   Log.l('ionViewDidLoad InvoicingTemplatesPage');
  //   this.data.appReady().then(res => {
  //     this.runWhenReady();
  //   });
  // }

  ngOnInit() {
    Log.l('InvoicingTemplatesPage: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l('InvoicingTemplatesPage: ngOnDestroy() fired');
    if(this.dbUpdate && !this.dbUpdate.closed) {
      this.dbUpdate.unsubscribe();
    }
  }

  public runWhenReady() {
    this.initializeSubscriptions();
    this.initializeData();
    this.initializeInvoice();
    this.initializeDropdownMenus();
    // let invoice = this.generateInvoiceGrid();
    this.generateInvoiceGrid();
    // this.invoices.push(invoice);
    // let sorted_counts = this.sortUnitCounts(invoice);
    this.dataReady = true;
  }

  public initializeSubscriptions() {
    this.dbUpdate = this.dispatch.dbProgressUpdated().subscribe((progress:{type:string,id:string}) => {
      this.transactionCount++;
      Log.l(`InvoicingTemplates: got DBUpdate event. That makes ${this.transactionCount} / ${this.transactionTotal}.`);
      if(this.transactionCount >= this.transactionTotal) {
        this.transactionCount = 0;
        this.transactionTotal = 0;
      }
    });
  }

  public initializeData() {
    this.sites = this.data.getData('sites').filter((a:Jobsite) => {
      return a.client.name === "KN";
    });
    this.site = this.sites[0];

    this.periods = this.data.createPayrollPeriods();
    this.period = this.periods[0];
    let start = moment(this.period.start_date);
    let end   = moment(this.period.end_date);

    this.allReports = this.data.getData('reports');
    this.techs = this.data.getData('employees');
  }

  public initializeInvoice(ivc?:Invoice) {
    let site = this.site;
    let invoice:Invoice;
    if(ivc) {
      invoice = ivc;
    } else {
      invoice = new Invoice();
    }
    invoice.invoice_number         = "0";
    invoice.number                 = "0";
    invoice.type                   = "KN";
    invoice.address.street.street1 = site.address.street.street1;
    invoice.address.street.street2 = site.address.street.street2;
    invoice.address.city           = site.address.city;
    invoice.address.state          = site.address.state;
    invoice.address.zipcode        = site.address.zipcode;
    invoice.site                   = site;
    invoice.period_start           = moment(this.period.start_date).format("YYYY-MM-DD");
    if(site.client.name === 'KN') {
      invoice.customer_name = "Keane Group";
      invoice.customer_number = "SES100";
    } else if(site.client.name === 'HB') {
      invoice.customer_name = "Halliburton";
    } else if(site.client.name === 'BE') {
      invoice.customer_name = "Basic Energy Services";
    } else {
      invoice.customer_name = "Unknown";
    }
    invoice.site_number            = site.site_number;
    invoice.site_name              = site.getInvoiceName();
    invoice.date                   = moment();
    // }

    invoice.grid = [];
    invoice.summary_grid = [];
    invoice.total_billed = 0;
    invoice.total_astext = "";
    invoice.total_unit_hours = 0;
    invoice.total_unit_billed = 0;
    invoice.total_hours_billed = 0;
    // this.billedText = "";
    // this.totalUnitHours = 0;
    // this.totalUnitBilled = 0;
    // this.totalHours = 0;
    // this.totalBilled = 0;
    // this.invoice = invoice;
    return invoice;
  }

  public storeAndGenerateNewInvoice(ivc:Invoice) {
    this.invoices.push(ivc);
    let invoice = this.initializeInvoice();
    return invoice;
  }

  public initializeDropdownMenus() {
    let periods = this.data.createPayrollPeriods();
    let selectitems:SelectItem[] = [];
    for(let period of periods) {
      let name = period.getPeriodName("DD MMM");
      let item:SelectItem = { label: name, value: period };
      selectitems.push(item);
    }
    this.periods    = periods     ;
    this.period     = periods[0]  ;
    this.periodList = selectitems ;

    let sites = this.sites;
    let siteitems:SelectItem[] = [];
    for(let site of sites) {
      let name = site.getInvoiceName();
      let item:SelectItem = { label: name, value: site };
      siteitems.push(item);
    }
    this.siteList = siteitems;
  }

  public getCrewList(rpts?:Report[]) {
    let reportList = rpts || this.reports;
    let reports = this.reports.filter((a:Report) => {
      return a.work_order_number.indexOf("CREW") > -1;
    });
    let crewObject:any = {};
    for(let report of reports) {
      let crew = report.work_order_number;
      crewObject[crew] = 1;
    }
    let crewList:string[] = Object.keys(crewObject);
    crewList = crewList.sort();
    Log.l("getCrewList(): Result is:\n", crewList);
    return crewList;
  }

  public generateInvoiceGrid():Invoice {
    let reports = this.reports;
    let invoice:Invoice = this.initializeInvoice();

    Log.l("generateInvoiceGrid(): Using reports array:\n", reports);
    // let grid = [];
    let unitStats = {};
    let unitCounts = {};
    let unitData   = {};
    let totalUnitHours = 0;
    let totalUnitBilled = 0;
    let totalHours = 0;
    let totalBilled = 0;
    let site:Jobsite = this.site;
    let rate = Number(site.billing_rate);
    let finalCrew:string = "";
    if(isNaN(rate)) {
      rate = 65;
    }
    let i = 0, j = 0;
    let grid_lines = 0, summary_lines = 0;
    let crewList = this.getCrewList(reports);
    for(let crew of crewList) {
      finalCrew = crew;
      let newReports = reports.filter((a:Report) => {
        return a.work_order_number.trim().match(/^CREW/);
      });
      for(let report of newReports) {
        let date  = moment(report.report_date, "YYYY-MM-DD");
        let tech  = report.technician;
        let user  = report.username;
        let unit  = report.unit_number ? String(report.unit_number).trim() : "SHOP";
        let hours = report.repair_hours;
        let total = hours * rate;
        if(unitData[unit]) {
          if(unitData[unit][user]) {
            unitData[unit][user].hours += hours;
            unitData[unit][user].total += total;
            unitData[unit][user].reports.push(report);
            unitData[unit]['hours'] += hours;
            unitData[unit]['total'] += total;
          } else {
            unitData[unit][user] = {
              date: date.format("YYYY-MM-DD"),
              tech: tech,
              unit: unit,
              hours: hours,
              total: total,
              reports: [report],
            };
            unitData[unit]['hours'] += hours;
            unitData[unit]['total'] += total;
          }
        } else {
          unitData[unit] = {
            hours: hours,
            total: total,
          };
          unitData[unit][user] = {
            date: date.format("YYYY-MM-DD"),
            tech: tech,
            unit: unit,
            hours: hours,
            total: total,
            reports: [ report ],
          };
        }
        invoice.unitData = unitData;
        let row   = [ date.format("DD MMM YYYY"), tech, unit, hours, total, report ];
        invoice.grid.push(row);
        grid_lines++;
        let unitTotalHours = unitStats[unit] || 0;
        // let totalHours = unitData[unit]['total'] || 0;
        unitTotalHours += hours;
        unitStats[unit] = unitTotalHours;
        if(unitCounts[unit] !== undefined) {
          unitCounts[unit]++;
        } else {
          unitCounts[unit] = 1;
        }
        i++;
        if(grid_lines >= MAX_LINES || Object.keys(unitCounts).length >= SUMMARY_LINES) {
          // this.storeAndGenerateNewInvoice
          let count = 0;
          let units = Object.keys(unitStats);
          for (let unit of units) {
            let hours = unitStats[unit];
            let total = hours * rate;
            totalUnitHours += hours;
            totalUnitBilled += total;
            totalHours += hours;
            totalBilled += total;
            let row = [unit, hours, total, "", "", ""];
            invoice.summary_grid.push(row);
            summary_lines++;
          }
          let max_summary_lines = this.SUMMARY_LINES;
          count = max_summary_lines - invoice.summary_grid.length;
          for (let i = 0; i < count; i++) {
            invoice.summary_grid.push(["", "", "", "", ""]);
          }

          invoice.unit_counts        = unitCounts;
          invoice.total_unit_hours   = totalUnitHours;
          invoice.total_unit_billed  = totalUnitBilled;
          invoice.total_hours_billed = totalHours;
          invoice.total_billed       = totalBilled;
          invoice.total_astext       = this.numServ.toCurrency(totalBilled);
          invoice.customer_number = "SES100";
          let max_lines = this.MAX_LINES;
          let gridLineCount = max_lines - invoice.grid.length;
          for (let i = 0; i < gridLineCount; i++) {
            invoice.grid.push(["", "", "", "", "", ""]);
          }
          invoice.crew = String(Number(crew.slice(5)));

          let newInvoice= this.storeAndGenerateNewInvoice(invoice);
          grid_lines = 0;
          unitCounts = {};
          unitStats = {};
          summary_lines = 0;
          totalUnitHours  = 0;
          totalUnitBilled = 0;
          totalHours      = 0;
          totalBilled     = 0;
          invoice = newInvoice;
        }
      }
    }
    // let totalHours = 0;
    // for(let unitKey in unitData) {
    //   let unitInfo = unitData[unitKey];

    // }
    let max_lines = this.MAX_LINES;
    let count = max_lines - invoice.grid.length;
    for(let i = 0; i < count; i++) {
      invoice.grid.push([ "", "", "", "", "", "" ]);
    }

    let units = Object.keys(unitStats);
    for(let unit of units) {
      let hours = unitStats[unit];
      let total = hours * rate;
      totalUnitHours += hours;
      totalUnitBilled += total;
      totalHours += hours;
      totalBilled += total;
      let row = [unit, hours, total, "", "", ""];
      invoice.summary_grid.push(row);
    }
    let max_summary_lines = this.SUMMARY_LINES;
    count = max_summary_lines - invoice.summary_grid.length;
    for(let i = 0; i < count; i++) {
      invoice.summary_grid.push(["", "", "", "", ""]);
    }

    let billedText             = this.numServ.toCurrency(totalBilled);
    // invoice.grid               = grid;
    // invoice.summary_grid       = summary;
    invoice.unit_counts        = unitCounts;
    invoice.total_unit_hours   = totalUnitHours;
    invoice.total_unit_billed  = totalUnitBilled;
    invoice.total_hours_billed = totalHours;
    invoice.total_billed       = totalBilled;
    invoice.total_astext       = billedText;
    invoice.crew               = String(Number(finalCrew.slice(5)));

    this.invoices.push(invoice);
    return invoice;
  }

  public sortUnitCounts(invoice:Invoice) {
    let unitCounts = invoice.unit_counts;
    let counts = [];
    for(let key in unitCounts) {
      let item = {unit: key, count: unitCounts[key] };
      counts.push(item);
    }
    counts.sort((a:any,b:any) => {
      let cA = a.count;
      let cB = b.count;
      return cA > cB ? -1 : cA < cB ? 1 : 0;
    });
    Log.l("sortUnitCounts(): Array is:\n", counts);
    // unitCounts = {};
    // let len = counts.length;
    // for(let i = 0; i < len; i++) {
    //   let item = counts[i];
    //   unitCounts[item.unit] = item.count;
    // }
    // invoice.unit_counts = unitCounts;
    return counts;
  }

  public splitInvoice(invoice:Invoice) {

  }

  public testInvoice() {
    this.invoiceGrid = [];
    let min = 0;
    let max = 25;
    let umax = 999999999;
    let umin = 1000000;
    let hmin = 1;
    let hmax = 20;
    let count = Math.trunc(Math.random()*(max - min)) + min;
    for(let i = 0; i < count; i++) {
      let date = "Jul 24, 2017";
      let name = "Testerson, Test";
      let unit = Math.trunc(Math.random()*(umax - umin)) + umin;
      let hours = Math.trunc(Math.random()*(hmax-hmin)) + hmin;
      let total = hours * 70;
      let row = [date, name, unit, hours, total];
      this.invoiceGrid.push(row);
    }
    let max_rows = 25;
    count = max_rows - this.invoiceGrid.length;
    for(let i = 0; i < count; i++) {
      this.invoiceGrid.push(["", "", "", "", ""]);
    }
  }

  public parameterChange() {
    this.invoices = [];
    let period = this.period;
    let site = this.site;
    let start = moment(period.start_date).format("YYYY-MM-DD");
    let end   = moment(period.end_date).format("YYYY-MM-DD");

    this.reports = this.allReports.filter((a:Report) => {
      let report_date = a.report_date;
      return report_date >= start && report_date <= end && _matchReportSite(a, site);
    }).sort(
      this.sortReports
    );
      // (a:Report,b:Report) => {

      // let out = 0;
      // let tstA = Number(a.unit_number);
      // let tstB = Number(b.unit_number);
      // let uA = isNaN(tstA) ? a.unit_number : tstA;
      // let uB = isNaN(tstB) ? b.unit_number : tstB;
      // if(typeof uA === 'number' && typeof uB === 'number') {
      //   out = uA > uB ? 1 : uA < uB ? -1 : 0;
      // } else if(typeof uA === 'string' && typeof uB === 'string') {
      //   out = uA > uB ? 1 : uA < uB ? -1 : 0;
      // } else if(!uA && !uB) {
      //   out = 0;
      // } else if(uA === undefined || !uA) {
      //   out = 1;
      // } else if(uB === undefined || !uB) {
      //   out = 1;
      // } else if(typeof uA === 'number') {
      //   out = -1;
      // } else if(typeof uB === 'number') {
      //   out = 1;
      // } else {
      //   out = 0;
      // }
      // // out = uA > uB ? 1 : uA < uB ? -1 : 0;
      // return out;
      // let out = 0;
      // let tmpA:any = a.unit_number ? a.unit_number : "SHOP";
      // let tmpB:any = b.unit_number ? b.unit_number : "SHOP";
      // let tstA = Number(tmpA);
      // let tstB = Number(tmpB);
      // let uA = isNaN(tstA) ? String(tmpA).trim() : tstA;
      // let uB = isNaN(tstB) ? String(tmpA).trim() : tstB;
      // if (typeof uA === 'number' && typeof uB === 'number') {
      //   out = uA > uB ? 1 : uA < uB ? -1 : 0;
      // } else if (typeof uA === 'string' && typeof uB === 'string') {
      //   if (uA === 'SHOP' && uB === 'SHOP') {
      //     out = 0;
      //   } else if (uA === 'SHOP') {
      //     out = 1;
      //   } else if (uB === 'SHOP') {
      //     out = -1;
      //   } else {
      //     out = uA > uB ? 1 : uA < uB ? -1 : 0;
      //   }
      // } else if (!uA && !uB) {
      //   out = 0;
      // } else if (uA === undefined || !uA) {
      //   out = 1;
      // } else if (uB === undefined || !uB) {
      //   out = -1;
      // } else if (typeof uA === 'number') {
      //   out = -1;
      // } else if (typeof uB === 'number') {
      //   out = 1;
      // } else {
      //   out = 0;
      // }
      // if (out === 0) {
      //   let dA = a.report_date;
      //   let dB = b.report_date;
      //   out = dA > dB ? 1 : dA < dB ? -1 : 0;
      // }
      // if (out === 0) {
      //   let tA = a.technician;
      //   let tB = b.technician;
      //   out = tA > tB ? 1 : tA < tB ? -1 : 0;
      // }
      // return out;
    // });
  }

  public sortReports(a:Report, b:Report) {
    let out = 0;
    let tmpA: any = a.unit_number ? a.unit_number : "SHOP";
    let tmpB: any = b.unit_number ? b.unit_number : "SHOP";
    let tstA = Number(tmpA);
    let tstB = Number(tmpB);
    let uA = isNaN(tstA) ? String(tmpA).trim() : tstA;
    let uB = isNaN(tstB) ? String(tmpB).trim() : tstB;
    let dbg = `sortReports(): Comparing '${uA}' and '${uB}': `;
    if (typeof uA === 'number' && typeof uB === 'number') {

      out = uA > uB ? 1 : uA < uB ? -1 : 0;
    } else if (typeof uA === 'string' && typeof uB === 'string') {
      if (uA === 'SHOP' && uB === 'SHOP') {
        out = 0;
      } else if (uA === 'SHOP') {
        out = 1;
      } else if (uB === 'SHOP') {
        out = -1;
      } else {
        out = uA > uB ? 1 : uA < uB ? -1 : 0;
      }
    } else if (!uA && !uB) {
      out = 0;
    } else if (uA === undefined || !uA) {
      out = 1;
    } else if (uB === undefined || !uB) {
      out = -1;
    } else if (typeof uA === 'number') {
      out = -1;
    } else if (typeof uB === 'number') {
      out = 1;
    } else {
      out = 0;
    }
    dbg += `${out} ... `;
    if (out === 0) {
      let dA = a.report_date;
      let dB = b.report_date;
      out = dA > dB ? 1 : dA < dB ? -1 : 0;
      dbg += `'${dA}' to '${dB}': ${out} ... `
    }
    if (out === 0) {
      let tA = a.technician;
      let tB = b.technician;
      out = tA > tB ? 1 : tA < tB ? -1 : 0;
      dbg += `'${tA}' to '${tB}': ${out} ... `
    }
    dbg += ` RESULT: ${out}`
    // Log.l(dbg);
    return out;
  }

  // public periodChanged(period:PayrollPeriod) {
  //   let start = moment(period.start_date).format("YYYY-MM-DD");
  //   let end   = moment(period.end_date).format("YYYY-MM-DD");
  //   let sites = this.sites;
  //   let site  = this.site;

  //   this.reports = this.allReports.filter((a:Report) => {
  //     let report_date = a.report_date;
  //     return report_date >= start && report_date <= end && _matchReportSite(a, site);
  //   }).sort((a:Report,b:Report) => {
  //     let out = 0;
  //     let tstA = Number(a.unit_number);
  //     let tstB = Number(b.unit_number);
  //     let uA = isNaN(tstA) ? a.unit_number : tstA;
  //     let uB = isNaN(tstB) ? b.unit_number : tstB;
  //     out = uA > uB ? 1 : uA < uB ? -1 : 0;
  //     return out;
  //   });
  // }

  public updatePeriod(period:PayrollPeriod) {
    this.period = period;
    Log.l("updatePeriod(): Called with period:\n", period);
    this.parameterChange();
    this.initializeInvoice();
    this.generateInvoiceGrid();
    // let invoice = this.generateInvoiceGrid();
    // this.invoices.push(invoice);

  }

  public updateSite(site:Jobsite) {
    this.site = site;
    Log.l("updateSite(): Called with period:\n", site);
    this.parameterChange();
    this.initializeInvoice();
    this.generateInvoiceGrid();
    // let invoice = this.generateInvoiceGrid();
    // this.invoices.push(invoice);
  }

  // public editReport(rowIndex:number) {
  public viewReport(report:Report|string) {
    if(typeof report === 'string') {
      return;
    } else {
      let tech = this.getTech(report);
      let site = this.getSite(report);
      let rowIndex = this.reports.indexOf(report);
      this.report = report;
      this.tech = tech;
      this.site = site;
      let data = { report: report, reports: this.reports, tech: tech, site: site };
      Log.l(`editReport(${rowIndex}): Editing with data:\n`, data);
      this.updateHeader(rowIndex + 1);
      this.showReport();
      // let modal = this.modalCtrl.create("View Work Report", data);
      // modal.onDidDismiss(data => {
      //   Log.l("editReport(): Modal dismissed.");
      //   if(data) {
      //     Log.l("editReport(): Modal sent back data:\n", data);
      //   };
      // });
      // modal.present();
    }
    // let report:Report = this.reports[rowIndex];
  }

  public showReport() {
    this.reportViewVisible = true;
  }

  public hideReport() {
    this.reportViewVisible = false;
  }

  public toggleReport() {
    this.reportViewVisible = !this.reportViewVisible;
  }

  public updateHeader(index:number) {
    let idx = index;
    let count = this.reports.length;
    this.reportViewTitle = `Report (${index} / ${count})`;
  }

  public updateReport(event:any) {
    Log.l("updateReport(): Received event:\n", event);
    this.reportViewVisible = false;
  }

  public changeReport(event:any) {
    let count = this.reports.length;
    let index = event;
    this.reportViewTitle = `Report (${index+1} / ${count})`;
  }

  public getTech(report:Report) {
    let name = report.username;
    this.tech = this.techs.find((a:Employee) => {
      return a.username === name;
    });
    return this.tech;
  }

  public getSite(report:Report) {
    let cli  = this.data.getFullClient(report.client);
    let loc  = this.data.getFullLocation(report.location);
    let lid  = this.data.getFullLocID(report.location_id);
    let site = this.sites.find((a:Jobsite) => {
      let client = cli.name.toUpperCase();
      let location = loc.name.toUpperCase();
      let locID = lid.name.toUpperCase();
      let siteClient   = a.client.name;
      let siteLocation = a.location.name;
      let siteLocID    = a.locID.name;
      return siteClient === client && siteLocation === location && siteLocID === locID;
    });
    this.site = site;
    return site;
  }

  public printInvoices(event?:any) {
    // Log.l("printInvoices(): event is:\n", event);
    // let element = this.printArea.nativeElement;
    // let contents = element.innerHTML;
    // this.iframeVisible = true;
    // this.dataReady = false;
    // let iframe = this.printIframe.nativeElement;
    window.print();
  }

  public copyTable(event?:any) {
    let table = this.printArea.nativeElement;
    let el = table.innerHTML;
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
    this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
  }

  public refreshData(event?:any) {
    this.parameterChange();
    this.initializeInvoice();
    this.generateInvoiceGrid();
  }

  public async numberInvoices(event?:any) {
    Log.l("numberInvoices(): Event is:\n", event);
    // let promises = [];
    let count = this.invoices.length;
    let invoice_numbers = await this.invoiceService.getNextInvoiceNumber('KN', count);
    // for(let invoice of this.invoices) {
      // let invoice_number = await this.invoiceService.getNextInvoiceNumber('KN', count);
    for(let i = 0; i < count; i++) {
      let invoice:Invoice = this.invoices[i];
      let oldInvoiceNumber = invoice.getInvoiceNumber();
      let oldID = invoice.getInvoiceID();
      let invoice_number = invoice_numbers[i];
      invoice.invoice_number = String(invoice_number);
      let newID = invoice.generateInvoiceID();
    }
  }

  public openInvoices(event?: any) {
    Log.l("openInvoices(): Event is:\n", event);
    this.invoiceOpenVisible = true;
  }

  public invoicesOpen(event?:any) {
    Log.l("invoicesOpen(): Got event:\n", event);
    this.invoiceOpenVisible = false;
    this.invoices = event || this.invoices || [];
  }

  public cancelOpen(event?:any) {
    Log.l("cancelOpen(): Got event:\n", event);
    this.invoiceOpenVisible = false;
    // this.invoices = event || this.invoices || [];
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
          this.transactionTotal = this.invoices.length;
          let results = await this.server.saveInvoices('KN', this.invoices);
          Log.l("saveInvoices(): Success, results were:\n", results);
          for(let result of results) {
            let id = result.id, rev = result.rev;
            let inv = this.invoices.find((a:Invoice) => {
              return a._id === id;
            });
            inv._rev = rev;
          }
          this.notify.addSuccess("SUCCESS", "Saved invoices successfully.", 3000);
        } else {

        }
      }
    } catch (err) {
      Log.l("saveInvoices(): Caught error!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving invoices: '${err.message}'`, 10000);
    }
  }

  public async clearInvoices(event?:any) {
    Log.l("clearInvoices(): User clicked with event:\n", event);
    try {
      let clear = await this.alert.showConfirmYesNo("CLEAR INVOICES", "Do you want to clear the current invoice display?");
      if (clear) {
        // let result = await this.server.saveInvoices(this.invoices);
        // Log.l("saveInvoices(): Success, results were:\n", result);
        this.oldInvoices = this.invoices;
        this.invoices = [];
        this.notify.addInfo("CLEARED", "Invoice display cleared.", 3000);
      } else {

      }
    } catch (err) {
      Log.l("clearInvoices(): Caught error!");
      Log.e(err);
      this.notify.addError("ERROR", `Error clearing invoices: '${err.message}'`, 10000);
    }
  }
}
