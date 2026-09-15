import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  apiUrl: any;
  constructor(private http: HttpClient) { }
  
  // subcategory

  /*
 GET ALL SUB SUB CATEGORIES
*/
getAllSubCategories(): Observable<any> {
  return this.http.get(
     `${environment.apiUrl}/Getsubcategory`
  );
}
}
