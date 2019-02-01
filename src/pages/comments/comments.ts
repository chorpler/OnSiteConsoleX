import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core'            ;
import { IonicPage, NavController, NavParams                 } from 'ionic-angular'            ;
import { ViewController                                      } from 'ionic-angular'            ;
import { Log, Moment, moment, isMoment                       } from 'domain/onsitexdomain'     ;
import { Employee, Comment                                   } from 'domain/onsitexdomain'     ;
import { DBService                                           } from 'providers/db-service'     ;
import { ServerService                                       } from 'providers/server-service' ;
import { AlertService                                        } from 'providers/alert-service'  ;
import { OSData                                              } from 'providers/data-service'   ;

@IonicPage({name: 'Comments'})
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage implements OnInit,OnDestroy {
  public title    : string         = "Comments" ;
  public comments : Comment[] = []         ;
  public comment  : Comment        ;
  public modalMode: boolean        = false      ;
  public dataReady: boolean        = false      ;

  constructor(
    public viewCtrl  : ViewController ,
    public navCtrl   : NavController  ,
    public navParams : NavParams      ,
    public db        : DBService      ,
    public server    : ServerService  ,
    public alert     : AlertService   ,
    public data      : OSData         ,
  ) {
    window['onsitecomments']  = this;
    window['onsitecomments2'] = this;
    window['p'] = this;
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

  public async fetchAllComments():Promise<any> {
    let spinnerID;
    try {
      if(this.navParams.get('modalMode') != undefined) { this.modalMode = this.navParams.get('modalMode'); }

      spinnerID = await this.alert.showSpinnerPromise("Fetching comments from server...");
      let res:Comment[] = await this.server.getComments();
      this.comments = res.sort((a:Comment,b:Comment) => {
        let dA = a.getCommentDate();
        let dB = b.getCommentDate();
        return dA > dB ? -1 : dA < dB ? 1 : 0;
      });
      this.comment = new Comment();
      this.alert.hideSpinner();
      Log.l("fetchAllComments(): ")
      this.dataReady = true;
      this.setPageLoaded();
      return res;
    } catch(err) {
      Log.l(`fetchAllComments(): Error fetching comments`);
      Log.e(err);
      let out:any = await this.alert.hideSpinnerPromise(spinnerID);
      this.alert.showAlert("ERROR", "Error fetching comments from server:<br>\n<br>\n" + err.message);
      // throw err;
    }
  }

  public openComment(comment:Comment) {
    this.comment = comment;
  }

  public done() {
    Log.l("This does nothing.");
    this.alert.showAlert("OK", "This button doesn't actually do anything right now.");
  }

  public setPageLoaded() {
    this.data.currentlyOpeningPage = false;
  }

  public closeModal(evt?:any) {
    this.viewCtrl.dismiss();
  }

}
