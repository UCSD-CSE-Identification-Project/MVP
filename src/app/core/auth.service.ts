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
  private userDetails: firebase.User = null;
  private uid: string = '';

  constructor(private firebaseAuth: AngularFireAuth,
              private fireStore: AngularFirestore,
              private router: Router) {
    this.user = this.firebaseAuth.authState;

    this.user.subscribe(user => {
        if (user) {
          this.userDetails = user;
          this.uid = user.uid;
          console.log(this.userDetails);
          console.log(this.uid);
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

  logout() {
    this.firebaseAuth.auth.signOut();
    this.router.navigate(['/']);
  }
  
}
