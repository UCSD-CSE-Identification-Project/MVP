import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from "angular-progress-bar"
import { MatCheckboxModule } from '@angular/material/checkbox';

import { UploadDataRoutingModule } from './upload-data-routing.module';
import { UploadComponent } from './upload/upload.component';
import { DropZoneDirective } from './drop-zone.directive';
import { FormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material';

@NgModule({
  declarations: [UploadComponent, DropZoneDirective],
  imports: [
    CommonModule,
    FormsModule,
    ProgressBarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    UploadDataRoutingModule
  ]
})
export class UploadDataModule { }
