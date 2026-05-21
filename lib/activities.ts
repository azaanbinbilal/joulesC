export interface ActivityType {
  id: string;
  emoji: string;
  name: string;
  mets: number;
}

// MET values from the 2011 Compendium of Physical Activities (Ainsworth et al).
// One representative value per activity for MVP simplicity; users can pick
// "Custom" for anything not listed and dial in their own intensity later.
export const ACTIVITY_TYPES: ActivityType[] = [
  { id: 'running', emoji: '🏃', name: 'Running', mets: 8.0 },
  { id: 'walking', emoji: '🚶', name: 'Walking', mets: 3.5 },
  { id: 'badminton', emoji: '🏸', name: 'Badminton', mets: 5.5 },
  { id: 'gym', emoji: '🏋️', name: 'Gym / Weights', mets: 5.0 },
  { id: 'cycling', emoji: '🚴', name: 'Cycling', mets: 7.5 },
  { id: 'yoga', emoji: '🧘', name: 'Yoga', mets: 3.0 },
  { id: 'football', emoji: '⚽', name: 'Football', mets: 7.0 },
  { id: 'swimming', emoji: '🏊', name: 'Swimming', mets: 7.0 },
];

export const CUSTOM_ACTIVITY: ActivityType = {
  id: 'custom',
  emoji: '💪',
  name: 'Custom',
  mets: 5.0,
};

export const ALL_ACTIVITIES: ActivityType[] = [...ACTIVITY_TYPES, CUSTOM_ACTIVITY];

export function computeKcalBurn(mets: number, weightKg: number, minutes: number): number {
  return (mets * weightKg * minutes) / 60;
}
