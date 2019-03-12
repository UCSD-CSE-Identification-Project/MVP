import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material';
import { UserAuthRoutingModule } from './user-auth-routing.module';
import { AuthComponent } from './auth/auth.component';
import { Dialog } from './auth/auth.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [
    AuthComponent,
    Dialog
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    UserAuthRoutingModule,
    MatCardModule,
    MatButtonModule
  ],
  entryComponents: [
    Dialog
  ]
})
export class UserAuthModule { }
