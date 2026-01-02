import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  collectionData,
  addDoc,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Person } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PersonService {

  // ✅ Strongly typed collection
  private ref: CollectionReference<Person>;

  constructor(private firestore: Firestore) {
    this.ref = collection(
      this.firestore,
      'people'
    ) as CollectionReference<Person>;
  }

  /**
   * Get all people (realtime)
   */
  getAll(): Observable<Person[]> {
    return collectionData(this.ref, {
      idField: 'id'
    });
  }

  /**
   * Add a new person
   */
  add(data: Omit<Person, 'id' | 'active' | 'createdAt' | 'color'>) {
    return addDoc(this.ref, {
      ...data,
      active: true,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      createdAt: Date.now()
    });
  }

  enable(id: string) {
    return updateDoc(
      doc(this.firestore, `people/${id}`),
      { active: true }
    );
  }

  disable(id: string) {
    return updateDoc(
      doc(this.firestore, `people/${id}`),
      { active: false }
    );
  }
}
