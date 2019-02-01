import { NgModule        } from '@angular/core'   ;
import { IonicPageModule } from 'ionic-angular'   ;
import { MessagesPage    } from './messages'      ;
import { CalendarModule  } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    MessagesPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesPage),
    CalendarModule,
  ],
  exports: [
    MessagesPage,
  ]
})
export class MessagesPageModule {}
