import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-4">{children}</View>
    </SafeAreaView>
  );
}
