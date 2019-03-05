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
  /*
  mappedAnswers; // keep until we figure out what format the image names will be given in in the array
  imageNames;
  imageIndex;
  */
  boxOnScreen;
  prevTermAnswerObj;
  currTermAnswerObj;
  startingIndex;

  // start of new code
  /*
  allAnswers: FormArray;
  specificAnswers: FormGroup;
  numCheckedBoxes: number;
  */
  constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore, private authService: AuthService) {
    // this.imageNames = this.getImageNames();
    // this.imageIndex = 0;
    this.imagesFinished = false;
    // this.numCheckedBoxes = 0;
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

    obj.imageIndex = index;
    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a, b) => a.localeCompare(b));
    obj.needGrouping = !loadedFromDatabase;
    obj.termFinishedAnswering = loadedFromDatabase;
    obj.numImages = obj.imageKeysSorted.length;
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
  ngOnInit() {

    // might be memory error where you pass by reference
    this.boxOnScreen = this.createBoxObj();

    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    this.startingIndex = data.imageIndex;

    let prevTermIndIsoImages = Object.assign({}, this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermIsoImages);
    this.prevTermAnswerObj =
      this.createChooseAnswersTermObj(prevTermIndIsoImages, this.generalInfo.prevTermFinished, this.generalInfo.prevTermIdVal, 0);
    //this.createChooseAnswersTermObj(prevTermIndIsoImages, this.generalInfo.prevTermLoadedFromDatabase, this.generalInfo.prevTermIdVal);

    let currTermIndIsoImages = Object.assign({}, this.generalInfo.currTermIndividualImages, this.generalInfo.currTermIsoImages);
    this.currTermAnswerObj =
      this.createChooseAnswersTermObj(currTermIndIsoImages, this.generalInfo.currTermFinished, this.generalInfo.currTermIdVal, 0);
    //this.createChooseAnswersTermObj(currTermIndIsoImages, this.generalInfo.currTermLoadedFromDatabase, this.generalInfo.currTermIdVal);

    if (!this.generalInfo.prevTermFinished && this.prevTermAnswerObj.needGrouping) {
      this.prevTermAnswerObj.imageIndex = this.startingIndex;
      this.getImageURLsetInHTML('prev', this.prevTermAnswerObj.imageKeysSorted[this.startingIndex]);
    }
    else {
      this.currTermAnswerObj.imageIndex = this.startingIndex;
      this.getImageURLsetInHTML('curr', this.currTermAnswerObj.imageKeysSorted[this.startingIndex]);
    }
    //console.log(this.currTermAnswerObj);
  }


  setResetTermFinishVariables(prevOrCurrentTerm: string) {
    if (prevOrCurrentTerm === 'prev') {
      this.prevTermAnswerObj.termFinishedAnswering = true;
      this.boxOnScreen = this.createBoxObj();
      this.getImageURLsetInHTML('curr', this.currTermAnswerObj.imageKeysSorted[0]);
      // Added set needGrouping
      this.prevTermAnswerObj.needGrouping = false;
    } else {
      this.currTermAnswerObj.termFinishedAnswering = true;
      this.imagesFinished = true;
      this.currTermAnswerObj.needGrouping = false;
    }
  }
  getImageURLsetInHTML(prevOrCurr: string, imageKey: string) {
    // console.log(imageKey === 'L1710031354_C10');
    // console.log(prevOrCurr);
    // console.log(this.prevTermAnswerObj.imageNames['L1710031354_C10']);
    // console.log(this.prevTermAnswerObj.imageNames);
    let url = prevOrCurr === "prev" ?
      this.db.collection('images').doc(this.prevTermAnswerObj.imageNames[imageKey]).ref.get() :
      this.db.collection('images').doc(this.currTermAnswerObj.imageNames[imageKey]).ref.get();
    this.boxOnScreen.imageSourceURL = url;
  }

  async nextImage(prevOrCurrentTerm: string) {
    // console.log(this.boxOnScreen.boxAnswer.value);
    // console.log();
    let ans = JSON.stringify(this.boxOnScreen.boxAnswer.value)
    let termAnswerObj = prevOrCurrentTerm === 'prev' ? this.prevTermAnswerObj : this.currTermAnswerObj;
    if ((termAnswerObj.numImages - termAnswerObj.imageIndex) <= 1) {
      await this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
        correct_answers: this.boxOnScreen.boxAnswer.value,
      });
      this.setResetTermFinishVariables(prevOrCurrentTerm);
      return;
    }

    console.log("value is " + this.boxOnScreen.boxAnswer.value);
    console.log("image key is" + termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]);
    this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
      correct_answers: this.boxOnScreen.boxAnswer.value,
    }).then(function () {
      console.log("Document successfully updated!");
    })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    this.boxOnScreen = this.createBoxObj();
    termAnswerObj.imageIndex += 1;
    // Need to update indices
    console.log(termAnswerObj.imageKeysSorted);
    console.log(termAnswerObj.imageIndex);
    console.log(termAnswerObj.imageNames);
    this.getImageURLsetInHTML(prevOrCurrentTerm, termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]);
  }

  // use in the future
  addMCAnswerToImage(imageName: string, answers: FormGroup) {
    this.db.collection('images').doc(imageName).update({
      correct_answers: answers,
    });
  }
  boxChecked(isChecked: boolean) {
    if (isChecked) {
      this.boxOnScreen.numBoxesChecked++;
    } else {
      this.boxOnScreen.numBoxesChecked--;
    }
  }

  logout() {
    let index = this.prevTermAnswerObj.needGrouping ? this.prevTermAnswerObj.imageIndex : this.currTermAnswerObj.imageIndex;
    if (!this.prevTermAnswerObj.needGrouping) {
      this.generalInfo.prevTermFinished = true;
    }
    let object: termData = {
      logoutUrl: "/choose-answers",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: index
    };
    this.authService.setStorage("local", object, "termData");

    this.authService.logout('/choose-answers', [this.generalInfo.prevTerm, this.generalInfo.currTerm], index);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    if (!this.prevTermAnswerObj.needGrouping) {
      this.generalInfo.prevTermFinished = true;
    }
    let object: termData = {
      logoutUrl: "/choose-answers",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.prevTermAnswerObj.needGrouping ? this.prevTermAnswerObj.imageIndex : this.currTermAnswerObj.imageIndex
    };
    console.log(this.prevTermAnswerObj.needGrouping);
    console.log(this.prevTermAnswerObj.imageIndex)
    console.log(this.currTermAnswerObj.imageIndex);
    this.authService.setStorage("session", object, "termData");
    return false;
  }

}
