import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Option<T> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? (
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
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(18,21,28,0.85)',
          borderColor: '#1F2330',
          borderWidth: 1,
          borderRadius: 14,
          padding: 4,
        }}
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {selected ? (
                <LinearGradient
                  colors={['#5EFFB1', '#00FF87']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 14,
                  color: selected ? '#05060A' : '#A0A6B8',
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
