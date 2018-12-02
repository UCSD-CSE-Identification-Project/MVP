import { Component, OnInit } from '@angular/core';
//import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-choose-groups',
  templateUrl: './choose-groups.component.html',
  styleUrls: ['./choose-groups.component.css']
})
export class ChooseGroupsComponent implements OnInit {
  oneBox = [{opt: 'A'}, {opt: 'B'}, {opt: 'C'}, {opt: 'D'}, {opt: 'E'}];
  boxValues;
  constructor() {

  }

  ngOnInit() {
  }

}
