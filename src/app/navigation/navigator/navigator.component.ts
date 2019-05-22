import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, termData, groupLock } from 'src/app/core/auth.service';
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
    'Classify clicker question types: individual or group',
    'Select correct answers for clicker questions',
    'Match cross-term clicker questions',
    'Start the prediction process',
    'View the results that show struggling students'
  ];
  description = [
    'For a past term and the current term, upload one folder for each term that contains the clicker data from iClicker software and final exam scores in a csv file named final.csv',
    'Select the question type for each clicker question: individual, group or ignore.',
    'Select the correct answer(s) for each clicker question.',
    'Match the current term questions to past term questions',
    'Please wait while the data is processing.',
    'See and save the results that show each student in the current term and their chance of struggling in this course',

  ]
  constructor(private router: Router,
              private generalInfo: UserTermImageInformationService,
              private authService: AuthService) { }

  ngOnInit() {
    // Store generalInfo into sessionStorage, and set both terms to not finished
    this.generalInfo.prevTermFinished = false;
    this.generalInfo.currTermFinished = false;
    
    let object: termData = {
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");

    switch (this.router.url) {
      case '/navigator/upload':
        let lock: groupLock = {
          boxLocked: false,
          savedIndex: 0,
          savedChoice: ""
        }
        this.authService.setStorage("session", lock, "groupLock");
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

}

