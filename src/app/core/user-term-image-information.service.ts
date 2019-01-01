import { Injectable } from '@angular/core';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserTermImageInformationService {

  private userId: string;
  private prevTermId: string;
  private currTermId: string;
  private all_image_list: any;
  private individual_image_list: any;

  constructor(private authService: AuthService) {
    this.userIdVal = this.authService.getUser();
    console.log(this.userId);
    this.prevTermIdVal = '';
    this.currTermIdVal = '';
    this.allImages = {};
    this.individualImages = {};
  }

  get userIdVal() {
    if( this.userId === '' ){
      return this.authService.getUser();
    }
    return this.userId;
  }
  set userIdVal(uid: string) {
    this.userId = uid;
  }

  get prevTermIdVal() {
    return this.prevTermId;
  }
  set prevTermIdVal(termUid: string) {
    this.prevTermId = termUid;
  }

  get currTermIdVal() {
    return this.currTermId;
  }
  set currTermIdVal(termUid: string) {
    this.currTermId = termUid;
  }

  get allImages() {
    return this.all_image_list;
  }
  set allImages(arrOfImageNames: any) {
    this.all_image_list = arrOfImageNames;
  }

  pushImageToAllImages( imageKey: string,imageVal: string ){
    this.all_image_list[imageKey] = imageVal;
  }

  get individualImages() {
    return this.individual_image_list;
  }

  set individualImages(arrIndImgNames: any) {
    this.individual_image_list = arrIndImgNames;
  }
}
