import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChildDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>You're Protected!</Text>
        <Text style={styles.subtitle}>Your device is now connected to your family. Stay safe!</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What's happening now?</Text>
        <Text style={styles.infoText}>📍 Your location is shared with your parents.</Text>
        <Text style={styles.infoText}>🔋 They can see your battery level.</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/')} // يرجعه للبداية لو عايز يبدأ من جديد
      >
        <Text style={styles.buttonText}>Got it!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  successCard: { alignItems: 'center', marginBottom: 40 },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#4CAF50', textAlign: 'center', marginTop: 10 },
  infoBox: { backgroundColor: '#fff', padding: 20, borderRadius: 20, width: '100%', marginBottom: 40, elevation: 3 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 15 },
  infoText: { fontSize: 15, color: '#546E7A', marginBottom: 10 },
  button: { backgroundColor: '#2E7D32', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});