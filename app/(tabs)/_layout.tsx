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
        tabBarStyle: {
          backgroundColor: '#0D0F14',
          borderTopColor: '#1F2330',
        },
        tabBarActiveTintColor: '#00FF87',
        tabBarInactiveTintColor: '#5C6275',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}
