import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-choose-view',
  templateUrl: './choose-view.component.html',
  styleUrls: ['./choose-view.component.css']
})
export class ChooseViewComponent implements OnInit {
  boxValues = [{opt: 'a'}, {opt: 'b'}, {opt: 'c'}, {opt: 'd'}, {opt: 'e'}];
  myForm: FormGroup;
  mappedAnswers = {a: [0, false, 'a'], b: [1, false, 'b'], c: [2, false, 'c'], d: [3, false, 'd'], e: [4, false, 'e']};
  imageNames;
  imageIndex;
  imagesFinished; // if we finish reading all the images
  constructor(private fb: FormBuilder) {
    this.imageNames = this.getImageNames();
    this.imageIndex = 0;
    this.imagesFinished = false;
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      matches: this.fb.array([]),
    });
  }

  onChange(option: string, isChecked: boolean) {
    if ( isChecked && this.mappedAnswers[option][1] === false ) {
      this.mappedAnswers[option][1] = true;
    } else if (!isChecked && this.mappedAnswers[option][1] !== true ) {
      this.mappedAnswers[option][1] = false;
    }

  }

  checked(option: string){
    return this.mappedAnswers[option][1];
  }
  nextImage() {
    if (this.imageIndex >= this.imageNames.length) {
      this.imagesFinished = true;
      return;
    }
    const emailFormArray = <FormArray>this.myForm.get('matches') as FormArray;
    const curAnswers = [];

    Object.values(this.mappedAnswers).forEach(function (value) {
      if ( value[1] === true) {
        curAnswers.push(value[2]);
        value[1] = false;
      }
    });
    emailFormArray.push(new FormControl([this.imageNames[this.imageIndex], curAnswers]));
    this.imageIndex += 1;

  }
  getImageNames() {
    return ['https://www.catster.com/wp-content/uploads/2018/07/Savannah-cat-long-body-shot.jpg',
            'imagename1', 'imagename2', 'imagename3'];
  }

}
