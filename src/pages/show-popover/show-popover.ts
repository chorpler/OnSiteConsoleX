import { Component, Input                                    } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'                 ;
import { Log                                                 } from 'domain/onsitexdomain' ;
import { Pipe, PipeTransform                                 } from '@angular/core'                 ;
import { DomSanitizer, SafeHtml                              } from '@angular/platform-browser'     ;
import { SafePipe                                            } from '../../pipes/safe'              ;

@IonicPage({name: 'Show Popover'})
@Component({
  selector: 'page-show-popover',
  templateUrl: 'show-popover.html',
})
export class ShowPopoverPage {

  // @Input('popoverContents') popoverContents:any;
  public popoverContents:SafeHtml = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public sanitizer:DomSanitizer) {
    let popoverContents = `
<video width="640" height="480" autoplay (ended)="videoEnd()">
  <source src="/assets/video/bad_snake.mp4" type="video/mp4">
  Bad! That is a BAD snake yaaaAAAAAH
</video>`;
    if(this.navParams.get('popoverContents') !== undefined) {
       popoverContents = this.navParams.get('popoverContents');
    }
    this.popoverContents = this.sanitizer.bypassSecurityTrustHtml(popoverContents);
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ShowPopoverPage');
  }

  public cancel() {
    this.viewCtrl.dismiss();
  }

  public videoEnd() {
    Log.l("ShowPopover: video ended.");
    this.cancel();
  }

}
