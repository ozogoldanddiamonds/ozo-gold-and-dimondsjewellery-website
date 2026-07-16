import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginStatusSubject = new BehaviorSubject<boolean>(false);
  loginStatus$ = this.loginStatusSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/userregister`, payload);
  }

  login(payload: {
    phone: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/userlogin`, payload);
  }

  getProfileSummary(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/profileSummary/${userId}`);
  }

  logout(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/logout`, { userId });
  }

  setUser(user: any) {
    localStorage.setItem('ozo_user', JSON.stringify(user));
  }

  getUser() {
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

  clearAuth() {
    localStorage.removeItem('ozo_user');
    localStorage.removeItem('ozo_token');
  }

  updateLoginStatus(status: boolean) {
    this.loginStatusSubject.next(status);
  }
}
