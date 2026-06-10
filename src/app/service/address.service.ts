import { HttpClient } from '@angular/common/http';
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

  updateAddress(
    id: string,
    payload: any
  ) {

    return this.http.put(

      `${environment.apiUrl}/updateaddress/${id}`,

      payload

    );

  }

  setDefaultAddress(id: string) {

    return this.http.post(

      `${environment.apiUrl}/setDefaultAddress/${id}`,

      {}

    );

  }
}
