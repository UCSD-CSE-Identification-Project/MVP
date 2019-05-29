import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'angular-progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

import { UploadDataRoutingModule } from './upload-data-routing.module';
import { UploadComponent,Guide } from './upload/upload.component';
import { FormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog'

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
    MatCardModule,
    MatDialogModule
  ],
  providers: [
		MatDialog
  ],
  entryComponents:[
    Guide
  ]
})
export class UploadDataModule { }
