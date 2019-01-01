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
  valuesInitialized : boolean;
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

  loadingImage;

  constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore,private cdRef: ChangeDetectorRef) {
    this.valuesInitialized = false;
    this.imageNames = {};
    this.imageNames[4]="startingvalue";
    this.numImages = 0;
    console.log(this.imageNames.size);
    this.imageKeysSorted = [];
    this.imageIndex = 0;
    this.imagesFinished = false;
    this.loadingImage ='https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0';
    this.imageSources = [{downloadURL:'https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0'},
      {downloadURL:'https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0'},
      {downloadURL:'https://firebasestorage.googleapis.com/v0/b/ersp-identification.appspot.com/o/loadImage.jpeg?alt=media&token=1959fc01-66bc-4b57-b64d-37c5dc19d0e0'}];
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
    console.log(this.numImages);
    console.log(this.imageNames, this.imageKeysSorted);
    this.imageIndex = 0;
    console.log(this.imageNames[this.imageKeysSorted[0]]);
    console.log(this.imageNames[this.imageKeysSorted[1]]);
    console.log(this.imageNames[this.imageKeysSorted[2]]);
    this.getImageURLsetInHTML(0, this.imageIndex);
    this.getImageURLsetInHTML(1, this.imageIndex + 1);
    this.getImageURLsetInHTML(2, this.imageIndex + 2);
    this.valuesInitialized = true;
  }

  getImageURLsetInHTML(indexImageSource: number, individualImageIndex: number){
    this.imageSources[indexImageSource] =
        this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[individualImageIndex]]).ref.get();
    console.log(this.imageSources[indexImageSource],individualImageIndex);
  }
  // TODO DO THESE CASES ALSO WORK IF THE FIRST QUESTION IS IGNORE
  async nextImage() {
    if((this.numImages - this.imageIndex) <= 3 ){
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
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex]]).update(imageObjOne);

      const imageObjTwo = {};
      imageObjTwo["grouping"] = boxTwoValue;
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
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex]]).update(imageObjOne);

      const imageObjTwo = {};
      imageObjTwo["grouping"] = boxTwoValue;
      await this.db.collection('images').doc(this.imageNames[this.imageKeysSorted[this.imageIndex+1]]).update(imageObjTwo);

      const imageObjThree = {}
      imageObjThree["grouping"] = boxThreeValue;
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
    return this.generalInfo.allImages;
  }

}
