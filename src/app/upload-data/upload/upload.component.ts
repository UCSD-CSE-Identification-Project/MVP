import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { UploadService } from '../upload.service';
import * as firebase from 'firebase';
import { AuthService, termData } from 'src/app/core/auth.service';
import { ZipService } from '../../unzipFolder/zip.service';
import { UserTermImageInformationService } from '../../core/user-term-image-information.service';
import { finalize, map, tap } from 'rxjs/internal/operators';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnInit {
  // percentage = 0;
  // uploadPercentage: Observable<number>;
  // snapshot: Observable<any>;
  // numBytesTransferLocal = 0;
  // numBytesTransferTotal = 0;
  // numByteTotal = 0;
  // fileNames: string[] = [];
  progress: Observable<number>;

  // Download URL, removed in the new firebase update, need to find a work-around
  downloadURL: Observable<string>;

  // will commenting these variables cause any issues
  // files: File[][] = [[], []];
  // counter = 0;
  // totalFiles = 0;
  // path: string = '';

  alreadyUpload: boolean;


  // xml files from the clicker folder -- indicates the responses of students from a particular lecture
  prevXmlFiles: string[] = [];
  currXmlFiles: string[] = [];

  // indicates if the user chooses to use a term that is already uploaded in a prior run
  usePreexistTerm: boolean = false;


  prevTermName: string = '';
  currTermName: string = '';
  prevTermsCreated = []; // all of the terms that the user has used in past runs

  // booleans for error prevention for user to choose unique term names
  sameCurrTermName: boolean = false;
  samePrevTermName: boolean = false;

  prevTermClickerFiles: any = null;
  currTermClickerFiles: any = null;
  prevTermFinalExamFile: any = null;

  finishedUpload: boolean = false;
  allPastTermArray: any = null;

  // correspond to the total files that we want to have uploaded at the end of the upload stage for each of the categories
  totalFilesPrevClicker;
  totalFilesPrevFinal;
  totalFilesPrev; // should always be totalFilesPrevClicker + totalFilesPrevFinal ( 1 )
  totalFilesCurr;

  // these are variables used to hold the start values of previous and current files
  // should not change after initial value assigned
  displayNumPrevFinal;
  displayNumPrevClicker;
  displayNumCurrClicker;

  numFilePrev = 0;
  numFileCurr = 0;
  allPercentagePrevious = [];
  allPercentageCurrent = [];
  allPercentageObservablePrevious: Observable<any>;
  allPercentageObservableCurrent: Observable<any>;
  prevObjectPromise = [];
  currObjectPromise = [];
  numTermsPushed: number;
  startSpinning: boolean;
  stopSpinning: boolean;
  submitButtonClicked: boolean = false;

  constructor(private http: HttpClient,
    private uploadService: UploadService,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private authService: AuthService,
    private zipService: ZipService,
    private generalInfo: UserTermImageInformationService,
    private dialog: MatDialog) {
  }

  populatePrevTermsList() {
    const self = this;

    this.uploadService.getTermNames().then((prevTermList) => {
      self.allPastTermArray = prevTermList;
      self.prevTermsCreated = Object.keys(prevTermList);
      console.log(self.prevTermsCreated);
    });
  }

  ngOnInit() {
    this.alreadyUpload = false;
    // this.counter = 0;
    // this.totalFiles = 0;
    this.prevTermClickerFiles = null;
    this.currTermClickerFiles = null;
    this.prevTermFinalExamFile = null;
    this.allPastTermArray = null;
    this.numTermsPushed = 0;
    this.finishedUpload = false;
    this.startSpinning = false;
    this.stopSpinning = false;
    this.populatePrevTermsList(); //TODO COME BACK HERE AS WELL
    this.authService.clearStorage();
  }


  checkPrevTermName() {
    this.samePrevTermName = false;
    for (var i = 0; i < this.prevTermsCreated.length; i++) {
      if (this.prevTermName === this.prevTermsCreated[i]) {
        this.samePrevTermName = true;
      }
    }
  }

  checkCurrTermName() {
    this.sameCurrTermName = false;
    for (var i = 0; i < this.prevTermsCreated.length; i++) {
      if (this.currTermName === this.prevTermsCreated[i]) {
        this.sameCurrTermName = true;
      }
    }
  }

  tempStore(event, prevOrCurrTerm, finalOrClicker = 0) {
    // if (prevOrCurrTerm === 0) {
    //   if (finalOrClicker === 0) {
    //     if (event.target.files.length === 0) {
    //       console.log("No folder selected");
    //       this.prevTermClickerFiles = null;
    //       return;
    //     }
    //     this.prevTermClickerFiles = event.target.files;
    //     this.totalFilesPrevClicker = this.prevTermClickerFiles.length;
    //     // Since the above will change, use this for display purpose only
    //     this.displayNumPrevFinal = this.prevTermClickerFiles.length;
    //   }
    //   else {
    //     if (event.target.files.length === 0) {
    //       console.log("No folder selected");
    //       this.prevTermFinalExamFile = null;
    //       return;
    //     }
    //     this.prevTermFinalExamFile = event.target.files;
    //     this.totalFilesPrevFinal = this.prevTermFinalExamFile.length;
    //     // Since the above will change, use this for display purpose only
    //     this.displayNumPrevClicker = this.prevTermFinalExamFile.length;
    //   }
    // }
    if (prevOrCurrTerm === 0) {
      if (finalOrClicker === 0) {
        if (event.target.files.length === 0) {
          console.log("No final exam file selected selected");
          // this.prevTermClickerFiles = null;
          this.prevTermFinalExamFile = null;
          return;
        }
        // this.prevTermClickerFiles = event.target.files;
        this.prevTermFinalExamFile = event.target.files;
        // this.totalFilesPrevClicker = this.prevTermClickerFiles.length;
        this.totalFilesPrevFinal = this.prevTermFinalExamFile.length; // should always be 1
        // Since the above will change, use this for display purpose only
        this.displayNumPrevFinal = this.prevTermFinalExamFile.length; // should always be 1
      }
      else {
        if (event.target.files.length === 0) {
          console.log("No clicker folder selected");
          // this.prevTermFinalExamFile = null;
          this.prevTermClickerFiles = null;
          return;
        }
        // this.prevTermFinalExamFile = event.target.files;
        this.prevTermClickerFiles = event.target.files;
        //todo what is this variable used for come back
        // this.totalFilesPrevFinal = this.prevTermFinalExamFile.length;
        this.totalFilesPrevClicker = this.prevTermClickerFiles.length;
        // Since the above will change, use this for display purpose only
        this.displayNumPrevClicker = this.prevTermClickerFiles.length;
      }
    } else {
      if (event.target.files.length === 0) {
        console.log("No folder selected");
        this.currTermClickerFiles = null;
        return;
      }
      this.currTermClickerFiles = event.target.files;
      this.totalFilesCurr = this.currTermClickerFiles.length;
      // Since the above will change, use this for display purpose only
      this.displayNumCurrClicker = this.currTermClickerFiles.length;
    }
  }

  async uploadTermZip(eventZipFile, prevOrCurrTerm) {

    const file = eventZipFile;
    const self = this;
    const promiseArr = prevOrCurrTerm === 0 ? this.prevObjectPromise : this.currObjectPromise;
    const allPercentage = prevOrCurrTerm === 0 ? this.allPercentagePrevious : this.allPercentageCurrent;

    var termId = 'termId';
    await this.db.collection('terms').add({
      all_images: {},
      ind_images: {},
      group_images: {},
      iso_images: {},
      key_images: {},
      class_data: {},
      results: ''
    }).then(function (ref) {
      termId = ref.id;
    });
    if (prevOrCurrTerm === 0) {
      this.generalInfo.prevTermIdVal = termId;
    } else {
      this.generalInfo.currTermIdVal = termId;
    }
    console.log('term id', termId);


    const userObjUpdate = {};
    const termUsed = prevOrCurrTerm === 0 ? this.prevTermName : this.currTermName;
    userObjUpdate[`class_term.${termUsed}`] = termId;
    await this.db.collection('users').doc(this.generalInfo.userIdVal).update(userObjUpdate);

    const termObj = this.db.collection('terms').doc(termId).ref;
    let i = 0;
    console.log(eventZipFile.length);
    for (const ent of eventZipFile) {
      console.log(i);
      i++;
      let filename: string = ent.name;
      // console.log(filename);
      filename = filename.slice(filename.lastIndexOf('/') + 1);
      filename = this.generalInfo.addZero(filename);
      const fileType = filename.slice(filename.lastIndexOf("."));
      if (fileType === '/' || fileType === '.DS_Store' || fileType === '._' || fileType === '' || filename[0] === '_' || filename[0] === '.') {
        // Even though prev clicker never --, the sum will still be the same, as they are uploaded together
        if (prevOrCurrTerm === 0) { self.totalFilesPrev--; } else { self.totalFilesCurr--; }
        continue;
      }

      // console.log(filename);
      // filename = filename
      // let blobFile = new File([val], filename);
      // TODO ALERT: self.task was assigned here
      var filePath = self.generalInfo.userIdVal + "/" + termId + "/" + filename;
      const taskVal = self.storage.upload(filePath, ent);
      const fileRef = self.storage.ref(filePath);
      const _percentage$ = taskVal.percentageChanges();
      allPercentage.push(_percentage$);
      // console.log(self.allPercentage);
      taskVal.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().toPromise().then((url) => {
            if (fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png') {
              let imageObj = {
                correct_answers: [],
                grouping: '',
                matches: {},
                downloadURL: url,
              };
              var x = self.db.collection('images').add(imageObj);
              promiseArr.push(x);
              // console.log(x + "" + typeof x);
              x.then((ref) => {
                if (prevOrCurrTerm === 0) {
                  self.numFilePrev++;
                  console.log("prevRa " + self.numFilePrev + " total: " + self.totalFilesPrev);
                } else { self.numFileCurr++; console.log("currRa " + self.numFileCurr + " total: " + self.totalFilesCurr); }
                const termObjUpdate = {};
                const imageId = ref.id;
                const imageName = filename.slice(0, filename.lastIndexOf('.'));
                const filePrefix = filename[filename.lastIndexOf('_') + 1];
                // console.log(imageName);
                if (filePrefix !== 'C') {
                  termObjUpdate[`all_images.${imageName}`] = imageId;  // todo this is where we update term object
                }
                self.db.collection('terms').doc(termId).update(termObjUpdate);

                if (prevOrCurrTerm === 0 && filePrefix !== 'C') {
                  console.log(imageName, imageId);
                  self.generalInfo.pushImageToPrevAllImages(imageName, imageId);
                  // console.log("find me ra");
                  // console.log(self.generalInfo.prevTermAllImages);
                } else if (prevOrCurrTerm === 1 && filePrefix !== 'C') {
                  self.generalInfo.pushImageToCurrAllImages(imageName, imageId);
                  // console.log(imageName, imageId);
                }
              });

            } else if (fileType === '.csv') {
              termObj.update({
                class_data: firebase.firestore.FieldValue.arrayUnion(filename)
              }).then(() => {
                if (prevOrCurrTerm === 0) {
                  self.numFilePrev++;
                  console.log("prevRa " + self.numFilePrev + " total: " + self.totalFilesPrev);
                } else {
                  self.numFileCurr++;
                  console.log("currRa " + self.numFileCurr + " total: " + self.totalFilesCurr);
                }
              });
            } else if (fileType === '.xml') {
              if (prevOrCurrTerm === 0) {
                self.numFilePrev++;
                console.log("prevRa " + self.numFilePrev + " total: " + self.totalFilesPrev);
                this.prevXmlFiles.push(filename);
              } else {
                self.numFileCurr++;
                console.log("currRa " + self.numFileCurr + " total: " + self.totalFilesCurr);
                this.currXmlFiles.push(filename);
              }
            } else {
              if (prevOrCurrTerm === 0) {
                self.numFilePrev++;
                console.log("prevRa " + self.numFilePrev + " total: " + self.totalFilesPrev);
              } else {
                self.numFileCurr++;
                console.log("currRa " + self.numFileCurr + " total: " + self.totalFilesCurr);
              }
            }
          });
        })
      ).subscribe();
    } // end of for loop looping through files
    if (prevOrCurrTerm === 0) {
      this.allPercentageObservablePrevious = combineLatest(allPercentage)
        .pipe(
          map((percentages) => {
            let result = 0;
            for (const percentage of percentages) {
              result = result + percentage;
            }
            return result / percentages.length;
          }),
          tap(console.log)
        );
    } else {
      this.allPercentageObservableCurrent = combineLatest(allPercentage)
        .pipe(
          map((percentages) => {
            let result = 0;
            for (const percentage of percentages) {
              result = result + percentage;
            }
            return result / percentages.length;
          }),
          tap(console.log)
        );
    }

    forkJoin(allPercentage).subscribe(value => {
      self.startSpinning = true;
      // Promise.all(promiseArr).then( (val)=>{
      //   console.log(promiseArr.length);
      //   console.log("pushed all of one terms object to the database" + val);
      //   self.numTermsPushed++;
      //   if( self.numTermsPushed === 2 || (self.numTermsPushed === 1 && self.usePreexistTerm )) {
      //     console.log("both terms pushed");
      //     self.finishedUpload = true;
      //     self.stopSpinning = true;
      //   }
      // });
    });
  } // end of method

  // Getting all lectures and their images
  pairLectureImage() {
    this.prevXmlFiles.sort();
    this.currXmlFiles.sort();

    let prevTermLectureImages = {};
    let currTermLectureImages = {};

    this.prevXmlFiles.forEach((element: string) => prevTermLectureImages[element.slice(0, element.lastIndexOf('.'))] = []);
    this.currXmlFiles.forEach((element: string) => currTermLectureImages[element.slice(0, element.lastIndexOf('.'))] = []);

    let allPrevKeys = Object.keys(this.generalInfo.prevTermAllImages).sort();
    let allCurrKeys = Object.keys(this.generalInfo.currTermAllImages).sort();

    allPrevKeys.forEach((element: string) => {
      let lectureName = element.slice(0, element.lastIndexOf('_'));
      console.log(lectureName);
      prevTermLectureImages[lectureName].push(this.generalInfo.prevTermAllImages[element]);
    });

    allCurrKeys.forEach((element: string) => {
      let lectureName = element.slice(0, element.lastIndexOf('_'));
      currTermLectureImages[lectureName].push(this.generalInfo.currTermAllImages[element]);
    });

    this.generalInfo.prevTermLectureImage = prevTermLectureImages;
    this.generalInfo.currTermLectureImage = currTermLectureImages;

  }

  // Use this to fill sessionStorage from UPLOAD page
  async onUpload() {
    var self = this;
    // this.finishedUpload = false;
    if (this.prevTermClickerFiles === null && this.prevTermFinalExamFile === null) {
      this.generalInfo.prevTermLoadedFromDatabase = true;
      console.log("find me " + this.generalInfo.prevTermLoadedFromDatabase);
      this.db.collection('terms').doc(this.allPastTermArray[this.prevTermName]).ref.get().then((doc) => {
        if (!doc.exists) {
          console.log("document somethign doesnt exist");
        }
        var prevTermData = doc.data();
        console.log(doc.data());
        self.generalInfo.prevTermAllImages = prevTermData.all_images;
        self.generalInfo.prevTermIndividualImages = prevTermData.ind_images;
        self.generalInfo.prevTermGroupImages = prevTermData.group_images;
        self.generalInfo.prevTermIsoImages = prevTermData.iso_images;
        self.generalInfo.prevTermKeyImages = prevTermData.key_images;
        console.log(self.generalInfo.prevTerm);
      });
    } else {
      let fileStore = [];
      for (const file of this.prevTermClickerFiles) {
        fileStore.push(file);
      }
      for (const file of this.prevTermFinalExamFile) {
        fileStore.push(file);
      }

      //update the totalFiles of totalPrevTermFiles
      this.totalFilesPrev = this.totalFilesPrevClicker + this.totalFilesPrevFinal; // is this an appropriate place to update this var

      this.uploadTermZip(fileStore, 0).then(() => {
        console.log(this.generalInfo.prevTerm);
      });
    }

    if (this.currTermClickerFiles === null) {
      this.generalInfo.currTermLoadedFromDatabase = true;
    } else {
      this.uploadTermZip(this.currTermClickerFiles, 1).then(() => {
        console.log(this.generalInfo.currTerm);
      });
    }

    console.log(this.generalInfo.prevTerm);
    console.log(this.generalInfo.currTerm);

    this.alreadyUpload = true;
    return;

  }

  storeSession() {
    console.log(this.generalInfo.prevTerm);
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/navigator/upload",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
  }

  generateCsv() {
    this.pairLectureImage();

    // Set generalinfo term names
    this.generalInfo.prevTermName = this.prevTermName;
    this.generalInfo.currTermName = this.currTermName;
    this.storeSession();

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    let params: HttpParams;
    let x: Observable<Object>;

    // If not using prev term from database
    if (this.generalInfo.prevTermLoadedFromDatabase !== true) {
      // Prev term
      params = new HttpParams();

      // Begin assigning parameters
      params = params.append('userId', this.generalInfo.userIdVal);
      params = params.append('termId', this.generalInfo.prevTermIdVal);
      params = params.append('xmlFiles', JSON.stringify(this.prevXmlFiles));

      x = this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/createNametable", { headers: headers, params: params });
      x.toPromise().then(() => {
        console.log("Value returned, finished file generation for prev term.");
      });
    }

    // Curr term
    params = new HttpParams();

    // Begin assigning parameters
    params = params.append('userId', this.generalInfo.userIdVal);
    params = params.append('termId', this.generalInfo.currTermIdVal);
    params = params.append('xmlFiles', JSON.stringify(this.currXmlFiles));

    x = this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/createNametable", { headers: headers, params: params });
    x.toPromise().then(() => {
      console.log("Value returned, finished file generation for curr term.");
    });
  }

  logout() {
    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase, this.alreadyUpload === true ? 'navigator/upload' : 'upload', [this.generalInfo.prevTerm, this.generalInfo.currTerm], 0);
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
