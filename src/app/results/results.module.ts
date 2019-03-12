import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';

import { ResultsRoutingModule } from './results-routing.module';
import { ShowResultsComponent } from './show-results/show-results.component';

@NgModule({
  declarations: [ShowResultsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ResultsRoutingModule,
    MatButtonModule
  ]
})
export class ResultsModule { }
