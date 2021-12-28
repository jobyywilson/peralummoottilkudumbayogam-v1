import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  eventList : any=  [];
  selectedCategory  :string = "all";
  

  constructor(private commonService :CommonService) { }

  ngOnInit(): void {
    this.eventList =this.commonService.eventList;
  }
  selectCategory(category : string){
    this.selectedCategory = category;
  }

  formatDate(dateObject : Date): string{
    console.log(dateObject)
    let dayNo = new Date(dateObject).getDay()
    let monthNo = new Date(dateObject).getMonth()
    let time = new Date(dateObject).getHours()

    return `${weekday[dayNo]}, ${monthNames[monthNo]} at ${time}`;
    
  }


}
