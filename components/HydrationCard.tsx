import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { HydrationJug } from '@/components/HydrationJug';

const INPUT_OUTLINE_RESET = {
  outlineStyle: 'none',
  outlineWidth: 0,
  outlineColor: 'transparent',
} as object;

interface Props {
  totalMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
  onUndoLast: (() => void) | null;
}

const QUICK_ADDS: { ml: number; emoji: string; label: string }[] = [
  { ml: 250, emoji: '🥛', label: '+250 ml' },
  { ml: 500, emoji: '🍶', label: '+500 ml' },
];

export function HydrationCard({ totalMl, goalMl, onAdd, onUndoLast }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const ratio = goalMl > 0 ? Math.min(totalMl / goalMl, 1) : 0;
  const reached = goalMl > 0 && totalMl >= goalMl;

  const submitCustom = () => {
    const n = Number(customValue);
    if (Number.isFinite(n) && n > 0 && n < 5000) {
      onAdd(n);
      setCustomValue('');
      setCustomOpen(false);
    }
  };

  return (
    <View
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: reached ? 'rgba(0,255,135,0.32)' : 'rgba(0,229,255,0.28)',
        padding: 16,
        shadowColor: reached ? '#00FF87' : '#00E5FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={
          reached
            ? ['rgba(0,255,135,0.14)', 'rgba(0,229,255,0.06)', 'rgba(18,21,28,0.92)']
            : ['rgba(0,229,255,0.16)', 'rgba(138,92,246,0.04)', 'rgba(18,21,28,0.92)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: '#F5F7FA',
            fontSize: 15,
            letterSpacing: 0.3,
          }}
        >
          Hydration 💧
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: reached ? '#00FF87' : '#A0A6B8',
            fontSize: 12,
          }}
        >
          {reached
            ? `Goal reached ✨ ${(totalMl / 1000).toFixed(2)} L`
            : `${totalMl} / ${goalMl} ml`}
        </Text>
      </View>

      <View style={{ alignItems: 'center', marginVertical: 6, marginBottom: 14 }}>
        <HydrationJug ratio={ratio} reached={reached} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {QUICK_ADDS.map((q) => (
          <Pressable
            key={q.ml}
            onPress={() => onAdd(q.ml)}
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#2B3142',
              paddingVertical: 10,
              backgroundColor: 'rgba(5,6,10,0.6)',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>{q.emoji}</Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                color: '#F5F7FA',
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {q.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setCustomOpen((v) => !v)}
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: customOpen ? '#00E5FF' : '#2B3142',
            paddingVertical: 10,
            backgroundColor: customOpen ? 'rgba(0,229,255,0.12)' : 'rgba(5,6,10,0.6)',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>✏️</Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              color: customOpen ? '#00E5FF' : '#F5F7FA',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Custom
          </Text>
        </Pressable>
      </View>

      {customOpen ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(5,6,10,0.6)',
            borderColor: '#00E5FF',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginTop: 10,
            shadowColor: '#00E5FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}
        >
          <TextInput
            value={customValue}
            onChangeText={setCustomValue}
            placeholder="e.g. 300"
            placeholderTextColor="#5C6275"
            keyboardType="numeric"
            inputMode="numeric"
            autoFocus
            selectionColor="#00E5FF"
            underlineColorAndroid="transparent"
            onSubmitEditing={submitCustom}
            style={[
              {
                flex: 1,
                color: '#F5F7FA',
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 16,
              },
              INPUT_OUTLINE_RESET,
            ]}
          />
          <Text
            style={{
              color: '#00E5FF',
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 13,
              marginHorizontal: 8,
            }}
          >
            ml
          </Text>
          <Pressable
            onPress={submitCustom}
            style={{
              backgroundColor: '#00E5FF',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                color: '#05060A',
                fontSize: 12,
              }}
            >
              Add
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      {onUndoLast ? (
        <Pressable onPress={onUndoLast} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#5C6275',
              fontSize: 11,
            }}
          >
            Undo last
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
