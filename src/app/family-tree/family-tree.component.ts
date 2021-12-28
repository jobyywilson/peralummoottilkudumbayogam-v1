import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-family-tree',
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.css']
})
export class FamilyTreeComponent implements OnInit {

  data:any;

  constructor(private commonService : CommonService) {

   }

  ngOnInit(): void {
    this.loadTree("./assets/data/familyTree.json");
    // this.commonService.readFile("./assets/data/familyTree.json").subscribe(data=>{
    //   console.log(data)
    //   this.loadTree(data);
      
    // });

  }

  loadTree(path:string){
    d3.json(path
    ).then((data:any) => {
      this.data=data;
    //this.data = JSON.parse(atob(data["data"]));
      for(let index=0;index<this.data.length;index++){
        this.data[index].nameAndCode = this.data[index].nodeId +"-"+ this.data[index].name;
        if(this.data[index] && this.data[index].profilePic){
          this.data[index].profilePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+this.data[index].nodeId+".jpg";
        }else{
          this.data[index].profilePic = "assets/img/user.png";
        }
      }
      let prevIndex = 0;
      // setInterval((d:any) => {
      //   data[prevIndex]._highlighted = 'false';
      //   let index = Math.floor(Math.random() * 10);
      //   prevIndex = index;
      //   data[index]._centered = 'true';
      //   data[index]._expanded = 'true';
      //   data[index]._highlighted = 'true';
      //   this.data = Object.assign([], data);
      // }, 1000);

    });
  }

}
