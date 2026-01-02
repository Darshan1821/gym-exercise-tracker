import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { MatIconModule } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  standalone: true,
  selector: 'app-day-detail-dialog',
  imports: [CommonModule, FormsModule, MatSelectModule, 
    MatInputModule, MatButtonModule, MatIconModule, MatTimepickerModule],
  templateUrl: './day-detail-dialog.component.html',
  styleUrls: ['./day-detail-dialog.component.css']
})
export class DayDetailDialogComponent implements OnInit {

  /* ---------- Inputs ---------- */
  date!: Date;

  /* ---------- Data ---------- */
  people: Person[] = [];
  workoutTypes: WorkoutType[] = [];
  workoutTypeGroups: { category: string; items: WorkoutType[] }[] = [];

  slots: ExerciseSlot[] = [];

  /* ---------- Form ---------- */
  slotForm = {
    personId: '',
    startTime: null as Date | null,
    endTime: null as Date | null,
    workoutTypes: [] as string[]
  };

  editingSlot?: ExerciseSlot;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { date: Date },
    private dialogRef: MatDialogRef<DayDetailDialogComponent>,
    private slotService: ExerciseSlotService,
    private personService: PersonService,
    private workoutTypeService: WorkoutTypeService
  ) {
    this.date = data.date;
  }

  /* ---------- Lifecycle ---------- */
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
      this.buildWorkoutTypeGroups();
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
      startTime: this.dateToTime(this.slotForm.startTime),
      endTime: this.dateToTime(this.slotForm.endTime),
      workoutTypes: this.slotForm.workoutTypes
    };

    const op = this.editingSlot?.id
      ? this.slotService.update(this.editingSlot.id, payload)
      : this.slotService.add(payload);

    Promise.resolve(op).then(() => {
      this.resetForm();
      this.loadSlots();
    });
  }

  startEdit(slot: ExerciseSlot) {
    this.editingSlot = slot;
    this.slotForm = {
      personId: slot.personId,
      startTime: this.timeToDate(slot.startTime),
      endTime: this.timeToDate(slot.endTime),
      workoutTypes: [...slot?.workoutTypes || []]
    };
  }

  deleteSlot(slot: ExerciseSlot) {
    this.slotService.delete(slot.id!).then(() => this.loadSlots());
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

      const sStart = this.toMinutes(this.timeToDate(s.startTime));
      const sEnd = this.toMinutes(this.timeToDate(s.endTime));

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

  getWorkoutTypeNames(ids: string[]) {
    return ids
      ?.map(id => this.workoutTypes.find(w => w.id === id))
      .filter(Boolean)
      .map(w => `${w!.category} – ${w!.name}`)
      .join(', ') || 'None';
  }

  close() {
    this.dialogRef.close();
  }

  /* ---------- Utils ---------- */
  private buildWorkoutTypeGroups() {
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

  private dateToTime(d: Date): string {
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private timeToDate(time: string): Date {
    const [h, m] = time.split(':').map(Number);
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
}
