import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { CartService } from 'src/app/service/cart.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
  loginForm!: FormGroup;

  registerForm!: FormGroup;
  constructor(private authService: AuthService,
    private cartService: CartService, private toastr: ToastrService, private fb: FormBuilder) { }
  ngOnInit(): void {
    this.loginForm = this.fb.group({

      phone: [
        '',
        [
          Validators.required
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ]

    });
    this.registerForm = this.fb.group({

      name: ['', Validators.required],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: ['', Validators.required],

      password: ['', Validators.required],

      confirmPassword: ['', Validators.required],

      acceptTerms: [false, Validators.requiredTrue]

    });
  }
  @Input() isAuthOpen = false;

  @Output() close = new EventEmitter<boolean>();

  activeAuthTab: 'login' | 'register' = 'login';

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

      this.toastr.warning(
        'Please enter phone number and password'
      );

      return;

    }

    this.authService
      .login(this.loginForm.value)
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

      this.toastr.warning(
        'Please fill all required fields'
      );

      return;

    }

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
}
