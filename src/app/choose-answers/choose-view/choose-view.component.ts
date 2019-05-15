import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import { UserTermImageInformationService } from '../../core/user-term-image-information.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService, termData } from 'src/app/core/auth.service';

@Component({
  selector: 'app-choose-view',
  templateUrl: './choose-view.component.html',
  styleUrls: ['./choose-view.component.css']
})
export class ChooseViewComponent implements OnInit {
  boxValues = [{ opt: 'A' }, { opt: 'B' }, { opt: 'C' }, { opt: 'D' }, { opt: 'E' }, { opt: 'None of the above' }];
  imagesFinished; // if we finish reading all the images
  boxOnScreen;
  prevTermAnswerObj;
  currTermAnswerObj;
  startingIndex;

  totalPrevImages = Object.keys(this.generalInfo.prevTermKeyImages).length;
  totalCurrImages = Object.keys(this.generalInfo.currTermKeyImages).length;

    constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore, private authService: AuthService) {
    this.imagesFinished = false;
  }

  createChooseAnswersTermObj(imgNames, loadedFromDatabase: boolean, termIdVal: string, index: number) {
    let obj = {
      imageNames: {}, // going to be array of individual names and iso names
      imageIndex: 0,
      imageKeysSorted: [],
      termFinishedAnswering: false,
      needGrouping: true,
      numImages: 0,
    };

    // obj.imageIndex = index;
    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a, b) => a.localeCompare(b));
    obj.needGrouping = !loadedFromDatabase;
    // This does not take care of all the cases
    obj.termFinishedAnswering = loadedFromDatabase;
    obj.numImages = obj.imageKeysSorted.length;
    // console.log(typeof index);
    return obj;
  }

  createBoxObj() {
    return {
      boxAnswer: this.fb.group({
        A: [false],
        B: [false],
        C: [false],
        D: [false],
        E: [false],
        N: [false]
      }),
      numBoxesChecked: 0,
      imageSourceURL: null,
    };
  }

  getKeyAndIsoImages( prevOrCurrentTerm: string){
    let retVal = {};
    var reversed;
    var tempArr;
    reversed = this.reverseKeyInAllImages(prevOrCurrentTerm);
    console.log(reversed);
    tempArr = {};
    switch (prevOrCurrentTerm){
      case 'prev':
        for( let key of Object.keys(this.generalInfo.prevTermKeyImages)){
          // retVal = Object.assign(retVal, key);//this.generalInfo.prevTermKeyImages[key]);
          tempArr[reversed[key]] = key;
        }
        console.log(retVal);
        retVal = Object.assign(retVal, tempArr );
        console.log(this.generalInfo.prevTermIsoImages);
        console.log(this.generalInfo.prevTermKeyImages);
        return retVal;
        break;
      case 'curr':
        retVal = Object.assign({}, this.generalInfo.currTermIsoImages );
        for( let key of Object.keys(this.generalInfo.currTermKeyImages)){
          tempArr[reversed[key]] = key;
        }

        console.log(retVal);
        retVal = Object.assign(retVal, tempArr );
        console.log(this.generalInfo.currTermIsoImages);
        console.log(this.generalInfo.currTermKeyImages);
        return retVal;
        break;
      default: break;
    }
  }

  reverseKeyInAllImages( prevOrCurrentTerm: string) {
    let retVal = {};
    switch (prevOrCurrentTerm){
      case 'prev':
        for(let key of Object.keys(this.generalInfo.prevTermAllImages)){
          retVal[this.generalInfo.prevTermAllImages[key]] = key;
        }
        break;
      case 'curr':
        for (let key of Object.keys(this.generalInfo.currTermAllImages)){
          retVal[this.generalInfo.currTermAllImages[key]] = key;
        }
        break;
      default: break;
    };

    return retVal;
  }
  ngOnInit() {
    // might be memory error where you pass by reference
    this.boxOnScreen = this.createBoxObj();
    console.log("here");
    let data: termData = this.authService.getStorage("session", "termData");
    console.log(data);
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    this.startingIndex = data.lectureOrImageIndex;

    let prevTermIndIsoImages =  this.getKeyAndIsoImages('prev');
    console.log(prevTermIndIsoImages);
    this.prevTermAnswerObj =
      this.createChooseAnswersTermObj(prevTermIndIsoImages, this.generalInfo.prevTermLoadedFromDatabase, this.generalInfo.prevTermIdVal, 0);
    console.log(this.prevTermAnswerObj);

    let currTermIndIsoImages = this.getKeyAndIsoImages('curr');
    console.log(currTermIndIsoImages);
    this.currTermAnswerObj = this.createChooseAnswersTermObj(currTermIndIsoImages, this.generalInfo.currTermLoadedFromDatabase, this.generalInfo.currTermIdVal, 0);

    this.prevTermAnswerObj.needGrouping = !this.generalInfo.prevTermLoadedFromDatabase && !this.generalInfo.prevTermFinished;
    this.currTermAnswerObj.needGrouping = !this.generalInfo.currTermLoadedFromDatabase && !this.generalInfo.currTermFinished;
    this.prevTermAnswerObj.termFinishedAnswering = !this.prevTermAnswerObj.needGrouping;

    if (this.prevTermAnswerObj.needGrouping) {
      this.prevTermAnswerObj.imageIndex = this.startingIndex;
      this.getImageURLsetInHTML('prev', this.prevTermAnswerObj.imageKeysSorted[this.prevTermAnswerObj.imageIndex]);
    }
    else {
      this.currTermAnswerObj.imageIndex = this.startingIndex;
      this.getImageURLsetInHTML('curr', this.currTermAnswerObj.imageKeysSorted[this.currTermAnswerObj.imageIndex]);
    }

    console.log(this.prevTermAnswerObj);
    console.log(this.currTermAnswerObj);
  }


  setResetTermFinishVariables(prevOrCurrentTerm: string) {
    if (prevOrCurrentTerm === 'prev') {
      this.prevTermAnswerObj.termFinishedAnswering = true;
      this.boxOnScreen = this.createBoxObj();
      this.getImageURLsetInHTML('curr', this.currTermAnswerObj.imageKeysSorted[0]);
      //TODO Which of the 2 boolean do we use?
      this.prevTermAnswerObj.needGrouping = false;
      // This one must have
      this.generalInfo.prevTermFinished = true;
    } else {
      this.currTermAnswerObj.termFinishedAnswering = true;
      this.imagesFinished = true;
      this.currTermAnswerObj.needGrouping = false;
    }
  }
  getImageURLsetInHTML(prevOrCurr: string, imageKey: string) {
    console.log(this.prevTermAnswerObj.imageNames[imageKey]);
    //console.log(this.prevTermAnswerObj.imageNames);
    //console.log(this.prevTermAnswerObj.imageKeysSorted[0]);
    //console.log(imageKey);
    let url = prevOrCurr === "prev" ?
      this.db.collection('images').doc(this.prevTermAnswerObj.imageNames[imageKey]).ref.get() :
      this.db.collection('images').doc(this.currTermAnswerObj.imageNames[imageKey]).ref.get();
    this.boxOnScreen.imageSourceURL = url;
  }
  updateSubGrouping( prevOrCurrentTerm: string, imageKey: string, correctAnswer ){
    var subGroupingArr;
    console.log(this.generalInfo.prevTermKeyImages);
    if( prevOrCurrentTerm === 'prev'){
      if ( !(imageKey in this.generalInfo.prevTermKeyImages) ) return;
      subGroupingArr = this.generalInfo.prevTermKeyImages[imageKey];
      for ( var key of Object.keys(subGroupingArr) ){
        if ( subGroupingArr[key] === 'Group' || subGroupingArr[key] === 'Individual') {
          this.db.collection('images').doc(key).update({correct_answers: correctAnswer});
        }
      }
    }

    else {
      if ( !(imageKey in this.generalInfo.currTermKeyImages) ) return;
      subGroupingArr = this.generalInfo.currTermKeyImages[imageKey];
      for ( var key of Object.keys(subGroupingArr) ){
        if ( subGroupingArr[key] === 'Group' || subGroupingArr[key] === 'Individual') {
          this.db.collection('images').doc(key).update({correct_answers: correctAnswer});
        }
      }

    }
  }
  async nextImage(prevOrCurrentTerm: string) {
    // console.log(this.boxOnScreen.boxAnswer.value);
    // console.log();
    let ans = JSON.stringify(this.boxOnScreen.boxAnswer.value);
    let termAnswerObj = prevOrCurrentTerm === 'prev' ? this.prevTermAnswerObj : this.currTermAnswerObj;
    if ((termAnswerObj.numImages - termAnswerObj.imageIndex) <= 1) {
      await this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
        correct_answers: this.boxOnScreen.boxAnswer.value,
      });
      this.updateSubGrouping(prevOrCurrentTerm, termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]], this.boxOnScreen.boxAnswer.value);
      this.setResetTermFinishVariables(prevOrCurrentTerm);
      return;
    }

    console.log("value is " + this.boxOnScreen.boxAnswer.value);
    console.log("image key is" + termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]);
    this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
      correct_answers: this.boxOnScreen.boxAnswer.value,
    }).then(function () {
      console.log("Document successfully updated!");
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    this.updateSubGrouping(prevOrCurrentTerm, termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]], this.boxOnScreen.boxAnswer.value);

    this.boxOnScreen = this.createBoxObj();
    termAnswerObj.imageIndex += 1;
    // Need to update indices
    console.log(termAnswerObj.imageKeysSorted);
    console.log(termAnswerObj.imageIndex);
    console.log(termAnswerObj.imageNames);
    this.getImageURLsetInHTML(prevOrCurrentTerm, termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]);
  }

  boxChecked(isChecked: boolean) {
    if (isChecked) {
      this.boxOnScreen.numBoxesChecked++;
    } else {
      this.boxOnScreen.numBoxesChecked--;
    }
  }

  storeSession() {
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/navigator/choose-ans",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
  }

  logout() {
    let index = this.prevTermAnswerObj.needGrouping ? this.prevTermAnswerObj.imageIndex : this.currTermAnswerObj.imageIndex;
    if (!this.prevTermAnswerObj.needGrouping) {
      this.generalInfo.prevTermFinished = true;
    }
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-answers",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: index
    };
    this.authService.setStorage("local", object, "termData");

    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase, '/choose-answers', [this.generalInfo.prevTerm, this.generalInfo.currTerm], index);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    if (!this.prevTermAnswerObj.needGrouping) {
      this.generalInfo.prevTermFinished = true;
    }
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-answers",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: this.prevTermAnswerObj.needGrouping ? this.prevTermAnswerObj.imageIndex : this.currTermAnswerObj.imageIndex
    };
    console.log(this.prevTermAnswerObj.needGrouping);
    console.log(this.prevTermAnswerObj.imageIndex)
    console.log(this.currTermAnswerObj.imageIndex);
    this.authService.setStorage("session", object, "termData");
    return false;
  }

}
