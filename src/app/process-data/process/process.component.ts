import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserTermImageInformationService } from 'src/app/core/user-term-image-information.service';
import { AuthService, termData } from 'src/app/core/auth.service';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  percentage = 0;
  checked = false;

  constructor(private http: HttpClient, private generalInfo: UserTermImageInformationService, private authService: AuthService) { }

  ngOnInit() {
    let data: termData = this.authService.getStorage("session");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
  }

  toggleChecked() {
    this.checked = !this.checked;
  }

  onUpload() {
    // Initialize Params Object
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('course', "CSE100FA2018");
    params = params.append('week', "10");
    params = params.append('elements', "c");
    this.http.get('https://us-central1-ersp-identification.cloudfunctions.net/prediction', { params: params }).subscribe(
      result => console.log(result)
    );
  }

  logout() {
    let object: termData = {
      logoutUrl: "/process-data",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: 0
    };
    this.authService.setStorage("local", object);

    this.authService.logout('/process-data', [this.generalInfo.prevTerm, this.generalInfo.currTerm], 0);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    let object: termData = {
      logoutUrl: "/process-data",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      imageIndex: 0
    };
    this.authService.setStorage("session", object);
    this.authService.unloadNotification(event);
  }

}
