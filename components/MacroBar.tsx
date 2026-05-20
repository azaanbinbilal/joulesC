import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

interface Props {
  label: string;
  value: number;
  target: number;
  colors: [string, string];
  unit?: string;
}

export function MacroBar({ label, value, target, colors, unit = 'g' }: Props) {
  const ratio = target > 0 ? value / target : 0;
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const over = value > target;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: '#A0A6B8',
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: over ? '#FFC857' : '#F5F7FA',
            fontSize: 12,
          }}
        >
          {Math.round(value)}
          <Text style={{ color: '#5C6275' }}> / {Math.round(target)} {unit}</Text>
        </Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: '#1F2330',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={over ? ['#FFC857', '#FF3DAC'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', width: `${clamped * 100}%`, borderRadius: 4 }}
        />
      </View>
    </View>
  );
}
