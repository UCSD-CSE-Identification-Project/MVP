import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseImageMatchesRoutingModule } from './choose-image-matches-routing.module';
import { MatchTerminalComponent,Guide } from './match-terminal/match-terminal.component';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProgressBarModule} from 'angular-progress-bar';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog'

import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,

} from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  declarations: [MatchTerminalComponent,Guide],
  imports: [
    CommonModule,
    ChooseImageMatchesRoutingModule,
    HttpModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    // MatProgressBarModule,
    ScrollingModule,
    ProgressBarModule,
    // MatSelectModulee
    MatDialogModule
  ],
  providers: [
		MatDialog
  ],
  entryComponents:[
    Guide
  ]
})
export class ChooseImageMatchesModule { }
