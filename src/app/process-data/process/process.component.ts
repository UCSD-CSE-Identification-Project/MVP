import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  percentage = 0;
  checked = false;

  constructor() { }

  ngOnInit() {
  }

  toggleChecked() {
    this.checked = !this.checked;
  }

}
