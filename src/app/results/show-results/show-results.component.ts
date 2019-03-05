import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { UserTermImageInformationService } from '../../core/user-term-image-information.service';

@Component({
  selector: 'app-show-results',
  templateUrl: './show-results.component.html',
  styleUrls: ['./show-results.component.css']
})

export class ShowResultsComponent implements OnInit {
  csvRecords: any[] = [];
  headersRow;
  csvRecordsArray;
  numStudents = 15;
  csvFile;
  url;
  hasCsv: boolean = false;

  constructor(private storage: AngularFireStorage,
              private generalInfo: UserTermImageInformationService) { }

  @ViewChild('fileImportInput') fileImportInput: any;

  ngOnInit() {}

  outputRows() {
    this.hasCsv = true;
    this.getFile();
  }

  getFile() {
    const self = this;
    // This is what we should have
    //let filePath = this.generalInfo.userIdVal + "/results/" + this.generalInfo.prevTermIdVal + "-" + this.generalInfo.currTermIdVal + "/" + "confidence.csv";
    // This is default
    let filePath = this.generalInfo.userIdVal + "/results/" + "0n69l9uRVa6k5rUAxYob" + "-" + "10hGi0jfsWhL3pkYfiLd" + "/" + "confidence.csv";

    this.storage.ref(filePath).getDownloadURL().subscribe(async url => {
      self.url = url;
      const result = await self.makeRequest('GET', url);
      this.csvFile = new File([result], 'studentResults.csv', {type: 'text/csv'});

      this.fileChangeListener(this.csvFile);
    });
  }

  makeRequest(method, url): Promise<Blob> {
    let blob = null;
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
          blob = xhr.response;
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  fileChangeListener(resultsFile: any): void{
    if (this.isCSVFile(resultsFile)) {
      const reader = new FileReader();
      reader.readAsText(resultsFile);

      reader.onload = (data) => {
        const csvData = reader.result;
        this.csvRecordsArray = csvData.toString().split(/\r\n|\n/);
        this.headersRow = this.getHeaderArray(this.csvRecordsArray);
        this.csvRecords = this.getDataRecordsArrayFromCSVFile(this.csvRecordsArray, this.headersRow.length);
      };

    } else {
      alert('Please import valid .csv file.');
      this.fileReset();
    }
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    const dataArr = [];

    for (let i = 1; i <= this.numStudents && i < csvRecordsArray.length; i++) {
      const data = csvRecordsArray[i].split(',');

      // FOR EACH ROW IN CSV FILE IF THE NUMBER OF COLUMNS
      // ARE SAME AS NUMBER OF HEADER COLUMNS THEN PARSE THE DATA
      if (data.length === headerLength) {

        const csvRecord: CSVRecordComponent = new CSVRecordComponent();

        let stringArray = data[0].trim().match(/[^ ]+/g);

        csvRecord.studentName = stringArray[0];
        csvRecord.failProbability = stringArray[1];

        dataArr.push(csvRecord);
      }
    }
    return dataArr;
  }

  // CHECK IF FILE IS A VALID CSV FILE
  isCSVFile(file: any) {
    return file.name.endsWith('.csv');
  }

  // GET CSV FILE HEADER COLUMNS
  getHeaderArray(csvRecordsArr: any) {
    const headers = csvRecordsArr[0].split(',');
    const headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    this.fileImportInput.nativeElement.value = '';
    this.csvRecords = [];
  }

  exportToCSV(filename: any) {
    let dataArray = this.csvRecordsArray.join('\n');
    let csvFile;
    let downloadLink;

    const data = encodeURI(dataArray);

    // CSV file
    csvFile = new Blob([dataArray], {type: 'text/csv'});

    // Download link
    downloadLink = document.createElement('a');

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = 'none';

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
  }
}

export class CSVRecordComponent {

  public studentName: any;
  public failProbability: any;

  constructor() { }

}
