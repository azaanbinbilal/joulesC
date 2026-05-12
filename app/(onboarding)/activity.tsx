import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
          Activity level
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#A0A6B8',
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          Pick the one matching a typical week.
        </Text>
      </Animated.View>

      <View style={{ flex: 1, gap: 12 }}>
        {OPTIONS.map((opt, i) => {
          const selected = activity === opt.value;
          return (
            <Animated.View
              key={opt.value}
              entering={FadeInDown.delay(80 + i * 60).duration(450)}
            >
              <Pressable
                onPress={() => setActivity(opt.value)}
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: selected ? '#00FF87' : '#1F2330',
                  backgroundColor: 'rgba(18,21,28,0.85)',
                  padding: 16,
                  shadowColor: '#00FF87',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: selected ? 0.4 : 0,
                  shadowRadius: 18,
                  elevation: selected ? 6 : 0,
                }}
              >
                {selected ? (
                  <LinearGradient
                    colors={['rgba(57,255,139,0.18)', 'rgba(0,229,255,0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                ) : null}
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_700Bold',
                    color: selected ? '#00FF87' : '#F5F7FA',
                    fontSize: 16,
                  }}
                >
                  {opt.title}
                </Text>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_400Regular',
                    color: '#A0A6B8',
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {opt.sub}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={{ paddingBottom: 24 }}>
        <NeonButton label="Continue" onPress={onNext} disabled={!activity} />
      </View>
    </Screen>
  );
}
