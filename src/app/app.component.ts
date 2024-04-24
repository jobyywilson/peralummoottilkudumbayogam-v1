import { Component, OnInit } from '@angular/core';
import { CommonService } from './service/common.service';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SupabaseService } from './service/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  title = 'peralumoodu';
  session: any;
  logInUserInfo : any;
  isHideHeaderAndFooter : boolean = false;

  constructor(private commonService :CommonService,private supabaseService: SupabaseService,private router: Router) {
    this.supabaseService.getSession().then(session=>{
   
      this.session = session;
      
    });

  }
  public onRouterOutletActivate(event : any) {
    this.isHideHeaderAndFooter = event == SignInComponent;
}

  
  public ngOnInit(): void {
    this.supabaseService.authChanges((_, session) => {
     
      this.session = session;
      if(session && session.user){
        this.logInUserInfo = session.user;
        this.router.navigate(['/home']);
      }else{
        this.logInUserInfo = null;
      }
      
    }
    
  )}
}
