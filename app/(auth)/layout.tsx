// app/(auth)/layout.tsx
import { Logo } from '@/components/custComponent/Logo';
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // bg-background yerine manuel renk
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  content: {
    width: '100%',
    maxWidth: 350,
  },
});