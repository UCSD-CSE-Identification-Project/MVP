import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import { AuthService, termData, groupLock } from 'src/app/core/auth.service';
import {AngularFirestore} from '@angular/fire/firestore';
import { getCurrentDebugContext } from '@angular/core/src/view/services';
import {isLowerCase} from 'tslint/lib/utils';
import {group} from '@angular/animations';
import {forkJoin} from 'rxjs';
// import 'rxjs/add/operator/toPromise';

interface chooseGroupingBoxObj {
  boxVal: any;
  radioClicked: boolean;
  disabledRadioButton: boolean;
  imageSourceURL: boolean;
  imgIndex: number;

}

interface chooseGroupingTermObj{
  imageNames: any;
  imageIndex: number;
  imageKeysSorted: any;
  termFinishedAnswering: boolean;
  needGrouping: boolean;
  numImages: number;
}
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
  lectureOnScreenBoxList = [];
  boxOne;
  boxTwo;
  boxThree;
  // startingIndex:number = 0;
  partOfTheSameSubPair;

  startingIndex: number = 0;
  boxLocked: boolean = false;
  savedIndex: number = 0;
  savedChoice: string = "";

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
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;

    let lock: groupLock = this.authService.getStorage("session", "groupLock");

    let box1Index = data.imageIndex;
    let box2Index = data.imageIndex + 1;
    let box3Index = data.imageIndex + 2;

    if (lock.boxLocked) {
      box1Index = lock.savedIndex;
      box2Index = data.imageIndex - 1;
      box3Index = data.imageIndex;
    }

    if (!lock.boxLocked && data.imageIndex === 2) {
      box1Index -= 2;
      box2Index -= 2;
      box3Index -= 2;
    }

    this.prevTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.prevTermAllImages, this.generalInfo.prevTermLoadedFromDatabase);
    this.currTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.currTermAllImages, this.generalInfo.currTermLoadedFromDatabase);

    // Initialize the "relation" for all three boxes
    this.boxOne = this.createBoxObj(box1Index);

    if (lock.boxLocked) {
      this.boxOne.disabledRadioButton = true;

      this.boxOne.boxVal.controls.option.value = lock.savedChoice;

      this.boxOne.radioClicked = true;

      this.boxLocked = true;
      this.savedIndex = this.boxOne.imgIndex;
      this.savedChoice = lock.savedChoice;
    }
    this.boxTwo = this.createBoxObj(box2Index);
    this.boxThree = this.createBoxObj(box3Index);
    this.prevTermGrouping.needGrouping = !data.usePrev && !this.generalInfo.prevTermFinished;

    // Comment this out before we merge
    this.prevTermGrouping.termFinishedAnswering = !this.prevTermGrouping.needGrouping;
    this.prevTermGrouping.imageFinishedGrouping = this.generalInfo.prevTermFinished;

    if( this.prevTermGrouping.needGrouping ){
    }
    else{
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
      lectureIndex: 0,
      lectureList: {},
      imageKeysSorted: [],
      termFinishedAnswering: false,
      needGrouping: true,
      numImages: 0,
    };

    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a, b) => a.localeCompare(b));
    obj.needGrouping = !loadedFromDatabase;
    obj.termFinishedAnswering = loadedFromDatabase;
    obj.numImages = obj.imageKeysSorted.length;
    obj.lectureIndex = 0;
    obj.lectureList = [obj.imageKeysSorted]; // write a method that will actually get all the lectures lists
    return obj;
  }

  populateLectureBoxList(lecInd: number, prevOrCurr: string) {
    this.lectureOnScreenBoxList = [];
    let allImgNameToKey = prevOrCurr === 'prev' ? this.prevTermGrouping.imageNames : this.currTermGrouping.imageNames;
    let lectureList = prevOrCurr === 'prev' ? this.prevTermGrouping.lectureList[lecInd] : this.currTermGrouping.lectureList[lecInd];
    let i;
    for( i = 0; i < lectureList.length; i++){
      this.lectureOnScreenBoxList.push(this.createBoxObj(i)); // todo come back here and put the correct image index
    }
    i = 0;
    //populate the image URL's
    for ( let imgName of lectureList ){
      this.lectureOnScreenBoxList[i].imageSourceURL = this.db.collection('images').doc(allImgNameToKey[imgName]).ref.get();
      i++;
    }
  }
  // TODO
  // reset variables when second term is done
  setResetTermFinishVariables(prevOrCurrentTerm: string){
    console.log("inside set and reset");

    if ( prevOrCurrentTerm === 'prev'){
      // this.prevTermGrouping.imageFinishedGrouping = true;
      this.prevTermGrouping.needGrouping = false;
      this.generalInfo.prevTermFinished = true;
      this.prevTermGrouping.termFinishedAnswering = true;
      // Initialize the "relation" for all three boxes
      this.boxOne = this.createBoxObj(0);
      this.boxTwo = this.createBoxObj(1);
      this.boxThree = this.createBoxObj(2);

      this.getImageURLsetInHTML(0,this.currTermGrouping.imageKeysSorted[0],'curr');
      this.getImageURLsetInHTML(1,this.currTermGrouping.imageKeysSorted[1],'curr');
      this.getImageURLsetInHTML(2,this.currTermGrouping.imageKeysSorted[2],'curr');
      this.partOfTheSameSubPair = {};
      this.currTermGrouping.imageIndex = 2;
      this.boxLocked = false;
      let termObj = {};
      termObj[`all_images`] = this.generalInfo.prevTermAllImages;
      termObj[`ind_images`] = this.generalInfo.prevTermIndividualImages;
      termObj[`group_images`] = this.generalInfo.prevTermGroupImages;
      termObj[`iso_images`] = this.generalInfo.prevTermIsoImages;
      termObj[`key_images`] = this.generalInfo.prevTermKeyImages;
      this.db.collection('terms').doc(this.generalInfo.prevTermIdVal).ref.set(termObj).then((val)=>{
        console.log("prevTerm: " + val);
      });
      console.log("in prev ");
      console.log(this.generalInfo.currTermIndividualImages);
    } else{
      // this.currTermGrouping.imageFinishedGrouping = true;
      this.currTermGrouping.needGrouping = false;
      this.generalInfo.currTermFinished = true;

      this.currTermGrouping.termFinishedAnswering = true;
      this.imagesFinished = true;
      console.log(this.generalInfo.currTermIndividualImages);
      let termObj = {};
      termObj[`all_images`] = this.generalInfo.currTermAllImages;
      termObj[`ind_images`] = this.generalInfo.currTermIndividualImages;
      termObj[`group_images`] = this.generalInfo.currTermGroupImages;
      termObj[`iso_images`] = this.generalInfo.currTermIsoImages;
      termObj[`key_images`] = this.generalInfo.currTermKeyImages;

      this.db.collection('terms').doc(this.generalInfo.currTermIdVal).ref.set(termObj).then((val)=>{
        console.log("currTerm: " + val);
      });
      this.generalInfo.makeSingleRequest();
      this.imagesFinished = true;
      console.log(this.generalInfo.prevTerm);
      console.log(this.generalInfo.currTerm);
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


  async pushSubGroupToFirestore ( prevOrCurrentTerm: string, imgIndexToPush: number) {
    console.log("inside pushsubgroupfirestore with value " + imgIndexToPush);
    console.log(this.partOfTheSameSubPair);
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

    this.partOfTheSameSubPair = {};
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
    let index = this.prevTermGrouping.needGrouping ? this.prevTermGrouping.imageIndex : this.currTermGrouping.imageIndex;
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-grouping",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: index
    };
    let lock: groupLock = {
      boxLocked: this.boxLocked,
      savedIndex: this.savedIndex,
      savedChoice: this.savedChoice
    }
    this.authService.setStorage("local", object, "termData");
    this.authService.setStorage("local", lock, "groupLock");

    console.log(this.generalInfo.prevTerm);
    console.log(this.generalInfo.currTerm);
    console.log("is the box locked " + this.boxLocked);

    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase, '/choose-grouping', [this.generalInfo.prevTerm, this.generalInfo.currTerm], index, this.boxLocked, this.savedIndex, this.savedChoice);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    let lock: groupLock = {
      boxLocked: this.boxLocked,
      savedIndex: this.savedIndex,
      savedChoice: this.savedChoice
    }
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-grouping",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.prevTermGrouping.needGrouping ? this.prevTermGrouping.imageIndex : this.currTermGrouping.imageIndex
    };
    this.authService.setStorage("session", lock, "groupLock");
    this.authService.setStorage("session", object, "termData");
    return false;
  }

}
