import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
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
  },
  {
    path: '',
    loadChildren: './upload-data/upload-data.module#UploadDataModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
