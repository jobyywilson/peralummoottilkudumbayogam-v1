import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() logInUserInfo: any;
  menuOpen = false;
  dropdownOpen = false;

  constructor(private authService : AuthService) { }

  ngOnInit() {
    


  }

  signOut(){
    this.authService.logout();
  }
  toggleDropdown(event:any){
    event.preventDefault();
    this.dropdownOpen = !this.dropdownOpen;
  }
  
  toggleNavBar(){
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.dropdownOpen = false;
    }
  }

  closeMenus(){
    this.menuOpen = false;
    this.dropdownOpen = false;
  }
}
