import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private supabaseService: SupabaseService) { }


  login(email:string,password:string) {
    return this.supabaseService.signIn(email,password);
  }

  logout() {
    return this.supabaseService.signOut();
  }

  async isLoggedIn(): Promise<boolean> {
    let session : any = await this.supabaseService.getSession();
    return session && session.data.session && session.data.session && session.data.session.user && session.data.session.user.aud == 'authenticated'    ;
  }
}
