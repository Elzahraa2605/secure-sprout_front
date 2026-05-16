import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  Alert, ScrollView, StyleSheet, Text, TouchableOpacity, 
  View, ActivityIndicator, RefreshControl, Modal, TextInput 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ManageApps() {
  const router = useRouter();
  
  // States للبيانات
  const [apps, setApps] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States للتحكم في النوافذ (Modals)
  const [childPickerVisible, setChildPickerVisible] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [targetApp, setTargetApp] = useState<any>(null);
  
  // States جديدة للساعات والدقائق
  const [hoursInput, setHoursInput] = useState('0');
  const [minutesInput, setMinutesInput] = useState('0');

  // 1. جلب قائمة الأطفال
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { router.replace('/parentLogin'); return; }

      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const response = await axios.get('http://192.168.1.9:8000/api/parent/childs', { headers });
      
      let childrenData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setChildren(childrenData);

      if (childrenData.length > 0) {
        const firstChild = childrenData[0];
        setSelectedChild(firstChild);
        await fetchApps(firstChild.id, token);
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not fetch family data");
    } finally {
      setLoading(false);
    }
  };

  // 2. جلب تطبيقات الطفل
  const fetchApps = async (childId: number, token: string) => {
    try {
      setRefreshing(true);
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const res = await axios.get(`http://192.168.1.9:8000/api/parent/child-apps/${childId}`, { headers });
      let appsData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setApps(appsData);
    } catch (e: any) { 
      console.error("Fetch Apps Error:", e.message); 
    } finally { 
      setRefreshing(false); 
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const onRefresh = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (selectedChild && token) await fetchApps(selectedChild.id, token);
  };

  // 3. تحديث حالة الحظر أو الوقت (المعدلة لتسمع في السيرفر)
  const updateSettings = async (appId: number, updateData: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // تحويل القيم لأرقام لضمان قبول السيرفر
      const formattedData = {
        ...updateData,
        time_limit: updateData.time_limit !== undefined ? Number(updateData.time_limit) : undefined
      };

      const res = await axios.patch(`http://192.168.1.9:8000/api/parent/child-apps/update/${appId}`, formattedData, { headers });
      
      if (res.data.status === 'success') {
        // تحديث القائمة محلياً فوراً
        setApps(prevApps => prevApps.map(app => 
          app.id === appId ? { ...app, ...formattedData } : app
        ));
      }
    } catch (e: any) { 
        console.log("Update Error:", e.response?.data);
        Alert.alert("Update Failed", "Check server connection"); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Apps</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#0288D1" />}
      >
        <TouchableOpacity style={styles.childSelectorCard} onPress={() => setChildPickerVisible(true)}>
            <View style={styles.childHeaderLeft}>
               <View style={styles.userIconCircle}><Text style={{fontSize: 20}}>👤</Text></View>
               <View>
                  <Text style={styles.childNameText}>{selectedChild?.name || 'Select Child'}</Text>
                  <Text style={styles.appsCountText}>{apps.length} apps identified</Text>
               </View>
            </View>
            <Text style={styles.dropdownIcon}>▼ Change</Text>
        </TouchableOpacity>

        <View style={styles.appsListContainer}>
          {apps.map((app, index) => (
            <View key={app.id}>
              <View style={styles.appItem}>
                <View style={styles.appMainInfo}>
                   <View style={styles.appIconBox}><Text style={{fontSize: 18}}>📱</Text></View>
                   <View style={{flex: 1}}>
                      <Text style={styles.appNameText}>{app.app_name}</Text>
                      <Text style={[styles.statusText, { color: app.is_blocked ? '#D32F2F' : '#43A047' }]}>
                        {app.is_blocked ? '⚠️ Blocked' : `⏳ Limit: ${Math.floor(app.time_limit / 60)}h ${app.time_limit % 60}m`}
                      </Text>
                   </View>
                </View>

                <View style={styles.actionGroup}>
                  <TouchableOpacity 
                    style={styles.timerBtn} 
                    onPress={() => { 
                      setTargetApp(app); 
                      setHoursInput(Math.floor(app.time_limit / 60).toString());
                      setMinutesInput((app.time_limit % 60).toString());
                      setTimerModalVisible(true); 
                    }}
                  >
                    <Text style={{fontSize: 18}}>⏱️</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.blockBtn, { backgroundColor: app.is_blocked ? '#E1F5FE' : '#90CAF9' }]}
                    onPress={() => updateSettings(app.id, { is_blocked: !app.is_blocked })}
                  >
                    <Text style={styles.blockBtnText}>{app.is_blocked ? 'Unblock' : 'Block'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {index < apps.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* مودال اختيار الطفل */}
      <Modal visible={childPickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setChildPickerVisible(false)}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Select Child</Text>
            {children.map((child) => (
              <TouchableOpacity key={child.id} style={styles.childOption} onPress={async () => { 
                  setSelectedChild(child); 
                  const token = await AsyncStorage.getItem('userToken');
                  if (token) fetchApps(child.id, token); 
                  setChildPickerVisible(false); 
              }}>
                <Text style={styles.childOptionText}>👤 {child.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* مودال التايمر (ساعات ودقائق) */}
      <Modal visible={timerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.timerContent}>
            <Text style={styles.pickerTitle}>Set Daily Limit</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <TextInput style={[styles.timeInput, { width: 70 }]} keyboardType="numeric" value={hoursInput} onChangeText={setHoursInput}/>
                  <Text style={{ color: '#01579B' }}>Hours</Text>
                </View>
                <Text style={{ fontSize: 30, color: '#0288D1' }}>:</Text>
                <View style={{ alignItems: 'center' }}>
                  <TextInput style={[styles.timeInput, { width: 70 }]} keyboardType="numeric" value={minutesInput} onChangeText={(t) => setMinutesInput(parseInt(t||'0')>59?'59':t)}/>
                  <Text style={{ color: '#01579B' }}>Mins</Text>
                </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setTimerModalVisible(false)} style={{marginRight: 20}}>
                <Text style={{color: '#D32F2F', fontWeight: 'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn}
                onPress={() => { 
                  if (targetApp) {
                    const total = (parseInt(hoursInput || '0') * 60) + parseInt(minutesInput || '0');
                    updateSettings(targetApp.id, { time_limit: total }); 
                    setTimerModalVisible(false); 
                  }
                }} 
              >
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontSize: 30, color: '#0288D1', marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#01579B', flex: 1, textAlign: 'center', marginRight: 45 },
  scrollContent: { padding: 20 },
  childSelectorCard: { backgroundColor: '#BBDEFB', borderRadius: 20, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  childHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  userIconCircle: { width: 50, height: 50, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  childNameText: { fontSize: 18, fontWeight: 'bold', color: '#01579B' },
  appsCountText: { fontSize: 12, color: '#0288D1' },
  dropdownIcon: { color: '#0288D1', fontSize: 12, fontWeight: 'bold' },
  appsListContainer: { backgroundColor: '#fff', borderRadius: 25, padding: 15, elevation: 3 },
  appItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  appMainInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  appIconBox: { width: 45, height: 45, backgroundColor: '#E3F2FD', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  appNameText: { fontSize: 16, fontWeight: 'bold', color: '#01579B' },
  statusText: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  timerBtn: { padding: 10, backgroundColor: '#F5F5F5', borderRadius: 12, marginRight: 10 },
  blockBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  blockBtnText: { color: '#01579B', fontWeight: 'bold', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 25, padding: 20 },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', color: '#01579B', textAlign: 'center', marginBottom: 20 },
  childOption: { paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  childOptionText: { fontSize: 18, color: '#333' },
  timerContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 25, padding: 25 },
  timeInput: { borderBottomWidth: 2, borderBottomColor: '#0288D1', fontSize: 24, textAlign: 'center', color: '#01579B' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 20 },
  saveBtn: { backgroundColor: '#0288D1', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 15 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});