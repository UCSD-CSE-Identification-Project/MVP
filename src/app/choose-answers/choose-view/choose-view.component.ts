import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';
import {ChooseViewService} from './choose-view.service';

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
  constructor(private fb: FormBuilder, private s: ChooseViewService, private ref: ChangeDetectorRef) {
    this.imageIndex = 0;
    this.imagesFinished = false;
    this.imageNames = [];
    console.log(this.imageNames);
  }

  async ngOnInit() {
    console.log(this.populateImageNames());
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
  async populateImageNames() {
    var self = this;
    await this.s.getImageNames().then( (data) => {
      // console.log("www."+data[self.imageIndex]);
      self.imageNames = data.URL;
      alert(self.imageNames);
      self.ref.detectChanges();
    });
    alert(this.imageNames);
    // return await this.s.getImageNames();
    /*
    this.s.getImageNames().then(function (this, data) {
      this.imageNames = data;
    });
    */
    // console.log(images);
    /*return ['https://www.catster.com/wp-content/uploads/2018/07/Savannah-cat-long-body-shot.jpg',
            'https://www.catster.com/wp-content/uploads/2017/08/Pixiebob-cat.jpg',
            'http://catsatthestudios.com/wp-content/uploads/2017/12/12920541_1345368955489850_5587934409579916708_n-2-960x410.jpg',
            'https://s.hswstatic.com/gif/ragdoll-cat.jpg'];*/
  }

  showVal(){
    console.log(this.specificAnswers.value);
  }

}
