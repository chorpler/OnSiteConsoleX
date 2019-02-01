import { NgModule          } from '@angular/core'       ;
import { IonicPageModule   } from 'ionic-angular'       ;
import { MessagesBetaPage  } from './messages-beta'     ;
import { CalendarModule    } from 'primeng/calendar'    ;
import { EditorModule      } from 'primeng/editor'      ;
import { ListboxModule     } from 'primeng/listbox'     ;
import { MultiSelectModule } from 'primeng/multiselect' ;

@NgModule({
  declarations: [
    MessagesBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesBetaPage),
    CalendarModule,
    EditorModule,
    ListboxModule,
    MultiSelectModule,
  ],
  exports: [
    MessagesBetaPage,
  ]
})
export class MessagesBetaPageModule {}
