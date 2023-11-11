import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SpouseInfo } from './model/spouse-info';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'member-info',
  templateUrl: './member-info.component.html',
  styleUrls: ['./member-info.component.css']
})
export class MemberInfoComponent {

  @Input() memberInfo: any;

  spouseInfo : any ;

  hasEditAccess : boolean = false;


  childrens: any[] = [];

  parents: any[] = [];

  spouses :  any[] = [];


  @Input() officeInfo: any[] =[];

  @Output() close = new EventEmitter<boolean>();

  @Output() expandMemberById = new EventEmitter<string>();

  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
  
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  ngOnChanges(){
    this.init();
  }

  ngOnInit(){
    this.init();
  }

  init(){
    let bornOn = this.memberInfo.bornOn?this.memberInfo.bornOn:'';
    let diedOn = this.memberInfo.diedOn;

    let lifeTime = ''
    if(diedOn){
      lifeTime = `${this.formatDate(bornOn)} - ${this.formatDate(diedOn)} `
    }
    this.memberInfo.lifeTime= lifeTime
    if(this.memberInfo.childrens){
      this.childrens = this.memberInfo.childrens.map(function(item:any) {
        return {key:item.name,link:item.nodeId};
      });
    }
    
    let parentInfo = this.memberInfo.parents
    this.parents = []
    if(parentInfo){
      let primaryInfo = {key:parentInfo.primary.name,link:parentInfo.primary.nodeId}
      let secondaryInfo = {key:parentInfo.secondary.name,link:parentInfo.secondary.nodeId}
      this.parents.push(primaryInfo)
      this.parents.push(secondaryInfo)
    }

  }
  expandMemById(nodeId:string){
    this.expandMemberById.emit(nodeId)
  }

  formatDate(inputDate:string) {
    try{
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const dateParts = inputDate.split("-");
    const year = dateParts[0];
    const month = months[parseInt(dateParts[1], 10) - 1];
    const day = parseInt(dateParts[2], 10);
    let formattedDate=''
    formattedDate = day ? formattedDate+day+' ':'   '
    formattedDate = month? formattedDate+month+' ':'         '
    formattedDate = year? formattedDate+year:'     '
    return formattedDate;
    }catch(e){
      console.error(e)
    }
    return ''
    
}


  toggle() {
    this.close.emit(true);
  }

  onClickAddSpouseButton(){
    this.spouseInfo = new SpouseInfo();
  }
  
}
