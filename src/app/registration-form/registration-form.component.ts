import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css'],
})
export class RegistrationFormComponent {
  registrationForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registrationForm = this.fb.group(
      {
        username: [
          '',
          [Validators.required, Validators.minLength(3)],
          [this.usernameAsyncValidator.bind(this)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: [''],
        preferredContactMethod: ['', [Validators.required]],
      },
      { validators: [this.passwordMatchValidator, this.contactMethodValidator] }
    );
  }

  get f() {
    return this.registrationForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  contactMethodValidator(control: AbstractControl): ValidationErrors | null {
    const preferredContactMethod = control.get('preferredContactMethod')?.value;
    const email = control.get('email')?.value;
    const phoneNumber = control.get('phoneNumber')?.value;

    if (preferredContactMethod === 'Email' && !email) {
      return { contactMethod: 'Email is required' };
    }
    if (preferredContactMethod === 'Phone' && !phoneNumber) {
      return { contactMethod: 'Phone Number is required' };
    }
    return null;
  }

  usernameAsyncValidator(control: AbstractControl) {
    return this.http
      .get<any[]>(
        `https://jsonplaceholder.typicode.com/users?username=${control.value}`
      )
      .pipe(
        map((users) => (users.length > 0 ? { usernameTaken: true } : null)),
        catchError(() => of(null))
      );
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log('Form Submitted', this.registrationForm.value);
      this.registrationForm.reset();
    }
  }
}
