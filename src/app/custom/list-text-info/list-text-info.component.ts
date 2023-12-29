import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'list-text-info',
  templateUrl: './list-text-info.component.html',
  styleUrls: ['./list-text-info.component.css']
})
export class ListTextInfoComponent {

  @Input() listInfo: any[]=[];
  @Input() editMode: boolean = false;
  @Input() disableLink: boolean = false;
  @Output() expandMemberById = new EventEmitter<string>();
  @Output() editMemberById = new EventEmitter<string>();

  fullList : any[] = []
  limit : number = 6;
  showMore : boolean = false;


  ngOnChanges(){
    if(this.listInfo && this.listInfo.length > 0){
      this.fullList = this.listInfo
      this.toggle()
    }
    
  }
  openLink(nodeId:string){
    this.expandMemberById.emit(nodeId)
  }

  openEditLink(nodeId:string){
    this.editMemberById.emit(nodeId)
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
