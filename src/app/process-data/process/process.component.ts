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
  csvfile;
  //csvdata: [['placeholder', 'ind']];



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


  constructor(private http: HttpClient,
              private generalInfo: UserTermImageInformationService) {
  }

  ngOnInit() {
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
