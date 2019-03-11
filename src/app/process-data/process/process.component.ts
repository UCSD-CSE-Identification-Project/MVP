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
    var obj =  {
      allData: [],
      prevTermID: '',
      currTermID: '',
    };
    let promises = [];
    let allImages = this.generalInfo.prevTermAllImages;
    let currImages = this.generalInfo.currTermAllImages;
    var x;
    var y;
    console.log(allImages);
    console.log(Object.keys(allImages));

    for (let i = 0; i < Object.keys(allImages).length; i++) {
      let imgName = '';
      imgName += Object.keys(allImages)[i];
      let currTermID = this.generalInfo.prevTermIdVal;

      x = this.db.collection('images').doc(allImages[Object.keys(allImages)[i]]).ref.get();
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
          //imgMatch = Object.keys(doc.data().matches[currTermID])[0];
          //console.log(imgMatch);
          imgMatch = doc.data().actual_matches[currTermID];
          //console.log(imgMatch);
          for(const[key, value] of Object.entries(currImages)) {
            if (value == imgMatch) {
              imgMatch = key;
              break;
            }
          }

          obj.allData.push([i, imgName, imgMatch, imgGrp, cans]);
        }
      });
    }
    console.log(obj.allData);
    console.log(obj.allData.length);


    //need the keys not the values
    obj.prevTermID = '';
    obj.prevTermID += this.generalInfo.prevTermIdVal;
    obj.currTermID = '';
    obj.currTermID += this.generalInfo.currTermIdVal;

    y = this.db.collection('users').doc(this.generalInfo.userIdVal).ref.get();
    promises.push(y);
    y.then(function(doc) {
      if (doc.exists) {
        for(const[key, value] of Object.entries(doc.data().class_term)) {
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
      var csv = 'qid,' + obj.prevTermID + ',' + obj.currTermID + ',VoteType,cans\n';
      //console.log(val);
      obj.allData.forEach(function(row) {
        //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        csv += row.join(',');
        csv += '\n';
      });
      console.log(csv);
      this.csvfile = csv;

      var storageRef = firebase.storage().ref();
      var corrcsvRef = storageRef.child(this.generalInfo.userIdVal+'/corresponding_questions/'+obj.prevTermID+'-'+obj.currTermID+'/corresponding_questions.csv');
      corrcsvRef.putString(this.csvfile).then(function(snapshot) {
        console.log('Hi');
      });
    });


  }

  /*downloadcsv() {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(this.csvfile);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'corresponding_questions.csv';
    hiddenElement.click();
  }*/

}
