import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { AppListModule } = NativeModules;
const { width } = Dimensions.get('window');

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appUsages, setAppUsages] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState("0h 0m");
  const [children, setChildren] = useState<any[]>([]);
  
  const [showChildModal, setShowChildModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  
  const [selectedChild, setSelectedChild] = useState({ name: 'Select Child', id: null });
  const [selectedRange, setSelectedRange] = useState({ label: 'Today', value: 'today' });

  const ranges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
  ];

  // دالة تنظيف التوكن وجلبه
  const getCleanToken = async () => {
    const rawToken = await AsyncStorage.getItem('userToken');
    return rawToken ? rawToken.replace(/"/g, '') : null;
  };

  const fetchChildren = async () => {
    try {
      const token = await getCleanToken();
      if (!token) return;

      const response = await axios.get('http://192.168.1.9:8000/api/parent/childs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = response.data.data || response.data;
      setChildren(data);
      if (data.length > 0 && !selectedChild.id) {
        setSelectedChild({ name: data[0].name, id: data[0].id });
      }
    } catch (error) {
      console.error("❌ Error fetching children:", error);
    }
  };

  const fetchReports = async (childId: any, range: string) => {
    if (!childId) return;
    setLoading(true);
    try {
      const token = await getCleanToken();
      const response = await axios.get(`http://192.168.1.9:8000/api/parent/reports/app-usage/${childId}?range=${range}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setAppUsages(response.data.data || []);
        const totalMin = response.data.total_time || 0;
        setTotalTime(`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`);
      }
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncUsageData = async () => {
    console.log("LOG: TEST: I am in the right file!");
    
    if (Platform.OS !== 'android') {
      if (selectedChild.id) fetchReports(selectedChild.id, selectedRange.value);
      return;
    }

    if (!selectedChild.id) {
      alert("Please select a child first");
      return;
    }
    
    try {
      setLoading(true);
      if (!AppListModule) {
        console.warn("⚠️ AppListModule not found");
        fetchReports(selectedChild.id, selectedRange.value);
        return;
      }

      console.log("📊 Syncing with getTodayUsage...");
      let usageData = await AppListModule.getTodayUsage();
      console.log("🔍 Raw Data from Android:", usageData);
      // تحويل البيانات لو جاية String من الكوتلن
      const parsedData = typeof usageData === 'string' ? JSON.parse(usageData) : usageData;
      
      const token = await getCleanToken();
      const today = new Date().toISOString().split('T')[0];

      const appsPayload = (parsedData || []).map((item: any) => ({
        app_name: item.appName || item.app_name || "Unknown", 
        package_name: item.packageName || item.package_name || "unknown.package",
        duration: parseInt(item.duration) || 0,
        usage_date: today,
        category: "General"
      }));
console.log("🚀 Payload being sent to Server:", JSON.stringify(appsPayload, null, 2));
      if (appsPayload.length > 0) {
        await axios.post('http://192.168.1.9:8000/api/parent/usage/sync-bulk', {
          child_id: selectedChild.id,
          apps: appsPayload
        }, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        console.log("✅ Sync Successful!");
      }

      fetchReports(selectedChild.id, selectedRange.value);
    } catch (error: any) {
      console.error("❌ Sync Error:", error.response?.status === 401 ? "Unauthorized" : error.message);
      fetchReports(selectedChild.id, selectedRange.value);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchChildren(); }, []));

  useEffect(() => {
    if (selectedChild.id) {
      fetchReports(selectedChild.id, selectedRange.value);
    }
  }, [selectedChild.id, selectedRange.value]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity onPress={syncUsageData}>
          <Ionicons name="refresh-circle" size={32} color="#0288D1" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowChildModal(true)}>
            <Ionicons name="person-outline" size={18} color="#0288D1" />
            <Text style={styles.filterBtnText}>{selectedChild.name}</Text>
            <Ionicons name="chevron-down" size={14} color="#0288D1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowRangeModal(true)}>
            <Ionicons name="calendar-outline" size={18} color="#0288D1" />
            <Text style={styles.filterBtnText}>{selectedRange.label}</Text>
            <Ionicons name="chevron-down" size={14} color="#0288D1" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Screen Time</Text>
          <Text style={styles.cardValue}>{totalTime}</Text>
          <View style={styles.weekBar}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayBar, {height: 20, backgroundColor: '#0288D1'}]} />
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Most Used Apps</Text>
        <View style={styles.appsContainer}>
          {loading ? (
            <ActivityIndicator color="#0288D1" size="large" />
          ) : appUsages.length > 0 ? (
            appUsages.map((app, index) => (
              <View key={index} style={styles.appRow}>
                <Ionicons name="apps-outline" size={20} color="#0288D1" />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={styles.appNameText}>{app.app_name}</Text>
                </View>
                <Text style={styles.appDurationText}>{app.duration}m</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No data found for this period.</Text>
          )}
        </View>
      </ScrollView>

      {/* Child Selector Modal */}
      <Modal visible={showChildModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Child</Text>
            {children.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.modalItem} 
                onPress={() => {setSelectedChild({name: item.name, id: item.id}); setShowChildModal(false);}}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowChildModal(false)} style={styles.closeBtn}>
              <Text style={{color: 'red', fontWeight: 'bold'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Range Selector Modal */}
      <Modal visible={showRangeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Range</Text>
            {ranges.map((item: any) => (
              <TouchableOpacity 
                key={item.value} 
                style={styles.modalItem} 
                onPress={() => {setSelectedRange(item); setShowRangeModal(false);}}
              >
                <Text style={styles.modalItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowRangeModal(false)} style={styles.closeBtn}>
              <Text style={{color: 'red', fontWeight: 'bold'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 10, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0288D1' },
  scrollContent: { padding: 20 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  filterBtn: { flexDirection: 'row', backgroundColor: '#BBDEFB', padding: 12, borderRadius: 12, width: '48%', justifyContent: 'space-between', alignItems: 'center' },
  filterBtnText: { color: '#0288D1', fontWeight: 'bold', fontSize: 13 },
  mainCard: { backgroundColor: '#90CAF9', borderRadius: 25, padding: 25, marginBottom: 25, elevation: 4 },
  cardLabel: { color: '#01579B', fontSize: 16 },
  cardValue: { fontSize: 42, fontWeight: 'bold', color: '#01579B', marginVertical: 5 },
  weekBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  dayCol: { alignItems: 'center' },
  dayBar: { width: 6, borderRadius: 3, backgroundColor: 'rgba(2, 136, 209, 0.3)' },
  dayText: { fontSize: 10, marginTop: 5, color: '#01579B' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0288D1', marginBottom: 15 },
  appsContainer: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 2 },
  appRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee', alignItems: 'center' },
  appNameText: { fontSize: 16, color: '#333', fontWeight: '500' },
  appDurationText: { fontSize: 16, fontWeight: 'bold', color: '#0288D1' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 30, width: '85%', maxHeight: '70%' } as any,
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#0288D1' },
  modalItem: { padding: 18, borderBottomWidth: 0.8, borderBottomColor: '#f0f0f0' },
  modalItemText: { textAlign: 'center', fontSize: 16, color: '#444' },
  closeBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  noDataText: { textAlign: 'center', color: '#999', paddingVertical: 20 }
});