import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AuthService } from 'src/app/service/auth-service.service';
import { SupabaseService } from 'src/app/service/supabase.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {

  submitted = false;
  signinForm: FormGroup = this.fb.group({
    email : new FormControl('', [Validators.required, Validators.email]),
    password : new FormControl('', [Validators.required])
  })

  hide = true;
  matcher = new MyErrorStateMatcher();
  constructor(private fb: FormBuilder,private authService: AuthService) {

  }

  public isHideHeader(){
    return true;
  }
  signIn(){
    this.submitted = true;

    if (this.signinForm.invalid) {
      // Form is not valid, do not proceed with submission
      return;
    }else{
      this.authService.login("jobyywilson@gmail.com","testpassword").then(data =>{
        console.log(data)
      })
    }
  }

}
