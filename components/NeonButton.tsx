import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

const containerClass = {
  primary: 'bg-neon-green',
  secondary: 'bg-bg-elevated border border-border-strong',
  ghost: 'bg-transparent',
} as const;

const textClass = {
  primary: 'text-bg font-bold text-base',
  secondary: 'text-text-primary font-semibold text-base',
  ghost: 'text-text-secondary text-base',
} as const;

export function NeonButton({ label, onPress, variant = 'primary', disabled }: Props) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`rounded-2xl py-4 items-center justify-center ${containerClass[variant]} ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <Text className={textClass[variant]}>{label}</Text>
    </Pressable>
  );
}
