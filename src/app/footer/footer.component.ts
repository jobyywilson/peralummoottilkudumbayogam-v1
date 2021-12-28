import { Component, OnInit } from '@angular/core';
import {HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  showScrollUp :boolean = false;
  @HostListener('window:scroll', ['$event']) 
  getScrollHeight(event : any) {
   
    if(window.pageYOffset >  100 )
     this.showScrollUp = true;
    else
      this.showScrollUp = false;
  }

  constructor() { }

  ngOnInit(): void {
  }
  scroll(){
   let pos = window.pageYOffset;
   let header = document.querySelector<HTMLElement>('#header')
   if(header){
    let offset = header.offsetHeight
    window.scrollTo({
     top: pos - offset,
     behavior: 'smooth'
   });
   }
    
  }

}
