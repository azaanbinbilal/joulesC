import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function NeonButton({ label, onPress, variant = 'primary', disabled }: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const onPressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.96, { damping: 14, stiffness: 220 });
    glow.value = withTiming(1, { duration: 140 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    glow.value = withTiming(0, { duration: 320 });
  };

  if (variant === 'ghost') {
    return (
      <Pressable onPress={handlePress} disabled={disabled}>
        <AnimatedView
          style={[
            animatedStyle,
            {
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.4 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#A0A6B8',
              fontSize: 15,
            }}
          >
            {label}
          </Text>
        </AnimatedView>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
      >
        <AnimatedView
          style={[
            animatedStyle,
            {
              backgroundColor: '#181C26',
              borderColor: '#2B3142',
              borderWidth: 1,
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.4 : 1,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              color: '#F5F7FA',
              fontSize: 16,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
        </AnimatedView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <AnimatedView
        style={[
          animatedStyle,
          {
            borderRadius: 18,
            opacity: disabled ? 0.5 : 1,
            shadowColor: '#00FF87',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: disabled ? 0 : 0.45,
            shadowRadius: 24,
            elevation: disabled ? 0 : 12,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            glowStyle,
            {
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: 26,
              backgroundColor: '#00FF87',
              opacity: 0,
            },
          ]}
        />
        <LinearGradient
          colors={['#5EFFB1', '#00FF87', '#00E5FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#05060A',
              fontSize: 16,
              letterSpacing: 0.4,
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </AnimatedView>
    </Pressable>
  );
}
