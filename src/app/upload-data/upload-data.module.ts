import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from "angular-progress-bar"

import { UploadDataRoutingModule } from './upload-data-routing.module';
import { UploadComponent } from './upload/upload.component';

@NgModule({
  declarations: [UploadComponent],
  imports: [
    CommonModule,
    ProgressBarModule,
    UploadDataRoutingModule
  ]
})
export class UploadDataModule { }
