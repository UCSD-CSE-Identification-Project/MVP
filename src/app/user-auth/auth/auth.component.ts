import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
    private router: Router,
    private dialog: MatDialog) { }

  ngOnInit() {
  }

  // TODO: Sanity check

  logIn() {
    const self = this;
    let promise = this.authService.signInRegular(this.email, this.password);
    promise.then(res => {
      console.log("in login");
      console.log(res.user.uid);
      // create user if they do not exist in database
      var docRef = self.db.collection('users').doc(res.user.uid).ref;

      docRef.get().then(function(doc) {
        if (doc.exists) {
          console.log('user exists');
          console.log(doc.data()["finishedLastRun"]);
          if (doc.data()["finishedLastRun"]) {
            self.router.navigate(["/upload"]);
          }
          else {
            // The user should be prompted to either resume or start a new one
            self.router.navigate(["/upload"]);
          }
        } else {
          // doc.data() will be undefined in this case
          console.log("need to create user: this should never happen");
          self.router.navigate(["/"]);
        }
      }).catch(function(error) {
        console.log("Error getting document:", error);
        this.router.navigate(["/"]);
      });
    })
      .catch(e => alert(e.message));
  }

  signUp() {
    const self = this;
    let promise = this.authService.signUpRegular(this.email, this.password);
    promise.then(res => {
      // create user if they do not exist in database
      var docRef = self.db.collection('users').doc(res.user.uid).ref;

      docRef.get().then(function(doc) {
        if (doc.exists) {
          console.log('user exists, this should never happen');
        } else {
          // doc.data() will be undefined in this case
          // console.log("need to create user");
          self.db.collection('users').doc(res.user.uid).set({
            class_term: {},
            email: self.email,
            name: '',
            finishedLastRun: false
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
