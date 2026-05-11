import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatInput } from '@/components/StatInput';
import { StepDots } from '@/components/StepDots';
import type { Sex } from '@/lib/health';
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from '@/lib/units';
import type { HeightUnit, WeightUnit } from '@/lib/units';
import { useOnboardingStore } from '@/store/onboarding';

export default function Stats() {
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const setDraft = useOnboardingStore((s) => s.set);

  const [name, setName] = useState(draft.name ?? '');
  const [age, setAge] = useState(draft.age?.toString() ?? '');
  const [sex, setSex] = useState<Sex | undefined>(draft.sex);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(
    draft.preferences?.weightUnit ?? 'kg',
  );
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(
    draft.preferences?.heightUnit ?? 'cm',
  );

  const initialWeight = draft.weightKg
    ? weightUnit === 'kg'
      ? draft.weightKg.toFixed(1)
      : kgToLb(draft.weightKg).toFixed(1)
    : '';
  const [weight, setWeight] = useState(initialWeight);
  const [heightCm, setHeightCm] = useState(draft.heightCm?.toFixed(0) ?? '');

  const initFt = draft.heightCm ? cmToFtIn(draft.heightCm) : { ft: 0, in: 0 };
  const [ft, setFt] = useState(initFt.ft ? initFt.ft.toString() : '');
  const [inches, setInches] = useState(initFt.ft ? initFt.in.toString() : '');

  const ageNum = Number(age);
  const weightNum = Number(weight);
  const ftNum = Number(ft);
  const inNum = Number(inches);
  const heightCmNum =
    heightUnit === 'cm' ? Number(heightCm) : ftInToCm(ftNum || 0, inNum || 0);
  const weightKg = weightUnit === 'kg' ? weightNum : lbToKg(weightNum);

  const valid =
    name.trim().length > 0 &&
    ageNum >= 13 &&
    ageNum <= 100 &&
    !!sex &&
    weightKg > 20 &&
    weightKg < 400 &&
    heightCmNum > 100 &&
    heightCmNum < 250;

  const onNext = () => {
    if (!valid || !sex) return;
    setDraft({
      name: name.trim(),
      age: ageNum,
      sex,
      weightKg,
      heightCm: heightCmNum,
      preferences: { weightUnit, heightUnit },
    });
    router.push('/activity');
  };

  return (
    <Screen>
      <StepDots total={4} active={0} />
      <Text className="text-text-primary text-3xl font-bold mt-2">About you</Text>
      <Text className="text-text-secondary mb-6">
        We use these to estimate your daily burn.
      </Text>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="What should we call you?"
          keyboardType="default"
        />
        <StatInput
          label="Age"
          value={age}
          onChangeText={setAge}
          suffix="years"
          placeholder="25"
        />
        <SegmentedControl<Sex>
          label="Biological sex (for BMR calc)"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
          value={sex}
          onChange={setSex}
        />

        <SegmentedControl<WeightUnit>
          label="Weight unit"
          options={[
            { value: 'kg', label: 'kg' },
            { value: 'lb', label: 'lb' },
          ]}
          value={weightUnit}
          onChange={setWeightUnit}
        />
        <StatInput
          label="Weight"
          value={weight}
          onChangeText={setWeight}
          suffix={weightUnit}
          placeholder={weightUnit === 'kg' ? '70' : '154'}
        />

        <SegmentedControl<HeightUnit>
          label="Height unit"
          options={[
            { value: 'cm', label: 'cm' },
            { value: 'ft_in', label: 'ft + in' },
          ]}
          value={heightUnit}
          onChange={setHeightUnit}
        />
        {heightUnit === 'cm' ? (
          <StatInput
            label="Height"
            value={heightCm}
            onChangeText={setHeightCm}
            suffix="cm"
            placeholder="175"
          />
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatInput
                label="Feet"
                value={ft}
                onChangeText={setFt}
                suffix="ft"
                placeholder="5"
              />
            </View>
            <View className="flex-1">
              <StatInput
                label="Inches"
                value={inches}
                onChangeText={setInches}
                suffix="in"
                placeholder="9"
              />
            </View>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>

      <View className="pb-6">
        <NeonButton label="Continue" onPress={onNext} disabled={!valid} />
      </View>
    </Screen>
  );
}
