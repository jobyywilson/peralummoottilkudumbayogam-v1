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
import { NgxGalleryImage } from 'ngx-gallery-9';
const PHOTO_START_URL='https://image.peralummoottilkudumbayogam.org/.netlify/images?url=/gallery/'
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
  galleryImages: NgxGalleryImage[] =[];
  selectedMemberToView: any;
  selectedMemberName: any;
  selectedMemberOfficeDetails: any = [];
  previousNodeId: any;
  isSideMenuOpened: boolean = false;
  chart: any;
  term: string = '';
  previousSearchedMemberId : string = ''
  isRemovedEventList: boolean = false;
  constructor(private imageService: ImageService, private commonService: CommonService, private cryptoService: CryptoService) {
    try {
      this.drawer.toggle();
    } catch (err) {

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

  searchMember(event: any): any {
    this.term = event.term;
  }

  removeTouchMoveEvent() {
    if (!this.isRemovedEventList) {
      let element = document.querySelector('.svg-chart-container');
      if (element) {
        element.addEventListener("touchmove", function (event) {
          console.log(event)
          event.stopPropagation();
        }, true);
        this.isRemovedEventList = true;
      }
    }
  }

  getData() {
    //this.removeTouchMoveEvent();
    if (this.term == '') {
      if (this.data) {
        return this.data.slice(0, 10);
      } else {
        return []
      }
    } else {
      let tempData = []
      let index = 0;
      for (let item of this.data) {
        if (item.nameAndCode.toLowerCase().indexOf(this.term.toLowerCase()) !== -1) {
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
        if (index > 10) {
          return tempData;
        }
      }
      return tempData;
    }

  }

  isSpouseNodeId(nodeId: any) {
    return /^(.*S\d*)$/.test(nodeId);
  }

  removeMatchingSpouseSuffix(nodeId: any) {
    var regex = /^(.*?)(S\d*)?$/;
    var match = regex.exec(nodeId);
    if (match && match[2]) {
        // If there is a matching suffix, remove it
        return match[1];
    } else {
        // If there is no matching suffix, return the original string
        return nodeId;
    }
}

  expandChart(nodeId: any) {
    if(this.isSpouseNodeId(nodeId)){
      nodeId = this.removeMatchingSpouseSuffix(nodeId)
    }
    if (nodeId && nodeId != this.previousNodeId) {

      this.chart.clearHighlighting();
      this.chart.collapseAll();

      this.chart.setUpToTheRootHighlighted(nodeId);
      this.chart.setCentered(nodeId);
      this.chart.setExpanded(nodeId).render();
      this.chart.collapse('1X');
      this.chart.expand('1X');

      this.previousNodeId = nodeId;
    }


  }
  ngOnChanges() {
    this.updateChart();
  }
  getSpouseCards(member: any): any[] {
    if (member.spouses?.length) {
      return member.spouses;
    }
    const names = member.spouseList?.length ? member.spouseList : (member.spouse ? [member.spouse] : []);
    return names.map((name: string) => ({
      name,
      // Only a single spouse can safely use the legacy ID and photo.
      nodeId: names.length === 1 ? `${member.nodeId}S` : undefined,
      profilePic: names.length === 1 ? member.spousePic : undefined
    }));
  }

  getNodeWidth(node: any): number {
    const count = this.getSpouseCards(node.data).length;
    return 120 * (1 + (count || (node.children || node._children ? 1 : 0)));
  }

  escapeCardText(value: string): string {
    return (value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char] || char));
  }

  updateChart() {
    if (!this.data || this.data['length']  == 0) {
      return;
    }
    if (!this.chart) {
      return;
    }
    let _this = this
    this.chart
      .container(this.chartContainer.nativeElement)

      .data(this.data)
      .nodeWidth((d: any) => this.getNodeWidth(d))
      .nodeHeight((d: any) => 180)
      .compact(false)
      .compactMarginBetween((d: any) => 65)
      .compactMarginPair((d: any) => 100)
      .siblingsMargin((node: any) => 100)
      .neightbourMargin((node1: any, node2: any) => {
        return 20;
      })
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

      .linkUpdate(function (d: any, index: any, arr: any) {

        d3.select(arr[index])

          .attr('stroke', (d: any) =>
            d.data._upToTheRootHighlighted ? '#14760D' : '#bab4a2'
          )
          .attr("stroke-width", (d: any) => '3px')

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
      .nodeUpdate((node: any, i: any, arr: any) => {
        // if (this.isSideMenuOpened && _this.selectedMemberName == node.data.nodeId) {
        //   _this.prepareMemberDataToView(node, false);
        //   _this.toogleSideNav()
        // }
        d3.select(arr[i]).select('#main-node').on('click', d => {
          _this.prepareMemberDataToView(d.currentTarget.__data__, false);
          _this.toogleSideNav()

        })
        d3.select(arr[i]).selectAll<HTMLElement, any>('.spouse-card').on('click', event => {
          const index = Number(event.currentTarget.getAttribute('data-spouse-index'));
          const spouse = _this.getSpouseCards(node.data)[index] || {
            nodeId: `${node.data.nodeId}S`, profilePic: node.data.spousePic
          };
          if (spouse?.nodeId) {
            _this.prepareMemberDataToView({ data: spouse }, false);
            _this.toogleSideNav();
          }
        });
      })
      .nodeContent(function (d: any) {
        const spouses = _this.getSpouseCards(d.data);
        if (!spouses.length && (d.children || d._children)) {
          spouses.push({ name: 'Spouse', nodeId: `${d.data.nodeId}S`, profilePic: d.data.spousePic });
        }
        const people = [{ name: d.data.name, profilePic: d.data.profilePic }, ...spouses];
        const cards = people.map((person: any, index: number) => {
          const first = index === 0;
          const last = index === people.length - 1;
          return `<div ${first ? 'id="main-node"' : `class="spouse-card" data-spouse-index="${index - 1}"`}
            onmouseout="this.style.opacity=1;" onmouseover="this.style.opacity=0.5;"
            style="box-sizing:border-box;flex:0 0 120px;width:120px;height:${d.height}px;
              background:white;border-top:4px solid ${first ? 'blue' : '#ce4b75'};
              ${first ? 'border-radius:10px 0 0 10px;' : 'border-left:1px solid rgb(230 216 220);'}
              ${last ? 'border-top-right-radius:10px;border-bottom-right-radius:10px;' : ''}
              cursor:${first || person.nodeId ? 'pointer' : 'default'};">
            <div style="height:90px;display:flex;justify-content:center;align-items:center;">
              <img src="${_this.escapeCardText(_this.imageService.getUserPhotos(person.profilePic))}"
                style="border-radius:100px;width:80px;height:80px;background:#ededed;" />
            </div>
            <div style="padding:0 5px;overflow-wrap:anywhere;font-size:15px;color:black;text-align:center;font-weight:bold;">
              ${_this.escapeCardText(person.name)}
            </div>
          </div>`;
        }).join('');
        return `<div style="display:flex;width:${d.width}px;height:${d.height}px;box-shadow:0 0 6px rgb(0 0 0 / 20%);border-radius:10px;">${cards}</div>`;
      })
      .render();
    this.chart.expand('2X-1');
    this.chart.fit();
    this.chart.getChartState().svg.on("wheel.zoom", null);
    this.updateLink()
    if (this.selectedUserId) {
      this.expandChart(this.selectedUserId);
    }


  }
  updateLink() {
    let elements = document.querySelectorAll(".links-wrapper > .link")
    if (elements) {
      elements.forEach(path => {
        let dRaw = path.getAttribute("d");
        if (dRaw) {
          let dFormated = dRaw.replace(/\s+/g, " ").trim();
          let dArray = dFormated.split(" ");
          let isPositive = Number(dArray[1]) >= 0;
          dArray[1] = this.formatPath(dArray[1], isPositive)

          dArray[4] = this.formatPath(dArray[4], isPositive)
          dArray[7] = this.formatPath(dArray[7], isPositive)
          dArray[10] = this.formatPath(dArray[10], isPositive)
          dArray[13] = this.formatPath(dArray[13], isPositive)
          dArray[15] = this.formatPath(dArray[15], isPositive)
          dArray[17] = this.formatPath(dArray[17], isPositive)
          let formatedD = dArray.join(" ")
          path.setAttribute("d", formatedD)
        }
      })
    }
  }

  formatPath(str: string, isPositive: boolean) {
    let formatedPath = isPositive ? Number(str) + 100 : Number(str) - 100;
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
    if (!this.isSideMenuOpened) {
      this.drawer.toggle();
      this.isSideMenuOpened = true;
    }

  }

  closeSideNav() {
    this.isSideMenuOpened = false;
    this.drawer.toggle();
  }

  prepareMemberDataToViewByID(memberId: any, isSpouse: boolean) {
    let selectedMember = {"data":{"nodeId":memberId}}
    this.prepareMemberDataToView(selectedMember,false)
  }

  prepareMemberDataToView(selectedMember: any, isSpouse: boolean) {

    let memberId = selectedMember.data.nodeId
    if (this.selectedMemberToView &&
      this.selectedMemberToView.nodeId == memberId &&
      this.selectedMemberToView.isSpouse == isSpouse) {
      return;
    }
    let memberProfilePic = selectedMember.data.profilePic;
    if (isSpouse) {
      memberProfilePic = selectedMember.data.spousePic;
      memberId = `${memberId}S`
    }
    this.commonService.doGet(`.netlify/functions/users/${memberId}`).subscribe((memberInfo) => {
      let responseData = this.cryptoService.decryptAndParse(memberInfo.data)
      this.selectedMemberToView = responseData.length > 0 ? responseData[0] : {}
      let memberName = this.selectedMemberToView.name
      let nickName = this.selectedMemberToView.nickname
      let about = this.selectedMemberToView.about
      let title = this.selectedMemberToView.title
      let address = this.selectedMemberToView.address ? this.selectedMemberToView.address : ''
      let place = this.selectedMemberToView.place ? this.selectedMemberToView.place : ''
      if (address && place) {
        address = `${address}, ${place}`
      }
      else if (place) {
        address = place
      }


      this.selectedMemberToView.profilePic = memberProfilePic
      this.selectedMemberToView.about = about
      this.selectedMemberToView.address = address
      this.selectedMemberToView.memberName = nickName ? `${memberName} (${nickName})` : memberName
      this.selectedMemberToView.memberName = title ? `${title}. ${this.selectedMemberToView.memberName}` : this.selectedMemberToView.memberName;
      this.commonService.doGet(`.netlify/functions/officeBearers?memberId=${memberId}`).subscribe((memberInfo) => {
        let responseData = this.cryptoService.decryptAndParse(memberInfo.data)
        this.selectedMemberOfficeDetails = responseData;
        let items = []
        for (let info of responseData) {
          items.push({ key: info.postion, value: info.year })
        }
        this.selectedMemberOfficeDetails = items
      });
      const memberForRelationships = this.selectedMemberToView;
      this.commonService.doGet(`.netlify/functions/relationship?memberId=${memberId}`).subscribe((relationShipInfo) => {
        let responseData = this.cryptoService.decryptAndParse(relationShipInfo.data)
        let items = []
        for (let info of responseData) {
          if (info.spouse) {
            items.push({ key: info.spouse.name, link: info.spouse.nodeId})
          }
        }
        memberForRelationships.spouses = items
      });
      this.commonService.doGet(`.netlify/functions/taggedPhotos?memberId=${memberId}`).subscribe((taggedPhotos) => {
        let responseData = this.cryptoService.decryptAndParse(taggedPhotos.data)
        let items = []
        let end_url ='&h=100&fit=cover'
        for (let info of responseData) {
          items.push({
            big:PHOTO_START_URL+info.photos.big_photo_end_url,
            medium:PHOTO_START_URL+info.photos.medium_photo_end_url,
            small:PHOTO_START_URL+info.photos.small_photo_end_url+end_url})
        }
        this.galleryImages = items
      });
    });
    this.selectedMemberToView = null
    this.selectedMemberOfficeDetails = []
  }

  onMemberSearch(nodeId:string){
    if(nodeId && this.previousSearchedMemberId != nodeId){
      this.expandMemById(nodeId)
      this.previousSearchedMemberId = nodeId
    }
  
  }
  expandMemById(nodeId:string){
    if(nodeId){
      this.expandChart(nodeId)
      this.prepareMemberDataToViewByID(nodeId,false)
    }
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
