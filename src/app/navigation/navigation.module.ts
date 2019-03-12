import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavigationRoutingModule } from './navigation-routing.module';
import { NavigatorComponent } from './navigator/navigator.component';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [ NavigatorComponent ],
  imports: [
    CommonModule,
    NavigationRoutingModule,
    MatButtonModule
  ]
})
export class NavigationModule { }
