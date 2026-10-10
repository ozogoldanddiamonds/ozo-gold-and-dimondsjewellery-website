import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private apiUrl = environment.apiUrl;
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
 getSubCategoryByCategory(categoryId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/get-subcategoryby-category/${categoryId}`
    );
  }
 getSubSubCategoryBySubCategory(
  subCategoryId: string
): Observable<any> {

  return this.http.get(

`${this.apiUrl}/get-subsubcategorybysubcategory/${subCategoryId}`

  );

}
}
