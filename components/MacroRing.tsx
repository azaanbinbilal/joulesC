import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface Props {
  size: number;
  strokeWidth: number;
  value: number;
  target: number;
  label?: string;
  unit?: string;
}

export function MacroRing({
  size,
  strokeWidth,
  value,
  target,
  label = 'kcal',
  unit = 'kcal',
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? value / target : 0;
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const offset = circumference * (1 - clamped);
  const remaining = Math.max(0, Math.round(target - value));
  const over = value > target;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#5EFFB1" />
            <Stop offset="1" stopColor="#00E5FF" />
          </SvgLinearGradient>
          <SvgLinearGradient id="ringOver" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFC857" />
            <Stop offset="1" stopColor="#FF3DAC" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#1F2330"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={over ? 'url(#ringOver)' : 'url(#ringGrad)'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            color: '#F5F7FA',
            fontSize: size * 0.22,
            letterSpacing: -1,
          }}
        >
          {Math.round(value)}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: '#A0A6B8',
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginTop: -2,
          }}
        >
          / {Math.round(target)} {label}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: over ? '#FFC857' : '#00FF87',
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {over ? `${Math.round(value - target)} over` : `${remaining} ${unit} left`}
        </Text>
      </View>
    </View>
  );
}
