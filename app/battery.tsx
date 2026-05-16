import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function BatteryScreen() {
  const router = useRouter();

  // بيانات تجريبية (ممكن تتغير بعدين لما نربطها بالداتا الحقيقية)
  const batteryLevel = 85; 
  const isCharging = false;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Battery Status</Text>
      </View>

      <View style={styles.content}>
        {/* شكل البطارية الكبيرة */}
        <View style={styles.batteryOuter}>
          <View style={[styles.batteryInner, { width: `${batteryLevel}%`, backgroundColor: batteryLevel < 20 ? '#FF5252' : '#4CAF50' }]} />
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <Text style={styles.statusDesc}>
            {isCharging ? "⚡ Charging now" : "🔋 Discharging"}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.timeText}>Estimated time remaining: 14 hours</Text>
        </View>

        {/* زرار لتنبيه الطفل يروح يشحن */}
        <TouchableOpacity style={styles.alertButton}>
          <Text style={styles.alertButtonText}>Send Charge Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  batteryOuter: {
    width: width * 0.7,
    height: 120,
    borderWidth: 4,
    borderColor: '#37474F',
    borderRadius: 20,
    padding: 5,
    justifyContent: 'center',
    marginBottom: 40,
  },
  batteryInner: {
    height: '100%',
    borderRadius: 12,
  },
  batteryText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#37474F',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusTitle: { fontSize: 18, color: '#757575', marginBottom: 5 },
  statusDesc: { fontSize: 24, fontWeight: 'bold', color: '#37474F' },
  divider: { width: '100%', height: 1, backgroundColor: '#DDD', marginVertical: 15 },
  timeText: { fontSize: 14, color: '#546E7A' },
  alertButton: {
    marginTop: 40,
    backgroundColor: '#FF9800',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  alertButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});