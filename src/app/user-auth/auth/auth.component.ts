import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserTermImageInformationService } from '../../core/user-term-image-information.service';
import * as firebase from 'firebase';
import { AuthService, termData } from 'src/app/core/auth.service';

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
    private generalInfo: UserTermImageInformationService,
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

      docRef.get().then(function (doc) {
        if (doc.exists) {
          console.log('user exists');
          console.log(doc.data()["finishedLastRun"]);
          if (doc.data()["finishedLastRun"]) {
            self.router.navigate(["/upload"]);
          }
          else {
            // The user should be prompted to either resume or start a new one
            self.openDialog(doc, docRef);
          }
        } else {
          // doc.data() will be undefined in this case
          console.log("need to create user: this should never happen");
          self.router.navigate(["/"]);
        }
      }).catch(function (error) {
        console.log("Error getting document:", error);
        self.router.navigate(["/"]);
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

      docRef.get().then(function (doc) {
        if (doc.exists) {
          console.log('user exists, this should never happen');
        } else {
          // doc.data() will be undefined in this case
          // console.log("need to create user");
          self.db.collection('users').doc(res.user.uid).set({
            class_term: {},
            email: self.email,
            name: '',
<<<<<<< HEAD
            finishedLastRun: false,
            lastUrl: '',
            current_terms_generalInfo: [],
            imageNum: 0
=======
            results: {}
>>>>>>> 4aae0e09ecaa5ad88092800906a77a651e1b9ab8
          }).catch((error) => {
            console.log("Error in creating a user auth.componenet.ts line 74", error);
          });
        }
      }).catch(function (error) {
        console.log("Error in creating sign up user auth.component.ts line 78:", error);
      });
      this.router.navigate(["/upload"]);
    })
      .catch(e => alert(e.message));
  }

<<<<<<< HEAD
  openDialog(doc: firebase.firestore.DocumentSnapshot, docRef: firebase.firestore.DocumentReference) {
    const dialogRef = this.dialog.open(Dialog, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.continue(doc);
      }
      else {
        // Clean up
        localStorage.clear();
        sessionStorage.clear();
        docRef.update({
          finishedLastRun: false,
          lastUrl: '',
          current_terms_generalInfo: [],
          imageNum: 0
        }).then(() => this.router.navigate(["/upload"]));
      }
    });
  }

  continue(doc: firebase.firestore.DocumentSnapshot) {
    let url = localStorage.getItem("logoutUrl");
    // If localstorage is empty, get data from database instead, then fill sessionStorage
    if (url == null) {
      url = doc.data()["lastUrl"];
      let terms = doc.data()["current_terms_generalInfo"];
      this.generalInfo.prevTerm = terms[0];
      this.generalInfo.currTerm = terms[1];
      let imageNum:number = doc.data()["imageNum"];

      // Store in localstorage
      let object:termData = {
        logoutUrl: url,
        prevTermInfo: this.generalInfo.prevTerm,
        currTermInfo: this.generalInfo.currTerm,
        imageIndex: imageNum
      };
      this.authService.setStorage("session", object);
    }
    // Simply read from localStorage and set sessionStorage
    else {
      this.authService.setStorage("session", this.authService.getStorage("local"));
    }
    this.router.navigate([url]);
  }

}

@Component({
  selector: 'pop-up',
  templateUrl: './pop-up.html',
})
export class Dialog {

  constructor(
    public dialogRef: MatDialogRef<Dialog>) { }

=======
>>>>>>> 4aae0e09ecaa5ad88092800906a77a651e1b9ab8
}
