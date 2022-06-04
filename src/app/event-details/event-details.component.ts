import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
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
    let combinedData = [this.commonService.getPostedInfo()]
        combineLatest(combinedData).subscribe(
          data => {
            this.commonService.mapPostedInfo(data[0]);
            this.postList = this.commonService.postInfo;
          },
        (err:any) => console.error(err)
        );
    }

}
