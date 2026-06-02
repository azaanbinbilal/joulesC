export interface WeightEntry {
  id: string;
  weightKg: number;
  date: string;
  loggedAt: string;
  /** True when the entry was auto-seeded from the onboarding profile weight. */
  seeded?: boolean;
}
