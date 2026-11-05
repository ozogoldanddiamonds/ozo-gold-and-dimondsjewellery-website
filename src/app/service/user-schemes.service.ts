import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

export interface Scheme {
  _id: string;
  name: string;
  amount: number;
  durationMonths: number;
  userPayMonths: number;
  companyPayMonths: number;
  monthlyAmount: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserScheme {
  _id: string;
  user: any;
  scheme: Scheme;
  schemeAmount: number;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
  paidMonths: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  subscription: any;
  user: any;
  monthNo: number;
  amount: number;
  paymentDate: string;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'NETBANKING';
  transactionId: string | null;
  status: 'PAID' | 'FAILED';
}
@Injectable({
  providedIn: 'root'
})
export class UserSchemesService {
  constructor(private http: HttpClient) { }

  getAllSchemes(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/get-all-schemes`);
  }

  getSchemeById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/get-scheme/${id}`);
  }

  createUserScheme(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-user-scheme`, payload);
  }

  getUserSchemeByUserId(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/get-user-scheme/${userId}`);
  }
  createPayment(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-payment`, payload);
  }

  getPaymentHistory(subscriptionId: string) {
    return this.http.get(`${environment.apiUrl}/get-payment-history/${subscriptionId}`);
  }
  getUserSchemeById(
    userId: string,
    userSchemeId: string
  ) {
    return this.http.get(
      `${environment.apiUrl}/get-user-scheme/${userId}/${userSchemeId}`
    );
  }


  getUserPayments(userId: string) {
    return this.http.get(
      `${environment.apiUrl}/get-user-payments/${userId}`
    );
  }


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  // Create Razorpay order for scheme installment
  createSchemeRazorpayOrder(payload: {
    subscriptionId: string;
  }): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/create-scheme-razorpay-order`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // Verify Razorpay payment
  verifySchemeRazorpayPayment(payload: {
    paymentAttemptId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/verify-scheme-razorpay-payment`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
}
