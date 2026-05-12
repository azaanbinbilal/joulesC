import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

function Blob({
  size,
  colors,
  start,
  end,
  duration,
  delay = 0,
}: {
  size: number;
  colors: [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  delay?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [duration, t]);

  const style = useAnimatedStyle(() => {
    const x = start.x + (end.x - start.x) * t.value;
    const y = start.y + (end.y - start.y) * t.value;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: 0.55,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

export function AnimatedBackground() {
  const overlay =
    Platform.OS === 'web' ? (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backdropFilter: 'blur(80px)' } as object]}
      />
    ) : (
      <BlurView
        intensity={80}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
    );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#05060A', '#0A0D1A', '#05060A']}
        style={StyleSheet.absoluteFill}
      />
      <Blob
        size={W * 0.9}
        colors={['#00FF87', '#00E5FF']}
        start={{ x: -W * 0.25, y: -H * 0.15 }}
        end={{ x: -W * 0.05, y: -H * 0.05 }}
        duration={9000}
      />
      <Blob
        size={W * 0.85}
        colors={['#8A5CF6', '#FF3DAC']}
        start={{ x: W * 0.35, y: H * 0.45 }}
        end={{ x: W * 0.55, y: H * 0.55 }}
        duration={11000}
        delay={300}
      />
      <Blob
        size={W * 0.7}
        colors={['#00E5FF', '#8A5CF6']}
        start={{ x: W * 0.2, y: H * 0.7 }}
        end={{ x: W * 0.4, y: H * 0.8 }}
        duration={13000}
      />
      {overlay}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,6,10,0.55)' }]}
      />
    </View>
  );
}
