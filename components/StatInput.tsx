import { Text, TextInput, View } from 'react-native';

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
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-xs uppercase tracking-widest mb-2">{label}</Text>
      <View className="flex-row items-center bg-bg-card border border-border-subtle rounded-xl px-4 py-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#5C6275"
          keyboardType={keyboardType}
          className="flex-1 text-text-primary text-lg font-semibold"
        />
        {suffix ? <Text className="text-text-muted text-sm ml-2">{suffix}</Text> : null}
      </View>
    </View>
  );
}
