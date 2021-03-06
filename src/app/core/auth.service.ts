import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

export interface termData {
  logoutUrl: string,
  prevTermInfo: any,
  currTermInfo: any,
  imageIndex: number
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;
  private uid: string = '';

  constructor(private firebaseAuth: AngularFireAuth,
              private db: AngularFirestore,
              private router: Router) {
    this.user = this.firebaseAuth.authState;

    this.user.subscribe(user => {
        if (user) {
          this.userDetails = user;
          this.uid = user.uid;
          // console.log(this.userDetails);
          // console.log(this.uid);
        }
        else {
          this.userDetails = null;
          this.uid = '';
        }
      }
    );
    // TODO: Switch map, user credential or NULL, logout, log in status
  }

  getUser() {
    return this.uid;
  }

  signInRegular(email: string, password: string) {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signUpRegular(email: string, password: string) {
    return this.firebaseAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  unloadNotification($event: any) {
    $event.returnValue = false;
  }

  setStorage(type: string, object:termData) {
    if (type === "local") {
      localStorage.setItem("termData", JSON.stringify(object));
    }
    else if(type === "session") {
      sessionStorage.setItem("termData", JSON.stringify(object));
    }
  }

  getStorage(type: string):termData {
    if (type === "local") {
      return JSON.parse(localStorage.getItem("termData"));
    }
    else if (type === "session") {
      return JSON.parse(sessionStorage.getItem("termData"));
    }
  }

  logout(lastUrl: string, terms, imageNum: number) {
    // When logout, get that user info
    let self = this;
    let docRef = this.db.collection('users').doc(this.uid).ref;
    docRef.update({
      lastUrl: lastUrl,
      current_terms_generalInfo: terms,
      imageNum: imageNum
    }).then(function() {
      self.firebaseAuth.auth.signOut();
      self.router.navigate(['/']);
    });
  }

}
