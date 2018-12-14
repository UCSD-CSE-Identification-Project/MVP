import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MatchTerminalComponent} from './match-terminal/match-terminal.component';

const routes: Routes = [
  { path: '', component: MatchTerminalComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChooseImageMatchesRoutingModule { }
