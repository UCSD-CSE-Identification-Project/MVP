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
  mappedAnswers; // keep until we figure out what format the image names will be given in in the array
  imageNames;
  imageIndex;
  imagesFinished; // if we finish reading all the images

  // start of new code
  allAnswers: FormArray;
  specificAnswers: FormGroup;
  numCheckedBoxes: number;

  constructor(private fb: FormBuilder) {
    this.imageNames = this.getImageNames();
    this.imageIndex = 0;
    this.imagesFinished = false;
    this.numCheckedBoxes = 0;
  }

  ngOnInit() {
    this.allAnswers = this.fb.array([]);
    this.specificAnswers = this.fb.group({
      A: [false],
      B: [false],
      C: [false],
      D: [false],
      E: [false]
    });
  }
  nextImage() {

    this.allAnswers.push(this.specificAnswers);
    this.specificAnswers = this.fb.group({
      A: [false],
      B: [false],
      C: [false],
      D: [false],
      E: [false]
    });
    this.imageIndex += 1;
    if (this.imageIndex > this.imageNames.length - 1) {
      this.imagesFinished = true;
      this.imageIndex -= 1;
      return;
    }

  }
  getImageNames() {
    return ['https://www.catster.com/wp-content/uploads/2018/07/Savannah-cat-long-body-shot.jpg',
            'https://www.catster.com/wp-content/uploads/2017/08/Pixiebob-cat.jpg',
            'http://catsatthestudios.com/wp-content/uploads/2017/12/12920541_1345368955489850_5587934409579916708_n-2-960x410.jpg',
            'https://s.hswstatic.com/gif/ragdoll-cat.jpg'];
  }
  boxChecked(isChecked: boolean){
    if(isChecked){
      this.numCheckedBoxes++;
    }else{
      this.numCheckedBoxes--;
    }
  }
  showVal(){
    console.log(this.specificAnswers);
  }

}
