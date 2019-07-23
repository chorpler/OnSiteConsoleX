/**
 * Name: Log utilities
 * Vers: 3.0.1
 * Date: 2018-09-05
 * Auth: David Sargeant
 * Logs: 3.0.1 2018-08-30: Added Log.emph() function for emphatic text, plus cssStringify() function
 * Logs: 2.0.1 2018-08-30: Created
*/

const _emptyFunc = function () { };
let emphatic:any = {
  "font-family": "'Roboto Condensed', Arial, sans-serif",
  "font-size": "72px",
  "font-weight": "bold",
  "color": "#3aff44",
  "-webkit-text-stroke": "5px #9d0358",
};

export const cssStringify = function(cssCodes:any):string {
  let keys:string[] = Object.keys(cssCodes);
  let out:string = "";
  for(let key of keys) {
    let value = cssCodes[key];
    if(out !== "") {
      out += "; ";
    }
    out += `${key}: ${value}`;
  }
  return out;
};

let styleEmphasis:string = cssStringify(emphatic);

export let Log = {
  /* All console functions as of 2017-06-11, in Chrome Canary sixty-something */
  cons: ["debug", "error", "info", "log", "warn", "dir", "dirxml", "table", "trace", "group", "groupCollapsed", "groupEnd", "clear", "count", "assert", "markTimeline", "profile", "profileEnd", "timeline", "timelineEnd", "time", "timeEnd", "timeStamp"],

  /* What we will abbreviate each one to */
  newCons: ["d", "e", "i", "l", "w", "dir", "dxml", "t", "tr", "g", "gc", "ge", "c", "cnt", "a", "mt", "p", "pe", "tl", "tle", "ti", "tie", "ts"],
  /* l, d, e, i, w, t are already done */
  /*
  get d() { return console.debug.bind(console);},
  get e() { return console.error.bind(console);},
  get i() { return console.info.bind(console);},
  get l() { return console.log.bind(console);},
  get w() { return console.warn.bind(console);},
  get t() { return console.table.bind(console);},
  */
  get dir() { if (typeof console['dir'] !== 'undefined') { return console['dir'].bind(console); } else { } },
  get dxml() { if (typeof console['dirxml'] !== 'undefined') { return console['dirxml'].bind(console); } else { } },
  get tr() { if (typeof console['trace'] !== 'undefined') { return console['trace'].bind(console); } else { } },
  get g() { if (typeof console['group'] !== 'undefined') { return console['group'].bind(console); } else { } },
  get gc() { if (typeof console['groupCollapsed'] !== 'undefined') { return console['groupCollapsed'].bind(console); } else { } },
  get ge() { if (typeof console['groupEnd'] !== 'undefined') { return console['groupEnd'].bind(console);} else { } },
  get c() { if (typeof console['clear'] !== 'undefined') { return console['clear'].bind(console);} else { } },
  get cnt() { if (typeof console['count'] !== 'undefined') { return console['count'].bind(console);} else { } },
  get a() { if (typeof console['assert'] !== 'undefined') { return console['assert'].bind(console);} else { } },
  get mt() { if (typeof console['markTimeline'] !== 'undefined') { return console['markTimeline'].bind(console);} else { } },
  get p() { if (typeof console['profile'] !== 'undefined') { return console['profile'].bind(console);} else { } },
  get pe() { if (typeof console['profileEnd'] !== 'undefined') { return console['profileEnd'].bind(console);} else { } },
  get tl() { if (typeof console['timeline'] !== 'undefined') { return console['timeline'].bind(console);} else { } },
  get tle() { if (typeof console['timelineEnd'] !== 'undefined') { return console['timelineEnd'].bind(console);} else { } },
  get ti() { if (typeof console['time'] !== 'undefined') { return console['time'].bind(console);} else { } },
  get tie() { if (typeof console['timeEnd'] !== 'undefined') { return console['timeEnd'].bind(console);} else { } },
  get ts() { if (typeof console['timeStamp'] !== 'undefined') { return console['timeStamp'].bind(console);} else { } },

  /* If this value is not set to true, no output at all will occur for Log.d() */
  debug: true,

  /* If this value is not set to true, no output at all will occur for Log.l() */
  log: true,

  /* If this value is not set to true, no output at all will occur for Log.w() */
  warn: true,

  /* If this value is not set to true, no output at all will occur for Log.e() */
  error: true,

  /* If this value is not set to true, no output will occur for Log.t() */
  table: true,
  info: true,


  _dtNow: new Date(),
  _emptyFunc: function () { },

  /*
   * @comment Log.d, Log.l, and Log.e functions are using bind and property accesser
   * @see http://ejohn.org/blog/javascript-getters-and-setters/
   *
   * General logger (equivalent to console.log)
   * Log.l(logData1, logData2, ...)
   *  --> console.log( getLogHead(), logData1, logData2, ...)
   */
  get l() {
    if (!this.log) { return _emptyFunc; }
    // console.log("Now a log")
    // return console.log.bind( console, this._getLogHeader());
    return console.log.bind(console);
  },

  /* Debug logger (equivalent to console.debug)
   * Log.d(logData1, logData2, ...)
   *  --> console.debug( getLogHead(), logData1, logData2, ...)
   */
  get d() {
    if(!this.debug) { return _emptyFunc; }
    // return console.debug.bind( console, this._getLogHeader() );
    // tslint:disable-next-line: no-console
    return console.debug.bind(console);
  },

  /* Error logger (equivalent to console.error)
   * Log.e(logData1, logData2, ...)
   *  --> console.error( getLogHead(), logData1, logData2, ...)
   */
  get e() {
    // return console.error.bind( console, this._getLogHeader() );
    if(!this.error) { return _emptyFunc; }
    return console.error.bind(console);
  },

  /* Warn logger (equivalent to console.warn)
   * Log.w(logData1, logData2, ...)
   *  --> console.warn( getLogHead(), logData1, logData2, ...)
   */
  get w() {
    // return console.warn.bind( console, this._getLogHeader() );
    if(!this.warn) { return _emptyFunc; }
    return console.warn.bind(console);
  },

  /* Table logger (equivalent to console.table)
   * Log.t(tableData, ...)
   *  --> console.table( getLogHead(), tableData, ...)
   */
  get t() {
    // return console.table.bind( console, this._getLogHeader() );
    if(!this.table) { return _emptyFunc; }
    return console.table.bind(console);
  },

  /* Added this alias just to make sure table, a very useful function of console, isn't missed */
  get tab() {
    // return console.table.bind( console, this._getLogHeader() );
    if(!this.table) { return _emptyFunc; }
    return console.table.bind(console);
  },

  /* Info logger (equivalent to console.info)
   */
  get i() {
    // return console.table.bind( console, this._getLogHeader() );
    if(!this.info) { return _emptyFunc; }
    // tslint:disable-next-line: no-console
    return console.info.bind(console);
  },

  /**
   * get current time in 01/31 23:59:59.999 format
   */
  _getLogHeader: function () {
    // var now = moment();
    let now = new Date();
    this._dtNow = now;
    // var millisec = Date.now();
    // this._dtNow.setTime( millisec );
    // toLocaleString is 2013/01/31 23:59:59
    // return this._dtNow.toLocaleString().slice( 5 ) + '.' + ('000' + millisec).slice( -3 ) + ' ';
    return this._dtNow.toLocaleString() + " ";
    // return this._dtNow.format("YYYY-MM-DD HH:MM:ss.SSS");
  },

  emph: function(value:string) {
    let logString:string = `%c${value}`;
    let emphasis:string = styleEmphasis;
    return console.log(logString, emphasis);
  }
  // _dtNow: moment(),
};

// var logger = require('cordova/plugin/ios/logger');
// logger.level('DEBUG');
// window['onsiteloggerios'] = logger;
