import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFireStorage} from '@angular/fire/storage';
import {UploadService} from '../../upload-data/upload.service';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {DataSnapshot} from '@angular/fire/database-deprecated/interfaces';
import {Observable} from 'rxjs';
import * as firebase from 'firebase';
import {FormBuilder, FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ChooseViewService {
  store;

  constructor(private http: HttpClient,
              private uploadService: UploadService,
              private storage: AngularFireStorage,
              private db: AngularFirestore) {
    this.store =  firebase.storage();

  }

  async getImageNamesList(){
    var docRef = this.db.collection('terms').doc('test_WI2018').ref;

    return await docRef.get().then(async function(doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        return await doc.data();
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });

  }

  async getImageURL( imageName: string ){
    return await this.store.ref("/images").child(imageName).getDownloadURL().then(async function(url){
      return await url;
    });
  }

  addMCAnswerToImage( imageName: string, answers: FormGroup){
    this.db.collection('images').doc(imageName).update({
      correct_answers: answers,
    });
  }
}
