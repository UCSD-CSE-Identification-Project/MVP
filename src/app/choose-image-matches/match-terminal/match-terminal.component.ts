import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

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

  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);

  showMatchesHigh: boolean;
  showMatchesMeduim: boolean;
  showMatchesLow: boolean;

  constructor() {
    this.showMatchesLow = this.showMatchesMeduim = false;
    this.showMatchesHigh = true;
    this.imageNames = [];
    this.imageInput = [];
    this.imageInputIndex = 0;
    this.imagesFinished = false;
  }

  ngOnInit() {
    this.imageNames = this.getImageNames(); // get image names from firebase here TODO make sure to update value of imagesource in async func also
                          // TODO ALSO UPDATE THE VALUE OF THE MATCHES
    this.imageInput = this.getImageNames();
    this.highMatches = this.imageNames.slice(0,2);
    this.mediumMatches = this.imageNames.slice(2,7);
    this.lowMatches = this.imageNames.slice(7,12);
  }

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

  nextImage(){
    if( (this.imageNames.length - this.imageInputIndex) <= 1 ){
      this.imagesFinished = true;
      return;
    }
    this.imageInputIndex++;
    this.showMatchesLow = this.showMatchesMeduim = false;
    this.showMatchesHigh = true;
    $('img').click(function(){
      $('.selected').removeClass('selected');
      $(this).addClass('selected');
    });
  }

  matchFound( matchName: string): void {
    // update in database that imagename has a match in matchName
    alert(matchName);
  }

  getImageNames(){
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
  }

}
