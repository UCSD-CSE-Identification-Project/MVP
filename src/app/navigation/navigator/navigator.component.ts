import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css']
})
export class NavigatorComponent implements OnInit {
  stage = ['Upload', 'Classify', 'Select Answers', 'Match', 'Process', 'Results'];
  show = [false, false, false, false, false, false];

  nextStage = 0;

  url = '/choose-answers';

  summary = [
    'Upload files',
    'Classify question types',
    'Select correct answers',
    'Match cross-term clicker questions',
    'Start the prediction process',
    'View the results that show struggling students'
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    switch (this.router.url) {
      case '/navigator/upload':
        this.nextStage = 1;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        break;
      case '/navigator/classify':
        this.nextStage = 2;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        break;
      case '/navigator/choose-ans':
        this.nextStage = 3;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        break;
      case '/navigator/match':
        this.nextStage = 4;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        break;
      case '/navigator/process':
        this.nextStage = 5;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        break;
      case '/navigator/results':
        break;
      default:
        break;
    }
  }

  proceed() {
  }

}
