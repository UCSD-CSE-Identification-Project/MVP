import { ChangeDetectorRef, ViewChild, Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, HostListener } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import { AuthService, termData } from 'src/app/core/auth.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling'
import {ScrollDispatchModule} from '@angular/cdk/scrolling';


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
  styleUrls: ['./choose-groups.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseGroupsComponent implements OnInit {
  boxValues = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Ignore'}];
  boxValueList = ['Individual', 'Group'];
  imagesFinished; // if we finish reading all the images
  prevTermGrouping;
  currTermGrouping;
  lenOfVirtualScroll;
  // Added addition box for each boxes to indicate relation
  lectureOnScreenBoxList = [];
  // startingIndex:number = 0;
  partOfTheSameSubPair;
  allImages = [];
  allImageIds = [];
  lenVal = 0;

  currentPair = [];
  lectureName: string  = "";
  previousValue: number = 1;
  finishedCurrentTerm: boolean = false;

  // Default to first lecture of previous term
  lectureNum: number = 0;
  whichTerm: string = "prev";
  termName: string = "";

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;
  constructor(private fb: FormBuilder,
              private generalInfo: UserTermImageInformationService,
              private authService: AuthService,
              private db: AngularFirestore,
              private ref: ChangeDetectorRef
              ) {
    this.imagesFinished = false;
    this.partOfTheSameSubPair  = {};
  }

  ngOnInit() {
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    this.lectureNum = data.lectureOrImageIndex;

    this.prevTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.prevTermAllImages, this.generalInfo.prevTermLoadedFromDatabase, "prev");
    this.currTermGrouping = this.createChooseGroupingTermObject(this.generalInfo.currTermAllImages, this.generalInfo.currTermLoadedFromDatabase, "curr");
    
    this.prevTermGrouping.needGrouping = !this.generalInfo.prevTermLoadedFromDatabase && !this.generalInfo.prevTermFinished;
    this.currTermGrouping.needGrouping = !this.generalInfo.currTermLoadedFromDatabase && !this.generalInfo.currTermFinished;
    this.prevTermGrouping.termFinishedAnswering = !this.prevTermGrouping.needGrouping;
    this.prevTermGrouping.imageFinishedGrouping = this.generalInfo.prevTermFinished;

    // Term is decided here
    this.whichTerm = this.prevTermGrouping.needGrouping ? "prev" : "curr";
    this.lectureName = this.whichTerm === "prev" ? Object.keys(this.generalInfo.prevTermLectureImage)[this.lectureNum] : Object.keys(this.generalInfo.currTermLectureImage)[this.lectureNum];
    this.termName = this.whichTerm === "prev" ? this.generalInfo.prevTermName : this.generalInfo.currTermName;
    this.whichTerm === "prev" ? this.prevTermGrouping.lectureIndex = this.lectureNum : this.currTermGrouping.lectureIndex = this.lectureNum;
    this.populateLectureBoxList(this.lectureNum, this.whichTerm);
    // Comment this out before we merge
    // if( this.prevTermGrouping.needGrouping ){
    // }
    // else{
    // }

  }

  createBoxObj(imageIndex: number, defaultTypeVal: number) {
    let retObj = {
      boxVal: this.fb.group({
        option: [''],
        box: [false]
      }),
      radioClicked: false,
      disabledRadioButton: false,
      imageSourceURL: null,
      imgIndex: imageIndex
    };
    retObj.boxVal.controls['option'].setValue(defaultTypeVal === 0 ? "Individual" : "Group");
    return retObj;
  }

  // imgNames type object
  createChooseGroupingTermObject(imgNames, loadedFromDatabase: boolean, whichTerm: string): Object{
    let obj =  {
      imageNames: {},
      lectureIndex: 0,
      lectureList: [],
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
    obj.lectureList = whichTerm === "prev" ? Object.keys(this.generalInfo.prevTermLectureImage) : Object.keys(this.generalInfo.currTermLectureImage); // write a method that will actually get all the lectures lists
    return obj;
  }

  populateLectureBoxList(lecInd: number, prevOrCurr: string) {
    this.lectureOnScreenBoxList = [];
    let allImgNameToKey = prevOrCurr === 'prev' ? this.prevTermGrouping.imageNames : this.currTermGrouping.imageNames;
    // The list will contain all image ids from that lecture (sorted by imageName)
    let lectureList: string[] = prevOrCurr === 'prev' ? this.generalInfo.prevTermLectureImage[this.prevTermGrouping.lectureList[lecInd]] : this.generalInfo.currTermLectureImage[this.currTermGrouping.lectureList[lecInd]];
    console.log("All images from this lecture is: ", lectureList);
    this.lenOfVirtualScroll = lectureList.length;
    let i;
    for( i = 0; i < this.lenOfVirtualScroll; i++){
      this.lectureOnScreenBoxList.push(this.createBoxObj(i,i%2)); // todo come back here and put the correct image index
      //this.lectureOnScreenBoxList[i].oldVal = this.lectureOnScreenBoxList[i].boxVal.controls.option.value;
    }
    i = 0;
    //populate the image URL's
    for ( let imgID of lectureList ){
      this.lectureOnScreenBoxList[i].imageSourceURL = this.db.collection('images').doc(imgID).ref.get();
      i++;
    }
    console.log("Inside populate");
    console.log(this.generalInfo.prevTermLectureImage);
    console.log(this.generalInfo.currTermLectureImage);
  }

  toggleRestBoxes(index: number) {
    //console.log(this.lectureOnScreenBoxList[index - 1].boxVal.controls.option.value);
    //this.lectureOnScreenBoxList[index - 1].boxVal.controls['option'].setValue(newValue);

    let i: number;
    for (i = index; i < this.lectureOnScreenBoxList.length; i++) {
      if (this.lectureOnScreenBoxList[i].boxVal.controls.option.value === "Individual") {
        this.lectureOnScreenBoxList[i].boxVal.controls['option'].setValue("Group");
      }
      else {
        this.lectureOnScreenBoxList[i].boxVal.controls['option'].setValue("Individual");
      }
    }
  }

  // TODO
  // reset variables when second term is done
  setResetTermFinishVariables(){
    if ( this.whichTerm === 'prev'){
      // this.prevTermGrouping.imageFinishedGrouping = true;
      this.lectureNum = 0;
      this.whichTerm = "curr";
      this.prevTermGrouping.needGrouping = false;
      this.generalInfo.prevTermFinished = true;
      this.prevTermGrouping.termFinishedAnswering = true;

      let termObj = {};
      termObj[`all_images`] = this.generalInfo.prevTermAllImages;
      termObj[`ind_images`] = this.generalInfo.prevTermIndividualImages;
      termObj[`group_images`] = this.generalInfo.prevTermGroupImages;
      termObj[`iso_images`] = this.generalInfo.prevTermIsoImages;
      termObj[`key_images`] = this.generalInfo.prevTermKeyImages;
      this.db.collection('terms').doc(this.generalInfo.prevTermIdVal).ref.set(termObj).then((val)=>{
        console.log("prevTerm: " + val);
      });
    } else{
      // this.currTermGrouping.imageFinishedGrouping = true;
      this.currTermGrouping.needGrouping = false;
      this.generalInfo.currTermFinished = true;

      this.currTermGrouping.termFinishedAnswering = true;
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
      this.finishedCurrentTerm = true;
      return;
    }
  }


  // Remove picture at index "picIndex"
  // 0: boxOne
  // 1: boxTwo
  // 2: boxThree


  // async pushSubGroupToFirestore ( ) {
  //
  //   console.log("inside pushsubgroupfirestore with value " + imgIndexToPush);
  //   console.log(this.partOfTheSameSubPair);
  //   let termObjGrouping = prevOrCurrentTerm === 'prev' ? this.prevTermGrouping : this.currTermGrouping;
  //
  //   const imgToPush = termObjGrouping.imageNames[termObjGrouping.imageKeysSorted[imgIndexToPush]];
  //   // also saving object locally
  //   if( prevOrCurrentTerm === 'prev'){
  //     this.generalInfo.saveKeyImageToPrevTerm(imgToPush, this.partOfTheSameSubPair);
  //   } else {
  //     this.generalInfo.saveKeyImageToCurrTerm(imgToPush, this.partOfTheSameSubPair);
  //   }
  //   // different scenarios
  //   await this.db.collection('images')
  //     .doc(imgToPush)
  //     .set({imagesInGroup: this.partOfTheSameSubPair },{merge: true});
  //
  //   this.partOfTheSameSubPair = {};
  // }

  async pushImageObjectToFirestore( boxVal: string, imageKey: string ){
    const imageObj = {};
    imageObj["grouping"] = boxVal;
    await this.db.collection('images').doc(imageKey).update(imageObj);
  }

  addGroupingOfImageToGenInfo( termObjectKeysToNames: Object, lectureImageIds: Array<string>  ){
    var imgName;
    var imgId;
    let i = 0;
    for ( let box of this.lectureOnScreenBoxList ){
      imgId = lectureImageIds[i];
      imgName = termObjectKeysToNames[imgId];
      i++;
      if( this.whichTerm === 'prev'){
        switch (box.boxVal.controls.option.value){

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
        switch (box.boxVal.controls.option.value){

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
      } // end of if else

    } // end of for loop

  }


  // TODO DO THESE CASES ALSO WORK IF THE FIRST QUESTION IS IGNORE
  // this code was written under the assumption that you only shift by two images
  async nextImage(prevOrCurrentTerm: string) {

  }

  updateChecked(boxNum: number){

  }

  // checkes if all the images are checked or if the unchecked ones are hidden
  allChecked(prevOrCurrent: string){
    return true;
  }

  nextLecture() {
    const termObj = this.whichTerm === 'prev' ? this.prevTermGrouping : this.currTermGrouping;
    const lectureKeys =  this.whichTerm === 'prev' ?
                    this.generalInfo.prevTermLectureImage[termObj.lectureList[termObj.lectureIndex]] :
                    this.generalInfo.currTermLectureImage[termObj.lectureList[termObj.lectureIndex]];
    let keyToName = {};

    console.log("inside next lecture");
    console.log(lectureKeys);

    termObj.imageKeysSorted.forEach((name) => keyToName[termObj.imageNames[name]] = name);

    this.addGroupingOfImageToGenInfo( keyToName, lectureKeys );
    let i = 0;
    for ( let box of this.lectureOnScreenBoxList ){
      this.pushImageObjectToFirestore(box.boxVal.controls.option.value, lectureKeys[i]);
      i++;
    }

    if (this.whichTerm === "prev") {
      if (this.lectureNum + 1 === Object.keys(this.generalInfo.prevTermLectureImage).length) {
        this.setResetTermFinishVariables();
      }
      else {
        this.lectureNum += 1;
        this.prevTermGrouping.lectureIndex += 1;
      }
    }
    else {
      if (this.lectureNum + 1 === Object.keys(this.generalInfo.currTermLectureImage).length) {
        this.setResetTermFinishVariables();
        return;
      }
      else {
        this.lectureNum += 1;
        this.currTermGrouping.lectureIndex += 1;
      }
    }
    this.termName = this.whichTerm === "prev" ? this.generalInfo.prevTermName : this.generalInfo.currTermName;
    this.lectureName = this.whichTerm === "prev" ? Object.keys(this.generalInfo.prevTermLectureImage)[this.lectureNum] : Object.keys(this.generalInfo.currTermLectureImage)[this.lectureNum];
    this.populateLectureBoxList(this.lectureNum, this.whichTerm);
    this.viewport.scrollToIndex(0);
  }

  storeSession() {
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/navigator/classify",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
  }

  logout() {
    let index = this.prevTermGrouping.needGrouping ? this.prevTermGrouping.lectureIndex : this.currTermGrouping.lectureIndex;
    if (!this.prevTermGrouping.needGrouping) {
      this.generalInfo.prevTermFinished = true;
    }
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-grouping",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: index
    };
    this.authService.setStorage("local", object, "termData");

    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase, '/choose-grouping', [this.generalInfo.prevTerm, this.generalInfo.currTerm], index);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    if (!this.prevTermGrouping.needGrouping) {
      this.generalInfo.prevTermFinished = true;
    }
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-grouping",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: this.prevTermGrouping.needGrouping ? this.prevTermGrouping.lectureIndex : this.currTermGrouping.lectureIndex
    };
    this.authService.setStorage("session", object, "termData");
    return false;
  }

}
