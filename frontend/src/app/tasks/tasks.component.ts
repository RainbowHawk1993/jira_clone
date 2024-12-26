import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TaskService } from './task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnChanges {
  @Input() categoryId: number | null = null;
  @Input() tasks: any[] = [];
  newTaskName: string = '';

  constructor(private taskService: TaskService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      // todo
    }
  }

  createTask(): void {
    if (this.newTaskName && this.categoryId) {
      this.taskService.createTask(this.newTaskName, this.categoryId).subscribe(
        (response) => {
          console.log('Task created:', response);
          this.tasks.push({ id: response.id, title: this.newTaskName, category_id: this.categoryId });
          this.newTaskName = '';
        },
        (error) => {
          console.error('Error creating task:', error);
        }
      );
    }
  }
}
