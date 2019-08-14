/**
 * Name: ReportAny type
 * Vers: 1.0.0
 * Date: 2019-08-08
 * Auth: David Sargeant
 * Logs: 1.0.0 2019-08-08: Created
 */

 import { Report          } from './report'          ;
 import { ReportOther     } from './reportother'     ;
 import { ReportLogistics } from './reportlogistics' ;
 import { ReportDriving   } from './reportdriving'   ;
 import { ReportTimeCard  } from './reporttimecard'  ;

export type ReportAny = Report|ReportOther|ReportLogistics|ReportDriving|ReportTimeCard;
