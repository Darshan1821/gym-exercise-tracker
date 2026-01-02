import {
  Component,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { ExerciseSlotService } from '../../core/services/exercise-slot.service';
import { PersonService } from '../../core/services/person.service';

import { ExerciseSlot } from '../../core/models/exercise-slot.model';
import { Person } from '../../core/models/person.model';
import { DayDetailDialogComponent } from '../../shared/components/day-detail-dialog/day-detail-dialog.component';
import { MobileDaySheetComponent } from '../../shared/components/mobile-day-sheet/mobile-day-sheet.component';

@Component({
  standalone: true,
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnInit {

  /* ---------- Calendar ---------- */
  currentDate = new Date();
  calendarDays: Date[] = [];

  /* ---------- Data ---------- */
  people: Person[] = [];
  slots: ExerciseSlot[] = [];

  /* ---------- UI ---------- */
  isDesktop = window.innerWidth >= 640;
  isLegendOpen = false;

  /* ---------- Filters ---------- */
  activePersonIds = new Set<string>();

  constructor(
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private slotService: ExerciseSlotService,
    private personService: PersonService
  ) {}

  /* ---------- Lifecycle ---------- */
  ngOnInit(): void {
    this.generateCalendar();
    this.loadSlots();
    this.loadPeople();
  }

  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 640;
  }

  /* ---------- Loaders ---------- */
  private loadPeople() {
    this.personService.getAll().subscribe(p => {
      this.people = p;
      this.activePersonIds = new Set(p.map(x => x.id!));
    });
  }

  private loadSlots() {
    this.slotService
      .getByMonth(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1
      )
      .subscribe(s => (this.slots = s));
  }

  /* ---------- Calendar navigation ---------- */
  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.refresh();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.refresh();
  }

  private refresh() {
    this.generateCalendar();
    this.loadSlots();
  }

  /* ---------- Calendar generation ---------- */
  generateCalendar() {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);

    const days: Date[] = [];

    for (let i = start.getDay(); i > 0; i--) {
      days.push(new Date(y, m, 1 - i));
    }

    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(y, m, d));
    }

    this.calendarDays = days;
  }

  /* ---------- Helpers ---------- */
  dateKey(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  isToday(d: Date): boolean {
    return new Date().toDateString() === d.toDateString();
  }

  /* ---------- Slot grouping (read-only) ---------- */
  slotsGroupedByPerson(day: Date): [string, number][] {
    const map = new Map<string, number>();
    const key = this.dateKey(day);

    this.slots
      .filter(
        s =>
          s.date === key &&
          this.activePersonIds.has(s.personId)
      )
      .forEach(s =>
        map.set(s.personId, (map.get(s.personId) || 0) + 1)
      );

    return Array.from(map.entries());
  }

  /* ---------- Filters ---------- */
  toggleLegend() {
    this.isLegendOpen = !this.isLegendOpen;
  }

  togglePerson(id: string) {
    this.activePersonIds.has(id)
      ? this.activePersonIds.delete(id)
      : this.activePersonIds.add(id);
  }

  showAllPeople() {
    this.activePersonIds = new Set(this.people.map(p => p.id!));
  }

  clearAllPeople() {
    this.activePersonIds.clear();
  }

  /* ---------- Open day ---------- */
  openDay(day: Date) {
    if (this.isDesktop) {
      this.dialog.open(DayDetailDialogComponent, {
        width: '380px',
        height: '100vh',
        position: { right: '0' },
        panelClass: 'day-slide-dialog',
        autoFocus: false,
        data: { date: day }
      });
    } else {
      this.bottomSheet.open(MobileDaySheetComponent, {
        data: { date: day }
      });
    }
  }

  /* ---------- UI helpers ---------- */
  getPersonName(id: string): string {
    const p = this.people.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  }

  getPersonColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 65%, 50%)`;
  }
}
