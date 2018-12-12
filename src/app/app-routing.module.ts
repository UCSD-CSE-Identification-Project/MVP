import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: './user-auth/user-auth.module#UserAuthModule'
  },
  {
    path: 'upload',
    loadChildren: './upload-data/upload-data.module#UploadDataModule'
  },
  {
    path: 'navigator',
    loadChildren: './navigation/navigation.module#NavigationModule'
  },
  {
    path: 'choose-answers',
    loadChildren: './choose-answers/choose-answers.module#ChooseAnswersModule'
  },
  {
    path: 'choose-grouping',
    loadChildren: './choose-grouping/choose-grouping.module#ChooseGroupingModule'
  },
  {
    path: 'process-data',
    loadChildren: './process-data/process-data.module#ProcessDataModule'
  },
  {
    path: 'choose-image-matches',
    loadChildren: './choose-image-matches/choose-image-matches.module#ChooseImageMatchesModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
