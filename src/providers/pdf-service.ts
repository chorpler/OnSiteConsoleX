// import { Injectable } from '@angular/core';
// import { Log } from 'domain/onsitexdomain';
// import { PouchDBService } from './pouchdb-service';
// import { OSData } from './data-service';
// import { AlertService } from './alert-service';
// import { Jobsite } from 'domain/onsitexdomain';
// import { Employee } from 'domain/onsitexdomain';
// import { Report } from 'domain/onsitexdomain';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';



// @Injectable()
// export class PDFService {
//   public dd:any = null;
//   public pdf:any = null;
//   public style:any = null;

//   constructor(public data:OSData, public alert:AlertService) {
//     Log.l("Hello PDFService provider");
//     window['onsitepdf'] = this;
//     window['onsiteservicepdf'] = PDFService;
//     pdfMake.vfs = pdfFonts.pdfMake.vfs;
//   }

//   public setDesignDocument(designdocument:any) {cd
//     this.dd = designdocument;
//     let style = this.getStyles();
//     if(style) {
//       this.dd['styles'] = style;
//     }

//     return this.dd;
//   }

//   public createPDF(designdocument:any) {
//     this.dd = designdocument;
//     let style = this.getStyles();
//     if(style && !designdocument['styles']) {
//       this.dd['styles'] = style;
//     }
//     this.pdf = pdfMake.createPdf(this.dd);
//   }

//   public openPDF() {
//     if(this.pdf) {
//       this.pdf.open();
//     } else {
//       Log.e("openPDF(): Can't open PDF because PDF is not defined yet.");
//     }
//   }

//   public printPDF() {
//     if(this.pdf) {
//       this.pdf.print();
//     } else {
//       Log.e("printPDF(): Can't print PDF because PDF is not defined yet.");
//     }
//   }

//   public getStyles() {
//     if(this.style) {
//       return this.style;
//     } else {
//       let defaultStyle = {alignment: 'left', fontSize: 18};
//       Log.l("getStyles(): Can't get styles, styles not defined. Setting to default:");
//       this.style = defaultStyle;
//       return this.style;
//     }
//   }

//   public setStyles(style:any) {
//     this.style = style;
//     return this.style;
//   }
// }
