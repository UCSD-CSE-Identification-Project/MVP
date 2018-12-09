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

  async onUpload() {
    var self = this;
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
        await firebase.storage().ref().child('20130721_141004.jpg').getDownloadURL().then(function (url) {
          self.path = url;
          alert(self.path);
          // do what we did on the getDownloadURL thing
        });

        // MAKE SURE LAST MINUTE
        // TODO: HAVE ALL OF THESE HERE AND THEN SEE IF WE JUST WANT TO PUSH AND UPDATE LATER
        // OR IF WE WANT TO HAVE ALL FIELDS PUSHED WHEN WE FIRST PUSH


        let imageObj = {
          image_name_or_actual_image: '',
          correct_answers: [],
          grouping: '',
          matches: '',
          // URL: this.path, // TODO DO WE WANT THIS HERE
        };


        this.db.collection('images').doc(this.files[i][j].name).set(imageObj);

      }
    }
    this.fileNames.push('20130721_141004.jpg');
    let userObj = {
      class_term: [],
      name: '',
      // username: '', DO WE WANT USER NAME ALSO
      email: ''
    };

    //Term
    let termObj = {
      all_images: this.fileNames,
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: [],
      results: ''
    };

    this.db.collection('users').doc('ravi_sheth').set(userObj);

    this.db.collection('terms').doc('test_WI2018').set(termObj);

    this.setData = this.fileNames;

  }

}
