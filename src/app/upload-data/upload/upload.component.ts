import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import {combineLatest, forkJoin, Observable} from 'rxjs';
import { UploadService } from '../upload.service';
import * as firebase from 'firebase';
import { AuthService, termData } from 'src/app/core/auth.service';
import {ZipService} from '../../unzipFolder/zip.service';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {finalize, map, tap} from 'rxjs/internal/operators';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnInit {
  progress: Observable<number>;

  // Download URL, removed in the new firebase update, need to find a work-around
  downloadURL: Observable<string>;

  files: File[][] = [[], []];
  percentage = 0;
  uploadPercentage: Observable<number>;
  snapshot: Observable<any>;
  numBytesTransferLocal = 0;
  numBytesTransferTotal = 0;
  numByteTotal = 0;
  fileNames: string[] = [];
  counter = 0;
  totalFiles = 0;
  path: string = '';
  alreadyUpload: boolean;
  prevXmlFiles: string[] = [];
  currXmlFiles: string[] = [];

  usePreexistTerm: boolean = false;
  prevTerm: string = '';
  currTerm: string = '';
  prevTermsCreated = [];
  sameCurrTermName: boolean = false;
  samePrevTermName: boolean = false;

  prevTermZip: any = null;
  currTermZip: any = null;

  finishedUpload: boolean = false;
  allPastTermArray: any = null;

  totalFilesPrev;
  totalFilesCurr;
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

  constructor( private http: HttpClient,
              private uploadService: UploadService,
              private storage: AngularFireStorage,
              private db: AngularFirestore,
              private authService: AuthService,
              private zipService: ZipService,
              private generalInfo: UserTermImageInformationService) {
  }

  populatePrevTermsList(){
    const self = this;

    this.uploadService.getTermNames().then((prevTermList)=>{
      self.allPastTermArray = prevTermList;
      self.prevTermsCreated = Object.keys(prevTermList);
      console.log(self.prevTermsCreated);
    });
  }

  ngOnInit() {
    this.alreadyUpload = false;
    this.counter = 0;
    this.totalFiles = 0;
    this.prevTermZip = null;
    this.currTermZip = null;
    this.allPastTermArray = null;
    this.numTermsPushed = 0;
    this.finishedUpload = false;
    this.startSpinning = false;
    this.stopSpinning = false;
    this.populatePrevTermsList(); //TODO COME BACK HERE AS WELL
    this.authService.clearStorage();
    //console.log(this.generalInfo.prevTerm);
    //console.log(this.generalInfo.currTerm);
  }


  checkPrevTermName() {
    this.samePrevTermName = false;
    for (var i=0; i<this.prevTermsCreated.length; i++){
      if (this.prevTerm === this.prevTermsCreated[i]) {
        this.samePrevTermName = true;
      }
    }
  }

  checkCurrTermName() {
    this.sameCurrTermName = false;
    for (var i=0; i<this.prevTermsCreated.length; i++){
      if (this.currTerm === this.prevTermsCreated[i]) {
        this.sameCurrTermName = true;
      }
    }
  }

  tempStore(event, prevOrCurrTerm) {
    // for ( const files of event.target.files ) {
    //   console.log(files.name);
    // }
    if( event.target.files.length === 0 ){
      console.log(this.prevTermZip);
      return;
    }

    if (prevOrCurrTerm === 0) {
      this.prevTermZip = event.target.files;
      this.totalFilesPrev = this.prevTermZip.length;
    } else {
      this.currTermZip = event.target.files;
      this.totalFilesCurr = this.currTermZip.length;
    }
    // console.log(event.target.files);
    // console.log(event);
  }

  async uploadTermZip(eventZipFile, prevOrCurrTerm) {

    const file = eventZipFile;
    const self = this;
    const promiseArr = prevOrCurrTerm === 0 ? this.prevObjectPromise: this.currObjectPromise;
    const allPercentage = prevOrCurrTerm === 0 ? this.allPercentagePrevious: this.allPercentageCurrent;
    var termId = 'termId';
    await this.db.collection('terms').add({
      all_images: {},
      ind_images: {},
      group_images: {},
      iso_images: {},
      key_images:{},
      class_data: {},
      results: ''
    }).then(function(ref) {
      termId = ref.id;
    });
    if ( prevOrCurrTerm === 0){
      this.generalInfo.prevTermIdVal = termId;
    } else {
      this.generalInfo.currTermIdVal = termId;
    }
    console.log('term id', termId);


    const userObjUpdate = {};
    const termUsed = prevOrCurrTerm === 0 ? this.prevTerm : this.currTerm;
    userObjUpdate[`class_term.${termUsed}`] = termId;
    await this.db.collection('users').doc(this.generalInfo.userIdVal).update(userObjUpdate);

    const termObj = this.db.collection('terms').doc(termId).ref;
    let i = 0;
    console.log(eventZipFile.length);
    for (const ent of eventZipFile) {
      console.log(i);
      i++;
      let filename : string = ent.name;
      // console.log(filename);
      filename = filename.slice(filename.lastIndexOf('/')+1);
      filename = this.generalInfo.addZero(filename);
      const fileType = filename.slice(filename.lastIndexOf("."));
      if(fileType === '/' || fileType==='.DS_Store' || fileType==='._' || fileType === '' || filename[0] === '_' || filename[0] === '.') {
        if ( prevOrCurrTerm === 0 ){ self.totalFilesPrev--;} else{ self.totalFilesCurr--;}
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
        finalize(()=>{
          fileRef.getDownloadURL().toPromise().then((url)=>{
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
              x.then((ref) =>{
                if ( prevOrCurrTerm === 0 ){
                  self.numFilePrev++;
                  console.log("prevRa " + self.numFilePrev + " total: " + self.totalFilesPrev);
                } else{ self.numFileCurr++; console.log("currRa "+ self.numFileCurr + " total: " + self.totalFilesCurr);}
                const termObjUpdate = {};
                const imageId = ref.id;
                const imageName = filename.slice(0,filename.lastIndexOf('.'));
                const filePrefix = filename[filename.lastIndexOf('_')+1];
                // console.log(imageName);
                if (filePrefix !== 'C') {
                  termObjUpdate[`all_images.${imageName}`] = imageId;  // todo this is where we update term object
                }
                self.db.collection('terms').doc(termId).update(termObjUpdate);

                if (prevOrCurrTerm === 0 && filePrefix !== 'C'){
                  console.log(imageName, imageId);
                  self.generalInfo.pushImageToPrevAllImages(imageName, imageId);
                  // console.log("find me ra");
                  // console.log(self.generalInfo.prevTermAllImages);
                } else if( prevOrCurrTerm === 1 && filePrefix !== 'C') {
                  self.generalInfo.pushImageToCurrAllImages(imageName, imageId);
                  // console.log(imageName, imageId);
                }
              });

            } else if(fileType === '.csv'){
              termObj.update({
                class_data: firebase.firestore.FieldValue.arrayUnion(filename)
              }).then(()=>{
                if ( prevOrCurrTerm === 0 ){
                  self.numFilePrev++;
                  console.log("prevRa " + self.numFilePrev+" total: " + self.totalFilesPrev);
                } else{
                  self.numFileCurr++;
                  console.log("currRa "+ self.numFileCurr+" total: " + self.totalFilesCurr);
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
              if ( prevOrCurrTerm === 0 ){
                self.numFilePrev++;
                console.log("prevRa " + self.numFilePrev+" total: " + self.totalFilesPrev);
              } else{
                self.numFileCurr++;
                console.log("currRa "+ self.numFileCurr+" total: " + self.totalFilesCurr);
              }
            }
          });
        })
      ).subscribe();
    } // end of for loop looping through files
    if (prevOrCurrTerm === 0 ){
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

    forkJoin(allPercentage).subscribe( value => {
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

  // Use this to fill sessionStorage from UPLOAD page
  async onUpload(){
    var self = this;
    // this.finishedUpload = false;
    if ( this.prevTermZip === null ){
      this.generalInfo.prevTermLoadedFromDatabase = true;
      console.log("find me " + this.generalInfo.prevTermLoadedFromDatabase);
      this.db.collection('terms').doc(this.allPastTermArray[this.prevTerm]).ref.get().then((doc) => {
        if ( ! doc.exists ) {
          console.log("document somethign doesnt exist");
        }
        var prevTermData = doc.data();
        console.log(doc.data());
        self.generalInfo.prevTermAllImages = prevTermData.all_images;
        self.generalInfo.prevTermIndividualImages = prevTermData.ind_images;
        self.generalInfo.prevTermGroupImages = prevTermData.group_images;
        self.generalInfo.prevTermIsoImages = prevTermData.iso_images;
        self.generalInfo.prevTermKeyImages = prevTermData.key_images;
      });
    } else {
      this.uploadTermZip(this.prevTermZip, 0).then(()=>{
        console.log(this.generalInfo.prevTerm);
      });
    }

    if ( this.currTermZip === null ) {
      this.generalInfo.currTermLoadedFromDatabase = true;
    } else {
      this.uploadTermZip(this.currTermZip, 1).then(()=>{
        console.log(this.generalInfo.currTerm);
      });
    }

    console.log(this.generalInfo.prevTerm);
    console.log(this.generalInfo.currTerm);

    this.alreadyUpload = true;
    return;

  }

  generateCsv() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    // Prev term
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('userId', this.generalInfo.userIdVal);
    params = params.append('termId', this.generalInfo.prevTermIdVal);
    params = params.append('xmlFiles', JSON.stringify(this.prevXmlFiles));

    let x = this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/createNametable", { headers: headers, params: params });
    x.toPromise().then(() => {
      console.log("value returned");
    });

    // Curr term
    params = new HttpParams();

    // Begin assigning parameters
    params = params.append('userId', this.generalInfo.userIdVal);
    params = params.append('termId', this.generalInfo.currTermIdVal);
    params = params.append('xmlFiles', JSON.stringify(this.currXmlFiles));

    x = this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/createNametable", { headers: headers, params: params });
    x.toPromise().then(() => {
      console.log("value returned");
    });
  }

  logout() {
    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase ,this.alreadyUpload === true ? 'navigator/upload' : 'upload', [this.generalInfo.prevTerm, this.generalInfo.currTerm], 0);
  }
}
