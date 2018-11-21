import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChooseViewComponent } from './choose-view/choose-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ChooseAnswersRoutingModule} from 'src/app/choose-answers/choose-answers-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChooseAnswersRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ChooseViewComponent],
  exports: []
})
export class ChooseAnswersModule { }
