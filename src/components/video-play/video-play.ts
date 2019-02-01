// import { Pipe, PipeTransform                       } from '@angular/core'                 ;
// import { SafePipe                                  } from '../../pipes/safe'              ;
import { Component, Input, Output, EventEmitter, NgZone,  } from '@angular/core'                 ;
import { OnInit, OnDestroy, ViewChild, ElementRef, } from '@angular/core'                 ;
import { Log                                       } from 'domain/onsitexdomain' ;
// import { DomSanitizer, SafeHtml                    } from '@angular/platform-browser'     ;

@Component({
  selector: 'video-play',
  templateUrl: 'video-play.html',
})
export class VideoPlayComponent implements OnInit,OnDestroy {
  @ViewChild('videoElement') videoElement:ElementRef;
  @Output('onEnd') onEnd = new EventEmitter<any>();
  public isVisible:boolean = true;
  // @Input('popoverContents') popoverContents:any;
  // public popoverContents:SafeHtml = "";
  constructor(
    // public sanitizer:DomSanitizer,
  ) {
    window['onsitevideocomponent'] = this;
  }

  ngOnInit() {
    Log.l("VideoPlayComponent: ngOnInit fired.");
    let video = this.videoElement.nativeElement;
    setTimeout(() => {
      let video = this.videoElement.nativeElement;
      video.play();
    }, 300);
  }

  ngOnDestroy() {
    Log.l("VideoPlayComponent: ngOnDestroy fired.");
  }

  public cancel() {
    // this.viewCtrl.dismiss();
    this.onEnd.emit(true);

  }

  public videoEnd() {
    Log.l("VideoPlayComponent: video ended.");
    this.cancel();
  }

}
