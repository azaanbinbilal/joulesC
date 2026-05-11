import { Pressable, Text, View } from 'react-native';

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

export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-text-secondary text-xs uppercase tracking-widest mb-2">{label}</Text>
      ) : null}
      <View className="flex-row bg-bg-card border border-border-subtle rounded-xl p-1">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={`flex-1 py-2 rounded-lg ${selected ? 'bg-neon-green' : ''}`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  selected ? 'text-bg' : 'text-text-secondary'
                }`}
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
