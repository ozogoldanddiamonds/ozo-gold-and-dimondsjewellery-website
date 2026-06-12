import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { CartService } from 'src/app/service/cart.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
  loginForm!: FormGroup;
  isLoginLoading = false;
  isRegisterLoading = false;
  registerForm!: FormGroup;
  constructor(private authService: AuthService,
    private cartService: CartService, private toastr: ToastrService, private fb: FormBuilder) { }
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required]]
    });
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }
  @Input() isAuthOpen = false;

  @Output() close = new EventEmitter<boolean>();

  activeAuthTab: 'login' | 'register' = 'login';
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  showLoginPassword = false;
  showRegisterPassword = false;

  openTab(tab: 'login' | 'register') {
    this.activeAuthTab = tab;
  }

  closeModal() {
    this.close.emit(false);
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    if (this.loginForm.invalid) {

      this.toastr.warning(
        'Please enter phone number and password'
      );

      return;

    }
    if (this.isLoginLoading) return;

    this.isLoginLoading = true;
    this.authService
      .login(this.loginForm.value).pipe(
        finalize(() => {
          this.isLoginLoading = false;
        })
      )
      .subscribe({

        next: (res: any) => {

          if (res.success) {
            console.log(
              'LOGIN RESPONSE =>',
              res
            );
            localStorage.setItem(
              'token',
              res.token
            );

            localStorage.setItem(
              'userId',
              res.user._id
            );

            this.toastr.success(
              res.message
            );
            this.authService.updateLoginStatus(true);

            this.cartService.loadCartCount();
            this.close.emit(true);

          }

        },

        error: (err) => {

          this.toastr.error(
            err?.error?.message ||
            'Login failed'
          );

        }

      });

  }
  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.registerForm.invalid) {

      this.toastr.warning(
        'Please fill all required fields'
      );

      return;

    }
    if (this.isRegisterLoading) return;

    this.isRegisterLoading = true;
    const formValue =
      this.registerForm.value;

    if (
      formValue.password !==
      formValue.confirmPassword
    ) {

      this.toastr.error(
        'Passwords do not match'
      );

      return;

    }

    const payload = {

      name: formValue.name,

      email: formValue.email,

      phone: formValue.phone,

      password: formValue.password

    };

    this.authService
      .register(payload)
      .pipe(
        finalize(() => {
          this.isLoginLoading = false;
        })
      )
      .subscribe({

        next: (res: any) => {

          if (res.success) {

            this.toastr.success(
              res.message
            );

            this.registerForm.reset();

            this.activeAuthTab = 'login';

          }

        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            'Registration failed'

          );

        }

      });

  }

  allowOnlyNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    const controlName = input.getAttribute('formcontrolname');
    if (controlName === 'phone') {
      if (this.activeAuthTab === 'login') {
        this.loginForm.get('phone')?.setValue(input.value, { emitEvent: false });
      } else {
        this.registerForm.get('phone')?.setValue(input.value, { emitEvent: false });
      }
    }
  }
  onPhoneInput(event: Event, formType: 'login' | 'register') {
    const input = event.target as HTMLInputElement;
    const cleanedValue = input.value.replace(/[^0-9]/g, '');
    input.value = cleanedValue;

    if (formType === 'login') {
      this.loginForm.get('phone')?.setValue(cleanedValue, { emitEvent: false });
    } else {
      this.registerForm.get('phone')?.setValue(cleanedValue, { emitEvent: false });
    }
  }
}
