import { Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import type { WeightEntry } from '@/types/weight';

interface Props {
  entries: WeightEntry[];
  targetWeightKg: number | null;
  windowDays: number;
  today: string;
  width: number;
  height?: number;
}

const PAD_LEFT = 40;
const PAD_RIGHT = 16;
const PAD_TOP = 18;
const PAD_BOTTOM = 28;

function dateToMs(d: string): number {
  return Date.parse(d + 'T00:00:00');
}

function daysBetween(a: string, b: string): number {
  return Math.round((dateToMs(b) - dateToMs(a)) / 86_400_000);
}

function shiftDate(d: string, deltaDays: number): string {
  const dt = new Date(dateToMs(d) + deltaDays * 86_400_000);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shortLabel(date: string): string {
  const dt = new Date(dateToMs(date));
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function WeightChart({
  entries,
  targetWeightKg,
  windowDays,
  today,
  width,
  height = 220,
}: Props) {
  const startDate = shiftDate(today, -(windowDays - 1));
  const chartW = Math.max(width - PAD_LEFT - PAD_RIGHT, 1);
  const chartH = Math.max(height - PAD_TOP - PAD_BOTTOM, 1);

  const inWindow = entries
    .filter((e) => e.date >= startDate && e.date <= today)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const weights = inWindow.map((e) => e.weightKg);
  const allValues = [...weights];
  if (targetWeightKg != null) allValues.push(targetWeightKg);

  let yMin: number;
  let yMax: number;
  if (allValues.length === 0) {
    yMin = 0;
    yMax = 100;
  } else {
    const lo = Math.min(...allValues);
    const hi = Math.max(...allValues);
    const span = hi - lo;
    const pad = span < 1 ? 2 : span * 0.15;
    yMin = lo - pad;
    yMax = hi + pad;
  }

  const xFor = (date: string) => {
    if (windowDays <= 1) return PAD_LEFT;
    const d = daysBetween(startDate, date);
    return PAD_LEFT + (d / (windowDays - 1)) * chartW;
  };
  const yFor = (w: number) => {
    if (yMax === yMin) return PAD_TOP + chartH / 2;
    return PAD_TOP + (1 - (w - yMin) / (yMax - yMin)) * chartH;
  };

  const path = inWindow
    .map((e, i) => `${i === 0 ? 'M' : 'L'} ${xFor(e.date).toFixed(1)} ${yFor(e.weightKg).toFixed(1)}`)
    .join(' ');

  const gridYs = [0.25, 0.5, 0.75].map((r) => PAD_TOP + r * chartH);
  const yLabels = [yMax, (yMax + yMin) / 2, yMin];

  const xTickCount = windowDays >= 60 ? 4 : windowDays >= 14 ? 4 : 4;
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const ratio = i / (xTickCount - 1);
    const date = shiftDate(startDate, Math.round(ratio * (windowDays - 1)));
    const x = PAD_LEFT + ratio * chartW;
    return { x, date };
  });

  const targetY = targetWeightKg != null ? yFor(targetWeightKg) : null;
  const latest = inWindow[inWindow.length - 1];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="weightLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#5EFFB1" />
            <Stop offset="1" stopColor="#00E5FF" />
          </SvgLinearGradient>
        </Defs>

        {gridYs.map((y, i) => (
          <Line
            key={`grid-${i}`}
            x1={PAD_LEFT}
            x2={PAD_LEFT + chartW}
            y1={y}
            y2={y}
            stroke="#1F2330"
            strokeWidth={1}
          />
        ))}

        {yLabels.map((w, i) => (
          <SvgText
            key={`yl-${i}`}
            x={PAD_LEFT - 6}
            y={gridYs[i] + 3}
            fontSize={9}
            fill="#5C6275"
            textAnchor="end"
            fontFamily="SpaceGrotesk_500Medium"
          >
            {w.toFixed(1)}
          </SvgText>
        ))}

        {xTicks.map((t, i) => (
          <SvgText
            key={`xl-${i}`}
            x={t.x}
            y={PAD_TOP + chartH + 16}
            fontSize={9}
            fill="#5C6275"
            textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
            fontFamily="SpaceGrotesk_500Medium"
          >
            {shortLabel(t.date)}
          </SvgText>
        ))}

        {targetY != null ? (
          <>
            <Line
              x1={PAD_LEFT}
              x2={PAD_LEFT + chartW}
              y1={targetY}
              y2={targetY}
              stroke="#FFC857"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.85}
            />
            <SvgText
              x={PAD_LEFT + chartW}
              y={targetY - 5}
              fontSize={9}
              fill="#FFC857"
              textAnchor="end"
              fontFamily="SpaceGrotesk_600SemiBold"
            >
              Target {targetWeightKg!.toFixed(1)} kg
            </SvgText>
          </>
        ) : null}

        {inWindow.length >= 2 ? (
          <Path
            d={path}
            stroke="url(#weightLine)"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {inWindow.map((e, i) => {
          const isLatest = i === inWindow.length - 1;
          return (
            <Circle
              key={e.id}
              cx={xFor(e.date)}
              cy={yFor(e.weightKg)}
              r={isLatest ? 5 : 3}
              fill={isLatest ? '#00FF87' : '#5EFFB1'}
              stroke="#05060A"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>

      {inWindow.length === 0 ? (
        <View
          style={{
            position: 'absolute',
            left: PAD_LEFT,
            right: PAD_RIGHT,
            top: PAD_TOP,
            height: chartH,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none"
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#5C6275',
              fontSize: 12,
            }}
          >
            No entries in this range
          </Text>
        </View>
      ) : null}

      {latest ? (
        <View
          style={{
            position: 'absolute',
            top: 4,
            right: PAD_RIGHT,
            alignItems: 'flex-end',
          }}
          pointerEvents="none"
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#A0A6B8',
              fontSize: 9,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            Latest
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#00FF87',
              fontSize: 16,
              textShadowColor: 'rgba(0,255,135,0.6)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }}
          >
            {latest.weightKg.toFixed(1)} kg
          </Text>
        </View>
      ) : null}
    </View>
  );
}
