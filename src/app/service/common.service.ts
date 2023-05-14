import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { combineLatest, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  configUrl = 'https://api.github.com/repos/jobyywilson/peralummoottilkudumbayogam-v1/git/trees/main?recursive=1';
  memberPhotoUrl = 'https://api.github.com/repos/jobyywilson/peralummoottil-resource/git/trees/main?recursive=1';
  memberIdWithPhotos = new Set();
  postInfo : any = [];
  eventsInfo : any = [];
  obituariesInfo : any = [];

  constructor(private http: HttpClient) { }

  fetchMemberPhotoInfo(){
    return this.doGet(this.memberPhotoUrl) 
  }
  getPostedInfo(){
    return this.doGet(this.configUrl);
  }

  doGet(url:string){
    return this.http.get<any>(url);
  }

  async getEventsInfo(){
    let events = localStorage.getItem('events');
    if(!events){
      await this.loadInfo();
    }
    return localStorage.getItem('events');
  }

  async loadInfo(){
    let combinedData = [this.getPostedInfo()]
    combineLatest(combinedData).subscribe(
      data => {
        this.mapPostedInfo(data[0]);
      },
    (err:any) => console.error(err)
    );

    

  }

  async mapPostedInfo(data:any){
    let eventPath = "src/assets/content/events/";
    let postsPath = "src/assets/content/posts/";
    let obituariesPath = "src/assets/content/obituaries/";
    for(let file of data["tree"]){
      let fileName = file.path;
      
      if(fileName.includes(eventPath)){

        let event = await this.doGet(fileName.replace("src/","")).toPromise()
        this.eventsInfo.push(this.mapEvent(event,fileName))
      }
      else if(fileName.includes(postsPath)){
        let posts = await this.doGet(fileName.replace("src/","")).toPromise()
        this.postInfo.push(this.mapPost(posts,fileName))
        
      }
      else if(fileName.includes(obituariesPath)){
        let obituary = await this.doGet(fileName.replace("src/","")).toPromise()
        this.obituariesInfo.push(this.mapObituaries(obituary,fileName))
      }
    }
    this.postInfo.push(...this.eventsInfo);
    this.postInfo = this.postInfo.sort(function (left :any, right: any) {
      let leftTime = left.time ? left.time:left.publishedAt;
      let rightTime = right.time ? right.time:right.publishedAt;
      return -(moment(leftTime).diff(moment(rightTime)))
    });
    this.obituariesInfo = this.obituariesInfo.sort(function (left :any, right: any) {
      return (moment(right.funeralAt).diff(moment(left.funeralAt)))
    });

    localStorage.setItem('posts', JSON.stringify(this.postInfo));
    localStorage.setItem('obituaries', JSON.stringify(this.obituariesInfo));
    return {"posts":this.postInfo,"obituaries":this.obituariesInfo}
  }

  mapDate(rawDate:any){
    let monthName = moment(rawDate).format('MMMM');
    let day = moment(rawDate).format('DD');
    let year = moment(rawDate).format('YYYY');
    return `${monthName} ${day}, ${year}`
  }

  mapObituaries(obituaryRawData:any,fileName:any){
    obituaryRawData.featuredImage = 'assets/static'+obituaryRawData.featuredImage;
    obituaryRawData.funeralAt = this.mapDate(obituaryRawData.funeralAt)
    obituaryRawData.filePath = fileName
    obituaryRawData.url = "events/obituaries/"+fileName.replace("src/assets/content/obituaries/","");
    obituaryRawData.galleryImages=[]
    return obituaryRawData
  }

  mapEvent(eventRawData:any,fileName:any){
    eventRawData.featuredImage = 'assets/static'+eventRawData.featuredImage;
    eventRawData.date = this.mapDate(eventRawData.time)
    eventRawData.filePath = fileName
    eventRawData.url = "events/event/"+fileName.replace("src/assets/content/events/","");
    eventRawData.galleryImages=[]
    return eventRawData
  }


  mapPost(postRawData:any,fileName:any){
  
    postRawData.featuredImage = 'assets/static'+postRawData.featuredImage;
    postRawData.date = this.mapDate(postRawData.publishedAt)
    postRawData.filePath = fileName
    postRawData.url = "events/posts/"+fileName.replace("src/assets/content/posts/","");
    let galleryImages=[]
    if(postRawData.galleryImages){
      for(let image of postRawData.galleryImages){
        galleryImages.push("assets/static"+image)
      }
    }

    postRawData.galleryImages=galleryImages
    return postRawData
  }



  public readFile(path :string): Observable<any> {
    return this.http.get(path);
  }
}
