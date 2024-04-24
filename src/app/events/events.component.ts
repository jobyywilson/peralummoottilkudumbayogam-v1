import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../service/common.service';
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  
  constructor(private commonService : CommonService,private route: ActivatedRoute) { }



  eventList : any = [];
  postList : any = [];
  type : any ;

  ngOnInit(): void {
    let paramMap = this.route.snapshot.paramMap;
    this.type = paramMap.get("type")
   
    this.loadData();
  }

  loadData(){
    this.commonService.getPostedInfo().subscribe(
           async data => {
            let events = await this.commonService.mapPostedInfo(data)
            let type  = this.type.toString()
            if(type === "posts"){
              this.postList = events["posts"]
            }
            else if(type === "obituaries"){
              this.postList = events["obituaries"]
            }
          },
        (err:any) => console.error(err)
        );
    }
}
