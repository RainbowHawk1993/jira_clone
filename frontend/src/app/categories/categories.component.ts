import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../category.service';
import { FormsModule } from '@angular/forms';
import { TasksComponent } from '../tasks/tasks.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, TasksComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  [x: string]: any;
  categories: any[] = [];
  newCategoryName: string = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (response) => {
        this.categories = response.map((category: any) => ({ ...category, newTaskName: '' }));
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  createCategory(): void {
    if (this.newCategoryName) {
      this.categoryService.createCategory(this.newCategoryName).subscribe(
        (response) => {
          console.log('Category created:', response);
          this.loadCategories();
          this.newCategoryName = '';
        },
        (error) => {
          console.error('Error creating category', error);
        }
      );
    }
  }
}
