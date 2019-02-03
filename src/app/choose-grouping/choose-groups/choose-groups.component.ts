import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {AngularFirestore} from '@angular/fire/firestore';
import { getCurrentDebugContext } from '@angular/core/src/view/services';

@Component({
  selector: 'app-choose-groups',
  templateUrl: './choose-groups.component.html',
  styleUrls: ['./choose-groups.component.css']
})
export class ChooseGroupsComponent implements OnInit {
  // Added the property "Relation with previous image"
  relationToPreImg = [{opt: 'Related Question'}, {opt: 'New Question'}];
  boxValues = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Isomorphic'}, {opt: 'Ignore'}];
  imagesFinished; // if we finish reading all the images
  prevTermGrouping;
  currTermGrouping;
  // Added addition box for each boxes to indicate relation
  boxOneRelation;
  boxOne;
  boxTwoRelation;
  boxTwo;
  boxThreeRelation;
  boxThree;

  constructor(private fb: FormBuilder,
              private generalInfo: UserTermImageInformationService,
              private db: AngularFirestore) {
    this.imagesFinished = false;
  }

  ngOnInit() {
    console.log(this.generalInfo.prevTermAllImages);
    console.log(this.generalInfo.currTermAllImages);
    // Initialize the "relation" for all three boxes
    this.boxOneRelation = this.createBoxObj();
    this.boxOne = this.createBoxObj();
    this.boxTwoRelation = this.createBoxObj();
    this.boxTwo = this.createBoxObj();
    this.boxThreeRelation = this.createBoxObj();
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
      //relationClicked: false,
      radioClicked: false,
      //disabledRelationButton: false,
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
      // Initialize the "relation" for all three boxes
      this.boxOneRelation = this.createBoxObj();
      this.boxOne = this.createBoxObj();
      this.boxTwoRelation = this.createBoxObj();
      this.boxTwo = this.createBoxObj();
      this.boxThreeRelation = this.createBoxObj();
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

  // Remove picture at index "picIndex"
  // 0: boxOne
  // 1: boxTwo
  // 2: boxThree
  removeIgnore(picIndex: number, prevOrCurrentTerm: string){
    console.log("Into removeIgnore function");
    // Determine whether it's current term or previous term
    let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    // If boxOne is ignore
    if (picIndex === 0){
      console.log("Into removeIgnore for boxOne");
      //Move boxTwo to boxOne
      this.boxOne = this.boxTwo;
      this.boxOneRelation = this.boxTwoRelation;
      // Move boxThree to boxOne
      this.boxTwo = this.boxThree;
      this.boxTwoRelation = this.boxThreeRelation;
      // Clear boxThree
      this.boxThree = this.createBoxObj();
      this.boxThreeRelation = this.createBoxObj();
      // Move forward one place
      termObjGrouping.imageIndex += 1;
      // Get the next picture
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
      // If boxOne is still ignore, recursively call removeIgnore on box one
      if (this.boxOne.boxVal.controls.option.value === 'Ignore'){
        this.removeIgnore(0, prevOrCurrentTerm);
      }
      // If boxTwo is still ignore, recursively call removeIgnore on box two
      else if (this.boxTwo.boxVal.controls.option.value === 'Ignore'){
        this.removeIgnore(1, prevOrCurrentTerm);
      }
    }
    // Else if boxOne is ignore
    else if (picIndex === 1){
      console.log("Into removeIgnore for boxTwo");
      //Move box three to box two
      this.boxTwo = this.boxThree;
      this.boxTwoRelation = this.boxThreeRelation;
      //Clear box three
      this.boxThree = this.createBoxObj();
      this.boxThreeRelation = this.createBoxObj();
      // Move forward one place
      termObjGrouping.imageIndex += 1;
      // Get the next picture
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
      // If boxOne is still ignore, recursively call removeIgnore on box one
      if (this.boxTwo.boxVal.controls.option.value === 'Ignore'){
        this.removeIgnore(1, prevOrCurrentTerm);
      }
    } 
    // Else box three is ignore
    else{
      console.log("Into removeIgnore for boxThree");
      //Clear box three
      this.boxThree = this.createBoxObj();
      this.boxThreeRelation = this.createBoxObj();
      // Move forward one place
      termObjGrouping.imageIndex += 1;
      // Get the next picture
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
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
      if( numImagesLeft == 3 ) {
        const imageObj = {};
        imageObj["grouping"] =  this.boxThree.boxVal.controls.option.value;
        await this.db.collection('images')
          .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2]]).update(imageObj);
      }
      if(numImagesLeft == 2 ) {
        const imageObj = {};
        imageObj["grouping"] = this.boxTwo.boxVal.controls.option.value;
        await this.db.collection('images')
          .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1]]).update(imageObj);
      }
      if ( numImagesLeft == 1 ){
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

    const boxOneRValue = this.boxOneRelation.boxVal.controls.option.value;
    const boxTwoRValue = this.boxTwoRelation.boxVal.controls.option.value;
    const boxThreeRValue = this.boxThreeRelation.boxVal.controls.option.value;

    // if there are any ignore, remove all ignores
    if ( boxOneValue === 'Ignore' ||  boxTwoValue === 'Ignore' || boxThreeValue === 'Ignore') {
      if (boxOneValue === 'Ignore'){
        this.removeIgnore(0,prevOrCurrentTerm);
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);
      }
      else if (boxTwoValue === 'Ignore'){
        this.removeIgnore(1,prevOrCurrentTerm);
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);
      }
      else{
        this.removeIgnore(2,prevOrCurrentTerm);
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);
      }
    }
    // If all three pictures are related, add two more pictures
    else if(boxTwoRValue=== 'Related Question' && boxThreeRValue === 'Related Question'){
      // Clear boxTwo
      this.boxTwo = this.createBoxObj();
      this.boxTwoRelation = this.createBoxObj();
      // Clear boxThree
      this.boxThree = this.createBoxObj();
      this.boxThreeRelation = this.createBoxObj();
      // Move forward two places
      termObjGrouping.imageIndex += 2;
      console.log("Current image index is ");
      console.log(termObjGrouping.imageIndex);
      // Get two more pictures and put them in boxTwo and boxThree
      if(termObjGrouping.imageIndex + 1 < termObjGrouping.numImages ){
        this.getImageURLsetInHTML(1, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
      }
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
    }

    //Else shift the rightmost new to the boxOne, add pictures accordingly
    else{
      // If the box three is new 
      if(boxThreeRValue=== 'New Question' ){
        // Move boxThree to boxOne
        this.boxOne = this.boxThree;
        this.boxOneRelation = this.boxThreeRelation;
        // Clear boxTwo
        this.boxTwo = this.createBoxObj();
        this.boxTwoRelation = this.createBoxObj();
        // Clear boxThree
        this.boxThree = this.createBoxObj();
        this.boxThreeRelation = this.createBoxObj();
        // Move forward two places
        termObjGrouping.imageIndex += 2;
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);
        // Get two more pictures and put them in boxTwo and boxThree
        if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(1, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1],prevOrCurrentTerm);
        }
        if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
        }
      }

      // If the box Two is new
      else{
        this.boxOne = this.boxTwo;
        this.boxOneRelation = this.boxTwoRelation;

        this.boxTwo = this.boxThree;
        this.boxTwoRelation = this.boxThreeRelation;

        this.boxThree = this.createBoxObj();
        this.boxThreeRelation = this.createBoxObj();
        // Move forward one place
        termObjGrouping.imageIndex += 1;    
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);
        // Get one more picture and put it boxThree
        if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
        }

      }

    }
  
    /*
    // If box value two is ind, and box three is group or iso, shift last two boxes to the left
    if ( boxTwoValue === 'Individual' && ( boxThreeValue === 'Group' || boxThreeValue === 'Isomorphic') ){
      const imageObj = {};
      imageObj["grouping"] = boxOneValue;
      if ( boxOneValue === 'Individual'){
        this.addImageToPreviousOrCurrentTermIndImages(prevOrCurrentTerm, termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]);
      }
      await this.db.collection('images')
        .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex]]).update(imageObj);
      termObjGrouping.imageIndex += 1;

      // Keep the last two boxes answers
      this.boxOne = this.boxTwo;
      this.boxTwo = this.boxThree;

      // Disable first two boxes
      this.boxOne.disabledRadioButton = true;
      this.boxTwo.disabledRadioButton = true;

      // Clear the last box
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
    */
  }

  
  addImageToPreviousOrCurrentTermIndImages( prevOrCurTerm: string, imageId: string) {
    if( prevOrCurTerm === 'prev') {
      this.generalInfo.pushImageToPrevIndImages(imageId);
    } else {
      this.generalInfo.pushImageToCurrIndImages(imageId);
    }
  }
  updateChecked(boxNum: number){
    // if(this.boxOne.controls.option)
    if( boxNum === 10 ){
      this.boxOne.radioClicked = true;
    }
    else if (boxNum === 11){
      this.boxOneRelation.radioClicked = true;
    }
    else if( boxNum === 20 ){
      this.boxTwo.radioClicked = true;
    }
    else if( boxNum === 21 ){
      this.boxTwoRelation.radioClicked = true;
    }
    else if( boxNum === 30 ){
      this.boxThree.radioClicked = true;
    }
    else if( boxNum === 31 ){
      this.boxThreeRelation.radioClicked = true;
    }
  }

  // checkes if all the images are checked or if the unchecked ones are hidden
  allChecked(prevOrCurrent: string){
    let termObjGrouping = prevOrCurrent === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    const boxTwoHidden = termObjGrouping.imageIndex+2 >= termObjGrouping.numImages;
    const boxThreeHidden = termObjGrouping.imageIndex+3 >= termObjGrouping.numImages;

    return this.boxOne.radioClicked &&
          (this.boxTwo.radioClicked|| boxTwoHidden) &&
          (this.boxThree.radioClicked || boxThreeHidden) &&
          this.boxOneRelation.radioClicked &&
          (this.boxTwoRelation.radioClicked|| boxTwoHidden) &&
          (this.boxThreeRelation.radioClicked|| boxThreeHidden);

  }

}
