import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://hzqpjqvopcevhucgazlh.supabase.co'
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cXBqcXZvcGNldmh1Y2dhemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODMyNzA2ODQsImV4cCI6MTk5ODg0NjY4NH0.sWqpgYXhcdsrjhLloL4lzD3GvQ9Ix4l4m1nXQnc471Q';
export interface IUser {
  email: string;
  name: string;
  website: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  private supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  }
  public authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void): any {
    return this.supabaseClient.auth.onAuthStateChange(callback);
  }

  public getSession() {
    return this.supabaseClient.auth.getSession();
  }

  signUp(email:string,password:string){
    return this.supabaseClient.auth.signUp({
      email: email,
      password: password,
    })
  }

  signIn(email:string,password:string){
    return this.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    })
  }
  
  signOut(){
    return this.supabaseClient.auth.signOut()


  }

}