// import { EditorComponentModule       } from 'components/editor'        ;
import { NgModule                    } from '@angular/core'            ;
import { CommonModule                } from '@angular/common'          ;
import { FormsModule                 } from '@angular/forms'           ;
import { IonicPageModule             } from 'ionic-angular'            ;
import { EmployeesPage               } from './employees'              ;
import { SharedModule                } from 'primeng/shared'           ;
import { TableModule                 } from 'primeng/table'            ;
import { MultiSelectModule,          } from 'primeng/multiselect'      ;
import { ContextMenuModule,          } from 'primeng/contextmenu'      ;
import { EmployeeViewComponentModule } from 'components/employee-view' ;

@NgModule({
  declarations: [
    EmployeesPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicPageModule.forChild(EmployeesPage),
    SharedModule,
    TableModule,
    MultiSelectModule,
    ContextMenuModule,
    EmployeeViewComponentModule,
  ],
  exports: [
    EmployeesPage,
  ]
})
export class EmployeesPageModule {}
