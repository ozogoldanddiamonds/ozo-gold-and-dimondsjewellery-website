import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { CartService } from 'src/app/service/cart.service';
import { environment } from 'src/environment/environment';
declare const google: any;
@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit, AfterViewInit, OnChanges {



  // =====================================================
  // FORMS
  // =====================================================

  loginForm!: FormGroup;

  registerForm!: FormGroup;


  // =====================================================
  // LOADING
  // =====================================================

  isLoginLoading = false;

  isRegisterLoading = false;


  // =====================================================
  // INPUT / OUTPUT
  // =====================================================

  @Input() isAuthOpen = false;

  @Output() close =
    new EventEmitter<boolean>();


  // =====================================================
  // AUTH TAB
  // =====================================================

  activeAuthTab:
    'login' | 'register' = 'login';


  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  showLoginPassword = false;

  showRegisterPassword = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) { }


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {


    // ===================================================
    // LOGIN FORM
    // ===================================================

    this.loginForm =
      this.fb.group({

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[0-9]{10}$/
            )
          ]
        ],

        password: [
          '',
          [
            Validators.required
          ]
        ]

      });


    // ===================================================
    // REGISTER FORM
    // ===================================================

    this.registerForm =
      this.fb.group({

        name: [
          '',
          Validators.required
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[0-9]{10}$/
            )
          ]
        ],

        password: [
          '',
          Validators.required
        ],

        confirmPassword: [
          '',
          Validators.required
        ],

        acceptTerms: [
          false,
          Validators.requiredTrue
        ]

      },
        {
          validators:
            this.passwordMatchValidator
        });

  }


  // =====================================================
  // AFTER VIEW INIT
  // =====================================================

  ngAfterViewInit(): void {

    if (this.isAuthOpen) {

      setTimeout(() => {

        this.initializeGoogleLogin();

      }, 100);

    }

  }


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['isAuthOpen'] &&
      changes['isAuthOpen'].currentValue === true
    ) {

      setTimeout(() => {

        if (
          this.activeAuthTab === 'login'
        ) {

          this.initializeGoogleLogin();

        }

      }, 100);

    }

  }


  // =====================================================
  // PASSWORD MATCH VALIDATOR
  // =====================================================

  passwordMatchValidator(
    form: AbstractControl
  ): ValidationErrors | null {

    const password =
      form.get('password')?.value;

    const confirmPassword =
      form.get('confirmPassword')?.value;


    if (
      password !== confirmPassword
    ) {

      return {
        passwordMismatch: true
      };

    }


    return null;

  }


  // =====================================================
  // OPEN TAB
  // =====================================================

  openTab(
    tab: 'login' | 'register'
  ): void {

    this.activeAuthTab = tab;


    // Google button only on login tab

    if (
      tab === 'login' &&
      this.isAuthOpen
    ) {

      setTimeout(() => {

        this.initializeGoogleLogin();

      }, 100);

    }

  }


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  closeModal(): void {

    this.close.emit(false);

  }


  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  login(): void {


    // Form validation

    if (
      this.loginForm.invalid
    ) {

      this.loginForm.markAllAsTouched();

      return;

    }


    // Extra validation

    if (
      this.loginForm.invalid
    ) {

      this.toastr.warning(
        'Please enter phone number and password'
      );

      return;

    }


    // Prevent multiple requests

    if (
      this.isLoginLoading
    ) {

      return;

    }


    this.isLoginLoading = true;


    this.authService
      .login(
        this.loginForm.value
      )
      .pipe(

        finalize(() => {

          this.isLoginLoading = false;

        })

      )
      .subscribe({

        // ==========================================
        // SUCCESS
        // ==========================================

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


            this.authService
              .updateLoginStatus(true);


            this.cartService
              .loadCartCount();


            this.close.emit(true);

          }

        },


        // ==========================================
        // ERROR
        // ==========================================

        error: (err: any) => {

          this.toastr.error(
            err?.error?.message ||
            'Login failed'
          );

        }

      });

  }


  // =====================================================
  // REGISTER
  // =====================================================

  register(): void {


    // Form validation

    if (
      this.registerForm.invalid
    ) {

      this.registerForm.markAllAsTouched();

      return;

    }


    // Extra validation

    if (
      this.registerForm.invalid
    ) {

      this.toastr.warning(
        'Please fill all required fields'
      );

      return;

    }


    // Prevent multiple requests

    if (
      this.isRegisterLoading
    ) {

      return;

    }


    this.isRegisterLoading = true;


    const formValue =
      this.registerForm.value;


    // Password match

    if (
      formValue.password !==
      formValue.confirmPassword
    ) {

      this.toastr.error(
        'Passwords do not match'
      );

      this.isRegisterLoading = false;

      return;

    }


    // Payload

    const payload = {

      name:
        formValue.name,

      email:
        formValue.email,

      phone:
        formValue.phone,

      password:
        formValue.password

    };


    this.authService
      .register(payload)
      .pipe(

        finalize(() => {

          this.isRegisterLoading = false;

        })

      )
      .subscribe({

        // ==========================================
        // SUCCESS
        // ==========================================

        next: (res: any) => {


          if (res.success) {


            this.toastr.success(
              res.message
            );


            this.registerForm.reset();


            this.activeAuthTab =
              'login';


            // Render Google button
            setTimeout(() => {

              this.initializeGoogleLogin();

            }, 100);

          }

        },


        // ==========================================
        // ERROR
        // ==========================================

        error: (err: any) => {

          this.toastr.error(

            err?.error?.message ||

            'Registration failed'

          );

        }

      });

  }


  // =====================================================
  // ALLOW ONLY NUMBERS
  // =====================================================

  allowOnlyNumbers(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    input.value =
      input.value.replace(
        /[^0-9]/g,
        ''
      );


    const controlName =
      input.getAttribute(
        'formcontrolname'
      );


    if (
      controlName === 'phone'
    ) {


      if (
        this.activeAuthTab ===
        'login'
      ) {

        this.loginForm
          .get('phone')
          ?.setValue(
            input.value,
            {
              emitEvent: false
            }
          );

      }


      else {

        this.registerForm
          .get('phone')
          ?.setValue(
            input.value,
            {
              emitEvent: false
            }
          );

      }

    }

  }


  // =====================================================
  // PHONE INPUT
  // =====================================================

  onPhoneInput(
    event: Event,
    formType:
      'login' | 'register'
  ): void {

    const input =
      event.target as HTMLInputElement;


    const cleanedValue =
      input.value.replace(
        /[^0-9]/g,
        ''
      );


    input.value =
      cleanedValue;


    if (
      formType === 'login'
    ) {

      this.loginForm
        .get('phone')
        ?.setValue(
          cleanedValue,
          {
            emitEvent: false
          }
        );

    }


    else {

      this.registerForm
        .get('phone')
        ?.setValue(
          cleanedValue,
          {
            emitEvent: false
          }
        );

    }

  }


  // =====================================================
  // GOOGLE LOGIN INITIALIZATION
  // =====================================================

  initializeGoogleLogin(): void {


    // Check Google script

    if (
      typeof google ===
      'undefined'
    ) {

      console.error(
        'Google Identity Services script not loaded'
      );

      return;

    }


    // Find Google button

    const googleButton =
      document.getElementById(
        'google-btn'
      );


    if (!googleButton) {

      console.log(
        'Google button element not found'
      );

      return;

    }


    // Clear previous button

    googleButton.innerHTML = '';


    // Initialize Google

    google.accounts.id.initialize({

      client_id: environment.googleClientId,


      callback:
        (response: any) => {


          console.log(
            'GOOGLE RESPONSE:',
            response
          );


          console.log(
            'GOOGLE CREDENTIAL:',
            response.credential
          );


          this.googleLogin(
            response.credential
          );

        }

    });


    // Render Google button

    google.accounts.id.renderButton(

      googleButton,

      {

        theme:
          'outline',

        size:
          'large',

        width:
          350,

        text:
          'continue_with'

      }

    );

  }


  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  googleLogin(
    credential: string
  ): void {


    // Credential validation

    if (!credential) {

      this.toastr.error(
        'Google login failed'
      );

      return;

    }


    // Prevent multiple login

    if (
      this.isLoginLoading
    ) {

      return;

    }


    this.isLoginLoading = true;


    this.authService.googleLogin({

      credential:
        credential

    })
      .pipe(

        finalize(() => {

          this.isLoginLoading =
            false;

        })

      )
      .subscribe({

        // ==========================================
        // SUCCESS
        // ==========================================

        next: (res: any) => {


          console.log(
            'GOOGLE LOGIN RESPONSE =>',
            res
          );


          if (
            res.success
          ) {


            // Token

            localStorage.setItem(
              'token',
              res.token
            );


            // User ID

            localStorage.setItem(
              'userId',
              res.user._id
            );


            // User name

            localStorage.setItem(
              'name',
              res.user.name || ''
            );


            // User email

            localStorage.setItem(
              'email',
              res.user.email || ''
            );


            // Also use AuthService storage

            this.authService
              .setToken(
                res.token
              );


            this.authService
              .setUser(
                res.user
              );


            // Success message

            this.toastr.success(
              res.message ||
              'Google login successful'
            );


            // Update login status

            this.authService
              .updateLoginStatus(
                true
              );


            // Load cart count

            this.cartService
              .loadCartCount();


            // Close modal

            this.close.emit(
              true
            );

          }

        },


        // ==========================================
        // ERROR
        // ==========================================

        error: (err: any) => {


          console.error(
            'Google Login Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            'Google login failed'

          );

        }

      });

  }

}