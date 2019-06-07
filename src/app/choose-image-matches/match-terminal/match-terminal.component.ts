import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {forkJoin, Observable} from 'rxjs';
import { AuthService, termData } from 'src/app/core/auth.service';
import {analyzeAndValidateNgModules} from '@angular/compiler';
import {MatDialogModule, MatDialog, MatDialogRef} from '@angular/material/dialog';



@Component({
  selector: 'app-match-terminal',
  templateUrl: './match-terminal.component.html',
  styleUrls: ['./match-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTerminalComponent implements OnInit {

  termMatching;
  matchBar;
  imagesFinished: boolean;
  matchesFinished: boolean = false;
  // imageInd: number = 0;
  logoutEnabled: boolean = false;
  curPic;
  chooseToShowAll: boolean = false;
  border;
  prevTermName;
  currTermName;
  prevTermImageAnswer: any;
  constructor(private db: AngularFirestore, private generalInfo: UserTermImageInformationService, private ref: ChangeDetectorRef, private authService: AuthService,private dialog: MatDialog){
  }

  // Execute right after constructor
  ngOnInit() {

    // this.border = { 'border-style': 'solid', 'border-width': '1px', 'border-color': 'black'};
    this.prevTermName = this.generalInfo.prevTermName;
    this.currTermName = this.generalInfo.currTermName;
    this.matchesFinished = false;
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    // this.imageInd = data.lectureOrImageIndex;
    console.log(this.generalInfo.prevTermAllImages);
    this.termMatching = this.createChooseMatchesTermObject(Object.assign({}, this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermGroupImages, this.generalInfo.prevTermIsoImages), data.lectureOrImageIndex);


    // add code where you will skip the first image if the matching algorithm is really confident
    this.curPic = this.db.collection('images').doc(this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.termMatching.imageIndex]]).valueChanges().subscribe((val)=>{
      this.prevTermImageAnswer = val["correct_answers"];
      console.log(val);
      console.log(Object.keys(val["matches"]).length);
      var mat = Object.keys(val["matches"]);
      var lenMatch = mat.length;
      var containsCurrTerm = this.generalInfo.currTermIdVal in val["matches"];
      console.log(lenMatch);
      console.log(containsCurrTerm);
      console.log(this.generalInfo.currTermIdVal);
      console.log(val["matches"]);
      if ( lenMatch > 0 && containsCurrTerm && Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length > 0 && !this.chooseToShowAll) {
        this.matchesFinished = true;
        this.matchBar = this.createMatchBarObject(data.lectureOrImageIndex);
        this.chooseToShowAll = false;
        this.completeMatchBarObject().then(()=>{
          this.ref.detectChanges();
        });
        // this.logoutEnabled = true;
      }
    });
  }

  createMatchBarObject(imageIndex: number){
    let obj = {
      matchIds: [],
      matchUrl: [],
      matchBorderStyle: [],
      keyImgIndex: imageIndex,
      keyImgUrl: null,
      selectedURL: '',
      indexSelected: -1,
    };
    return obj;
  }
  async completeMatchBarObject() {
    var self = this;
    this.matchBar.keyImgUrl = this.getKeyImageURL(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]);
    await this.populateIdsOfMatches(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]);
    this.populateImageURLMatches();
    this.matchBar.selectedURL = this.matchBar.matchUrl[0];
    this.matchBar.indexSelected = 0;
    for ( var i = 0; i < this.matchBar.matchIds.length; i++ ) this.matchBar.matchBorderStyle.push({ 'border-style': 'solid', 'border-width': '1px', 'border-color': 'black'});
    this.matchBar.matchBorderStyle[0]['border-color'] = 'green';
    this.matchBar.matchBorderStyle[0]['border-width'] = '5px';
    // this.ref.detectChanges();
    /*
    this.populateIdsOfMatches(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]).then(()=>{
      self.populateImageURLMatches();
      self.matchBar.selectedURL = self.matchBar.matchUrl[0];
      self.matchBar.indexSelected = 0;
      for ( var i = 0; i < self.matchBar.matchIds.length; i++ ) self.matchBar.matchBorderStyle.push({ 'border-style': 'solid', 'border-width': '1px', 'border-color': 'black'});
      self.matchBar.matchBorderStyle[0]['border-color'] = 'green';
      self.matchBar.matchBorderStyle[0]['border-width'] = '5px';
      self.ref.detectChanges();
    });
    */
  }
  createChooseMatchesTermObject(imgNames, imgIndex){
    let obj = {
      imageNames: {},
      imageIndex: imgIndex,
      imageKeysSorted: [],
      termFinishedMatching: false,
      numImages: 0,
    };

    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a,b) => a.localeCompare(b));
    obj.numImages = obj.imageKeysSorted.length;
    return obj;
  }

  // imageKey here refers what the id of that image is
  getKeyImageURL(imageKey: string){
    return this.db.collection('images').doc(this.termMatching.imageNames[imageKey]).ref.get();
  }

  async populateIdsOfMatches( imageKey: string ){
    let matches;
    let sortable = [];
    var self = this;
    await this.db.collection('images').doc(this.termMatching.imageNames[imageKey]).ref.get().then((doc)=>{
      if (doc.exists){
        matches = doc.data().matches[self.generalInfo.currTermIdVal]; // todo pull the term match and not entire object
        for (var imgId in matches ) {
          sortable.push([imgId, matches[imgId]]);
        }

        sortable.sort(function(a, b) {
          return b[1] - a[1];
        });
      }
    });
    for (var i of sortable){
      this.matchBar.matchIds.push(i[0]);
    }
    console.log(this.matchBar.matchIds);
  }

  populateImageURLMatches(){
    console.log(this.matchBar.matchIds.length);
    for (var id of this.matchBar.matchIds){
      // console.log(id);
      this.matchBar.matchUrl.push(this.db.collection('images').doc(id).ref.get());
    }
  }
  imgClick( index: number, test: any) {
    console.log(test);
    this.matchBar.matchBorderStyle[this.matchBar.indexSelected]['border-color'] = 'black';
    this.matchBar.matchBorderStyle[this.matchBar.indexSelected]['border-width'] = '1px';

    console.log(index);
    console.log(this.matchBar.matchUrl[index]);
    this.matchBar.selectedURL = this.matchBar.matchUrl[index];
    this.matchBar.indexSelected = index;
    this.matchBar.matchBorderStyle[index]['border-color'] = 'green';
    this.matchBar.matchBorderStyle[index]['border-width'] = '5px';
  }

  async updateImageWithMatch(imageId: string, matchId: string, matchTermId: string) {

    if ( matchId === 'notFound' ) {
      return;
    }

    var imageObj = {};
    imageObj[`actual_matches.${matchTermId}`] = matchId;
    this.db.collection('images').doc(imageId).update(imageObj).catch(()=>console.log("updateImageMatch"));
  }

  updateCurrentTermImageWithAnswer( imageIdInDatabase: string, correctAnswer: any) {
    console.log(imageIdInDatabase);
    console.log(correctAnswer);
    const imageObj = {};
    imageObj[`correct_answers`] = correctAnswer;
    this.db.collection('images').doc(imageIdInDatabase).update(imageObj).catch(()=> console.error("did not udpate image answer"));
  }
  // Go to the next image
  nextImage(){
    console.log(this.termMatching.imageIndex);
    this.matchesFinished = false;
    this.chooseToShowAll = false;
    this.curPic.unsubscribe();
    // update database with last index value
    const prevTermImageId = this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]];
    const currTermImageId = this.matchBar.matchIds[this.matchBar.indexSelected];
    this.updateImageWithMatch (prevTermImageId, currTermImageId, this.generalInfo.currTermIdVal);
    this.updateImageWithMatch (currTermImageId, prevTermImageId, this.generalInfo.prevTermIdVal);
    this.updateCurrentTermImageWithAnswer(currTermImageId, this.prevTermImageAnswer);
    console.log(this.termMatching.numImages - this.matchBar.keyImgIndex);
    console.log(this.termMatching.numImages - this.termMatching.imageIndex);
    if ( (this.termMatching.numImages - this.termMatching.imageIndex) <= 1 ) {
      console.log(this.matchesFinished + " " + this.termMatching.numImages + " " + this.termMatching.imageIndex);
      console.log(this.matchBar.matchIds.length);
      console.log(this.matchBar.matchIds);
      this.matchesFinished = true;
      this.imagesFinished = true;
      this.termMatching.termFinishedMatching = true;
      this.ref.detectChanges();
      return;
    }
    this.termMatching.imageIndex++;
    this.ref.detectChanges();
    this.curPic = this.db.collection('images').doc(this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.termMatching.imageIndex]]).valueChanges().subscribe(async (val) => {
      console.log("value of val" );
      console.log(val);
      this.prevTermImageAnswer = val['correct_answers'];
      const mat = Object.keys(val['matches']);
      const lenMatch = mat.length;
      const containsCurrTerm = this.generalInfo.currTermIdVal in val["matches"];
      const lenMatchWithCurrTerm = Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length;
      if( lenMatch > 0 && containsCurrTerm && lenMatchWithCurrTerm > 0 && !this.chooseToShowAll ) {
        this.matchesFinished = true;
        this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
        await this.completeMatchBarObject();
        // put 95% or greater match logic here
        if ( lenMatchWithCurrTerm === 2 ) { // if there is only one match and one default no match image shown

          const idOfmatches = Object.keys(val["matches"][this.generalInfo.currTermIdVal]);
          const matchOne = val['matches'][this.generalInfo.currTermIdVal][idOfmatches[0]];
          const matchTwo = val['matches'][this.generalInfo.currTermIdVal][idOfmatches[1]];
          // following code also take care of the condition where there is only two matches (1 match and 1 noMatch image)
          // but both of them are under 0.94
          if ( matchOne > 0.94 ) {
            // set match one as teh match
            this.matchBar.indexSelected = 0;
            this.nextImage();
            return;
          } else if (matchTwo > 0.94) {
            // set second image as the match
            this.matchBar.indexSelected = 1;
            this.nextImage();
            return;
          }


        } else if( lenMatchWithCurrTerm === 1 ){ //only the default no match found is in teh match col
          this.matchBar.indexSelected = 0;
          this.nextImage();
          return;
        }
        this.ref.detectChanges();
      }
    });
  }

  populateImagesWithoutMatch(){
    this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
    this.matchBar.keyImgUrl = this.getKeyImageURL(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]);
    if( Object.values(this.generalInfo.prevTermIndividualImages).includes( this.matchBar.keyImgUrl ) ){
      this.matchBar.matchIds = Object.values(this.generalInfo.currTermIndividualImages);
    } else if (Object.values(this.generalInfo.prevTermIsoImages).includes( this.matchBar.keyImgUrl )  ){
      this.matchBar.matchIds = Object.values(this.generalInfo.currTermIsoImages);
    }
    else{
      this.matchBar.matchIds = Object.values(this.generalInfo.currTermGroupImages); // TODO make this into values corresponding to the grouping type
    }
    console.log(this.matchBar.matchIds);
    // will add the not found iamge to the end of the scroll bar
    this.matchBar.matchIds.push('notFound');
    this.matchBar.matchBorderStyle.push({ 'border-style': 'solid', 'border-width': '5px', 'border-color': 'green'});
    for ( let i = 0; i < this.matchBar.matchIds.length-1; i++ ){
      this.matchBar.matchBorderStyle.push({ 'border-style': 'solid', 'border-width': '1px', 'border-color': 'black'});
    }
    this.populateImageURLMatches();
    this.matchBar.selectedURL = this.matchBar.matchUrl[0];
    this.matchBar.indexSelected = 0;
    this.matchesFinished = true;
    this.ref.detectChanges();
  }

  storeSession() {
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/navigator/match",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
  }

  logout() {
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-image-matches",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: this.termMatching.imageIndex
    };
    this.authService.setStorage("local", object, "termData");

    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase, '/choose-image-matches', [this.generalInfo.prevTerm, this.generalInfo.currTerm], this.termMatching.imageIndex);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/choose-image-matches",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: this.termMatching.imageIndex
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
