import { NgModule         } from '@angular/core'   ;
import { IonicPageModule  } from 'ionic-angular'   ;
import { CommentsBetaPage } from './comments-beta' ;

@NgModule({
  declarations: [
    CommentsBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentsBetaPage),
  ],
})
export class CommentsBetaPageModule {}
