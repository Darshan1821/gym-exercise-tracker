import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  addDoc,
  query,
  where,
  collectionData,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { WeightRecord } from '../models/weight-record.model';

@Injectable({ providedIn: 'root' })
export class WeightRecordService {

  // ✅ Strongly typed collection
  private ref: CollectionReference<WeightRecord>;

  constructor(private firestore: Firestore) {
    this.ref = collection(
      this.firestore,
      'weight-records'
    ) as CollectionReference<WeightRecord>;
  }

  getByPerson(personId: string): Observable<WeightRecord[]> {
    // ✅ query is now Query<WeightRecord>
    const q = query(this.ref, where('personId', '==', personId));

    return collectionData(q, {
      idField: 'id'
    });
  }

  add(
    personId: string,
    height: number,
    year: number,
    month: number,
    weight: number
  ) {
    const h = height / 100;
    const bmi = +(weight / (h * h)).toFixed(1);

    return addDoc(this.ref, {
      personId,
      year,
      month,
      weight,
      bmi,
      createdAt: Date.now()
    });
  }

  update(id: string, year: number, month: number, height: number, weight: number) {
    const h = height / 100;
    const bmi = +(weight / (h * h)).toFixed(1);

    return updateDoc(
      doc(this.firestore, `weight-records/${id}`),
      { year, month, weight, bmi }
    );
  }

  delete(id: string) {
    return deleteDoc(
      doc(this.firestore, `weight-records/${id}`)
    );
  }
}
