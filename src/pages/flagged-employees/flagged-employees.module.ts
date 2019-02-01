import { NgModule                    } from '@angular/core'                                 ;
import { CommonModule                } from '@angular/common'                               ;
import { FormsModule                 } from '@angular/forms'                                ;
import { IonicPageModule             } from 'ionic-angular'                                 ;
import { FlaggedEmployeesPage        } from './flagged-employees'                           ;
import { SharedModule                } from 'primeng/shared'                                ;
import { DataTableModule             } from 'primeng/datatable'                             ;
import { MultiSelectModule           } from 'primeng/multiselect'                           ;
import { DialogModule                } from 'primeng/dialog'                                ;
import { ContextMenuModule,          } from 'primeng/contextmenu'                           ;
// import { EditorComponentModule       } from 'components/editor/editor.module'               ;
import { EmployeeViewComponentModule } from 'components/employee-view/employee-view.module' ;

@NgModule({
  declarations: [
    FlaggedEmployeesPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicPageModule.forChild(FlaggedEmployeesPage),
    DataTableModule,
    SharedModule,
    MultiSelectModule,
    DialogModule,
    ContextMenuModule,
    // EditorComponentModule,
    EmployeeViewComponentModule,
  ],
  exports: [
    FlaggedEmployeesPage,
  ]
})
export class FlaggedEmployeesPageModule {}
