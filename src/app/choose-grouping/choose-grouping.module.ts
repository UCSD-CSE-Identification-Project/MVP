//import { ChooseGroupingModule } from './choose-grouping.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChooseGroupingRoutingModule } from './choose-grouping-routing.module';
import { ChooseGroupsComponent, Guide } from './choose-groups/choose-groups.component';
import {MatButtonModule} from '@angular/material/button';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog'
import { OverlayModule } from '@angular/cdk/overlay';
import {MatCardModule} from '@angular/material/card';
@NgModule({
  declarations: [ChooseGroupsComponent,Guide],
  imports: [
    CommonModule,
    ChooseGroupingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    ScrollingModule,
    OverlayModule,
    MatDialogModule,
    MatCardModule
  ],
  exports:[],
  providers: [
		MatDialog
  ],
  entryComponents:[
    Guide
  ]
})
export class ChooseGroupingModule { }
