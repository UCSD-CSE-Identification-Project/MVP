import { Injectable } from '@angular/core';
import {AuthService} from './auth.service';

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

  constructor(private authService: AuthService) {
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
    return {
      termId: '',
      allTermImages: {},
      individualImages: [],
      loadedFromDatabase: false,
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
  set currTermIndividualImages( arrIndImgNames: any){
    this.currTermGeneralInfo.individualImages = arrIndImgNames;
  }
  get prevTermIndividualImages() {
    return this.prevTermGeneralInfo.individualImages;
  }
  set prevTermIndividualImages(arrIndImgNames: any) {
    this.prevTermGeneralInfo.individualImages = arrIndImgNames;
  }
  pushImageToPrevIndImages( imageKey: string) {
    this.prevTermGeneralInfo.individualImages.push(imageKey);
  }
  pushImageToCurrIndImages( imageKey: string) {
    this.currTermGeneralInfo.individualImages.push(imageKey);
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
}
