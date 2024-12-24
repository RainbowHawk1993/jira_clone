import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'http://localhost:8000/api/categories';  // Replace with your backend URL

  constructor(private http: HttpClient) { }

  // Fetch categories from the API
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Create a new category
  createCategory(name: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { name });
  }
}
