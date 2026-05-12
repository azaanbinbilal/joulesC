import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

function Dot({ activeNow }: { activeNow: boolean }) {
  const w = useSharedValue(activeNow ? 32 : 6);
  const o = useSharedValue(activeNow ? 1 : 0.3);

  useEffect(() => {
    w.value = withTiming(activeNow ? 32 : 6, { duration: 280 });
    o.value = withTiming(activeNow ? 1 : 0.3, { duration: 280 });
  }, [activeNow, o, w]);

  const style = useAnimatedStyle(() => ({
    width: w.value,
    backgroundColor: activeNow ? '#00FF87' : '#2B3142',
    opacity: o.value,
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: activeNow ? 0.6 : 0,
    shadowRadius: 10,
  }));

  return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />;
}

export function StepDots({ total, active }: { total: number; active: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginVertical: 16,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} activeNow={i === active} />
      ))}
    </View>
  );
}
