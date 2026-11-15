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
  loadError = '';

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
    this.loadError = '';
    this.data = null;
    return d3.json(path
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
        member.secondaryParentMemberId = unParsedMember.secondaryParentMemberId || unParsedMember.secondaryparentmemberid;
        
        parsedData.push(member)
      }
      this.data = parsedData;
      // The tree feed contains names only. Resolve real IDs for multiple spouses
      // rather than assuming that the name order matches numbered spouse IDs.
      for (const member of parsedData.filter((item: any) => item.spouseList?.length > 1)) {
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
              this.loadSpouseChildren(member, parsedData);
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

    }).catch(() => {
      this.data = [];
      this.loadError = 'Unable to load the family tree. Please try again.';
    });
  }

  loadSpouseChildren(member: any, tree: any[]): void {
    const children = new Map(tree.filter(item => item.parentNodeId === member.nodeId)
      .map(item => [item.nodeId, item]));
    for (const spouse of member.spouses || []) {
      if (!spouse.nodeId) continue;
      // Existing member endpoints already return a spouse's children by ID.
      // This also works with deployed APIs that omit co-parent fields in child summaries.
      this.commonService.doGet(`/.netlify/functions/users/${encodeURIComponent(spouse.nodeId)}`)
        .subscribe({
          next: (response: any) => {
            const records = this.cryptoService.decryptAndParse(response.data);
            const record = records.find((item: any) => item.nodeId === spouse.nodeId);
            if (!record) return;
            for (const child of record.childrens || []) {
              const treeChild = children.get(child.nodeId);
              if (treeChild) treeChild.secondaryParentMemberId = spouse.nodeId;
            }
            this.data = [...tree];
          },
          error: () => { /* Keep unresolved parentage unassigned; never guess a spouse. */ }
        });
    }
  }

}
