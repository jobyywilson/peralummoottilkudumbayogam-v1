import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import { CommonService } from '../service/common.service';
import { CryptoService } from '../service/crypto.service';
import { ImageService } from '../service/image.service';

@Component({
  selector: 'app-family-tree',
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.css']
})
export class FamilyTreeComponent implements OnInit {

  data:any;
  selectedUserId : any;

  constructor(private commonService : CommonService, private cryptoService:CryptoService,private route: ActivatedRoute,private imageService:ImageService) {
    let paramMap = this.route.snapshot.paramMap;
    if(paramMap){
      let selectedUserId : any = paramMap.get("id");
      if(selectedUserId && /S\d*$/.test(selectedUserId)){
        selectedUserId = selectedUserId.replace(/S\d*$/, "");
      }
      this.selectedUserId = selectedUserId
    }
    
   }

  ngOnInit(): void {
    
    this.loadTree(".netlify/functions/users");
    // this.commonService.readFile("./assets/data/familyTree.json").subscribe(data=>{
    //   console.log(this.cryptoService.encrypt(data))


    //   for(let index=0;index<this.data.length;index++){
    //     this.data[index].nameAndCode = this.data[index].nodeId +"-"+ this.data[index].name;
    //     this.data[index]._expanded= true
    //     this.data[index].bornOn = this.data[index].bornOn;
    //     if(this.data[index] && this.data[index].profilePic){
    //       this.data[index].profilePic = "https://raw.githubusercontent.com/jobyywilson/peralummoottil-resource/main/"+this.data[index].nodeId+".jpg";
    //     }else{
    //       this.data[index].profilePic = "assets/img/user.png";
    //     }
    //   }
      
    // });

  }

  loadTree(path:string){
    d3.json(path
      ).then((data:any) => {
        let unParsedData = this.cryptoService.decryptAndParse(data.data)
        let parsedData : any = [];
      for(let unParsedMember of unParsedData){
        let member : any = {};
        member.nameAndCode = unParsedMember.nodeid +"-"+ unParsedMember.name;
        let photoInfo = this.imageService.getUserPhotoUrl(unParsedMember.nodeid)
        member.profilePic = photoInfo.profilePic;
        member.spousePic = photoInfo.spousePic;
        if(unParsedMember.spouse){
          member.spouseList = unParsedMember.spouse.split("::")
            .map((name: string) => name.trim()).filter((name: string) => !!name);
          member.spouse = member.spouseList[member.spouseList.length - 1];
        }
        

        member.nodeId = unParsedMember.nodeid;
        member.name = unParsedMember.name;
        member.parentNodeId = unParsedMember.parentnodeid;
        
        parsedData.push(member)
      }
      this.data = parsedData;
      // The tree feed contains names only. Resolve real IDs for multiple spouses
      // rather than assuming that the name order matches numbered spouse IDs.
      for (const member of parsedData.filter((item: any) => item.spouseList?.length > 1)) {
        // Child records carry the actual co-parent ID; never infer it from spouse order.
        this.commonService.doGet(`.netlify/functions/users?nodeId=${encodeURIComponent(member.nodeId)}`)
          .subscribe({
            next: (response: any) => {
              const details = this.cryptoService.decryptAndParse(response.data);
              for (const child of details[0]?.childrens || []) {
                const treeChild = parsedData.find((item: any) => item.nodeId === child.nodeId);
                if (treeChild) treeChild.secondaryParentMemberId = child.secondaryParentMemberId;
              }
              this.data = [...parsedData];
            },
            error: () => { /* Unknown parentage stays explicitly unconfirmed. */ }
          });
        this.commonService.doGet(`.netlify/functions/relationship?memberId=${encodeURIComponent(member.nodeId)}`)
          .subscribe({
            next: (response: any) => {
              const relationships = this.cryptoService.decryptAndParse(response.data);
              const spouses = relationships.map((item: any) => item.spouse)
                .filter((spouse: any) => spouse && spouse.nodeId);
              const remaining = [...spouses];
              const ordered = member.spouseList.map((name: string) => {
                const index = remaining.findIndex((spouse: any) => spouse.name.trim() === name);
                return index >= 0 ? remaining.splice(index, 1)[0] : { name };
              });
              member.spouses = [...ordered, ...remaining].sort((a: any, b: any) => {
                const rank = (person: any) => person.nodeId?.match(/S(\d*)$/)?.[1] || '0';
                return Number(rank(a)) - Number(rank(b));
              }).map((spouse: any) => ({
                ...spouse,
                profilePic: this.imageService.getUserPhotoByUserId(spouse.nodeId)
              }));
              this.data = [...parsedData];
            },
            error: () => { /* Keep the spouse names visible if details cannot load. */ }
          });
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
