import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material';
import { Notice } from './process/process.component';

import { ProcessDataRoutingModule } from './process-data-routing.module';
import { ProcessComponent } from './process/process.component';

@NgModule({
  declarations: [ProcessComponent, Notice],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ProcessDataRoutingModule,
    MatDialogModule
  ],
  entryComponents: [
    Notice
  ]
})
export class ProcessDataModule { }
