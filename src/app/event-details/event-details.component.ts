import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {

  constructor(private route: ActivatedRoute,private commonService: CommonService) { }

  type : any = "";
  id : any = "";
  data : any = {};
  postList : any =[];
  ngOnInit(): void {
    let paramMap = this.route.snapshot.paramMap;
    this.type = paramMap.get("type");
    this.id = paramMap.get("id");
    this.loadPostInfo();
    this.loadData();
    
  }

  async loadData(){
    let fileName = "src/assets/content/posts/"+this.type;
    let rawData = await this.commonService.doGet("assets/content/"+this.type+"/"+this.id).toPromise();
    this.data = this.commonService.mapPost(rawData,fileName)
  }

  loadPostInfo(){
    this.commonService.getPostedInfo().subscribe(
          async data => {
            let events = await this.commonService.mapPostedInfo(data);
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
