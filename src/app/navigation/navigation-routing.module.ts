import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigatorComponent } from './navigator/navigator.component';

const routes: Routes = [
  {
    path: ':stage',
    component: NavigatorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationRoutingModule { }
