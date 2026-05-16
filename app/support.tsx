import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function Support() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.infoText}>Need help? Our team is here for you 24/7.</Text>
        <TouchableOpacity style={styles.supportCard}>
          <Text style={styles.cardTitle}>📧 Email Us</Text>
          <Text style={styles.cardSub}>support@securesprout.com</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportCard}>
          <Text style={styles.cardTitle}>💬 Live Chat</Text>
          <Text style={styles.cardSub}>Typical response: 5 mins</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingBottom: 15 },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  infoText: { fontSize: 16, color: '#546E7A', marginBottom: 20, textAlign: 'center' },
  supportCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  cardSub: { fontSize: 14, color: '#0288D1', marginTop: 5 }
});