import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Logo } from '@/components/Logo';
import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';

export default function Welcome() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.View entering={FadeInDown.duration(700).springify()}>
          <Logo size="xl" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(180).duration(600).springify()}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              color: '#F5F7FA',
              fontSize: 22,
              marginTop: 18,
              letterSpacing: 0.2,
            }}
          >
            Smart calories, honest goals.
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(320).duration(600)}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#A0A6B8',
              fontSize: 15,
              marginTop: 14,
              lineHeight: 22,
            }}
          >
            Set a goal, log meals, and we&apos;ll tell you if your target is healthy — not just
            possible. Your data stays on your device.
          </Text>
        </Animated.View>
      </View>
      <Animated.View
        entering={FadeInUp.delay(480).duration(500).springify()}
        style={{ paddingBottom: 32, gap: 12 }}
      >
        <NeonButton label="Get started" onPress={() => router.push('/stats')} />
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#5C6275',
            fontSize: 11,
            textAlign: 'center',
          }}
        >
          joulesC offers general guidance, not medical advice.
        </Text>
      </Animated.View>
    </Screen>
  );
}
