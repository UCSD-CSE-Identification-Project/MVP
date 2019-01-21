import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
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
  prevTermGrouping;
  currTermGrouping;
  boxOne;
  boxTwo;
  boxThree;

  constructor(private fb: FormBuilder,
              private generalInfo: UserTermImageInformationService,
              private db: AngularFirestore) {
    this.imagesFinished = false;
  }

  ngOnInit() {
    console.log(this.generalInfo.prevTermAllImages);
    console.log(this.generalInfo.currTermAllImages);
    this.boxOne = this.createBoxObj();
    this.boxTwo = this.createBoxObj();
    this.boxThree = this.createBoxObj();

    this.prevTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.prevTermAllImages,this.generalInfo.prevTermLoadedFromDatabase);
    this.currTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.currTermAllImages, this.generalInfo.currTermLoadedFromDatabase);

    if( this.prevTermGrouping.needGrouping ){
      this.getImageURLsetInHTML(0,this.prevTermGrouping.imageKeysSorted[0],'prev' );
      this.getImageURLsetInHTML(1,this.prevTermGrouping.imageKeysSorted[1],'prev');
      this.getImageURLsetInHTML(2,this.prevTermGrouping.imageKeysSorted[2],'prev');
    }
    else{
      this.getImageURLsetInHTML(0,this.currTermGrouping.imageKeysSorted[0],'curr');
      this.getImageURLsetInHTML(1,this.currTermGrouping.imageKeysSorted[1],'curr');
      this.getImageURLsetInHTML(2,this.currTermGrouping.imageKeysSorted[2],'curr');
    }

    console.log(this.prevTermGrouping.imageKeysSorted);
    console.log(this.currTermGrouping.imageKeysSorted);


  }

  createBoxObj() {
    return {
      boxVal: this.fb.group({
        option: [''],
      }),
      radioClicked: false,
      disabledRadioButton: false,
      imageSourceURL: null,
    };
  }

  // imgNames type object
  createChooseGroupingTermObject(imgNames, loadedFromDatabase: boolean){
    let obj =  {
      imageNames: {},
      imageIndex: 0,
      imageKeysSorted: [],
      imageFinishedGrouping: false,
      needGrouping: true,
      numImages: 0,
    };

    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a, b) => a.localeCompare(b));
    obj.needGrouping = !loadedFromDatabase;
    obj.numImages = obj.imageKeysSorted.length;
    return obj;
  }
  // TODO
  // reset variables when second term is done
  setResetTermFinishVariables(prevOrCurrentTerm: string){
    if ( prevOrCurrentTerm === 'prev'){
      this.prevTermGrouping.imageFinishedGrouping = true;
      this.boxOne = this.createBoxObj();
      this.boxTwo = this.createBoxObj();
      this.boxThree = this.createBoxObj();
      this.getImageURLsetInHTML(0,this.currTermGrouping.imageKeysSorted[0],'curr');
      this.getImageURLsetInHTML(1,this.currTermGrouping.imageKeysSorted[1],'curr');
      this.getImageURLsetInHTML(2,this.currTermGrouping.imageKeysSorted[2],'curr');
    } else{
      this.currTermGrouping.imageFinishedGrouping = true;
      this.imagesFinished = true;
    }
  }
  getImageURLsetInHTML(indexImageSource: number, imageKey: string, prevOrCurr: string){
    let url = prevOrCurr === "prev" ?
      this.db.collection('images').doc(this.prevTermGrouping.imageNames[imageKey]).ref.get() :
      this.db.collection('images').doc(this.currTermGrouping.imageNames[imageKey]).ref.get();
   if(indexImageSource === 0){
     this.boxOne.imageSourceURL = url;
   } else if( indexImageSource === 1){
     this.boxTwo.imageSourceURL = url;
   } else{
     this.boxThree.imageSourceURL = url;
   }
  }

  pushBoxValToIndGroupIsoServiceList( numBoxes: number){
    if(numBoxes <=1 ){

    }
    if(numBoxes <=2 ){

    }
    if(numBoxes <=3 ){
      this.boxThree.boxVal.controls.option.value
    }
  }

  pushBoxValToIndServiceList(){

  }
  pushBoxValToGroupServiceList(){}
  pushBoxValToIsoServiceList(){}
  /*
   * numBoxesPushed is the number of boxes that will be added to the firestore database
   * at the time the next button is clicked
   */
  addGroupedToIndImages(numBoxesPushed: number, prevOrCurrentTerm: string){
    let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    // different scenarios
    const boxOneValue = this.boxOne.boxVal.controls.option.value;
    const boxTwoValue = this.boxTwo.boxVal.controls.option.value;
    const boxThreeValue = this.boxThree.boxVal.controls.option.value;

    if (boxOneValue === 'Ignore') { // todo will not work for the case of ignore ind ind
      return;
    }
    if(numBoxesPushed === 3){
      const boxTwoImageIdVal = termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+1]];
      const boxThreeImageIdVal = termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+2]];
      let imagesInGroupObj = {};
      imagesInGroupObj[boxTwoValue] = boxTwoImageIdVal;
      imagesInGroupObj[boxThreeValue] = boxThreeImageIdVal;
      this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]])
        .set({imagesInGroup: imagesInGroupObj}, {merge: true});
    } else if ( numBoxesPushed === 2) {   // todo will there be the case ind ignore group or ignore group ind
      const boxTwoImageIdVal = termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+1]];
      let imagesInGroupObj = {};
      imagesInGroupObj[boxTwoValue] = boxTwoImageIdVal;
      this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]])
        .set({imagesInGroup: imagesInGroupObj}, {merge: true});
    } else {
      this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]])
        .set({imagesInGroup: {}},{merge: true});
    }
  }
  // TODO DO THESE CASES ALSO WORK IF THE FIRST QUESTION IS IGNORE
  async nextImage(prevOrCurrentTerm: string) {
    let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    let numImagesLeft = termObjGrouping.numImages - termObjGrouping.imageIndex;
    if ( numImagesLeft <= 3 ) {
      if( numImagesLeft === 0 ){
        this.setResetTermFinishVariables(prevOrCurrentTerm);
        return;
      }
      if( numImagesLeft === 3 ) {
        const imageObj = {};
        imageObj["grouping"] =  this.boxThree.boxVal.controls.option.value;
        await this.db.collection('images')
          .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2]]).update(imageObj);
      }
      if(numImagesLeft === 2 ) {
        const imageObj = {};
        imageObj["grouping"] = this.boxTwo.boxVal.controls.option.value;
        await this.db.collection('images')
          .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1]]).update(imageObj);
      }
      if ( numImagesLeft === 1 ){
        const imageObj = {};
        imageObj["grouping"] = this.boxOne.boxVal.controls.option.value;
        await this.db.collection('images')
          .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]).update(imageObj);
      }
      this.setResetTermFinishVariables(prevOrCurrentTerm);
      return;
    }
    // different scenarios
    const boxOneValue = this.boxOne.boxVal.controls.option.value;
    const boxTwoValue = this.boxTwo.boxVal.controls.option.value;
    const boxThreeValue = this.boxThree.boxVal.controls.option.value;
    if ( boxTwoValue === 'Individual' && ( boxThreeValue === 'Group' || boxThreeValue === 'Isomorphic') ){
      const imageObj = {};
      imageObj["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]).update(imageObj);
      termObjGrouping.imageIndex += 1;

      this.boxOne = this.boxTwo;
      this.boxTwo = this.boxThree;

      this.boxOne.disabledRadioButton = true;
      this.boxTwo.disabledRadioButton = true;

      this.boxThree = this.createBoxObj();
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
    }
    else if( ( boxTwoValue !== 'Individual' && boxThreeValue === 'Individual') ||
             ( boxTwoValue === 'Individual' && boxThreeValue === 'Individual') ) {
      const imageObjOne = {};
      imageObjOne["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]).update(imageObjOne);

      const imageObjTwo = {};
      imageObjTwo["grouping"] = boxTwoValue;
      if ( boxTwoValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm,termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+1]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+1]]).update(imageObjTwo);
      termObjGrouping.imageIndex += 2;

      this.boxOne = this.boxThree;
      this.boxOne.disabledRadioButton = true;

      this.boxTwo = this.createBoxObj();
      this.boxThree = this.createBoxObj();


      if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(1, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1],prevOrCurrentTerm);
      }
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
    }
    else{
      const imageObjOne = {};
      imageObjOne["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]).update(imageObjOne);

      const imageObjTwo = {};
      imageObjTwo["grouping"] = boxTwoValue;
      if ( boxTwoValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm,termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+1]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+1]]).update(imageObjTwo);

      const imageObjThree = {};
      imageObjThree["grouping"] = boxThreeValue;
      if ( boxThreeValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+2]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex+2]]).update(imageObjThree);
      termObjGrouping.imageIndex += 3;

      this.boxOne = this.createBoxObj();
      this.boxTwo = this.createBoxObj();
      this.boxThree = this.createBoxObj();
      if(termObjGrouping.imageIndex < termObjGrouping.numImages ){
        this.getImageURLsetInHTML(0, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex], prevOrCurrentTerm);
      }
      if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(1, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
      }
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
    }
  }
  addImageToPreviousOrCurrentTermIndGroupIsoImages( prevOrCurTerm: string, imageIndex: string) {
    if( prevOrCurTerm === 'prev') {
      this.generalInfo.saveImageToPrevIndImages(imageId);
    } else {
      this.generalInfo.saveImageToCurrIndImages(imageId);
    }
  }
  updateChecked(boxNum: number){
    // if(this.boxOne.controls.option)
    if( boxNum === 1 ){
      this.boxOne.radioClicked = true;
    }
    else if( boxNum === 2 ){
      this.boxTwo.radioClicked = true;
    }
    else if( boxNum === 3 ){
      this.boxThree.radioClicked = true;
    }
  }

  // checkes if all the images are checked or if the unchecked ones are hidden
  allChecked(prevOrCurrent: string){
    let termObjGrouping = prevOrCurrent === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    const boxTwoHidden = termObjGrouping.imageIndex+2 >= termObjGrouping.numImages;
    const boxThreeHidden = termObjGrouping.imageIndex+3 >= termObjGrouping.numImages;

    return this.boxOne.radioClicked &&
          (this.boxTwo.radioClicked|| boxTwoHidden) &&
          (this.boxThree.radioClicked || boxThreeHidden);

  }

}
