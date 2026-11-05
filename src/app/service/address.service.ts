import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  constructor(
    private http: HttpClient
  ) { }

  createAddress(data: any) {

    return this.http.post(

      `${environment.apiUrl}/Createaddress`,

      data

    );

  }
  getAddressById(id: string) {

    return this.http.get(

      `${environment.apiUrl}/addressbyid/${id}`

    );

  }

  getAddresses(userId: string) {

    return this.http.get(

      `${environment.apiUrl}/address/${userId}`

    );

  }

  deleteAddress(id: string) {

    return this.http.delete(

      `${environment.apiUrl}/Deleteaddress/${id}`

    );

  }

  updateAddress(id: string, payload: any) {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(
      `${environment.apiUrl}/updateaddress/${id}`,
      payload,
      { headers }
    );
  }

  setDefaultAddress(id: string) {

    return this.http.post(

      `${environment.apiUrl}/setDefaultAddress/${id}`,

      {}

    );

  }
}
