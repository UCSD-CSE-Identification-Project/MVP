import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChooseGroupsComponent} from './choose-groups/choose-groups.component';

const routes: Routes = [
  { path: '', component: ChooseGroupsComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChooseGroupingRoutingModule { }
