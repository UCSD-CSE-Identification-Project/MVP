import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChooseGroupingRoutingModule } from './choose-grouping-routing.module';
import { ChooseGroupsComponent } from './choose-groups/choose-groups.component';

@NgModule({
  declarations: [ChooseGroupsComponent],
  imports: [
    CommonModule,
    ChooseGroupingRoutingModule
  ]
})
export class ChooseGroupingModule { }
