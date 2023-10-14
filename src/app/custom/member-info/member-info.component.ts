import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'member-info',
  templateUrl: './member-info.component.html',
  styleUrls: ['./member-info.component.css']
})
export class MemberInfoComponent {

  @Input() memberInfo: any;

  @Input() officeInfo: any[] =[];

  @Output() close = new EventEmitter<boolean>();

  ngOnInit(){
    let bornOn = this.memberInfo.bornOn?this.memberInfo.bornOn:'';
    let diedOn = this.memberInfo.diedOn;

    let lifeTime = ''
    if(diedOn){
      lifeTime = `${this.formatDate(bornOn)} - ${this.formatDate(diedOn)} `
    }
    this.memberInfo.lifeTime= lifeTime

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
  
}
