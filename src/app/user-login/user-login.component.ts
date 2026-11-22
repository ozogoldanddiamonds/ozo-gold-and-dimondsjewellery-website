import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, finalize, interval } from 'rxjs';
import { AuthResponse, AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
interface Country {
  iso: string;
  name: string;
  code: string;
  flag: string;
  digits: number;
}
@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css'],
})
export class UserLoginComponent implements OnChanges, OnDestroy {
  @Input() isAuthOpen = false;
  @Output() close = new EventEmitter<boolean>();

  mobileForm: FormGroup;
  otpForm: FormGroup;

  currentStep: 'mobile' | 'otp' = 'mobile';

  mobileNumber = '';

  isLoading = false;

  errorMessage = '';
  successMessage = '';

  resendSeconds = 60;
  isCountryDropdownOpen = false;
  private timerSubscription?: Subscription;
  // COUNTRY LIST
  countries: Country[] = [
    { iso: 'IN', name: 'India', code: '+91', flag: '🇮🇳', digits: 10 },
    { iso: 'US', name: 'United States', code: '+1', flag: '🇺🇸', digits: 10 },
    { iso: 'GB', name: 'United Kingdom', code: '+44', flag: '🇬🇧', digits: 10 },
    {
      iso: 'AE',
      name: 'United Arab Emirates',
      code: '+971',
      flag: '🇦🇪',
      digits: 9,
    },
    { iso: 'CA', name: 'Canada', code: '+1', flag: '🇨🇦', digits: 10 },
    { iso: 'AU', name: 'Australia', code: '+61', flag: '🇦🇺', digits: 9 },
    { iso: 'SG', name: 'Singapore', code: '+65', flag: '🇸🇬', digits: 8 },
    { iso: 'DE', name: 'Germany', code: '+49', flag: '🇩🇪', digits: 11 },
    { iso: 'FR', name: 'France', code: '+33', flag: '🇫🇷', digits: 9 },
    { iso: 'SA', name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', digits: 9 },
    { iso: 'JP', name: 'Japan', code: '+81', flag: '🇯🇵', digits: 10 },
    { iso: 'CN', name: 'China', code: '+86', flag: '🇨🇳', digits: 11 },
    { iso: 'NZ', name: 'New Zealand', code: '+64', flag: '🇳🇿', digits: 9 },
    { iso: 'ZA', name: 'South Africa', code: '+27', flag: '🇿🇦', digits: 9 },
    { iso: 'IT', name: 'Italy', code: '+39', flag: '🇮🇹', digits: 10 },
    { iso: 'ES', name: 'Spain', code: '+34', flag: '🇪🇸', digits: 9 },
    { iso: 'MY', name: 'Malaysia', code: '+60', flag: '🇲🇾', digits: 9 },
    { iso: 'QA', name: 'Qatar', code: '+974', flag: '🇶🇦', digits: 8 },
    { iso: 'KW', name: 'Kuwait', code: '+965', flag: '🇰🇼', digits: 8 },
    { iso: 'OM', name: 'Oman', code: '+968', flag: '🇴🇲', digits: 8 },
  ];

  // DEFAULT COUNTRY
  selectedCountry: Country = this.countries[0];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {
    this.mobileForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    });

    this.otpForm = this.fb.group({
      otp1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    });
  }
  toggleCountryDropdown(): void {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  selectCountry(country: Country): void {
    this.selectedCountry = country;

    this.isCountryDropdownOpen = false;

    this.phoneControl?.reset('');

    this.updatePhoneValidators();

    this.errorMessage = '';
    this.successMessage = '';
  }

  // PHONE VALIDATION
  updatePhoneValidators(): void {
    let pattern: RegExp;

    if (this.selectedCountry.iso === 'IN') {
      pattern = /^[6-9]\d{9}$/;
    } else {
      pattern = new RegExp(`^[0-9]{${this.selectedCountry.digits}}$`);
    }

    this.phoneControl?.setValidators([
      Validators.required,
      Validators.pattern(pattern),
    ]);

    this.phoneControl?.updateValueAndValidity();
  }

  // COUNTRY CHANGE
  onCountryChange(event: Event): void {
    const iso = (event.target as HTMLSelectElement).value;

    const country = this.countries.find((c) => c.iso === iso);

    if (!country) {
      return;
    }

    this.selectedCountry = country;

    this.phoneControl?.reset('');

    this.updatePhoneValidators();

    this.errorMessage = '';
    this.successMessage = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isAuthOpen']) {
      if (this.isAuthOpen) {
        this.resetModal();
      } else {
        this.stopTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  get phoneControl() {
    return this.mobileForm.get('phone');
  }

  get otpControl() {
    return this.otpForm.get('otp');
  }

  // SEND OTP
  sendOtp(): void {
    if (this.mobileForm.invalid || this.isLoading) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.mobileNumber = `${this.selectedCountry.code}${this.mobileForm.value.phone}`;

    this.isLoading = true;

    this.authService.sendOtp(this.mobileNumber).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;

        if (response.success) {
          this.currentStep = 'otp';

          this.successMessage = 'OTP sent successfully to your mobile number.';

          this.startResendTimer();
        } else {
          this.errorMessage = response.message || 'Unable to send OTP';
        }
      },

      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error.error?.message || 'Unable to send OTP. Please try again.';
      },
    });
  }

  // VERIFY OTP AND LOGIN

  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    if (this.isLoading) {
      return;
    }

    const otp = this.otpValue;

    if (!otp || otp.length !== 6) {
      this.toastr.error('Please enter a valid 6-digit OTP');
      return;
    }

    this.isLoading = true;

    this.authService
      .verifyOtp(this.mobileNumber, otp)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          if (!res?.success) {
            this.toastr.error(res?.message || 'OTP verification failed');
            return;
          }

          if (!res.accessToken) {
            this.toastr.error('Login session could not be created');
            return;
          }

          this.authService.setSession(
            res.accessToken,
            res.refreshToken,
            res.user,
          );

          this.toastr.success(res.message || 'Login successful');

          this.authService.updateLoginStatus(true);

          // this.cartService.loadCartCount();

          this.stopTimer();
          this.close.emit(true);
        },

        error: (err: any) => {
          this.toastr.error(err?.error?.message || 'OTP verification failed');
        },
      });
  }
  // RESEND OTP
  resendOtp(): void {
    if (this.resendSeconds > 0 || this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.isLoading = true;

    this.authService.resendOtp(this.mobileNumber).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;

        if (response.success) {
          this.otpForm.reset();

          this.successMessage = 'New OTP sent successfully.';

          this.startResendTimer();
        } else {
          this.errorMessage = response.message || 'Unable to resend OTP';
        }
      },

      error: (error) => {
        this.isLoading = false;

        this.errorMessage = error.error?.message || 'Unable to resend OTP';
      },
    });
  }

  // REFRESH ACCESS TOKEN
  refreshAccessToken(): void {
    const refreshToken = sessionStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.errorMessage = 'Please login again.';
      return;
    }

    this.authService.refreshToken(refreshToken).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          if (response.accessToken) {
            sessionStorage.setItem('accessToken', response.accessToken);
          }

          if (response.refreshToken) {
            sessionStorage.setItem('refreshToken', response.refreshToken);
          }
        } else {
          this.clearSession();
        }
      },

      error: () => {
        this.clearSession();
      },
    });
  }

  // CHANGE MOBILE NUMBER
  changeMobileNumber(): void {
    this.stopTimer();

    this.currentStep = 'mobile';

    this.otpForm.reset();

    this.errorMessage = '';
    this.successMessage = '';
  }

  // RESEND TIMER
  startResendTimer(): void {
    this.stopTimer();

    this.resendSeconds = 60;

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.resendSeconds > 0) {
        this.resendSeconds--;
      } else {
        this.stopTimer();
      }
    });
  }

  stopTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
  }

  // CLEAR SESSION
  clearSession(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    this.close.emit(false);
  }

  // CLOSE MODAL
  closeModal(): void {
    this.stopTimer();

    this.close.emit(false);
  }

  // RESET MODAL
  resetModal(): void {
    this.currentStep = 'mobile';

    this.mobileForm.reset();
    this.otpForm.reset();

    this.mobileNumber = '';

    this.errorMessage = '';
    this.successMessage = '';

    this.isLoading = false;
    this.resendSeconds = 60;

    this.stopTimer();
  }

  get otpValue(): string {
    return ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6']
      .map((control) => this.otpForm.get(control)?.value || '')
      .join('');
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);

    input.value = value;
    this.otpForm.get(`otp${index + 1}`)?.setValue(value);

    if (value && index < 5) {
      const next = document.getElementById(
        `otp-${index + 2}`,
      ) as HTMLInputElement | null;
      next?.focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const previous = document.getElementById(
        `otp-${index}`,
      ) as HTMLInputElement | null;
      previous?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pasted =
      event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ||
      '';

    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`otp${i + 1}`)?.setValue(pasted[i] || '');
    }

    const target = pasted.length === 6 ? 6 : Math.min(pasted.length + 1, 6);
    const focusInput = document.getElementById(
      `otp-${target}`,
    ) as HTMLInputElement | null;
    focusInput?.focus();
  }
}
