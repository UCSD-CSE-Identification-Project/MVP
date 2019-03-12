import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

export interface termData {
  usePrev: boolean,
  logoutUrl: string,
  prevTermInfo: any,
  currTermInfo: any,
  imageIndex: number
}

export interface groupLock {
  boxLocked: boolean,
  savedIndex: number,
  savedChoice: string
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
      }
      else {
        this.userDetails = null;
        this.uid = '';
      }
    }
    );
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

  setStorage(type: string, object: any, name: string) {
    if (type === "local") {
      localStorage.setItem(name, JSON.stringify(object));
    }
    else if (type === "session") {
      sessionStorage.setItem(name, JSON.stringify(object));
    }
  }

  getStorage(type: string, name: string): any {
    if (type === "local") {
      return JSON.parse(localStorage.getItem(name));
    }
    else if (type === "session") {
      return JSON.parse(sessionStorage.getItem(name));
    }
  }

  logout(usePrev: boolean, lastUrl: string, terms: any[], imageNum: number, boxLocked: boolean = false, savedIndex: number = 0, savedChoice: string = "") {
    // When logout, get that user info
    let self = this;
    let docRef = this.db.collection('users').doc(this.uid).ref;
    docRef.update({
      useExistingPrev: usePrev,
      lastUrl: lastUrl,
      current_terms_generalInfo: terms,
      imageNum: imageNum,
      boxLocked: boxLocked,
      savedIndex: savedIndex,
      savedChoice: savedChoice
    }).then(function () {
      self.firebaseAuth.auth.signOut();
      self.router.navigate(['/']);
    });
  }

}
