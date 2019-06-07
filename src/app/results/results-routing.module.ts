import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ShowResultsComponent,Guide} from './show-results/show-results.component';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog'

const routes: Routes = [
    { path: '', component: ShowResultsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes),MatDialogModule],
    exports: [RouterModule],
    providers: [
		MatDialog
    ],
    entryComponents:[
        Guide
    ]
})

export class ResultsRoutingModule { }
