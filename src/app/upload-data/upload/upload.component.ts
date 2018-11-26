import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnInit {
  files: File[][] = [[], [], [], [], [], []];
  percentage = 0;
  fileNames: String[] = [];

  constructor(private http: HttpClient, 
              private uploadService: UploadService) { }
  
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
    const fd = new FormData();
    for (let i = 0; i < this.files.length; i++) {
      for (let j = 0; j < this.files[i].length; j++) {
        fd.append('csv', this.files[i][j], this.files[i][j].name);
        this.fileNames.push(this.files[i][j].name);
      }
    }

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
    );

    this.setData = this.fileNames;

    console.log(this.getData);
  }

}
