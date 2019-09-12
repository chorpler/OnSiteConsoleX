import * as moment from 'moment';

// export interface IMomentTimer {
export interface MomentTimer {
  timerDuration:number;
  callback:Function;
  loop:boolean;
  started:boolean;
  stopped:boolean;
  timer:any;
  startTick:number;
  endTick:number;
  start: () => boolean;
  stop: () => boolean;
  clearTimer: () => boolean;
  duration: (newDuration:number|moment.Duration) => any;
  getDuration: (units?:moment.unitOfTime.Base) => number;
  getRemainingDuration: (units?:moment.unitOfTime.Base) => number;
  isStopped: () => boolean;
  isStarted: () => boolean;
}

export interface MomentTimerAttributes {
  start?:boolean;
  loop?:boolean;
  wait?:number|moment.Duration;
  executeAfterWait?:boolean;
}

export const DefaultTimerAttributes:MomentTimerAttributes = {
  executeAfterWait: false,
};




export const Timer = function(duration:number|moment.Duration, attributes:MomentTimerAttributes, callback:Function) {
  if(moment.isDuration(duration)) {
    this.timerDuration = duration.asMilliseconds();
  } else {
    this.timerDuration = duration;
  }
  this.callback = callback;
  this.loop = attributes.loop;
  this.started = false;
  this.stopped = false;       // If stop() is called this variable will be used to finish the paused duration once it's started again.
  this.timer = null;
  this.startTick = null;
  this.endTick = null;

  if(attributes.start) {
    if(typeof attributes.wait === 'number' && attributes.wait > 0) {
      let self = this;
      setTimeout(function() {
        if(attributes.executeAfterWait) {
          callback();
        }
        self.start();
      }, attributes.wait);
    } else if(attributes.wait && moment.isDuration(attributes.wait)) {
      let self = this;
      let ms = attributes.wait.asMilliseconds();
      if(ms > 0) {
        setTimeout(function() {
          if(attributes.executeAfterWait) {
            callback();
          }
          self.start();
        }, ms);
      }
    } else {
      this.start();
    }
  }
};

Timer.prototype.start = function():boolean {
  if(!this.started) {
    let self = this;

    // Takes care of restarts. If the timer has been stopped, this will make sure the leftover duration is executed.
    if(this.stopped) {
      let ms = this.getRemainingDuration();
      this.updateStartEndTickFromDuration(ms);
      setTimeout(function() {
        self.callback();
        if(self.loop) {
          return self.start();
        }
      }, ms);
      // this.started = true;
      this.stopped = false;
      return true;
    }

    this._handleTimerStart();
    this.updateStartEndTickFromDuration(this.timerDuration);
    this.started = true;

    return true;
  }

  return false;
};

Timer.prototype.stop = function():boolean {
  if(this.started) {
    this.clearTimer();
    this.updateStartEndTickFromDuration(this.getRemainingDuration());
    this.started = false;
    this.stopped = true;
    return true;
  }
  return false;
};

Timer.prototype.clearTimer = function():boolean {
  if(this.timer) {
    this.timer = this.loop ? clearInterval(this.timer) : clearTimeout(this.timer);
    return true;
  }
  return false;
};

Timer.prototype.updateStartEndTickFromDuration = function(duration:number|moment.Duration):boolean {
  // this.startTick = Date.now();
  // this.endTick = this.startTick + duration;
  // return true;
  let ms:number = 0;
  if(moment.isDuration(duration)) {
    ms = duration.asMilliseconds();
  } else if(typeof duration === 'number') {
    ms = duration;
  } else {
    let txt = `updateStartEndTickFromDuration(): Parameter 1 must be a number or Moment Duration. Invalid parameter`;
    console.warn(txt + ":", duration);
    let err = new Error(txt);
    throw err;
  }
  this.startTick = Date.now();
  this.endTick = this.startTick + ms;
  return true;

};

Timer.prototype.duration = function(milliseconds?:number|moment.Duration, type?:moment.unitOfTime.Base):boolean {
  // if(arguments.length > 0) {
  //   this.timerDuration = moment.duration(arguments[0], arguments[1]).asMilliseconds();
  //   this._handleRunningDurationChange();
  //   return true;
  // }
  // return false;
  let self = this;
  let duration:moment.Duration;
  if(moment.isDuration(milliseconds)) {
    duration = milliseconds;
  } else if(typeof milliseconds === 'number') {
    if(typeof type === 'string') {
      duration = moment.duration(milliseconds, type);
    } else {
      duration = moment.duration(milliseconds);
    }
  }
  if(duration) {
    self.timerDuration = duration.asMilliseconds();
    self._handleRunningDurationChange();
    return true;
  } else {
    return false;
  }
};

Timer.prototype.getDuration = function(units?:moment.unitOfTime.Base):number {
  let out = this.timerDuration;
  if(units) {
    let duration = moment.duration(this.timerDuration);
    out = duration.as(units);
  }
  // return this.timerDuration;
  return out;
};

Timer.prototype.getRemainingDuration = function(units?:moment.unitOfTime.Base):number {
  let time = this.getDurationUntilEnd(units);
  if(time < 0) {
    time = 0;
  }
  return time;
};

Timer.prototype.getDurationUntilEnd = function(units?:moment.unitOfTime.Base):number {
  let ms = 0;
  if(this.startTick && this.endTick) {
    ms = this.stopped ? this.endTick - this.startTick : this.endTick - Date.now();
  }
  let out = ms;
  if(units) {
    let duration = moment.duration(ms);
    out = duration.as(units);
  }
  // return 0;
  return out;
};

Timer.prototype.isStopped = function():boolean {
  return this.stopped;
};

Timer.prototype.isStarted = function():boolean {
  return this.started;
};

// Internal Method(s)
Timer.prototype._handleTimerStart = function() {
  let self = this;

  if(this.loop) {
    this.timer = setInterval(function() {
      self.updateStartEndTickFromDuration(self.timerDuration);
      return self.callback();
    }, this.timerDuration);
  } else {
    this.timer = setTimeout(function() {
      self.started = false;
      return self.callback();
    }, this.timerDuration);
  }
};

Timer.prototype._handleRunningDurationChange = function() {
  let self = this;

  if(this.started) {
    setTimeout(function() {
      if(self.started) {
        self.clearTimer();
        self._handleTimerStart();
      }
    }, this.getRemainingDuration());
  }
};






// export class MomentTimer implements IMomentTimer {
//   public timerDuration:number = 1000;
//   public callback:Function = () => {};
//   public loop:boolean = false;
//   public started:boolean = false;
//   public stopped:boolean = false;
//   public timer:any;
//   public timerFn:(attributes:MomentTimerAttributes|Function, callback?:Function) => {};
//   public startTick:number;
//   public endTick:number;

//   constructor(duration:number|moment.Duration, attributes:MomentTimerAttributes, callback:Function) {
//     if(moment.isDuration(duration)) {
//       this.timerDuration = duration.asMilliseconds();
//     } else if(typeof duration === 'number') {
//       this.timerDuration = duration;
//     }
//     this.callback = callback;
//     this.loop = attributes.loop;
//     if(attributes.start) {
//       if(attributes.wait) {
//         let wait:number = 0;
//         if(moment.isDuration(attributes.wait)) {
//           wait = attributes.wait.asMilliseconds();
//         } else if(typeof attributes.wait === 'number') {
//           wait = attributes.wait;
//         }
//         if(wait > 0) {
//           setTimeout(function() {
//             if(attributes.executeAfterWait) {
//               callback();
//             }
//             this.start();
//           }, wait);
//         } else {
//           this.start();
//         }
//       } else {
//         this.start();
//       }
//     }
//   }

//   public initializeMoment(momentClass:any) {
//     if(momentClass && momentClass.duration && momentClass.duration.fn) {
//       momentClass.duration.fn.timer = function(attributes:MomentTimerAttributes|Function, callback?:Function) {
//         let options:MomentTimerAttributes;
//         if(typeof attributes === "function") {
//           callback = attributes;
//           options = {
//             wait: 0,
//             loop: false,
//             start: true
//           };
//         } else if(typeof attributes === "object" && typeof callback === "function") {
//           options = attributes;
//           if(options.start == null) {
//             options.start = true;
//           }
//         } else {
//           let text = "MomentTimer(): First argument must be MomentTimerAttributes object or callback function. Invalid parameter";
//           console.warn(text + ":", attributes);
//           let err = new Error(text);
//           throw err;
//         }
//         return (function() {
//           return new MomentTimer(this.asMilliseconds(), options, callback);
//         }.bind(this))();
//       };
//     }
//   }

//   public start():boolean {
//     if(!this.started) {
//       // Takes care of restarts. If the timer has been stopped, this will make sure the leftover duration is executed.
//       if(this.stopped) {
//         setTimeout(function() {
//           this.callback();
//           return this.start();
//         }, this.getRemainingDuration());
//         this.stopped = false;
//         return true;
//       }
//       this._handleTimerStart();
//       this.updateStartEndTickFromDuration(this.timerDuration);
//       this.started = true;
//       return true;
//     }
//     return false;
//   }

//   public stop():boolean {
//     if(this.started) {
//       this.clearTimer();
//       this.updateStartEndTickFromDuration(this.getRemainingDuration());
//       this.started = false;
//       this.stopped = true;
//       return true;
//     }
//     return false;
//   }

//   public clearTimer():boolean {
//     if(this.timer) {
//       this.timer = this.loop ? clearInterval(this.timer) : clearTimeout(this.timer);
//       return true;
//     }
//     return false;
//   }

//   public updateStartEndTickFromDuration(duration:number|moment.Duration):boolean {
//     let ms:number;
//     if(moment.isDuration(duration)) {
//       ms = duration.asMilliseconds();
//     } else if(typeof duration === 'number') {
//       ms = duration;
//     } else {
//       let txt = `updateStartEndTickFromDuration(): Parameter 1 must be a number or Moment Duration. Invalid parameter`;
//       console.warn(txt + ":", duration);
//       let err = new Error(txt);
//       throw err;
//     }
//     this.startTick = Date.now();
//     this.endTick = this.startTick + ms;
//     return true;
//   }

//   public duration(milliseconds?:number|moment.Duration, type?:moment.unitOfTime.Base):boolean {
//     let duration:moment.Duration;
//     if(moment.isDuration(milliseconds)) {
//       duration = milliseconds;
//     } else if(typeof milliseconds === 'number') {
//       if(typeof type === 'string') {
//         duration = moment.duration(milliseconds, type);
//       } else {
//         duration = moment.duration(milliseconds);
//       }
//     }
//     if(duration) {
//       this.timerDuration = duration.asMilliseconds();
//       this._handleRunningDurationChange();
//       return true;
//     } else {
//       return false;
//     }
//   }

//   public getDuration():number {
//     return this.timerDuration;
//   }

//   public getRemainingDuration():number {
//     if(this.startTick && this.endTick) {
//       return this.stopped ? this.endTick - this.startTick : this.endTick - Date.now();
//     }
//     return 0;
//   }

//   public isStopped():boolean {
//     return this.stopped;
//   }

//   public isStarted():boolean {
//     return this.started;
//   }

//   // Internal Method(s)
//   public _handleTimerStart() {
//     if(this.loop) {
//       this.timer = setInterval(function() {
//         this.updateStartEndTickFromDuration(this.timerDuration);
//         return this.callback();
//       }, this.timerDuration);
//     } else {
//       this.timer = setTimeout(function() {
//         this.started = false;
//         return this.callback();
//       }, this.timerDuration);
//     }
//   }

//   public _handleRunningDurationChange() {
//     if(this.started) {
//       setTimeout(function() {
//         if(this.started) {
//           this.clearTimer();
//           this._handleTimerStart();
//         }
//       }, this.getRemainingDuration());
//     }
//   }
// }





// // // // define internal moment reference
// // // let mo;

// // if(typeof require === "function") {
// //   try { moment = require('moment'); }
// //   catch(e) { }
// // }

// if(!moment && this.moment) {
//   moment = this.moment;
// }

// if(!moment) {
//   throw "Moment Timer cannot find Moment.js";
// }

// moment.duration.fn.timer = function(attributes, callback) {
//   if(typeof attributes === "function") {
//     callback = attributes;
//     attributes = {
//       wait: 0,
//       loop: false,
//       start: true
//     };
//   } else if(typeof attributes === "object" && typeof callback === "function") {
//     if(attributes.start == null) {
//       attributes.start = true;
//     }
//   } else {
//     throw new Error("First argument must be of type function or object.");
//   }

//   return (function() {
//     return new Timer(this.asMilliseconds(), attributes, callback);
//   }.bind(this))();
// };
