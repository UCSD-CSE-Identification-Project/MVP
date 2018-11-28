import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  fileNames: String[] = [];

  constructor() { }
}
