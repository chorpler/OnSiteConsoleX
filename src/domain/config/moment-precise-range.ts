import * as moment from 'moment';
import { Moment, MomentInput } from 'moment';

export interface PreciseRange {
  "years"             : number  ,
  "months"            : number  ,
  "days"              : number  ,
  "hours"             : number  ,
  "minutes"           : number  ,
  "seconds"           : number  ,
  "firstDateWasLater" : boolean ,
};

const STRINGS = {
  nodiff: '',
  year: 'year',
  years: 'years',
  month: 'month',
  months: 'months',
  day: 'day',
  days: 'days',
  hour: 'hour',
  hours: 'hours',
  minute: 'minute',
  minutes: 'minutes',
  second: 'second',
  seconds: 'seconds',
  delimiter: ' ',
};

const pluralize = function(num:number, word:string):string {
  return num + ' ' + STRINGS[word + (num === 1 ? '' : 's')];
}

const buildStringFromValues = function(yDiff:number, mDiff:number, dDiff:number, hourDiff:number, minDiff:number, secDiff:number):string {
  let result:string[] = [];
  let out:string;

  if(yDiff) {
    result.push(pluralize(yDiff, 'year'));
  }

  if(mDiff) {
    result.push(pluralize(mDiff, 'month'));
  }

  if(dDiff) {
    result.push(pluralize(dDiff, 'day'));
  }

  if(hourDiff) {
    result.push(pluralize(hourDiff, 'hour'));
  }

  if(minDiff) {
    result.push(pluralize(minDiff, 'minute'));
  }

  if(secDiff) {
    result.push(pluralize(secDiff, 'second'));
  }

  out = result.join(STRINGS.delimiter);
  return out;
}

function buildValueObject(yDiff:number, mDiff:number, dDiff:number, hourDiff:number, minDiff:number, secDiff:number, firstDateWasLater:boolean):PreciseRange {
  let out:PreciseRange = {
      years             : yDiff             ,
      months            : mDiff             ,
      days              : dDiff             ,
      hours             : hourDiff          ,
      minutes           : minDiff           ,
      seconds           : secDiff           ,
      firstDateWasLater : firstDateWasLater ,
  };
  return out;
}


export const preciseDiff = function(laterDate:Date|Moment, returnObjectInsteadOfString:boolean):PreciseRange|string {
  let self:Moment = this;
  let staticMoment:any = moment;
  return staticMoment.preciseDiff(self, laterDate, returnObjectInsteadOfString);
};

export const staticPreciseDiff = function(earlierDate:Date|Moment, laterDate:Date|Moment, returnObjectInsteadOfString:boolean):PreciseRange|string {
  let d1:Date|Moment = earlierDate;
  let d2:Date|Moment = laterDate;
  let returnValueObject:boolean = returnObjectInsteadOfString;
  let m1:Moment = moment(d1);
  let m2:Moment = moment(d2);
  let firstDateWasLater:boolean;

  if(m1.isValid() && m2.isValid()) {
    /* Shift timezone of m1 to m2, or range will be off */
    m1.add(m2.utcOffset() - m1.utcOffset(), 'minutes');

    if(m1.isSame(m2)) {
      if(returnValueObject) {
        return buildValueObject(0, 0, 0, 0, 0, 0, false);
      } else {
        return STRINGS.nodiff;
      }
    }

    if(m1.isAfter(m2)) {
      let tmp:Moment = moment(m1);
      m1 = m2;
      m2 = tmp;
      firstDateWasLater = true;
    } else {
      firstDateWasLater = false;
    }

    let yDiff    :number = m2.year() - m1.year();
    let mDiff    :number = m2.month() - m1.month();
    let dDiff    :number = m2.date() - m1.date();
    let hourDiff :number = m2.hour() - m1.hour();
    let minDiff  :number = m2.minute() - m1.minute();
    let secDiff  :number = m2.second() - m1.second();

    if(secDiff < 0) {
      secDiff = 60 + secDiff;
      minDiff--;
    }

    if(minDiff < 0) {
      minDiff = 60 + minDiff;
      hourDiff--;
    }

    if(hourDiff < 0) {
      hourDiff = 24 + hourDiff;
      dDiff--;
    }

    if(dDiff < 0) {
      let daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract(1, 'M').daysInMonth();

      /* 31/01 -> 2/03 */
      /* Check for cases like 31 Jan to 03 Feb */
      if(daysInLastFullMonth < m1.date()) {
        dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
      } else {
        dDiff = daysInLastFullMonth + dDiff;
      }
      mDiff--;
    }

    if(mDiff < 0) {
      mDiff = 12 + mDiff;
      yDiff--;
    }

    if(returnValueObject) {
      return buildValueObject(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff, firstDateWasLater);
    } else {
      return buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff);
    }
  } else {
    let errText:string = `moment.preciseDiff(): Must pass in a valid Moment or Date`;
    console.warn(errText);
    throw new Error(errText);
  }
}

