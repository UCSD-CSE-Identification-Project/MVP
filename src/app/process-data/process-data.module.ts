import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from "angular-progress-bar";

import { ProcessDataRoutingModule } from './process-data-routing.module';
import { ProcessComponent } from './process/process.component';

@NgModule({
  declarations: [ProcessComponent],
  imports: [
    CommonModule,
    ProgressBarModule,
    ProcessDataRoutingModule
  ]
})
export class ProcessDataModule { }
