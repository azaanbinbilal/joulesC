import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import {
  ALL_ACTIVITIES,
  computeKcalBurn,
} from '@/lib/activities';
import { useActivityLogStore } from '@/store/activityLog';
import { useProfileStore } from '@/store/profile';

const INPUT_OUTLINE_RESET = {
  outlineStyle: 'none',
  outlineWidth: 0,
  outlineColor: 'transparent',
} as object;

const DURATION_PRESETS = [15, 30, 45, 60, 90];

const LABEL = {
  fontFamily: 'SpaceGrotesk_500Medium',
  color: '#A0A6B8',
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase',
  marginBottom: 8,
} as const;

export default function ActivityLogScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const addEntry = useActivityLogStore((s) => s.addEntry);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [minutes, setMinutes] = useState('30');

  const selected = ALL_ACTIVITIES.find((a) => a.id === selectedId) ?? null;
  const isCustom = selected?.id === 'custom';
  const finalName = isCustom ? customName.trim() : selected?.name ?? '';

  const minutesNum = Number(minutes);
  const safeMinutes =
    Number.isFinite(minutesNum) && minutesNum > 0 ? minutesNum : 0;
  const weight = profile?.weightKg ?? 70;
  const kcalBurned = selected
    ? computeKcalBurn(selected.mets, weight, safeMinutes)
    : 0;

  const valid =
    !!selected &&
    safeMinutes > 0 &&
    safeMinutes < 600 &&
    (!isCustom || finalName.length > 0);

  const onLog = () => {
    if (!selected || !valid) return;
    addEntry({
      typeId: selected.id,
      name: finalName,
      emoji: selected.emoji,
      mets: selected.mets,
      weightKgAtLog: weight,
      minutes: safeMinutes,
      kcalBurned: Math.round(kcalBurned),
    });
    router.back();
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text
          style={{
            flex: 1,
            fontFamily: 'SpaceGrotesk_700Bold',
            color: '#F5F7FA',
            fontSize: 26,
            letterSpacing: -0.5,
          }}
        >
          Log activity
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#A0A6B8',
              fontSize: 15,
            }}
          >
            Close
          </Text>
        </Pressable>
      </View>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          color: '#FFC857',
          fontSize: 14,
          marginBottom: 18,
          textShadowColor: 'rgba(255,200,87,0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
        }}
      >
        What did you do? 🔥
      </Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={LABEL}>Activity</Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {ALL_ACTIVITIES.map((a, i) => {
            const active = selectedId === a.id;
            return (
              <Animated.View key={a.id} entering={FadeInDown.delay(i * 30).duration(280)}>
                <Pressable
                  onPress={() => setSelectedId(a.id)}
                  style={{
                    width: 100,
                    height: 90,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: active ? '#00FF87' : '#1F2330',
                    backgroundColor: 'rgba(18,21,28,0.85)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#00FF87',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: active ? 0.4 : 0,
                    shadowRadius: 14,
                  }}
                >
                  {active ? (
                    <LinearGradient
                      colors={['rgba(0,255,135,0.18)', 'rgba(0,229,255,0.06)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}
                  <Text style={{ fontSize: 30 }}>{a.emoji}</Text>
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk_600SemiBold',
                      color: active ? '#00FF87' : '#F5F7FA',
                      fontSize: 11,
                      marginTop: 4,
                      textAlign: 'center',
                      paddingHorizontal: 4,
                    }}
                    numberOfLines={1}
                  >
                    {a.name}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {isCustom ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={LABEL}>Custom activity name</Text>
            <View
              style={{
                backgroundColor: 'rgba(18,21,28,0.85)',
                borderColor: '#2B3142',
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. rock climbing, dance class"
                placeholderTextColor="#5C6275"
                selectionColor="#00FF87"
                underlineColorAndroid="transparent"
                style={[
                  {
                    color: '#F5F7FA',
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    fontSize: 15,
                  },
                  INPUT_OUTLINE_RESET,
                ]}
              />
            </View>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                color: '#5C6275',
                fontSize: 11,
                marginTop: 6,
              }}
            >
              Burn estimated at moderate effort (5.0 MET).
            </Text>
          </View>
        ) : null}

        <Text style={LABEL}>Duration</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          style={{ marginBottom: 10, flexGrow: 0 }}
        >
          {DURATION_PRESETS.map((m) => {
            const active = String(m) === minutes;
            return (
              <Pressable
                key={m}
                onPress={() => setMinutes(String(m))}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? '#00FF87' : '#2B3142',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: 'rgba(18,21,28,0.85)',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    color: active ? '#00FF87' : '#A0A6B8',
                    fontSize: 13,
                  }}
                >
                  {m} min
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(5,6,10,0.6)',
            borderColor: '#00FF87',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 14,
            shadowColor: '#00FF87',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.35,
            shadowRadius: 14,
          }}
        >
          <TextInput
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="numeric"
            inputMode="numeric"
            selectionColor="#00FF87"
            underlineColorAndroid="transparent"
            selectTextOnFocus
            style={[
              {
                flex: 1,
                color: '#F5F7FA',
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 20,
              },
              INPUT_OUTLINE_RESET,
            ]}
          />
          <Text
            style={{
              color: '#00FF87',
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            min
          </Text>
        </View>

        {selected ? (
          <Animated.View entering={FadeIn.duration(260)}>
            <View
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255,200,87,0.32)',
                padding: 14,
                marginBottom: 14,
              }}
            >
              <LinearGradient
                colors={[
                  'rgba(255,200,87,0.16)',
                  'rgba(255,61,172,0.06)',
                  'rgba(18,21,28,0.92)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#A0A6B8',
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                Burns
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_700Bold',
                    color: '#FFC857',
                    fontSize: 32,
                    letterSpacing: -1,
                    textShadowColor: 'rgba(255,200,87,0.5)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 14,
                  }}
                >
                  {Math.round(kcalBurned)}
                </Text>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_500Medium',
                    color: '#A0A6B8',
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                >
                  kcal
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  color: '#A0A6B8',
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {selected.mets.toFixed(1)} MET × {weight.toFixed(1)} kg × {safeMinutes} min ÷ 60
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <NeonButton
          label={`Log ${finalName || 'activity'}`}
          onPress={onLog}
          disabled={!valid}
        />
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}
