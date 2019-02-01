import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core'            ;
import { IonicPage, NavController, NavParams                 } from 'ionic-angular'            ;
import { Log, Moment, moment, isMoment                       } from 'domain/onsitexdomain'     ;
import { Employee, Comment                                   } from 'domain/onsitexdomain'     ;
import { DBService                                           } from 'providers/db-service'     ;
import { ServerService                                       } from 'providers/server-service' ;
import { AlertService                                        } from 'providers/alert-service'  ;
import { OSData                                              } from 'providers/data-service'   ;

@IonicPage({name: 'Comments Beta'})
@Component({
  selector: 'page-comments-beta',
  templateUrl: 'comments-beta.html',
})
export class CommentsBetaPage implements OnInit,OnDestroy {
  public title    : string         = "Comments Beta" ;
  public comments : Comment[] = []         ;
  public comment  : Comment        ;
  public dataReady: boolean        = false      ;

  constructor(
    public navCtrl   : NavController ,
    public navParams : NavParams     ,
    public db        : DBService     ,
    public server    : ServerService ,
    public alert     : AlertService  ,
    public data      : OSData        ,
  ) {
    window['onsitecommentsbeta'] = this;
  }

  ngOnInit() {
    Log.l('CommentsPage: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.fetchAllComments();
    }
  }

  ngOnDestroy() {
    Log.l('CommentsPage: ngOnDestroy() fired');
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public fetchAllComments() {
    this.alert.showSpinner("Fetching comments from server...");
    this.server.getComments().then(res => {
      this.comments = res.sort((a:Comment,b:Comment) => {
        let dA = a.getCommentDateAsString();
        let dB = b.getCommentDateAsString();
        return dA > dB ? -1 : dA < dB ? 1 : 0;
      });
      this.comment = new Comment();
      this.alert.hideSpinner();
      Log.l("fetchAllComments(): ")
      this.setPageLoaded();
      this.dataReady = true;
    }).catch(err => {
      this.alert.hideSpinner();
      Log.l("fetchAllComments(): Error fetching comments from server.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error fetching comments from server:<br>\n<br>\n" + err.message);
    });
  }

  public openComment(comment:Comment) {
    this.comment = comment;
  }

  public done() {
    Log.l("This does nothing.");
    this.alert.showAlert("OK", "This button doesn't actually do anything right now.");
  }

}
