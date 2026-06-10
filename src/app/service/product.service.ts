import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  constructor(
    private http: HttpClient
  ) { }

  getProductsByType(type: string) {

    return this.http.get(
      `${environment.apiUrl}/getProductsByType/${type}`
    );

  }
  getAllProducts(
    page: number,
    limit: number,
    search: string = ''
  ) {

    return this.http.get(
      `${environment.apiUrl}/products?page=${page}&limit=${limit}&search=${search}`
    );

  }
  getProductById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/get-product/${id}`);
  }

  getProducAllProducts(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getAllProducts`);
  }

  getProductsByCategory(
    query: any = {}
  ) {

    return this.http.get(

      `${environment.apiUrl}/getProductsByCategory`,

      {
        params: query
      }

    );

  }

  getCategoryidByProducts(categoryId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getCategoryIdByProducts/${categoryId}`);
  }

}
