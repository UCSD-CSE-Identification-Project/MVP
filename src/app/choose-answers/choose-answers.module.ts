import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChooseViewComponent } from './choose-view/choose-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ChooseAnswersRoutingModule} from 'src/app/choose-answers/choose-answers-routing.module';
import {MatButtonModule} from '@angular/material/button';
import {ProgressBarModule} from 'angular-progress-bar';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChooseAnswersRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    ProgressBarModule,
    MatCardModule
  ],
  declarations: [ChooseViewComponent],
  exports: []
})
export class ChooseAnswersModule { }
