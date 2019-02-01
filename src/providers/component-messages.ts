import { Injectable                                 } from '@angular/core'        ;
import { Observable, Subject,                       } from 'rxjs'                 ;
import { Log, Moment, isMoment                      } from 'domain/onsitexdomain' ;
import { Employee, Jobsite, Report, ReportOther,    } from 'domain/onsitexdomain' ;
import { Shift, PayrollPeriod, Schedule, Schedules, } from 'domain/onsitexdomain' ;
import { Notice,                                    } from 'domain/onsitexdomain' ;

@Injectable()
export class ComponentMessages {
  private subject        = new Subject<any>() ;
  private ePeriod        = new Subject<any>() ;
  private period         = new Subject<any>() ;
  private shift          = new Subject<any>() ;
  private tableMode      = new Subject<any>() ;
  private calcMode       = new Subject<any>() ;
  private invoiceSite    = new Subject<any>() ;
  private invoiceReports = new Subject<any>() ;
  private DPSCalcGrid    = new Subject<any>() ;
  private datastore      = new Subject<any>() ;
  private dbProgress     = new Subject<any>() ;
  private notice         = new Subject<Notice>();
  private notices        = new Subject<Notice[]>();
  private appReady       = new Subject<boolean>();
  private prefsChange    = new Subject<any>();

  public constructor() {
    window['onsitecomponentmessages'] = this;
  }

  public updateEmployeePeriodMap(ePeriod:Map<Employee,PayrollPeriod>) {
    this.ePeriod.next({ ePeriod: ePeriod });
  }

  public updatePeriod(period:PayrollPeriod) {
    this.period.next({ period: period });
  }

  public updateShift(shift:Shift) {
    this.shift.next({ shift: shift });
  }

  public updateDPSCalculationsGrid(grid:Array<Array<any>>) {
    this.DPSCalcGrid.next({ grid: grid });
  }

  public updateTableMode(mode:string) {
    this.tableMode.next({mode: mode});
  }

  public updateCalcMode(mode:string) {
    this.calcMode.next({mode: mode});
  }

  public updateInvoiceSite(site:Jobsite) {
    this.invoiceSite.next({site: site});
  }

  public updateInvoiceReports(reports:Array<Report>) {
    this.invoiceReports.next({reports: reports});
  }

  public updateDatastore(type:string, payload:any) {
    this.datastore.next({type:type, payload:payload});
  }

  public updateDBProgress(type:string, id:string) {
    this.dbProgress.next({type: type, id: id});
  }

  public updateNotices(msgs:Notice[]) {
    this.notices.next(msgs);
  }

  public updateNotice(msg:Notice) {
    this.notice.next(msg);
  }

  public setAppReady(value:boolean) {
    this.appReady.next(value);
  }

  public updatePrefs() {
    this.prefsChange.next();
  }

  public sendMessage(message: string) {
    this.subject.next({ text: message });
  }

  public clearMessage() {
    this.subject.next();
  }

  public getMessage():Observable<any> {
    return this.subject.asObservable();
  }

  public periodUpdated():Observable<any> {
    return this.period.asObservable();
  }

  public shiftUpdated():Observable<any> {
    return this.shift.asObservable();
  }

  public employeePeriodMapUpdated():Observable<any> {
    return this.ePeriod.asObservable();
  }

  public dpsCalculationsGridUpdated():Observable<any> {
    return this.DPSCalcGrid.asObservable();
  }

  public tableModeUpdated():Observable<any> {
    return this.tableMode.asObservable();
  }

  public calcModeUpdated():Observable<any> {
    return this.calcMode.asObservable();
  }

  public invoiceSiteUpdated():Observable<any> {
    return this.invoiceSite.asObservable();
  }

  public invoiceReportsUpdated():Observable<any> {
    return this.invoiceReports.asObservable();
  }

  public datastoreUpdated():Observable<any> {
    return this.datastore.asObservable();
  }

  public dbProgressUpdated():Observable<any> {
    return this.dbProgress.asObservable();
  }

  public noticesUpdated():Observable<Notice[]> {
    return this.notices.asObservable();
  }

  public noticeUpdated():Observable<Notice> {
    return this.notice.asObservable();
  }

  public appReadyStatus():Observable<boolean> {
    return this.appReady.asObservable();
  }

  public prefsUpdated():Observable<any> {
    return this.prefsChange.asObservable();
  }
}

