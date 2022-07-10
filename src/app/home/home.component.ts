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

  postList : any = [];
  obituaryList : any = [];
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
  }

  loadData(){
    this.commonService.getPostedInfo().subscribe(
          async (data:any) => {
            let events = await this.commonService.mapPostedInfo(data)
            this.postList = events["posts"];
            this.obituaryList = events["obituaries"];
          },
        (err:any) => console.error(err)
        );
    }

}
