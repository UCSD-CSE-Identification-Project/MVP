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

    var docRef = this.db.collection('users').doc(userId).ref;
    console.log(docRef);
    return await docRef.get().then(async function(doc) {
      if (doc.exists) {
        // console.log("Document data:", doc.data().class_term);
        return await doc.data().class_term;
      }
      else{
        console.log('user does not exist');
        return '';
      }

    });
  }
}
