import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LogWeightModal } from '@/components/LogWeightModal';
import { Screen } from '@/components/Screen';
import { WeightChart } from '@/components/WeightChart';
import { todayISO } from '@/store/foodLog';
import { useProfileStore } from '@/store/profile';
import { useWeightLogStore } from '@/store/weightLog';

const RANGES: { days: number; label: string }[] = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

const LABEL_STYLE = {
  fontFamily: 'SpaceGrotesk_500Medium',
  color: '#A0A6B8',
  fontSize: 10,
  letterSpacing: 1.8,
  textTransform: 'uppercase',
} as const;

function daysUntil(targetDate: string): number {
  const today = new Date(todayISO() + 'T00:00:00');
  const target = new Date(targetDate.slice(0, 10) + 'T00:00:00');
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

export default function ProgressScreen() {
  const profile = useProfileStore((s) => s.profile);
  const entries = useWeightLogStore((s) => s.entries);
  const hydrated = useWeightLogStore((s) => s.hydrated);
  const addEntry = useWeightLogStore((s) => s.addEntry);
  const removeEntry = useWeightLogStore((s) => s.removeEntry);
  const seedFromProfile = useWeightLogStore((s) => s.seedFromProfile);

  const [windowDays, setWindowDays] = useState<number>(30);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!hydrated || !profile) return;
    if (entries.length === 0) {
      seedFromProfile(profile.weightKg, profile.createdAt);
    }
  }, [hydrated, profile, entries.length, seedFromProfile]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries],
  );
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];

  const target = profile?.goal?.targetWeightKg ?? null;
  const targetDate = profile?.goal?.targetDate ?? null;
  const direction = profile?.goal?.direction ?? 'maintain';

  const startWeight = first?.weightKg ?? profile?.weightKg ?? 0;
  const currentWeight = latest?.weightKg ?? profile?.weightKg ?? 0;
  const changeKg = currentWeight - startWeight;

  const today = todayISO();

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w !== chartWidth) setChartWidth(w);
  };

  const onSaveWeight = (weightKg: number) => {
    addEntry({ weightKg, date: today });
  };

  if (!profile) return null;

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(420)}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#A0A6B8',
              fontSize: 14,
            }}
          >
            Your trend
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#F5F7FA',
              fontSize: 30,
              letterSpacing: -0.5,
            }}
          >
            Progress
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).duration(460)}
          style={{ marginTop: 18 }}
        >
          <View
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(0,255,135,0.28)',
              padding: 16,
              shadowColor: '#00FF87',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['rgba(0,255,135,0.14)', 'rgba(0,229,255,0.04)', 'rgba(18,21,28,0.92)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={{
                flexDirection: 'row',
                gap: 6,
                marginBottom: 12,
                alignSelf: 'flex-start',
              }}
            >
              {RANGES.map((r) => {
                const active = r.days === windowDays;
                return (
                  <Pressable
                    key={r.days}
                    onPress={() => setWindowDays(r.days)}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? '#00FF87' : '#2B3142',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: active ? 'rgba(0,255,135,0.12)' : 'rgba(5,6,10,0.4)',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                        color: active ? '#00FF87' : '#A0A6B8',
                        fontSize: 12,
                      }}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View onLayout={onLayout} style={{ width: '100%' }}>
              {chartWidth > 0 ? (
                <WeightChart
                  entries={sorted}
                  targetWeightKg={direction === 'maintain' ? null : target}
                  windowDays={windowDays}
                  today={today}
                  width={chartWidth}
                />
              ) : (
                <View style={{ height: 220 }} />
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(140).duration(460)}
          style={{ marginTop: 18 }}
        >
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatTile label="Start" value={`${startWeight.toFixed(1)} kg`} accent="#A0A6B8" />
            <StatTile
              label="Current"
              value={`${currentWeight.toFixed(1)} kg`}
              accent="#00FF87"
            />
            <StatTile
              label="Target"
              value={target != null ? `${target.toFixed(1)} kg` : '—'}
              accent="#FFC857"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <StatTile
              label="Change"
              value={`${changeKg >= 0 ? '+' : ''}${changeKg.toFixed(1)} kg`}
              accent={
                direction === 'maintain'
                  ? '#A0A6B8'
                  : (direction === 'lose' && changeKg < 0) ||
                      (direction === 'gain' && changeKg > 0)
                    ? '#00FF87'
                    : '#FF3DAC'
              }
            />
            <StatTile
              label="Entries"
              value={String(entries.length)}
              accent="#8A5CF6"
            />
            <StatTile
              label="Days left"
              value={targetDate ? String(daysUntil(targetDate)) : '—'}
              accent="#00E5FF"
            />
          </View>
        </Animated.View>

        {sorted.length > 0 ? (
          <Animated.View
            entering={FadeInDown.delay(200).duration(460)}
            style={{ marginTop: 22 }}
          >
            <Text style={LABEL_STYLE}>Recent entries</Text>
            <View style={{ marginTop: 10 }}>
              {[...sorted]
                .reverse()
                .slice(0, 10)
                .map((e) => (
                  <View
                    key={e.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(18,21,28,0.85)',
                      borderColor: '#1F2330',
                      borderWidth: 1,
                      borderLeftWidth: 4,
                      borderLeftColor: '#00FF87',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'SpaceGrotesk_700Bold',
                          color: '#F5F7FA',
                          fontSize: 16,
                          letterSpacing: -0.3,
                        }}
                      >
                        {e.weightKg.toFixed(1)} kg
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'SpaceGrotesk_400Regular',
                          color: '#A0A6B8',
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {e.seeded ? ' · starting weight' : ''}
                      </Text>
                    </View>
                    {entries.length > 1 ? (
                      <Pressable onPress={() => removeEntry(e.id)} hitSlop={10}>
                        <Text
                          style={{
                            fontFamily: 'SpaceGrotesk_500Medium',
                            color: '#5C6275',
                            fontSize: 20,
                          }}
                        >
                          ×
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          borderRadius: 30,
          shadowColor: '#00FF87',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 18,
          elevation: 10,
        }}
      >
        <LinearGradient
          colors={['#5EFFB1', '#00FF87', '#00E5FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 30,
            paddingHorizontal: 22,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#05060A',
              fontSize: 15,
              letterSpacing: 0.4,
            }}
          >
            + Log weight
          </Text>
        </LinearGradient>
      </Pressable>

      <LogWeightModal
        visible={modalVisible}
        initialWeightKg={currentWeight}
        onClose={() => setModalVisible(false)}
        onSubmit={onSaveWeight}
      />
    </Screen>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(18,21,28,0.85)',
        borderColor: '#1F2330',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      <Text style={LABEL_STYLE}>{label}</Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          color: accent,
          fontSize: 15,
          letterSpacing: -0.3,
          marginTop: 6,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
