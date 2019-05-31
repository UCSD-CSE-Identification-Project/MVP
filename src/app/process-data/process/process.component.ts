import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserTermImageInformationService } from 'src/app/core/user-term-image-information.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AuthService, termData } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  percentage = 0;
  checked = false;
  csvfile;
  startProcess: boolean = false;
  showSpinner: boolean = false
  csvSpinner: boolean = true;
  enableWeeks: boolean = false;
  finished: boolean = false;

  toggleChecked() {
    this.checked = !this.checked;
  }

  openDialog() {
    const dialogRef = this.dialog.open(Notice, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.startProcess = true;
      this.process();
    });
  }

  process() {
    // Initialize Params Object
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('course', "NONE");
    params = params.append('week', "NONE");
    params = params.append('elements', "c");
    params = params.append('prevTermId', this.generalInfo.prevTermIdVal);
    params = params.append('currTermId', this.generalInfo.currTermIdVal);
    params = params.append('userId', this.generalInfo.userIdVal);

    this.showSpinner = true;
    this.http.get('https://us-central1-ersp-identification.cloudfunctions.net/predict', { headers: headers,params: params }).subscribe(
      result => {
        console.log(result);
        this.showSpinner = false;
        this.finished = true;
      }
    );
  }


  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private authService: AuthService,
              private generalInfo: UserTermImageInformationService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    let data: termData = this.authService.getStorage("session", "termData");
    this.generalInfo.prevTerm = data.prevTermInfo;
    this.generalInfo.currTerm = data.currTermInfo;
    // Get match column, change lecture name format from L9_Q05 to lec09_Q5
    this.showSpinner = false;
    var obj = {
      allData: [],
      prevTermID: '',
      currTermID: '',
    };
    let promises = [];
    let allImages = this.generalInfo.prevTermAllImages;
    let currImages = this.generalInfo.currTermAllImages;
    var x;
    var y;
    //console.log(allImages);
    //console.log(Object.keys(allImages));

    for (let i = 0; i < Object.keys(allImages).length; i++) {
      let imgName = '';
      imgName += Object.keys(allImages)[i];
      let currTermID = this.generalInfo.currTermIdVal;

      x = this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get();
      let self = this;
      promises.push(x);
      x.then(function (doc) {
        if (doc.exists) {


          let cans = '';

          if (doc.data().correct_answers['N'] === true) {
            cans += '0';
          } else {
            if (doc.data().correct_answers['A'] === true) {
              cans += '1';
            }
            if (doc.data().correct_answers['B'] === true) {
              cans += '2';
            }
            if (doc.data().correct_answers['C'] === true) {
              cans += '3';
            }
            if (doc.data().correct_answers['D'] === true) {
              cans += '4';
            }
            if (doc.data().correct_answers['E'] === true) {
              cans += '5';
            }
          }

          let imgGrp = '';
          imgGrp += doc.data().grouping;

          let imgMatch = '';

          if (doc.data().actual_matches) {
            imgMatch = doc.data().actual_matches[currTermID];
            for (const [key, value] of Object.entries(currImages)) {
              if (value == imgMatch) {
                imgMatch = key;
                break;
              }
            }
            obj.allData.push([i, self.changeName(imgName), self.changeName(imgMatch), imgGrp, cans]);
          }
          /*
          for (const [key, value] of Object.entries(currImages)) {
            if (value == imgMatch) {
              imgMatch = key;
              break;
            }
          }

          // Change imgName here
          if (imgMatch) {
            obj.allData.push([i, self.changeName(imgName), self.changeName(imgMatch), imgGrp, cans]);
          }
          */
        }
      });
    }
    //console.log(obj.allData);
    //console.log(obj.allData.length);


    //need the keys not the values
    obj.prevTermID = '';
    obj.prevTermID += this.generalInfo.prevTermIdVal;
    obj.currTermID = '';
    obj.currTermID += this.generalInfo.currTermIdVal;

    y = this.db.collection('users').doc(this.generalInfo.userIdVal).ref.get();
    promises.push(y);
    y.then(function (doc) {
      if (doc.exists) {
        for (const [key, value] of Object.entries(doc.data().class_term)) {
          if (value === obj.prevTermID) {
            obj.prevTermID = key;
          }
          if (value === obj.currTermID) {
            obj.currTermID = key;
          }
        }
      }
    });

    console.log(this.generalInfo.userIdVal);

    Promise.all(promises).then((val) => {
      var csv = 'qid,' + this.generalInfo.prevTermIdVal + ',' + this.generalInfo.currTermIdVal + ',VoteType,cans\n';
      obj.allData.forEach(function (row) {
        csv += row.join(',');
        csv += '\n';
      });
      console.log(csv);
      this.csvfile = csv;

      var storageRef = firebase.storage().ref();

      let self = this;
      var corrcsvRef = storageRef.child(this.generalInfo.userIdVal + '/corresponding_questions/' + this.generalInfo.prevTermIdVal + '-' + this.generalInfo.currTermIdVal + '/corresponding_questions.csv');
      corrcsvRef.putString(this.csvfile).then(function (snapshot) {
        console.log('File put');
        self.csvSpinner = false;
      });
    });
  }

  changeName(name: string) {
    let newName = name.split("_");
    let newName2 = newName[1].replace(/\D/g, '');

    newName2 = parseInt(newName2, 10).toString();
    return newName[0] + "_Q" + newName2;
  }

  logout() {
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/process-data",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("local", object, "termData");

    this.authService.logout(this.generalInfo.prevTermLoadedFromDatabase, '/process-data', [this.generalInfo.prevTerm, this.generalInfo.currTerm], 0);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    let object: termData = {
      uid: this.generalInfo.userIdVal,
      usePrev: this.generalInfo.prevTermLoadedFromDatabase,
      logoutUrl: "/process-data",
      prevTermInfo: this.generalInfo.prevTerm,
      currTermInfo: this.generalInfo.currTerm,
      lectureOrImageIndex: 0
    };
    this.authService.setStorage("session", object, "termData");
    return false;
  }
  
}

@Component({
  selector: 'pop-up',
  templateUrl: './pop-up.html',
})
export class Notice {

  constructor(
    public dialogRef: MatDialogRef<Notice>) {
      dialogRef.disableClose = true;
    }

}
