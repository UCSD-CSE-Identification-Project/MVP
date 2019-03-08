import { Injectable } from '@angular/core';
import {AuthService} from './auth.service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {forkJoin} from 'rxjs';
import {catchError, timeout} from 'rxjs/internal/operators';


@Injectable({
  providedIn: 'root'
})
export class UserTermImageInformationService {

  private userId: string;
  /*
  private prevTermId: string;
  private currTermId: string;
  private prev_all_image_list: any;
  private prev_individual_image_list: any;
  */
  private prevTermGeneralInfo;
  private currTermGeneralInfo;

  constructor(private authService: AuthService, private http: HttpClient) {
    this.userIdVal = this.authService.getUser();
    console.log(this.userId);
    /*
    this.prevTermIdVal = '';
    this.currTermIdVal = '';
    this.prevTermAllImages = {};
    this.prevTermIndividualImages = {};
    */
    this.prevTermGeneralInfo = this.constructTermObj();
    this.currTermGeneralInfo = this.constructTermObj();
  }
  constructTermObj() {
    // return {
    //   termId: '',
    //   allTermImages: {},
    //   individualImages: {},
    //   groupImages: {},
    //   isoImages:{},
    //   loadedFromDatabase: false,
    //   keyImages: {},
    //   finished: false
    // };
    return {
      termId: 'vk8QLcAEIuHg8dq9YvM5',
      allTermImages: {
        "L1710031354_C1":"DI2VQtuF7sibjKjvjqr0",
        "L1710031354_C10": "H4YfwwhNKp0O9TyTttBW",
        "L1710031354_C11": "vgawjhYw4oxAWIRYvCym",
        "L1710031354_C12": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C2": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C3": "nc36VPWG8BzxTGY2bUyv",
        // "L1710031354_C4": "NwYDlxHyWtgnmXFjIYxX",
        // "L1710031354_C5": "HJXwrWCAfrAjPrcr2H6p",
        // "L1710031354_C6": "gjlzfSBjexvXwrNMMdTP",
        // "L1710031354_C7": "B448FESXmtHi14rOoARq",
        // "L1710031354_C8": "1pPrW9wrBiOcadO9wxNO",
        // "L1710031354_C9": "B410icQTa6xzVz5PrpOW"
      },
      individualImages: {
        // "L1710031354_C10": "H4YfwwhNKp0O9TyTttBW",
        // "L1710031354_C11": "vgawjhYw4oxAWIRYvCym",
        // "L1710031354_C12": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C2": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C3": "nc36VPWG8BzxTGY2bUyv",
        // "L1710031354_C4": "NwYDlxHyWtgnmXFjIYxX",
        // "L1710031354_C5": "HJXwrWCAfrAjPrcr2H6p",
        // "L1710031354_C6": "gjlzfSBjexvXwrNMMdTP",
        // "L1710031354_C7": "B448FESXmtHi14rOoARq",
        // "L1710031354_C8": "1pPrW9wrBiOcadO9wxNO",
        // "L1710031354_C9": "B410icQTa6xzVz5PrpOW",
        // "L1710031354_C13": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C14": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C15": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C16": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C17": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C18": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C19": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C20": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C21": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C22": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C24": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C25": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C27": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C28": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C29": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C30": "QwDghFK3Fd25Iq6zHiKJ",
        "L1710031354_C23": "QwDghFK3Fd25Iq6zHiKJ",
      },
      groupImages: {
        // "L1710031354_C1":"DI2VQtuF7sibjKjvjqr0",
        // "L1710031354_C10": "H4YfwwhNKp0O9TyTttBW",
        // "L1710031354_C11": "vgawjhYw4oxAWIRYvCym",
        // "L1710031354_C12": "VY7Z3Q9EqoryaQG7of1d",
        // "L1710031354_C2": "QwDghFK3Fd25Iq6zHiKJ",
        // "L1710031354_C3": "nc36VPWG8BzxTGY2bUyv",
        // "L1710031354_C4": "NwYDlxHyWtgnmXFjIYxX",
        // "L1710031354_C5": "HJXwrWCAfrAjPrcr2H6p",
        // "L1710031354_C6": "gjlzfSBjexvXwrNMMdTP",
        // "L1710031354_C7": "B448FESXmtHi14rOoARq",
        // "L1710031354_C8": "1pPrW9wrBiOcadO9wxNO",
        // "L1710031354_C9": "B410icQTa6xzVz5PrpOW"
      },
      isoImages:{
        "L1710031354_C1":"DI2VQtuF7sibjKjvjqr0",
      },
      loadedFromDatabase: false,
      keyImages: {},
      finished: false
    };
  }
  get userIdVal() {
    if ( this.userId === '' ){
      return this.authService.getUser();
    }
    return this.userId;
  }
  set userIdVal(uid: string) {
    this.userId = uid;
  }
  get prevTermIdVal() {
    return this.prevTermGeneralInfo.termId;
  }
  set prevTermIdVal(termUid: string) {
    this.prevTermGeneralInfo.termId = termUid;
  }
  get currTermIdVal() {
    return this.currTermGeneralInfo.termId;
  }
  set currTermIdVal(termUid: string) {
    this.currTermGeneralInfo.termId = termUid;
  }

  get currTermAllImages() {
    return this.currTermGeneralInfo.allTermImages;
  }
  set currTermAllImages(arrOfImageNames: any) {
    this.currTermGeneralInfo.allTermImages = arrOfImageNames;
  }
  get prevTermAllImages() {
    return this.prevTermGeneralInfo.allTermImages;
  }
  set prevTermAllImages(arrOfImageNames: any) {
    this.prevTermGeneralInfo.allTermImages = arrOfImageNames;
  }
  pushImageToCurrAllImages(imageKey: string, imageVal: string){
    this.currTermGeneralInfo.allTermImages[imageKey] = imageVal;
  }
  pushImageToPrevAllImages(imageKey: string, imageVal: string ){
    this.prevTermGeneralInfo.allTermImages[imageKey] = imageVal;
  }

  get currTermIndividualImages() {
    return this.currTermGeneralInfo.individualImages;
  }
  get prevTermIndividualImages() {
    return this.prevTermGeneralInfo.individualImages;
  }
  get prevTermIsoImages(){
    return this.prevTermGeneralInfo.isoImages;
  }
  get currTermIsoImages(){
    return this.currTermGeneralInfo.isoImages;
  }
  get prevTermGroupImages(){
    return this.prevTermGeneralInfo.groupImages;
  }
  get currTermGroupImages(){
    return this.currTermGeneralInfo.groupImages;
  }
  set currTermIndividualImages( arrIndImgNames: any){
    this.currTermGeneralInfo.individualImages = arrIndImgNames;
  }
  set prevTermIndividualImages(arrIndImgNames: any) {
    this.prevTermGeneralInfo.individualImages = arrIndImgNames;
  }
  set prevTermGroupImages(arrIndImgNames: any) {
    this.prevTermGeneralInfo.groupImages = arrIndImgNames;
  }
  set prevTermIsoImages(arrIndImgNames: any) {
    this.prevTermGeneralInfo.isoImages = arrIndImgNames;
  }
  set prevTermKeyImages(arrIndImgNames: any) {
    this.prevTermGeneralInfo.keyImages = arrIndImgNames;
  }
  saveImageToPrevIndImages(imageName: string, imageKey: string) {
    this.prevTermGeneralInfo.individualImages[imageName] = imageKey;
  }
  saveImageToCurrIndImages(imageName: string, imageKey: string) {
    this.currTermGeneralInfo.individualImages[imageName] = imageKey;
  }

  saveImageToPrevGroupImages( imageName: string, imageKey: string) {
    this.prevTermGeneralInfo.groupImages[imageName] = imageKey;
  }
  saveImageToCurrGroupImages( imageName: string, imageKey: string) {
    this.currTermGeneralInfo.groupImages[imageName] = imageKey;
  }

  saveImageToPrevIsoImages( imageName: string, imageKey: string) {
    this.prevTermGeneralInfo.isoImages[imageName] = imageKey;
  }
  saveImageToCurrIsoImages( imageName: string, imageKey: string) {
    this.currTermGeneralInfo.isoImages[imageName] = imageKey;
  }

  get prevTermLoadedFromDatabase(){
    return this.prevTermGeneralInfo.loadedFromDatabase;
  }
  set prevTermLoadedFromDatabase( boolVal: boolean){
    this.prevTermGeneralInfo.loadedFromDatabase = boolVal;
  }
  get currTermLoadedFromDatabase(){
    return this.currTermGeneralInfo.loadedFromDatabase;
  }
  set currTermLoadedFromDatabase( boolVal: boolean){
    this.currTermGeneralInfo.loadedFromDatabase = boolVal;
  }

  get prevTermFinished() {
    return this.prevTermGeneralInfo.finished;
  }
  set prevTermFinished( bool : boolean ) {
    this.prevTermGeneralInfo.finished = bool;
  }
  get currTermFinished() {
    return this.currTermGeneralInfo.finished;
  }
  set currTermFinished(bool: boolean) {
    this.currTermGeneralInfo.finished = bool;
  }
  get prevTerm() {
    return this.prevTermGeneralInfo;
  }
  set prevTerm(obj) {
    this.prevTermGeneralInfo = obj;
  }
  get currTerm() {
    return this.currTermGeneralInfo;
  }
  set currTerm(obj) {
    this.currTermGeneralInfo = obj;
  }
  get prevTermKeyImages(){
    return this.prevTermGeneralInfo.keyImages;
  }
  saveKeyImageToPrevTerm( imageKey: string, subGrouping: Object){
    this.prevTermGeneralInfo.keyImages[imageKey] = subGrouping;
  }
  get currTermKeyImages(){
    return this.currTermGeneralInfo.keyImages;
  }
  saveKeyImageToCurrTerm( imageKey: string, subGrouping: Object ){
    this.currTermGeneralInfo.keyImages[imageKey] = subGrouping;
  }

  makePostRequest(imageIdVal){
    // let params = new HttpParams();

    // params = params.append('prevTerm', "1QW5NOAT1U3RkHt9kF5F");//this.prevTermIdVal);
    // params = params.append('currTerm', "1QW5NOAT1U3RkHt9kF5F");//this.currTermIdVal);
    // this.http.post("/imagesPost",{params: params},
    // this.http.post("/imagesPost",{'prevTerm':"1QW5NOAT1U3RkHt9kF5F", 'currTerm':"1QW5NOAT1U3RkHt9kF5F"},
    //   {headers: new HttpHeaders({'Content-Type':'application/json'}),
    //     responseType:'text'}).subscribe((res) => {console.log(res);});
    /*return this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/singleImageMatch",{'prevTermImageId': imageIdVal, 'currTerm': this.currTermIdVal},
      {headers: new HttpHeaders({'Content-Type':'application/json'}),
        responseType:'text'});*/
  }

  makeSingleRequest(imageIdVal: string){
    console.log(imageIdVal);
    console.log(this.currTermIdVal);
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('prevTermImageId', imageIdVal);
    params = params.append('currTerm', this.currTermIdVal);
    /*return this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/singleImageMatch",{'prevTermImageId': imageIdVal, 'currTerm': this.currTermIdVal},
      {headers: new HttpHeaders({'Content-Type':'application/json'}),
        responseType:'text'});*/

    return this.http.post("https://us-central1-ersp-identification.cloudfunctions.net/singleImageMatch", { headers: headers, params: params });

    // return x;

    // 10 seconds = 10,000 ms
    // return this.http.post("/singleImagesPost",{'prevTermImageId': imageIdVal, 'currTerm': "1QW5NOAT1U3RkHt9kF5F"},
    //   {headers: new HttpHeaders({'Content-Type':'application/json'}),
    //     responseType:'text'});
  }


  addZero(str) {
    var Qindex = str.lastIndexOf('Q');
    var dotIndex = str.lastIndexOf('.');
    // if (Qindex == -1 || dotIndex == -1){
    //   console.log("Can't find 'Q' or '.' in the name");
    // }
    var numLen = dotIndex - Qindex;
    // If the Question number contain only one number, add a zero infromt of it
    if (numLen == 2){
      // Do I return or assign str to
      str = str.slice(0, Qindex+1) + "0" + str.slice(Qindex+1,str.length);
    }
    return str;

  }


}
