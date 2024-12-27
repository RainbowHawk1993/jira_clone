import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TaskService } from './task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule, moveItemInArray, transferArrayItem  } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnChanges {
  @Input() categoryId: number | null = null;
  @Input() tasks: any[] = [];
  @Output() taskMoved = new EventEmitter<{ taskId: number; newCategoryId: number }>();
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

  onTaskDropped(event: any): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data.tasks, event.previousIndex, event.currentIndex);
      console.log('Task reordered within the same category.');
      return;
    } else {
      transferArrayItem(
        event.previousContainer.data.tasks,
        event.container.data.tasks,
        event.previousIndex,
        event.currentIndex,
      );

      const task = event.item.data;
      const newCategoryId = event.container.data.id;
      const previousCategoryId = event.previousContainer.data.id

      this.taskService.updateTaskCategory(task.id, newCategoryId).subscribe(
        (response) => {
          console.log('Task moved successfully:', response);
          task.category_id = newCategoryId;
          this.taskMoved.emit({ taskId: task.id, newCategoryId });
        },
        (error) => {
          console.error('Error moving task:', error);
          transferArrayItem(
            event.container.data.tasks,
            event.previousContainer.data.tasks,
            event.currentIndex,
            event.previousIndex,
          );
        }
      );
    }
  }
}
