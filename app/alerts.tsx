import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AlertsScreen() {
  const router = useRouter();

  // بيانات تجريبية للتنبيهات
  const alerts = [
    { id: 1, title: 'Geofence Alert', message: 'Ahmed left the School zone.', time: '10 mins ago', type: 'danger' },
    { id: 2, title: 'Battery Warning', message: "Sara's phone is at 15%.", time: '1 hour ago', type: 'warning' },
    { id: 3, title: 'Safe Arrival', message: 'Ahmed arrived at Home.', time: '3 hours ago', type: 'success' },
    { id: 4, title: 'App Install', message: 'Sara installed a new app: Roblox.', time: 'Yesterday', type: 'info' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={[styles.typeIndicator, { 
              backgroundColor: alert.type === 'danger' ? '#FF5252' : 
                               alert.type === 'warning' ? '#FFAB40' : 
                               alert.type === 'success' ? '#66BB6A' : '#29B6F6' 
            }]} />
            <View style={styles.alertInfo}>
              <View style={styles.alertRow}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingBottom: 15, elevation: 2 },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 15 },
  alertCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    marginBottom: 12, 
    overflow: 'hidden',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F1F1'
  },
  typeIndicator: { width: 6, height: '100%' },
  alertInfo: { flex: 1, padding: 15 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  alertTitle: { fontSize: 16, fontWeight: 'bold', color: '#37474F' },
  alertTime: { fontSize: 12, color: '#90A4AE' },
  alertMessage: { fontSize: 14, color: '#607D8B', lineHeight: 20 }
});