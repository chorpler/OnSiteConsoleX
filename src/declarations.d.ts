// import * as momentous from 'moment';
/*
  Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
  They're what make intellisense work and make Typescript know all about your code.

  A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
  provide their own type declarations.

  To learn more about using third party libraries in an Ionic app, check out the docs here:
  http://ionicframework.com/docs/v2/resources/third-party-libs/

  For more info on type definition files, check out the Typescript docs here:
  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
*/

// declare module 'moment' {
//   export interface MomentExcel extends momentous.Moment {
//     fromExcel(days: number | string): Moment;
//     toExcel(mo?: Date | Moment | string): number;
//     round(precision: number, key: string, direction?: string): Moment;
//   }
// }

// declare module '*';

// declare namespace PouchDB {
//   namespace Replication {
//     interface ReplicationResult<Content extends {}> {
//       pending?:number;
//     }
//   }
  // interface UpsertResponse {
  //   ok?:boolean;
  // }
// }

declare interface Blob {
  readonly size: number;
  readonly type: string;
  slice(start?: number, end?: number):Blob;
  arrayBuffer():Promise<ArrayBuffer>;
  text():Promise<string>;
  dataURL():Promise<string>;
  url():string;
  json():Promise<any>;
  image():Promise<HTMLImageElement>;
  stream():ReadableStream;
}

// declare namespace PouchDB {
//   interface 
// }