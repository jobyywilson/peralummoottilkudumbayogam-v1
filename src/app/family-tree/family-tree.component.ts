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
  memberPhotoInfo : any;

  constructor(private commonService : CommonService, private cryptoService:CryptoService,private route: ActivatedRoute) {
    let paramMap = this.route.snapshot.paramMap;
    if(paramMap){
      this.selectedUserId = paramMap.get("id");
    }
    
   }

  ngOnInit(): void {
    
    this.commonService.getMemberPhotoInfo().subscribe(rawData=>{
      let tree = rawData.tree;
      let members = new Set();
      for(let memberPhotoInfo of tree){
        members.add(memberPhotoInfo.path);
      }
      this.memberPhotoInfo = members;
      this.loadTree("./assets/data/familyData.json");
    })
    
    // this.commonService.readFile("./assets/data/familyTree.json").subscribe(data=>{
    //   console.log(this.cryptoService.encrypt(data))


      // for(let index=0;index<this.data.length;index++){
      //   this.data[index].nameAndCode = this.data[index].nodeId +"-"+ this.data[index].name;
      //   this.data[index].bornOn = this.data[index].bornOn;
      //   if(this.data[index] && this.data[index].profilePic){
      //     this.data[index].profilePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+this.data[index].nodeId+".jpg";
      //   }else{
      //     this.data[index].profilePic = "assets/img/user.png";
      //   }
      // }
      
    // });

  }

  loadTree(path:string){
    d3.json(path
      ).then((data:any) => {
        this.data = this.cryptoService.decrypt(data.data)
      for(let member of this.data){
        member.nameAndCode = member.nodeId +"-"+ member.name;
        let photoName;
        let spousePhotoName;
        if(this.memberPhotoInfo.has(member.nodeId+".jpg")){
          photoName = member.nodeId+".jpg";
        }
        else if(this.memberPhotoInfo.has(member.nodeId+".jpeg")){
          photoName = member.nodeId+".jpeg";
        }else if(this.memberPhotoInfo.has(member.nodeId+".png")){
          photoName = member.nodeId+".png";
        }
        if(this.memberPhotoInfo.has(member.nodeId+".S.jpeg")){
          spousePhotoName = member.nodeId+".S.jpeg";
        } else if(this.memberPhotoInfo.has(member.nodeId+".S.png")){
          spousePhotoName = member.nodeId+"S.png";
        } else if(this.memberPhotoInfo.has(member.nodeId+".S.jpg")){
          spousePhotoName = member.nodeId+".S.jpg";
        }


        if(member){
          if(photoName){
            member.profilePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+photoName;
        }else{
          member.profilePic = "assets/img/user.png";
        }
        if(spousePhotoName){
          member.spousePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+spousePhotoName;
        }else{
          member.spousePic = "assets/img/user.png";
        }
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
