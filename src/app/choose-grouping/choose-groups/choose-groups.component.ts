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
  imageNames;
  imageIndex;
  imageKeysSorted;
  imagesFinished; // if we finish reading all the images
  imageSources; // array of the image sources for the three images in view
  numImages;
  prevTermNeedGrouping : boolean;
  currTermNeedGrouping: boolean;
  // new code
  allGroupedAnswers: FormArray;
  boxOne: FormGroup;
  boxTwo: FormGroup;
  boxThree: FormGroup;
  boxOneRadioClicked: boolean;
  boxTwoRadioClicked: boolean;
  boxThreeRadioClicked: boolean;
  disableBoxOne: boolean;
  disableBoxTwo: boolean;
  // loadingImage;

  constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore,private cdRef: ChangeDetectorRef) {
    this.prevTermNeedGrouping = false;
    this.imageNames = {};
    this.imageNames[4]="startingvalue";
    this.numImages = 0;
    console.log(this.imageNames.size);
    this.imageKeysSorted = [];
    this.imageIndex = 0;
    this.imagesFinished = false;
    // this.loadingImage ='https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0';
    // this.imageSources = [{downloadURL:'https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0'},
    //   {downloadURL:'https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0'},
    //   {downloadURL:'https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0'}];
  }

  ngOnInit() {
    this.boxOne = this.fb.group({
     option: [''],
    });

    this.boxTwo = this.fb.group({
     option: [''],
    });

    this.boxThree = this.fb.group({
     option: [''],
    });

    this.allGroupedAnswers = this.fb.array([]);
    this.imageNames = this.getImageNames();

    // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    this.imageKeysSorted = Object.keys(this.imageNames).sort((a, b) => a.localeCompare(b));
    this.numImages = this.imageKeysSorted.length;
    this.imageIndex = 0;
    this.getImageURLsetInHTML(0, this.imageIndex);
    this.getImageURLsetInHTML(1, this.imageIndex + 1);
    this.getImageURLsetInHTML(2, this.imageIndex + 2);
    this.prevTermNeedGrouping = this.generalInfo.prevTermLoadedFromDatabase;
    this.currTermNeedGrouping = this.generalInfo.currTermLoadedFromDatabase;
  }

  createBoxObj(){
    return {
      boxVal: this.fb.group({
        option: [''],
      }),
      radioClicked: false,
      disabledRadioButton: false,
    };
  }
  createChooseGroupingTermObject(){
    return {
      imageNames: {},
      imageIndex: 0,
      imageKeysSorted: [],
      imageFinishedGrouping: false,
      needGrouping: false,
    };
  }
  // reset variables when second term is done
  setResetTermVariables(prevOrCurrentTerm: number){
    if ( prevOrCurrentTerm === 0){

    }
  }
  getImageURLsetInHTML(indexImageSource: number, individualImageIndex: number){
    this.imageSources[indexImageSource] =
        this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[individualImageIndex]]).ref.get();
    console.log(this.imageSources[indexImageSource],individualImageIndex);
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
    const boxOneValue = this.boxOne.controls.option.value;
    const boxTwoValue = this.boxTwo.controls.option.value;
    const boxThreeValue = this.boxThree.controls.option.value;
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
