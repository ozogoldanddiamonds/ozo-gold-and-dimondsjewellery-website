import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createRazorpayOrder(payload: {
    items: {
      productId: string;
      variantId: string;
      quantity: number;
    }[];
    addressId: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/createRazorpayOrder`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  verifyRazorpayPayment(payload: {
    paymentAttemptId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verifyRazorpayPayment`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  getOrdersByUser(userId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/getOrdersByUser/${userId}`
    );
  }


  getCustomerShipmentTracking(orderId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/orders/${orderId}/track-shipment`
    );
  }

  checkPincode(pincode: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/check-pincode`,
      { pincode }
    );
  }
}
