// Author: David Sargeant
// Released: 2017-10-16
// Version: 1.11.1
// Changed: Added CLL type
//
// Previous: 2017-08-05
// Version: 1.10.1
// Changed: Added BigNumber export
//
// Previous: 2017-06-11 v0.9.38
// Changed: Added .dat and .i functions for console.dat and console.info, respectively.
// Previous: 2015-09-15 v0.9.37
// Modified from somebody's post someplace
//
// Keep the correct line number displayed in console output, but also add whatever
// else you like, like a timestamp or something. Also enables debugging flags to be
// easily turned on and off without having to comment/uncomment every console.log()
// line.
// Output sample:
//  5/10 1:13:52.553  hi                                    a.js:100
//  5/10 1:13:52.553  err                                   b.js:200
// import * as BigNumberous             from 'bignumber.js'            ;
// import { Employee, Report, Jobsite } from '../domain/domain-classes';
// import * as BigNumber from 'bignumber.js';
// import * as JSON8                    from 'json8'                   ;
// import * as momentous                from 'moment'                  ;
// import { moment } from './config.types';
// import * as momentous from 'moment';
// import 'lib/moment-excel';
// import 'moment-recur';
// import * as momentround from 'moment-round';

// import { isMoment      } from './moment-onsite'    ;
// import { Decimal       } from './config.types'     ;
// import { DecimalConfig } from './config.types'     ;
// import { json8         } from './config.types'     ;
// import { blobUtil      } from './config.types'     ;
import { Moment        } from './moment-onsite'    ;
import { moment        } from './moment-onsite'    ;
import { dec           } from './config.types'     ;
import { oo            } from './config.types'     ;
import { Employee      } from '../domain/employee' ;
import { Report        } from '../domain/report'   ;
import { Jobsite       } from '../domain/jobsite'  ;


// export const decStatic = BigNumberous.BigNumberStatic;
// export const moment = momentous;

// export type CLL      = {name:string, fullName:string};

export const roundMaxDecimals = function(value:number, decimals?:number):number {
  let places:number = typeof decimals === 'number' ? decimals : 2;
  let string1:string = value.toFixed(places);
  let num1:number = Number(string1);
  return num1;
}

export const roundToNearest = function(value:number, roundTo:number):number {
  let toRound:number = Number(value);
  let toNearest:number = typeof roundTo === 'number' ? Math.trunc(Math.abs(roundTo)) : 1;
  if(!isNaN(toRound) && !isNaN(toNearest)) {
    let out:number = Math.round(toRound / toNearest) * toNearest;
    return out;
  }
  console.warn(`roundToNearest(): Must supply numbers as parameters.`);
  return null;
}

export const roundUpToNearest = function(value:number, roundUpTo:number):number {
  let toRound:number = Number(value);
  let toNearest:number = typeof roundUpTo === 'number' ? Math.trunc(Math.abs(roundUpTo)) : 1;
  if(!isNaN(toRound) && !isNaN(toNearest)) {
    let out:number = Math.ceil(toRound / toNearest) * toNearest;
    return out;
  }
  console.warn(`roundToNearest(): Must supply numbers as parameters.`);
  return null;
}

export const roundDownToNearest = function(value:number, roundUpTo:number):number {
  let toRound:number = Number(value);
  let toNearest:number = typeof roundUpTo === 'number' ? Math.trunc(Math.abs(roundUpTo)) : 1;
  if(!isNaN(toRound) && !isNaN(toNearest)) {
    let out:number = Math.floor(toRound / toNearest) * toNearest;
    return out;
  }
  console.warn(`roundToNearest(): Must supply numbers as parameters.`);
  return null;
}

export const rounded     = roundToNearest   ;
export const roundedUp   = roundUpToNearest ;
export const roundedDown = roundUpToNearest ;

export const round = function(value:number, decimals:number):number {
  let firstString:string = `${value}e${decimals}`;
  let firstNum:number = Math.round(Number(firstString));
  let secondString:string = `${firstNum}e-${decimals}`;
  let secondNum:number = Number(secondString);
  return secondNum;
}

export const matchesCI = function(str1:string, str2:string):boolean {
  let lc1:string = typeof str1 === 'string' ? str1.toLowerCase() : "";
  let lc2:string = typeof str2 === 'string' ? str2.toLowerCase() : "";
  let out:boolean = false;
  if(lc1 == lc2) {
    out = true;;
  }
  return out;
}

export const capitalize = function(str1:string):string {
  let out:string = "";
  if(typeof str1 === 'string' && str1.length > 0) {
    out = str1.toLowerCase();
    let first:string = out[0].toUpperCase();
    let rest:string  = out.slice(1);
    out = first + rest;
  }
  return out;
}

export const isNumeric = function(value:number):boolean {
  let out:boolean = false;
  if(typeof value === 'number') {
    out = true;
  } else {
    let tmp1:number = Number(value);
    if(!isNaN(tmp1)) {
      out = true;
    }
  }
  return out;
}

export const isNumber = function(value:number):boolean {
  if(typeof value === 'number') {
    return true;
  } else {
    return false;
  }
}

window['roundToNearest'] = roundToNearest;
window['roundUpToNearest'] = roundUpToNearest;
window['roundDownToNearest'] = roundDownToNearest;
window['matchesCI'] = matchesCI;
window['capitalize'] = capitalize;
window['isNumeric'] = isNumeric;
window['isNumber'] = isNumber;

export function _dedupe<T>(array:Array<T>, propertyThatMustBeUnique?:string):Array<T> {
  // let property:string;
  // if(propertyThatMustBeUnique && typeof propertyThatMustBeUnique === 'string') {
  //   property = propertyThatMustBeUnique;
  // } else {
  //   if(Array.isArray(array) && array.length) {
  //     const propertiesToTry:string[] = [
  //       'value',
  //       'fullName',
  //       'id'
  //     ];
  //     for(let prop of propertiesToTry) {
  //       let filteredArray:Array<any> = array.filter((a:any) => {
  //         return
  //       });
  //     }
  //     if(typeof val === 'object') {
  //       if(val['value'] != undefined) {
  //         property = 'value';
  //       } else if(val['fullName'] != undefined) {
  //         property = 'fullName';
  //       }
  //     }
  //   }
  // }
  let property:string = propertyThatMustBeUnique ? propertyThatMustBeUnique : null;
  if(property) {
    /* Use property name as unique ID */
    return array.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
    });
  } else {
    if(typeof array[0] === 'object' && array[0]['fullName']) {
      return _dedupe(array, 'fullName');
    } else {
      /* Just check array element identities (cloned objects will show up as non-duplicates) */
      let unique_array = array.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });
      return unique_array;
    }
  }
}

window['oo']        = oo        ;
window['dec']       = dec       ;
window['decimal']   = dec       ;
window['_dedupe']   = _dedupe   ;

export const _matchCLL = (cll: string, sitecll: any) => {
  let cll1 = cll.toUpperCase();
  let cll2 = sitecll.name.toUpperCase();
  let cll3 = sitecll.fullName.toUpperCase();
  return Boolean(cll1 === cll2 || cll1 === cll3);
};

export const _matchSite = (tech:Employee, site:Jobsite) => {
  let cli = tech.client;
  let loc = tech.location;
  let lid = tech.locID;
  let client = site.client;
  let location = site.location;
  let locID = site.locID;
  return Boolean(_matchCLL(cli, client) && _matchCLL(loc, location) && _matchCLL(lid, locID));
};

export const _matchReportSite = (report:Report, site:Jobsite) => {
  let cli = report.client;
  let loc = report.location;
  let lid = report.location_id;
  let client = site.client;
  let location = site.location;
  let locID = site.locID;
  return Boolean(_matchCLL(cli, client) && _matchCLL(loc, location) && _matchCLL(lid, locID));
};

export const _matchSiteFromSchedule = (tech:Employee, sites:Array<Jobsite>) => {

}

export const _sortReportsByDate = (a:Report, b:Report):number => {
  let dateA:Moment, dateB:Moment, startA:Moment, startB:Moment;
  let now = moment();
  if(a instanceof Report) {
    dateA = moment(a.getReportDate()).startOf('day');
    startA = a.getStartTime();
  } else {
    dateA = now;
    startA = now;
  }
  if(b instanceof Report) {
    dateB = moment(b.getReportDate()).startOf('day');
    startB = b.getStartTime();
  } else {
    dateB = now;
    startB = now;
  }
  return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : startA.isBefore(startB) ? -1 : startA.isAfter(startB) ? 1 : 0;
};

export const _sortReportsByStartTime = (a:Report, b:Report):number => {
  let timeA:Moment, timeB:Moment;
  let now = moment();
  if(a instanceof Report) {
    timeA = moment(a.getStartTime());
  } else {
    timeA = now;
  }
  if(b instanceof Report) {
    timeB = moment(b.getStartTime());
  } else {
    timeB = now;
  }
  return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
}

export const _sortReports = _sortReportsByDate;

export const _sortTechsByFullName = (a:Employee, b:Employee):number => {
  let lA:string = "", lB:string = "", fA:string = "", fB:string = "";
  if(a instanceof Employee) {
    lA = a.getLastName();
    lB = b.getLastName();
  }
  if(b instanceof Employee) {
    fA = a.getFirstName();
    fB = b.getFirstName();
  }
  return lA > lB ? 1 : lA < lB ? -1 : fA > fB ? 1 : fA < fB ? -1 : 0;
}

export const _sortTechsByUsername = (a:Employee, b:Employee):number => {
  let uA:string = "", uB:string = "";
  if(a instanceof Employee) {
    uA = a.getUsername();
  }
  if(b instanceof Employee) {
    uB = b.getUsername();
  }
  return uA > uB ? 1 : uA < uB ? -1 : 0;
}

export const _sortTechs = _sortTechsByFullName;

// export const isMoment = function (val:any) { return (moment.isMoment(val) && moment(val).isValid()); }
export const sizeOf = function (val:any) {
  let size = 0;
  if (val === null || val === undefined) {
    size = 0;
  } else if (Array.isArray(val) || typeof val === 'string') {
    size = val.length;
  } else if (typeof val === 'object') {
    size = Object.keys(val).length;
  }
  return size;
}

export const XLDay0 = moment([1900, 0, 1]).startOf('day');

export const date2xl = function (date: Moment | Date | string): number {
  let d = null;
  if (typeof date === 'string') {
    d = moment(date, 'YYYY-MM-DD');
  } else {
    d = moment(date);
  }
  let mDate = moment(date).startOf('day');
  let xlDate = mDate.diff(XLDay0, 'days', true) + 2;
  return xlDate;
}

export const xl2date = function (xlDate: number): Moment {
  let date = moment(XLDay0).add(xlDate - 2, 'days').startOf('day');
  return date;
}

export const xl2datetime = function (xlDate: number): Moment {
  let datetime = moment(XLDay0).add(xlDate - 2, 'days');
  return datetime;
}


/**
 * Utility function for doing string-to-ArrayBuffer conversions (usually for generating Blobs)
 *
 * @param {string} s A string to be converted.
 * @returns {ArrayBuffer} The resulting ArrayBuffer.
 */
export const s2ab = function(s:string):ArrayBuffer {
  const buf:ArrayBuffer = new ArrayBuffer(s.length);
  const view:Uint8Array = new Uint8Array(buf);
  let len = s.length;
  for(let i = 0; i !== len; ++i) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}

window['s2ab'] = s2ab;


export var CONSOLE = {
  t1: function (res) { console.log("Success"); console.log(res); window["res1"] = res; return res; },
  c1: function (err) { console.log("Failure"); console.error(err); window["err1"] = err; return err; },
  runInZone: function() { },
  round: round,
  roundToNearest: roundToNearest,
}
/* Use this to get all current functions from console */
/*
var doit = function () { var out = [], nonfn = []; for (let i in console) { if (typeof console[i] == 'function') { out.push(i); } else { nonfn.push(i); } } console.log("console functions, then non-functions:"); console.log(out); console.log(nonfn); var vals = { 'functions': out, 'nonfunctions': nonfn }; window['res1'] = vals; return vals; }
*/
/*
var doit = function () {
  var out = [], nonfn = [];
  for (let i in console) {
    if (typeof console[i] == 'function') {
      out.push(i);
    } else {
      nonfn.push(i);
    }
  }
  console.log("console functions, then non-functions:");
  console.log(out);
  console.log(nonfn);
  var vals = {'functions': out, 'nonfunctions': nonfn};
  window['res1'] = vals;
  return vals;
}
*/

