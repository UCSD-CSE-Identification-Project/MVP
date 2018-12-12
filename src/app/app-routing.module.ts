import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
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
    path: 'results',
    loadChildren: './results/results.module#ResultsModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
