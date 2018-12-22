import { Injectable } from '@angular/core';
import {AuthService} from '../core/auth.service';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  fileNames: String[] = [];
  constructor(private authService: AuthService,
              private db: AngularFirestore) {
  }


  getImageNames(){

  }

  async getTermNames(){
    let userId = this.authService.getUser();
    userId = userId === '' ? 'not logged in' : userId; // in case the user has not logged in should never happen

    var docRef = this.db.collection('users').doc(userId).ref;
    console.log(docRef);
    return await docRef.get().then(async function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        return await doc.data();
      }
      return '';
    });
  }
}
