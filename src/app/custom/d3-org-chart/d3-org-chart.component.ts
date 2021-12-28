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
  selectedMemberName: any;
  previousNodeId :any;
  chart:any;
  term:string='';
  isRemovedEventList : boolean = false;
  constructor() {}
  

  ngOnInit() {}

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
        if(item.nameAndCode.toLowerCase().indexOf(this.term.toLowerCase()) !== -1){
          tempData.push(item);
          index++;
        }
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
    this.chart
      .container(this.chartContainer.nativeElement)
      .data(this.data)
      .nodeWidth((d: any) => d.data.spouse?420:200)
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

        let width = d.width;
        let left = 0;
        if(d.data.spouse){
          left = width/4;
          width = width/2 -20;
          
        }
        let nodeHtml =  `
        <div style="font-family: 'Inter', sans-serif;background-color:${color};left:${left}px; position:absolute;margin-top:-1px; margin-left:-1px;width:${width}px;height:${d.height}px;border-radius:10px;border: 1px solid ${color}">
           <div style="background-color:white;position:absolute;margin-top:-25px;box-shadow: 0 0 9px 3px rgb(41 41 41 / 25%);margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
           <img src=" ${
             d.data.profilePic?d.data.profilePic:"assets/img/user.png"
           }" style="position:absolute;margin-top:-30px;margin-left:${10}px;border-radius:100px;width:60px;height:60px;" />
           
          

          <div style="font-size:15px;color:white;margin-left:20px;margin-top:32px"> ${
            d.data.name
          } </div>
          <div style="color:white;margin-left:20px;margin-top:3px;font-size:10px;"> ${
            d.data.nodeId
          } </div>


       </div>`;
       if(d.data.spouse){
        return nodeHtml+`
        <div style="font-family: 'Inter', sans-serif;background-color:${color};left:${left+left+left}px; position:absolute;margin-top:-1px; margin-left:-1px;width:${width}px;height:${d.height}px;border-radius:10px;border: 1px solid ${color}">
           <div style="background-color:white;position:absolute;margin-top:-25px;box-shadow: 0 0 9px 3px rgb(41 41 41 / 25%);margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
           <img src=" ${
            d.data.profilePic?d.data.profilePic:"assets/img/user.png"
          }" style="position:absolute;margin-top:-30px;margin-left:${10}px;border-radius:100px;width:60px;height:60px;" />
          
         

         <div style="font-size:15px;color:white;margin-left:20px;margin-top:32px"> ${
          d.data.spouse
         } </div>



       </div>`;
      }
       return nodeHtml;
      })
      .render();
  }

}
