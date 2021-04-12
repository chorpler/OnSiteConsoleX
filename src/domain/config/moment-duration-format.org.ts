// /*! Moment Duration Format v2.2.2
//  *  https://github.com/jsmreese/moment-duration-format
//  *  Date: 2018-02-16
//  *
//  *  Duration format plugin function for the Moment.js library
//  *  http://momentjs.com/
//  *
//  *  Copyright 2018 John Madhavan-Reese
//  *  Released under the MIT license
//  */

// import { Log } from 'domain/onsitexdomain';
// import * as moment from 'moment';
// import { Moment   } from './moment-onsite' ;
// import { Duration } from './moment-onsite' ;
// import { LocaleSpecification } from './moment-onsite' ;

// declare const window:any;

// declare module "moment" {
//   namespace duration {
//       const fn: Duration;
//   }

//   interface Duration {
//       format: Format;
//   }

//   interface Format {
//       defaults: DurationFormatSettings;

//       (template: string | TemplateFunction, precision: number, settings?: DurationFormatSettings): string;
//       (template: string | TemplateFunction, settings?: DurationFormatSettings): string;
//       (settings?: DurationFormatSettings): string;
//   }

//   type UnitOfTrimV1 = 'left' | 'right';
//   type UnitOfTrim = (
//       'large' | 'small' | 'both' |
//       'mid' | 'all' | 'final'
//   );

//   interface DurationFormatSettings {
//       trim?: false | UnitOfTrimV1 | UnitOfTrim | string | Array<UnitOfTrim | string>;
//       largest?: number;
//       trunc?: true;
//       stopTrim?: string;

//       minValue?: number;
//       maxValue?: number;

//       useGrouping?: boolean;
//       precision?: number;
//       decimalSeparator?: string;
//       groupingSeparator?: string;
//       grouping?: number[];

//       useSignificantDigits?: true;

//       forceLength?: boolean;
//       template?: string | TemplateFunction;

//       userLocale?: string;
//       usePlural?: boolean;
//       useLeftUnits?: boolean;
//       useToLocaleString?: boolean;

//       returnMomentTypes?:boolean;
//       outputTypes?:string[];

//   }

//   type DurationLabelType = "long" | "standard" | "short";
//   type DurationTemplate = "HMS" | "HM" | "MS";
//   type DurationToken = (
//       "S" | "SS" | "SSS" |
//       "s" | "ss" | "sss" |
//       "m" | "mm" | "mmm" |
//       "h" | "hh" | "hhh" |
//       "d" | "dd" | "ddd" |
//       "w" | "ww" | "www" |
//       "M" | "MM" | "MMM" |
//       "y" | "yy" | "yyy"
//   );

//   type DurationLabelDef = {[duration in DurationToken]: string};
//   type DurationTimeDef = {[template in DurationTemplate]: string};

//   interface DurationLabelTypeDef {
//       type: DurationLabelType;
//       string: string;
//   }

//   interface LocaleSpecification {
//       durationLabelsLong?: DurationLabelDef;
//       durationLabelsStandard?: DurationLabelDef;
//       durationLabelsShort?: DurationLabelDef;
//       durationTimeTemplates?: DurationTimeDef;
//       durationLabelTypes?: DurationLabelTypeDef[];
//       durationPluralKey?: (token: string, integerValue: number, decimalValue: number) => string;
//   }

//   interface DurationFormatOptions {
//     userLocale               ?: string  ;
//     useToLocaleString        ?: boolean ;
//     useGrouping              ?: boolean ;
//     grouping                 ?: string  ;
//     minimumIntegerDigits     ?: number  ;
//     maximumSignificantDigits ?: number  ;
//     maximumFractionDigits    ?: number  ;
//     minimumFractionDigits    ?: number  ;
//     fractionDigits           ?: number  ;
//     groupingSeparator        ?: string  ;
//     decimalSeparator         ?: string  ;
//   }

//   interface DurationFormatLabel {
//     type  : string ;
//     key   : string ;
//     label : string ;
//   }
//   type DurationFormatLabels = DurationFormatLabel[];
//   type TemplateFunction = ((this: DurationFormatSettings) => string);
//   type FormatterFunction = (value:number, locale:string, options:DurationFormatOptions) => string;
// }

// declare function momentDurationFormatSetup(_moment: typeof moment): void;



// export type DurationType = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
// export interface DurationTarget {
//   type: DurationType;
//   value: number;
// }
// export type DurationTargets = DurationTarget[];
// export interface DurationBubble {
//   type: DurationType;
//   targets: DurationTargets;
// }
// export type DurationBubbles = DurationBubble[];

// // export interface DurationFormatOptions {
// //   userLocale               ?: string  ;
// //   useToLocaleString        ?: boolean ;
// //   useGrouping              ?: boolean ;
// //   grouping                 ?: string  ;
// //   minimumIntegerDigits     ?: number  ;
// //   maximumSignificantDigits ?: number  ;
// //   maximumFractionDigits    ?: number  ;
// //   minimumFractionDigits    ?: number  ;
// //   fractionDigits           ?: number  ;
// //   groupingSeparator        ?: string  ;
// //   decimalSeparator         ?: string  ;
// // }

// // export interface DurationFormatLabel {
// //   type  : string ;
// //   key   : string ;
// //   label : string ;
// // }
// // export type DurationFormatLabels = DurationFormatLabel[];

// // export type DurationLabelKey = 'S' | 'SS' | 's' | 'ss' | 'm' | 'mm' | 'h' | 'hh' | 'd' | 'dd' | 'w' | 'ww' | 'M' | 'MM' | 'y' | 'yy';
// // export type DurationTimeKey = 'HMS' | 'HM' | 'MS';
// // export interface DurationLabels extends LocaleSpecification {
// //   S: string;
// //   SS: string;
// //   SSS: string;
// //   s: string;
// //   ss: string;
// //   sss: string;
// //   m: string;
// //   mm: string;
// //   mmm: string;
// //   h: string;
// //   hh: string;
// //   hhh: string;
// //   d: string;
// //   dd: string;
// //   ddd: string;
// //   w: string;
// //   ww: string;
// //   www: string;
// //   M: string;
// //   MM: string;
// //   MMM: string;
// //   y: string;
// //   yy: string;
// //   yyy: string;
// //   yyyy: string;
// // }
// // export interface DurationTimeLabels {
// //   HMS: string;
// //   HM: string;
// //   MS: string;
// // }
// // export interface DurationLabelType {
// //   type: "standard"|"short";
// //   string: string;
// // }
// // export type DurationLabelTypes = DurationLabelType[];

// // // export (token:string, integerValue:number, decimalValue:number):string
// // export type DurationPluralKeyFunction = (token:string, integerValue:number, decimalValue:number) => string;

// // export interface DurationFormatLocale {
// //   durationLabelsStandard: DurationLabels;
// //   durationLabelsShort: DurationLabels;
// //   durationTimeTemplates: DurationTimeLabels;
// //   durationLabelTypes: DurationLabelTypes;
// //   durationPluralKey: DurationPluralKeyFunction;
// // }

// // export type DurationFormatTrimOptions = "large"|"small"|"both"|"mid"|"final"|"all"|"left"|"right";
// // export type DurationFormatTrim = DurationFormatTrimOptions|DurationFormatTrimOptions[]|false|null;

// // export interface DurationFormatSettings {
// //   // Many options are defaulted to `null` to distinguish between
// //   // 'not set' and 'set to `false`'

// //   // trim
// //   // Can be a string, a delimited list of strings, an array of strings,
// //   // or a boolean.
// //   // "large" - will trim largest-magnitude zero-value tokens until
// //   // finding a token with a value, a token identified as 'stopTrim', or
// //   // the final token of the format string.
// //   // "small" - will trim smallest-magnitude zero-value tokens until
// //   // finding a token with a value, a token identified as 'stopTrim', or
// //   // the final token of the format string.
// //   // "both" - will execute "large" trim then "small" trim.
// //   // "mid" - will trim any zero-value tokens that are not the first or
// //   // last tokens. Usually used in conjunction with "large" or "both".
// //   // e.g. "large mid" or "both mid".
// //   // "final" - will trim the final token if it is zero-value. Use this
// //   // option with "large" or "both" to output an empty string when
// //   // formatting a zero-value duration. e.g. "large final" or "both final".
// //   // "all" - Will trim all zero-value tokens. Shorthand for "both mid final".
// //   // "left" - maps to "large" to support plugin's version 1 API.
// //   // "right" - maps to "large" to support plugin's version 1 API.
// //   // `false` - template tokens are not trimmed.
// //   // `true` - treated as "large".
// //   // `null` - treated as "large".
// //   trim?: DurationFormatTrim;

// //   // stopTrim
// //   // A moment token string, a delimited set of moment token strings,
// //   // or an array of moment token strings. Trimming will stop when a token
// //   // listed in this option is reached. A "*" character in the format
// //   // template string will also mark a moment token as stopTrim.
// //   // e.g. "d [days] *h:mm:ss" will always stop trimming at the 'hours' token.
// //   stopTrim?: string|string[]|null;

// //   // largest
// //   // Set to a positive integer to output only the "n" largest-magnitude
// //   // moment tokens that have a value. All lesser-magnitude moment tokens
// //   // will be ignored. This option takes effect even if `trim` is set
// //   // to `false`.
// //   largest?: number|null;

// //   // maxValue
// //   // Use `maxValue` to render generalized output for large duration values,
// //   // e.g. `"> 60 days"`. `maxValue` must be a positive integer and is
// //   /// applied to the greatest-magnitude moment token in the format template.
// //   maxValue?: number|null;

// //   // minValue
// //   // Use `minValue` to render generalized output for small duration values,
// //   // e.g. `"< 5 minutes"`. `minValue` must be a positive integer and is
// //   // applied to the least-magnitude moment token in the format template.
// //   minValue?: number|null;

// //   // precision (default 0)
// //   // If a positive integer, number of decimal fraction digits to render.
// //   // If a negative integer, number of integer place digits to truncate to 0.
// //   // If `useSignificantDigits` is set to `true` and `precision` is a positive
// //   // integer, sets the maximum number of significant digits used in the
// //   // formatted output.
// //   precision?: number;

// //   // trunc (default false)
// //   // Default behavior rounds final token value. Set to `true` to
// //   // truncate final token value, which was the default behavior in
// //   // version 1 of this plugin.
// //   trunc?: boolean;

// //   // forceLength
// //   // Force first moment token with a value to render at full length
// //   // even when template is trimmed and first moment token has length of 1.
// //   forceLength?: number|null;

// //   // userLocale
// //   // Formatted numerical output is rendered using `toLocaleString`
// //   // and the locale of the user's environment. Set this option to render
// //   // numerical output using a different locale. Unit names are rendered
// //   // and detected using the locale set in moment.js, which can be different
// //   // from the locale of user's environment.
// //   userLocale?: string|null;

// //   // usePlural (default true)
// //   // Will automatically singularize or pluralize unit names when they
// //   // appear in the text associated with each moment token. Standard and
// //   // short unit labels are singularized and pluralized, based on locale.
// //   // e.g. in english, "1 second" or "1 sec" would be rendered instead
// //   // of "1 seconds" or "1 secs". The default pluralization function
// //   // renders a plural label for a value with decimal precision.
// //   // e.g. "1.0 seconds" is never rendered as "1.0 second".
// //   // Label types and pluralization function are configurable in the
// //   // localeData extensions.
// //   usePlural?: boolean;

// //   // useLeftUnits (default false)
// //   // The text to the right of each moment token in a format string
// //   // is treated as that token's units for the purposes of trimming,
// //   // singularizing, and auto-localizing.
// //   // e.g. "h [hours], m [minutes], s [seconds]".
// //   // To properly singularize or localize a format string such as
// //   // "[hours] h, [minutes] m, [seconds] s", where the units appear
// //   // to the left of each moment token, set useLeftUnits to `true`.
// //   // This plugin is not tested in the context of rtl text.
// //   useLeftUnits?: boolean;

// //   // useGrouping (default true)
// //   // Enables locale-based digit grouping in the formatted output. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
// //   useGrouping?: boolean;

// //   // useSignificantDigits (default false)
// //   // Treat the `precision` option as the maximum significant digits
// //   // to be rendered. Precision must be a positive integer. Significant
// //   // digits extend across unit types,
// //   // e.g. "6 hours 37.5 minutes" represents 4 significant digits.
// //   // Enabling this option causes token length to be ignored. See  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
// //   useSignificantDigits?: boolean;

// //   // template (default this.defaultFormatTemplate)
// //   // The template string used to format the duration. May be a function
// //   // or a string. Template functions are executed with the `this` binding
// //   // of the settings object so that template strings may be dynamically
// //   // generated based on the duration object (accessible via `this.duration`)
// //   // or any of the other settings. Leading and trailing space, comma,
// //   // period, and colon characters are trimmed from the resulting string.
// //   template?: (() => string)|string;

// //   // useToLocaleString (default true)
// //   // Set this option to `false` to ignore the `toLocaleString` feature
// //   // test and force the use of the `formatNumber` fallback function
// //   // included in this plugin.
// //   useToLocaleString?: boolean;

// //   // formatNumber fallback options.
// //   // When `toLocaleString` is detected and passes the feature test, the
// //   // following options will have no effect: `toLocaleString` will be used
// //   // for formatting and the grouping separator, decimal separator, and
// //   // integer digit grouping will be determined by the user locale.

// //   // groupingSeparator (default ",")
// //   // The integer digit grouping separator used when using the fallback
// //   // formatNumber function.
// //   groupingSeparator?: string;

// //   // decimalSeparator (default ".")
// //   // The decimal separator used when using the fallback formatNumber
// //   // function.
// //   decimalSeparator?: string;

// //   // grouping (default [3])
// //   // The integer digit grouping used when using the fallback formatNumber
// //   // function. Must be an array. The default value of `[3]` gives the
// //   // standard 3-digit thousand/million/billion digit groupings for the
// //   // "en" locale. Setting this option to `[3, 2]` would generate the
// //   // thousand/lakh/crore digit groupings used in the "en-IN" locale.
// //   grouping?: number[];

// //   // returnMomentTypes (default false)
// //   // A boolean that sets durationFormat to return the
// //   // processed momentTypes instead of formatted output.
// //   returnMomentTypes?:boolean;

// //   // outputTypes is an array of moment token types that determines
// //   // the tokens returned in formatted output. This option overrides
// //   // trim, largest, stopTrim, etc.
// //   outputTypes?: string[];
// // }

// // export type FormatterFunction = (value:number, locale:string, options:DurationFormatOptions) => string;


// export class MomentDurationFormat {
//   public cache:any = {};
//   // `Number#tolocaleString` is tested on plugin initialization.
//   // If the feature test passes, `toLocaleStringWorks` will be set to `true` and the
//   // native function will be used to generate formatted output. If the feature
//   // test fails, the fallback format function internal to this plugin will be
//   // used.
//   public toLocaleStringWorks:boolean = false;

//   // `Number#toLocaleString` rounds incorrectly for select numbers in Microsoft
//   // environments (Edge, IE11, Windows Phone) and possibly other environments.
//   // If the rounding test fails and `toLocaleString` will be used for formatting,
//   // the plugin will "pre-round" number values using the fallback number format
//   // function before passing them to `toLocaleString` for final formatting.
//   public toLocaleStringRoundingWorks:boolean = false;

//   // `Intl.NumberFormat#format` is tested on plugin initialization.
//   // If the feature test passes, `intlNumberFormatRoundingWorks` will be set to
//   // `true` and the native function will be used to generate formatted output.
//   // If the feature test fails, either `Number#tolocaleString` (if
//   // `toLocaleStringWorks` is `true`), or the fallback format function internal
//   //  to this plugin will be used.
//   public intlNumberFormatWorks:boolean = false;

//   // `Intl.NumberFormat#format` rounds incorrectly for select numbers in Microsoft
//   // environments (Edge, IE11, Windows Phone) and possibly other environments.
//   // If the rounding test fails and `Intl.NumberFormat#format` will be used for
//   // formatting, the plugin will "pre-round" number values using the fallback number
//   // format function before passing them to `Intl.NumberFormat#format` for final
//   // formatting.
//   public intlNumberFormatRoundingWorks:boolean = false;

//   // Token type names in order of descending magnitude.
//   public types:string[] = "escape years months weeks days hours minutes seconds milliseconds general".split(" ");

//   public bubbles:DurationBubbles = [
//     {
//       type: "seconds",
//       targets: [
//         { type: "minutes", value: 60 },
//         { type: "hours", value: 3600 },
//         { type: "days", value: 86400 },
//         { type: "weeks", value: 604800 },
//         { type: "months", value: 2678400 },
//         { type: "years", value: 31536000 }
//       ]
//     },
//     {
//       type: "minutes",
//       targets: [
//         { type: "hours", value: 60 },
//         { type: "days", value: 1440 },
//         { type: "weeks", value: 10080 },
//         { type: "months", value: 44640 },
//         { type: "years", value: 525600 }
//       ]
//     },
//     {
//       type: "hours",
//       targets: [
//         { type: "days", value: 24 },
//         { type: "weeks", value: 168 },
//         { type: "months", value: 744 },
//         { type: "years", value: 8760 }
//       ]
//     },
//     {
//       type: "days",
//       targets: [
//         { type: "weeks", value: 7 },
//         { type: "months", value: 31 },
//         { type: "years", value: 365 }
//       ]
//     },
//     {
//       type: "months",
//       targets: [
//         { type: "years", value: 12 }
//       ]
//     }
//   ];

//   constructor() {
//     let testVal:number = 5.05;
//     if(typeof testVal.toLocaleString === 'function') {
//       this.toLocaleStringWorks = true;
//     }
//     // this.init(moment);
//     this.toLocaleStringWorks = this.toLocaleStringSupportsLocales() && this.featureTestFormatter(this.toLocaleStringFormatter);
//     this.toLocaleStringRoundingWorks = this.toLocaleStringWorks && Boolean(this.featureTestFormatterRounding(this.toLocaleStringFormatter));

//     this.intlNumberFormatWorks = this.featureTestFormatter(this.intlNumberFormatFormatter);
//     this.intlNumberFormatRoundingWorks = this.intlNumberFormatWorks && Boolean(this.featureTestFormatterRounding(this.intlNumberFormatFormatter));

//     // Initialize duration format on the global moment instance.
//     this.init(moment);

//     // toLocaleStringWorks = toLocaleStringSupportsLocales() && featureTestFormatter(toLocaleStringFormatter);
//     // toLocaleStringRoundingWorks = toLocaleStringWorks && featureTestFormatterRounding(toLocaleStringFormatter);

//     // // Run feature tests for `Intl.NumberFormat#format`.
//     // let intlNumberFormatFormatter = function (number, locale, options) {
//     //   if (typeof window !== 'undefined' && window && window.Intl && window.Intl.NumberFormat) {
//     //     return window.Intl.NumberFormat(locale, options).format(number);
//     //   }
//     // };

//     // intlNumberFormatWorks = featureTestFormatter(intlNumberFormatFormatter);
//     // intlNumberFormatRoundingWorks = intlNumberFormatWorks && featureTestFormatterRounding(intlNumberFormatFormatter);

//     // // Initialize duration format on the global moment instance.
//     // init(moment);

//     // // Return the init function so that duration format can be
//     // // initialized on other moment instances.
//     // return init;

//     // Return the init function so that duration format can be
//     // initialized on other moment instances.
//     // return init;

//     // if(typeof testVal.to)
//   }

//   public init(momentClass:typeof moment):typeof moment {
//     let context = momentClass != undefined ? momentClass : moment;
//     if(!context) {
//       let text = "Moment Duration Format init cannot find moment instance. Invalid Moment class provided";
//       Log.w(text + ":", momentClass);
//       let err = new Error(text);
//       throw err;
//     }

//     (context.duration as any).format = this.durationsFormat;
//     ((context.duration as any).fn as any).format = this.durationFormat;

//     // (((context.duration as any).fn as any).format as any).defaults = {
//     let defaults = {
//       // Many options are defaulted to `null` to distinguish between
//       // 'not set' and 'set to `false`'

//       // trim
//       // Can be a string, a delimited list of strings, an array of strings,
//       // or a boolean.
//       // "large" - will trim largest-magnitude zero-value tokens until
//       // finding a token with a value, a token identified as 'stopTrim', or
//       // the final token of the format string.
//       // "small" - will trim smallest-magnitude zero-value tokens until
//       // finding a token with a value, a token identified as 'stopTrim', or
//       // the final token of the format string.
//       // "both" - will execute "large" trim then "small" trim.
//       // "mid" - will trim any zero-value tokens that are not the first or
//       // last tokens. Usually used in conjunction with "large" or "both".
//       // e.g. "large mid" or "both mid".
//       // "final" - will trim the final token if it is zero-value. Use this
//       // option with "large" or "both" to output an empty string when
//       // formatting a zero-value duration. e.g. "large final" or "both final".
//       // "all" - Will trim all zero-value tokens. Shorthand for "both mid final".
//       // "left" - maps to "large" to support plugin's version 1 API.
//       // "right" - maps to "large" to support plugin's version 1 API.
//       // `false` - template tokens are not trimmed.
//       // `true` - treated as "large".
//       // `null` - treated as "large".
//       trim: null,

//       // stopTrim
//       // A moment token string, a delimited set of moment token strings,
//       // or an array of moment token strings. Trimming will stop when a token
//       // listed in this option is reached. A "*" character in the format
//       // template string will also mark a moment token as stopTrim.
//       // e.g. "d [days] *h:mm:ss" will always stop trimming at the 'hours' token.
//       stopTrim: null,

//       // largest
//       // Set to a positive integer to output only the "n" largest-magnitude
//       // moment tokens that have a value. All lesser-magnitude moment tokens
//       // will be ignored. This option takes effect even if `trim` is set
//       // to `false`.
//       largest: null,

//       // maxValue
//       // Use `maxValue` to render generalized output for large duration values,
//       // e.g. `"> 60 days"`. `maxValue` must be a positive integer and is
//       /// applied to the greatest-magnitude moment token in the format template.
//       maxValue: null,

//       // minValue
//       // Use `minValue` to render generalized output for small duration values,
//       // e.g. `"< 5 minutes"`. `minValue` must be a positive integer and is
//       // applied to the least-magnitude moment token in the format template.
//       minValue: null,

//       // precision
//       // If a positive integer, number of decimal fraction digits to render.
//       // If a negative integer, number of integer place digits to truncate to 0.
//       // If `useSignificantDigits` is set to `true` and `precision` is a positive
//       // integer, sets the maximum number of significant digits used in the
//       // formatted output.
//       precision: 0,

//       // trunc
//       // Default behavior rounds final token value. Set to `true` to
//       // truncate final token value, which was the default behavior in
//       // version 1 of this plugin.
//       trunc: false,

//       // forceLength
//       // Force first moment token with a value to render at full length
//       // even when template is trimmed and first moment token has length of 1.
//       forceLength: null,

//       // userLocale
//       // Formatted numerical output is rendered using `toLocaleString`
//       // and the locale of the user's environment. Set this option to render
//       // numerical output using a different locale. Unit names are rendered
//       // and detected using the locale set in moment.js, which can be different
//       // from the locale of user's environment.
//       userLocale: null,

//       // usePlural
//       // Will automatically singularize or pluralize unit names when they
//       // appear in the text associated with each moment token. Standard and
//       // short unit labels are singularized and pluralized, based on locale.
//       // e.g. in english, "1 second" or "1 sec" would be rendered instead
//       // of "1 seconds" or "1 secs". The default pluralization function
//       // renders a plural label for a value with decimal precision.
//       // e.g. "1.0 seconds" is never rendered as "1.0 second".
//       // Label types and pluralization function are configurable in the
//       // localeData extensions.
//       usePlural: true,

//       // useLeftUnits
//       // The text to the right of each moment token in a format string
//       // is treated as that token's units for the purposes of trimming,
//       // singularizing, and auto-localizing.
//       // e.g. "h [hours], m [minutes], s [seconds]".
//       // To properly singularize or localize a format string such as
//       // "[hours] h, [minutes] m, [seconds] s", where the units appear
//       // to the left of each moment token, set useLeftUnits to `true`.
//       // This plugin is not tested in the context of rtl text.
//       useLeftUnits: false,

//       // useGrouping
//       // Enables locale-based digit grouping in the formatted output. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
//       useGrouping: true,

//       // useSignificantDigits
//       // Treat the `precision` option as the maximum significant digits
//       // to be rendered. Precision must be a positive integer. Significant
//       // digits extend across unit types,
//       // e.g. "6 hours 37.5 minutes" represents 4 significant digits.
//       // Enabling this option causes token length to be ignored. See  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString

//       useSignificantDigits: false,

//       // template
//       // The template string used to format the duration. May be a function
//       // or a string. Template functions are executed with the `this` binding
//       // of the settings object so that template strings may be dynamically
//       // generated based on the duration object (accessible via `this.duration`)
//       // or any of the other settings. Leading and trailing space, comma,
//       // period, and colon characters are trimmed from the resulting string.
//       template: this.defaultFormatTemplate,

//       // useToLocaleString
//       // Set this option to `false` to ignore the `toLocaleString` feature
//       // test and force the use of the `formatNumber` fallback function
//       // included in this plugin.
//       useToLocaleString: true,

//       // formatNumber fallback options.
//       // When `toLocaleString` is detected and passes the feature test, the
//       // following options will have no effect: `toLocaleString` will be used
//       // for formatting and the grouping separator, decimal separator, and
//       // integer digit grouping will be determined by the user locale.

//       // groupingSeparator
//       // The integer digit grouping separator used when using the fallback
//       // formatNumber function.
//       groupingSeparator: ",",

//       // decimalSeparator
//       // The decimal separator used when using the fallback formatNumber
//       // function.
//       decimalSeparator: ".",

//       // grouping
//       // The integer digit grouping used when using the fallback formatNumber
//       // function. Must be an array. The default value of `[3]` gives the
//       // standard 3-digit thousand/million/billion digit groupings for the
//       // "en" locale. Setting this option to `[3, 2]` would generate the
//       // thousand/lakh/crore digit groupings used in the "en-IN" locale.
//       grouping: [3],
//     };

//     (((context.duration as any).fn as any).format as any).defaults = defaults;
//     context.updateLocale('en', this.engLocale);
//     return context;
//   }

//   // Run feature tests for `Number#toLocaleString`.
//   public toLocaleStringFormatter(value:number, locale:string, options:Intl.NumberFormatOptions):string {
//     return value.toLocaleString(locale, options);
//   }

//   // Run feature tests for `Intl.NumberFormat#format`.
//   public intlNumberFormatFormatter(value:number, locale:string, options:Intl.NumberFormatOptions):string {
//     if(typeof window !== 'undefined' && window && window.Intl && window.Intl.NumberFormat) {
//       return Intl.NumberFormat(locale, options).format(value);
//     }
//   }

//   public toLocaleStringSupportsLocales():boolean {
//     let number = 0;
//     try {
//       number.toLocaleString('i');
//     } catch (e) {
//       return e.name === 'RangeError';
//     }
//     return false;
//   }

//   public featureTestFormatterRounding(formatter:moment.FormatterFunction):boolean {
//     let val:number = 3.55;
//     let locale:string = "en";
//     let out:boolean = false;
//     if(typeof formatter === 'function') {
//       let formattedOutput = formatter(val, locale, {
//         useGrouping: false,
//         minimumIntegerDigits: 1,
//         minimumFractionDigits: 1,
//         maximumFractionDigits: 1
//       });
//       out = formattedOutput === "3.6";
//     }
//     return out;
//   }

//   public featureTestFormatter(formatter:Function):boolean {
//     let passed:boolean = true;

//     // Test minimumIntegerDigits.
//     passed = passed && formatter(1, "en", { minimumIntegerDigits: 1 }) === "1";
//     passed = passed && formatter(1, "en", { minimumIntegerDigits: 2 }) === "01";
//     passed = passed && formatter(1, "en", { minimumIntegerDigits: 3 }) === "001";
//     if (!passed) { return false; }

//     // Test maximumFractionDigits and minimumFractionDigits.
//     passed = passed && formatter(99.99, "en", { maximumFractionDigits: 0, minimumFractionDigits: 0 }) === "100";
//     passed = passed && formatter(99.99, "en", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) === "100.0";
//     passed = passed && formatter(99.99, "en", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) === "99.99";
//     passed = passed && formatter(99.99, "en", { maximumFractionDigits: 3, minimumFractionDigits: 3 }) === "99.990";
//     if (!passed) { return false; }

//     // Test maximumSignificantDigits.
//     passed = passed && formatter(99.99, "en", { maximumSignificantDigits: 1 }) === "100";
//     passed = passed && formatter(99.99, "en", { maximumSignificantDigits: 2 }) === "100";
//     passed = passed && formatter(99.99, "en", { maximumSignificantDigits: 3 }) === "100";
//     passed = passed && formatter(99.99, "en", { maximumSignificantDigits: 4 }) === "99.99";
//     passed = passed && formatter(99.99, "en", { maximumSignificantDigits: 5 }) === "99.99";
//     if (!passed) { return false; }

//     // Test grouping.
//     passed = passed && formatter(1000, "en", { useGrouping: true }) === "1,000";
//     passed = passed && formatter(1000, "en", { useGrouping: false }) === "1000";
//     if (!passed) { return false; }

//     return true;
//   }

//   // stringIncludes
//   public stringIncludes(str:string, search:string):boolean {
//     // if (search.length > str.length) {
//     //   return false;
//     // }
//     // return str.indexOf(search) !== -1;
//     if(typeof str === 'string') {
//       return search.includes(search);
//     } else {
//       let text = `MomentDurationFormat.stringIncludes(): Parameters 1 and 2 must be strings. Invalid parameter(s)`;
//       Log.w(text + ":", str, search);
//       let err = new Error(text);
//       throw err;
//     }
//   }

//   // repeatZero(qty)
//   // Returns "0" repeated `qty` times.
//   // `qty` must be a integer >= 0.
//   public repeatZero(qty:number) {
//     let result:string = "";
//     while(qty) {
//       result += "0";
//       qty -= 1;
//     }
//     return result;
//   }

//   public stringRound(digits:string) {
//     let digitsArray = digits.split("").reverse();
//     let i = 0;
//     let carry = true;

//     while(carry && i < digitsArray.length) {
//       if(i) {
//         if(digitsArray[i] === "9") {
//           digitsArray[i] = "0";
//         } else {
//           digitsArray[i] = (parseInt(digitsArray[i], 10) + 1).toString();
//           carry = false;
//         }
//       } else {
//         if(parseInt(digitsArray[i], 10) < 5) {
//           carry = false;
//         }

//         digitsArray[i] = "0";
//       }

//       i += 1;
//     }

//     if(carry) {
//       digitsArray.push("1");
//     }

//     return digitsArray.reverse().join("");
//   }

//   // cachedNumberFormat
//   // Returns an `Intl.NumberFormat` instance for the given locale and configuration.
//   // On first use of a particular configuration, the instance is cached for fast
//   // repeat access.
//   public cachedNumberFormat(locale:string, options:any) {
//     // Create a sorted, stringified version of `options`
//     // for use as part of the cache key
//     // let optionsString = map(
//     //     keys(options).sort(),
//     //     function(key) {
//     //         return key + ':' + options[key];
//     //     }
//     // ).join(',');
//     let keys = Object.keys(options).sort();
//     let outArray = [];
//     for (let key of keys) {
//       let kvpair = key + ':' + options[key];
//       outArray.push(kvpair);
//     }
//     let optionsString:string = outArray.join(',');

//     // Set our cache key
//     let cacheKey = locale + '+' + optionsString;

//     // If we don't have this configuration cached, configure and cache it
//     if(!this.cache[cacheKey]) {
//       this.cache[cacheKey] = Intl.NumberFormat(locale, options);
//     }

//     // Return the cached version of this configuration
//     return this.cache[cacheKey];
//   }

//   // formatNumber
//   // Formats any number greater than or equal to zero using these options:
//   // - userLocale
//   // - useToLocaleString
//   // - useGrouping
//   // - grouping
//   // - maximumSignificantDigits
//   // - minimumIntegerDigits
//   // - fractionDigits
//   // - groupingSeparator
//   // - decimalSeparator
//   //
//   // `useToLocaleString` will use `Intl.NumberFormat` or `toLocaleString` for formatting.
//   // `userLocale` option is passed through to the formatting function.
//   // `fractionDigits` is passed through to `maximumFractionDigits` and `minimumFractionDigits`
//   // Using `maximumSignificantDigits` will override `minimumIntegerDigits` and `fractionDigits`.
//   public formatNumber(value:number, options:moment.DurationFormatOptions, userLocale?:string):string {
//     let useToLocaleString        : boolean = options.useToLocaleString               ;
//     let useGrouping              : boolean = options.useGrouping                     ;
//     let grouping                 : string[]  = useGrouping && typeof options.grouping === 'string' ? [options.grouping.slice()] : [""];
//     let maximumSignificantDigits : number  = options.maximumSignificantDigits || 10  ;
//     let minimumIntegerDigits     : number  = options.minimumIntegerDigits || 1       ;
//     let fractionDigits           : number  = options.fractionDigits || 0             ;
//     let groupingSeparator        : string  = options.groupingSeparator || ","        ;
//     let decimalSeparator         : string  = options.decimalSeparator || "."         ;

//     if(useToLocaleString && userLocale) {
//       let localeStringOptions:moment.DurationFormatOptions = {
//         minimumIntegerDigits: minimumIntegerDigits,
//         useGrouping: useGrouping,
//       };

//       if(fractionDigits) {
//         localeStringOptions.maximumFractionDigits = fractionDigits;
//         localeStringOptions.minimumFractionDigits = fractionDigits;
//       }

//       // toLocaleString output is "0.0" instead of "0" for HTC browsers
//       // when maximumSignificantDigits is set. See #96.
//       if(maximumSignificantDigits && value > 0) {
//         localeStringOptions.maximumSignificantDigits = maximumSignificantDigits;
//       }

//       if(this.intlNumberFormatWorks) {
//         if(!this.intlNumberFormatRoundingWorks) {
//           let roundingOptions = Object.assign({}, options);
//           roundingOptions.useGrouping = false;
//           roundingOptions.decimalSeparator = ".";
//           // value = parseFloat(this.formatNumber(value, roundingOptions), 10);
//           value = parseFloat(this.formatNumber(value, roundingOptions));
//         }

//         return this.cache(userLocale, localeStringOptions).format(value);
//       } else {
//         if(!this.toLocaleStringRoundingWorks) {
//           let roundingOptions = Object.assign({}, options);
//           roundingOptions.useGrouping = false;
//           roundingOptions.decimalSeparator = ".";
//           // value = parseFloat(this.formatNumber(value, roundingOptions), 10);
//           value = parseFloat(this.formatNumber(value, roundingOptions));
//         }

//         return value.toLocaleString(userLocale, localeStringOptions);
//       }
//     }

//     let numberString:string;

//     // Add 1 to digit output length for floating point errors workaround. See below.
//     if(maximumSignificantDigits) {
//       numberString = value.toPrecision(maximumSignificantDigits + 1);
//     } else {
//       numberString = value.toFixed(fractionDigits + 1);
//     }

//     let integerString:string;
//     let fractionString:string;
//     let exponentString:string;

//     let temp:string|string[] = numberString.split("e");

//     exponentString = temp[1] || "";

//     temp = temp[0].split(".");

//     fractionString = temp[1] || "";
//     integerString = temp[0] || "";

//     // Workaround for floating point errors in `toFixed` and `toPrecision`.
//     // (3.55).toFixed(1); --> "3.5"
//     // (123.55 - 120).toPrecision(2); --> "3.5"
//     // (123.55 - 120); --> 3.549999999999997
//     // (123.55 - 120).toFixed(2); --> "3.55"
//     // Round by examing the string output of the next digit.

//     // *************** Implement String Rounding here ***********************
//     // Check integerString + fractionString length of toPrecision before rounding.
//     // Check length of fractionString from toFixed output before rounding.
//     let integerLength = integerString.length;
//     let fractionLength = fractionString.length;
//     let digitCount = integerLength + fractionLength;
//     let digits = integerString + fractionString;

//     if(maximumSignificantDigits && digitCount === (maximumSignificantDigits + 1) || !maximumSignificantDigits && fractionLength === (fractionDigits + 1)) {
//       // Round digits.
//       digits = this.stringRound(digits);

//       if(digits.length === digitCount + 1) {
//         integerLength = integerLength + 1;
//       }

//       // Discard final fractionDigit.
//       if(fractionLength) {
//         digits = digits.slice(0, -1);
//       }

//       // Separate integer and fraction.
//       integerString = digits.slice(0, integerLength);
//       fractionString = digits.slice(integerLength);
//     }

//     // Trim trailing zeroes from fractionString because toPrecision outputs
//     // precision, not significant digits.
//     if(maximumSignificantDigits) {
//       fractionString = fractionString.replace(/0*$/, "");
//     }

//     // Handle exponent.
//     let exponent:number = parseInt(exponentString, 10);

//     if(exponent > 0) {
//       if(fractionString.length <= exponent) {
//         fractionString = fractionString + this.repeatZero(exponent - fractionString.length);

//         integerString = integerString + fractionString;
//         fractionString = "";
//       } else {
//         integerString = integerString + fractionString.slice(0, exponent);
//         fractionString = fractionString.slice(exponent);
//       }
//     } else if(exponent < 0) {
//       fractionString = (this.repeatZero(Math.abs(exponent) - integerString.length) + integerString + fractionString);

//       integerString = "0";
//     }

//     if(!maximumSignificantDigits) {
//       // Trim or pad fraction when not using maximumSignificantDigits.
//       fractionString = fractionString.slice(0, fractionDigits);

//       if(fractionString.length < fractionDigits) {
//         fractionString = fractionString + this.repeatZero(fractionDigits - fractionString.length);
//       }

//       // Pad integer when using minimumIntegerDigits
//       // and not using maximumSignificantDigits.
//       if(integerString.length < minimumIntegerDigits) {
//         integerString = this.repeatZero(minimumIntegerDigits - integerString.length) + integerString;
//       }
//     }

//     let formattedString = "";

//     // Handle grouping
//     if(useGrouping) {
//       temp = integerString;
//       let group:number|string;
//       // let group:string;

//       while(temp.length) {
//         if(grouping.length) {
//           group = grouping.shift();
//         }

//         if(formattedString) {
//           formattedString = groupingSeparator + formattedString;
//         }

//         formattedString = temp.slice(-group) + formattedString;

//         temp = temp.slice(0, -group);
//       }
//     } else {
//       formattedString = integerString;
//     }

//     // Add decimalSeparator and fraction.
//     if (fractionString) {
//       formattedString = formattedString + decimalSeparator + fractionString;
//     }

//     return formattedString;
//   }

//   // durationLabelCompare
//   public durationLabelCompare(a, b) {
//     if (a.label.length > b.label.length) {
//       return -1;
//     }

//     if (a.label.length < b.label.length) {
//       return 1;
//     }

//     // a must be equal to b
//     return 0;
//   }

//   // durationGetLabels
//   public durationGetLabels(token:string, localeData:any):moment.DurationFormatLabels {
//     // each(keys(localeData), function (localeDataKey) {
//     //   if (localeDataKey.slice(0, 15) !== "_durationLabels") {
//     //     return;
//     //   }

//     //   let labelType = localeDataKey.slice(15).toLowerCase();

//     //   each(keys(localeData[localeDataKey]), function (labelKey) {
//     //     if (labelKey.slice(0, 1) === token) {
//     //       labels.push({
//     //         type: labelType,
//     //         key: labelKey,
//     //         label: localeData[localeDataKey][labelKey]
//     //       });
//     //     }
//     //   });
//     // });
//     // return labels;
//     let labels:moment.DurationFormatLabels = [];
//     let localeDataKeys:string[] = Object.keys(localeData);
//     for(let ldatakey of localeDataKeys) {
//       let ldatas = localeData[ldatakey];
//       if(typeof ldatas.slice === 'function' && ldatas.slice(0, 15) !== '_durationLabels') {
//         continue;
//       } else {
//         let labelType = ldatas.slice(15).toLowerCase();
//         let ldkeys = Object.keys(ldatas);
//         for(let key of ldkeys) {
//           let labelKey = ldatas[key];
//           if(labelKey.slice(0, 1) === token) {
//             let label:moment.DurationFormatLabel = {
//               type: labelType,
//               key: labelKey,
//               label: ldatas[key],
//             };
//             labels.push(label);
//           }
//         }
//       }
//     }
//     return labels;
//   }

//   // durationPluralKey
//   public durationPluralKey(token:string, integerValue:number, decimalValue:number):string {
//     // Singular for a value of `1`, but not for `1.0`.
//     if(integerValue === 1 && decimalValue === null) {
//       return token;
//     }
//     return token + token;
//   }

//   public engLocale:moment.LocaleSpecification = {
//     durationLabelsStandard: {
//       S: 'millisecond',
//       SS: 'milliseconds',
//       SSS: 'milliseconds',
//       s: 'second',
//       ss: 'seconds',
//       sss: 'seconds',
//       m: 'minute',
//       mm: 'minutes',
//       mmm: 'minutes',
//       h: 'hour',
//       hh: 'hours',
//       hhh: 'hours',
//       d: 'day',
//       dd: 'days',
//       ddd: 'days',
//       w: 'week',
//       ww: 'weeks',
//       www: 'weeks',
//       M: 'month',
//       MM: 'months',
//       MMM: 'months',
//       y: 'year',
//       yy: 'years',
//       yyy: 'years',
//     },
//     durationLabelsShort: {
//       S: 'msec',
//       SS: 'msecs',
//       SSS: 'msecs',
//       s: 'sec',
//       ss: 'secs',
//       sss: 'secs',
//       m: 'min',
//       mm: 'mins',
//       mmm: 'mins',
//       h: 'hr',
//       hh: 'hrs',
//       hhh: 'hrs',
//       d: 'dy',
//       dd: 'dys',
//       ddd: 'dys',
//       w: 'wk',
//       ww: 'wks',
//       www: 'wks',
//       M: 'mo',
//       MM: 'mos',
//       MMM: 'mos',
//       y: 'yr',
//       yy: 'yrs',
//       yyy: 'yrs',
//     },
//     durationTimeTemplates: {
//       HMS: 'h:mm:ss',
//       HM: 'h:mm',
//       MS: 'm:ss',
//     },
//     durationLabelTypes: [
//       { type: "standard", string: "__" },
//       { type: "short", string: "_" }
//     ],
//     durationPluralKey: this.durationPluralKey
//   };

//   // findLast
//   public findLast(array:any[], callback:Function):any {
//     let index = array.length;

//     while(index -= 1) {
//       if(callback(array[index])) {
//         return array[index];
//       }
//     }
//   }

//   // find
//   // public find(array:any[], callbackOrMatch:Function|any) {
//   //   let index = 0;
//   //   let max = array && array.length || 0;
//   //   let match;
//   //   let callback:Function;
//   //   if(typeof callbackOrMatch === 'function') {
//   //     callback = callbackOrMatch;
//   //   } else {
//   //     match = callbackOrMatch;
//   //     callback = function(item) {
//   //       return item === match;
//   //     };
//   //   }

//   //   while(index < max) {
//   //     if(callback(array[index])) { return array[index]; }
//   //     index += 1;
//   //   }
//   // }

//   // // each
//   // public each(array, callback) {
//   //   let index = 0,
//   //   max = array.length;

//   //   if(!array || !max) { return; }

//   //   while(index < max) {
//   //     if(callback(array[index], index) === false) {
//   //       return;
//   //     }
//   //     index += 1;
//   //   }
//   // }

//   // map (equivalent to Array.map())
//   public map(array:any[], callback?:(value:any, index:number, arr:any[]) => any):any[] {
//     // let index = 0,
//     // max = array.length,
//     // ret = [];
//     // if(!array || !max) {
//     //   return ret;
//     // }

//     // while(index < max) {
//     //   ret[index] = callback(array[index], index);
//     //   index += 1;
//     // }
//     // return ret;
//     let cb = typeof callback === 'function' ? callback : (value:any, index:number, arr:any[]):any => {
//       // return arr[index];
//       return value;
//     };
//     return array.map(cb);
//   }

//   // pluck (pulls any values specified by key `prop` from all elements in array)
//   public pluck(array:any[], prop:string):any[] {
//     // return map(array, function (item) {
//     //   return item[prop];
//     // });
//     // let out:any[] = [];
//     let out:any[] = this.map(array, (value:any) => {
//       return value[prop];
//     });
//     return out;
//   }

//   // compactifies array (returns all non-falsy elements)
//   public compact(array:any[]):any[] {
//     // each(array, function (item) {
//     //   if(item) {
//     //     ret.push(item);
//     //   }
//     // });
//     let ret = [];
//     array.forEach(a => {
//       if(a) {
//         ret.push(a);
//       }
//     });
//     return ret;
//   }

//   // unique items in array
//   public unique(array:any[]):any[] {
//     let ret = [];
//     // each(array, function (_a) {
//     //   if(!find(ret, _a)) {
//     //     ret.push(_a);
//     //   }
//     // });
//     array.forEach(a => {
//       if(!ret.includes(a)) {
//         ret.push(a);
//       }
//     });
//     return ret;
//   }

//   // intersection (returns array with common elements between arrays `a` and `b`)
//   public intersection(a:any[], b:any[]):any[] {
//     // each(a, function (_a) {
//     //   each(b, function (_b) {
//     //     if (_a === _b) { ret.push(_a); }
//     //   });
//     // });
//     // return unique(ret);
//     let ret:any[] = [];
//     a.forEach((valueA:any, indexA:number, arrA:any[]) => {
//       b.forEach((valueB:any, indexB:number, arrB:any[]) => {
//         if(valueA === valueB) {
//           ret.push(valueA);
//         }
//       });
//     });
//     let uniques = this.unique(ret);
//     return uniques;
//   }

//   // rest (I have no idea)
//   public rest(array:any[], callback:Function):any[] {
//     // let ret = [];
//     // each(array, function (item, index) {
//     //   if(!callback(item)) {
//     //     ret = array.slice(index);
//     //     return false;
//     //   }
//     // });
//     // return ret;
//     let ret = [];
//     array.forEach((item:any, index:number, arr:any[]) => {
//       let res = callback(item);
//       if(!res) {
//         ret = array.slice(index);
//         return false;
//       }
//     });
//     return ret;
//   }

//   // initial (I have no idea)
//   public initial(array:any[], callback:Function):any[] {
//     let reversed = array.slice().reverse();
//     let rest = this.rest(reversed, callback);
//     let out = rest.reverse();
//     return out;
//   }

//   // extend (adds/replaces all properties of b to object a)
//   public extend(a:any, b:any):any {
//     // for(let key in b) {
//     // if(b.hasOwnProperty(key)) { a[key] = b[key]; }
//     // return a;
//     if(typeof a !== 'object') {
//       a = {};
//     }
//     let keysB = Object.keys(b);
//     for(let key of keysB) {
//       if(b.hasOwnProperty(key)) {
//         a[key] = b[key];
//       }
//     }
//     return a;
//   }

//   // keys (equivalent to Object.keys())
//   public keys(a:any):string[] {
//     // let ret = [];
//     // for(let key in a) {
//     //   if(a.hasOwnProperty(key)) {
//     //     ret.push(key);
//     //   }
//     // }
//     // return ret;
//     let keys = Object.keys(a);
//     return keys;
//   }

//   // any (executes `callback` for all items in array and, if any of them come back `true`, returns `true`)
//   public any(array:any, callback:Function):boolean {
//     let index = 0,
//     max = array.length;
//     if(!array || !max) {
//       return false;
//     }
//     while(index < max) {
//       let cbValue = callback(array[index], index);
//       if(cbValue === true) {
//         return true;
//       }
//       index += 1;
//     }
//     return false;
//   }

//   // flatten
//   public flatten(array:any[]):any[] {
//     // let ret = [];
//     // each(array, function (child) {
//     //   ret = ret.concat(child);
//     // });
//     // return ret;
//     let ret = [];
//     array.forEach(child => {
//       ret = ret.concat(child);
//     });
//     return ret;
//   }

//   // durationsFormat(durations [, template] [, precision] [, settings])
//   // public durationsFormat(...params) {
//   // public durationsFormat(durations:moment.DurationInputArg1[], template?:moment.MomentFormatSpecification, precision?:number, settings?:moment.DurationFormatSettings) {
//   public durationsFormat(durations:Duration[], template?:moment.MomentFormatSpecification, precision?:number, settings?:moment.DurationFormatSettings) {
//     let args:any[] = [].slice.call(arguments);
//     // let args = [...params];
//     let useSettings:moment.DurationFormatSettings = {};
//     let allDurations;

//     // Parse arguments.
//     // let args = ;
//     if(!Array.isArray(durations)) {
//       let text = "Expected array as the first argument to durationsFormat";
//       let err = new Error(text);
//       throw err;
//     }
//     useSettings.template = typeof template === 'string' || typeof template === 'function' ? template : this.defaultFormatTemplate;
//     // useSettings.n
//     Object.assign(useSettings, )
//     args.forEach((arg, index) => {
//       if(!index) {
//         if(!Array.isArray(arg)) {
//           let text = "Expected array as the first argument to durationsFormat";
//           let err = new Error(text);
//           throw err;
//         }
//         allDurations = arg;
//       }

//       if(typeof arg === "string" || typeof arg === "function") {
//         useSettings.template = arg;
//         return;
//       }

//       if(typeof arg === "number") {
//         useSettings.precision = arg;
//         return;
//       }

//       if(typeof arg === 'object') {
//         Object.assign(useSettings, arg);
//       }
//     });

//     if(!allDurations || !allDurations.length) {
//       return [];
//     }

//     useSettings.returnMomentTypes = true;

//     let formattedDurations = allDurations.map((dur:Duration) => {
//       return dur.format(useSettings);
//     });

//     // Merge token types from all durations.
//     let outputTypes = this.intersection(this.types, this.unique(this.pluck(this.flatten(formattedDurations), "type")));

//     let largest = useSettings.largest;

//     if (largest) {
//       outputTypes = outputTypes.slice(0, largest);
//     }

//     useSettings.returnMomentTypes = false;
//     useSettings.outputTypes = outputTypes;

//     durations.map(dur => dur.format(useSettings));
//     return this.map(durations, function(dur) {
//       return dur.format(useSettings);
//     });
//   }

//     // durationFormat([template] [, precision] [, settings])
//   public durationFormat(template?:moment.MomentFormatSpecification, precision?:number, settings?:moment.DurationFormatSettings):string {
//     let self = this;
//     let args = [].slice.call(arguments);
//     let useSettings = Object.assign({}, this.format.defaults);

//     // Keep a shadow copy of this moment for calculating remainders.
//     // Perform all calculations on positive duration value, handle negative
//     // sign at the very end.
//     let asMilliseconds:number = this.asMilliseconds();
//     let asMonths = this.asMonths();

//     // Treat invalid durations as having a value of 0 milliseconds.
//     if(typeof this.isValid === "function" && this.isValid() === false) {
//       asMilliseconds = 0;
//       asMonths = 0;
//     }

//     let isNegative = asMilliseconds < 0;

//     // Two shadow copies are needed because of the way moment.js handles
//     // duration arithmetic for years/months and for weeks/days/hours/minutes/seconds.
//     let remainder = moment.duration(Math.abs(asMilliseconds), "milliseconds");
//     let remainderMonths = moment.duration(Math.abs(asMonths), "months");

//     // Parse arguments.
//     each(args, function (arg) {
//       if (typeof arg === "string" || typeof arg === "function") {
//         settings.template = arg;
//         return;
//       }

//       if (typeof arg === "number") {
//         settings.precision = arg;
//         return;
//       }

//       if (isObject(arg)) {
//         extend(settings, arg);
//       }
//     });

//     let momentTokens = {
//       years: "y",
//       months: "M",
//       weeks: "w",
//       days: "d",
//       hours: "h",
//       minutes: "m",
//       seconds: "s",
//       milliseconds: "S"
//     };

//     let tokenDefs = {
//       escape: /\[(.+?)\]/,
//       years: /\*?[Yy]+/,
//       months: /\*?M+/,
//       weeks: /\*?[Ww]+/,
//       days: /\*?[Dd]+/,
//       hours: /\*?[Hh]+/,
//       minutes: /\*?m+/,
//       seconds: /\*?s+/,
//       milliseconds: /\*?S+/,
//       general: /.+?/
//     };

//     // Types array is available in the template function.
//     settings.types = types;

//     let typeMap = function (token) {
//       return find(types, function (type) {
//         return tokenDefs[type].test(token);
//       });
//     };

//     let tokenizer = new RegExp(map(types, function (type) {
//       return tokenDefs[type].source;
//     }).join("|"), "g");

//     // Current duration object is available in the template function.
//     settings.duration = this;

//     // Eval template function and cache template string.
//     let template = typeof settings.template === "function" ? settings.template.apply(settings) : settings.template;

//     // outputTypes and returnMomentTypes are settings to support durationsFormat().

//     // outputTypes is an array of moment token types that determines
//     // the tokens returned in formatted output. This option overrides
//     // trim, largest, stopTrim, etc.
//     let outputTypes = settings.outputTypes;

//     // returnMomentTypes is a boolean that sets durationFormat to return
//     // the processed momentTypes instead of formatted output.
//     let returnMomentTypes = settings.returnMomentTypes;

//     let largest = settings.largest;

//     // Setup stopTrim array of token types.
//     let stopTrim = [];

//     if (!outputTypes) {
//       if (isArray(settings.stopTrim)) {
//         settings.stopTrim = settings.stopTrim.join("");
//       }

//       // Parse stopTrim string to create token types array.
//       if (settings.stopTrim) {
//         each(settings.stopTrim.match(tokenizer), function (token) {
//           let type = typeMap(token);

//           if (type === "escape" || type === "general") {
//             return;
//           }

//           stopTrim.push(type);
//         });
//       }
//     }

//     // Cache moment's locale data.
//     let localeData = moment.localeData();

//     if (!localeData) {
//       localeData = {};
//     }

//     // Fall back to this plugin's `eng` extension.
//     each(keys(engLocale), function (key) {
//       if (typeof engLocale[key] === "function") {
//         if (!localeData[key]) {
//           localeData[key] = engLocale[key];
//         }

//         return;
//       }

//       if (!localeData["_" + key]) {
//         localeData["_" + key] = engLocale[key];
//       }
//     });

//     // Replace Duration Time Template strings.
//     // For locale `eng`: `_HMS_`, `_HM_`, and `_MS_`.
//     each(keys(localeData._durationTimeTemplates), function (item) {
//       template = template.replace("_" + item + "_", localeData._durationTimeTemplates[item]);
//     });

//     // Determine user's locale.
//     let userLocale = settings.userLocale || moment.locale();

//     let useLeftUnits = settings.useLeftUnits;
//     let usePlural = settings.usePlural;
//     let precision = settings.precision;
//     let forceLength = settings.forceLength;
//     let useGrouping = settings.useGrouping;
//     let trunc = settings.trunc;

//     // Use significant digits only when precision is greater than 0.
//     let useSignificantDigits = settings.useSignificantDigits && precision > 0;
//     let significantDigits = useSignificantDigits ? settings.precision : 0;
//     let significantDigitsCache = significantDigits;

//     let minValue = settings.minValue;
//     let isMinValue = false;

//     let maxValue = settings.maxValue;
//     let isMaxValue = false;

//     // formatNumber fallback options.
//     let useToLocaleString = settings.useToLocaleString;
//     let groupingSeparator = settings.groupingSeparator;
//     let decimalSeparator = settings.decimalSeparator;
//     let grouping = settings.grouping;

//     useToLocaleString = useToLocaleString && (toLocaleStringWorks || intlNumberFormatWorks);

//     // Trim options.
//     let trim = settings.trim;

//     if (isArray(trim)) {
//       trim = trim.join(" ");
//     }

//     if (trim === null && (largest || maxValue || useSignificantDigits)) {
//       trim = "all";
//     }

//     if (trim === null || trim === true || trim === "left" || trim === "right") {
//       trim = "large";
//     }

//     if (trim === false) {
//       trim = "";
//     }

//     let trimIncludes = function (item) {
//       return item.test(trim);
//     };

//     let rLarge = /large/;
//     let rSmall = /small/;
//     let rBoth = /both/;
//     let rMid = /mid/;
//     let rAll = /^all|[^sm]all/;
//     let rFinal = /final/;

//     let trimLarge = largest > 0 || any([rLarge, rBoth, rAll], trimIncludes);
//     let trimSmall = any([rSmall, rBoth, rAll], trimIncludes);
//     let trimMid = any([rMid, rAll], trimIncludes);
//     let trimFinal = any([rFinal, rAll], trimIncludes);

//     // Parse format string to create raw tokens array.
//     let rawTokens = map(template.match(tokenizer), function (token, index) {
//       let type = typeMap(token);

//       if (token.slice(0, 1) === "*") {
//         token = token.slice(1);

//         if (type !== "escape" && type !== "general") {
//           stopTrim.push(type);
//         }
//       }

//       return {
//         index: index,
//         length: token.length,
//         text: "",

//         // Replace escaped tokens with the non-escaped token text.
//         token: (type === "escape" ? token.replace(tokenDefs.escape, "$1") : token),

//         // Ignore type on non-moment tokens.
//         type: ((type === "escape" || type === "general") ? null : type)
//       };
//     });

//     // Associate text tokens with moment tokens.
//     let currentToken = {
//       index: 0,
//       length: 0,
//       token: "",
//       text: "",
//       type: null
//     };

//     let tokens = [];

//     if (useLeftUnits) {
//       rawTokens.reverse();
//     }

//     each(rawTokens, function (token) {
//       if (token.type) {
//         if (currentToken.type || currentToken.text) {
//           tokens.push(currentToken);
//         }

//         currentToken = token;

//         return;
//       }

//       if (useLeftUnits) {
//         currentToken.text = token.token + currentToken.text;
//       } else {
//         currentToken.text += token.token;
//       }
//     });

//     if (currentToken.type || currentToken.text) {
//       tokens.push(currentToken);
//     }

//     if (useLeftUnits) {
//       tokens.reverse();
//     }

//     // Find unique moment token types in the template in order of
//     // descending magnitude.
//     let momentTypes = intersection(types, unique(compact(pluck(tokens, "type"))));

//     // Exit early if there are no moment token types.
//     if (!momentTypes.length) {
//       return pluck(tokens, "text").join("");
//     }

//     // Calculate values for each moment type in the template.
//     // For processing the settings, values are associated with moment types.
//     // Values will be assigned to tokens at the last step in order to
//     // assume nothing about frequency or order of tokens in the template.
//     momentTypes = map(momentTypes, function (momentType, index) {
//       // Is this the least-magnitude moment token found?
//       let isSmallest = ((index + 1) === momentTypes.length);

//       // Is this the greatest-magnitude moment token found?
//       let isLargest = (!index);

//       // Get the raw value in the current units.
//       let rawValue;

//       if (momentType === "years" || momentType === "months") {
//         rawValue = remainderMonths.as(momentType);
//       } else {
//         rawValue = remainder.as(momentType);
//       }

//       let wholeValue = Math.floor(rawValue);
//       let decimalValue = rawValue - wholeValue;

//       let token = find(tokens, function (token) {
//         return momentType === token.type;
//       });

//       if (isLargest && maxValue && rawValue > maxValue) {
//         isMaxValue = true;
//       }

//       if (isSmallest && minValue && Math.abs(settings.duration.as(momentType)) < minValue) {
//         isMinValue = true;
//       }

//       // Note the length of the largest-magnitude moment token:
//       // if it is greater than one and forceLength is not set,
//       // then default forceLength to `true`.
//       //
//       // Rationale is this: If the template is "h:mm:ss" and the
//       // moment value is 5 minutes, the user-friendly output is
//       // "5:00", not "05:00". We shouldn't pad the `minutes` token
//       // even though it has length of two if the template is "h:mm:ss";
//       //
//       // If the minutes output should always include the leading zero
//       // even when the hour is trimmed then set `{ forceLength: true }`
//       // to output "05:00". If the template is "hh:mm:ss", the user
//       // clearly wanted everything padded so we should output "05:00";
//       //
//       // If the user wants the full padded output, they can use
//       // template "hh:mm:ss" and set `{ trim: false }` to output
//       // "00:05:00".
//       if (isLargest && forceLength === null && token.length > 1) {
//         forceLength = true;
//       }

//       // Update remainder.
//       remainder.subtract(wholeValue, momentType);
//       remainderMonths.subtract(wholeValue, momentType);

//       return {
//         rawValue: rawValue,
//         wholeValue: wholeValue,
//         // Decimal value is only retained for the least-magnitude
//         // moment type in the format template.
//         decimalValue: isSmallest ? decimalValue : 0,
//         isSmallest: isSmallest,
//         isLargest: isLargest,
//         type: momentType,
//         // Tokens can appear multiple times in a template string,
//         // but all instances must share the same length.
//         tokenLength: token.length
//       };
//     });

//     let truncMethod = trunc ? Math.floor : Math.round;
//     let truncate = function (value, places) {
//       let factor = Math.pow(10, places);
//       return truncMethod(value * factor) / factor;
//     };

//     let foundFirst = false;
//     let bubbled = false;

//     let formatValue = function (momentType, index) {
//       let formatOptions = {
//         useGrouping: useGrouping,
//         groupingSeparator: groupingSeparator,
//         decimalSeparator: decimalSeparator,
//         grouping: grouping,
//         useToLocaleString: useToLocaleString
//       };

//       if (useSignificantDigits) {
//         if (significantDigits <= 0) {
//           momentType.rawValue = 0;
//           momentType.wholeValue = 0;
//           momentType.decimalValue = 0;
//         } else {
//           formatOptions.maximumSignificantDigits = significantDigits;
//           momentType.significantDigits = significantDigits;
//         }
//       }

//       if (isMaxValue && !bubbled) {
//         if (momentType.isLargest) {
//           momentType.wholeValue = maxValue;
//           momentType.decimalValue = 0;
//         } else {
//           momentType.wholeValue = 0;
//           momentType.decimalValue = 0;
//         }
//       }

//       if (isMinValue && !bubbled) {
//         if (momentType.isSmallest) {
//           momentType.wholeValue = minValue;
//           momentType.decimalValue = 0;
//         } else {
//           momentType.wholeValue = 0;
//           momentType.decimalValue = 0;
//         }
//       }

//       if (momentType.isSmallest || momentType.significantDigits && momentType.significantDigits - momentType.wholeValue.toString().length <= 0) {
//         // Apply precision to least significant token value.
//         if (precision < 0) {
//           momentType.value = truncate(momentType.wholeValue, precision);
//         } else if (precision === 0) {
//           momentType.value = truncMethod(momentType.wholeValue + momentType.decimalValue);
//         } else { // precision > 0
//           if (useSignificantDigits) {
//             if (trunc) {
//               momentType.value = truncate(momentType.rawValue, significantDigits - momentType.wholeValue.toString().length);
//             } else {
//               momentType.value = momentType.rawValue;
//             }

//             if (momentType.wholeValue) {
//               significantDigits -= momentType.wholeValue.toString().length;
//             }
//           } else {
//             formatOptions.fractionDigits = precision;

//             if (trunc) {
//               momentType.value = momentType.wholeValue + truncate(momentType.decimalValue, precision);
//             } else {
//               momentType.value = momentType.wholeValue + momentType.decimalValue;
//             }
//           }
//         }
//       } else {
//         if (useSignificantDigits && momentType.wholeValue) {
//           // Outer Math.round required here to handle floating point errors.
//           momentType.value = Math.round(truncate(momentType.wholeValue, momentType.significantDigits - momentType.wholeValue.toString().length));

//           significantDigits -= momentType.wholeValue.toString().length;
//         } else {
//           momentType.value = momentType.wholeValue;
//         }
//       }

//       if (momentType.tokenLength > 1 && (forceLength || foundFirst)) {
//         formatOptions.minimumIntegerDigits = momentType.tokenLength;

//         if (bubbled && formatOptions.maximumSignificantDigits < momentType.tokenLength) {
//           delete formatOptions.maximumSignificantDigits;
//         }
//       }

//       if (!foundFirst && (momentType.value > 0 || trim === "" /* trim: false */ || find(stopTrim, momentType.type) || find(outputTypes, momentType.type))) {
//         foundFirst = true;
//       }

//       momentType.formattedValue = formatNumber(momentType.value, formatOptions, userLocale);

//       formatOptions.useGrouping = false;
//       formatOptions.decimalSeparator = ".";
//       momentType.formattedValueEn = formatNumber(momentType.value, formatOptions, "en");

//       if (momentType.tokenLength === 2 && momentType.type === "milliseconds") {
//         momentType.formattedValueMS = formatNumber(momentType.value, {
//           minimumIntegerDigits: 3,
//           useGrouping: false
//         }, "en").slice(0, 2);
//       }

//       return momentType;
//     };

//     // Calculate formatted values.
//     momentTypes = map(momentTypes, formatValue);
//     momentTypes = compact(momentTypes);

//     // Bubble rounded values.
//     if (momentTypes.length > 1) {
//       let findType = function (type) {
//         return find(momentTypes, function (momentType) {
//           return momentType.type === type;
//         });
//       };

//       let bubbleTypes = function (bubble) {
//         let bubbleMomentType = findType(bubble.type);

//         if (!bubbleMomentType) {
//           return;
//         }

//         each(bubble.targets, function (target) {
//           let targetMomentType = findType(target.type);

//           if (!targetMomentType) {
//             return;
//           }

//           if (parseInt(bubbleMomentType.formattedValueEn, 10) === target.value) {
//             bubbleMomentType.rawValue = 0;
//             bubbleMomentType.wholeValue = 0;
//             bubbleMomentType.decimalValue = 0;
//             targetMomentType.rawValue += 1;
//             targetMomentType.wholeValue += 1;
//             targetMomentType.decimalValue = 0;
//             targetMomentType.formattedValueEn = targetMomentType.wholeValue.toString();
//             bubbled = true;
//           }
//         });
//       };

//       each(bubbles, bubbleTypes);
//     }

//     // Recalculate formatted values.
//     if (bubbled) {
//       foundFirst = false;
//       significantDigits = significantDigitsCache;
//       momentTypes = map(momentTypes, formatValue);
//       momentTypes = compact(momentTypes);
//     }

//     if (outputTypes && !(isMaxValue && !settings.trim)) {
//       momentTypes = map(momentTypes, function (momentType) {
//         if (find(outputTypes, function (outputType) {
//           return momentType.type === outputType;
//         })) {
//           return momentType;
//         }

//         return null;
//       });

//       momentTypes = compact(momentTypes);
//     } else {
//       // Trim Large.
//       if (trimLarge) {
//         momentTypes = rest(momentTypes, function (momentType) {
//           // Stop trimming on:
//           // - the smallest moment type
//           // - a type marked for stopTrim
//           // - a type that has a whole value
//           return !momentType.isSmallest && !momentType.wholeValue && !find(stopTrim, momentType.type);
//         });
//       }

//       // Largest.
//       if (largest && momentTypes.length) {
//         momentTypes = momentTypes.slice(0, largest);
//       }

//       // Trim Small.
//       if (trimSmall && momentTypes.length > 1) {
//         momentTypes = initial(momentTypes, function (momentType) {
//           // Stop trimming on:
//           // - a type marked for stopTrim
//           // - a type that has a whole value
//           // - the largest momentType
//           return !momentType.wholeValue && !find(stopTrim, momentType.type) && !momentType.isLargest;
//         });
//       }

//       // Trim Mid.
//       if (trimMid) {
//         momentTypes = map(momentTypes, function (momentType, index) {
//           if (index > 0 && index < momentTypes.length - 1 && !momentType.wholeValue) {
//             return null;
//           }

//           return momentType;
//         });

//         momentTypes = compact(momentTypes);
//       }

//       // Trim Final.
//       if (trimFinal && momentTypes.length === 1 && !momentTypes[0].wholeValue && !(!trunc && momentTypes[0].isSmallest && momentTypes[0].rawValue < minValue)) {
//         momentTypes = [];
//       }
//     }

//     if (returnMomentTypes) {
//       return momentTypes;
//     }

//     // Localize and pluralize unit labels.
//     each(tokens, function (token) {
//       let key = momentTokens[token.type];

//       let momentType = find(momentTypes, function (momentType) {
//         return momentType.type === token.type;
//       });

//       if (!key || !momentType) {
//         return;
//       }

//       let values = momentType.formattedValueEn.split(".");

//       values[0] = parseInt(values[0], 10);

//       if (values[1]) {
//         values[1] = parseFloat("0." + values[1], 10);
//       } else {
//         values[1] = null;
//       }

//       let pluralKey = localeData.durationPluralKey(key, values[0], values[1]);

//       let labels = durationGetLabels(key, localeData);

//       let autoLocalized = false;

//       let pluralizedLabels = {};

//       // Auto-Localized unit labels.
//       each(localeData._durationLabelTypes, function (labelType) {
//         let label = find(labels, function (label) {
//           return label.type === labelType.type && label.key === pluralKey;
//         });

//         if (label) {
//           pluralizedLabels[label.type] = label.label;

//           if (stringIncludes(token.text, labelType.string)) {
//             token.text = token.text.replace(labelType.string, label.label);
//             autoLocalized = true;
//           }
//         }
//       });

//       // Auto-pluralized unit labels.
//       if (usePlural && !autoLocalized) {
//         labels.sort(durationLabelCompare);

//         each(labels, function (label) {
//           if (pluralizedLabels[label.type] === label.label) {
//             if (stringIncludes(token.text, label.label)) {
//               // Stop checking this token if its label is already
//               // correctly pluralized.
//               return false;
//             }

//             // Skip this label if it is correct, but not present in
//             // the token's text.
//             return;
//           }

//           if (stringIncludes(token.text, label.label)) {
//             // Replece this token's label and stop checking.
//             token.text = token.text.replace(label.label, pluralizedLabels[label.type]);
//             return false;
//           }
//         });
//       }
//     });

//     // Build ouptut.
//     tokens = map(tokens, function (token) {
//       if (!token.type) {
//         return token.text;
//       }

//       let momentType = find(momentTypes, function (momentType) {
//         return momentType.type === token.type;
//       });

//       if (!momentType) {
//         return "";
//       }

//       let out = "";

//       if (useLeftUnits) {
//         out += token.text;
//       }

//       if (isNegative && isMaxValue || !isNegative && isMinValue) {
//         out += "< ";
//         isMaxValue = false;
//         isMinValue = false;
//       }

//       if (isNegative && isMinValue || !isNegative && isMaxValue) {
//         out += "> ";
//         isMaxValue = false;
//         isMinValue = false;
//       }

//       if (isNegative && (momentType.value > 0 || trim === "" || find(stopTrim, momentType.type) || find(outputTypes, momentType.type))) {
//         out += "-";
//         isNegative = false;
//       }

//       if (token.type === "milliseconds" && momentType.formattedValueMS) {
//         out += momentType.formattedValueMS;
//       } else {
//         out += momentType.formattedValue;
//       }

//       if (!useLeftUnits) {
//         out += token.text;
//       }

//       return out;
//     });

//     // Trim leading and trailing comma, space, colon, and dot.
//     return tokens.join("").replace(/(,| |:|\.)*$/, "").replace(/^(,| |:|\.)*/, "");
//   }

//     // defaultFormatTemplate
//   public defaultFormatTemplate():string {
//   let dur = this.duration;

//   let findType = function findType(type) {
//     return dur._data[type];
//   };

//   let firstType = find(this.types, findType);

//   let lastType = findLast(this.types, findType);

//   // Default template strings for each duration dimension type.
//   switch (firstType) {
//     case "milliseconds":
//       return "S __";
//     case "seconds": // Fallthrough.
//     case "minutes":
//       return "*_MS_";
//     case "hours":
//       return "_HMS_";
//     case "days": // Possible Fallthrough.
//       if (firstType === lastType) {
//         return "d __";
//       }
//     case "weeks":
//       if (firstType === lastType) {
//         return "w __";
//       }

//       if (this.trim === null) {
//         this.trim = "both";
//       }

//       return "w __, d __, h __";
//     case "months": // Possible Fallthrough.
//       if (firstType === lastType) {
//         return "M __";
//       }
//     case "years":
//       if (firstType === lastType) {
//         return "y __";
//       }

//       if (this.trim === null) {
//         this.trim = "both";
//       }

//       return "y __, M __, d __";
//     default:
//       if (this.trim === null) {
//         this.trim = "both";
//       }

//       return "y __, d __, h __, m __, s __";
//     }
//   }

// }
