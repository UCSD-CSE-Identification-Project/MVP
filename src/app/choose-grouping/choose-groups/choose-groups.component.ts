import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import { AuthService, termData } from 'src/app/core/auth.service';
import {AngularFirestore} from '@angular/fire/firestore';
import { getCurrentDebugContext } from '@angular/core/src/view/services';
import {isLowerCase} from 'tslint/lib/utils';
import {group} from '@angular/animations';
import {forkJoin} from 'rxjs';
// import 'rxjs/add/operator/toPromise';

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
  startingIndex:number = 0;
  doesNotNeedImageIndex = 0;
  partOfTheSameSubPair;


  constructor(private fb: FormBuilder,
              private generalInfo: UserTermImageInformationService,
              private authService: AuthService,
              private db: AngularFirestore
              ) {
    this.imagesFinished = false;
    this.partOfTheSameSubPair  = {};
  }

  ngOnInit() {
    // Everytime we get data from sessionStorage
    // let data:termData = this.authService.getStorage("session");
    // this.generalInfo.prevTerm = data.prevTermInfo;
    // this.generalInfo.currTerm = data.currTermInfo;
    // this.startingIndex = data.imageIndex;


    console.log(this.generalInfo.prevTermAllImages);
    console.log(this.generalInfo.currTermAllImages);
    // Initialize the "relation" for all three boxes
    this.boxOneRelation = this.createBoxObj(this.doesNotNeedImageIndex);
    this.boxOne = this.createBoxObj(0);
    this.boxTwoRelation = this.createBoxObj(this.doesNotNeedImageIndex);
    this.boxTwo = this.createBoxObj(1);
    this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);
    this.boxThree = this.createBoxObj(2);

    this.prevTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.prevTermAllImages, this.generalInfo.prevTermLoadedFromDatabase);
    this.currTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.currTermAllImages, this.generalInfo.currTermLoadedFromDatabase);
    // this.setResetTermFinishVariables('curr');

    this.prevTermGrouping.needGrouping = !this.generalInfo.prevTermFinished;
    this.prevTermGrouping.imageFinishedGrouping = this.generalInfo.prevTermFinished;
    console.log("prev term finished: " + this.generalInfo.prevTermFinished);
    console.log("prev term needGrouping: " + this.prevTermGrouping.needGrouping);

    if( this.prevTermGrouping.needGrouping ){
      this.getImageURLsetInHTML(0,this.prevTermGrouping.imageKeysSorted[0],'prev' );
      this.getImageURLsetInHTML(1,this.prevTermGrouping.imageKeysSorted[1],'prev');
      this.getImageURLsetInHTML(2,this.prevTermGrouping.imageKeysSorted[2],'prev');
      this.prevTermGrouping.imageIndex = 2;
    }
    else{
      this.getImageURLsetInHTML(0,this.currTermGrouping.imageKeysSorted[0],'curr');
      this.getImageURLsetInHTML(1,this.currTermGrouping.imageKeysSorted[1],'curr');
      this.getImageURLsetInHTML(2,this.currTermGrouping.imageKeysSorted[2],'curr');
      this.currTermGrouping.imageIndex = 2;
    }
  }

  createBoxObj(imageIndex: number) {
    return {
      boxVal: this.fb.group({
        option: [''],
      }),
      radioClicked: false,
      disabledRadioButton: false,
      imageSourceURL: null,
      imgIndex: imageIndex,
    };
  }

  // imgNames type object
  createChooseGroupingTermObject(imgNames, loadedFromDatabase: boolean){
    let obj =  {
      imageNames: {},
      imageIndex: 0,
      imageKeysSorted: [],
      termFinishedAnswering: false,
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
    console.log("inside set and reset");

    if ( prevOrCurrentTerm === 'prev'){
      this.prevTermGrouping.imageFinishedGrouping = true;
      this.prevTermGrouping.needGrouping = false;
      this.generalInfo.prevTermFinished = true;
      this.prevTermGrouping.termFinishedAnswering = true;
      // Initialize the "relation" for all three boxes
      this.boxOneRelation = this.createBoxObj(this.doesNotNeedImageIndex);
      this.boxOne = this.createBoxObj(0);
      this.boxTwoRelation = this.createBoxObj(this.doesNotNeedImageIndex);
      this.boxTwo = this.createBoxObj(1);
      this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);
      this.boxThree = this.createBoxObj(2);

      this.getImageURLsetInHTML(0,this.currTermGrouping.imageKeysSorted[0],'curr');
      this.getImageURLsetInHTML(1,this.currTermGrouping.imageKeysSorted[1],'curr');
      this.getImageURLsetInHTML(2,this.currTermGrouping.imageKeysSorted[2],'curr');
      this.currTermGrouping.imageIndex = 2;
      // todo come back here
      let termObj = {
        all_images: {},
        ind_images: {},
        group_images: {},
        iso_images: {},
        key_images:{},
        class_data: {},
        results: ''
      };

      termObj.all_images = this.generalInfo.prevTermAllImages;
      termObj.ind_images = this.generalInfo.prevTermIndividualImages;
      termObj.group_images = this.generalInfo.prevTermGroupImages;
      termObj.iso_images = this.generalInfo.prevTermIsoImages;
      termObj.key_images = this.generalInfo.prevTermKeyImages;


      this.db.collection('terms').doc(this.generalInfo.prevTermIdVal).ref.set(termObj).then((val)=>{
        console.log("prevTerm: " + val);
      });
    } else{
      this.currTermGrouping.imageFinishedGrouping = true;
      this.currTermGrouping.needGrouping = false;
      this.generalInfo.currTermFinished = true;

      this.currTermGrouping.termFinishedAnswering = true;
      this.imagesFinished = true;
      let termObj =
        {
          all_images: {},
          ind_images: {},
          group_images: {},
          iso_images: {},
          key_images:{},
          class_data: {},
          results: ''
        };

      //   {
      //   all_images: this.generalInfo.currTermAllImages,
      //   ind_images: this.generalInfo.currTermIndividualImages,
      //   group_images: this.generalInfo.currTermGroupImages,
      //   iso_images: this.generalInfo.currTermIsoImages,
      //   key_images: this.generalInfo.currTermKeyImages,
      //   class_data: {},
      //   results: ''
      // };
      termObj.all_images = this.generalInfo.currTermAllImages;
      termObj.ind_images = this.generalInfo.currTermIndividualImages;
      termObj.group_images = this.generalInfo.currTermGroupImages;
      termObj.iso_images = this.generalInfo.currTermIsoImages;
      termObj.key_images = this.generalInfo.currTermKeyImages,

      this.db.collection('terms').doc(this.generalInfo.currTermIdVal).ref.set(termObj).then((val)=>{
        console.log("currTerm: " + val);
      });
      this.imagesFinished = true;

      // all non ignored images need to find matches
      // let keyImages = Object.assign({}, this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermGroupImages, this.generalInfo.prevTermIsoImages);
      // keyImages = Object.values(keyImages);
      // console.log(keyImages);
      // let allPromises = [];
      // var t0 = performance.now();
      // for ( let key of keyImages ){
      //   console.log(key);
      //   console.log(typeof key);
      //   allPromises.push(this.generalInfo.makeSingleRequest(""+key));
      // }
      // // Promise.all(allPromises).then(value=>{
      // forkJoin(allPromises).subscribe(value=>{
      //   console.log(value + " finished all values");
      //   var t1 = performance.now();
      //   console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
      //   this.imagesFinished = true;
      // });
      // var t1 = performance.now();
      // console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
      // this.generalInfo.makePostRequest();

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
    switch (picIndex) {
      case 0:
        console.log("Into removeIgnore for boxOne");
        //Move boxTwo to boxOne
        this.boxOne = this.boxTwo;
        this.boxOneRelation = this.boxTwoRelation;
        this.boxOne.disabledRadioButton = true;
        this.boxOneRelation.disabledRadioButton = true;
        // Move boxThree to boxTwo
        this.boxTwo = this.boxThree;
        this.boxTwoRelation = this.boxThreeRelation;
        this.boxTwo.disabledRadioButton = true;
        this.boxTwoRelation.disabledRadioButton = true;

        // Clear boxThree
        this.boxThree = this.createBoxObj(termObjGrouping.imageIndex + 1);
        this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);

        // Get the next picture
        if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
        }
        // Move forward one place
        termObjGrouping.imageIndex += 1;

        // If boxOne is still ignore, recursively call removeIgnore on box one
        if (this.boxOne.boxVal.controls.option.value === 'Ignore'){
          this.removeIgnore(0, prevOrCurrentTerm);
        }
        // If boxTwo is still ignore, recursively call removeIgnore on box two
        else if (this.boxTwo.boxVal.controls.option.value === 'Ignore'){
          this.removeIgnore(1, prevOrCurrentTerm);
        }
        break;
      case 1:
        console.log("Into removeIgnore for boxTwo");

        this.boxOne.disabledRadioButton = true;
        this.boxOneRelation.disabledRadioButton = true;

        //Move box three to box two
        this.boxTwo = this.boxThree;
        this.boxTwoRelation = this.boxThreeRelation;
        this.boxTwo.disabledRadioButton = true;
        this.boxTwoRelation.disabledRadioButton = true;
        //Clear box three
        this.boxThree = this.createBoxObj(termObjGrouping.imageIndex + 1);
        this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);

        // Get the next picture
        if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
        }
        // Move forward one place
        termObjGrouping.imageIndex += 1;

        // If boxTwo is still ignore, recursively call removeIgnore on box one
        if (this.boxTwo.boxVal.controls.option.value === 'Ignore'){
          this.removeIgnore(1, prevOrCurrentTerm);
        }
        break;
      case 2:
        console.log("Into removeIgnore for boxThree");
        this.boxOne.disabledRadioButton = true;
        this.boxOneRelation.disabledRadioButton = true;
        this.boxTwo.disabledRadioButton = true;
        this.boxTwoRelation.disabledRadioButton = true;

        //Clear box three
        this.boxThree = this.createBoxObj(termObjGrouping.imageIndex + 1);
        this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);
        // Move forward one place
        termObjGrouping.imageIndex += 1;
        // Get the next picture
        if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
        }
        termObjGrouping.imageIndex += 1;
        break;

      default:
        break;
    }
  }


  async pushSubGroupToFirestore ( prevOrCurrentTerm: string, imgIndexToPush: number) {
    let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping : this.currTermGrouping;

    const imgToPush = termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[imgIndexToPush]];
    // also saving object locally
    if( prevOrCurrentTerm === 'prev'){
      this.generalInfo.saveKeyImageToPrevTerm(imgToPush, this.partOfTheSameSubPair);
    } else {
      this.generalInfo.saveKeyImageToCurrTerm(imgToPush, this.partOfTheSameSubPair);
    }
    // different scenarios
    await this.db.collection('images')
      .doc(imgToPush)
      .set({imagesInGroup: this.partOfTheSameSubPair },{merge: true});
  }

  async pushImageObjectToFirestore( prevOrCurrentTerm: string, boxVal: string, imageIndex: number ){
    let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    const imageObj = {};
    imageObj["grouping"] = boxVal;
    await this.db.collection('images')
      .doc(termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[imageIndex]]).update(imageObj);
  }

  addGroupingToGenInfo( prevOrCurrentTerm: string,  grouping: string, imageIndex: number ){
    const termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping: this.currTermGrouping;
    const imgName = termObjGrouping.imageKeysSorted[imageIndex];
    const imgId = termObjGrouping.imageNames[imgName];

    if( prevOrCurrentTerm === 'prev'){
      switch (grouping){

        case 'Individual':
          this.generalInfo.saveImageToPrevIndImages(imgName,imgId);
          break;
        case 'Group':
          this.generalInfo.saveImageToPrevGroupImages(imgName,imgId);
          break;
        case 'Isomorphic':
          this.generalInfo.saveImageToPrevIsoImages(imgName, imgId);
          break;
      }
    } else {
      switch (grouping){

        case 'Individual':
          this.generalInfo.saveImageToCurrIndImages(imgName,imgId);
          break;
        case 'Group':
          this.generalInfo.saveImageToCurrGroupImages(imgName,imgId);
          break;
        case 'Isomorphic':
          this.generalInfo.saveImageToCurrIsoImages(imgName, imgId);
          break;
      }
    }
  }


  // TODO DO THESE CASES ALSO WORK IF THE FIRST QUESTION IS IGNORE
  // this code was written under the assumption that you only shift by two images
  async nextImage(prevOrCurrentTerm: string) {
    let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping : this.currTermGrouping;

    // different scenarios
    const boxOneValue = this.boxOne.boxVal.controls.option.value;
    const boxTwoValue = this.boxTwo.boxVal.controls.option.value;
    const boxThreeValue = this.boxThree.boxVal.controls.option.value;

    const boxOneRValue = this.boxOneRelation.boxVal.controls.option.value;
    const boxTwoRValue = this.boxTwoRelation.boxVal.controls.option.value;
    const boxThreeRValue = this.boxThreeRelation.boxVal.controls.option.value;

    // if there are any ignore, remove all ignores
    if ( boxOneValue === 'Ignore' ||  boxTwoValue === 'Ignore' || boxThreeValue === 'Ignore') {
      console.log("inside ignore ");
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

      if ( this.boxOne.imgIndex >= termObjGrouping.numImages - 1 ){
        this.setResetTermFinishVariables(prevOrCurrentTerm);
      }
    }
    else if ( termObjGrouping.imageIndex >= termObjGrouping.numImages - 1) {
      console.log("in last iteration");
      let lastQuestionToPush = this.boxOne;
      // todo this section was written under the assumption that there will be more than one picture shown on teh screen at any given point
      // todo finish this section
      if ( this.boxOne.imgIndex < termObjGrouping.numImages ) {
        this.addGroupingToGenInfo(prevOrCurrentTerm, boxOneValue, this.boxOne.imageIndex);
        await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxOneValue, this.boxOne.imgIndex);
        // groupedVal.push(this.boxOne.boxVal.controls.option.value);
      }
      if ( this.boxTwo.imgIndex < termObjGrouping.numImages ) {
        this.addGroupingToGenInfo(prevOrCurrentTerm, boxTwoValue, this.boxTwo.imgIndex);
        await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxTwoValue, this.boxTwo.imgIndex);
        if ( boxTwoValue === 'New Question' ){
          // push to firestore
          this.pushSubGroupToFirestore(prevOrCurrentTerm, lastQuestionToPush.imgIndex);
          this.partOfTheSameSubPair = {};
          lastQuestionToPush = this.boxTwo;
        } else{
          this.partOfTheSameSubPair[termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[this.boxTwo.imgIndex]]] = boxTwoValue;
        }
      }
      if ( this.boxThree.imgIndex < termObjGrouping.numImages ) {
        this.addGroupingToGenInfo(prevOrCurrentTerm, this.boxThree.boxVal.controls.option.value, this.boxThree.imgIndex);
        await this.pushImageObjectToFirestore(prevOrCurrentTerm, this.boxThree.boxVal.controls.option.value, this.boxThree.imgIndex);
        if( boxThreeValue === 'New Question') {
          // push last question to firestore and then push empty value to this last box
          this.pushSubGroupToFirestore(prevOrCurrentTerm, lastQuestionToPush.imgIndex);
          this.partOfTheSameSubPair = {};
          lastQuestionToPush = this.boxThree;
        } else {
          this.partOfTheSameSubPair[termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[this.boxThree.imgIndex]]] = boxThreeValue;
          // push this array to firestore using the last question pushed value
        }
      }

      this.pushSubGroupToFirestore(prevOrCurrentTerm,lastQuestionToPush.imgIndex);
      // push empty array to last box if it is a new question, if it is related then push the array to the right box
      this.setResetTermFinishVariables(prevOrCurrentTerm);
    }
    // If all three pictures are related, add two more pictures
    else if(boxTwoRValue=== 'Related Question' && boxThreeRValue === 'Related Question'){
      console.log("push two images");
      this.addGroupingToGenInfo(prevOrCurrentTerm, boxTwoValue, this.boxTwo.imgIndex );
      await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxTwoValue, this.boxTwo.imgIndex);

      this.addGroupingToGenInfo(prevOrCurrentTerm, boxThreeValue, this.boxThree.imgIndex);
      await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxThreeValue, this.boxThree.imgIndex);

      this.boxOne.disabledRadioButton = true;
      this.boxOneRelation.disabledRadioButton = true;
      this.partOfTheSameSubPair[termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[this.boxTwo.imgIndex]]] = boxTwoValue;
      this.partOfTheSameSubPair[termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[this.boxThree.imgIndex]]] = boxThreeValue;

      // Clear boxTwo
      this.boxTwo = this.createBoxObj(termObjGrouping.imageIndex + 1);
      this.boxTwoRelation = this.createBoxObj(this.doesNotNeedImageIndex);
      // Clear boxThree
      this.boxThree = this.createBoxObj(termObjGrouping.imageIndex + 2);
      this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);

      // Get two more pictures and put them in boxTwo and boxThree
      if(termObjGrouping.imageIndex + 1 < termObjGrouping.numImages ){
        this.getImageURLsetInHTML(1, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
      }
      if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
        this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
      }
      // Move forward two places
      termObjGrouping.imageIndex += 2;
      console.log("Current image index is ");
      console.log(termObjGrouping.imageIndex);
    }

    //Else shift the rightmost new to the boxOne, add pictures accordingly
    else{
      console.log("in else statement");
      // If the box three is new
      if(boxThreeRValue === 'New Question' ){

        this.addGroupingToGenInfo(prevOrCurrentTerm, boxOneValue, this.boxOne.imgIndex);
        await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxOneValue, this.boxOne.imgIndex);

        this.addGroupingToGenInfo(prevOrCurrentTerm, boxTwoValue, this.boxTwo.imgIndex);
        await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxTwoValue, this.boxTwo.imgIndex);

        // todo
        if ( boxTwoRValue === 'New Question' ){
          // push the pair same grouping and an empty value for the second box
          await this.pushSubGroupToFirestore(prevOrCurrentTerm, this.boxOne.imgIndex);
          this.partOfTheSameSubPair = {};
          await this.pushSubGroupToFirestore(prevOrCurrentTerm,this.boxTwo.imgIndex);
        } else {
          // add teh second box to the object array and then push
          this.partOfTheSameSubPair[termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[this.boxTwo.imgIndex]]] = boxTwoValue;
          await this.pushSubGroupToFirestore(prevOrCurrentTerm, this.boxOne.imgIndex);
        }

        // Move boxThree to boxOne
        this.boxOne = this.boxThree;
        this.boxOneRelation = this.boxThreeRelation;
        this.boxOne.disabledRadioButton = true;
        this.boxOneRelation.disabledRadioButton = true;
        // Clear boxTwo
        this.boxTwo = this.createBoxObj(termObjGrouping.imageIndex + 1);
        this.boxTwoRelation = this.createBoxObj(this.doesNotNeedImageIndex);
        // Clear boxThree
        this.boxThree = this.createBoxObj(termObjGrouping.imageIndex + 2);
        this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);
        // Get two more pictures and put them in boxTwo and boxThree
        if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(1, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1],prevOrCurrentTerm);
        }
        if ( termObjGrouping.imageIndex + 2 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 2], prevOrCurrentTerm);
        }
        // Move forward two places
        termObjGrouping.imageIndex += 2;
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);
      }

      // If the box Two is new
      else{

        this.addGroupingToGenInfo(prevOrCurrentTerm, boxOneValue, this.boxOne.imgIndex);
        await this.pushImageObjectToFirestore(prevOrCurrentTerm, boxOneValue, this.boxOne.imgIndex);

        // todo push the object array to firestore with teh first object as the key and thats it
        this.pushSubGroupToFirestore(prevOrCurrentTerm, this.boxOne.imgIndex);

        this.boxOne = this.boxTwo;
        this.boxOneRelation = this.boxTwoRelation;
        this.boxOne.disabledRadioButton = true;
        this.boxOneRelation.disabledRadioButton = true;

        this.boxTwo = this.boxThree;
        this.boxTwoRelation = this.boxThreeRelation;
        this.boxTwo.disabledRadioButton = true;
        this.boxTwoRelation.disabledRadioButton = true;

        this.boxThree = this.createBoxObj(termObjGrouping.imageIndex + 1);
        this.boxThreeRelation = this.createBoxObj(this.doesNotNeedImageIndex);
        // Get one more picture and put it boxThree
        if ( termObjGrouping.imageIndex + 1 < termObjGrouping.numImages){
          this.getImageURLsetInHTML(2, termObjGrouping.imageKeysSorted[termObjGrouping.imageIndex + 1], prevOrCurrentTerm);
        }
        // Move forward one place
        termObjGrouping.imageIndex += 1;
        console.log("Current image index is ");
        console.log(termObjGrouping.imageIndex);

      }

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
    const boxTwoHidden = this.boxTwo.imgIndex >= termObjGrouping.numImages;
    const boxThreeHidden = this.boxThree.imgIndex >= termObjGrouping.numImages;

    return this.boxOne.radioClicked &&
          (this.boxTwo.radioClicked|| boxTwoHidden) &&
          (this.boxThree.radioClicked || boxThreeHidden) &&
          this.boxOneRelation.radioClicked &&
          (this.boxTwoRelation.radioClicked|| boxTwoHidden) &&
          (this.boxThreeRelation.radioClicked|| boxThreeHidden);

  }

  logout() {
    let index = this.prevTermGrouping.needGrouping ? this.prevTermGrouping.imageIndex : this.currTermGrouping.imageIndex
    let object: termData = {
      logoutUrl: "/choose-grouping",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: index
    };
    this.authService.setStorage("local", object);

    this.authService.logout('/choose-grouping', [this.generalInfo.prevTerm, this.generalInfo.currTerm], index);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    let object: termData = {
      logoutUrl: "/choose-grouping",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.prevTermGrouping.needGrouping ? this.prevTermGrouping.imageIndex : this.currTermGrouping.imageIndex
    };
    this.authService.setStorage("session", object);
    this.authService.unloadNotification(event);
  }

}
