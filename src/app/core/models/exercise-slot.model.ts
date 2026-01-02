// src/app/core/models/exercise-slot.model.ts
export interface ExerciseSlot {
  id?: string;
  personId: string;
  date: string;
  startTime: string;
  endTime: string;
  workoutTypes: string[]; // 🔥 array of WorkoutType IDs
  createdAt?: number;
}
