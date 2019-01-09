import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-show-results',
  templateUrl: './show-results.component.html',
  styleUrls: ['./show-results.component.css']
})
export class ShowResultsComponent implements OnInit {
  public csvRecords: any[] = [];
  numStudents = 0;

  @ViewChild('fileImportInput') fileImportInput: any;

  ngOnInit() {
  }

  fileChangeListener($event: any): void {

    const text = [];
    const files = $event.srcElement.files;

    if (this.isCSVFile(files[0])) {

      const input = $event.target;
      const reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = (data) => {
        const csvData = reader.result;
        const csvRecordsArray = csvData.toString().split(/\r\n|\n/);

        const headersRow = this.getHeaderArray(csvRecordsArray);

        this.csvRecords = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
      };

      reader.onerror = function() {
        alert('Unable to read ' + input.files[0]);
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

        const csvRecord: CSVRecord = new CSVRecord();

        csvRecord.studentName = data[0].trim();
        csvRecord.failProbability = data[1].trim();

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

  downloadCSV(csv: any, filename: any) {
    let csvFile;
    let downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: 'text/csv'});

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

  exportTableToCSV(filename: any) {
    const csv = [];
    const rows = document.querySelectorAll('table tr');

    for (let i = 0; i < rows.length; i++) {
      const row = [], cols = rows[i].querySelectorAll('td, th');

      for (let j = 0; j < cols.length; j++)
        row.push(cols[j].innerHTML);

      csv.push(row.join(','));
    }

    // Download CSV file
    this.downloadCSV(csv.join('\n'), filename);
  }
}

export class CSVRecord {

  public studentName: any;
  public failProbability: any;

  constructor() { }

}
