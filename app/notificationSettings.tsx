import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotificationSettings() {
  const router = useRouter();
  
  // حالات مفاتيح التبديل
  const [states, setStates] = useState({
    screenTime: true,
    newApp: true,
    contentBlocked: true,
    location: true,
    weekly: true,
    critical: true,
  });

  const toggle = (key) => setStates({ ...states, [key]: !states[key] });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: Push Notifications */}
        <Text style={styles.sectionLabel}>Push Notifications</Text>
        <View style={styles.card}>
          <View style={styles.item}>
            <View style={styles.itemTextContent}>
              <Text style={styles.itemTitle}>Screen Time Limits</Text>
              <Text style={styles.itemSub}>When a child reaches their daily limit.</Text>
            </View>
            <Switch value={states.screenTime} onValueChange={() => toggle('screenTime')} thumbColor="#FFF" trackColor={{ true: '#03A9F4' }} />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.item}>
            <View style={styles.itemTextContent}>
              <Text style={styles.itemTitle}>New App Installed</Text>
              <Text style={styles.itemSub}>When a new app is installed on child's device.</Text>
            </View>
            <Switch value={states.newApp} onValueChange={() => toggle('newApp')} thumbColor="#FFF" trackColor={{ true: '#03A9F4' }} />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.itemTextContent}>
              <Text style={styles.itemTitle}>Content Blocked</Text>
              <Text style={styles.itemSub}>When a child attempts to access blocked content.</Text>
            </View>
            <Switch value={states.contentBlocked} onValueChange={() => toggle('contentBlocked')} thumbColor="#FFF" trackColor={{ true: '#03A9F4' }} />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.itemTextContent}>
              <Text style={styles.itemTitle}>Location Alerts</Text>
              <Text style={styles.itemSub}>Geofencing and location-based alerts.</Text>
            </View>
            <Switch value={states.location} onValueChange={() => toggle('location')} thumbColor="#FFF" trackColor={{ true: '#03A9F4' }} />
          </View>
        </View>

        {/* Section 2: Email Notifications */}
        <Text style={styles.sectionLabel}>Email Notifications</Text>
        <View style={styles.card}>
          <View style={styles.item}>
            <View style={styles.itemTextContent}>
              <Text style={styles.itemTitle}>Weekly Reports</Text>
              <Text style={styles.itemSub}>Receive weekly summaries of your child's activity.</Text>
            </View>
            <Switch value={states.weekly} onValueChange={() => toggle('weekly')} thumbColor="#FFF" trackColor={{ true: '#03A9F4' }} />
          </View>
          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.itemTextContent}>
              <Text style={styles.itemTitle}>Critical Alerts</Text>
              <Text style={styles.itemSub}>For urgent matters and security notices.</Text>
            </View>
            <Switch value={states.critical} onValueChange={() => toggle('critical')} thumbColor="#FFF" trackColor={{ true: '#03A9F4' }} />
          </View>
        </View>

        {/* Bottom Button */}
        <TouchableOpacity style={styles.soundBtn}>
          <Text style={styles.soundIcon}>🔊</Text>
          <Text style={styles.soundText}>Notification Sounds</Text>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontSize: 30, color: '#0288D1', marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#01579B' },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 16, color: '#0288D1', fontWeight: '600', marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#BBDEFB', borderRadius: 25, padding: 15, marginBottom: 25 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  itemTextContent: { flex: 0.8 },
  itemTitle: { fontSize: 17, fontWeight: 'bold', color: '#01579B' },
  itemSub: { fontSize: 12, color: '#546E7A', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#90CAF9', marginVertical: 2 },
  soundBtn: { backgroundColor: '#BBDEFB', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center' },
  soundIcon: { fontSize: 24, marginRight: 15, color: '#01579B' },
  soundText: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#01579B' },
  arrowIcon: { fontSize: 24, color: '#0288D1' }
});