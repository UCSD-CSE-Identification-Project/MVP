import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-choose-view',
  templateUrl: './choose-view.component.html',
  styleUrls: ['./choose-view.component.css']
})
export class ChooseViewComponent implements OnInit {
  boxValues = [{opt: 'A'}, {opt: 'B'}, {opt: 'C'}, {opt: 'D'}, {opt: 'E'}, {opt: 'None of the above'}];
  imagesFinished; // if we finish reading all the images
  /*
  mappedAnswers; // keep until we figure out what format the image names will be given in in the array
  imageNames;
  imageIndex;
  */
  boxOnScreen;
  prevTermAnswerObj;
  currTermAnswerObj;

  // start of new code
  /*
  allAnswers: FormArray;
  specificAnswers: FormGroup;
  numCheckedBoxes: number;
  */
  constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore) {
    // this.imageNames = this.getImageNames();
    // this.imageIndex = 0;
    // this.imagesFinished = false;
    // this.numCheckedBoxes = 0;
  }

  createChooseAnswersTermObj(imgNames, loadedFromDatabase: boolean, termIdVal: string){
    let obj =  {
      imageNames: {}, // going to be array of individual names and iso names
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

  createBoxObj(){
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
    this.boxOnScreen = this.createBoxObj();
    const prevTermIndIsoImages = Array.prototype.push.apply(this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermIsoImages);
    this.prevTermAnswerObj =
      this.createChooseAnswersTermObj(prevTermIndIsoImages, this.generalInfo.prevTermLoadedFromDatabase, this.generalInfo.prevTermIdVal);

    const currTermIndIsoImages = Array.prototype.push.apply(this.generalInfo.currTermIndividualImages, this.generalInfo.currTermIsoImages);
    this.currTermAnswerObj =
      this.createChooseAnswersTermObj(currTermIndIsoImages, this.generalInfo.currTermLoadedFromDatabase, this.generalInfo.currTermIdVal);
  }


  setResetTermFinishVariables(prevOrCurrentTerm: string){
    if ( prevOrCurrentTerm === 'prev'){
      this.prevTermAnswerObj.imageFinishedGrouping = true;
      this.boxOnScreen = this.createBoxObj();
      this.getImageURLsetInHTML(this.currTermAnswerObj.imageKeysSorted[0],'curr');
    } else{
      this.currTermAnswerObj.imageFinishedGrouping = true;
      this.imagesFinished = true;
    }
  }
  getImageURLsetInHTML(imageKey: string, prevOrCurr: string){
    let url = prevOrCurr === "prev" ?
      this.db.collection('images').doc(this.prevTermAnswerObj.imageNames[imageKey]).ref.get() :
      this.db.collection('images').doc(this.currTermAnswerObj.imageNames[imageKey]).ref.get();
    this.boxOnScreen.imageSourceURL = url;
  }

  async nextImage(prevOrCurrentTerm: string) {
    let termAnswerObj = prevOrCurrentTerm === 'prev' ? this.prevTermAnswerObj: this.currTermAnswerObj;
    if( (termAnswerObj.numImages - termAnswerObj.imageIndex) <= 1 ){
      await this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
        correct_answers: this.boxOnScreen.boxVal,
      });
      this.setResetTermFinishVariables(prevOrCurrentTerm);
      return;
    }

    await this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
      correct_answers: this.boxOnScreen.boxVal,
    });

    this.boxOnScreen = this.createBoxObj();
    termAnswerObj.imageIndex += 1;
    this.getImageURLsetInHTML(termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex], prevOrCurrentTerm);
  }

  // use in the future
  addMCAnswerToImage( imageName: string, answers: FormGroup){
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

}
