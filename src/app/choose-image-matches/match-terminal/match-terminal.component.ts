import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';

@Component({
  selector: 'app-match-terminal',
  templateUrl: './match-terminal.component.html',
  styleUrls: ['./match-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTerminalComponent implements OnInit {

  /*
  private imageName;
  private highMatches: Object;
  private mediumMatches: Object;
  private lowMatches: Object;

  imageSource: String;
  imageNames;
  imageInput;
  imageInputIndex;
  showMatchesHigh: boolean;
  showMatchesMeduim: boolean;
  showMatchesLow: boolean;
  */
  termMatching;
  matchBar;
  imagesFinished: boolean;

  constructor(private db: AngularFirestore, private generalInfo: UserTermImageInformationService) {
    // Only show match high by default
    // this.showMatchesLow = this.showMatchesMeduim = false;
    // this.showMatchesHigh = true;
    // The image array for Term 2 (images on the right that matches the left )
    // this.imageNames = [];
    // The image array for Term 1 (images on the left to be matched)
    // this.imageInput = [];
    // Index of the img array for Term 1
    // this.imageInputIndex = 0;
    // this.imagesFinished = false;
  }

  // Execute right after constructor
  ngOnInit() {
    // console.log(this.generalInfo.prevTermAllImages);
    // this.imageNames = this.getImageNames();
    // get image names from firebase here TODO make sure to update value of imagesource in async func also
    // TODO ALSO UPDATE THE VALUE OF THE MATCHES
    // this.imageInput = this.getImageInput();
    // this.highMatches = this.getImageNames();
    // console.log(this.highMatches);
    // this.mediumMatches = this.imageNames.slice(2,7);
    // this.lowMatches = this.imageNames.slice(7,12);
    // TODO the following argument needs to be the union of single, group and iso
    this.termMatching = this.createChooseMatchesTermObject(this.generalInfo.prevTermAllImages);
    this.matchBar = this.createMatchBarObject(0);
    this.completeMatchBarObject();
  }

  /*
   *
   */
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
  completeMatchBarObject(){
    this.matchBar.keyImgUrl = this.getKeyImageURL(this.termMatching.imageKeysSorted[this.matchBar.keyImgIndex]);
    this.populateIdsOfMatches(this.matchBar.keyImgIndex);
    console.log(this.matchBar.matchIds);
    this.populateImageURLMatches();

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
    return this.db.collection('images').doc(this.termMatching[imageKey]).ref.get();
  }

  async populateIdsOfMatches( imageKey: string ){
    let matches;
    let sortable = [];
    // let retVal = [];
    await this.db.collection('images').doc(this.termMatching[imageKey]).ref.get().then((doc)=>{
      if (doc.exists){
        matches = doc.data().matches; // todo pull the term match and not entire object
        for (var imgId in matches ) {
          sortable.push([imgId, matches[imgId]]);
        }

        sortable.sort(function(a, b) {
          return a[1] - b[1];
        });
      }
    });
    for (var i of sortable){
      this.matchBar.matchIds.push(i[0]);
    }
    // return retVal;
  }

  populateImageURLMatches(){
    for (var id of this.matchBar.matchIds){
      this.matchBar.matchUrl.push(this.db.collection('images').doc(id).ref.get());
    }
  }
  // Choose which box to show (highMatches, mediumMatches, lowMatches)
  /*
  showMatchesFor( boxNum: number){
    if(boxNum == 1){
      this.showMatchesHigh = true;
      this.showMatchesMeduim = false;
      this.showMatchesLow = false;
    }
    else if(boxNum == 2){
      this.showMatchesMeduim = true;
      this.showMatchesHigh = false;
      this.showMatchesLow = false;
    }
    else if(boxNum == 3){
      this.showMatchesLow = true;
      this.showMatchesHigh = false;
      this.showMatchesMeduim = false;
    }
  }
  */
  /*
  // After a image is clicked, highlight its border
  imgClick(source){
    let target = <HTMLImageElement>document.getElementById("selectedImg");
    target.src = source;
    //(<HTMLImageElement>image).classList.toggle("selectedIMG");
  }
  */
  imgClick( index: number){
    this.matchBar.selectedURL = this.matchBar.matchUrl[index];
    this.matchBar.indexSelected = index;
    // let target = <HTMLImageElement>document.getElementById("selectedImg");
    // target.src = source;
    // TODO USE ID TO UPDATE THE MATCH OF THE CURRENT IMAGE AND OF THE SELECTED IMAGE
    // TODO ALSO CHANGE TARGE TO ACCEPT AN OBSERVABLE AS ITS SOURCE
  }
   //$('img').click(function(){
   //  $(this).toggleClass('selectedIMG');
   //});
  //}

  // Go to the next image
  nextImage(){
    //this.highMatches = this.imageNames.slice(0,2);
    //this.mediumMatches = this.imageNames.slice(2,7);
    //this.lowMatches = this.imageNames.slice(7,12);
    if( (this.termMatching.numImages - this.matchBar.imgIndex) <= 1 ){
      this.imagesFinished = true;
      return;
    }
    // update database with last index value
    // update index value

    //Always make sure the first image of the highmatches show up when clicked "next"
    let target = <HTMLImageElement>document.getElementById("selectedImg");
    target.src = this.highMatches[0];

    // Increment input image index
    this.imageInputIndex++;
    this.showMatchesLow = this.showMatchesMeduim = false;
    this.showMatchesHigh = true;
  }

  // What to do when found matches
  matchFound( matchName: string): void {
    // update in database that imagename has a match in matchName
    alert(matchName);
  }

  // Returns the Term 2 pictures
  getImageNames(){
    let allImages = this.generalInfo.currTermAllImages;
    console.log(allImages);
    let url = [];
    let i;
    console.log(Object.keys(allImages));
    for (i = 0; i < Object.keys(allImages).length; i++){
      this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get().then(function(doc) {
        if (doc.exists) {
          console.log(doc.data().downloadURL);
          url.push(doc.data().downloadURL);
        }
      });
      //url.push(this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get());
      //console.log(this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get());
    }
    console.log(this.generalInfo.prevTermIdVal);
    console.log(url);
    return url;
  }

  // Returns the Term 1 pictures
  getImageInput(){
    let allImages = this.generalInfo.prevTermAllImages;
    console.log(allImages);
    let url = [];
    let i;
    console.log(Object.keys(allImages));
    for (i = 0; i < Object.keys(allImages).length; i++){
      //this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get().then();
      url.push(this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get());
      console.log(this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get());
    }
    console.log(this.generalInfo.prevTermIdVal);
    console.log(url);
    return url;
  }

}
