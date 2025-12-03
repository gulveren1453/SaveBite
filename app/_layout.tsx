// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Eğer üst başlık istemiyorsan
        contentStyle: { backgroundColor: '#F5F5F5' }, // Arka plan rengi
      }}
    />
  );
}