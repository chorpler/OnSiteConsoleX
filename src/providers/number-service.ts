// import * as Decimal     from 'decimal.js'           ;
// import * as BigNumber   from 'bignumber.js'         ;
import { Decimal, dec } from 'domain/onsitexdomain' ;
import { Injectable   } from '@angular/core'        ;
import { Log          } from 'domain/onsitexdomain' ;

@Injectable()
export class NumberService {
  public TEN                   = 1e01  ;
  public ONE_HUNDRED           = 1e02  ;
  public ONE_THOUSAND          = 1e03  ;
  public ONE_MILLION           = 1e06  ;
  public ONE_BILLION           = 1e09  ;
  public ONE_TRILLION          = 1e12  ;
  public ONE_QUADRILLION       = 1e15  ;
  public ONE_QUINTILLION       = 1e18  ;
  public ONE_SEXTILLION        = 1e21  ;
  public ONE_SEPTILLION        = 1e24  ;
  public ONE_OCTILLION         = 1e27  ;
  public ONE_NONILLION         = 1e30  ;
  public ONE_DECILLION         = 1e33  ;
  public ONE_UNDECILLION       = 1e36  ;
  public ONE_DUODECILLION      = 1e39  ;
  public ONE_TREDECILLION      = 1e42  ;
  public ONE_QUATTUORDECILLION = 1e45  ;
  public ONE_QUINDECILLION     = 1e48  ;
  public ONE_SEXDECILLION      = 1e51  ;
  public ONE_SEPTENDECILLION   = 1e54  ;
  public ONE_OCTODECILLION     = 1e57  ;
  public ONE_NOVEMDECILLION    = 1e60  ;
  public ONE_VIGINTILLION      = 1e63  ;
  // public MAX                   = 1e64-1;
  public MAX                   = 1e16-1;

  public LESS_THAN_TWENTY = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];

  public TENS = [
    'Zero', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  public MAGNITUDE = [
    {name: "Ten"               , value: 1e01},
    {name: "Hundred"           , value: 1e02},
    {name: "Thousand"          , value: 1e03},
    {name: "Million"           , value: 1e06},
    {name: "Billion"           , value: 1e09},
    {name: "Trillion"          , value: 1e12},
    {name: "Quadrillion"       , value: 1e15},
    {name: "Quintillion"       , value: 1e18},
    {name: "Sextillion"        , value: 1e21},
    {name: "Septillion"        , value: 1e24},
    {name: "Octillion"         , value: 1e27},
    {name: "Nonillion"         , value: 1e30},
    {name: "Decillion"         , value: 1e33},
    {name: "Undecillion"       , value: 1e36},
    {name: "Duodecillion"      , value: 1e39},
    {name: "Tredecillion"      , value: 1e42},
    {name: "Quattuordecillion" , value: 1e45},
    {name: "Quindecillion"     , value: 1e48},
    {name: "Sexdecillion"      , value: 1e51},
    {name: "Septendecillion"   , value: 1e54},
    {name: "Octodecillion"     , value: 1e57},
    {name: "Novemdecillion"    , value: 1e60},
    {name: "Vigintillion"      , value: 1e63}
  ];

  public constructor() {
    Log.l("Hello NumberService provider");
    window['consolenumbers'] = this;
    window['consoleNumberService'] = NumberService;
    window['BigNumber'] = dec;
    window['Decimal'] = dec;
  }

  public toCurrency(value:any, decimalPlaces?:number, currencyName?:string, currencyFractionName?:string) {
    let words, fracWords;
    let val2num = Number(value);
    let bn = new dec(value);
    let precision = decimalPlaces ? decimalPlaces : 2;
    let currency = currencyName ? currencyName : "Dollars";
    let currencyFraction = currencyFractionName ? currencyFractionName : "Cents";

    if (isNaN(val2num) || !isFinite(val2num) || !currency || !currencyFraction) {
      throw new TypeError('Not a finite number or finite string number, or no currency string provided: ' + value + ' (' + typeof value + ')');
    }
    let num = bn;
    // if ( ! isFinite(num)) {
    //   throw new TypeError('Not a finite number: ' + value + ' (' + typeof value + ')');
    // }
    let integer = num.integerValue();
    let decimal = new dec(bn.minus(integer).absoluteValue().toFixed(precision));

    let denominator = new dec("1");
    // let decimalValue = integer.minus(decimal);
    let decimalValue = new dec(decimal);
    while (!decimalValue.eq(decimalValue.integerValue())) {
      denominator = denominator.times(10);
      decimalValue = decimal.times(denominator);
    }
    let bigDenominator = new dec(10).exponentiatedBy(precision);
    if(!denominator.eq(bigDenominator)) {
      let adjust = bigDenominator.dividedBy(denominator);
      decimalValue = decimalValue.times(adjust);
    }
    Log.l("toCurrency(): Decimal Value is %d/%d", decimalValue.toNumber(), denominator.toNumber());
    Log.l("toCurrency(): Calling generateWords() with parameter '%s':\n", integer.toString(), integer);
    words = this.generateWords(integer);
    let output = words + " " + currency;
    if (!decimalValue.eq(0) || precision) {
      Log.l("toWords(): Calling generateWords() with fractional parameter '%s':\n", decimalValue.toString(), decimalValue);
      fracWords = this.generateWords(decimalValue);
      output += " And " + fracWords + " " + currencyFraction;
    }

    return output;

  }

  /**
   * Converts an integer into words.
   * If number is decimal, the decimals will be removed.
   * @example toWords(12) => 'twelve'
   * @param {number|string} number
   * @param {boolean} [asOrdinal] - Deprecated, use toWordsOrdinal() instead!
   * @returns {string}
   */
  public toWords(value:any) {
    let words, fracWords, fracDenomWords, fracDenomOrdinal;
    let val2num = Number(value);
    let bn = new dec(value);
    if(isNaN(val2num) || !isFinite(val2num)) {
      throw new TypeError('Not a finite number or finite string number: ' + value + ' (' + typeof value + ')');
    }
    let num = bn;
    let integer = num.integerValue();
    let decimal = bn.minus(integer).absoluteValue();
    let denominator = new dec("1");
    let decimalValue = integer.minus(decimal);
    while (!decimalValue.eq(decimalValue.integerValue())) {
      denominator = denominator.times(10);
      decimalValue = decimal.times(denominator);
    }
    Log.l("generateWords(): Decimal Value is %d/%d", decimalValue.toNumber(), denominator.toNumber());
    Log.l("toWords(): Calling generateWords() with parameter '%s':\n", integer.toString(), integer);
    words = this.generateWords(integer);
    let output = words;
    if(!denominator.eq(1)) {
      Log.l("toWords(): Calling generateWords() with fractional parameter '%s':\n", decimalValue.toString(), decimalValue);
      fracWords = this.generateWords(decimalValue)
      fracDenomWords = this.generateWords(denominator);
      fracDenomOrdinal = this.makeOrdinal(fracDenomWords);
      if(!decimalValue.eq(1)) {
        fracDenomOrdinal += "s";
      }

      output += " And " + fracWords + " " + fracDenomOrdinal;
    }

    return output;
  }

  public generateWords(num:any, wordArray?:any) {
    let value = new dec(num);
    if(value.isNaN()) {
      let errorString = "generateWords called with a non-numeric value or numeric string: " + num + " (" + typeof num + ")";
      Log.l(errorString);
      throw new Error(errorString);
    }

    let number = value;

    let remainder = new dec(0), word = "", words = wordArray ? wordArray : [];

    // We’re done
    if (number.eq(0)) {
      return !words.length ? 'Zero' : words.join(' ').replace(/,\s*$/, '');
    }

    // If negative, prepend “minus”
    if(number.comparedTo(0) === -1) {
      words.push('Minus');
      number = number.absoluteValue();
    }

    if(number.comparedTo(20) === -1) {
      remainder = new dec(0);
      word = this.LESS_THAN_TWENTY[number.toNumber()];
    } else if (number.comparedTo(this.ONE_HUNDRED) === -1) {
      remainder = number.modulo(this.TEN);
      let index = number.dividedToIntegerBy(this.TEN).toNumber();
      word = this.TENS[index];
      // In case of remainder, we need to handle it here to be able to add the “-”
      if(!remainder.eq(0)) {
        word += '-' + this.LESS_THAN_TWENTY[remainder.toNumber()];
        remainder = new dec(0);
      }
    } else if (number.comparedTo(this.ONE_THOUSAND) === -1) {
      remainder = number.modulo(this.ONE_HUNDRED);
      word = this.generateWords(number.dividedToIntegerBy(this.ONE_HUNDRED)) + ' Hundred';
    } else if (number.comparedTo(this.ONE_MILLION) === -1) {
      remainder = number.modulo(this.ONE_THOUSAND);
      word = this.generateWords(number.dividedToIntegerBy(this.ONE_THOUSAND)) + ' Thousand';
    } else if (number.comparedTo(this.ONE_BILLION) === -1) {
      remainder = number.modulo(this.ONE_MILLION);
      word = this.generateWords(number.dividedToIntegerBy(this.ONE_MILLION)) + ' Million';
    } else if (number.comparedTo(this.ONE_TRILLION) === -1) {
      remainder = number.modulo(this.ONE_BILLION);
      word = this.generateWords(number.dividedToIntegerBy(this.ONE_BILLION)) + ' Billion';

    } else if (number.comparedTo(this.ONE_QUADRILLION) === -1) {
      remainder = number.modulo(this.ONE_TRILLION);
      word = this.generateWords(number.dividedToIntegerBy(this.ONE_TRILLION)) + ' Trillion';

    } else if (number.comparedTo(this.MAX) <= 0) {
      remainder = number.modulo(this.ONE_QUADRILLION);
      word = this.generateWords(number.dividedToIntegerBy(this.ONE_QUADRILLION)) +
        ' Quadrillion,';
    }

    words.push(word);
    return this.generateWords(remainder, words);
  }

  /**
   * Converts an integer into a string with an ordinal postfix.
   * If number is decimal, the decimals will be removed.
   * @example toOrdinal(12) => '12th'
   * @param {number|string} number
   * @returns {string}
   */
  public toOrdinal(value:any) {
      let num = parseInt(value, 10);
      if (!isFinite(num)) throw new TypeError('toOrdinal(): Not a finite number: ' + value + ' (' + typeof value + ')');
      var str = String(num);
      var lastTwoDigits = num % 100;
      var betweenElevenAndThirteen = lastTwoDigits >= 11 && lastTwoDigits <= 13;
      var lastChar = str.charAt(str.length - 1);
      return str + (betweenElevenAndThirteen ? 'th'
        : lastChar === '1' ? 'st'
          : lastChar === '2' ? 'nd'
            : lastChar === '3' ? 'rd'
              : 'th');
  }

  /**
   * Converts a number-word into an ordinal number-word.
   * @example makeOrdinal('one') => 'first'
   * @param {string} words
   * @returns {string}
   */
  public makeOrdinal(words:any) {
    let ENDS_WITH_DOUBLE_ZERO_PATTERN = /(hundred|thousand|(m|b|tr|quadr)illion)$/i;
    let ENDS_WITH_TEEN_PATTERN = /teen$/i;
    let ENDS_WITH_Y_PATTERN = /y$/i;
    let ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/i;
    let ordinalLessThanThirteen = {
      zero  : 'Zeroth',
      one   : 'First',
      two   : 'Second',
      three : 'Third',
      four  : 'Fourth',
      five  : 'Fifth',
      six   : 'Sixth',
      seven : 'Seventh',
      eight : 'Eighth',
      nine  : 'Ninth',
      ten   : 'Tenth',
      eleven: 'Eleventh',
      twelve: 'Twelfth'
    };
    var replaceWithOrdinalVariant = function(match, numberWord) {
      return ordinalLessThanThirteen[numberWord];
    }

    // Ends with *00 (100, 1000, etc.) or *teen (13, 14, 15, 16, 17, 18, 19)
    if (ENDS_WITH_DOUBLE_ZERO_PATTERN.test(words) || ENDS_WITH_TEEN_PATTERN.test(words)) {
      return words + 'th';
    }
    // Ends with *y (20, 30, 40, 50, 60, 70, 80, 90)
    else if (ENDS_WITH_Y_PATTERN.test(words)) {
      return words.replace(ENDS_WITH_Y_PATTERN, 'ieth');
    }
    // Ends with one through twelve
    else if (ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN.test(words)) {
      return words.replace(ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN, replaceWithOrdinalVariant);
    }
    return words;
  }

}
