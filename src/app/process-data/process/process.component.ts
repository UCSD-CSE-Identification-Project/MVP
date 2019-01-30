import { Component, OnInit } from '@angular/core';
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

  constructor(private fb: FormBuilder,
              private generalInfo: UserTermImageInformationService,
              private db: AngularFirestore) {
  }

  ngOnInit() {
  }
}
