import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    




  }
  toggleDropdown(){
    const dropDown = document.getElementsByClassName('ul-dropdown')[0];
    if(dropDown.classList.contains('dropdown-active')){
      dropDown.classList.remove('dropdown-active')
    }else{
      dropDown.classList.add('dropdown-active')
    }
    
    
  }
  
  toggleNavBar(){
    
    let navbarElement: HTMLElement = document.getElementsByClassName( 'navbar' )[ 0 ] as HTMLElement;
    if(navbarElement.classList.contains('navbar-mobile')){
      navbarElement.classList.remove('navbar-mobile');
    }else{
      navbarElement.classList.add('navbar-mobile');
    }
    let navBarMobile = document.getElementsByClassName( 'mobile-nav-toggle' )[ 0 ] as HTMLElement;
    navBarMobile.classList.toggle('bi-list')
    navBarMobile.classList.toggle('bi-x')
  }
}
