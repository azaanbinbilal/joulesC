import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix?: string;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
}

export function StatInput({
  label,
  value,
  onChangeText,
  suffix,
  placeholder,
  keyboardType = 'numeric',
}: Props) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  const onFocus = () => {
    setFocused(true);
    focus.value = withTiming(1, { duration: 220 });
  };
  const onBlur = () => {
    setFocused(false);
    focus.value = withTiming(0, { duration: 240 });
  };

  const animatedContainer = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], ['#1F2330', '#00FF87']),
    shadowOpacity: focus.value * 0.5,
    shadowRadius: 14 + focus.value * 10,
  }));

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          color: '#A0A6B8',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(18,21,28,0.85)',
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#00FF87',
            shadowOffset: { width: 0, height: 0 },
          },
          animatedContainer,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#5C6275"
          keyboardType={keyboardType}
          onFocus={onFocus}
          onBlur={onBlur}
          selectionColor="#00FF87"
          underlineColorAndroid="transparent"
          style={[
            {
              flex: 1,
              color: '#F5F7FA',
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 18,
            },
            { outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as object,
          ]}
        />
        {suffix ? (
          <Text
            style={{
              color: focused ? '#00FF87' : '#5C6275',
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 13,
              marginLeft: 8,
            }}
          >
            {suffix}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
