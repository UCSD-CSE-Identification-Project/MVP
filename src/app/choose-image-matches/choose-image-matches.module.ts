import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseImageMatchesRoutingModule } from './choose-image-matches-routing.module';
import { MatchTerminalComponent } from './match-terminal/match-terminal.component';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatListModule, MatMenuModule} from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  declarations: [MatchTerminalComponent],
  imports: [
    CommonModule,
    ChooseImageMatchesRoutingModule,
    HttpModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    ScrollingModule
    // MatSelectModulee
  ]
})
export class ChooseImageMatchesModule { }
