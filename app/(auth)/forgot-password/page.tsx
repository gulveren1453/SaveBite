// app/(auth)/forgot-password.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const validateEmail = (value: string) => {
    // Basit e-posta doğrulama
    const regex = /\S+@\S+\.\S+/;
    return regex.test(value);
  };

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
    console.log({ email });
    // Şifre sıfırlama işlemi burada yapılabilir
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.description}>
        {submitted
          ? "If an account exists for this email, you will receive a password reset link shortly."
          : "No worries, we'll send you reset instructions."}
      </Text>

      {!submitted && (
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.loginLink}>Back to Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#6E6E73',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#F5A623',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: '#F5A623',
    textDecorationLine: 'underline',
  },
});