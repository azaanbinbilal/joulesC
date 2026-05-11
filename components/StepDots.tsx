import { View } from 'react-native';

export function StepDots({ total, active }: { total: number; active: number }) {
  return (
    <View className="flex-row gap-2 justify-center my-4">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-1.5 rounded-full ${
            i === active ? 'w-8 bg-neon-green' : 'w-1.5 bg-border-strong'
          }`}
        />
      ))}
    </View>
  );
}
