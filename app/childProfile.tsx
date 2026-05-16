import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import ChildMap from './childMap';

const API_BASE_URL = 'http://192.168.1.9:8000/api/parent';

export default function ChildProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appRequests, setAppRequests] = useState<any[]>([]); 

  // الأقسام الثابتة التي ترغبين في ظهورها دائماً
  const categories = [
    { id: 'social', title: 'Social Apps', icon: 'people' },
    { id: 'games', title: 'Game Zone', icon: 'game-controller' },
    { id: 'education', title: 'Education', icon: 'book' }
  ];

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

      const res = await axios.get(`${API_BASE_URL}/childs`, { headers });
      const childrenData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const current = childrenData.find((c: any) => c.id.toString() === id?.toString());
      setChild(current);

      try {
        const appsRes = await axios.get(`${API_BASE_URL}/app-requests/${id}`, { headers });
        const pendingOnly = (appsRes.data.data || []).filter((req: any) => req.status === 'pending');
        setAppRequests(pendingOnly);
      } catch (e) {
        setAppRequests([]); 
      }
    } catch (error) {
      console.log("🚨 Profile Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppAction = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

      await axios.post(`${API_BASE_URL}/app-requests/update`, {
        request_id: requestId,
        status: status
      }, { headers });

      setAppRequests(prev => prev.filter(app => app.id !== requestId));
      Alert.alert("نجاح", status === 'approved' ? "تم السماح بالتطبيق" : "تم رفض التطبيق");
    } catch (error) {
      Alert.alert("خطأ", "فشل في تحديث حالة التطبيق");
    }
  };

  useEffect(() => { 
    if (id) fetchData(); 
  }, [id]);

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#0288D1" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>“{child?.name || 'Child'}” Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
             <Ionicons name="person-outline" size={55} color="#0288D1" />
          </View>
          <Text style={styles.childIdText}>{child?.name} (ID: #{child?.id})</Text>
          <Text style={styles.deviceModel}>{child?.device_name || 'Unknown Device'}</Text>
        </View>

        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.topBtn} onPress={() => router.push({ pathname: '/Downtime', params: { childId: id, childName: child?.name } })}>
            <Ionicons name="moon" size={24} color="#01579B" />
            <Text style={styles.topBtnText}>Downtime</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.topBtn} onPress={() => router.push({ pathname: '/Reports', params: { childId: id } })}>
            <Ionicons name="bar-chart" size={24} color="#01579B" />
            <Text style={styles.topBtnText}>Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapViewWrapper}>
             {id ? <ChildMap childId={Number(id)} /> : null}
          </View>
          <View style={styles.mapInfoOverlay}>
             <Text style={styles.locStatusText}>Current Location</Text>
             <Text style={styles.locNameText}>“{child?.name || 'Child'} Location”</Text>
             <Text style={styles.locTimeText}>Last updated: Just now • Precise location sharing is on</Text>
          </View>
        </View>

        {/* قسم طلبات التطبيقات مقسم لـ Categories */}
        <Text style={styles.sectionLabel}>New App Requests</Text>
        
        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <Ionicons name={cat.icon as any} size={18} color="#FFF" />
              <Text style={styles.categoryHeaderText}>{cat.title}</Text>
            </View>

            {appRequests.filter(app => app.category === cat.id).length > 0 ? (
              appRequests.filter(app => app.category === cat.id).map((app) => (
                <View key={app.id} style={styles.appRequestCard}>
                  <View style={styles.appIconPlaceholder}><Ionicons name="grid" size={24} color="#0288D1" /></View>
                  <Text style={styles.appName}>{app.app_name}</Text>
                  <View style={styles.actionIcons}>
                     <TouchableOpacity onPress={() => handleAppAction(app.id, 'rejected')}>
                        <Ionicons name="close-circle" size={38} color="#0288D1" style={{marginRight: 8}} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => handleAppAction(app.id, 'approved')}>
                        <Ionicons name="checkmark-circle" size={38} color="#29B6F6" />
                     </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noAppsText}>No pending {cat.title.toLowerCase()} requests</Text>
            )}
          </View>
        ))}

        <Text style={styles.sectionLabel}>Recent Alert from Untrusted Numbers</Text>
        <View style={styles.alertCard}>
           <View style={styles.alertHeaderRow}>
              <View style={styles.msgIcon}><Ionicons name="chatbubble" size={24} color="#FFD600" /></View>
              <View>
                 <Text style={styles.phoneNumber}>(555) 123-4567</Text>
                 <Text style={styles.msgTime}>Today, 2:15 pm</Text>
              </View>
           </View>
           <Text style={styles.msgContent}>“Hi, We met you at the park.”</Text>
           <TouchableOpacity style={styles.trustBtn}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#0288D1" />
              <Text style={styles.trustBtnText}>Add to Trust</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.manageBtn} onPress={() => router.push({ pathname: '/manageApps', params: { childId: id } })}>
            <Text style={styles.manageBtnText}>Manage App Settings</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', paddingTop: 40 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 60 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#01579B' },
  avatarSection: { alignItems: 'center', marginVertical: 20 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#90CAF9', justifyContent: 'center', alignItems: 'center' },
  childIdText: { marginTop: 10, fontSize: 18, fontWeight: 'bold', color: '#01579B' },
  deviceModel: { color: '#4FC3F7', fontSize: 14, marginTop: 4 },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  topBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#BBDEFB', paddingVertical: 15, width: '48%', borderRadius: 15, justifyContent: 'center' },
  topBtnText: { marginLeft: 10, color: '#01579B', fontWeight: 'bold', fontSize: 16 },
  mapCard: { marginHorizontal: 20, borderRadius: 25, overflow: 'hidden', backgroundColor: '#BBDEFB', marginBottom: 20 },
  mapViewWrapper: { height: 200, width: '100%' },
  mapInfoOverlay: { padding: 15 },
  locStatusText: { color: '#0288D1', fontSize: 12, fontWeight: 'bold' },
  locNameText: { fontSize: 22, fontWeight: 'bold', color: '#01579B', marginVertical: 2 },
  locTimeText: { color: '#0288D1', fontSize: 11 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#01579B', marginLeft: 20, marginBottom: 15, marginTop: 10 },
  
  // Styles الجديدة للأقسام الثابتة
  categoryContainer: { marginBottom: 15 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0288D1', marginHorizontal: 20, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, marginBottom: 8 },
  categoryHeaderText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 10 },
  noAppsText: { textAlign: 'center', color: '#01579B', fontSize: 13, fontStyle: 'italic', marginVertical: 5 },

  appRequestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#BBDEFB', marginHorizontal: 20, padding: 15, borderRadius: 20, marginBottom: 12 },
  appIconPlaceholder: { width: 50, height: 50, backgroundColor: '#E1F5FE', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  appName: { flex: 1, marginLeft: 15, fontSize: 18, fontWeight: 'bold', color: '#01579B' },
  actionIcons: { flexDirection: 'row', alignItems: 'center' },
  alertCard: { backgroundColor: '#BBDEFB', marginHorizontal: 20, padding: 20, borderRadius: 25, marginBottom: 20 },
  alertHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  msgIcon: { marginRight: 15 },
  phoneNumber: { fontSize: 20, fontWeight: 'bold', color: '#0288D1' },
  msgTime: { color: '#4FC3F7', fontSize: 13 },
  msgContent: { marginTop: 12, color: '#01579B', fontStyle: 'italic', marginLeft: 40, fontSize: 15 },
  trustBtn: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', backgroundColor: '#90CAF9', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, marginTop: 10 },
  trustBtnText: { marginLeft: 8, color: '#01579B', fontWeight: 'bold' },
  manageBtn: { backgroundColor: '#90CAF9', marginHorizontal: 20, padding: 20, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  manageBtnText: { color: '#01579B', fontWeight: 'bold', fontSize: 18 }
});