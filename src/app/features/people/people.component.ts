import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PersonService } from '../../core/services/person.service';
import { WeightRecordService } from '../../core/services/weight-record.service';
import { Person } from '../../core/models/person.model';
import { WeightRecord } from '../../core/models/weight-record.model';

import AddPersonDialogComponent from
  '../../shared/components/add-person-dialog/add-person-dialog.component';
import { expandCollapse } from '../../shared/animations/fade-slide';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule, AddPersonDialogComponent],
  templateUrl: './people.component.html',
  animations: [expandCollapse]
})
export class PeopleComponent implements OnInit {

  // ---------- UI ----------
  showAddPerson = false;
  expandedPersonId?: string;

  // Delete modal
  showDeleteModal = false;
  deleteTarget?: { personId: string; recordId: string };

  // ---------- DATA ----------
  private search$ = new BehaviorSubject<string>('');
  people$!: Observable<Person[]>;
  filteredPeople$!: Observable<Person[]>;

  // personId -> weight records
  weightMap = new Map<string, WeightRecord[]>();

  // Monthly form
  form = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weight: null as number | null
  };
  editingRecordId?: string;
  years: number[] = [];

  toast = {
    show: false,
    message: '',
    type: 'error' as 'error' | 'success'
  };

  constructor(
    private personService: PersonService,
    private weightService: WeightRecordService
  ) { }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from(
      { length: 100 },
      (_, i) => currentYear - i
    );

    this.people$ = this.personService.getAll();

    // 🔹 preload latest weight for cards
    this.people$.subscribe(people => {
      people.forEach(p => {
        if (!this.weightMap.has(p.id!)) {
          this.weightService.getByPerson(p.id!).subscribe(records => {
            const sorted = [...records].sort(
              (a, b) =>
                b.year !== a.year ? b.year - a.year : b.month - a.month
            );
            this.weightMap.set(p.id!, sorted);
          });
        }
      });
    });

    this.filteredPeople$ = combineLatest([
      this.people$,
      this.search$
    ]).pipe(
      map(([people, search]) =>
        !search.trim()
          ? people
          : people.filter(p =>
            `${p.firstName} ${p.lastName}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
      )
    );
  }

  setSearch(value: string) {
    this.search$.next(value);
  }

  // ---------- PERSON ----------
  addPerson(data: {
    firstName: string;
    lastName: string;
    age: number;
    height: number;
  }) {
    this.personService.add(data);
    this.showAddPerson = false;
  }

  disablePerson(person: Person) {
    this.personService.disable(person.id!);
    this.expandedPersonId = undefined; // close panel
  }

  enablePerson(person: Person) {
    this.personService.enable(person.id!);
  }

  // ---------- EXPANSION ----------
  toggleExpand(person: Person) {
    if (!person.active) return;

    this.expandedPersonId =
      this.expandedPersonId === person.id ? undefined : person.id;

    this.resetForm();
  }

  getLatest(personId: string): WeightRecord | undefined {
    return this.weightMap.get(personId)?.[0];
  }

  // ---------- MONTHLY WEIGHT ----------
  addOrUpdateRecord(person: Person) {
    if (!this.form.weight) return;

    const records = this.weightMap.get(person.id!) || [];
    const duplicate = records.find(
      r => r.year === this.form.year && r.month === this.form.month
    );

    if (duplicate && !this.editingRecordId) {
      this.showToast(
        'Weight record for this month already exists',
        'error'
      );
      return;
    }

    if (this.editingRecordId) {
      this.weightService.update(
        this.editingRecordId,
        this.form.year,
        this.form.month,
        person.height,
        this.form.weight
      );
    } else {
      this.weightService.add(
        person.id!,
        person.height,
        this.form.year,
        this.form.month,
        this.form.weight
      );
    }

    this.resetForm();
  }

  editRecord(record: WeightRecord) {
    this.form = {
      year: record.year,
      month: record.month,
      weight: record.weight
    };
    this.editingRecordId = record.id;
  }

  // ---------- DELETE MODAL ----------
  openDeleteModal(personId: string, recordId: string) {
    this.deleteTarget = { personId, recordId };
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.weightService.delete(this.deleteTarget.recordId);
    this.showDeleteModal = false;
    this.deleteTarget = undefined;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deleteTarget = undefined;
  }

  resetForm() {
    this.editingRecordId = undefined;
    this.form = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      weight: null
    };
  }

  // ---------- BMI HELPERS ----------
  getBmiCategory(bmi: number) {
    if (bmi < 18.5) return 'under';
    if (bmi < 25) return 'healthy';
    if (bmi < 30) return 'over';
    return 'obese';
  }

  getBmiColorClass(bmi: number) {
    return {
      under: 'text-blue-600',
      healthy: 'text-green-600',
      over: 'text-orange-600',
      obese: 'text-red-600'
    }[this.getBmiCategory(bmi)];
  }

  showToast(message: string, type: 'error' | 'success' = 'error') {
    this.toast = { show: true, message, type };

    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }
}
