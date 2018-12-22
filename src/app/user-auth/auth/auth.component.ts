import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
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
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
  }

  // TODO: Sanity check

  logIn() {
    const self = this;
    let promise = this.authService.signInRegular(this.email, this.password);
    promise.then(res => {
      console.log("in login");
      console.log(res.user.uid);
      this.router.navigate(["/upload"]);
      // create user if they do not exist in database
      var docRef = self.db.collection('users').doc(res.user.uid).ref;

      docRef.get().then(function(doc) {
        if (doc.exists) {
          console.log('user exists');
        } else {
          // doc.data() will be undefined in this case
          console.log("need to create user: this should never happen");
        }
      }).catch(function(error) {
        console.log("Error getting document:", error);
      });
    })
      .catch(e => alert(e.message));
  }

  signUp() {
    const self = this;
    let promise = this.authService.signUpRegular(this.email, this.password);
    promise.then(res => {
      // console.log(res);
      // console.log("in signup");
      // create user if they do not exist in database
      var docRef = self.db.collection('users').doc(res.user.uid).ref;

      docRef.get().then(function(doc) {
        if (doc.exists) {
          console.log('user exists');
        } else {
          // doc.data() will be undefined in this case
          // console.log("need to create user");
          self.db.collection('users').doc(res.user.uid).set({
            class_term: {},
            email: self.email,
            name: '',
          }).catch( (error)=>{
            console.log("Error in creating a user auth.componenet.ts line 74", error);
          });
        }
      }).catch(function(error) {
        console.log("Error in creating sign up user auth.component.ts line 78:", error);
      });
      this.router.navigate(["/upload"]);
    })
      .catch(e => alert(e.message));
  }

}
