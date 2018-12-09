import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AngularFireStorage} from '@angular/fire/storage';
import {UploadService} from '../../upload-data/upload.service';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {DataSnapshot} from '@angular/fire/database-deprecated/interfaces';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChooseViewService {

  public items: Observable<any[]>;
  constructor(private http: HttpClient,
              private uploadService: UploadService,
              private storage: AngularFireStorage,
              private db: AngularFirestore) {
    this.items = db.collection('/terms').valueChanges();

  }

  async getImageNames(){
    var docRef = this.db.collection("images").doc("test_img1").ref;

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
}
