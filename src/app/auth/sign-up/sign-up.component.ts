import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SupabaseService } from 'src/app/service/supabase.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signupForm: FormGroup = this.fb.group({
    email : new FormControl('', [Validators.required, Validators.email])
  })

  submitted = false;

  matcher = new MyErrorStateMatcher();

  constructor(private fb: FormBuilder,private supabaseService: SupabaseService) {

  }
  public isHideHeader(){
    return true;
  }

  onJoin(){
    this.submitted = true;

    if (this.signupForm.invalid) {
      // Form is not valid, do not proceed with submission
      return;
    }else{
      this.supabaseService.signUp("jobyywilson@gmail.com","testpassword").then(data =>{
        console.log(data)
      })
    }

  }

}
