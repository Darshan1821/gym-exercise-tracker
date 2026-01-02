import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { WorkoutType } from "../../../core/models/workout-type.model";
import { WorkoutTypeService } from "../../../core/services/workout-type.service";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";

@Component({
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, FormsModule, MatButtonModule],
  templateUrl: './workout-type-sheet.component.html',
  styleUrls: ['./workout-type-sheet.component.css']
})
export class WorkoutTypeSheetComponent {

  form = {
    category: '',
    name: '',
    active: true
  };

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { workoutType?: WorkoutType },
    private sheetRef: MatBottomSheetRef<WorkoutTypeSheetComponent>,
    private service: WorkoutTypeService
  ) {
    if (data.workoutType) {
      this.form = { ...data.workoutType };
    }
  }

  save() {
    const op = this.data.workoutType?.id
      ? this.service.update(this.data.workoutType.id, this.form)
      : this.service.add(this.form);

    Promise.resolve(op).then(() => this.sheetRef.dismiss(true));
  }

  close() {
    this.sheetRef.dismiss();
  }
}
