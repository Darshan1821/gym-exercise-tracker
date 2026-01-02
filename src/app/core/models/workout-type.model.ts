export interface WorkoutType {
  id?: string;
  category: string;   // e.g. "Chest"
  name: string;       // e.g. "Upper chest"
  order?: number;     // optional sorting
  active: boolean;
}

export interface WorkoutTypeGroup {
  category: string;
  items: WorkoutType[];
}