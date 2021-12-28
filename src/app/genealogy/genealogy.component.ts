import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-genealogy',
  templateUrl: './genealogy.component.html',
  styleUrls: ['./genealogy.component.css']
})
export class GenealogyComponent implements OnInit {
  data:any;
  constructor(private commonService : CommonService) {

   }

  ngOnInit(): void {
    // this.commonService.readFile("./assets/data/familyTree.json").subscribe(data=>{
    //   console.log(data)
    //   this.loadTree(data);
      
    // });

  }


}
