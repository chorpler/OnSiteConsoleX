import { NgModule             } from '@angular/core'                                                    ;
// import { IonicPageModule      } from 'ionic-angular'                                                    ;
import { GoogleCharts          } from './google-charts.directive'                                         ;
// import { GoogleChartComponent } from './google-chart'                                                   ;
// import { GoogleChartComponent } from './google-chart.component'                                         ;

@NgModule({
  declarations: [
    // GoogleChartComponent,
    GoogleCharts,
  ],
  entryComponents: [
    // GoogleChartComponent,
  ],
  imports: [
    // GoogleChartComponent,
    // GoogleChart,
    // IonicPageModule.forChild(GoogleChartComponent),
    // IonicPageModule.forChild(GoogleChart),
  ],
  exports: [
    // GoogleChartComponent,
    GoogleCharts,
  ],
})
export class GoogleChartsModule { }
