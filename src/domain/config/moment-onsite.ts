/**
 * Name: MomentJS functions and extensions for OnSiteX/OnSiteConsoleX
 * Vers: 2.1.0
 * Date: 2018-08-08
 * Auth: David Sargeant
 * Logs: 2.1.0 2018-08-08: Added isDuration() method to moment
 * Logs: 2.0.0 2018-04-10: Fixed fromOADate function
 */



// import * as momentParseFormat from 'moment-parseformat' ;
// import * as momentRecur       from 'moment-recur'       ;
// import * as moRound       from 'moment-round'       ;
// import * as moment            from 'moment-timezone'    ;
// declare const require                                    ;
// import   * as momo              from 'moment'             ;
import   * as moment              from 'moment'             ;
// import Moment from 'moment';
// import   * as momentTimezone      from 'moment-timezone'    ;
import { Moment, Duration } from 'moment';
// import   * as moShortFormat   from 'moment-shortformat' ;
// import   * as moTimer         from 'moment-timer'       ;
import   * as momentRange         from 'moment-range'       ;
import { PreciseRange, preciseDiff, staticPreciseDiff } from './moment-precise-range';
import { extendMoment } from 'moment-range';
// import {momentDurationFormatSetup} from 'moment-duration-format';
import 'moment-duration-format';
import { MomentTimer, MomentTimerAttributes, Timer } from './moment-timer-onsite';
// import 'moment-timer';

// import 'moment-precise-range-plugin';
// import   * as momentPreciseRange  from 'moment-precise-range-plugin'       ;

// import   * as parseFormat         from 'moment-parseformat' ;
import { Log                    } from './config.log'       ;

// const twix = require('twix');
// const momentDurationFormatSetup = require('moment-duration-format');
// import {Twix,TwixStatic,} from 'twix';

// const moment:momentRange.MomentRange & moment.Moment = extendMoment(Moment)
// window['momentDurationFormatSetup'] = momentDurationFormatSetup;
// window['extendMoment'] = extendMoment;

// export type MomentFormatSeparator = '/' | '.' | '-';
// export type PreferredOrderString = "MDY" | "DMY" | "YMD";
// export type MomentParseFormatPreferredOrder = {
//   '/' ?: PreferredOrderString,
//   '.' ?: PreferredOrderString,
//   '-' ?: PreferredOrderString,
// };
// export type MomentParseFormatOptions = {
//   'preferredOrder': MomentParseFormatPreferredOrder|PreferredOrderString,
// };

declare module "moment" {
  interface Moment {
    /**
     * 2017-07-04: Added by David Sargeant so TypeScript won't freak out
     * @param e number or string that is an Excel-format date.
     */
    // fn:any;
    fromExcel(days:number|string):moment.Moment;
    // toExcel(mo?:Date | moment.Moment | string | boolean, dayOnly?:boolean):number;
    toExcel(dayOnly?:boolean):number;
    round(precision:number, key:string, direction?:string): moment.Moment;
    ceil(precision:number, key:string):moment.Moment;
    floor(precision:number, key:string):moment.Moment;
    preciseDiff(d2:Date|Moment, returnValueObject:boolean):PreciseRange|string;
    // toOADate():number;
    isRange(range: any): boolean;

    within(range: momentRange.DateRange): boolean;

  }
  interface Duration {
    timer: (attributes:MomentTimerAttributes|Function, callback?:Function) => MomentTimer;
  }
  function toExcel(mo?:Date | moment.Moment | string | boolean, dayOnly?:boolean):number;
  function fromExcel(days:number|string):moment.Moment;
  function preciseDiff(d1:Date|Moment, d2:Date|Moment, returnValueObject:boolean):PreciseRange|string;
  function range(start: Date, end: Date): momentRange.DateRange;
  function range(start: Moment, end: Moment): momentRange.DateRange;
  // function range(range: [Date, Date]): momentRange.DateRange;
  function range(range: [Date, Date] | [Moment, Moment] | string): momentRange.DateRange;
  // function range(range: string): momentRange.DateRange;

  function rangeFromInterval(interval: unitOfTime.Diff, count?: number, date?: Date | Moment): momentRange.DateRange;
  function rangeFromISOString(isoTimeInterval: string): momentRange.DateRange;

  // @deprecated 4.0.0
  function parseZoneRange(isoTimeInterval: string): momentRange.DateRange;
  // function fromOADate(oaDate:string|number, offset?:string|number):moment.Moment;
  // function parseFormat(formatString:string, options?:MomentParseFormatOptions):string;
}

// const momentRound = function(precision:number, key:string, direction?:string):moment.Moment {
//   if(typeof direction === 'undefined') {
//     direction = 'round';
//   }
//   let self = this;

//   let keys = ['Hours', 'Minutes', 'Seconds', 'Milliseconds'];
//   let maxValues = [24, 60, 60, 1000];

//   // Capitalize first letter
//   key = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

//   // make sure key is plural
//   if(key.indexOf('s', key.length - 1) === -1) {
//     key += 's';
//   }
//   let value = 0;
//   let rounded = false;
//   let subRatio = 1;
//   let maxValue;
//   for(let i in keys) {
//     let k = keys[i];
//     if(k === key) {
//       value = self._d['get' + key]();
//       maxValue = maxValues[i];
//       rounded = true;
//     } else if(rounded) {
//       subRatio *= maxValues[i];
//       value += self._d['get' + k]() / subRatio;
//       self._d['set' + k](0);
//     }
//   };

//   value = Math[direction](value / precision) * precision;
//   value = Math.min(value, maxValue);
//   self._d['set' + key](value);

//   return self;
// }

const momentRound = function(precision:number, key:string, roundDirection?:"round"|"ceil"|"floor"|"up"|"down"):moment.Moment {
  let direction:string = roundDirection || 'round';
  if(direction === 'up') {
    direction = 'ceil';
  } else if(direction === 'down') {
    direction = 'floor';
  }
  let _this:any = this; // cache of this
  let methods = {
    hours:        { 'name': 'Hours',        'maxValue': 24   },
    minutes:      { 'name': 'Minutes',      'maxValue': 60   },
    seconds:      { 'name': 'Seconds',      'maxValue': 60   },
    milliseconds: { 'name': 'Milliseconds', 'maxValue': 1000 },
  };
  let keys = {
    'mm':           methods.milliseconds.name,
    'ms':           methods.milliseconds.name,
    'milliseconds': methods.milliseconds.name,
    'Milliseconds': methods.milliseconds.name,
    's':            methods.seconds.name,
    'sec':          methods.seconds.name,
    'secs':         methods.seconds.name,
    'seconds':      methods.seconds.name,
    'Seconds':      methods.seconds.name,
    'm':            methods.minutes.name,
    'min':          methods.minutes.name,
    'mins':         methods.minutes.name,
    'minutes':      methods.minutes.name,
    'Minutes':      methods.minutes.name,
    'H':            methods.hours.name,
    'h':            methods.hours.name,
    'hour':         methods.hours.name,
    'Hour':         methods.hours.name,
    'hours':        methods.hours.name,
    'Hours':        methods.hours.name
  };
  let value:number = 0;
  let rounded:boolean = false;
  let subRatio:number = 1;
  let maxValue:number;

  // make sure key is plural
  if(key.length > 1 && key !== 'mm' && key.slice(-1) !== 's') {
    key += 's';
  }
  key = keys[key].toLowerCase();

  // control
  if(!methods[key]) {
    throw new Error('The value to round is not valid. Possibles ["hours", "minutes", "seconds", "milliseconds"]');
  }

  let getMethodName:string = 'get' + methods[key].name;
  let setMethodName:string = 'set' + methods[key].name;

  for(let k in methods) {
    if(k === key) {
      value = _this._d[getMethodName]();
      maxValue = methods[k].maxValue;
      rounded = true;
    } else if(rounded) {
      subRatio *= methods[k].maxValue;
      value += _this._d['get' + methods[k].name]() / subRatio;
      _this._d['set' + methods[k].name](0);
    }
  }

  value = Math[direction](value / precision) * precision;
  value = Math.min(value, maxValue);
  _this._d[setMethodName](value);

  return _this;
};

const momentCeil = function(precision, key):moment.Moment {
  let self = this;
  return self.round(precision, key, 'ceil');
};

const momentFloor = function(precision, key):moment.Moment {
  let self = this;
  return self.round(precision, key, 'floor');
};

export const isMoment = function(val:any):boolean {
  return (moment.isMoment(val) && moment(val).isValid());
};

export const isDuration = function(val:any):boolean {
  return (moment.isDuration(val) && val['isValid'] && typeof val['isValid'] === 'function' && (val as any).isValid());
};

// export var moment2excel = function (mo?: Date | moment.Moment | string | boolean, dayOnly?: boolean) {
//   let xlDate;
//   let XLDay0 = moment([1900, 0, 1]).startOf('day');
//   let value;
//   if (mo) {
//     if (typeof mo === 'boolean') {
//       value = this;
//       xlDate = Math.trunc(moment(value).diff(XLDay0, 'days', true) + 2);
//     } else {
//       value = mo;
//       if (dayOnly) {
//         xlDate = Math.trunc(moment(value).diff(XLDay0, 'days', true) + 2);
//       } else {
//         xlDate = moment(value).diff(XLDay0, 'days', true) + 2;
//       }
//     }
//   } else {
//     value = this;
//     xlDate = moment(value).diff(XLDay0, 'days', true) + 2;
//   }
//   return xlDate;
// };

/* Begin MSDate/OADate/ExcelDate functionality */
const MINUTE_MILLISECONDS:number = 60 * 1000;
const DAY_MILLISECONDS:number    = 86400000 ;
const MS_DAY_OFFSET:number       = 25569    ;

const momentVersion:string[] = moment.version.split('.');
const major:number = +momentVersion[0];
const minor:number = +momentVersion[1];

const oaDateToTicks = function(oaDate:number):number {
  return ((oaDate - MS_DAY_OFFSET) * DAY_MILLISECONDS) + (oaDate >= 0.0 ? 0.5 : -0.5);
};

const ticksToOADate = function(ticks:number):number {
  return (ticks / DAY_MILLISECONDS) + MS_DAY_OFFSET;
};

/**
 * @description takes an oaDate that is not in utc and converts it to a utc moment offset by a number of minutes
 *
 * @param {number} oaDate
 * @param {number} offsetToUtcInMinutes
 * @returns moment
 */
const fromOADateOffsetToUtcByMinutes = function(oaDate:number, offsetToUtcInMinutes:number):Moment {
  const offsetInTicks = offsetToUtcInMinutes * MINUTE_MILLISECONDS;
  const ticks = oaDateToTicks(oaDate);
  return moment(ticks + offsetInTicks).utc();
};


/**
 * @description takes an oaDate that is in utc and converts it to a utc moment or takes an oaDate and an offset to utc and converts it to a utc moment. The offset can be an int representing the offset to utc in minutes or a string indicating the timezone of the oaDate. Will be used as moment.fromOADate()
 *
 * @param {double} oaDate
 * @param {string=} {int=} offset
 * @returns moment
 */
const fromOADate = function(oaDate:number, offset?:number):Moment {
  if(isNaN(Number(oaDate))) {
    throw new TypeError('fromOADate requires an oaDate that is number-like!!!');
  }

  /* no offset */
  if(!offset) {
    return fromOADateOffsetToUtcByMinutes(oaDate, 0);
  }

  // /* timezone */
  const parsedOffset = Number(offset);
  if(isNaN(parsedOffset)) {
    // return fromOADateOffsetToUtcByTimezone(oaDate, offset);
    throw new TypeError("fromOADate requires an offset that is number-like!!!");
  }

  /* minutes */
  return fromOADateOffsetToUtcByMinutes(oaDate, parsedOffset);
};

/**
 * @description converts a moment to a UTC OLE automation date represented as a double. Will be used as moment.fn.toOADate()
 *
 * @returns {double}
 */
const toOADate = function():number {
  const milliseconds = this.valueOf();
  return ticksToOADate(milliseconds);
};
/* End MSDate/OADate/ExcelDate functionality */

// export var ConvertProvidedMomentToExcel = function(day:moment.MomentInput, dayOnly:boolean) {
//   let xlDate:number, out:number;
//   let XLDay0 = moment([1900, 0, 1, 0, 0, 0]);
//   let tempMoment = moment(day);
//   if(!isMoment(tempMoment)) {
//     Log.l(`moment.toExcel(): Error converting moment '${day}' to excel, moment is:\n`, day);
//     throw new TypeError(`moment provided was not a valid MomentInput, cannot convert moment to Excel date`);
//   } else {
//     let now:Moment = moment(tempMoment);
//     let offset:number = now.utcOffset();
//     let xl1:number = now.toOADate();
//     let n2:Moment = moment.fromOADate(xl1);
//     let n3:Moment = moment(n2);
//     let n4:Moment = n3.utcOffset(offset);
//     let momentString:string = n4.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
//     let n5:Moment = moment.utc(momentString);
//     let out:number = n5.toOADate();
//     if(dayOnly) {
//       out = Math.trunc(out);
//     }
//     return out;
//   }
// };

// export var MomentObjectToExcel = function(dayOnly?:boolean) {
//   var mo = this;
//   let outputInteger = false;
//   if(dayOnly === true) {
//     outputInteger = true;
//   }
//   return ConvertProvidedMomentToExcel(this, outputInteger);
// }

// var moment2excel = MomentObjectToExcel;

export const moment2excel = function(mo?: Date | moment.Moment | string | boolean, dayOnly?: boolean):number {
  let xlDate:number;
  let XLDay0:Moment = moment([1900, 0, 1]).startOf('day');
  let value:Moment;
  let self = this;
  if(mo == undefined) {
    if(isMoment(self)) {
      value = self;
    } else {
      value = moment();
    }
    xlDate = moment(value).diff(XLDay0, 'days', true) + 2;
  } else {
    if(typeof mo === 'boolean') {
      if(isMoment(self)) {
        value = self;
      } else {
        value = moment();
      }
      xlDate = Math.trunc(moment(value).diff(XLDay0, 'days', true) + 2);
    } else if(mo instanceof Date  || isMoment(mo)) {
      value = moment(mo);
      if(isMoment(value)) {
        if(dayOnly) {
          xlDate = Math.trunc(moment(value).diff(XLDay0, 'days', true) + 2);
        } else {
          xlDate = moment(value).diff(XLDay0, 'days', true) + 2;
        }
      } else {
        Log.w(`fromExcel(): Called with an invalid Date, Moment, or string as parameter 1, or called in static mode without a valid Date, Moment, or Moment-able string as parameter 1.`);

      }
    }
  }
  // else {
  //   value = this;
  //   xlDate = moment(value).diff(XLDay0, 'days', true) + 2;
  // }
  return xlDate;
};

export const Moment2excel = function(dayOnly?:boolean):number {
  return moment2excel(dayOnly);
};

export const excel2moment = function(days:number|string, sourceIsMacExcel?:boolean) {
  let value:number;
  if(typeof days === 'number') {
    value = days;
  } else if(typeof days === 'string') {
    let tmp1:number = Number(days);
    if(!isNaN(tmp1)) {
      value = tmp1;
    } else {
      throw new TypeError("Cannot convert Excel date if it is not a number or numberlike string: " + days + " (" + typeof days + ")");
    }
  } else {
    throw new TypeError("Cannot convert Excel date if it is not a number or numberlike string: " + days + " (" + typeof days + ")");
  }
  // let xlDay0Array = [1900, 0, 1, 0, 0, 0];
  // if(sourceIsMacExcel) {
    // xlDay0Array = [1904, 0, 1, 0, 0, 0];
  // }
  // let XLDay0 = moment(xlDay0Array);
  // let now = moment();
  // let daysInMilliseconds = moment.duration(moment.duration(value - 2, 'days').asMilliseconds());
  // let newMoment = moment(XLDay0).add(daysInMilliseconds);
  // let tzDifference = now.utcOffset() - XLDay0.utcOffset();
  // // Log.l("New Moment and XLDay0 TZ difference is (%d - %d = %d):", now.utcOffset(), XLDay0.utcOffset(), tzDifference);
  // // Log.l(newMoment);
  // // Log.l(XLDay0);
  // window['xldays'] = { xlday0: XLDay0, value: value, now: newMoment };
  // let midnightDateInQuestion = moment(newMoment).startOf('day');
  // let morningDateInQuestion  = moment(newMoment).startOf('day').add(6, 'hours');
  // let offset1 = midnightDateInQuestion.utcOffset();
  // let offset2 = morningDateInQuestion.utcOffset();
  // if(offset1 !== offset2) {
  //   tzDifference = tzDifference +
  // }
  // let lastMoment = moment(newMoment).subtract(tzDifference, 'minutes');
  // lastMoment.round(10, 'milliseconds');
  // let outMoment = moment(lastMoment);
  // let DSTTest1 = moment(lastMoment).startOf('day').add(30, 'minutes');
  // let DSTTest2 = moment(DSTTest1).add(2, 'hours');
  // if(!DSTTest1.isDST() && DSTTest2.isDST()) {
  //   outMoment.add(1, 'hour');
  // }
  // let testForDSTMoment = moment(lastMoment).startOf('day').add(2, 'hours');
  // return lastMoment;
  let OADate:Moment = fromOADate(value);
  let OADateString:string = moment(OADate).format("YYYY-MM-DDTHH:mm:ss.SSS");
  let CorrectedOADate:Moment = moment(OADateString);
  return CorrectedOADate;
};

// (<any>moment).fromExcel = excel2moment;

let momentFnObject:any = moment.fn || {};
// .toExcel = moment2excel;
(moment as any).fn = momentFnObject;
(moment as any).fn.round        = momentRound       ;
(moment as any).fn.fromExcel    = excel2moment      ;
(moment as any).fn.toExcel      = moment2excel      ;
(moment as any).fn.ceil         = momentCeil        ;
(moment as any).fn.floor        = momentFloor       ;
(moment as any).fn.preciseDiff  = preciseDiff       ;
(moment as any).fromExcel       = excel2moment      ;
(moment as any).toExcel         = Moment2excel      ;
(moment as any).preciseDiff     = staticPreciseDiff ;
(moment as any).duration.fn.timer = function(attributes:MomentTimerAttributes|Function, callback?:Function):MomentTimer {
  let options:MomentTimerAttributes;
  let cb:Function;
  if(typeof attributes === "function") {
    cb = attributes;
    options = {
      wait: 0,
      loop: false,
      start: true,
    };
  } else if(typeof attributes === "object" && typeof callback === "function") {
    cb = callback;
    options = attributes;
    if(options.start == null) {
      options.start = true;
    }
  } else {
    let text = "MomentTimer(): First argument must be MomentTimerAttributes object or callback function. Invalid parameter";
    console.warn(text + ":", attributes);
    let err = new Error(text);
    throw err;
  }
  return (function() {
    return new Timer(this.asMilliseconds(), options, cb);
  }.bind(this))();
};
// (moment.duration.fn as any).timer = function(attributes, callback) {
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


// momentDurationFormatSetup(moment);

// (<any>moment).parseFormat  = parseFormat;
// (moment as any).fn.toExcel = moment2excel;
// (moment as any).fn.fromExcel = excel2moment;
// (moment as any).fromExcel = excel2moment;
// (moment as any).round = momentRound;
// (moment as any).ceil = momentCeil;
// (moment as any).floor = momentFloor;

// export type Moment = momentRange.MomentRange;
export type Moment = moment.Moment;
export type Duration = moment.Duration;
export type Locale = moment.Locale;
export type LocaleSpecification = moment.LocaleSpecification;
export type MomentInput = moment.MomentInput;
export type MomentRange = momentRange.DateRange;
export type DateRange = momentRange.DateRange;
// export type MomentZone = momentTimezone.MomentZone;
// export type MomentTimezone = momentTimezone.MomentTimezone;
// export type Twix = Twix;
// export type TwixStatic = TwixStatic;

// export const momentParseFormat = parseFormat;
// momentMS.momentMS(moment, momentTimezone);
// momentMSPlugin();
// const momentTimezone = moment;
// const msDatePlugin = require('lib/moment-msdate-plugin.js');
// const emoment = extendMoment(Moment);

// export {moment, momentTimezone};
// export {moment, momentTimezone};

export { moment };
// export const momentShortFormat = moShortFormat;
// export const momentTimer       = moTimer;
// momentDurationFormat
const momo = extendMoment(moment);
