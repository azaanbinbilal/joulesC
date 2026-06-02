import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  days: number;
}

export function StreakChip({ days }: Props) {
  const active = days > 0;
  return (
    <View
      style={{
        borderRadius: 999,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: active ? 'rgba(255,200,87,0.45)' : '#2B3142',
        paddingHorizontal: 12,
        paddingVertical: 7,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#FFC857',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: active ? 0.45 : 0,
        shadowRadius: 12,
      }}
    >
      {active ? (
        <LinearGradient
          colors={['rgba(255,200,87,0.22)', 'rgba(255,61,172,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Text style={{ fontSize: 14, marginRight: 4 }}>🔥</Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          color: active ? '#FFC857' : '#A0A6B8',
          fontSize: 12,
          letterSpacing: 0.2,
        }}
      >
        {active ? `${days}-day streak` : 'No streak yet'}
      </Text>
    </View>
  );
}
