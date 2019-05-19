import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChooseViewComponent } from './choose-view/choose-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ChooseAnswersRoutingModule } from 'src/app/choose-answers/choose-answers-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChooseAnswersRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule
  ],
  declarations: [ChooseViewComponent],
  exports: []
})
export class ChooseAnswersModule { }
