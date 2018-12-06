import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UploadService } from '../upload.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnInit {
  // Access to Observable, allow to pause, resume, cancel upload
  task: AngularFireUploadTask;

  // Upload progress
  progress: Observable<number>;
  snapshot: Observable<any>;

  // Download URL, removed in the new firebase update, need to find a work-around
  downloadURL: Observable<string>;

  // Dropzone css toggling
  isHovering: boolean;


  files: File[][] = [[], [], [], [], [], []];
  percentage = 0;
  fileNames: String[] = [];
  path: string = '';

  constructor(private http: HttpClient,
              private uploadService: UploadService,
              private storage: AngularFireStorage,
              private db: AngularFirestore) { }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  get getData(): String[] {
    return this.uploadService.fileNames;
  }
  set setData(value: String[]) {
    this.uploadService.fileNames = value;
  }

  ngOnInit() {
  }

  onFilesSelected(event, index) {
    const fileList = event.target.files;
    this.files[index] = fileList;
  }

  onUpload() {
    //TODO
    // File type checking, client side validation, mirror logic in backend storage rules

    // Generate "unique" file path
    //let path = `test/${new Date().getTime()}_${file.name}`;

    // Optional metadata

    const fd = new FormData();

    // Upload task
    for (let i = 0; i < this.files.length; i++) {
      for (let j = 0; j < this.files[i].length; j++) {
        this.fileNames.push(this.files[i][j].name);
        this.task = this.storage.upload('images/'+ this.files[i][j].name, this.files[i][j]);

        // Progress monitoring
        this.progress = this.task.percentageChanges();
        this.snapshot = this.task.snapshotChanges();

        // URL
        //this.downloadURL = this.task.downloadURL();


        // MAKE SURE LAST MINUTE

        let data1 = {
          class_term: ['CSE100FA18'],
          name: 'test',
          email: 'test@test'
        };

        //Term
        let data2 = {
          ind_images: ['image1.jpeg'],
          group_images: ['image2.jpeg'],
          iso_images: ['image3.jpeg'],
          csv: ['csv1.csv']
        };

        let data3 = {
          image_name_or_actual_image: 'name1',
          correct_answers: ['a', 'b'],
          grouping: 'iso_example',
          matches: 'test.img'
        };

        this.db.collection('users').doc('test_user1').set(data1);

        this.db.collection('terms').doc('test_FA2018').set(data2);
        this.db.collection('images').doc('test_img1').set(data3);

      }
    }
    firebase.storage().ref().child('20130721_141004.jpg').getDownloadURL().then(function (url) {
      // this.path = url;
      // this.setPath(url);
      document.getElementById('one').setAttribute('src', url);
    });

    this.setData = this.fileNames;
  }

  // Toggle CSS for upload task
  isActive() {

  }

}
