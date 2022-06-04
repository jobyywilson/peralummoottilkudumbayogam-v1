import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest } from 'rxjs';
import { CommonService } from '../service/common.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  eventList : any = [];
  postList : any = [];
  images = [1, 2, 3, 4].map((n) => `assets/img/slide/slide-${n}.jpg`);

  constructor(config: NgbCarouselConfig, private commonService :CommonService) {
    // customize default values of carousels used by this component tree
    config.interval = 10000;
    config.wrap = true;
    config.keyboard = false;
    config.pauseOnHover = false;
  }
  ngOnInit(): void {
    this.loadData();
    console.log(this.eventList)
  }

  loadData(){
    let combinedData = [this.commonService.getPostedInfo()]
        combineLatest(combinedData).subscribe(
          (data:any) => {
            this.commonService.mapPostedInfo(data[0]);
            this.eventList = this.commonService.eventsInfo;
            this.postList = this.commonService.postInfo;
            console.log(this.eventList)
          },
        (err:any) => console.error(err)
        );
    }

}
