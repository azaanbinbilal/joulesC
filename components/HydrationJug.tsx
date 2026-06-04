import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  ClipPath,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const W = 110;
const H = 168;
const BODY_TOP = 16;
const BODY_BOTTOM = 162;
const BODY_LEFT = 14;
const BODY_RIGHT = 96;
const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;
const BODY_WIDTH = BODY_RIGHT - BODY_LEFT;
const SEGMENTS = 22;

interface Props {
  ratio: number;
  reached: boolean;
}

export function HydrationJug({ ratio, reached }: Props) {
  const fillRatio = useSharedValue(0);
  const wavePhase = useSharedValue(0);
  const waveAmp = useSharedValue(3);

  useEffect(() => {
    const target = Math.max(0, Math.min(ratio, 1));
    fillRatio.value = withSpring(target, {
      damping: 13,
      stiffness: 70,
      mass: 0.7,
    });
    waveAmp.value = withSequence(
      withTiming(8, { duration: 220 }),
      withTiming(3, { duration: 720 }),
    );
  }, [ratio, fillRatio, waveAmp]);

  useEffect(() => {
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2400 }),
      -1,
      false,
    );
  }, [wavePhase]);

  const animatedProps = useAnimatedProps(() => {
    const surfaceY = BODY_TOP + BODY_HEIGHT * (1 - fillRatio.value);
    const amp = waveAmp.value;
    const phase = wavePhase.value;
    let d = `M ${BODY_LEFT} ${surfaceY + amp * Math.sin(phase)}`;
    for (let i = 1; i <= SEGMENTS; i++) {
      const x = BODY_LEFT + (i / SEGMENTS) * BODY_WIDTH;
      const y = surfaceY + amp * Math.sin(2 * Math.PI * (i / SEGMENTS) + phase);
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L ${BODY_RIGHT} ${BODY_BOTTOM} L ${BODY_LEFT} ${BODY_BOTTOM} Z`;
    return { d };
  });

  return (
    <View style={{ width: W, height: H, alignItems: 'center' }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <SvgLinearGradient id="waterCool" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00E5FF" stopOpacity="0.92" />
            <Stop offset="1" stopColor="#8A5CF6" stopOpacity="0.85" />
          </SvgLinearGradient>
          <SvgLinearGradient id="waterFull" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#5EFFB1" stopOpacity="0.95" />
            <Stop offset="1" stopColor="#00FF87" stopOpacity="0.88" />
          </SvgLinearGradient>
          <ClipPath id="bottleClip">
            <Rect
              x={BODY_LEFT}
              y={BODY_TOP}
              width={BODY_WIDTH}
              height={BODY_HEIGHT}
              rx={18}
              ry={18}
            />
          </ClipPath>
        </Defs>

        <Rect x={42} y={0} width={26} height={8} rx={2.5} fill="#2B3142" />
        <Rect x={38} y={6} width={34} height={8} rx={2} fill="#1F2330" />

        <Rect
          x={BODY_LEFT}
          y={BODY_TOP}
          width={BODY_WIDTH}
          height={BODY_HEIGHT}
          rx={18}
          ry={18}
          fill="rgba(5,6,10,0.55)"
          stroke="#2B3142"
          strokeWidth={1.5}
        />

        <AnimatedPath
          animatedProps={animatedProps}
          fill={reached ? 'url(#waterFull)' : 'url(#waterCool)'}
          clipPath="url(#bottleClip)"
        />

        <Rect
          x={BODY_LEFT + 7}
          y={BODY_TOP + 14}
          width={2}
          height={BODY_HEIGHT - 30}
          rx={1}
          fill="rgba(255,255,255,0.08)"
          clipPath="url(#bottleClip)"
        />

        <Rect
          x={BODY_LEFT}
          y={BODY_TOP}
          width={BODY_WIDTH}
          height={BODY_HEIGHT}
          rx={18}
          ry={18}
          fill="none"
          stroke={reached ? 'rgba(0,255,135,0.35)' : 'rgba(0,229,255,0.25)'}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}
