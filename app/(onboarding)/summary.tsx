import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { StepDots } from '@/components/StepDots';
import {
  bmiCategory,
  buildGoalPlan,
  calcBMI,
  calcBMR,
  calcTDEE,
  evaluateFeasibility,
} from '@/lib/health';
import { useOnboardingStore } from '@/store/onboarding';
import { useProfileStore } from '@/store/profile';
import type { Profile } from '@/types/profile';

const FEASIBILITY_COLOR = {
  safe: 'text-neon-green',
  aggressive: 'text-neon-amber',
  unsafe: 'text-neon-pink',
} as const;

const FEASIBILITY_BORDER = {
  safe: 'border-neon-green/40',
  aggressive: 'border-neon-amber/40',
  unsafe: 'border-neon-pink/40',
} as const;

const FEASIBILITY_TITLE = {
  safe: 'Looks healthy',
  aggressive: 'Aggressive — read this',
  unsafe: 'Not recommended',
} as const;

export default function Summary() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const resetDraft = useOnboardingStore((s) => s.reset);
  const setProfile = useProfileStore((s) => s.setProfile);

  if (
    !draft.weightKg ||
    !draft.heightCm ||
    !draft.age ||
    !draft.sex ||
    !draft.activity
  ) {
    return (
      <Screen>
        <Text className="text-text-primary mt-12">
          Missing info — please go back and fill in your stats.
        </Text>
      </Screen>
    );
  }

  const bmr = calcBMR(draft.weightKg, draft.heightCm, draft.age, draft.sex);
  const tdee = calcTDEE(bmr, draft.activity);
  const bmi = calcBMI(draft.weightKg, draft.heightCm);
  const bmiCat = bmiCategory(bmi);

  const goalDir = draft.goalDirection ?? 'maintain';
  const target = draft.goalTargetWeightKg ?? draft.weightKg;
  const weeks = draft.goalWeeks ?? 0;
  const goalInput = {
    currentWeightKg: draft.weightKg,
    targetWeightKg: target,
    weeks: Math.max(weeks, 1),
    tdee,
  };
  const plan = buildGoalPlan(goalInput);
  const feasibility = evaluateFeasibility(goalInput, plan);
  const weeklyPct = (plan.weeklyKgRate / draft.weightKg) * 100;

  const onFinish = () => {
    const now = new Date().toISOString();
    const goalDate = new Date();
    goalDate.setDate(goalDate.getDate() + plan.estimatedDays);

    const profile: Profile = {
      name: draft.name ?? '',
      age: draft.age!,
      sex: draft.sex!,
      heightCm: draft.heightCm!,
      weightKg: draft.weightKg!,
      activity: draft.activity!,
      preferences: draft.preferences ?? { weightUnit: 'kg', heightUnit: 'cm' },
      goal:
        goalDir === 'maintain'
          ? {
              direction: 'maintain',
              targetWeightKg: draft.weightKg!,
              targetDate: now,
              weeks: 0,
            }
          : {
              direction: goalDir,
              targetWeightKg: target,
              targetDate: goalDate.toISOString(),
              weeks,
            },
      createdAt: now,
      updatedAt: now,
    };
    setProfile(profile);
    resetDraft();
    router.replace('/');
  };

  return (
    <Screen>
      <StepDots total={4} active={3} />
      <Text className="text-text-primary text-3xl font-bold mt-2">Your plan</Text>
      <Text className="text-text-secondary mb-6">Based on your stats and goal.</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-bg-card border border-border-subtle rounded-2xl p-5 mb-3">
          <Text className="text-text-secondary text-xs uppercase tracking-widest">
            Daily calorie target
          </Text>
          <Text className="text-neon-green text-5xl font-black mt-1">
            {plan.dailyKcalTarget}
          </Text>
          <Text className="text-text-secondary text-sm mt-1">
            Maintenance: {Math.round(tdee)} kcal
            {plan.dailyKcalDelta !== 0
              ? ` · ${plan.dailyKcalDelta > 0 ? 'Surplus +' : 'Deficit '}${plan.dailyKcalDelta}`
              : ''}
          </Text>
        </View>

        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-bg-card border border-border-subtle rounded-2xl p-4">
            <Text className="text-text-secondary text-xs uppercase tracking-widest">BMI</Text>
            <Text className="text-text-primary text-2xl font-bold mt-1">{bmi.toFixed(1)}</Text>
            <Text className="text-text-muted text-xs mt-1 capitalize">{bmiCat}</Text>
          </View>
          <View className="flex-1 bg-bg-card border border-border-subtle rounded-2xl p-4">
            <Text className="text-text-secondary text-xs uppercase tracking-widest">BMR</Text>
            <Text className="text-text-primary text-2xl font-bold mt-1">{Math.round(bmr)}</Text>
            <Text className="text-text-muted text-xs mt-1">kcal/day at rest</Text>
          </View>
        </View>

        {goalDir !== 'maintain' && (
          <View className="bg-bg-card border border-border-subtle rounded-2xl p-5 mb-3">
            <Text className="text-text-secondary text-xs uppercase tracking-widest mb-1">
              Pace
            </Text>
            <Text className="text-text-primary text-base">
              {plan.weeklyKgRate.toFixed(2)} kg/week · {weeklyPct.toFixed(2)}% bodyweight/week
            </Text>
            <Text className="text-text-secondary text-sm mt-2">
              ~{Math.round(plan.estimatedDays / 7)} weeks to {target.toFixed(1)} kg
            </Text>
          </View>
        )}

        <View
          className={`bg-bg-card border rounded-2xl p-5 mb-6 ${FEASIBILITY_BORDER[feasibility.level]}`}
        >
          <Text
            className={`text-xs uppercase tracking-widest font-bold ${FEASIBILITY_COLOR[feasibility.level]}`}
          >
            {FEASIBILITY_TITLE[feasibility.level]}
          </Text>
          {feasibility.reasons.map((r, i) => (
            <Text key={i} className="text-text-secondary text-sm mt-2 leading-5">
              · {r}
            </Text>
          ))}
          {feasibility.suggestedWeeks ? (
            <Text className="text-neon-cyan text-sm mt-3">
              Suggested timeline: ~{feasibility.suggestedWeeks} weeks for a sustainable pace.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="pb-6 gap-2">
        <NeonButton label="Save & continue" onPress={onFinish} />
        <NeonButton label="Adjust goal" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
