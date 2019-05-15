import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, termData } from 'src/app/core/auth.service';
import { UserTermImageInformationService } from 'src/app/core/user-term-image-information.service';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css']
})
export class NavigatorComponent implements OnInit {
  stage = ['Upload', 'Classify', 'Select Answers', 'Match', 'Process', 'Results'];
  show = [false, false, false, false, false, false];

  nextStage = 0;

  url = '';

  summary = [
    'Upload files',
    'Classify question types',
    'Select correct answers',
    'Match cross-term clicker questions',
    'Start the prediction process',
    'View the results that show struggling students'
  ];

  constructor(private router: Router,
              private generalInfo: UserTermImageInformationService,
              private authService: AuthService) { }

  ngOnInit() {
    // Store generalInfo into sessionStorage, and set both terms to not finished
    // First need to populate generalinfo again
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;

    this.generalInfo.prevTermFinished = false;
    this.generalInfo.currTermFinished = false;
    
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
    this.url = this.router.url;

    switch (this.router.url) {
      case '/navigator/upload':
        this.nextStage = 1;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        this.url = '/choose-grouping';
        break;
      case '/navigator/classify':
        this.nextStage = 2;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        this.url = '/choose-answers';
        break;
      case '/navigator/choose-ans':
        this.nextStage = 3;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        this.url = '/choose-image-matches';
        break;
      case '/navigator/match':
        this.nextStage = 4;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        this.url = '/process-data';
        break;
      case '/navigator/process':
        this.nextStage = 5;
        for (let i = 0; i < this.nextStage; i += 1) {
          this.show[i] = true;
        }
        this.url = '/results';
        break;
      case '/navigator/results':
        break;
      default:
        break;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: this.url,
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
    return false;
  }

}
