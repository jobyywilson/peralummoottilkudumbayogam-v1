import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  constructor(private commonService : CommonService) { }

  galleryDetails : any;


  className: string = "test";
  eventType: string[] = [];
  years: string[] = [];
  selectedEvent: string = "All";
  selectedYear: string = "All";
  photoArray : any =[];

  ngOnInit(): void {
    this.commonService.readFile("./assets/data/gallery.json").subscribe((data:any)=>{
      this.galleryDetails = data;
      this.loadYears();
      this.loadEventTypes();
      this.loadPhotos();
    });
  }
  
  loadEventTypes(){
    this.eventType = ["All"];
    if(this.selectedYear == "All"){
      let eventSet = new Set<string>();
      for (let [year, evntInfo] of Object.entries(this.galleryDetails)) {
        let eventInfo : any = evntInfo;
        for (let [eventName, photoArray] of Object.entries(eventInfo)) {
          eventSet.add(eventName);
        }
      }
      this.eventType = this.eventType.concat(Array.from(eventSet.values()));

    }else{
      for (let [eventName, photoArray] of Object.entries(this.galleryDetails[this.selectedYear])) {   
        this.eventType.push(eventName);
      }
    }

  }

  loadYears(){
    this.years = ["All"];
    for (let [year, evntInfo] of Object.entries(this.galleryDetails)) {
      this.years.push(year);
    }
  }

  loadPhotos(){
    this.photoArray=[];

    for (let [year, evntInfo] of Object.entries(this.galleryDetails)) {
      if(this.selectedYear != "All" && this.selectedYear != year){
        continue;
      }else{
        let eventInfo : any = evntInfo;
        for (let [eventName, photoArray] of Object.entries(eventInfo)) {
          if(this.selectedEvent != "All" && this.selectedEvent != eventName){
            continue;
          }else{
            this.photoArray = this.photoArray.concat(photoArray);
          }
          
        }
      }
    }
    
  }


}
