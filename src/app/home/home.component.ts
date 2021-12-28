import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../service/common.service';
import { ImageService } from '../service/image.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  eventList : any=  [];
  images = [1, 2, 3, 4].map((n) => `assets/img/slide/slide-${n}.jpg`);

  constructor(config: NgbCarouselConfig, private commonService :CommonService) {
    // customize default values of carousels used by this component tree
    config.interval = 10000;
    config.wrap = true;
    config.keyboard = false;
    config.pauseOnHover = false;
  }
  ngOnInit(): void {
    this.eventList = this.commonService.eventList;
    console.log(this.eventList)
  }

  loadImages(){

  }

}
