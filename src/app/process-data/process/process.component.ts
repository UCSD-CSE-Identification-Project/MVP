import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserTermImageInformationService } from 'src/app/core/user-term-image-information.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AuthService, termData } from 'src/app/core/auth.service';

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
  //csvdata: [['placeholder', 'ind']];



  toggleChecked() {
    this.checked = !this.checked;
  }

  openDialog() {
    this.startProcess = true;
    const dialogRef = this.dialog.open(Notice, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.process();
    });
  }

  process() {
    // Initialize Params Object
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('course', "CSE100FA2018");
    params = params.append('week', "10");
    params = params.append('elements', "c");
    params = params.append('prevTermId', "0n69l9uRVa6k5rUAxYob");
    params = params.append('currTermId', "10hGi0jfsWhL3pkYfiLd");
    params = params.append('userId', "QdVQwhUCY6Wi7JieDktj4qjF1ju2");

    this.showSpinner = true;
    this.http.get('https://us-central1-ersp-identification.cloudfunctions.net/predict', { headers: headers,params: params }).subscribe(
      result => {
        console.log(result);
        this.showSpinner = false;
      }
    );
  }


  constructor(private http: HttpClient,
              private generalInfo: UserTermImageInformationService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.showSpinner = false;
    let obj =  {
      imageNames: {},
      imageKeysSorted: [],
      indKeysSorted: [],
      groupKeysSorted: [],
      isoKeysSorted: [],
      csvdata: [],
    };

    obj.imageNames = this.generalInfo.prevTermAllImages;
    console.log("all prev term images")
    console.log(obj.imageNames);
    obj.imageKeysSorted = Object.keys(obj.imageNames).sort((a, b) => a.localeCompare(b));
    console.log("sorted image keys")
    console.log(obj.imageKeysSorted);
    obj.indKeysSorted = Object.keys(this.generalInfo.prevTermIndividualImages).sort((a, b) => a.localeCompare(b));
    console.log(obj.indKeysSorted);
    obj.groupKeysSorted = Object.keys(this.generalInfo.prevTermGroupImages).sort((a, b) => a.localeCompare(b));
    console.log(obj.groupKeysSorted);
    obj.isoKeysSorted = Object.keys(this.generalInfo.prevTermIsoImages).sort((a, b) => a.localeCompare(b));
    console.log(obj.isoKeysSorted);

    //Sorting in lexicographical order, i.e. Q1, Q10, Q11... instead of Q1, Q2, Q3

    for (let i=0; i<obj.imageKeysSorted.length; i++) {
      if (obj.indKeysSorted.indexOf(obj.imageKeysSorted[i]) >= 0) {
        obj.csvdata.push([obj.imageKeysSorted[i], 'ind']);
      } else if (obj.groupKeysSorted.indexOf(obj.imageKeysSorted[i]) >= 0) {
        obj.csvdata.push([obj.imageKeysSorted[i], 'group']);
      } else if (obj.isoKeysSorted.indexOf(obj.imageKeysSorted[i]) >= 0) {
        obj.csvdata.push([obj.imageKeysSorted[i], 'iso']);
      }
      //works on the assumption that all images are in one of these three categories i.e. not 'ignore'
    }

    console.log(obj.csvdata);

    var csv = 'PrevTermImage, Grouping\n';
    obj.csvdata.forEach(function(row) {
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

@Component({
  selector: 'pop-up',
  templateUrl: './pop-up.html',
})
export class Notice {

  constructor(
    public dialogRef: MatDialogRef<Notice>) { }

}
