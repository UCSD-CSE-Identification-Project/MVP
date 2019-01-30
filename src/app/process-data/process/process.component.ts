import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  percentage = 0;
  checked = false;


  /*constructor() { }


  ngOnInit() {
  }*/

  toggleChecked() {
    this.checked = !this.checked;
  }


  onUpload() {
    // Initialize Params Object
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('course', "CSE100FA2018");
    params = params.append('week', "10");
    params = params.append('elements', "c");
    this.http.get('https://us-central1-ersp-identification.cloudfunctions.net/prediction', { params: params }).subscribe(
      result => console.log(result)
    );
  }


  constructor(private fb: FormBuilder,
              private generalInfo: UserTermImageInformationService,
              private db: AngularFirestore) {
  }

  ngOnInit() {
  }

}
