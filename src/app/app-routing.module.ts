import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';

const routes: Routes = [
  { path: 'upload', component: UploadComponent },
  {
    path: 'choose-answers',
    loadChildren: './choose-answers/choose-answers.module#ChooseAnswersModule'
  },
  {path: '',
   loadChildren: './choose-answers/choose-answers.module#ChooseAnswersModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
