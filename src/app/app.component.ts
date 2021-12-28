import { Component, OnInit } from '@angular/core';
import { CommonService } from './service/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  title = 'peralumoodu';

  constructor(private commonService :CommonService) {

  }
  ngOnInit(): void {
    this.commonService.getEventList();
  }
}
