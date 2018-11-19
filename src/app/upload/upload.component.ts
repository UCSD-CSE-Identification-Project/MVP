import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  files: File[] = [];
  percentage = 0;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  onFilesSelected(event) {
    const fileList = event.target.files;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.files.push(file);
    }
  }

  onUpload() {
    const fd = new FormData();
    for (let i = 0; i < this.files.length; i++) {
      fd.append('pdf', this.files[i], this.files[i].name);
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
  }

}
