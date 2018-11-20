import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChooseViewComponent} from './choose-view/choose-view.component';

const routes: Routes = [
  { path: '', component: ChooseViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChooseAnswersRoutingModule { }
