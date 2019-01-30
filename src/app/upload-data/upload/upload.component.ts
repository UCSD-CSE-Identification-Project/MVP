import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UploadService } from '../upload.service';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/core/auth.service';
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


  usePreexistTerm: boolean = false;
  prevTermSelected: boolean = false;
  currTermSelected: boolean = false;
  prevTerm: string = '';
  currTerm: string = '';
  prevTermsCreated = [];
  sameCurrTermName: boolean = false;
  samePrevTermName: boolean = false;


  constructor(private uploadService: UploadService,
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
    this.populatePrevTermsList(); //TODO COME BACK HERE AS WELL
    console.log('user id', this.generalInfo.userIdVal);
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

  async fileChanged(event, prevOrCurrTerm) {
    const file = event.target.files[0];
    const self = this;
    self.counter = 0;
    self.totalFiles = 0;
    let promises= [];

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
        filename = filename.slice(filename.lastIndexOf('/')+1,filename.lastIndexOf("."));
        console.log(filename);
        if(fileType === '/' || fileType==='.DS_Store' || fileType==='._' || fileType === '') continue;

        this.zipService.getData(ent).data.subscribe(async function(val) {
          let blobFile = new File([val], filename);
          // TODO ALERT: self.task was assigned here
          self.storage.upload(self.generalInfo.userIdVal +  "/" +filename, blobFile).then(async (taskVal)=>{
            //self.counter = self.counter + 1;

            if (filename[0] === '.') return;
            console.log(fileType);
            if( fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png'){
              let pathToFile = self.generalInfo.userIdVal + '/' + filename;
              // URL
              await firebase.storage().ref().child( pathToFile ).getDownloadURL().then(function (url) {
                let imageObj = {
                  correct_answers: [],
                  grouping: '',
                  matches: '',
                  downloadURL: url,
                  ocrText: '',
                  imageHash: ''
                };

                const imagePromise = self.db.collection('images').add(imageObj).then((ref) =>{
                  const termObjUpdate = {};
                  const imageId = ref.id;
                  const imageName = filename;
                  termObjUpdate[`all_images.${imageName}`] = imageId;
                  self.db.collection('terms').doc(termId).update(termObjUpdate);
                  // termObj.update({
                  //   all_images: firebase.firestore.FieldValue.arrayUnion(ref.id)
                  // });
                  if (prevOrCurrTerm === 0){
                    self.generalInfo.pushImageToPrevAllImages(imageName, imageId);
                    console.log("general info prev all images", self.generalInfo.prevTermAllImages);
                  } else {
                    self.generalInfo.pushImageToCurrAllImages(imageName, imageId);
                    console.log("general info curr all images", self.generalInfo.currTermAllImages);
                  }
                }); // end of pushing image to db

                promises.push(imagePromise);
              }); // end of getting url for image
            } // end of if statement
            else if ( fileType === '.csv') {
              termObj.update({
                class_data: firebase.firestore.FieldValue.arrayUnion(filename)
              });
            } // end of else if
          });
          // self.progress = self.task.percentageChanges();



        }); // end of unzip service that gets data from zipped entry
      } // end of for loop looping through files
    }); //gets entries from zipped file

    this.counter = 0;
    this.percentage = 0;
  } // end of method

  onUpload(){
    console.log("in on upload");
  }
  // TODO add terms to the prev term category
  /*async onUpload() {
    var self = this;
    //TODO
    // File type checking, client side validation, mirror logic in backend storage rules

    // Generate "unique" file path
    //let path = `test/${new Date().getTime()}_${file.name}`;

    // Optional metadata

    const fd = new FormData();

    //Term
    let prev_termObj = {
      all_images: [],
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: [],
      results: ''
    };

    let curr_termObj = {
      all_images: [],
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: [],
      results: ''
    };

    let userObj = {
      class_term: {},
      name: this.userName,
      // username: '', DO WE WANT USER NAME ALSO
      email: ''
    };

    // Upload task
    for (let i = 0; i < this.files.length; i++) {
      for (let j = 0; j < this.files[i].length; j++) {
        this.fileNames.push(this.files[i][j].name);
        this.task = this.storage.upload(this.userName + '/' + this.files[i][j].name, this.files[i][j]);


        // Progress monitoring
        this.progress = this.task.percentageChanges();
        this.snapshot = this.task.snapshotChanges();
        console.log(this.files[i][j].name);

        // URL
        //await firebase.storage().ref().child(this.userName + '/' +this.files[i][j].name).getDownloadURL().then(function (url) {
        //  self.path = url;
        //});

        // get notified when the download URL is available
        this.task.snapshotChanges().pipe(
          finalize(() => this.downloadURL = this.storage.ref(this.userName + '/' + this.files[i][j].name).getDownloadURL())
        ).subscribe();

        // MAKE SURE LAST MINUTE
        // TODO: HAVE ALL OF THESE HERE AND THEN SEE IF WE JUST WANT TO PUSH AND UPDATE LATER
        // OR IF WE WANT TO HAVE ALL FIELDS PUSHED WHEN WE FIRST PUSH

        console.log("Snapshot finished, URL is " + this.downloadURL);
        let imageObj = {
          correct_answers: [],
          grouping: '',
          matches: '',
          downloadURL: this.path,
          ocrText: '',
          imageHash:''
          // URL: this.path, // TODO DO WE WANT THIS HERE
        };

        await this.db.collection('images').add(imageObj).then(function(ref){
          prev_termObj.all_images.push(ref.id);
        });
      }
    }
    var termId;
    await this.db.collection('terms').add(prev_termObj).then(function(ref){
      termId = ref.id;
    });

    userObj.class_term["CSE100FALL2018"] = termId;
    userObj.class_term["CSE101FALL2018"] = termId;

    this.db.collection('users').doc(this.userName).set(userObj);

    this.setData = this.fileNames;

  }
  */

  dropZoneUpload(fileList) {
    this.task = this.storage.upload('dropZone' + '/' + 'test', fileList[0]);
  }
}
