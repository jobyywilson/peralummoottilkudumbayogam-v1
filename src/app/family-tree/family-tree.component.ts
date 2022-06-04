import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import { CommonService } from '../service/common.service';
import { CryptoService } from '../service/crypto.service';

@Component({
  selector: 'app-family-tree',
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.css']
})
export class FamilyTreeComponent implements OnInit {

  data:any;
  selectedUserId : any;

  constructor(private commonService : CommonService, private cryptoService:CryptoService,private route: ActivatedRoute) {
    let paramMap = this.route.snapshot.paramMap;
    if(paramMap){
      this.selectedUserId = paramMap.get("id");
    }
    
   }

  ngOnInit(): void {
    //this.loadTree("./assets/data/familyData.json");
    this.commonService.readFile("./assets/data/familyTree.json").subscribe(data=>{
      console.log(data)
      this.data = data;
      for(let index=0;index<this.data.length;index++){
        this.data[index].nameAndCode = this.data[index].nodeId +"-"+ this.data[index].name;
        this.data[index].bornOn = this.data[index].bornOn;
        if(this.data[index] && this.data[index].profilePic){
          this.data[index].profilePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+this.data[index].nodeId+".jpg";
        }else{
          this.data[index].profilePic = "assets/img/user.png";
        }
      }
      
    });

  }

  loadTree(path:string){
    d3.json(path
    ).then((data:any) => {
      this.data = JSON.parse(this.cryptoService.decrypt(data.data))
      for(let index=0;index<this.data.length;index++){
        this.data[index].nameAndCode = this.data[index].nodeId +"-"+ this.data[index].name;
        this.data[index].bornOn = this.data[index].bornOn;
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
