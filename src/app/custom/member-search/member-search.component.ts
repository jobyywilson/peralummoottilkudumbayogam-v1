import { Component, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { CommonService } from 'src/app/service/common.service';
import { CryptoService } from 'src/app/service/crypto.service';
import { SpouseInfo } from '../member-info/model/spouse-info';
import { ChildInfo } from '../member-info/model/child-info';

@Component({
  selector: 'app-member-search',
  templateUrl: './member-search.component.html',
  styleUrls: ['./member-search.component.css']
})
export class MemberSearchComponent {
  @ViewChild(MatAccordion) accordion: any;

  term: string = '';
  memberList : any[] = [];
  selectedMemberId: string = '';
  selectedMember:any = '';
  memberInfo: any;
  spouseInfo:any;
  childInfo:any;
  isExpired: boolean = true;
  constructor(private commonService: CommonService, private cryptoService: CryptoService) {
    
    this.loadData();
  }

  selectMember(selectedMemberId:any){
    console.log(selectedMemberId)
    if(selectedMemberId && selectedMemberId.length == 0){
      return;
    }
    this.commonService.doGet(`.netlify/functions/memberUndeployed/${selectedMemberId}`).subscribe((memberInfo) => {
      let responseData = this.cryptoService.decryptAndParse(memberInfo.data)
      this.selectedMember = responseData.length > 0 ? responseData[0] : {}
      let memberName = this.selectedMember.name
      let nickName = this.selectedMember.nickname
      let about = this.selectedMember.about
      let address = this.selectedMember.address ? this.selectedMember.address : ''
      let place = this.selectedMember.place ? this.selectedMember.place : ''
      if (address && place) {
        address = `${address}, ${place}`
      }
      else if (place) {
        address = place
      }
      this.selectedMember.expired = this.selectedMember.expired === null ? false : this.selectedMember.expired;
      this.selectedMember.about = about
      this.selectedMember.address = address
      this.selectedMember.memberName = nickName ? `${memberName} (${nickName})` : memberName;
      if(this.selectedMember.childrens){
        this.selectedMember.childrens = this.selectedMember.childrens.map(function(item:any) {
          return {key:item.name,link:item.nodeId};
        });
        this.selectedMember.childrens = this.selectedMember.childrens.sort((a:any, b:any) => a.link.localeCompare(b.link));

      }
      if (this.selectedMember.isOfficeBearer) {
        this.commonService.doGet(`.netlify/functions/officeBearers/${selectedMemberId}`).subscribe((memberInfo) => {
          let responseData = this.cryptoService.decryptAndParse(memberInfo.data)
          this.selectedMember.officeInfo = responseData;
          
          let items = []
          for (let info of responseData) {
            items.push({ key: info.postion, value: info.year })
          }
          this.selectedMember.officeInfo = items
        });
      }
      this.commonService.doGet(`.netlify/functions/relationshipUndeployed?memberId=${selectedMemberId}`).subscribe((relationShipInfo) => {
        let responseData = this.cryptoService.decryptAndParse(relationShipInfo.data)
        let items = []
        for (let info of responseData) {
          items.push({ key: info.spouse.name, link: info.spouse.nodeId})
        }
        this.selectedMember.spouses = items
      });
    });
  }
  getBestSearchList(){
    if (this.term == '') {
      if (this.memberList) {
        return this.memberList.slice(0, 10);
      } else {
        return []
      }
    } else {
      let tempData = []
      let index = 0;
      for (let item of this.memberList) {
        let nameAndCode =item.name + item.nodeId;
        if (nameAndCode.toLowerCase().indexOf(this.term.toLowerCase()) !== -1) {
          item.profilePic = `https://image.peralummoottilkudumbayogam.org/${item.nodeId}.png`
          tempData.push(item);
          index++;
        }
        if (index > 10) {
          return tempData;
        }
      }
      return tempData;
    }
  }


  searchMember(event: any): any {
    this.term = event.term;
  }

  loadData(){
    this.commonService.doGet(`.netlify/functions/memberUndeployed`).subscribe((memberInfo) => {
      this.memberList = this.cryptoService.decryptAndParse(memberInfo.data)
      
    });
  }
  expandMemById(event:any){
    window.scrollTo(0,0)
    this.selectMember(event)
  }
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });
  isAliveOnClick(){
    this.selectedMember.expired = !this.selectedMember.expired;
    console.log("on lick")
  }
  onClickAddSpouseButton(){
    this.spouseInfo = new SpouseInfo();
  }
  onClickAddChildButton(){
    this.childInfo = new ChildInfo();
    if(this.selectedMember.spouses && this.selectedMember.spouses.length>0){
      this.childInfo.parent = this.selectedMember.spouses[0].key
    }
    this.childInfo.parentList = this.selectedMember.spouses
    if(this.selectedMember.isSpouse){
      this.childInfo.secondaryParentMemberId = this.selectedMemberId
    }else{
      this.childInfo.primaryParentMemberId = this.selectedMemberId
    }

    
  }

  
  
  editSpouse(event:any){
    
    this.commonService.doGet(`.netlify/functions/users/${event}`).subscribe((memberInfo) => {
      let responseData = this.cryptoService.decryptAndParse(memberInfo.data)
      let spouseDetails = responseData.length > 0 ? responseData[0] : {}
      this.spouseInfo = new SpouseInfo();
      this.spouseInfo.name = spouseDetails.name
    });
  }

  editChild(event:any){
    
    this.commonService.doGet(`.netlify/functions/users/${event}`).subscribe((memberInfo) => {
      let responseData = this.cryptoService.decryptAndParse(memberInfo.data)
      let childDetails = responseData.length > 0 ? responseData[0] : {}
      this.childInfo = new ChildInfo();
      this.childInfo.name = childDetails.name
      this.childInfo.primaryParentMemberId = childDetails.parentNodeId
      this.childInfo.secondaryParentMemberId = childDetails.secondaryParentMemberId
      let parentId = this.selectedMember.isSpouse?childDetails.parentNodeId:childDetails.secondaryParentMemberId
      let filterParentlList = this.selectedMember.spouses.filter((spouse:any)=>spouse.link==parentId);
      if(filterParentlList.length >0){
        this.childInfo.parent = filterParentlList[0].key;
      }
      
      this.childInfo.parentList = this.selectedMember.spouses
    });
  }

}
