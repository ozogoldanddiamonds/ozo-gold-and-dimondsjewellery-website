import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SizeChartsService {
  constructor(
    private http: HttpClient
  ) { }

  getSizeChartBySubCategory(subCategoryId: string) {
    return this.http.get(`${environment.apiUrl}/get-size-chart-by-sub-category/${subCategoryId}`);
  }
}
