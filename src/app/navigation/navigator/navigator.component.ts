import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css']
})
export class NavigatorComponent implements OnInit {
  stage = ['Upload', 'Classify', 'Select Answers', 'Match', 'Process', 'Results'];
  summary = [
    'Upload files',
    'Classify question types',
    'Select correct answers',
    'Match cross-term clicker questions',
    'Start the prediction process',
    'View the results that show struggling students'
  ];

  constructor() { }

  ngOnInit() {
  }

}
