/**
 * Name: Geolocation domain class and related interfaces/classes
 * Vers: 5.4.2
 * Date: 2019-07-30
 * Auth: David Sargeant
 * Logs: 5.4.2 2019-07-30: Added equals() methods to OnSiteCoordinates, OnSiteGeoposition, OnSiteGeolocation
 * Logs: 5.4.1 2019-07-29: Added default() getter to OnSiteGeoposition; Added clone() methods to OnSiteGeoposition,OnSiteGeolocation
 * Logs: 5.3.3 2019-07-25: Changed fromLatLon() to accept ILatLng input; changed OnSiteGeolocation to call OnSiteGeoposition static fromLatLon(),fromLatLng() methods
 * Logs: 5.3.2 2019-07-25: Added default property to OnSiteGeoposition
 * Logs: 5.3.1 2019-07-24: Added fromLatLon() and static fromLatLon(),fromLatLng() methods to OnSiteGeoposition and OnSiteGeolocation
 * Logs: 5.2.2 2019-07-18: Minor corrections to fix TSLint errors; changed OnSiteGeoposition getClass() to return OnSiteGeoposition instead of OnSiteGeolocation
 * Logs: 5.2.1 2019-06-04: Added isEmpty() method for OnSiteGeoposition/OnSiteLocation
 * Logs: 5.1.1 2018-11-14: Added getCoordinatesAsString() method; imported isNumeric() function; added isOnSite() to OnSiteGeoposition class
 * Logs: 5.0.1 2018-09-26: Added toJSON(), isOnSite() methods; added oo (JSON8) import for serializing via toJSON()
 * Logs: 4.1.1 2018-08-08: ILatLng interface can be imported from @ionic-native/google-maps or defined locally
 * Logs: 4.0.1 2018-07-17: Added ILatLon and LatLng and exports, plus added ability to read Google Maps LatLng objects
 * Logs: 3.0.1 2018-04-09: Added Geoposition class, which Geolocation now extends. Removed parseInt()
 * Logs: 2.0.1 2017-08-04: Initial creation of special class and interfaces
 */

import { sprintf                        } from 'sprintf-js'                ;
import { moment, Moment, oo, isNumeric, } from '../config'                 ;
import { Log,                           } from '../config/config.log'      ;
// import { ILatLng                        } from '@ionic-native/google-maps' ;

const DEFAULT_LATITUDE  = 27.176248;
const DEFAULT_LONGITUDE = -97.964025;

export interface ILatLng {
  lat: number;
  lng: number;
}

/**
 * @type {DOMTimeStamp} is a representiation of a specific time, generally used for timestamps.
 * Thus, a variable of type `DOMTimeStamp' is just an integer, not a string.
 * The integer represents the number of milliseconds since the start of the Unix epoch (midnight on the morning of January 1, 1970 (UCT)).
 */
type DOMTimeStamp = Number;

/**
 * Geographic ooordinates system, specified by w3 and changed to be TypeScript.
 *
 * The geographic coordinate reference system used by the attributes in this interface is the World Geodetic System (2d) [WGS84]. No other reference system is supported.
 * - `latitude' and `longitude' are geographic coordinates specified in decimal degrees with 0-12 decimal places, depending on accuracy.
 * - `altitude' denotes the height of the position, specified in meters above the [WGS84] ellipsoid. If the implementation cannot provide altitude information, the value of this attribute must be null.
 * - `accuracy' denotes the accuracy level of the latitude and longitude coordinates. It is specified in meters and must be supported by all implementations. The value of `accuracy' must be a non-negative real number.
 * - `altitudeAccuracy' is specified in meters. If the implementation cannot provide altitude information, the value of this attribute must be null. Otherwise, the value of `altitudeAccuracy' attribute must be a non-negative real number.
 * - `accuracy' and `altitudeAccuracy' values returned by an implementation should correspond to a 95% confidence level.
 * - `heading' denotes the direction of travel of the hosting device and is specified in degrees, where 0° ≤ heading < 360°, counting clockwise relative to the true north. If the implementation cannot provide heading information, the value of this attribute must be null. If the hosting device is stationary (i.e. the value of the speed attribute is 0), then the value of `heading' must be NaN.
 * - `speed' denotes the magnitude of the horizontal component of the hosting device's current velocity and is specified in meters per second. If the implementation cannot provide speed information, the value of this attribute must be null. Otherwise, the value of `speed' must be a non-negative real number.
 *
 */
interface ICoordinates {
  latitude          : number;
  longitude         : number;
  accuracy          : number;
  altitude         ?: number;
  altitudeAccuracy ?: number;
  heading          ?: number;
  speed            ?: number;
}


// interface ILatLon {
//   latitude:number;
//   longitude:number;
//   // constructor(lat:number, lng:number);
//   lat(value?:number):number;
//   lng(value?:number):number;
//   equals(other:ILatLon): boolean;
//   toString(): string;
//   toUrlValue(precision?: number): string;
// }

interface LatLonLiteral {
  lat:number;
  lng:number;
}

class LatLng {
  public getClass():any {
    return LatLng;
  }
  public static getClassName():string {
    return 'LatLng';
  }
  public getClassName():string {
    return LatLng.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
  public latitude : number = 0;
  public longitude: number = 0;

  public lat(value?:number):number {
    if(value != undefined) {
      this.latitude = value;
    }
    return this.latitude;
  }

  public lng(value?:number):number {
    if(value != undefined) {
      this.longitude = value;
    }
    return this.longitude;
  }

  constructor(lat:number, lng:number) {
    if(lat) {
      this.lat(lat);
    }
    if(lng) {
      this.lng(lng);
    }
  }
  public equals(other:LatLng):boolean {
    return this.lat === other.lat && this.lng === other.lng;
  }
  public toString():string {
    let out:string = `(${this.lat}, ${this.lng})`;
    return out;
  }
  public toUrlValue(precision?: number):string {
    let out:string = "";
    let places:number = precision != undefined ? precision : 6;
    let literal:{lat:string,lng:string} = {lat:this.lat().toFixed(places), lng: this.lng().toFixed(places)};
    out = JSON.stringify(literal);
    return out;
  }
  public toJSON():LatLonLiteral {
    let out:LatLonLiteral = {
      lat: this.lat(),
      lng: this.lng(),
    };
    return out;
  }
  public fromJSON(pos:LatLonLiteral):LatLng {
    let lat:number = pos.lat;
    let lng:number = pos.lng;
    this.lat(lat);
    this.lng(lng);
    return this;
  }
}


/**
 *  The Position interface is the container for the geolocation information returned by location providers.
 *  `coords' is an object of the Coordinates interface defined above.
 *  `timestamp' is a simple integer, representing the time the position described by `coords' was acquired.
 *  `timestamp' is actually a DOMTimeStamp object, which represents a number of milliseconds, generally since epoch start.
 */
interface IPosition {
  coords    : ICoordinates ;
  timestamp : DOMTimeStamp ;
}

class OnSiteCoordinates implements ICoordinates {
  public getClass():any {
    return OnSiteCoordinates;
  }
  public static getClassName():string {
    return 'OnSiteCoordinates';
  }
  public getClassName():string {
    return OnSiteCoordinates.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }

  public latitude          : number = 0 ;
  public longitude         : number = 0 ;
  public accuracy          : number = 0 ;
  public altitude         ?: number = null;
  public altitudeAccuracy ?: number = null;
  public heading          ?: number = null;
  public speed            ?: number = 0;

  constructor(doc?:ICoordinates|Coordinates|OnSiteCoordinates|any) {
    if(doc) {
      this.latitude         = doc.latitude         != undefined ? doc.latitude         : this.latitude         ;
      this.longitude        = doc.longitude        != undefined ? doc.longitude        : this.longitude        ;
      this.accuracy         = doc.accuracy         != undefined ? doc.accuracy         : this.accuracy         ;
      this.altitude         = doc.altitude         != undefined ? doc.altitude         : this.altitude         ;
      this.altitudeAccuracy = doc.altitudeAccuracy != undefined ? doc.altitudeAccuracy : this.altitudeAccuracy ;
      this.heading          = doc.heading          != undefined ? doc.heading          : this.heading          ;
      this.speed            = doc.speed            != undefined ? doc.speed            : this.speed            ;
    }
  }

  public equals(position:OnSiteCoordinates|ILatLng):boolean {
    let coords:ILatLng;
    let pos:any = position;
    if(this === position) {
      return true;
    }
    if(pos.latitude != undefined && pos.longitude != undefined) {
      // tslint:disable-next-line: triple-equals
      return this.latitude == pos.latitude && this.longitude == pos.longitude;
    } else if(pos.lat != undefined && pos.lng != undefined) {
      // tslint:disable-next-line: triple-equals
      return this.latitude == pos.lat && this.longitude == pos.lng;
    } else {
      let className = this.getClassName();
      Log.w(`${className}(): parameter must be OnSiteCoordinates or ILatLng object. Invalid parameter provided:`, position);
      return false;
    }
  }

  public toString():string {
    let out:string = "";
    return JSON.stringify(this);
  }

  public clone():OnSiteCoordinates {
    let newCoordinates = new OnSiteCoordinates(this);
    return newCoordinates;
  }
}

class OnSiteGeoposition implements IPosition {
  public static default:ILatLng = { lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE };
  public get default():ILatLng { return OnSiteGeoposition.default; }
  public coords    : OnSiteCoordinates = new OnSiteCoordinates();
  public timestamp : DOMTimeStamp      = Number(moment().format('x'));

  // constructor(inputCoords?: Coordinates, inputTimestamp?: DOMTimeStamp) {
  constructor(doc?:IPosition|Position|any) {
    if(doc) {
      this.coords = doc.coords ? new OnSiteCoordinates(doc.coords) : this.coords;
      this.timestamp = doc.timestamp ? doc.timestamp : this.timestamp;
    }
  }

  public equals(position:OnSiteGeoposition|OnSiteCoordinates|ILatLng):boolean {
    let coords:ILatLng;
    let pos:any = position;
    if(this === position) {
      return true;
    } else if(pos.coords && pos.coords.latitude != undefined) {
      coords = pos.coords;
      return this.coords.equals(coords);
    } else if(pos.latitude != undefined && pos.longitude != undefined) {
      return this.coords.equals(pos);
    } else if(pos.lat != undefined && pos.lng != undefined) {
      return this.coords.equals(pos);
    } else {
      let className = this.getClassName();
      Log.w(`${className}(): parameter must be OnSiteGeoposition, OnSiteCoordinates, or ILatLng object. Invalid parameter provided:`, position);
      return false;
    }
  }

  public clone():OnSiteGeoposition {
    let coords = new OnSiteCoordinates(this.coords);
    let ts     = Number(this.timestamp);
    let doc    = { coords: coords, timestamp: ts };
    let newpos = new OnSiteGeoposition(doc);
    return newpos;
  }

  public toLatLng():ILatLng {
    let lat:number = this.coords.latitude;
    let lng:number = this.coords.longitude;
    let out:ILatLng = {
      lat: lat,
      lng: lng,
    };
    return out;
  }

  public static fromLatLng(latlng:ILatLng|{lat:any,lng:any}):OnSiteGeoposition {
    let lat:number = latlng && latlng.lat && typeof latlng.lat === 'number' ? latlng.lat : typeof latlng.lat === 'function' ? latlng.lat() : 0;
    let lng:number = latlng && latlng.lng && typeof latlng.lng === 'number' ? latlng.lng : typeof latlng.lng === 'function' ? latlng.lng() : 0;
    let newloc = new OnSiteGeoposition();
    newloc.coords.latitude = lat;
    newloc.coords.longitude = lng;
    return newloc;
  }

  public fromLatLng(latlng:ILatLng|{lat:any,lng:any}):OnSiteGeoposition {
    return OnSiteGeoposition.fromLatLng(latlng);
  }

  public static fromLatLon(lat?:number|string|Function|ILatLng,lon?:number|string|Function):OnSiteGeoposition {
    // let lat1 = Number(lat), lon1 = Number(lon);
    let lat1:number, lng1:number;
    if(typeof lat === 'object') {
      let lat2:number, lng2:number;
      if(lat.lat != undefined) {
        lat2 = lat.lat;
      }
      if(lat.lng != undefined) {
        lng2 = lat.lng;
      }
      lat1 = typeof lat2 === 'number' ? Number(lat2) : typeof lat2 === 'string' ? Number(lat2) : DEFAULT_LATITUDE;
      lng1 = typeof lng2 === 'number' ? Number(lng2) : typeof lng2 === 'string' ? Number(lng2) : DEFAULT_LONGITUDE;
    } else {
      lat1 = typeof lat === 'number' ? Number(lat) : typeof lat === 'string' ? Number(lat) : typeof lat === 'function' ? lat() : DEFAULT_LATITUDE;
      lng1 = typeof lon === 'number' ? Number(lon) : typeof lon === 'string' ? Number(lon) : typeof lon === 'function' ? lon() : DEFAULT_LONGITUDE;
    }
    if(isNaN(lat1) || isNaN(lng1)) {
      let myClass = this.getClassName();
      let text = `${myClass}.fromLatLon(): Latitude and longitude parameters must be numeric, or number-returning functions. Invalid types`;
      Log.w(text + ":", lat, lon);
      let err = new Error(text);
      throw err;
    } else {
      let newloc = new OnSiteGeoposition();
      newloc.coords.latitude = lat1;
      newloc.coords.longitude = lng1;
      return newloc;
    }
  }

  public fromLatLon(lat:number|string|Function,lon:number|string|Function):OnSiteGeoposition {
    return OnSiteGeoposition.fromLatLon(lat,lon);
  }

  public isEmpty():boolean {
    // tslint:disable-next-line: triple-equals
    if(this.coords && (this.coords.latitude != 0 && this.coords.longitude != 0)) {
      return false;
    }
    return true;
  }

  public toString():string {
    let out:string = JSON.stringify(this);
    return out;
  }
  public toJSON() {
    return oo.clone(this);
  }
  public isOnSite():boolean {
    return true;
  }
  public static getClass():typeof OnSiteGeoposition {
    return OnSiteGeoposition;
  }
  public getClass():any {
    return OnSiteGeoposition;
  }
  public static getClassName():string {
    return 'OnSiteGeoposition';
  }
  public getClassName():string {
    return OnSiteGeoposition.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}

class OnSiteGeolocation extends OnSiteGeoposition {
  public coords    : OnSiteCoordinates = new OnSiteCoordinates();
  public timestamp : DOMTimeStamp      = Number(moment().format('x'));

  constructor(doc?:OnSiteGeoposition|OnSiteGeolocation|Position|any) {
    super(doc);
    if(doc) {
      if(doc.coords) {
        this.coords    = doc.coords    != undefined ? new OnSiteCoordinates(doc.coords) : this.coords;
        this.timestamp = doc.timestamp != undefined ? doc.timestamp : this.timestamp;
      } else {
        if(doc.latitude) {
          let coords:OnSiteCoordinates = new OnSiteCoordinates(doc);
          this.coords = coords;
        }
      }
    }
  }

  public equals(position:OnSiteGeolocation|OnSiteGeoposition|OnSiteCoordinates|ILatLng):boolean {
    let coords:ILatLng;
    let pos:any = position;
    if(this === position) {
      return true;
    } else if(pos.coords && pos.coords.latitude != undefined) {
      coords = pos.coords;
      return this.coords.equals(coords);
    } else if(pos.latitude != undefined && pos.longitude != undefined) {
      return this.coords.equals(pos);
    } else if(pos.lat != undefined && pos.lng != undefined) {
      return this.coords.equals(pos);
    } else {
      let className = this.getClassName();
      Log.w(`${className}(): parameter must be OnSite position, coordinates, or ILatLng object. Invalid parameter provided:`, position);
      return false;
    }
  }

  public clone():OnSiteGeolocation {
    let coords = new OnSiteCoordinates(this.coords);
    let ts     = Number(this.timestamp);
    let doc    = { coords: coords, timestamp: ts };
    let newloc = new OnSiteGeolocation(doc);
    return newloc;
  }

  public getCoordinatesAsString(decimalPlaces?:number):string {
    let lat:number = Number(this.coords.latitude);
    let lng:number = Number(this.coords.longitude);
    let places:number = isNumeric(decimalPlaces) ? Number(decimalPlaces) : 6;
    let coord:string = `%0.${places}f`;
    let format:string = `(${coord}, ${coord})`;
    let out:string = sprintf(format, lat, lng);
    return out;
  }

  public static fromLatLng(latlng:ILatLng|{lat:any,lng:any}):OnSiteGeolocation {
    let position = super.fromLatLng(latlng);
    let loc1 = new OnSiteGeolocation(position);
    return loc1;
  }

  public fromLatLng(latlng:ILatLng|{lat:any,lng:any}):OnSiteGeolocation {
    return OnSiteGeolocation.fromLatLng(latlng);
  }

  public static fromLatLon(lat?:number|string|Function|ILatLng,lon?:number|string|Function):OnSiteGeolocation {
    let position = super.fromLatLon(lat, lon);
    let loc1 = new OnSiteGeolocation(position);
    return loc1;
  }

  public fromLatLon(lat:number|string|Function,lon:number|string|Function):OnSiteGeolocation {
    return OnSiteGeolocation.fromLatLon(lat,lon);
  }

  public toString():string {
    let out:string = JSON.stringify(this);
    return out;
  }
  public toJSON() {
    return oo.clone(this);
  }
  public isOnSite():boolean {
    return true;
  }
  public static getClass():typeof OnSiteGeolocation {
    return OnSiteGeolocation;
  }
  public getClass():any {
    return OnSiteGeolocation;
  }
  public static getClassName():string {
    return 'OnSiteGeolocation';
  }
  public getClassName():string {
    return OnSiteGeolocation.getClassName();
  }
  public get [Symbol.toStringTag]():string {
    return this.getClassName();
  }
}

// const OnSiteLocation = OnSiteGeolocation;
const OnSiteLocation = OnSiteGeolocation;
const Position = OnSiteGeoposition;

export { DOMTimeStamp, LatLonLiteral, LatLng, ICoordinates, IPosition, OnSiteCoordinates, OnSiteGeoposition, OnSiteGeolocation, OnSiteLocation };
