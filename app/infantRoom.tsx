import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function InfantRoom() {
  const router = useRouter();
  
  // المخزن اللي بيعرفنا اللمبة شغالة ولا لا
  const [isLightOn, setIsLightOn] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Infant Room</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Cry Sensor Card */}
        <View style={styles.crySensorCard}>
          <View style={styles.waveContainer}>
            <MaterialCommunityIcons name="waveform" size={80} color="#01579B" opacity={0.6} />
          </View>
          <View style={styles.crySensorFooter}>
            <Text style={styles.sensorLabel}>Cry Sensor</Text>
            <Text style={styles.sensorStatus}>Active</Text>
          </View>
        </View>

        {/* Smart Light Card - التعديل هنا */}
        <View style={styles.smartLightCard}>
          <View style={styles.lightInfoRow}>
            {/* الخلفية بتتغير للأصفر لو اللمبة ON */}
            <View style={[styles.lightIconBg, { backgroundColor: isLightOn ? '#FFD600' : '#4FC3F7' }]}>
              {/* الأيقونة ولونها بيتغيروا */}
              <Ionicons 
                name={isLightOn ? "bulb" : "bulb-outline"} 
                size={30} 
                color={isLightOn ? "#000" : "#fff"} 
              />
            </View>

            <View style={styles.lightTextContainer}>
              <Text style={styles.lightTitle}>Smart Light</Text>
              {/* النص بيتغير بناءً على حالة السويتش */}
              <Text style={styles.lightSub}>
                {isLightOn ? "Light is ON" : "Turn the smart light on"}
              </Text>
            </View>

            <Switch 
              value={isLightOn} 
              onValueChange={(newValue) => setIsLightOn(newValue)}
              trackColor={{ false: "#B0BEC5", true: "#03A9F4" }}
              thumbColor={isLightOn ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Recent Alerts Section */}
        <Text style={styles.sectionTitle}>Recent Alerts</Text>

        <AlertItem message="Crying Detected" time="2 min ago" />
        <AlertItem message="Crying Detected" time="15 min ago" />
        <AlertItem message="Crying Detected" time="10:15 PM" />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// مكون فرعي للتنبيهات
const AlertItem = ({ message, time }: { message: string, time: string }) => (
  <View style={styles.alertCard}>
    <View style={styles.alertIconBg}>
      <Ionicons name="notifications" size={20} color="#01579B" />
    </View>
    <Text style={styles.alertMessage}>{message}</Text>
    <Text style={styles.alertTime}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#01579B' },
  content: { padding: 20 },
  crySensorCard: { borderRadius: 25, overflow: 'hidden', marginBottom: 20, backgroundColor: '#012E4A' },
  waveContainer: { height: 150, backgroundColor: '#64B5F6', justifyContent: 'center', alignItems: 'center' },
  crySensorFooter: { padding: 20 },
  sensorLabel: { color: '#90CAF9', fontSize: 16, fontWeight: 'bold' },
  sensorStatus: { color: '#03A9F4', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  smartLightCard: { backgroundColor: '#012E4A', borderRadius: 25, padding: 20, marginBottom: 30 },
  lightInfoRow: { flexDirection: 'row', alignItems: 'center' },
  lightIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  lightTextContainer: { flex: 1 },
  lightTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  lightSub: { color: '#90CAF9', fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#01579B', marginBottom: 15 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#90CAF9', padding: 15, borderRadius: 15, marginBottom: 10 },
  alertIconBg: { marginRight: 15 },
  alertMessage: { flex: 1, color: '#01579B', fontWeight: 'bold', fontSize: 15 },
  alertTime: { color: '#0288D1', fontSize: 12 },
});