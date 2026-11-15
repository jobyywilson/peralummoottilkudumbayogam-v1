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
  private hasRendered = false;
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

  readonly cardWidth = 160;
  readonly cardGap = 40;
  readonly familyColors = ['#2879b9', '#8b5ab5', '#168d86', '#b27822'];

  getNodeWidth(node: any): number {
    const count = 1 + (this.getSpouseCards(node.data).length || (node.children || node._children ? 1 : 0));
    return count * this.cardWidth + (count - 1) * this.cardGap;
  }

  private indexedData: any[] | undefined;
  private membersById = new Map<string, any>();

  getParentPair(member: any): any {
    if (this.indexedData !== this.data) {
      this.membersById = new Map(this.data.map(item => [item.nodeId, item]));
      this.indexedData = this.data;
    }
    const parent = this.membersById.get(member.parentNodeId);
    if (!parent || this.getSpouseCards(parent).length < 2) return null;
    const spouses = this.getSpouseCards(parent);
    const index = spouses.findIndex(spouse => spouse.nodeId && spouse.nodeId === member.secondaryParentMemberId);
    return {
      index,
      color: index < 0 ? '#727780' : this.familyColors[index % this.familyColors.length],
      label: index < 0 ? `${parent.name} · Other parent not recorded` : `${parent.name} & ${spouses[index].name}`
    };
  }

  getNodeHeight(member: any): number {
    return 200;
  }

  getCardCenter(node: any, index: number): number {
    const columns = node.familyColumns || Array.from({ length: Math.round((node.width + this.cardGap) / (this.cardWidth + this.cardGap)) }, () => this.cardWidth);
    return columns.slice(0, index).reduce((sum: number, width: number) => sum + width + this.cardGap, 0) + columns[index] / 2;
  }

  getFamilyAnchorX(node: any, index: number): number {
    const center = this.getCardCenter(node, index);
    return index > 0 ? center - this.cardWidth / 2 - this.cardGap / 2 : center;
  }

  private linkClearance = new Map<string, number>();

  getChildParentIndex(node: any): number {
    const pair = this.getParentPair(node.data);
    if (pair) return pair.index + 1;
    return this.getNodeWidth(node.parent) > this.cardWidth ? 1 : 0;
  }

  getParentLinkY(node: any): number {
    return node.parent.y + node.parent.height * (this.getChildParentIndex(node) > 0 ? 0.5 : 1);
  }

  getParentLinkX(node: any): number {
    const index = this.getChildParentIndex(node);
    const x = node.parent.x - node.parent.width / 2 + this.getFamilyAnchorX(node.parent, index);
    this.linkClearance.set(`${x},${this.getParentLinkY(node)}`, node.parent.y + node.parent.height + 24 + Math.min(index, 4) * 8);
    return x;
  }

  getFamilyLinkPath(child: any, parent: any): string {
    // Stay in the gap between partners until below the complete adult row.
    const clearance = this.linkClearance.get(`${parent.x},${parent.y}`) || parent.y + 24;
    const bendY = Math.min(child.y - 24, clearance);
    return `M ${parent.x} ${parent.y} V ${bendY} H ${child.x} V ${child.y}`;
  }

  getExpandCardIndex(node: any): number {
    const children = node.children || node._children || [];
    const groups = new Set<number>(children.map((child: any) => this.getChildParentIndex({ ...child, parent: node })));
    return groups.size === 1 ? Array.from(groups)[0] : 0;
  }

  getExpandButtonX(node: any): number {
    const index = this.getExpandCardIndex(node);
    return this.getFamilyAnchorX(node, index);
  }

  getExpandButtonY(node: any): number {
    return this.getExpandCardIndex(node) > 0 ? node.height / 2 : node.height;
  }

  layoutParentGroups(root: any): void {
    const gap = 60;
    this.linkClearance.clear();
    const measure = (node: any): void => {
      const children = node.children || [];
      children.forEach(measure);
      const count = Math.round((this.getNodeWidth(node) + this.cardGap) / (this.cardWidth + this.cardGap));
      const grouped = this.getSpouseCards(node.data).length > 1;
      node.familyColumns = Array.from({ length: count }, () => this.cardWidth);
      node.width = this.getNodeWidth(node);
      const groups: any[][] = Array.from({ length: grouped ? count : 1 }, () => []);
      for (const child of children) {
        const pair = this.getParentPair(child.data);
        groups[grouped && pair ? pair.index + 1 : 0].push(child);
      }
      const occupied = groups.map((group, index) => {
        const width = group.reduce((sum, child) => sum + child.familyWidth, 0) + Math.max(0, group.length - 1) * gap;
        const desired = grouped ? -node.width / 2 + this.getFamilyAnchorX(node, index) : -node.width / 2 + this.getFamilyAnchorX(node, count > 1 ? 1 : 0);
        return { children: group, width, desired, center: desired };
      }).filter(group => group.children.length);
      // Spread wide sibling groups without stretching the adult cards.
      occupied.forEach((group, index) => {
        if (index) {
          const previous = occupied[index - 1];
          group.center = Math.max(group.desired, previous.center + previous.width / 2 + gap + group.width / 2);
        }
      });
      const shift = occupied.length ? occupied.reduce((sum, group) => sum + group.center - group.desired, 0) / occupied.length : 0;
      occupied.forEach(group => group.center -= shift);
      node.familyGroups = occupied;
      node.familyLeft = Math.min(-node.width / 2, ...occupied.map(group => group.center - group.width / 2));
      node.familyRight = Math.max(node.width / 2, ...occupied.map(group => group.center + group.width / 2));
      node.familyWidth = node.familyRight - node.familyLeft;
    };
    const place = (node: any, center: number): void => {
      node.x = center;
      node.familyGroups.forEach((group: any) => {
        let left = center + group.center - group.width / 2;
        group.children.forEach((child: any) => {
          place(child, left - child.familyLeft);
          left += child.familyWidth + gap;
        });
      });
    };
    measure(root);
    place(root, 0);
  }

  getChartData(): any[] {
    // Stable sibling grouping follows the displayed spouses, with unknown parentage last.
    return [...this.data].sort((a, b) => {
      if (a.parentNodeId !== b.parentNodeId) return String(a.parentNodeId || '').localeCompare(String(b.parentNodeId || ''));
      const rank = (member: any) => {
        const pair = this.getParentPair(member);
        return pair && pair.index >= 0 ? pair.index : Number.MAX_SAFE_INTEGER;
      };
      return rank(a) - rank(b);
    });
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
    const bindings = this.chart.getChartState().layoutBindings;
    if (bindings?.top) {
      bindings.top.swap = (node: any) => { if (!node.parent) this.layoutParentGroups(node); };
      bindings.top.linkParentX = (node: any) => this.getParentLinkX(node);
      bindings.top.linkParentY = (node: any) => this.getParentLinkY(node);
      bindings.top.diagonal = (child: any, parent: any) => this.getFamilyLinkPath(child, parent);
      // Incoming links attach to the member card.
      bindings.top.linkX = (node: any) => node.x - node.width / 2 + this.getCardCenter(node, 0);
      bindings.top.linkY = (node: any) => node.y;
    }
    this.chart
      .container(this.chartContainer.nativeElement)

      .data(this.getChartData())
      .nodeWidth((d: any) => this.getNodeWidth(d))
      .nodeHeight((d: any) => this.getNodeHeight(d.data))
      .childrenMargin(() => 90)
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
            _this.getParentPair(d.data)?.color || (d.data._upToTheRootHighlighted ? '#14760D' : '#bab4a2')
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
        d3.select(arr[i]).select('.node-button-g')
          .attr('transform', `translate(${this.getExpandButtonX(node)},${this.getExpandButtonY(node)})`);
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
        const cardHeight = d.height;
        const people = [{ name: d.data.name, profilePic: d.data.profilePic }, ...spouses];
        const cards = people.map((person: any, index: number) => {
          const first = index === 0;
          const color = first ? '#40556c' : _this.familyColors[(index - 1) % _this.familyColors.length];
          const columnWidth = d.familyColumns?.[index] || _this.cardWidth;
          return `<div style="width:${columnWidth}px;flex:0 0 ${columnWidth}px;display:flex;justify-content:center;"><div ${first ? 'id="main-node"' : `class="spouse-card" data-spouse-index="${index - 1}"`}
            style="box-sizing:border-box;flex:0 0 ${_this.cardWidth}px;width:${_this.cardWidth}px;height:${cardHeight}px;
              background:white;border:1px solid #dce1e5;border-top:3px solid ${color};border-radius:12px;
              box-shadow:0 2px 6px rgb(0 0 0 / 10%);cursor:${first || person.nodeId ? 'pointer' : 'default'};">
            <div style="height:88px;display:flex;justify-content:center;align-items:center;">
              <img alt="" src="${_this.escapeCardText(_this.imageService.getUserPhotos(person.profilePic))}"
                style="border-radius:100px;width:72px;height:72px;background:#ededed;" />
            </div>
            <div style="padding:0 8px;overflow-wrap:anywhere;font-size:14px;line-height:18px;color:#202b36;text-align:center;font-weight:600;">
              ${_this.escapeCardText(person.name)}
            </div>
          </div></div>`;
        }).join('');
        const partnerLine = spouses.length ? `<svg class="partner-connector" aria-label="Partners of ${_this.escapeCardText(d.data.name)}" width="${d.width}" height="${cardHeight}"
          style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;">
          <path d="M ${_this.getCardCenter(d, 0)} ${cardHeight / 2} H ${_this.getCardCenter(d, people.length - 1)}" fill="none" stroke="#b7c0c8" stroke-width="2" />
        </svg>` : '';
        return `<div style="position:relative;width:${d.width}px;height:${d.height}px;">${partnerLine}<div style="position:relative;display:flex;gap:${_this.cardGap}px;">${cards}</div></div>`;


      })
      .render();
    this.chart.expand('2X-1');
    if (!this.hasRendered) {
      this.chart.fit();
      this.hasRendered = true;
    }
    this.chart.getChartState().svg.on("wheel.zoom", null);
    this.updateLink()
    if (this.selectedUserId) {
      this.expandChart(this.selectedUserId);
    }


  }
  updateLink() {
    // Link endpoints are handled by the chart layout, including spouse-specific anchors.
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
