import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClient, HttpClientModule, HttpParams} from '@angular/common/http';
import { HttpModule, Http } from '@angular/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule, AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import * as $ from 'jquery';

import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import {MatListModule, MatProgressBarModule, MatProgressSpinnerModule} from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';
// All the services
import { UploadService } from './upload-data/upload.service';
import { ZipService } from './unzipFolder/zip.service';
import { UserTermImageInformationService } from './core/user-term-image-information.service';
import { AuthService } from './core/auth.service';
import { AuthGuard } from './core/auth.guard';
import { ChooseViewService } from './choose-answers/choose-view/choose-view.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    CoreModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatListModule,
    ScrollingModule
  ],
  providers: [AngularFireStorage, UploadService, ZipService, UserTermImageInformationService, AuthService, AuthGuard, ChooseViewService],
  bootstrap: [AppComponent]
})
export class AppModule { }
