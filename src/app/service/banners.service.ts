import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BannersService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllBanners(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllBanners`);
  }
}
