// app/(auth)/signup/page.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase/firebase-config';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validate = () => {
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      setError('');
      router.push('/(main)/dashboard/page');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.description}>
        Start saving food and money today!
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, error.includes('Name') && styles.inputError]}
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, error.includes('email') && styles.inputError]}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
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

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/login/page')}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  footerText: { marginTop: 20, textAlign: 'center' },
  footerLink: { color: '#008080', fontWeight: 'bold' },
});
