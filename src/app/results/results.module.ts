import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material';
import { CautionDialog } from './show-results/show-results.component';
import { ResultsRoutingModule } from './results-routing.module';
import { ShowResultsComponent } from './show-results/show-results.component';

@NgModule({
  declarations: [ShowResultsComponent, CautionDialog],
  imports: [
    CommonModule,
    FormsModule,
    ResultsRoutingModule,
    MatButtonModule,
    MatDialogModule
  ],
  entryComponents: [
    CautionDialog
  ]
})
export class ResultsModule { }
