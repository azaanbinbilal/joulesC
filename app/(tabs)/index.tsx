import { Text, View } from 'react-native';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { buildGoalPlan, calcBMR, calcTDEE } from '@/lib/health';
import { useProfileStore } from '@/store/profile';

export default function Dashboard() {
  const profile = useProfileStore((s) => s.profile);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  if (!profile) return null;

  const bmr = calcBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const tdee = calcTDEE(bmr, profile.activity);

  let target = Math.round(tdee);
  if (profile.goal && profile.goal.direction !== 'maintain') {
    const plan = buildGoalPlan({
      currentWeightKg: profile.weightKg,
      targetWeightKg: profile.goal.targetWeightKg,
      weeks: profile.goal.weeks,
      tdee,
    });
    target = plan.dailyKcalTarget;
  }

  return (
    <Screen>
      <Text className="text-text-secondary text-sm">Welcome back,</Text>
      <Text className="text-text-primary text-3xl font-bold">{profile.name || 'there'}</Text>

      <View className="bg-bg-card border border-border-subtle rounded-2xl p-6 mt-8">
        <Text className="text-text-secondary text-xs uppercase tracking-widest">
          Today&apos;s target
        </Text>
        <View className="flex-row items-baseline mt-2">
          <Text className="text-neon-green text-6xl font-black">{target}</Text>
          <Text className="text-text-secondary text-lg ml-2">kcal</Text>
        </View>
      </View>

      <View className="bg-bg-card border border-border-subtle rounded-2xl p-5 mt-3">
        <Text className="text-text-secondary text-xs uppercase tracking-widest mb-2">
          Coming next
        </Text>
        <Text className="text-text-primary text-base leading-6">
          Food search · macro rings · goal-progress graph · Gemini photo logging.
        </Text>
      </View>

      <View className="flex-1" />
      <View className="pb-6">
        <NeonButton label="Reset profile" variant="ghost" onPress={clearProfile} />
      </View>
    </Screen>
  );
}
