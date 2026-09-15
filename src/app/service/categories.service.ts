import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  getAllSubSubCategories() {
    throw new Error('Method not implemented.');
  }


  constructor(
    private http: HttpClient
  ) { }

  // GET ALL CATEGORIES
  getAllCategories(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getallcategory`);
  }
}
