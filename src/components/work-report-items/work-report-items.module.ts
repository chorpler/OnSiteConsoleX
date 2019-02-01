
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkReportItemsComponent } from "./work-report-items";
import { IonicPageModule } from 'ionic-angular'

@NgModule({
    declarations: [
        WorkReportItemsComponent,
    ],
    imports: [
        IonicPageModule,
        CommonModule,
        FormsModule,
    ],
    exports: [
        WorkReportItemsComponent,
    ]
})
export class WorkReportItemsComponentModule { }