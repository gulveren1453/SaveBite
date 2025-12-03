// app/(auth)/login/page.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase/firebase-config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validate = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      router.push('/(main)/dashboard/page');
    } catch (err: any) {
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.description}>
        Enter your credentials to access your account.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, error.includes('email') && styles.inputError]}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, error.includes('Password') && styles.inputError]}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password/page')}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup/page')}>
        <Text style={styles.signupLink}>
          Don't have an account?{' '}
          <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, marginBottom: 20 },
  form: { gap: 10 },
  label: { fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  link: { color: '#008080', textAlign: 'center', marginTop: 10 },
  signupLink: { marginTop: 20, textAlign: 'center' },
});
