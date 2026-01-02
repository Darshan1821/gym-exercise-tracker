import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { WorkoutType } from '../models/workout-type.model';

@Injectable({ providedIn: 'root' })
export class WorkoutTypeService {

  private colRef;

  constructor(private firestore: Firestore) {
    this.colRef = collection(this.firestore, 'workoutTypes');
  }

  getAll(): Observable<WorkoutType[]> {
    return collectionData(this.colRef, { idField: 'id' }) as Observable<WorkoutType[]>;
  }

  add(type: Omit<WorkoutType, 'id'>) {
    return addDoc(this.colRef, type);
  }

  update(id: string, data: Partial<WorkoutType>) {
    return updateDoc(doc(this.colRef, id), data);
  }

  delete(id: string) {
    return deleteDoc(doc(this.colRef, id));
  }
}
