import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/AnimatedBackground';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#05060A' }}>
      <AnimatedBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Animated.View
          entering={FadeIn.duration(280)}
          style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
