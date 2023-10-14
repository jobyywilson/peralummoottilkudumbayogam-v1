import { Component, Input } from '@angular/core';

@Component({
  selector: 'list-text-info',
  templateUrl: './list-text-info.component.html',
  styleUrls: ['./list-text-info.component.css']
})
export class ListTextInfoComponent {

  @Input() listInfo: any[]=[];
  fullList : any[] = []
  limit : number = 6;
  showMore : boolean = false;


  ngOnChanges(){
    this.toggle()
    
  }

  toggle() {
    this.showMore = !this.showMore
    if(this.showMore){
      this.listInfo = this.fullList;
    }else{
      this.fullList = this.listInfo;
      this.listInfo = this.listInfo.slice(0,this.limit)
    }
    


  }
}
