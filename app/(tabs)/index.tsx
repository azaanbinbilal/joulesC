import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#A0A6B8',
            fontSize: 14,
          }}
        >
          Welcome back,
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            color: '#F5F7FA',
            fontSize: 32,
            letterSpacing: -0.5,
          }}
        >
          {profile.name || 'there'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(500)}>
        <View
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(57,255,139,0.3)',
            padding: 24,
            marginTop: 28,
            shadowColor: '#00FF87',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <LinearGradient
            colors={['rgba(57,255,139,0.18)', 'rgba(0,229,255,0.08)', 'rgba(18,21,28,0.9)']}
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
            Today&apos;s target
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                color: '#00FF87',
                fontSize: 68,
                letterSpacing: -2,
                textShadowColor: 'rgba(57,255,139,0.55)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 22,
              }}
            >
              {target}
            </Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                color: '#A0A6B8',
                fontSize: 18,
                marginLeft: 8,
              }}
            >
              kcal
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(500)}>
        <View
          style={{
            backgroundColor: 'rgba(18,21,28,0.85)',
            borderColor: '#1F2330',
            borderWidth: 1,
            borderRadius: 20,
            padding: 18,
            marginTop: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#A0A6B8',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Coming next
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#F5F7FA',
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Food search · macro rings · goal-progress graph · Gemini photo logging.
          </Text>
        </View>
      </Animated.View>

      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 24 }}>
        <NeonButton label="Reset profile" variant="ghost" onPress={clearProfile} />
      </View>
    </Screen>
  );
}
