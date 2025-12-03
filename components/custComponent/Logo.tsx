// components/logo.tsx
import { Image, StyleSheet } from 'react-native';

export function Logo() {
  return (
    <Image
      source={require('@/assets/images/logo_SB.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
  },
});