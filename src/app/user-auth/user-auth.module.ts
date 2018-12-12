import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserAuthRoutingModule } from './user-auth-routing.module';
import { AuthComponent } from './auth/auth.component';

@NgModule({
  declarations: [AuthComponent],
  imports: [
    CommonModule,
    FormsModule,
    UserAuthRoutingModule
  ]
})
export class UserAuthModule { }
