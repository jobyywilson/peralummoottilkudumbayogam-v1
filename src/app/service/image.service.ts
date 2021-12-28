import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 
@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http :HttpClient ) { }
  public getSlideImage(imageNo : number): Observable<any> {
    return this.http.get(`./assets/img/slide/slide-${imageNo}.jpg`);
}
}
