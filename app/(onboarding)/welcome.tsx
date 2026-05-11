import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';

export default function Welcome() {
  const router = useRouter();
  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Text className="text-neon-green text-6xl font-black tracking-tight">joulesC</Text>
        <Text className="text-text-primary text-2xl font-semibold mt-3">
          Smart calories, honest goals.
        </Text>
        <Text className="text-text-secondary text-base mt-4 leading-6">
          Set a goal, log meals, and we&apos;ll tell you if your target is healthy — not just
          possible. Your data stays on your device.
        </Text>
      </View>
      <View className="pb-8 gap-3">
        <NeonButton label="Get started" onPress={() => router.push('/stats')} />
        <Text className="text-text-muted text-xs text-center">
          joulesC offers general guidance, not medical advice.
        </Text>
      </View>
    </Screen>
  );
}
