import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environment/environment';
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshTokenExpiresIn?: number;
  isNewUser?: boolean;
  user?: any;
  data?: {
    phone: string;
    expiresIn: number;
    smsReferenceId?: string;
    result?: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Inside AuthService class
  private rawHttp: HttpClient;
  private loginRequestSubject = new Subject<void>();
  loginRequest$ = this.loginRequestSubject.asObservable();
  private userSubject = new BehaviorSubject<any>(this.getUser());
  user$ = this.userSubject.asObservable();
  requestLogin(): void {
    this.loginRequestSubject.next();
  }
  private loginStatusSubject = new BehaviorSubject<boolean>(false);
  loginStatus$ = this.loginStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    handler: HttpBackend,
  ) {
    this.rawHttp = new HttpClient(handler);
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/userregister`, payload);
  }

  login(payload: { phone: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/userlogin`, payload);
  }

  getProfileSummary(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/profileSummary/${userId}`);
  }

  // logout(userId: string): Observable<any> {
  //   return this.http.post(`${environment.apiUrl}/logout`, { userId });
  // }

  setUser(user: any): void {
    localStorage.setItem('ozo_user', JSON.stringify(user));
    this.userSubject.next(user);
  }
  getUser(): any {
    const user = localStorage.getItem('ozo_user');
    return user ? JSON.parse(user) : null;
  }

  getUserId(): string {
    const user = this.getUser();
    return user?._id || '';
  }

  setToken(token: string) {
    localStorage.setItem('ozo_token', token);
  }

  getToken() {
    return localStorage.getItem('ozo_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // clearAuth() {
  //   localStorage.removeItem('ozo_user');
  //   localStorage.removeItem('ozo_token');
  // }

  updateLoginStatus(status: boolean) {
    this.loginStatusSubject.next(status);
  }

  // =========================
  // Google / Gmail Login
  // =========================
  googleLogin(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/google-login`, data);
  }
  updateProfile(userId: string, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/updateProfile/${userId}`, data);
  }

  getUserById(userId: string) {
    return this.http.get<any>(`${environment.apiUrl}/getUserById/${userId}`);
  }

  // SEND OTP
  sendOtp(phone: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/send-otp`, {
      phone,
      name,
    });
  }

  // VERIFY OTP AND LOGIN
  verifyOtp(phone: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/verify-otp`, {
      phone,
      otp,
    });
  }
  // CHECK CUSTOMER MOBILE
  // CHECK CUSTOMER MOBILE
  checkCustomerMobile(phone: string) {
    return this.http.post<any>(`${environment.apiUrl}/check-customer-mobile`, {
      phone,
    });
  }
  // RESEND OTP
  resendOtp(phone: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/resend-otp`, {
      phone,
    });
  }

  // REFRESH ACCESS TOKEN
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/refresh-token`, {
      refreshToken,
    });
  }

  // LOGOUT
  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/logout`, {});
  }

  // SAVE LOGIN SESSION
  setSession(accessToken: string, refreshToken: string, user: any): void {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    if (user?._id) {
      localStorage.setItem('userId', user._id);
    }

    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));

    // Save user and notify Navbar
    if (user) {
      this.setUser(user);
    }

    this.updateLoginStatus(true);
  }
  // GET ACCESS TOKEN
  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  // GET REFRESH TOKEN
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // REFRESH SESSION
  refreshSession(): Observable<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/refresh-token`, {
        refreshToken,
      })
      .pipe(
        map((response) => {
          if (
            !response.success ||
            !response.accessToken ||
            !response.refreshToken
          ) {
            throw new Error('Invalid refresh response');
          }

          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          return response.accessToken;
        }),
      );
  }

  // CLEAR SESSION
  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');

    this.updateLoginStatus(false);
  }
}
