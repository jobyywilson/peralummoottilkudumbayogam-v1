import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonService } from './common.service';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private imageCache: any = {};
  
  constructor(private http :HttpClient, private sanitizer: DomSanitizer ,private commonService : CommonService) {

   }
  public getSlideImage(imageNo : number): Observable<any> {
    return this.http.get(`./assets/img/slide/slide-${imageNo}.jpg`);
}
public getUserPhotoUrl(userId:string){
        let photoName;
        let spousePhotoName;
        if(this.commonService.memberIdWithPhotos.has(userId+".jpg")){
          photoName = userId+".jpg";
        }
        else if(this.commonService.memberIdWithPhotos.has(userId+".jpeg")){
          photoName = userId+".jpeg";
        }else if(this.commonService.memberIdWithPhotos.has(userId+".png")){
          photoName = userId+".png";
        }
        if(this.commonService.memberIdWithPhotos.has(userId+"S.jpeg")){
          spousePhotoName = userId+"S.jpeg";
        } else if(this.commonService.memberIdWithPhotos.has(userId+"S.png")){
          spousePhotoName = userId+"S.png";
        } else if(this.commonService.memberIdWithPhotos.has(userId+"S.jpg")){
          spousePhotoName = userId+"S.jpg";
        }
        let profilePic = "assets/img/user.png"
        let spousePic =  "assets/img/user.png"
          if(photoName){
            profilePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+photoName;
        }
        if(spousePhotoName){
          spousePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+spousePhotoName;
        }else{
          spousePic = "assets/img/user.png";
        }
        return {profilePic:profilePic,spousePic:spousePic}
  }
public getUserPhotoByUserId(userId: string): any {
  let photoInfo = this.getUserPhotoUrl(userId)
  if(userId && userId.endsWith("S")){
    return photoInfo.spousePic
  }

  return photoInfo.profilePic;
}

public getUserPhotos(url: string): any {
  if(!url){
    url =   "assets/img/user.png";
  }
  if(!this.imageCache[url]){
    this.loadUserPhotos(url)
    return url;
  }
  return this.imageCache[url]
}
public loadUserPhotos(url: string): any {
  return new Promise<any>((resolve, reject) => {
    this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
      const reader = new FileReader();
      reader.onload = (event:any) => {
        const base64 = event.target.result as string;
        this.imageCache[url]  = base64;
        resolve(this.imageCache[url]);
      };
      reader.onerror = (event) => {
        reject(event);
      };
      reader.readAsDataURL(blob);
      
    }, (error) => {
      reject(error);
    });
  });
}
}
