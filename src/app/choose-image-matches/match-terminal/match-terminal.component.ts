import {ChangeDetectionStrategy, Component, OnInit, HostListener } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserTermImageInformationService} from '../../core/user-term-image-information.service';
import { AuthService, termData } from 'src/app/core/auth.service';

@Component({
  selector: 'app-match-terminal',
  templateUrl: './match-terminal.component.html',
  styleUrls: ['./match-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTerminalComponent implements OnInit {

  private imageName;
  private highMatches: Object;
  private mediumMatches: Object;
  private lowMatches: Object;

  imageSource: String;
  imageNames;
  imagesFinished: boolean;
  imageInput;
  imageInputIndex;
  showMatchesHigh: boolean;
  showMatchesMeduim: boolean;
  showMatchesLow: boolean;

  constructor(private db: AngularFirestore, private generalInfo: UserTermImageInformationService, private authService: AuthService) {
    // Only show match high by default
    this.showMatchesLow = this.showMatchesMeduim = false;
    this.showMatchesHigh = true;
    // The image array for Term 2 (images on the right that matches the left )
    this.imageNames = [];
    // The image array for Term 1 (images on the left to be matched)
    this.imageInput = [];
    // Index of the img array for Term 1
    this.imageInputIndex = 0;
    this.imagesFinished = false;
  }

  // Execute right after constructor
  ngOnInit() {
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
  }

  // Choose which box to show (highMatches, mediumMatches, lowMatches)
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

  // After a image is clicked, highlight its border
  imgClick(source){
    let target = <HTMLImageElement>document.getElementById("selectedImg");
    target.src = source;
    //(<HTMLImageElement>image).classList.toggle("selectedIMG");
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
    if( (this.imageInput.length - this.imageInputIndex) <= 1 ){
      this.imagesFinished = true;
      return;
    }
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
    /*
    return [
            'https://www.catster.com/wp-content/uploads/2018/07/Savannah-cat-long-body-shot.jpg',
            'https://www.catster.com/wp-content/uploads/2017/08/Pixiebob-cat.jpg',
            'http://catsatthestudios.com/wp-content/uploads/2017/12/12920541_1345368955489850_5587934409579916708_n-2-960x410.jpg',
            'https://s.hswstatic.com/gif/ragdoll-cat.jpg',
            'http://www.cutestpaw.com/wp-content/uploads/2011/11/To-infinity-and-beyond.jpeg',
            'http://www.youloveit.com/uploads/posts/2017-03/1489320913_youloveit_com_hosico_cat01.jpg',
            'https://i.kinja-img.com/gawker-media/image/upload/s--kHrQ8nr7--/c_scale,f_auto,fl_progressive,q_80,w_800/18huxz4bvnfjbjpg.jpg',
            'https://timedotcom.files.wordpress.com/2018/08/new-zealand-cat-ban.jpg',
            'https://www.105.net/resizer/659/-1/true/1516801821090.jpg--cercasi_coccolatori_di_gatti_professionisti_in_irlanda_.jpg?1516801823000',
            'http://www.smashingphotoz.com/wp-content/uploads/2012/11/11_cat_photos.jpg',
            'https://www.thehappycatsite.com/wp-content/uploads/2017/05/cute1.jpg',
            'https://media.makeameme.org/created/javascript-javascript-everywhere.jpg'
            ]
            */
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
    /*
    return [
      "http://fenozi.com/wp-content/uploads/2017/04/cute-cats-6.jpg",
      "https://www.lifewithcats.tv/wp-content/uploads/2018/10/cat-3695694_640.jpg",
      "https://www.buddies.co.uk/wp-content/uploads/2018/08/animal-cat-cute-126407.jpg",
      "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/kitten-playing-with-toy-mouse-royalty-free-image-590055188-1542816918.jpg?crop=1.00xw:0.758xh;0,0.132xh&resize=480:*",
      "https://www.thehappycatsite.com/wp-content/uploads/2017/05/funny.jpg",
      "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/kitten-looking-out-from-under-blanket-royalty-free-image-466265904-1542817024.jpg?crop=1xw:1xh;center,top&resize=480:*"
      ]
      */
  }

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

}
