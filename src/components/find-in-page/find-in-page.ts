import { Subscription                                                               } from 'rxjs'                                 ;
import { sprintf                                                                    } from 'sprintf-js'                           ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input, Output } from '@angular/core'                        ;
import { EventEmitter, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef   } from '@angular/core'                        ;
import { Log, } from 'domain/onsitexdomain'                 ;
import * as findAndReplaceDOMText from 'findandreplacedomtext';

@Component({
  selector: 'find-in-page',
  templateUrl: 'find-in-page.html',
})
export class FindInPageComponent implements OnInit,OnDestroy {
  @Output('close') close = new EventEmitter<any>();
  @ViewChild('findInput') findInput:ElementRef;
  public oldPage           : any                            ;
  public title             : string  = "Find"               ;
  public caseSensitive     : boolean = false                ;
  public proseOnly         : boolean = false                ;
  public useRegex          : boolean = true                 ;
  public current           : number   = 0                   ;
  public total             : number   = 0                   ;
  public search            : string   = ""                  ;
  public prevSearch        : string   = ""                  ;
  public regexSearch       : RegExp                         ;
  public matches           : any[]    = []                  ;
  public findOptions       : any                            ;
  public countFinder       : any                            ;
  public matchFinder       : any                            ;
  public focusDelay        : number  = 100                  ;
  public findScrollTimeout : number  = 50                   ;
  public findScrollType    : 'auto'|'smooth'  = "auto"      ;
  public findScrollAlways  : boolean = false                ;
  public isVisible         : boolean = true                 ;
  public dialogDrag        : boolean = false                ;
  public dialogResize      : boolean = false                ;
  public dialogStyle       : any = {
    // 'min-height': '100px',
    'min-height': '50px',
    top: '60px',
    right: '20px',
    left: 'unset',
  };

  constructor(
    public application       : ApplicationRef    ,
    public changeDetector    : ChangeDetectorRef ,
    public zone              : NgZone            ,
    // public alert             : AlertService      ,
    // public db                : DBService         ,
    // public server            : ServerService     ,
    // public data              : OSData            ,
    // public dispatch          : DispatchService   ,
    // public notify            : NotifyService     ,
  ) {
    window['findinpagecomponent']  = this;
    // window['findinpagecomponent2'] = this;
    this.oldPage = window['p'];
    window['p'] = this;
  }

  ngOnInit() {
    Log.l("FindInPageComponent: ngOnInit() fired.");
    this.focusOnFindInput(this.focusDelay);
  }

  ngOnDestroy() {
    Log.l("FindInPageComponent: ngOnDestroy() fired.");
    if(this.matchFinder && this.matchFinder.reverts && this.matchFinder.reverts.length) {
      this.matchFinder.revert();
    }
    if(this.countFinder && this.countFinder.reverts && this.countFinder.reverts.length) {
      this.countFinder.revert();
    }
    window['p'] = this.oldPage;
  }

  public focusOnFindInput(delay?:number) {
    let in1:HTMLInputElement = this.findInput.nativeElement;
    if(!delay) {
      Log.l("focusOnFindInput: Focusing on input right now ...");
      in1.focus();
    } else {
      let ms:number = typeof delay === 'number' ? delay : this.focusDelay;
      Log.l(`focusOnFindInput: Focusing on input after ${ms} milliseconds ...`);
      setTimeout(() => {
        in1.focus();
      }, ms);
    }
  }

  public inputKeyPressed(evt:KeyboardEvent) {
    let e:KeyboardEvent = evt;
    let key:string = e.key;
    Log.l(`inputKeyPressed(): Key is '${key}'`);
    let search:string = this.search + key;
    switch(key) {
      // case 'C':
      //   if(e.altKey || e.metaKey) {
      //     this.toggleControl(1);
      //   } else {
      //     this.findMatch(search, false);
      //   }
      //   break;
      // case 'W':
      //   if(e.altKey || e.metaKey) {
      //     this.toggleControl(2);
      //   } else {
      //     this.findMatch(search, false);
      //   }
      //   break;
      // case 'R':
      //   if(e.altKey || e.metaKey) {
      //     this.toggleControl(3);
      //   } else {
      //     this.findMatch(search, false);
      //   }
      //   break;
      // case 'c':
      //   if(e.altKey || e.metaKey) {
      //     this.toggleControl(1);
      //   } else {
      //     this.findMatch(search, false);
      //   }
      //   break;
      // case 'w':
      //   if(e.altKey || e.metaKey) {
      //     this.toggleControl(2);
      //   } else {
      //     this.findMatch(search, false);
      //   }
      //   break;
      // case 'r':
      //   if(e.altKey || e.metaKey) {
      //     this.toggleControl(3);
      //   } else {
      //     this.findMatch(search, false);
      //   }
      //   break;
      default:
        this.findMatch(search, false);
        return;
    }
  }

    public inputKeyUp(evt:KeyboardEvent) {
    // Log.l(`inputKeyPressed(): Event is: `, evt);
    let e:KeyboardEvent = evt;
    let key:string = e.key;
    Log.l(`inputKeyUp(): Key is '${key}'`);
    switch(key) {
      case 'C':
        if(e.altKey || e.metaKey) {
          this.toggleControl(1);
        }
        break;
      case 'W':
        if(e.altKey || e.metaKey) {
          this.toggleControl(2);
        }
        break;
      case 'R':
        if(e.altKey || e.metaKey) {
          this.toggleControl(3);
        }
        break;
      case 'c':
        if(e.altKey || e.metaKey) {
          this.toggleControl(1);
        }
        break;
      case 'w':
        if(e.altKey || e.metaKey) {
          this.toggleControl(2);
        }
        break;
      case 'r':
        if(e.altKey || e.metaKey) {
          this.toggleControl(3);
        }
        break;
      case 'F3':
        if(e.shiftKey) {
          this.findPrevious();
        } else {
          this.findNext();
        }
        break;
      case 'Enter':
        if(e.shiftKey) {
          this.findPrevious();
        } else {
          this.findNext();
        }
        break;
      case 'Escape':
        this.closeSearchWindow();
        break;
      // case 'KeyG':
      //   if(e.ctrlKey) {
      //     electron_1.ipcRenderer.sendToHost('electron-in-page-search:close');
      //   }
      //   break;
      case 'Control':
        break;
      case 'Command':
        break;
      case 'Alt':
        break;
      case 'Meta':
        break;
      default:
        // this.findMatch(this.search, )
        return;
    }

  }

  public async updateSearch(search:string, evt?:any):Promise<any> {
    try {
      Log.l(`updateSearch(): Search is: '${this.search}'`);
      let cs:boolean = this.caseSensitive;
      let regexOpts:string = "g";
      if(!cs) {
        regexOpts += "i";
      }
      let rex:RegExp = new RegExp(search, regexOpts);
      this.findOptions = {

      };
      // return res;
    } catch(err) {
      Log.l(`updateSearch(): Error trying to update search`);
      Log.e(err);
      throw err;
    }
  }

  public fardomCount(portion:any, match:any) {
    this.total++;
    this.matches.push(match);
    return match;
  }

  public fardomReplace(portion:any, match:any):HTMLElement {
    // totalFinds++;
    // this.matches.push(match);
    let span:HTMLElement = document.createElement('span');
    // var classname = 'fardom-found find_' + (match.index + 1);
    let idx:number = match && typeof match.index === 'number' ? match.index + 1 : 0;
    let classname:string = 'find_' + (idx + 1);
    let curFind:number = this.current;
    // let curFind = currentFind < 0 ? totalFinds - 1 : currentFind >= totalFinds ? 0 : currentFind;
    // console.log(`Replace(): Match index is ${idx} and curFind is ${curFind}`);
    if(idx === curFind) {
      span.className = "fardom-found-current "  + classname;
    } else {
      span.className = "fardom-found " + classname;
    }
    let matchText:string = match[0];
    let newNode:Text = document.createTextNode(matchText);
    span.appendChild(newNode);
    return span;
  }

  public findNext(evt?:Event):string {
    Log.l(`findNext(): Called`);
    let result:string = this.findMatch(this.search, false);
    if(this.total > 0) {
      this.showCurrentFindResult();
    }
    return result;
  }

  public findPrevious(evt?:Event):string {
    Log.l(`findPrevious(): Called`);
    let result:string = this.findMatch(this.search, true);
    if(this.total > 0) {
      this.showCurrentFindResult();
    }
    return result;
  }

  public findAfterControlChanged():string {
    this.current = 0;
    this.total = 0;
    let result:string = this.findMatch(this.search, false);
    if(this.total > 0) {
      this.showCurrentFindResult();
    }
    return result;
  }

  public findModelMatch(findString:string, reverse?:boolean):string {
    console.log("findModelMatch(): Called for: ", findString);
    let result:string = this.findMatch(findString, reverse);
    if(this.total > 0) {
      this.showCurrentFindResult();
    }
    return result;
  }
  public findMatch(findString:string, reverse?:boolean):string {
    this.total = 0;
    let prevFind:string = this.prevSearch;
    let finder1:any = this.matchFinder;
    let finder2:any = this.countFinder;
    if(String(findString) !== String(prevFind)) {
      this.current = 0;
      prevFind = findString;
    }
    let fwd:boolean = !reverse;
    // let el1:HTMLElement = document.querySelector('.onsite-main-content');
    // let el1:HTMLElement = document.querySelector('ion-content');
    let el1:HTMLElement = document.querySelector('.onsite-main-content ion-content');
    this.matches = [];
    if(finder1 && finder1.reverts && finder1.reverts.length) {
      finder1.revert();
    }
    let regexpOpts:string = "g";
    if(!this.caseSensitive) {
      regexpOpts += "i";
    }
    let searchFor:RegExp = new RegExp(findString, regexpOpts);
    let fardomCount = (portion:any, match:any) => {
      this.total++;
      this.matches.push(match);
      return match;
    }

    let fardomReplace = (portion:any, match:any):HTMLElement => {
      // totalFinds++;
      // this.matches.push(match);
      let span:HTMLElement = document.createElement('span');
      // var classname = 'fardom-found find_' + (match.index + 1);
      let idx:number = match && typeof match.index === 'number' ? match.index + 1 : 0;
      let classname:string = 'find_' + (idx + 1);
      let curFind:number = this.current;
      // let curFind = currentFind < 0 ? totalFinds - 1 : currentFind >= totalFinds ? 0 : currentFind;
      // Log.l(`fardomReplace(): Match index is ${idx} and curFind is ${curFind}`);
      if(idx === curFind) {
        span.className = "fardom-found-current "  + classname;
      } else {
        span.className = "fardom-found " + classname;
      }
      let matchText:string = match[0];
      let newNode:Text = document.createTextNode(matchText);
      span.appendChild(newNode);
      return span;
    }


    let findOpts:any = {
      find: searchFor,
      wrap: 'span',
      wrapClass: 'fardom-found',
      replace: fardomReplace,
      // preset: 'prose',
    };
    let countOpts:any = {
      find: searchFor,
      // replace: fardomCount,
      // preset: 'prose',
    };
    if(this.proseOnly) {
      countOpts.preset = 'prose';
      findOpts.preset  = 'prose';
    }
    if(!this.useRegex) {
      countOpts.find = findString;
      findOpts.find  = findString;
    }
    if(this.search && this.search != '') {
      finder2 = findAndReplaceDOMText(el1, countOpts);
      this.total = finder2.reverts.length;
      finder2.revert();
      // console.log(`findIt(): Found '${rex}' ${totalFinds} times`);
      if(this.total) {
        if(fwd) {
          this.current = (this.current % this.total) + 1;
        } else {
          this.current = this.current - 1;
          if(this.current < 1) {
            this.current = this.total;
          }
        }
      }
      Log.l(`findMatch(): current is at ${this.current}/${this.total}`);
      finder1 = findAndReplaceDOMText(el1, findOpts);
      this.prevSearch = findString;
      this.countFinder = finder2;
      this.matchFinder = finder1;
      let out:string = `${this.current}/${this.total}`;
      return out;
    }
    // if(currentFind >= totalFinds) {
    //   currentFind = 0;
    // } else if(currentFind < 0) {
    //   currentFind = totalFinds - 1;
    // }
  }

  public showCurrentFindResult() {
    let el1:HTMLElement = document.querySelector('.fardom-found-current');
    if(el1) {
      console.log("showCurrentFindResult(): Found result, scrolling ...")
      window['onsitecurrentfind'] = el1;
      let force:boolean = this.findScrollAlways === true ? true : false;
      setTimeout(() => {
        if(!force && typeof (el1 as any).scrollIntoViewIfNeeded === 'function') {
          (el1 as any).scrollIntoViewIfNeeded({behavior: this.findScrollType});
        } else {
          el1.scrollIntoView({behavior: this.findScrollType});
        }
      }, this.findScrollTimeout);
    } else {
      console.log("showCurrentFindResult(): Result not found.");
    }
  }

  public closeSearchWindow(evt?:Event) {
    Log.l(`closeSearchWindow(): Called`);
    if(this.matchFinder && this.matchFinder.reverts && this.matchFinder.reverts.length) {
      this.matchFinder.revert();
    }
    if(this.countFinder && this.countFinder.reverts && this.countFinder.reverts.length) {
      this.countFinder.revert();
    }
    this.close.emit(true);
  }

  public toggleControl(controlNumber:number, evt?:Event):boolean {
    let controlName:string;
    if(controlNumber === 1) {
      controlName = "caseSensitive";
    } else if(controlNumber == 2) {
      controlName = "proseOnly";
    } else if(controlNumber == 3) {
      controlName = "useRegex";
    }
    this[controlName] = !this[controlName];
    if(!this.useRegex) {
      this.caseSensitive = true;
    }
    this.focusOnFindInput();
    this.findAfterControlChanged();
    return this[controlName];
  }
}

