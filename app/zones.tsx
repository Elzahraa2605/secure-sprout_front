import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SafeZones() {
  const router = useRouter();

  // بيانات تجريبية للمناطق
  const zones = [
    { id: 1, name: 'Home', address: '123 Street, Cairo', icon: '🏠', status: 'Inside' },
    { id: 2, name: 'School', address: 'Green Valley School', icon: '🏫', status: 'Outside' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Safe Zones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Your Saved Places</Text>
        
        {zones.map((zone) => (
          <View key={zone.id} style={styles.zoneCard}>
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneIcon}>{zone.icon}</Text>
              <View>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneAddress}>{zone.address}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: zone.status === 'Inside' ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={[styles.statusText, { color: zone.status === 'Inside' ? '#2E7D32' : '#EF6C00' }]}>
                {zone.status}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addZoneButton}>
          <Text style={styles.addZoneText}>+ Add New Safe Zone</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { fontSize: 18, color: '#0288D1', marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  zoneCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#F8F9FA', 
    borderRadius: 15, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F3F4'
  },
  zoneInfo: { flexDirection: 'row', alignItems: 'center' },
  zoneIcon: { fontSize: 30, marginRight: 15 },
  zoneName: { fontSize: 16, fontWeight: 'bold', color: '#37474F' },
  zoneAddress: { fontSize: 12, color: '#78909C', marginTop: 2 },
  statusBadge: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  addZoneButton: { 
    marginTop: 20, 
    borderWidth: 2, 
    borderColor: '#0288D1', 
    borderStyle: 'dashed', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center' 
  },
  addZoneText: { color: '#0288D1', fontSize: 16, fontWeight: 'bold' }
});