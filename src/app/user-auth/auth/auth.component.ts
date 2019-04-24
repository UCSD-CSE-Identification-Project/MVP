import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserTermImageInformationService } from '../../core/user-term-image-information.service';
import * as firebase from 'firebase';
import { AuthService, termData, groupLock } from 'src/app/core/auth.service';

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
            self.db.collection('users').doc(self.generalInfo.userIdVal).ref.update({
              finishedLastRun: false
            }).then(() => self.router.navigate(["/upload"]));
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
            finishedLastRun: false,
            useExistingPrev: false,
            lastUrl: '',
            current_terms_generalInfo: [],
            imageNum: 0,
            boxLocked: false,
            savedIndex: 0,
            savedChoice: ""
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
        this.authService.clearStorage();
        docRef.update({
          finishedLastRun: false,
          useExistingPrev: false,
          lastUrl: '',
          current_terms_generalInfo: [],
          imageNum: 0,
          boxLocked: false,
          savedIndex: 0,
          savedChoice: ""
        }).then(() => this.router.navigate(["/upload"]));

        this.generalInfo.prevTerm = this.generalInfo.constructTermObj();
        this.generalInfo.currTerm = this.generalInfo.constructTermObj();

        console.log(this.generalInfo.prevTerm);
        console.log(this.generalInfo.currTerm);
      }
    });
  }

  continue(doc: firebase.firestore.DocumentSnapshot) {
    let term = localStorage.getItem("termData");
    let url: string;
    // If localstorage is empty, get data from database instead, then fill sessionStorage
    if (term == null) {
      let usePrev = doc.data()["useExistingPrev"];
      url = doc.data()["lastUrl"];
      let terms = doc.data()["current_terms_generalInfo"];
      this.generalInfo.prevTerm = terms[0];
      this.generalInfo.currTerm = terms[1];
      let imageNum: number = doc.data()["imageNum"];
      let boxLocked: boolean = doc.data()["boxLocked"];
      let savedIndex: number = doc.data()["savedIndex"];
      let savedChoice: string = doc.data()["savedChoice"];

      // Store in localstorage
      let object: termData = {
        usePrev: usePrev,
        logoutUrl: url,
        prevTermInfo: this.generalInfo.prevTerm,
        currTermInfo: this.generalInfo.currTerm,
        imageIndex: imageNum
      };

      let lock: groupLock = {
        boxLocked: boxLocked,
        savedIndex: savedIndex,
        savedChoice: savedChoice
      }
      this.authService.setStorage("session", lock, "groupLock");
      this.authService.setStorage("session", object, "termData");
    }
    // Simply read from localStorage and set sessionStorage
    else {
      url = this.authService.getStorage("local", "termData").logoutUrl;
      this.authService.setStorage("session", this.authService.getStorage("local", "termData"), "termData");
      console.log(localStorage.getItem("groupLock"));
      if (localStorage.getItem("groupLock") !== null) {
        this.authService.setStorage("session", this.authService.getStorage("local", "groupLock"), "groupLock");
      }
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
    public dialogRef: MatDialogRef<Dialog>) {
      dialogRef.disableClose = true;
    }

}
