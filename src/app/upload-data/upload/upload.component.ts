import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UploadService } from '../upload.service';
import * as firebase from 'firebase';
import { AuthService, termData } from 'src/app/core/auth.service';
import {ZipService} from '../../unzipFolder/zip.service';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})

export class UploadComponent implements OnInit {
  // Access to Observable, allow to pause, resume, cancel upload
  task: AngularFireUploadTask;

  // Upload progress
  progress: Observable<number>;
  snapshot: Observable<any>;

  // Download URL, removed in the new firebase update, need to find a work-around
  downloadURL: Observable<string>;

  // Dropzone css toggling
  isHovering: boolean;

  userName: string;

  files: File[][] = [[], []];
  percentage = 0;
  counter = 0;
  totalFiles = 0;
  fileNames: string[] = [];
  path: string = '';
  prev_files: string[];
  curr_files: string[];
  imageIds: string[] = [];
  alreadyUpload: boolean;

  usePreexistTerm: boolean = false;
  prevTermSelected: boolean = false;
  currTermSelected: boolean = false;
  prevTerm: string = '';
  currTerm: string = '';
  prevTermsCreated = [];
  sameCurrTermName: boolean = false;
  samePrevTermName: boolean = false;

  prevTermZip: any = null;
  currTermZip: any = null;

  finishedUpload: boolean = false;

  constructor( private http: HttpClient,
              private uploadService: UploadService,
              private storage: AngularFireStorage,
              private db: AngularFirestore,
              private authService: AuthService,
              private zipService: ZipService,
              private generalInfo: UserTermImageInformationService) {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  populatePrevTermsList(){
    const self = this;

    this.uploadService.getTermNames().then((prevTermList)=>{
      self.prevTermsCreated = Object.keys(prevTermList);
      console.log(self.prevTermsCreated);
    });
  }

  ngOnInit() {
    this.alreadyUpload = false;
    this.counter = 0;
    this.totalFiles = 0;
    this.populatePrevTermsList(); //TODO COME BACK HERE AS WELL
  }


  async checkPrevTermName() {
    this.samePrevTermName = false;
    for (var i=0; i<this.prevTermsCreated.length; i++){
      if (this.prevTerm === this.prevTermsCreated[i]) {
        this.samePrevTermName = true;
      }
    }
  }

  async checkCurrTermName() {
    this.sameCurrTermName = false;
    for (var i=0; i<this.prevTermsCreated.length; i++){
      if (this.currTerm === this.prevTermsCreated[i]) {
        this.sameCurrTermName = true;
      }
    }
  }

  tempStore(event, prevOrCurrTerm) {
    if (prevOrCurrTerm === 0) {
      this.prevTermZip = event.target.files[0];
    } else {
      this.currTermZip = event.target.files[0];
    }
  }

  async uploadTermZip(eventZipFile, prevOrCurrTerm) {

    const file = eventZipFile;
    const self = this;

    var termId = 'termId';
    await this.db.collection('terms').add({
      all_images: {},
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: [],
      results: ''
    }).then(function(ref) {
      termId = ref.id;
    });
    if(prevOrCurrTerm === 0){
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

    this.zipService.getEntries(file).subscribe( async (next) => {
      this.totalFiles = next.length;
      for (const ent of next) {
        self.counter = self.counter + 1;
        self.percentage = self.counter / this.totalFiles*100;
        let filename : string = ent.filename;
        const fileType = filename.slice(filename.lastIndexOf("."));
        if(fileType === '/' || fileType==='.DS_Store' || fileType==='._' || fileType === '') continue;

        this.zipService.getData(ent).data.subscribe(async function(val) {

          let blobFile = new File([val], filename);
          // TODO ALERT: self.task was assigned here
          self.storage.upload(self.generalInfo.userIdVal +  "/" + termId + "/" +filename, blobFile).then(async (taskVal)=>{
            if (filename[0] === '.') return;
            if( fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png'){
              let pathToFile = self.generalInfo.userIdVal + '/' + termId + "/" + filename;
              // URL
              await firebase.storage().ref().child( pathToFile ).getDownloadURL().then(function (url) {
                let imageObj = {
                  correct_answers: [],
                  grouping: '',
                  matches: {},
                  downloadURL: url,
                };

                const imagePromise = self.db.collection('images').add(imageObj).then((ref) =>{
                  const termObjUpdate = {};
                  const imageId = ref.id;
                  const imageName = filename;
                  termObjUpdate[`all_images.${imageName}`] = imageId;
                  self.db.collection('terms').doc(termId).update(termObjUpdate);
                  const filePrefix = filename[filename.lastIndexOf('_')+1];
                  if (prevOrCurrTerm === 0 && filePrefix !== 'C'){
                    self.generalInfo.pushImageToPrevAllImages(imageName, imageId);
                  } else if( prevOrCurrTerm === 1 && filePrefix !== 'C') {
                    self.generalInfo.pushImageToCurrAllImages(imageName, imageId);
                  }
                }); // end of pushing image to db
              }); // end of getting url for image
            } // end of if statement
            else if ( fileType === '.csv') {
              termObj.update({
                class_data: firebase.firestore.FieldValue.arrayUnion(filename)
              });
            } // end of else if
          });
        }); // end of unzip service that gets data from zipped entry
      } // end of for loop looping through files
    }); //gets entries from zipped file

  } // end of method

  // Use this to fill sessionStorage from UPLOAD page
  async onUpload(){
    var self = this;
    this.finishedUpload = false;
    var prms = [];
    prms.push(this.uploadTermZip(this.prevTermZip, 0));
    prms.push(this.uploadTermZip(this.currTermZip, 1));
    Promise.all(prms).then(()=>{
      console.log("this is the then message");
      self.finishedUpload = true;
      // this.generalInfo.makePostRequest();
      let object:termData = {
        logoutUrl: "/",
        prevTermInfo: self.generalInfo.prevTerm,
        currTermInfo: self.generalInfo.currTerm,
        imageIndex: 0
      };
      console.log(self.generalInfo.prevTerm);
      console.log(self.generalInfo.currTerm);

      self.alreadyUpload = true;
      self.authService.setStorage("session", object);

    }).catch((error)=>{
      console.log(error);
    });
    // this.finishedUpload = true;
    console.log("this is the previous message");
    return;

  }

  logout() {
    this.authService.logout(this.alreadyUpload === true ? 'navigator/upload' : 'upload', [this.generalInfo.prevTerm, this.generalInfo.currTerm], 0);
  }
}
