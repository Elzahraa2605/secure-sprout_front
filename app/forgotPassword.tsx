import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* زرار الرجوع */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          keyboardType="email-address"
          placeholderTextColor="#90A4AE"
        />

        <TouchableOpacity 
          style={styles.sendButton}
          onPress={() => alert('Reset link sent to your email!')}
        >
          <Text style={styles.sendButtonText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', padding: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  backText: { color: '#01579B', fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 40 },
  icon: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0D47A1' },
  subtitle: { fontSize: 16, color: '#546E7A', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  form: { width: '100%' },
  input: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 15, marginBottom: 20, elevation: 2 },
  sendButton: { backgroundColor: '#0288D1', paddingVertical: 18, borderRadius: 15, alignItems: 'center', elevation: 4 },
  sendButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});