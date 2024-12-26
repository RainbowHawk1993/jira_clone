import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api/tasks';

  constructor(private http: HttpClient) {}

  createTask(title: string, categoryId: number): Observable<any> {
    const task = { title, category_id: categoryId };
    return this.http.post(this.apiUrl, task);
  }

  getTasksByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?category_id=${categoryId}`);
  }

  updateTaskCategory(taskId: number, newCategoryId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/change-category`, {
      category_id: newCategoryId,
    });
  }
}
