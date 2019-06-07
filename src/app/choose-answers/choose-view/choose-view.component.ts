import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import { UserTermImageInformationService } from '../../core/user-term-image-information.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService, termData } from 'src/app/core/auth.service';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-choose-view',
  templateUrl: './choose-view.component.html',
  styleUrls: ['./choose-view.component.css']
})
export class ChooseViewComponent implements OnInit {
  boxValues = [{ opt: 'A' }, { opt: 'B' }, { opt: 'C' }, { opt: 'D' }, { opt: 'E' }, { opt: 'None of A, B, C, D, E is correct' }];
  imagesFinished; // if we finish reading all the images
  boxOnScreen;
  prevTermAnswerObj;
  currTermAnswerObj;
  startingIndex;

  totalPrevImages: number = 0;
  totalCurrImages: number = 0;
  canShowPreviousImage: boolean = false;

    constructor(private fb: FormBuilder, private generalInfo: UserTermImageInformationService, private db: AngularFirestore, private authService: AuthService,private dialog: MatDialog) {
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

  /*
   * Takes in prev or current term string and based on that returns the key images of that term
   * in the form arr[L00183748Q_19] = "lasldjfhhj2398shkas" where the right hand side is teh key
   * and the left hand side is teh name of the image
   *
   * since iso images have been removed: iso image variable should not change output
   *
   */
  getKeyAndIsoImages( prevOrCurrentTerm: string){
    let retVal = {};
    var reversed;
    var tempArr;
    reversed = this.reverseKeyInAllImages(prevOrCurrentTerm);
    tempArr = {};
    switch (prevOrCurrentTerm){
      case 'prev':
        for( let key of Object.keys(this.generalInfo.prevTermKeyImages)){
          // retVal = Object.assign(retVal, key);//this.generalInfo.prevTermKeyImages[key]);
          tempArr[reversed[key]] = key;
        }
        retVal = Object.assign(retVal, tempArr );
        return retVal;
        break;
      case 'curr':
        for( let key of Object.keys(this.generalInfo.currTermKeyImages)){
          tempArr[reversed[key]] = key;
        }
        retVal = Object.assign(retVal, tempArr );
        return retVal;
        break;
      default: break;
    }
  }

  /*
   * Returns array in the form of arr["keyVal"] = "imageName"
   *                              arr["kjsh2k3"] = "L123123Q_19"
   */
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
    const dialogRef = this.dialog.open(Note, {
      width: '500px'
    });

    // might be memory error where you pass by reference
    this.boxOnScreen = this.createBoxObj();
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    this.startingIndex = data.lectureOrImageIndex;
    this.totalPrevImages = Object.keys(this.generalInfo.prevTermKeyImages).length;
    this.totalCurrImages = Object.keys(this.generalInfo.currTermKeyImages).length;

    let prevTermIndIsoImages =  this.getKeyAndIsoImages('prev');
    this.prevTermAnswerObj =
      this.createChooseAnswersTermObj(prevTermIndIsoImages, this.generalInfo.prevTermLoadedFromDatabase, this.generalInfo.prevTermIdVal, 0);

    this.prevTermAnswerObj.imageIndex = this.startingIndex;
    this.canShowPreviousImage = this.startingIndex === 0 ? false : true;

    // If all are finished
    if (this.generalInfo.prevTermFinished) {
      this.imagesFinished = true;
      this.prevTermAnswerObj.needGrouping = false;
      this.prevTermAnswerObj.termFinishedAnswering = true;
    }
    else {
      this.findNextImageToAnswerInPrevTerm().then(() => {
        if (this.prevTermAnswerObj.imageIndex >= this.prevTermAnswerObj.imageKeysSorted.length) {
          this.prevTermAnswerObj.needGrouping = false;
          this.prevTermAnswerObj.termFinishedAnswering = true;
          this.imagesFinished = true;
        } else {
          this.getImageURLsetInHTML(this.prevTermAnswerObj.imageKeysSorted[this.prevTermAnswerObj.imageIndex]);
        }
      });
      this.prevTermAnswerObj.needGrouping = !this.generalInfo.prevTermLoadedFromDatabase && !this.generalInfo.prevTermFinished;
      this.prevTermAnswerObj.termFinishedAnswering = false; // !this.prevTermAnswerObj.needGrouping;
    }
  }

  async findNextImageToAnswerInPrevTerm( ){
    var imgKey;
    var imgObj;
    let i = 0;
    for ( let imgName of this.prevTermAnswerObj.imageKeysSorted.slice(this.prevTermAnswerObj.imageIndex, )){
      imgKey = this.prevTermAnswerObj.imageNames[imgName];
      imgObj = await this.db.collection('images').doc(imgKey).ref.get();
      console.log(imgObj);
      console.log(imgObj.data());

      if ( imgObj.data()["correct_answers"].length === 0 ){
        this.prevTermAnswerObj.imageIndex += i;
        return;
      }
      i++;
    }
    this.prevTermAnswerObj.imageIndex += i;
  }
  setResetTermFinishVariables() {
      this.prevTermAnswerObj.termFinishedAnswering = true;
      this.prevTermAnswerObj.needGrouping = false;
      // This one must have
      this.generalInfo.prevTermFinished = true;
      this.imagesFinished = true;
  }

  unwindTermFinishVariables() {
    this.prevTermAnswerObj.termFinishedAnswering = false;
    this.prevTermAnswerObj.needGrouping = true;
    // This one must have
    this.generalInfo.prevTermFinished = false;
    this.imagesFinished = false;
  }

  getImageURLsetInHTML(imageName: string) {
    this.boxOnScreen.imageSourceURL = this.db.collection('images').doc(this.prevTermAnswerObj.imageNames[imageName]).ref.get();
  }

  updateSubGrouping( imageKeyInDatabase: string, correctAnswer ){
    console.log(imageKeyInDatabase);
    console.log(this.generalInfo.prevTermKeyImages);
    var subGroupingArr;
    if ( !(imageKeyInDatabase in this.generalInfo.prevTermKeyImages) ) return;  // if non key image calls this method
    subGroupingArr = this.generalInfo.prevTermKeyImages[imageKeyInDatabase];
    for ( var key of subGroupingArr ){
      console.log(key);
      this.db.collection('images').doc(key).update({correct_answers: correctAnswer}).catch(()=> console.error("did not udpate image correctly"));
    }
  }

  previousImage() {
    this.boxOnScreen = this.createBoxObj();
    // After finishing all the images
    if (this.imagesFinished === true) {
      this.prevTermAnswerObj.imageIndex = this.prevTermAnswerObj.numImages - 1;
      this.canShowPreviousImage = this.prevTermAnswerObj.imageIndex === 0 ? false : true;
      this.unwindTermFinishVariables();
      this.getImageURLsetInHTML(this.prevTermAnswerObj.imageKeysSorted[this.prevTermAnswerObj.imageIndex]);
      return;
    }

    // if loaded from database find next unanswered image and answer it otherwise just go to teh next image
    // TODO: this is not dealt with or tested
    if (this.generalInfo.prevTermLoadedFromDatabase) {
      this.findNextImageToAnswerInPrevTerm().then(() => {
        if (this.prevTermAnswerObj.imageIndex >= this.prevTermAnswerObj.imageKeysSorted.length) {
          this.setResetTermFinishVariables();
          return;
        }
        this.getImageURLsetInHTML(this.prevTermAnswerObj.imageKeysSorted[this.prevTermAnswerObj.imageIndex]);
      });
    } else {
      this.prevTermAnswerObj.imageIndex -= 1;
      this.canShowPreviousImage = this.prevTermAnswerObj.imageIndex === 0 ? false : true;
      this.getImageURLsetInHTML(this.prevTermAnswerObj.imageKeysSorted[this.prevTermAnswerObj.imageIndex]);
    }
  }

  async nextImage() {
    const termAnswerObj = this.prevTermAnswerObj;
    this.canShowPreviousImage = true;

    console.log(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]);
    await this.db.collection('images').doc(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]]).update({
      correct_answers: this.boxOnScreen.boxAnswer.value,
    }).then(function () {
      console.log("Document successfully updated!");
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });

    this.updateSubGrouping(termAnswerObj.imageNames[termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]], this.boxOnScreen.boxAnswer.value);

    // if the last image is on the screen
    if ((termAnswerObj.numImages - termAnswerObj.imageIndex) <= 1) {
      this.setResetTermFinishVariables();
      return;
    } // case for the last image

    this.boxOnScreen = this.createBoxObj();
    // if loaded from database find next unanswered image and answer it otherwise just go to teh next image
    if ( this.generalInfo.prevTermLoadedFromDatabase ) {
      this.findNextImageToAnswerInPrevTerm().then(()=>{
        if ( termAnswerObj.imageIndex >= termAnswerObj.imageKeysSorted.length) {
          this.setResetTermFinishVariables();
          return;
        }
        this.getImageURLsetInHTML(termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]);
      });
    } else {
      this.prevTermAnswerObj.imageIndex += 1;
      this.getImageURLsetInHTML(termAnswerObj.imageKeysSorted[termAnswerObj.imageIndex]);
    }
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
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/navigator/choose-ans",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
  }

  logout() {
    let index = this.prevTermAnswerObj.imageIndex;

    let object: termData = {
      uid: this.generalInfo.userIdVal,
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
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-answers",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: this.prevTermAnswerObj.imageIndex
    };
    this.authService.setStorage("session", object, "termData");
    return false;
  }
  openDialog() {
    const dialogRef = this.dialog.open(Guide, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'pop-up',
  templateUrl: './pop-up.html',
})
export class Guide {
  constructor(
    public dialogRef: MatDialogRef<Guide>) {
      dialogRef.disableClose = true;
    }
}

@Component({
  selector: 'note',
  templateUrl: './note.html',
})
export class Note {
  constructor(
    public dialogRef: MatDialogRef<Note>) {
    dialogRef.disableClose = true;
  }
}
