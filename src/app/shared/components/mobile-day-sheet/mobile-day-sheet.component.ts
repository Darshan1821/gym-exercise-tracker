import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ExerciseSlot } from '../../../core/models/exercise-slot.model';
import { Person } from '../../../core/models/person.model';
import { WorkoutType } from '../../../core/models/workout-type.model';
import { ExerciseSlotService } from '../../../core/services/exercise-slot.service';
import { PersonService } from '../../../core/services/person.service';
import { WorkoutTypeService } from '../../../core/services/workout-type.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  standalone: true,
  selector: 'app-mobile-day-sheet',
  imports: [CommonModule, FormsModule, MatSelectModule, MatInputModule, MatButtonModule, MatTimepickerModule],
  templateUrl: './mobile-day-sheet.component.html',
  styleUrls: ['./mobile-day-sheet.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MobileDaySheetComponent implements OnInit {

  date!: Date;

  people: Person[] = [];
  workoutTypes: WorkoutType[] = [];
  workoutTypeGroups: { category: string; items: WorkoutType[] }[] = [];

  slots: ExerciseSlot[] = [];
  editingSlot?: ExerciseSlot;

  slotForm = {
    personId: '',
    startTime: null as Date | null,
    endTime: null as Date | null,
    workoutTypes: [] as string[]
  };

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) data: { date: Date },
    private sheetRef: MatBottomSheetRef<MobileDaySheetComponent>,
    private slotService: ExerciseSlotService,
    private personService: PersonService,
    private workoutTypeService: WorkoutTypeService
  ) {
    this.date = data.date;
  }

  ngOnInit() {
    this.loadPeople();
    this.loadWorkoutTypes();
    this.loadSlots();
  }

  /* ---------- Loaders ---------- */

  private loadPeople() {
    this.personService.getAll().subscribe(p => (this.people = p));
  }

  private loadWorkoutTypes() {
    this.workoutTypeService.getAll().subscribe(w => {
      this.workoutTypes = w.filter(x => x.active);
      this.groupWorkoutTypes();
    });
  }

  private loadSlots() {
    this.slotService
      .getByDate(this.dateKey(this.date))
      .subscribe(s => (this.slots = s));
  }

  /* ---------- CRUD ---------- */

  saveSlot() {
    if (!this.slotForm.startTime || !this.slotForm.endTime) return;

    const payload = {
      personId: this.slotForm.personId,
      date: this.dateKey(this.date),
      startTime: this.toTime(this.slotForm.startTime),
      endTime: this.toTime(this.slotForm.endTime),
      workoutTypes: this.slotForm.workoutTypes
    };

    const op = this.editingSlot
      ? this.slotService.update(this.editingSlot.id!, payload)
      : this.slotService.add(payload);

    Promise.resolve(op).then(() => {
      this.resetForm();
      this.loadSlots();
    });
  }

  startEdit(s: ExerciseSlot) {
    this.editingSlot = s;
    this.slotForm = {
      personId: s.personId,
      startTime: this.toDate(s.startTime),
      endTime: this.toDate(s.endTime),
      workoutTypes: [...s?.workoutTypes || []]
    };
  }

  deleteSlot(s: ExerciseSlot) {
    this.slotService.delete(s.id!).then(() => this.loadSlots());
  }

  /* ---------- Validation ---------- */

  hasOverlap(): boolean {
    if (!this.slotForm.startTime || !this.slotForm.endTime) return false;

    const start = this.toMinutes(this.slotForm.startTime);
    const end = this.toMinutes(this.slotForm.endTime);
    if (end <= start) return true;

    return this.slots.some(s => {
      if (this.editingSlot?.id === s.id) return false;
      if (s.personId !== this.slotForm.personId) return false;

      const sStart = this.toMinutes(this.toDate(s.startTime));
      const sEnd = this.toMinutes(this.toDate(s.endTime));

      return start < sEnd && end > sStart;
    });
  }

  getDuration(start: Date | null, end: Date | null): string {
    if (!start || !end) return '--';
    const diff = this.toMinutes(end) - this.toMinutes(start);
    return diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : '--';
  }

  /* ---------- Helpers ---------- */

  getPersonName(id: string) {
    const p = this.people.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }

  getPersonColor(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 65%, 50%)`;
  }

  private groupWorkoutTypes() {
    const map = new Map<string, WorkoutType[]>();
    this.workoutTypes.forEach(w => {
      if (!map.has(w.category)) map.set(w.category, []);
      map.get(w.category)!.push(w);
    });
    this.workoutTypeGroups = [...map.entries()].map(
      ([category, items]) => ({ category, items })
    );
  }

  private dateKey(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private toMinutes(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
  }

  private toTime(d: Date): string {
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private toDate(t: string): Date {
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  private resetForm() {
    this.editingSlot = undefined;
    this.slotForm = {
      personId: '',
      startTime: null,
      endTime: null,
      workoutTypes: []
    };
  }

  close() {
    this.sheetRef.dismiss();
  }

  getWorkoutTypeNames(ids: string[]) {
    return ids
      ?.map(id => this.workoutTypes.find(w => w.id === id))
      .filter(Boolean)
      .map(w => `${w!.category} – ${w!.name}`)
      .join(', ') || 'None';
  }
}
