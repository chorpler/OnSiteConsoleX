// import { EditorComponentModule                          } from 'components/editor'        ;
import { NgModule                              } from '@angular/core'            ;
import { CommonModule                          } from '@angular/common'          ;
import { FormsModule                           } from '@angular/forms'           ;
import { IonicPageModule                       } from 'ionic-angular'            ;
import { EmployeesBetaPage                     } from './employees-beta'         ;
import { SharedModule                          } from 'primeng/primeng'          ;
import { DataTableModule                       } from 'primeng/primeng'          ;
import { TableModule                           } from 'primeng/table'            ;
import { MultiSelectModule, ContextMenuModule, } from 'primeng/primeng'          ;
import { EmployeeViewComponentModule           } from 'components/employee-view' ;

@NgModule({
  declarations: [
    EmployeesBetaPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicPageModule.forChild(EmployeesBetaPage),
    DataTableModule,
    // EditorComponentModule,
    // DialogModule,
    SharedModule,
    TableModule,
    MultiSelectModule,
    ContextMenuModule,
    EmployeeViewComponentModule,
  ],
  exports: [
    EmployeesBetaPage,
  ]
})
export class EmployeesBetaPageModule {}
