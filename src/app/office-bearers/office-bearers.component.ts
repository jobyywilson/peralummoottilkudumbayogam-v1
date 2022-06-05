import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-office-bearers',
  templateUrl: './office-bearers.component.html',
  styleUrls: ['./office-bearers.component.css']
})
export class OfficeBearersComponent implements OnInit {




  officeMembers : any = [];
  auditors : any = [];
  sextons : any = [];
  kaisthanasamithy: any = [];
  constructor(private commonService : CommonService) { }

  ngOnInit(): void {

    this.commonService.doGet("assets/content/officeBearers/Office Bearers.json").subscribe((data:any) =>{
      this.officeMembers = this.commonService.mapOfficers(data);
    });
    this.commonService.doGet("assets/content/sexton/Sexton.json").subscribe((data:any) =>{
      this.sextons = this.commonService.mapOfficers(data);
    });
    this.commonService.doGet("assets/content/auditors/Auditors.json").subscribe((data:any) =>{
      this.auditors = this.commonService.mapOfficers(data);
    });

    this.commonService.doGet("assets/content/kaisthanasamithy/Kaisthanasamithy.json").subscribe((data:any) =>{
      this.kaisthanasamithy = this.commonService.mapOfficers(data);
    });

    
  }

}
