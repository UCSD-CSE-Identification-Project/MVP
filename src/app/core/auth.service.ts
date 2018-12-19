import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: Observable<firebase.User>;

  constructor(private firebaseAuth: AngularFireAuth,
              private fireStore: AngularFirestore,
              private router: Router) {
    this.user = this.firebaseAuth.authState;

    // TODO: Switch map, user credential or NULL, logout, log in status
  }

  async getUser() {
    //this.user = this.firebaseAuth.authState;
    let uid:string;
    return await this.user.subscribe(user => {
      console.log("this user is " + user.uid);
      uid = user.uid;
      return uid;
    });
  }

  signInRegular(email: string, password: string) {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signUpRegular(email: string, password: string) {
    return this.firebaseAuth.auth.createUserWithEmailAndPassword(email, password);
  }
}
