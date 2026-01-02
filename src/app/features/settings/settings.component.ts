import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkoutTypeService } from '../../core/services/workout-type.service';
import { WorkoutType } from '../../core/models/workout-type.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { WorkoutTypeSheetComponent } from '../../shared/components/workout-type-sheet/workout-type-sheet.component';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, MatExpansionModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  /* ================= DATA ================= */

  workoutTypes: WorkoutType[] = [];
  loading = false;

  groupedWorkoutTypes: {
    category: string;
    items: WorkoutType[];
  }[] = [];

  constructor(
    private workoutTypeService: WorkoutTypeService,
    private bottomSheet: MatBottomSheet
  ) { }

  /* ================= LIFECYCLE ================= */

  ngOnInit(): void {
    this.loadWorkoutTypes();
  }

  /* ================= LOADERS ================= */

  private loadWorkoutTypes() {
    this.loading = true;

    this.workoutTypeService.getAll().subscribe({
      next: (types) => {
        // Optional: sort by category then name
        this.workoutTypes = [...types].sort((a, b) =>
          `${a.category}-${a.name}`.localeCompare(
            `${b.category}-${b.name}`
          )
        );
        this.groupByCategory(this.workoutTypes);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /* ================= ACTIONS ================= */
  openAddWorkoutType() {
    this.openSheet();
  }

  editWorkoutType(wt: WorkoutType) {
    this.openSheet(wt);
  }

  private openSheet(workoutType?: WorkoutType) {
    this.bottomSheet
      .open(WorkoutTypeSheetComponent, {
        data: { workoutType }
      })
      .afterDismissed()
      .subscribe((changed) => {
        if (changed) this.loadWorkoutTypes();
      });
  }

  deleteWorkoutType(wt: WorkoutType) {
    if (!wt.id) return;

    // You can replace confirm with your custom modal
    const ok = confirm(
      `Delete "${wt.category} – ${wt.name}"?`
    );

    if (!ok) return;

    this.workoutTypeService
      .delete(wt.id)
      .then(() => this.loadWorkoutTypes());
  }

  /* ================= HELPERS ================= */

  trackById(_: number, item: WorkoutType) {
    return item.id;
  }

  private groupByCategory(types: WorkoutType[]) {
    const map = new Map<string, WorkoutType[]>();

    types.forEach(wt => {
      if (!map.has(wt.category)) {
        map.set(wt.category, []);
      }
      map.get(wt.category)!.push(wt);
    });

    this.groupedWorkoutTypes = [...map.entries()].map(
      ([category, items]) => ({
        category,
        items: items.sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      })
    );
  }
}
