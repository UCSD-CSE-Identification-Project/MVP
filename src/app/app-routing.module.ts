import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import { AuthGuard } from './core/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: './user-auth/user-auth.module#UserAuthModule'
  },
  {
    path: 'upload',
    canActivate: [AuthGuard],
    loadChildren: './upload-data/upload-data.module#UploadDataModule'
  },
  {
    path: 'navigator',
    canActivate: [AuthGuard],
    loadChildren: './navigation/navigation.module#NavigationModule'
  },
  {
    path: 'choose-answers',
    canActivate: [AuthGuard],
    loadChildren: './choose-answers/choose-answers.module#ChooseAnswersModule'
  },
  {
    path: 'choose-grouping',
    canActivate: [AuthGuard],
    loadChildren: './choose-grouping/choose-grouping.module#ChooseGroupingModule'
  },
  {
    path: 'process-data',
    canActivate: [AuthGuard],
    loadChildren: './process-data/process-data.module#ProcessDataModule'
  },
  {
    path: 'choose-image-matches',
    canActivate: [AuthGuard],
    loadChildren: './choose-image-matches/choose-image-matches.module#ChooseImageMatchesModule'
  },
  {
    path: 'results',
    canActivate: [AuthGuard],
    loadChildren: './results/results.module#ResultsModule'
  },
  {
    path: '**',
    canActivate: [AuthGuard],
    redirectTo: '/upload',
    pathMatch: 'full'
  }
];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
