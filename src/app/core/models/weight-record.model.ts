export interface WeightRecord {
  id?: string;
  personId: string;
  year: number;
  month: number; // 1–12
  weight: number;
  bmi: number;
  createdAt: number;
}
