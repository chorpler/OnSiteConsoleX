/**
 * Name: ReportAny type
 * Vers: 1.0.3
 * Date: 2019-08-22
 * Auth: David Sargeant
 * Logs: 1.0.2 2019-08-22: Added ReportWithLocation
 * Logs: 1.0.2 2019-08-19: Added ReportReal
 * Logs: 1.0.1 2019-08-16: Added ReportMaintenance
 * Logs: 1.0.0 2019-08-08: Created
 */

 import { Report            } from './report'            ;
 import { ReportOther       } from './reportother'       ;
 import { ReportLogistics   } from './reportlogistics'   ;
 import { ReportDriving     } from './reportdriving'     ;
 import { ReportTimeCard    } from './reporttimecard'    ;
 import { ReportMaintenance } from './reportmaintenance' ;

export type ReportAny = Report|ReportOther|ReportLogistics|ReportDriving|ReportMaintenance|ReportTimeCard;
export type ReportReal = Report|ReportLogistics|ReportDriving|ReportMaintenance|ReportTimeCard;
export type ReportWithLocation = ReportLogistics|ReportDriving;
