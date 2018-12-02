import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-choose-view',
  templateUrl: './choose-view.component.html',
  styleUrls: ['./choose-view.component.css']
})
export class ChooseViewComponent implements OnInit {
  boxValues = [{opt: 'A'}, {opt: 'B'}, {opt: 'C'}, {opt: 'D'}, {opt: 'E'}];
  myForm: FormGroup;
  mappedAnswers = {A: [0, false, 'A'], B: [1, false, 'B'], C: [2, false, 'C'], D: [3, false, 'D'], E: [4, false, 'E']};
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
    if (this.imageIndex >= this.imageNames.length - 1) {
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
            'https://www.catster.com/wp-content/uploads/2017/08/Pixiebob-cat.jpg',
            'http://catsatthestudios.com/wp-content/uploads/2017/12/12920541_1345368955489850_5587934409579916708_n-2-960x410.jpg',
            'https://s.hswstatic.com/gif/ragdoll-cat.jpg'];
  }

}
