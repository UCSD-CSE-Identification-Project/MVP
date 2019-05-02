//import { ChooseGroupingModule } from './choose-grouping.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChooseGroupingRoutingModule } from './choose-grouping-routing.module';
import { ChooseGroupsComponent } from './choose-groups/choose-groups.component';
import {MatButtonModule} from '@angular/material/button';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
  declarations: [ChooseGroupsComponent],
  imports: [
    CommonModule,
    ChooseGroupingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    ScrollingModule
  ],
  exports:[]
})
export class ChooseGroupingModule { }
