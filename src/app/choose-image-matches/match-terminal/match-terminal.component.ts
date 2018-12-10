import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-match-terminal',
  templateUrl: './match-terminal.component.html',
  styleUrls: ['./match-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTerminalComponent implements OnInit {

  private imageName;
  private strictmatches$: Object;
  private tier1matches$: Object;
  private tier2matches$: Object;

  imageSource: String;
  imageNames;
  imagesFinished: boolean;

  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);

  showMatchesHigh: boolean;
  showMatchesMeduim: boolean;
  showMatchesLow: boolean;

  constructor() {
    this.showMatchesLow = this.showMatchesMeduim = this.showMatchesHigh = false;
    this.imageNames = [];
    this.imagesFinished = false;
  }

  ngOnInit() {
    this.imageNames = []; // get image names from firebase here TODO make sure to update value of imagesource in async func also
                          // TODO ALSO UPDATE THE VALUE OF THE MATCHES

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
    // need to change the image
    // need to update the imageFinished var
    // need to update the matches

  }

  matchFound( matchName: string): void {
    // update in database that imagename has a match in matchName
    alert(matchName);
  }

}
