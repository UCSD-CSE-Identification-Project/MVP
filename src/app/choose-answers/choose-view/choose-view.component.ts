import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-choose-view',
  templateUrl: './choose-view.component.html',
  styleUrls: ['./choose-view.component.css']
})
export class ChooseViewComponent implements OnInit {
  // curChoosen;
  emails = [{ email: 'email1' }, { email: 'email2' }, { email: 'email3' }, { email: 'email4' }];
  boxValues = [{opt: 'a'}, {opt: 'b'}, {opt: 'c'}, {opt: 'd'}, {opt: 'e'}];
  myForm: FormGroup;
  mappedAnswers = {a: [0, false, 'a'], b: [1, false, 'b'], c: [2, false, 'c'], d: [3, false, 'd'], e: [4, false, 'e']};
  imageNames;
  imageIndex;
  constructor(private fb: FormBuilder) {
    // this.curChoosen = [0, 0, 0, 0, 0];
    this.imageNames = ['imagename1', 'imagename2', 'imagename3'];
    this.imageIndex = 0;
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      matches: this.fb.array([]),
    });
  }

  onChange(option: string, isChecked: boolean) {
      // alert('in onchange');
      // console.log(isChecked);
      // console.log(option);
      // console.log(this.mappedAnswers[option]);
    /*
      if ( isChecked && this.curChoosen[this.mappedAnswers[option]] === 0 ) {
        this.curChoosen[this.mappedAnswers[option]] = option;
      } else if (!isChecked && this.curChoosen[this.mappedAnswers[option]] !== 0 ) {
        this.curChoosen[this.mappedAnswers[option]] = 0;
      }
      */
    if ( isChecked && this.mappedAnswers[option][1] === false ) {
      this.mappedAnswers[option][1] = true;
    } else if (!isChecked && this.mappedAnswers[option][1] !== true ) {
      this.mappedAnswers[option][1] = false;
    }

  }

  checked(option: string){
    return this.mappedAnswers[option][1];
  }
  submit() {
    // alert("in here");
    const emailFormArray = <FormArray>this.myForm.get('matches') as FormArray;
    const curAnswers = [];
    /*
    this.curChoosen.forEach(function (val) {
      if ( val !== 0 ) {
        curAnswers.push(val);
      }
    });
    */
    Object.values(this.mappedAnswers).forEach(function (value) {
      if ( value[1] === true) {
        curAnswers.push(value[2]);
        value[1] = false;
      }
    });
    // console.log(curAnswers);
    // console.log(this.curChoosen);
    emailFormArray.push(new FormControl([this.imageNames[this.imageIndex], curAnswers]));
    this.imageIndex += 1;
  }


}
