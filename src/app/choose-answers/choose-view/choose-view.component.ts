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
  imagePath; // image path of picture you want to choose
  // start of new code
  allAnswers: FormArray;
  specificAnswers: FormGroup;
  constructor(private fb: FormBuilder, private s: ChooseViewService, private ref: ChangeDetectorRef) {
    this.imageIndex = 0;
    this.imagesFinished = false;
    this.imageNames = [];
    this.imagePath = '';
  }

  ngOnInit() {
    this.populateImageNames();
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
    this.setImagePath(this.imageNames[this.imageIndex]);
    this.addMCAnswerToImage(this.imageNames[this.imageIndex]);
  }
  async populateImageNames() {
    var self = this;
    await this.s.getImageNamesList().then( (data) => {
      // console.log("www."+data[self.imageIndex]);
      self.imageNames = data.all_images;
      self.ref.detectChanges();
      self.setImagePath(self.imageNames[self.imageIndex]);
    });
  }

  async setImagePath(name: string){
    var self = this;
    await this.s.getImageURL(name).then((url)=>{
      self.imagePath = url;
    });
  }

  addMCAnswerToImage(name: string,){
    this.s.addMCAnswerToImage(name, this.imageNames[this.imageIndex]);
  }
  showVal(){
    console.log(this.specificAnswers.value);
  }

}
