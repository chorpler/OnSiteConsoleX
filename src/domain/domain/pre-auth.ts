// export class InvoiceItem {
//   public tech      : string = "";
//   public unitNumber: number = -1;
//   public wONumber  : number = -1;
//   public hours     : number = -1;
//   public amount    : number = -1;
//   public glCategory: string = "";
//   public percent   : number = 0 ;

//   public getClass():any {
//     return InvoiceItem;
//   }
//   public static getClassName():string {
//     return 'InvoiceItem';
//   }
//   public getClassName():string {
//     return InvoiceItem.getClassName();
//   }
//   public get [Symbol.toStringTag]():string {
//     return this.getClassName();
//   };
// };

// export class PreAuth {
//   public title      : string = "";
//   public date       : string = "";
//   public companyName: string = "";
//   public note       : string = "";
//   public authNumber : number = -1;

//   public vendorInformation:{
//     vendorCode    : number;
//     vendorName    : string;
//     vendorPhone   : number;
//     vendorEmail   : string;
//     contractNumber: number;
//     paymentTerms  : string;
//     totalAmount   : number;
//     vendorAddress : {
//       street  : string;
//       city    : string;
//       state   : string;
//       zipcode : number;
//       country : string;
//     };
//   };

//   public contactInformation:{
//     requestorName  : string;
//     email          : string;
//     telephoneNumber: string;
//   };

//   public ShipToInformation:{
//     plantName   : string;
//     deliveryDate: string;
//     address     :{
//       street : string;
//       city   : string;
//       state  : string;
//       zip    : number;
//       country: string;
//     };
//   };

//   public invoicesubmission:{
//     sendInvoiceAsPdfToEmail: string;
//     orSendToAddress        : {
//       recipient: string;
//       street01 : string;
//       street02 : string;
//       city     : string;
//       state    : string;
//       zipcode  : number;
//       country  : string;
//     };
//   };

//   public invoiceData: Array<InvoiceItem>;

//   public getClass():any {
//     return PreAuth;
//   }
//   public static getClassName():string {
//     return 'PreAuth';
//   }
//   public getClassName():string {
//     return PreAuth.getClassName();
//   }
//   public get [Symbol.toStringTag]():string {
//     return this.getClassName();
//   };

// }
