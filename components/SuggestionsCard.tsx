import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Suggestion } from '@/lib/suggestions';

export function SuggestionsCard({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;
  return (
    <View
      style={{
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(138,92,246,0.32)',
        padding: 18,
        marginTop: 14,
        shadowColor: '#8A5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={['rgba(138,92,246,0.18)', 'rgba(0,229,255,0.06)', 'rgba(18,21,28,0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          color: '#A0A6B8',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Smart suggestions 💡
      </Text>
      {suggestions.map((s, i) => (
        <Animated.View
          key={s.id}
          entering={FadeInDown.delay(i * 80).duration(360)}
          style={{
            flexDirection: 'row',
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 18, marginRight: 10, lineHeight: 22 }}>{s.emoji}</Text>
          <Text
            style={{
              flex: 1,
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#F5F7FA',
              fontSize: 13,
              lineHeight: 19,
            }}
          >
            {s.text}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}
