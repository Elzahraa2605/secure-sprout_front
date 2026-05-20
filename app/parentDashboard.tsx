import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import styles, {
  getChildAvatarStyle,
  getChildEmojiStyle,
  getHardwareAvatarStyle,
  getMemberSubDeviceStyle,
  getStatusDotStyle,
} from './parentDashboard.styles';

import ChildMap from './childMap';

const API_BASE_URL = 'http://192.168.1.9:8000/api'; 

export default function ParentDashboard() {
  const router = useRouter();

  const [parentName, setParentName] = useState('Parent');
  const [children, setChildren] = useState<any[]>([]);
  const [childLocation, setChildLocation] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [screenTime, setScreenTime] = useState("0h 0m");

  const [isHardwareOnline, setIsHardwareOnline] = useState(false);
  const [latestAlert, setLatestAlert] = useState<any>(null); // <-- State مضاف لحفظ آخر تنبيه قادم من لارافيل للطفل الحالي

  const checkHardwareStatus = useCallback(async () => {
    try {
      // 🟢 تعديل المسار ليطابق الرابط العام الجديد المبني على الكاش في لارافيل
      const response = await axios.get(`${API_BASE_URL}/hardware/light-status`);
      setIsHardwareOnline(response.data.is_online);
    } catch (error) {
      setIsHardwareOnline(false);
    }
  }, []);

  const formatTime = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes === 0) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const fetchDashboardData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const storedName = await AsyncStorage.getItem('userName');
      
      if (storedName) {
        setParentName(storedName.split(' ')[0]);
      }

      if (!token) {
        router.replace('/parentLogin');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const response = await axios.get(`${API_BASE_URL}/parent/childs`, { headers });
      let childrenData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      setChildren(childrenData);

      if (childrenData.length > 0) {
        const currentActive = selectedChild 
          ? childrenData.find((c: any) => c.id === selectedChild.id) || childrenData[0]
          : childrenData[0];
        setSelectedChild(currentActive);
      }
      
      checkHardwareStatus();
    } catch (error: any) {
      console.log("🚨 Dashboard Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchChildLocation = useCallback(async (childId: number | string, token: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const response = await axios.get(`${API_BASE_URL}/parent/locations/show/${childId}`, { headers });
      const locations = response.data.data?.locations || [];
      setChildLocation(locations.length > 0 ? locations[0] : null);
    } catch (error) {
      setChildLocation(null);
    }
  }, []);

  const fetchChildUsage = useCallback(async (childId: number | string, token: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const response = await axios.get(`${API_BASE_URL}/parent/reports/app-usage/${childId}?range=today`, { headers });
      if (response.data && response.data.total_time !== undefined) {
        setScreenTime(formatTime(response.data.total_time));
      } else {
        setScreenTime("0h 0m");
      }
    } catch (error) {
      setScreenTime("0h 0m");
    }
  }, []);

  // 🛡️ دالة مضافة لجلب التنبيه الأمني الفعلي المخزن للطفل الحالي في لارافيل وعرضه بالكارد
  const fetchLaravelAlerts = useCallback(async (childId: number | string, token: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const response = await axios.get(`${API_BASE_URL}/parent/alerts?child_id=${childId}`, { headers });
      if (response.data && response.data.length > 0) {
        setLatestAlert(response.data[0]);
      } else {
        setLatestAlert(null);
      }
    } catch (error) {
      setLatestAlert(null);
    }
  }, []);

  // 🔄 دالة مضافة لتصفير العداد محلياً وفي السيرفر عند الضغط على الكارد وقبل الذهاب للريبورتات
  const handleAlertBoxPress = async () => {
    if (!selectedChild?.id) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      
      await axios.post(`${API_BASE_URL}/parent/alerts/mark-all-read`, {
        child_id: selectedChild.id
      }, { headers });

      setLatestAlert((prev: any) => prev ? { ...prev, is_read: true } : null);
      setChildren((prev: any[]) => prev.map((c: any) => c.id === selectedChild.id ? { ...c, alerts_count: 0 } : c));
      if (selectedChild) {
        setSelectedChild({ ...selectedChild, alerts_count: 0 });
      }

      router.push('/Reports');
    } catch (error) {
      router.push('/Reports');
    }
  };

  useEffect(() => {
    let locationInterval: any;
    let hardwareInterval: any;
    let alertsInterval: any;

    const loadData = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token && selectedChild?.id) {
        fetchChildLocation(selectedChild.id, token);
        fetchChildUsage(selectedChild.id, token);
        fetchLaravelAlerts(selectedChild.id, token); // جلب أول تنبيه

        locationInterval = setInterval(() => {
          fetchChildLocation(selectedChild.id, token);
        }, 30000);

        // تحديث حي لعداد الإشعارات والبيانات كل 10 ثوانٍ تلقائياً
        alertsInterval = setInterval(() => {
          fetchLaravelAlerts(selectedChild.id, token);
          axios.get(`${API_BASE_URL}/parent/childs`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
              const updatedList = Array.isArray(res.data) ? res.data : (res.data.data || []);
              setChildren(updatedList);
              const current = updatedList.find((c: any) => c.id === selectedChild.id);
              if (current) setSelectedChild(current);
            }).catch(() => {});
        }, 10000);
      }
      
      hardwareInterval = setInterval(checkHardwareStatus, 10000);
    };

    loadData();

    return () => {
      if (locationInterval) clearInterval(locationInterval);
      if (hardwareInterval) clearInterval(hardwareInterval);
      if (alertsInterval) clearInterval(alertsInterval);
    };
  }, [selectedChild?.id, fetchChildLocation, fetchChildUsage, checkHardwareStatus, fetchLaravelAlerts]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleChildLongPress = (child: any) => {
    if (child.is_active === 0 || !child.is_active) {
      router.push({ pathname: '/childDevice', params: { childId: child.id, childName: child.name } });
    } else {
      router.push({ pathname: '/childProfile', params: { id: child.id } });
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hiText}>Hi, {parentName}!</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/childSignUp')}>
            <Ionicons name="add-circle-outline" size={28} color="#01579B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notificationSettings')}>
            <Ionicons name="notifications-outline" size={26} color="#01579B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/editProfile')}>
            <Ionicons name="settings-outline" size={26} color="#01579B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0288D1']} />}
      >
        <Text style={styles.sectionTitle}>My Family</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.familyRow}>
          
          <TouchableOpacity style={styles.addChildBtn} onPress={() => router.push('/childSignUp')}>
             <View style={styles.addCircleInside}><Ionicons name="add" size={35} color="#0288D1" /></View>
             <Text style={styles.memberName}>Add Child</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.familyMember} 
            onPress={() => router.push('/infantRoom')} // توجيه لغرفة الطفل بشكل صحيح
          >
            <View style={getHardwareAvatarStyle(isHardwareOnline)}>
              <MaterialCommunityIcons name="baby-face-outline" size={38} color={isHardwareOnline ? "#0288D1" : "#A0B4C8"} />
              <View style={getStatusDotStyle(isHardwareOnline)} />
            </View>
            <Text style={styles.memberName}>Monitor</Text>
            <Text style={getMemberSubDeviceStyle(isHardwareOnline)}>
              {isHardwareOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>

          {children.map((child) => (
            <TouchableOpacity 
              key={child.id} 
              style={styles.familyMember} 
              onPress={() => {
                if (selectedChild?.id !== child.id) {
                    setSelectedChild(child);
                    setChildLocation(null);
                    setLatestAlert(null);
                }
              }}
              onLongPress={() => handleChildLongPress(child)}
            >
              <View style={getChildAvatarStyle(selectedChild?.id === child.id)}>
                  <Text style={getChildEmojiStyle()}>{child.age < 12 ? '👶' : '👦'}</Text>
              </View>
              <Text style={styles.memberName} numberOfLines={1}>{child.name}</Text>
              <Text style={styles.memberSubDevice}>{child.is_active === 1 ? 'Connected' : 'Tap to Pair'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
              <Ionicons name="timer-outline" size={30} color="#01579B" style={styles.statIcon}/>
              <Text style={styles.cardLabel}>Screen Time Today</Text>
              <Text style={styles.cardValue}>{screenTime}</Text>
          </View>
          <View style={styles.statCard}>
              <Ionicons name="notifications-outline" size={30} color="#01579B" style={styles.statIcon}/>
              <Text style={styles.cardLabel}>Latest Alert</Text>
              <Text style={styles.cardValue}>{selectedChild?.alerts_count ? `${selectedChild.alerts_count} New` : '0 New'}</Text>
              <Text style={styles.noChangeText}>Live Protection</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Alerts & Activity</Text>
        {latestAlert ? (
          <TouchableOpacity style={styles.alertPriorityCard} onPress={handleAlertBoxPress}>
              <View style={styles.alertHeader}>
                 <Ionicons name="warning" size={20} color="#FFD600" />
                 <Text style={styles.priorityText}>High priority ({latestAlert.type})</Text>
              </View>
              <Text style={styles.alertTitle}>{latestAlert.title}</Text>
              <Text style={styles.alertSub}>{latestAlert.message}</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.alertArrow} />
          </TouchableOpacity>
        ) : (
          <View style={styles.alertPriorityCard}>
              <Text style={styles.alertTitle}>Your Device is Protected ✨</Text>
              <Text style={styles.alertSub}>No safety violations or restricted activities detected today.</Text>
          </View>
        )}

        <View style={styles.mapCard}>
            <View style={styles.mapInfo}>
                <Text style={styles.mapTitle}>Location</Text>
                <Text style={styles.mapChildName}>{selectedChild?.name || 'Child'}</Text>
                <Text style={styles.mapTime}>
                  Updated: {childLocation ? new Date(childLocation.updated_at).toLocaleTimeString() : '---'}
                </Text>
                <TouchableOpacity style={styles.viewMapBtn} onPress={() => router.push({ pathname: '/map', params: { childId: selectedChild?.id } })}>
                  <Text style={styles.viewMapText}>View Map ›</Text>
                </TouchableOpacity>
              </View>
            <View style={styles.mapMiniContainer}>
                {selectedChild?.id ? <ChildMap childId={selectedChild.id} /> : <View style={styles.mapPlaceholder}><Ionicons name="map-outline" size={30} color="#0288D1" /></View>}
            </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/Downtime', params: { childId: selectedChild?.id, childName: selectedChild?.name } })}>
          <View style={styles.actionLeft}>
            <Ionicons name="moon-outline" size={22} color="#0288D1" />
            <Text style={styles.actionText}>Set Downtime</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0288D1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/manageApps', params: { childId: selectedChild?.id, childName: selectedChild?.name } })}>
          <View style={styles.actionLeft}>
            <Ionicons name="grid-outline" size={22} color="#0288D1" />
            <Text style={styles.actionText}>Manage Apps</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0288D1" />
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} /> 
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid" size={24} color="#0288D1" />
          <Text style={styles.navTextActive}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Reports')}>
          <Ionicons name="document-text-outline" size={24} color="#0288D1" />
          <Text style={styles.navText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/editProfile')}>
          <Ionicons name="person-outline" size={24} color="#0288D1" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}