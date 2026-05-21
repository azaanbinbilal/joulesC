import { Redirect, Tabs } from 'expo-router';

import { useProfileStore } from '@/store/profile';

export default function TabLayout() {
  const hasOnboarded = useProfileStore((s) => s.hasOnboarded);
  const hydrated = useProfileStore((s) => s.hydrated);

  if (!hydrated) return null;
  if (!hasOnboarded) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Single-tab layout for now — the bottom tab bar adds no value
        // and was confusing as a non-functional "Home" button.
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}
