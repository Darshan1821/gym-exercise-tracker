import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-person-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-person-dialog.component.html'
})
export default class AddPersonDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    firstName: string;
    lastName: string;
    age: number;
    height: number;
  }>();

  model = {
    firstName: '',
    lastName: '',
    age: null as number | null,
    height: null as number | null
  };

  submit() {
    if (
      !this.model.firstName ||
      !this.model.lastName ||
      !this.model.age ||
      !this.model.height
    ) return;

    this.save.emit(this.model);
  }
}
