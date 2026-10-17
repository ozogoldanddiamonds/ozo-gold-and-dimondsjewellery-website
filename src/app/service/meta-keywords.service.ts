import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MetaKeywordsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get Homepage Meta SEO
  getMetaKeywordsSEO(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/get-meta-keyowords-seo`
    );
  }
}
