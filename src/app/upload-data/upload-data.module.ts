import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from "angular-progress-bar"

import { UploadDataRoutingModule } from './upload-data-routing.module';
import { UploadComponent } from './upload/upload.component';
import { DropZoneDirective } from './drop-zone.directive';

@NgModule({
  declarations: [UploadComponent, DropZoneDirective],
  imports: [
    CommonModule,
    ProgressBarModule,
    UploadDataRoutingModule
  ]
})
export class UploadDataModule { }
