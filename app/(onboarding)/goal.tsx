import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatInput } from '@/components/StatInput';
import { StepDots } from '@/components/StepDots';
import type { GoalDirection } from '@/lib/health';
import { kgToLb, lbToKg } from '@/lib/units';
import { useOnboardingStore } from '@/store/onboarding';

export default function Goal() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const setDraft = useOnboardingStore((s) => s.set);

  const weightUnit = draft.preferences?.weightUnit ?? 'kg';
  const currentWeightKg = draft.weightKg ?? 0;

  const [direction, setDirection] = useState<GoalDirection>(draft.goalDirection ?? 'lose');
  const initialTarget = draft.goalTargetWeightKg
    ? weightUnit === 'kg'
      ? draft.goalTargetWeightKg.toFixed(1)
      : kgToLb(draft.goalTargetWeightKg).toFixed(1)
    : '';
  const [targetInput, setTargetInput] = useState<string>(initialTarget);
  const [weeks, setWeeks] = useState<string>(draft.goalWeeks?.toString() ?? '12');

  const targetNum = Number(targetInput);
  const targetKg = weightUnit === 'kg' ? targetNum : lbToKg(targetNum);
  const weeksNum = Number(weeks);

  const valid =
    direction === 'maintain' ||
    (targetKg > 20 && targetKg < 400 && weeksNum >= 1 && weeksNum <= 104);

  const onNext = () => {
    if (!valid) return;
    setDraft({
      goalDirection: direction,
      goalTargetWeightKg: direction === 'maintain' ? currentWeightKg : targetKg,
      goalWeeks: direction === 'maintain' ? 0 : weeksNum,
    });
    router.push('/summary');
  };

  const currentLabel =
    weightUnit === 'kg'
      ? `${currentWeightKg.toFixed(1)} kg`
      : `${kgToLb(currentWeightKg).toFixed(1)} lb`;

  return (
    <Screen>
      <StepDots total={4} active={2} />
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
          Your goal
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#A0A6B8',
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          What do you want to do?
        </Text>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(80).duration(450)}>
          <SegmentedControl<GoalDirection>
            options={[
              { value: 'lose', label: 'Lose' },
              { value: 'maintain', label: 'Maintain' },
              { value: 'gain', label: 'Gain' },
            ]}
            value={direction}
            onChange={setDirection}
          />
        </Animated.View>

        {direction !== 'maintain' && (
          <Animated.View entering={FadeInDown.delay(140).duration(450)}>
            <StatInput
              label={`Target weight (current: ${currentLabel})`}
              value={targetInput}
              onChangeText={setTargetInput}
              suffix={weightUnit}
              placeholder={direction === 'lose' ? '65' : '75'}
            />
            <StatInput
              label="Time to reach it"
              value={weeks}
              onChangeText={setWeeks}
              suffix="weeks"
              placeholder="12"
            />
          </Animated.View>
        )}
      </ScrollView>

      <View style={{ paddingBottom: 24 }}>
        <NeonButton label="See my plan" onPress={onNext} disabled={!valid} />
      </View>
    </Screen>
  );
}
