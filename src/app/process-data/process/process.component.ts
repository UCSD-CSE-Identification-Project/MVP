import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserTermImageInformationService } from 'src/app/core/user-term-image-information.service';
import { AuthService, termData } from 'src/app/core/auth.service';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {

  percentage = 0;
  checked = false;
  csvfile;
  //csvdata: [['placeholder', 'ind']];



  toggleChecked() {
    this.checked = !this.checked;
  }


  process() {
    // Initialize Params Object
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('course', "CSE100FA2018");
    params = params.append('week', "10");
    params = params.append('elements', "c");
    params = params.append('prevTermId', "0n69l9uRVa6k5rUAxYob");
    params = params.append('currTermId', "10hGi0jfsWhL3pkYfiLd");
    params = params.append('userId', "QdVQwhUCY6Wi7JieDktj4qjF1ju2");

    this.http.get('https://us-central1-ersp-identification.cloudfunctions.net/prediction', { params: params }).subscribe(
      result => console.log(result)
    );
  }


  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private generalInfo: UserTermImageInformationService) {
  }

  ngOnInit() {
    const obj =  {
      allData: [],
    };

    let allImages = this.generalInfo.prevTermAllImages;
    console.log(allImages);
    console.log(Object.keys(allImages));

    for (let i = 0; i < Object.keys(allImages).length; i++) {
      let imgName = '';
      imgName += Object.keys(allImages)[i];
      let currTermID = this.generalInfo.prevTermIdVal;

      this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get().then(function (doc) {
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

          //Bug 1: outputting value not key
          let imgMatch = '';
          imgMatch = Object.keys(doc.data().matches[currTermID])[0];

          obj.allData.push([i, imgName, imgMatch, imgGrp, cans]);
        }
      });
    }
    console.log(obj.allData);

    //need the keys not the values
    var prevTermID = '';
    prevTermID += this.generalInfo.prevTermIdVal;
    var currTermID = '';
    currTermID += this.generalInfo.currTermIdVal;
    var csv = 'qid,' + prevTermID + ',' + currTermID + ',VoteType,cans\n';

    obj.allData.forEach(function(row) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      csv += row.join(',');
      csv += '\n';
    });

    console.log(csv);
    this.csvfile = csv;
  }

  downloadcsv() {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(this.csvfile);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'results.csv';
    hiddenElement.click();
  }

}
