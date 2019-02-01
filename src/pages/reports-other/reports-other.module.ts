import { NgModule                      } from '@angular/core'   ;
import { IonicPageModule               } from 'ionic-angular'   ;
import { ReportsOtherPage              } from './reports-other' ;
import { DataTableModule, SharedModule } from 'primeng/primeng' ;
import { CalendarModule                } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    ReportsOtherPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsOtherPage),
    DataTableModule,
    SharedModule,
    CalendarModule,
  ],
  exports: [
    ReportsOtherPage,
  ]
})
export class ReportsOtherPageModule {}
