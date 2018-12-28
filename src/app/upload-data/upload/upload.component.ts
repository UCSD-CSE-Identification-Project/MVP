import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UploadService } from '../upload.service';
import * as firebase from 'firebase';
import { TreeNode } from '@angular/router/src/utils/tree';
import { AuthService } from 'src/app/core/auth.service';
import {ZipService} from '../../unzipFolder/zip.service';
import {ArrayType} from '@angular/compiler';

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
  prevTermsCreated: String[];


  constructor(private uploadService: UploadService,
              private storage: AngularFireStorage,
              private db: AngularFirestore,
              private authService: AuthService,
              private zipService: ZipService) {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  populatePrevTermsList(){
    const self = this;

    this.uploadService.getTermNames().then((prevTermList)=>{
      self.prevTermsCreated = prevTermList;
      console.log(self.prevTermsCreated);
    });
  }

  ngOnInit() {
    this.populatePrevTermsList(); //TODO COME BACK HERE AS WELL
  }

  onFilesSelected(event, index) {
    const fileList = event.target.files;
    this.files[index] = fileList;
  }

  async fileChanged(event, prevOrCurrTerm) {
    const file = event.target.files[0];
    const self = this;
    let promises= [];
    let termObj = {
      all_images: [],
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: [],
      results: ''
    };

    this.zipService.getEntries(file).subscribe( async (next) => {

      for (const ent of next) {
        let filename : string = ent.filename;
        const fileType = filename.slice(filename.indexOf("."));
        if(fileType === '/' || fileType==='.DS_Store' || fileType==='._.DS_Store') continue;
        this.zipService.getData(ent).data.subscribe(async function(val) {

          let blobFile = new File([val], filename);
          self.task =  self.storage.upload(self.authService.getUser() +  "/" +filename, blobFile);


          if( fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png'){
            let pathToFile = self.authService.getUser() + '/' + filename;
            // URL
            await firebase.storage().ref().child( pathToFile ).getDownloadURL().then(function (url) {
              let imageObj = {
                correct_answers: [],
                grouping: '',
                matches: '',
                downloadURL: url,
                ocrText: '',
                imageHash:''
              };
              const imagePromise = self.db.collection('images').add(imageObj).then(function(ref){
                termObj.all_images.push(ref.id);
              });
              promises.push(imagePromise);
            });


          }
          else if( fileType === '.csv') {
            const termPromise = new Promise(function (resolve, reject){
                termObj.class_data.push(filename)
            });
            promises.push(termPromise);
          }

        }); // end of unzip service that gets data from zipped entry
      } // end of for loop looping through files
      await Promise.all(promises).then(()=>{
        self.printDone();
        self.updateTermAndUser(termObj,prevOrCurrTerm);
      }).catch(function(err) {
        // Will catch failure of first failed promise
        console.log("Failed:", err);
      });
    }); //gets entries from zipped file


  } // end of method

  async fileChanged(somethingelse: string, prevOrCurrTerm: number){

    // upload empty term object and save termId
    var termId = 'termId';
    await this.db.collection('terms').add({
      all_images: [],
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: [],
      results: ''
    }).then(function(ref) {
      termId = ref.id;
    });
    console.log('term id', termId);

    //get user object for current user
    // var userObj = null;
    // await this.db.collection('users').doc(this.authService.getUser()).ref.get().then(function (userObject) {
    //   userObj = userObject.data();
    // });
    //
    // // upload termobjectId to user in database
    // if (prevOrCurrTerm === 0){
    //   userObj.class_term[this.prevTerm] = termId;
    // } else{
    //   userObj.class_term[this.currTerm] = termId;
    // }
    // await this.db.collection('users').doc(this.authService.getUser()).update(userObj);
    var userObjUpdate = {};
    userObjUpdate[`class_term.${this.prevTerm}`] = termId;
    await this.db.collection('users').doc(this.authService.getUser()).update(userObjUpdate);

    var termObj = this.db.collection('terms').doc(termId).ref;

    termObj.update({
      all_images: firebase.firestore.FieldValue.arrayUnion(imageId)
    });
  }

  printDone(){
    console.log("done");
  }

  // term object is a map
  async updateTermAndUser(termObject: any, prevOrCurrTerm: number){
    console.log(termObject.all_images);
    var userObj = null;
    await this.db.collection('users').doc(this.authService.getUser()).ref.get().then(function (userObject) {
      userObj = userObject.data();
    });

    var termId = 'termId';
    await this.db.collection('terms').add({
      all_images: termObject.all_images,
      ind_images: [],
      group_images: [],
      iso_images: [],
      class_data: termObject.class_data,
      results: ''
    }).then(function(ref) {
      termId = ref.id;
      console.log("uploaded to term", termId);
      console.log(termObject);
    });

    if (prevOrCurrTerm === 0){
      userObj.class_term[this.prevTerm] = termId;
    } else{
      userObj.class_term[this.currTerm] = termId;
    }
    await this.db.collection('users').doc(this.authService.getUser()).update(userObj);
  }

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
