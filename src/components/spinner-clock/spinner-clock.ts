import { Component, Input, OnInit, OnDestroy, NgZone} from '@angular/core'                ;
// import { trigger, state, style, animate, transition } from '@angular/animations'          ;
import { OSData                                     } from '../../providers/data-service' ;
import { Log, moment, Moment, isMoment              } from 'domain/onsitexdomain';

export type ClockHands = { hours: number, minutes: number, seconds: number };
export type ClockHandName = "hours"|"minutes"|"seconds";

@Component({
  selector: 'spinner-clock',
  templateUrl: 'spinner-clock.html',
  // animations: [
  //   trigger('hourHandState', [
  //     state('inactive', style({
  //       transform: 'rotate(0)',
  //     })),
  //     state('active', style({
  //       transform: 'rotate()',
  //       // transform: 'scale(1.1)'
  //     })),
  //     transition('inactive => active', animate('100ms ease-in')),
  //     transition('active => inactive', animate('100ms ease-out'))
  //   ])
  // ]
})
export class SpinnerClockComponent implements OnInit,OnDestroy {
  // @Input('start') start: number;
  @Input('startTime') startTime:Moment|Date = moment();
  public now  :Moment = moment()                        ;
  public moment = moment;
  public timer:number = 1000;
  public hands:ClockHands = { hours: 0, minutes: 0, seconds: 0 };
  public hStyle:any = {'transform': `rotate(${this.hands.hours}deg)`};
  public mStyle:any = {'transform': `rotate(${this.hands.minutes}deg)`};
  public sStyle:any = {'transform': `rotate(${this.hands.seconds}deg)`};
  public hours:number = 0;
  public minutes:number = 0;
  public seconds:number = 0;
  public intervalHandle:any;
  public timeoutHandle:any;
  // this.getClockHands(this.now);

  constructor(public zone:NgZone) {
    window['onsiteclockcomponent'] = this;
    Log.l('Hello ClockComponent Component');
    // Log.l("ClockComponent: hands is: ", this.hands);
  }

  ngOnInit() {
    Log.l("SpinnerClockComponent: ngOnInit() called");
    this.startClock();
  }

  ngOnDestroy() {
    Log.l("SpinnerClockComponent: ngOnDestroy() called");
    this.stopClock();
  }

  public startClock(time?:Moment|Date) {
    let now = time ? moment(time) : moment();
    this.setTimeHands(now);
    this.intervalHandle = setInterval(() => {
      let time = moment();
      this.zone.run(() => {
        this.setTimeHands(time);
      });
    }, this.timer);
    Log.l("startClock(): Clock started, interval handle is '%d'", this.intervalHandle);
  }

  public stopClock() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    Log.l("stopClock(): Clock stopped.");
  }

  public restartClock() {
    Log.l("restartClock(): Restarting clock....");
    this.stopClock();
    this.startClock();
  }

  public rotate(deg:number) {
    let res = `rotate(${deg}deg)`;
    return res;
  }

  public setTimeHands(time?:Moment|Date) {
    let timoutSececonds: number;
    let i:number;
    let now = time ? moment(time) : moment();
    let hours = now.format("hh");
    let minutes = now.format("mm");
    let seconds = now.format("ss.SSS");
    let hrs = Number(hours);
    let min = Number(minutes);
    let sec = Number(seconds);
    let s = sec * 6;
    let m = (min * 6) + (s / 60);
    let h = 30 * ((hrs % 12) + (min / 60));
    // this.hStyle.transform = `rotate(${h})deg`;
    // this.mStyle.transform = `rotate(${m})deg`;
    // this.sStyle.transform = `rotate(${s})deg`;
    // this.hStyle = {transform: `rotate(${h})deg`};
    // this.mStyle = {transform: `rotate(${m})deg`};
    // this.sStyle = {transform: `rotate(${s})deg`};
    // Log.l("Now settting clock hands to %s:%s:%s (degrees: [%d,%d,%d])", hours, minutes, seconds, h, m, s);
    this.hours = h;
    this.minutes = m;
    this.seconds = s;
    // this.hStyle.transform = `rotate(${this.hands.seconds})deg`;
    // this.mStyle.transform = `rotate(${this.hands.seconds})deg`;
    // this.sStyle.transform = `rotate(${this.hands.seconds})deg`;
    // for (i=1; i !== 0; i--) {
    //   if (i === 1) {
    //     // rotate all hands to proper degrees and start animation
    //     setTimeout(timoutSececonds);
    //   }
    //   if (i === 0 ) {
    //     // run animation...
    //   }
    // }
  }

  // public getClockHands(time?: Moment | Date | string | number) {
  //   let tiempo;
  //   let hands = this.hands;
  //   if (!time) {
  //     return hands;
  //   }
  //   if (isMoment(time) || time instanceof Date) {
  //     tiempo = moment(time);
  //   } else if (typeof time === 'string') {
  //     tiempo = moment(time);
  //   } else if (typeof time === 'number') {
  //     tiempo = moment.fromExcel(time);
  //   } else {
  //     Log.w("getClockHands(): Parameter must be Moment|Date|string|number, type is %s.", typeof time);
  //     Log.w(time);
  //     return hands;
  //   }

  //   this.updateClock(tiempo);
  //   return hands;
  // }

  // // public getClockHands(time?: Moment | Date | string | number) {
  // //   return OSData.getClockHands(time);
  // // }

  // public getClockHand(hand: string) {
  //   let hnd = typeof hand === 'string' ? hand.toLowerCase() : hand;
  //   let h = hnd[0];
  //   if (h === 'h') {
  //     hnd = 'hours';
  //   } else if (h === 'm') {
  //     hnd = 'minutes';
  //   } else if (h === 's') {
  //     hnd = 'seconds';
  //   } else {
  //     Log.w("getClockHand() called without a parameter of 'hours', 'minutes', or 'seconds'. Just setting hour hand.");
  //     hnd = 'hours';
  //   }
  //   return this.hands[hnd];
  // }

  // public setClockHand(hand: string, degrees: number) {
  //   let hnd = typeof hand === 'string' ? hand.toLowerCase() : hand;
  //   let h = hnd[0];
  //   if (degrees < -360 || degrees > 360) {
  //     Log.w("setHourHand() called with degrees outside range (-360<deg<360): %s", degrees);
  //     return null;
  //   } else if (h === 'h') {
  //     hnd = 'hours';
  //   } else if (h === 'm') {
  //     hnd = 'minutes';
  //   } else if (h === 's') {
  //     hnd = 'seconds';
  //   } else {
  //     Log.w("setHourHand() called without a parameter of 'hours', 'minutes', or 'seconds'. Just setting hour hand.");
  //     hnd = 'hours';
  //   }
  //   this.hands[hnd] = degrees;
  // }

  // public setClockHands(hands: any) {
  //   let error = false;
  //   if (hands && typeof hands === 'object') {
  //     let keys = Object.keys(hands);

  //     for (let keyString of keys) {
  //       let key = keyString.toLowerCase().trim();
  //       if (key !== 'hours' && key !== 'minutes' && key !== 'seconds') {
  //         Log.e("setClockHands() requires an object of type {hours: x, minutes:y, seconds: z} where x, y, and z are the number of degrees to set the hand to.");
  //         error = true;
  //       } else {
  //         if (!(typeof hands[key] === 'number' && (hands[key] <= 360 || hands[key] >= -360))) {
  //           error = true;
  //           break;
  //         }
  //       }
  //     }
  //     if (error) {
  //       Log.e("setClockHands() requires an object of type {hours: x, minutes:y, seconds: z} where x, y, and z are the number of degrees to set the hand to (-360 <= deg <= 360).");
  //       return null;
  //     } else {
  //       for (let key of keys) {
  //         this.hands[key] = hands[key];
  //       }
  //     }
  //   } else {
  //     Log.e("setClockHands() requires an object of type {hours: x, minutes:y, seconds: z} where x, y, and z are the number of degrees to set the hand to (-360 <= deg <= 360).");
  //     return null;
  //   }
  //   return this.hands;
  // }

  // public updateClock(time: Moment | Date) {
  //   let now = time ? moment(time) : moment();
  //   /* Convert hours, minutes, and seconds for current time into degrees of a circle, with the simpler but more confusing math */
  //   let s = now.second() * 6;
  //   let m = now.minute() * 6;
  //   let h = 30 * ((now.hour() % 12) + (now.minute() / 60));
  //   let hands = { 'hours': h, 'minutes': m, 'seconds': 0 };
  //   Log.l("Setting clock hands to:\n", hands);
  //   this.setClockHands(hands);
  // }

}
