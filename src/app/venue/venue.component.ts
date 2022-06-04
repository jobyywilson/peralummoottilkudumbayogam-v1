import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.css']
})
export class VenueComponent implements OnInit {

  constructor(private commonService : CommonService) { }

  venueDetails : any;

  ngOnInit(): void {
    this.commonService.readFile("./assets/data/venue.json").subscribe((data:any)=>{
      this.venueDetails = data;
    });
  }

  ordinal_suffix_of(i : number) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return "st";
    }
    if (j == 2 && k != 12) {
        return "nd";
    }
    if (j == 3 && k != 13) {
        return "rd";
    }
    return "th";
}

}
