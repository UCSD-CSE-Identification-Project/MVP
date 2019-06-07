import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChooseViewComponent,Guide} from './choose-view/choose-view.component';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog'
import {MatCardModule} from '@angular/material';

const routes: Routes = [
  { path: '', component: ChooseViewComponent }
];

@NgModule({
  declarations: [Guide],
  imports: [
    RouterModule.forChild(routes),
    MatDialogModule,
    MatCardModule
  ],
  exports: [RouterModule],
  providers: [
		MatDialog
  ],
  entryComponents:[
    Guide
  ]
})
export class ChooseAnswersRoutingModule { }
