import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  auth: firebase.auth.Auth;
  email: string = '';
  password: string = '';

  constructor(private storage: AngularFireStorage,
              private db: AngularFirestore,
              private authService: AuthService) { }

  ngOnInit() { 
  }

  logIn() {
    let promise = this.authService.signInRegular(this.email, this.password);
    promise.catch(e => console.log(e.message));
  }

  signUp() {
    let promise = this.authService.signUpRegular(this.email, this.password);
    promise.catch(e => console.log(e.message));
  }

}
