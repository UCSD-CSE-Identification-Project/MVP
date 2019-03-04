import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import {forkJoin, Observable} from 'rxjs';
import { AuthService, termData } from 'src/app/core/auth.service';


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

  constructor(private db: AngularFirestore, private generalInfo: UserTermImageInformationService, private ref: ChangeDetectorRef, private authService: AuthService) {
  }

  // Execute right after constructor
  ngOnInit() {
    this.matchesFinished = false;

/*
    let data: termData = this.authService.getStorage("session");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    this.imageInputIndex = data.imageIndex;
    console.log(this.generalInfo.prevTermAllImages);

    this.imageNames = this.getImageNames();
    // get image names from firebase here TODO make sure to update value of imagesource in async func also
    // TODO ALSO UPDATE THE VALUE OF THE MATCHES
    this.imageInput = this.getImageInput();
    this.highMatches = this.getImageNames();
    console.log(this.highMatches);
    this.mediumMatches = this.imageNames.slice(2,7);
    this.lowMatches = this.imageNames.slice(7,12);
*/
    let keyImages = Object.assign({}, this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermGroupImages, this.generalInfo.prevTermIsoImages);
    keyImages = Object.values(keyImages);
    console.log(keyImages);
    let allPromises = [];
    var t0 = performance.now();
    for ( let key of keyImages ){
      console.log(key);
      allPromises.push(this.generalInfo.makeSingleRequest(""+key));
    }
    // Promise.all(allPromises).then(value=>{
    forkJoin(allPromises).subscribe(value=>{
      console.log(value + " finished all values");
      var t1 = performance.now();
      console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
      this.matchesFinished = true;
      console.log(this.matchesFinished);
      this.ref.detectChanges();
    });
    // TODO the following argument needs to be the union of single, group and iso
    this.termMatching = this.createChooseMatchesTermObject(Object.assign({}, this.generalInfo.prevTermIndividualImages, this.generalInfo.prevTermGroupImages, this.generalInfo.prevTermIsoImages));
    this.matchBar = this.createMatchBarObject(0);
    // console.log(this.matchBar.matchUrl);
    this.completeMatchBarObject();

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
      imageIndex: 0,
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
    this.matchBar = this.createMatchBarObject(this.termMatching.imageIndex);
    this.completeMatchBarObject();
  }
/*
  logout() {
    let object: termData = {
      logoutUrl: "/choose-image-matches",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.imageInputIndex
    };
    this.authService.setStorage("local", object);

    this.authService.logout('/choose-image-matches', [this.generalInfo.prevTerm, this.generalInfo.currTerm], this.imageInputIndex);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    let object: termData = {
      logoutUrl: "/choose-image-matches",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: this.imageInputIndex
    };
    this.authService.setStorage("session", object);
    this.authService.unloadNotification(event);
  }
*/

}
