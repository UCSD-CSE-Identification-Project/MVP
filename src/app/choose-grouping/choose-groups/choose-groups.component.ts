import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-choose-groups',
  templateUrl: './choose-groups.component.html',
  styleUrls: ['./choose-groups.component.css']
})
export class ChooseGroupsComponent implements OnInit {
  boxValues = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Isomorphic'}, {opt: 'Ignore'}];
  imagesFinished; // if we finish reading all the images
  imageSources; // array of the image sources for the three images in view
  allGroupedAnswers: FormArray;
  // boxOne: FormGroup;
  // boxTwo: FormGroup;
  // boxThree: FormGroup;
  prevTerm;
  currTerm;
  boxOne;
  boxTwo;
  boxThree;

  constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore,private cdRef: ChangeDetectorRef) {
    this.imagesFinished = false;
  }

  ngOnInit() {/*
    this.boxOne = this.fb.group({
     option: [''],
    });

    this.boxTwo = this.fb.group({
     option: [''],
    });

    this.boxThree = this.fb.group({
     option: [''],
    });
    */
    this.boxOne = this.createBoxObj();
    this.boxTwo = this.createBoxObj();
    this.boxThree = this.createBoxObj();
    this.allGroupedAnswers = this.fb.array([]);

    this.prevTerm = this.createChooseGroupingTermObject(this.generalInfo.prevTermAllImages,this.generalInfo.prevTermLoadedFromDatabase);
    this.currTerm = this.createChooseGroupingTermObject(this.generalInfo.currTermAllImages, this.generalInfo.currTermLoadedFromDatabase);

    if( this.prevTerm.needGrouping ){

    }


  }

  createBoxObj() {
    return {
      boxVal: this.fb.group({
        option: [''],
      }),
      radioClicked: false,
      disabledRadioButton: false,
    };
  }
  createChooseGroupingTermObject(imgNames, needGroupingForTerm){
    let obj =  {
      imageNames: {},
      imageIndex: 0,
      imageKeysSorted: [],
      imageFinishedGrouping: false,
      needGrouping: false,
      numImages: 0,
    };

    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a, b) => a.localeCompare(b));
    obj.needGrouping = needGroupingForTerm;
    obj.numImages = obj.imageKeysSorted.length;
  }
  // reset variables when second term is done
  setResetTermVariables(prevOrCurrentTerm: number){
    if ( prevOrCurrentTerm === 0){

    }
  }
  getImageURLsetInHTML(indexImageSource: number, imageKey: string, setForPrev: boolean){
    if( setForPrev ){
      this.imageSources[indexImageSource] =
        this.db.collection('images').doc(this.prevTerm.imageNames[imageKey]).ref.get();
    } else{
      this.imageSources[indexImageSource] =
        this.db.collection('images').doc(this.currTerm.imageNames[imageKey]).ref.get();
    }
  }
  // TODO DO THESE CASES ALSO WORK IF THE FIRST QUESTION IS IGNORE
  async nextImage(prevOrCurrentTerm: number) {
    let numImagesLeft = this.numImages - this.imageIndex;
    if( numImagesLeft === 0 ){
      this.imagesFinished = true;
      return;
    }
    if ( numImagesLeft <= 3 ) {
      if ( numImagesLeft <= 1 ){
        const imageObj = {};
        imageObj["grouping"] = this.boxOne.controls.option.value;
        await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex]]).update(imageObj);
      }
      if(numImagesLeft <= 2 ) {
        const imageObj = {};
        imageObj["grouping"] = this.boxTwo.controls.option.value;
        await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex + 1]]).update(imageObj);
      }
      if( numImagesLeft <= 3 ) {
        const imageObj = {};
        imageObj["grouping"] =  this.boxThree.controls.option.value;
        await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex + 2]]).update(imageObj);
      }
      this.imagesFinished = true;
      return;
    }
    console.log(this.imageNames[this.imageKeysSorted[this.imageIndex]]);
    // different scenarios
    const boxOneValue = this.boxOne.boxVal.controls.option.value;
    const boxTwoValue = this.boxTwo.boxVal.controls.option.value;
    const boxThreeValue = this.boxThree.boxVal.controls.option.value;
    if ( boxTwoValue === 'Individual' && ( boxThreeValue === 'Group' || boxThreeValue === 'Isomorphic') ){
      const imageObj = {};
      imageObj["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, this.imageIndex);
      } //TODO ADD IMAGES IF INDIDVIDUAL FOR REST
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex]]).update(imageObj);
      this.imageIndex += 1;

      this.allGroupedAnswers.push(this.boxOne);

      this.boxOne = this.boxTwo;
      this.boxTwo = this.boxThree;

      this.disableBoxOne = true;
      this.disableBoxTwo = true;

      this.boxThree = this.fb.group({
        option: [''],
      });
      this.boxThreeRadioClicked = false;


      this.imageSources[0] = this.imageSources[1];
      this.imageSources[1] = this.imageSources[2];
      if ( this.imageIndex + 2 < this.numImages){
        this.getImageURLsetInHTML(2, this.imageIndex + 2);
      }
    }
    else if( ( boxTwoValue !== 'Individual' && boxThreeValue === 'Individual') ||
             ( boxTwoValue === 'Individual' && boxThreeValue === 'Individual') ) {
      const imageObjOne = {};
      imageObjOne["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, this.imageIndex);
      } //TODO ADD IMAGES IF INDIDVIDUAL FOR REST
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex]]).update(imageObjOne);

      const imageObjTwo = {};
      imageObjTwo["grouping"] = boxTwoValue;
      if ( boxTwoValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm,this.imageIndex+1);
      }
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex+1]]).update(imageObjTwo);
      this.imageIndex += 2;

      this.allGroupedAnswers.push(this.boxOne);
      this.allGroupedAnswers.push(this.boxTwo);

      this.boxOne = this.boxThree;
      this.disableBoxOne = true;
      this.disableBoxTwo = false;

      this.boxTwo = this.fb.group({
        option: [''],
      });
      this.boxTwoRadioClicked = false;

      this.boxThree = this.fb.group({
        option: [''],
      });
      this.boxThreeRadioClicked = false;

      this.imageSources[0] = this.imageSources[2];

      if ( this.imageIndex + 1 < this.numImages){
        this.getImageURLsetInHTML(1, this.imageIndex + 1);
      }
      if ( this.imageIndex + 2 < this.numImages){
        this.getImageURLsetInHTML(2, this.imageIndex + 2);
      }
    }
    else{
      const imageObjOne = {};
      imageObjOne["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, this.imageIndex);
      } //TODO ADD IMAGES IF INDIDVIDUAL FOR REST
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex]]).update(imageObjOne);

      const imageObjTwo = {};
      imageObjTwo["grouping"] = boxTwoValue;
      if ( boxTwoValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm,this.imageIndex+1);
      }
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex+1]]).update(imageObjTwo);

      const imageObjThree = {};
      imageObjThree["grouping"] = boxThreeValue;
      if ( boxThreeValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, this.imageIndex+2);
      }
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex+2]]).update(imageObjThree);
      this.imageIndex += 3;

      this.allGroupedAnswers.push(this.boxOne);
      this.allGroupedAnswers.push(this.boxTwo);
      this.allGroupedAnswers.push(this.boxThree);

      this.disableBoxOne = false;
      this.disableBoxTwo = false;

      this.boxOne = this.fb.group({
        option: [''],
      });
      this.boxOneRadioClicked = false;

      this.boxTwo = this.fb.group({
        option: [''],
      });
      this.boxTwoRadioClicked = false;

      this.boxThree = this.fb.group({
        option: [''],
      });
      this.boxThreeRadioClicked = false;

      if(this.imageIndex < this.numImages ){
        this.getImageURLsetInHTML(0, this.imageIndex);
      }
      if ( this.imageIndex + 1 < this.numImages){
        this.getImageURLsetInHTML(1, this.imageIndex + 1);
      }
      if ( this.imageIndex + 2 < this.numImages){
        this.getImageURLsetInHTML(2, this.imageIndex + 2);
      }
    }
  }
  addImageToPreviousOrCurrentTermIndImages( prevOrCurTerm: number, imageToAddIndex: number) {
    if( prevOrCurTerm === 0) {
      this.generalInfo.pushImageToPrevIndImages(this.imageNames[this.imageKeysSorted[this.imageIndex]]);
    } else {
      this.generalInfo.pushImageToCurrIndImages(this.imageNames[this.imageKeysSorted[this.imageIndex]]);
    }
  }
  updateChecked(boxNum: number){
    // if(this.boxOne.controls.option)
    if( boxNum === 1 ){
      this.boxOneRadioClicked = true;
    }
    else if( boxNum === 2 ){
      this.boxTwoRadioClicked = true;
    }
    else if( boxNum === 3 ){
      this.boxThreeRadioClicked = true;
    }
  }

  // checkes if all the images are checked or if the unchecked ones are hidden
  allChecked(){
    const boxTwoHidden = this.imageIndex+2 >= this.numImages;
    const boxThreeHidden = this.imageIndex+3 >= this.numImages;

    return this.boxOneRadioClicked &&
          (this.boxTwoRadioClicked || boxTwoHidden) &&
          (this.boxThreeRadioClicked || boxThreeHidden);

  }
  getImageNames(){
    return this.generalInfo.prevTermAllImages;
  }

}
