import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() logInUserInfo: any;

  constructor(private authService : AuthService) { }

  ngOnInit() {
    


  }

  signOut(){
    this.authService.logout();
  }
  toggleDropdown(event:any){
    console.log(event)
    const dropDown = document.getElementById(`ul-dropdown-${event.target.id}`);
    if(dropDown){
      if(dropDown.classList.contains('dropdown-active')){
        dropDown.classList.remove('dropdown-active')
      }else{
        dropDown.classList.add('dropdown-active')
      }
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
