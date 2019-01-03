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
  private prevTerm;
  private currTerm;

  constructor(private authService: AuthService) {
    this.userIdVal = this.authService.getUser();
    console.log(this.userId);
    /*
    this.prevTermIdVal = '';
    this.currTermIdVal = '';
    this.prevTermAllImages = {};
    this.prevTermIndividualImages = {};
    */
    this.prevTerm = this.constructTermObj();
    this.currTerm = this.constructTermObj();
  }
  constructTermObj() {
    return {
      termId: '',
      allTermImages: {},
      individualImages: [],
      loadedFromDatabase: false,
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
    return this.prevTerm.termId;
  }
  set prevTermIdVal(termUid: string) {
    this.prevTerm.termId = termUid;
  }
  get currTermIdVal() {
    return this.currTerm.termId;
  }
  set currTermIdVal(termUid: string) {
    this.currTerm.termId = termUid;
  }

  get currTermAllImages() {
    return this.currTerm.allTermImages;
  }
  set currTermAllImages(arrOfImageNames: any) {
    this.currTerm.allTermImages = arrOfImageNames;
  }
  get prevTermAllImages() {
    return this.prevTerm.allTermImages;
  }
  set prevTermAllImages(arrOfImageNames: any) {
    this.prevTerm.allTermImages = arrOfImageNames;
  }
  pushImageToCurrAllImages(imageKey: string, imageVal: string){
    this.currTerm.allTermImages[imageKey] = imageVal;
  }
  pushImageToPrevAllImages(imageKey: string, imageVal: string ){
    this.prevTerm.allTermImages[imageKey] = imageVal;
  }

  get currTermIndividualImages() {
    return this.currTerm.individualImages;
  }
  set prevTermIndividualImages( arrIndImgNames: any){
    this.currTerm.individualImages = arrIndImgNames;
  }
  get prevTermIndividualImages() {
    return this.prevTerm.individualImages;
  }
  set prevTermIndividualImages(arrIndImgNames: any) {
    this.prevTerm.individualImages = arrIndImgNames;
  }
  pushImageToPrevIndImages( imageKey: string) {
    this.prevTerm.individualImages.push(imageKey);
  }
  pushImageToCurrIndImages( imageKey: string) {
    this.currTerm.individualImages.push(imageKey);
  }

  get prevTermLoadedFromDatabase(){
    return this.prevTerm.loadedFromDatabase;
  }
  set prevTermLoadedFromDatabase( boolVal: boolean){
    this.prevTerm.loadedFromDatabase = boolVal;
  }
  get currTermLoadedFromDatabase(){
    return this.currTerm.loadedFromDatabase;
  }
  set currTermLoadedFromDatabase( boolVal: boolean){
    this.currTerm.loadedFromDatabase = boolVal;
  }
}
