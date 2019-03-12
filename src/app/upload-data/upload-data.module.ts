import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from "angular-progress-bar"
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

import { UploadDataRoutingModule } from './upload-data-routing.module';
import { UploadComponent } from './upload/upload.component';
import { FormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material';

@NgModule({
  declarations: [UploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProgressBarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    UploadDataRoutingModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class UploadDataModule { }
