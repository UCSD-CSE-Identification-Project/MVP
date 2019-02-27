import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
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
  counter = 0;
  totalFiles = 0;
  fileNames: string[] = [];
  path: string = '';
  alreadyUpload: boolean;

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

  uploadPercentage: Observable<number>;
  snapshot: Observable<any>;
  numBytesTransferLocal = 0;
  numBytesTransferTotal = 0;
  numByteTotal = 0;
  allPercentage = [];
  allPercentageObservable: Observable<any>;
  prevObjectPromise = [];
  currObjectPromise = [];
  numTermsPushed: number;

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
    this.populatePrevTermsList(); //TODO COME BACK HERE AS WELL
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
    if (prevOrCurrTerm === 0) {
      this.prevTermZip = event.target.files;
    } else {
      this.currTermZip = event.target.files;
    }
  }

  async uploadTermZip(eventZipFile, prevOrCurrTerm) {

    const file = eventZipFile;
    const self = this;
    const promiseArr = prevOrCurrTerm === 0 ? this.prevObjectPromise: this.currObjectPromise;
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
    for (const ent of eventZipFile) {
      let filename : string = ent.name;
      // console.log(filename);
      filename = filename.slice(filename.lastIndexOf('/')+1);
      const fileType = filename.slice(filename.lastIndexOf("."));
      if(fileType === '/' || fileType==='.DS_Store' || fileType==='._' || fileType === '') continue;

      if (filename[0] === '_' || filename[0] === '.') continue;
      console.log(filename);
      // filename = filename
      // let blobFile = new File([val], filename);
      // TODO ALERT: self.task was assigned here
      var filePath = self.generalInfo.userIdVal + "/" + termId + "/" + filename;
      const taskVal = self.storage.upload(filePath, ent);
      const fileRef = self.storage.ref(filePath);
      const _percentage$ = taskVal.percentageChanges();
      self.allPercentage.push(_percentage$);
      // console.log(self.allPercentage);
      taskVal.snapshotChanges().pipe(
        finalize(()=>{
          fileRef.getDownloadURL().toPromise().then((url)=>{
            self.counter = self.counter + 1;
            self.percentage = self.counter / self.totalFiles*100;
            if (fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png') {
              let imageObj = {
                correct_answers: [],
                grouping: '',
                matches: {},
                downloadURL: url,
              };
              var x = self.db.collection('images').add(imageObj);
              console.log(x + "" + typeof x);
              x.then((ref) =>{
                const termObjUpdate = {};
                const imageId = ref.id;
                const imageName = filename;
                console.log(imageName);
                // termObjUpdate[`all_images.${imageName}`] = imageId;  // todo this is where we update term object
                // self.db.collection('terms').doc(termId).update(termObjUpdate);
                const filePrefix = filename[filename.lastIndexOf('_')+1];
                if (prevOrCurrTerm === 0 && filePrefix !== 'C'){
                  self.generalInfo.pushImageToPrevAllImages(imageName, imageId);
                } else if( prevOrCurrTerm === 1 && filePrefix !== 'C') {
                  self.generalInfo.pushImageToCurrAllImages(imageName, imageId);
                }
              });

              promiseArr.push(x);
            } else if(fileType === '.csv'){
              termObj.update({
                class_data: firebase.firestore.FieldValue.arrayUnion(filename)
              });
            }
          });
        })
      ).subscribe();
    } // end of for loop looping through files

    this.allPercentageObservable = combineLatest(this.allPercentage)
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

    forkJoin(this.allPercentage).subscribe( value => {
      Promise.all(promiseArr).then( (val)=>{
        console.log("pushed all of one terms object to the database" + val);
        self.numTermsPushed++;
        if( self.numTermsPushed === 2) {
          console.log("both terms pushed");
          self.finishedUpload = true;
        }
      });
    });
  } // end of method

  // Use this to fill sessionStorage from UPLOAD page
  async onUpload(){
    var self = this;
    // this.finishedUpload = false;
    if ( this.prevTermZip === null ){
      this.generalInfo.prevTermLoadedFromDatabase = true;
      this.db.collection('terms').doc(this.allPastTermArray[this.prevTerm]).ref.get().then((doc) => {
        if ( ! doc.exists ) {
          console.log("document somethign doesnt exist");
        }
        var prevTermData = doc.data();
        self.generalInfo.prevTermAllImages = prevTermData.allTermImages;
        self.generalInfo.prevTermIndividualImages = prevTermData.individualImages;
        self.generalInfo.prevTermGroupImages = prevTermData.groupImages;
        self.generalInfo.prevTermIsoImages = prevTermData.isoImages;
        self.generalInfo.prevTermKeyImages = prevTermData.keyImages;
      });
    } else {
      this.uploadTermZip(this.prevTermZip, 0);
    }

    if ( this.currTermZip === null ) {
      this.generalInfo.currTermLoadedFromDatabase = true;
    } else {
      this.uploadTermZip(this.currTermZip, 1);
    }
    // this.finishedUpload = true;

    // Promise.all(prms).then(()=>{
    //   console.log("this is the then message");
    //   self.finishedUpload = true;
    //   // this.generalInfo.makePostRequest();
    //   let object:termData = {
    //     logoutUrl: "/",
    //     prevTermInfo: self.generalInfo.prevTerm,
    //     currTermInfo: self.generalInfo.currTerm,
    //     imageIndex: 0
    //   };
    //   console.log(self.generalInfo.prevTerm);
    //   console.log(self.generalInfo.currTerm);
    //
    //   self.alreadyUpload = true;
    //   self.authService.setStorage("session", object);
    //
    // }).catch((error)=>{
    //   console.log(error);
    // });
    // this.finishedUpload = true;
    console.log("this is the previous message");
    return;

  }

  logout() {
    this.authService.logout(this.alreadyUpload === true ? 'navigator/upload' : 'upload', [this.generalInfo.prevTerm, this.generalInfo.currTerm], 0);
  }
}
