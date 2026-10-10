import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { CustomDesignListResponse, CustomDesignResponse } from '../components/models/custom-desigen';

@Injectable({
  providedIn: 'root'
})
export class CustomdesignService {
    private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Create custom design request
  createCustomDesignRequest(
    formData: FormData
  ): Observable<CustomDesignResponse> {
    return this.http.post<CustomDesignResponse>(
      `${this.apiUrl}/create`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  // Get logged-in customer's requests
  getMyCustomDesignRequests(): Observable<CustomDesignListResponse> {
    return this.http.get<CustomDesignListResponse>(
      `${this.apiUrl}/my-requests`,
      { headers: this.getHeaders() }
    );
  }

  // Get one request by ID
  getMyCustomDesignRequestById(
    id: string
  ): Observable<CustomDesignResponse> {
    return this.http.get<CustomDesignResponse>(
      `${this.apiUrl}/costomdesigenbyid/${id}`,
      { headers: this.getHeaders() }
    );
  }



  // ===============================
  // CANCEL MY REQUEST
  // ===============================

  cancelRequest(id: string): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/cancel/${id}`,
      {}
    );

  }

  // ===============================
// UPDATE MY CUSTOM DESIGN REQUEST
// ===============================

// =========================================================
// UPDATE MY CUSTOM DESIGN REQUEST
// =========================================================


updateCustomDesignRequest(
  id: string,
  formData: FormData
): Observable<CustomDesignResponse> {
  return this.http.put<CustomDesignResponse>(
    `${this.apiUrl}/update-custondesigen/${id}`,
    formData,
    { headers: this.getHeaders() }
  );
}
}

