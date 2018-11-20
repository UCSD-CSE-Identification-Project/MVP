import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'choose-answers',
    loadChildren: './choose-answers/choose-answers.module#ChooseAnswersModule'
  },
  { path: '',   redirectTo: '/choose-answers', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
