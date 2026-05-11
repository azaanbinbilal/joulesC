import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { StepDots } from '@/components/StepDots';
import type { ActivityLevel } from '@/lib/health';
import { useOnboardingStore } from '@/store/onboarding';

const OPTIONS: { value: ActivityLevel; title: string; sub: string }[] = [
  { value: 'sedentary', title: 'Sedentary', sub: 'Desk job, little to no exercise' },
  { value: 'light', title: 'Lightly active', sub: 'Light exercise 1–3 days/week' },
  { value: 'moderate', title: 'Moderately active', sub: 'Exercise 3–5 days/week' },
  { value: 'active', title: 'Very active', sub: 'Hard exercise 6–7 days/week' },
  { value: 'very_active', title: 'Extremely active', sub: 'Physical job + daily training' },
];

export default function Activity() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const setDraft = useOnboardingStore((s) => s.set);
  const [activity, setActivity] = useState<ActivityLevel | undefined>(draft.activity);

  const onNext = () => {
    if (!activity) return;
    setDraft({ activity });
    router.push('/goal');
  };

  return (
    <Screen>
      <StepDots total={4} active={1} />
      <Text className="text-text-primary text-3xl font-bold mt-2">Activity level</Text>
      <Text className="text-text-secondary mb-6">Pick the one matching a typical week.</Text>

      <View className="flex-1 gap-3">
        {OPTIONS.map((opt) => {
          const selected = activity === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setActivity(opt.value)}
              className={`rounded-2xl border p-4 ${
                selected
                  ? 'border-neon-green bg-bg-elevated'
                  : 'border-border-subtle bg-bg-card'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  selected ? 'text-neon-green' : 'text-text-primary'
                }`}
              >
                {opt.title}
              </Text>
              <Text className="text-text-secondary text-sm mt-1">{opt.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="pb-6">
        <NeonButton label="Continue" onPress={onNext} disabled={!activity} />
      </View>
    </Screen>
  );
}
