import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-match-terminal',
  templateUrl: './match-terminal.component.html',
  styleUrls: ['./match-terminal.component.css']
})
export class MatchTerminalComponent implements OnInit {

  private imageName;
  private imageFolderPath = '/assets/Images/';
  private strictmatches$: Object;
  private tier1matches$: Object;
  private tier2matches$: Object;
  private imageSource;
  displayPictures: boolean;
  displayImageRight: boolean;
  clicked: number;
  items = [1,2,3,4,5,6,7,8,8,9,10];

  constructor() {
    this.displayPictures = false;
    this.displayImageRight = false;
    this.clicked = 0;
  }

  ngOnInit() {
  }

  matchFound( matchName: string): void {
    // update in database that imagename has a match in matchName
    alert(matchName);
  }
  submit(): void {
    this.imageSource = this.imageFolderPath + this.imageName;
    this.populateMatches();

  }

  populateMatches(): void {

  }

}
