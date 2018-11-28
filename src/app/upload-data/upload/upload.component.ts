import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { UploadService } from '../upload.service';

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

  // Download URL
  downloadURL: Observable<string>;

  // Dropzone css toggling
  isHovering: boolean;


  files: File[][] = [[], [], [], [], [], []];
  percentage = 0;
  fileNames: String[] = [];

  constructor(private http: HttpClient, 
              private uploadService: UploadService, 
              private storage: AngularFireStorage) { }
  
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
    // File type checking

    // Generate "unique" file path
    //let path = `test/${new Date().getTime()}_${file.name}`;

    const fd = new FormData();

    // Upload task
    for (let i = 0; i < this.files.length; i++) {
      for (let j = 0; j < this.files[i].length; j++) {
        this.fileNames.push(this.files[i][j].name);
        this.task = this.storage.upload(this.files[i][j].name, this.files[i][j]);
        
        // Progress monitoring
        this.progress = this.task.percentageChanges();
        this.snapshot = this.task.snapshotChanges();

        // URL
        //this.downloadURL = this.task.downloadURL();
        
      }
    }

    /* code from upload file tutorial
    this.http.post('http://localhost:8000/upload', fd, {
      reportProgress: true,
      observe: 'events'
    }).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.percentage = Math.round(event.loaded / event.total * 100);
          console.log('Uploaded ' + this.percentage + '%');
        }
        else {
          console.log(event);
        }
      }
    );*/

    this.setData = this.fileNames;

    console.log(this.getData);
  }

  // Toggle CSS for upload task
  isActive() {

  }

}
