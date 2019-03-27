import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {forkJoin, Observable} from 'rxjs';
import { AuthService, termData } from 'src/app/core/auth.service';
import {analyzeAndValidateNgModules} from '@angular/compiler';


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
  imageInd: number = 0;
  curPic;

  constructor(private db: AngularFirestore, private generalInfo: UserTermImageInformationService, private ref: ChangeDetectorRef, private authService: AuthService) {
  }

  // Execute right after constructor
  ngOnInit() {
    // this.generalInfo.makeSingleRequest();
    this.matchesFinished = false;
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    this.imageInd = data.imageIndex;
    // this.generalInfo.currTermIdVal = "uLSlm2XOeG4mDXufrBLn";
    // this.generalInfo.makeSingleRequest();
    console.log(this.generalInfo.prevTermAllImages);
    this.termMatching = this.createChooseMatchesTermObject(Object.assign({}, this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermGroupImages, this.generalInfo.prevTermIsoImages));

    this.curPic = this.db.collection('images').doc(this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.termMatching.imageIndex]]).valueChanges().subscribe((val)=>{
      console.log(val);
      console.log(Object.keys(val["matches"]).length);
      var mat = Object.keys(val["matches"]);
      var lenMatch = mat.length;
      var containsCurrTerm = this.generalInfo.currTermIdVal in val["matches"];
      console.log(lenMatch);
      console.log(containsCurrTerm);
      console.log(this.generalInfo.currTermIdVal);
      console.log(val["matches"]);
      if ( lenMatch > 0 && containsCurrTerm && Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length > 0 ) {
        if( Object.keys(val["matches"][this.generalInfo.currTermIdVal])[0] === 'notFound' ){
          console.log("no matches found for current object");
          this.noMatchesFoundForCurrentImage();
        } else {
          this.matchesFinished = true;
          this.matchBar = this.createMatchBarObject(this.imageInd);
          this.completeMatchBarObject();
          this.ref.detectChanges();
        }
      }
    });
  }

  createMatchBarObject(imageIndex: number){
    let obj = {
      matchIds: [],
      matchUrl: [],
      keyImgIndex: imageIndex,
      keyImgUrl: null,
      selectedURL: '',
      indexSelected: -1,
    };
    return obj;
  }
  completeMatchBarObject() {
    var self = this;
    this.matchBar.keyImgUrl = this.getKeyImageURL(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]);
    this.populateIdsOfMatches(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]).then(()=>{
      self.populateImageURLMatches();
      self.matchBar.selectedURL = self.matchBar.matchUrl[0];
      self.matchBar.indexSelected = 0;
      self.ref.detectChanges();
    });
  }
  createChooseMatchesTermObject(imgNames){
    let obj = {
      imageNames: {},
      imageIndex: this.imageInd,
      imageKeysSorted: [],
      termFinishedMatching: false,
      numImages: 0,
    };

    obj.imageNames = imgNames;
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a,b) => a.localeCompare(b));
    obj.numImages = obj.imageKeysSorted.length;
    return obj;
  }

  noMatchesFoundForCurrentImage(){
    this.curPic.unsubscribe();
    this.termMatching.imageIndex++;
    console.log(this.termMatching.imageIndex);
    if ( this.termMatching.imageIndex >= this.termMatching.numImages ){
      this.curPic.unsubscribe();
      this.matchesFinished = true;
      this.imagesFinished = true;
      this.termMatching.termFinishedMatching = true;
      return;
    }
    this.curPic = this.db.collection('images').doc(this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.termMatching.imageIndex]]).valueChanges().subscribe((val)=>{
      console.log(val);
      var mat = Object.keys(val["matches"]);
      var lenMatch = mat.length;
      var containsCurrTerm = this.generalInfo.currTermIdVal in val["matches"];
      console.log(Object.keys(val["matches"]).length);
      if(lenMatch > 0 && containsCurrTerm && Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length === 1 ){
        if(Object.keys(val["matches"][this.generalInfo.currTermIdVal])[0] === 'notFound' ) {
          console.log("no matches found for current object");
          this.noMatchesFoundForCurrentImage();
        }
        else{
          this.matchesFinished = true;
          this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
          this.completeMatchBarObject();
          this.ref.detectChanges();
        }
      }
      else if( lenMatch > 0 && containsCurrTerm && Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length > 0 ){
        this.matchesFinished = true;
        this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
        this.completeMatchBarObject();
        this.ref.detectChanges();
      }
    });
  }

  // imageKey here refers what the id of that image is
  getKeyImageURL(imageKey: string){
    // console.log(imageKey);
    return this.db.collection('images').doc(this.termMatching.imageNames[imageKey]).ref.get();
  }

  async populateIdsOfMatches( imageKey: string ){
    let matches;
    let sortable = [];
    var self = this;
    // let retVal = [];
    // console.log(imageKey);
    // console.log(this.termMatching.imageNames);
    // console.log(this.termMatching.imageNames[imageKey]);
    await this.db.collection('images').doc(this.termMatching.imageNames[imageKey]).ref.get().then((doc)=>{
      if (doc.exists){
        // console.log(doc.data().matches[self.generalInfo.currTermIdVal]);
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
    // console.log(this.matchBar.matchIds);
    // return retVal;
  }

  populateImageURLMatches(){
    // console.log(this.matchBar.matchIds.length);
    for (var id of this.matchBar.matchIds){
      // console.log(id);
      this.matchBar.matchUrl.push(this.db.collection('images').doc(id).ref.get());
    }
  }
  imgClick( index: number) {
    // console.log(index);
    this.matchBar.selectedURL = this.matchBar.matchUrl[index];
    this.matchBar.indexSelected = index;
    // TODO USE ID TO UPDATE THE MATCH OF THE CURRENT IMAGE AND OF THE SELECTED IMAGE
  }

  async updateImageWithMatch(imageId: string, matchId: string, matchTermId: string) {
    var imageObj = {};
    imageObj[`actual_matches.${matchTermId}`] = matchId;
    this.db.collection('images').doc(imageId).update(imageObj);
  }
  // Go to the next image
  nextImage(){
    this.matchesFinished = false;
    this.curPic.unsubscribe();
    // update database with last index value
    const prevTermImageId = this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]];
    const currTermImageId = this.matchBar.matchIds[this.matchBar.indexSelected];
    this.updateImageWithMatch (prevTermImageId, currTermImageId, this.generalInfo.currTermIdVal);
    this.updateImageWithMatch (currTermImageId, prevTermImageId, this.generalInfo.prevTermIdVal);

    console.log("numImages" + this.termMatching.numImages);
    console.log("imageIndex" + this.termMatching.imageIndex);
    console.log("matchBar Image index" + this.matchBar.keyImgIndex);
    console.log("difference:" + (this.termMatching.numImages - this.matchBar.keyImgIndex));
    if ( (this.termMatching.numImages - this.matchBar.keyImgIndex) <= 1 ) {
      this.imagesFinished = true;
      this.termMatching.termFinishedMatching = true;
      return;
    }
    this.termMatching.imageIndex++;
    this.curPic = this.db.collection('images').doc(this.termMatching.imageNames[this.termMatching.imageKeysSorted[this.termMatching.imageIndex]]).valueChanges().subscribe((val)=>{
      console.log(val);
      console.log(Object.keys(val["matches"]).length);

      var mat = Object.keys(val["matches"]);
      var lenMatch = mat.length;
      var containsCurrTerm = this.generalInfo.currTermIdVal in val["matches"];

      if(lenMatch > 0 && containsCurrTerm && Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length === 1 ){
        if(Object.keys(val["matches"][this.generalInfo.currTermIdVal])[0] === 'notFound' ){
          console.log("no matches found for current object");
          this.noMatchesFoundForCurrentImage();
        }
        else{
          this.matchesFinished = true;
          this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
          this.completeMatchBarObject();
          this.ref.detectChanges();
        }
      }
      else if(lenMatch > 0 && containsCurrTerm && Object.keys(val["matches"][this.generalInfo.currTermIdVal]).length > 0 ){
        this.matchesFinished = true;
        this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
        this.completeMatchBarObject();
        this.ref.detectChanges();
      }
    });
  }

  logout() {
    let object: termData = {
      logoutUrl: "/choose-image-matches",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.termMatching.imageIndex
    };
    this.authService.setStorage("local", object, "termData");

    this.authService.logout('/choose-image-matches', [this.generalInfo.prevTerm, this.generalInfo.currTerm], this.termMatching.imageIndex);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    let object: termData = {
      logoutUrl: "/choose-image-matches",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.termMatching.imageIndex
    };
    this.authService.setStorage("session", object, "termData");
    return false;
  }

}
// {"logoutUrl":"/choose-image-matches","prevTermInfo":{"termId":"Wo8RKXtwA3odEMoTpJjO","allTermImages":{"L1804050925_Q02":"O7APZtAreABc8dddXJK1","L1804050925_Q04":"DAX3zhHBtoJ8A2qkfXki","L1710031354_Q04":"hcdxDAbfwNuzaFsAhxHg","L1710031354_Q02":"0WSSHXCzH8qoT06d9hlC","L1804050925_Q03":"952MyI7OEXIKLgazNt3G","L1804050925_Q01":"DqkT4nv1sqCzKJdi0x9A","L1710031354_Q01":"2nUlErDDUCUg04a6FIOE","L1710031354_Q03":"wc0vGOx24SRx5DONN598"},"individualImages":{"L1710031354_Q01":"2nUlErDDUCUg04a6FIOE","L1804050925_Q04":"DAX3zhHBtoJ8A2qkfXki"},"groupImages":{"L1710031354_Q02":"0WSSHXCzH8qoT06d9hlC","L1710031354_Q03":"wc0vGOx24SRx5DONN598","L1710031354_Q04":"hcdxDAbfwNuzaFsAhxHg","L1804050925_Q01":"DqkT4nv1sqCzKJdi0x9A","L1804050925_Q02":"O7APZtAreABc8dddXJK1","L1804050925_Q03":"952MyI7OEXIKLgazNt3G"},"isoImages":{},"loadedFromDatabase":false,"keyImages":{"2nUlErDDUCUg04a6FIOE":{"0WSSHXCzH8qoT06d9hlC":"Group","wc0vGOx24SRx5DONN598":"Group","hcdxDAbfwNuzaFsAhxHg":"Group","DqkT4nv1sqCzKJdi0x9A":"Group","O7APZtAreABc8dddXJK1":"Group","952MyI7OEXIKLgazNt3G":"Group","DAX3zhHBtoJ8A2qkfXki":"Individual"}},"finished":false},"currTermInfo":"uLSlm2XOeG4mDXufrBLn","imageIndex":0}

