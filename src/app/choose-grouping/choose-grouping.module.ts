//import { ChooseGroupingModule } from './choose-grouping.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChooseGroupingRoutingModule } from './choose-grouping-routing.module';
import { ChooseGroupsComponent } from './choose-groups/choose-groups.component';

@NgModule({
  declarations: [ChooseGroupsComponent],
  imports: [
    CommonModule,
    ChooseGroupingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports:[]
})
export class ChooseGroupingModule { }
