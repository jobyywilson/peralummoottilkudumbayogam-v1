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
@Component({
  selector: 'app-d3-org-chart',
  templateUrl: './d3-org-chart.component.html',
  styleUrls: ['./d3-org-chart.component.css']
})
export class D3OrgChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @Input() data: any[] = [];
  @Input() selectedUserId: any;
  selectedMemberName: any;
  previousNodeId :any;
  chart:any;
  term:string='';
  isRemovedEventList : boolean = false;
  constructor() {}
  

  ngOnInit() {
    // let _this = this;
  //   var checkIfExists = setInterval(function() {
  //     var exists = document.querySelector('.svg-chart-container');
  
  //     if (exists) {
  //         clearInterval(checkIfExists);
  //         _this.updateLink();
  //     }
  // }, 2000);
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
      //this.chart.clearHighlighting();
      this.chart.collapseAll(nodeId);
      this.chart.setCentered(nodeId);
      
      //this.chart.setUpToTheRootHighlighted(nodeId);
      this.chart.setExpanded(nodeId).render();
      
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
      .nodeWidth((d: any) => d.children||d._children||d.data.spouse?420:200)
      .nodeHeight((d :any) => 120)
      .compact(false)
      .compactMarginBetween((d:any) => 65)
      .compactMarginPair((d:any) => 100)
      .initialZoom(0.7)
      
      .linkUpdate(function (d:any,i:any, arr:any) {
        for(var index=0;index<arr.length;index++){
          d3.select(arr[index])
          .attr('stroke', (d:any) =>
                d.data._upToTheRootHighlighted ? '#14760D' : 'black'
              )
          .attr("stroke-width",(d:any) => '3px' );
          
          
        }
        
      })
      // .nodeUpdate(function (d:any,i:any, arr:any) {
      //   for(var index=0;index<arr.length;index++){
      //     d3.select(arr[index])
      //     .select('.node-rect')
      //     .attr('stroke', (d:any) =>
      //            d.data._highlighted || d.data._upToTheRootHighlighted
      //               ? '#14760D': 'none'
      //           )
      //     .attr("stroke-width",'8px');
      //   }
      // })
      .nodeContent(function(d:any) {
        const color = '#665ed0';

        let width = d.width/2;
        let start = 0
        if(!d.parent){
          start = 60
        }
        if(!(d.children||d._children||d.data.spouse)){
  
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
        let nodeHtml =  `
        <div style="font-family: 'Inter', sans-serif;background-color:${color};left:${11}px; position:absolute;width:${width -20}px;height:${d.height}px;border-radius:10px;border: 1px solid ${color}">
           <div style="background-color:white;position:absolute;margin-top:-25px;box-shadow: 0 0 9px 3px rgb(41 41 41 / 25%);margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
           <img src=" ${
             d.data.profilePic?d.data.profilePic:"assets/img/user.png"
           }" style="position:absolute;margin-top:-30px;margin-left:${10}px;border-radius:100px;width:60px;height:60px;" />
           
          

          <div style="font-size:15px;color:white;margin-left:20px;margin-top:32px"> ${
            d.data.name
          } </div>
          <div style="color:white;margin-left:20px;margin-top:3px;font-size:10px;"> (${
            d.data.nodeId
          })</div>
          
          


       </div>`;
        if(d.children||d._children||d.data.spouse){
         return nodeHtml+`<svg style="position:fixed" width="900"><line x1="200" y1="60" x2="220" y2="60" stroke="black" fill="none" stroke-width="3px"></line><line x1="210" y1="${start}" x2="210" y2="120" stroke="black" fill="none" stroke-width="3px"></line></svg>
       <div style="font-family: 'Inter', sans-serif;background-color:${color};left:${width+10}px; position:absolute;width:${width-20}px;height:${d.height}px;border-radius:10px;border: 1px solid ${color}">
       <div style="background-color:white;position:absolute;margin-top:-25px;box-shadow: 0 0 9px 3px rgb(41 41 41 / 25%);margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
       <img src=" ${
        d.data.spousePic
      }" style="position:absolute;margin-top:-30px;margin-left:${10}px;border-radius:100px;width:60px;height:60px;" />
     <div style="font-size:15px;color:white;margin-left:20px;margin-top:32px"> ${
      d.data.spouse?d.data.spouse:`Spouse`
     } </div>



   </div>`;
      }
       return nodeHtml;
      })
      .render();


  
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