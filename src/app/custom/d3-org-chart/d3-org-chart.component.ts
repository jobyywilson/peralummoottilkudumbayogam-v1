import {
  OnChanges,
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { OrgChart } from 'd3-org-chart';
import * as d3 from 'd3';
import { MatDrawer } from '@angular/material/sidenav';
import { ImageService } from 'src/app/service/image.service';
import { CommonService } from 'src/app/service/common.service';
import { CryptoService } from 'src/app/service/crypto.service';

@Component({
  selector: 'app-d3-org-chart',
  templateUrl: './d3-org-chart.component.html',
  styleUrls: ['./d3-org-chart.component.css']
})
export class D3OrgChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('drawer', { static: false }) public drawer!: MatDrawer;

  @Input() data: any[] = [];
  @Input() selectedUserId: any;

  selectedMemberToView: any;
  selectedMemberName: any;
  selectedMemberOfficeDetails: any = [];
  previousNodeId :any;
  isSideMenuOpened: boolean = false;
  chart:any;
  term:string='';
  isRemovedEventList : boolean = false;
  constructor(private imageService: ImageService,private commonService: CommonService,private cryptoService:CryptoService) {
    try{
      this.drawer.toggle();
    }catch(err){

    }
   
  }
  

  ngOnInit() {


  }

  ngAfterViewInit() {
    
    if (!this.chart) {
      this.chart = new OrgChart();
    }
    this.updateChart();
    

  }

  searchMember(event : any):any{
    this.term = event.term;
  }

  removeTouchMoveEvent(){
    if(!this.isRemovedEventList){
      let element = document.querySelector('.svg-chart-container');
      if(element){
        element.addEventListener("touchmove",function(event){
          console.log(event)
          event.stopPropagation();
        },true);
        this.isRemovedEventList = true;
      }
    }
  }

  getData(){
    //this.removeTouchMoveEvent();
    if(this.term == ''){
      if(this.data){
        return this.data.slice(0,10);
      }else{
        return []
      }
    }else{
      let tempData = []
      let index = 0;
      for(let item of this.data){
        if(item.nameAndCode.toLowerCase().indexOf(this.term.toLowerCase()) !== -1 ){
          tempData.push(item);
          index++;
        }
        // if(item.spouse && item.spouse.toLowerCase().indexOf(this.term.toLowerCase()) !== -1){
        //   let spouceItem = JSON.parse(JSON.stringify(item));
        //   spouceItem.name = item.spouse
        //   spouceItem.nodeId = item.nodeId
        //   spouceItem.nameAndCode = item.nodeId +'-'+item.spouse
        //   spouceItem.spouse = null
        //   spouceItem.profilePic = spouceItem.spousePic
        //   spouceItem.spousePic = null
        //   tempData.push(spouceItem);
        //   index++;
        // }
        if(index>10){
          return tempData;
        }
      }
      return tempData;
    }
   
  }
  expandChart(nodeId : any){
    if(nodeId && nodeId != this.previousNodeId){
      
      this.chart.clearHighlighting();
      
      
      this.chart.setUpToTheRootHighlighted(nodeId);
      this.chart.setExpanded(nodeId).render();
      this.chart.collapse('1X');
      this.chart.expand('1X');
      this.chart.setCentered(nodeId);
      this.previousNodeId=nodeId;
    }
    
    
  }
  ngOnChanges() {
    this.updateChart();
  }
  updateChart() {
    if (!this.data) {
      return;
    }
    if (!this.chart) {
      return;
    }
    let _this= this
    this.chart
      .container(this.chartContainer.nativeElement)
      
      .data(this.data)
      .nodeWidth((d: any) => d.children||d._children||d.data.spouse?240:120)
      .nodeHeight((d :any) => 180)
      .compact(false)
      .compactMarginBetween((d:any) => 65)
      .compactMarginPair((d:any) => 100)
      .siblingsMargin((node:any) => 100)
      .neightbourMargin((node1:any, node2:any) =>{
        return 20;
      } )
      .initialZoom(0.7)
    //   .connections(
    //     [
    //         { id: 1, from: "2C", to: "2CS", label: "Directly Reports To" }
    //     ],
    // )
      // .connectionsUpdate(function (d:any, index:any, arr:any) {
      //   //arr[index].__transition = {}
      //   const keys = Object.keys(arr[index].__transition);
      //   const line = "M" + (d._source.x+90) + "," + (d._source.y+60.5) + "L" + (d._target.x-90) + "," + (d._target.y+60.5)
      //   for(let i=0;i<keys.length;i++){
      //     let value = arr[index].__transition[keys[i]].value
      //     if(value){
      //       value['attr.d']=line
      //     }
      //   }
      //   d3.select(arr[index])
      //     .style("z-index", "-1")
      //     .attr('stroke', (d) => 'black')
      //     //.attr('stroke-linecap', 'round')
      //     .attr('stroke-width', (d) => '3px')
      //     .attr('pointer-events', 'none')
      //     .attr("d", line)    

      // })
     
      .linkUpdate(function (d:any,index:any, arr:any) {
        
          d3.select(arr[index])
          
          .attr('stroke', (d:any) =>
                d.data._upToTheRootHighlighted ? '#14760D' : '#bab4a2'
              )
          .attr("stroke-width",(d:any) => '3px' )
        
      })
      
      // .nodeUpdate(function (d:any,i:any, arr:any) {
      //   for(var index=0;index<arr.length;index++){
      //     d3.select(arr[index])
      //     .select('.node-rect')
      //     .attr('stroke', (d:any) =>
      //            d.data._highlighted || d.data._upToTheRootHighlighted
      //               ? '#14760D': 'none'
      //           )
      //     .attr("stroke-width",'80px');
      //   }
      // })
      .nodeUpdate((node:any,i:any,arr:any) =>{
        if(this.isSideMenuOpened && _this.selectedMemberName == node.data.nodeId){
          _this.prepareMemberDataToView(node,false);
          _this.toogleSideNav()
        }
        d3.select(arr[i]).select('#main-node').on('click',d=>{
          _this.prepareMemberDataToView(d.currentTarget.__data__,false);
          _this.toogleSideNav()
          
        })
        d3.select(arr[i]).select('#spouse').on('click',d=>{
          _this.prepareMemberDataToView(d.currentTarget.__data__,true);
          _this.toogleSideNav()
          
        })
     })
      .nodeContent(function(d:any) {
        const color = 'white';

        let width = d.width/2;
        let start = 0
        if(!d.parent){
          start = 60
        }
        let hasSpouse = d.children||d._children||d.data.spouse;
        if(!hasSpouse){
  
          width = width*2;
          
        }
        // let bornOn;
        // if(d.data.bornOn){
        //   bornOn = `
        //   <div style="color:white;margin-left:20px;margin-top:3px;font-size:10px;">${
        //     d.data.bornOn
        //   } - ${
        //     d.data.diedOn?d.data.diedOn:''
        //   } </div>
        //   `
        // }
        //onmouseover="this.style.opacity= 0.7;"
        //onmouseout="this.style.backgroundColor='white'; this.style.color='white';"
        let mainNodeHtml =  `
        <div id="main-node" class="col" onmouseout="this.style.opacity= 1;" onmouseover="this.style.opacity= 0.5;" style="display: flex;justify-content: center;width:${width+14}px;background-color:${color};border-top: 4px solid blue;${hasSpouse?'border-top-left-radius: 10px;border-bottom-left-radius: 10px;':'border-radius:10px'}">
        <div class="row" style=" display: flex;justify-content: center;height:${d.height}px;">
           <div style="height: 90px;display: flex;justify-content: center;align-items: center;">

           <div style="background-color:white;display: flex;justify-content: center;border-radius:100px;" >
           <img src=" ${ _this.imageService.getUserPhotos(d.data.profilePic)
          }" style="border-radius:100px;width:80px;height:80px;background-color:#ededed;" />
           </div>
           </div>
          <div style="width:${width+12}px;word-wrap: break-word;font-size:15px;color:black;text-align: center;font-weight: bold;">  <h7>${
            d.data.name
          }  </h7></div>
          <div style="color:black;margin-left:20px;margin-top:3px;font-size:10px;"> </div>
       </div></div>`;
       let spouseHtml = ''
        if(hasSpouse){

          spouseHtml= `<div id="spouse" class="col" onmouseout="this.style.opacity= 1;" onmouseover="this.style.opacity= 0.5;" style="    border-left: 1px solid rgb(230 216 220);width:${width+10}px;display: flex;justify-content: center;background-color:${color};border-top-right-radius: 10px;border-bottom-right-radius: 10px;border-top: 4px solid #ce4b75;">
        <div class="row" style="display: flex;justify-content: center;height:${d.height}px;">
           <div style="height: 90px;display: flex;justify-content: center;align-items: center;">

           <div style="background-color:white;display: flex;justify-content: center;border-radius:100px;" >
           <img src=" ${ _this.imageService.getUserPhotos(d.data.spousePic)
           }" style="border-radius:100px;width:80px;height:80px;background-color:#ededed;" />
           </div>
           </div>
          <div style="width:${width+10}px; word-wrap: break-word;font-size:15px;color:black;text-align: center;font-weight: bold;"> <h7> ${
           d.data.spouse?d.data.spouse:`Spouse`
          } </h7></div>
          <div style="color:black;margin-left:20px;margin-top:3px;font-size:10px;"> </div>`;
      }
       return `<div class="row" style="display: flex;justify-content: center;box-shadow: 0 0px 6px 0 rgb(0 0 0 / 20%);border-radius:13px;">
       ${mainNodeHtml}
       ${spouseHtml}

       </div>`;
      })
      .render();
  this.chart.fit();
  this.chart.getChartState().svg.on("wheel.zoom", null);
  this.updateLink()
    if(this.selectedUserId){
      this.expandChart(this.selectedUserId);
    }
    
  }
  updateLink(){
    let elements = document.querySelectorAll(".links-wrapper > .link")
    if(elements){
      elements.forEach(path=>{
        let dRaw = path.getAttribute("d");
        if(dRaw){
          let dFormated = dRaw.replace(/\s+/g, " ").trim();
          let dArray = dFormated.split(" ");
          let isPositive = Number(dArray[1]) >= 0;
          dArray[1] = this.formatPath(dArray[1],isPositive) 

          dArray[4] = this.formatPath(dArray[4],isPositive)
          dArray[7]= this.formatPath(dArray[7],isPositive) 
          dArray[10]= this.formatPath(dArray[10],isPositive)
          dArray[13]= this.formatPath(dArray[13],isPositive) 
          dArray[15]= this.formatPath(dArray[15],isPositive) 
          dArray[17]= this.formatPath(dArray[17],isPositive) 
          let formatedD = dArray.join(" ")
          path.setAttribute("d",formatedD)
        }
      })
    }
  }

  formatPath(str:string,isPositive:boolean){
     let formatedPath =  isPositive?Number(str)+100:Number(str)-100;
     return formatedPath.toString()
  }

  movePathStartLeft(pathString: string, distance: number): string {
    // Split the path string into individual commands
    const commands = pathString.split(/(?=[A-Za-z])/);
  
    // Extract the starting x and y coordinates from the first "M" command
    const firstMove = commands[0].match(/M\s*(-?\d+)\s*(-?\d+)/);
    if (!firstMove) return pathString; // Return original string if no "M" command found
    const startX = Number(firstMove[1]) - distance;
    const startY = Number(firstMove[2]);
  
    // Replace the starting coordinates in the first "M" command
    commands[0] = `M ${startX} ${startY}`;
  
    // Return the modified path string
    return commands.join('');
  }
  

   toogleSideNav() {
    if(!this.isSideMenuOpened){
      this.drawer.toggle();
      this.isSideMenuOpened = true;
    }
    
    }

    closeSideNav(){
      this.isSideMenuOpened = false;
      this.drawer.toggle();
    }

  prepareMemberDataToView(selectedMember : any , isSpouse :boolean){

    let memberId = selectedMember.data.nodeId
    if(this.selectedMemberToView && 
      this.selectedMemberToView.nodeId == memberId &&
      this.selectedMemberToView.isSpouse == isSpouse){
      return;
    }
    let memberProfilePic = selectedMember.data.profilePic;
    if(isSpouse){
      memberProfilePic = selectedMember.data.spousePic;
      memberId = `${memberId}S`
    }
    this.commonService.doGet(`.netlify/functions/users/${memberId}`).subscribe((memberInfo)=>{
      let responseData = this.cryptoService.decryptAndParse( memberInfo.data)
      this.selectedMemberToView = responseData.length >0 ? responseData[0]:{}
      let memberName = this.selectedMemberToView.name
      let nickName = this.selectedMemberToView.nickname
      let about = this.selectedMemberToView.about 
      let address = this.selectedMemberToView.address ?this.selectedMemberToView.address:''
      let place = this.selectedMemberToView.place ?this.selectedMemberToView.place :''
      if(address && place){
        address = `${address}, ${place}`
      }
      else if(place){
        address = place
      }
      
      
      this.selectedMemberToView.profilePic=  memberProfilePic
      this.selectedMemberToView.about  = about
      this.selectedMemberToView.address  = address
      this.selectedMemberToView.memberName = nickName ?`${memberName} (${nickName})` : memberName
      if(this.selectedMemberToView.isOfficeBearer){
        this.commonService.doGet(`.netlify/functions/officeBearers/${memberId}`).subscribe((memberInfo)=>{
          let responseData = this.cryptoService.decryptAndParse( memberInfo.data)
          this.selectedMemberOfficeDetails = responseData;
          let items = []
          for(let info of responseData){
            items.push({key:info.postion,value:info.year})
          }
          this.selectedMemberOfficeDetails = items
        });
      }
    });
    this.selectedMemberToView = null
    this.selectedMemberOfficeDetails = []
  }
}
//<path class="link" d="M 100 360 L 100 360 L 100 360 L 100 360 C 100 330 100 330 -130 330 L -190 330 C -220 330 -220 330 -220 300 L -220 300" fill="none" stroke="black" stroke-width="3px"></path>
// <path class="link" d="
//                   M -540 360
//                   L -540 360
//                   L -540 360
//                   L -540 360
//                   C  -540 330 -540 330 -510 330
//                   L -250 330
//                   C  -220  330 -220  330 -220 300
//                   L -220 300
//        " fill="none" stroke="black" stroke-width="3px"></path>