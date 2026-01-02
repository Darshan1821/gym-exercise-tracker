import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  query,
  where,
  orderBy,
  CollectionReference,
  deleteDoc,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExerciseSlot } from '../models/exercise-slot.model';

@Injectable({ providedIn: 'root' })
export class ExerciseSlotService {

  private colRef: CollectionReference<ExerciseSlot>;

  constructor(private firestore: Firestore) {
    this.colRef = collection(
      this.firestore,
      'exerciseSlots'
    ) as CollectionReference<ExerciseSlot>;
  }

  add(slot: Omit<ExerciseSlot, 'id' | 'createdAt'>) {
    return addDoc(this.colRef, {
      ...slot,
      createdAt: Date.now()
    });
  }

  getByMonth(year: number, month: number): Observable<ExerciseSlot[]> {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    const q = query(
      this.colRef,
      where('date', '>=', start),
      where('date', '<', end),
      orderBy('date', 'asc')
    );

    return collectionData(q, { idField: 'id' });
  }

  getByDate(date: string): Observable<ExerciseSlot[]> {
    const q = query(
      this.colRef,
      where('date', '==', date),
      orderBy('startTime', 'asc')
    );

    return collectionData(q, { idField: 'id' });
  }

    // ---------- UPDATE ----------
  update(
    id: string,
    data: Partial<Omit<ExerciseSlot, 'id' | 'createdAt'>>
  ) {
    const ref = doc(this.colRef, id);
    return updateDoc(ref, data);
  }

  // ---------- DELETE ----------
  delete(id: string) {
    const ref = doc(this.colRef, id);
    return deleteDoc(ref);
  }
}
