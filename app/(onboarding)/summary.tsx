import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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

const FEASIBILITY = {
  safe: { color: '#00FF87', title: 'Looks healthy', glow: 'rgba(57,255,139,0.18)' },
  aggressive: {
    color: '#FFC857',
    title: 'Aggressive — read this',
    glow: 'rgba(255,200,87,0.18)',
  },
  unsafe: { color: '#FF3DAC', title: 'Not recommended', glow: 'rgba(255,61,172,0.18)' },
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
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: '#F5F7FA',
            marginTop: 48,
          }}
        >
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
  const fStyle = FEASIBILITY[feasibility.level];

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
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            color: '#F5F7FA',
            fontSize: 30,
            letterSpacing: -0.5,
            marginTop: 8,
          }}
        >
          Your plan
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#A0A6B8',
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          Based on your stats and goal.
        </Text>
      </Animated.View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <View
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(57,255,139,0.3)',
              padding: 22,
              marginBottom: 12,
              shadowColor: '#00FF87',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <LinearGradient
              colors={['rgba(57,255,139,0.16)', 'rgba(0,229,255,0.06)', 'rgba(18,21,28,0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                color: '#A0A6B8',
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Daily calorie target
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: '#00FF87',
                  fontSize: 56,
                  letterSpacing: -1.5,
                  textShadowColor: 'rgba(57,255,139,0.6)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 18,
                }}
              >
                {plan.dailyKcalTarget}
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#A0A6B8',
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                kcal
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                color: '#A0A6B8',
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Maintenance: {Math.round(tdee)} kcal
              {plan.dailyKcalDelta !== 0
                ? ` · ${plan.dailyKcalDelta > 0 ? 'Surplus +' : 'Deficit '}${plan.dailyKcalDelta}`
                : ''}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(160).duration(500)}
          style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}
        >
          <StatCard label="BMI" value={bmi.toFixed(1)} caption={bmiCat} />
          <StatCard label="BMR" value={Math.round(bmr).toString()} caption="kcal at rest" />
        </Animated.View>

        {goalDir !== 'maintain' && (
          <Animated.View entering={FadeInDown.delay(220).duration(500)}>
            <View
              style={{
                backgroundColor: 'rgba(18,21,28,0.85)',
                borderColor: '#1F2330',
                borderWidth: 1,
                borderRadius: 22,
                padding: 20,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#A0A6B8',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Pace
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  color: '#F5F7FA',
                  fontSize: 16,
                }}
              >
                {plan.weeklyKgRate.toFixed(2)} kg/week · {weeklyPct.toFixed(2)}% bodyweight/week
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  color: '#A0A6B8',
                  fontSize: 13,
                  marginTop: 6,
                }}
              >
                ~{Math.round(plan.estimatedDays / 7)} weeks to {target.toFixed(1)} kg
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(280).duration(500)}>
          <View
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: fStyle.color + '66',
              padding: 20,
              marginBottom: 24,
            }}
          >
            <LinearGradient
              colors={[fStyle.glow, 'rgba(18,21,28,0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                color: fStyle.color,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {fStyle.title}
            </Text>
            {feasibility.reasons.map((r, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  color: '#A0A6B8',
                  fontSize: 13,
                  marginTop: 8,
                  lineHeight: 19,
                }}
              >
                · {r}
              </Text>
            ))}
            {feasibility.suggestedWeeks ? (
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#00E5FF',
                  fontSize: 13,
                  marginTop: 12,
                }}
              >
                Suggested timeline: ~{feasibility.suggestedWeeks} weeks for a sustainable pace.
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={{ paddingBottom: 24, gap: 8 }}>
        <NeonButton label="Save & continue" onPress={onFinish} />
        <NeonButton label="Adjust goal" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function StatCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(18,21,28,0.85)',
        borderColor: '#1F2330',
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          color: '#A0A6B8',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          color: '#F5F7FA',
          fontSize: 26,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          color: '#5C6275',
          fontSize: 11,
          marginTop: 2,
          textTransform: 'capitalize',
        }}
      >
        {caption}
      </Text>
    </View>
  );
}
