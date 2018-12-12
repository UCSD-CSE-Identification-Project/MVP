import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ShowResultsComponent} from './show-results/show-results.component';

const routes: Routes = [
    { path: '', component: ShowResultsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ResultsRoutingModule { }
