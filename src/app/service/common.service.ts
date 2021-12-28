import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const EVENT_URL =".netlify/functions/events"
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];
const EXPIRY_TIME = 60;
const LOCAL_STRG_NAME_EVENT = "events";
@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private events : Observable<any> |undefined;
  public eventList : any = [];
  constructor(private http :HttpClient ) {

  }


  public readFile(path :string): Observable<any> {
    return this.http.get(path);
  }

  private setWithExpiry(key: string, value : any, ttl : number) {
    const now = new Date()
    const item = {
      value: value,
      expiry: now.getTime() + 60000*ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }
  private getEventsFromStorage(key: string) {
    const itemStr = localStorage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
      return null
    }
    const item = JSON.parse(itemStr)
    const now = new Date();
    if (item==null || now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  }

  public getEventList(){
    var events = this.getEventsFromStorage(LOCAL_STRG_NAME_EVENT);
    if(events==null){
      this.http.get(EVENT_URL).subscribe((eventDataList:any)=>{
        
        for(var index =0;index<eventDataList.data.length;index++){
          var event = { 
            "name": "",
            "description": "",
            "date":"",
            "coverPic":"",
            "category":"",
            "monthShortName":"",
            "dayNo":0
          }
          //Sunday, September 26th at 7:00 pm
          event["name"] = eventDataList.data[index].name;
          event["description"] = eventDataList.data[index].description;
          if(eventDataList.data[index].cover!=null){
            event["coverPic"] = eventDataList.data[index].cover.source;
          }
          
         
          if(eventDataList.data[index].start_time!=null){
            let dateObj = new Date(eventDataList.data[index].start_time);
            let dayNo = dateObj.getDate();
            let monthNo = dateObj.getMonth()
            event["monthShortName"] = monthShortNames[monthNo];
            event["dayNo"] = dayNo;
          }
          this.eventList.push(event);
          
        }
        this.setWithExpiry(LOCAL_STRG_NAME_EVENT,this.eventList,EXPIRY_TIME);
      })
    }else{
      this.eventList = events;
    }
  }

}
