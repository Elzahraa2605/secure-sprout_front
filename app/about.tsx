import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function AboutApp() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.appName}>Secure Sprout</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>
          The ultimate parental control solution to keep your children safe in the digital world.
        </Text>
        <Text style={styles.copyright}>© 2026 Secure Sprout Team</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center', padding: 30 },
  closeBtn: { position: 'absolute', top: 50, right: 20 },
  closeText: { fontSize: 24, color: '#fff' },
  content: { alignItems: 'center' },
  logo: { fontSize: 80, marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  version: { fontSize: 16, color: '#E1F5FE', marginBottom: 30 },
  description: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24, opacity: 0.9 },
  copyright: { position: 'absolute', bottom: -150, color: '#E1F5FE', fontSize: 12 }
});