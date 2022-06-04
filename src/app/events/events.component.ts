import { Component, OnInit } from '@angular/core';

import { combineLatest } from 'rxjs';
import { CommonService } from '../service/common.service';
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  
  constructor(private commonService : CommonService) { }



  eventList : any = [];
  postList : any = [];

  ngOnInit(): void {

    this.loadData();
  }

  loadData(){
    let combinedData = [this.commonService.getPostedInfo()]
        combineLatest(combinedData).subscribe(
          data => {
            this.commonService.mapPostedInfo(data[0]);
            this.eventList = this.commonService.eventsInfo;
            this.postList = this.commonService.postInfo;
          },
        (err:any) => console.error(err)
        );
    }
}
