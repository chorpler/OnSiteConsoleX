import { NgModule        } from '@angular/core' ;
import { IonicPageModule } from 'ionic-angular' ;
import { CommentsPage    } from './comments'    ;
import { MomentModule    } from 'ngx-moment'    ;

@NgModule({
  declarations: [
    CommentsPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentsPage),
    MomentModule,
  ],
})
export class CommentsPageModule {}
