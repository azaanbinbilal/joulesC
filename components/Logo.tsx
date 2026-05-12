import { Text, View } from 'react-native';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_TO_FONT = { sm: 28, md: 44, lg: 64, xl: 84 } as const;

export function Logo({ size = 'lg' }: Props) {
  const fontSize = SIZE_TO_FONT[size];
  return (
    <View style={{ position: 'relative' }}>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize,
          color: '#00E5FF',
          opacity: 0.55,
          letterSpacing: -1,
          position: 'absolute',
          left: 2,
          top: 1,
        }}
      >
        joulesC
      </Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize,
          color: '#00FF87',
          letterSpacing: -1,
          textShadowColor: '#00FF87',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 24,
        }}
      >
        joulesC
      </Text>
    </View>
  );
}
